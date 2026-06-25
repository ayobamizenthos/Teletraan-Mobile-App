import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Share,
  Image as RNImage,
} from 'react-native'
import { Image } from 'expo-image'
import { Asset } from 'expo-asset'
import { useRouter, useLocalSearchParams } from 'expo-router'
import Svg, { Path, Rect, Circle, LinearGradient, Stop, Defs } from 'react-native-svg'
import * as FileSystem from 'expo-file-system'
import { shareMediaNative } from '../../lib/share-media'
import { tapHaptic, impactHaptic } from '../../lib/haptics'
import { getIncidentById, getIncidents } from '../../lib/api/alerts'
import { SEVERITY_COLORS } from '../../lib/data/alerts'

// Demo video runtime — replaced by the real stream duration once the backend
// is wired up. Used to drive the slider/time counter.
const VIDEO_DURATION_SEC = 10
const VIDEO_TICK_MS = 100

const formatTime = (s: number) => {
  const total = Math.max(0, Math.floor(s))
  const m = Math.floor(total / 60)
  const sec = total % 60
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

function GradientStrokeBox({
  width,
  height,
  rx,
  strokeWidth = 1,
}: {
  width: number
  height: number
  rx: number
  strokeWidth?: number
}) {
  const gradId = `gs_${width}x${height}`
  const x1 = -0.13 * width
  const y1 = -0.27 * height
  const x2 = 0.71 * width
  const y2 = 1.24 * height
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={width} height={height}>
      <Defs>
        <LinearGradient id={gradId} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
          <Stop offset={0} stopColor="#707070" stopOpacity={1} />
          <Stop offset={0.418} stopColor="#707070" stopOpacity={0} />
          <Stop offset={0.649} stopColor="#BFBFBF" stopOpacity={0.12} />
          <Stop offset={1} stopColor="#BFBFBF" stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Rect
        x={strokeWidth / 2}
        y={strokeWidth / 2}
        width={width - strokeWidth}
        height={height - strokeWidth}
        rx={rx}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={strokeWidth}
      />
    </Svg>
  )
}

function ShareButtonBackground() {
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={40} height={36}>
      <Defs>
        <LinearGradient
          id="shareFill"
          x1={0.07 * 40}
          y1={0.49 * 36}
          x2={1.66 * 40}
          y2={2.86 * 36}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0} stopColor="#1F1F1F" stopOpacity={0.5} />
          <Stop offset={1} stopColor="#707070" stopOpacity={0.5} />
        </LinearGradient>
        <LinearGradient
          id="shareStroke"
          x1={-0.13 * 40}
          y1={-0.27 * 36}
          x2={0.71 * 40}
          y2={1.24 * 36}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0} stopColor="#707070" stopOpacity={1} />
          <Stop offset={0.418} stopColor="#707070" stopOpacity={0} />
          <Stop offset={0.649} stopColor="#BFBFBF" stopOpacity={0.12} />
          <Stop offset={1} stopColor="#BFBFBF" stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={40} height={36} rx={1.5} fill="url(#shareFill)" />
      <Rect
        x={0.5}
        y={0.5}
        width={39}
        height={35}
        rx={1.5}
        fill="none"
        stroke="url(#shareStroke)"
        strokeWidth={0.6}
      />
    </Svg>
  )
}

function BackArrowIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path
        d="M14 6.11616V7.88384H3.39394L8.25505 12.7449L7 14L0 7L7 0L8.25505 1.25505L3.39394 6.11616H14Z"
        fill="#E6E6E6"
      />
    </Svg>
  )
}

function PlayTriangle() {
  return (
    <Svg width={19} height={20} viewBox="0 0 19 20" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 2.28306C0 0.548042 1.89997 -0.549872 3.45325 0.285418L17.7931 8.00243C19.4023 8.86812 19.4023 11.1308 17.7931 11.9977L3.45449 19.7147C1.90121 20.55 0.00124253 19.4509 0.00124253 17.7171L0 2.28306Z"
        fill="#E4E7EC"
      />
    </Svg>
  )
}

// Pause bars — same 19×20 footprint as PlayTriangle so the swap is in place.
function PauseBars() {
  return (
    <Svg width={19} height={20} viewBox="0 0 19 20" fill="none">
      <Rect x={2} y={1} width={5} height={18} rx={1} fill="#E4E7EC" />
      <Rect x={12} y={1} width={5} height={18} rx={1} fill="#E4E7EC" />
    </Svg>
  )
}

