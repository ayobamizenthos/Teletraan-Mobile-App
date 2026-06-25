import { useState, useRef } from 'react'
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native'
import { Image } from 'expo-image'
import { useRouter, useLocalSearchParams } from 'expo-router'
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { GradientStrokeBox } from '../../components/gradient-stroke-box'
import SnapshotModal from '../../components/snapshot-modal'
import { tapHaptic, impactHaptic } from '../../lib/haptics'
import { CAMERA_FEEDS, type CameraFeed } from '../../lib/data/cameras'
import { INCIDENTS } from '../../lib/data/alerts'

// Three-step zoom cycle (1x → 1.5x → 2x → back to 1x). Mirrors how most
// security-camera apps step zoom so a single button cycles all the levels.
const ZOOM_STEPS = [1, 1.5, 2] as const
const ZOOM_LABELS = ['1×', '1.5×', '2×'] as const

function BackArrowIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path
        d="M14 6.11616V7.88384H3.39394L8.25505 12.7449L7 14L0 7L7 0L8.25505 1.25505L3.39394 6.11616H14Z"
        fill="#FFFFFF"
      />
    </Svg>
  )
}

function ZoomIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 15 15" fill="none">
      <Path
        d="M6.72222 12.9444C10.1587 12.9444 12.9444 10.1587 12.9444 6.72222C12.9444 3.28578 10.1587 0.5 6.72222 0.5C3.28578 0.5 0.5 3.28578 0.5 6.72222C0.5 10.1587 3.28578 12.9444 6.72222 12.9444Z"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.5017 14.5L11.1184 11.1167M6.72396 4.38892V9.05558M4.39062 6.72225H9.05729"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function SnapshotIcon() {
  return (
    <Svg width={14} height={12} viewBox="0 0 14 12" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 3.5C5.5475 3.5 4.375 4.6725 4.375 6.125C4.375 7.5775 5.5475 8.75 7 8.75C8.4525 8.75 9.625 7.5775 9.625 6.125C9.625 4.6725 8.4525 3.5 7 3.5ZM5.25 6.125C5.24988 5.66076 5.43419 5.21548 5.76238 4.88713C6.09057 4.55877 6.53576 4.37424 7 4.37413C7.46424 4.37401 7.90952 4.55832 8.23787 4.88651C8.56623 5.2147 8.75076 5.65988 8.75088 6.12413C8.75093 6.354 8.70571 6.58163 8.6178 6.79402C8.52988 7.00642 8.401 7.19942 8.23849 7.362C8.07599 7.52458 7.88306 7.65357 7.67071 7.74159C7.45835 7.82961 7.23075 7.87494 7.00088 7.875C6.771 7.87506 6.54337 7.82984 6.33098 7.74192C6.11858 7.65401 5.92558 7.52512 5.763 7.36262C5.43465 7.03443 5.25012 6.58924 5.25 6.125Z"
        fill="#FFFFFF"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.9 0.175C4.94075 0.120664 4.9936 0.0765627 5.05434 0.0461881C5.11509 0.0158134 5.18208 0 5.25 0H9.1875C9.25542 0 9.32241 0.0158134 9.38316 0.0461881C9.44391 0.0765627 9.49675 0.120664 9.5375 0.175L10.7188 1.75H11.8125C12.3927 1.75 12.9491 1.98047 13.3593 2.3907C13.7695 2.80094 14 3.35734 14 3.9375V9.1875C14 9.76766 13.7695 10.3241 13.3593 10.7343C12.9491 11.1445 12.3927 11.375 11.8125 11.375H2.1875C1.60734 11.375 1.05094 11.1445 0.640704 10.7343C0.230468 10.3241 0 9.76766 0 9.1875L0 3.9375C0 3.35734 0.230468 2.80094 0.640704 2.3907C1.05094 1.98047 1.60734 1.75 2.1875 1.75H3.71875L4.9 0.175ZM5.46875 0.875L4.2875 2.45C4.24675 2.50434 4.1939 2.54844 4.13316 2.57881C4.07241 2.60919 4.00542 2.625 3.9375 2.625H2.1875C1.8394 2.625 1.50556 2.76328 1.25942 3.00942C1.01328 3.25556 0.875 3.5894 0.875 3.9375V9.1875C0.875 9.5356 1.01328 9.86944 1.25942 10.1156C1.50556 10.3617 1.8394 10.5 2.1875 10.5H11.8125C12.1606 10.5 12.4944 10.3617 12.7406 10.1156C12.9867 9.86944 13.125 9.5356 13.125 9.1875V3.9375C13.125 3.5894 12.9867 3.25556 12.7406 3.00942C12.4944 2.76328 12.1606 2.625 11.8125 2.625H10.5C10.4321 2.625 10.3651 2.60919 10.3043 2.57881C10.2436 2.54844 10.1908 2.50434 10.15 2.45L8.96875 0.875H5.46875Z"
        fill="#FFFFFF"
      />
    </Svg>
  )
}

