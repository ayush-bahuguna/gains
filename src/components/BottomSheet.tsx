import type { ReactNode } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

type BottomSheetProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const [ref, size] = useMeasure<HTMLDivElement>()

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/40" onClick={onClose}>
      <div
        ref={ref}
        className="relative max-h-[80vh] w-full max-w-[480px] overflow-y-auto p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <Sketchy width={size.width} height={size.height} radius={24} fill="var(--color-paper)" />
        <div className="relative z-10">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/20" />
          {title && <h2 className="mb-3 text-lg font-bold text-ink">{title}</h2>}
          {children}
        </div>
      </div>
    </div>
  )
}
