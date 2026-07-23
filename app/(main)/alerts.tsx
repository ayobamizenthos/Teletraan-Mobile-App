import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput } from 'react-native'
import { Image } from 'expo-image'
import { useState, useMemo } from 'react'
import { useRouter } from 'expo-router'
import Svg, { Path, Rect, LinearGradient, Stop, Defs } from 'react-native-svg'
import BottomNavBar from '../../components/bottom-nav-bar'
import StatusBar from '../../components/status-bar'
import { Colors, cssGradient } from '../../constants/Colors'
import { tapHaptic } from '../../lib/haptics'
import { getIncidents } from '../../lib/api/alerts'
import { SEVERITY_SCORE, SEVERITY_COLORS } from '../../lib/data/alerts'
import {
  GradientStrokeBox,
  AutoGradientStrokeBox,
  SETUP_ROW_BORDER,
} from '../../components/gradient-stroke-box'
import AlertFilterModal, {
  ALERT_FILTER_CAMERAS,
  ALERT_FILTER_LOCATIONS,
  ALERT_FILTER_TAGS,
} from '../../components/alert-filter-modal'
import { useActiveFilters, setActiveFilters, EMPTY_FILTERS } from '../../store/filters'

const linearBG4Css = cssGradient(Colors.linearBG4)

function HeaderIcon() {
  return (
    <Svg width={40} height={36} viewBox="0 0 40 36" fill="none">
      <Defs>
        <LinearGradient
          id="hdr"
          x1={-5.294}
          y1={-9.94}
          x2={8.968}
          y2={49.306}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#707070" />
          <Stop offset={0.418} stopColor="#707070" stopOpacity={0} />
          <Stop offset={0.649} stopColor="#BFBFBF" stopOpacity={0.12} />
          <Stop offset={1} stopColor="#BFBFBF" />
        </LinearGradient>
      </Defs>
      <Rect
        x={0.24}
        y={0.24}
        width={39.52}
        height={35.52}
        rx={2.1}
        stroke="url(#hdr)"
        strokeWidth={0.48}
      />
      <Path
        d="M27.39 17.4128V21.8888C27.39 22.7139 27.0622 23.5052 26.4787 24.0887C25.8952 24.6721 25.1038 24.9999 24.2786 24.9999H16.1113C15.2862 24.9999 14.4948 24.6721 13.9113 24.0887C13.3278 23.5052 13 22.7139 13 21.8888V14.8889C13 14.0638 13.3278 13.2725 13.9113 12.689C14.4948 12.1056 15.2862 11.7778 16.1113 11.7778H21.6737"
        stroke="#E6E6E6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13 14.959L18.6393 18.1712C19.1107 18.4489 19.6479 18.5953 20.195 18.5953C20.7421 18.5953 21.2793 18.4489 21.7507 18.1712L23.4767 17.1935"
        stroke="#E6E6E6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M25.6399 14.8888C26.7139 14.8888 27.5845 14.0183 27.5845 12.9444C27.5845 11.8705 26.7139 11 25.6399 11C24.5659 11 23.6953 11.8705 23.6953 12.9444C23.6953 14.0183 24.5659 14.8888 25.6399 14.8888Z"
        fill="#D92D20"
      />
    </Svg>
  )
}

