import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/Card'
import { Chip } from '../components/Chip'
import { CoverageList } from '../components/CoverageList'
import { DayTooltip } from '../components/DayTooltip'
import { HeaderDivider } from '../components/HeaderDivider'
import { IconChevronDown } from '../components/icons'
import { ImprovementsList } from '../components/ImprovementsList'
import { Modal } from '../components/Modal'
import { MonthActivityGraph } from '../components/MonthActivityGraph'
import { OverviewTile } from '../components/OverviewTile'
import { RecentPRsList } from '../components/RecentPRsList'
import { Sketchy } from '../components/Sketchy'
import { StrengthGraph } from '../components/StrengthGraph'
import {
  buildExerciseSummaries,
  computeCoverage,
  computeImprovement,
  periodStartISO,
  type Period,
} from '../lib/analytics'
import { daysInMonth, fromISODate, toISODate } from '../lib/date'
import { MUSCLE_GROUPS } from '../lib/muscleGroups'
import { bestEpleyByExerciseAndSession } from '../lib/personalRecord'
import { supabase } from '../lib/supabase'
import { useMeasure } from '../lib/useMeasure'
import { useAuthStore } from '../store/authStore'

// ---- Calendar section (moved from Me.tsx) ----

type DaySummary = {
  sessionId: string
  exerciseCount: number
  durationMs: number
  prCount: number
}
type ActiveDay = { dateStr: string; cellRect: DOMRect; reasonDraft: string }

// ---- All-time / period-scoped data (drives tiles, strength progress, PRs) ----

type SetRow = { weight: number; reps: number }
type AllTimeExerciseRow = {
  exercise_db_id: string | null
  name: string
  sets: SetRow[] | null
}
type AllTimeSessionRow = {
  id: string
  date: string
  exercises: AllTimeExerciseRow[] | null
}

// Same visual shell as Dropdown.tsx (Sketchy paper pill + chevron), but
// opens the exercise-picker Modal instead of a native <select> — the
// picker needs a centered dark-overlay modal, not a dropdown.
function ExercisePickerButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  const [ref, size] = useMeasure<HTMLDivElement>()
  return (
    <div ref={ref} className="relative flex flex-1 items-center px-4 py-3">
      <Sketchy
        width={size.width}
        height={size.height}
        radius={16}
        fill="var(--color-paper)"
      />
      <button
        type="button"
        onClick={onClick}
        className="relative z-10 flex-1 truncate text-left text-sm text-ink"
      >
        {label}
      </button>
      <IconChevronDown className="relative z-10 h-4 w-4 shrink-0 text-ink" />
    </div>
  )
}

