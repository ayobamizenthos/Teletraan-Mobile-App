import RNShare from 'react-native-share'

interface ShareOpts {
  fileUri: string
  caption: string
}

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
