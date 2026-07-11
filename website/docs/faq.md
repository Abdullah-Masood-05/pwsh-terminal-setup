---
title: FAQ
description: Admin rights, PowerShell 5.1, offline install, the bundled font, custom fonts, and uninstalling.
---

# FAQ

Short answers to the questions that come up most.

## Installing {#installing}

### Do I need administrator rights?

No. Everything is per-user — the font installs to your user font folder (registered in HKCU), and
the profile and Windows Terminal settings live in your own user profile. No elevation, no system
changes.

### Does it work with Windows PowerShell 5.1?

It targets PowerShell 7 (`pwsh`). PowerShell 7 installs side-by-side with the built-in 5.1 and
doesn't replace it. Install 7 first — see [Requirements](/docs/requirements).

### Can I install without an internet connection?

Yes. The `.exe` installer bundles the font, so it works offline as-is. For the script, download
the four `.ttf` files on another machine and pass `-FontDir` — see
[Offline install](/docs/installer-options#offline).

## Fonts and appearance {#fonts}

### Is the font really bundled in the installer?

Yes. The installer includes all four LigaConsolas Nerd Font styles and installs them for you — you
do not need to download or install any font separately when you use it.

### Can I use a different font?

Yes. Pass `-FontFamily "Your Font Name"` (the font must already be installed), or set the face
directly in `settings.json`. For icons to render, use a Nerd Font.

### Why LigaConsolas Nerd Font?

It's one of the few faces that has **both** programming ligatures and Nerd Font glyphs, so you get
joined operators and branch/folder icons from a single font.

## Extending {#extending}

### Can I add more features, like git aliases or a system-info banner?

Yes — see [Plugins](/docs/plugins). It's a separate, opt-in companion project
([pwsh-plugins ↗](https://github.com/Abdullah-Masood-05/pwsh-plugins)) with git aliases, `zoxide`
directory jumping, a `fastfetch` startup banner, and more. Nothing loads unless you install it by name.

## Safety and uninstall {#safety}

### Will it overwrite my existing profile?

No. It backs up your current profile to `<profile>.bak` and merges its own settings by `#region`
markers, so anything else in your profile is left alone.

### Is it safe to re-run?

Yes — it's idempotent. Re-running updates the managed regions in place instead of duplicating
them, and backs up each file it touches first.

### How do I uninstall or revert?

Nothing is deleted, so restoring the backups reverts everything:

```powershell
Copy-Item "$($PROFILE.CurrentUserAllHosts).bak" $PROFILE.CurrentUserAllHosts -Force
# then restore settings.json from its .bak next to the original, and restart Windows Terminal
```

### Does it slow down shell startup?

The opposite. conda loads only on first use instead of on every launch, taking cold startup from
around 2.3&nbsp;s to about 0.3&nbsp;s.

::: tip Note
Have a question that isn't here? Open an issue on
[GitHub ↗](https://github.com/Abdullah-Masood-05/pwsh-terminal-setup/issues).
:::
