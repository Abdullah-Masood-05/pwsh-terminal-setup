---
title: Manual setup
description: Set it up by hand — install PowerShell 7, download and install the Nerd Font, add the profile, and patch Windows Terminal.
---

# Manual setup

The same result as the installer, one step at a time. Every step is a copy-able command, and the
inline demos follow the command that produced them so you can compare.

::: tip Note
Prefer one step? The [installer](/docs/install-installer) does everything on this page in a single
run, and the Nerd Font is bundled inside it.
:::

## Install PowerShell 7 {#powershell}

The profile targets PowerShell 7 (`pwsh`), which installs alongside the built-in Windows
PowerShell 5.1. Install it with winget, or
[download it from Microsoft ↗](https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-windows).

```powershell
winget install --id Microsoft.PowerShell -e
```

Reopen your terminal and confirm the version:

```powershell
pwsh --version
```

## Install the Nerd Font {#font}

The setup uses **LigaConsolas Nerd Font** — a Consolas-style face that has programming ligatures
*and* Nerd Font glyphs. Download its four styles (Regular, Bold, Italic, Bold Italic) from the
[font repository ↗](https://github.com/Dosx001/ttf-ligaconsolas-nerd-font). This command fetches
all four into your Downloads folder and opens it:

```powershell
$dir  = "$env:USERPROFILE\Downloads\LigaConsolas-NF"
$base = "https://github.com/Dosx001/ttf-ligaconsolas-nerd-font/raw/main"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
"Regular","Bold","Italic","Bold-Italic" | ForEach-Object {
    Invoke-WebRequest "$base/LigaConsolas-NF-$_.ttf" -OutFile "$dir\LigaConsolas-NF-$_.ttf"
}
Start-Process $dir      # opens the folder so you can install the fonts
```

In the folder that opens, select all four `.ttf` files, right-click, and choose **Install** (or
*Install for all users*). Then set the face in Windows Terminal — merge this into
`profiles → defaults` in `settings.json`:

```jsonc
"profiles": {
  "defaults": {
    "font": {
      "face": "LigaConsolas Nerd Font",
      "features": { "liga": 1, "calt": 1 }
    }
  }
}
```

<DemoLigatures caption="With the font applied: joined operators and Nerd Font icons render." />

::: tip Tip
Using the installer instead? Skip this step — the font is bundled and installed for you.
:::

## Install the profile {#profile}

The whole configuration is a single file,
[profile.ps1 ↗](https://github.com/Abdullah-Masood-05/pwsh-terminal-setup/blob/main/profile.ps1),
which goes to `$PROFILE.CurrentUserAllHosts` so it loads in every PowerShell 7 host. This backs up
any existing profile first, then installs and loads ours:

```powershell
$p   = $PROFILE.CurrentUserAllHosts
$src = "https://raw.githubusercontent.com/Abdullah-Masood-05/pwsh-terminal-setup/main/profile.ps1"
New-Item -ItemType Directory -Force -Path (Split-Path $p) | Out-Null
if (Test-Path $p) { Copy-Item $p "$p.bak" -Force }   # back up your current profile first
Invoke-WebRequest $src -OutFile $p
. $p                                                 # load it into the current session
```

::: warning Important
This **replaces** your current profile (after backing it up to `<profile>.bak`). Already have a
profile you want to keep? Append the downloaded file's contents instead, or use the
[installer](/docs/install-installer), which merges by `#region` so it never duplicates.
:::

<DemoPrompt caption="After loading the profile: the minimal git-aware prompt." />

## Windows Terminal settings {#terminal}

Two changes finish the setup. Open `settings.json` from Windows Terminal (<kbd>Ctrl</kbd> +
<kbd>Shift</kbd> + <kbd>,</kbd>) — it lives at
`%LOCALAPPDATA%\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json`.

**1. Apply the font** to every profile via `defaults` (the same fragment as above):

```jsonc
"profiles": {
  "defaults": {
    "font": {
      "face": "LigaConsolas Nerd Font",
      "features": { "liga": 1, "calt": 1 }
    }
  }
}
```

**2. Free `Ctrl+←/→`** so the keystrokes reach the shell for word navigation. Add these to the
top-level `keybindings` array:

```jsonc
"keybindings": [
  { "id": null, "keys": "ctrl+left" },
  { "id": null, "keys": "ctrl+right" },
  { "id": null, "keys": "ctrl+shift+left" },
  { "id": null, "keys": "ctrl+shift+right" }
]
```

::: tip Note
Use the `"id": null` schema shown here, **not** `{ "command": "unbound" }` — the older form makes
Windows Terminal rewrite `settings.json` on every launch. The full reference fragment is in
[settings.partial.jsonc ↗](https://github.com/Abdullah-Masood-05/pwsh-terminal-setup/blob/main/windows-terminal/settings.partial.jsonc).
:::

## Verify it worked {#verify}

Restart Windows Terminal, open a new PowerShell tab, and run:

```powershell
Write-Host "Icons: `u{e0a0}  `u{f07b}   Ligatures: ==> -> != >= <=   Emoji: 🚀 ✅"
```

You should see branch and folder icons, joined operators, and color emoji. Then press
<kbd>Ctrl</kbd> + <kbd>←</kbd> / <kbd>Ctrl</kbd> + <kbd>→</kbd> to jump word-by-word. If glyphs
show as boxes, the font isn't applied — see [Troubleshooting](/docs/troubleshooting).
