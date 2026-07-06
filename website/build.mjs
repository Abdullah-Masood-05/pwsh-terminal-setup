// build.mjs — zero-dependency static site generator for pwsh-terminal-setup docs.
// Renders each page module into dist/<route>/index.html with a per-page relative
// base so the site works at any path (GitHub Pages project subpath or file://).
import { readdir, mkdir, rm, cp, writeFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { pages } from './src/site.mjs'
import { shell, docsShell } from './src/lib/layout.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(__dirname, 'src')
const DIST = path.join(__dirname, 'dist')
const PROJECT_ASSETS = path.join(__dirname, '..', 'assets')

// route '' -> depth 0; 'docs/overview' -> depth 2
const depthOf = (route) => (route === '' ? 0 : route.split('/').length)
const baseFor = (route) => '../'.repeat(depthOf(route))

async function build() {
  // 1. clean — empty the directory's contents rather than removing the dir
  //    itself, which can be EBUSY on Windows if a preview server holds it open.
  await mkdir(DIST, { recursive: true })
  for (const entry of await readdir(DIST)) {
    await rm(path.join(DIST, entry), { recursive: true, force: true })
  }

  // 2. static assets: site styles/scripts + shared assets, plus project screenshots + logo
  await cp(path.join(SRC, 'styles.css'), path.join(DIST, 'assets', 'styles.css'))
  await cp(path.join(SRC, 'main.js'), path.join(DIST, 'assets', 'main.js'))
  await cp(path.join(SRC, 'assets'), path.join(DIST, 'assets'), { recursive: true })
  // pull the four terminal screenshots + logo straight from the project's assets dir
  await cp(path.join(PROJECT_ASSETS, 'screenshots'), path.join(DIST, 'assets', 'screenshots'), { recursive: true })
  await cp(path.join(PROJECT_ASSETS, 'logo.png'), path.join(DIST, 'assets', 'logo.png'))
  await cp(path.join(PROJECT_ASSETS, 'terminal.ico'), path.join(DIST, 'assets', 'favicon.ico'))

  // 3. render every page
  let count = 0
  for (const page of pages) {
    const base = baseFor(page.route)
    const inner = typeof page.body === 'function' ? page.body({ base }) : page.body
    const layout = page.section === 'docs' ? docsShell : shell
    let html = layout({ ...page, base, inner })
    html = html.replaceAll('{{base}}', base) // resolve internal links / asset refs
    const outDir = page.route === '' ? DIST : path.join(DIST, page.route)
    await mkdir(outDir, { recursive: true })
    await writeFile(path.join(outDir, 'index.html'), html, 'utf8')
    count++
  }

  // 4. a .nojekyll so GitHub Pages serves files/dirs beginning with _ untouched
  await writeFile(path.join(DIST, '.nojekyll'), '', 'utf8')
  // 5. 404 page (GitHub Pages serves /404.html on unknown routes)
  const nf = pages.find((p) => p.route === '404')
  if (!nf) {
    const base = ''
    let html = shell({
      route: '404', section: 'page', base, title: 'Page not found',
      description: 'That page does not exist.',
      inner: `<section class="section"><div class="wrap prose"><h1>Page not found</h1>
        <p>That page doesn't exist. Head back to the <a href="{{base}}">home page</a> or the
        <a href="{{base}}docs/overview/">documentation</a>.</p></div></section>`,
    })
    html = html.replaceAll('{{base}}', base)
    await writeFile(path.join(DIST, '404.html'), html, 'utf8')
  }

  console.log(`Built ${count} pages -> ${path.relative(process.cwd(), DIST)}`)
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
