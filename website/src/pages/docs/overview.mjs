import {
  h2,
  cmd,
  callout,
  demoPrompt,
  table,
  extlink,
} from "../../lib/components.mjs";
import { links } from "../../lib/nav.mjs";

const body = `
<h1>Overview</h1>
<p class="lead">pwsh-terminal-setup turns a stock PowerShell 7 window into a fast, readable terminal —
a git-aware prompt, ligatures and Nerd Font icons, and full syntax highlighting — from one command.</p>

<p>It cuts shell startup from seconds to milliseconds by loading conda only when you first use it,
installs a font that has <strong>both</strong> programming ligatures and Nerd Font glyphs, adds a
minimal zsh-like prompt, and configures PSReadLine for highlighting, smart history, and proper word
navigation. Every file it touches is backed up first, and re-running is safe.</p>

${demoPrompt({ caption: "The installed prompt: current path plus the active git branch." })}

${h2("Two ways to install")}
<p>Pick whichever fits how you work — both end at the same setup.</p>
<ul>
  <li><strong><a href="{{base}}docs/install-installer/">Installer</a></strong> — one run, no admin, and the
    Nerd Font is bundled inside it, so nothing else has to be downloaded.</li>
  <li><strong><a href="{{base}}docs/manual-setup/">Manual setup</a></strong> — the same result, one step at a
    time, including how to download and install the font yourself.</li>
</ul>

${callout(
  `The installer includes the required Nerd Font. You do not need to download or install any font
  separately when you use it.`,
  "Note",
)}

${h2("What it changes")}
${table(
  ["Component", "What it does"],
  [
    [
      "Telemetry opt-out",
      "Sets <code>POWERSHELL_TELEMETRY_OPTOUT</code> and <code>POWERSHELL_UPDATECHECK</code> at User scope.",
    ],
    [
      "Nerd Font",
      "Installs LigaConsolas Nerd Font per-user (registered in HKCU) — ligatures and icons.",
    ],
    [
      "Profile",
      "Writes <code>$PROFILE.CurrentUserAllHosts</code>: prompt, lazy conda, and PSReadLine config.",
    ],
    [
      "Windows Terminal",
      "Sets the font on <code>profiles.defaults</code> and frees <code>Ctrl+←/→</code> for word jumps.",
    ],
  ],
)}
<p>See <a href="{{base}}docs/commands/">Commands &amp; functions</a> for everything the profile adds, and
<a href="{{base}}docs/customization/">Profile &amp; theming</a> to change the colors, prompt symbol, or fonts.</p>

${h2("Before you begin")}
<p>You need PowerShell 7 and Windows Terminal on Windows 10 or 11. The
<a href="{{base}}docs/requirements/">Requirements</a> page has the exact links and version checks —
including where to ${extlink("download PowerShell 7", links.powershell)}.</p>
`;

export default {
  route: "docs/overview",
  section: "docs",
  title: "Overview",
  description:
    "What pwsh-terminal-setup installs and the two ways to set it up.",
  body,
};
