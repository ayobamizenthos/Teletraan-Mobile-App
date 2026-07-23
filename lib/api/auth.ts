import { DEV_CONNECTED, DEV_UNCONNECTED } from '../dev-credentials'

// Result shape the sign-in screen reacts to. Keep this stable — the screen
// renders one of the matching error strings or routes based on the status.
export type SignInResult =
  | { status: 'ok'; deployment: 'connected' | 'unconnected' }
  | { status: 'empty' }
  | { status: 'no-email' }
  | { status: 'no-password' }
  | { status: 'unknown-email' }
  | { status: 'wrong-password' }

export function signIn(rawEmail: string, password: string): SignInResult {
  const email = rawEmail.trim().toLowerCase()

  if (!email && !password) return { status: 'empty' }
  if (!email) return { status: 'no-email' }
  if (!password) return { status: 'no-password' }

  if (email === DEV_CONNECTED.email) {
    return password === DEV_CONNECTED.password
      ? { status: 'ok', deployment: 'connected' }
      : { status: 'wrong-password' }
  }
  if (email === DEV_UNCONNECTED.email) {
    return password === DEV_UNCONNECTED.password
      ? { status: 'ok', deployment: 'unconnected' }
      : { status: 'wrong-password' }
  }
  return { status: 'unknown-email' }
}
