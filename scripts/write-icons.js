const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const out = path.join(__dirname, '..', 'public')
if (!fs.existsSync(out)) fs.mkdirSync(out)

function crc32(buffer) {
  let crc = ~0 >>> 0
  for (let i = 0; i < buffer.length; i++) {
    crc ^= buffer[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return (~crc) >>> 0
}

function pngChunk(typeStr, data) {
  const type = Buffer.from(typeStr, 'binary')
  const len = data.length
  const chunk = Buffer.alloc(4 + 4 + len + 4)
  chunk.writeUInt32BE(len, 0)
  type.copy(chunk, 4)
  data.copy(chunk, 8)
  const crc = crc32(Buffer.concat([type, data]))
  chunk.writeUInt32BE(crc, 8 + len)
  return chunk
}

function encodeRgbPng(width, height, pixelAt) {
  const rowSize = 1 + width * 3
  const raw = Buffer.alloc(rowSize * height)
  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize
    raw[rowStart] = 0
    for (let x = 0; x < width; x++) {
      const { r, g, b } = pixelAt(x, y)
      const i = rowStart + 1 + x * 3
      raw[i] = r
      raw[i + 1] = g
      raw[i + 2] = b
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 })
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

function solidColorPng(width, height, r, g, b) {
  return encodeRgbPng(width, height, () => ({ r, g, b }))
}

function brandGradientPng(width, height) {
  const r1 = 37
  const g1 = 99
  const b1 = 235
  const r2 = 124
  const g2 = 58
  const b2 = 237
  const w = width - 1 || 1
  return encodeRgbPng(width, height, (x) => {
    const t = x / w
    return {
      r: Math.round(r1 + (r2 - r1) * t),
      g: Math.round(g1 + (g2 - g1) * t),
      b: Math.round(b1 + (b2 - b1) * t),
    }
  })
}

// Tab favicons (small fixed assets)
const png16 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAIklEQVR4AWNgGAWjYBSMglEwCkYGBgYGBgYg0GAAAK2QK/8HzH9wAAAABJRU5ErkJggg=='
const png32 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAAB3K7fNAAAAJ0lEQVR4Ae3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAAAAADA4H2fAAG1E3xFAAAAAElFTkSuQmCC'

fs.writeFileSync(path.join(out, 'favicon-16x16.png'), Buffer.from(png16, 'base64'))
fs.writeFileSync(path.join(out, 'favicon-32x32.png'), Buffer.from(png32, 'base64'))
fs.writeFileSync(path.join(out, 'favicon.ico'), Buffer.from(png32, 'base64'))

// Apple touch + Open Graph (raster for crawlers and iOS)
fs.writeFileSync(path.join(out, 'apple-touch-icon.png'), solidColorPng(180, 180, 124, 58, 237))
fs.writeFileSync(path.join(out, 'og-image.png'), brandGradientPng(1200, 630))

console.log('Wrote favicon PNG/ICO, apple-touch-icon.png, and og-image.png to public/')
