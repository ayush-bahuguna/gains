// Rule-based grammar parser for voice-logged sets, per the grammar table in
// docs/workout-journal-build-spec.md §5. No ML/LLM involved — just regex
// over a normalized transcript, so it's free, offline, and predictable.

const ONES: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
}
const TEENS: Record<string, number> = {
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
}
const TENS: Record<string, number> = {
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
}

function isNumberWord(w: string) {
  return w in ONES || w in TEENS || w in TENS || w === 'hundred'
}

// Speech recognition engines usually already normalize spoken numbers to
// digits, but this isn't guaranteed across browsers — so parse word-numbers
// too ("eighty five" -> "85") as a safety net, leaving anything else as-is.
export function normalizeSpokenNumbers(text: string): string {
  const tokens = text.split(/\s+/)
  const out: string[] = []
  let i = 0
  while (i < tokens.length) {
    const w = tokens[i].toLowerCase().replace(/[^a-z]/g, '')
    if (isNumberWord(w)) {
      let j = i
      let current = 0
      let sawNumber = false
      while (j < tokens.length) {
        const tw = tokens[j].toLowerCase().replace(/[^a-z]/g, '')
        if (tw === 'and' && sawNumber) {
          j++
          continue
        }
        if (tw in ONES) {
          current += ONES[tw]
          sawNumber = true
          j++
          continue
        }
        if (tw in TEENS) {
          current += TEENS[tw]
          sawNumber = true
          j++
          continue
        }
        if (tw in TENS) {
          current += TENS[tw]
          sawNumber = true
          j++
          continue
        }
        if (tw === 'hundred') {
          current = (current === 0 ? 1 : current) * 100
          sawNumber = true
          j++
          continue
        }
        break
      }
      out.push(String(current))
      i = j
      continue
    }
    out.push(tokens[i])
    i++
  }
  return out.join(' ')
}

export type VoiceAction =
  | { type: 'undo' }
  | { type: 'finishWorkout' }
  | { type: 'deleteLastSet' }
  | { type: 'deleteExercise'; name: string }
  | { type: 'increaseWeight'; amount: number }
  | { type: 'duplicateSet' }
  | { type: 'sameWeightReps'; reps: number }
  | { type: 'appendSet'; weight: number; reps: number }
  | { type: 'createOrSelectExerciseWithSet'; name: string; weight: number; reps: number }
  | { type: 'selectExercise'; name: string }

const NUM = '\\d+(?:\\.\\d+)?'
const SEP = '(?:for|x|times|by)?'

export function parseVoiceCommand(raw: string): VoiceAction | null {
  const normalized = normalizeSpokenNumbers(raw.trim().toLowerCase())
    .replace(/[.,!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!normalized) return null

  if (/^undo$/.test(normalized)) return { type: 'undo' }

  if (/^(finish|end)( the)? (workout|session)$/.test(normalized)) return { type: 'finishWorkout' }

  if (/^delete (the )?last set$/.test(normalized)) return { type: 'deleteLastSet' }

  let m = normalized.match(/^delete (.+)$/)
  if (m) return { type: 'deleteExercise', name: m[1].trim() }

  m = normalized.match(new RegExp(`^increase(?: by| the weight by)? (${NUM})$`))
  if (m) return { type: 'increaseWeight', amount: parseFloat(m[1]) }

  if (/^(another|duplicate|repeat)( the| that)?( previous)? set$/.test(normalized)) {
    return { type: 'duplicateSet' }
  }

  m = normalized.match(new RegExp(`^same weight (${NUM}) reps?$`))
  if (m) return { type: 'sameWeightReps', reps: parseFloat(m[1]) }

  m = normalized.match(new RegExp(`^(${NUM})\\s*${SEP}\\s*(${NUM})$`))
  if (m) return { type: 'appendSet', weight: parseFloat(m[1]), reps: parseFloat(m[2]) }

  m = normalized.match(new RegExp(`^(.+?)\\s+(${NUM})\\s*${SEP}\\s*(${NUM})$`))
  if (m) {
    return { type: 'createOrSelectExerciseWithSet', name: m[1].trim(), weight: parseFloat(m[2]), reps: parseFloat(m[3]) }
  }

  return { type: 'selectExercise', name: normalized }
}

type MatchCandidate = { id: string; name: string; aliases?: string[] }

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[a.length][b.length]
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(a, b) / maxLen
}

// Fuzzy exercise-name matcher against name + aliases — handles "bench"
// matching "Bench Press", minor mis-transcriptions, etc.
export function matchExerciseName<T extends MatchCandidate>(query: string, candidates: T[], threshold = 0.55): T | null {
  const q = query.trim().toLowerCase()
  if (!q) return null
  let best: T | null = null
  let bestScore = 0
  for (const c of candidates) {
    for (const n of [c.name, ...(c.aliases ?? [])]) {
      const nl = n.toLowerCase()
      let score = similarity(q, nl)
      if (nl.includes(q) || q.includes(nl)) score = Math.max(score, 0.85)
      if (nl.startsWith(q) || q.startsWith(nl)) score = Math.max(score, 0.9)
      if (score > bestScore) {
        bestScore = score
        best = c
      }
    }
  }
  return bestScore >= threshold ? best : null
}
