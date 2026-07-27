---
title: Requirements
description: Windows 10/11, PowerShell 7, and Windows Terminal, with the exact install commands.
---

# Requirements

Three things, all free: Windows 10 or 11, PowerShell 7, and Windows Terminal.

| Requirement | Why | Get it |
|---|---|---|
| Windows 10/11 | The font install and Windows Terminal patch are Windows-specific. | already have it |
| PowerShell 7+ | The profile targets PowerShell 7. Windows PowerShell 5.1 is not enough. | [Microsoft ↗](https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-windows) |
| Windows Terminal | Where the font and key bindings are applied. | [aka.ms/terminal ↗](https://aka.ms/terminal) |

## Install PowerShell 7 {#powershell}

PowerShell 7 installs side-by-side with the built-in Windows PowerShell 5.1. It does not replace
it. The command below is the quickest route; you can also
[download it from Microsoft ↗](https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-windows)
directly.

```powershell
winget install --id Microsoft.PowerShell -e
```

::: warning Important
PowerShell 7 runs as `pwsh`, not `powershell`. If the installer says it can't find `pwsh.exe`,
install this first and reopen your terminal.
:::

## Install Windows Terminal {#windows-terminal}

If you don't already have it:

```powershell
winget install --id Microsoft.WindowsTerminal -e
```

Launch it once before running the setup so its `settings.json` exists to be patched.

## Check your versions {#check}

Open a PowerShell 7 tab (the profile menu says *PowerShell*, not *Windows PowerShell*) and run:

```powershell
$PSVersionTable.PSVersion        # expect 7.x or higher
```

If the first line shows `7` or higher, you're ready to [install with the installer](/docs/install-installer)
or follow the [manual guide](/docs/manual-setup).