// Speaker + sound waves — rendered when audio is ON (toggle's default state).
function SoundOnIcon() {
  return (
    <Svg width={15} height={12} viewBox="0 0 15 12" fill="none">
      <Path
        d="M0.5 6.86353V4.50008C0.5 4.16253 0.634091 3.83881 0.872773 3.60012C1.11146 3.36144 1.43518 3.22735 1.77273 3.22735H3.61818C3.7426 3.22732 3.86429 3.19081 3.96818 3.12235L7.78636 0.604895C7.8823 0.541718 7.99354 0.505685 8.1083 0.500619C8.22306 0.495553 8.33704 0.521644 8.43817 0.576122C8.5393 0.6306 8.6238 0.711436 8.6827 0.810053C8.7416 0.90867 8.77271 1.02139 8.77273 1.13626V10.2274C8.77271 10.3422 8.7416 10.4549 8.6827 10.5536C8.6238 10.6522 8.5393 10.733 8.43817 10.7875C8.33704 10.842 8.22306 10.8681 8.1083 10.863C7.99354 10.8579 7.8823 10.8219 7.78636 10.7587L3.96818 8.24126C3.86429 8.1728 3.7426 8.13629 3.61818 8.13626H1.77273C1.43518 8.13626 1.11146 8.00217 0.872773 7.76349C0.634091 7.5248 0.5 7.20108 0.5 6.86353Z"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11 2.81815C11 2.81815 11.9545 3.77269 11.9545 5.3636C11.9545 6.95451 11 7.90906 11 7.90906M12.9091 0.909058C12.9091 0.909058 14.5 2.49997 14.5 5.3636C14.5 8.22724 12.9091 9.81815 12.9091 9.81815"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

// Speaker + diagonal slash — rendered when audio is muted.
function SoundOffIcon() {
  return (
    <Svg width={15} height={12} viewBox="0 0 15 12" fill="none">
      <Path
        d="M0.5 6.86353V4.50008C0.5 4.16253 0.634091 3.83881 0.872773 3.60012C1.11146 3.36144 1.43518 3.22735 1.77273 3.22735H3.61818C3.7426 3.22732 3.86429 3.19081 3.96818 3.12235L7.78636 0.604895C7.8823 0.541718 7.99354 0.505685 8.1083 0.500619C8.22306 0.495553 8.33704 0.521644 8.43817 0.576122C8.5393 0.6306 8.6238 0.711436 8.6827 0.810053C8.7416 0.90867 8.77271 1.02139 8.77273 1.13626V10.2274C8.77271 10.3422 8.7416 10.4549 8.6827 10.5536C8.6238 10.6522 8.5393 10.733 8.43817 10.7875C8.33704 10.842 8.22306 10.8681 8.1083 10.863C7.99354 10.8579 7.8823 10.8219 7.78636 10.7587L3.96818 8.24126C3.86429 8.1728 3.7426 8.13629 3.61818 8.13626H1.77273C1.43518 8.13626 1.11146 8.00217 0.872773 7.76349C0.634091 7.5248 0.5 7.20108 0.5 6.86353Z"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Crossed X over the wave area to show audio is off */}
      <Path
        d="M10.5 3.5L14 7M14 3.5L10.5 7"
        stroke="#F04438"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </Svg>
  )
}

// within the group, so when the circle is half-clipped on the right edge, the chevron lands in the visible portion.
function CarouselArrowSvg() {
  return (
    <Svg width={100} height={100} viewBox="0 0 100 100" fill="none">
      <SvgCircle cx={50} cy={50} r={50} fill="#1F1F1F" />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23.6819 50.7777L17.5362 57L16 55.4447L21.3777 50L16 44.5553L17.5362 43L23.6819 49.2223C23.8856 49.4286 24 49.7083 24 50C24 50.2917 23.8856 50.5714 23.6819 50.7777Z"
        fill="#E4E7EC"
      />
    </Svg>
  )
}

function WarningIcon() {
  return (
    <Svg width={14} height={13} viewBox="0 0 14 13" fill="none">
      <Path
        d="M7 5.13V7.87M0.22 10.32C-0.41 11.42 0.38 12.78 1.64 12.78H12.36C13.62 12.78 14.41 11.42 13.78 10.32L8.42 1.04C7.79 -0.05 6.21 -0.05 5.58 1.04L0.22 10.32ZM7 10.05H7.01V10.06H7V10.05Z"
        stroke="#A3A3A3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

// External-link arrow on "View Details ↗" — small diagonal arrow
function ExternalLinkIcon() {
  return (
    <Svg width={10} height={10} viewBox="0 0 10 10" fill="none">
      <Path
        d="M3 1H9V7M9 1L1 9"
        stroke="#A3A3A3"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

// Empty document icon for the "No Alerts yet" state when a camera has no
// alerts (or is offline). 48 × 60 muted-grey, matches the Figma Frame 523 art.
function EmptyDocIcon() {
  return (
    <Svg width={48} height={60} viewBox="0 0 48 60" fill="none">
      <Path
        d="M6 4C6 1.79086 7.79086 0 10 0H30L42 12V56C42 58.2091 40.2091 60 38 60H10C7.79086 60 6 58.2091 6 56V4Z"
        stroke="#A3A3A3"
        strokeWidth={2}
        fill="none"
      />
      <Path d="M30 0V12H42" stroke="#A3A3A3" strokeWidth={2} fill="none" />
      <Path
        d="M14 24H34M14 32H34M14 40H26"
        stroke="#A3A3A3"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  )
}

// ─── data ────────────────────────────────────────────────────────────────────

// Local CAMERAS retained ONLY as a fallback when callers don't pass a
// filteredIds list. The pager's actual contents are built at render time
// against the canonical CAMERA_FEEDS list so filters from the quad/single
// views propagate here.
// Map the canonical CameraFeed → the shape this screen renders. Done once
// at module level so the projection is stable across renders.
type PagerCamera = {
  id: string
  name: string
  subtitle: string
  image: number
  isOnline: boolean
}
const toPagerCamera = (c: CameraFeed): PagerCamera => ({
  id: c.id,
  name: c.name,
  subtitle: c.location,
  image: c.thumbnail,
  isOnline: c.isOnline,
})

export default function FullscreenCameraScreen() {
  const router = useRouter()
  const { cameraId, cameraName, filteredIds } = useLocalSearchParams<{
    cameraId?: string
    cameraName?: string
    filteredIds?: string
  }>()

  // The pager's contents:
  //   • filteredIds present → only those cameras from CAMERA_FEEDS (same order)
  //   • otherwise → all 12 cameras from CAMERA_FEEDS
  // Single source of truth: every camera screen reads from CAMERA_FEEDS so
  // the name/location/thumbnail/online state shown here is identical to what
  // the user just tapped on the quad-grid / single-cam page.
  const pagerCameras: PagerCamera[] = (() => {
    if (filteredIds && filteredIds.length > 0) {
      const ids = filteredIds.split(',').filter(Boolean)
      const byId = new Map(CAMERA_FEEDS.map(c => [c.id, c]))
      const picked = ids.map(id => byId.get(id)).filter(Boolean) as CameraFeed[]
      if (picked.length > 0) return picked.map(toPagerCamera)
    }
    return CAMERA_FEEDS.map(toPagerCamera)
  })()
  const canSwipe = pagerCameras.length > 1

  // Initial camera index — locate the tapped camera within the (possibly
  // filtered) pager list.
  const initialIdx = (() => {
    if (cameraId) {
      const i = pagerCameras.findIndex(c => c.id === cameraId)
      if (i >= 0) return i
    }
    return 0
  })()
  const [activeIdx, setActiveIdx] = useState(initialIdx)
  const current = (() => {
    const cam = pagerCameras[activeIdx] ?? pagerCameras[0]
    return {
      id: cam.id,
      // Tab-passed cameraName only ever describes the camera the user
      // originally tapped; for swiped pages we use the camera's own name.
      name: activeIdx === initialIdx ? (cameraName ?? cam.name) : cam.name,
      subtitle: cam.subtitle,
      image: cam.image,
      isOnline: cam.isOnline,
    }
  })()

  // Horizontal pager — one page per camera. Width matches the feed frame.
  const feedScrollRef = useRef<ScrollView>(null)
  const FEED_W = 343
  const onFeedScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / FEED_W)
    if (page !== activeIdx && page >= 0 && page < pagerCameras.length) {
      setActiveIdx(page)
      // Reset zoom when swiping to a new camera so each page starts at 1x.
      scale.value = withSpring(1)
      indicatorOpacity.value = withTiming(0, { duration: 120 })
      setZoomStep(0)
    }
  }

  const goNext = () => {
    if (!canSwipe) return
    const next = (activeIdx + 1) % pagerCameras.length
    feedScrollRef.current?.scrollTo({ x: next * FEED_W, animated: true })
  }

  // Zoom cycle state — index into ZOOM_STEPS. The shared value drives the
  // feed image scale via Reanimated so the transition stays on the UI thread.
  const [zoomStep, setZoomStep] = useState(0)
  const scale = useSharedValue(1)
  const indicatorOpacity = useSharedValue(0)
  const feedAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))
  const indicatorAnimStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
  }))

  // Audio mute toggle — flips between SoundOnIcon and SoundOffIcon.
  const [muted, setMuted] = useState(false)
  const toggleMute = () => {
    tapHaptic()
    setMuted(m => !m)
    // Real audio mute would hook the camera stream here.
  }

  // Snapshot modal — shows the Figma "Snapshot" popup.
  const [snapshotOpen, setSnapshotOpen] = useState(false)
  const openSnapshot = () => {
    impactHaptic()
    setSnapshotOpen(true)
  }

  const cycleZoom = () => {
    const next = (zoomStep + 1) % ZOOM_STEPS.length
    setZoomStep(next)
    // Lighter haptic at zoom-in, stronger thump when snapping back to 1×.
    if (next === 0) impactHaptic()
    else tapHaptic()
    scale.value = withSpring(ZOOM_STEPS[next], {
      mass: 1,
      stiffness: 140,
      damping: 16,
    })
    indicatorOpacity.value = withTiming(next === 0 ? 0 : 1, { duration: 180 })
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            onPress={() => {
              tapHaptic()
              if (router.canGoBack()) router.back()
              else router.replace('/(main)/cameras')
            }}
          >
            <BackArrowIcon />
            <GradientStrokeBox width={40} height={40} rx={2} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {current.name}
          </Text>
          {current.isOnline ? (
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          ) : (
            <View style={styles.offlinePill}>
              <View style={styles.offlineDot} />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          )}
        </View>

        <View style={styles.feedContainer}>
          {/* Horizontal pager — one page per camera. Swipe left/right to
              flip between feeds; the right-arrow button scrolls to next. */}
          <ScrollView
            ref={feedScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onFeedScroll}
            onMomentumScrollEnd={onFeedScroll}
            scrollEventThrottle={16}
            contentOffset={{ x: initialIdx * FEED_W, y: 0 }}
            decelerationRate="fast"
            snapToInterval={FEED_W}
            snapToAlignment="start"
            scrollEnabled={canSwipe}
            style={styles.feedPager}
          >
            {pagerCameras.map(cam => (
              <View key={cam.id} style={styles.feedPage}>
                {/* feedAnimStyle is applied to EVERY page, not just the active
                    one. useAnimatedStyle binds to a single host node — toggling
                    it on/off with `idx === activeIdx` made Reanimated keep
                    updating the original mount only, which is why pages 2+
                    refused to zoom on web. Inactive pages scale invisibly
                    behind the active one (each page has overflow:hidden). */}
                <Animated.View style={[styles.feedImageWrapper, feedAnimStyle]}>
                  <Image source={cam.image} style={styles.feedImage} contentFit="cover" />
                </Animated.View>
              </View>
            ))}
          </ScrollView>

          {/* Zoom-level chip — fades in only when zoom > 1×. Sits above the
              zoom button so the user always sees where they are in the cycle. */}
          <Animated.View style={[styles.zoomLevelChip, indicatorAnimStyle]} pointerEvents="none">
            <Text style={styles.zoomLevelChipText}>{ZOOM_LABELS[zoomStep]}</Text>
          </Animated.View>

          {/* Zoom button — cycles 1× → 1.5× → 2× → 1×. Glass tile look. */}
          <Pressable
            style={({ pressed }) => [styles.zoomBtn, pressed && { opacity: 0.7 }]}
            onPress={cycleZoom}
            hitSlop={6}
          >
            <View style={styles.zoomBtnBg} pointerEvents="none" />
            <GradientStrokeBox width={40} height={36} rx={1.5} strokeWidth={0.3} />
            <View style={styles.iconWrap}>
              <ZoomIcon />
            </View>
          </Pressable>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.cameraLabelRow}>
            {/* Concentric circles indicator — all GRAY #A3A3A3 (NOT red) */}
            <View style={styles.indicatorOuter}>
              <View style={styles.indicatorMiddle}>
                <View style={styles.indicatorInner} />
              </View>
            </View>
            <Text style={styles.cameraLabelText}>{current.subtitle}</Text>
          </View>
          <View style={styles.actionButtons}>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
              onPress={openSnapshot}
            >
              <View style={styles.actionBtnBg} pointerEvents="none" />
              <GradientStrokeBox width={40} height={36} rx={1.5} strokeWidth={0.3} />
              <View style={styles.iconWrap}>
                <SnapshotIcon />
              </View>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
              onPress={toggleMute}
            >
              <View style={styles.actionBtnBg} pointerEvents="none" />
              <GradientStrokeBox width={40} height={36} rx={1.5} strokeWidth={0.3} />
              <View style={styles.iconWrap}>{muted ? <SoundOffIcon /> : <SoundOnIcon />}</View>
            </Pressable>
          </View>
        </View>

        {/* Divider — Vector 144 at y=597 */}
        <View style={styles.divider} />

        <View style={styles.alertHistorySection}>
          <Text style={styles.alertHistoryTitle}>Alert History</Text>

          {(() => {
            // Per-camera alert history: every page reads the canonical
            // INCIDENTS list filtered down to the camera the user is on, so
            // swiping to a new camera in the pager swaps the alerts shown.
            const cameraIncidents = current.isOnline
              ? INCIDENTS.filter(i => i.cameraId === current.id)
              : []
            if (cameraIncidents.length === 0) {
              return (
                <View style={styles.emptyAlerts}>
                  <EmptyDocIcon />
                  <Text style={styles.emptyAlertsText}>No Alerts yet</Text>
                </View>
              )
            }
            return (
              <View style={styles.alertCards}>
                {cameraIncidents.map(incident => (
                  <View key={incident.id} style={styles.alertCard}>
                    <View style={styles.alertThumb}>
                      <WarningIcon />
                    </View>
                    <View style={styles.alertTextCol}>
                      <Text style={styles.alertTitle}>{incident.alertTitle}</Text>
                      <Text style={styles.alertDate}>{incident.timestamp}</Text>
                    </View>
                    <Pressable
                      style={({ pressed }) => [styles.viewDetailsBtn, pressed && { opacity: 0.7 }]}
                      onPress={() => {
                        tapHaptic()
                        router.push({
                          pathname: '/(main)/incident-detail',
                          params: { id: incident.id },
                        })
                      }}
                    >
                      <Text style={styles.viewDetailsText}>View Details</Text>
                      <ExternalLinkIcon />
                    </Pressable>
                    <GradientStrokeBox width={311} height={61} rx={0} strokeWidth={0.5} />
                  </View>
                ))}
              </View>
            )
          })()}
        </View>
      </ScrollView>

      {/* Carousel right-arrow — only shown when more than one camera lives
          in the (possibly filtered) pager. Otherwise there's nowhere to go. */}
      {canSwipe && (
        <Pressable
          style={({ pressed }) => [styles.carouselArrow, pressed && { opacity: 0.7 }]}
          onPress={() => {
            tapHaptic()
            goNext()
          }}
        >
          <CarouselArrowSvg />
        </Pressable>
      )}

      <SnapshotModal
        visible={snapshotOpen}
        onClose={() => setSnapshotOpen(false)}
        source={current.image}
        dateLabel="Apr, 08.2025"
        timeLabel="8:00pm"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 375,
    height: 812,
    alignSelf: 'center',
    backgroundColor: '#121212',
    overflow: 'hidden',
  },
  scroll: { flex: 1 },
  // Small tail under the last Alert History card so it clears the iOS home
  // indicator without leaving a big empty gap.
  scrollContent: { paddingBottom: 28 },

  header: {
    marginTop: 71,
    marginHorizontal: 16,
    width: 343,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    marginLeft: 12,
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '400',
    lineHeight: 24,
    fontFamily: 'Lato_400Regular',
  },
  livePill: {
    width: 54,
    height: 20,
    borderWidth: 0.5,
    borderColor: '#8A8A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 6,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#F04438',
  },
  liveText: {
    color: '#8A8A8A',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 14.4,
    fontFamily: 'Lato_400Regular',
  },
  // Offline state — same grey pill shape as LIVE (not red). Per Figma node
  // 4274:6657 Frame 96: grey border + dark grey dot + grey "Offline" text.
  offlinePill: {
    width: 54,
    height: 20,
    borderWidth: 0.5,
    borderColor: '#8A8A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 6,
  },
  offlineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#3D3D3D',
  },
  offlineText: {
    color: '#8A8A8A',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 14.4,
    fontFamily: 'Lato_400Regular',
  },

  feedContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    width: 343,
    height: 405,
    backgroundColor: '#0A0A0A',
    overflow: 'hidden',
    position: 'relative',
  },
  // Horizontal pager that holds one page per camera; sits inside feedContainer
  // so overflow:hidden clips both the zoomed image and the page edges cleanly.
  feedPager: { width: 343, height: 405 },
  // overflow:hidden clips the scaled image to its own page so the zoom
  // doesn't bleed into the neighbouring pages of the horizontal pager.
  feedPage: { width: 343, height: 405, overflow: 'hidden' },
  // Wraps each feed image so Reanimated can scale it without re-laying out the
  // parent (overflow:hidden on feedContainer clips the zoom).
  feedImageWrapper: { width: '100%', height: '100%' },
  feedImage: { width: '100%', height: '100%' },

  // Small chip floating above the zoom button — shows current zoom level.
  zoomLevelChip: {
    position: 'absolute',
    right: 16,
    bottom: 60,
    height: 22,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(31,31,31,0.85)',
    borderRadius: 11,
    borderWidth: 0.5,
    borderColor: 'rgba(191,191,191,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomLevelChipText: {
    color: '#F2F4F7',
    fontSize: 12,
    fontFamily: 'Lato_400Regular',
  },
  zoomBtn: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 40,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Visible glass background — semi-transparent dark fill so the button reads against the feed image
  zoomBtnBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31,31,31,0.55)',
    borderRadius: 1.5,
  },

  // Fixed at screen-relative coords so it stays put while content scrolls.
  carouselArrow: {
    position: 'absolute',
    left: 342,
    top: 280,
    width: 100,
    height: 100,
    zIndex: 50,
  },

  actionRow: {
    marginTop: 12, // y=544 - feed_end(127+405=532) = 12
    marginHorizontal: 14,
    width: 347,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cameraLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // 3 concentric circles — outer ring 16, middle ring 11, inner dot 6 — all #A3A3A3
  indicatorOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#A3A3A3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorMiddle: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 0.5,
    borderColor: '#A3A3A3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A3A3A3',
  },
  cameraLabelText: {
    color: '#E4E7EC',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 19.2,
    fontFamily: 'Lato_400Regular',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31,31,31,0.85)',
    borderRadius: 1.5,
  },
  // Centered overlay for the icon — sits ON TOP of both the bg fill and the gradient stroke
  // (without this, the absoluteFill SVG of GradientStrokeBox renders above the icon and dims it)
  iconWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Divider at y=597 (12px below action row at y=544+36=580)
  divider: {
    marginTop: 17,
    marginHorizontal: 16,
    width: 343,
    height: 1,
    backgroundColor: '#3D3D3D',
  },

  alertHistorySection: {
    marginTop: 17,
    marginHorizontal: 16,
    width: 343,
    backgroundColor: '#1F1F1F',
    borderRadius: 3,
    paddingTop: 12,
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  alertHistoryTitle: {
    color: '#F3F4F7',
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 21.6,
    fontFamily: 'Lato_400Regular',
  },
  alertCards: {
    marginTop: 14, // 660 - 626 - 22 (title height) = 12
    gap: 12,
  },
  // Empty state — centred document icon + "No Alerts yet" label per Figma
  // node 4274:6657 (Frame 523 at root 145, 708).
  emptyAlerts: {
    marginTop: 80,
    alignItems: 'center',
    gap: 12,
  },
  emptyAlertsText: {
    color: '#BFBFBF',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 19.2,
    fontFamily: 'Lato_400Regular',
  },
  alertCard: {
    width: 311,
    height: 61,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  alertThumb: {
    width: 40,
    height: 40,
    backgroundColor: '#2E2E2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTextCol: {
    flex: 1,
    gap: 2,
  },
  alertTitle: {
    color: '#F3F4F7',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 16.8,
    fontFamily: 'Lato_400Regular',
  },
  alertDate: {
    color: '#575757',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 14.4,
    fontFamily: 'Lato_400Regular',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewDetailsText: {
    color: '#A3A3A3',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 14.4,
    fontFamily: 'Lato_400Regular',
    textDecorationLine: 'underline',
    textDecorationColor: '#A3A3A3',
  },
})
