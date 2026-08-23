import type { TextareaHTMLAttributes } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

type NotesBoxProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function NotesBox({ className = '', ...rest }: NotesBoxProps) {
  const [ref, size] = useMeasure<HTMLDivElement>()

  return (
    <div ref={ref} className="relative p-4">
      <Sketchy width={size.width} height={size.height} radius={20} fill="var(--color-paper)" />
      <div className="relative z-10">
        <p className="mb-2 text-xs text-graphite">Notes</p>
        <textarea
          rows={4}
          className={`no-scrollbar w-full resize-none bg-transparent pr-6 text-sm text-ink placeholder:text-graphite/60 focus:outline-none ${className}`}
          {...rest}
        />
        <span className="pointer-events-none absolute bottom-0 right-0 text-lg">🙂</span>
      </div>
    </div>
  )
}
