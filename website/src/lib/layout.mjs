// layout.mjs — page shells. `shell` is the base (nav + footer); `docsShell`
// wraps content in the docs chrome (sidebar + TOC rail + prev/next).
import { topNav, docsNav, docsOrder, routeTitle, repoUrl, links } from './nav.mjs'
import { esc, extractToc } from './components.mjs'

const FONTS =
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;700&display=swap'

// Sun (shown in dark mode) + moon (shown in light mode); CSS toggles visibility.
const THEME_ICONS =
  '<svg class="ti ti-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' +
  '<svg class="ti ti-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'

function head({ title, description, route }) {
  const full = route === '' ? `${title}` : `${esc(title)} · pwsh-terminal-setup`
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',(t==='light'||t==='dark')?t:'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();</script>
<title>${full}</title>
<meta name="description" content="${esc(description || '')}">
<meta name="color-scheme" content="dark light">
<link rel="icon" href="{{base}}assets/favicon.ico" sizes="any">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description || '')}">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="{{base}}assets/styles.css">
</head>`
}

function topbar(route) {
  const isActive = (item) => {
    if (item.match) return route.startsWith(item.match)
    return route === item.route
  }
  const navItems = topNav
    .map((item) => {
      if (item.href) {
        return `<a class="topnav__link" href="${item.href}" target="_blank" rel="noopener">${esc(item.title)} <span class="ext" aria-hidden="true">↗</span></a>`
      }
      const active = isActive(item) ? ' aria-current="page"' : ''
      return `<a class="topnav__link" href="{{base}}${item.route}/"${active}>${esc(item.title)}</a>`
    })
    .join('')
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="topbar">
  <div class="topbar__inner">
    <a class="brand" href="{{base}}" aria-label="pwsh-terminal-setup home">
      <img class="brand__logo" src="{{base}}assets/logo.png" alt="" width="28" height="28">
      <span class="brand__glyph" aria-hidden="true">&#10095;</span>
      <span class="brand__name">pwsh-terminal-setup</span>
    </a>
    <div class="topbar__controls">
      <nav class="topnav" id="topnav" aria-label="Primary">${navItems}</nav>
      <button class="theme-toggle" id="theme-toggle" type="button" aria-label="Switch to light theme">${THEME_ICONS}</button>
      <button class="topnav__toggle" type="button" aria-expanded="false" aria-controls="topnav">Menu</button>
    </div>
  </div>
</header>`
}

function footer() {
  const year = 2026
  return `<footer class="footer">
  <div class="footer__inner">
    <div class="footer__brand">
      <span class="brand__glyph" aria-hidden="true">&#10095;</span>
      <span>pwsh-terminal-setup</span>
    </div>
    <nav class="footer__links" aria-label="Footer">
      <a href="${repoUrl}" target="_blank" rel="noopener">GitHub ↗</a>
      <a href="${links.releases}" target="_blank" rel="noopener">Releases ↗</a>
      <a href="${links.license}" target="_blank" rel="noopener">MIT license ↗</a>
      <a href="${links.powershell}" target="_blank" rel="noopener">Get PowerShell 7 ↗</a>
    </nav>
    <p class="footer__meta">Built by Abdullah Masood · © ${year} · MIT</p>
  </div>
</footer>`
}

// Base shell — used by the home page and any non-docs page.
export function shell({ title, description, route, base, inner }) {
  return `${head({ title, description, route })}
<body data-route="${esc(route)}">
${topbar(route)}
<main id="main">
${inner}
</main>
${footer()}
<script src="{{base}}assets/main.js" defer></script>
</body>
</html>`
}

// Sidebar for the docs chrome.
function sidebar(route) {
  const groups = docsNav
    .map((g) => {
      const items = g.items
        .map((it) => {
          const href = it.hash ? `{{base}}${it.route}/#${it.hash}` : `{{base}}${it.route}/`
          const isPage = !it.hash && it.route === route
          const cls = ['sidebar__link', it.hash ? 'sidebar__link--sub' : '', isPage ? 'is-active' : '']
            .filter(Boolean)
            .join(' ')
          const cur = isPage ? ' aria-current="page"' : ''
          const spy = it.hash ? ` data-spy="${esc(it.hash)}"` : ''
          return `<li><a class="${cls}" href="${href}"${cur}${spy}>${esc(it.title)}</a></li>`
        })
        .join('')
      return `<div class="sidebar__group"><p class="sidebar__label">${esc(g.group)}</p><ul>${items}</ul></div>`
    })
    .join('')
  return `<nav class="sidebar" id="sidebar" aria-label="Documentation">${groups}</nav>`
}

function tocRail(inner) {
  const items = extractToc(inner)
  if (items.length < 2) return ''
  const links = items.map((i) => `<li><a href="#${i.id}" data-toc="${i.id}">${esc(i.text)}</a></li>`).join('')
  return `<aside class="toc" aria-label="On this page">
  <p class="toc__label">On this page</p>
  <ul>${links}</ul>
</aside>`
}

function prevNext(route) {
  const i = docsOrder.findIndex((p) => p.route === route)
  if (i === -1) return ''
  const prev = docsOrder[i - 1]
  const next = docsOrder[i + 1]
  const card = (p, dir) =>
    p
      ? `<a class="pager__card pager__card--${dir}" href="{{base}}${p.route}/">
      <span class="pager__dir">${dir === 'prev' ? 'Previous' : 'Next'}</span>
      <span class="pager__title">${esc(p.title)}</span></a>`
      : '<span class="pager__spacer"></span>'
  return `<nav class="pager" aria-label="Pagination">${card(prev, 'prev')}${card(next, 'next')}</nav>`
}

// Docs shell — sidebar + prose column + TOC rail + prev/next.
export function docsShell({ title, description, route, base, inner }) {
  return `${head({ title, description, route })}
<body class="has-docs" data-route="${esc(route)}">
${topbar(route)}
<div class="docs">
  <button class="sidebar__toggle" type="button" aria-expanded="false" aria-controls="sidebar">
    <span class="sidebar__toggle-bar" aria-hidden="true"></span> Documentation menu
  </button>
  ${sidebar(route)}
  <main id="main" class="docs__main">
    <article class="prose">
${inner}
${prevNext(route)}
    </article>
  </main>
  ${tocRail(inner)}
</div>
${footer()}
<script src="{{base}}assets/main.js" defer></script>
</body>
</html>`
}
