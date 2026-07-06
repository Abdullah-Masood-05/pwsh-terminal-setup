import { h2, cmd, callout, shot, btn, extlink } from '../../lib/components.mjs'
import { links } from '../../lib/nav.mjs'

const body = `
<h1>Install with the installer</h1>
<p class="lead">The installer applies the whole setup in one run — per-user, no admin — and the font is
already inside it.</p>

${callout(
  `The installer bundles the required Nerd Font. You do not need to download or install any font
  separately.`,
  'Note'
)}

${h2('1. Download', 'download')}
<p>Grab the latest <code>pwsh-terminal-setup-x.y.z-Setup.exe</code> from the releases page.</p>
<p>${btn({ label: 'Download installer', href: links.releases, variant: 'primary', external: true })}</p>
<p class="subtle">Make sure PowerShell 7 is installed first — see <a href="{{base}}docs/requirements/">Requirements</a>.
The installer checks and tells you if it's missing.</p>

${h2('2. Run it', 'run')}
<p>Double-click the downloaded <code>.exe</code> and follow the prompts. It sets the telemetry opt-out,
installs the font, writes the profile, and patches Windows Terminal.</p>

${callout(
  `The installer is unsigned, so Windows SmartScreen may warn you on first launch. Click
  <strong>More info → Run anyway</strong>. See
  <a href="{{base}}docs/troubleshooting/">Troubleshooting</a> if it's blocked.`,
  'Note'
)}

${h2('3. Restart Windows Terminal', 'restart')}
<p>Close every Windows Terminal window and open a new one, then start a <strong>PowerShell</strong> tab.
The font and prompt only apply to tabs opened after the patch.</p>

${shot({ src: 'assets/screenshots/prompt.png', alt: 'The finished PowerShell prompt showing the current path and git branch after installation.', caption: 'After restarting: the configured prompt in a fresh tab.' })}

${h2('4. Verify it worked', 'verify')}
<p>Run this in the new tab — you should see branch and folder icons, joined operators, and color emoji:</p>
${cmd('Write-Host "Icons: `u{e0a0}  `u{f07b}   Ligatures: ==> -> != >= <=   Emoji: 🚀 ✅"', { prompt: true, label: 'PowerShell' })}
<p>Then press <kbd>Ctrl</kbd> + <kbd>←</kbd> / <kbd>Ctrl</kbd> + <kbd>→</kbd> to jump word-by-word.
If the icons show as boxes, the font isn't applied yet — see
<a href="{{base}}docs/troubleshooting/">Troubleshooting</a>.</p>

${h2('Want to change the defaults?', 'customize')}
<p>The underlying script takes the settings as parameters, so you can set the font size, color scheme,
prompt symbol, and more in one run without editing any file. See
<a href="{{base}}docs/installer-options/">Installer options</a>.</p>
`

export default {
  route: 'docs/install-installer',
  section: 'docs',
  title: 'Install with the installer',
  description: 'Download, run, and verify the bundled installer. The Nerd Font is included.',
  body,
}
