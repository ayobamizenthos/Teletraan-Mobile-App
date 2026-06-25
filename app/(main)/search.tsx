import { useMemo, useState } from 'react'
import { View, Text, StyleSheet, Pressable, Platform, TextInput, ScrollView } from 'react-native'
import { Image } from 'expo-image'
import Svg, { Path, Circle as SvgCircle, Rect } from 'react-native-svg'
import { useRouter } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated'
import BottomNavBar from '../../components/bottom-nav-bar'
import StatusBar from '../../components/status-bar'
import {
  GradientStrokeBox,
  GradientFillBox,
  STROKE_LINEAR_2,
  LINEAR_BG4_STROKE,
} from '../../components/gradient-stroke-box'
import { tapHaptic } from '../../lib/haptics'
import { searchCameras } from '../../lib/api/cameras'
import { searchAlerts } from '../../lib/api/alerts'
import { getRecentSearches } from '../../lib/api/notifications'
import type { CameraFeed } from '../../lib/data/cameras'
import type { Alert } from '../../lib/data/alerts'

// mid position (idle) up to the top (results) — no duplicate screen. Reanimated
// drives that transition; idle content fades out, results fade in.

type FilterId = 'All' | 'Alert' | 'Camera' | 'Location'
const FILTERS: FilterId[] = ['All', 'Alert', 'Camera', 'Location']

const BAR_TOP_IDLE = 271
const BAR_TOP_RESULTS = 179
const CHIP_OFFSET = 9.5 // chip (29) vertically centred in the 48-tall bar
const ANIM = { duration: 340 }

const RECENT_SEARCHES = getRecentSearches()

function BellIcon() {
  return (
    <Svg width={16} height={15} viewBox="0 0 16 15" fill="none" pointerEvents="none">
      <Path
        d="M15.4034 6.63389V11.2643C15.4034 12.1178 15.0643 12.9364 14.4607 13.54C13.8571 14.1436 13.0384 14.4826 12.1848 14.4826H3.73587C2.88224 14.4826 2.06357 14.1436 1.45996 13.54C0.856346 12.9364 0.517241 12.1178 0.517241 11.2643V4.023C0.517241 3.16944 0.856346 2.35084 1.45996 1.74729C2.06357 1.14373 2.88224 0.804654 3.73587 0.804654H9.48998"
        stroke="#E6E6E6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M0.517241 4.0955L6.35101 7.41845C6.83866 7.70573 7.39434 7.85723 7.96033 7.85723C8.52632 7.85723 9.08199 7.70573 9.56964 7.41845L11.3552 6.40708"
        stroke="#E6E6E6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.593 4.02294C14.704 4.02294 15.6046 3.12237 15.6046 2.01147C15.6046 0.900565 14.704 0 13.593 0C12.482 0 11.5814 0.900565 11.5814 2.01147C11.5814 3.12237 12.482 4.02294 13.593 4.02294Z"
        fill="#D92D20"
      />
    </Svg>
  )
}

function MagnifierIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 13 13" fill="none">
      <Path
        d="M12.5 12.5L9.03548 9.03548M9.03548 9.03548C9.97316 8.09781 10.4999 6.82605 10.4999 5.49997C10.4999 4.1739 9.97316 2.90213 9.03548 1.96446C8.09781 1.02678 6.82605 0.5 5.49997 0.5C4.1739 0.5 2.90213 1.02678 1.96446 1.96446C1.02678 2.90213 0.5 4.1739 0.5 5.49997C0.5 6.82605 1.02678 8.09781 1.96446 9.03548C2.90213 9.97316 4.1739 10.4999 5.49997 10.4999C6.82605 10.4999 8.09781 9.97316 9.03548 9.03548Z"
        stroke="#8A8A8A"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function ChevronDown() {
  return (
    <Svg width={12} height={7} viewBox="0 0 12 7" fill="none">
      <Path
        d="M0 0.875913L0.875913 0L6 5.16789L11.1241 0L12 0.875913L6 6.87592L0 0.875913Z"
        fill="#E4E7EC"
      />
    </Svg>
  )
}

