---
title: Installer options
description: "Every install.ps1 parameter: font size, color scheme, opacity, prompt symbol, prediction view, and the skip switches."
---

# Installer options

You don't have to hand-edit any file. `install.ps1` takes the common settings as parameters and
applies them in one run, font, colors, prompt, and prediction style included.

These are parameters to the setup **script**. Clone the repo (or use the copy the `.exe` installs)
and run:

```powershell
pwsh -ExecutionPolicy Bypass -File .\install.ps1
```

## Customize in one run {#customize}

LigaConsolas Nerd Font is the default and recommended font. To use JetBrains Mono Nerd Font instead:

```powershell
.\install.ps1 -Font JetBrainsMono
```

Combine any of the parameters below. For example, set a 12&nbsp;pt font, a built-in color scheme,
an arrow prompt, and inline predictions:

```powershell
.\install.ps1 -FontSize 12 -ColorScheme "One Half Dark" -PromptSymbol "➜" -PredictionView InlineView
```

Or install just the prompt and editing config, no conda block, no font:

```powershell
.\install.ps1 -SkipConda -SkipFont
```

## All parameters {#parameters}

| Parameter | Type | What it changes |
|---|---|---|
| `-Font` | LigaConsolas&nbsp;/&nbsp;JetBrainsMono | Which Nerd Font to install and apply. Default (and recommended) `LigaConsolas`. |
| `-FontSize <n>` | number | Font size (points) on Windows Terminal `profiles.defaults`. |
| `-ColorScheme <name>` | string | Color scheme on `profiles.defaults`. Must already exist in `settings.json`. |
| `-Opacity <0-100>` | number | Background opacity. Below 100 also enables acrylic. |
| `-PromptSymbol <char>` | string | The prompt glyph in the profile. Default is `❯`. |
| `-PredictionView` | ListView&nbsp;/&nbsp;InlineView | PSReadLine prediction display. Default `ListView`. |
| `-FontFamily <name>` | string | Override the font family written to Windows Terminal. |
| `-FontDir <path>` | string | Install fonts from pre-downloaded `.ttf` files instead of downloading (offline). |
| `-SkipFont` | switch | Do not download or install the font. |
| `-SkipTerminal` | switch | Do not patch Windows Terminal `settings.json`. |
| `-SkipProfile` | switch | Do not install the PowerShell profile. |
| `-SkipConda` | switch | Omit the conda lazy-init block from the profile. |
| `-Uninstall` | switch | Remove the setup's profile regions and Windows Terminal font face. Combine with `-SkipProfile` / `-SkipTerminal` to limit it. |

::: tip Note
`-ColorScheme` only selects a scheme that already exists in your `settings.json` (for example the
built-in `One Half Dark` or `Tokyo Night`). It does not create new schemes.
:::

## Offline install {#offline}

On a machine with no internet, download the four `.ttf` files elsewhere (see
[Install the Nerd Font](/docs/manual-setup#font)), copy them onto the machine, and point the
installer at them. Pass `-Font` to match the files you copied:

```powershell
.\install.ps1 -FontDir "C:\fonts\LigaConsolas-NF"
.\install.ps1 -Font JetBrainsMono -FontDir "C:\fonts\JetBrainsMono-NF"
```

## See the built-in help {#help}

Every parameter is documented in the script's comment-based help:

```powershell
Get-Help .\install.ps1 -Detailed
```

All changes are idempotent: re-running with different parameters just updates the result. Each
touched file is backed up to `<file>.bak` the first time, and later runs keep that backup, so it
always holds your original from before the first install.

## Uninstall {#uninstall}

```powershell
.\install.ps1 -Uninstall
```

This removes the setup's managed regions from your profile (your own lines stay) and removes the
font face it set in Windows Terminal. Fonts and the telemetry opt-out are left in place. For a
full revert instead, restore the `.bak` files, see the [FAQ](/docs/faq#safety).

## Running from Windows PowerShell 5.1 {#ps51}

The script requires PowerShell 7. If you start it from Windows PowerShell 5.1, it re-launches
itself in `pwsh` with the same parameters when PowerShell 7 is installed, and otherwise stops with
install instructions. It never writes to the 5.1 profile.
