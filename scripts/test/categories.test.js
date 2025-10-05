const fs = require('fs')
const path = require('path')
const categories = require('../../lib/categories')

const outDir = path.join(__dirname, '..', '..', 'out')

if (!fs.existsSync(outDir)) {
  console.error('out/ directory not found — run build:export first')
  process.exit(2)
}

let ok = true
for (const c of categories) {
  const f1 = path.join(outDir, `${c.slug}.html`)
  const f2 = path.join(outDir, 'category', c.slug, 'index.html')
  if (fs.existsSync(f1) || fs.existsSync(f2)) {
    console.log('Found category:', c.slug)
  } else {
    console.error('Missing category export for', c.slug)
    ok = false
  }
}

if (!ok) process.exit(2)
console.log('All categories exported ✅')