function LiveCamIcon() {
  return (
    <Svg width={12} height={11} viewBox="0 0 12 11" fill="none">
      <Path
        d="M5.92309 5.92309C5.69867 5.92309 5.48345 6.01224 5.32476 6.17092C5.16608 6.32961 5.07693 6.54483 5.07693 6.76924C5.07693 6.99366 5.16608 7.20888 5.32476 7.36756C5.48345 7.52625 5.69867 7.6154 5.92309 7.6154C6.1475 7.6154 6.36272 7.52625 6.52141 7.36756C6.68009 7.20888 6.76924 6.99366 6.76924 6.76924C6.76924 6.54483 6.68009 6.32961 6.52141 6.17092C6.36272 6.01224 6.1475 5.92309 5.92309 5.92309ZM3.38462 6.76924C3.38462 6.096 3.65207 5.45033 4.12812 4.97428C4.60418 4.49822 5.24984 4.23078 5.92309 4.23078C6.59633 4.23078 7.242 4.49822 7.71805 4.97428C8.19411 5.45033 8.46155 6.096 8.46155 6.76924C8.46155 7.44248 8.19411 8.08815 7.71805 8.56421C7.242 9.04026 6.59633 9.30771 5.92309 9.30771C5.24984 9.30771 4.60418 9.04026 4.12812 8.56421C3.65207 8.08815 3.38462 7.44248 3.38462 6.76924ZM5.92309 5.07693C5.47426 5.07693 5.04381 5.25523 4.72644 5.5726C4.40907 5.88997 4.23078 6.32041 4.23078 6.76924C4.23078 7.21807 4.40907 7.64852 4.72644 7.96589C5.04381 8.28326 5.47426 8.46155 5.92309 8.46155C6.37192 8.46155 6.80236 8.28326 7.11973 7.96589C7.4371 7.64852 7.6154 7.21807 7.6154 6.76924C7.6154 6.32041 7.4371 5.88997 7.11973 5.5726C6.80236 5.25523 6.37192 5.07693 5.92309 5.07693ZM1.74508e-07 1.26923C1.74508e-07 0.932611 0.133723 0.609777 0.37175 0.37175C0.609777 0.133722 0.932612 0 1.26923 0H10.5769C10.9136 0 11.2364 0.133722 11.4744 0.37175C11.7125 0.609777 11.8462 0.932611 11.8462 1.26923V2.11539C11.8463 2.37797 11.765 2.63414 11.6135 2.84857C11.4619 3.06301 11.2476 3.22517 11 3.3127V5.92309C11 7.26957 10.4651 8.56091 9.51302 9.51302C8.56091 10.4651 7.26957 11 5.92309 11C4.5766 11 3.28526 10.4651 2.33315 9.51302C1.38104 8.56091 0.846155 7.26957 0.846155 5.92309V3.3127C0.598589 3.22517 0.384263 3.06301 0.232717 2.84857C0.0811698 2.63414 -0.000137483 2.37797 1.74508e-07 2.11539V1.26923ZM1.26923 2.53847H10.5769C10.6891 2.53847 10.7968 2.49389 10.8761 2.41455C10.9554 2.33521 11 2.2276 11 2.11539V1.26923C11 1.15703 10.9554 1.04941 10.8761 0.970072C10.7968 0.890729 10.6891 0.846155 10.5769 0.846155H1.26923C1.15703 0.846155 1.04941 0.890729 0.970072 0.970072C0.89073 1.04941 0.846155 1.15703 0.846155 1.26923V2.11539C0.846155 2.2276 0.89073 2.33521 0.970072 2.41455C1.04941 2.49389 1.15703 2.53847 1.26923 2.53847ZM1.69231 3.38462V5.92309C1.69231 7.04516 2.13805 8.12127 2.93148 8.9147C3.7249 9.70812 4.80102 10.1539 5.92309 10.1539C7.04516 10.1539 8.12127 9.70812 8.9147 8.9147C9.70812 8.12127 10.1539 7.04516 10.1539 5.92309V3.38462H1.69231Z"
        fill="#F2F4F7"
      />
    </Svg>
  )
}

