import { useMeasure } from '../lib/useMeasure'
import { Card } from './Card'
import { IconMic } from './icons'
import { Sketchy } from './Sketchy'

const barHeights = [8, 16, 24, 14, 28, 12, 20, 10, 18, 26, 14, 8]

function WaveBar({ height, delay }: { height: number; delay: number }) {
  const [ref, size] = useMeasure<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className="wave-bar relative w-1"
      style={{ height: `${height}px`, animationDelay: `${delay}ms` }}
    >
      <Sketchy
        width={size.width}
        height={size.height}
        radius={999}
        fill="var(--color-ink)"
        stroke="var(--color-ink)"
        roughness={1.5}
      />
    </div>
  )
}

function Waveform() {
  return (
    <div className="flex items-end gap-1">
      {barHeights.map((h, i) => (
        <WaveBar key={i} height={h} delay={i * 80} />
      ))}
    </div>
  )
}

function ListeningMicButton({ onClick }: { onClick?: () => void }) {
  const [ref, size] = useMeasure<HTMLButtonElement>()
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label="Stop listening"
      className="relative flex h-16 w-16 items-center justify-center text-paper"
    >
      <Sketchy width={size.width} height={size.height} shape="ellipse" fill="var(--color-ink)" stroke="var(--color-ink)" />
      <IconMic className="relative z-10 h-6 w-6" />
    </button>
  )
}

export type MicButtonState = 'idle' | 'processing' | 'error' | 'success'

const micStateStyle: Record<MicButtonState, { fill: string; stroke: string; textClass: string; dash?: number[] }> = {
  idle: { fill: 'var(--color-paper)', stroke: 'var(--color-ink)', textClass: 'text-ink' },
  processing: { fill: 'var(--color-paper)', stroke: 'var(--color-graphite)', textClass: 'text-graphite', dash: [4, 4] },
  error: { fill: 'var(--color-coral)', stroke: 'var(--color-coral)', textClass: 'text-ink' },
  success: { fill: 'var(--color-sage)', stroke: 'var(--color-sage)', textClass: 'text-ink' },
}

// The resting/compact mic affordance shown elsewhere in the app (e.g. the
// floating mic on Active Session) before/after the listening panel is open.
export function MicButton({
  state = 'idle',
  onClick,
}: {
  state?: MicButtonState
  onClick?: () => void
}) {
  const [ref, size] = useMeasure<HTMLButtonElement>()
  const style = micStateStyle[state]

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label="Voice input"
      className={`relative flex h-14 w-14 items-center justify-center ${style.textClass}`}
    >
      <Sketchy
        width={size.width}
        height={size.height}
        shape="ellipse"
        fill={style.fill}
        stroke={style.stroke}
        dash={style.dash}
      />
      <IconMic className="relative z-10 h-5 w-5" />
    </button>
  )
}

export type VoicePanelState = 'idle' | 'listening' | 'processing' | 'error' | 'success'

type VoicePanelProps = {
  state: VoicePanelState
  onMicClick?: () => void
  message?: string
  interim?: string
}

const panelCopy: Record<Exclude<VoicePanelState, 'listening'>, { label: string; helper: string }> = {
  idle: { label: 'Tap to speak', helper: 'Log a set, add an exercise, or finish the workout' },
  processing: { label: 'Processing...', helper: 'One sec' },
  error: { label: "Couldn't hear that", helper: 'Tap to try again' },
  success: { label: 'Got it', helper: 'Tap to speak again' },
}

// A single persistent panel frame — only its contents swap between idle,
// listening, processing, error, and success, so the outer outline never
// disappears.
export function VoicePanel({ state, onMicClick, message, interim }: VoicePanelProps) {
  if (state === 'listening') {
    return (
      <Card className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-ink">Listening...</p>
        <Waveform />
        {/* Live partial transcript — proves the mic is actually picking up
            speech in real time, since the decorative waveform above isn't
            audio-driven. */}
        <p className="min-h-4 text-center text-sm italic text-ink">{interim ? `"${interim}"` : ' '}</p>
        <ListeningMicButton onClick={onMicClick} />
        <p className="text-xs text-graphite">Tap to stop</p>
      </Card>
    )
  }

  const copy = panelCopy[state]
  return (
    <Card className="flex flex-col items-center gap-2">
      <MicButton state={state} onClick={onMicClick} />
      <div className="text-center">
        <p className="text-sm font-medium text-ink">{message ?? copy.label}</p>
        <p className="text-xs text-graphite">{copy.helper}</p>
      </div>
    </Card>
  )
}
