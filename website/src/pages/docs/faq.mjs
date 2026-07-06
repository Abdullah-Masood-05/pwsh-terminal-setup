import { h2, cmd, callout } from '../../lib/components.mjs'

const uninstall = `Copy-Item "$($PROFILE.CurrentUserAllHosts).bak" $PROFILE.CurrentUserAllHosts -Force
# then restore settings.json from its .bak next to the original, and restart Windows Terminal`

const body = `
<h1>FAQ</h1>
<p class="lead">Short answers to the questions that come up most.</p>

${h2('Installing', 'installing')}

<h3>Do I need administrator rights?</h3>
<p>No. Everything is per-user — the font installs to your user font folder (registered in HKCU), and the
profile and Windows Terminal settings live in your own user profile. No elevation, no system changes.</p>

<h3>Does it work with Windows PowerShell 5.1?</h3>
<p>It targets PowerShell 7 (<code>pwsh</code>), which installs side-by-side with the built-in 5.1 and
doesn't replace it. You can start the setup from 5.1 — if PowerShell 7 isn't installed yet, the script
offers to install it via winget and then switches to it automatically to finish the rest of the setup.</p>

<h3>What if I don't have PowerShell 7 or Windows Terminal installed?</h3>
<p>The setup checks for both and offers to install whichever is missing via winget instead of stopping —
answer <strong>y</strong> when asked, or pass <code>-Yes</code> to skip the prompts entirely. See
<a href="{{base}}docs/requirements/">Requirements</a> for why each one is needed, and
<a href="{{base}}docs/troubleshooting/#winget-missing">Troubleshooting</a> if winget itself isn't available.</p>

<h3>Can I install without an internet connection?</h3>
<p>Yes. The <code>.exe</code> installer bundles the font, so it works offline as-is. For the script, download
the four <code>.ttf</code> files on another machine and pass <code>-FontDir</code> — see
<a href="{{base}}docs/installer-options/#offline">Offline install</a>.</p>

${h2('Fonts and appearance', 'fonts')}

<h3>Is the font really bundled in the installer?</h3>
<p>Yes. The installer includes all four LigaConsolas Nerd Font styles and installs them for you — you do
not need to download or install any font separately when you use it.</p>

<h3>Can I use a different font?</h3>
<p>Yes. Pass <code>-FontFamily "Your Font Name"</code> (the font must already be installed), or set the
face directly in <code>settings.json</code>. For icons to render, use a Nerd Font.</p>

<h3>Why LigaConsolas Nerd Font?</h3>
<p>It's one of the few faces that has <strong>both</strong> programming ligatures and Nerd Font glyphs, so
you get joined operators and branch/folder icons from a single font.</p>

${h2('Safety and uninstall', 'safety')}

<h3>Will it overwrite my existing profile?</h3>
<p>No. It backs up your current profile to <code>&lt;profile&gt;.bak</code> and merges its own settings by
<code>#region</code> markers, so anything else in your profile is left alone.</p>

<h3>Is it safe to re-run?</h3>
<p>Yes — it's idempotent. Re-running updates the managed regions in place instead of duplicating them, and
backs up each file it touches first.</p>

<h3>How do I uninstall or revert?</h3>
<p>Nothing is deleted, so restoring the backups reverts everything:</p>
${cmd(uninstall, { prompt: true, label: 'PowerShell' })}

<h3>Does it slow down shell startup?</h3>
<p>The opposite. conda loads only on first use instead of on every launch, taking cold startup from around
2.3&nbsp;s to about 0.3&nbsp;s.</p>

${callout(
  `Have a question that isn't here? Open an issue on
  <a href="https://github.com/Abdullah-Masood-05/pwsh-terminal-setup/issues" target="_blank" rel="noopener">GitHub ↗</a>.`,
  'Note'
)}
`

export default {
  route: 'docs/faq',
  section: 'docs',
  title: 'FAQ',
  description: 'Admin rights, PowerShell 5.1, offline install, the bundled font, custom fonts, and uninstalling.',
  body,
}
