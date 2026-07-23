import { Platform } from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import * as SecureStore from 'expo-secure-store'

const SESSION_KEY = 'teletraan.session'
const BIOMETRIC_FLAG = 'teletraan.biometric.enabled'

export type Deployment = 'connected' | 'unconnected'

export interface StoredSession {
  email: string
  deployment: Deployment
}

export async function isBiometricAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false
  const [hasHardware, isEnrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ])
  return hasHardware && isEnrolled
}

export async function isBiometricEnabled(): Promise<boolean> {
  if (Platform.OS === 'web') return false
  const flag = await SecureStore.getItemAsync(BIOMETRIC_FLAG)
  return flag === 'true'
}

export async function enableBiometric(session: StoredSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session))
  await SecureStore.setItemAsync(BIOMETRIC_FLAG, 'true')
}

export async function disableBiometric(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY)
  await SecureStore.deleteItemAsync(BIOMETRIC_FLAG)
}

export async function unlockWithBiometric(): Promise<StoredSession | null> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Sign in to Teletraan',
    fallbackLabel: 'Use password',
    disableDeviceFallback: false,
  })
  if (!result.success) return null
  const raw = await SecureStore.getItemAsync(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredSession
  } catch {
    return null
  }
}

export async function supportedBiometricLabel(): Promise<string> {
  if (Platform.OS === 'web') return 'Biometric'
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return Platform.OS === 'ios' ? 'Face ID' : 'Face Unlock'
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint'
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) return 'Iris'
  return 'Biometric'
}
