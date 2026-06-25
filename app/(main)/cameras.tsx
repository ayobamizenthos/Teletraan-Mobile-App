import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Modal,
  TextInput,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native'
import { Image } from 'expo-image'
import { BlurView } from 'expo-blur'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'
import Svg, { Path, Rect, Circle as SvgCircle, LinearGradient, Stop, Defs } from 'react-native-svg'
import BottomNavBar from '../../components/bottom-nav-bar'
import StatusBar from '../../components/status-bar'
import {
  GradientStrokeBox,
  GradientFillBox,
  STROKE_LINEAR_2,
  LINEAR_BG3_STROKE,
  LINEAR_BG4_STROKE,
  SETUP_ROW_BORDER,
  AutoGradientStrokeBox,
} from '../../components/gradient-stroke-box'
import CameraFilterModal from '../../components/camera-filter-modal'
import { useCameraView, setFilterSelections, setSearchText } from '../../store/cameraView'
import { Colors, cssGradient } from '../../constants/Colors'
import { tapHaptic, warningHaptic, impactHaptic } from '../../lib/haptics'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getCameraFeeds } from '../../lib/api/cameras'
import type { CameraFeed } from '../../lib/data/cameras'

const SETUP_DONE_KEY = 'teletraan_setup_completed'
const COACHMARK_DONE_KEY = 'teletraan_view_mode_coachmark_seen'
const SWIPE_COACHMARK_KEY = 'teletraan_swipe_coachmark_seen'
const PAGE_WIDTH = 346
const CARD_WIDTH = 168
const CARD_HEIGHT = 199
const CARD_GAP = 8
const GRID_TOP = 323
// Two rows + the gap between them. The grid is a horizontal pager, so this is
// the full vertical extent of any page — the ScrollView is pinned to it so the
// quad grid can't scroll vertically and never slides under the floating nav.
const GRID_PAGE_HEIGHT = CARD_HEIGHT * 2 + CARD_GAP

const linearBG3Css = cssGradient(Colors.linearBG3)

