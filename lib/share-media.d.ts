// Ambient module declaration so TypeScript resolves the .native / .web
// platform-specific implementations that Metro selects at bundle time.
export interface ShareMediaOpts {
  fileUri: string
  caption: string
}
export function shareMediaNative(opts: ShareMediaOpts): Promise<void>
