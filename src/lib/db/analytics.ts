import { createClient } from '@/lib/supabase'

type BarItem = { label: string; value: number }
type BarData = { vol: BarItem[]; freq: BarItem[]; totalSecs: number }

// ── date helpers ────────────────────────────────────────────────────────────

function mondayOfWeek(d: Date): Date {
  const day = d.getDay() // 0=Sun
  const diff = (day === 0 ? -6 : 1 - day)
  const m = new Date(d)
  m.setDate(d.getDate() + diff)
  m.setHours(0, 0, 0, 0)
  return m
}

function weekOfMonth(date: Date): number {
  // Returns 0–4 (W1–W5)
  return Math.min(4, Math.floor((date.getDate() - 1) / 7))
}

// ── fetch helpers ────────────────────────────────────────────────────────────

type SessionWithSets = {
  id: string
  started_at: string
  duration_secs: number | null
  session_exercises: {
    exercises: { name: string } | null
    sets: { weight_kg: number | null; reps: number | null; completed: boolean }[]
  }[]
}

async function fetchSessionsInRange(userId: string, from: Date, to: Date): Promise<SessionWithSets[]> {
  const db = createClient()
  const { data } = await db
    .from('workout_sessions')
    .select(`
      id, started_at, duration_secs,
      session_exercises (
        exercises ( name ),
        sets ( weight_kg, reps, completed )
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', false)
    .gte('started_at', from.toISOString())
    .lte('started_at', to.toISOString())
    .order('started_at', { ascending: true })
  return (data ?? []) as unknown as SessionWithSets[]
}

function sessionVolume(s: SessionWithSets): number {
  return s.session_exercises.flatMap(se => se.sets)
    .filter(set => set.completed)
    .reduce((acc, set) => acc + (set.weight_kg ?? 0) * (set.reps ?? 0), 0)
}

// ── public API ───────────────────────────────────────────────────────────────

export type Period = 'week' | 'month' | 'year'

export async function getBarData(userId: string, period: Period): Promise<BarData> {
  const now = new Date()

  if (period === 'week') {
    const from = mondayOfWeek(now)
    const to   = new Date(from); to.setDate(from.getDate() + 6); to.setHours(23, 59, 59, 999)
    const sessions = await fetchSessionsInRange(userId, from, to)

    const LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    const vol  = new Array(7).fill(0)
    const freq = new Array(7).fill(0)
    sessions.forEach(s => {
      const dow = (new Date(s.started_at).getDay() + 6) % 7 // 0=Mon…6=Sun
      freq[dow]++
      vol[dow] += sessionVolume(s)
    })
    const totalSecs = sessions.reduce((a, s) => a + (s.duration_secs ?? 0), 0)
    return {
      vol:  LABELS.map((label, i) => ({ label, value: Math.round(vol[i]) })),
      freq: LABELS.map((label, i) => ({ label, value: freq[i] })),
      totalSecs,
    }
  }

  if (period === 'month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    const sessions = await fetchSessionsInRange(userId, from, to)

    const LABELS = ['W1','W2','W3','W4','W5']
    const vol  = new Array(5).fill(0)
    const freq = new Array(5).fill(0)
    sessions.forEach(s => {
      const w = weekOfMonth(new Date(s.started_at))
      freq[w]++
      vol[w] += sessionVolume(s)
    })
    const totalSecs = sessions.reduce((a, s) => a + (s.duration_secs ?? 0), 0)
    return {
      vol:  LABELS.map((label, i) => ({ label, value: Math.round(vol[i]) })),
      freq: LABELS.map((label, i) => ({ label, value: freq[i] })),
      totalSecs,
    }
  }

  // year
  const from = new Date(now.getFullYear(), 0, 1)
  const to   = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
  const sessions = await fetchSessionsInRange(userId, from, to)

  const LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const vol  = new Array(12).fill(0)
  const freq = new Array(12).fill(0)
  sessions.forEach(s => {
    const m = new Date(s.started_at).getMonth()
    freq[m]++
    vol[m] += sessionVolume(s)
  })
  const totalSecs = sessions.reduce((a, s) => a + (s.duration_secs ?? 0), 0)
  return {
    vol:  LABELS.map((label, i) => ({ label, value: Math.round(vol[i]) })),
    freq: LABELS.map((label, i) => ({ label, value: freq[i] })),
    totalSecs,
  }
}

export async function getExProgression(
  userId: string,
  exerciseName: string,
  period: Period
): Promise<{ data: number[]; labels: string[] }> {
  const now = new Date()
  let from: Date, to: Date, buckets: number, getKey: (d: Date) => number, labels: string[]

  if (period === 'week') {
    from = mondayOfWeek(now)
    to   = new Date(from); to.setDate(from.getDate() + 6); to.setHours(23, 59, 59, 999)
    buckets  = 7
    getKey   = d => (d.getDay() + 6) % 7
    labels   = ['M','T','W','T','F','S','S']
  } else if (period === 'month') {
    from    = new Date(now.getFullYear(), now.getMonth(), 1)
    to      = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    buckets = 5
    getKey  = d => weekOfMonth(d)
    labels  = ['W1','W2','W3','W4','W5']
  } else {
    from    = new Date(now.getFullYear(), 0, 1)
    to      = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
    buckets = 12
    getKey  = d => d.getMonth()
    labels  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  }

  const db = createClient()
  const { data } = await db
    .from('workout_sessions')
    .select(`
      started_at,
      session_exercises!inner (
        exercises!inner ( name ),
        sets ( weight_kg, reps, completed )
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', false)
    .gte('started_at', from.toISOString())
    .lte('started_at', to.toISOString())
    .order('started_at', { ascending: true })

  const maxByBucket = new Array(buckets).fill(0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(data ?? []).forEach((session: any) => {
    const key = getKey(new Date(session.started_at))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session.session_exercises.forEach((se: any) => {
      if (se.exercises?.name.toLowerCase() !== exerciseName.toLowerCase()) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      se.sets.filter((s: any) => s.completed).forEach((s: any) => {
        const w = s.weight_kg ?? 0
        if (w > maxByBucket[key]) maxByBucket[key] = w
      })
    })
  })

  return { data: maxByBucket, labels }
}

export type HomeStats = {
  weekWorkouts: number
  weekVolume: number
  weekTimeSecs: number
  streak: number
  activity: ('workout' | 'rest' | 'today' | 'future')[]
}

export async function getHomeStats(userId: string): Promise<HomeStats> {
  const db = createClient()
  const now = new Date()

  // Fetch last 90 days to compute streak + this week
  const from90 = new Date(now); from90.setDate(now.getDate() - 90); from90.setHours(0,0,0,0)
  const { data: sessions } = await db
    .from('workout_sessions')
    .select(`id, started_at, duration_secs, session_exercises ( sets ( weight_kg, reps, completed ) )`)
    .eq('user_id', userId)
    .eq('is_active', false)
    .gte('started_at', from90.toISOString())
    .order('started_at', { ascending: false })

  if (!sessions || sessions.length === 0) {
    const activity: HomeStats['activity'] = Array.from({ length: 7 }, (_, i) => {
      const dow = (mondayOfWeek(now).getDay() + i) % 7
      return now.getDay() === dow ? 'today' : i < now.getDay() ? 'rest' : 'future'
    })
    return { weekWorkouts: 0, weekVolume: 0, weekTimeSecs: 0, streak: 0, activity }
  }

  // Unique session dates (YYYY-MM-DD in local time)
  const toLocalDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }
  const allDates = new Set(sessions.map(s => toLocalDate(s.started_at)))

  // Streak: consecutive days ending today or yesterday
  const todayStr = toLocalDate(now.toISOString())
  let streak = 0
  const cur = new Date(now); cur.setHours(12, 0, 0, 0)
  while (true) {
    const key = toLocalDate(cur.toISOString())
    if (!allDates.has(key)) { if (streak === 0) { cur.setDate(cur.getDate() - 1); if (!allDates.has(toLocalDate(cur.toISOString()))) break; continue; } break; }
    streak++
    cur.setDate(cur.getDate() - 1)
  }

  // This-week sessions (Mon–today)
  const weekStart = mondayOfWeek(now)
  const weekSessions = sessions.filter(s => new Date(s.started_at) >= weekStart)

  const weekVolume = weekSessions.reduce((acc, s) => {
    return acc + (s.session_exercises as { sets: { weight_kg: number | null; reps: number | null; completed: boolean }[] }[])
      .flatMap(se => se.sets)
      .filter(set => set.completed)
      .reduce((a, set) => a + (set.weight_kg ?? 0) * (set.reps ?? 0), 0)
  }, 0)

  const weekTimeSecs = weekSessions.reduce((a, s) => a + (s.duration_secs ?? 0), 0)

  // 7-day activity cells (Mon–Sun of current week)
  const activity: HomeStats['activity'] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i)
    const dateStr = toLocalDate(d.toISOString())
    if (dateStr === todayStr) return 'today'
    if (d > now) return 'future'
    return allDates.has(dateStr) ? 'workout' : 'rest'
  })

  return {
    weekWorkouts: weekSessions.length,
    weekVolume:   Math.round(weekVolume),
    weekTimeSecs,
    streak,
    activity,
  }
}
