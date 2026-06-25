import { useMemo, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Modal } from 'react-native'
import { Image } from 'expo-image'
import { BlurView } from 'expo-blur'
import { useRouter, useLocalSearchParams } from 'expo-router'
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg'
import StatusBar from '../../components/status-bar'
import BottomNavBar from '../../components/bottom-nav-bar'
import { tapHaptic, impactHaptic } from '../../lib/haptics'
import { getPriorityAlertById, getPriorityAlerts } from '../../lib/api/alerts'
import type { PriorityAlert } from '../../lib/data/alerts'
import { Colors } from '../../constants/Colors'

const PAGE_WIDTH = 375
const FRAME_HEIGHT = 877
const RED_BANNER_HEIGHT = 238
const ALERT_PILL_STROKE = '#F04438'
const ALERT_PILL_TEXT = '#FDA29B'
const DETAIL_DIVIDER = '#262626'

// Used everywhere in the app (cameras.tsx, single-camera.tsx). Re-defined here
// to keep this screen self-contained; the icon path comes verbatim from the
// same Figma vector used elsewhere.
function LiveCameraIcon({ color = '#F2F4F7' }: { color?: string }) {
  return (
    <Svg width={14} height={13} viewBox="0 0 14 13" fill="none">
      <Path
        d="M7 7C6.735 7 6.48 7.105 6.293 7.293C6.105 7.48 6 7.735 6 8C6 8.265 6.105 8.52 6.293 8.707C6.48 8.895 6.735 9 7 9C7.265 9 7.52 8.895 7.707 8.707C7.895 8.52 8 8.265 8 8C8 7.735 7.895 7.48 7.707 7.293C7.52 7.105 7.265 7 7 7ZM4 8C4 7.204 4.316 6.441 4.879 5.879C5.441 5.316 6.204 5 7 5C7.796 5 8.559 5.316 9.121 5.879C9.684 6.441 10 7.204 10 8C10 8.796 9.684 9.559 9.121 10.121C8.559 10.684 7.796 11 7 11C6.204 11 5.441 10.684 4.879 10.121C4.316 9.559 4 8.796 4 8ZM7 6C6.47 6 5.961 6.211 5.586 6.586C5.211 6.961 5 7.47 5 8C5 8.53 5.211 9.039 5.586 9.414C5.961 9.789 6.47 10 7 10C7.53 10 8.039 9.789 8.414 9.414C8.789 9.039 9 8.53 9 8C9 7.47 8.789 6.961 8.414 6.586C8.039 6.211 7.53 6 7 6ZM0 1.5C0 1.102 0.158 0.721 0.439 0.439C0.721 0.158 1.102 0 1.5 0H12.5C12.898 0 13.279 0.158 13.561 0.439C13.842 0.721 14 1.102 14 1.5V2.5C14 2.81 13.904 3.113 13.725 3.366C13.546 3.62 13.293 3.812 13 3.915V7C13 8.591 12.368 10.117 11.243 11.243C10.117 12.368 8.591 13 7 13C5.409 13 3.883 12.368 2.757 11.243C1.632 10.117 1 8.591 1 7V3.915C0.707 3.812 0.454 3.62 0.275 3.366C0.096 3.113 0 2.81 0 2.5V1.5ZM1.5 3H12.5C12.633 3 12.76 2.947 12.854 2.854C12.947 2.76 13 2.633 13 2.5V1.5C13 1.367 12.947 1.24 12.854 1.146C12.76 1.053 12.633 1 12.5 1H1.5C1.367 1 1.24 1.053 1.146 1.146C1.053 1.24 1 1.367 1 1.5V2.5C1 2.633 1.053 2.76 1.146 2.854C1.24 2.947 1.367 3 1.5 3ZM2 4V7C2 8.326 2.527 9.598 3.464 10.536C4.402 11.473 5.674 12 7 12C8.326 12 9.598 11.473 10.536 10.536C11.473 9.598 12 8.326 12 7V4H2Z"
        fill={color}
      />
    </Svg>
  )
}

