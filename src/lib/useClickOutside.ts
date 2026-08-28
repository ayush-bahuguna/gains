import { useEffect } from 'react'
import type { RefObject } from 'react'

// Fires `onOutside` for a pointerdown outside `ref`'s element — used to
// dismiss the exercise-search dropdown (TemplateDetails, ActiveSession) when
// tapping elsewhere. Only listens while `active` is true, so it doesn't add
// a global listener for the (common) case where there's nothing to dismiss.
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutside: () => void,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return
    function handlePointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside()
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [ref, onOutside, active])
}
