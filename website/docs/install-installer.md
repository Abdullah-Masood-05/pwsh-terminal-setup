---
title: Install with the installer
description: Download, run, and verify the bundled installer. The Nerd Font is included.
---

# Install with the installer

The installer applies the whole setup in one run — per-user, no admin — and the font is already
inside it.

::: tip Note
The installer bundles the required Nerd Font. You do not need to download or install any font
separately.
:::

## 1. Download {#download}

Grab the latest `pwsh-terminal-setup-x.y.z-Setup.exe` from the releases page.

<a class="btn btn--primary" href="https://github.com/Abdullah-Masood-05/pwsh-terminal-setup/releases" target="_blank" rel="noopener">Download installer ↗</a>

Make sure PowerShell 7 is installed first — see [Requirements](/docs/requirements). The installer
checks and tells you if it's missing.

## 2. Run it {#run}

Double-click the downloaded `.exe` and follow the prompts. It sets the telemetry opt-out, installs
the font, writes the profile, and patches Windows Terminal.

::: tip Note
The installer is unsigned, so Windows SmartScreen may warn you on first launch. Click **More info →
Run anyway**. See [Troubleshooting](/docs/troubleshooting) if it's blocked.
:::

## 3. Restart Windows Terminal {#restart}

Close every Windows Terminal window and open a new one, then start a **PowerShell** tab. The font
and prompt only apply to tabs opened after the patch.

<DemoPrompt caption="After restarting: the configured prompt in a fresh tab." />

## 4. Verify it worked {#verify}

Run this in the new tab — you should see branch and folder icons, joined operators, and color emoji:

```powershell
Write-Host "Icons: `u{e0a0}  `u{f07b}   Ligatures: ==> -> != >= <=   Emoji: 🚀 ✅"
```

Then press <kbd>Ctrl</kbd> + <kbd>←</kbd> / <kbd>Ctrl</kbd> + <kbd>→</kbd> to jump word-by-word. If
the icons show as boxes, the font isn't applied yet — see [Troubleshooting](/docs/troubleshooting).

## Want to change the defaults? {#customize}

The underlying script takes the settings as parameters, so you can set the font size, color
scheme, prompt symbol, and more in one run without editing any file. See
[Installer options](/docs/installer-options).
