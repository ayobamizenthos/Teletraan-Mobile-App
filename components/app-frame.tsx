import type { ReactNode } from 'react'
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native'

const DESIGN_W = 375
const DESIGN_H = 812

interface AppFrameProps {
  children: ReactNode
}

// Scales the 375×812 design canvas to fill whatever device screen the app is
// running on. Web keeps its centered 375×812 preview; native fills the whole
// screen and scales the design to match the actual device width, so a Samsung
// or Xiaomi renders the same layout as an iPhone 15 rather than a small
// window floating in the middle.
export default function AppFrame({ children }: AppFrameProps) {
  const { width, height } = useWindowDimensions()

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webWrap}>
        <View style={styles.webFrame}>{children}</View>
      </View>
    )
  }

  const scale = Math.min(width / DESIGN_W, height / DESIGN_H)
  const scaledW = DESIGN_W * scale
  const scaledH = DESIGN_H * scale
  const offsetX = (width - scaledW) / 2
  const offsetY = (height - scaledH) / 2

  return (
    <View style={styles.nativeWrap}>
      <View
        style={{
          position: 'absolute',
          left: offsetX,
          top: offsetY,
          width: DESIGN_W,
          height: DESIGN_H,
          transform: [
            { translateX: -DESIGN_W / 2 },
            { translateY: -DESIGN_H / 2 },
            { scale },
            { translateX: DESIGN_W / 2 },
            { translateY: DESIGN_H / 2 },
          ],
        }}
      >
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  webWrap: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webFrame: {
    width: DESIGN_W,
    height: DESIGN_H,
    backgroundColor: '#121212',
    overflow: 'hidden',
    position: 'relative',
  },
  nativeWrap: {
    flex: 1,
    backgroundColor: '#121212',
    overflow: 'hidden',
  },
})
