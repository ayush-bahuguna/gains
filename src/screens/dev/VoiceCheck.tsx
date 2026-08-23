import { useEffect, useState } from 'react'
import { VoicePanel, type VoicePanelState } from '../../components/VoiceListeningPanel'

export function VoiceCheck() {
  const [state, setState] = useState<VoicePanelState>('idle')

  useEffect(() => {
    if (state !== 'processing') return
    const timer = setTimeout(() => setState('idle'), 1200)
    return () => clearTimeout(timer)
  }, [state])

  return (
    <div className="mx-auto max-w-[480px] space-y-4 bg-paper p-6">
      <h1 className="text-2xl font-bold">Voice Listening State (§10)</h1>
      <p className="text-xs text-graphite">
        Working prototype — the outer panel stays put; tap the mic to go idle → listening →
        processing → idle.
      </p>

      <VoicePanel
        state={state}
        onMicClick={() => {
          if (state === 'idle' || state === 'error') setState('listening')
          else if (state === 'listening') setState('processing')
        }}
      />

      <button
        type="button"
        onClick={() => setState('error')}
        className="text-xs text-graphite underline"
      >
        Simulate error state
      </button>
    </div>
  )
}
