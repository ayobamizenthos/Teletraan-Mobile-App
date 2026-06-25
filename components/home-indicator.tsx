import { View, StyleSheet, Platform } from 'react-native'

// Drawn-in iPhone home-indicator bar is for the web preview only. Real iOS
// devices render their own; on Android there is no equivalent. No-op on
// native to avoid duplicating the OS chrome.
export default function HomeIndicator() {
  if (Platform.OS !== 'web') return null
  return (
    <View style={styles.frame} pointerEvents="none">
      <View style={styles.bar} />
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 375,
    height: 34,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
    zIndex: 9999,
  },
  bar: {
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
  },
})
