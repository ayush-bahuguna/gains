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

function clean(tok: string) {
  return tok.toLowerCase().replace(/[^a-z]/g, '')
}

// Reads one grammatically-valid English number starting at `start` and
// reports how many tokens it consumed. Only merges combinations that are
// actually valid compounds (TENS+ONES like "eighty five" -> 85, or a
// "hundred" group) — critically, does NOT merge two adjacent standalone
// numbers like "eighty twelve" (weight 80, then reps 12) into one, which a
// naive "keep consuming number words" scan would wrongly read as 92.
function readNumberRun(tokens: string[], start: number): { value: number; consumed: number } {
  let i = start
  const first = clean(tokens[i])

  if (first === 'hundred') {
    return finishAfterHundred(tokens, i + 1, 100, start)
  }
  if (first in TEENS) {
    return { value: TEENS[first], consumed: 1 }
  }
  if (first in TENS) {
    i++
    let value = TENS[first]
    if (i < tokens.length && clean(tokens[i]) in ONES) {
      value += ONES[clean(tokens[i])]
      i++
    }
    return { value, consumed: i - start }
  }
  if (first in ONES) {
    const value = ONES[first]
    i++
    if (i < tokens.length && clean(tokens[i]) === 'hundred') {
      return finishAfterHundred(tokens, i + 1, value * 100, start)
    }
    return { value, consumed: 1 }
  }
  return { value: 0, consumed: 1 }
}

function finishAfterHundred(tokens: string[], from: number, base: number, start: number): { value: number; consumed: number } {
  let j = from
  if (j < tokens.length && clean(tokens[j]) === 'and') j++
  if (j < tokens.length) {
    const tw = clean(tokens[j])
    if (tw in TEENS) return { value: base + TEENS[tw], consumed: j + 1 - start }
    if (tw in TENS) {
      j++
      let value = base + TENS[tw]
      if (j < tokens.length && clean(tokens[j]) in ONES) {
        value += ONES[clean(tokens[j])]
        j++
      }
      return { value, consumed: j - start }
    }
    if (tw in ONES) return { value: base + ONES[tw], consumed: j + 1 - start }
  }
  return { value: base, consumed: from - start }
}

// "for" (the weight/reps separator, e.g. "eighty for eight") is a classic
// speech-recognition homophone of "four", which is also a valid number word.
// Sandwiched between two numbers it's essentially always the separator —
// left alone it would silently merge into the preceding number (readNumberRun
// treats "eighty four" as the compound 84) or leave three bare numbers where
// only two slots are expected. Only rewrite it in that sandwiched position so
// "four" used as an actual digit (e.g. "bench press four ten") is untouched.
function disambiguateForFour(tokens: string[]): string[] {
  return tokens.map((tok, i) => {
    if (clean(tok) !== 'four') return tok
    const prev = i > 0 ? clean(tokens[i - 1]) : ''
    const next = i + 1 < tokens.length ? clean(tokens[i + 1]) : ''
    const prevIsNumber = isNumberWord(prev) || /^\d+$/.test(prev)
    const nextIsNumber = isNumberWord(next) || /^\d+$/.test(next)
    return prevIsNumber && nextIsNumber ? 'for' : tok
  })
}

// Speech recognition engines usually already normalize spoken numbers to
// digits, but this isn't guaranteed across browsers — so parse word-numbers
// too ("eighty five" -> "85") as a safety net, leaving anything else as-is.
export function normalizeSpokenNumbers(text: string): string {
  const tokens = disambiguateForFour(text.split(/\s+/))
  const out: string[] = []
  let i = 0
  while (i < tokens.length) {
    if (isNumberWord(clean(tokens[i]))) {
      const { value, consumed } = readNumberRun(tokens, i)
      out.push(String(value))
      i += consumed
      continue
    }
    out.push(tokens[i])
    i++
  }
  return out.join(' ')
}

export type AmountSpec = { kind: 'same' } | { kind: 'relative'; delta: number } | { kind: 'explicit'; value: number }

export type VoiceAction =
  | { type: 'undo' }
  | { type: 'finishWorkout' }
  | { type: 'deleteLastSet' }
  | { type: 'deleteExercise'; name: string }
  | { type: 'increaseWeight'; amount: number }
  | { type: 'duplicateSet' }
  | { type: 'logSet'; name: string | null; weight: AmountSpec; reps: AmountSpec }
  | { type: 'selectExercise'; name: string }

const NUM = '\\d+(?:\\.\\d+)?'
const SEP = '(?:for|x|times|by)?'
const UP_WORDS = '(?:plus|up|increase|add)'
const DOWN_WORDS = '(?:minus|down|decrease|less)'

// A weight/reps slot in the canonical grammar below — exactly one of:
// a bare number ("80"), a modifier + number ("up 5", "down 5"), or the
// single word "same". Each is 1–2 words, never a variable-length phrase,
// which is what keeps the two slots unambiguously separable.
const SLOT = `(?:same|${UP_WORDS}\\s+${NUM}|${DOWN_WORDS}\\s+${NUM}|${NUM})`

