import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { Buffer } from 'node:buffer'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const assets = join(root, 'assets', 'images')

const SCALE = 3.3125
const DESIGN_W = 375
const DESIGN_H = 812
const OUT_W = Math.round(DESIGN_W * SCALE)
const OUT_H = Math.round(DESIGN_H * SCALE)

const px = n => n * SCALE

const [logoData, avzdaxData, topGlowData, bottomGlowData] = await Promise.all([
  readFile(join(assets, 'teletraan-logo.png')),
  readFile(join(assets, 'avzdax-wordmark.png')),
  readFile(join(assets, 'glow', 'wide-70.png')),
  readFile(join(assets, 'glow', 'wide-87.png')),
])

const toDataUri = buf => `data:image/png;base64,${buf.toString('base64')}`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OUT_W}" height="${OUT_H}" viewBox="0 0 ${OUT_W} ${OUT_H}">
  <rect width="${OUT_W}" height="${OUT_H}" fill="#121212"/>
  <image href="${toDataUri(topGlowData)}" x="${px(-317)}" y="${px(-343)}" width="${px(978)}" height="${px(668)}"/>
  <image href="${toDataUri(bottomGlowData)}" x="${px(-367)}" y="${px(402)}" width="${px(1084)}" height="${px(774)}"/>
  <image href="${toDataUri(logoData)}" x="${px(154.36)}" y="${px(250)}" width="${px(67.28)}" height="${px(78)}"/>
  <text
    x="${px(187.5)}"
    y="${px(376)}"
    fill="#F2F4F6"
    font-family="'Space Mono', 'Menlo', 'Consolas', monospace"
    font-size="${px(33.35)}"
    text-anchor="middle"
    font-weight="400"
  >TELETRAAN</text>
  <text
    x="${px(112)}"
    y="${px(670.5)}"
    fill="#FFFFFF"
    font-family="Lato, 'Helvetica Neue', Arial, sans-serif"
    font-size="${px(14.67)}"
    font-weight="400"
  >by</text>
  <image href="${toDataUri(avzdaxData)}" x="${px(120)}" y="${px(645)}" width="${px(150.33)}" height="${px(47.6652)}"/>
</svg>`

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(join(assets, 'native-splash.png'))

console.log(`native-splash.png ${OUT_W}x${OUT_H}`)