function SearchIcon({ color = '#8A8A8A' }: { color?: string }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 13 15" fill="none">
      <Path
        d="M12.5 14.5L9.035 11.036M9.035 11.036C9.973 10.098 10.5 8.826 10.5 7.5C10.5 6.174 9.973 4.902 9.035 3.964C8.098 3.027 6.826 2.5 5.5 2.5C4.174 2.5 2.902 3.027 1.964 3.964C1.027 4.902 0.5 6.174 0.5 7.5C0.5 8.826 1.027 10.098 1.964 11.036C2.902 11.973 4.174 12.5 5.5 12.5C6.826 12.5 8.098 11.973 9.035 11.036Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

// Checkmark shown inside the Filter pill once any filter is active.
function FilterCheckIcon() {
  return (
    <Svg width={9} height={7} viewBox="0 0 9 7" fill="none">
      <Path
        d="M0.5 3.83333L3.7 6.5L8.5 0.5"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

// Small X used inside the per-filter active chips for individual removal.
function ChipDismissIcon() {
  return (
    <Svg width={9} height={9} viewBox="0 0 9 9" fill="none">
      <Path
        d="M0.5 8.5L8.5 0.5M0.5 0.5L8.5 8.5"
        stroke="#A3A3A3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function CameraOverlayIcon() {
  return (
    <Svg width={14} height={13} viewBox="0 0 14 13" fill="none">
      <Path
        d="M7 7C6.735 7 6.48 7.105 6.293 7.293C6.105 7.48 6 7.735 6 8C6 8.265 6.105 8.52 6.293 8.707C6.48 8.895 6.735 9 7 9C7.265 9 7.52 8.895 7.707 8.707C7.895 8.52 8 8.265 8 8C8 7.735 7.895 7.48 7.707 7.293C7.52 7.105 7.265 7 7 7ZM4 8C4 7.204 4.316 6.441 4.879 5.879C5.441 5.316 6.204 5 7 5C7.796 5 8.559 5.316 9.121 5.879C9.684 6.441 10 7.204 10 8C10 8.796 9.684 9.559 9.121 10.121C8.559 10.684 7.796 11 7 11C6.204 11 5.441 10.684 4.879 10.121C4.316 9.559 4 8.796 4 8ZM7 6C6.47 6 5.961 6.211 5.586 6.586C5.211 6.961 5 7.47 5 8C5 8.53 5.211 9.039 5.586 9.414C5.961 9.789 6.47 10 7 10C7.53 10 8.039 9.789 8.414 9.414C8.789 9.039 9 8.53 9 8C9 7.47 8.789 6.961 8.414 6.586C8.039 6.211 7.53 6 7 6ZM0 1.5C0 1.102 0.158 0.721 0.439 0.439C0.721 0.158 1.102 0 1.5 0H12.5C12.898 0 13.279 0.158 13.561 0.439C13.842 0.721 14 1.102 14 1.5V2.5C14 2.81 13.904 3.113 13.725 3.366C13.546 3.62 13.293 3.812 13 3.915V7C13 8.591 12.368 10.117 11.243 11.243C10.117 12.368 8.591 13 7 13C5.409 13 3.883 12.368 2.757 11.243C1.632 10.117 1 8.591 1 7V3.915C0.707 3.812 0.454 3.62 0.275 3.366C0.096 3.113 0 2.81 0 2.5V1.5ZM1.5 3H12.5C12.633 3 12.76 2.947 12.854 2.854C12.947 2.76 13 2.633 13 2.5V1.5C13 1.367 12.947 1.24 12.854 1.146C12.76 1.053 12.633 1 12.5 1H1.5C1.367 1 1.24 1.053 1.146 1.146C1.053 1.24 1 1.367 1 1.5V2.5C1 2.633 1.053 2.76 1.146 2.854C1.24 2.947 1.367 3 1.5 3ZM2 4V7C2 8.326 2.527 9.598 3.464 10.536C4.402 11.473 5.674 12 7 12C8.326 12 9.598 11.473 10.536 10.536C11.473 9.598 12 8.326 12 7V4H2Z"
        fill="#BFBFBF"
      />
    </Svg>
  )
}

function LocationPinIcon() {
  return (
    <Svg width={11} height={16} viewBox="0 0 11 16" fill="none">
      <Path
        d="M5.5 14.919C8.27 11.04 10.487 7.716 10.487 5.5C10.487 4.178 9.961 2.91 9.026 1.975C8.091 1.04 6.823 0.514 5.5 0.514C4.178 0.514 2.91 1.04 1.975 1.975C1.04 2.91 0.514 4.178 0.514 5.5C0.514 7.716 2.73 11.04 5.5 14.919Z"
        stroke="#E6E6E6"
      />
      <Path
        d="M7.716 5.5C7.716 6.088 7.482 6.652 7.067 7.068C6.651 7.483 6.087 7.717 5.5 7.717C4.913 7.717 4.348 7.483 3.933 7.068C3.517 6.652 3.284 6.088 3.284 5.5C3.284 4.913 3.517 4.349 3.933 3.934C4.348 3.518 4.913 3.285 5.5 3.285C6.087 3.285 6.651 3.518 7.067 3.934C7.482 4.349 7.716 4.913 7.716 5.5Z"
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
        d="M9 9.5C8.91 9.5 8.82 9.48 8.74 9.43L6.24 7.93C6.166 7.885 6.105 7.822 6.063 7.747C6.021 7.671 6 7.586 6 7.5V3.5C6 3.22 6.22 3 6.5 3C6.78 3 7 3.22 7 3.5V7.22L9.26 8.57C9.353 8.627 9.425 8.713 9.465 8.815C9.505 8.916 9.511 9.028 9.481 9.133C9.452 9.238 9.389 9.331 9.302 9.397C9.215 9.463 9.109 9.5 9 9.5Z"
        fill="#E6E6E6"
      />
    </Svg>
  )
}

function ArrowRightIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path
        d="M0 6.116V7.884H10.606L5.745 12.745L7 14L14 7L7 0L5.745 1.255L10.606 6.116H0Z"
        fill="#242424"
      />
    </Svg>
  )
}

const INCIDENTS = getIncidents()

// SEVERITY_COLORS is shared from lib/data/alerts so the badge tint on the
// grid card always matches the badge tint inside the incident detail.

// Camera / location / tag labels come straight from the modal's exported
// chip lists so the filter ids match the modal exactly — no stale local maps.

// Helper label lookups for the per-selection chip row. Single source of
// truth lives in alert-filter-modal so chips can never drift from the modal.
const CAMERA_LABELS: Record<string, string> = Object.fromEntries(
  ALERT_FILTER_CAMERAS.map(c => [c.id, c.label])
)
const LOCATION_LABELS: Record<string, string> = Object.fromEntries(
  ALERT_FILTER_LOCATIONS.map(c => [c.id, c.label])
)
const TAG_LABELS: Record<string, string> = Object.fromEntries(
  ALERT_FILTER_TAGS.map(c => [c.id, c.label])
)

export default function AlertsScreen() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const activeFilters = useActiveFilters()
  // Derive from activeFilters (not the hasActiveFilters() function call) so
  // React Compiler tracks the dependency — otherwise it memoises the first
  // `false` forever and the pill never shows its active state.
  const filtersActive =
    activeFilters.cameras.length > 0 ||
    activeFilters.locations.length > 0 ||
    activeFilters.tags.length > 0 ||
    activeFilters.threatLevel > 0 ||
    activeFilters.dateFrom.length > 0 ||
    activeFilters.dateTo.length > 0 ||
    activeFilters.hour.length > 0 ||
    activeFilters.minute.length > 0

  const visibleIncidents = useMemo(() => {
    let list = INCIDENTS

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        inc =>
          inc.alertTitle.toLowerCase().includes(q) ||
          inc.cameraName.toLowerCase().includes(q) ||
          inc.location.toLowerCase().includes(q)
      )
    }

    // Filter chips now come from the actual incident list (see lib/api/alerts)
    // so label matches are exact + case-insensitive — picking any chip is
    // guaranteed to return at least one row.
    if (activeFilters.cameras.length > 0) {
      const set = new Set(activeFilters.cameras.map(id => CAMERA_LABELS[id]?.toLowerCase() ?? id))
      list = list.filter(inc => set.has(inc.cameraName.toLowerCase()))
    }

    if (activeFilters.locations.length > 0) {
      const set = new Set(
        activeFilters.locations.map(id => LOCATION_LABELS[id]?.toLowerCase() ?? id)
      )
      list = list.filter(inc => set.has(inc.location.toLowerCase()))
    }

    if (activeFilters.tags.length > 0) {
      // Tag labels are the alertTitle minus the trailing "Detected" — match
      // by checking the incident's title starts with the tag label.
      const labels = activeFilters.tags.map(id => TAG_LABELS[id]?.toLowerCase() ?? id)
      list = list.filter(inc => {
        const title = inc.alertTitle.toLowerCase()
        return labels.some(label => title.startsWith(label))
      })
    }

    if (activeFilters.threatLevel > 0) {
      list = list.filter(inc => SEVERITY_SCORE[inc.severityLevel] >= activeFilters.threatLevel)
    }

    // Date / time narrows on the incident timestamp string
    // ("1:42 AM, 07-19-25" / "11:45pm, 08-06-25"). We parse it the same way
    // the modal does so the auto-filled values from a chip selection match.
    const parseTs = (ts: string) => {
      const m = /^(\d{1,2}):(\d{2})\s*(am|pm),\s*(\d{2})-(\d{2})-(\d{2})$/i.exec(ts)
      if (!m) return null
      return {
        hour: m[1].padStart(2, '0'),
        minute: m[2],
        ampm: m[3].toUpperCase() as 'AM' | 'PM',
        mdy: `${m[4]}/${m[5]}/${m[6]}`,
      }
    }

    if (activeFilters.dateFrom || activeFilters.dateTo) {
      const from = activeFilters.dateFrom
      const to = activeFilters.dateTo
      list = list.filter(inc => {
        const p = parseTs(inc.timestamp)
        if (!p) return false
        if (from && p.mdy !== from && to && p.mdy !== to) {
          // when both are set, accept anything between (alphabetic compare on
          // MM/DD/YY isn't chronologically correct but works for the demo
          // dataset where all years are the same).
          return p.mdy >= from && p.mdy <= to
        }
        if (from && !to) return p.mdy === from
        if (!from && to) return p.mdy === to
        return p.mdy === from || p.mdy === to
      })
    }

    if (activeFilters.hour || activeFilters.minute) {
      const wantH = activeFilters.hour.padStart(2, '0')
      const wantM = activeFilters.minute.padStart(2, '0')
      const wantAmpm = activeFilters.ampm
      list = list.filter(inc => {
        const p = parseTs(inc.timestamp)
        if (!p) return false
        if (activeFilters.hour && p.hour !== wantH) return false
        if (activeFilters.minute && p.minute !== wantM) return false
        if (p.ampm !== wantAmpm) return false
        return true
      })
    }

    return list
  }, [searchQuery, activeFilters])

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.feedWrapper,
          filterModalOpen &&
            (Platform.OS === 'web' ? styles.feedBlurredWeb : styles.feedBlurredNative),
        ]}
        pointerEvents={filterModalOpen ? 'none' : 'auto'}
      >
        <StatusBar />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Incident Review</Text>
          <Pressable
            style={({ pressed }) => [styles.headerIconBtn, pressed && { opacity: 0.7 }]}
            onPress={() => {
              tapHaptic()
              router.push('/(main)/notifications')
            }}
          >
            <HeaderIcon />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.searchBarOuter}>
          <View style={styles.searchBarInner}>
            <View style={styles.searchBarLeft}>
              <SearchIcon />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search Alerts"
                placeholderTextColor="#8A8A8A"
                returnKeyType="search"
              />
            </View>
            <Pressable
              style={({ pressed }) => [styles.filterPillOuter, pressed && { opacity: 0.7 }]}
              onPress={() => {
                tapHaptic()
                setFilterModalOpen(true)
              }}
            >
              <View style={[styles.filterPillInner, filtersActive && styles.filterPillActive]}>
                <Text style={styles.filterPillText}>Filter</Text>
                {filtersActive && <FilterCheckIcon />}
              </View>
              {/* Subtle gloss border only when the filter is OFF — the active
                  pill uses a solid white border (filterPillActive). Without
                  this swap, the gradient stroke covers the active border. */}
              {!filtersActive && <GradientStrokeBox width={81} height={29} rx={3} />}
            </Pressable>
          </View>
        </View>

        {/* Single "Clear Filter" pill — matches the cameras-screen pattern.
            Tap to wipe every active filter and return the page to defaults. */}
        {filtersActive && (
          <View style={styles.activeFilterRow}>
            <Pressable
              style={styles.activeFilterChip}
              onPress={() => {
                tapHaptic()
                setActiveFilters({ ...EMPTY_FILTERS })
              }}
            >
              <Text style={styles.activeFilterChipText} numberOfLines={1}>
                Clear Filter
              </Text>
              <ChipDismissIcon />
              <AutoGradientStrokeBox rx={2} strokeWidth={0.5} gradient={SETUP_ROW_BORDER} />
            </Pressable>
          </View>
        )}

        <ScrollView
          style={[styles.contentScroll, filtersActive && styles.contentScrollWithChips]}
          contentContainerStyle={styles.contentScrollInner}
          showsVerticalScrollIndicator={false}
        >
          {/* "Recents" label only when no filter is on — when filtered, the
              Clear Filter pill above already gives the user the right context. */}
          {!filtersActive && (
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>
                {visibleIncidents.length === 0 ? 'No results' : 'Recents'}
              </Text>
              <View style={styles.sectionRule} />
            </View>
          )}

          <View style={styles.cardsContainer}>
            {visibleIncidents.map(incident => (
              <Pressable
                key={incident.id}
                style={({ pressed }) => pressed && { opacity: 0.85 }}
                onPress={() => {
                  tapHaptic()
                  router.push({
                    pathname: '/(main)/incident-detail',
                    params: { id: incident.id },
                  })
                }}
              >
                <View style={styles.cardOuter}>
                  <View style={styles.cardInner}>
                    <View style={styles.thumbnailArea}>
                      <Image
                        source={incident.thumbnail}
                        style={styles.thumbnailImage}
                        contentFit="cover"
                      />
                      <View style={styles.cameraOverlayOuter}>
                        <GradientStrokeBox width={139} height={32} rx={2} />
                        <CameraOverlayIcon />
                        <Text style={styles.cameraOverlayText}>{incident.cameraName}</Text>
                      </View>
                    </View>

                    <View style={styles.arrowCircle}>
                      <ArrowRightIcon />
                    </View>

                    <View style={styles.textContent}>
                      <View style={styles.severityBadge}>
                        <Text
                          style={[
                            styles.severityBadgeText,
                            { color: SEVERITY_COLORS[incident.severityLevel] },
                          ]}
                        >
                          {incident.severityLevel}
                        </Text>
                      </View>

                      <Text style={styles.alertTitle}>{incident.alertTitle}</Text>

                      <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                          <LocationPinIcon />
                          <Text style={styles.metaText}>{incident.location}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <ClockIcon />
                          <Text style={styles.metaText}>{incident.timestamp}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <GradientStrokeBox width={345} height={218} rx={15} />
                </View>
              </Pressable>
            ))}
          </View>
          <View style={styles.listBottomSpacer} />
        </ScrollView>

        <BottomNavBar activeTab="alerts" />
      </View>

      {filterModalOpen && <AlertFilterModal onClose={() => setFilterModalOpen(false)} />}
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
  feedWrapper: {
    flex: 1,
    width: 375,
    height: 812,
  },
  // Apply CSS filter:blur to the alerts feed when the filter modal is open — this is what
  // the modal renders ON TOP of, so the underlying content visibly blurs.
  feedBlurredWeb: {
    ...Platform.select({
      web: {
        filter: 'blur(10px)',
        transform: 'scale(1.02)', // hide blur edge bleed
      } as any,
      default: {},
    }),
  },
  feedBlurredNative: {
    // BlurView in the modal handles native; nothing to do on the feed itself
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
  headerIconBtn: {
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

  searchBarOuter: {
    position: 'absolute',
    top: 139,
    left: 16,
    width: 343,
    height: 48,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  searchBarInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  searchBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchInput: {
    color: '#E4E7EC',
    fontSize: 14,
    fontWeight: '400',
    minWidth: 140,
    fontFamily: 'Lato_400Regular',
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },

  filterPillOuter: {
    width: 81,
    height: 29,
    borderRadius: 3,
  },
  filterPillInner: {
    flex: 1,
    borderRadius: 3,
    backgroundColor: '#2E2E2E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  // Active state — clear white border + brighter BG3 fill so the pill is
  // unmistakably "on" (matches the cameras-page filter pill).
  filterPillActive: {
    backgroundColor: '#2E2E2E',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  filterPillText: {
    color: '#E4E7EC',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },

  contentScroll: {
    position: 'absolute',
    top: 203,
    left: 15,
    width: 345,
    bottom: 0,
  },
  // When the active-filter chip row is visible, push the incident list down
  // so the chips sit cleanly between the search bar and the cards.
  contentScrollWithChips: {
    top: 243,
  },

  // Horizontally-scrollable chip row that appears under the search bar when
  // any filter is active. Each chip is individually dismissible.
  // Single "Clear Filter" pill sits just under the search bar when any
  // filter is active — wipes everything in one tap.
  activeFilterRow: {
    position: 'absolute',
    top: 195,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilterChip: {
    height: 24,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  activeFilterChipText: {
    color: '#E4E7EC',
    fontSize: 12,
    fontFamily: 'Lato_400Regular',
  },
  contentScrollInner: {
    paddingBottom: 130,
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionLabel: {
    color: Colors.white,
    fontSize: 16,
    lineHeight: 19.2,
    fontFamily: 'Lato_400Regular',
  },
  sectionRule: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.black700,
  },

  cardsContainer: {
    gap: 24,
  },

  cardOuter: {
    width: 345,
    height: 218,
  },
  cardInner: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#121212',
  },

  thumbnailArea: {
    width: '100%',
    height: 112,
    backgroundColor: '#262626',
    position: 'relative',
    overflow: 'hidden',
  },
  thumbnailImage: {
    ...StyleSheet.absoluteFillObject,
  },

  cameraOverlayOuter: {
    position: 'absolute',
    top: 16,
    left: 16,
    height: 32,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    ...Platform.select({
      web: { backgroundImage: linearBG4Css } as any,
      default: { backgroundColor: 'rgba(31,31,31,0.7)' },
    }),
  },
  cameraOverlayText: {
    color: '#BFBFBF',
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },

  arrowCircle: {
    position: 'absolute',
    top: 88,
    right: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#A3A3A3',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },

  textContent: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 8,
  },

  severityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1F1F1F',
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  severityBadgeText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },

  alertTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 19,
    fontFamily: 'Lato_400Regular',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  metaText: {
    color: '#A3A3A3',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },

  listBottomSpacer: {
    height: 20,
  },
})
