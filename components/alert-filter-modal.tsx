import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput } from 'react-native'
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg'
import { BlurView } from 'expo-blur'
import { GradientStrokeBox, AutoGradientStrokeBox } from './gradient-stroke-box'
import { getActiveFilters, setActiveFilters, EMPTY_FILTERS } from '../store/filters'
import { tapHaptic, impactHaptic } from '../lib/haptics'
import { getIncidentCameraOptions, getIncidentLocationOptions } from '../lib/api/alerts'
import { INCIDENTS, SEVERITY_SCORE } from '../lib/data/alerts'

type FilterChip = { id: string; label: string; selected: boolean }

function ClockInputIcon() {
  return (
    <Svg width={17} height={17} viewBox="0 0 17 17" fill="none">
      <Path
        d="M8.5 0.5C4.08333 0.5 0.5 4.08333 0.5 8.5C0.5 12.9167 4.08333 16.5 8.5 16.5C12.9167 16.5 16.5 12.9167 16.5 8.5C16.5 4.08333 12.9167 0.5 8.5 0.5Z"
        stroke="#E6E6E6"
        strokeMiterlimit={10}
      />
      <Path
        d="M8.5 3.16675V9.16675H12.5"
        stroke="#E6E6E6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

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
          id="filterModalFill"
          x1={0}
          y1={0}
          x2={1}
          y2={0}
          gradientUnits="userSpaceOnUse"
          gradientTransform={`matrix(${a} ${b} ${c} ${d} ${e} ${f})`}
        >
          <Stop offset={0} stopColor="#1F1F1F" stopOpacity={0.6} />
          <Stop offset={1} stopColor="#707070" stopOpacity={0.6} />
        </SvgLinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} rx={rx} fill="url(#filterModalFill)" />
    </Svg>
  )
}

// Camera / Location chip lists come from the actual incident list so every
// selection is guaranteed to find at least one alert. Tags stay hardcoded
// (they're abstract event types — Weapon, Multiple Persons, etc.) and are
// matched against the alertTitle text at filter time.
const cameraOpts = getIncidentCameraOptions()
const locationOpts = getIncidentLocationOptions()

export const ALERT_FILTER_CAMERAS: FilterChip[] = cameraOpts.map(o => ({
  ...o,
  selected: false,
}))
export const ALERT_FILTER_LOCATIONS: FilterChip[] = locationOpts.map(o => ({
  ...o,
  selected: false,
}))
export const ALERT_FILTER_TAGS: FilterChip[] = [
  { id: 'unknown-face', label: 'Unknown Face', selected: false },
  { id: 'known-face', label: 'Known Face', selected: false },
  { id: 'weapon', label: 'Weapon detected', selected: false },
  { id: 'multiple-persons', label: 'Multiple Persons', selected: false },
  { id: 'object-moved', label: 'Object Moved', selected: false },
  { id: 'gate-opened', label: 'Gate Opened', selected: false },
]

// Typed MM/DD/YY field with the existing clock icon — same look across web
// and native, just an editable TextInput now (auto-inserts the slashes).
function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.dateInput}>
      <TextInput
        style={styles.dateInputText}
        value={value}
        onChangeText={raw => {
          // Strip everything except digits, then format MM/DD/YY as user types.
          const digits = raw.replace(/\D/g, '').slice(0, 6)
          let out = digits
          if (digits.length > 4)
            out = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
          else if (digits.length > 2) out = `${digits.slice(0, 2)}/${digits.slice(2)}`
          onChange(out)
        }}
        placeholder="MM/DD/YY"
        placeholderTextColor="#A3A3A3"
        keyboardType="number-pad"
        maxLength={8}
      />
      <View style={styles.dateInputIcon}>
        <ClockInputIcon />
      </View>
      <GradientStrokeBox width={143} height={40} rx={0} />
    </View>
  )
}

