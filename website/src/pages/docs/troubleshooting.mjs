import { cmd, callout, extlink } from '../../lib/components.mjs'

// Each entry: the exact error as an H3 in mono, cause in a sentence, fix as a
// command block (design C2).
const setPolicy = 'Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned'
const runBypass = 'pwsh -ExecutionPolicy Bypass -File .\\install.ps1'
const reload = '. $PROFILE.CurrentUserAllHosts'
const checkFont = 'Write-Host "`u{e0a0}  `u{f07b}"     # should be a branch and a folder icon'
const listProfile = 'Get-Content $PROFILE.CurrentUserAllHosts | Select-Object -First 5'

const body = `
<h1>Troubleshooting</h1>
<p class="lead">The common snags, each with the exact message you'll see and the command that fixes it.</p>

<h2 id="execution-policy">Execution policy</h2>
<h3 id="policy-error"><code>...cannot be loaded because running scripts is disabled on this system</code></h3>
<p class="steps-note">Cause: your execution policy blocks local scripts.</p>
<p>Either allow local scripts for your user:</p>
${cmd(setPolicy, { prompt: true, label: 'PowerShell' })}
<p>…or run the installer once with a per-process bypass (nothing persists):</p>
${cmd(runBypass, { prompt: true, label: 'PowerShell' })}

<h2 id="glyphs">Glyphs and the font</h2>
<h3 id="boxes">Icons show as boxes <code>□</code> or question marks</h3>
<p class="steps-note">Cause: the Nerd Font isn't applied to the current Windows Terminal profile.</p>
<p>Close <em>every</em> Windows Terminal window and open a new one — the font only applies to tabs opened
after the patch. Then confirm the glyphs render:</p>
${cmd(checkFont, { prompt: true, label: 'PowerShell' })}
${callout(
  `Still boxes? Open Windows Terminal settings and check that <code>profiles → defaults → font → face</code>
  is <code>LigaConsolas Nerd Font</code>. Re-run the installer, or set it by hand from
  <a href="{{base}}docs/manual-setup/#terminal">step 4</a>.`,
  'Note'
)}

<h3 id="ligatures-off">Ligatures don't join (<code>==&gt;</code> stays as three characters)</h3>
<p class="steps-note">Cause: the font features aren't enabled on the profile.</p>
<p>Make sure the font block includes <code>"features": { "liga": 1, "calt": 1 }</code>, then reopen the tab.
The installer writes this for you; the fragment is on the
<a href="{{base}}docs/manual-setup/#terminal">manual setup</a> page.</p>

<h2 id="profile">Profile</h2>
<h3 id="not-loading">The prompt is plain after installing</h3>
<p class="steps-note">Cause: the new tab loaded before the profile was installed, or the profile didn't load.</p>
<p>Open a fresh tab, or reload it in the current one:</p>
${cmd(reload, { prompt: true, label: 'PowerShell' })}
<p>Confirm the profile is actually there:</p>
${cmd(listProfile, { prompt: true, label: 'PowerShell' })}

<h3 id="word-nav">Ctrl+← / Ctrl+→ move by character, not word</h3>
<p class="steps-note">Cause: Windows Terminal is still capturing the keys before the shell sees them.</p>
<p>Word navigation needs both layers — the profile binds the keys, and Windows Terminal must release them.
Add the unbinds from <a href="{{base}}docs/manual-setup/#terminal">step 4</a> and reopen the tab.</p>

<h2 id="smartscreen">Installer</h2>
<h3 id="smartscreen-block"><code>Windows protected your PC</code> (SmartScreen)</h3>
<p class="steps-note">Cause: the installer is unsigned, so SmartScreen warns on first launch.</p>
<p>Click <strong>More info</strong>, then <strong>Run anyway</strong>. If you'd rather not run the
<code>.exe</code>, use the <a href="{{base}}docs/manual-setup/">manual setup</a> or run
<code>install.ps1</code> from a clone instead.</p>

<h3 id="pwsh-missing"><code>PowerShell 7 was not found</code></h3>
<p class="steps-note">Cause: PowerShell 7 isn't installed — the setup targets it, not Windows PowerShell 5.1.</p>
<p>The script detects this itself and offers to install it via winget — answer <strong>y</strong> at the
prompt (or pass <code>-Yes</code> to skip the prompt). It then switches to PowerShell 7 automatically and
continues the rest of the setup. To install it yourself instead:</p>
${cmd('winget install --id Microsoft.PowerShell -e', { prompt: true, label: 'PowerShell' })}
<p>If winget installed it but the script still doesn't see it, reopen your terminal and re-run
<code>install.ps1</code> — a brand-new PATH entry doesn't reach a process that was already running.</p>

<h3 id="winget-missing"><code>winget isn't available either</code></h3>
<p class="steps-note">Cause: winget (App Installer) itself isn't present, so the setup can't install
anything automatically.</p>
<p>Install ${extlink('App Installer', 'https://apps.microsoft.com/detail/9nblggh4nns1')} from the
Microsoft Store, or install PowerShell 7 / Windows Terminal manually from
<a href="{{base}}docs/requirements/">Requirements</a>, then re-run <code>install.ps1</code>.</p>

<p>Something else? Check the <a href="{{base}}docs/faq/">FAQ</a> or open an issue on
<a href="https://github.com/Abdullah-Masood-05/pwsh-terminal-setup/issues" target="_blank" rel="noopener">GitHub ↗</a>.</p>
`

export default {
  route: 'docs/troubleshooting',
  section: 'docs',
  title: 'Troubleshooting',
  description: 'Fixes for execution-policy errors, glyphs showing as boxes, the profile not loading, and SmartScreen.',
  body,
}