function ExpandIcon() {
  // Same component as on the camera feed cards (cameras.tsx).
  return (
    <Svg width={26} height={23} viewBox="0 0 26 23" fill="none">
      <Defs>
        <LinearGradient
          id="alertExpFill"
          x1={1.879}
          y1={11.328}
          x2={37.613}
          y2={68.922}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#1F1F1F" />
          <Stop offset={1} stopColor="#707070" />
        </LinearGradient>
        <LinearGradient
          id="alertExpStroke"
          x1={-3.382}
          y1={-6.351}
          x2={5.729}
          y2={31.501}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#707070" />
          <Stop offset={0.418259} stopColor="#707070" stopOpacity={0} />
          <Stop offset={0.649108} stopColor="#BFBFBF" stopOpacity={0.12} />
          <Stop offset={1} stopColor="#BFBFBF" />
        </LinearGradient>
      </Defs>
      <Rect
        x={0.153}
        y={0.153}
        width={25.249}
        height={22.693}
        rx={1.343}
        fill="url(#alertExpFill)"
        fillOpacity={0.5}
        stroke="url(#alertExpStroke)"
        strokeWidth={0.307}
      />
      <Path
        d="M14.477 10.295C14.375 10.398 14.236 10.455 14.091 10.455C13.946 10.455 13.807 10.398 13.705 10.295C13.602 10.193 13.545 10.054 13.545 9.909C13.545 9.764 13.602 9.625 13.705 9.523L18.068 5.16C18.119 5.109 18.179 5.069 18.245 5.042C18.311 5.014 18.382 5 18.454 5C18.526 5 18.597 5.014 18.663 5.042C18.729 5.069 18.789 5.109 18.84 5.16C18.891 5.211 18.931 5.271 18.958 5.337C18.986 5.403 19 5.474 19 5.546C19 5.618 18.986 5.689 18.958 5.755C18.931 5.821 18.891 5.882 18.84 5.932L14.477 10.295ZM7.932 16.84C7.882 16.891 7.821 16.931 7.755 16.958C7.689 16.986 7.618 17 7.546 17C7.474 17 7.403 16.986 7.337 16.958C7.271 16.931 7.211 16.891 7.16 16.84C7.109 16.789 7.069 16.729 7.042 16.663C7.014 16.597 7 16.526 7 16.454C7 16.382 7.014 16.311 7.042 16.245C7.069 16.179 7.109 16.119 7.16 16.068L11.523 11.705C11.626 11.602 11.764 11.545 11.909 11.545C12.054 11.545 12.193 11.602 12.295 11.705C12.398 11.807 12.455 11.946 12.455 12.091C12.455 12.236 12.398 12.375 12.295 12.477L7.932 16.84Z"
        fill="#E6E6E6"
      />
      <Path
        d="M7.545 17C7.401 17 7.262 16.942 7.16 16.84C7.057 16.737 7 16.599 7 16.454C7 16.309 7.057 16.171 7.16 16.068C7.262 15.966 7.401 15.908 7.545 15.908H11.909C12.053 15.908 12.192 15.966 12.294 16.068C12.397 16.171 12.454 16.309 12.454 16.454C12.454 16.599 12.397 16.737 12.294 16.84C12.192 16.942 12.053 17 11.909 17H7.545Z"
        fill="#E6E6E6"
      />
      <Path
        d="M8.091 16.454C8.091 16.599 8.033 16.737 7.931 16.84C7.829 16.942 7.69 17 7.545 17C7.401 17 7.262 16.942 7.16 16.84C7.057 16.737 7 16.599 7 16.454V12.091C7 11.946 7.057 11.807 7.16 11.705C7.262 11.603 7.401 11.545 7.545 11.545C7.69 11.545 7.829 11.603 7.931 11.705C8.033 11.807 8.091 11.946 8.091 12.091V16.454ZM18.999 9.909C18.999 10.054 18.941 10.193 18.839 10.295C18.737 10.397 18.598 10.455 18.453 10.455C18.309 10.455 18.17 10.397 18.068 10.295C17.965 10.193 17.908 10.054 17.908 9.909V5.546C17.908 5.401 17.965 5.263 18.068 5.16C18.17 5.058 18.309 5.001 18.453 5.001C18.598 5.001 18.737 5.058 18.839 5.16C18.941 5.263 18.999 5.401 18.999 5.546V9.909Z"
        fill="#E6E6E6"
      />
      <Path
        d="M14.088 6.091C13.944 6.091 13.805 6.034 13.703 5.932C13.6 5.829 13.543 5.691 13.543 5.546C13.543 5.401 13.6 5.263 13.703 5.16C13.805 5.058 13.944 5.001 14.088 5.001H18.452C18.596 5.001 18.735 5.058 18.837 5.16C18.939 5.263 18.997 5.401 18.997 5.546C18.997 5.691 18.939 5.829 18.837 5.932C18.735 6.034 18.596 6.091 18.452 6.091H14.088Z"
        fill="#E6E6E6"
      />
    </Svg>
  )
}

