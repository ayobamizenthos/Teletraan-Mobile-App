import { useEffect } from 'react'
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import GlowBackground from '../components/glow-background'

const HOLD_MS = 2000
const FADE_MS = 400
const FADE_DELAY_MS = 120

const LOGO_W = 67.28
const LOGO_H = 78

export default function Splash() {
  const router = useRouter()
  const { width, height } = useWindowDimensions()

  const centerX = width / 2 - LOGO_W / 2
  const centerY = height / 2 - LOGO_H / 2

  const fade = useSharedValue(0)
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }))

  useEffect(() => {
    fade.value = withDelay(
      FADE_DELAY_MS,
      withTiming(1, { duration: FADE_MS, easing: Easing.out(Easing.quad) })
    )
    const t = setTimeout(() => router.replace('/(auth)/onboarding'), HOLD_MS)
    return () => clearTimeout(t)
  }, [router, fade])

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, fadeStyle]}>
        <GlowBackground variant="splash" />
      </Animated.View>

      <Image
        source={require('../assets/images/teletraan-logo.png')}
        style={[styles.logo, { left: centerX, top: centerY }]}
        contentFit="contain"
      />

      <Animated.Text style={[styles.brandName, { top: centerY + LOGO_H + 15 }, fadeStyle]}>
        TELETRAAN
      </Animated.Text>

      <Animated.View style={[styles.footer, fadeStyle]}>
        <Text style={styles.byText}>by</Text>
        <Image
          source={require('../assets/images/avzdax-wordmark.png')}
          style={styles.avzdaxWordmark}
          contentFit="contain"
        />
      </Animated.View>
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
