---
title: Requirements
description: Install these first. Windows 10/11, PowerShell 7 (not Windows PowerShell 5.1), and Windows Terminal, with the exact install commands.
---

# Requirements

**Install these before you run the installer.** All three are free: Windows 10 or 11,
PowerShell 7, and Windows Terminal.

<RequirementAlert compact no-link />

| Requirement | Why | Get it |
|---|---|---|
| Windows 10/11 | The font install and Windows Terminal patch are Windows-specific. | already have it |
| **PowerShell 7+** | The profile targets PowerShell 7. Windows PowerShell 5.1 is **not** enough. | [Microsoft ↗](https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-windows) |
| Windows Terminal | Where the font and key bindings are applied. | [aka.ms/terminal ↗](https://aka.ms/terminal) |

## Do I already have PowerShell 7? {#check}

Windows ships with **Windows PowerShell 5.1**, which is a different program. Having "PowerShell"
on your machine does not mean you have PowerShell 7. Check by running this in any terminal:

```powershell
pwsh --version
```

- Prints `PowerShell 7.x.x`: you're set, skip to [Windows Terminal](#windows-terminal).
- Says `pwsh` is not recognized: install it with the next step.

## 1. Install PowerShell 7 {#powershell}

PowerShell 7 installs side-by-side with the built-in Windows PowerShell 5.1. It does not replace
it. The command below is the quickest route; you can also
[download it from Microsoft ↗](https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-windows)
directly.

```powershell
winget install --id Microsoft.PowerShell --source winget
```

When it finishes, **close and reopen your terminal** so `pwsh` is on your `PATH`, then run
`pwsh --version` again to confirm.

::: warning Important
PowerShell 7 runs as `pwsh`, not `powershell`. In Windows Terminal's tab menu it appears as
**PowerShell**, while the old one is **Windows PowerShell**. Use the PowerShell 7 one.
:::

::: tip Note
If PowerShell 7 is missing, the `.exe` installer offers to install it for you with winget, and
`install.ps1` started from Windows PowerShell 5.1 re-launches itself in `pwsh` when it can find
it. Installing it yourself first is still the smoothest path.
:::

## 2. Install Windows Terminal {#windows-terminal}

Windows 11 includes it. On Windows 10, or if it's missing:

```powershell
winget install --id Microsoft.WindowsTerminal -e
```

Launch it once before running the setup so its `settings.json` exists to be patched.

## 3. You're ready {#ready}

Open a PowerShell 7 tab and confirm:

```powershell
$PSVersionTable.PSVersion        # expect 7.x or higher
```

If it shows `7` or higher, [install with the installer](/docs/install-installer) or follow the
[manual guide](/docs/manual-setup).
