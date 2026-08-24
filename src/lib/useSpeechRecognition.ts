import { useCallback, useEffect, useRef } from 'react'

// Minimal ambient shape for the Web Speech API — not in lib.dom.d.ts.
type SpeechRecognitionResultLike = { transcript: string }
type SpeechRecognitionEventLike = { results: { [index: number]: { [index: number]: SpeechRecognitionResultLike } } }
type SpeechRecognitionErrorEventLike = { error: string }
type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

type UseSpeechRecognitionOptions = {
  onResult: (transcript: string) => void
  onError?: (message: string) => void
  onEnd?: () => void
}

// Some mobile/PWA browsers occasionally let a SpeechRecognition session hang
// with no terminating event at all (no onresult, no onerror, no onend) after
// repeated use in one page session. Nothing in the Web Speech API forces a
// timeout, so without one the UI can get stuck on "listening" forever.
const WATCHDOG_MS = 10000

function detachHandlers(recognition: SpeechRecognitionLike) {
  recognition.onresult = null
  recognition.onerror = null
  recognition.onend = null
}

// Wraps the browser's SpeechRecognition for a single spoken utterance at a
// time (continuous: false) — the browser auto-stops on silence and fires
// onresult/onend, which is a natural fit for one voice command per tap.
export function useSpeechRecognition({ onResult, onError, onEnd }: UseSpeechRecognitionOptions) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  // Some engines end a session with neither a result nor an error — e.g. a
  // denied/blocked mic permission can silently no-op straight to onend.
  // Track whether onresult/onerror actually fired so that case surfaces as
  // a visible error instead of quietly resetting to idle.
  const handledRef = useRef(false)
  const manualStopRef = useRef(false)
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supported = getSpeechRecognitionCtor() !== null

  const clearWatchdog = () => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current)
      watchdogRef.current = null
    }
  }

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      onError?.('Voice input is not supported in this browser.')
      return
    }
    // A previous instance that never reached onend (the hang this watchdog
    // guards against) could still be holding the mic or fire a stray event
    // into the new session's state — kill it before starting a new one.
    if (recognitionRef.current) {
      const stale = recognitionRef.current
      detachHandlers(stale)
      try {
        stale.stop()
      } catch {
        // already stopped/aborted — nothing to do
      }
    }
    clearWatchdog()
    handledRef.current = false
    manualStopRef.current = false
    const recognition = new Ctor()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      handledRef.current = true
      clearWatchdog()
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      onResult(transcript)
    }
    recognition.onerror = (event) => {
      handledRef.current = true
      clearWatchdog()
      console.error('[voice] recognition error:', event.error)
      onError?.(event.error === 'no-speech' ? "Didn't catch that." : `Voice input error (${event.error}).`)
    }
    recognition.onend = () => {
      clearWatchdog()
      if (!handledRef.current && !manualStopRef.current) {
        onError?.('No speech detected — check microphone access for this app and try again.')
      }
      onEnd?.()
    }
    recognitionRef.current = recognition
    try {
      recognition.start()
      watchdogRef.current = setTimeout(() => {
        watchdogRef.current = null
        if (recognitionRef.current !== recognition) return
        console.warn('[voice] recognition timed out with no event')
        detachHandlers(recognition)
        try {
          recognition.abort()
        } catch {
          // best-effort — the point is resetting our own state below either way
        }
        onError?.('Voice input timed out — tap the mic and try again.')
        onEnd?.()
      }, WATCHDOG_MS)
    } catch {
      onError?.('Could not start voice input — try again.')
    }
  }, [onResult, onError, onEnd])

  const stop = useCallback(() => {
    manualStopRef.current = true
    recognitionRef.current?.stop()
  }, [])

  useEffect(
    () => () => {
      clearWatchdog()
      recognitionRef.current?.stop()
    },
    [],
  )

  return { start, stop, supported }
}
