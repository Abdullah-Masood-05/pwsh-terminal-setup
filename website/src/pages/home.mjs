import { cmd, callout, shot, table, btn } from '../lib/components.mjs'
import { links } from '../lib/nav.mjs'

// Small inline git-branch mark — Nerd Font glyphs won't render in web fonts,
// so the prompt demo uses an SVG that always shows crisply.
const branch = `<svg class="branch-ico" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="4.5" cy="3.5" r="1.5"/><circle cx="4.5" cy="12.5" r="1.5"/><circle cx="11.5" cy="4.5" r="1.5"/><path d="M4.5 5v6"/><path d="M11.5 6c0 3.2-3 3.2-5 4.2"/></svg>`

const demo = `
<div class="demo" data-demo>
  <div class="demo__bar">
    <span class="demo__dots" aria-hidden="true"><i></i><i></i><i></i></span>
    <span class="demo__file">PowerShell 7</span>
  </div>
  <div class="demo__tabs" role="tablist" aria-label="Prompt comparison">
    <button class="demo__tab" role="tab" data-target="before" aria-selected="false">Default</button>
    <button class="demo__tab" role="tab" data-target="after" aria-selected="true">After setup</button>
  </div>
  <div class="demo__screen">
    <div class="demo__panel" data-panel="before" role="tabpanel" hidden>
      <div class="demo__row"><span class="tok-param">Windows PowerShell</span></div>
      <div class="demo__row"><span class="tok-param">PS C:\\Users\\you\\Desktop\\project&gt;</span> <span class="demo__cursor"></span></div>
    </div>
    <div class="demo__panel" data-panel="after" role="tabpanel">
      <div class="demo__row"><span class="tok-path">~\\Desktop\\project</span>  <span class="tok-branch">${branch} main</span></div>
      <div class="demo__row"><span class="tok-sym">&#10095;</span> <span class="tok-cmd">git</span> <span class="tok-plain">status</span> <span class="demo__cursor"></span></div>
    </div>
  </div>
</div>`

const hero = `
<section class="hero">
  <div class="wrap">
    <div class="hero__grid animate-in">
      <div class="hero__text">
        <p class="hero__label">PowerShell 7 · Windows Terminal</p>
        <h1>A better PowerShell prompt, one installer away.</h1>
        <p class="lead">A fast, good-looking terminal — ligatures and icons, a clean git-aware prompt,
          and syntax highlighting — set up from a single installer with the font already inside it.</p>
        <div class="hero__cta">
          ${btn({ label: 'Download installer', href: links.releases, variant: 'primary', external: true })}
          ${btn({ label: 'Set up manually →', route: 'docs/manual-setup', variant: 'secondary' })}
        </div>
        <p class="hero__req">Requires PowerShell 7 — <a href="${links.powershell}" target="_blank" rel="noopener">get it from Microsoft <span class="ext" aria-hidden="true">↗</span></a></p>
      </div>
      <div class="hero__demo">${demo}</div>
    </div>
  </div>
</section>`

const paths = `
<section class="section">
  <div class="wrap">
    <div class="cards">
      <div class="card">
        <h3>Installer</h3>
        <p>Everything in one run — the Nerd Font is included, so there are no extra downloads.
          Installs per-user, no admin needed.</p>
        ${btn({ label: 'Download installer', href: links.releases, variant: 'primary', external: true })}
      </div>
      <div class="card">
        <h3>Manual setup</h3>
        <p>Full control over every step. Follow the guide to install the font, add the profile,
          and patch Windows Terminal by hand.</p>
        ${btn({ label: 'Open the guide', route: 'docs/manual-setup', variant: 'secondary' })}
      </div>
    </div>
  </div>
</section>`

const whatYouGet = `
<section class="section section--tint">
  <div class="wrap">
    <div class="section__head">
      <h2>What you get</h2>
      <p class="muted">A terminal that reads clearly and stays out of your way. Click any shot to enlarge.</p>
    </div>
    <div class="showcase">
      ${shot({ src: 'assets/screenshots/prompt.png', alt: 'A two-line PowerShell prompt showing the current path and a git branch name.', caption: 'Minimal prompt with the current path and git branch.' })}
      ${shot({ src: 'assets/screenshots/syntax-highlighting.png', alt: 'A PowerShell command line with commands, parameters, strings, and numbers in distinct colors.', caption: 'Syntax highlighting as you type.' })}
      ${shot({ src: 'assets/screenshots/ligatures-icons.png', alt: 'A terminal line showing joined ligature operators and Nerd Font branch and folder glyphs.', caption: 'Ligatures and Nerd Font icons that render.' })}
    </div>
  </div>
</section>`

const whatItInstalls = `
<section class="section">
  <div class="wrap">
    <div class="section__head">
      <h2>What it installs</h2>
      <p class="muted">Every change is per-user and backed up before it's written.</p>
    </div>
    ${table(
      ['Component', 'What it does'],
      [
        ['Telemetry opt-out', 'Turns off PowerShell telemetry and the startup update-check banner (User scope).'],
        ['LigaConsolas Nerd Font', 'Programming ligatures and Nerd Font icons. Bundled in the installer.'],
        ['PowerShell profile', 'Installed to <code>$PROFILE.CurrentUserAllHosts</code>; merged idempotently, backed up first.'],
        ['Conda lazy-init', 'Loads conda on first use instead of every launch, for fast startup.'],
        ['Minimal git prompt', 'Path, conda env, and branch read straight from <code>.git/HEAD</code> — no <code>git.exe</code>.'],
        ['PSReadLine config', 'Syntax highlighting, history predictions, prefix search, and word navigation.'],
        ['Windows Terminal patch', 'Sets the font on <code>profiles.defaults</code> and frees <code>Ctrl+←/→</code>.'],
      ]
    )}
    <p class="muted" style="margin-top:24px">Prefer to do it by hand? The
      <a href="{{base}}docs/manual-setup/">manual setup guide</a> covers every step, including the font download.</p>
  </div>
</section>`

export default {
  route: '',
  section: 'page',
  title: 'pwsh-terminal-setup — a better PowerShell prompt, one installer away',
  description:
    'A fast, good-looking PowerShell 7 + Windows Terminal setup. One installer with the Nerd Font bundled, or a step-by-step manual guide.',
  body: hero + paths + whatYouGet + whatItInstalls,
}
