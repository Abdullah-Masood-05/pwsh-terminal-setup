import { defineConfig } from 'vitepress'

const repoUrl = 'https://github.com/Abdullah-Masood-05/pwsh-terminal-setup'
const siteUrl = 'https://abdullah-masood-05.github.io/pwsh-terminal-setup'

export default defineConfig({
  title: 'pwsh-terminal-setup',
  description:
    'A fast, good-looking PowerShell 7 + Windows Terminal setup. One installer with the Nerd Font bundled, or a step-by-step manual guide.',
  lang: 'en',
  base: '/pwsh-terminal-setup/',
  appearance: 'dark', // dark by default, per the design spec; light is opt-in via the toggle
  cleanUrls: true,
  lastUpdated: false,
  // README.md documents the website's own build tooling for contributors;
  // context.md is scratch working notes, neither is site content.
  srcExclude: ['README.md', 'context.md'],

  head: [
    ['link', { rel: 'icon', href: '/pwsh-terminal-setup/favicon.ico', sizes: 'any' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'pwsh-terminal-setup' }],
    ['meta', { property: 'og:image', content: `${siteUrl}/og-image.png` }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    [
      'meta',
      {
        property: 'og:image:alt',
        content: 'pwsh-terminal-setup: a PowerShell 7 prompt with a git-aware terminal demo.',
      },
    ],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: `${siteUrl}/og-image.png` }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;700&display=swap',
      },
    ],
  ],

  sitemap: {
    hostname: siteUrl,
  },

  markdown: {
    // Code blocks always sit on the same near-black terminal surface
    // (design.md: "the only dark surface"), so syntax colors stay dark-mode
    // regardless of the site's light/dark theme.
    theme: 'github-dark',
    languages: ['powershell', 'json', 'jsonc', 'bash'],
  },

  themeConfig: {
    logo: '/logo.png',
    siteTitle: 'pwsh-terminal-setup',

    nav: [{ text: 'Docs', link: '/docs/overview', activeMatch: '^/docs/' }],

    sidebar: {
      '/docs/': [
        {
          text: 'Getting started',
          items: [
            { text: 'Overview', link: '/docs/overview' },
            { text: 'Requirements', link: '/docs/requirements' },
            { text: 'Install with the installer', link: '/docs/install-installer' },
          ],
        },
        {
          text: 'Manual setup',
          items: [
            { text: 'Overview & PowerShell 7', link: '/docs/manual-setup' },
            { text: 'Install the Nerd Font', link: '/docs/manual-setup#font' },
            { text: 'Install the profile', link: '/docs/manual-setup#profile' },
            { text: 'Windows Terminal settings', link: '/docs/manual-setup#terminal' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'Installer options', link: '/docs/installer-options' },
            { text: 'Commands & functions', link: '/docs/commands' },
            { text: 'Profile & theming', link: '/docs/customization' },
            { text: 'Plugins', link: '/docs/plugins' },
          ],
        },
        {
          text: 'Help',
          items: [
            { text: 'Troubleshooting', link: '/docs/troubleshooting' },
            { text: 'FAQ', link: '/docs/faq' },
          ],
        },
      ],
    },

    outline: { label: 'On this page' },

    search: {
      provider: 'local',
      options: {
        placeholder: 'Search docs',
      },
    },

    socialLinks: [{ icon: 'github', link: repoUrl }],

    footer: {
      message:
        '<a href="https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-windows" target="_blank" rel="noopener">Get PowerShell 7 ↗</a> · <a href="' +
        repoUrl +
        '/releases" target="_blank" rel="noopener">Releases ↗</a> · <a href="' +
        repoUrl +
        '/blob/main/LICENSE" target="_blank" rel="noopener">MIT license ↗</a>',
      copyright: 'Built by Abdullah Masood · © 2026',
    },

    editLink: undefined,
    docFooter: { prev: 'Previous', next: 'Next' },
  },
})
