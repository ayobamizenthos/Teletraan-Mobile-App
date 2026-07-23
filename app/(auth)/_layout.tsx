import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#121212' },
        animation: 'fade',
        animationDuration: 280,
      }}
    >
      {/* Onboarding flow uses ambient glow that morphs across screens — fade keeps it cohesive */}
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      {/* Sign-in slides in from the right (CTA tap) */}
      <Stack.Screen name="sign-in" options={{ animation: 'slide_from_right' }} />
      {/* Loading is a transitional state — fade for continuity */}
      <Stack.Screen name="loading" options={{ animation: 'fade' }} />
      {/* Error state */}
      <Stack.Screen name="not-connected" options={{ animation: 'fade' }} />
    </Stack>
  )
}
