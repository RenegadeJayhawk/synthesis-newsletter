const pa11y = require('pa11y')

const base = process.env.BASE_URL || 'http://127.0.0.1:8080'
const pages = [
  '/',
  '/articles',
  '/about',
  '/archive',
  '/contact'
]

async function run() {
  let hadError = false
  for (const p of pages) {
    const url = new URL(p, base).toString()
    console.log('Running pa11y on', url)
    try {
      const result = await pa11y(url, { timeout: 30000 })
      if (result.issues.length > 0) {
        hadError = true
        console.error(`Accessibility issues for ${url}: ${result.issues.length}`)
      }
    } catch {
      hadError = true
    }
  }

  if (hadError) {
    console.error('Accessibility issues detected')
    process.exit(2)
  }

  console.log('No accessibility issues found by pa11y for sampled pages.')
}

run()
