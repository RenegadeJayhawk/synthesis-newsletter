#!/usr/bin/env node
const http = require('http')
const fs = require('fs')
const path = require('path')

const port = parseInt(process.argv[2], 10) || 8080
const outDir = path.join(__dirname, '..', 'out')

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const ct = mime[ext] || 'application/octet-stream'
  fs.createReadStream(filePath)
    .on('error', () => {
      res.writeHead(500)
      res.end('Internal Server Error')
    })
    .once('open', () => {
      res.writeHead(200, { 'Content-Type': ct })
    })
    .pipe(res)
}

const server = http.createServer((req, res) => {
  // normalize URL
  let reqPath = decodeURIComponent(req.url.split('?')[0])
  if (reqPath.endsWith('/')) reqPath = reqPath.slice(0, -1)
  if (reqPath === '') reqPath = '/'

  // map to file
  const candidatePaths = []
  if (reqPath === '/') {
    candidatePaths.push(path.join(outDir, 'index.html'))
  } else {
    const p = reqPath.replace(/^\//, '')
    candidatePaths.push(path.join(outDir, `${p}.html`))
    candidatePaths.push(path.join(outDir, p, 'index.html'))
    candidatePaths.push(path.join(outDir, p))
  }

  for (const cp of candidatePaths) {
    try {
      const stat = fs.statSync(cp)
      if (stat.isFile()) {
        return sendFile(res, cp)
      }
    } catch (e) {
      // continue
    }
  }

  // not found
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('Not Found')
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving ${outDir} at http://127.0.0.1:${port}`)
})

// graceful shutdown
process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))
