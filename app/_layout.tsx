import { Stack } from 'expo-router'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import { View, Platform, StyleSheet } from 'react-native'
import { useEffect } from 'react'
import StatusBar from '../components/status-bar'
import HomeIndicator from '../components/home-indicator'
import AppErrorBoundary from '../components/error-boundary'
import {
  useFonts,
  Lato_300Light,
  Lato_400Regular,
  Lato_400Regular_Italic,
  Lato_700Bold,
  Lato_700Bold_Italic,
  Lato_900Black,
} from '@expo-google-fonts/lato'
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono'

// Inject font-weight override at module load — before any component renders.
// RN Web emits atomic CSS classes whose specificity (0,1,0) beats `body *` (0,0,2)
// but loses to `!important`. The id selector below has the highest specificity short
// of inline styles, which guarantees this rule wins regardless of class order.
if (typeof document !== 'undefined') {
  const css = `
    html body, html body *, html body *::before, html body *::after {
      font-weight: 400 !important;
    }
  `
  const existing = document.getElementById('teletraan-font-override')
  if (!existing) {
    const s = document.createElement('style')
    s.id = 'teletraan-font-override'
    s.textContent = css
    document.head.appendChild(s)
  }
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Lato_300Light,
    Lato_400Regular,
    Lato_400Regular_Italic,
    Lato_700Bold,
    Lato_700Bold_Italic,
    Lato_900Black,
    SpaceMono_400Regular,
  })

  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style')
      style.textContent = `
        input:focus, textarea:focus, select:focus {
          outline: none !important;
        }
        * {
          -webkit-tap-highlight-color: transparent;
        }
        /* Force every text node to render at the actual Lato Regular weight (400).
           RN Web's atomic CSS classes get faux-bolded by browsers when the loaded
           Lato_400Regular font isn't matched by weight. Nuclear !important override
           because the design uses no Bold text — every weight is Regular. */
        body, body * { font-weight: 400 !important; }
      `
      document.head.appendChild(style)
      return () => {
        document.head.removeChild(style)
      }
    }
  }, [])
  if (!fontsLoaded) return null

  return (
    <View style={styles.webContainer}>
      <View style={styles.mobileFrame}>
        <ExpoStatusBar style="light" translucent backgroundColor="transparent" />
        <AppErrorBoundary>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#121212' },
              animation: 'fade',
              animationDuration: 300,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(main)" />
          </Stack>
        </AppErrorBoundary>
        {/* Drawn-in iPhone chrome — both components self-gate to web only,
            so on real iOS/Android they render nothing and the OS chrome shows. */}
        <StatusBar />
        <HomeIndicator />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
    justifyContent: Platform.OS === 'web' ? 'center' : 'flex-start',
  },
  mobileFrame: {
    width: Platform.OS === 'web' ? 375 : '100%',
    height: Platform.OS === 'web' ? 812 : '100%',
    flex: Platform.OS === 'web' ? undefined : 1,
    backgroundColor: '#121212',
    overflow: 'hidden',
    position: 'relative',
  },
})