function CamMetaIcon({ color = '#BFBFBF' }: { color?: string }) {
  return (
    <Svg width={14} height={13} viewBox="0 0 14 13" fill="none">
      <Path
        d="M7 7C6.73478 7 6.48043 7.10536 6.29289 7.29289C6.10536 7.48043 6 7.73478 6 8C6 8.26522 6.10536 8.51957 6.29289 8.70711C6.48043 8.89464 6.73478 9 7 9C7.26522 9 7.51957 8.89464 7.70711 8.70711C7.89464 8.51957 8 8.26522 8 8C8 7.73478 7.89464 7.48043 7.70711 7.29289C7.51957 7.10536 7.26522 7 7 7ZM4 8C4 7.20435 4.31607 6.44129 4.87868 5.87868C5.44129 5.31607 6.20435 5 7 5C7.79565 5 8.55871 5.31607 9.12132 5.87868C9.68393 6.44129 10 7.20435 10 8C10 8.79565 9.68393 9.55871 9.12132 10.1213C8.55871 10.6839 7.79565 11 7 11C6.20435 11 5.44129 10.6839 4.87868 10.1213C4.31607 9.55871 4 8.79565 4 8ZM7 6C6.46957 6 5.96086 6.21071 5.58579 6.58579C5.21071 6.96086 5 7.46957 5 8C5 8.53043 5.21071 9.03914 5.58579 9.41421C5.96086 9.78929 6.46957 10 7 10C7.53043 10 8.03914 9.78929 8.41421 9.41421C8.78929 9.03914 9 8.53043 9 8C9 7.46957 8.78929 6.96086 8.41421 6.58579C8.03914 6.21071 7.53043 6 7 6ZM2.06237e-07 1.5C2.06237e-07 1.10218 0.158036 0.720644 0.43934 0.43934C0.720645 0.158035 1.10218 0 1.5 0H12.5C12.8978 0 13.2794 0.158035 13.5607 0.43934C13.842 0.720644 14 1.10218 14 1.5V2.5C14.0002 2.81033 13.9041 3.11306 13.725 3.36649C13.5459 3.61992 13.2926 3.81156 13 3.915V7C13 8.5913 12.3679 10.1174 11.2426 11.2426C10.1174 12.3679 8.5913 13 7 13C5.4087 13 3.88258 12.3679 2.75736 11.2426C1.63214 10.1174 1 8.5913 1 7V3.915C0.707422 3.81156 0.454129 3.61992 0.275028 3.36649C0.0959278 3.11306 -0.00016248 2.81033 2.06237e-07 2.5V1.5ZM1.5 3H12.5C12.6326 3 12.7598 2.94732 12.8536 2.85355C12.9473 2.75979 13 2.63261 13 2.5V1.5C13 1.36739 12.9473 1.24021 12.8536 1.14645C12.7598 1.05268 12.6326 1 12.5 1H1.5C1.36739 1 1.24022 1.05268 1.14645 1.14645C1.05268 1.24021 1 1.36739 1 1.5V2.5C1 2.63261 1.05268 2.75979 1.14645 2.85355C1.24022 2.94732 1.36739 3 1.5 3ZM2 4V7C2 8.32608 2.52678 9.59785 3.46447 10.5355C4.40215 11.4732 5.67392 12 7 12C8.32608 12 9.59785 11.4732 10.5355 10.5355C11.4732 9.59785 12 8.32608 12 7V4H2Z"
        fill={color}
      />
    </Svg>
  )
}

