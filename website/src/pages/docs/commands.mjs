import { h2, cmd, table, callout } from '../../lib/components.mjs'

const body = `
<h1>Commands &amp; functions</h1>
<p class="lead">What the profile adds to your session — a handful of functions and a set of PSReadLine key
bindings. Nothing here needs a module install.</p>

${h2('Functions', 'functions')}
<p>The prompt and the lazy conda loader are plain functions defined in the profile.</p>
${table(
  ['Command', 'What it does', 'Example'],
  [
    ['<code>conda</code>', 'Lazy placeholder. On first use it loads the real conda hook once, then runs your command.', '<code>conda activate base</code>'],
    ['<code>activate</code>', 'Lazy placeholder for environment activation (same first-use load).', '<code>activate myenv</code>'],
    ['<code>deactivate</code>', 'Lazy placeholder that loads conda, then deactivates.', '<code>deactivate</code>'],
    ['<code>Initialize-Conda</code>', 'Finds <code>conda.exe</code> across common locations and sources its hook. Runs automatically; call it to force-load.', '<code>Initialize-Conda</code>'],
    ['<code>Get-GitBranch</code>', 'Returns the current branch by reading <code>.git/HEAD</code> on disk — never spawns <code>git.exe</code>.', '<code>Get-GitBranch</code>'],
    ['<code>prompt</code>', 'The prompt itself: path, active conda env, git branch, and the prompt symbol.', '(runs automatically)'],
  ]
)}

${callout(
  `The first <code>conda</code>, <code>activate</code>, or <code>deactivate</code> call in a session is
  slightly slower because it loads conda then; every launch after startup stays fast because nothing
  conda-related runs until you ask for it.`,
  'Note'
)}

${h2('Key bindings', 'keys')}
<p>Set up through PSReadLine for interactive tabs. <code>Ctrl+←/→</code> also needs the Windows Terminal
unbinds from <a href="{{base}}docs/manual-setup/#terminal">step 4</a>.</p>
${table(
  ['Keys', 'Action'],
  [
    ['<kbd>Ctrl</kbd> + <kbd>←</kbd> / <kbd>→</kbd>', 'Move the cursor one word left / right.'],
    ['<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>←</kbd> / <kbd>→</kbd>', 'Select one word left / right.'],
    ['<kbd>↑</kbd> / <kbd>↓</kbd>', 'Prefix history search — type a few letters, then arrow through matches.'],
    ['<kbd>Ctrl</kbd> + <kbd>r</kbd>', 'Reverse-search through history.'],
    ['<kbd>Tab</kbd>', 'Menu completion — cycle through matches inline.'],
  ]
)}

${h2('Environment variables', 'env')}
<p>Set at User scope by the installer and re-asserted by the profile, so the update banner is gone even
before the profile loads.</p>
${table(
  ['Variable', 'Value', 'Effect'],
  [
    ['<code>POWERSHELL_TELEMETRY_OPTOUT</code>', '<code>1</code>', 'Disables PowerShell telemetry.'],
    ['<code>POWERSHELL_UPDATECHECK</code>', '<code>Off</code>', 'Removes the startup update-check banner.'],
  ]
)}

<p>To change any of this — colors, the prompt symbol, or the prediction style — see
<a href="{{base}}docs/customization/">Profile &amp; theming</a>.</p>
`

export default {
  route: 'docs/commands',
  section: 'docs',
  title: 'Commands & functions',
  description: 'The functions, key bindings, and environment variables the profile adds.',
  body,
}
