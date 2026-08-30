import { useEffect, useRef, useState } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { IconChevronDown } from './icons'
import { Sketchy } from './Sketchy'

type NotesBoxProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  defaultExpanded?: boolean
  bordered?: boolean
  collapsible?: boolean
  autoHeight?: boolean
}

export function NotesBox({
  className = '',
  label = 'Notes',
  defaultExpanded = false,
  bordered = true,
  collapsible = true,
  autoHeight = false,
  value,
  ...rest
}: NotesBoxProps) {
  const [ref, size] = useMeasure<HTMLDivElement>()
  const [expandedState, setExpanded] = useState(defaultExpanded)
  const expanded = collapsible ? expandedState : true
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!autoHeight || !expanded) return
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [autoHeight, expanded, value])

  return (
    <div ref={ref} className="relative p-4">
      <Sketchy
        width={size.width}
        height={size.height}
        radius={20}
        // Plain --color-paper is the page's own background — with no
        // stroke to distinguish it, an unbordered notes box would just
        // visually disappear into the page. A faint ink tint reads as a
        // deliberate light background instead.
        fill={bordered ? 'var(--color-paper)' : 'rgba(30, 30, 30, 0.05)'}
        showStroke={bordered}
      />
      <div className="relative z-10">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-between text-xs text-graphite"
          >
            <span>{label}</span>
            <IconChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        ) : (
          <p className="text-xs text-graphite">{label}</p>
        )}
        {expanded && (
          <div className="relative mt-2">
            <textarea
              ref={textareaRef}
              rows={autoHeight ? 1 : 4}
              value={value}
              className={`no-scrollbar w-full resize-none bg-transparent text-sm text-ink placeholder:text-graphite/60 focus:outline-none ${autoHeight ? 'overflow-hidden' : ''} ${className}`}
              {...rest}
            />
          </div>
        )}
      </div>
    </div>
  )
}