function MetaPinIcon() {
  return (
    <Svg width={11} height={16} viewBox="0 0 11 16" fill="none">
      <Path
        d="M5.50046 14.9185C8.27048 11.0405 10.4865 7.71648 10.4865 5.50046C10.4865 4.17809 9.96118 2.90987 9.02612 1.97481C8.09106 1.03974 6.82284 0.514432 5.50046 0.514432C4.17809 0.514432 2.90987 1.03974 1.97481 1.97481C1.03974 2.90987 0.514432 4.17809 0.514432 5.50046C0.514432 7.71648 2.73045 11.0405 5.50046 14.9185Z"
        stroke="#E6E6E6"
      />
      <Path
        d="M7.71555 5.50054C7.71555 6.08826 7.48208 6.65192 7.06649 7.0675C6.65091 7.48308 6.08726 7.71656 5.49954 7.71656C4.91181 7.71656 4.34816 7.48308 3.93258 7.0675C3.51699 6.65192 3.28352 6.08826 3.28352 5.50054C3.28352 4.91282 3.51699 4.34917 3.93258 3.93358C4.34816 3.518 4.91181 3.28453 5.49954 3.28453C6.08726 3.28453 6.65091 3.518 7.06649 3.93358C7.48208 4.34917 7.71555 4.91282 7.71555 5.50054Z"
        stroke="#E6E6E6"
      />
    </Svg>
  )
}

function ClockIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path
        d="M7 14C3.14 14 0 10.86 0 7C0 3.14 3.14 0 7 0C10.86 0 14 3.14 14 7C14 10.86 10.86 14 7 14ZM7 1C3.69 1 1 3.69 1 7C1 10.31 3.69 13 7 13C10.31 13 13 10.31 13 7C13 3.69 10.31 1 7 1Z"
        fill="#E6E6E6"
      />
      <Path
        d="M9.00001 9.5C8.91001 9.5 8.82001 9.48 8.74001 9.43L6.24001 7.93C6.1663 7.88513 6.10546 7.82195 6.0634 7.74659C6.02134 7.67124 5.99951 7.58629 6.00001 7.5V3.5C6.00001 3.22 6.22001 3 6.50001 3C6.78001 3 7.00001 3.22 7.00001 3.5V7.22L9.26001 8.57C9.3531 8.62705 9.42504 8.7129 9.46495 8.81453C9.50485 8.91615 9.51054 9.02802 9.48114 9.13317C9.45175 9.23831 9.38887 9.33101 9.30205 9.39721C9.21523 9.46341 9.10919 9.49949 9.00001 9.5Z"
        fill="#E6E6E6"
      />
    </Svg>
  )
}

function ArrowCircle() {
  return (
    <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
      <SvgCircle cx={24} cy={24} r={24} fill="#A3A3A3" />
      <Path
        d="M17 23.1162V24.8838H27.6061L22.7449 29.7449L24 31L31 24L24 17L22.7449 18.2551L27.6061 23.1162H17Z"
        fill="#242424"
      />
    </Svg>
  )
}

function NotFoundIcon() {
  return (
    <Svg width={48} height={60} viewBox="0 0 48 60" fill="none">
      <Rect x={1} y={9} width={46} height={50} rx={3} stroke="#A3A3A3" strokeWidth={2} />
      <Path
        d="M12 24H36M12 34H30M12 44H24"
        stroke="#A3A3A3"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <SvgCircle cx={36} cy={12} r={11} stroke="#A3A3A3" strokeWidth={2} fill="#121212" />
      <Path d="M31 7L41 17M41 7L31 17" stroke="#A3A3A3" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  )
}

function CloseIcon() {
  return (
    <Svg width={9} height={9} viewBox="0 0 9 9" fill="none">
      <Path
        d="M0.5 8.5L4.5 4.5L8.5 8.5M8.5 0.5L4.49924 4.5L0.5 0.5"
        stroke="#F9FAFB"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

// ─── pieces ───────────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionRule} />
    </View>
  )
}

