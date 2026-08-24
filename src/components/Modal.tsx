import type { ReactNode } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { IconButton } from './IconButton'
import { IconX } from './icons'
import { Sketchy } from './Sketchy'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  showCloseButton?: boolean
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, showCloseButton = false, children }: ModalProps) {
  const [ref, size] = useMeasure<HTMLDivElement>()

  if (!isOpen) return null
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 p-6"
      onClick={onClose}
    >
      <div
        ref={ref}
        className="relative max-h-[80vh] w-full max-w-sm overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <Sketchy width={size.width} height={size.height} radius={20} fill="var(--color-paper)" />
        {showCloseButton && (
          <div className="absolute right-1 top-1 z-20">
            <IconButton icon={<IconX className="h-5 w-5" />} aria-label="Close" onClick={onClose} />
          </div>
        )}
        <div className="relative z-10">
          {title && (
            <h2 className={`mb-2 text-xl font-bold text-ink ${showCloseButton ? 'pr-10' : ''}`}>{title}</h2>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
