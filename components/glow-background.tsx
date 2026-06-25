import { createElement, useId } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import Svg, { Defs, Ellipse, FeGaussianBlur, Filter } from 'react-native-svg'

// Figma file CaKWVCHXZEjY1INvc6fhVv "Welcoming & Authentication".
//
// Each auth frame in Figma is a solid #3D3D3D ellipse with a layer
// effect `filter: blur(Npx)` over a #121212 background.
//
// Web renders an actual HTML <div> (createElement bypasses react-native-web's
// style allow-list so the browser receives the CSS filter unchanged).
//
// Native renders the same ellipse inside an SVG with an <feGaussianBlur>
// filter — the same Gaussian primitive CSS `filter: blur()` is specced
// against, so the visible result matches the web pass closely. We use the
// same effective blur multiplier (×0.35) and the same source colour on both
// platforms so the two passes converge on identical luminance + spread.

type Variant = 'splash' | 'top' | 'welcome'

interface EllipseSpec {
  x: number
  y: number
  w: number
  h: number
  blurRadius: number
}

const ELLIPSES: Record<Variant, EllipseSpec[]> = {
  splash: [
    { x: -117, y: -143, w: 558, h: 248, blurRadius: 200 },
    { x: -117, y: 652, w: 558, h: 248, blurRadius: 250 },
  ],
  top: [{ x: -117, y: -143, w: 558, h: 248, blurRadius: 200 }],
  welcome: [{ x: -170, y: 275, w: 251, h: 248, blurRadius: 200 }],
}

// Browsers normalise filter:blur alpha across the kernel area, so a 558×248
// ellipse blurred 200px arrives at the screen much darker than Figma's
// non-normalised renderer. SVG feGaussianBlur normalises the same way, so the
// same pre-brightened source colour applies on both web and native.
const GLOW_COLOR = '#363636'
// Effective blur multiplier — the visible-on-screen Figma render is roughly
// 0.35× the design-file blur radius once browser/native normalisation is
// applied, so we down-scale the spec radius before handing it to either
// renderer.
const BLUR_SCALE = 0.35

interface GlowBackgroundProps {
  variant?: Variant
}

export default function GlowBackground({ variant = 'top' }: GlowBackgroundProps) {
  const ellipses = ELLIPSES[variant]
  const isWeb = Platform.OS === 'web'
  // useId() produces a stable, instance-unique id we can safely embed in SVG
  // <filter id="..."> — multiple GlowBackground instances on one screen
  // would otherwise collide on shared ids.
  const filterIdPrefix = useId().replace(/[:.]/g, '')

  return (
    <View style={[StyleSheet.absoluteFill, styles.noTouch]}>
      {ellipses.map((e, i) => {
        const effectiveBlur = e.blurRadius * BLUR_SCALE

        if (isWeb) {
          return createElement('div', {
            key: i,
            style: {
              position: 'absolute',
              left: `${e.x}px`,
              top: `${e.y}px`,
              width: `${e.w}px`,
              height: `${e.h}px`,
              backgroundColor: GLOW_COLOR,
              borderRadius: '50%',
              filter: `blur(${effectiveBlur}px)`,
              WebkitFilter: `blur(${effectiveBlur}px)`,
              pointerEvents: 'none',
            },
          })
        }

        // Native: SVG ellipse with feGaussianBlur. Canvas is padded by the
        // original spec radius so the blur halo never clips at the SVG edge.
        const pad = e.blurRadius
        const w = e.w + pad * 2
        const h = e.h + pad * 2
        const filterId = `glow-${filterIdPrefix}-${i}`

        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: e.x - pad,
              top: e.y - pad,
              width: w,
              height: h,
            }}
          >
            <Svg width={w} height={h}>
              <Defs>
                {/* Filter region extends well past the ellipse bbox so the
                    Gaussian tail isn't clipped at the default filter region. */}
                <Filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                  <FeGaussianBlur stdDeviation={effectiveBlur} />
                </Filter>
              </Defs>
              <Ellipse
                cx={w / 2}
                cy={h / 2}
                rx={e.w / 2}
                ry={e.h / 2}
                fill={GLOW_COLOR}
                filter={`url(#${filterId})`}
              />
            </Svg>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  noTouch: { pointerEvents: 'none' },
})
