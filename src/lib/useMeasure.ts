import { useCallback, useRef, useState } from 'react'

export function useMeasure<T extends HTMLElement>() {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const observerRef = useRef<ResizeObserver | null>(null)

  // A callback ref (not useRef + useLayoutEffect with an empty dep array)
  // is required here — components that conditionally render their measured
  // element (Modal, BottomSheet: return null while closed) mount with
  // ref.current still null, and an empty-deps effect only ever runs once,
  // so it would never see the element once it actually appears later.
  const ref = useCallback((el: T | null) => {
    observerRef.current?.disconnect()
    observerRef.current = null
    if (!el) return

    // getBoundingClientRect() always reflects the full rendered (border-box)
    // size, including padding — ResizeObserver's contentRect excludes padding,
    // which undersizes/misaligns the drawn border on any padded element.
    const update = () => {
      const rect = el.getBoundingClientRect()
      setSize({ width: rect.width, height: rect.height })
    }
    update()

    const observer = new ResizeObserver(update)
    observer.observe(el)
    observerRef.current = observer
  }, [])

  return [ref, size] as const
}
