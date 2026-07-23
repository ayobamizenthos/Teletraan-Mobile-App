export interface ShareMediaOpts {
  fileUri: string
  caption: string
}
export function shareMediaNative(opts: ShareMediaOpts): Promise<void>
