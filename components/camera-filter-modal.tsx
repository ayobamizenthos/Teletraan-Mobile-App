import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'
import { useState } from 'react'
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg'
import { BlurView } from 'expo-blur'
import { GradientStrokeBox } from './gradient-stroke-box'
import { tapHaptic, impactHaptic } from '../lib/haptics'

type FilterMode = 'Camera' | 'Location'

function LinearBG4Fill({ width, height, rx }: { width: number; height: number; rx: number }) {
  const a = 1.59 * width
  const b = 2.37 * height
  const c = -1.19 * width
  const d = 0.82 * height
  const e = 0.07 * width
  const f = 0.49 * height
  return (
    <Svg style={StyleSheet.absoluteFill} width={width} height={height} pointerEvents="none">
      <Defs>
        <SvgLinearGradient
          id="cfModalFill"
          x1={0}
          y1={0}
          x2={1}
          y2={0}
          gradientUnits="userSpaceOnUse"
          gradientTransform={`matrix(${a} ${b} ${c} ${d} ${e} ${f})`}
        >
          <Stop offset={0} stopColor="#1F1F1F" stopOpacity={0.5} />
          <Stop offset={1} stopColor="#707070" stopOpacity={0.5} />
        </SvgLinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} rx={rx} fill="url(#cfModalFill)" />
    </Svg>
  )
}

// Each chip's absolute (x,y) within the card, plus exact width
interface ChipSpec {
  id: string
  label: string
  x: number
  y: number
  w: number
}
const INITIAL_CAMERA_CHIPS: ChipSpec[] = [
  { id: 'car-park-1', label: 'Car Park Cam', x: 16, y: 121, w: 113 },
  { id: 'staff-room-cam', label: 'Staff room cam', x: 138, y: 121, w: 113 },
  { id: 'park-c', label: 'Park Cam2', x: 16, y: 171, w: 99 },
  { id: 'reception', label: 'Reception Cam', x: 124, y: 171, w: 113 },
  { id: 'toilet-1', label: 'Toilet Cam', x: 245, y: 171, w: 83 },
  { id: 'staff-room', label: 'Staff Room', x: 16, y: 221, w: 113 },
  { id: 'lodge', label: 'Lodge Cam', x: 138, y: 221, w: 113 },
  { id: 'gate', label: 'Gate Cam', x: 16, y: 271, w: 99 },
  { id: 'products', label: 'Products room', x: 123, y: 271, w: 110 },
  { id: 'toilet-2', label: 'Toilet Cam', x: 241, y: 271, w: 83 },
  { id: 'car-park-2', label: 'Car Park Cam', x: 16, y: 321, w: 113 },
  { id: 'cafe', label: 'Cafe', x: 138, y: 321, w: 113 },
]

const INITIAL_LOCATION_CHIPS: ChipSpec[] = [
  { id: 'loc-office-2-lobby', label: 'Office-2 Lobby', x: 16, y: 121, w: 122 },
  { id: 'loc-server-room', label: 'Server Room', x: 147, y: 121, w: 110 },
  { id: 'loc-production', label: 'Production Room', x: 16, y: 171, w: 130 },
  { id: 'loc-main-entrance', label: 'Main Entrance', x: 155, y: 171, w: 120 },
  { id: 'loc-parking-lot-a', label: 'Parking Lot A', x: 16, y: 221, w: 113 },
  { id: 'loc-loading-dock', label: 'Loading Dock', x: 138, y: 221, w: 113 },
  { id: 'loc-reception', label: 'Reception', x: 16, y: 271, w: 99 },
  { id: 'loc-cafeteria', label: 'Cafeteria', x: 124, y: 271, w: 93 },
  { id: 'loc-conference', label: 'Conference Hall', x: 16, y: 321, w: 130 },
  { id: 'loc-warehouse', label: 'Warehouse', x: 155, y: 321, w: 100 },
]

// Public payload shape: consumer screens (cameras / single-camera-view) only
// need the human-readable name + which list it came from.
export interface FilterSelection {
  id: string
  label: string
  mode: FilterMode
}

function ChevronDownIcon() {
  return (
    <Svg width={12} height={7} viewBox="0 0 12 7" fill="none">
      <Path d="M0 0.876L0.876 0L6 5.168L11.124 0L12 0.876L6 6.876L0 0.876Z" fill="#E4E7EC" />
    </Svg>
  )
}

