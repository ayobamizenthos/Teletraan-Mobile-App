import { View, StyleSheet, Platform } from 'react-native'
import { Image } from 'expo-image'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated'
import GlowBackground from '../../components/glow-background'

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

      {/* Luminosity blend strips the GIF's source hue so it renders as a clean
          gray/white spinner against the dark backdrop. */}
      <Image
        source={require('../../assets/images/loading-spinner.gif')}
        style={[
          styles.spinner,
          Platform.OS === 'web' ? ({ mixBlendMode: 'luminosity' } as any) : null,
        ]}
        contentFit="contain"
      />

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
