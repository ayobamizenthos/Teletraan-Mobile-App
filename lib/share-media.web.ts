interface ShareOpts {
  fileUri: string
  caption: string
}

// Web has no react-native-share; this is a no-op stub so the module resolves
// on web bundles. The web share flow lives inline in incident-detail.tsx
// (Web Share API + fallback download) and never calls this function.
export async function shareMediaNative(_: ShareOpts): Promise<void> {
  // no-op on web
}
