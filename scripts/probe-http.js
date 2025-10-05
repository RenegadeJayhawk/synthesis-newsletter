const fs = require('fs')
const path = require('path')

const outDir = path.join(__dirname, '..', 'out')

// If a manifest exists, use it for deterministic route discovery.
let routes = []
try {
  const manifestPath = path.join(outDir, 'out-manifest.json')
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    if (Array.isArray(manifest.entries)) {
      // convert manifest entries into route objects with optional file/hash/snippet
      routes = manifest.entries.map((e) => ({ route: e.route, file: e.file, hash: e.hash, snippet: e.snippet }))
    }
  }
} catch (e) {
  // ignore
}

const staticRoutes = ['/', '/articles', '/archive', '/about', '/newsletter', '/privacy', '/terms', '/contact']

function normalizeRoute(route) {
  if (route === '/') return '/'
  return route.replace(/\/+$/, '')
}

async function discoverFallbackRoutes() {
  // Discover article and category slugs like before if manifest not present
  const articleSlugs = []
  try {
    const data = require(path.join(__dirname, '..', 'lib', 'data'))
    if (data && Array.isArray(data.articles)) return data.articles.map((a) => a.slug)
  } catch (e) {
    try {
      const dataSrc = fs.readFileSync(path.join(__dirname, '..', 'lib', 'data.ts'), 'utf8')
      const regex = /slug:\s*'([a-z0-9-]+)'/g
      let m
      while ((m = regex.exec(dataSrc)) !== null) articleSlugs.push(m[1])
    } catch (e) {
      // ignore
    }
  }

  const categorySlugs = []
  try {
    const cats = require(path.join(__dirname, '..', 'lib', 'categories'))
    if (Array.isArray(cats)) return [...staticRoutes, ...articleSlugs.map((s) => `/${s}`), ...cats.map((c) => `/category/${c.slug}`)]
    if (cats && Array.isArray(cats.categorySlugs)) return [...staticRoutes, ...articleSlugs.map((s) => `/${s}`), ...cats.categorySlugs.map((c) => `/category/${c}`)]
  } catch (e) {
    // fallback
  }

  if (categorySlugs.length === 0) {
    return [...staticRoutes, ...articleSlugs.map((s) => `/${s}`), '/category/ai', '/category/ml', '/category/robotics', '/category/ethics']
  }

  return [...staticRoutes, ...articleSlugs.map((s) => `/${s}`), ...categorySlugs.map((c) => `/category/${c}`)]
}

async function main() {
  if (routes.length === 0) routes = await discoverFallbackRoutes()

  // Normalize routes while preserving manifest entry objects
  routes = routes.map((item) => {
    if (typeof item === 'string') return normalizeRoute(item)
    if (item && typeof item === 'object' && typeof item.route === 'string') {
      return Object.assign({}, item, { route: normalizeRoute(item.route) })
    }
    return item
  })
  const base = process.env.BASE_URL || 'http://127.0.0.1:8080'

  let ok = true

  for (const rEntry of routes) {
    const r = typeof rEntry === 'string' ? rEntry : rEntry.route
    const urlsToTry = []
    urlsToTry.push(new URL(r, base).toString())
    if (r !== '/') urlsToTry.push(new URL(`${r}.html`, base).toString())
    if (r !== '/') urlsToTry.push(new URL(`${r}/`, base).toString())

    let success = false
    for (const u of urlsToTry) {
      try {
        const res = await fetch(u, { redirect: 'manual' })
        if (res.status === 200) {
          // if manifest included a hash/snippet, validate them
          if (rEntry && rEntry.hash) {
            // prefer verifying against the on-disk file if manifest.entry.file is present
            if (rEntry.file) {
              try {
                const filePath = require('path').join(__dirname, '..', 'out', rEntry.file)
                if (require('fs').existsSync(filePath)) {
                  const buf = require('fs').readFileSync(filePath)
                  const h = require('crypto').createHash('sha256').update(buf).digest('hex')
                  if (h !== rEntry.hash) {
                    console.error(`FAILED ${r} — on-disk hash mismatch for ${rEntry.file}: expected ${rEntry.hash}, got ${h}`)
                    break
                  }
                }
              } catch (e) {
                // if file check fails, fall back to response body hashing
              }
            } else {
              const body = await res.arrayBuffer()
              const buf = Buffer.from(body)
              const h = require('crypto').createHash('sha256').update(buf).digest('hex')
              if (h !== rEntry.hash) {
                console.error(`FAILED ${r} — hash mismatch for ${u}: expected ${rEntry.hash}, got ${h}`)
                break
              }
            }
          }
          if (rEntry && rEntry.snippet) {
            const text = await res.text()
            if (!text.replace(/\s+/g, ' ').includes(rEntry.snippet.replace(/\s+/g, ' '))) {
              console.error(`FAILED ${r} — snippet not found in ${u}`)
              break
            }
          }
          console.log(`OK ${r} -> ${u} (200)`)
          success = true
          break
        } else {
          if (res.status >= 300 && res.status < 400) {
            const loc = res.headers.get('location')
            if (loc) {
              try {
                const res2 = await fetch(new URL(loc, base).toString())
                if (res2.status === 200) {
                  console.log(`OK ${r} -> ${u} -> ${loc} (200)`)
                  success = true
                  break
                }
              } catch (e) {
                // ignore
              }
            }
          }
        }
      } catch (e) {
        // network error
      }
    }

    if (!success) {
      console.error(`FAILED ${r} — none of tried URLs returned 200: ${urlsToTry.join(', ')}`)
      ok = false
    }
  }

  if (!ok) process.exit(2)

  console.log('All routes returned 200 OK ✅')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
