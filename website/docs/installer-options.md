---
title: Installer options
description: Every install.ps1 parameter: font size, color scheme, opacity, prompt symbol, prediction view, and the skip switches.
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

::: tip Note
`-ColorScheme` only selects a scheme that already exists in your `settings.json` (for example the
built-in `One Half Dark` or `Tokyo Night`). It does not create new schemes.
:::

## Offline install {#offline}

On a machine with no internet, download the four `.ttf` files elsewhere (see
[Install the Nerd Font](/docs/manual-setup#font)), copy them onto the machine, and point the
installer at them:

```powershell
.\install.ps1 -FontDir "C:\fonts\LigaConsolas-NF"
```

## See the built-in help {#help}

Every parameter is documented in the script's comment-based help:

```powershell
Get-Help .\install.ps1 -Detailed
```

All changes are idempotent: re-running with different parameters just updates the result, and
each touched file is backed up to `<file>.bak` first.