function HeaderPanicIcon() {
  return (
    <Svg width={40} height={36} viewBox="0 0 40 36" fill="none">
      <Defs>
        <LinearGradient
          id="hdr_cam"
          x1={-5.294}
          y1={-9.94}
          x2={8.968}
          y2={49.306}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#707070" />
          <Stop offset={0.418259} stopColor="#707070" stopOpacity={0} />
          <Stop offset={0.649108} stopColor="#BFBFBF" stopOpacity={0.12} />
          <Stop offset={1} stopColor="#BFBFBF" />
        </LinearGradient>
      </Defs>
      <Rect
        x={0.24}
        y={0.24}
        width={39.52}
        height={35.52}
        rx={2.1}
        stroke="url(#hdr_cam)"
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

function GridViewIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 15 15" fill="none">
      <Path
        d="M0.5 3.416C0.5 2.041 0.5 1.354 0.928 0.928C1.353 0.5 2.041 0.5 3.417 0.5C4.793 0.5 5.479 0.5 5.906 0.928C6.333 1.354 6.333 2.041 6.333 3.416C6.333 4.79 6.333 5.477 5.906 5.903C5.479 6.331 4.792 6.331 3.417 6.331C2.042 6.331 1.354 6.331 0.928 5.903C0.5 5.478 0.5 4.791 0.5 3.416ZM0.5 11.585C0.5 10.21 0.5 9.523 0.928 9.097C1.354 8.669 2.042 8.669 3.417 8.669C4.792 8.669 5.479 8.669 5.906 9.097C6.333 9.523 6.333 10.21 6.333 11.585C6.333 12.959 6.333 13.646 5.906 14.072C5.479 14.5 4.792 14.5 3.417 14.5C2.042 14.5 1.354 14.5 0.928 14.072C0.5 13.647 0.5 12.959 0.5 11.585ZM8.667 3.416C8.667 2.041 8.667 1.354 9.094 0.928C9.521 0.5 10.208 0.5 11.583 0.5C12.958 0.5 13.646 0.5 14.072 0.928C14.5 1.354 14.5 2.041 14.5 3.416C14.5 4.79 14.5 5.477 14.072 5.903C13.646 6.331 12.958 6.331 11.583 6.331C10.208 6.331 9.521 6.331 9.094 5.903C8.667 5.477 8.667 4.791 8.667 3.416ZM8.667 11.585C8.667 10.21 8.667 9.523 9.094 9.097C9.521 8.669 10.208 8.669 11.583 8.669C12.958 8.669 13.646 8.669 14.072 9.097C14.5 9.523 14.5 10.21 14.5 11.585C14.5 12.959 14.5 13.646 14.072 14.072C13.646 14.5 12.958 14.5 11.583 14.5C10.208 14.5 9.521 14.5 9.094 14.072C8.667 13.646 8.667 12.959 8.667 11.585Z"
        stroke="#E6E6E6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function SingleCamMenuIcon() {
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

// Checkmark shown inside the Filter pill once a filter is active.
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

// "X" icon on the Clear Filter pill.
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

function PaginationLeftArrow({ enabled }: { enabled: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <SvgCircle cx={11} cy={11} r={11} fill={enabled ? Colors.black300 : Colors.black600} />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.99174 6.14603C9.8953 6.05252 9.76458 6 9.62829 6C9.492 6 9.36128 6.05252 9.26485 6.14603L5.15041 10.1407C5.0541 10.2343 5 10.3612 5 10.4936C5 10.6259 5.0541 10.7528 5.15041 10.8464L9.26485 14.8411C9.31194 14.8901 9.36871 14.9295 9.4318 14.9568C9.49489 14.9841 9.56299 14.9987 9.63205 14.9999C9.70111 15.0011 9.7697 14.9888 9.83374 14.9637C9.89778 14.9385 9.95595 14.9012 10.0048 14.8537C10.0536 14.8063 10.0921 14.7499 10.118 14.6877C10.1439 14.6255 10.1566 14.5589 10.1553 14.4919C10.1541 14.4248 10.139 14.3587 10.1109 14.2974C10.0828 14.2362 10.0423 14.1811 9.99174 14.1354L6.75504 10.9929H16.4857C16.6221 10.9929 16.7529 10.9403 16.8494 10.8466C16.9458 10.753 17 10.626 17 10.4936C17 10.3611 16.9458 10.2341 16.8494 10.1405C16.7529 10.0468 16.6221 9.99422 16.4857 9.99422H6.75504L9.99174 6.85175C10.088 6.75813 10.1421 6.63122 10.1421 6.49889C10.1421 6.36657 10.088 6.23966 9.99174 6.14603Z"
        fill={Colors.bg3}
      />
    </Svg>
  )
}

function PaginationRightArrow({ enabled }: { enabled: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <SvgCircle cx={11} cy={11} r={11} fill={enabled ? Colors.black300 : Colors.black600} />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.0083 6.14603C12.1047 6.05252 12.2354 6 12.3717 6C12.508 6 12.6387 6.05252 12.7351 6.14603L16.8496 10.1407C16.9459 10.2343 17 10.3612 17 10.4936C17 10.6259 16.9459 10.7528 16.8496 10.8464L12.7351 14.8411C12.6881 14.8901 12.6313 14.9295 12.5682 14.9568C12.5051 14.9841 12.437 14.9987 12.368 14.9999C12.2989 15.0011 12.2303 14.9888 12.1663 14.9637C12.1022 14.9385 12.044 14.9012 11.9952 14.8537C11.9464 14.8063 11.9079 14.7499 11.882 14.6877C11.8561 14.6255 11.8434 14.5589 11.8447 14.4919C11.8459 14.4248 11.861 14.3587 11.8891 14.2974C11.9172 14.2362 11.9577 14.1811 12.0083 14.1354L15.245 10.9929H5.51431C5.3779 10.9929 5.24709 10.9403 5.15064 10.8466C5.05419 10.753 5 10.626 5 10.4936C5 10.3611 5.05419 10.2341 5.15064 10.1405C5.24709 10.0468 5.3779 9.99422 5.51431 9.99422H15.245L12.0083 6.85175C11.912 6.75813 11.8579 6.63122 11.8579 6.49889C11.8579 6.36657 11.912 6.23966 12.0083 6.14603Z"
        fill={Colors.bg3}
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
          id="exp_fill"
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
          id="exp_stroke"
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
        fill="url(#exp_fill)"
        fillOpacity={0.5}
        stroke="url(#exp_stroke)"
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

const CAMERA_FEEDS = getCameraFeeds()

const CAMS_PER_PAGE = 4

const VIEW_OPTIONS = [
  { id: 'quad', label: 'Quad Grid View', desc: 'Watch 4 cameras at once' },
  { id: 'single', label: 'Single Camera View', desc: 'Focus on one camera at a time.' },
  { id: 'alert', label: 'Alert Priority View', desc: 'Only see cameras with alerts.' },
] as const

type ViewOptionId = (typeof VIEW_OPTIONS)[number]['id']

function SetupOverlay({ onDismiss }: { onDismiss: (viewId: ViewOptionId | null) => void }) {
  const [selected, setSelected] = useState<ViewOptionId | null>(null)

  const alpha = useSharedValue(0)

  useEffect(() => {
    alpha.value = withTiming(1, { duration: 260 })
    // `alpha` is a Reanimated shared value — stable across renders, never
    // changes identity, so excluding it from the deps is correct here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dismiss = (viewId: ViewOptionId | null) => {
    alpha.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onDismiss)(viewId)
    })
  }

  // Animate ONLY the card. CSS backdrop-filter breaks when an ancestor has opacity<1,
  // so the blur layer must NOT be inside an opacity-animated view — otherwise it only
  // kicks in after a re-render (e.g. selecting an option).
  const cardStyle = useAnimatedStyle(() => ({
    opacity: alpha.value,
    transform: [{ scale: 0.96 + alpha.value * 0.04 }],
  }))

  return (
    <View style={[StyleSheet.absoluteFill, setupStyles.wrapper]}>
      {/* Backdrop blur stays on while the popup is open (kept outside the opacity
          fade so it's active the moment the popup mounts). */}
      <View style={[StyleSheet.absoluteFill, setupStyles.backdropBlur]} pointerEvents="none">
        {Platform.OS !== 'web' && (
          // iOS uses its real native blur out of the box. Android needs the
          // dimezisBlurView backend for a true frosted backdrop; its blur
          // kernel reaches past the BlurView edge, so we inset the view by
          // -16 on every side and let the parent's overflow:hidden clip the
          // overhang. Without that inset the edges show a visible line.
          <BlurView
            intensity={Platform.OS === 'android' ? 40 : 18}
            tint="dark"
            experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
            style={setupStyles.androidBlurExtended}
          />
        )}
      </View>

      <Animated.View style={[setupStyles.card, cardStyle]}>
        <GradientFillBox width={343} height={427} rx={3} gradient={LINEAR_BG4_STROKE} />
        <GradientStrokeBox width={343} height={427} rx={3} gradient={STROKE_LINEAR_2} />

        <Text style={setupStyles.title}>
          Choose How You&apos;d Like to Start Viewing{'\n'}Your Cameras?
        </Text>

        {/* design — divider line at the TOP of each option row frame
            (Frame 68/70/71 tops: card y 90 / 173 / 256). Even parity for crisp 1px. */}
        {[90, 172, 256].map(dividerTop => (
          <View key={dividerTop} style={[setupStyles.divider, { top: dividerTop }]} />
        ))}

        {VIEW_OPTIONS.map((option, i) => {
          const isSelected = selected === option.id
          const optionTop = 90 + i * 83
          return (
            <Pressable
              key={option.id}
              style={({ pressed }) => [
                setupStyles.optionRow,
                { top: optionTop },
                pressed && setupStyles.btnPressed,
              ]}
              onPress={() => {
                tapHaptic()
                // Tapping the selected option again clears the selection
                setSelected(prev => (prev === option.id ? null : option.id))
              }}
            >
              <View style={setupStyles.optionTextCol}>
                <Text style={setupStyles.optionLabel}>{option.label}</Text>
                <Text style={setupStyles.optionDesc}>{option.desc}</Text>
              </View>
              <View style={[setupStyles.radioRing, isSelected && setupStyles.radioRingSelected]}>
                {isSelected && <View style={setupStyles.radioDot} />}
              </View>
            </Pressable>
          )
        })}

        <View style={setupStyles.buttonRow}>
          <Pressable
            style={({ pressed }) => [setupStyles.skipBtn, pressed && setupStyles.btnPressed]}
            onPress={() => {
              tapHaptic()
              dismiss(null)
            }}
          >
            <Text style={setupStyles.skipText}>Skip</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [setupStyles.startBtn, pressed && setupStyles.btnPressed]}
            onPress={() => {
              impactHaptic()
              dismiss(selected)
            }}
          >
            <Text style={setupStyles.startText}>{selected ? 'Continue' : 'Start with Anyone'}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  )
}

export default function CamerasScreen() {
  const router = useRouter()
  // `?pickView=1` (e.g. from the "Watch Live Feed" flow) forces the view-mode
  // chooser open even after the user has completed it once before.
  const { pickView } = useLocalSearchParams<{ pickView?: string }>()
  const [currentPage, setCurrentPage] = useState(0)
  // Shared store: search + filter selections persist when the user switches
  // between Quad-Grid and Single-Camera view, and carry into fullscreen-camera.
  const { searchText, filterSelections } = useCameraView()
  const filterActive = filterSelections.length > 0
  const [cameraFilterOpen, setCameraFilterOpen] = useState(false)
  const [panicVisible, setPanicVisible] = useState(false)
  const [showSetupOverlay, setShowSetupOverlay] = useState(false)
  const [viewModeOpen, setViewModeOpen] = useState(false)
  const [showCoachmark, setShowCoachmark] = useState(false)
  const [showSwipeCoachmark, setShowSwipeCoachmark] = useState(false)
  const gridScrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (pickView === '1') {
      setShowSetupOverlay(true)
    } else {
      AsyncStorage.getItem(SETUP_DONE_KEY).then(done => {
        if (!done) setShowSetupOverlay(true)
      })
    }
    AsyncStorage.getItem(COACHMARK_DONE_KEY).then(seen => {
      if (!seen) setShowCoachmark(true)
    })
  }, [pickView])

  const dismissCoachmark = () => {
    setShowCoachmark(false)
    AsyncStorage.setItem(COACHMARK_DONE_KEY, '1').catch(() => {})
  }

  const dismissSwipeCoachmark = () => {
    setShowSwipeCoachmark(false)
    AsyncStorage.setItem(SWIPE_COACHMARK_KEY, '1').catch(() => {})
  }

  const goToPage = (next: number) => {
    setCurrentPage(next)
    gridScrollRef.current?.scrollTo({ x: next * PAGE_WIDTH, animated: true })
    if (showSwipeCoachmark) setShowSwipeCoachmark(false)
  }

  // Fires on every scroll frame — on web onMomentumScrollEnd never fires, so
  // we use the running offset to keep the page indicator in sync as the user
  // swipes the grid. The Math.round snaps mid-flick to the nearer page.
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / PAGE_WIDTH)
    if (page !== currentPage && page >= 0) {
      setCurrentPage(page)
      if (showSwipeCoachmark) dismissSwipeCoachmark()
    }
  }

  // Narrow the grid to the chosen selections. Camera selections match by the
  // canonical camera id (modal ids and feed ids share the same scheme).
  // Location selections match by the camera's `location` field. The two modes
  // are mutually exclusive within one apply, so we just check the first item.
  const allVisible = (() => {
    if (!filterActive) return CAMERA_FEEDS
    const mode = filterSelections[0].mode
    if (mode === 'Camera') {
      const ids = new Set(filterSelections.map(s => s.id))
      return CAMERA_FEEDS.filter(f => ids.has(f.id))
    }
    const locs = new Set(filterSelections.map(s => s.label.toLowerCase()))
    return CAMERA_FEEDS.filter(f => locs.has(f.location.toLowerCase()))
  })()
  const totalPages = Math.max(1, Math.ceil(allVisible.length / CAMS_PER_PAGE))

  // After a filter shrinks the list, snap back to the first page so the user
  // doesn't land on an empty page off the end.
  useEffect(() => {
    if (currentPage > totalPages - 1) {
      setCurrentPage(0)
      gridScrollRef.current?.scrollTo({ x: 0, animated: false })
    }
  }, [totalPages, currentPage])

  const searchTerm = searchText.trim().toLowerCase()
  const isSearching = searchTerm.length > 0
  const searchResults = isSearching
    ? allVisible.filter(
        c =>
          c.name.toLowerCase().includes(searchTerm) || c.location.toLowerCase().includes(searchTerm)
      )
    : []
  const searchRows: CameraFeed[][] = []
  for (let i = 0; i < searchResults.length; i += 2) {
    searchRows.push(searchResults.slice(i, i + 2))
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageInner}>
          <StatusBar />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {showSetupOverlay ? 'All Cameras' : 'All Cameras (12)'}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.headerIconBtn, pressed && styles.pressed]}
              onPress={() => {
                tapHaptic()
                router.push('/(main)/notifications')
              }}
            >
              <HeaderPanicIcon />
            </Pressable>
          </View>

          <View style={styles.divider} />

          {!showSetupOverlay && (
            <View style={styles.viewSwitcherRow}>
              <View style={styles.viewSwitcherOuter}>
                <View style={styles.viewSwitcherInner}>
                  <View style={styles.viewSwitcherLabelRow}>
                    <GridViewIcon />
                    <Text style={styles.viewSwitcherText}>Quad Grid View</Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      tapHaptic()
                      setCameraFilterOpen(true)
                    }}
                  >
                    <View style={styles.filterPillOuter}>
                      <View
                        style={[
                          styles.filterPillInner,
                          filterActive && styles.filterPillInnerActive,
                        ]}
                      >
                        <Text style={styles.filterPillText}>Filter</Text>
                        {filterActive && <FilterCheckIcon />}
                      </View>
                      {!filterActive && (
                        <GradientStrokeBox
                          width={81}
                          height={29}
                          rx={3}
                          gradient={STROKE_LINEAR_2}
                        />
                      )}
                    </View>
                  </Pressable>
                </View>
                <GradientStrokeBox
                  width={281}
                  height={48}
                  rx={3}
                  strokeWidth={2}
                  gradient={LINEAR_BG4_STROKE}
                />
              </View>

              <Pressable
                style={({ pressed }) => [styles.gridToggleBtn, pressed && { opacity: 0.7 }]}
                onPress={() => {
                  tapHaptic()
                  dismissCoachmark()
                  setViewModeOpen(prev => !prev)
                }}
              >
                <ChevronDownIcon />
              </Pressable>
            </View>
          )}

          {showCoachmark && !viewModeOpen && !showSetupOverlay && (
            <Pressable style={styles.coachmarkContainer} onPress={dismissCoachmark}>
              <Svg width={50} height={25} viewBox="0 0 50 25" style={styles.coachmarkArrow}>
                <Path d="M25 0L50 25H0L25 0Z" fill="#2E2E2E" />
              </Svg>
              <View style={styles.coachmarkCard}>
                <Text style={styles.coachmarkText}>You can switch your Viewing Mode{'\n'}Here</Text>
              </View>
            </Pressable>
          )}

          {showSwipeCoachmark && !showCoachmark && !viewModeOpen && !showSetupOverlay && (
            <Pressable
              style={styles.swipeCoachmarkContainer}
              onPress={() => setShowSwipeCoachmark(false)}
            >
              {/* Narrow tall triangle starting at the LEFT edge of the pill, pointing UP at "1/3" pagination */}
              <Svg width={32} height={20} viewBox="0 0 32 20" style={styles.swipeCoachmarkArrow}>
                <Path d="M0 20L16 0L32 20H0Z" fill="#2E2E2E" />
              </Svg>
              <View style={styles.swipeCoachmarkCard}>
                <Text style={styles.swipeCoachmarkText}>Swipe to view{'\n'}other screens</Text>
              </View>
            </Pressable>
          )}

          {viewModeOpen && (
            <Pressable style={styles.viewModeBackdrop} onPress={() => setViewModeOpen(false)}>
              <View style={styles.viewModeDropdown}>
                <Pressable
                  style={({ pressed }) => [styles.viewModeOption, pressed && { opacity: 0.7 }]}
                  onPress={() => {
                    tapHaptic()
                    setViewModeOpen(false)
                    router.replace('/(main)/single-camera-view')
                  }}
                >
                  <SingleCamMenuIcon />
                  <Text style={styles.viewModeOptionText}>Single Camera View</Text>
                </Pressable>
              </View>
            </Pressable>
          )}

          {!showSetupOverlay && !filterActive && (
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

          {!showSetupOverlay && filterActive && (
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
                    tapHaptic()
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

          {!showSetupOverlay && !isSearching && !filterActive && (
            <Pressable
              style={styles.pageIndicator}
              onPress={() => setShowSwipeCoachmark(prev => !prev)}
            >
              <Pressable
                onPress={() => goToPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                style={styles.pageArrowSlot}
              >
                <PaginationLeftArrow enabled={currentPage > 0} />
              </Pressable>
              <Text style={styles.pageText}>
                {currentPage + 1}/{totalPages}
              </Text>
              <Pressable
                onPress={() => goToPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                style={styles.pageArrowSlot}
              >
                <PaginationRightArrow enabled={currentPage < totalPages - 1} />
              </Pressable>
            </Pressable>
          )}

          {!showSetupOverlay &&
            isSearching &&
            (searchResults.length === 0 ? (
              <View style={styles.searchEmpty}>
                <Text style={styles.searchEmptyText}>No cameras or locations found</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.searchResultsScroll}
                contentContainerStyle={styles.searchResultsContent}
                showsVerticalScrollIndicator={false}
              >
                {searchRows.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.gridRow}>
                    {row.map(camera => (
                      <Pressable
                        key={camera.id}
                        style={styles.cameraCard}
                        onPress={() => {
                          tapHaptic()
                          router.push({
                            pathname: '/(main)/fullscreen-camera',
                            params: {
                              cameraId: camera.id,
                              cameraName: camera.name,
                              // Only constrain the fullscreen pager when a
                              // filter is active here — otherwise it shows
                              // the full canonical list.
                              ...(filterActive && {
                                filteredIds: allVisible.map(c => c.id).join(','),
                              }),
                            },
                          })
                        }}
                      >
                        <Image
                          source={camera.thumbnail}
                          style={styles.cameraFeedArea}
                          contentFit="cover"
                        />
                        <View style={styles.cameraNameBar}>
                          <Text style={styles.cameraNameText} numberOfLines={1}>
                            {camera.name}
                          </Text>
                        </View>
                        <View style={styles.cameraTopOverlay}>
                          <View style={styles.liveIndicatorRow}>
                            <View
                              style={[
                                styles.liveDot,
                                {
                                  backgroundColor: camera.isOnline
                                    ? Colors.error500
                                    : Colors.avzdaxGrey,
                                },
                              ]}
                            />
                            <LiveCameraIcon
                              color={camera.isOnline ? Colors.black100 : Colors.avzdaxGrey}
                            />
                          </View>
                          <Pressable
                            onPress={() => {
                              tapHaptic()
                              router.push({
                                pathname: '/(main)/fullscreen-camera',
                                params: {
                                  cameraId: camera.id,
                                  cameraName: camera.name,
                                  // Only constrain the fullscreen pager when a
                                  // filter is active here — otherwise it shows
                                  // the full canonical list.
                                  ...(filterActive && {
                                    filteredIds: allVisible.map(c => c.id).join(','),
                                  }),
                                },
                              })
                            }}
                          >
                            <ExpandIcon />
                          </Pressable>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                ))}
              </ScrollView>
            ))}

          {!showSetupOverlay && !isSearching && (
            <ScrollView
              ref={gridScrollRef}
              style={[styles.gridScroll, filterActive && styles.gridScrollFiltered]}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              onMomentumScrollEnd={handleScroll}
              scrollEventThrottle={16}
              decelerationRate="fast"
              snapToInterval={PAGE_WIDTH}
              snapToAlignment="start"
            >
              {Array.from({ length: totalPages }).map((_, pageIdx) => {
                const start = pageIdx * CAMS_PER_PAGE
                const feeds = allVisible.slice(start, start + CAMS_PER_PAGE)
                const pageRows: CameraFeed[][] = []
                for (let i = 0; i < feeds.length; i += 2) {
                  pageRows.push(feeds.slice(i, i + 2))
                }
                return (
                  <View key={pageIdx} style={styles.gridPage}>
                    {pageRows.map((row, rowIndex) => (
                      <View key={rowIndex} style={styles.gridRow}>
                        {row.map(camera => (
                          <Pressable
                            key={camera.id}
                            style={styles.cameraCard}
                            onPress={() => {
                              tapHaptic()
                              router.push({
                                pathname: '/(main)/fullscreen-camera',
                                params: {
                                  cameraId: camera.id,
                                  cameraName: camera.name,
                                  // Only constrain the fullscreen pager when a
                                  // filter is active here — otherwise it shows
                                  // the full canonical list.
                                  ...(filterActive && {
                                    filteredIds: allVisible.map(c => c.id).join(','),
                                  }),
                                },
                              })
                            }}
                          >
                            <Image
                              source={camera.thumbnail}
                              style={styles.cameraFeedArea}
                              contentFit="cover"
                            />

                            <View style={styles.cameraNameBar}>
                              <Text style={styles.cameraNameText} numberOfLines={1}>
                                {camera.name}
                              </Text>
                            </View>

                            <View style={styles.cameraTopOverlay}>
                              <View style={styles.liveIndicatorRow}>
                                <View
                                  style={[
                                    styles.liveDot,
                                    {
                                      backgroundColor: camera.isOnline
                                        ? Colors.error500
                                        : Colors.avzdaxGrey,
                                    },
                                  ]}
                                />
                                <LiveCameraIcon
                                  color={camera.isOnline ? Colors.black100 : Colors.avzdaxGrey}
                                />
                              </View>

                              <Pressable
                                onPress={() => {
                                  tapHaptic()
                                  router.push({
                                    pathname: '/(main)/fullscreen-camera',
                                    params: {
                                      cameraId: camera.id,
                                      cameraName: camera.name,
                                      // Only constrain the fullscreen pager when a
                                      // filter is active here — otherwise it shows
                                      // the full canonical list.
                                      ...(filterActive && {
                                        filteredIds: allVisible.map(c => c.id).join(','),
                                      }),
                                    },
                                  })
                                }}
                              >
                                <ExpandIcon />
                              </Pressable>
                            </View>
                          </Pressable>
                        ))}
                      </View>
                    ))}
                  </View>
                )
              })}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      <BottomNavBar activeTab="cameras" />

      {showSetupOverlay && (
        <SetupOverlay
          onDismiss={viewId => {
            setShowSetupOverlay(false)
            AsyncStorage.setItem(SETUP_DONE_KEY, '1').catch(() => {})
            if (viewId === 'single') router.replace('/(main)/single-camera-view')
            else if (viewId === 'alert') router.replace('/(main)/alert-priority-view')
          }}
        />
      )}

      {/* Panic Alert confirmation dialog */}
      <Modal
        visible={panicVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPanicVisible(false)}
      >
        <Pressable style={styles.panicOverlay} onPress={() => setPanicVisible(false)}>
          <Pressable style={styles.panicDialog} onPress={e => e.stopPropagation?.()}>
            <Svg width={44} height={44} viewBox="0 0 48 48" fill="none" style={styles.panicIcon}>
              <Path
                d="M24 4C24 4 10 14 10 26C10 33.732 16.268 40 24 40C31.732 40 38 33.732 38 26C38 14 24 4 24 4Z"
                fill="#D92D20"
                fillOpacity={0.15}
                stroke="#D92D20"
                strokeWidth={2}
              />
              <Path
                d="M24 16V27M24 31V33"
                stroke="#D92D20"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <Path
                d="M14 8L10 4M34 8L38 4M8 22H4M44 22H40"
                stroke="#D92D20"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>

            <Text style={styles.panicTitle}>Trigger Emergency Protocol?</Text>
            <Text style={styles.panicBody}>
              This will immediately alert all assigned responders and activate site-wide emergency
              procedures. This action is logged and cannot be undone.
            </Text>

            <View style={styles.panicButtons}>
              <Pressable
                style={({ pressed }) => [styles.panicCancelBtn, pressed && styles.pressed]}
                onPress={() => {
                  tapHaptic()
                  setPanicVisible(false)
                }}
              >
                <Text style={styles.panicCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.panicConfirmBtn, pressed && styles.pressed]}
                onPress={() => {
                  warningHaptic()
                  setPanicVisible(false)
                }}
              >
                <Text style={styles.panicConfirmText}>Confirm Protocol</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {cameraFilterOpen && (
        <CameraFilterModal
          onClose={() => setCameraFilterOpen(false)}
          onApply={selections => {
            setFilterSelections(selections)
            setCurrentPage(0)
            gridScrollRef.current?.scrollTo({ x: 0, animated: false })
          }}
          showHelper
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
  // Vertical scroll host: lets the user pull the page up so the bottom row of
  // the quad grid clears the floating bottom nav. The nav is rendered as a
  // sibling of this ScrollView so it stays pinned while content scrolls.
  pageScroll: {
    flex: 1,
    width: 375,
  },
  pageScrollContent: {
    width: 375,
  },
  // Page canvas. The design frame is 812 tall; the extra 80px below gives the
  // user just enough scroll room to lift row 2 above the bottom nav.
  pageInner: {
    width: 375,
    height: 812 + 80,
    position: 'relative',
  },
  feedWrapper: {
    flex: 1,
    width: 375,
    height: 812,
  },
  feedBlurredWeb: {
    ...Platform.select({
      web: {
        filter: 'blur(10px)',
        transform: 'scale(1.02)',
      } as any,
      default: {},
    }),
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
    width: 349,
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
    backgroundColor: Colors.bg1,
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
    backgroundColor: Colors.bg3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  filterPillActive: {
    backgroundColor: '#A3A3A3',
  },
  // Once a filter is applied the pill swaps its gradient stroke for a flat
  // 1px #BFBFBF border (Avzdax Main/Grey), matching the Figma active state.
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

  // Clear Filter pill — only visible when a filter is active. Tapping it
  // removes the filter and falls back to the full grid. Width hugs content
  // so the label never wraps to a second line.
  // Row of one chip per active filter selection. Horizontally scrollable so
  // multiple selections (up to 4) never wrap or get clipped.
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

  coachmarkContainer: {
    position: 'absolute',
    top: 187,
    right: 16,
    width: 246,
    height: 73,
    zIndex: 60,
  },
  // (right-aligned area pointing up to chevron toggle). Sits ABOVE the card with no overlap.
  coachmarkArrow: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  coachmarkCard: {
    position: 'absolute',
    top: 19,
    left: 0,
    width: 246,
    height: 54,
    backgroundColor: '#2E2E2E',
    borderRadius: 3,
    padding: 10,
    justifyContent: 'center',
  },
  coachmarkText: {
    color: '#F3F4F7',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 16.8,
    fontFamily: 'Lato_400Regular',
  },

  // Swipe coachmark — narrow pill (~140px) positioned below "1/3" pagination.
  // Arrow starts at the LEFT edge of the pill, pointing up at the right arrow of pagination.
  swipeCoachmarkContainer: {
    position: 'absolute',
    top: 300,
    left: 195,
    width: 140,
    height: 74,
    zIndex: 60,
  },
  swipeCoachmarkArrow: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  swipeCoachmarkCard: {
    position: 'absolute',
    top: 20,
    left: 0,
    width: 140,
    height: 54,
    backgroundColor: '#2E2E2E',
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  // Slightly lighter weight text for the swipe coachmark so it doesn't look faux-bold
  swipeCoachmarkText: {
    color: '#F3F4F7',
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 16.8,
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
  searchEmpty: {
    position: 'absolute',
    top: 323,
    left: 16,
    width: 343,
    alignItems: 'center',
    paddingTop: 60,
  },
  searchEmptyText: {
    color: '#8A8A8A',
    fontSize: 14,
    fontFamily: 'Lato_400Regular',
  },
  searchResultsScroll: {
    position: 'absolute',
    top: 267,
    left: 16,
    width: 346,
    bottom: 0,
  },
  searchResultsContent: {
    gap: 8,
    paddingBottom: 130,
  },

  pageIndicator: {
    position: 'absolute',
    top: 267,
    left: 117,
    width: 141,
    height: 32,
    backgroundColor: Colors.bg1,
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 32,
  },
  pageArrowSlot: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },

  gridScroll: {
    position: 'absolute',
    top: GRID_TOP,
    left: 16,
    width: PAGE_WIDTH,
    height: GRID_PAGE_HEIGHT,
  },
  // When a filter is applied the search bar and pagination row are hidden,
  // so the grid slides up to sit 24px below the Clear Filter pill (which
  // ends at y=219), matching the Figma filter-active layout.
  gridScrollFiltered: {
    top: 219 + 24,
  },
  // Each page in the horizontal pagingEnabled ScrollView — fixed width = PAGE_WIDTH so
  // pagingEnabled snaps to one page per swipe.
  gridPage: {
    width: PAGE_WIDTH,
    gap: CARD_GAP,
  },
  gridRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },

  cameraCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#262626',
    overflow: 'hidden',
  },
  cameraFeedArea: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#262626',
  },

  cameraNameBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 111,
    height: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    opacity: 0.8,
    ...Platform.select({
      web: { backgroundImage: linearBG3Css } as any,
      default: { backgroundColor: 'rgba(31,31,31,1)' },
    }),
  },
  cameraNameText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },

  cameraTopOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
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
  },
  liveText: {
    color: '#8A8A8A',
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },

  panicOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  panicDialog: {
    width: 327,
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(112,112,112,0.3)',
  },
  panicIcon: {
    marginBottom: 4,
  },
  panicTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'Lato_400Regular',
  },
  panicBody: {
    color: '#A3A3A3',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    fontFamily: 'Lato_400Regular',
  },
  panicButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  panicCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  panicCancelText: {
    color: '#A3A3A3',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },
  panicConfirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D92D20',
  },
  panicConfirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Lato_400Regular',
  },

  pressed: {
    opacity: 0.7,
  },
})

