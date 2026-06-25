import { StyleSheet, Pressable, Text } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import GlowBackground from '../components/glow-background'

export default function SplashScreen() {
  const router = useRouter()

  return (
    <Pressable style={styles.container} onPress={() => router.replace('/(auth)/onboarding')}>
      <GlowBackground variant="splash" />

      <Image
        source={require('../assets/images/teletraan-logo.png')}
        style={styles.logo}
        contentFit="contain"
      />
      <Text style={styles.brandName}>TELETRAAN</Text>

      {/* Footer — "by" + AVZDAX wordmark */}
      <Text style={styles.byText}>by</Text>
      <Image
        source={require('../assets/images/avzdax-wordmark.png')}
        style={styles.avzdaxWordmark}
        contentFit="contain"
      />
    </Pressable>
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
  logo: {
    position: 'absolute',
    left: 154.36,
    top: 250,
    width: 67.28,
    height: 78,
  },
  brandName: {
    position: 'absolute',
    left: 93,
    top: 343,
    width: 190,
    height: 49,
    color: '#F2F4F6',
    fontSize: 33.3466,
    lineHeight: 49.3863,
    textAlign: 'center',
    fontFamily: 'SpaceMono_400Regular',
  },
  byText: {
    position: 'absolute',
    left: 104,
    top: 659.83,
    width: 16,
    height: 18,
    color: '#FFFFFF',
    fontSize: 14.6662,
    lineHeight: 17.5995,
    fontFamily: 'Lato_400Regular',
  },
  avzdaxWordmark: {
    position: 'absolute',
    left: 120,
    top: 645,
    width: 150.33,
    height: 47.6652,
  },
})
