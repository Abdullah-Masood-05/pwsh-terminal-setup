import { h2, cmd, callout, table } from '../../lib/components.mjs'

const openProfile = 'code $PROFILE.CurrentUserAllHosts     # or: notepad $PROFILE.CurrentUserAllHosts'

const promptEdit = `# In the  #region prompt  block, change the prompt glyph:
$sym = [char]0x276F      # default ❯  →  set your own, e.g.
$sym = '➜'`

const colorsEdit = `Set-PSReadLineOption -Colors @{
    Command   = '#7aa2f7'   # override only the tokens you want
    String    = '#9ece6a'
    Comment   = '#565f89'
}`

const swatch = (hex) => `<span class="swatch" style="background:${hex}"></span><code>${hex}</code>`

const body = `
<h1>Profile &amp; theming</h1>
<p class="lead">The whole configuration is one readable file. Change it from the command line with
installer parameters, or edit the profile directly — it's organized so each part is easy to find.</p>

<p>Two ways to change things:</p>
<ul>
  <li><strong>From the command line</strong> — re-run with <a href="{{base}}docs/installer-options/">installer
    options</a> like <code>-PromptSymbol</code>, <code>-PredictionView</code>, <code>-FontSize</code>, or
    <code>-ColorScheme</code>. Nothing to hand-edit.</li>
  <li><strong>By editing the profile</strong> — open it and change the relevant region:</li>
</ul>
${cmd(openProfile, { prompt: true, label: 'PowerShell' })}

${h2('The four regions', 'regions')}
<p>The profile is split into <code>#region</code> blocks. The installer merges by these markers, so it
never duplicates them when you re-run.</p>
${table(
  ['Region', 'What it controls'],
  [
    ['<code>startup-env</code>', 'Telemetry and update-check opt-out for the session.'],
    ['<code>conda lazy-init</code>', 'The lazy conda placeholders and detection order.'],
    ['<code>prompt</code>', 'The prompt: path, conda env, git branch, and the prompt symbol.'],
    ['<code>PSReadLine</code>', 'Syntax colors, predictions, history search, and key bindings.'],
  ]
)}

${h2('Change the prompt symbol', 'prompt-symbol')}
<p>Pass <code>-PromptSymbol "➜"</code> to the installer, or edit the <code>prompt</code> region:</p>
${cmd(promptEdit, { label: 'profile.ps1' })}

${h2('Change the syntax colors', 'colors')}
<p>The default palette is Tokyo Night-inspired. Edit the <code>Set-PSReadLineOption -Colors</code> hashtable
in the <code>PSReadLine</code> region — override only the tokens you care about:</p>
${cmd(colorsEdit, { label: 'profile.ps1' })}
${table(
  ['Token', 'Default'],
  [
    ['Command', swatch('#7aa2f7')],
    ['Parameter', swatch('#e0af68')],
    ['Operator', swatch('#89ddff')],
    ['Variable', swatch('#bb9af7')],
    ['String', swatch('#9ece6a')],
    ['Number', swatch('#ff9e64')],
    ['Type', swatch('#2ac3de')],
    ['Comment', swatch('#565f89')],
    ['Keyword', swatch('#f7768e')],
  ]
)}

${h2('Change the prediction style', 'predictions')}
<p>Predictions show as a dropdown list by default. For a single inline suggestion, pass
<code>-PredictionView InlineView</code>, or set it in the <code>PSReadLine</code> region:</p>
${cmd('Set-PSReadLineOption -PredictionViewStyle InlineView', { label: 'profile.ps1' })}

${h2('Font size, color scheme, opacity', 'terminal-look')}
<p>These live in Windows Terminal, not the profile. Set them with installer parameters:</p>
${cmd('.\\install.ps1 -FontSize 12 -ColorScheme "One Half Dark" -Opacity 92', { prompt: true, label: 'PowerShell' })}
${callout(
  `<code>-ColorScheme</code> must name a scheme already present in your <code>settings.json</code>.
  To use your own font, pass <code>-FontFamily "Your Font Name"</code>.`,
  'Note'
)}

<p>After editing the profile directly, reload it with <code>. $PROFILE.CurrentUserAllHosts</code> or open
a new tab. For the full parameter list, see <a href="{{base}}docs/installer-options/">Installer options</a>.</p>
`

export default {
  route: 'docs/customization',
  section: 'docs',
  title: 'Profile & theming',
  description: 'Customize the prompt symbol, syntax colors, prediction style, font size, and color scheme.',
  body,
}
