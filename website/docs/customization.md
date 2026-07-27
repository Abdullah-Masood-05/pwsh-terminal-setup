---
title: Profile & theming
description: Customize the prompt symbol, syntax colors, prediction style, font size, and color scheme.
---

# Profile & theming

The whole configuration is one readable file. Change it from the command line with installer
parameters, or edit the profile directly. It's organized so each part is easy to find.

Two ways to change things:

- **From the command line**: re-run with [installer options](/docs/installer-options) like
  `-PromptSymbol`, `-PredictionView`, `-FontSize`, or `-ColorScheme`. Nothing to hand-edit.
- **By editing the profile**: open it and change the relevant region:

```powershell
code $PROFILE.CurrentUserAllHosts     # or: notepad $PROFILE.CurrentUserAllHosts
```

## The four regions {#regions}

The profile is split into `#region` blocks. The installer merges by these markers, so it never
duplicates them when you re-run.

| Region | What it controls |
|---|---|
| `startup-env` | Telemetry and update-check opt-out for the session. |
| `conda lazy-init` | The lazy conda placeholders and detection order. |
| `prompt` | The prompt: path, conda env, git branch, and the prompt symbol. |
| `PSReadLine` | Syntax colors, predictions, history search, and key bindings. |

## Change the prompt symbol {#prompt-symbol}

Pass `-PromptSymbol "➜"` to the installer, or edit the `prompt` region:

```powershell
# In the  #region prompt  block, change the prompt glyph:
$sym = [char]0x276F      # default ❯  →  set your own, e.g.
$sym = '➜'
```

## Change the syntax colors {#colors}

The default palette is Tokyo Night-inspired. Edit the `Set-PSReadLineOption -Colors` hashtable in
the `PSReadLine` region, overriding only the tokens you care about:

```powershell
Set-PSReadLineOption -Colors @{
    Command   = '#7aa2f7'   # override only the tokens you want
    String    = '#9ece6a'
    Comment   = '#565f89'
}
```

| Token | Default |
|---|---|
| Command | <span class="swatch" style="background:#7aa2f7"></span>`#7aa2f7` |
| Parameter | <span class="swatch" style="background:#e0af68"></span>`#e0af68` |
| Operator | <span class="swatch" style="background:#89ddff"></span>`#89ddff` |
| Variable | <span class="swatch" style="background:#bb9af7"></span>`#bb9af7` |
| String | <span class="swatch" style="background:#9ece6a"></span>`#9ece6a` |
| Number | <span class="swatch" style="background:#ff9e64"></span>`#ff9e64` |
| Type | <span class="swatch" style="background:#2ac3de"></span>`#2ac3de` |
| Comment | <span class="swatch" style="background:#565f89"></span>`#565f89` |
| Keyword | <span class="swatch" style="background:#f7768e"></span>`#f7768e` |

## Change the prediction style {#predictions}

Predictions show as a dropdown list by default. For a single inline suggestion, pass
`-PredictionView InlineView`, or set it in the `PSReadLine` region:

```powershell
Set-PSReadLineOption -PredictionViewStyle InlineView
```

## Font size, color scheme, opacity {#terminal-look}

These live in Windows Terminal, not the profile. Set them with installer parameters:

```powershell
.\install.ps1 -FontSize 12 -ColorScheme "One Half Dark" -Opacity 92
```

::: tip Note
`-ColorScheme` must name a scheme already present in your `settings.json`. To use your own font,
pass `-FontFamily "Your Font Name"`.
:::

After editing the profile directly, reload it with `. $PROFILE.CurrentUserAllHosts` or open a new
tab. For the full parameter list, see [Installer options](/docs/installer-options).
