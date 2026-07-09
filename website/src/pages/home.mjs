import {
  callout,
  demoPrompt,
  demoLigatures,
  demoHistory,
  table,
  btn,
} from "../lib/components.mjs";
import { links } from "../lib/nav.mjs";

const hero = `
<section class="hero">
  <div class="wrap">
    <div class="hero__grid animate-in">
      <div class="hero__text">
        <p class="hero__label">PowerShell 7 · Windows Terminal</p>
        <h1>A better PowerShell prompt, one installer away.</h1>
        <p class="lead">A fast, good-looking terminal — a clean git-aware prompt, history search that
          recalls past commands as you type, and ligatures with Nerd Font icons — all from one installer
          with the font already inside it.</p>
        <div class="hero__cta">
          ${btn({ label: "Download installer", href: links.releases, variant: "primary", external: true })}
          ${btn({ label: "Set up manually →", route: "docs/manual-setup", variant: "secondary" })}
        </div>
        <p class="hero__req">Requires PowerShell 7 — <a href="${links.powershell}" target="_blank" rel="noopener">get it from Microsoft <span class="ext" aria-hidden="true">↗</span></a></p>
      </div>
      <div class="hero__demo">${demoPrompt()}</div>
    </div>
  </div>
</section>`;

const paths = `
<section class="section">
  <div class="wrap">
    <div class="cards">
      <div class="card">
        <h3>Installer</h3>
        <p>Everything in one run — the Nerd Font is included, so there are no extra downloads.
          Installs per-user, no admin needed.</p>
        ${btn({ label: "Download installer", href: links.releases, variant: "primary", external: true })}
      </div>
      <div class="card">
        <h3>Manual setup</h3>
        <p>Full control over every step. Follow the guide to install the font, add the profile,
          and patch Windows Terminal by hand.</p>
        ${btn({ label: "Open the guide", route: "docs/manual-setup", variant: "secondary" })}
      </div>
    </div>
  </div>
</section>`;

const whyNotOmp = `
<section class="section">
  <div class="wrap">
    <div class="section__head">
      <h2>Why not Oh My Posh?</h2>
      <p class="muted">Same clean, git-aware prompt — without the per-render cost.</p>
    </div>
    <div class="why">
      <p><a href="https://ohmyposh.dev" target="_blank" rel="noopener">Oh My Posh <span class="ext" aria-hidden="true">↗</span></a>
        is a powerful, full-featured prompt engine. But it's a <strong>separate program your shell runs on
        every prompt</strong>, and that call isn't free — it shows up as a small pause before you can type,
        and it gets worse in large repositories or over SSH.</p>
      <p>This setup keeps the good part and drops the overhead. The prompt is a tiny native PowerShell
        function that reads your git branch straight from <code>.git/HEAD</code> on disk — it never spawns
        a process, so it renders <strong>instantly</strong>, even in huge repos, with no extra binary to
        install or keep updated. Together with lazy-loaded conda and telemetry off, cold startup drops from
        about <strong>2.3&nbsp;s to 0.3&nbsp;s</strong>.</p>
    </div>
  </div>
</section>`;

const whatYouGet = `
<section class="section section--tint">
  <div class="wrap">
    <div class="section__head">
      <h2>What you get</h2>
      <p class="muted">Switch tabs in each demo to see the before-and-after difference.</p>
    </div>
    <div class="showcase">
      ${demoLigatures({ caption: "Ligatures and Nerd Font icons that render." })}
      ${demoHistory()}
    </div>
  </div>
</section>`;

const whatItInstalls = `
<section class="section" style="padding-top: 64px">
  <div class="wrap">
    <div class="section__head">
      <h2>What it installs</h2>
      <p class="muted">Every change is per-user and backed up before it's written.</p>
    </div>
    ${table(
      ["Component", "What it does"],
      [
        [
          "Telemetry opt-out",
          "Turns off PowerShell telemetry and the startup update-check banner (User scope).",
        ],
        [
          "LigaConsolas Nerd Font",
          "Programming ligatures and Nerd Font icons. Bundled in the installer.",
        ],
        [
          "PowerShell profile",
          "Installed to <code>$PROFILE.CurrentUserAllHosts</code>; merged idempotently, backed up first.",
        ],
        [
          "Conda lazy-init",
          "Loads conda on first use instead of every launch, for fast startup.",
        ],
        [
          "Minimal git prompt",
          "Path, conda env, and branch read straight from <code>.git/HEAD</code> — no <code>git.exe</code>.",
        ],
        [
          "PSReadLine config",
          "Syntax highlighting, history predictions, prefix search, and word navigation.",
        ],
        [
          "Windows Terminal patch",
          "Sets the font on <code>profiles.defaults</code> and frees <code>Ctrl+←/→</code>.",
        ],
      ],
    )}
    <p class="muted" style="margin-top:24px">Prefer to do it by hand? The
      <a href="{{base}}docs/manual-setup/">manual setup guide</a> covers every step, including the font download.</p>
  </div>
</section>`;

export default {
  route: "",
  section: "page",
  title: "pwsh-terminal-setup — a better PowerShell prompt, one installer away",
  description:
    "A fast, good-looking PowerShell 7 + Windows Terminal setup. One installer with the Nerd Font bundled, or a step-by-step manual guide.",
  body: hero + paths + whyNotOmp + whatYouGet + whatItInstalls,
};
