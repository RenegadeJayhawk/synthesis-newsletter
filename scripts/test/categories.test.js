const fs = require('fs')
const path = require('path')

const outDir = path.join(__dirname, '..', '..', 'out')
const categoriesPath = path.join(__dirname, '..', '..', 'lib', 'categories.ts')

if (!fs.existsSync(outDir)) {
  console.error('out/ directory not found — run build:export first')
  process.exit(2)
}

const src = fs.readFileSync(categoriesPath, 'utf8')
const categories = []
const slugRe = /slug:\s*'([^']+)'/g
let m
while ((m = slugRe.exec(src)) !== null) {
  categories.push({ slug: m[1] })
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
