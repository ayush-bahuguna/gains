import { pickRandomQuote } from '../data/motivationQuotes'

const STORAGE_KEY = 'gains:dailyMotivation'
const TOPICS = ['workout', 'gym motivation', 'funny exercise', 'gym fail', 'sports hype', 'lifting weights funny']

export type DailyMotivation = {
  date: string
  gifUrl: string
  quote: string
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function readCache(): DailyMotivation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DailyMotivation
    return parsed.date === todayKey() ? parsed : null
  } catch {
    return null
  }
}

function writeCache(data: DailyMotivation) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Private browsing / quota exceeded — a re-fetch next load is fine.
  }
}

async function fetchRandomGif(): Promise<string | null> {
  const apiKey = import.meta.env.VITE_GIPHY_API_KEY
  if (!apiKey) return null
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)]
  try {
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/random?api_key=${apiKey}&tag=${encodeURIComponent(topic)}&rating=pg13`,
    )
    if (!res.ok) return null
    const json = await res.json()
    return json?.data?.images?.original?.url ?? null
  } catch {
    return null
  }
}

// Never throws — a missing key, network failure, or bad response just means
// no GIF shows up. This is a delight feature, not core functionality, and
// must never break Journal Home.
export async function getDailyMotivation(): Promise<DailyMotivation | null> {
  const cached = readCache()
  if (cached) return cached

  const gifUrl = await fetchRandomGif()
  if (!gifUrl) return null

  const data: DailyMotivation = { date: todayKey(), gifUrl, quote: pickRandomQuote() }
  writeCache(data)
  return data
}

// Bypasses the cache and picks a new gif/quote, overwriting today's cached
// pick (so it stays the one shown for the rest of the day). Used by the
// long-press "reload" gesture on the Journal Home gif. Same never-throws
// contract as getDailyMotivation — returns null on failure, callers just
// keep showing whatever they already had.
export async function refreshDailyMotivation(): Promise<DailyMotivation | null> {
  const gifUrl = await fetchRandomGif()
  if (!gifUrl) return null

  const data: DailyMotivation = { date: todayKey(), gifUrl, quote: pickRandomQuote() }
  writeCache(data)
  return data
}
