import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native'
import { useState } from 'react'
import Svg, { Path, Rect, LinearGradient, Stop, Defs } from 'react-native-svg'
import { useRouter } from 'expo-router'
import StatusBar from '../../components/status-bar'
import { tapHaptic, successHaptic } from '../../lib/haptics'
import { getNotifications, markAllNotificationsRead } from '../../lib/api/notifications'
import type { NotificationCard } from '../../lib/data/notifications'

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
  const gradId = `gs_${width}x${height}_${rx}`
  const a = 0.84 * width
  const b = 1.51 * height
  const c = -0.78 * width
  const d = 0.21 * height
  const e = -0.13 * width
  const f = -0.27 * height
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={width} height={height}>
      <Defs>
        <LinearGradient
          id={gradId}
          x1={0}
          y1={0}
          x2={1}
          y2={0}
          gradientUnits="userSpaceOnUse"
          gradientTransform={`matrix(${a} ${b} ${c} ${d} ${e} ${f})`}
        >
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

function WarningTriangleIcon() {
  return (
    <Svg width={20} height={17} viewBox="0 0 20 17" fill="none">
      <Path
        d="M19.276 12.7022L12.4999 1.43258C11.9865 0.477527 10.9598 0 9.83049 0C8.70114 0 7.67446 0.477527 7.16112 1.43258L0.385006 12.7022C-0.128335 13.5618 -0.128335 14.7078 0.385006 15.5674C0.898348 16.4269 1.92503 17 3.05438 17H16.6066C17.736 17 18.66 16.4269 19.276 15.5674C19.892 14.7078 19.7893 13.6573 19.276 12.7022ZM17.5306 14.6123C17.4279 14.7078 17.2226 15.0899 16.6066 15.0899H3.05438C2.54104 15.0899 2.23304 14.8033 2.13037 14.6123C2.0277 14.4213 1.82236 14.1348 2.13037 13.6573L8.90648 2.29213C9.21448 1.8146 9.62516 1.8146 9.83049 1.8146C10.0358 1.8146 10.4465 1.8146 10.7545 2.29213L17.5306 13.6573C17.736 14.1348 17.5306 14.5168 17.5306 14.6123Z"
        fill="#D92D20"
      />
      <Path
        d="M9.82909 5.53912C9.21308 5.53912 8.80241 5.92114 8.80241 6.49417V9.35933C8.80241 9.93237 9.21308 10.3144 9.82909 10.3144C10.4451 10.3144 10.8558 9.93237 10.8558 9.35933V6.49417C10.8558 5.92114 10.4451 5.53912 9.82909 5.53912Z"
        fill="#D92D20"
      />
      <Path
        d="M9.82909 13.1797C10.3961 13.1797 10.8558 12.7521 10.8558 12.2246C10.8558 11.6972 10.3961 11.2696 9.82909 11.2696C9.26207 11.2696 8.80241 11.6972 8.80241 12.2246C8.80241 12.7521 9.26207 13.1797 9.82909 13.1797Z"
        fill="#D92D20"
      />
    </Svg>
  )
}

function PrimusBellIcon() {
  return (
    <Svg width={26} height={24} viewBox="0 0 26 24" fill="none">
      <Path
        d="M16.86 13.55V8.6C16.37 8.7 15.88 8.79 15.4 8.79H14.91V14.5H5.18V7.83C5.18 5.16 7.32 3.06 10.04 3.06C10.14 1.82 10.72 0.77 11.5 -0.09C11.21 -0.47 10.62 -0.76 10.04 -0.76C8.97 -0.76 8.09 0.10 8.09 1.15V1.43C5.18 2.29 3.23 4.86 3.23 7.83V13.55L1.28 15.46V16.41H18.81V15.46L16.86 13.55ZM8.09 17.32C8.09 18.37 8.97 19.23 10.04 19.23C11.11 19.23 11.99 18.37 11.99 17.32H8.09ZM18.81 4.55C18.81 6.36 17.25 7.88 15.4 7.88C13.55 7.88 11.99 6.36 11.99 4.55C11.99 2.74 13.55 1.22 15.4 1.22C17.25 1.22 18.81 2.74 18.81 4.55Z"
        fill="#A3A3A3"
      />
    </Svg>
  )
}

function EmptyDocIcon() {
  return (
    <Svg width={48} height={60} viewBox="0 0 72 84" fill="none">
      <Path
        d="M12 4C12 1.79086 13.7909 0 16 0H48L64 16V80C64 82.2091 62.2091 84 60 84H16C13.7909 84 12 82.2091 12 80V4Z"
        stroke="#A3A3A3"
        strokeWidth={2}
        fill="none"
      />
      <Path
        d="M48 0L64 16H52C49.7909 16 48 14.2091 48 12V0Z"
        stroke="#A3A3A3"
        strokeWidth={2}
        fill="none"
      />
      <Path
        d="M26 46C26 47.1046 26.8954 48 28 48C29.1046 48 30 47.1046 30 46C30 44.8954 29.1046 44 28 44C26.8954 44 26 44.8954 26 46Z"
        fill="#A3A3A3"
      />
      <Path
        d="M42 46C42 47.1046 42.8954 48 44 48C45.1046 48 46 47.1046 46 46C46 44.8954 45.1046 44 44 44C42.8954 44 42 44.8954 42 46Z"
        fill="#A3A3A3"
      />
      <Path
        d="M28 58C30.6667 61.3333 41.3333 61.3333 44 58"
        stroke="#A3A3A3"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  )
}

