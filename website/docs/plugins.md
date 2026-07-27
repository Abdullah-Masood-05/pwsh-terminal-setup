---
title: Plugins
description: Add opt-in extras like git aliases, zoxide, and a startup banner from the companion pwsh-plugins repo. Install only what you use.
---

# Plugins

pwsh-terminal-setup stays minimal on purpose: the base profile is the prompt, ligatures, and PSReadLine,
nothing else. For everything beyond that (git aliases, directory jumping, a startup banner...), there's a
separate, opt-in companion project: **[pwsh-plugins ↗](https://github.com/Abdullah-Masood-05/pwsh-plugins)**.

It follows the same philosophy as this project: nothing loads unless you explicitly install it, and every
plugin lists its startup cost up front. It has no dependency on pwsh-terminal-setup and works on any
PowerShell 7 profile, but it's built to complement this one.

::: tip Note
This page covers the essentials. For the full command reference, every flag, and troubleshooting, see the
**[pwsh-plugins repository ↗](https://github.com/Abdullah-Masood-05/pwsh-plugins)**.
:::

## Install it {#install}

```powershell
git clone https://github.com/Abdullah-Masood-05/pwsh-plugins.git
cd pwsh-plugins
.\listconfigs.ps1                                   # see what's available
.\addconfig.ps1 --git-aliases.config --zoxide.config
# restart the terminal (or: . $PROFILE.CurrentUserAllHosts)
```

## Available plugins {#catalog}

| Plugin | What it adds | Startup cost | External tool |
|---|---|---|---|
| `git-aliases` | Git shortcuts: `gco`, `gcb`, `gcm`, `gca`, `gaa`, `gst`, `gpl`, `gps`, `gd`, `gl` | ~0 ms | git |
| `zoxide` | Smart `z` directory jumping | ~5 ms | **zoxide** |
| `fastfetch` | System-info banner at startup | ~15 ms | **fastfetch** |
| `psreadline-bindings` | Zsh-like keys: `Ctrl+Z` undo, `Alt+←/→` word jump, delete-word | ~0 ms | — |
| `argument-completers` | Tab completion for git branches and winget | ~0 ms | — |
| `custom-ls` | Colored `ls` output, no external module | ~0 ms | — |
| `navigation-shortcuts` | `..`, `...`, `....`, `mkcd`, `home` | ~0 ms | — |

Each plugin also ships its own README in the pwsh-plugins repo with the full command list and any caveats.

## Plugins that need a real tool installed {#external-tools}

Most plugins are self-contained PowerShell: installing the `.config` is the whole story. `zoxide` and
`fastfetch` are different: they're thin wrappers around an actual program (`zoxide.exe`, `fastfetch.exe`)
that has to exist on your machine. Adding the plugin's config alone doesn't install that program, it only
wires up the PowerShell side.

::: warning Important
You can't get `zoxide` or `fastfetch` working by only running `addconfig.ps1`. The underlying tool has to
be installed too. `addconfig.ps1` makes this easy: if the required tool isn't on `PATH`, it detects that and
offers to run the `winget install` for you right then, before it finishes adding the plugin.
:::

You can also install the tool yourself first, if you'd rather:

```powershell
winget install --id ajeetdsouza.zoxide -e         # for the zoxide plugin
winget install --id Fastfetch-cli.Fastfetch -e    # for the fastfetch plugin
```

Either way, each plugin's PowerShell side is written to be safe if its tool is ever missing: it no-ops
instead of erroring, so a partially-set-up plugin won't break your prompt.

## Add more plugins later, or write your own {#custom}

Adding another plugin later is the same one-liner:

```powershell
.\addconfig.ps1 --fastfetch.config
```

Writing your own is a copy of a template plus a metadata header, no build step, no plugin API to learn:

```powershell
Copy-Item templates\plugin-template.config plugins\my-plugin\my-plugin.config
```

Each plugin is a single `.config` file: a small metadata header (`# Plugin:`, `# Dependencies:` for other
plugins it needs, `# Requires:` for external tools written as `cmd|winget-id`, `# Startup Cost:`) followed
by plain PowerShell that gets appended to your profile between named markers: nothing hidden, nothing
compiled. The full guide (naming rules, the Dependencies-vs-Requires distinction, and the complete header
format) is in the
**[Create your own plugin ↗](https://github.com/Abdullah-Masood-05/pwsh-plugins#create-your-own-plugin)**
section of the pwsh-plugins README.

## Remove or roll back {#remove}

```powershell
.\removeconfig.ps1 --fastfetch.config     # remove one plugin
.\removeconfig.ps1 --all                  # remove everything pwsh-plugins added
.\addconfig.ps1 --backup-list             # see saved profile backups
.\addconfig.ps1 --restore <id>            # roll the profile back to one
```

Every install and removal backs up your profile first (the last 5 are kept), so nothing here is one-way.

---

Full usage (every flag, dependency resolution, and each plugin's own README) lives in the
**[pwsh-plugins repository ↗](https://github.com/Abdullah-Masood-05/pwsh-plugins)**.
