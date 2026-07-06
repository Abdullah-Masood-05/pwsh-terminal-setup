import { h2, cmd, callout, table } from '../../lib/components.mjs'

const exBasic = 'pwsh -ExecutionPolicy Bypass -File .\\install.ps1'
const exCustom =
  '.\\install.ps1 -FontSize 12 -ColorScheme "One Half Dark" -PromptSymbol "➜" -PredictionView InlineView'
const exMinimal = '.\\install.ps1 -SkipConda -SkipFont'
const exOffline = '.\\install.ps1 -FontDir "C:\\fonts\\LigaConsolas-NF"'
const exUnattended = '.\\install.ps1 -Yes'
const exHelp = 'Get-Help .\\install.ps1 -Detailed'

const body = `
<h1>Installer options</h1>
<p class="lead">You don't have to hand-edit any file. <code>install.ps1</code> takes the common settings
as parameters and applies them in one run — font, colors, prompt, and prediction style included.</p>

<p>These are parameters to the setup <strong>script</strong>. Clone the repo (or use the copy the
<code>.exe</code> installs) and run:</p>
${cmd(exBasic, { prompt: true, label: 'PowerShell' })}

${h2('Customize in one run', 'customize')}
<p>Combine any of the parameters below. For example, set a 12&nbsp;pt font, a built-in color scheme, an
arrow prompt, and inline predictions:</p>
${cmd(exCustom, { prompt: true, label: 'PowerShell' })}
<p>Or install just the prompt and editing config — no conda block, no font:</p>
${cmd(exMinimal, { prompt: true, label: 'PowerShell' })}

${h2('All parameters', 'parameters')}
${table(
  ['Parameter', 'Type', 'What it changes'],
  [
    ['<code>-FontSize &lt;n&gt;</code>', 'number', 'Font size (points) on Windows Terminal <code>profiles.defaults</code>.'],
    ['<code>-ColorScheme &lt;name&gt;</code>', 'string', 'Color scheme on <code>profiles.defaults</code>. Must already exist in <code>settings.json</code>.'],
    ['<code>-Opacity &lt;0-100&gt;</code>', 'number', 'Background opacity. Below 100 also enables acrylic.'],
    ['<code>-PromptSymbol &lt;char&gt;</code>', 'string', 'The prompt glyph in the profile. Default is <code>❯</code>.'],
    ['<code>-PredictionView</code>', 'ListView&nbsp;/&nbsp;InlineView', 'PSReadLine prediction display. Default <code>ListView</code>.'],
    ['<code>-FontFamily &lt;name&gt;</code>', 'string', 'Override the font family written to Windows Terminal.'],
    ['<code>-FontDir &lt;path&gt;</code>', 'string', 'Install fonts from pre-downloaded <code>.ttf</code> files instead of downloading (offline).'],
    ['<code>-SkipFont</code>', 'switch', 'Do not download or install the font.'],
    ['<code>-SkipTerminal</code>', 'switch', 'Do not patch Windows Terminal <code>settings.json</code>.'],
    ['<code>-SkipProfile</code>', 'switch', 'Do not install the PowerShell profile.'],
    ['<code>-SkipConda</code>', 'switch', 'Omit the conda lazy-init block from the profile.'],
    ['<code>-Yes</code>', 'switch', 'Don’t prompt before installing a missing prerequisite via winget.'],
  ]
)}

${callout(
  `<code>-ColorScheme</code> only selects a scheme that already exists in your <code>settings.json</code>
  (for example the built-in <code>One Half Dark</code> or <code>Tokyo Night</code>). It does not create
  new schemes.`,
  'Note'
)}

${h2('Unattended runs', 'unattended')}
<p>If PowerShell 7 or Windows Terminal are missing, the script normally stops to ask before installing
them via winget. Pass <code>-Yes</code> to auto-confirm any of those prompts — useful for scripted or
unattended runs:</p>
${cmd(exUnattended, { prompt: true, label: 'PowerShell' })}
<p>Everything else about the run is unaffected — <code>-Yes</code> only answers the prerequisite
prompts, not anything else.</p>

${h2('Offline install', 'offline')}
<p>On a machine with no internet, download the four <code>.ttf</code> files elsewhere (see
<a href="{{base}}docs/manual-setup/#font">Install the Nerd Font</a>), copy them onto the machine, and
point the installer at them:</p>
${cmd(exOffline, { prompt: true, label: 'PowerShell' })}

${h2('See the built-in help', 'help')}
<p>Every parameter is documented in the script's comment-based help:</p>
${cmd(exHelp, { prompt: true, label: 'PowerShell' })}

<p>All changes are idempotent — re-running with different parameters just updates the result, and each
touched file is backed up to <code>&lt;file&gt;.bak</code> first.</p>
`

export default {
  route: 'docs/installer-options',
  section: 'docs',
  title: 'Installer options',
  description:
    'Every install.ps1 parameter: font size, color scheme, opacity, prompt symbol, prediction view, the skip switches, and -Yes for unattended prerequisite installs.',
  body,
}
