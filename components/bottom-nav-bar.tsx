import { Colors, Layout } from '@/constants/Colors'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Platform, Pressable, StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Circle, Defs, Line, LinearGradient, Rect, Stop, SvgXml } from 'react-native-svg'
import { NAV_SVG_ALERTS, NAV_SVG_CAMERAS, NAV_SVG_PROFILE, NAV_SVG_SEARCH } from './bottom-nav-svgs'

type TabKey = 'cameras' | 'alerts' | 'search' | 'profile'

interface BottomNavBarProps {
  activeTab: TabKey
}

const NAV_SVG: Record<TabKey, string> = {
  cameras: NAV_SVG_CAMERAS,
  alerts: NAV_SVG_ALERTS,
  search: NAV_SVG_SEARCH,
  profile: NAV_SVG_PROFILE,
}

const TAB_ROUTES: Record<TabKey, string> = {
  cameras: '/(main)/cameras',
  alerts: '/(main)/alerts',
  search: '/(main)/search',
  profile: '/(main)/profile',
}

const TABS: TabKey[] = ['cameras', 'alerts', 'search', 'profile']

const TAB_HIT_OFFSETS: Record<TabKey, number> = {
  cameras: 12,
  alerts: 97,
  search: 182,
  profile: 267,
}

const COLLAPSE_DURATION = 320
const COLLAPSED_PILL_SIZE = 87 // 63 white circle + 12 padding each side = full circle of nav-pill height

export default function BottomNavBar({ activeTab }: BottomNavBarProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const collapseProgress = useSharedValue(0)

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {})
  }

  const setCollapsedState = (next: boolean) => {
    setCollapsed(next)
    collapseProgress.value = withTiming(next ? 1 : 0, {
      duration: COLLAPSE_DURATION,
      easing: Easing.bezier(0.32, 0.72, 0, 1),
    })
  }

  const handleTabPress = (tab: TabKey) => {
    triggerHaptic()
    if (tab === activeTab) {
      setCollapsedState(!collapsed)
      return
    }
    router.replace(TAB_ROUTES[tab] as any)
  }

  const handleCollapsedPress = () => {
    triggerHaptic()
    setCollapsedState(false)
  }

  const expandedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(collapseProgress.value, [0, 0.45, 1], [1, 0, 0]),
    transform: [{ scale: interpolate(collapseProgress.value, [0, 1], [1, 0.95]) }],
  }))

  const collapsedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(collapseProgress.value, [0, 0.55, 1], [0, 0, 1]),
    transform: [{ scale: interpolate(collapseProgress.value, [0, 1], [0.7, 1]) }],
  }))

  // Collapsed pill anchors at the LEFT (cameras-tab) position regardless of active tab.
  const collapsedLeft = Layout.navPillLeft + TAB_HIT_OFFSETS.cameras

  return (
    <>
      {/* Expanded pill — full 343x87 with all 4 tabs (solid, matches Figma) */}
      <Animated.View
        style={[styles.pillContainer, expandedStyle]}
        pointerEvents={collapsed ? 'none' : 'box-none'}
      >
        <SvgXml
          xml={NAV_SVG[activeTab]}
          width={Layout.navPillWidth}
          height={Layout.navPillHeight}
        />
        <View style={styles.hitRow} pointerEvents="box-none">
          {TABS.map(tab => (
            <Pressable
              key={tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === activeTab }}
              accessibilityLabel={tab}
              onPress={() => handleTabPress(tab)}
              style={({ pressed }) => [
                styles.hitSlot,
                { left: TAB_HIT_OFFSETS[tab] },
                pressed && { opacity: 0.7 },
              ]}
            />
          ))}
        </View>
      </Animated.View>

      {/* Collapsed pill — 87x87 round, dark glassmorphism, white circle + hamburger */}
      <Animated.View
        style={[styles.collapsedPillContainer, { left: collapsedLeft }, collapsedStyle]}
        pointerEvents={collapsed ? 'auto' : 'none'}
      >
        <View style={styles.collapsedBlurWrap}>
          <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
        </View>
        <Svg
          width={COLLAPSED_PILL_SIZE}
          height={COLLAPSED_PILL_SIZE}
          viewBox="0 0 87 87"
          style={StyleSheet.absoluteFill}
        >
          <Defs>
            <LinearGradient
              id="collapsedRing"
              x1={-12.92}
              y1={-6.84}
              x2={-9.5}
              y2={36.1}
              gradientUnits="userSpaceOnUse"
            >
              <Stop stopColor="#707070" />
              <Stop offset={0.4183} stopColor="#707070" stopOpacity={0} />
              <Stop offset={0.6491} stopColor="#BFBFBF" stopOpacity={0.12} />
              <Stop offset={1} stopColor="#BFBFBF" />
            </LinearGradient>
          </Defs>
          {/* Dark round background — the "accordion grid" wrapping the white circle */}
          <Rect
            x={0.5}
            y={0.5}
            width={86}
            height={86}
            rx={43}
            fill="#1F1F1F"
            fillOpacity={0.8}
            stroke="url(#collapsedRing)"
            strokeWidth={1}
          />
          {/* White active circle */}
          <Circle cx={43.5} cy={43.5} r={31.5} fill={Colors.white} />
          {/* Hamburger icon (3 horizontal lines) */}
          <Line
            x1={31.5}
            y1={36.5}
            x2={55.5}
            y2={36.5}
            stroke={Colors.darkBackground}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
          <Line
            x1={31.5}
            y1={43.5}
            x2={55.5}
            y2={43.5}
            stroke={Colors.darkBackground}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
          <Line
            x1={31.5}
            y1={50.5}
            x2={55.5}
            y2={50.5}
            stroke={Colors.darkBackground}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
        </Svg>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Expand navigation"
          onPress={handleCollapsedPress}
          style={styles.collapsedHit}
        />
      </Animated.View>

      {/* Drawn-in iPhone home-indicator strip under the nav pill — web
          preview only. Real iOS / Android phones already render their own
          OS home bar, so this would double up on native. */}
      {Platform.OS === 'web' && (
        <View style={styles.homeIndicator} pointerEvents="none">
          <View style={styles.homeIndicatorBar} />
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  pillContainer: {
    position: 'absolute',
    top: Layout.navPillTop,
    left: Layout.navPillLeft,
    width: Layout.navPillWidth,
    height: Layout.navPillHeight,
  },
  hitRow: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    height: Layout.navCircleSize,
  },
  hitSlot: {
    position: 'absolute',
    top: 0,
    width: Layout.navCircleSize,
    height: Layout.navCircleSize,
    borderRadius: Layout.navCircleSize / 2,
  },
  collapsedPillContainer: {
    position: 'absolute',
    top: Layout.navPillTop,
    width: COLLAPSED_PILL_SIZE,
    height: COLLAPSED_PILL_SIZE,
  },
  collapsedBlurWrap: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: COLLAPSED_PILL_SIZE / 2,
    overflow: 'hidden',
  },
  collapsedHit: {
    width: COLLAPSED_PILL_SIZE,
    height: COLLAPSED_PILL_SIZE,
    borderRadius: COLLAPSED_PILL_SIZE / 2,
  },
  homeIndicator: {
    position: 'absolute',
    top: 777.5,
    left: 0,
    width: Layout.screenWidth,
    height: 34,
    backgroundColor: Colors.bg1,
  },
  homeIndicatorBar: {
    position: 'absolute',
    left: 121,
    top: 21,
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: Colors.white,
  },
})
