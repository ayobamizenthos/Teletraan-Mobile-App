/**
 * Smoke test for the critical boot flow.
 *
 * Boots a fresh Chromium against a running Expo dev server and verifies:
 *   1. Splash → Get Started → Sign in (credentials pre-filled)
 *   2. Cameras tab loads with quad-grid feeds visible
 *   3. Bottom-nav switch to Alerts works
 *   4. Alerts page renders all 4 incident cards
 *   5. Filter pill is present and tappable (opens the modal)
 *
 * Note: this smoke does NOT exercise the filter modal's chip-pick flow.
 * react-native-web's Pressable uses a custom PressResponder that doesn't
 * fire on synthetic Playwright pointer events — manual hard-refresh in a
 * real browser remains the source of truth for filter UX. Everything in
 * this smoke is plain DOM (text, nav, modal mount) and runs reliably.
 *
 * Usage:
 *   1. Start dev server in another terminal:  npx expo start --web --port 8081
 *   2. Run:                                   npm run smoke
 *
 * Exits 0 on pass / 1 on any assertion failure. CI-friendly.
 */
import { chromium } from 'playwright'

const URL = 'http://localhost:8081'
const ok = []
const fail = []

const assert = (label, cond) => {
  if (cond) ok.push(label)
  else fail.push(label)
  console.log((cond ? 'OK  ' : 'FAIL') + ' — ' + label)
}

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await ctx.newPage()
page.on('pageerror', e => fail.push('pageerror: ' + e.message))

await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(2000)

// Splash → Get Started → Sign in
await page.mouse.click(195, 422)
await page.waitForTimeout(2500)
try {
  await page
    .getByText(/get started/i)
    .first()
    .click({ timeout: 5000 })
} catch {}
await page.waitForTimeout(2500)
try {
  await page
    .getByText(/^sign in$/i)
    .last()
    .click({ timeout: 5000 })
} catch {}
await page.waitForTimeout(7500)

// Dismiss setup overlay if shown
try {
  await page
    .getByText(/quad grid view/i)
    .first()
    .click({ timeout: 3000 })
  await page.waitForTimeout(400)
  await page
    .getByText(/continue/i)
    .first()
    .click({ timeout: 3000 })
  await page.waitForTimeout(1500)
} catch {}

// (2) Cameras quad-grid visible
const html1 = await page.content()
assert(
  'quad-grid renders at least one camera tile',
  /Lobby|Reception|Car Park|Office|Server|Production|Cafe|Gate|Lodge|Park/.test(html1)
)

// (3) Nav → Alerts via the bottom nav coord
await page.mouse.click(130, 720)
await page.waitForTimeout(1500)
const html2 = await page.content()

// (4) All four incident titles rendered
assert(
  'Alerts page renders 4 incident keyword hits',
  (html2.match(/Forced Entry|Unrecognized Vehicle|Perimeter Breach|Unknown Face/g) || []).length ===
    4
)
assert('Alerts page shows the "Recents" section header', /Recents/.test(html2))
assert('Filter pill is present on the alerts page', /Filter/.test(html2))

// (5) Tapping the Filter pill mounts the modal (verifies the modal route +
//     gradient rendering doesn't blow up — the chip-pick step is manual).
try {
  await page
    .getByText(/^Filter$/)
    .first()
    .click({ timeout: 5000 })
} catch {}
await page.waitForTimeout(1000)
const html3 = await page.content()
assert(
  'Filter modal opens with Camera + Location + Threat sections',
  /Camera/.test(html3) && /Location/.test(html3) && /Threat Level/.test(html3)
)

await browser.close()

console.log('\n' + ok.length + ' passed, ' + fail.length + ' failed')
process.exit(fail.length > 0 ? 1 : 0)
