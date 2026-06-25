import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'images', 'glow')

// Web renders each glow as a solid #363636 ellipse blurred by (blurRadius * 0.35).
// Reproduce the exact pixels here with sharp so the native path just renders an
// image and the two platforms match byte-for-byte.
const SOURCE_COLOR = '#363636'
const BLUR_SCALE = 0.35
const HALO_PAD_SIGMAS = 3

const glows = [
  { name: 'wide-70', w: 558, h: 248, blur: 200 },
  { name: 'wide-87', w: 558, h: 248, blur: 250 },
  { name: 'narrow-70', w: 251, h: 248, blur: 200 },
]

await mkdir(outDir, { recursive: true })

for (const g of glows) {
  const sigma = g.blur * BLUR_SCALE
  const pad = Math.ceil(sigma * HALO_PAD_SIGMAS)
  const canvasW = g.w + pad * 2
  const canvasH = g.h + pad * 2
  const rx = g.w / 2
  const ry = g.h / 2
  const cx = canvasW / 2
  const cy = canvasH / 2

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasW}" height="${canvasH}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${SOURCE_COLOR}"/></svg>`

  const filePath = join(outDir, `${g.name}.png`)
  await sharp(Buffer.from(svg)).blur(sigma).png({ compressionLevel: 9 }).toFile(filePath)

  console.log(`${g.name}.png  ${canvasW}x${canvasH}  sigma=${sigma}`)
}
