import { useEffect, useState } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import GlowBackground from '../components/glow-background'

const HOLD_MS = 2000
// Text appears this long after the logo — matched to the earlier fade timing
// but implemented with a plain JS setTimeout instead of a Reanimated fade, so
// worklet cold-start warmup can't push it past the HOLD_MS deadline.
const TEXT_DELAY_MS = 500

const DESIGN_W = 375
const LOGO_W = 78
const LOGO_H = 90
const LOGO_TOP = 227

export default function Splash() {
  const router = useRouter()
  const [showText, setShowText] = useState(false)

  const centerX = DESIGN_W / 2 - LOGO_W / 2
  const centerY = LOGO_TOP

  useEffect(() => {
    const textTimer = setTimeout(() => setShowText(true), TEXT_DELAY_MS)
    const navTimer = setTimeout(() => router.replace('/(auth)/onboarding'), HOLD_MS)
    return () => {
      clearTimeout(textTimer)
      clearTimeout(navTimer)
    }
  }, [router])

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <GlowBackground variant="splash" />
      </View>

      <Image
        source={require('../assets/images/teletraan-logo.png')}
        style={[styles.logo, { left: centerX, top: centerY }]}
        contentFit="contain"
      />

      {showText && (
        <>
          <Text style={[styles.brandName, { top: centerY + LOGO_H + 15 }]}>TELETRAAN</Text>
          <View style={styles.footer}>
            <Text style={styles.byText}>by</Text>
            <Image
              source={require('../assets/images/avzdax-wordmark.png')}
              style={styles.avzdaxWordmark}
              contentFit="contain"
            />
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#121212',
  },
  logo: {
    position: 'absolute',
    width: LOGO_W,
    height: LOGO_H,
  },
  brandName: {
    position: 'absolute',
    left: 0,
    right: 0,
    color: '#F2F4F6',
    fontSize: 33.3466,
    lineHeight: 49.3863,
    textAlign: 'center',
    fontFamily: 'SpaceMono_400Regular',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  byText: {
    color: '#FFFFFF',
    fontSize: 14.6662,
    lineHeight: 17.5995,
    fontFamily: 'Lato_400Regular',
  },
  avzdaxWordmark: {
    width: 150.33,
    height: 47.6652,
  },
})
