import { View, Text, StyleSheet, Pressable, Alert, ScrollView, Linking } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useState, useEffect } from 'react'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import BottomNavBar from '../../components/bottom-nav-bar'
import StatusBar from '../../components/status-bar'
import { GradientStrokeBox } from '../../components/gradient-stroke-box'
import { tapHaptic, impactHaptic } from '../../lib/haptics'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'

const AVATAR_STORAGE_KEY = 'teletraan_profile_avatar'

function NotificationBellIcon() {
  return (
    <Svg width={16} height={15} viewBox="0 0 16 15" fill="none">
      <Path
        d="M15.4034 6.63389V11.2643C15.4034 12.1178 15.0643 12.9364 14.4607 13.54C13.8571 14.1436 13.0384 14.4826 12.1848 14.4826H3.73587C2.88224 14.4826 2.06357 14.1436 1.45996 13.54C0.856346 12.9364 0.517241 12.1178 0.517241 11.2643V4.023C0.517241 3.16944 0.856346 2.35084 1.45996 1.74729C2.06357 1.14373 2.88224 0.804654 3.73587 0.804654H9.48998"
        stroke="#E6E6E6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M0.517241 4.0955L6.35101 7.41845C6.83866 7.70573 7.39434 7.85723 7.96033 7.85723C8.52632 7.85723 9.08199 7.70573 9.56964 7.41845L11.3552 6.40708"
        stroke="#E6E6E6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.593 4.02294C14.704 4.02294 15.6046 3.12237 15.6046 2.01147C15.6046 0.900565 14.704 0 13.593 0C12.482 0 11.5814 0.900565 11.5814 2.01147C11.5814 3.12237 12.482 4.02294 13.593 4.02294Z"
        fill="#D92D20"
      />
    </Svg>
  )
}

function ChevronRightIcon() {
  return (
    <Svg width={5} height={10} viewBox="0 0 5 10" fill="none">
      <Path
        d="M0 0.81727L0.743627 0L4.79398 4.45412C4.85927 4.5255 4.91108 4.61037 4.94644 4.70385C4.9818 4.79734 5 4.89759 5 4.99884C5 5.1001 4.9818 5.20035 4.94644 5.29384C4.91108 5.38732 4.85927 5.47219 4.79398 5.54356L0.743627 10L0.000700951 9.18273L3.80224 5L0 0.81727Z"
        fill="#E6E6E6"
      />
    </Svg>
  )
}

