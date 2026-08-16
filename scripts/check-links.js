const fs = require('fs')
const path = require('path')

const appDir = path.join(__dirname, '..', 'app')

function readArticleSlugs() {
  try {
    const data = require(path.join(__dirname, '..', 'lib', 'data'))
    if (data && Array.isArray(data.articles)) {
      return data.articles.map((article) => article.slug)
    }
  } catch {
    try {
      const dataSrc = fs.readFileSync(path.join(__dirname, '..', 'lib', 'data.ts'), 'utf8')
      const regex = /slug:\s*'([a-z0-9-]+)'/g
      const slugs = []
      let match
      while ((match = regex.exec(dataSrc)) !== null) {
        slugs.push(match[1])
      }
      return slugs
    } catch {
      return []
    }
  }

  return []
}

function readCategorySlugs() {
  try {
    const cats = require(path.join(__dirname, '..', 'lib', 'categories'))
    if (Array.isArray(cats) && cats.length > 0 && cats[0].slug) {
      return cats.map((category) => category.slug)
    }
    if (cats && Array.isArray(cats.categorySlugs)) {
      return cats.categorySlugs
    }
  } catch {
    try {
      const footerSrc = fs.readFileSync(path.join(__dirname, '..', 'components', 'layout', 'Footer', 'index.tsx'), 'utf8')
      const regex = /href="\/category\/([a-z0-9-]+)"/g
      const slugs = []
      let match
      while ((match = regex.exec(footerSrc)) !== null) {
        slugs.push(match[1])
      }
      return slugs
    } catch {
      return []
    }
  }

  return []
}

const routes = [
  { route: '/', file: path.join(appDir, 'page.tsx') },
  { route: '/articles', file: path.join(appDir, 'articles', 'page.tsx') },
  { route: '/archive', file: path.join(appDir, 'archive', 'page.tsx') },
  { route: '/about', file: path.join(appDir, 'about', 'page.tsx') },
  { route: '/newsletter', file: path.join(appDir, 'newsletter', 'page.tsx') },
  { route: '/privacy', file: path.join(appDir, 'privacy', 'page.tsx') },
  { route: '/terms', file: path.join(appDir, 'terms', 'page.tsx') },
  { route: '/contact', file: path.join(appDir, 'contact', 'page.tsx') },
  ...readArticleSlugs().map((slug) => ({ route: `/${slug}`, file: path.join(appDir, '[slug]', 'page.tsx') })),
  ...readCategorySlugs().map((slug) => ({ route: `/category/${slug}`, file: path.join(appDir, 'category', '[slug]', 'page.tsx') })),
]

let ok = true

for (const { route, file } of routes) {
  if (fs.existsSync(file)) {
    console.log(`Found source route: ${route}`)
  } else {
    console.error(`Missing source file for route ${route}: expected ${file}`)
    ok = false
  }
}

if (!ok) process.exit(2)

console.log('All source routes present ✅')
