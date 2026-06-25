import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'
import Svg, { Path, Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg'
import { useRouter, useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'
import { impactHaptic } from '../../lib/haptics'
import GlowBackground from '../../components/glow-background'

const STEP_MS = 2000

// Welcome ellipse center (-44.5, 399) → sign-in top ellipse center (162, -19).
// Translate delta: (+206.5, -418) — the glow slides up-right when Get Started is pressed.
const GLOW_TARGET_X = 206.5
const GLOW_TARGET_Y = -418
const GLOW_ANIM_MS = 420

const BADGES = [
  { id: 'monitor', label: 'Monitor', x: 97, y: 158, w: 99, h: 34 },
  { id: 'respond', label: 'Respond', x: 153, y: 217, w: 99, h: 34 },
  { id: 'stay-ahead', label: 'Stay Ahead', x: 97, y: 276, w: 99, h: 34 },
] as const

const BADGE_GRADIENTS = [
  { id: 'bg0', x1: 101.533, y1: 157.728, x2: 103.753, y2: 194.576 },
  { id: 'bg2', x1: 157.533, y1: 216.728, x2: 159.753, y2: 253.576 },
  { id: 'bg1', x1: 101.283, y1: 275.728, x2: 103.503, y2: 312.576 },
]

function NetworkLayer() {
  return (
    <Svg width={375} height={812} style={styles.networkSvg}>
      <Defs>
        {BADGE_GRADIENTS.map(g => (
          <SvgLinearGradient
            key={g.id}
            id={g.id}
            x1={g.x1}
            y1={g.y1}
            x2={g.x2}
            y2={g.y2}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#707070" />
            <Stop offset="0.418259" stopColor="#707070" stopOpacity="0" />
            <Stop offset="0.649108" stopColor="#E4E7EC" stopOpacity="0.12" />
            <Stop offset="1" stopColor="#E4E7EC" />
          </SvgLinearGradient>
        ))}
      </Defs>

      {/* ── Static dashed network lines (don't fade) ──
         Lines that fade with their badge are rendered separately via FadingLine.
         Static here: Stay Ahead LEFT line, Monitor RIGHT line, camera-to-Monitor slant. */}
      <Path
        d="M-93 320.5L23.5 320.5L51.5 292.5H111"
        stroke="#A3A3A3"
        strokeDasharray="10 10"
        fill="none"
      />
      <Path d="M203 175H385" stroke="#A3A3A3" strokeDasharray="10 10" fill="none" />
      <Path d="M-34.5 95L146.732 130.5V158" stroke="#A3A3A3" strokeDasharray="10 10" fill="none" />

      {/* ── Camera body ── */}
      <Path
        d="M10.6358 91.4321L39.9558 100.372C42.6258 101.182 44.1358 104.012 43.3158 106.682L40.6758 115.342C40.2658 116.682 38.8558 117.432 37.5158 117.022L3.35579 106.612C2.01579 106.202 1.26579 104.792 1.67579 103.452L4.31578 94.7921C5.13578 92.1221 7.95578 90.6221 10.6358 91.4321Z"
        fill="#E4E7EC"
      />
      <Path
        d="M47.2064 98.3921C49.1064 98.9721 49.6264 101.412 48.1364 102.712L40.1064 109.732C39.4464 110.302 38.5364 110.502 37.7064 110.252L2.79635 99.6121C1.45635 99.2021 0.706352 97.7921 1.11635 96.4521L3.75635 87.7921C4.16635 86.4521 5.57635 85.7021 6.91635 86.1121L47.2064 98.3921Z"
        fill="#A3A3A3"
      />
      <Path
        d="M9.78516 93.5621C8.95673 93.5621 8.28516 92.8905 8.28516 92.0621C8.28516 91.2336 8.95673 90.5621 9.78516 90.5621C10.6136 90.5621 11.2852 91.2336 11.2852 92.0621C11.2852 92.8905 10.6136 93.5621 9.78516 93.5621Z"
        fill="white"
      />
      <Path
        d="M43.0546 105.991L45.0156 106.589L42.7711 113.955L40.81 113.357L43.0546 105.991Z"
        fill="#A3A3A3"
      />
      <Path
        d="M45.7149 105.812L47.1549 106.252C47.4849 106.352 47.6749 106.712 47.5749 107.042L45.1449 115.002C45.0449 115.332 44.6849 115.522 44.3549 115.422L42.9149 114.982C42.5849 114.882 42.3949 114.522 42.4949 114.192L44.9249 106.232C45.0249 105.892 45.3749 105.712 45.7149 105.812Z"
        fill="#E4E7EC"
      />
      <Path
        d="M15.3281 119.722C15.8781 119.722 16.3281 119.272 16.3281 118.722V112.022H20.3281V119.722C20.3281 121.932 18.5381 123.722 16.3281 123.722H5.04812V119.722H15.3281Z"
        fill="#A3A3A3"
      />
      <Path
        d="M4.04688 112.722C5.14688 112.722 6.04688 113.622 6.04688 114.722V128.732C6.04688 129.832 5.14688 130.732 4.04688 130.732H0.996876V112.722H4.04688Z"
        fill="#707070"
      />
      <Path
        d="M18.3281 115.702C15.5667 115.702 13.3281 113.463 13.3281 110.702C13.3281 107.941 15.5667 105.702 18.3281 105.702C21.0895 105.702 23.3281 107.941 23.3281 110.702C23.3281 113.463 21.0895 115.702 18.3281 115.702Z"
        fill="#707070"
      />
      <Path
        d="M18.3281 112.702C17.2236 112.702 16.3281 111.807 16.3281 110.702C16.3281 109.597 17.2236 108.702 18.3281 108.702C19.4327 108.702 20.3281 109.597 20.3281 110.702C20.3281 111.807 19.4327 112.702 18.3281 112.702Z"
        fill="white"
      />

      {/* ── Badge backgrounds + gradient borders ── */}
      <Rect x={97.1} y={158.1} width={98.8} height={33.8} fill="#1F1F1F" />
      <Rect
        x={97.1}
        y={158.1}
        width={98.8}
        height={33.8}
        stroke="url(#bg0)"
        strokeWidth={0.2}
        fill="none"
      />

      <Rect x={153.1} y={217.1} width={98.8} height={33.8} fill="#1F1F1F" />
      <Rect
        x={153.1}
        y={217.1}
        width={98.8}
        height={33.8}
        stroke="url(#bg2)"
        strokeWidth={0.2}
        fill="none"
      />

      <Rect x={96.85} y={276.1} width={98.8} height={33.8} fill="#1F1F1F" />
      <Rect
        x={96.85}
        y={276.1}
        width={98.8}
        height={33.8}
        stroke="url(#bg1)"
        strokeWidth={0.2}
        fill="none"
      />
    </Svg>
  )
}

function BadgeLabel({
  label,
  x,
  y,
  w,
  h,
  isFaded,
}: {
  label: string
  x: number
  y: number
  w: number
  h: number
  isFaded: boolean
}) {
  const dimOpacity = useSharedValue(0)

  useEffect(() => {
    dimOpacity.value = withTiming(isFaded ? 0.78 : 0, { duration: STEP_MS })
  }, [isFaded, dimOpacity])

  const overlayStyle = useAnimatedStyle(() => ({ opacity: dimOpacity.value }))

  return (
    <View style={[styles.badgeLabel, { left: x, top: y, width: w, height: h }]}>
      <Text style={styles.badgeText}>{label}</Text>
      <Animated.View style={[StyleSheet.absoluteFill, styles.badgeDimOverlay, overlayStyle]} />
    </View>
  )
}

// Dashed connector line that fades together with its badge.
// At rest opacity=1, when its badge fades opacity drops to 0.22 (matches the badge's 0.78 dim).
function FadingLine({ d, isFaded }: { d: string; isFaded: boolean }) {
  const opacity = useSharedValue(1)

  useEffect(() => {
    opacity.value = withTiming(isFaded ? 0.22 : 1, { duration: STEP_MS })
  }, [isFaded, opacity])

  const wrapStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View style={[StyleSheet.absoluteFill, wrapStyle, styles.fadingLineWrap]}>
      <Svg width={375} height={812}>
        <Path d={d} stroke="#A3A3A3" strokeDasharray="10 10" fill="none" />
      </Svg>
    </Animated.View>
  )
}

const MONITOR_LEFT_LINE = 'M-93 203H23.5L51.5 175H111'
const RESPOND_RIGHT_LINE = 'M484 261.5L367.5 261.5L339.5 233.5L229.5 233.5'
const STAY_AHEAD_RIGHT_LINE = 'M378.5 345H147.998V310'

export default function OnboardingScreen() {
  const router = useRouter()
  const [fadedIndex, setFadedIndex] = useState(-1)

  // Glow transition state — welcome glow slides+fades, top glow fades in simultaneously
  const slideX = useSharedValue(0)
  const slideY = useSharedValue(0)
  const welcomeAlpha = useSharedValue(1)
  const topAlpha = useSharedValue(0)

  const welcomeGlowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }, { translateY: slideY.value }],
    opacity: welcomeAlpha.value,
  }))
  const topGlowStyle = useAnimatedStyle(() => ({ opacity: topAlpha.value }))

  // When this screen regains focus (initial mount OR returning via back from sign-in),
  // reset glow state to the initial welcome-visible/top-hidden position. This is what
  // makes the back animation in sign-in look seamless — sign-in fades its top glow OUT
  // and welcome glow IN, then by the time we land here, this screen already matches.
  useFocusEffect(
    useCallback(() => {
      slideX.value = 0
      slideY.value = 0
      welcomeAlpha.value = 1
      topAlpha.value = 0
    }, [slideX, slideY, welcomeAlpha, topAlpha])
  )

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    let step = 0

    const timer = setTimeout(() => {
      setFadedIndex(0)
      step = 1
      interval = setInterval(() => {
        if (step >= 3) {
          setFadedIndex(-1)
          step = 0
        } else {
          setFadedIndex(step)
          step++
        }
      }, STEP_MS + 500)
    }, 1500)

    return () => {
      clearTimeout(timer)
      if (interval) clearInterval(interval)
    }
  }, [])

  const navigateToSignIn = () => router.push('/(auth)/sign-in')

  const handleGetStarted = () => {
    impactHaptic()
    slideX.value = withTiming(GLOW_TARGET_X, { duration: GLOW_ANIM_MS })
    slideY.value = withTiming(GLOW_TARGET_Y, { duration: GLOW_ANIM_MS })
    welcomeAlpha.value = withTiming(0, { duration: GLOW_ANIM_MS })
    topAlpha.value = withTiming(1, { duration: GLOW_ANIM_MS }, () => {
      runOnJS(navigateToSignIn)()
    })
  }

  return (
    <View style={styles.container}>
      {/* Welcome glow — slides up-right and fades out on Get Started */}
      <Animated.View style={[StyleSheet.absoluteFill, welcomeGlowStyle, styles.fadingLineWrap]}>
        <GlowBackground variant="welcome" />
      </Animated.View>
      {/* Sign-in top glow — fades in to match the sign-in screen seamlessly */}
      <Animated.View style={[StyleSheet.absoluteFill, topGlowStyle, styles.fadingLineWrap]}>
        <GlowBackground variant="top" />
      </Animated.View>

      {/* Connecting dashed lines that fade with their badge — render BEFORE NetworkLayer
         so the badge fill rects (inside NetworkLayer) cover the line endpoints cleanly. */}
      <FadingLine d={MONITOR_LEFT_LINE} isFaded={fadedIndex === 0} />
      <FadingLine d={RESPOND_RIGHT_LINE} isFaded={fadedIndex === 1} />
      <FadingLine d={STAY_AHEAD_RIGHT_LINE} isFaded={fadedIndex === 2} />

      <NetworkLayer />

      {BADGES.map((badge, i) => (
        <BadgeLabel
          key={badge.id}
          label={badge.label}
          x={badge.x}
          y={badge.y}
          w={badge.w}
          h={badge.h}
          isFaded={fadedIndex === i}
        />
      ))}

      <Text style={styles.welcomeTitle}>Welcome to Teletraan Mobile</Text>
      <Text style={styles.welcomeSubtitle}>
        {'Stay connected to your sites, get real-time alerts, and\nact faster , wherever you are.'}
      </Text>

      <Pressable
        style={({ pressed }) => [styles.getStartedBtn, pressed && { opacity: 0.85 }]}
        onPress={handleGetStarted}
      >
        <Text style={styles.getStartedText}>Get Started</Text>
      </Pressable>

      {/* Drawn-in home indicator — web preview only. Real phones show their
          own OS home bar, so this would double up on native. */}
      {Platform.OS === 'web' && (
        <View style={styles.homeIndicator}>
          <View style={styles.homeBar} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    width: 375,
    height: 812,
    alignSelf: 'center',
    overflow: 'hidden',
  },

  networkSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  badgeLabel: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  badgeText: {
    color: '#E4E7EC',
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },
  badgeDimOverlay: {
    backgroundColor: '#121212',
  },
  fadingLineWrap: {
    pointerEvents: 'none',
  },

  welcomeTitle: {
    position: 'absolute',
    left: 27,
    top: 510,
    width: 325,
    height: 24,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
    textAlign: 'center',
  },
  welcomeSubtitle: {
    position: 'absolute',
    left: 27,
    top: 550,
    width: 325,
    color: '#BFBFBF',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },

  getStartedBtn: {
    position: 'absolute',
    left: 83,
    top: 624,
    width: 214,
    height: 40,
    backgroundColor: '#A3A3A3',
    // #707070 inner-shadow emboss (positive offset 4,4) + light drop shadow.
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: '#242424',
    borderBottomColor: '#242424',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: 'inset 4px 4px 4px 0 rgba(112,112,112,1), 0 0 5px 0 rgba(163,163,163,0.5)',
      } as any,
      ios: {
        shadowColor: '#A3A3A3',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
      },
      android: { elevation: 4 },
    }),
  },
  getStartedText: {
    color: '#262626',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },

  homeIndicator: {
    position: 'absolute',
    left: 0,
    top: 778,
    width: 375,
    height: 34,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBar: {
    position: 'absolute',
    left: 121,
    top: 21,
    width: 134,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
})
