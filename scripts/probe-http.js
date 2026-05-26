const staticRoutes = ['/', '/archive', '/newsletter', '/search']

function normalizeRoute(route) {
  if (route === '/') return '/'
  return route.replace(/\/+$/, '')
}

async function discoverFallbackRoutes() {
  const articleSlugs = []
  try {
    const data = require(path.join(__dirname, '..', 'lib', 'data'))
    if (data && Array.isArray(data.articles)) {
      return [...staticRoutes, ...data.articles.map((a) => `/${a.slug}`)]
    }
  } catch {
    try {
      const dataSrc = fs.readFileSync(path.join(__dirname, '..', 'lib', 'data.ts'), 'utf8')
      const regex = /slug:\s*'([a-z0-9-]+)'/g
      let m
      while ((m = regex.exec(dataSrc)) !== null) articleSlugs.push(m[1])
    } catch {
      // ignore
    }
  }

  return [...staticRoutes, ...articleSlugs.map((s) => `/${s}`)]
}

async function main() {
  let routes = await discoverFallbackRoutes()

  routes = routes.map((route) => normalizeRoute(route))
  const base = process.env.BASE_URL || 'http://127.0.0.1:8080'

  let ok = true

  for (const r of routes) {
    const urlsToTry = []
    urlsToTry.push(new URL(r, base).toString())
    if (r !== '/') urlsToTry.push(new URL(`${r}/`, base).toString())

    let success = false
    for (const u of urlsToTry) {
      try {
        const res = await fetch(u, { redirect: 'manual' })
        if (res.status === 200) {
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
              } catch {
                // ignore
              }
            }
          }
        }
      } catch {
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
