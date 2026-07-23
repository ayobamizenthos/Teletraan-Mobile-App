import { View, StyleSheet, Platform } from 'react-native'

// Drawn-in iPhone home-indicator bar for the web preview only. Real iOS
// devices render their own; Android has no equivalent. The strip itself is
// transparent — the pill sits directly on the page background so no dark
// housing box shows around it in the browser.
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
    backgroundColor: 'transparent',
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
