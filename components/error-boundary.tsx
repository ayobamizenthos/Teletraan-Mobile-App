import { Component, type ReactNode } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

// Catches uncaught render-time errors anywhere in the tree and shows a
// dark recovery screen with the error message + a "Try again" button.
// Keeps the user inside the app instead of dumping them on a white
// React Native red-screen of death.
export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }): void {
    // Surfaces the stack in dev tools / Metro logs so the backend engineer
    // can find the failing component. Wire this to Sentry / Datadog when the
    // observability stack is added.
    console.error('[AppErrorBoundary]', error.message, info.componentStack)
  }

  retry = (): void => {
    this.setState({ error: null })
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message} numberOfLines={4}>
          {this.state.error.message || 'An unexpected error occurred.'}
        </Text>
        <Pressable
          style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.8 }]}
          onPress={this.retry}
        >
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '400',
    fontFamily: 'Lato_400Regular',
  },
  message: {
    color: '#A3A3A3',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Lato_400Regular',
    maxWidth: 320,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 2,
    backgroundColor: '#A3A3A3',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: '#242424',
    borderBottomColor: '#242424',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    color: '#262626',
    fontSize: 14,
    fontFamily: 'Lato_400Regular',
  },
})
