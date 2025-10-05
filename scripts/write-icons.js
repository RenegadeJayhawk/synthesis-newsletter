const fs = require('fs')
const path = require('path')

const out = path.join(__dirname, '..', 'public')
if (!fs.existsSync(out)) fs.mkdirSync(out)

// Tiny 16x16 blue square PNG (base64)
const png16 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAIklEQVR4AWNgGAWjYBSMglEwCkYGBgYGBgYg0GAAAK2QK/8HzH9wAAAABJRU5ErkJggg=='
const png32 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAAB3K7fNAAAAJ0lEQVR4Ae3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAAAAADA4H2fAAG1E3xFAAAAAElFTkSuQmCC'

fs.writeFileSync(path.join(out, 'favicon-16x16.png'), Buffer.from(png16, 'base64'))
fs.writeFileSync(path.join(out, 'favicon-32x32.png'), Buffer.from(png32, 'base64'))

// For .ico, we'll just create a copy of the 32x32 PNG with .ico extension (many browsers accept it)
fs.writeFileSync(path.join(out, 'favicon.ico'), Buffer.from(png32, 'base64'))

console.log('Wrote placeholder PNG/ICO icons to public/')