// Muted variant — speaker + red X across the wave area (same idiom as
// fullscreen-camera). Same 16×14 footprint as the existing VolumeIcon.
function VolumeMutedIcon() {
  return (
    <Svg width={16} height={14} viewBox="0 0 16 14" fill="none">
      <Path
        d="M0.5 4.5H3L6.5 1V13L3 9.5H0.5C0.224 9.5 0 9.276 0 9V5C0 4.724 0.224 4.5 0.5 4.5Z"
        fill="#E4E7EC"
      />
      <Path d="M10 5L14 9M14 5L10 9" stroke="#F04438" strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  )
}

function VolumeIcon() {
  return (
    <Svg width={16} height={14} viewBox="0 0 16 14" fill="none">
      <Path
        d="M0.5 4.5H3L6.5 1V13L3 9.5H0.5C0.224 9.5 0 9.276 0 9V5C0 4.724 0.224 4.5 0.5 4.5Z"
        fill="#E4E7EC"
      />
      <Path
        d="M9 4.5C9.95 5.25 10.5 6.55 10.5 8C10.5 9.45 9.95 10.75 9 11.5"
        stroke="#E4E7EC"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <Path
        d="M11.5 2.5C13 3.7 14 5.7 14 8C14 10.3 13 12.3 11.5 13.5"
        stroke="#E4E7EC"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
    </Svg>
  )
}

function CameraSurveillanceIcon() {
  return (
    <Svg width={14} height={13} viewBox="0 0 14 13" fill="none">
      <Path
        d="M7 7C6.73478 7 6.48043 7.10536 6.29289 7.29289C6.10536 7.48043 6 7.73478 6 8C6 8.26522 6.10536 8.51957 6.29289 8.70711C6.48043 8.89464 6.73478 9 7 9C7.26522 9 7.51957 8.89464 7.70711 8.70711C7.89464 8.51957 8 8.26522 8 8C8 7.73478 7.89464 7.48043 7.70711 7.29289C7.51957 7.10536 7.26522 7 7 7ZM4 8C4 7.20435 4.31607 6.44129 4.87868 5.87868C5.44129 5.31607 6.20435 5 7 5C7.79565 5 8.55871 5.31607 9.12132 5.87868C9.68393 6.44129 10 7.20435 10 8C10 8.79565 9.68393 9.55871 9.12132 10.1213C8.55871 10.6839 7.79565 11 7 11C6.20435 11 5.44129 10.6839 4.87868 10.1213C4.31607 9.55871 4 8.79565 4 8ZM7 6C6.46957 6 5.96086 6.21071 5.58579 6.58579C5.21071 6.96086 5 7.46957 5 8C5 8.53043 5.21071 9.03914 5.58579 9.41421C5.96086 9.78929 6.46957 10 7 10C7.53043 10 8.03914 9.78929 8.41421 9.41421C8.78929 9.03914 9 8.53043 9 8C9 7.46957 8.78929 6.96086 8.41421 6.58579C8.03914 6.21071 7.53043 6 7 6ZM2.06237e-07 1.5C2.06237e-07 1.10218 0.158036 0.720644 0.43934 0.43934C0.720645 0.158035 1.10218 0 1.5 0H12.5C12.8978 0 13.2794 0.158035 13.5607 0.43934C13.842 0.720644 14 1.10218 14 1.5V2.5C14.0002 2.81033 13.9041 3.11306 13.725 3.36649C13.5459 3.61992 13.2926 3.81156 13 3.915V7C13 8.5913 12.3679 10.1174 11.2426 11.2426C10.1174 12.3679 8.5913 13 7 13C5.4087 13 3.88258 12.3679 2.75736 11.2426C1.63214 10.1174 1 8.5913 1 7V3.915C0.707422 3.81156 0.454129 3.61992 0.275028 3.36649C0.0959278 3.11306 -0.00016248 2.81033 2.06237e-07 2.5V1.5ZM1.5 3H12.5C12.6326 3 12.7598 2.94732 12.8536 2.85355C12.9473 2.75979 13 2.63261 13 2.5V1.5C13 1.36739 12.9473 1.24021 12.8536 1.14645C12.7598 1.05268 12.6326 1 12.5 1H1.5C1.36739 1 1.24022 1.05268 1.14645 1.14645C1.05268 1.24021 1 1.36739 1 1.5V2.5C1 2.63261 1.05268 2.75979 1.14645 2.85355C1.24022 2.94732 1.36739 3 1.5 3ZM2 4V7C2 8.32608 2.52678 9.59785 3.46447 10.5355C4.40215 11.4732 5.67392 12 7 12C8.32608 12 9.59785 11.4732 10.5355 10.5355C11.4732 9.59785 12 8.32608 12 7V4H2Z"
        fill="#BFBFBF"
      />
    </Svg>
  )
}

