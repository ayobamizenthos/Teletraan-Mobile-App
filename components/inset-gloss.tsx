import { Platform, StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

type Variant = 'light' | 'dark'

interface InsetGlossProps {
  variant?: Variant
}

// Mirrors the web CSS inset box-shadow on native. Web keeps the real CSS
// shadow; native gets a stacked LinearGradient that produces the same
// top-left highlight bleeding into the button surface.
export default function InsetGloss({ variant = 'light' }: InsetGlossProps) {
  if (Platform.OS === 'web') return null
  const gradient =
    variant === 'dark'
      ? (['rgba(0,0,0,0.35)', 'rgba(0,0,0,0)'] as const)
      : (['rgba(188,183,183,1)', 'rgba(188,183,183,0)'] as const)
  return (
    <>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.55, y: 0.55 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      {variant === 'light' && <View pointerEvents="none" style={styles.outerGlow} />}
    </>
  )
}

const styles = StyleSheet.create({
  outerGlow: {
    ...StyleSheet.absoluteFillObject,
    ...Platform.select({
      ios: {
        shadowColor: '#A3A3A3',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
      },
      default: {},
    }),
  },
})
