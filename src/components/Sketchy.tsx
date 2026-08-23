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
    // Every line/arc is jittered independently by rough.js, so two segments
    // meant to meet at an exact point rarely land in the same place — that
    // shows up as a visible gap at every corner. Extending each arc's sweep
    // slightly past its ideal boundary makes it deliberately overlap the
    // adjacent line instead, reading as a confident pen overshoot rather
    // than a broken/missing corner.
    // Scaled by radius: a fixed angle eats a much bigger share of a small
    // corner's arc than a large one, causing extra faceting/bumpiness on
    // small shapes (icon boxes, checkboxes) even though it looks right on
    // large ones (cards).
    const overlap = 0.16 * Math.min(1, rr / 20)
    if (!hasLeftRightEdge) {
      // Pill shape (left/right edges collapsed to zero) — each cap must be
      // ONE continuous semicircle. Two independently-jittered quarter-arcs
      // sharing a center don't meet cleanly at their shared endpoint and
      // render as a crossed/tangled knot instead of a smooth rounded cap.
      drawables.push(
        generator.arc(x + rr, y + rr, d, d, 0.5 * Math.PI - overlap, 1.5 * Math.PI + overlap, false, options),
        generator.arc(x + w - rr, y + rr, d, d, -0.5 * Math.PI - overlap, 0.5 * Math.PI + overlap, false, options),
      )
    } else if (!hasTopBottomEdge) {
      // Vertical pill (top/bottom edges collapsed) — same reasoning.
      drawables.push(
        generator.arc(x + rr, y + rr, d, d, Math.PI - overlap, 2 * Math.PI + overlap, false, options),
        generator.arc(x + rr, y + h - rr, d, d, 0 - overlap, Math.PI + overlap, false, options),
      )
    } else {
      drawables.push(
        generator.arc(x + rr, y + rr, d, d, Math.PI - overlap, 1.5 * Math.PI + overlap, false, options),
        generator.arc(x + w - rr, y + rr, d, d, 1.5 * Math.PI - overlap, 2 * Math.PI + overlap, false, options),
        generator.arc(x + w - rr, y + h - rr, d, d, 0 - overlap, 0.5 * Math.PI + overlap, false, options),
        generator.arc(x + rr, y + h - rr, d, d, 0.5 * Math.PI - overlap, Math.PI + overlap, false, options),
      )
    }
  }
  return drawables.flatMap((drawable) => generator.toPaths(drawable))
}

// Point ring approximating a rounded rect, for feeding into generator.polygon()
// to get a genuine rough.js hachure/cross-hatch fill (crayon-scribble texture)
// — generator.path() with a rounded-rect path string is what produces garbled
// stroke geometry elsewhere in this file, but rough.js's own point-based
// polygon fill solver has no such issue, so this sidesteps it entirely.
function roundedRectPolygonPoints(x: number, y: number, w: number, h: number, r: number): [number, number][] {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  if (rr <= 0.5) {
    return [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ]
  }
  const segments = 6
  const pts: [number, number][] = []
  const addArc = (cx: number, cy: number, start: number, end: number) => {
    for (let i = 0; i <= segments; i++) {
      const t = start + ((end - start) * i) / segments
      pts.push([cx + rr * Math.cos(t), cy + rr * Math.sin(t)])
    }
  }
  addArc(x + w - rr, y + rr, -Math.PI / 2, 0)
  addArc(x + w - rr, y + h - rr, 0, Math.PI / 2)
  addArc(x + rr, y + h - rr, Math.PI / 2, Math.PI)
  addArc(x + rr, y + rr, Math.PI, 1.5 * Math.PI)
  return pts
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
  hachureGap?: number
  fillWeight?: number
  dash?: number[]
  seed?: number
  multiStroke?: boolean
  showStroke?: boolean
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
  hachureGap,
  fillWeight,
  dash,
  seed,
  multiStroke = false,
  showStroke = true,
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
    // A fixed roughness/bowing amount looks right on a large card but can
    // make a small shape (checkbox, radio dot, icon box) render as a
    // distorted blob for unlucky random seeds, since the perturbation
    // amplitude doesn't shrink with the shape. Scale both down for shapes
    // under ~40px so small elements stay reliably clean. A line's relevant
    // dimension is its length (width) — it's deliberately thin in height,
    // so min(width, height) would always read a divider/slider track as
    // "tiny" and flatten its wobble almost to a straight line.
    const referenceDimension = shape === 'line' ? width : Math.min(width, height)
    const sizeScale = Math.max(0.35, Math.min(1, referenceDimension / 40))
    const strokeOptions: Options = {
      roughness: roughness * sizeScale,
      bowing: bowing * sizeScale,
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
        hachureGap,
        fillWeight,
        disableMultiStrokeFill: true,
      })
      return { flatFill: null, fillPaths: null, strokePaths: generator.toPaths(drawable) }
    }

    if (shape === 'line') {
      const drawable = generator.line(inset, height / 2, width - inset, height / 2, strokeOptions)
      return { flatFill: null, fillPaths: null, strokePaths: generator.toPaths(drawable) }
    }

    // Rectangle: an outline composed from separate line/arc primitives —
    // generator.path() with a custom rounded-rect path string produces
    // garbled stroke geometry in rough.js, so the outline is built from
    // primitives known to render correctly. The fill is either a flat
    // (non-rough) rect for the default 'solid' style, or — for a textured
    // "crayon" look — a genuine rough.js hachure/cross-hatch fill computed
    // from a rounded-rect point polygon instead (that solver has no path-
    // string issue, unlike the stroke geometry above).
    const r = Math.min(radius, w / 2, h / 2)
    const strokePaths = buildRoundedRectStrokePaths(inset, inset, w, h, r, strokeOptions)
    if (fill && fillStyle !== 'solid') {
      const points = roundedRectPolygonPoints(inset, inset, w, h, r)
      const fillDrawable = generator.polygon(points, {
        fill,
        fillStyle,
        hachureGap,
        fillWeight,
        roughness: roughness * sizeScale,
        bowing: bowing * sizeScale,
        seed: effectiveSeed,
        stroke: 'none',
      })
      return { flatFill: null, fillPaths: generator.toPaths(fillDrawable), strokePaths }
    }
    return {
      flatFill: fill ? { x: inset, y: inset, w, h, r } : null,
      fillPaths: null,
      strokePaths,
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
    hachureGap,
    fillWeight,
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
      {result.fillPaths &&
        result.fillPaths.map((p, i) => (
          <path key={`fill-${i}`} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill ?? 'none'} />
        ))}
      {showStroke &&
        result.strokePaths.map((p, i) => (
          <path key={i} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill ?? 'none'} />
        ))}
    </svg>
  )
}