// X close icon — same 26×23 gradient backdrop rectangle as ExpandIcon so the
// chip swaps cleanly when the image is expanded into fullscreen.
function CloseIcon() {
  return (
    <Svg width={26} height={23} viewBox="0 0 26 23" fill="none">
      <Defs>
        <LinearGradient
          id="alertCloseFill"
          x1={1.879}
          y1={11.328}
          x2={37.613}
          y2={68.922}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#1F1F1F" />
          <Stop offset={1} stopColor="#707070" />
        </LinearGradient>
        <LinearGradient
          id="alertCloseStroke"
          x1={-3.382}
          y1={-6.351}
          x2={5.729}
          y2={31.501}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#707070" />
          <Stop offset={0.418259} stopColor="#707070" stopOpacity={0} />
          <Stop offset={0.649108} stopColor="#BFBFBF" stopOpacity={0.12} />
          <Stop offset={1} stopColor="#BFBFBF" />
        </LinearGradient>
      </Defs>
      <Rect
        x={0.153}
        y={0.153}
        width={25.249}
        height={22.693}
        rx={1.343}
        fill="url(#alertCloseFill)"
        fillOpacity={0.5}
        stroke="url(#alertCloseStroke)"
        strokeWidth={0.307}
      />
      <Path
        d="M9 7L17 16M17 7L9 16"
        stroke="#E6E6E6"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function BackArrowIcon() {
  // 14 × 14 left arrow — same vector used on incident-detail.
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path
        d="M14 6.11616V7.88384H3.39394L8.25505 12.7449L7 14L0 7L7 0L8.25505 1.25505L3.39394 6.11616H14Z"
        fill="#E6E6E6"
      />
    </Svg>
  )
}

function BurglaryIcon() {
  // 17 × 14 — figure crouched + warning rays. Drives both the landing pill
  // and the per-alert detail pill (same Figma component).
  return (
    <Svg width={17} height={14} viewBox="0 0 17 14" fill="none">
      <Path
        d="M12.5874 12.8333V7.58274C12.5874 5.14499 10.6045 3.16223 8.16673 3.16223C5.7289 3.16223 3.74609 5.14499 3.74609 7.58274V12.8333H12.5874ZM8.16673 6.36999C7.49821 6.36999 6.95452 6.91366 6.95452 7.58216C6.95452 7.90416 6.69318 8.16549 6.37117 8.16549C6.04916 8.16549 5.78782 7.90474 5.78782 7.58216C5.78782 6.27024 6.85535 5.20332 8.16673 5.20332C8.48874 5.20332 8.75008 5.46465 8.75008 5.78665C8.75008 6.10866 8.48874 6.36999 8.16673 6.36999Z"
        fill="#F04438"
      />
      <Path
        d="M8.16797 5.20337C6.85601 5.20337 5.78906 6.27087 5.78906 7.58221C5.78906 7.90421 6.0504 8.16554 6.37241 8.16554C6.69442 8.16554 6.95576 7.90479 6.95576 7.58221C6.95576 6.91371 7.49945 6.37004 8.16797 6.37004C8.48998 6.37004 8.75132 6.1087 8.75132 5.7867C8.75132 5.4647 8.48998 5.20337 8.16797 5.20337Z"
        fill="white"
      />
      <Path
        d="M13.4157 12.8334H12.5862H3.74491H2.91538C2.59337 12.8334 2.33203 13.0941 2.33203 13.4167C2.33203 13.7393 2.59337 14 2.91538 14H13.4157C13.7383 14 13.999 13.7393 13.999 13.4167C13.999 13.0941 13.7383 12.8334 13.4157 12.8334Z"
        fill="#8B9CA5"
      />
      <Path
        d="M8.16538 2.65476C8.48739 2.65476 8.74873 2.39342 8.74873 2.07142V0.583335C8.74873 0.261334 8.48739 0 8.16538 0C7.84337 0 7.58203 0.261334 7.58203 0.583335V2.07142C7.58203 2.39342 7.84337 2.65476 8.16538 2.65476Z"
        fill="#FBC34E"
      />
      <Path
        d="M15.7484 7.71802H14.2865C13.9639 7.71802 13.7031 7.97877 13.7031 8.30135C13.7031 8.62394 13.9639 8.88469 14.2865 8.88469H15.7484C16.0709 8.88469 16.3317 8.62394 16.3317 8.30135C16.3317 7.97877 16.0709 7.71802 15.7484 7.71802Z"
        fill="#FBC34E"
      />
      <Path
        d="M2.62858 8.30135C2.62858 7.97877 2.36724 7.71802 2.04523 7.71802H0.583351C0.261341 7.71802 0 7.97877 0 8.30135C0 8.62394 0.261341 8.88469 0.583351 8.88469H2.04523C2.36724 8.88469 2.62858 8.62394 2.62858 8.30135Z"
        fill="#FBC34E"
      />
      <Path
        d="M3.42344 4.30509C3.53777 4.42117 3.68886 4.4795 3.83937 4.4795C3.98695 4.4795 4.13454 4.42409 4.24829 4.31209C4.47813 4.08634 4.48163 3.71708 4.25588 3.48725L3.22218 2.4355C2.99584 2.20508 2.62658 2.20216 2.39732 2.42791C2.16748 2.65366 2.16398 3.02292 2.38974 3.25275L3.42344 4.30509Z"
        fill="#FBC34E"
      />
      <Path
        d="M12.4937 4.4795C12.6448 4.4795 12.7959 4.42117 12.9096 4.30509L13.9433 3.25275C14.1696 3.02292 14.1661 2.65366 13.9363 2.42791C13.7053 2.20216 13.3366 2.20508 13.1114 2.4355L12.0777 3.48783C11.8514 3.71767 11.8549 4.08692 12.0847 4.31267C12.1985 4.42409 12.3461 4.4795 12.4937 4.4795Z"
        fill="#FBC34E"
      />
    </Svg>
  )
}

function WarningTriangleBig() {
  // 59 × 55 alert triangle overlaid on the feed centre.
  return (
    <Svg width={59} height={55} viewBox="0 0 59 55" fill="none">
      <Path
        d="M57.7275 40.8935L37.4345 4.61205C35.8971 1.53735 32.8224 0 29.4402 0C26.0581 0 22.9834 1.53735 21.446 4.61205L1.15301 40.8935C-0.384337 43.6607 -0.384337 47.3504 1.15301 50.1176C2.69036 52.8848 5.76506 54.7296 9.14723 54.7296H49.7332C53.1154 54.7296 55.8826 52.8848 57.7275 50.1176C59.5723 47.3504 59.2648 43.9682 57.7275 40.8935ZM52.5005 47.0429C52.193 47.3504 51.5781 48.5802 49.7332 48.5802H9.14723C7.60988 48.5802 6.68747 47.6578 6.38 47.0429C6.07253 46.4279 5.45759 45.5055 6.38 43.9682L26.673 7.37928C27.5954 5.84193 28.8253 5.84193 29.4402 5.84193C30.0552 5.84193 31.2851 5.84193 32.2075 7.37928L52.5005 43.9682C53.1154 45.5055 52.5005 46.7354 52.5005 47.0429Z"
        fill="#D92D20"
      />
      <Path
        d="M29.442 17.8334C27.5972 17.8334 26.3673 19.0633 26.3673 20.9081V30.1322C26.3673 31.977 27.5972 33.2069 29.442 33.2069C31.2868 33.2069 32.5167 31.977 32.5167 30.1322V20.9081C32.5167 19.0633 31.2868 17.8334 29.442 17.8334Z"
        fill="#D92D20"
      />
      <Path
        d="M29.442 42.431C31.1401 42.431 32.5167 41.0544 32.5167 39.3563C32.5167 37.6582 31.1401 36.2816 29.442 36.2816C27.7439 36.2816 26.3673 37.6582 26.3673 39.3563C26.3673 41.0544 27.7439 42.431 29.442 42.431Z"
        fill="#D92D20"
      />
    </Svg>
  )
}

function ThreatScoreBar({ pct }: { pct: number }) {
  // Rectangle 58 (track 270 × 15) + Rectangle 59 (fill 0..270 × 15).
  const fillWidth = Math.max(0, Math.min(100, pct)) * 2.7
  return (
    <Svg width={270} height={15} viewBox="0 0 270 15" fill="none">
      <Defs>
        <LinearGradient
          id="threatFill"
          x1={0}
          y1={0}
          x2={270}
          y2={0}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0} stopColor="#12B76A" />
          <Stop offset={0.5} stopColor="#F79009" />
          <Stop offset={1} stopColor="#F04438" />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={270} height={15} rx={2} fill="#1F1F1F" />
      <Rect x={1} y={0} width={fillWidth} height={15} rx={2} fill="url(#threatFill)" />
    </Svg>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  )
}

