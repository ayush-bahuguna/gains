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
  const supported = getSpeechRecognitionCtor() !== null

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      onError?.('Voice input is not supported in this browser.')
      return
    }
    handledRef.current = false
    manualStopRef.current = false
    const recognition = new Ctor()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      handledRef.current = true
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      onResult(transcript)
    }
    recognition.onerror = (event) => {
      handledRef.current = true
      onError?.(event.error === 'no-speech' ? "Didn't catch that." : `Voice input error (${event.error}).`)
    }
    recognition.onend = () => {
      if (!handledRef.current && !manualStopRef.current) {
        onError?.('No speech detected — check microphone access for this app and try again.')
      }
      onEnd?.()
    }
    recognitionRef.current = recognition
    try {
      recognition.start()
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
      recognitionRef.current?.stop()
    },
    [],
  )

  return { start, stop, supported }
}
