import RNShare from 'react-native-share'

interface ShareOpts {
  fileUri: string
  caption: string
}

// Wraps react-native-share so the OS share sheet opens with the file
// attached and the caption pre-filled. Kept in a .native.ts module so the
// react-native-share import is resolved statically for the native bundle
// and never reached on web (where the package has no valid build).
export async function shareMediaNative({ fileUri, caption }: ShareOpts): Promise<void> {
  await RNShare.open({
    url: fileUri.startsWith('file://') ? fileUri : `file://${fileUri}`,
    message: caption,
    type: 'image/png',
    title: caption,
    subject: caption,
    failOnCancel: false,
  })
}
