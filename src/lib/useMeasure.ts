import { useLayoutEffect, useRef, useState } from 'react'

export function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const el = ref.current
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
    return () => observer.disconnect()
  }, [])

  return [ref, size] as const
}
