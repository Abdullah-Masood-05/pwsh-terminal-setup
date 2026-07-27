# Documentation website

The download + documentation site for **pwsh-terminal-setup**, built with [VitePress](https://vitepress.dev).

Live site: <https://abdullah-masood-05.github.io/pwsh-terminal-setup/>

## Develop

```powershell
cd website
bun install      # or: npm install
bun run dev       # vitepress dev . (live-reloading local server)
bun run build     # vitepress build . (outputs to .vitepress/dist)
bun run preview   # serve the production build locally
```

Local dev uses `bun`; CI (see `.github/workflows/deploy-docs.yml`) uses `npm ci` +
`npm run build` against the committed `package-lock.json`, so keep both lockfiles in sync
when adding a dependency (`bun add -D <pkg>` then `npm install` once to refresh
`package-lock.json`).

## Structure

| Path | What it is |
|------|-----------|
| `.vitepress/config.mts` | Site config: nav, sidebar, base path, head tags, Shiki languages. |
| `.vitepress/theme/index.ts` | Extends VitePress's default theme; registers the custom components below. |
| `.vitepress/theme/style.css` | Design tokens (design.md) mapped onto VitePress's `--vp-*` variables, plus the homepage and terminal-demo styling. |
| `.vitepress/theme/components/TerminalDemo.vue` | The site's signature element: a Windows Terminal window with an accessible before/after tablist. |
| `.vitepress/theme/components/Demo*.vue` | Content-specific demos (prompt, ligatures, history search) built on `TerminalDemo`. |
| `.vitepress/theme/components/Home.vue` | The homepage layout (hero, cards, "Why not Oh My Posh?", showcase, install table). |
| `index.md` | Homepage, just embeds `<Home />` under `layout: page`. |
| `docs/*.md` | Documentation pages, using VitePress's native sidebar/TOC/prev-next/search/dark-mode. |
| `public/` | Static assets served as-is (logo, favicon, OG image). |

Docs pages are plain Markdown with VitePress's built-in features: `::: tip Note` /
`::: warning Important` containers for callouts (all four container types are restyled to the
same amber look (design.md forbids a callout color rainbow), fenced code blocks with a
copy button and a header strip, and `{#custom-id}` on headings to keep anchors stable.

## Add or edit a page

1. Create `docs/<name>.md` with frontmatter (`title`, `description`) and content.
2. Add it to `sidebar['/docs/']` in `.vitepress/config.mts` so it appears in the sidebar and
   prev/next flow.

## Deploy

Pushes to `main` that touch `website/**` or `assets/**` trigger
`.github/workflows/deploy-docs.yml`, which installs with `npm ci`, builds with
`npm run build`, and publishes `.vitepress/dist` to GitHub Pages.