export function Analytics() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [period, setPeriod] = useState<Period>('30d')

  // Calendar state (unchanged from its previous home in Me.tsx)
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
          .select(
            'id, date, start_time, end_time, exercises(id, exercise_db_id, sets(weight, reps))',
          )
          .not('end_time', 'is', null)
          .gte('date', start)
          .lte('date', end),
        supabase
          .from('skipped_days')
          .select('date, reason')
          .gte('date', start)
          .lte('date', end),
      ])
      if (cancelled) return

      type MonthSetRow = { weight: number; reps: number }
      type MonthExerciseRow = {
        id: string
        exercise_db_id: string | null
        sets: MonthSetRow[] | null
      }
      type MonthSessionRow = {
        id: string
        date: string
        start_time: string
        end_time: string
        exercises: MonthExerciseRow[] | null
      }
      const sessions = (sessionRows ?? []) as MonthSessionRow[]

      const dbIds = [
        ...new Set(
          sessions.flatMap((s) =>
            (s.exercises ?? [])
              .map((e) => e.exercise_db_id)
              .filter((v): v is string => Boolean(v)),
          ),
        ),
      ]
      let bestPerSessionByDbId = new Map<string, Map<string, number>>()
      if (dbIds.length > 0) {
        const { data: historicalRows } = await supabase
          .from('exercises')
          .select('session_id, exercise_db_id, sets(weight, reps)')
          .in('exercise_db_id', dbIds)
        if (cancelled) return
        bestPerSessionByDbId = bestEpleyByExerciseAndSession(historicalRows ?? [])
      }

      const summaries = new Map<string, DaySummary>()
      for (const r of sessions) {
        const exercises = r.exercises ?? []
        const prCount = exercises.filter((e) => {
          if (!e.exercise_db_id) return false
          const bySession = bestPerSessionByDbId.get(e.exercise_db_id)
          if (!bySession) return false
          const ownBest = bySession.get(r.id) ?? 0
          let historicalMax = 0
          for (const [sessionId, best] of bySession) {
            if (sessionId !== r.id) historicalMax = Math.max(historicalMax, best)
          }
          return historicalMax > 0 && ownBest > historicalMax
        }).length

        summaries.set(r.date, {
          sessionId: r.id,
          exerciseCount: exercises.length,
          durationMs: new Date(r.end_time).getTime() - new Date(r.start_time).getTime(),
          prCount,
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

  // All-time exercise history — drives tiles, strength progress, PRs. Loaded
  // once per user (not re-fetched on period toggle; the toggle only changes
  // which slice of this data is summarized).
  const [allSessions, setAllSessions] = useState<AllTimeSessionRow[]>([])
  const [primaryMuscleByDbId, setPrimaryMuscleByDbId] = useState<
    Map<string, string | null>
  >(new Map())
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function load() {
      const { data: sessionRows } = await supabase
        .from('workout_sessions')
        .select('id, date, exercises(exercise_db_id, name, sets(weight, reps))')
        .not('end_time', 'is', null)
        .order('date', { ascending: true })
      if (cancelled) return

      const sessions = (sessionRows ?? []) as AllTimeSessionRow[]
      setAllSessions(sessions)

      const dbIds = [
        ...new Set(
          sessions.flatMap((s) =>
            (s.exercises ?? [])
              .map((e) => e.exercise_db_id)
              .filter((v): v is string => Boolean(v)),
          ),
        ),
      ]
      if (dbIds.length > 0) {
        const { data: defRows } = await supabase
          .from('exercise_definitions')
          .select('id, primary_muscle')
          .in('id', dbIds)
        if (cancelled) return
        setPrimaryMuscleByDbId(
          new Map((defRows ?? []).map((d) => [d.id, d.primary_muscle])),
        )
      }
      setDataLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user])

  const exercises = useMemo(
    () => buildExerciseSummaries(allSessions, primaryMuscleByDbId),
    [allSessions, primaryMuscleByDbId],
  )

  const periodStart = periodStartISO(period)

  const totalWorkouts = useMemo(
    () => allSessions.filter((s) => !periodStart || s.date >= periodStart).length,
    [allSessions, periodStart],
  )

  const improvements = useMemo(() => {
    return exercises
      .filter((e) => e.bestSets.some((p) => !periodStart || p.date >= periodStart))
      .map((e) => ({ name: e.name, result: computeImprovement(e.bestSets, periodStart) }))
      .filter(
        (e): e is { name: string; result: NonNullable<typeof e.result> } =>
          e.result !== null,
      )
      .map((e) => ({
        name: e.name,
        pct: e.result.pct,
        baselinePoint: e.result.baselinePoint,
        currentPoint: e.result.currentPoint,
      }))
  }, [exercises, periodStart])
  const improvedCount = improvements.filter((e) => e.pct > 0).length

  const coverage = useMemo(() => {
    const performedInPeriod = exercises.filter((e) =>
      e.bestSets.some((p) => !periodStart || p.date >= periodStart),
    )
    return computeCoverage(
      performedInPeriod.map((e) => ({ name: e.name, muscleGroup: e.muscleGroup })),
      MUSCLE_GROUPS.map((g) => g.label),
    )
  }, [exercises, periodStart])
  const coveredCount = coverage.filter((g) => g.exerciseNames.length > 0).length

  const [expandedTile, setExpandedTile] = useState<'improvements' | 'coverage' | null>(
    null,
  )

  // null = no explicit user selection yet — defaults to the most-recently-performed
  // exercise (exercises[0], already sorted that way) once data has loaded.
  const [selectedDbId, setSelectedDbId] = useState<string | null>(null)
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false)
  const effectiveDbId = selectedDbId ?? exercises[0]?.dbId ?? null
  const selected = exercises.find((e) => e.dbId === effectiveDbId) ?? null

  return (
    <div>
      <div className="sticky top-[env(safe-area-inset-top)] z-30 bg-paper">
        <div className="px-6 pb-4 pt-6">
          <h1 className="text-2xl font-bold text-ink">Analytics</h1>
        </div>
        <HeaderDivider />
      </div>

      <div className="space-y-6 px-6 pb-6 pt-4">
        <div className="flex gap-2">
          <Chip
            variant="filter"
            selected={period === '30d'}
            onClick={() => setPeriod('30d')}
            className="cursor-pointer"
          >
            Last 30 Days
          </Chip>
          <Chip
            variant="filter"
            selected={period === 'all'}
            onClick={() => setPeriod('all')}
            className="cursor-pointer"
          >
            All Time
          </Chip>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <OverviewTile value={totalWorkouts} label="Workouts" />
          <OverviewTile
            value={`${improvedCount} / ${improvements.length}`}
            label="Improvements"
            expanded={expandedTile === 'improvements'}
            onToggle={() =>
              setExpandedTile((v) => (v === 'improvements' ? null : 'improvements'))
            }
          />
          <OverviewTile
            value={`${coveredCount} / ${MUSCLE_GROUPS.length}`}
            label="Coverage"
            expanded={expandedTile === 'coverage'}
            onToggle={() =>
              setExpandedTile((v) => (v === 'coverage' ? null : 'coverage'))
            }
          />
        </div>

        {expandedTile === 'improvements' && (
          <Card variant="filled">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-graphite">
              Improvements
            </p>
            <ImprovementsList items={improvements} />
          </Card>
        )}
        {expandedTile === 'coverage' && (
          <Card variant="filled">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-graphite">
              Training Coverage
            </p>
            <CoverageList groups={coverage} />
          </Card>
        )}

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-graphite">
            Consistency
          </p>
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
          <DayTooltip
            key={activeDay?.dateStr ?? 'closed'}
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
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-graphite">
            Strength Progress
          </p>
          {dataLoading ? (
            <p className="text-sm text-graphite">Loading...</p>
          ) : exercises.length === 0 ? (
            <Card>
              <p className="text-sm text-graphite">
                Log a session to start tracking strength progress.
              </p>
            </Card>
          ) : (
            <>
              <div className="mb-3 flex items-center gap-2">
                <ExercisePickerButton
                  label={selected?.name ?? 'Select exercise'}
                  onClick={() => setExercisePickerOpen(true)}
                />
                <button
                  type="button"
                  onClick={() => navigate('/analytics/strength')}
                  className="shrink-0 text-sm font-medium text-ink"
                >
                  More →
                </button>
              </div>

              <Modal
                isOpen={exercisePickerOpen}
                onClose={() => setExercisePickerOpen(false)}
                title="Select Exercise"
              >
                <div className="-mx-1 flex flex-col">
                  {exercises.map((e) => (
                    <button
                      key={e.dbId}
                      type="button"
                      onClick={() => {
                        setSelectedDbId(e.dbId)
                        setExercisePickerOpen(false)
                      }}
                      className={`rounded-xl px-3 py-2.5 text-left text-sm ${
                        e.dbId === effectiveDbId
                          ? 'bg-mist text-ink'
                          : 'text-ink active:bg-ink/5'
                      }`}
                    >
                      {e.name}
                    </button>
                  ))}
                </div>
              </Modal>
              <StrengthGraph points={selected?.bestSets ?? []} />

              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-graphite">
                  Recent PRs
                </p>
                <RecentPRsList bestSets={selected?.bestSets ?? []} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
