import { createElement } from 'react'
import { Image } from 'expo-image'
import { Platform, StyleSheet, View } from 'react-native'

type Variant = 'splash' | 'top' | 'welcome'

interface EllipseSpec {
  x: number
  y: number
  w: number
  h: number
  blurRadius: number
  asset: number
  assetW: number
  assetH: number
}

const WIDE_70 = {
  asset: require('../assets/images/glow/wide-70.png') as number,
  assetW: 978,
  assetH: 668,
}
const WIDE_87 = {
  asset: require('../assets/images/glow/wide-87.png') as number,
  assetW: 1084,
  assetH: 774,
}
const NARROW_70 = {
  asset: require('../assets/images/glow/narrow-70.png') as number,
  assetW: 671,
  assetH: 668,
}

const ELLIPSES: Record<Variant, EllipseSpec[]> = {
  splash: [
    { x: -117, y: -143, w: 558, h: 248, blurRadius: 200, ...WIDE_70 },
    { x: -117, y: 652, w: 558, h: 248, blurRadius: 250, ...WIDE_87 },
  ],
  top: [{ x: -117, y: -143, w: 558, h: 248, blurRadius: 200, ...WIDE_70 }],
  welcome: [{ x: -170, y: 275, w: 251, h: 248, blurRadius: 200, ...NARROW_70 }],
}

const GLOW_COLOR = '#363636'
const BLUR_SCALE = 0.35

interface GlowBackgroundProps {
  variant?: Variant
}

export default function GlowBackground({ variant = 'top' }: GlowBackgroundProps) {
  const ellipses = ELLIPSES[variant]
  const isWeb = Platform.OS === 'web'

  return (
    <View style={[StyleSheet.absoluteFill, styles.noTouch]}>
      {ellipses.map((e, i) => {
        if (isWeb) {
          const effectiveBlur = e.blurRadius * BLUR_SCALE
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

        const padX = (e.assetW - e.w) / 2
        const padY = (e.assetH - e.h) / 2
        return (
          <Image
            key={i}
            source={e.asset}
            contentFit="fill"
            style={{
              position: 'absolute',
              left: e.x - padX,
              top: e.y - padY,
              width: e.assetW,
              height: e.assetH,
            }}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  noTouch: { pointerEvents: 'none' },
})
