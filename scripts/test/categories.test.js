const fs = require('fs')
const path = require('path')

const categoriesPath = path.join(__dirname, '..', '..', 'lib', 'categories.ts')
const footerPath = path.join(__dirname, '..', '..', 'components', 'layout', 'Footer', 'index.tsx')

if (!fs.existsSync(categoriesPath)) {
  console.error('lib/categories.ts not found')
  process.exit(2)
}

if (!fs.existsSync(footerPath)) {
  console.error('Footer component not found')
  process.exit(2)
}

const src = fs.readFileSync(categoriesPath, 'utf8')
const footer = fs.readFileSync(footerPath, 'utf8')
const categories = []
const slugRe = /slug:\s*'([^']+)'/g
let m
while ((m = slugRe.exec(src)) !== null) {
  categories.push({ slug: m[1] })
}

if (categories.length === 0) {
  console.error('No categories found in lib/categories.ts')
  process.exit(2)
}

let ok = true
for (const c of categories) {
  const href = `href="/category/${c.slug}"`
  if (footer.includes(href)) {
    console.log('Found footer category link:', c.slug)
  } else {
    console.error('Missing footer category link for', c.slug)
    ok = false
  }
}

if (!ok) process.exit(2)
console.log('All categories validated ✅')
