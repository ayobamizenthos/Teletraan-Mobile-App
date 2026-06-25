import { View, StyleSheet, Platform } from 'react-native'
import { Image } from 'expo-image'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  runOnJS,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated'
import Svg, { Circle } from 'react-native-svg'
import GlowBackground from '../../components/glow-background'

// Grey ring that rotates continuously — replaces the purple GIF on native.
// The web pass keeps the original GIF because mixBlendMode: luminosity there
// already strips its colour to grey.
function NativeSpinner() {
  const angle = useSharedValue(0)
  useEffect(() => {
    angle.value = withRepeat(withTiming(360, { duration: 1000, easing: Easing.linear }), -1, false)
    return () => cancelAnimation(angle)
  }, [angle])
  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${angle.value}deg` }],
  }))
  return (
    <Animated.View style={[styles.spinner, spinStyle]}>
      <Svg width={150} height={150} viewBox="0 0 50 50">
        <Circle cx={25} cy={25} r={20} stroke="#3D3D3D" strokeWidth={4} fill="none" />
        <Circle
          cx={25}
          cy={25}
          r={20}
          stroke="#BFBFBF"
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 20 * 0.25} ${2 * Math.PI * 20}`}
        />
      </Svg>
    </Animated.View>
  )
}

// Component 31 cycles 4 states in order. Progress bar is desktop-only — not here.

const LOADING_MESSAGES = [
  'Loading Account Info',
  'Loading Camera',
  'Loading Alert Info',
  'Connecting Cameras',
]

export default function LoadingScreen() {
  const router = useRouter()
  // Optional `?next=` override lets other flows (e.g. "Watch Live Feed" from
  // an alert) route through this loading screen and pick their own destination.
  const { next } = useLocalSearchParams<{ next?: string }>()
  const [messageIndex, setMessageIndex] = useState(0)

  const textOpacity = useSharedValue(1)

  const cycleMessage = () => {
    setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length)
  }

  useEffect(() => {
    const messageTimer = setInterval(() => {
      textOpacity.value = withTiming(0, { duration: 120 }, () => {
        runOnJS(cycleMessage)()
        textOpacity.value = withTiming(1, { duration: 120 })
      })
    }, 900)

    const navTimer = setTimeout(() => {
      router.replace((next || '/(main)/cameras') as any)
    }, 4800)

    return () => {
      cancelAnimation(textOpacity)
      clearInterval(messageTimer)
      clearTimeout(navTimer)
    }
    // `router` is stable across renders, `next` is read once on mount, and
    // `textOpacity` is a Reanimated shared value (also stable). Re-running
    // the effect on those changes would restart the timers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }))

  return (
    <View style={styles.container}>
      <GlowBackground variant="top" />

      {Platform.OS === 'web' ? (
        // Web: keep the original GIF; mixBlendMode: luminosity strips its hue
        // so the source renders as the grey ring in the design.
        <Image
          source={require('../../assets/images/loading-spinner.gif')}
          style={[styles.spinner, { mixBlendMode: 'luminosity' } as any]}
          contentFit="contain"
        />
      ) : (
        // Native platforms don't support mixBlendMode, and the GIF's baked-in
        // hue would show as purple. Render the SVG spinner instead.
        <NativeSpinner />
      )}

      <Animated.Text style={[styles.loadingText, textStyle]}>
        {LOADING_MESSAGES[messageIndex]}
      </Animated.Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 375,
    height: 812,
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: '#121212',
  },
  spinner: {
    position: 'absolute',
    left: 105.5,
    top: 253,
    width: 150,
    height: 150,
  },
  loadingText: {
    position: 'absolute',
    left: 8,
    top: 419,
    width: 345,
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 19.2,
    textAlign: 'center',
    fontFamily: 'Lato_400Regular',
  },
})
