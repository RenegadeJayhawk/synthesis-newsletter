const fs = require('fs')
const path = require('path')

const outDir = path.join(__dirname, '..', 'out')

// Prefer a generated manifest inside out/ when present. This file is created by
// scripts/generate-export-manifest.js after export and lists all routes.
let routes = []
try {
  const manifestPath = path.join(outDir, 'out-manifest.json')
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    if (Array.isArray(manifest.routes)) {
      routes = manifest.routes
    }
  }
} catch (e) {
  // ignore and fallback to discovery below
}

if (routes.length === 0) {
  const staticRoutes = ['/', '/articles', '/archive', '/about', '/newsletter', '/privacy', '/terms', '/contact']

  // Discover article slugs from lib/data.ts (try loading compiled JS first, else fallback to regex parse)
  let articleSlugs = []
  try {
    // If lib/data.js exists (e.g., after build), require it
    const data = require(path.join(__dirname, '..', 'lib', 'data'))
    if (data && Array.isArray(data.articles)) {
      articleSlugs = data.articles.map((a) => a.slug)
    }
  } catch (e) {
    // Fallback: read lib/data.ts and extract slug strings
    try {
      const dataSrc = fs.readFileSync(path.join(__dirname, '..', 'lib', 'data.ts'), 'utf8')
      const regex = /slug:\s*'([a-z0-9-]+)'/g
      let m
      while ((m = regex.exec(dataSrc)) !== null) {
        articleSlugs.push(m[1])
      }
    } catch (e) {
      // ignore
    }
  }

  // Prefer to read category slugs from lib/categories.ts (single source of truth)
  let categorySlugs = []
  try {
    const cats = require(path.join(__dirname, '..', 'lib', 'categories'))
    if (Array.isArray(cats) && cats.length > 0 && cats[0].slug) {
      categorySlugs = cats.map((c) => c.slug)
    } else if (cats && Array.isArray(cats.categorySlugs)) {
      categorySlugs = cats.categorySlugs
    }
  } catch (e) {
    // Fallback: try parsing footer or use defaults
    try {
      const footerSrc = fs.readFileSync(path.join(__dirname, '..', 'components', 'layout', 'Footer', 'index.tsx'), 'utf8')
      const regex = /href=\"\/category\/([a-z0-9-]+)\"/g
      let m
      while ((m = regex.exec(footerSrc)) !== null) {
        categorySlugs.push(m[1])
      }
    } catch (e) {
      // ignore
    }
  }

  if (categorySlugs.length === 0) {
    categorySlugs = ['ai', 'ml', 'robotics', 'ethics']
  }

  routes = [
    ...staticRoutes,
    ...articleSlugs.map((s) => `/${s}`),
    ...categorySlugs.map((c) => `/category/${c}`),
  ]
}

function routeToFile(route) {
  const p = route.replace(/^\//, '')
  // Next's export may produce either `out/about.html` or `out/about/index.html`.
  if (route === '/') {
    return { flat: path.join(outDir, 'index.html'), nested: path.join(outDir, 'index.html') }
  }
  const flat = path.join(outDir, `${p}.html`)
  const nested = path.join(outDir, p, 'index.html')
  return { flat, nested }
}

let ok = true

for (const r of routes) {
  const { flat, nested } = routeToFile(r)
  if (fs.existsSync(flat) || fs.existsSync(nested)) {
    console.log(`Found: ${r}`)
  } else {
    console.error(`Missing file for route ${r}: checked ${flat} and ${nested}`)
    ok = false
  }
}

if (!ok) process.exit(2)

console.log('All routes present in out/ ✅')
