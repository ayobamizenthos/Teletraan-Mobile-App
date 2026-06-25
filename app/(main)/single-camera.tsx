import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { Image } from 'expo-image'
import { useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import Svg, { Path, Rect, LinearGradient, Stop, Defs } from 'react-native-svg'
import BottomNavBar from '../../components/bottom-nav-bar'
import { GradientStrokeBox, LINEAR_BG3_STROKE } from '../../components/gradient-stroke-box'
import { tapHaptic } from '../../lib/haptics'
import AlertFilterModal from '../../components/alert-filter-modal'

const FEED_IMAGES: Record<string, number> = {
  '1': require('../../assets/images/cam_feed_1.png'),
  '2': require('../../assets/images/cam_feed_2.png'),
  '3': require('../../assets/images/cam_feed_3.png'),
  '4': require('../../assets/images/cam_feed_4.png'),
  '5': require('../../assets/images/cam_feed_3.png'),
  '6': require('../../assets/images/cam_feed_4.png'),
}

function HeaderIcon() {
  return (
    <Svg width={40} height={36} viewBox="0 0 40 36" fill="none">
      <Defs>
        <LinearGradient
          id="hdr_sc"
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
        stroke="url(#hdr_sc)"
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

function SingleCamViewIcon() {
  return (
    <Svg width={14} height={13} viewBox="0 0 14 13" fill="none">
      <Path
        d="M7 7C6.735 7 6.48 7.105 6.293 7.293C6.105 7.48 6 7.735 6 8C6 8.265 6.105 8.52 6.293 8.707C6.48 8.895 6.735 9 7 9C7.265 9 7.52 8.895 7.707 8.707C7.895 8.52 8 8.265 8 8C8 7.735 7.895 7.48 7.707 7.293C7.52 7.105 7.265 7 7 7ZM4 8C4 7.204 4.316 6.441 4.879 5.879C5.441 5.316 6.204 5 7 5C7.796 5 8.559 5.316 9.121 5.879C9.684 6.441 10 7.204 10 8C10 8.796 9.684 9.559 9.121 10.121C8.559 10.684 7.796 11 7 11C6.204 11 5.441 10.684 4.879 10.121C4.316 9.559 4 8.796 4 8ZM7 6C6.47 6 5.961 6.211 5.586 6.586C5.211 6.961 5 7.47 5 8C5 8.53 5.211 9.039 5.586 9.414C5.961 9.789 6.47 10 7 10C7.53 10 8.039 9.789 8.414 9.414C8.789 9.039 9 8.53 9 8C9 7.47 8.789 6.961 8.414 6.586C8.039 6.211 7.53 6 7 6ZM0 1.5C0 1.102 0.158 0.721 0.439 0.439C0.721 0.158 1.102 0 1.5 0H12.5C12.898 0 13.279 0.158 13.561 0.439C13.842 0.721 14 1.102 14 1.5V2.5C14 2.81 13.904 3.113 13.725 3.366C13.546 3.62 13.293 3.812 13 3.915V7C13 8.591 12.368 10.117 11.243 11.243C10.117 12.368 8.591 13 7 13C5.409 13 3.883 12.368 2.757 11.243C1.632 10.117 1 8.591 1 7V3.915C0.707 3.812 0.454 3.62 0.275 3.366C0.096 3.113 0 2.81 0 2.5V1.5ZM1.5 3H12.5C12.633 3 12.76 2.947 12.854 2.854C12.947 2.76 13 2.633 13 2.5V1.5C13 1.367 12.947 1.24 12.854 1.146C12.76 1.053 12.633 1 12.5 1H1.5C1.367 1 1.24 1.053 1.146 1.146C1.053 1.24 1 1.367 1 1.5V2.5C1 2.633 1.053 2.76 1.146 2.854C1.24 2.947 1.367 3 1.5 3ZM2 4V7C2 8.326 2.527 9.598 3.464 10.536C4.402 11.473 5.674 12 7 12C8.326 12 9.598 11.473 10.536 10.536C11.473 9.598 12 8.326 12 7V4H2Z"
        fill="#E6E6E6"
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

function SearchIcon() {
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
  return (
    <Svg width={26} height={23} viewBox="0 0 26 23" fill="none">
      <Defs>
        <LinearGradient
          id="exp_fill_sc"
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
          id="exp_stroke_sc"
          x1={-3.382}
          y1={-6.351}
          x2={5.729}
          y2={31.501}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#707070" />
          <Stop offset={0.418} stopColor="#707070" stopOpacity={0} />
          <Stop offset={0.649} stopColor="#BFBFBF" stopOpacity={0.12} />
          <Stop offset={1} stopColor="#BFBFBF" />
        </LinearGradient>
      </Defs>
      <Rect
        x={0.153}
        y={0.153}
        width={25.249}
        height={22.693}
        rx={1.343}
        fill="url(#exp_fill_sc)"
        fillOpacity={0.5}
        stroke="url(#exp_stroke_sc)"
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

interface LocationTab {
  id: string
  label: string
  width: number
}

const LOCATION_TABS: LocationTab[] = [
  { id: 'staff', label: 'Staff Room', width: 89 },
  { id: 'production', label: 'Production Room', width: 106 },
  { id: 'conference', label: 'Conference Room', width: 111 },
  { id: 'break', label: 'Break Room', width: 89 },
  { id: 'it', label: 'IT Department', width: 89 },
]

export default function SingleCameraScreen() {
  const router = useRouter()
  const { cameraId, cameraName } = useLocalSearchParams<{
    cameraId?: string
    cameraName?: string
  }>()
  const [activeTab, setActiveTab] = useState('staff')
  const [filterModalOpen, setFilterModalOpen] = useState(false)

  const feedImage = FEED_IMAGES[cameraId ?? '1'] ?? FEED_IMAGES['1']
  const displayName = cameraName ?? 'All Cameras (10)'

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{displayName}</Text>
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

      <View style={styles.viewSwitcherRow}>
        <View style={styles.viewSwitcherMain}>
          <View style={styles.viewSwitcherLabelRow}>
            <SingleCamViewIcon />
            <Text style={styles.viewSwitcherText}>Single Camera View</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.filterPill, pressed && { opacity: 0.75 }]}
            onPress={() => {
              tapHaptic()
              setFilterModalOpen(true)
            }}
          >
            <Text style={styles.filterPillText}>Filter</Text>
            <GradientStrokeBox width={81} height={29} rx={3} />
          </Pressable>
          <GradientStrokeBox width={281} height={48} rx={3} />
        </View>
        <Pressable
          style={({ pressed }) => [styles.gridToggleBtn, pressed && { opacity: 0.75 }]}
          onPress={() => {
            tapHaptic()
            router.push('/(main)/cameras')
          }}
        >
          <ChevronDownIcon />
        </Pressable>
      </View>

      <Pressable style={styles.searchBar} onPress={() => router.push('/(main)/search')}>
        <SearchIcon />
        <Text style={styles.searchPlaceholder}>Search Camera or Location</Text>
        <GradientStrokeBox width={349} height={48} rx={0} gradient={LINEAR_BG3_STROKE} />
      </Pressable>

      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {LOCATION_TABS.map(tab => {
            const isActive = tab.id === activeTab
            return (
              <Pressable
                key={tab.id}
                style={({ pressed }) => [
                  styles.locationTab,
                  isActive && styles.locationTabActive,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  tapHaptic()
                  setActiveTab(tab.id)
                }}
              >
                <Text style={[styles.locationTabText, isActive && styles.locationTabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      <Pressable
        style={styles.cameraFeedContainer}
        onPress={() => {
          tapHaptic()
          router.push({
            pathname: '/(main)/fullscreen-camera',
            params: { cameraId: cameraId ?? '1', cameraName: displayName },
          })
        }}
      >
        <Image source={feedImage} style={styles.cameraFeedArea} contentFit="cover" />
        <View style={styles.feedTopOverlay}>
          <View style={styles.liveIndicatorRow}>
            <View style={styles.liveDot} />
            <LiveCameraIcon />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.expandBtn, pressed && { opacity: 0.7 }]}
            onPress={() => {
              tapHaptic()
              router.push({
                pathname: '/(main)/fullscreen-camera',
                params: { cameraId: cameraId ?? '1', cameraName: displayName },
              })
            }}
          >
            <ExpandIcon />
          </Pressable>
        </View>
      </Pressable>

      <BottomNavBar activeTab="cameras" />

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
  viewSwitcherMain: {
    width: 281,
    height: 48,
    backgroundColor: '#1F1F1F',
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 12,
    paddingRight: 12,
  },
  viewSwitcherLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewSwitcherText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },
  filterPill: {
    width: 81,
    height: 29,
    backgroundColor: '#2E2E2E',
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  filterPillText: {
    color: '#E4E7EC',
    fontSize: 14,
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

  searchBar: {
    position: 'absolute',
    top: 195,
    left: 16,
    width: 349,
    height: 48,
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

  tabsWrapper: {
    position: 'absolute',
    top: 267,
    left: 16,
    width: 343,
    height: 40,
  },
  tabsContent: {
    flexDirection: 'row',
    gap: 12,
  },
  locationTab: {
    height: 40,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTabActive: {
    borderWidth: 2,
    borderColor: '#A3A3A3',
    borderRadius: 2,
  },
  locationTabText: {
    color: '#707070',
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },
  locationTabTextActive: {
    color: '#A3A3A3',
  },

  cameraFeedContainer: {
    position: 'absolute',
    top: 330,
    left: 15,
    width: 344,
    height: 416,
    backgroundColor: '#262626',
    overflow: 'hidden',
  },
  cameraFeedArea: {
    width: 344,
    height: 416,
    backgroundColor: '#262626',
  },
  feedTopOverlay: {
    position: 'absolute',
    top: 9,
    left: 9,
    right: 9,
    height: 23,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  liveIndicatorRow: {
    height: 14,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
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
    fontFamily: 'Lato_400Regular',
  },
  expandBtn: {
    width: 26,
    height: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
