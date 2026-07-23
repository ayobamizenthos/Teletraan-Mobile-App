import { Stack } from 'expo-router'

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#121212' },
        animation: 'fade',
        animationDuration: 280,
      }}
    >
      {/* Tab roots — fade between peer tabs */}
      <Stack.Screen name="cameras" options={{ animation: 'fade' }} />
      <Stack.Screen name="alerts" options={{ animation: 'fade' }} />
      <Stack.Screen name="search" options={{ animation: 'fade' }} />
      <Stack.Screen name="profile" options={{ animation: 'fade' }} />

      {/* Camera detail flow — drill-down right→left */}
      <Stack.Screen name="single-camera" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="single-camera-view" options={{ animation: 'fade' }} />
      <Stack.Screen name="fullscreen-camera" options={{ animation: 'fade' }} />

      {/* Alerts detail flow */}
      <Stack.Screen name="incident-detail" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="alert-priority-view" options={{ animation: 'fade' }} />
      <Stack.Screen name="alert-priority-detail" options={{ animation: 'slide_from_right' }} />

      {/* Header bell → notifications */}
      <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
    </Stack>
  )
}
