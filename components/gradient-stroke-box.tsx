import { useId, useState } from 'react'
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'

export interface GradientStop {
  offset: number
  color: string
  opacity?: number
}

export interface GradientSpec {
  handles: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }]
  stops: GradientStop[]
}

// Standard "Stroke Linear 2" gradient — 4-stop ring used on cards, back buttons, filter pills.
export const STROKE_LINEAR_2: GradientSpec = {
  handles: [
    { x: -0.13235292054167536, y: -0.2761193984134499 },
    { x: 0.7132352140595478, y: 1.2388059963225897 },
    { x: -0.9092690791605367, y: -0.06832179528930438 },
  ],
  stops: [
    { offset: 0, color: '#707070', opacity: 1 },
    { offset: 0.418, color: '#707070', opacity: 0 },
    { offset: 0.649, color: '#BFBFBF', opacity: 0.12 },
    { offset: 1, color: '#BFBFBF', opacity: 1 },
  ],
}

// "Linear BG3 stroke" — 2-stop dark→gray, full alpha. Search bars, name plates.
export const LINEAR_BG3_STROKE: GradientSpec = {
  handles: [
    { x: 0.07352940825502374, y: 0.4925373325943197 },
    { x: 1.661764688739069, y: 2.8656717148150683 },
    { x: -1.1130377828553504, y: 1.3105368846287038 },
  ],
  stops: [
    { offset: 0, color: '#1F1F1F', opacity: 1 },
    { offset: 1, color: '#707070', opacity: 1 },
  ],
}

// "Linear BG4 stroke" — same handles, alpha 0.7. Used on the view-switcher pill.
export const LINEAR_BG4_STROKE: GradientSpec = {
  handles: [
    { x: 0.07352940825502374, y: 0.4925373325943197 },
    { x: 1.661764688739069, y: 2.8656717148150683 },
    { x: -1.1130377828553504, y: 1.3105368846287038 },
  ],
  stops: [
    { offset: 0, color: '#1F1F1F', opacity: 0.7 },
    { offset: 1, color: '#707070', opacity: 0.7 },
  ],
}

interface GradientStrokeBoxProps {
  width: number
  height: number
  rx: number
  strokeWidth?: number
  gradient?: GradientSpec
}

export function GradientStrokeBox({
  width,
  height,
  rx,
  strokeWidth = 1,
  gradient = STROKE_LINEAR_2,
}: GradientStrokeBoxProps) {
  const [h0, h1, h2] = gradient.handles
  const a = (h1.x - h0.x) * width
  const b = (h1.y - h0.y) * height
  const c = (h2.x - h0.x) * width
  const d = (h2.y - h0.y) * height
  const e = h0.x * width
  const f = h0.y * height
  // Unique per instance — same-size boxes must NOT share an SVG <defs> id,
  // or the duplicate id makes the gradient render blank until a re-render/refresh.
  // useId() can contain ':' which is invalid in an SVG id/url() — strip it.
  const gradId = `gs${useId().replace(/:/g, '')}`
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={width} height={height}>
      <Defs>
        <LinearGradient
          id={gradId}
          x1={0}
          y1={0}
          x2={1}
          y2={0}
          gradientUnits="userSpaceOnUse"
          gradientTransform={`matrix(${a} ${b} ${c} ${d} ${e} ${f})`}
        >
          {gradient.stops.map((stop, i) => (
            <Stop
              key={i}
              offset={stop.offset}
              stopColor={stop.color}
              stopOpacity={stop.opacity ?? 1}
            />
          ))}
        </LinearGradient>
      </Defs>
      <Rect
        x={strokeWidth / 2}
        y={strokeWidth / 2}
        width={width - strokeWidth}
        height={height - strokeWidth}
        rx={rx}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={strokeWidth}
      />
    </Svg>
  )
}

interface GradientFillBoxProps {
  width: number
  height: number
  rx: number
  gradient: GradientSpec
}

// stroke box, but a solid fill). Used for the "Setting Up" card background.
export function GradientFillBox({ width, height, rx, gradient }: GradientFillBoxProps) {
  const [h0, h1, h2] = gradient.handles
  const a = (h1.x - h0.x) * width
  const b = (h1.y - h0.y) * height
  const c = (h2.x - h0.x) * width
  const d = (h2.y - h0.y) * height
  const e = h0.x * width
  const f = h0.y * height
  const gradId = `gf${useId().replace(/:/g, '')}`
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={width} height={height}>
      <Defs>
        <LinearGradient
          id={gradId}
          x1={0}
          y1={0}
          x2={1}
          y2={0}
          gradientUnits="userSpaceOnUse"
          gradientTransform={`matrix(${a} ${b} ${c} ${d} ${e} ${f})`}
        >
          {gradient.stops.map((stop, i) => (
            <Stop
              key={i}
              offset={stop.offset}
              stopColor={stop.color}
              stopOpacity={stop.opacity ?? 1}
            />
          ))}
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} rx={rx} fill={`url(#${gradId})`} />
    </Svg>
  )
}

export const SETUP_ROW_BORDER: GradientSpec = {
  handles: [
    { x: 0.04578756529072958, y: -0.00800000291435364 },
    { x: 0.49999999048704585, y: 0.9999999788886057 },
    { x: -0.45821242561075004, y: 0.08042970416640739 },
  ],
  stops: [
    { offset: 0, color: '#707070', opacity: 1 },
    { offset: 0.4182594418525696, color: '#707070', opacity: 0 },
    { offset: 0.6491084694862366, color: '#E4E7EC', opacity: 0.12 },
    { offset: 1, color: '#E4E7EC', opacity: 1 },
  ],
}

interface AutoGradientStrokeBoxProps {
  rx: number
  strokeWidth?: number
  gradient?: GradientSpec
}

// Self-measuring variant for elements with dynamic width (e.g. text chips).
export function AutoGradientStrokeBox({ rx, strokeWidth, gradient }: AutoGradientStrokeBoxProps) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    if (!size || size.w !== width || size.h !== height) setSize({ w: width, h: height })
  }
  return (
    <View pointerEvents="none" onLayout={handleLayout} style={StyleSheet.absoluteFill}>
      {size && (
        <GradientStrokeBox
          width={size.w}
          height={size.h}
          rx={rx}
          strokeWidth={strokeWidth}
          gradient={gradient}
        />
      )}
    </View>
  )
}