// Decorative unit/count words real speech includes but the grammar doesn't
// need ("65 kg", "12 reps", "12 sets" said loosely to mean reps) — stripped
// before the weight/reps patterns are tried, never before the fixed-phrase
// commands (delete last SET, another SET) since those need those exact
// words present. wraps/raps: speech recognition commonly mishears "reps"
// as one of these (e.g. "15 reps" -> "15 wraps") — a single trailing
// unstrippable word like that fails the whole log-set grammar (see the
// "four"/"for" homophone handling in disambiguateForFour above for the
// same class of problem).
const FILLER_WORDS = /\b(kgs?|kilograms?|kilos?|lbs?|pounds?|reps?|repetitions?|wraps?|raps?|sets?)\b/g

function stripFillerWords(text: string): string {
  return text.replace(FILLER_WORDS, ' ').replace(/\s+/g, ' ').trim()
}

function parseSlot(text: string): AmountSpec {
  const t = text.trim()
  if (/^same$/.test(t)) return { kind: 'same' }
  let m = t.match(new RegExp(`^${UP_WORDS}\\s+(${NUM})$`))
  if (m) return { kind: 'relative', delta: parseFloat(m[1]) }
  m = t.match(new RegExp(`^${DOWN_WORDS}\\s+(${NUM})$`))
  if (m) return { kind: 'relative', delta: -parseFloat(m[1]) }
  return { kind: 'explicit', value: parseFloat(t) }
}

// Canonical grammar: "<exercise name?> <weight> <reps>", where the name is
// optional (falls back to whichever exercise was last referenced) and each
// of weight/reps is an explicit number, "same" (as the last set), or a
// relative "up N" / "down N" adjustment from the last set. e.g.:
//   "bench press eighty twelve"     -> explicit 80 / explicit 12
//   "bench press same up two"       -> same weight / reps +2
//   "bench press up five down two"  -> weight +5 / reps -2
//   "up five same"                  -> (current exercise) weight +5 / same reps
// The name group is lazy-optional (`??`, not `?`) so the engine tries
// "no name" first — otherwise a name-less relative command like "up five
// same" backtracks into treating "up" as a bogus exercise name with weight
// slot "five", instead of correctly reading "up five" as one relative slot
// applied to the current exercise.
// Slots must be separated by real whitespace (never `\s*`) — otherwise a
// bare multi-digit number like "105" with nothing else could get split
// arbitrarily into two slots ("10" / "5") just to satisfy the 2-slot shape.
const LOG_SET_RE = new RegExp(`^(?:(.+?)\\s+)??(${SLOT})(?:\\s+${SEP})?\\s+(${SLOT})$`)

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

  m = normalized.match(new RegExp(`^increase(?: by| the weight by)? (${NUM})(?:\\s*(?:kgs?|lbs?|pounds?|kilos?))?$`))
  if (m) return { type: 'increaseWeight', amount: parseFloat(m[1]) }

  if (/^(another|duplicate|repeat)( the| that)?( previous)? set$/.test(normalized)) {
    return { type: 'duplicateSet' }
  }

  const stripped = stripFillerWords(normalized)

  m = stripped.match(LOG_SET_RE)
  if (m) {
    return {
      type: 'logSet',
      name: m[1]?.trim() || null,
      weight: parseSlot(m[2]),
      reps: parseSlot(m[3]),
    }
  }

  // Contains a digit but didn't fit the log-set grammar — a weight/reps
  // attempt that just didn't parse. Don't silently fall back to treating it
  // as a bare exercise name: that would select/create the exercise (fuzzy
  // matching is lenient enough to still find it inside a garbled phrase)
  // while quietly dropping the weight/reps with no feedback at all.
  if (/\d/.test(stripped)) return null

  return { type: 'selectExercise', name: stripped || normalized }
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

const MATCH_STOPWORDS = new Set(['the', 'a', 'an', 'do', 'some', 'my'])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 0 && !MATCH_STOPWORDS.has(t))
}

// Word-level overlap score, complementing the whole-string Levenshtein
// similarity above — that one penalizes extra words ("do the bench press")
// and word-order/plural differences ("cable crossovers" vs. alias "cable
// crossover") heavily enough to legitimately miss real matches. This scores
// how many query words appear (exactly or near-exactly) in the candidate,
// as a Jaccard ratio over the combined token set — NOT normalized against
// just the smaller side, which would let an exact match ("Bench Press")
// and a strict superset ("Incline Barbell Bench Press") tie at a perfect
// score just because every query word happens to appear in both; Jaccard
// correctly scores the exact match higher since the superset has extra
// unmatched words dragging its union count up.
function tokenOverlapScore(query: string, candidate: string): number {
  const qTokens = tokenize(query)
  const cTokens = tokenize(candidate)
  if (qTokens.length === 0 || cTokens.length === 0) return 0
  let matched = 0
  for (const qt of qTokens) {
    if (cTokens.some((ct) => qt === ct || similarity(qt, ct) >= 0.8)) matched++
  }
  return matched / (qTokens.length + cTokens.length - matched)
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
      let score = Math.max(similarity(q, nl), tokenOverlapScore(q, nl))
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
