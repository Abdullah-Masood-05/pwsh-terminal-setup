# Documentation website

The download + documentation site for **pwsh-terminal-setup**, built with a small
zero-dependency static generator (plain Node, no framework, no `npm install`).

Live site: <https://abdullah-masood-05.github.io/pwsh-terminal-setup/>

## Develop

```powershell
cd website
node build.mjs      # render src/ -> dist/
node serve.mjs      # preview dist/ at http://localhost:8080
# or in one step:
npm run dev
```

There's nothing to install — the scripts use only the Node standard library.

## How it works

| Path | What it is |
|------|-----------|
| `build.mjs` | Renders every page into `dist/<route>/index.html`. |
| `serve.mjs` | Tiny static server for local preview (resolves pretty URLs). |
| `src/site.mjs` | The page manifest — imports each page module. |
| `src/pages/**` | One module per page; each exports `{ route, section, title, description, body }`. |
| `src/lib/components.mjs` | HTML builders: `cmd`, `callout`, `shot`, `table`, `btn`, `h2`, … |
| `src/lib/layout.mjs` | The page shells (base + docs chrome: sidebar, TOC, prev/next). |
| `src/lib/nav.mjs` | Single source of truth for the top nav and docs sidebar. |
| `src/styles.css` | The design system (see `../../design.md`). |
| `src/main.js` | Progressive enhancement: copy buttons, the before/after toggle, mobile nav, scroll-spy. |

Internal links and asset references use a `{{base}}` token that the build resolves to a
per-page relative prefix, so the site works both at the GitHub Pages project subpath and
from the local file system.

Screenshots and the logo are pulled from the repo's top-level `assets/` folder at build
time, so there's only one copy to maintain.

## Add or edit a page

1. Create `src/pages/<name>.mjs` (or under `src/pages/docs/`) exporting a page descriptor.
2. Register it in `src/site.mjs`.
3. For docs pages, add it to `docsNav` in `src/lib/nav.mjs` so it appears in the sidebar
   and prev/next flow.

## Deploy

Pushes to `main` that touch `website/**` or `assets/**` trigger
`.github/workflows/deploy-docs.yml`, which builds the site and publishes `dist/` to GitHub
Pages. Enable it once under **Settings → Pages → Source → GitHub Actions**.
