import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
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

export function Modal({
  isOpen,
  onClose,
  title,
  showCloseButton = false,
  children,
}: ModalProps) {
  const [ref, size] = useMeasure<HTMLDivElement>()

  if (!isOpen) return null
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 p-6"
      onClick={onClose}
    >
      <div
        ref={ref}
        className="relative w-full max-w-sm rounded-[20px] bg-paper"
        onClick={(e) => e.stopPropagation()}
      >
        <Sketchy
          width={size.width}
          height={size.height}
          radius={20}
          fill="var(--color-paper)"
        />
        {showCloseButton && (
          <div className="absolute right-1 top-1 z-20">
            <IconButton
              icon={<IconX className="h-5 w-5" />}
              aria-label="Close"
              onClick={onClose}
            />
          </div>
        )}
        {/* Scrolling lives on this inner div, not the ref'd/Sketchy-bearing
            outer one — an absolutely-positioned child (the Sketchy border)
            scrolls along with its containing block's content when that
            block is itself the scroll container, which made the border
            visibly scroll away with the content instead of staying put. */}
        <div className="relative z-10 max-h-[80vh] overflow-y-auto p-5">
          {title && (
            <h2
              className={`mb-2 text-xl font-bold text-ink ${showCloseButton ? 'pr-10' : ''}`}
            >
              {title}
            </h2>
          )}
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
