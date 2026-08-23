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
  const supported = getSpeechRecognitionCtor() !== null

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      onError?.('Voice input is not supported in this browser.')
      return
    }
    const recognition = new Ctor()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      onResult(transcript)
    }
    recognition.onerror = (event) => {
      onError?.(event.error === 'no-speech' ? "Didn't catch that." : 'Voice input error.')
    }
    recognition.onend = () => {
      onEnd?.()
    }
    recognitionRef.current = recognition
    recognition.start()
  }, [onResult, onError, onEnd])

  const stop = useCallback(() => {
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
