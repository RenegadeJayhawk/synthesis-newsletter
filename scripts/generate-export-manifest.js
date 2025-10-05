const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const child = require('child_process')

const outDir = path.join(__dirname, '..', 'out')

function getGitSha() {
  try {
    return child.execSync('git rev-parse --short HEAD', { cwd: path.join(__dirname, '..'), stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch (e) {
    return null
  }
}

function safeRequire(p) {
  try {
    return require(p)
  } catch (e) {
    return null
  }
}

function discoverArticleSlugs() {
  const data = safeRequire(path.join(__dirname, '..', 'lib', 'data'))
  if (data && Array.isArray(data.articles)) return data.articles.map((a) => a.slug)
  // fallback to simple parse
  try {
    const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'data.ts'), 'utf8')
    const regex = /slug:\s*'([a-z0-9-]+)'/g
    const out = []
    let m
    while ((m = regex.exec(src)) !== null) out.push(m[1])
    return out
  } catch (e) {
    return []
  }
}

function discoverCategorySlugs() {
  const mod = safeRequire(path.join(__dirname, '..', 'lib', 'categories'))
  if (Array.isArray(mod)) return mod.map((c) => c.slug)
  if (mod && Array.isArray(mod.categories)) return mod.categories.map((c) => c.slug)
  if (mod && Array.isArray(mod.categorySlugs)) return mod.categorySlugs
  return ['ai', 'ml', 'robotics', 'ethics']
}

function pickExistingFile(route) {
  // route: '/', or '/about' or '/future-of-ai'
  if (route === '/') {
    const f = path.join(outDir, 'index.html')
    return fs.existsSync(f) ? f : null
  }
  const p = route.replace(/^\//, '')
  const flat = path.join(outDir, `${p}.html`)
  const nested = path.join(outDir, p, 'index.html')
  if (fs.existsSync(flat)) return flat
  if (fs.existsSync(nested)) return nested
  return null
}

function hashBuffer(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex')
}

function snippetFromBuffer(buf, max = 200) {
  try {
    const s = buf.toString('utf8').replace(/\s+/g, ' ').trim()
    return s.slice(0, max)
  } catch (e) {
    return ''
  }
}

function generate() {
  const staticRoutes = ['/', '/articles', '/archive', '/about', '/newsletter', '/privacy', '/terms', '/contact']
  const articleSlugs = discoverArticleSlugs()
  const categorySlugs = discoverCategorySlugs()

  const routes = [
    ...staticRoutes,
    ...articleSlugs.map((s) => `/${s}`),
    ...categorySlugs.map((c) => `/category/${c}`),
  ]

  const gitSha = getGitSha()

  const entries = routes.map((r) => {
    const file = pickExistingFile(r)
    if (!file) return { route: r, file: null, hash: null, snippet: null }
    const buf = fs.readFileSync(file)
    // normalize path to POSIX relative path
    const rel = path.relative(outDir, file).split(path.sep).join('/')
    return { route: r, file: rel, hash: hashBuffer(buf), snippet: snippetFromBuffer(buf, 200) }
  })

  const manifest = { generatedAt: new Date().toISOString(), gitSha: gitSha, entries }

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'out-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')
  console.log('Wrote out/out-manifest.json with', entries.length, 'entries')
}

generate()
