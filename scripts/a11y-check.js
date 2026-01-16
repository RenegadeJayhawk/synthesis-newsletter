const pa11y = require('pa11y');

const base = process.env.BASE_URL || 'http://127.0.0.1:8080'
const pages = [
  '/',
  '/articles',
  '/about',
  '/archive',
  '/contact'
]

let hadError = false

;(async () => {
  for (const p of pages) {
    const url = new URL(p, base).toString()
    console.log('Running pa11y on', url)
    try {
      const results = await pa11y(url, {
        timeout: 30000,
        chromeLaunchConfig: {
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      })
      
      if (results.issues && results.issues.length > 0) {
        console.error(`Found ${results.issues.length} accessibility issues on ${url}`)
        results.issues.forEach(issue => {
          console.error(`  - ${issue.type}: ${issue.message}`)
        })
        hadError = true
      } else {
        console.log(`✓ No accessibility issues found on ${url}`)
      }
    } catch (e) {
      console.error('Error running pa11y:', e.message)
      hadError = true
    }
  }

  if (hadError) {
    console.error('Accessibility issues detected')
    process.exit(2)
  }
})()
