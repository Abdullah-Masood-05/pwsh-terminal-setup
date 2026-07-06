// nav.mjs — single source of truth for the top nav and the docs sidebar.

export const repoUrl = 'https://github.com/Abdullah-Masood-05/pwsh-terminal-setup'
export const releasesUrl = `${repoUrl}/releases`
export const siteName = 'pwsh-terminal-setup'
// Canonical public URL (GitHub Pages). Used for absolute og:image / og:url,
// which social/link-preview scrapers require (relative paths don't work).
export const siteUrl = 'https://abdullah-masood-05.github.io/pwsh-terminal-setup'

// External links referenced across pages.
export const links = {
  releases: releasesUrl,
  repo: repoUrl,
  powershell: 'https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-windows',
  windowsTerminal: 'https://aka.ms/terminal',
  nerdFont: 'https://github.com/Dosx001/ttf-ligaconsolas-nerd-font',
  license: `${repoUrl}/blob/main/LICENSE`,
  profileSrc: `${repoUrl}/blob/main/profile.ps1`,
  settingsSrc: `${repoUrl}/blob/main/windows-terminal/settings.partial.jsonc`,
}

// Top navigation (all pages). `route` is internal; `href` is external.
// Kept deliberately minimal per the design spec (Docs · GitHub).
export const topNav = [
  { title: 'Docs', route: 'docs/overview', match: 'docs' },
  { title: 'GitHub', href: repoUrl, external: true },
]

// Docs sidebar. Items may carry a `hash` to deep-link into a single page's H2.
export const docsNav = [
  {
    group: 'Getting started',
    items: [
      { title: 'Overview', route: 'docs/overview' },
      { title: 'Requirements', route: 'docs/requirements' },
      { title: 'Install with the installer', route: 'docs/install-installer' },
    ],
  },
  {
    group: 'Manual setup',
    items: [
      { title: 'Overview & PowerShell 7', route: 'docs/manual-setup' },
      { title: 'Install the Nerd Font', route: 'docs/manual-setup', hash: 'font' },
      { title: 'Install the profile', route: 'docs/manual-setup', hash: 'profile' },
      { title: 'Windows Terminal settings', route: 'docs/manual-setup', hash: 'terminal' },
    ],
  },
  {
    group: 'Reference',
    items: [
      { title: 'Installer options', route: 'docs/installer-options' },
      { title: 'Commands & functions', route: 'docs/commands' },
      { title: 'Profile & theming', route: 'docs/customization' },
    ],
  },
  {
    group: 'Help',
    items: [
      { title: 'Troubleshooting', route: 'docs/troubleshooting' },
      { title: 'FAQ', route: 'docs/faq' },
    ],
  },
]

// Ordered, de-duplicated list of docs page routes (for prev/next).
export const docsOrder = (() => {
  const seen = new Set()
  const out = []
  for (const g of docsNav) {
    for (const it of g.items) {
      if (it.hash) continue
      if (seen.has(it.route)) continue
      seen.add(it.route)
      out.push({ title: it.title, route: it.route })
    }
  }
  return out
})()

// Human titles for routes (used by prev/next when a title differs).
export const routeTitle = (route) => {
  for (const g of docsNav) for (const it of g.items) if (it.route === route && !it.hash) return it.title
  return route
}