function LevelChip({ level }: { level: PriorityAlert['level'] }) {
  return (
    <View style={styles.levelChip}>
      <Text style={styles.levelChipText}>{level}</Text>
    </View>
  )
}

export default function AlertPriorityDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const alert = useMemo(() => {
    if (id) {
      const found = getPriorityAlertById(id)
      if (found) return found
    }
    return getPriorityAlerts()[0]
  }, [id])

  // Image fullscreen state — driven by the expand button at the top-right of
  // the feed image. When open, the button morphs into an X to dismiss.
  const [imageExpanded, setImageExpanded] = useState(false)
  const openExpanded = () => {
    impactHaptic()
    setImageExpanded(true)
  }
  const closeExpanded = () => {
    tapHaptic()
    setImageExpanded(false)
  }

  const watchLiveFeed = () => {
    impactHaptic()
    // Mirror the post-sign-in flow: loading screen, then view-mode chooser.
    router.push({
      pathname: '/(auth)/loading',
      params: { next: '/(main)/cameras?pickView=1' },
    })
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageInner}>
          <View style={styles.redBanner} />
          <StatusBar />

          {/* Back button — Figma Frame 434 at root (15, 65), 40×40,
              stroke #E4E7EC 1px, rx 2, fill transparent. */}
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={() => {
              tapHaptic()
              router.back()
            }}
          >
            <BackArrowIcon />
          </Pressable>

          {/* Camera feed image — Figma Rectangle 62 at root(17, 123), 343×228.
              Image is 343 × 405 but clipped via overflow:hidden. */}
          <View style={styles.feedFrame}>
            <Image source={alert.thumbnail} style={styles.feedImage} contentFit="cover" />

            {/* Overlay: red dot + camera glyph only (LIVE text is hidden in Figma) */}
            <View style={styles.feedOverlay}>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <LiveCameraIcon />
              </View>
              <Pressable
                style={({ pressed }) => [styles.expandSlot, pressed && { opacity: 0.7 }]}
                onPress={openExpanded}
                hitSlop={6}
              >
                <ExpandIcon />
              </Pressable>
            </View>

            {/* Big warning triangle centred — Figma `_icons` at rel (143, 81) */}
            <View style={styles.warningTriangle}>
              <WarningTriangleBig />
            </View>
          </View>

          {/* "Unwanted Object Detected" pill — Figma Component 38 at root(17,366).
              Transparent fill, Error/500 stroke 1px, sharp corners. */}
          <View style={styles.alertPill}>
            <BurglaryIcon />
            <Text style={styles.alertPillText}>{alert.activity}</Text>
          </View>

          {/* Detail card — Figma Frame 495 at root(18, 439), 343×325, fill #1F1F1F,
              NO rounded corners. */}
          <View style={styles.detailCard}>
            <DetailRow label="Suspicious Activity:" value={alert.suspiciousActivity} />
            <View style={styles.divider} />

            {/* Threat Score block — label + chip + bar + percent */}
            <View style={styles.threatRow}>
              <Text style={styles.detailLabel}>Threat Score</Text>
              <LevelChip level={alert.level} />
            </View>
            <View style={styles.threatBarRow}>
              <ThreatScoreBar pct={alert.threatScorePct} />
              <Text style={styles.threatPercent}>{alert.threatScorePct}%</Text>
            </View>
            <View style={styles.divider} />

            <DetailRow label="Time:" value={alert.time} />
            <View style={styles.divider} />
            <DetailRow label="Location:" value={alert.location} />
            <View style={styles.divider} />
            <DetailRow label="Camera:" value={alert.camera} />
            <View style={styles.divider} />

            <Pressable
              style={({ pressed }) => [styles.triggerBtn, pressed && styles.pressed]}
              onPress={() => {
                impactHaptic()
              }}
            >
              <Text style={styles.triggerText}>Trigger Emergency Response</Text>
            </Pressable>
          </View>

          {/* Bottom action bar — Figma Frame 504 at root(18, 780), 340×40.
              Lives INSIDE the scrollable page so it can be reached above the
              floating bottom nav by scrolling up. */}
          <View style={styles.bottomBar}>
            <Pressable
              style={({ pressed }) => [styles.dismissBtn, pressed && styles.pressed]}
              onPress={() => {
                tapHaptic()
                router.back()
              }}
            >
              <Text style={styles.dismissText}>Dismiss Alert</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.watchBtn, pressed && styles.pressed]}
              onPress={watchLiveFeed}
            >
              <Text style={styles.watchText}>Watch Live Feed</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <BottomNavBar activeTab="alerts" />

      {/* Expanded image — blurred backdrop + the same camera still / warning
          triangle. Sized to match the single-camera-view feed (343 × 406);
          the chip in the top-right swaps to an X close button. */}
      <Modal
        visible={imageExpanded}
        transparent
        animationType="fade"
        onRequestClose={closeExpanded}
      >
        <Pressable style={styles.fullscreenRoot} onPress={closeExpanded}>
          <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.fullscreenDim} pointerEvents="none" />

          <Pressable style={styles.fullscreenFrame} onPress={e => e.stopPropagation?.()}>
            <Image source={alert.thumbnail} style={styles.fullscreenImage} contentFit="cover" />

            {/* Warning triangle centred over the image */}
            <View style={styles.fullscreenWarning}>
              <WarningTriangleBig />
            </View>

            {/* Same overlay row as the inline feed — LIVE indicator + X close */}
            <View style={styles.fullscreenOverlay}>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <LiveCameraIcon />
              </View>
              <Pressable
                style={({ pressed }) => [styles.expandSlot, pressed && { opacity: 0.7 }]}
                onPress={closeExpanded}
                hitSlop={10}
              >
                <CloseIcon />
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBackground,
    width: PAGE_WIDTH,
    height: 812,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  // Scroll host — design frame is 877 tall but viewport is typically 812;
  // pageInner is sized to the Figma frame plus a small tail so the bottom
  // action bar can scroll above the floating bottom nav.
  pageScroll: {
    flex: 1,
    width: PAGE_WIDTH,
  },
  pageScrollContent: {
    width: PAGE_WIDTH,
  },
  pageInner: {
    width: PAGE_WIDTH,
    // bottom-bar bottom = 780 + 40 = 820 in design coords; nav top = 674.
    // +110 leaves a tight ~29px gap above the floating bottom nav at max scroll.
    height: FRAME_HEIGHT + 110,
    position: 'relative',
  },
  pressed: {
    opacity: 0.7,
  },

  // Fullscreen-expanded image — blurred backdrop, image scaled into the
  // viewport, X chip swapped in at top-right.
  fullscreenRoot: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  // Frame matches the single-camera-view feed exactly: 343 × 406.
  fullscreenFrame: {
    width: 343,
    height: 406,
    overflow: 'hidden',
    position: 'relative',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  // Warning triangle centred over the image (50% - half its size).
  fullscreenWarning: {
    position: 'absolute',
    left: 343 / 2 - 59 / 2,
    top: 406 / 2 - 55 / 2,
    width: 59,
    height: 55,
  },
  // Same 8px insets as the inline feed overlay.
  fullscreenOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    height: 23,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  redBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: PAGE_WIDTH,
    height: RED_BANNER_HEIGHT,
    backgroundColor: Colors.error600,
  },

  backButton: {
    position: 'absolute',
    top: 65,
    left: 15,
    width: 40,
    height: 40,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.black200,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  feedFrame: {
    position: 'absolute',
    top: 123,
    left: 17,
    width: 343,
    height: 228,
    overflow: 'hidden',
  },
  feedImage: {
    width: 343,
    height: 405,
    position: 'absolute',
    top: -1,
    left: -1,
  },
  feedOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    height: 23,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.error500,
  },
  expandSlot: {
    width: 26,
    height: 23,
  },
  warningTriangle: {
    position: 'absolute',
    top: 81,
    left: 143,
    width: 59,
    height: 55,
  },

  alertPill: {
    position: 'absolute',
    top: 366,
    left: 17,
    width: 343,
    height: 49,
    borderWidth: 1,
    borderColor: ALERT_PILL_STROKE,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  alertPillText: {
    color: ALERT_PILL_TEXT,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
    lineHeight: 19.2,
  },

  detailCard: {
    position: 'absolute',
    top: 439,
    left: 18,
    width: 343,
    backgroundColor: Colors.bg1,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 6,
  },
  detailLabel: {
    color: Colors.black300,
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
    lineHeight: 16.8,
  },
  detailValue: {
    color: Colors.black200,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Lato_400Regular',
    lineHeight: 16.8,
  },
  divider: {
    height: 1,
    backgroundColor: DETAIL_DIVIDER,
    marginVertical: 6,
  },

  threatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  threatBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
    paddingBottom: 6,
  },
  threatPercent: {
    color: Colors.black100,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
    lineHeight: 19.2,
  },

  levelChip: {
    marginLeft: 10,
    width: 72,
    height: 22,
    borderRadius: 2,
    backgroundColor: Colors.bg3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelChipText: {
    color: Colors.black200,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Lato_400Regular',
  },

  triggerBtn: {
    marginTop: 16,
    alignSelf: 'center',
    width: 280,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.error500,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: 'inset 4px 4px 4px rgba(0,0,0,0.25), 0 0 4px rgba(36,36,36,1)',
      } as any,
      default: {
        shadowColor: '#242424',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 4,
      },
    }),
  },
  triggerText: {
    color: Colors.error500,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Lato_400Regular',
    lineHeight: 19.2,
  },

  bottomBar: {
    position: 'absolute',
    top: 780,
    left: 18,
    width: 340,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dismissBtn: {
    width: 159,
    height: 40,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.avzdaxGrey,
    backgroundColor: Colors.bg1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    color: Colors.black50,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Lato_400Regular',
  },
  // Same embossed treatment as the onboarding "Get Started" button:
  // grey fill, dark right + bottom edges, inset emboss, soft outer glow.
  watchBtn: {
    width: 159,
    height: 40,
    backgroundColor: '#A3A3A3',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: '#242424',
    borderBottomColor: '#242424',
    alignItems: 'center',
    justifyContent: 'center',
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
  watchText: {
    color: '#262626',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },
})