const setupStyles = StyleSheet.create({
  wrapper: {
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  backdropBlur: {
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(3px)',
        backgroundColor: 'rgba(0,0,0,0.02)',
      } as any,
      default: { backgroundColor: 'rgba(0,0,0,0.02)' },
    }),
  },
  // Inset extends the BlurView past the visible viewport so the Android
  // dimezisBlurView kernel never samples a transparent edge — the parent's
  // overflow:hidden clips the overhang.
  androidBlurExtended: {
    position: 'absolute',
    top: -16,
    left: -16,
    right: -16,
    bottom: -16,
  },
  divider: {
    position: 'absolute',
    left: 16,
    width: 311,
    height: 1,
    backgroundColor: 'rgba(112,112,112,0.55)',
  },
  card: {
    width: 343,
    height: 427,
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  title: {
    position: 'absolute',
    top: 22,
    left: 16,
    width: 318,
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 21.6,
    fontFamily: 'Lato_400Regular',
  },
  optionRow: {
    position: 'absolute',
    left: 16,
    width: 311,
    height: 67,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 15.5,
  },
  optionTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  optionLabel: {
    color: '#E4E7EC',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 19.2,
    fontFamily: 'Lato_400Regular',
  },
  optionDesc: {
    color: '#8A8A8A',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 16.8,
    marginTop: 8,
    fontFamily: 'Lato_400Regular',
  },
  // Reads as a faint shadowy ring (NOT a white line).
  radioRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1F1F1F',
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // you SEE is only the soft #707070 50% blur-4 drop shadow. A real RN border renders
    // as a hard 1px line, so on web we use shadow-only; native keeps a faint hairline.
    ...Platform.select({
      web: { boxShadow: '0 0 4px 0 rgba(112,112,112,0.55)' } as any,
      default: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(138,138,138,0.35)',
        shadowColor: '#707070',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  // #A3A3A3 0.5px (defined/brighter), no group shadow (the dot carries its own glow).
  radioRingSelected: {
    borderWidth: 0.5,
    borderColor: '#A3A3A3',
    ...Platform.select({
      web: { boxShadow: 'none' } as any,
      default: { shadowOpacity: 0, elevation: 0 },
    }),
  },
  // blur 5 → an embossed metallic-grey ball (NOT green, NOT flat grey).
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#A3A3A3',
    ...Platform.select({
      web: {
        boxShadow: 'inset 4px 4px 4px 0 rgba(112,112,112,1), 0 0 5px 0 rgba(163,163,163,0.5)',
      } as any,
      default: {
        shadowColor: '#A3A3A3',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 2,
      },
    }),
  },
  buttonRow: {
    position: 'absolute',
    top: 355,
    left: 61,
    width: 266,
    height: 40,
    flexDirection: 'row',
    gap: 16,
  },
  skipBtn: {
    width: 110,
    height: 40,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#A3A3A3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    color: '#A3A3A3',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 16.8,
    fontFamily: 'Lato_400Regular',
  },
  // The #242424 line reads ONLY on the right+bottom edges (top-left is the soft
  startBtn: {
    width: 140,
    height: 40,
    backgroundColor: '#A3A3A3',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: '#242424',
    borderBottomColor: '#242424',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        // the #242424 stroke then reads as a defined black line on right+bottom where
        boxShadow: 'inset 4px 4px 4px 0 rgba(112,112,112,1), 0 0 5px 0 rgba(163,163,163,0.5)',
      } as any,
      default: {
        shadowColor: '#A3A3A3',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 3,
      },
    }),
  },
  startText: {
    color: '#262626',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 16.8,
    fontFamily: 'Lato_400Regular',
  },
  btnPressed: {
    opacity: 0.75,
  },
})