function ArrowUpRightIcon() {
  return (
    <Svg width={12} height={11} viewBox="0 0 12 11" fill="none">
      <Path
        d="M0.510191 10.3863L11.4885 1.17435M11.4885 1.17435L10.8261 8.74571M11.4885 1.17435L3.91719 0.511946"
        stroke="#E6E6E6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function LogoutIcon() {
  return (
    <Svg width={14} height={15} viewBox="0 0 14 15" fill="none">
      <Path
        d="M5.22727 5.16667V2.25C5.22727 1.78587 5.41404 1.34075 5.74649 1.01256C6.07894 0.684374 6.52984 0.5 7 0.5H11.7273C12.1974 0.5 12.6483 0.684374 12.9808 1.01256C13.3132 1.34075 13.5 1.78587 13.5 2.25V12.75C13.5 13.2141 13.3132 13.6592 12.9808 13.9874C12.6483 14.3156 12.1974 14.5 11.7273 14.5H7C6.52984 14.5 6.07894 14.3156 5.74649 13.9874C5.41404 13.6592 5.22727 13.2141 5.22727 12.75V9.83333M2.86364 9.83333L0.5 7.5M0.5 7.5L2.86364 5.16667M0.5 7.5H10.5455"
        stroke="#D92D20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function AvatarUserIcon() {
  return (
    <Svg width={25} height={31} viewBox="0 0 25 31" fill="none">
      <Path
        d="M12.4012 16.5342C10.7663 16.5342 9.16799 16.0493 7.80856 15.1409C6.44913 14.2325 5.38959 12.9414 4.76391 11.4308C4.13824 9.92015 3.97453 8.25792 4.2935 6.65426C4.61246 5.0506 5.39978 3.57755 6.55588 2.42138C7.71198 1.2652 9.18494 0.477841 10.7885 0.158853C12.3921 -0.160134 14.0542 0.00358197 15.5647 0.629298C17.0752 1.25501 18.3663 2.31463 19.2746 3.67414C20.183 5.03366 20.6678 6.63201 20.6678 8.26709C20.6678 10.4597 19.7968 12.5624 18.2466 14.1128C16.6963 15.6632 14.5937 16.5342 12.4012 16.5342ZM12.4012 2.06677C11.175 2.06677 9.9763 2.43042 8.95673 3.11172C7.93716 3.79302 7.1425 4.76137 6.67324 5.89433C6.20398 7.02729 6.0812 8.27397 6.32043 9.47671C6.55965 10.6795 7.15014 11.7842 8.01721 12.6514C8.88429 13.5185 9.98901 14.109 11.1917 14.3483C12.3943 14.5875 13.6409 14.4647 14.7738 13.9954C15.9067 13.5261 16.875 12.7314 17.5563 11.7118C18.2375 10.6922 18.6011 9.4934 18.6011 8.26709C18.6011 6.62266 17.9479 5.04559 16.7852 3.88281C15.6225 2.72002 14.0455 2.06677 12.4012 2.06677Z"
        fill="#F9FAFB"
      />
      <Path
        d="M19.6331 30.9999H5.1666C3.79634 30.9999 2.48219 30.4555 1.51326 29.4865C0.544337 28.5175 0 27.2033 0 25.8329V21.6994C3.12762e-05 21.52 0.0467303 21.3438 0.135505 21.188C0.224281 21.0322 0.352076 20.9021 0.506327 20.8107L5.67293 17.7105C5.90604 17.6052 6.16994 17.59 6.41357 17.668C6.65719 17.746 6.86323 17.9116 6.9918 18.1328C7.12038 18.354 7.16235 18.615 7.1096 18.8653C7.05686 19.1156 6.91314 19.3375 6.70625 19.4879L2.06664 22.2884V25.8329C2.06664 26.6551 2.39324 27.4437 2.9746 28.0251C3.55596 28.6065 4.34444 28.9331 5.1666 28.9331H19.6331C20.4553 28.9331 21.2437 28.6065 21.8251 28.0251C22.4065 27.4437 22.7331 26.6551 22.7331 25.8329V22.2884L18.0728 19.4879C17.941 19.4284 17.8232 19.3418 17.727 19.2339C17.6308 19.126 17.5583 18.9991 17.5142 18.8614C17.4701 18.7236 17.4554 18.5782 17.4711 18.4345C17.4867 18.2907 17.5324 18.1519 17.605 18.0269C17.6777 17.9019 17.7758 17.7935 17.893 17.7088C18.0101 17.6241 18.1438 17.5649 18.2853 17.5351C18.4267 17.5053 18.5729 17.5055 18.7143 17.5357C18.8557 17.5659 18.9892 17.6255 19.1061 17.7105L24.2727 20.8107C24.4308 20.8995 24.5627 21.0284 24.6552 21.1844C24.7477 21.3404 24.7976 21.518 24.7997 21.6994V25.8329C24.7997 27.2033 24.2554 28.5175 23.2864 29.4865C22.3175 30.4555 21.0034 30.9999 19.6331 30.9999Z"
        fill="#F9FAFB"
      />
    </Svg>
  )
}

export default function ProfileScreen() {
  const router = useRouter()
  const [avatarUri, setAvatarUri] = useState<string | null>(null)
  const [personalInfoOpen, setPersonalInfoOpen] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(AVATAR_STORAGE_KEY).then(stored => {
      if (stored) setAvatarUri(stored)
    })
  }, [])

  const ACCORDION_HEIGHT = 123
  const accordionHeight = useSharedValue(0)
  const chevronRotation = useSharedValue(0)

  const togglePersonalInfo = () => {
    tapHaptic()
    const opening = !personalInfoOpen
    setPersonalInfoOpen(opening)
    const config = { mass: 1, stiffness: 100, damping: 15 }
    accordionHeight.value = withSpring(opening ? ACCORDION_HEIGHT : 0, config)
    chevronRotation.value = withSpring(opening ? 1 : 0, config)
  }

  const animatedAccordionStyle = useAnimatedStyle(() => ({
    height: accordionHeight.value,
    // Smooth proportional fade — content fades WITH the collapse instead of
    // snapping out near the end (the old `> 10 ? 1 : 0` jump).
    opacity: accordionHeight.value / ACCORDION_HEIGHT,
    overflow: 'hidden' as const,
  }))

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value * 90}deg` }],
  }))

  const pickAvatar = async () => {
    tapHaptic()
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Camera roll access is needed to set a profile photo.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri
      setAvatarUri(uri)
      await AsyncStorage.setItem(AVATAR_STORAGE_KEY, uri)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar />
      <Svg
        width={375}
        height={217}
        viewBox="0 0 375 217"
        style={styles.topBanner}
        pointerEvents="none"
      >
        <Path d="M0 0H375V196.5L360.5 217H13.5L0 196.5V0Z" fill="#2E2E2E" />
      </Svg>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable
          style={({ pressed }) => [styles.headerIconBtn, pressed && { opacity: 0.7 }]}
          onPress={() => {
            tapHaptic()
            router.push('/(main)/notifications')
          }}
        >
          <NotificationBellIcon />
          <GradientStrokeBox width={40} height={36} rx={2.34} strokeWidth={0.48} />
        </Pressable>
      </View>

      <View style={styles.divider} />

      <ScrollView
        style={styles.bodyScroll}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Pressable style={styles.avatarContainer} onPress={pickAvatar}>
          <View style={styles.avatarBox}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <AvatarUserIcon />
            )}
            <GradientStrokeBox width={100} height={87} rx={0} strokeWidth={0.33} />
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.addPhotoBtn, pressed && { opacity: 0.7 }]}
          onPress={pickAvatar}
        >
          <Text style={styles.addPhotoText}>{avatarUri ? 'Change' : 'Add Photo'}</Text>
          <GradientStrokeBox width={98} height={25} rx={2} strokeWidth={0.8} />
        </Pressable>

        <View style={styles.menuCardOuter}>
          <View>
            <Pressable style={styles.menuRow} onPress={togglePersonalInfo}>
              <Text style={styles.menuRowLabel}>Personal Information</Text>
              <Animated.View style={animatedChevronStyle}>
                <ChevronRightIcon />
              </Animated.View>
            </Pressable>
            <Animated.View style={animatedAccordionStyle}>
              <View style={styles.accordionFields}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoValue}>Kelvin Dogba</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>mtn123@mail.com</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Role</Text>
                  <Text style={styles.infoValue}>Admin</Text>
                </View>
              </View>
            </Animated.View>
          </View>

          <View style={styles.menuDivider} />

          <Pressable
            style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
            onPress={() => {
              tapHaptic()
              Linking.openURL('https://avzdax.com/contact')
            }}
          >
            <Text style={styles.menuRowLabel}>Help / Contact Support</Text>
            <ArrowUpRightIcon />
          </Pressable>

          <View style={styles.menuDivider} />

          <Pressable
            style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
            onPress={() => {
              tapHaptic()
              Linking.openURL('https://teletraan.avzdax.com')
            }}
          >
            <Text style={styles.menuRowLabel}>Open Web Dashboard</Text>
            <ArrowUpRightIcon />
          </Pressable>
        </View>

        <View style={styles.logOutBtn}>
          <Pressable
            style={({ pressed }) => [styles.logOutBtnInner, pressed && styles.menuRowPressed]}
            onPress={() => {
              impactHaptic()
              router.replace('/(auth)/sign-in')
            }}
          >
            <LogoutIcon />
            <Text style={styles.logOutText}>Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomNavBar activeTab="profile" />
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

  topBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
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
    borderRadius: 2.34,
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

  bodyScroll: {
    position: 'absolute',
    top: 130,
    left: 0,
    width: 375,
    bottom: 0,
  },
  bodyContent: {
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 140,
  },

  avatarContainer: {
    alignSelf: 'center',
  },
  avatarBox: {
    width: 100,
    height: 87,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 87,
  },

  addPhotoBtn: {
    marginTop: 10,
    width: 98,
    height: 25,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    color: '#F9FAFB',
    fontSize: 14,
    lineHeight: 16.8,
    fontFamily: 'Lato_400Regular',
  },

  menuCardOuter: {
    marginTop: 24,
    marginHorizontal: 16,
    width: 343,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#1F1F1F',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 17,
    paddingBottom: 17,
    gap: 24,
  },

  menuRow: {
    alignSelf: 'stretch',
    height: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuRowLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 16.8,
    fontFamily: 'Lato_400Regular',
  },
  menuDivider: {
    alignSelf: 'stretch',
    height: 1,
    backgroundColor: '#3D3D3D',
  },

  accordionFields: {
    gap: 24,
    marginTop: 24,
  },
  infoRow: {
    alignSelf: 'stretch',
    height: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: '#A3A3A3',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 16.8,
    flexShrink: 0,
    fontFamily: 'Lato_400Regular',
  },
  infoValue: {
    color: '#F2F4F7',
    fontSize: 14,
    lineHeight: 16.8,
    flex: 1,
    textAlign: 'right',
    fontFamily: 'Lato_400Regular',
  },

  logOutBtn: {
    marginTop: 40,
    width: 119,
    height: 40,
  },
  logOutBtnInner: {
    width: 119,
    height: 40,
    borderWidth: 1,
    borderColor: '#D92D20',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logOutText: {
    color: '#D92D20',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 16.8,
    fontFamily: 'Lato_400Regular',
  },
  menuRowPressed: {
    opacity: 0.6,
  },
})
