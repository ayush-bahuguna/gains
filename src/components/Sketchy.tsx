import rough from 'roughjs'
import type { Options } from 'roughjs/bin/core'
import { useMemo, useState } from 'react'

const generator = rough.generator()

function buildRoundedRectStrokePaths(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  options: Options,
) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  const minLen = 1
  const hasTopBottomEdge = w - 2 * rr > minLen
  const hasLeftRightEdge = h - 2 * rr > minLen
  const drawables = []

  if (hasTopBottomEdge) {
    drawables.push(
      generator.line(x + rr, y, x + w - rr, y, options),
      generator.line(x + w - rr, y + h, x + rr, y + h, options),
    )
  }
  if (hasLeftRightEdge) {
    drawables.push(
      generator.line(x + w, y + rr, x + w, y + h - rr, options),
      generator.line(x, y + h - rr, x, y + rr, options),
    )
  }

  if (rr > 0.5) {
    const d = rr * 2
    if (!hasLeftRightEdge) {
      // Pill shape (left/right edges collapsed to zero) — each cap must be
      // ONE continuous semicircle. Two independently-jittered quarter-arcs
      // sharing a center don't meet cleanly at their shared endpoint and
      // render as a crossed/tangled knot instead of a smooth rounded cap.
      drawables.push(
        generator.arc(x + rr, y + rr, d, d, 0.5 * Math.PI, 1.5 * Math.PI, false, options),
        generator.arc(x + w - rr, y + rr, d, d, -0.5 * Math.PI, 0.5 * Math.PI, false, options),
      )
    } else if (!hasTopBottomEdge) {
      // Vertical pill (top/bottom edges collapsed) — same reasoning.
      drawables.push(
        generator.arc(x + rr, y + rr, d, d, Math.PI, 2 * Math.PI, false, options),
        generator.arc(x + rr, y + h - rr, d, d, 0, Math.PI, false, options),
      )
    } else {
      drawables.push(
        generator.arc(x + rr, y + rr, d, d, Math.PI, 1.5 * Math.PI, false, options),
        generator.arc(x + w - rr, y + rr, d, d, 1.5 * Math.PI, 2 * Math.PI, false, options),
        generator.arc(x + w - rr, y + h - rr, d, d, 0, 0.5 * Math.PI, false, options),
        generator.arc(x + rr, y + h - rr, d, d, 0.5 * Math.PI, Math.PI, false, options),
      )
    }
  }
  return drawables.flatMap((drawable) => generator.toPaths(drawable))
}

type SketchyProps = {
  width: number
  height: number
  shape?: 'rectangle' | 'ellipse' | 'line'
  radius?: number
  roughness?: number
  bowing?: number
  strokeWidth?: number
  stroke?: string
  fill?: string
  fillStyle?: 'hachure' | 'solid' | 'zigzag' | 'cross-hatch'
  dash?: number[]
  seed?: number
  multiStroke?: boolean
  className?: string
}

export function Sketchy({
  width,
  height,
  shape = 'rectangle',
  radius = 14,
  roughness = 0.9,
  bowing = 0.7,
  strokeWidth = 1.75,
  stroke = 'var(--color-ink)',
  fill,
  fillStyle = 'solid',
  dash,
  seed,
  multiStroke = false,
  className = '',
}: SketchyProps) {
  // When no explicit seed is given, generate one random-but-stable value per
  // mounted instance — otherwise every Sketchy with the same props (e.g. a
  // list of cards) renders the exact same wobble, which reads as fake rather
  // than hand-drawn.
  const [autoSeed] = useState(() => Math.floor(Math.random() * 2 ** 31))
  const effectiveSeed = seed ?? autoSeed

  const result = useMemo(() => {
    if (width <= 0 || height <= 0) return null
    const inset = strokeWidth * 1.4
    const w = width - inset * 2
    const h = height - inset * 2
    const strokeOptions: Options = {
      roughness,
      bowing,
      strokeWidth,
      stroke,
      seed: effectiveSeed,
      disableMultiStroke: !multiStroke,
    }
    if (dash) strokeOptions.strokeLineDash = dash

    if (shape === 'ellipse') {
      const drawable = generator.ellipse(width / 2, height / 2, w, h, {
        ...strokeOptions,
        fill,
        fillStyle,
        disableMultiStrokeFill: true,
      })
      return { flatFill: null, strokePaths: generator.toPaths(drawable) }
    }

    if (shape === 'line') {
      const drawable = generator.line(inset, height / 2, width - inset, height / 2, strokeOptions)
      return { flatFill: null, strokePaths: generator.toPaths(drawable) }
    }

    // Rectangle: a flat (non-rough) rounded-rect fill, plus a hand-drawn stroke
    // composed from separate line/arc primitives — generator.path() with a
    // custom rounded-rect path string produces garbled geometry in rough.js,
    // so the outline is built from primitives that are known to render correctly.
    const r = Math.min(radius, w / 2, h / 2)
    return {
      flatFill: fill ? { x: inset, y: inset, w, h, r } : null,
      strokePaths: buildRoundedRectStrokePaths(inset, inset, w, h, r, strokeOptions),
    }
  }, [
    width,
    height,
    shape,
    radius,
    roughness,
    bowing,
    strokeWidth,
    stroke,
    fill,
    fillStyle,
    dash,
    effectiveSeed,
    multiStroke,
  ])

  if (!result) return null

  return (
    <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      {result.flatFill && (
        <rect
          x={result.flatFill.x}
          y={result.flatFill.y}
          width={result.flatFill.w}
          height={result.flatFill.h}
          rx={result.flatFill.r}
          ry={result.flatFill.r}
          fill={fill}
        />
      )}
      {result.strokePaths.map((p, i) => (
        <path key={i} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill ?? 'none'} />
      ))}
    </svg>
  )
}
