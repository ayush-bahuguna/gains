import type { ReactNode } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [ref, size] = useMeasure<HTMLDivElement>()

  if (!isOpen) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6"
      onClick={onClose}
    >
      <div ref={ref} className="relative w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <Sketchy width={size.width} height={size.height} radius={20} fill="var(--color-paper)" />
        <div className="relative z-10">
          {title && <h2 className="mb-2 text-xl font-bold text-ink">{title}</h2>}
          {children}
        </div>
      </div>
    </div>
  )
}