// Small inline check used inside an active filter chip.
function ChipCheck() {
  return (
    <Svg width={11} height={9} viewBox="0 0 11 9" fill="none">
      <Path
        d="M1 4.5L4 7.5L10 1.5"
        stroke="#FFFFFF"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipActive,
        pressed && { opacity: 0.7 },
      ]}
      onPress={() => {
        tapHaptic()
        onPress()
      }}
    >
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
      {/* Active state: clear white check on the right + the solid white
          border applied via styles.chipActive — no gradient overlay so the
          visual change is obvious. Inactive: subtle gradient ring. */}
      {selected ? (
        <ChipCheck />
      ) : (
        // Auto-fit the gradient ring to whatever width the label requires,
        // so longer labels (Courtyard Cam 1, Parking Garage, etc.) don't get
        // a stroke that clips short of their right edge.
        <AutoGradientStrokeBox rx={3} strokeWidth={1} />
      )}
    </Pressable>
  )
}

interface AlertFilterModalProps {
  onClose: () => void
}

export default function AlertFilterModal({ onClose }: AlertFilterModalProps) {
  const [cameras, setCameras] = useState<FilterChip[]>(() => {
    const stored = getActiveFilters().cameras
    return ALERT_FILTER_CAMERAS.map(c => ({ ...c, selected: stored.includes(c.id) }))
  })
  const [locations, setLocations] = useState<FilterChip[]>(() => {
    const stored = getActiveFilters().locations
    return ALERT_FILTER_LOCATIONS.map(c => ({ ...c, selected: stored.includes(c.id) }))
  })
  const [tags, setTags] = useState<FilterChip[]>(() => {
    const stored = getActiveFilters().tags
    return ALERT_FILTER_TAGS.map(c => ({ ...c, selected: stored.includes(c.id) }))
  })
  const [threatLevel, setThreatLevel] = useState(() => getActiveFilters().threatLevel)
  const [dateFrom, setDateFrom] = useState(() => getActiveFilters().dateFrom)
  const [dateTo, setDateTo] = useState(() => getActiveFilters().dateTo)
  const [hour, setHour] = useState(() => getActiveFilters().hour)
  const [minute, setMinute] = useState(() => getActiveFilters().minute)
  const [second, setSecond] = useState(() => getActiveFilters().second)
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(() => getActiveFilters().ampm)
  const [trackWidth, setTrackWidth] = useState(0)

  // Parses an incident's timestamp like "1:42 AM, 07-19-25" into the
  // four pieces the modal binds to (hour / minute / ampm + MM/DD/YY date).
  const parseIncidentTimestamp = (timestamp: string) => {
    const m = /^(\d{1,2}):(\d{2})\s*(am|pm),\s*(\d{2})-(\d{2})-(\d{2})$/i.exec(timestamp)
    if (!m) return null
    return {
      hour: m[1].padStart(2, '0'),
      minute: m[2],
      ampm: m[3].toUpperCase() as 'AM' | 'PM',
      mdy: `${m[4]}/${m[5]}/${m[6]}`,
    }
  }

  // When the user picks a camera/location chip, the matching incident's
  // threat level + time + date auto-populate so they don't have to enter
  // them manually. Toggling the chip OFF doesn't wipe the auto-fill — user
  // can clear those fields themselves (or hit Clear).
  const autoFillFromIncident = (kind: 'camera' | 'location', label: string) => {
    const inc = INCIDENTS.find(i =>
      kind === 'camera'
        ? i.cameraName.toLowerCase() === label.toLowerCase()
        : i.location.toLowerCase() === label.toLowerCase()
    )
    if (!inc) return
    setThreatLevel(SEVERITY_SCORE[inc.severityLevel])
    const parsed = parseIncidentTimestamp(inc.timestamp)
    if (parsed) {
      setHour(parsed.hour)
      setMinute(parsed.minute)
      // Incident timestamps don't include seconds — default to "00" so the
      // Second field is filled and the active-filter pill stays consistent.
      setSecond('00')
      setAmpm(parsed.ampm)
      setDateFrom(parsed.mdy)
      setDateTo(parsed.mdy)
    }
  }

  const toggleChip = (
    list: FilterChip[],
    setList: (v: FilterChip[]) => void,
    id: string,
    kind?: 'camera' | 'location'
  ) => {
    const target = list.find(c => c.id === id)
    const next = list.map(c => (c.id === id ? { ...c, selected: !c.selected } : c))
    setList(next)
    // Toggling ON a camera or location → auto-fill from the matching incident.
    if (target && !target.selected && kind) autoFillFromIncident(kind, target.label)
  }

  const clearAll = () => {
    setCameras(ALERT_FILTER_CAMERAS)
    setLocations(ALERT_FILTER_LOCATIONS)
    setTags(ALERT_FILTER_TAGS)
    setThreatLevel(0)
    setDateFrom('')
    setDateTo('')
    setHour('')
    setMinute('')
    setSecond('')
    setAmpm('AM')
  }

  const applyFilters = () => {
    setActiveFilters({
      cameras: cameras.filter(c => c.selected).map(c => c.id),
      locations: locations.filter(c => c.selected).map(c => c.id),
      tags: tags.filter(c => c.selected).map(c => c.id),
      threatLevel,
      dateFrom,
      dateTo,
      hour,
      minute,
      second,
      ampm,
    })
    onClose()
  }

  const renderChipRow = (
    chips: FilterChip[],
    setList: (v: FilterChip[]) => void,
    kind?: 'camera' | 'location'
  ) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      {chips.map(c => (
        <Chip
          key={c.id}
          label={c.label}
          selected={c.selected}
          onPress={() => toggleChip(chips, setList, c.id, kind)}
        />
      ))}
    </ScrollView>
  )

  return (
    <View style={styles.backdrop}>
      {/* Subtle backdrop. iOS uses its native blur; on Android the default
          path is a flat dark tint (intentional — dimezisBlurView reaches
          past the modal bounds and blurs the whole screen). */}
      {Platform.OS !== 'web' && (
        <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
      )}
      <View style={styles.card}>
        <LinearBG4Fill width={343} height={757} rx={3} />
        <GradientStrokeBox width={343} height={757} rx={3} />

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

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Camera</Text>
            {renderChipRow(cameras, setCameras, 'camera')}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Location</Text>
            {renderChipRow(locations, setLocations, 'location')}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Threat Level</Text>
            <View style={styles.threatSliderArea}>
              <Pressable
                style={styles.sliderTrackWrap}
                onLayout={e => setTrackWidth(e.nativeEvent.layout.width)}
                onPress={e => {
                  if (trackWidth > 0) {
                    const pct = Math.min(
                      100,
                      Math.max(0, Math.round((e.nativeEvent.locationX / trackWidth) * 100))
                    )
                    setThreatLevel(pct)
                  }
                }}
              >
                <View style={styles.sliderTrack} />
                <View style={[styles.sliderFill, { width: `${threatLevel}%` as any }]} />
                <View
                  style={[
                    styles.sliderThumb,
                    {
                      left:
                        trackWidth > 0
                          ? Math.max(
                              0,
                              Math.min(trackWidth - 12, (threatLevel / 100) * trackWidth - 6)
                            )
                          : 0,
                    },
                  ]}
                />
              </Pressable>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>0%</Text>
                <Text style={styles.sliderLabel}>50%</Text>
                <Text style={styles.sliderLabel}>100%</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tags</Text>
            {renderChipRow(tags, setTags)}
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.sectionLabel}>Date from</Text>
              <DateField value={dateFrom} onChange={setDateFrom} />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.sectionLabel}>Date to</Text>
              <DateField value={dateTo} onChange={setDateTo} />
            </View>
          </View>

          <View style={styles.timeSection}>
            <Text style={styles.sectionLabel}>Time</Text>
            <View style={styles.timeRow}>
              <View style={styles.timeGroup}>
                <Text style={styles.timeUnitLabel}>Hour</Text>
                <View style={styles.timeBox}>
                  <TextInput
                    style={styles.timeInput}
                    value={hour}
                    onChangeText={setHour}
                    maxLength={2}
                    keyboardType="number-pad"
                    placeholderTextColor="#575757"
                  />
                  <GradientStrokeBox width={60} height={59} rx={1.71} strokeWidth={0.26} />
                </View>
              </View>
              <View style={styles.timeColon}>
                <Text style={styles.timeColonText}>:</Text>
              </View>
              <View style={styles.timeGroup}>
                <Text style={styles.timeUnitLabel}>Minute</Text>
                <View style={styles.timeBox}>
                  <TextInput
                    style={styles.timeInput}
                    value={minute}
                    onChangeText={setMinute}
                    maxLength={2}
                    keyboardType="number-pad"
                    placeholderTextColor="#575757"
                  />
                  <GradientStrokeBox width={60} height={59} rx={1.71} strokeWidth={0.26} />
                </View>
              </View>
              <View style={styles.timeColon}>
                <Text style={styles.timeColonText}>:</Text>
              </View>
              <View style={styles.timeGroup}>
                <Text style={styles.timeUnitLabel}>Second</Text>
                <View style={styles.timeBox}>
                  <TextInput
                    style={styles.timeInput}
                    value={second}
                    onChangeText={setSecond}
                    maxLength={2}
                    keyboardType="number-pad"
                    placeholderTextColor="#575757"
                  />
                  <GradientStrokeBox width={60} height={59} rx={1.71} strokeWidth={0.26} />
                </View>
              </View>
              <View style={styles.ampmGroup}>
                <Pressable
                  style={({ pressed }) => [
                    styles.ampmBtn,
                    ampm === 'AM' && styles.ampmBtnActive,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => {
                    tapHaptic()
                    setAmpm('AM')
                  }}
                >
                  <Text style={[styles.ampmText, ampm === 'AM' && styles.ampmTextActive]}>AM</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.ampmBtn,
                    ampm === 'PM' && styles.ampmBtnActive,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => {
                    tapHaptic()
                    setAmpm('PM')
                  }}
                >
                  <Text style={[styles.ampmText, ampm === 'PM' && styles.ampmTextActive]}>PM</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomBar}>
          <Pressable
            style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.7 }]}
            onPress={() => {
              tapHaptic()
              // Clear resets every chip + scalar + pushes the cleared state
              // to the global store so the active-filter pill drops the check.
              // It does NOT close the modal — only Cancel / View Selected do.
              clearAll()
              setActiveFilters({ ...EMPTY_FILTERS })
            }}
          >
            <Text style={styles.clearBtnText}>Clear</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.viewBtn, pressed && { opacity: 0.85 }]}
            onPress={() => {
              impactHaptic()
              applyFilters()
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
  // Full-screen overlay covering the parent (alerts) screen
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 375,
    height: 812,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  card: {
    width: 343,
    height: 757,
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
    fontFamily: 'Lato_400Regular',
  },

  divider: {
    position: 'absolute',
    top: 53,
    left: 16,
    width: 311,
    height: 1,
    backgroundColor: '#3D3D3D',
  },

  content: {
    position: 'absolute',
    top: 73,
    left: 16,
    width: 318,
    gap: 24,
  },

  section: {
    gap: 12,
  },
  sectionLabel: {
    color: '#E4E7EC',
    fontSize: 16,
    lineHeight: 19.2,
    fontFamily: 'Lato_400Regular',
  },

  chipRow: {
    flexDirection: 'row',
    gap: 24,
  },
  chip: {
    height: 37,
    paddingHorizontal: 14,
    borderRadius: 3,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  // Active state — clear white 1px border + darker BG3 fill so the chip is
  // unmistakably "on". The inactive state keeps the gradient ring.
  chipActive: {
    backgroundColor: '#2E2E2E',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  chipText: {
    color: '#BFBFBF',
    fontSize: 14,
    lineHeight: 16.8,
    fontFamily: 'Lato_400Regular',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  threatSliderArea: {
    gap: 5,
  },
  sliderTrackWrap: {
    height: 12,
    width: 311,
    justifyContent: 'center',
  },
  sliderTrack: {
    position: 'absolute',
    top: 3,
    left: 0,
    width: 311,
    height: 5,
    borderRadius: 10,
    backgroundColor: '#2E2E2E',
  },
  sliderFill: {
    position: 'absolute',
    top: 3,
    left: 0,
    height: 5,
    borderRadius: 10,
    backgroundColor: '#A3A3A3',
  },
  sliderThumb: {
    position: 'absolute',
    top: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#242424',
    borderWidth: 2,
    borderColor: '#BFBFBF',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 318,
  },
  sliderLabel: {
    color: '#BFBFBF',
    fontSize: 14,
    lineHeight: 16.8,
    fontFamily: 'Lato_400Regular',
  },

  dateRow: {
    flexDirection: 'row',
    gap: 24,
    width: 310,
  },
  dateField: {
    width: 143,
    gap: 8,
  },
  // Use relative + absolute icon so flex:1 TextInput can't push it off-screen on web
  dateInput: {
    height: 40,
    width: 143,
    backgroundColor: '#2E2E2E',
    position: 'relative',
  },
  dateInputText: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 12,
    right: 38,
    color: '#A3A3A3',
    fontSize: 14,
    lineHeight: 16.8,
    fontFamily: 'Lato_400Regular',
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  dateInputIcon: {
    position: 'absolute',
    right: 12,
    top: 11,
  },

  timeSection: {
    gap: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: 318,
    gap: 16,
  },
  timeGroup: {
    width: 60,
    gap: 4,
    alignItems: 'center',
  },
  timeUnitLabel: {
    color: '#A3A3A3',
    fontSize: 12,
    lineHeight: 14.4,
    fontFamily: 'Lato_400Regular',
  },
  timeBox: {
    width: 60,
    height: 59,
    backgroundColor: '#2E2E2E',
    borderRadius: 1.71,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeInput: {
    width: '100%',
    textAlign: 'center',
    color: '#E4E7EC',
    fontSize: 16,
    fontFamily: 'Lato_400Regular',
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  timeColon: {
    width: 5,
    height: 59,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 0,
  },
  timeColonText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 19.2,
    fontFamily: 'Lato_400Regular',
  },

  ampmGroup: {
    width: 47,
    height: 59,
    justifyContent: 'flex-start',
  },
  // Both AM and PM have subtle 0.5px #3D3D3D border by default; selected gets brighter
  ampmBtn: {
    width: 47,
    height: 29,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#3D3D3D',
  },
  ampmBtnActive: {
    borderWidth: 1,
    borderColor: '#A3A3A3',
  },
  ampmText: {
    color: '#A3A3A3',
    fontSize: 12,
    lineHeight: 14.4,
    fontFamily: 'Lato_400Regular',
  },
  ampmTextActive: {
    color: '#FFFFFF',
  },

  bottomBar: {
    position: 'absolute',
    top: 682,
    left: 0,
    width: 343,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  clearBtn: {
    width: 110,
    height: 40,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#707070',
  },
  clearBtnText: {
    color: '#A3A3A3',
    fontSize: 14,
    lineHeight: 16.8,
    fontFamily: 'Lato_400Regular',
  },
  // No outer border — the inner shadow alone creates the dark right+bottom band.
  viewBtn: {
    width: 140,
    height: 40,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A3A3A3',
    ...Platform.select({
      web: {
        boxShadow: 'inset -4px -4px 4px 0 #707070, 0 0 5px 0 rgba(163,163,163,0.5)',
      } as any,
      default: {
        shadowColor: '#A3A3A3',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
      },
    }),
  },
  viewBtnText: {
    color: '#262626',
    fontSize: 14,
    lineHeight: 16.8,
    fontFamily: 'Lato_400Regular',
  },
})
