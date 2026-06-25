import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

export function tapHaptic() {
  if (Platform.OS === 'web') return
  Haptics.selectionAsync().catch(() => {})
}

export function impactHaptic() {
  if (Platform.OS === 'web') return
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
}

export function warningHaptic() {
  if (Platform.OS === 'web') return
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {})
}

export function successHaptic() {
  if (Platform.OS === 'web') return
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
}
