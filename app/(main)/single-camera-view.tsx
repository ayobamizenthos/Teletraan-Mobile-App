import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native'
import { Image } from 'expo-image'
import { useState, useRef, useMemo } from 'react'
import { useRouter } from 'expo-router'
import Svg, { Path, Rect, LinearGradient, Stop, Defs } from 'react-native-svg'
import BottomNavBar from '../../components/bottom-nav-bar'
import {
  GradientStrokeBox,
  LINEAR_BG3_STROKE,
  SETUP_ROW_BORDER,
  AutoGradientStrokeBox,
} from '../../components/gradient-stroke-box'
import CameraFilterModal from '../../components/camera-filter-modal'
import { useCameraView, setFilterSelections, setSearchText } from '../../store/cameraView'
import { CAMERA_FEEDS } from '../../lib/data/cameras'
import { Colors } from '../../constants/Colors'

function HeaderPanicIcon() {
  return (
    <Svg width={40} height={36} viewBox="0 0 40 36" fill="none">
      <Defs>
        <LinearGradient
          id="scv_hdr_cam"
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
        stroke="url(#scv_hdr_cam)"
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

function SingleCamIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 15 15" fill="none">
      <Path
        d="M10.5 13.8333L7.722 11.1667M3.83333 13.8333L6.61133 11.1667M7.16667 11.1667V14.5M0.5 5.83333C0.5 3.49533 0.5 2.32667 1.10533 1.54C1.21644 1.39556 1.33956 1.264 1.47467 1.14533C2.21333 0.5 3.308 0.5 5.5 0.5H8.83333C11.0253 0.5 12.1207 0.5 12.8587 1.14533C12.9938 1.26444 13.1169 1.396 13.228 1.54C13.8333 2.32667 13.8333 3.49533 13.8333 5.83333C13.8333 8.17133 13.8333 9.34 13.228 10.1267C13.1185 10.2702 12.9948 10.4022 12.8587 10.5207C12.12 11.1667 11.0253 11.1667 8.83333 11.1667H5.5C3.30867 11.1667 2.21267 11.1667 1.47467 10.5213C1.33851 10.4026 1.21476 10.2704 1.10533 10.1267C0.5 9.34 0.5 8.17133 0.5 5.83333Z"
        stroke="#E6E6E6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.16797 7.5C8.27254 7.5 9.16797 6.60457 9.16797 5.5C9.16797 4.39543 8.27254 3.5 7.16797 3.5C6.0634 3.5 5.16797 4.39543 5.16797 5.5C5.16797 6.60457 6.0634 7.5 7.16797 7.5Z"
        stroke="#E6E6E6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function ChevronDownIcon() {
  return (
    <Svg width={12} height={7} viewBox="0 0 12 7" fill="none">
      <Path d="M0 0.876L0.876 0L6 5.168L11.124 0L12 0.876L6 6.876L0 0.876Z" fill="#E4E7EC" />
    </Svg>
  )
}

function CameraSmallIcon() {
  return (
    <Svg width={14} height={13} viewBox="0 0 14 13" fill="none">
      <Path
        d="M7 7C6.735 7 6.48 7.105 6.293 7.293C6.105 7.48 6 7.735 6 8C6 8.265 6.105 8.52 6.293 8.707C6.48 8.895 6.735 9 7 9C7.265 9 7.52 8.895 7.707 8.707C7.895 8.52 8 8.265 8 8C8 7.735 7.895 7.48 7.707 7.293C7.52 7.105 7.265 7 7 7ZM4 8C4 7.204 4.316 6.441 4.879 5.879C5.441 5.316 6.204 5 7 5C7.796 5 8.559 5.316 9.121 5.879C9.684 6.441 10 7.204 10 8C10 8.796 9.684 9.559 9.121 10.121C8.559 10.684 7.796 11 7 11C6.204 11 5.441 10.684 4.879 10.121C4.316 9.559 4 8.796 4 8ZM7 6C6.47 6 5.961 6.211 5.586 6.586C5.211 6.961 5 7.47 5 8C5 8.53 5.211 9.039 5.586 9.414C5.961 9.789 6.47 10 7 10C7.53 10 8.039 9.789 8.414 9.414C8.789 9.039 9 8.53 9 8C9 7.47 8.789 6.961 8.414 6.586C8.039 6.211 7.53 6 7 6ZM0 1.5C0 1.102 0.158 0.721 0.439 0.439C0.721 0.158 1.102 0 1.5 0H12.5C12.898 0 13.279 0.158 13.561 0.439C13.842 0.721 14 1.102 14 1.5V2.5C14 2.81 13.904 3.113 13.725 3.366C13.546 3.62 13.293 3.812 13 3.915V7C13 8.591 12.368 10.117 11.243 11.243C10.117 12.368 8.591 13 7 13C5.409 13 3.883 12.368 2.757 11.243C1.632 10.117 1 8.591 1 7V3.915C0.707 3.812 0.454 3.62 0.275 3.366C0.096 3.113 0 2.81 0 2.5V1.5ZM1.5 3H12.5C12.633 3 12.76 2.947 12.854 2.854C12.947 2.76 13 2.633 13 2.5V1.5C13 1.367 12.947 1.24 12.854 1.146C12.76 1.053 12.633 1 12.5 1H1.5C1.367 1 1.24 1.053 1.146 1.146C1.053 1.24 1 1.367 1 1.5V2.5C1 2.633 1.053 2.76 1.146 2.854C1.24 2.947 1.367 3 1.5 3ZM2 4V7C2 8.326 2.527 9.598 3.464 10.536C4.402 11.473 5.674 12 7 12C8.326 12 9.598 11.473 10.536 10.536C11.473 9.598 12 8.326 12 7V4H2Z"
        fill="#F2F4F7"
      />
    </Svg>
  )
}

function ExpandIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path
        d="M9 1H13V5M5 13H1V9M13 1L8.5 5.5M1 13L5.5 8.5"
        stroke="#E6E6E6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function SearchIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 13 15" fill="none">
      <Path
        d="M12.5 14.5L9.035 11.036M9.035 11.036C9.973 10.098 10.5 8.826 10.5 7.5C10.5 6.174 9.973 4.902 9.035 3.964C8.098 3.027 6.826 2.5 5.5 2.5C4.174 2.5 2.902 3.027 1.964 3.964C1.027 4.902 0.5 6.174 0.5 7.5C0.5 8.826 1.027 10.098 1.964 11.036C2.902 11.973 4.174 12.5 5.5 12.5C6.826 12.5 8.098 11.973 9.035 11.036Z"
        stroke="#8A8A8A"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

// Checkmark inside the Filter pill once a filter is active.
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

// "X" icon on the active-camera chip that clears the filter.
function ClearFilterXIcon() {
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

// Tabs come from the canonical CAMERA_FEEDS list — shared with the quad-grid
// dashboard and the filter modal so a selection here matches everywhere else.

export default function SingleCameraViewScreen() {
  const router = useRouter()
  const [activeTabId, setActiveTabId] = useState(CAMERA_FEEDS[0].id)
  const [viewModeOpen, setViewModeOpen] = useState(false)
  const [cameraFilterOpen, setCameraFilterOpen] = useState(false)
  // Shared store: search + filter selections carry over from Quad-Grid view
  // and into fullscreen-camera so the user's filter scope follows them.
  const { searchText, filterSelections } = useCameraView()
  const filterActive = filterSelections.length > 0
  const feedScrollRef = useRef<ScrollView>(null)
  const tabsScrollRef = useRef<ScrollView>(null)
  const tabX = useRef<Record<string, number>>({})

  const term = searchText.trim().toLowerCase()
  const visibleTabs = useMemo(() => {
    let base = CAMERA_FEEDS
    if (filterActive) {
      const mode = filterSelections[0].mode
      if (mode === 'Camera') {
        const ids = new Set(filterSelections.map(s => s.id))
        base = CAMERA_FEEDS.filter(c => ids.has(c.id))
      } else {
        const locs = new Set(filterSelections.map(s => s.label.toLowerCase()))
        base = CAMERA_FEEDS.filter(c => locs.has(c.location.toLowerCase()))
      }
    }
    return term
      ? base.filter(
          c => c.name.toLowerCase().includes(term) || c.location.toLowerCase().includes(term)
        )
      : base
  }, [term, filterActive, filterSelections])

  // Keep the active camera valid against the current (possibly filtered) list.
  const activeCamera =
    visibleTabs.find(c => c.id === activeTabId) ?? visibleTabs[0] ?? CAMERA_FEEDS[0]

  const FEED_W = 343

  // Slide the tab strip so the active tab stays in view as the feed swipes.
  const scrollTabsTo = (id: string) => {
    const x = tabX.current[id]
    if (x !== undefined) {
      tabsScrollRef.current?.scrollTo({ x: Math.max(0, x - 16), animated: true })
    }
  }

  const goToCamera = (id: string) => {
    setActiveTabId(id)
    scrollTabsTo(id)
    const idx = visibleTabs.findIndex(c => c.id === id)
    if (idx >= 0) feedScrollRef.current?.scrollTo({ x: idx * FEED_W, animated: true })
  }

  // Fires continuously while swiping (works on web, where onMomentumScrollEnd
  // doesn't). Snaps the active tab + slides the tab strip as the page changes.
  const syncToOffset = (offsetX: number) => {
    const idx = Math.round(offsetX / FEED_W)
    const cam = visibleTabs[idx]
    if (cam && cam.id !== activeTabId) {
      setActiveTabId(cam.id)
      scrollTabsTo(cam.id)
    }
  }

  const onFeedScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    syncToOffset(e.nativeEvent.contentOffset.x)
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageInner}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>All Cameras ({CAMERA_FEEDS.length})</Text>
            <View style={styles.headerIconBtn}>
              <HeaderPanicIcon />
            </View>
          </View>

          <View style={styles.divider} />

          {/* View Switcher */}
          <View style={styles.viewSwitcherRow}>
            <View style={styles.viewSwitcherOuter}>
              <View style={styles.viewSwitcherInner}>
                <View style={styles.viewSwitcherLabelRow}>
                  <SingleCamIcon />
                  <Text style={styles.viewSwitcherText}>Single Camera View</Text>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.filterPillOuter, pressed && { opacity: 0.7 }]}
                  onPress={() => {
                    setCameraFilterOpen(true)
                  }}
                >
                  <View
                    style={[styles.filterPillInner, filterActive && styles.filterPillInnerActive]}
                  >
                    <Text style={styles.filterPillText}>Filter</Text>
                    {filterActive && <FilterCheckIcon />}
                  </View>
                  {!filterActive && <GradientStrokeBox width={81} height={29} rx={3} />}
                </Pressable>
              </View>
              <GradientStrokeBox width={281} height={48} rx={3} />
            </View>

            <Pressable
              style={({ pressed }) => [styles.gridToggleBtn, pressed && { opacity: 0.7 }]}
              onPress={() => setViewModeOpen(prev => !prev)}
            >
              <ChevronDownIcon />
            </Pressable>
          </View>

          {viewModeOpen && (
            <Pressable style={styles.viewModeBackdrop} onPress={() => setViewModeOpen(false)}>
              <View style={styles.viewModeDropdown}>
                <Pressable
                  style={({ pressed }) => [styles.viewModeOption, pressed && { opacity: 0.7 }]}
                  onPress={() => {
                    setViewModeOpen(false)
                    router.replace('/(main)/cameras')
                  }}
                >
                  <View style={styles.viewModeIconBox}>
                    <View style={styles.gridIconCell} />
                    <View style={styles.gridIconCell} />
                    <View style={styles.gridIconCell} />
                    <View style={styles.gridIconCell} />
                  </View>
                  <Text style={styles.viewModeOptionText}>Quad Grid View</Text>
                </Pressable>
              </View>
            </Pressable>
          )}

          {/* Search — inline filter over the camera tabs (same behaviour as Quad view).
          Hidden when a filter is applied; the camera chip below replaces it. */}
          {!filterActive && (
            <View style={styles.searchBarOuter}>
              <View style={styles.searchBarInner}>
                <SearchIcon />
                <TextInput
                  style={styles.searchInput}
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Search Camera or Location"
                  placeholderTextColor="#8A8A8A"
                  selectionColor="#A3A3A3"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                />
              </View>
              <GradientStrokeBox width={349} height={48} rx={0} gradient={LINEAR_BG3_STROKE} />
            </View>
          )}

          {filterActive && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.activeFilterRow}
              contentContainerStyle={styles.activeFilterRowContent}
            >
              {filterSelections.map(sel => (
                <Pressable
                  key={sel.id}
                  style={styles.activeFilterChip}
                  onPress={() => {
                    setFilterSelections(filterSelections.filter(s => s.id !== sel.id))
                  }}
                >
                  <Text style={styles.activeFilterChipText} numberOfLines={1}>
                    {sel.label}
                  </Text>
                  <ClearFilterXIcon />
                  <AutoGradientStrokeBox rx={2} strokeWidth={0.5} gradient={SETUP_ROW_BORDER} />
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Camera name tabs */}
          <ScrollView
            ref={tabsScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScroll}
            contentContainerStyle={styles.tabsContent}
          >
            {visibleTabs.map(cam => {
              const isActive = activeCamera.id === cam.id
              return (
                <Pressable
                  key={cam.id}
                  onLayout={e => {
                    tabX.current[cam.id] = e.nativeEvent.layout.x
                  }}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                  onPress={() => goToCamera(cam.id)}
                >
                  <Text
                    style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                    numberOfLines={1}
                  >
                    {cam.name}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>

          {/* Large camera feed — swipe left/right between cameras, tap to open fullscreen */}
          <View style={styles.feedContainer}>
            {visibleTabs.length === 0 ? (
              <View style={styles.feedEmpty}>
                <Text style={styles.feedEmptyText}>No cameras or locations found</Text>
              </View>
            ) : (
              <ScrollView
                ref={feedScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onFeedScroll}
                scrollEventThrottle={16}
                onMomentumScrollEnd={onFeedScroll}
                decelerationRate="fast"
                snapToInterval={FEED_W}
                snapToAlignment="start"
              >
                {visibleTabs.map(cam => (
                  <Pressable
                    key={cam.id}
                    style={styles.feedPage}
                    onPress={() =>
                      router.push({
                        pathname: '/(main)/fullscreen-camera',
                        params: {
                          cameraId: cam.id,
                          cameraName: cam.name,
                          // Constrain the fullscreen pager to the same
                          // filtered subset shown on this screen so the user
                          // can only swipe between the cameras they filtered.
                          ...(filterActive && {
                            filteredIds: visibleTabs.map(c => c.id).join(','),
                          }),
                        },
                      })
                    }
                  >
                    <Image source={cam.thumbnail} style={styles.feedImage} contentFit="cover" />
                    <View style={styles.feedTopOverlay}>
                      <View style={styles.liveIndicatorRow}>
                        <View style={styles.liveDot} />
                        <CameraSmallIcon />
                      </View>
                      <Pressable
                        style={({ pressed }) => [styles.expandBtn, pressed && { opacity: 0.7 }]}
                        onPress={() =>
                          router.push({
                            pathname: '/(main)/fullscreen-camera',
                            params: {
                              cameraId: cam.id,
                              cameraName: cam.name,
                              // Constrain the fullscreen pager to the same
                              // filtered subset shown on this screen so the user
                              // can only swipe between the cameras they filtered.
                              ...(filterActive && {
                                filteredIds: visibleTabs.map(c => c.id).join(','),
                              }),
                            },
                          })
                        }
                      >
                        <ExpandIcon />
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>

      <BottomNavBar activeTab="cameras" />

      {cameraFilterOpen && (
        <CameraFilterModal
          onClose={() => setCameraFilterOpen(false)}
          onApply={selections => {
            setFilterSelections(selections)
            if (selections.length) {
              // Snap to the first matching camera so the feed reflects the
              // chosen camera/location immediately.
              const first = selections[0]
              const firstMatch =
                first.mode === 'Camera'
                  ? CAMERA_FEEDS.find(c => c.id === first.id)
                  : CAMERA_FEEDS.find(c => c.location.toLowerCase() === first.label.toLowerCase())
              if (firstMatch) setActiveTabId(firstMatch.id)
              setSearchText('')
              feedScrollRef.current?.scrollTo({ x: 0, animated: false })
              tabsScrollRef.current?.scrollTo({ x: 0, animated: false })
            }
          }}
          initialSelections={filterSelections}
        />
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
  // Vertical scroll host: lets the user pull the page up so the bottom of
  // the camera feed clears the floating bottom nav. Same +80 pattern as the
  // quad-grid (cameras.tsx) so both views feel identical.
  pageScroll: {
    flex: 1,
    width: 375,
  },
  pageScrollContent: {
    width: 375,
  },
  pageInner: {
    width: 375,
    height: 812 + 80,
    position: 'relative',
  },

  header: {
    position: 'absolute',
    top: 71,
    left: 16,
    width: 346,
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

  viewSwitcherRow: {
    position: 'absolute',
    top: 139,
    left: 16,
    width: 343,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  viewSwitcherOuter: {
    width: 281,
    height: 48,
    borderRadius: 3,
  },
  viewSwitcherInner: {
    flex: 1,
    borderRadius: 3,
    backgroundColor: '#1F1F1F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingRight: 12,
  },
  viewSwitcherLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewSwitcherText: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
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
  // Active state: solid 1px #BFBFBF border replaces the gradient stroke.
  filterPillInnerActive: {
    borderWidth: 1,
    borderColor: '#BFBFBF',
  },
  filterPillText: {
    color: '#E4E7EC',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },

  // Row of one chip per active filter selection (camera or location). Sits
  // where the search bar would otherwise live and scrolls horizontally so
  // multiple selections never wrap.
  activeFilterRow: {
    position: 'absolute',
    top: 195,
    left: 16,
    right: 0,
    height: 24,
  },
  activeFilterRowContent: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  activeFilterChip: {
    height: 24,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },
  activeFilterChipText: {
    color: '#E4E7EC',
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },
  gridToggleBtn: {
    width: 53,
    height: 48,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#A3A3A3',
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchBarOuter: {
    position: 'absolute',
    top: 195,
    left: 16,
    width: 349,
    height: 48,
  },
  searchBarInner: {
    flex: 1,
    backgroundColor: Colors.darkBackground,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    gap: 6,
  },
  searchPlaceholder: {
    color: '#8A8A8A',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingRight: 12,
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
    ...Platform.select({ web: { outlineStyle: 'none' } as any, default: {} }),
  },
  feedPage: {
    width: 343,
    height: 406,
  },
  feedEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedEmptyText: {
    color: '#8A8A8A',
    fontSize: 14,
    fontFamily: 'Lato_400Regular',
  },

  viewModeBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  viewModeDropdown: {
    position: 'absolute',
    top: 187,
    left: 16,
    width: 343,
    backgroundColor: '#1F1F1F',
    borderRadius: 3,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  viewModeOption: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  viewModeOptionText: {
    color: '#A3A3A3',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },
  viewModeOptionTextActive: {
    color: '#F9FAFB',
  },
  viewModeDivider: {
    height: 1,
    marginHorizontal: 12,
    backgroundColor: '#3D3D3D',
  },
  viewModeIconBox: {
    width: 14,
    height: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
  },
  gridIconCell: {
    width: 6,
    height: 6,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 1,
  },
  tabsScroll: {
    position: 'absolute',
    top: 267,
    left: 0,
    width: 375,
    height: 40,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 12,
    alignItems: 'center',
  },
  tabItem: {
    height: 40,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemActive: {
    borderWidth: 2,
    borderColor: '#A3A3A3',
    borderRadius: 2,
  },
  tabLabel: {
    color: '#707070',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 14.4,
    fontFamily: 'Lato_400Regular',
  },
  tabLabelActive: {
    color: '#A3A3A3',
  },

  feedContainer: {
    position: 'absolute',
    top: 331,
    left: 16,
    width: 343,
    height: 406,
    overflow: 'hidden',
    borderRadius: 2,
  },
  feedImage: {
    width: '100%',
    height: '100%',
  },
  feedTopOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(31,31,31,0.6)',
    borderRadius: 2,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#F04438',
  },
  expandBtn: {
    width: 26,
    height: 26,
    backgroundColor: 'rgba(31,31,31,0.6)',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
