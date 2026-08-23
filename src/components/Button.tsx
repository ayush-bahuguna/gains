import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useState } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { Sketchy } from './Sketchy'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'tertiary'
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const sketchyProps = {
  primary: { fill: 'var(--color-ink)', stroke: 'var(--color-ink)' },
  secondary: { fill: 'var(--color-paper)', stroke: 'var(--color-ink)' },
}
const pressedFill: Record<'primary' | 'secondary', string> = {
  primary: '#000000',
  secondary: '#eee9dc',
}
const textColor = { primary: 'text-paper', secondary: 'text-ink', tertiary: 'text-ink' }

export function Button({
  variant = 'primary',
  leftIcon,
  rightIcon,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const [ref, size] = useMeasure<HTMLButtonElement>()
  const [pressed, setPressed] = useState(false)
  const isTertiary = variant === 'tertiary'

  return (
    <button
      ref={ref}
      disabled={disabled}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className={`relative inline-flex items-center justify-center gap-2 text-sm disabled:pointer-events-none disabled:opacity-40 ${
        isTertiary ? 'p-0' : 'px-6 py-3'
      } ${textColor[variant]} ${className}`}
      {...rest}
    >
      {!isTertiary && (
        <Sketchy
          width={size.width}
          height={size.height}
          radius={999}
          fill={pressed ? pressedFill[variant as 'primary' | 'secondary'] : sketchyProps[variant as 'primary' | 'secondary'].fill}
          stroke={sketchyProps[variant as 'primary' | 'secondary'].stroke}
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">
        {leftIcon}
        {children}
        {rightIcon}
      </span>
    </button>
  )
}
