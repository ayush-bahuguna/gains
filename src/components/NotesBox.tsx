import { useState } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { IconChevronDown } from './icons'
import { Sketchy } from './Sketchy'

type NotesBoxProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  defaultExpanded?: boolean
  bordered?: boolean
  collapsible?: boolean
}

export function NotesBox({
  className = '',
  defaultExpanded = false,
  bordered = true,
  collapsible = true,
  ...rest
}: NotesBoxProps) {
  const [ref, size] = useMeasure<HTMLDivElement>()
  const [expandedState, setExpanded] = useState(defaultExpanded)
  const expanded = collapsible ? expandedState : true

  return (
    <div ref={ref} className="relative p-4">
      <Sketchy
        width={size.width}
        height={size.height}
        radius={20}
        fill="var(--color-paper)"
        showStroke={bordered}
      />
      <div className="relative z-10">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-between text-xs text-graphite"
          >
            <span>Notes</span>
            <IconChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        ) : (
          <p className="text-xs text-graphite">Notes</p>
        )}
        {expanded && (
          <div className="relative mt-2">
            <textarea
              rows={4}
              className={`no-scrollbar w-full resize-none bg-transparent pr-6 text-sm text-ink placeholder:text-graphite/60 focus:outline-none ${className}`}
              {...rest}
            />
            <span className="pointer-events-none absolute bottom-0 right-0 text-lg">🙂</span>
          </div>
        )}
      </div>
    </div>
  )
}
