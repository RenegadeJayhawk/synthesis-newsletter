const fs = require('fs')
const path = require('path')

const outManifest = path.join(__dirname, '..', '..', 'out', 'out-manifest.json')
if (!fs.existsSync(outManifest)) {
  console.error('out/out-manifest.json not found — run generate-export-manifest.js after build')
  process.exit(2)
}

const manifest = JSON.parse(fs.readFileSync(outManifest, 'utf8'))
const routes = (manifest.entries || manifest.routes || []).map((e) => (typeof e === 'string' ? e : e.route))

// Read data.ts and categories.ts to assert they're represented in the manifest
const dataSrc = fs.readFileSync(path.join(__dirname, '..', '..', 'lib', 'data.ts'), 'utf8')
const articleRegex = /slug:\s*'([a-z0-9-]+)'/g
const expectedArticles = []
let m
while ((m = articleRegex.exec(dataSrc)) !== null) expectedArticles.push(`/${m[1]}`)

const categoriesSrc = fs.readFileSync(path.join(__dirname, '..', '..', 'lib', 'categories.ts'), 'utf8')
const catRegex = /slug:\s*'([a-z0-9-]+)'/g
const expectedCats = []
while ((m = catRegex.exec(categoriesSrc)) !== null) expectedCats.push(`/category/${m[1]}`)

let ok = true
for (const a of expectedArticles) {
  if (!routes.includes(a)) {
    console.error(`Missing article route in manifest: ${a}`)
    ok = false
  }
}
for (const c of expectedCats) {
  if (!routes.includes(c)) {
    console.error(`Missing category route in manifest: ${c}`)
    ok = false
  }
}

if (!ok) process.exit(2)
console.log('Manifest sync test passed ✅')
