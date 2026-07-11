---
title: Overview
description: What pwsh-terminal-setup installs and the two ways to set it up.
---

# Overview

pwsh-terminal-setup turns a stock PowerShell 7 window into a fast, readable terminal — a
git-aware prompt, ligatures and Nerd Font icons, and full syntax highlighting — from one command.

It cuts shell startup from seconds to milliseconds by loading conda only when you first use it,
installs a font that has **both** programming ligatures and Nerd Font glyphs, adds a minimal
zsh-like prompt, and configures PSReadLine for highlighting, smart history, and proper word
navigation. Every file it touches is backed up first, and re-running is safe.

<DemoPrompt caption="The installed prompt: current path plus the active git branch." />

## Two ways to install

Pick whichever fits how you work — both end at the same setup.

- **[Installer](/docs/install-installer)** — one run, no admin, and the Nerd Font is bundled
  inside it, so nothing else has to be downloaded.
- **[Manual setup](/docs/manual-setup)** — the same result, one step at a time, including how to
  download and install the font yourself.

::: tip Note
The installer includes the required Nerd Font. You do not need to download or install any font
separately when you use it.
:::

## What it changes

| Component | What it does |
|---|---|
| Telemetry opt-out | Sets `POWERSHELL_TELEMETRY_OPTOUT` and `POWERSHELL_UPDATECHECK` at User scope. |
| Nerd Font | Installs LigaConsolas Nerd Font per-user (registered in HKCU) — ligatures and icons. |
| Profile | Writes `$PROFILE.CurrentUserAllHosts`: prompt, lazy conda, and PSReadLine config. |
| Windows Terminal | Sets the font on `profiles.defaults` and frees `Ctrl+←/→` for word jumps. |

See [Commands & functions](/docs/commands) for everything the profile adds, and
[Profile & theming](/docs/customization) to change the colors, prompt symbol, or fonts.

## Before you begin

You need PowerShell 7 and Windows Terminal on Windows 10 or 11. The
[Requirements](/docs/requirements) page has the exact links and version checks — including where
to [download PowerShell 7 ↗](https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-windows).
