import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { Buffer } from 'node:buffer'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const assets = join(root, 'assets', 'images')

const logoSvg = await readFile(join(assets, 'logo.svg'), 'utf8')

// One high-quality raster with transparent padding trimmed off — the source
// viewBox is 1024×1024 with wide empty margins that made the mark render at
// ~40% of the requested fill. Downstream renders scale this trimmed buffer,
// so the visible mark actually fills the space we ask for.
const trimmed = await sharp(Buffer.from(logoSvg))
  .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
  .png()
  .toBuffer()
const { width: tW, height: tH } = await sharp(trimmed).metadata()
const aspect = tW / tH

function dims(size, fill) {
  const t = Math.round(size * fill)
  return aspect >= 1 ? [t, Math.round(t / aspect)] : [Math.round(t * aspect), t]
}

function bgSquare(size, color) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${color}"/></svg>`
  )
}

async function renderCentered(size, fill, out, bg = '#121212') {
  const [w, h] = dims(size, fill)
  const logo = await sharp(trimmed).resize(w, h, { fit: 'contain' }).png().toBuffer()
  await sharp(bgSquare(size, bg))
    .composite([{ input: logo, left: Math.round((size - w) / 2), top: Math.round((size - h) / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(out)
}

async function renderForeground(size, fill, out) {
  const [w, h] = dims(size, fill)
  const logo = await sharp(trimmed).resize(w, h, { fit: 'contain' }).png().toBuffer()
  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: logo, left: Math.round((size - w) / 2), top: Math.round((size - h) / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(out)
}

async function renderBackground(size, out) {
  await sharp(bgSquare(size, '#121212')).png({ compressionLevel: 9 }).toFile(out)
}

async function renderMonochrome(size, fill, out) {
  const [w, h] = dims(size, fill)
  const alpha = await sharp(trimmed)
    .resize(w, h, { fit: 'contain' })
    .ensureAlpha()
    .extractChannel('alpha')
    .toColourspace('b-w')
    .threshold(1)
    .png()
    .toBuffer()
  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: alpha, left: Math.round((size - w) / 2), top: Math.round((size - h) / 2) },
    ])
    .png({ compressionLevel: 9 })
    .toFile(out)
}

// Run sequentially — sharp holds pixel buffers in memory and the composite
// SVG here is gradient-heavy, so parallel Promise.all pushed the process to
// >2 GB and stalled. One at a time finishes in seconds.
await renderCentered(1024, 0.7, join(assets, 'icon.png'))
// Favicon and splash icon: transparent — the browser tab and splash background
// bleed through, so the logo stands alone with no dark chip behind it.
await renderForeground(96, 0.9, join(assets, 'favicon.png'))
await renderForeground(512, 0.9, join(assets, 'splash-icon.png'))
await renderForeground(1024, 0.7, join(assets, 'android-icon-foreground.png'))
await renderBackground(1024, join(assets, 'android-icon-background.png'))
await renderMonochrome(1024, 0.7, join(assets, 'android-icon-monochrome.png'))
await renderForeground(512, 0.98, join(assets, 'teletraan-logo.png'))

console.log(`regenerated icons — trimmed logo bounding box ${tW}x${tH}`)