function CheckmarkIcon() {
  return (
    <Svg width={9} height={7} viewBox="0 0 9 7" fill="none">
      <Path
        d="M0.5 3.83333L3.7 6.5L8.5 0.5"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

interface CameraFilterModalProps {
  onClose: () => void
  onApply: (selections: FilterSelection[]) => void
  /** When true, shows "Choose up to 4 Cameras (Max: 4)" helper text (Quad Grid filter variant) */
  showHelper?: boolean
  /** Current selections — reopen the modal in the same state the user last applied. */
  initialSelections?: FilterSelection[]
}

export default function CameraFilterModal({
  onClose,
  onApply,
  showHelper = false,
  initialSelections = [],
}: CameraFilterModalProps) {
  // Seed mode + selected set from whatever was active when the modal opened.
  // If the user re-opens after applying, they see their choices already ticked.
  const seededMode: FilterMode = initialSelections[0]?.mode ?? 'Camera'
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelections.map(s => s.id))
  )
  const [mode, setMode] = useState<FilterMode>(seededMode)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Max 4 cameras can be selected when the helper "Choose up to 4" is shown (Quad variant)
  // Single variant has no helper and only allows 1 selection
  const maxSelections = showHelper ? 4 : 1

  const chips = mode === 'Camera' ? INITIAL_CAMERA_CHIPS : INITIAL_LOCATION_CHIPS
  const chipById = new Map(chips.map(c => [c.id, c]))

  const toggleChip = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        return next
      }
      if (next.size >= maxSelections) {
        // Enforce limit — don't add beyond max
        return prev
      }
      next.add(id)
      return next
    })
  }

  // Card height differs by variant — single (454) vs quad with helper (499)
  const CARD_H = showHelper ? 499 : 454
  // y offsets shift by 33 (helper height + gap) when helper is visible
  const HELPER_OFFSET = showHelper ? 33 : 0

  return (
    <View style={styles.backdrop}>
      <View style={[styles.card, { height: CARD_H }]}>
        {/* Backdrop blur — sits behind gradient fill */}
        <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearBG4Fill width={343} height={CARD_H} rx={3} />
        <GradientStrokeBox width={343} height={CARD_H} rx={3} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Filter</Text>
          <Pressable
            style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}
            onPress={() => {
              tapHaptic()
              onClose()
            }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
            <GradientStrokeBox width={90} height={25} rx={2} strokeWidth={0.8} />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <Pressable
          style={({ pressed }) => [styles.dropdownPill, pressed && { opacity: 0.85 }]}
          onPress={() => {
            tapHaptic()
            setDropdownOpen(o => !o)
          }}
        >
          <Text style={styles.dropdownText} numberOfLines={1}>
            {mode}
          </Text>
          <ChevronDownIcon />
        </Pressable>

        {/* Dropdown menu — shows ONLY the OTHER option (the one user can switch TO) */}
        {dropdownOpen && (
          <View style={styles.dropdownMenu}>
            <Pressable
              style={({ pressed }) => [styles.dropdownItem, pressed && { opacity: 0.7 }]}
              onPress={() => {
                tapHaptic()
                setMode(mode === 'Camera' ? 'Location' : 'Camera')
                // Switching modes wipes the prior selection — the two lists
                // refer to different things and shouldn't bleed into each other.
                setSelected(new Set())
                setDropdownOpen(false)
              }}
            >
              <Text style={styles.dropdownItemText}>
                {mode === 'Camera' ? 'Location' : 'Camera'}
              </Text>
            </Pressable>
          </View>
        )}

        {showHelper && (
          <Text style={styles.helperText}>
            {mode === 'Camera'
              ? 'Choose up to 4 Cameras (Max: 4)'
              : 'Choose up to 4 Locations (Max: 4)'}
          </Text>
        )}

        {chips.map(chip => {
          const isSelected = selected.has(chip.id)
          return (
            <Pressable
              key={chip.id}
              style={({ pressed }) => [
                styles.chipBase,
                {
                  left: chip.x,
                  top: chip.y + HELPER_OFFSET,
                  width: chip.w,
                },
                isSelected && styles.chipActive,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => {
                tapHaptic()
                toggleChip(chip.id)
              }}
            >
              <Text
                numberOfLines={1}
                style={[styles.chipText, isSelected && styles.chipTextActive]}
              >
                {chip.label}
              </Text>
              {isSelected && (
                <View style={styles.chipCheck}>
                  <CheckmarkIcon />
                </View>
              )}
              {!isSelected && <GradientStrokeBox width={chip.w} height={37} rx={3} />}
            </Pressable>
          )
        })}

        {/* Bottom buttons — y=398 (or 431 if helper) */}
        <View style={[styles.bottomBar, { top: 398 + HELPER_OFFSET }]}>
          <Pressable
            style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.7 }]}
            onPress={() => {
              tapHaptic()
              // Clear only wipes the current selection + tells the parent to
              // drop its active-filter pill state. It does NOT close the
              // modal — only Cancel / View Selected dismiss.
              setSelected(new Set())
              onApply([])
            }}
          >
            <Text style={styles.clearBtnText}>Clear</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.viewBtn, pressed && { opacity: 0.85 }]}
            onPress={() => {
              impactHaptic()
              const payload: FilterSelection[] = Array.from(selected).flatMap(id => {
                const chip = chipById.get(id)
                return chip ? [{ id: chip.id, label: chip.label, mode }] : []
              })
              onApply(payload)
              onClose()
            }}
          >
            <Text style={styles.viewBtnText}>View Selected</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 375,
    height: 812,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  card: {
    width: 343,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },

  header: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 311,
    height: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#F3F4F7',
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 21.6,
    fontFamily: 'Lato_400Regular',
  },
  cancelBtn: {
    width: 90,
    height: 25,
    borderRadius: 2,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: '#F9FAFB',
    fontSize: 14,
    lineHeight: 16.8,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },

  divider: {
    position: 'absolute',
    top: 57,
    left: 16,
    width: 311,
    height: 1,
    backgroundColor: '#3D3D3D',
  },

  // Camera/Location dropdown pill — width hugs the label + chevron so longer
  // labels like "Location" don't push the chevron out of the pill.
  dropdownPill: {
    position: 'absolute',
    top: 73,
    left: 16,
    height: 32,
    minWidth: 102,
    backgroundColor: '#1F1F1F',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#2E2E2E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  dropdownText: {
    color: '#F3F4F7',
    fontSize: 16,
    lineHeight: 19.2,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },
  // Dropdown menu — sits directly below the pill (no gap). Width matches the
  // pill's hug-content size, so the menu lines up under both labels.
  dropdownMenu: {
    position: 'absolute',
    top: 105,
    left: 16,
    minWidth: 102,
    backgroundColor: '#1F1F1F',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#2E2E2E',
    zIndex: 10,
    alignSelf: 'flex-start',
  },
  dropdownItem: {
    height: 32,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  dropdownItemText: {
    color: '#F3F4F7',
    fontSize: 16,
    lineHeight: 19.2,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#3D3D3D',
  },

  helperText: {
    position: 'absolute',
    top: 121,
    left: 16,
    width: 312,
    color: '#E4E7EC',
    fontSize: 14,
    lineHeight: 16.8,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },

  chipBase: {
    position: 'absolute',
    height: 37,
    borderRadius: 3,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  chipActive: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  chipText: {
    color: '#BFBFBF',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 16.8,
    fontFamily: 'Lato_400Regular',
    textAlign: 'center',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipCheck: {
    width: 9,
    height: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    width: 343,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  // Fill: NONE | Stroke: SOLID #A3A3A3 1px INSIDE all 4 sides | No corner radius | No effects
  clearBtn: {
    width: 110,
    height: 40,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A3A3A3',
    backgroundColor: 'transparent',
  },
  clearBtnText: {
    color: '#A3A3A3',
    fontSize: 14,
    lineHeight: 16.8,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },
  // Get Started/Continue/Sign in: fill #A3A3A3, #242424 line only on right+bottom,
  // soft #707070 inner-shadow emboss (positive offset 4,4) + light drop shadow.
  viewBtn: {
    width: 140,
    height: 40,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A3A3A3',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: '#242424',
    borderBottomColor: '#242424',
    ...Platform.select({
      web: {
        boxShadow: 'inset 4px 4px 4px 0 rgba(112,112,112,1), 0 0 5px 0 rgba(163,163,163,0.5)',
      } as any,
      default: {
        shadowColor: '#A3A3A3',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 4,
      },
    }),
  },
  viewBtnText: {
    color: '#262626',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 16.8,
    fontFamily: 'Lato_400Regular',
  },
})
