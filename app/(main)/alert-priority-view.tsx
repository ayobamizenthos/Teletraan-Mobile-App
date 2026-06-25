import { useMemo, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg'
import StatusBar from '../../components/status-bar'
import BottomNavBar from '../../components/bottom-nav-bar'
import { GradientStrokeBox, STROKE_LINEAR_2 } from '../../components/gradient-stroke-box'
import { tapHaptic, impactHaptic } from '../../lib/haptics'
import { getPriorityAlerts } from '../../lib/api/alerts'
import type { PriorityAlert } from '../../lib/data/alerts'
import { Colors } from '../../constants/Colors'

const PAGE_WIDTH = 375
const RED_BANNER_HEIGHT = 238
const CARD_RADIUS = 15
const CARD_GAP = 20

function AlertPriorityWarningIcon() {
  // 22 × 20 warning triangle from Figma Group 1601.
  return (
    <Svg width={23} height={20} viewBox="0 0 23 20" fill="none">
      <Path
        d="M12.1578 15.1231C12.1578 15.3817 12.055 15.6298 11.8721 15.8128C11.6892 15.9957 11.4411 16.0984 11.1824 16.0984C10.9237 16.0984 10.6756 15.9957 10.4927 15.8128C10.3098 15.6298 10.207 15.3817 10.207 15.1231C10.207 14.8644 10.3098 14.6163 10.4927 14.4334C10.6756 14.2504 10.9237 14.1477 11.1824 14.1477C11.4411 14.1477 11.6892 14.2504 11.8721 14.4334C12.055 14.6163 12.1578 14.8644 12.1578 15.1231ZM11.914 7.07614C11.914 6.88213 11.8369 6.69606 11.6997 6.55887C11.5625 6.42168 11.3764 6.3446 11.1824 6.3446C10.9884 6.3446 10.8023 6.42168 10.6651 6.55887C10.528 6.69606 10.4509 6.88213 10.4509 7.07614V11.4654C10.4509 11.6594 10.528 11.8455 10.6651 11.9826C10.8023 12.1198 10.9884 12.1969 11.1824 12.1969C11.3764 12.1969 11.5625 12.1198 11.6997 11.9826C11.8369 11.8455 11.914 11.6594 11.914 11.4654V7.07614Z"
        fill="#E6E6E6"
      />
      <Path
        d="M9.0771 1.21801C10.0164 -0.406003 12.3593 -0.406003 13.2986 1.21801L22.0448 16.3404C22.9841 17.9663 21.8107 20 19.9331 20H2.44254C0.563955 20 -0.608457 17.9663 0.330838 16.3404L9.0771 1.21801ZM12.0325 1.95052C11.9465 1.80275 11.8232 1.68013 11.675 1.5949C11.5268 1.50967 11.3588 1.46481 11.1878 1.46481C11.0169 1.46481 10.8489 1.50967 10.7006 1.5949C10.5524 1.68013 10.4292 1.80275 10.3432 1.95052L1.59786 17.0729C1.51264 17.2213 1.46787 17.3894 1.46804 17.5606C1.46822 17.7317 1.51332 17.8998 1.59884 18.048C1.68435 18.1962 1.80729 18.3194 1.95536 18.4052C2.10342 18.491 2.27142 18.5364 2.44254 18.5369H19.9331C20.1041 18.5363 20.2719 18.4909 20.4199 18.4051C20.5678 18.3194 20.6906 18.1963 20.7761 18.0483C20.8616 17.9002 20.9068 17.7323 20.9071 17.5613C20.9074 17.3903 20.8628 17.2222 20.7778 17.0738L12.0325 1.95052Z"
        fill="#E6E6E6"
      />
    </Svg>
  )
}

function BurglaryIcon() {
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

function LiveCameraIcon() {
  // Same vector as the camera feed cards (cameras.tsx).
  return (
    <Svg width={14} height={13} viewBox="0 0 14 13" fill="none">
      <Path
        d="M7 7C6.735 7 6.48 7.105 6.293 7.293C6.105 7.48 6 7.735 6 8C6 8.265 6.105 8.52 6.293 8.707C6.48 8.895 6.735 9 7 9C7.265 9 7.52 8.895 7.707 8.707C7.895 8.52 8 8.265 8 8C8 7.735 7.895 7.48 7.707 7.293C7.52 7.105 7.265 7 7 7ZM4 8C4 7.204 4.316 6.441 4.879 5.879C5.441 5.316 6.204 5 7 5C7.796 5 8.559 5.316 9.121 5.879C9.684 6.441 10 7.204 10 8C10 8.796 9.684 9.559 9.121 10.121C8.559 10.684 7.796 11 7 11C6.204 11 5.441 10.684 4.879 10.121C4.316 9.559 4 8.796 4 8ZM7 6C6.47 6 5.961 6.211 5.586 6.586C5.211 6.961 5 7.47 5 8C5 8.53 5.211 9.039 5.586 9.414C5.961 9.789 6.47 10 7 10C7.53 10 8.039 9.789 8.414 9.414C8.789 9.039 9 8.53 9 8C9 7.47 8.789 6.961 8.414 6.586C8.039 6.211 7.53 6 7 6ZM0 1.5C0 1.102 0.158 0.721 0.439 0.439C0.721 0.158 1.102 0 1.5 0H12.5C12.898 0 13.279 0.158 13.561 0.439C13.842 0.721 14 1.102 14 1.5V2.5C14 2.81 13.904 3.113 13.725 3.366C13.546 3.62 13.293 3.812 13 3.915V7C13 8.591 12.368 10.117 11.243 11.243C10.117 12.368 8.591 13 7 13C5.409 13 3.883 12.368 2.757 11.243C1.632 10.117 1 8.591 1 7V3.915C0.707 3.812 0.454 3.62 0.275 3.366C0.096 3.113 0 2.81 0 2.5V1.5ZM1.5 3H12.5C12.633 3 12.76 2.947 12.854 2.854C12.947 2.76 13 2.633 13 2.5V1.5C13 1.367 12.947 1.24 12.854 1.146C12.76 1.053 12.633 1 12.5 1H1.5C1.367 1 1.24 1.053 1.146 1.146C1.053 1.24 1 1.367 1 1.5V2.5C1 2.633 1.053 2.76 1.146 2.854C1.24 2.947 1.367 3 1.5 3ZM2 4V7C2 8.326 2.527 9.598 3.464 10.536C4.402 11.473 5.674 12 7 12C8.326 12 9.598 11.473 10.536 10.536C11.473 9.598 12 8.326 12 7V4H2Z"
        fill="#F2F4F7"
      />
    </Svg>
  )
}

function CardDismissIcon() {
  // Group 1542 — 26 × 23 frosted rectangle with a small 8 × 8 X inside.
  return (
    <Svg width={26} height={23} viewBox="0 0 26 23" fill="none">
      <Defs>
        <LinearGradient
          id="cardDismissFill"
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
          id="cardDismissStroke"
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
        fill="url(#cardDismissFill)"
        fillOpacity={0.5}
        stroke="url(#cardDismissStroke)"
        strokeWidth={0.307}
      />
      <Path
        d="M9 7L17 15M17 7L9 15"
        stroke="#E6E6E6"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function LevelChip({ level }: { level: PriorityAlert['level'] }) {
  return (
    <View style={styles.levelChip}>
      <Text style={styles.levelChipText}>{level}</Text>
    </View>
  )
}

function PriorityAlertCard({
  alert,
  showDismiss,
  onPress,
  onDismiss,
}: {
  alert: PriorityAlert
  showDismiss: boolean
  onPress: () => void
  onDismiss: () => void
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={alert.thumbnail} style={styles.cardImage} contentFit="cover" />

      {/* Top overlay on the camera feed — LIVE indicator + per-card X */}
      <View style={styles.cardFeedOverlay}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <LiveCameraIcon />
        </View>
        {showDismiss && (
          <Pressable
            onPress={e => {
              e.stopPropagation?.()
              tapHaptic()
              onDismiss()
            }}
            hitSlop={6}
          >
            <CardDismissIcon />
          </Pressable>
        )}
      </View>

      {/* Text block under the image */}
      <View style={styles.cardBody}>
        <LevelChip level={alert.level} />
        <Text style={styles.cardActivity}>{alert.activity}</Text>
        <View style={styles.cardLocationRow}>
          <Text style={styles.cardLocationLabel}>Location:</Text>
          <Text style={styles.cardLocationValue}>{alert.location}</Text>
        </View>
      </View>

      {/* Gradient gloss stroke — same Linear 2 ring used on glossy panels */}
      <GradientStrokeBox
        width={311}
        height={218}
        rx={CARD_RADIUS}
        strokeWidth={1}
        gradient={STROKE_LINEAR_2}
      />
    </Pressable>
  )
}

export default function AlertPriorityViewScreen() {
  const router = useRouter()
  const initialAlerts = useMemo(() => getPriorityAlerts(), [])
  const [activeAlerts, setActiveAlerts] = useState<PriorityAlert[]>(initialAlerts)

  const openDetail = (id: string) => {
    impactHaptic()
    router.push({ pathname: '/(main)/alert-priority-detail', params: { id } })
  }

  const dismissOne = (id: string) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== id))
  }

  const dismissAll = () => {
    tapHaptic()
    setActiveAlerts([])
  }

  const triggerResponse = () => {
    impactHaptic()
    const first = activeAlerts[0]
    if (first) openDetail(first.id)
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Red banner + status bar + header sit behind the scrolling flow
            content so they scroll naturally with the page. */}
        <View style={styles.redBanner} />
        <StatusBar />
        <View style={styles.header}>
          <AlertPriorityWarningIcon />
          <Text style={styles.headerTitle}>Alert Priority View</Text>
        </View>

        {/* Spacer pushes the cards container down to its Figma y=123 */}
        <View style={styles.headerSpacer} />

        {/* Cards container — BG2 panel. Sized by its children so the three
            cards (+ pill + padding) define its real height. */}
        <View style={styles.cardsContainer}>
          <View style={styles.alertsHeaderPill}>
            <BurglaryIcon />
            <Text style={styles.alertsHeaderPillText}>
              {activeAlerts.length > 1
                ? 'Multiple Alerts Detected'
                : activeAlerts.length === 1
                  ? '1 Alert Detected'
                  : 'No Active Alerts'}
            </Text>
          </View>

          <View style={styles.cardsStack}>
            {activeAlerts.map((alert, idx) => (
              <PriorityAlertCard
                key={alert.id}
                alert={alert}
                showDismiss={idx < 2}
                onPress={() => openDetail(alert.id)}
                onDismiss={() => dismissOne(alert.id)}
              />
            ))}
          </View>
        </View>

        {/* Bottom action bar — lives AFTER the cards container in normal flow
            on the dark page background (not floating over the cards). */}
        <View style={styles.bottomBar}>
          <Pressable
            style={({ pressed }) => [styles.dismissAllBtn, pressed && styles.pressed]}
            onPress={dismissAll}
          >
            <Text style={styles.dismissAllText}>Dismiss All Alerts</Text>
            <GradientStrokeBox
              width={145}
              height={40}
              rx={1.5}
              strokeWidth={1}
              gradient={STROKE_LINEAR_2}
            />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.triggerBtn, pressed && styles.pressed]}
            onPress={triggerResponse}
          >
            <Text style={styles.triggerText}>Trigger Response</Text>
          </Pressable>
        </View>

        {/* Bottom-nav clearance — keeps the action bar fully visible when
            scrolled to the end. */}
        <View style={styles.bottomNavClearance} />
      </ScrollView>

      <BottomNavBar activeTab="alerts" />
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
  // Scroll host — content flows naturally so the cards push the bottom
  // action bar down. Page can scroll vertically; the dark page background
  // (Colors.darkBackground on container) shows between the BG2 cards panel
  // and the bottom buttons.
  pageScroll: {
    flex: 1,
    width: PAGE_WIDTH,
  },
  pageScrollContent: {
    width: PAGE_WIDTH,
    paddingBottom: 0,
  },
  // Pushes the cards container down so its TOP aligns with Figma y=123
  // (after the red banner + status bar + header).
  headerSpacer: {
    height: 123,
  },
  pressed: {
    opacity: 0.7,
  },

  redBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: PAGE_WIDTH,
    height: RED_BANNER_HEIGHT,
    backgroundColor: Colors.error600,
  },

  header: {
    position: 'absolute',
    top: 73,
    left: 13,
    width: 349,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '500',
    fontFamily: 'Lato_400Regular',
    lineHeight: 24,
  },

  // Frame 495 — BG2 dark panel that wraps the cards. Sized by its children,
  // sits in normal flow so the bottom buttons follow underneath on the dark
  // page background.
  cardsContainer: {
    marginLeft: 16,
    width: 346,
    backgroundColor: Colors.bg1,
    paddingTop: 19,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  cardsStack: {
    gap: CARD_GAP,
    marginTop: CARD_GAP,
  },

  // "Multiple Alerts Detected" pill — 311×49, Error/500 stroke, sharp corners,
  // transparent fill.
  alertsHeaderPill: {
    height: 49,
    borderWidth: 1,
    borderColor: Colors.error500,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  alertsHeaderPillText: {
    color: '#FDA29B',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
    lineHeight: 19.2,
  },

  // Alert card — 311×218, fill #1F1F1F, rx 15, gloss gradient stroke.
  card: {
    width: 311,
    height: 218,
    backgroundColor: Colors.bg1,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  cardImage: {
    width: 311,
    height: 112,
  },
  cardFeedOverlay: {
    position: 'absolute',
    top: 13,
    left: 12,
    right: 12,
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
  cardBody: {
    position: 'absolute',
    top: 128,
    left: 16,
    right: 16,
    height: 74,
  },
  cardActivity: {
    marginTop: 8,
    color: Colors.white,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
    lineHeight: 19.2,
  },
  cardLocationRow: {
    marginTop: 11,
    flexDirection: 'row',
    gap: 4,
  },
  cardLocationLabel: {
    color: Colors.black300,
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
    lineHeight: 16.8,
  },
  cardLocationValue: {
    color: Colors.black200,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Lato_400Regular',
    lineHeight: 16.8,
  },

  levelChip: {
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

  bottomBar: {
    marginTop: 24,
    marginLeft: 17,
    width: 339,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Empty footer so the bottom action bar isn't covered by the floating nav
  // when the user is scrolled to the end of the page. Matched to the
  // ~29px gap used on alert-priority-detail.
  bottomNavClearance: {
    height: 170,
  },
  dismissAllBtn: {
    width: 145,
    height: 40,
    borderRadius: 1.5,
    backgroundColor: 'rgba(31,31,31,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dismissAllText: {
    color: Colors.black50,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Lato_400Regular',
  },
  triggerBtn: {
    width: 184,
    height: 40,
    borderRadius: 2,
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
})
