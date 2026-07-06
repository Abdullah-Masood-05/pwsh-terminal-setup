import { h2, cmd, callout, shot, extlink } from '../../lib/components.mjs'
import { links } from '../../lib/nav.mjs'

// --- command strings kept as top-level constants so backslashes/backticks in
//     the source are never re-interpreted by an enclosing template literal ---

const psInstall = 'winget install --id Microsoft.PowerShell -e'

const fontDownload = `$dir  = "$env:USERPROFILE\\Downloads\\LigaConsolas-NF"
$base = "https://github.com/Dosx001/ttf-ligaconsolas-nerd-font/raw/main"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
"Regular","Bold","Italic","Bold-Italic" | ForEach-Object {
    Invoke-WebRequest "$base/LigaConsolas-NF-$_.ttf" -OutFile "$dir\\LigaConsolas-NF-$_.ttf"
}
Start-Process $dir      # opens the folder so you can install the fonts`

const wtFont = `"profiles": {
  "defaults": {
    "font": {
      "face": "LigaConsolas Nerd Font",
      "features": { "liga": 1, "calt": 1 }
    }
  }
}`

const wtKeys = `"keybindings": [
  { "id": null, "keys": "ctrl+left" },
  { "id": null, "keys": "ctrl+right" },
  { "id": null, "keys": "ctrl+shift+left" },
  { "id": null, "keys": "ctrl+shift+right" }
]`

const profileInstall = `$p   = $PROFILE.CurrentUserAllHosts
$src = "https://raw.githubusercontent.com/Abdullah-Masood-05/pwsh-terminal-setup/main/profile.ps1"
New-Item -ItemType Directory -Force -Path (Split-Path $p) | Out-Null
if (Test-Path $p) { Copy-Item $p "$p.bak" -Force }   # back up your current profile first
Invoke-WebRequest $src -OutFile $p
. $p                                                 # load it into the current session`

const verifyCmd =
  'Write-Host "Icons: `u{e0a0}  `u{f07b}   Ligatures: ==> -> != >= <=   Emoji: 🚀 ✅"'

const body = `
<h1>Manual setup</h1>
<p class="lead">The same result as the installer, one step at a time. Every step is a copy-able command,
and screenshots follow the command that produces them so you can compare.</p>

${callout(
  `Prefer one step? The <a href="{{base}}docs/install-installer/">installer</a> does everything on this
  page in a single run, and the Nerd Font is bundled inside it.`,
  'Note'
)}

${h2('Install PowerShell 7', 'powershell')}
<p>The profile targets PowerShell 7 (<code>pwsh</code>), which installs alongside the built-in Windows
PowerShell 5.1. Install it with winget, or ${extlink('download it from Microsoft', links.powershell)}.</p>
${cmd(psInstall, { prompt: true, label: 'PowerShell' })}
<p>Reopen your terminal and confirm the version:</p>
${cmd('pwsh --version', { prompt: true, label: 'PowerShell' })}

${h2('Install the Nerd Font', 'font')}
<p>The setup uses <strong>LigaConsolas Nerd Font</strong> — a Consolas-style face that has programming
ligatures <em>and</em> Nerd Font glyphs. Download its four styles (Regular, Bold, Italic, Bold Italic)
from the ${extlink('font repository', links.nerdFont)}. This command fetches all four into your
Downloads folder and opens it:</p>
${cmd(fontDownload, { prompt: true, label: 'PowerShell' })}

<p>In the folder that opens, select all four <code>.ttf</code> files, right-click, and choose
<strong>Install</strong> (or <em>Install for all users</em>). Then set the face in Windows Terminal —
merge this into <code>profiles → defaults</code> in <code>settings.json</code>:</p>
${cmd(wtFont, { label: 'settings.json (fragment)' })}

${shot({ src: 'assets/screenshots/ligatures-icons.png', alt: 'A terminal line showing ligature operators joined together and Nerd Font branch and folder glyphs rendering correctly.', caption: 'With the font applied: joined operators and Nerd Font icons render.' })}

${callout(
  `Using the installer instead? Skip this step — the font is bundled and installed for you.`,
  'Tip'
)}

${h2('Install the profile', 'profile')}
<p>The whole configuration is a single file, <a href="${links.profileSrc}" target="_blank" rel="noopener">profile.ps1</a>,
which goes to <code>$PROFILE.CurrentUserAllHosts</code> so it loads in every PowerShell 7 host. This
backs up any existing profile first, then installs and loads ours:</p>
${cmd(profileInstall, { prompt: true, label: 'PowerShell' })}

${callout(
  `This <strong>replaces</strong> your current profile (after backing it up to
  <code>&lt;profile&gt;.bak</code>). Already have a profile you want to keep? Append the downloaded
  file's contents instead, or use the <a href="{{base}}docs/install-installer/">installer</a>, which
  merges by <code>#region</code> so it never duplicates.`,
  'Important'
)}

${shot({ src: 'assets/screenshots/prompt.png', alt: 'The configured two-line prompt showing the current path on the first line and a magenta prompt symbol on the second.', caption: 'After loading the profile: the minimal git-aware prompt.' })}

${h2('Windows Terminal settings', 'terminal')}
<p>Two changes finish the setup. Open <code>settings.json</code> from Windows Terminal
(<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>,</kbd>) — it lives at
<code>%LOCALAPPDATA%\\Packages\\Microsoft.WindowsTerminal_8wekyb3d8bbwe\\LocalState\\settings.json</code>.</p>

<p><strong>1. Apply the font</strong> to every profile via <code>defaults</code> (the same fragment as above):</p>
${cmd(wtFont, { label: 'settings.json (fragment)' })}

<p><strong>2. Free <code>Ctrl+←/→</code></strong> so the keystrokes reach the shell for word navigation.
Add these to the top-level <code>keybindings</code> array:</p>
${cmd(wtKeys, { label: 'settings.json (fragment)' })}

${callout(
  `Use the <code>"id": null</code> schema shown here, <strong>not</strong>
  <code>{ "command": "unbound" }</code> — the older form makes Windows Terminal rewrite
  <code>settings.json</code> on every launch. The full reference fragment is in
  <a href="${links.settingsSrc}" target="_blank" rel="noopener">settings.partial.jsonc</a>.`,
  'Note'
)}

${h2('Verify it worked', 'verify')}
<p>Restart Windows Terminal, open a new PowerShell tab, and run:</p>
${cmd(verifyCmd, { prompt: true, label: 'PowerShell' })}
<p>You should see branch and folder icons, joined operators, and color emoji. Then press
<kbd>Ctrl</kbd> + <kbd>←</kbd> / <kbd>Ctrl</kbd> + <kbd>→</kbd> to jump word-by-word. If glyphs show as
boxes, the font isn't applied — see <a href="{{base}}docs/troubleshooting/">Troubleshooting</a>.</p>
`

export default {
  route: 'docs/manual-setup',
  section: 'docs',
  title: 'Manual setup',
  description:
    'Set it up by hand: install PowerShell 7, download and install the Nerd Font, add the profile, and patch Windows Terminal.',
  body,
}
