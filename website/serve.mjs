// serve.mjs — tiny static file server for local preview (no dependencies).
// Resolves directory URLs to index.html so pretty routes work like GitHub Pages.
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, 'dist')
const PORT = process.env.PORT || 8080

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2',
}

async function resolve(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0])
  let fp = path.join(ROOT, p)
  try {
    const s = await stat(fp)
    if (s.isDirectory()) fp = path.join(fp, 'index.html')
    return fp
  } catch {
    if (path.extname(fp) === '') {
      try { await stat(fp + '.html'); return fp + '.html' } catch {}
      try { const idx = path.join(fp, 'index.html'); await stat(idx); return idx } catch {}
    }
    return null
  }
}

createServer(async (req, res) => {
  const fp = await resolve(req.url)
  if (!fp) {
    const nf = path.join(ROOT, '404.html')
    try { const body = await readFile(nf); res.writeHead(404, { 'content-type': TYPES['.html'] }); res.end(body); return } catch {}
    res.writeHead(404); res.end('Not found'); return
  }
  try {
    const body = await readFile(fp)
    res.writeHead(200, { 'content-type': TYPES[path.extname(fp)] || 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(500); res.end('Server error')
  }
}).listen(PORT, () => console.log(`Serving dist/ at http://localhost:${PORT}`))