const NOTIFICATIONS = getNotifications()

export default function NotificationsScreen() {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)

  const visibleGroups = dismissed ? [] : NOTIFICATIONS

  const renderCard = (notification: NotificationCard) => (
    <View key={notification.id} style={styles.card}>
      <View style={styles.iconBox}>
        {notification.iconType === 'alert' ? <WarningTriangleIcon /> : <PrimusBellIcon />}
      </View>
      <View style={styles.cardTextContent}>
        <Text style={styles.cardTimestamp}>{notification.timestamp}</Text>
        <Text style={styles.cardTitle}>{notification.title}</Text>
        <Text style={styles.cardSubtitle}>{notification.subtitle}</Text>
        {notification.hasFootageLink && (
          <Pressable
            onPress={() => {
              tapHaptic()
              router.push({
                pathname: '/(main)/incident-detail',
                params: notification.incidentId ? { id: notification.incidentId } : {},
              })
            }}
          >
            <Text style={styles.footageLink}>View Alert Footage</Text>
          </Pressable>
        )}
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <StatusBar />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            onPress={() => {
              tapHaptic()
              if (router.canGoBack()) router.back()
              else router.replace('/(main)/cameras')
            }}
          >
            <GradientStrokeBox width={40} height={40} rx={2} />
            <BackArrowIcon />
          </Pressable>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <Pressable
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          onPress={() => {
            successHaptic()
            markAllNotificationsRead()
            setDismissed(true)
          }}
        >
          <Text style={styles.markAllText}>Mark all as Read</Text>
        </Pressable>
      </View>

      <View style={styles.headerDivider} />

      {visibleGroups.length === 0 ? (
        <View style={styles.emptyState}>
          <EmptyDocIcon />
          <Text style={styles.emptyTitle}>No Notifications yet</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.notificationList}
          contentContainerStyle={styles.notificationListContent}
          showsVerticalScrollIndicator={false}
        >
          {visibleGroups.map((group, gi) => (
            <View key={group.label}>
              {gi > 0 && <View style={styles.sectionDivider} />}
              <Text style={styles.sectionLabel}>{group.label}</Text>
              <View style={styles.cardsSection}>{group.items.map(renderCard)}</View>
            </View>
          ))}
        </ScrollView>
      )}

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

  header: {
    position: 'absolute',
    top: 71,
    left: 16,
    width: 343,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
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
    color: '#F9FAFB',
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'Lato_400Regular',
  },
  markAllText: {
    color: '#A3A3A3',
    fontSize: 14,
    lineHeight: 16.8,
    textDecorationLine: 'underline',
    fontFamily: 'Lato_400Regular',
  },

  headerDivider: {
    position: 'absolute',
    top: 127,
    left: 16,
    width: 343,
    height: 1,
    backgroundColor: '#3D3D3D',
  },

  notificationList: {
    position: 'absolute',
    top: 143,
    left: 16,
    width: 343,
    bottom: 34,
  },
  notificationListContent: {
    paddingTop: 0,
    paddingBottom: 40,
  },

  sectionLabel: {
    color: '#E4E7EC',
    fontSize: 14,
    lineHeight: 16.8,
    marginBottom: 20,
    fontFamily: 'Lato_400Regular',
  },

  cardsSection: {
    gap: 24,
  },

  card: {
    width: 343,
    height: 120,
    borderWidth: 1,
    borderColor: '#242424',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  iconBox: {
    width: 43,
    height: 40,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardTextContent: {
    flex: 1,
    gap: 8,
  },
  cardTimestamp: {
    color: '#575757',
    fontSize: 12,
    lineHeight: 14.4,
    fontFamily: 'Lato_400Regular',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 19.2,
    fontFamily: 'Lato_400Regular',
  },
  cardSubtitle: {
    color: '#A3A3A3',
    fontSize: 12,
    lineHeight: 14.4,
    fontFamily: 'Lato_400Regular',
  },
  footageLink: {
    color: '#A3A3A3',
    fontSize: 14,
    lineHeight: 16.8,
    textDecorationLine: 'underline',
    textDecorationColor: '#A3A3A3',
    fontFamily: 'Lato_400Regular',
  },

  sectionDivider: {
    height: 1,
    backgroundColor: '#242424',
    marginVertical: 26,
  },

  emptyState: {
    position: 'absolute',
    top: 143,
    left: 16,
    width: 343,
    bottom: 34,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: '#BFBFBF',
    fontSize: 16,
    lineHeight: 19,
    textAlign: 'center',
    fontFamily: 'Lato_400Regular',
  },
  emptySubtitle: {
    color: '#707070',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Lato_400Regular',
  },

  homeIndicator: {
    position: 'absolute',
    top: 778,
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
