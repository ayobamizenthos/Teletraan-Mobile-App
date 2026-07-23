import { View, StyleSheet, Pressable, TextInput, Text, Platform, Alert } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'
import AsyncStorage from '@react-native-async-storage/async-storage'
import GlowBackground from '../../components/glow-background'
import { GradientStrokeBox } from '../../components/gradient-stroke-box'
import { tapHaptic, impactHaptic, warningHaptic } from '../../lib/haptics'
import { signIn } from '../../lib/api/auth'
import { DEV_CONNECTED } from '../../lib/dev-credentials'
import {
  enableBiometric,
  isBiometricAvailable,
  isBiometricEnabled,
  supportedBiometricLabel,
  unlockWithBiometric,
  type Deployment,
} from '../../lib/biometric'

// Reverse of onboarding's forward animation. Top glow slides DOWN-LEFT to the welcome
// position, top fades out, welcome fades in. Then navigate back.
const GLOW_REVERSE_X = -206.5
const GLOW_REVERSE_Y = 418
const GLOW_ANIM_MS = 420

//       "Enter Email" placeholder (Lato 14 #8A8A8A): (45, 283)
//       "Enter Password" placeholder:                (45.2, 372)

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

function PersonIcon() {
  return (
    <Svg width={12} height={16} viewBox="0 0.5 12 16" fill="none">
      <Path
        d="M8.75037 4.19231C8.75037 4.90635 8.4606 5.59115 7.9448 6.09605C7.42901 6.60096 6.72944 6.88461 6 6.88461C5.27056 6.88461 4.57099 6.60096 4.0552 6.09605C3.5394 5.59115 3.24963 4.90635 3.24963 4.19231C3.24963 3.47826 3.5394 2.79346 4.0552 2.28856C4.57099 1.78365 5.27056 1.5 6 1.5C6.72944 1.5 7.42901 1.78365 7.9448 2.28856C8.4606 2.79346 8.75037 3.47826 8.75037 4.19231ZM0.5 14.3283C0.523569 12.9156 1.1134 11.5686 2.14228 10.5778C3.17117 9.58692 4.55667 9.03161 6 9.03161C7.44333 9.03161 8.82883 9.58692 9.85772 10.5778C10.8866 11.5686 11.4764 12.9156 11.5 14.3283C9.77452 15.1028 7.89823 15.5025 6 15.5C4.03734 15.5 2.17442 15.0807 0.5 14.3283Z"
        stroke="#A3A3A3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function LockIcon() {
  return (
    <Svg width={12} height={14} viewBox="0 0 12 14" fill="none">
      <Path
        d="M9.8 14H1.4C1.0287 14 0.672601 13.8525 0.410051 13.5899C0.1475 13.3274 0 12.9713 0 12.6V7.46667C0 7.09536 0.1475 6.73927 0.410051 6.47672C0.672601 6.21417 1.0287 6.06667 1.4 6.06667H9.8C10.1713 6.06667 10.5274 6.21417 10.7899 6.47672C11.0525 6.73927 11.2 7.09536 11.2 7.46667V12.6C11.2 12.9713 11.0525 13.3274 10.7899 13.5899C10.5274 13.8525 10.1713 14 9.8 14ZM1.4 7C1.27623 7 1.15753 7.04917 1.07002 7.13668C0.9825 7.2242 0.933333 7.3429 0.933333 7.46667V12.6C0.933333 12.7238 0.9825 12.8425 1.07002 12.93C1.15753 13.0175 1.27623 13.0667 1.4 13.0667H9.8C9.92377 13.0667 10.0425 13.0175 10.13 12.93C10.2175 12.8425 10.2667 12.7238 10.2667 12.6V7.46667C10.2667 7.3429 10.2175 7.2242 10.13 7.13668C10.0425 7.04917 9.92377 7 9.8 7H1.4Z"
        fill="#A3A3A3"
      />
      <Path
        d="M9.33177 7H1.8651C1.74134 7 1.62264 6.95083 1.53512 6.86332C1.4476 6.7758 1.39844 6.6571 1.39844 6.53333V3.73333C1.39844 2.74319 1.79177 1.7936 2.49191 1.09347C3.19204 0.393332 4.14163 0 5.13177 0H6.0651C7.05525 0 8.00483 0.393332 8.70497 1.09347C9.4051 1.7936 9.79844 2.74319 9.79844 3.73333V6.53333C9.79844 6.6571 9.74927 6.7758 9.66175 6.86332C9.57424 6.95083 9.45554 7 9.33177 7ZM2.33177 6.06667H8.8651V3.73333C8.8651 2.99073 8.57011 2.27854 8.045 1.75343C7.5199 1.22833 6.80771 0.933333 6.0651 0.933333H5.13177C4.38916 0.933333 3.67697 1.22833 3.15187 1.75343C2.62677 2.27854 2.33177 2.99073 2.33177 3.73333V6.06667Z"
        fill="#A3A3A3"
      />
      <Path
        d="M5.6013 10.2667C5.41671 10.2667 5.23626 10.2119 5.08277 10.1094C4.92928 10.0068 4.80966 9.86104 4.73901 9.6905C4.66837 9.51995 4.64989 9.33229 4.6859 9.15124C4.72192 8.97019 4.81081 8.80389 4.94134 8.67336C5.07187 8.54283 5.23817 8.45394 5.41922 8.41793C5.60027 8.38192 5.78793 8.4004 5.95847 8.47104C6.12902 8.54168 6.27478 8.66131 6.37734 8.8148C6.4799 8.96828 6.53464 9.14873 6.53464 9.33333C6.53464 9.58086 6.4363 9.81826 6.26127 9.99329C6.08623 10.1683 5.84884 10.2667 5.6013 10.2667Z"
        fill="#A3A3A3"
      />
      <Path d="M6.06615 9.8H5.13281V11.6667H6.06615V9.8Z" fill="#A3A3A3" />
    </Svg>
  )
}

function EyeOffIcon() {
  return (
    <Svg width={16} height={14} viewBox="8 9 16 14" fill="none">
      <Path
        d="M9.62615 13.0623C8.88258 13.9211 8.3289 14.9214 8 16C9.02687 19.374 12.2204 21.8333 16.0004 21.8333C16.7896 21.8333 17.5526 21.726 18.2759 21.5261M11.4128 11.5107C12.774 10.6317 14.3695 10.1642 16.0004 10.1667C19.7804 10.1667 22.9731 12.626 24 15.9984C23.4373 17.8413 22.2292 19.4312 20.5879 20.4893M11.4128 11.5107L8.84725 9M11.4128 11.5107L14.3138 14.3496M20.5879 20.4893L23.1535 23M20.5879 20.4893L17.6869 17.6504C17.9084 17.4338 18.084 17.1765 18.2039 16.8934C18.3237 16.6103 18.3854 16.3068 18.3854 16.0004C18.3854 15.6939 18.3237 15.3905 18.2039 15.1074C18.084 14.8243 17.9084 14.567 17.6869 14.3503C17.4655 14.1336 17.2026 13.9618 16.9133 13.8445C16.624 13.7272 16.3139 13.6669 16.0008 13.6669C15.6876 13.6669 15.3776 13.7272 15.0883 13.8445C14.7989 13.9618 14.5361 14.1336 14.3146 14.3503M17.6862 17.6497L14.3154 14.3511"
        stroke="#A3A3A3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function EyeOnIcon() {
  return (
    <Svg width={16} height={14} viewBox="8 9 16 14" fill="none">
      <Path
        d="M8 16C9.02687 19.374 12.2204 21.8333 16.0004 21.8333C19.7804 21.8333 22.9731 19.374 24 16C22.9731 12.626 19.7804 10.1667 16.0004 10.1667C12.2204 10.1667 9.02687 12.626 8 16Z"
        stroke="#A3A3A3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.3854 16C18.3854 16.6324 18.1342 17.239 17.6873 17.6862C17.2404 18.1334 16.6342 18.3849 16.0022 18.3849C15.3702 18.3849 14.764 18.1334 14.3171 17.6862C13.8703 17.239 13.619 16.6324 13.619 16C13.619 15.3676 13.8703 14.761 14.3171 14.3138C14.764 13.8666 15.3702 13.6151 16.0022 13.6151C16.6342 13.6151 17.2404 13.8666 17.6873 14.3138C18.1342 14.761 18.3854 15.3676 18.3854 16Z"
        stroke="#A3A3A3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function FingerprintIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C7 3 4 7 4 12v3M20 15v-3c0-2.5-.9-4.7-2.4-6.3M9 21c-1.4-1.6-2-4-2-6v-3a5 5 0 0 1 5-5 5 5 0 0 1 5 5v1M12 12v3c0 2 .3 4 1 6M16 15v1c0 2 .5 3.5 1 4"
        stroke="#E4E7EC"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx={12} cy={12} r={1.4} fill="#E4E7EC" />
    </Svg>
  )
}

type ErrorState = 'none' | 'empty' | 'noEmail' | 'noPassword' | 'email' | 'password'

export default function SignInScreen() {
  const router = useRouter()
  // Prefilled with the connected demo account so reviewers can sign in directly.
  const [email, setEmail] = useState(DEV_CONNECTED.email)
  const [password, setPassword] = useState(DEV_CONNECTED.password)
  const [showPassword, setShowPassword] = useState(false)
  const [errorState, setErrorState] = useState<ErrorState>('none')
  const [biometricLabel, setBiometricLabel] = useState<string | null>(null)

  // Glow animation — top visible initially, welcome invisible. Reverse slides on back.
  const slideX = useSharedValue(0)
  const slideY = useSharedValue(0)
  const topAlpha = useSharedValue(1)
  const welcomeAlpha = useSharedValue(0)

  const topGlowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }, { translateY: slideY.value }],
    opacity: topAlpha.value,
  }))
  const welcomeGlowStyle = useAnimatedStyle(() => ({ opacity: welcomeAlpha.value }))

  const goBack = () => {
    if (router.canGoBack()) router.back()
    else router.replace('/(auth)/onboarding')
  }

  const handleBack = () => {
    tapHaptic()
    slideX.value = withTiming(GLOW_REVERSE_X, { duration: GLOW_ANIM_MS })
    slideY.value = withTiming(GLOW_REVERSE_Y, { duration: GLOW_ANIM_MS })
    topAlpha.value = withTiming(0, { duration: GLOW_ANIM_MS })
    welcomeAlpha.value = withTiming(1, { duration: GLOW_ANIM_MS }, () => {
      runOnJS(goBack)()
    })
  }

  const routeAfterAuth = (deployment: Deployment) => {
    if (deployment === 'unconnected') {
      router.push('/(auth)/not-connected')
      return
    }
    AsyncStorage.removeItem('teletraan_setup_completed').catch(() => {})
    AsyncStorage.removeItem('teletraan_view_mode_coachmark_seen').catch(() => {})
    router.push('/(auth)/loading')
  }

  const promptBiometric = async () => {
    const session = await unlockWithBiometric()
    if (!session) return
    impactHaptic()
    routeAfterAuth(session.deployment)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const available = await isBiometricAvailable()
      if (cancelled || !available) return
      const label = await supportedBiometricLabel()
      if (cancelled) return
      setBiometricLabel(label)
      const enabled = await isBiometricEnabled()
      if (cancelled || !enabled) return
      const session = await unlockWithBiometric()
      if (cancelled || !session) return
      impactHaptic()
      routeAfterAuth(session.deployment)
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const offerBiometricEnrolment = async (session: { email: string; deployment: Deployment }) => {
    if (Platform.OS === 'web') return
    const available = await isBiometricAvailable()
    if (!available) return
    if (await isBiometricEnabled()) return
    const label = await supportedBiometricLabel()
    Alert.alert(
      `Enable ${label}?`,
      `Sign in faster next time with ${label}.`,
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Enable',
          onPress: () => {
            enableBiometric(session).catch(() => {})
          },
        },
      ],
      { cancelable: true }
    )
  }

  const handleSignIn = () => {
    const result = signIn(email, password)

    switch (result.status) {
      case 'empty':
        warningHaptic()
        setErrorState('empty')
        return
      case 'no-email':
        warningHaptic()
        setErrorState('noEmail')
        return
      case 'no-password':
        warningHaptic()
        setErrorState('noPassword')
        return
      case 'unknown-email':
        warningHaptic()
        setErrorState('email')
        return
      case 'wrong-password':
        warningHaptic()
        setErrorState('password')
        return
    }

    impactHaptic()
    setErrorState('none')
    offerBiometricEnrolment({ email: email.trim().toLowerCase(), deployment: result.deployment })
    routeAfterAuth(result.deployment)
  }

  return (
    <View style={styles.container}>
      {/* Top glow — slides DOWN-LEFT and fades on back; mirror of onboarding forward animation */}
      <Animated.View style={[StyleSheet.absoluteFill, topGlowStyle, styles.glowLayer]}>
        <GlowBackground variant="top" />
      </Animated.View>
      {/* Welcome glow — fades IN as the top slides away, so onboarding appears seamlessly */}
      <Animated.View style={[StyleSheet.absoluteFill, welcomeGlowStyle, styles.glowLayer]}>
        <GlowBackground variant="welcome" />
      </Animated.View>

      <Pressable
        style={styles.backButton}
        onPress={handleBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <GradientStrokeBox width={40} height={40} rx={2} />
        <View style={styles.backIconWrap}>
          <BackArrowIcon />
        </View>
      </Pressable>

      <Image
        source={require('../../assets/images/teletraan-logo.png')}
        style={styles.logo}
        contentFit="contain"
      />

      <Text style={styles.signInTitle}>Sign in</Text>

      {/* Email label */}
      <Text style={styles.emailLabel}>Email</Text>
      <View style={styles.emailInputBox}>
        <View style={styles.inputIconSlot}>
          <PersonIcon />
        </View>
        <TextInput
          style={styles.textInput}
          value={email}
          onChangeText={text => {
            setEmail(text)
            if (errorState !== 'none') setErrorState('none')
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Enter Email"
          placeholderTextColor="#8A8A8A"
          selectionColor="#A3A3A3"
        />
      </View>

      {/* Password label */}
      <Text style={styles.passwordLabel}>Password</Text>
      <View style={styles.passwordInputBox}>
        <View style={styles.inputIconSlot}>
          <LockIcon />
        </View>
        <TextInput
          style={styles.textInput}
          value={password}
          onChangeText={text => {
            setPassword(text)
            if (errorState !== 'none') setErrorState('none')
          }}
          secureTextEntry={!showPassword}
          placeholder="Enter Password"
          placeholderTextColor="#8A8A8A"
          selectionColor="#A3A3A3"
        />
        <Pressable
          style={styles.eyeToggle}
          onPress={() => {
            tapHaptic()
            setShowPassword(!showPassword)
          }}
        >
          {showPassword ? <EyeOnIcon /> : <EyeOffIcon />}
        </Pressable>
      </View>

      {errorState === 'empty' && (
        <Text style={styles.errorText}>Input your email and password</Text>
      )}
      {errorState === 'noEmail' && <Text style={styles.errorText}>Enter email</Text>}
      {errorState === 'noPassword' && <Text style={styles.errorText}>Enter password</Text>}
      {errorState === 'email' && (
        <Text style={styles.errorText}>
          This email isn&apos;t linked to a Teletraan deployment yet
        </Text>
      )}
      {errorState === 'password' && <Text style={styles.errorText}>Wrong password</Text>}

      <Pressable
        style={({ pressed }) => [styles.signInButton, pressed && { opacity: 0.85 }]}
        onPress={handleSignIn}
      >
        <Text style={styles.signInButtonText}>Sign in</Text>
      </Pressable>

      {biometricLabel && (
        <Pressable
          style={({ pressed }) => [styles.biometricButton, pressed && { opacity: 0.7 }]}
          onPress={() => {
            tapHaptic()
            promptBiometric()
          }}
          accessibilityRole="button"
          accessibilityLabel={`Sign in with ${biometricLabel}`}
        >
          <FingerprintIcon />
          <Text style={styles.biometricLabelText}>Use {biometricLabel}</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 375,
    height: 812,
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: '#121212',
  },
  // Glow layers sit behind content and shouldn't capture touches
  glowLayer: {
    pointerEvents: 'none',
  },

  backButton: {
    position: 'absolute',
    top: 71,
    left: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  backIconWrap: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    position: 'absolute',
    left: 161.54,
    top: 122,
    width: 51.93,
    height: 60.21,
  },

  // 71-wide CENTER-aligned text box. The 71-wide text centers at x=187.5 (screen center).
  signInTitle: {
    position: 'absolute',
    left: 16,
    top: 193.79,
    width: 343,
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 28.8,
    textAlign: 'center',
    fontFamily: 'Lato_400Regular',
  },

  // Email label at (16, 247)
  emailLabel: {
    position: 'absolute',
    left: 16,
    top: 247,
    width: 343,
    color: '#E4E7EC',
    fontSize: 14,
    lineHeight: 16.8,
    fontFamily: 'Lato_400Regular',
  },
  emailInputBox: {
    position: 'absolute',
    left: 16,
    top: 272,
    width: 343,
    height: 40,
    backgroundColor: '#1F1F1F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  // Password label at (16, 336)
  passwordLabel: {
    position: 'absolute',
    left: 16,
    top: 336,
    width: 343,
    color: '#E4E7EC',
    fontSize: 14,
    lineHeight: 16.8,
    fontFamily: 'Lato_400Regular',
  },
  passwordInputBox: {
    position: 'absolute',
    left: 16,
    top: 361,
    width: 343,
    height: 40,
    backgroundColor: '#1F1F1F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  // Icon slot inside input — 17px wide (icon 11-11.2 + 6px gap to text)
  inputIconSlot: {
    width: 17,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  // Input text — Lato 14, color white (user-typed) / placeholderTextColor handles "Enter X" gray
  textInput: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 16.8,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    fontFamily: 'Lato_400Regular',
    ...Platform.select({
      web: {
        outlineWidth: 0,
        outlineStyle: 'none',
        borderWidth: 0,
        borderColor: 'transparent',
      } as any,
    }),
  },

  eyeToggle: {
    position: 'absolute',
    right: 12,
    top: 8,
    width: 24,
    height: 24,
    backgroundColor: '#2E2E2E',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorText: {
    position: 'absolute',
    left: 16,
    top: 406,
    width: 343,
    color: '#F04438',
    fontSize: 14,
    lineHeight: 16.8,
    fontFamily: 'Lato_400Regular',
  },

  // #242424 line only on right+bottom; top-left is the soft #707070 emboss.
  signInButton: {
    position: 'absolute',
    left: 99.5,
    top: 465,
    width: 176,
    height: 40,
    backgroundColor: '#A3A3A3',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: '#242424',
    borderBottomColor: '#242424',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    ...Platform.select({
      web: {
        boxShadow: 'inset 4px 4px 4px 0 rgba(112,112,112,1), 0 0 5px 0 rgba(163,163,163,0.5)',
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
  biometricButton: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 525,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 100,
  },
  biometricLabelText: {
    color: '#E4E7EC',
    fontSize: 14,
    lineHeight: 16.8,
    fontFamily: 'Lato_400Regular',
  },
  signInButtonText: {
    color: '#262626',
    fontSize: 14,
    lineHeight: 16.8,
    fontFamily: 'Lato_400Regular',
  },
})
