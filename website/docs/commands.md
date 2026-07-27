---
title: Commands & functions
description: The functions, key bindings, and environment variables the profile adds.
---

# Commands & functions

What the profile adds to your session: a handful of functions and a set of PSReadLine key
bindings. Nothing here needs a module install.

## Functions {#functions}

The prompt and the lazy conda loader are plain functions defined in the profile.

| Command | What it does | Example |
|---|---|---|
| `conda` | Lazy placeholder. On first use it loads the real conda hook once, then runs your command. | `conda activate base` |
| `activate` | Lazy placeholder for environment activation (same first-use load). | `activate myenv` |
| `deactivate` | Lazy placeholder that loads conda, then deactivates. | `deactivate` |
| `Initialize-Conda` | Finds `conda.exe` across common locations and sources its hook. Runs automatically; call it to force-load. | `Initialize-Conda` |
| `Get-GitBranch` | Returns the current branch by reading `.git/HEAD` on disk, never spawns `git.exe`. | `Get-GitBranch` |
| `prompt` | The prompt itself: path, active conda env, git branch, and the prompt symbol. | (runs automatically) |

::: tip Note
The first `conda`, `activate`, or `deactivate` call in a session is slightly slower because it
loads conda then; every launch after startup stays fast because nothing conda-related runs until
you ask for it.
:::

## Key bindings {#keys}

Set up through PSReadLine for interactive tabs. `Ctrl+←/→` also needs the Windows Terminal unbinds
from [step 4](/docs/manual-setup#terminal).

| Keys | Action |
|---|---|
| <kbd>Ctrl</kbd> + <kbd>←</kbd> / <kbd>→</kbd> | Move the cursor one word left / right. |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>←</kbd> / <kbd>→</kbd> | Select one word left / right. |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Prefix history search: type a few letters, then arrow through matches. |
| <kbd>Ctrl</kbd> + <kbd>r</kbd> | Reverse-search through history. |
| <kbd>Tab</kbd> | Menu completion: cycle through matches inline. |

## Environment variables {#env}

Set at User scope by the installer and re-asserted by the profile, so the update banner is gone
even before the profile loads.

| Variable | Value | Effect |
|---|---|---|
| `POWERSHELL_TELEMETRY_OPTOUT` | `1` | Disables PowerShell telemetry. |
| `POWERSHELL_UPDATECHECK` | `Off` | Removes the startup update-check banner. |

To change any of this (colors, the prompt symbol, or the prediction style), see
[Profile & theming](/docs/customization). Want more commands than this, like git aliases, directory jumping,
or a startup banner? See [Plugins](/docs/plugins).
