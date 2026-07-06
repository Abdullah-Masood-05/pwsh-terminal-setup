import { h2, cmd, callout, table, extlink } from '../../lib/components.mjs'
import { links } from '../../lib/nav.mjs'

const body = `
<h1>Requirements</h1>
<p class="lead">Three things, all free: Windows 10 or 11, PowerShell 7, and Windows Terminal.</p>

${table(
  ['Requirement', 'Why', 'Get it'],
  [
    ['Windows 10/11', 'The font install and Windows Terminal patch are Windows-specific.', '—'],
    ['PowerShell 7+', 'The profile targets PowerShell 7. Windows PowerShell 5.1 is not enough.', extlink('Microsoft', links.powershell)],
    ['Windows Terminal', 'Where the font and key bindings are applied.', extlink('aka.ms/terminal', links.windowsTerminal)],
  ]
)}

${h2('Install PowerShell 7', 'powershell')}
<p>PowerShell 7 installs side-by-side with the built-in Windows PowerShell 5.1 — it does not replace it.
The command below is the quickest route; you can also
${extlink('download it from Microsoft', links.powershell)} directly.</p>
${cmd('winget install --id Microsoft.PowerShell -e', { prompt: true, label: 'PowerShell' })}

${callout(
  `PowerShell 7 runs as <code>pwsh</code>, not <code>powershell</code>. If the installer says it can't
  find <code>pwsh.exe</code>, install this first and reopen your terminal.`,
  'Important'
)}

${h2('Install Windows Terminal', 'windows-terminal')}
<p>If you don't already have it:</p>
${cmd('winget install --id Microsoft.WindowsTerminal -e', { prompt: true, label: 'PowerShell' })}
<p>Launch it once before running the setup so its <code>settings.json</code> exists to be patched.</p>

${h2('Check your versions', 'check')}
<p>Open a PowerShell 7 tab (the profile menu says <em>PowerShell</em>, not <em>Windows PowerShell</em>) and run:</p>
${cmd('$PSVersionTable.PSVersion        # expect 7.x or higher', { prompt: true, label: 'PowerShell' })}
<p>If the first line shows <code>7</code> or higher, you're ready to
<a href="{{base}}docs/install-installer/">install with the installer</a> or follow the
<a href="{{base}}docs/manual-setup/">manual guide</a>.</p>
`

export default {
  route: 'docs/requirements',
  section: 'docs',
  title: 'Requirements',
  description: 'Windows 10/11, PowerShell 7, and Windows Terminal — with the exact install commands.',
  body,
}
