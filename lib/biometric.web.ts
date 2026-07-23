export type Deployment = 'connected' | 'unconnected'

export interface StoredSession {
  email: string
  deployment: Deployment
}

const SESSION_KEY = 'teletraan.session'
const CREDENTIAL_KEY = 'teletraan.webauthn.credential'
const RP_ID = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
const RP_NAME = 'Teletraan Mobile'
const USER_NAME = 'Teletraan'

function toB64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let str = ''
  for (const b of bytes) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromB64Url(input: string): ArrayBuffer {
  const pad = 4 - (input.length % 4 || 4)
  const b64 = (input + '='.repeat(pad === 4 ? 0 : pad)).replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

function isSupported(): boolean {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential && !!navigator.credentials
}

export async function isBiometricAvailable(): Promise<boolean> {
  if (!isSupported()) return false
  try {
    return await (PublicKeyCredential as any).isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

export async function isBiometricEnabled(): Promise<boolean> {
  if (typeof localStorage === 'undefined') return false
  return !!localStorage.getItem(CREDENTIAL_KEY) && !!localStorage.getItem(SESSION_KEY)
}

export async function enableBiometric(session: StoredSession): Promise<void> {
  if (!isSupported()) return
  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const userId = crypto.getRandomValues(new Uint8Array(16))
  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: RP_NAME, id: RP_ID },
      user: {
        id: userId,
        name: session.email || USER_NAME,
        displayName: session.email || USER_NAME,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    },
  })) as PublicKeyCredential | null
  if (!cred) return
  localStorage.setItem(CREDENTIAL_KEY, toB64Url(cred.rawId))
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export async function disableBiometric(): Promise<void> {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(CREDENTIAL_KEY)
  localStorage.removeItem(SESSION_KEY)
}

export async function unlockWithBiometric(): Promise<StoredSession | null> {
  if (!isSupported()) return null
  const credId = localStorage.getItem(CREDENTIAL_KEY)
  const raw = localStorage.getItem(SESSION_KEY)
  if (!credId || !raw) return null
  const challenge = crypto.getRandomValues(new Uint8Array(32))
  try {
    const assertion = (await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{ id: fromB64Url(credId), type: 'public-key' }],
        userVerification: 'required',
        rpId: RP_ID,
        timeout: 60000,
      },
    })) as PublicKeyCredential | null
    if (!assertion) return null
    return JSON.parse(raw) as StoredSession
  } catch {
    return null
  }
}

export async function supportedBiometricLabel(): Promise<string> {
  if (typeof navigator === 'undefined') return 'Biometric'
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('mac')) return 'Touch ID'
  if (ua.includes('windows')) return 'Windows Hello'
  if (ua.includes('android')) return 'Fingerprint'
  if (ua.includes('iphone') || ua.includes('ipad')) return 'Face ID'
  return 'Biometric'
}
