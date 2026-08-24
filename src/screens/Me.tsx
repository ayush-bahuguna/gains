import { useEffect, useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { IconGoogle, IconUser } from '../components/icons'
import { MonthActivityGraph } from '../components/MonthActivityGraph'
import { daysInMonth, toISODate } from '../lib/date'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export function Me() {
  const { user, loading, signInWithGoogle, signOut } = useAuthStore()

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [attendedDates, setAttendedDates] = useState<Set<string> | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function load() {
      const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const end = toISODate(new Date(year, month, daysInMonth(year, month)))
      const { data } = await supabase
        .from('workout_sessions')
        .select('date')
        .not('end_time', 'is', null)
        .gte('date', start)
        .lte('date', end)
      if (cancelled) return
      setAttendedDates(new Set((data ?? []).map((r) => r.date)))
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user, year, month])

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
    <div className="p-6">
      <h1 className="mb-4 text-3xl font-bold text-ink">Me</h1>
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
          attendedDates={attendedDates ?? new Set()}
          onMonthChange={(y, m) => {
            setYear(y)
            setMonth(m)
          }}
        />
      </div>
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
  )
}