function CameraCard({
  cam,
  width,
  height,
  onPress,
}: {
  cam: CameraFeed
  width: number
  height: number
  onPress: () => void
}) {
  return (
    <Pressable style={[styles.camCard, { width, height }]} onPress={onPress}>
      <Image source={cam.thumbnail} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <LiveCamIcon />
      </View>
      <View style={styles.camNameBar}>
        <GradientFillBox width={111} height={23} rx={0} gradient={LINEAR_BG4_STROKE} />
        <GradientStrokeBox
          width={111}
          height={23}
          rx={0}
          strokeWidth={0.79}
          gradient={STROKE_LINEAR_2}
        />
        <Text style={styles.camNameText} numberOfLines={1}>
          {cam.name}
        </Text>
      </View>
    </Pressable>
  )
}

function AlertCard({ alert, onPress }: { alert: Alert; onPress: () => void }) {
  return (
    <View style={styles.alertCard}>
      <Image source={alert.banner} style={styles.alertBanner} contentFit="cover" />
      <View style={styles.alertCamPill}>
        <GradientFillBox width={139} height={32} rx={2} gradient={LINEAR_BG4_STROKE} />
        <GradientStrokeBox
          width={139}
          height={32}
          rx={2}
          strokeWidth={0.79}
          gradient={STROKE_LINEAR_2}
        />
        <View style={styles.alertCamPillInner}>
          <CamMetaIcon color="#F2F4F7" />
          <Text style={styles.alertCamPillText}>{alert.camera}</Text>
        </View>
      </View>
      <View style={styles.severityBadge}>
        <Text style={styles.severityText}>{alert.severity}</Text>
      </View>
      <Text style={styles.alertTitle}>{alert.title}</Text>
      <View style={styles.alertMetaRow}>
        <View style={styles.alertMetaItem}>
          <MetaPinIcon />
          <Text style={styles.alertMetaText}>{alert.location}</Text>
        </View>
        <View style={styles.alertMetaItem}>
          <ClockIcon />
          <Text style={styles.alertMetaText}>{alert.time}</Text>
        </View>
      </View>
      <Pressable style={styles.alertArrow} onPress={onPress}>
        <ArrowCircle />
      </Pressable>
      <GradientStrokeBox width={343} height={218} rx={15} gradient={STROKE_LINEAR_2} />
    </View>
  )
}

// ─── screen ───────────────────────────────────────────────────────────────────

