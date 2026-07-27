---
title: Troubleshooting
description: Fixes for execution-policy errors, glyphs showing as boxes, the profile not loading, and SmartScreen.
---

# Troubleshooting

The common snags, each with the exact message you'll see and the command that fixes it.

## Execution policy {#execution-policy}

### `...cannot be loaded because running scripts is disabled on this system` {#policy-error}

Cause: your execution policy blocks local scripts.

Either allow local scripts for your user:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

…or run the installer once with a per-process bypass (nothing persists):

```powershell
pwsh -ExecutionPolicy Bypass -File .\install.ps1
```

## Glyphs and the font {#glyphs}

### Icons show as boxes `□` or question marks {#boxes}

Cause: the Nerd Font isn't applied to the current Windows Terminal profile.

Close *every* Windows Terminal window and open a new one. The font only applies to tabs opened
after the patch. Then confirm the glyphs render:

```powershell
Write-Host "`u{e0a0}  `u{f07b}"     # should be a branch and a folder icon
```

::: tip Note
Still boxes? Open Windows Terminal settings and check that
`profiles → defaults → font → face` is `LigaConsolas Nerd Font`. Re-run the installer, or set it
by hand from [step 4](/docs/manual-setup#terminal).
:::

### Ligatures don't join (`==>` stays as three characters) {#ligatures-off}

Cause: the font features aren't enabled on the profile.

Make sure the font block includes `"features": { "liga": 1, "calt": 1 }`, then reopen the tab. The
installer writes this for you; the fragment is on the [manual setup](/docs/manual-setup) page.

## Profile {#profile}

### The prompt is plain after installing {#not-loading}

Cause: the new tab loaded before the profile was installed, or the profile didn't load.

Open a fresh tab, or reload it in the current one:

```powershell
. $PROFILE.CurrentUserAllHosts
```

Confirm the profile is actually there:

```powershell
Get-Content $PROFILE.CurrentUserAllHosts | Select-Object -First 5
```

### Ctrl+← / Ctrl+→ move by character, not word {#word-nav}

Cause: Windows Terminal is still capturing the keys before the shell sees them.

Word navigation needs both layers: the profile binds the keys, and Windows Terminal must release
them. Add the unbinds from [step 4](/docs/manual-setup#terminal) and reopen the tab.

## Installer {#smartscreen}

### `Windows protected your PC` (SmartScreen) {#smartscreen-block}

Cause: the installer is unsigned, so SmartScreen warns on first launch.

Click **More info**, then **Run anyway**. If you'd rather not run the `.exe`, use the
[manual setup](/docs/manual-setup) or run `install.ps1` from a clone instead.

### `pwsh.exe not found on PATH` {#pwsh-missing}

Cause: PowerShell 7 isn't installed. The setup targets it, not Windows PowerShell 5.1.

Install it, then reopen your terminal and re-run:

```powershell
winget install --id Microsoft.PowerShell -e
```

Something else? Check the [FAQ](/docs/faq) or open an issue on
[GitHub ↗](https://github.com/Abdullah-Masood-05/pwsh-terminal-setup/issues).
