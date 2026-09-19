import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { DayTooltip } from '../components/DayTooltip'
import { HeaderDivider } from '../components/HeaderDivider'
import { IconGoogle, IconUser } from '../components/icons'
import { MonthActivityGraph } from '../components/MonthActivityGraph'
import { daysInMonth, fromISODate, toISODate } from '../lib/date'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

type DaySummary = { sessionId: string; exerciseCount: number; durationMs: number }
type ActiveDay = { dateStr: string; cellRect: DOMRect; reasonDraft: string }

export function Me() {
  const { user, loading, signInWithGoogle, signOut } = useAuthStore()
  const navigate = useNavigate()

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [daySummaries, setDaySummaries] = useState<Map<string, DaySummary>>(new Map())
  const [skipReasons, setSkipReasons] = useState<Map<string, string>>(new Map())
  const [activeDay, setActiveDay] = useState<ActiveDay | null>(null)

  const attendedDates = useMemo(() => new Set(daySummaries.keys()), [daySummaries])

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function load() {
      const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const end = toISODate(new Date(year, month, daysInMonth(year, month)))
      const [{ data: sessionRows }, { data: skipRows }] = await Promise.all([
        supabase
          .from('workout_sessions')
          .select('id, date, start_time, end_time, exercises(count)')
          .not('end_time', 'is', null)
          .gte('date', start)
          .lte('date', end),
        supabase.from('skipped_days').select('date, reason').gte('date', start).lte('date', end),
      ])
      if (cancelled) return

      const summaries = new Map<string, DaySummary>()
      for (const r of sessionRows ?? []) {
        summaries.set(r.date, {
          sessionId: r.id,
          exerciseCount: (r.exercises as { count: number }[] | null)?.[0]?.count ?? 0,
          durationMs: new Date(r.end_time as string).getTime() - new Date(r.start_time).getTime(),
        })
      }
      setDaySummaries(summaries)
      setSkipReasons(new Map((skipRows ?? []).map((r) => [r.date, r.reason as string])))
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user, year, month])

  function handleDayClick(dateStr: string, cellRect: DOMRect) {
    setActiveDay({ dateStr, cellRect, reasonDraft: skipReasons.get(dateStr) ?? '' })
  }

  function commitSkipReason(dateStr: string, reason: string) {
    if (!user) return
    supabase
      .from('skipped_days')
      .upsert({ user_id: user.id, date: dateStr, reason }, { onConflict: 'user_id,date' })
      .then()
    setSkipReasons((prev) => new Map(prev).set(dateStr, reason))
  }

  function closeTooltip() {
    if (activeDay && !daySummaries.has(activeDay.dateStr)) {
      commitSkipReason(activeDay.dateStr, activeDay.reasonDraft)
    }
    setActiveDay(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <p className="text-sm text-graphite">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-3xl font-bold text-ink">Gains</h1>
        <p className="text-sm text-graphite">Sign in to start your workout journal.</p>
        <Button variant="primary" leftIcon={<IconGoogle className="h-4 w-4" />} onClick={signInWithGoogle}>
          Continue with Google
        </Button>
      </div>
    )
  }

  const fullName = user.user_metadata?.full_name as string | undefined
  const name = fullName?.split(' ')[0] ?? user.email
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  return (
    <div>
      <div className="sticky top-[env(safe-area-inset-top)] z-30 bg-paper">
        <div className="px-6 pb-4 pt-6">
          <h1 className="text-2xl font-bold text-ink">Me</h1>
        </div>
        <HeaderDivider />
      </div>

      <div className="px-6 pb-6 pt-4">
        <Card className="flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-11 w-11 shrink-0 rounded-full" />
          ) : (
            <IconUser className="h-6 w-6 shrink-0 text-ink" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{name}</p>
            <p className="truncate text-xs text-graphite">{user.email}</p>
          </div>
        </Card>
        <div className="mt-4">
          <MonthActivityGraph
            year={year}
            month={month}
            attendedDates={attendedDates}
            onMonthChange={(y, m) => {
              setYear(y)
              setMonth(m)
            }}
            onDayClick={handleDayClick}
          />
        </div>
        <DayTooltip
          open={activeDay !== null}
          anchorRect={activeDay?.cellRect ?? null}
          date={activeDay ? fromISODate(activeDay.dateStr) : null}
          session={activeDay ? (daySummaries.get(activeDay.dateStr) ?? null) : null}
          reason={activeDay?.reasonDraft ?? ''}
          onReasonChange={(value) =>
            setActiveDay((prev) => (prev ? { ...prev, reasonDraft: value } : prev))
          }
          onReasonFocus={() => {}}
          onReasonBlur={() => {
            if (activeDay) commitSkipReason(activeDay.dateStr, activeDay.reasonDraft)
          }}
          onNavigate={(sessionId) => navigate(`/history/${sessionId}`)}
          onClose={closeTooltip}
        />
        <Button variant="primary" onClick={signOut} className="mt-4 w-full">
          Log out
        </Button>
        <p className="mt-6 text-center text-xs text-graphite">
          Exercise data by{' '}
          <a
            href="https://repdb.co"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            RepDB (repdb.co)
          </a>
        </p>
      </div>
    </div>
  )
}