export default function SearchScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterId>('All')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // 0 = idle (bar mid), 1 = results (bar top). Drives the shared transition.
  const progress = useSharedValue(0)

  const matchedCameras = useMemo(() => searchCameras(query), [query])
  const matchedAlerts = useMemo(() => searchAlerts(query), [query])
  const hasResults =
    filter === 'Alert'
      ? matchedAlerts.length > 0
      : filter === 'All'
        ? matchedCameras.length > 0 || matchedAlerts.length > 0
        : matchedCameras.length > 0

  const goResults = () => {
    if (query.trim().length === 0) return
    setSubmitted(true)
    progress.value = withTiming(1, ANIM)
  }

  const goIdle = () => {
    setSubmitted(false)
    setDropdownOpen(false)
    progress.value = withTiming(0, ANIM)
  }

  const onQueryChange = (text: string) => {
    setQuery(text)
    if (text.trim().length === 0 && submitted) goIdle()
  }

  const runRecent = (term: string) => {
    tapHaptic()
    setQuery(term)
    setSubmitted(true)
    progress.value = withTiming(1, ANIM)
  }

  const selectFilter = (opt: FilterId) => {
    tapHaptic()
    setFilter(opt)
    setDropdownOpen(false)
  }

  const openCamera = (cam: CameraFeed) => {
    tapHaptic()
    router.push({
      pathname: '/(main)/fullscreen-camera',
      params: { cameraId: cam.id, cameraName: cam.name },
    })
  }
  const openAlert = (alertId: string) => {
    tapHaptic()
    router.push({
      pathname: '/(main)/incident-detail',
      params: { id: alertId },
    })
  }

  // Shared bar slides BAR_TOP_IDLE → BAR_TOP_RESULTS
  const barStyle = useAnimatedStyle(() => ({
    top: interpolate(progress.value, [0, 1], [BAR_TOP_IDLE, BAR_TOP_RESULTS]),
  }))
  const chipStyle = useAnimatedStyle(() => ({
    top: interpolate(
      progress.value,
      [0, 1],
      [BAR_TOP_IDLE + CHIP_OFFSET, BAR_TOP_RESULTS + CHIP_OFFSET]
    ),
  }))
  const dropdownStyle = useAnimatedStyle(() => ({
    top: interpolate(progress.value, [0, 1], [BAR_TOP_IDLE + 43, BAR_TOP_RESULTS + 43]),
  }))
  const idleStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }))
  const resultsStyle = useAnimatedStyle(() => ({ opacity: progress.value }))

  return (
    // Plain View root — the previous Pressable wrapper was swallowing taps
    // on the bell / inner buttons on Android. A scoped overlay below handles
    // the "tap outside to close" behaviour only while the dropdown is open.
    <View style={styles.container}>
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageInner}>
          <StatusBar />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Search</Text>
            <Pressable
              style={({ pressed }) => [styles.bellBtn, pressed && { opacity: 0.6 }]}
              onPress={() => {
                tapHaptic()
                router.push('/(main)/notifications')
              }}
            >
              <BellIcon />
              <GradientStrokeBox width={40} height={36} rx={2} gradient={STROKE_LINEAR_2} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* Results-only "Search Results" label (fades in) */}
          <Animated.Text style={[styles.resultsLabel, resultsStyle]}>Search Results</Animated.Text>

          {/* Idle-only: prompt + recent searches (fade out as the bar rises) */}
          <Animated.View
            style={[styles.idleLayer, idleStyle]}
            pointerEvents={submitted ? 'none' : 'box-none'}
          >
            <Text style={styles.searchPromptText}>Search for Camera, Alerts, objects...</Text>
            <View style={styles.recentSection}>
              <Text style={styles.recentLabel}>Recent Search</Text>
              <View style={styles.recentChipsWrap}>
                {RECENT_SEARCHES.map(term => (
                  <Pressable
                    key={term}
                    style={({ pressed }) => [styles.recentChip, pressed && { opacity: 0.7 }]}
                    onPress={() => runRecent(term)}
                  >
                    <Text style={styles.recentChipText}>{term}</Text>
                    <CloseIcon />
                  </Pressable>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Results body (fades in, mounted once submitted) */}
          {submitted && (
            <Animated.View style={[styles.resultsArea, resultsStyle]}>
              {!hasResults ? (
                <View style={styles.notFoundWrap}>
                  <NotFoundIcon />
                  <Text style={styles.notFoundText}>Not Found</Text>
                </View>
              ) : (
                <ScrollView
                  style={styles.scroll}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {filter === 'All' && (
                    <>
                      {matchedCameras.length > 0 && (
                        <>
                          <SectionHeader label="Camera" />
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.camRow}
                          >
                            {matchedCameras.map(cam => (
                              <CameraCard
                                key={cam.id}
                                cam={cam}
                                width={133}
                                height={157}
                                onPress={() => openCamera(cam)}
                              />
                            ))}
                          </ScrollView>
                        </>
                      )}
                      {matchedAlerts.length > 0 && (
                        <>
                          <SectionHeader label="Alert" />
                          {matchedAlerts.map(a => (
                            <AlertCard key={a.id} alert={a} onPress={() => openAlert(a.id)} />
                          ))}
                        </>
                      )}
                      {matchedCameras.length > 0 && (
                        <>
                          <SectionHeader label="Location" />
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.camRow}
                          >
                            {matchedCameras.map(cam => (
                              <CameraCard
                                key={`loc-${cam.id}`}
                                cam={cam}
                                width={133}
                                height={157}
                                onPress={() => openCamera(cam)}
                              />
                            ))}
                          </ScrollView>
                        </>
                      )}
                    </>
                  )}

                  {(filter === 'Camera' || filter === 'Location') && (
                    <View style={styles.grid}>
                      {matchedCameras.map(cam => (
                        <CameraCard
                          key={cam.id}
                          cam={cam}
                          width={167}
                          height={199}
                          onPress={() => openCamera(cam)}
                        />
                      ))}
                    </View>
                  )}

                  {filter === 'Alert' && (
                    <View style={styles.alertOnly}>
                      {matchedAlerts.map(a => (
                        <AlertCard key={a.id} alert={a} onPress={() => openAlert(a.id)} />
                      ))}
                    </View>
                  )}
                </ScrollView>
              )}
            </Animated.View>
          )}

          {/* Shared search bar — same element in both states */}
          <Animated.View style={[styles.searchBar, barStyle]}>
            <Pressable onPress={goResults} hitSlop={10}>
              <MagnifierIcon />
            </Pressable>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={onQueryChange}
              placeholder="Search here"
              placeholderTextColor="#575757"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              blurOnSubmit
              onSubmitEditing={goResults}
              onKeyPress={(e: any) => {
                if (e?.nativeEvent?.key === 'Enter') goResults()
              }}
            />
          </Animated.View>

          <Animated.View style={[styles.filterChip, chipStyle]}>
            <Pressable
              style={styles.filterChipPress}
              onPress={e => {
                e.stopPropagation?.()
                tapHaptic()
                setDropdownOpen(o => !o)
              }}
            >
              <Text style={styles.filterChipText}>{filter}</Text>
              <ChevronDown />
            </Pressable>
            <GradientStrokeBox
              width={69}
              height={29}
              rx={3}
              strokeWidth={1}
              gradient={STROKE_LINEAR_2}
            />
          </Animated.View>

          {dropdownOpen && (
            <Animated.View style={[styles.dropdown, dropdownStyle]}>
              {FILTERS.map(opt => (
                <Pressable
                  key={opt}
                  style={({ pressed }) => [styles.dropdownRow, pressed && { opacity: 0.7 }]}
                  onPress={() => selectFilter(opt)}
                >
                  <Text style={styles.dropdownText}>{opt}</Text>
                  {opt === filter && (
                    <Svg width={8} height={6} viewBox="0 0 8 6" fill="none">
                      <Path
                        d="M1 3L3 5L7 1"
                        stroke="#FFFFFF"
                        strokeWidth={1}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  )}
                  <GradientStrokeBox
                    width={134}
                    height={32}
                    rx={0}
                    strokeWidth={1}
                    gradient={LINEAR_BG4_STROKE}
                  />
                </Pressable>
              ))}
            </Animated.View>
          )}
        </View>
      </ScrollView>

      <BottomNavBar activeTab="search" />

      {/* Scoped "tap-outside-to-close" overlay — only mounted while the
          filter dropdown is open. Sits below the dropdown but above page
          content, so it captures taps without blocking the bell / inputs. */}
      {dropdownOpen && (
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setDropdownOpen(false)} />
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
  // Vertical scroll host: lets the user pull the page up so the bottom row of
  // results clears the floating bottom nav. The nav is rendered as a sibling
  // of this ScrollView so it stays pinned while content scrolls.
  pageScroll: {
    flex: 1,
    width: 375,
  },
  pageScrollContent: {
    width: 375,
  },
  // Page canvas. The design frame is 812 tall; the extra 80px below gives
  // enough scroll room to lift the Location row above the bottom nav.
  pageInner: {
    width: 375,
    height: 812 + 80,
    position: 'relative',
  },

  header: {
    position: 'absolute',
    top: 71,
    left: 16,
    width: 343,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#F9FAFB',
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'Lato_400Regular',
  },
  bellBtn: {
    width: 40,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  divider: {
    position: 'absolute',
    top: 123,
    left: 16,
    width: 343,
    height: 1,
    backgroundColor: '#3D3D3D',
  },

  resultsLabel: {
    position: 'absolute',
    top: 144,
    left: 16,
    color: '#E4E7EC',
    fontSize: 16,
    lineHeight: 19,
    fontFamily: 'Lato_400Regular',
  },

  idleLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  searchPromptText: {
    position: 'absolute',
    top: 229,
    left: 28,
    color: '#E4E7EC',
    fontSize: 16,
    fontFamily: 'Lato_400Regular',
  },
  recentSection: {
    position: 'absolute',
    top: 334,
    left: 16,
    width: 343,
    gap: 13,
  },
  recentLabel: {
    color: '#E4E7EC',
    fontSize: 14,
    fontFamily: 'Lato_400Regular',
  },
  recentChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 3,
    backgroundColor: '#1F1F1F',
  },
  recentChipText: {
    color: '#A3A3A3',
    fontSize: 12,
    fontFamily: 'Lato_400Regular',
  },

  searchBar: {
    position: 'absolute',
    left: 16,
    width: 343,
    height: 48,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    gap: 8,
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: '#E4E7EC',
    fontSize: 14,
    fontFamily: 'Lato_400Regular',
    ...Platform.select({ web: { outlineStyle: 'none' } as any, default: {} }),
  },
  filterChip: {
    position: 'absolute',
    left: 278,
    width: 69,
    height: 29,
    backgroundColor: '#2E2E2E',
    borderRadius: 3,
    zIndex: 20,
  },
  filterChipPress: {
    width: 69,
    height: 29,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterChipText: {
    color: '#E4E7EC',
    fontSize: 14,
    fontFamily: 'Lato_400Regular',
  },
  dropdown: {
    position: 'absolute',
    left: 213,
    width: 134,
    zIndex: 30,
  },
  dropdownRow: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 12,
    paddingRight: 16,
    backgroundColor: '#2E2E2E',
  },
  dropdownText: {
    color: '#E4E7EC',
    fontSize: 14,
    fontFamily: 'Lato_400Regular',
  },

  resultsArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scroll: {
    position: 'absolute',
    top: 227,
    left: 0,
    width: 375,
    bottom: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 130,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginTop: 21,
    marginBottom: 14,
  },
  sectionLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Lato_400Regular',
  },
  sectionRule: {
    flex: 1,
    height: 1,
    backgroundColor: '#3D3D3D',
  },

  camRow: {
    flexDirection: 'row',
    gap: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 25,
  },
  alertOnly: {
    marginTop: 25,
  },
  camCard: {
    backgroundColor: '#262626',
    overflow: 'hidden',
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F04438',
  },
  camNameBar: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 111,
    height: 23,
    paddingLeft: 18,
    justifyContent: 'center',
  },
  camNameText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 14.4,
    fontFamily: 'Lato_400Regular',
  },

  alertCard: {
    width: 343,
    height: 218,
    marginBottom: 4,
    borderRadius: 15,
    overflow: 'hidden',
  },
  alertBanner: {
    width: 343,
    height: 112,
  },
  alertCamPill: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 139,
    height: 32,
    justifyContent: 'center',
    borderRadius: 2,
    overflow: 'hidden',
  },
  alertCamPillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    zIndex: 2,
  },
  alertCamPillText: {
    color: '#BFBFBF',
    fontSize: 12,
    fontFamily: 'Lato_400Regular',
  },
  severityBadge: {
    position: 'absolute',
    top: 128,
    left: 16,
    width: 72,
    height: 22,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  severityText: {
    color: '#F04438',
    fontSize: 12,
    fontFamily: 'Lato_400Regular',
  },
  alertTitle: {
    position: 'absolute',
    top: 158,
    left: 16,
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 19,
    fontFamily: 'Lato_400Regular',
  },
  alertMetaRow: {
    position: 'absolute',
    top: 185,
    left: 16,
    flexDirection: 'row',
    gap: 16,
  },
  alertMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  alertMetaText: {
    color: '#A3A3A3',
    fontSize: 14,
    fontFamily: 'Lato_400Regular',
  },
  alertArrow: {
    position: 'absolute',
    top: 88,
    right: 16,
  },

  notFoundWrap: {
    position: 'absolute',
    top: 227,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  notFoundText: {
    color: '#BFBFBF',
    fontSize: 16,
    fontFamily: 'Lato_400Regular',
  },
})
