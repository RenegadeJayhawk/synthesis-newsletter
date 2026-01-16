const { execSync } = require('child_process')

const base = process.env.BASE_URL || 'http://127.0.0.1:8080'
const pages = [
  '/',
  '/articles',
  '/about',
  '/archive',
  '/contact'
]

let hadError = false
for (const p of pages) {
  const url = new URL(p, base).toString()
  console.log('Running pa11y on', url)
  try {
    // run pa11y with minimal output; requires no install because we'll use npx in CI
    execSync(`npx pa11y ${url} --timeout 30000 --chromeLaunchArgs="--no-sandbox,--disable-setuid-sandbox"`, { stdio: 'inherit' })
  } catch (e) {
    hadError = true
  }
}

if (hadError) {
  console.error('Accessibility issues detected')
  process.exit(2)
}

console.log('No accessibility issues found by pa11y for sampled pages.')
