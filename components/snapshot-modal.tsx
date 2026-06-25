import { View, Text, StyleSheet, Pressable, Platform, Modal, Alert } from 'react-native'
import { Image } from 'expo-image'
import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import { BlurView } from 'expo-blur'
import {
  GradientStrokeBox,
  GradientFillBox,
  STROKE_LINEAR_2,
  LINEAR_BG4_STROKE,
} from './gradient-stroke-box'
import { tapHaptic, impactHaptic } from '../lib/haptics'

// Resolves a `require()`d asset to a string URI we can hand to the browser
// for download or to the native Share sheet. expo-asset handles both native
// (number asset id → URI) and web (require() → URL string) uniformly.
const resolveAssetUri = (asset: number | string | { uri?: string }): string => {
  if (typeof asset === 'string') return asset
  if (asset && typeof asset === 'object' && 'uri' in asset && asset.uri) return asset.uri
  try {
    return Asset.fromModule(asset as number).uri ?? ''
  } catch {
    return ''
  }
}

interface SnapshotModalProps {
  visible: boolean
  onClose: () => void
  source: number
  dateLabel: string
  timeLabel: string
}

export default function SnapshotModal({
  visible,
  onClose,
  source,
  dateLabel,
  timeLabel,
}: SnapshotModalProps) {
  const onDownload = async () => {
    impactHaptic()
    const fileName = `snapshot-${dateLabel}-${timeLabel}.png`.replace(/[ ,:]/g, '-')
    let uri = resolveAssetUri(source)
    if (!uri) return
    // Some Metro asset URIs come back relative; absolutise for fetch().
    if (Platform.OS === 'web' && typeof window !== 'undefined' && uri.startsWith('/')) {
      uri = window.location.origin + uri
    }

    // Modal stays open after the download — the user can re-download or keep
    // reviewing the snapshot, and only Cancel / backdrop tap closes it.
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        const res = await fetch(uri, { mode: 'cors' })
        if (!res.ok) throw new Error(`fetch ${res.status}`)
        const blob = await res.blob()
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
      } catch {
        // Fallback: open the asset in a new tab — user can right-click → Save
        window.open(uri, '_blank', 'noopener,noreferrer')
      }
    } else {
      // Native: save the snapshot directly to the device's Photos gallery.
      try {
        const perm = await MediaLibrary.requestPermissionsAsync(true)
        if (!perm.granted) {
          Alert.alert('Permission needed', 'Allow photo access to save snapshots.')
          return
        }
        const asset = Asset.fromModule(source as number)
        if (!asset.localUri) await asset.downloadAsync()
        const fileUri = asset.localUri || asset.uri
        if (!fileUri) throw new Error('no local uri')
        await MediaLibrary.saveToLibraryAsync(fileUri)
        Alert.alert('Saved', 'Snapshot saved to your photos.')
      } catch {
        Alert.alert('Download failed', 'Could not save the snapshot.')
      }
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
        {/* Card itself stops the tap so it doesn't close-on-tap when pressed. */}
        <Pressable style={styles.card} onPress={e => e.stopPropagation?.()}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Snapshot</Text>
            <Pressable
              style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}
              onPress={() => {
                tapHaptic()
                onClose()
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
              <GradientStrokeBox
                width={90}
                height={25}
                rx={2}
                strokeWidth={1}
                gradient={STROKE_LINEAR_2}
              />
            </Pressable>
          </View>

          <View style={styles.imageFrame}>
            <Image source={source} style={styles.image} contentFit="cover" />
            <View style={styles.metaRow}>
              {/* Date pill — Figma 65 × 17 scaled to 76 × 20 for the wider mobile
                  modal. Uses the 0.7-alpha BG4 gradient so the pill reads as
                  the lighter mid-grey shown in Figma rather than a heavy dark block. */}
              <View style={styles.metaPillDate}>
                <GradientFillBox width={76} height={20} rx={2} gradient={LINEAR_BG4_STROKE} />
                <Text style={styles.metaText}>{dateLabel}</Text>
              </View>
              {/* Time pill — Figma 49 × 17 scaled to 57 × 20, same translucent gradient. */}
              <View style={styles.metaPillTime}>
                <GradientFillBox width={57} height={20} rx={2} gradient={LINEAR_BG4_STROKE} />
                <Text style={styles.metaText}>{timeLabel}</Text>
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.downloadBtn, pressed && { opacity: 0.85 }]}
            onPress={onDownload}
          >
            <Text style={styles.downloadText}>Download</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma Frame 524 — 295 × 375 scaled to 343 × 437 so the modal fills the
  // mobile content width with no visible page background on the left/right.
  card: {
    width: 343,
    minHeight: 437,
    backgroundColor: '#121212',
    borderRadius: 3,
    overflow: 'hidden',
  },

  // Figma Frame 526 — 263×25 at (16,16).
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    height: 41,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Lato_400Regular',
    lineHeight: 19.2,
  },
  // Figma Frame 39 — 90×25, BG1 fill + gloss stroke, rx 2.
  cancelBtn: {
    width: 90,
    height: 25,
    borderRadius: 2,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cancelText: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Lato_400Regular',
  },

  // Figma Frame 525 — 263 × 238 scaled to 311 × 277 to match the wider modal.
  imageFrame: {
    marginTop: 20,
    marginHorizontal: 16,
    width: 311,
    height: 277,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  // Figma Frame 177 — date + time pills sit 10px in from the image's top corners.
  metaRow: {
    position: 'absolute',
    top: 10,
    left: 13,
    right: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Padding is inside the gradient via centred text.
  metaPillDate: {
    width: 76,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  metaPillTime: {
    width: 57,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  metaText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
    lineHeight: 13,
  },

  // Figma Frame 10 — 140 × 40 scaled to 163 × 47 for the wider modal. Same
  // embossed treatment as the onboarding "Get Started" button.
  downloadBtn: {
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 16,
    width: 163,
    height: 47,
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
  downloadText: {
    color: '#262626',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Lato_400Regular',
  },
})