function ShareIcon() {
  return (
    <Svg width={10} height={12} viewBox="0 0 10 12" fill="none">
      <Path
        d="M2.136 4.2H0.5V11.2H9.5V4.2H7.864M5 0.7V6.2M6.82 2.375L4.945 0.5L3.07 2.375"
        stroke="#E6E6E6"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function LocationPinIcon() {
  return (
    <Svg width={10} height={14} viewBox="0 0 10 14" fill="none">
      <Path
        d="M5 13C7.5 9.5 9 7 9 5C9 3.94 8.58 2.92 7.83 2.17C7.08 1.42 6.06 1 5 1C3.94 1 2.92 1.42 2.17 2.17C1.42 2.92 1 3.94 1 5C1 7 2.5 9.5 5 13Z"
        stroke="#E6E6E6"
        strokeLinejoin="round"
      />
      <Circle cx={5} cy={5} r={1.5} stroke="#E6E6E6" />
    </Svg>
  )
}

function ClockIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path
        d="M7 13C10.314 13 13 10.314 13 7C13 3.686 10.314 1 7 1C3.686 1 1 3.686 1 7C1 10.314 3.686 13 7 13Z"
        stroke="#E6E6E6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M7 4V7L9 8.5" stroke="#E6E6E6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

const BULLET_POINTS = [
  'Individual breached entrance using physical force.\nDetected tool handling and hurried movements\ninside restricted zone.',
  'Repeated presence in same zone across 3 days',
  'Entry is highly restricted. Access at this hour is\nconsidered abnormal and unauthorized.',
]

const BULLET_GAPS = [47, 74]

export default function IncidentDetailScreen() {
  const router = useRouter()
  // Resolve the incident from the route param so the screen renders the
  // exact alert the user tapped — not hardcoded "Forced Entry / 45%".
  const { id } = useLocalSearchParams<{ id?: string }>()
  const incident = (id ? getIncidentById(id) : undefined) ?? getIncidents()[0]
  const severityColor = SEVERITY_COLORS[incident.severityLevel]

  // Pre-resolve the share file the moment the screen mounts. Without this the
  // first click on Share has to wait for Asset.downloadAsync() + a FileSystem
  // copy, which on a real phone takes 1-2s — long enough for the user to think
  // the button is dead. By caching on mount, the click is effectively instant.
  const cachedShareUriRef = useRef<string | null>(null)
  useEffect(() => {
    if (Platform.OS === 'web') return
    let cancelled = false
    ;(async () => {
      try {
        const asset = Asset.fromModule(incident.thumbnail)
        if (!asset.localUri) await asset.downloadAsync()
        if (cancelled) return
        const localUri = asset.localUri || asset.uri
        const cacheDir = (FileSystem as any).cacheDirectory as string | null
        if (cacheDir && localUri.startsWith('file://')) {
          const safeCam = incident.cameraName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          const target = `${cacheDir}teletraan-${safeCam}.png`
          try {
            await FileSystem.copyAsync({ from: localUri, to: target })
            if (!cancelled) cachedShareUriRef.current = target
            return
          } catch {
            // fall through
          }
        }
        if (!cancelled) cachedShareUriRef.current = localUri
      } catch {
        // pre-cache failed — share path will fall back to the slow download
      }
    })()
    return () => {
      cancelled = true
    }
  }, [incident.thumbnail, incident.cameraName])

  // Video playback state. progressSec is held in state so the slider and time
  // counter re-render together every tick; the interval lives in a ref so we
  // can cancel cleanly when the user toggles or unmounts.
  const [isPlaying, setIsPlaying] = useState(false)
  const [progressSec, setProgressSec] = useState(0)
  const [muted, setMuted] = useState(false)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isPlaying) {
      if (tickRef.current) clearInterval(tickRef.current)
      tickRef.current = null
      return
    }
    tickRef.current = setInterval(() => {
      setProgressSec(p => {
        const next = p + VIDEO_TICK_MS / 1000
        if (next >= VIDEO_DURATION_SEC) {
          setIsPlaying(false)
          return VIDEO_DURATION_SEC
        }
        return next
      })
    }, VIDEO_TICK_MS)
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [isPlaying])

  const togglePlay = () => {
    tapHaptic()
    // Tapping play at the very end restarts from 0 — feels right for a clip.
    if (progressSec >= VIDEO_DURATION_SEC) setProgressSec(0)
    setIsPlaying(p => !p)
  }
  const toggleMute = () => {
    tapHaptic()
    setMuted(m => !m)
  }

  // Share the incident's actual media (the camera's saved still until the
  // backend serves real footage) AND a caption that names the camera the
  // alert came from — "Suspicious activity at the Lobby Cam 2".
  const shareIncidentClip = async () => {
    impactHaptic()
    const caption = `${incident.alertTitle} at the ${incident.cameraName}`
    try {
      // Resolve the asset to a usable URI on whatever platform we're on.
      let uri = ''
      const src = RNImage.resolveAssetSource?.(incident.thumbnail)
      uri = src?.uri ?? Asset.fromModule(incident.thumbnail).uri ?? ''
      if (!uri) return
      if (Platform.OS === 'web' && typeof window !== 'undefined' && uri.startsWith('/')) {
        uri = window.location.origin + uri
      }
      const safeCam = incident.cameraName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const fileName = `teletraan-${safeCam}.png`

      if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
        // Web Share API — attaches the real File so the recipient gets the
        // image itself (plus the caption text in the share payload).
        try {
          const res = await fetch(uri, { mode: 'cors' })
          if (!res.ok) throw new Error(`fetch ${res.status}`)
          const blob = await res.blob()
          const file = new File([blob], fileName, { type: blob.type || 'image/png' })
          const nav = navigator as any
          if (nav.canShare && nav.canShare({ files: [file] })) {
            await nav.share({ files: [file], title: caption, text: caption })
            return
          }
          // Fallback: download the file AND copy the caption to clipboard so
          // when the user pastes into WhatsApp / Mail / etc, the text comes
          // along with the file they manually attach.
          const blobUrl = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = blobUrl
          a.download = fileName
          document.body.appendChild(a)
          a.click()
          a.remove()
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
          try {
            if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(caption)
          } catch {
            // clipboard write blocked (permissions / non-HTTPS) — file still
            // downloads, caption is just not auto-copied.
          }
        } catch {
          window.open(uri, '_blank', 'noopener,noreferrer')
        }
      } else {
        // Native: react-native-share carries both the file AND the caption
        // text in a single share intent — so WhatsApp / Mail / Drive get the
        // image attached with the caption pre-filled in one shot.
        let finalUri = cachedShareUriRef.current
        if (!finalUri) {
          const asset = Asset.fromModule(incident.thumbnail)
          if (!asset.localUri) await asset.downloadAsync()
          finalUri = asset.localUri || asset.uri
        }
        if (finalUri) {
          try {
            await shareMediaNative({ fileUri: finalUri, caption })
          } catch {
            // user dismissed — RNShare throws unless failOnCancel is false
          }
        }
      }
    } catch {
      // User dismissed or platform unavailable — no-op.
    }
  }

  // Slider geometry — keep in sync with the track width below in styles.
  const SLIDER_W = 181
  const SLIDER_THUMB = 14
  const playedFrac = Math.min(1, progressSec / VIDEO_DURATION_SEC)
  const fillW = playedFrac * SLIDER_W
  const thumbLeft = Math.max(0, fillW - SLIDER_THUMB / 2)

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.videoContainer}>
          <Image source={incident.thumbnail} style={styles.videoImage} contentFit="cover" />
          <View style={styles.videoOverlay} />
          <Pressable
            style={({ pressed }) => [styles.playWrap, pressed && { opacity: 0.7 }]}
            onPress={togglePlay}
            hitSlop={10}
          >
            {isPlaying ? <PauseBars /> : <PlayTriangle />}
          </Pressable>
          <View style={styles.videoControls}>
            <View style={styles.sliderTimeBlock}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: fillW }]} />
                <View style={[styles.progressThumb, { left: thumbLeft }]} />
              </View>
              <Text style={styles.videoTime}>{formatTime(progressSec)}</Text>
            </View>
            <Pressable onPress={toggleMute} hitSlop={6}>
              {muted ? <VolumeMutedIcon /> : <VolumeIcon />}
            </Pressable>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.cameraBadge}>
            <GradientStrokeBox width={144} height={32} rx={2} />
            <CameraSurveillanceIcon />
            <Text style={styles.cameraBadgeText} numberOfLines={1}>
              {incident.cameraName}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.7 }]}
            onPress={shareIncidentClip}
          >
            <ShareButtonBackground />
            <ShareIcon />
          </Pressable>
        </View>

        <View style={styles.locationRow}>
          <View style={styles.locationItem}>
            <LocationPinIcon />
            <Text style={styles.locationText}>{incident.location}</Text>
          </View>
          <View style={styles.locationItem}>
            <ClockIcon />
            <Text style={styles.locationText}>{incident.timestamp}</Text>
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.activityRow}>
          <Text style={styles.activityLabel}>Suspicious Activity: </Text>
          <Text style={styles.activityValue} numberOfLines={1} adjustsFontSizeToFit>
            {incident.suspiciousActivity}
          </Text>
        </View>

        <View style={styles.bulletList}>
          {BULLET_POINTS.map((point, i) => (
            <View
              key={i}
              style={[
                styles.bulletItem,
                i < BULLET_POINTS.length - 1 && { marginBottom: BULLET_GAPS[i] },
              ]}
            >
              <View style={styles.bulletDotWrap}>
                <View style={styles.bulletRing} />
                <View style={styles.bulletDot} />
                {i < BULLET_POINTS.length - 1 && <View style={styles.bulletConnector} />}
              </View>
              <Text style={styles.bulletText}>{point}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.threatSection}>
          <View style={styles.threatLabelRow}>
            <Text style={styles.threatLabel}>Threat Score</Text>
            <View style={styles.threatBadge}>
              <Text style={[styles.threatBadgeText, { color: severityColor }]}>
                {incident.severityLevel}
              </Text>
            </View>
          </View>
          <View style={styles.threatBarRow}>
            <View style={styles.threatBarOuter}>
              <Svg width="100%" height={15} viewBox="0 0 270 15" preserveAspectRatio="none">
                <Defs>
                  <LinearGradient
                    id="threatFill"
                    x1="0"
                    y1="0"
                    x2="270"
                    y2="0"
                    gradientUnits="userSpaceOnUse"
                  >
                    <Stop offset="0" stopColor="#12B76A" />
                    <Stop offset="0.5" stopColor="#F79009" />
                    <Stop offset="1" stopColor="#F04438" />
                  </LinearGradient>
                </Defs>
                <Rect x={0} y={0} width={270} height={15} rx={2} fill="#1F1F1F" />
                <Rect
                  x={0}
                  y={0}
                  width={Math.max(0, Math.min(100, incident.threatScorePct)) * 2.7}
                  height={15}
                  rx={2}
                  fill="url(#threatFill)"
                />
              </Svg>
            </View>
            <Text style={styles.threatPercent}>{incident.threatScorePct}%</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.liveBtn, pressed && { opacity: 0.85 }]}
          onPress={() => {
            impactHaptic()
            // Mirror the post-sign-in flow: loading screen, then the view-mode
            // chooser. `pickView=1` forces the chooser open even for returning
            // users who'd already completed it once.
            router.push({
              pathname: '/(auth)/loading',
              params: { next: '/(main)/cameras?pickView=1' },
            })
          }}
        >
          <Text style={styles.liveBtnText}>Watch Live Feed</Text>
        </Pressable>
      </ScrollView>

      {/* Sticky header — sits above the ScrollView so content scrolls beneath
          the dark band, never under or over the back button + title. */}
      <View style={styles.headerFixed} pointerEvents="box-none">
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            onPress={() => {
              tapHaptic()
              if (router.canGoBack()) router.back()
              else router.replace('/(main)/alerts')
            }}
          >
            <GradientStrokeBox width={40} height={40} rx={2} />
            <BackArrowIcon />
          </Pressable>
          <Text style={styles.headerTitle}>Unwanted Object Detected</Text>
        </View>
      </View>

      {/* Drawn-in home indicator — web preview only (real phones show their own). */}
      {Platform.OS === 'web' && (
        <View style={styles.homeIndicator}>
          <View style={styles.homeIndicatorBar} />
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

  headerFixed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 71,
    paddingBottom: 16,
    backgroundColor: '#121212',
    zIndex: 10,
  },
  header: {
    marginHorizontal: 17,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FDA29B',
    fontSize: 18,
    lineHeight: 21.6,
    fontFamily: 'Lato_400Regular',
  },

  scroll: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 34,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  videoContainer: {
    width: 343,
    height: 320,
    marginHorizontal: 16,
    marginTop: 135,
    overflow: 'hidden',
    borderRadius: 2,
    backgroundColor: '#0A0A0A',
  },
  videoImage: { ...StyleSheet.absoluteFillObject },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.30)',
  },
  playWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoControls: {
    position: 'absolute',
    bottom: 13,
    left: 16,
    right: 16,
    height: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sliderTimeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  progressTrack: {
    width: 181,
    height: 6,
    borderRadius: 2,
    backgroundColor: '#A3A3A3',
  },
  progressFill: {
    width: 46,
    height: 6,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  progressThumb: {
    position: 'absolute',
    left: 39,
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.63,
    borderColor: '#A3A3A3',
  },
  videoTime: {
    fontSize: 14,
    color: '#E4E7EC',
    fontFamily: 'Lato_400Regular',
    lineHeight: 16.8,
  },

  metaRow: {
    width: 343,
    marginHorizontal: 16,
    marginTop: 16,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cameraBadge: {
    width: 144,
    height: 32,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    gap: 12,
  },
  cameraBadgeText: {
    color: '#BFBFBF',
    fontSize: 12,
    fontFamily: 'Lato_400Regular',
    lineHeight: 14.4,
  },
  shareBtn: {
    width: 40,
    height: 36,
    borderRadius: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  locationRow: {
    width: 343,
    marginHorizontal: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  locationItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationText: {
    color: '#A3A3A3',
    fontSize: 16,
    fontFamily: 'Lato_400Regular',
    lineHeight: 19.2,
  },

  sectionDivider: {
    width: 343,
    marginHorizontal: 16,
    marginVertical: 16,
    height: 1,
    backgroundColor: '#3D3D3D',
  },

  activityRow: {
    width: 343,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityLabel: {
    color: '#A3A3A3',
    fontSize: 14,
    fontFamily: 'Lato_400Regular',
    lineHeight: 17,
  },
  activityValue: {
    flex: 1,
    color: '#E4E7EC',
    fontSize: 14,
    fontFamily: 'Lato_400Regular',
    lineHeight: 17,
  },

  bulletList: {
    width: 343,
    marginHorizontal: 16,
    marginTop: 19,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletDotWrap: {
    width: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  bulletRing: {
    position: 'absolute',
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 0.6,
    borderColor: '#F04438',
  },
  bulletDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#F04438',
  },
  bulletConnector: {
    position: 'absolute',
    top: 28,
    left: 8,
    width: 1,
    height: 54,
    backgroundColor: '#3D3D3D',
  },
  bulletText: {
    flex: 1,
    color: '#A3A3A3',
    fontSize: 14,
    fontFamily: 'Lato_400Regular_Italic',
    lineHeight: 16.8,
  },

  threatSection: {
    width: 343,
    marginHorizontal: 16,
  },
  threatLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 22,
    gap: 4,
  },
  threatLabel: {
    color: '#A3A3A3',
    fontSize: 14,
    fontFamily: 'Lato_400Regular',
    lineHeight: 16.8,
    marginRight: 4,
  },
  threatBadge: {
    width: 72,
    height: 22,
    borderRadius: 2,
    backgroundColor: '#2E2E2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  threatBadgeText: {
    color: '#E4E7EC',
    fontSize: 12,
    fontFamily: 'Lato_400Regular',
    lineHeight: 14.4,
  },
  threatBarRow: {
    width: 343,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  threatBarOuter: { flex: 1, height: 15 },
  threatPercent: {
    width: 46,
    color: '#F2F4F7',
    fontSize: 16,
    fontFamily: 'Lato_400Regular',
    lineHeight: 19.2,
    textAlign: 'right',
  },

  // #242424 line only on right+bottom; top-left = soft #707070 inner-shadow emboss
  liveBtn: {
    width: 343,
    marginHorizontal: 16,
    marginTop: 28,
    height: 40,
    backgroundColor: '#A3A3A3',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: '#242424',
    borderBottomColor: '#242424',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: 'inset 4px 4px 4px 0 rgba(112,112,112,1), 0 0 5px 0 rgba(163,163,163,0.5)',
      },
      default: {
        shadowColor: '#A3A3A3',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 4,
      },
    }),
  },
  liveBtnText: {
    color: '#262626',
    fontSize: 14,
    fontFamily: 'Lato_400Regular',
    lineHeight: 16.8,
  },

  homeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 375,
    height: 34,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeIndicatorBar: {
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    marginTop: 15,
  },
})
