<#
.SYNOPSIS
    Sets up a fast PowerShell 7 + Windows Terminal environment:
    lazy-loaded conda, a Nerd Font with ligatures + icons (LigaConsolas or
    JetBrains Mono), a minimal zsh-like prompt, and a full PSReadLine config.

.DESCRIPTION
    Idempotent and safe to re-run. Every file it touches is backed up first
    (<file>.bak, written once so it always holds your pre-install original).
    All paths are resolved dynamically; nothing is hardcoded to a specific
    machine or user.

    Requires PowerShell 7 (pwsh). If you start it from Windows PowerShell 5.1
    it re-launches itself in pwsh when available, and stops with install
    instructions when it isn't.

    Steps:
      1. Persist telemetry / update-check opt-out (User scope)
      2. Install the Nerd Font (per-user, no admin)
      3. Install the PowerShell profile ($PROFILE.CurrentUserAllHosts)
      4. Patch Windows Terminal settings.json (font + Ctrl+Arrow pass-through)
      5. Verify

    Most settings can be customized from the command line (see the parameters
    below), so you can tune the font, colors, prompt, and prediction style
    without hand-editing any file first.

.PARAMETER Font
    Which Nerd Font to install and apply: LigaConsolas (default, a
    Consolas-style face) or JetBrainsMono (JetBrains Mono Nerd Font). Both have
    programming ligatures and Nerd Font icons.

.PARAMETER SkipFont
    Skip downloading/installing the font.

.PARAMETER SkipTerminal
    Skip patching Windows Terminal settings.json.

.PARAMETER SkipProfile
    Skip installing the PowerShell profile.

.PARAMETER SkipConda
    Omit the conda lazy-init block from the installed profile (use this if you
    don't use conda). Re-running without the switch restores it.

.PARAMETER FontFamily
    Override the font family name used in Windows Terminal (default comes from
    -Font).

.PARAMETER FontDir
    Use pre-downloaded .ttf files from this directory instead of downloading
    them (offline installer).

.PARAMETER FontSize
    Font size (points) for Windows Terminal profiles.defaults. Leaves the
    existing size untouched when not supplied.

.PARAMETER ColorScheme
    Windows Terminal color scheme applied to profiles.defaults, e.g.
    'One Half Dark' or 'Tokyo Night'. The scheme must already exist in
    settings.json.

.PARAMETER Opacity
    Windows Terminal background opacity (0-100) for profiles.defaults. Values
    below 100 also enable acrylic. Leaves opacity untouched when not supplied.

.PARAMETER PromptSymbol
    Character used for the prompt symbol in the profile (default is the zsh-like
    U+276F heavy angle bracket).

.PARAMETER PredictionView
    PSReadLine prediction view style: ListView (default) or InlineView.

.PARAMETER Uninstall
    Remove the setup: strips the managed regions from your profile (anything
    else in it is kept) and removes the font face this setup applied in
    Windows Terminal. Installed fonts and the telemetry opt-out are left in place.

.EXAMPLE
    pwsh -ExecutionPolicy Bypass -File .\install.ps1

.EXAMPLE
    # Use JetBrains Mono Nerd Font instead of LigaConsolas:
    .\install.ps1 -Font JetBrainsMono

.EXAMPLE
    # Customize the terminal settings in one run:
    .\install.ps1 -FontSize 12 -ColorScheme 'One Half Dark' -PromptSymbol '>' -PredictionView InlineView

.EXAMPLE
    # Install the prompt + editing config only, without touching conda or fonts:
    .\install.ps1 -SkipConda -SkipFont

.EXAMPLE
    # Undo the setup:
    .\install.ps1 -Uninstall
#>
[CmdletBinding()]
param(
    [ValidateSet('LigaConsolas', 'JetBrainsMono')]
    [string] $Font = 'LigaConsolas',
    [switch] $SkipFont,
    [switch] $SkipTerminal,
    [switch] $SkipProfile,
    [switch] $SkipConda,
    [string] $FontFamily,
    [string] $FontDir,          # use pre-downloaded .ttf files from here instead of downloading (offline installer)
    [ValidateRange(1, 72)]
    [double] $FontSize,
    [string] $ColorScheme,
    [ValidateRange(0, 100)]
    [int]    $Opacity,
    [string] $PromptSymbol,
    [ValidateSet('ListView', 'InlineView')]
    [string] $PredictionView,
    [switch] $Uninstall
)

# NOTE: keep this file pure ASCII. Windows PowerShell 5.1 reads BOM-less scripts
# as ANSI, and it has to get far enough to run the version check below.

# ---------------------------------------------------------------------
# 0. PowerShell 7 is required. From 5.1, hand off to pwsh or stop.
# ---------------------------------------------------------------------
if ($PSVersionTable.PSVersion.Major -lt 7) {
    $pwsh = Get-Command pwsh.exe -ErrorAction SilentlyContinue
    if (-not $pwsh) {
        $p = Join-Path $env:ProgramFiles 'PowerShell\7\pwsh.exe'
        if (Test-Path $p) { $pwsh = Get-Command $p }
    }
    if ($pwsh) {
        Write-Host "Windows PowerShell $($PSVersionTable.PSVersion) detected. Re-launching in PowerShell 7 ($($pwsh.Source))..." -ForegroundColor Yellow
        # Forward the parameters the caller actually passed. @() so a single
        # argument stays an array (splatting a bare string splats its characters).
        $fwd = @(foreach ($kv in $PSBoundParameters.GetEnumerator()) {
            if ($kv.Value -is [System.Management.Automation.SwitchParameter]) {
                if ($kv.Value.IsPresent) { "-$($kv.Key)" }
            } else {
                "-$($kv.Key)"; [string]$kv.Value
            }
        })
        & $pwsh.Source -NoProfile -ExecutionPolicy Bypass -File $PSCommandPath @fwd
        exit $LASTEXITCODE
    }
    Write-Host ""
    Write-Host "  PowerShell 7 is required, and it isn't installed." -ForegroundColor Red
    Write-Host "  You're running Windows PowerShell $($PSVersionTable.PSVersion), which this setup does not support." -ForegroundColor Red
    Write-Host ""
    Write-Host "  Install PowerShell 7 first:" -ForegroundColor Yellow
    Write-Host "      winget install --id Microsoft.PowerShell --source winget"
    Write-Host "  or see https://abdullah-masood-05.github.io/pwsh-terminal-setup/docs/requirements"
    Write-Host "  then open a new terminal and run this script again."
    Write-Host ""
    exit 1
}

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

function Write-Step  ($m) { Write-Host "`n==> $m" -ForegroundColor Cyan }
function Write-Ok    ($m) { Write-Host "    [ok] $m"   -ForegroundColor Green }
function Write-Warn2 ($m) { Write-Host "    [!]  $m"   -ForegroundColor Yellow }

# Back up a file once: the first .bak is your pre-install original, so
# re-running (or upgrading) never overwrites it with an already-patched copy.
function Backup-Once ($path) {
    if (-not (Test-Path "$path.bak")) {
        Copy-Item $path "$path.bak" -Force
        Write-Ok "Backed up $(Split-Path $path -Leaf) -> $(Split-Path $path -Leaf).bak"
    } else {
        Write-Ok "Keeping existing backup $(Split-Path $path -Leaf).bak (your pre-install original)"
    }
}

# Fonts this setup knows how to install. Face = family name written to Windows
# Terminal ($null = read it from the font file via GDI+).
$fontCatalog = @{
    LigaConsolas = @{
        Name  = 'LigaConsolas Nerd Font'
        Base  = 'https://github.com/Dosx001/ttf-ligaconsolas-nerd-font/raw/main'
        Face  = $null
        Files = [ordered]@{
            'LigaConsolas-NF-Regular.ttf'     = ''
            'LigaConsolas-NF-Bold.ttf'        = ' Bold'
            'LigaConsolas-NF-Italic.ttf'      = ' Italic'
            'LigaConsolas-NF-Bold-Italic.ttf' = ' Bold Italic'
        }
    }
    JetBrainsMono = @{
        Name  = 'JetBrainsMono Nerd Font'
        Base  = 'https://github.com/ryanoasis/nerd-fonts/raw/HEAD/patched-fonts/JetBrainsMono/Ligatures'
        Face  = 'JetBrainsMono Nerd Font'
        Files = [ordered]@{
            'JetBrainsMonoNerdFont-Regular.ttf'    = ''
            'JetBrainsMonoNerdFont-Bold.ttf'       = ' Bold'
            'JetBrainsMonoNerdFont-Italic.ttf'     = ' Italic'
            'JetBrainsMonoNerdFont-BoldItalic.ttf' = ' Bold Italic'
        }
    }
}
$knownFaces = @('LigaConsolas Nerd Font', 'JetBrainsMono Nerd Font', 'JetBrainsMono NF')
$managedRegions = 'startup-env', 'conda lazy-init', 'prompt', 'PSReadLine'

$wtCandidates = @(
    "$env:LOCALAPPDATA\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json",
    "$env:LOCALAPPDATA\Packages\Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe\LocalState\settings.json",
    "$env:LOCALAPPDATA\Microsoft\Windows Terminal\settings.json"
)

# Keep a log of every run; the .exe installer runs this hidden, so the log is
# the only place its output ends up.
$logPath = Join-Path $env:TEMP 'pwsh-terminal-setup-install.log'
try { Start-Transcript -Path $logPath -Force | Out-Null } catch { }

Write-Host "pwsh-terminal-setup installer" -ForegroundColor Magenta

# ---------------------------------------------------------------------
# Uninstall: strip our profile regions + our Windows Terminal font face
# ---------------------------------------------------------------------
if ($Uninstall) {
    $profilePath = $PROFILE.CurrentUserAllHosts
    if ($SkipProfile) {
        Write-Step "Skipping PowerShell profile (-SkipProfile)"
    } elseif (Test-Path $profilePath) {
        Write-Step "Removing pwsh-terminal-setup from your PowerShell profile"
        Copy-Item $profilePath "$profilePath.uninstall.bak" -Force
        $text = Get-Content $profilePath -Raw
        foreach ($marker in $managedRegions) {
            $text = [regex]::Replace($text, "(?s)#region $([regex]::Escape($marker)).*?#endregion\s*", '')
        }
        # Drop our header comment block too.
        $text = [regex]::Replace($text, '(?m)^# =+\r?\n#  PowerShell 7 profile .*?\r?\n(#.*\r?\n)*?# =+\r?\n', '')
        Set-Content -Path $profilePath -Value $text.Trim() -Encoding utf8
        Write-Ok "Managed regions removed (copy before removal: $(Split-Path $profilePath -Leaf).uninstall.bak)"
    } else {
        Write-Step "Removing pwsh-terminal-setup from your PowerShell profile"
        Write-Ok "No profile found at $profilePath"
    }

    $wt = $wtCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
    if ($SkipTerminal) {
        Write-Step "Skipping Windows Terminal (-SkipTerminal)"
    } elseif ($wt) {
        Write-Step "Removing the font face from Windows Terminal"
        $j = Get-Content $wt -Raw | ConvertFrom-Json
        $face = $j.profiles.defaults.font.face
        if ($face -and ($knownFaces -contains $face -or ($FontFamily -and $face -eq $FontFamily))) {
            Copy-Item $wt "$wt.uninstall.bak" -Force
            $j.profiles.defaults.font.PSObject.Properties.Remove('face')
            $j.profiles.defaults.font.PSObject.Properties.Remove('features')
            if (-not $j.profiles.defaults.font.PSObject.Properties.Name) {
                $j.profiles.defaults.PSObject.Properties.Remove('font')
            }
            Set-Content -Path $wt -Value ($j | ConvertTo-Json -Depth 32) -Encoding utf8
            Write-Ok "Removed '$face' from profiles.defaults (Ctrl+Arrow pass-through left as-is)"
        } else {
            Write-Ok "Windows Terminal isn't using a font set by this setup; left untouched"
        }
    } else {
        Write-Step "Removing the font face from Windows Terminal"
        Write-Ok "Windows Terminal settings.json not found; nothing to change"
    }

    Write-Host "`nUninstalled." -ForegroundColor Magenta
    Write-Host "Installed fonts and the telemetry opt-out env vars were left in place."
    Write-Host "Your pre-install originals are still available as <file>.bak if you want a full restore."
    try { Stop-Transcript | Out-Null } catch { }
    return
}

# ---------------------------------------------------------------------
# 1. Persistent env vars (kills telemetry + the update-check banner)
# ---------------------------------------------------------------------
Write-Step "Persisting telemetry / update-check opt-out (User scope)"
# POWERSHELL_UPDATECHECK is read at startup BEFORE the profile runs, so it must
# live at User scope to actually suppress the banner.
[Environment]::SetEnvironmentVariable('POWERSHELL_TELEMETRY_OPTOUT', '1',   'User')
[Environment]::SetEnvironmentVariable('POWERSHELL_UPDATECHECK',      'Off', 'User')
Write-Ok "POWERSHELL_TELEMETRY_OPTOUT=1, POWERSHELL_UPDATECHECK=Off"

# ---------------------------------------------------------------------
# 2. Font: Nerd Font with ligatures + icons, per-user
# ---------------------------------------------------------------------
$fontInfo = $fontCatalog[$Font]
$detectedFamily = $FontFamily
if (-not $SkipFont) {
    Write-Step "Installing $($fontInfo.Name) (per-user, no admin)"
    try {
        $files = @($fontInfo.Files.Keys)

        # Use bundled fonts if -FontDir was supplied (offline installer); otherwise download them.
        if ($FontDir -and (Test-Path (Join-Path $FontDir $files[0]))) {
            $fontSrc = $FontDir
            Write-Ok "Using bundled fonts from $FontDir"
        } else {
            $fontSrc = Join-Path $env:TEMP "pwsh-terminal-setup-fonts\$Font"
            New-Item -ItemType Directory -Force -Path $fontSrc | Out-Null
            foreach ($f in $files) {
                Invoke-WebRequest -Uri "$($fontInfo.Base)/$f" -OutFile (Join-Path $fontSrc $f) -UseBasicParsing
            }
            Write-Ok "Downloaded $($files.Count) font files"
        }

        # Family name: fixed per catalog entry, or read via GDI+ (never hand-parse the TTF name table).
        $gdiFamily = $null
        Add-Type -AssemblyName System.Drawing
        $pfc = New-Object System.Drawing.Text.PrivateFontCollection
        $pfc.AddFontFile((Join-Path $fontSrc $files[0]))
        $gdiFamily = $pfc.Families[0].Name
        $pfc.Dispose()
        if (-not $detectedFamily) { $detectedFamily = if ($fontInfo.Face) { $fontInfo.Face } else { $gdiFamily } }
        Write-Ok "Font family: $detectedFamily"

        # Install per-user: copy to user fonts dir + register in HKCU.
        $userFonts = Join-Path $env:LOCALAPPDATA 'Microsoft\Windows\Fonts'
        New-Item -ItemType Directory -Force -Path $userFonts | Out-Null
        $regKey = 'HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Fonts'
        foreach ($file in $files) {
            $srcFile = Join-Path $fontSrc $file
            $dest = Join-Path $userFonts $file
            # An installed font is locked while apps use it, so skip identical files
            # (re-runs / upgrades) and only warn if a changed one can't be replaced.
            if (-not (Test-Path $dest) -or (Get-FileHash $srcFile).Hash -ne (Get-FileHash $dest).Hash) {
                try { Copy-Item $srcFile $dest -Force }
                catch [System.IO.IOException] {
                    Write-Warn2 "$file is in use; keeping the installed copy (close apps using it and re-run to update)"
                }
            }
            $valueName = "$gdiFamily$($fontInfo.Files[$file]) (TrueType)"
            New-ItemProperty -Path $regKey -Name $valueName -Value $dest -PropertyType String -Force | Out-Null
        }

        # Broadcast WM_FONTCHANGE so running apps see the font without a reboot.
        if (-not ('FontBroadcast' -as [type])) {
            Add-Type @'
using System;
using System.Runtime.InteropServices;
public class FontBroadcast {
    [DllImport("user32.dll", CharSet=CharSet.Auto)]
    public static extern IntPtr SendMessageTimeout(IntPtr h, uint m, IntPtr w, IntPtr l, uint f, uint t, out IntPtr r);
    public static void Notify() { IntPtr r; SendMessageTimeout((IntPtr)0xffff, 0x001D, IntPtr.Zero, IntPtr.Zero, 0, 1000, out r); }
}
'@
        }
        [FontBroadcast]::Notify()
        Write-Ok "Installed + registered ($($files.Count) styles)"
    } catch {
        Write-Warn2 "Font install failed: $($_.Exception.Message)"
        Write-Warn2 "Continuing. Re-run later, or install the font manually (see the manual setup guide)."
    }
}
if (-not $detectedFamily) { $detectedFamily = $fontInfo.Name }

# ---------------------------------------------------------------------
# 3. PowerShell profile -> $PROFILE.CurrentUserAllHosts (idempotent)
# ---------------------------------------------------------------------
if (-not $SkipProfile) {
    Write-Step "Installing PowerShell profile"
    $src = Join-Path $root 'profile.ps1'
    if (-not (Test-Path $src)) { throw "profile.ps1 not found next to install.ps1 ($src)" }

    $profilePath = $PROFILE.CurrentUserAllHosts
    New-Item -ItemType Directory -Force -Path (Split-Path $profilePath) | Out-Null
    if (Test-Path $profilePath) { Backup-Once $profilePath }

    $existing = if (Test-Path $profilePath) { Get-Content $profilePath -Raw } else { '' }
    if (-not $existing) { $existing = '' }
    # Our header comment block (outside the regions) + the managed regions.
    $ourPatterns = @('(?m)^# =+\r?\n#  PowerShell 7 profile .*?\r?\n(#.*\r?\n)*?# =+\r?\n\s*') +
                   @($managedRegions | ForEach-Object { "(?s)#region $([regex]::Escape($_)).*?#endregion\s*" })
    # Remember where our block sat, so an update stays in place instead of moving
    # below whatever the user (or pwsh-plugins) added after it.
    $insertAt = -1
    foreach ($rx in $ourPatterns) {
        $m = [regex]::Match($existing, $rx)
        if ($m.Success -and ($insertAt -lt 0 -or $m.Index -lt $insertAt)) { $insertAt = $m.Index }
    }
    # Strip them so re-running never duplicates them. Nothing before $insertAt is removed.
    foreach ($rx in $ourPatterns) { $existing = [regex]::Replace($existing, $rx, '') }
    $before = if ($insertAt -ge 0) { $existing.Substring(0, $insertAt).Trim() } else { $existing.Trim() }
    $after  = if ($insertAt -ge 0) { $existing.Substring($insertAt).Trim() } else { '' }
    $ours = (Get-Content $src -Raw).TrimEnd()

    # --- apply command-line customizations to our block before merging ---
    if ($SkipConda) {
        # Drop the whole conda lazy-init region for users who don't use conda.
        $ours = [regex]::Replace($ours, "(?s)#region conda lazy-init.*?#endregion\r?\n?", '').TrimEnd()
        Write-Ok "conda lazy-init block omitted (-SkipConda)"
    }
    if ($PromptSymbol) {
        # Replace the default prompt glyph ([char]0x276F) with the requested one.
        $ours = $ours.Replace('$sym = [char]0x276F', "`$sym = '$($PromptSymbol.Replace("'","''"))'")
        Write-Ok "Prompt symbol set to '$PromptSymbol'"
    }
    if ($PredictionView) {
        $ours = $ours.Replace('Set-PSReadLineOption -PredictionViewStyle ListView',
                              "Set-PSReadLineOption -PredictionViewStyle $PredictionView")
        Write-Ok "PSReadLine prediction view set to $PredictionView"
    }

    $final = (@($before, $ours, $after) | Where-Object { $_ }) -join "`r`n`r`n"
    Set-Content -Path $profilePath -Value $final -Encoding utf8

    $perr = $null
    [System.Management.Automation.Language.Parser]::ParseFile($profilePath, [ref]$null, [ref]$perr) | Out-Null
    if ($perr) { Write-Warn2 "Profile wrote but has parse errors: $perr" } else { Write-Ok "Profile installed and parses cleanly" }
} else {
    Write-Step "Skipping PowerShell profile (-SkipProfile)"
}

# ---------------------------------------------------------------------
# 4. Windows Terminal settings.json (font + Ctrl+Arrow pass-through)
# ---------------------------------------------------------------------
if (-not $SkipTerminal) {
    Write-Step "Patching Windows Terminal settings.json"
    $wt = $wtCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

    if (-not $wt) {
        Write-Warn2 "Windows Terminal settings.json not found. Launch Windows Terminal once, then re-run with -SkipFont."
    } else {
        try {
            Backup-Once $wt
            $j = Get-Content $wt -Raw | ConvertFrom-Json

            # Font on profiles.defaults so every profile inherits it.
            if (-not $j.profiles) { $j | Add-Member -NotePropertyName profiles -NotePropertyValue ([pscustomobject]@{}) -Force }
            if (-not $j.profiles.defaults) { $j.profiles | Add-Member -NotePropertyName defaults -NotePropertyValue ([pscustomobject]@{}) -Force }
            # Keep any existing font settings (e.g. size, weight); only set face + ligature features.
            $wtFont = $j.profiles.defaults.font
            if (-not $wtFont) { $wtFont = [pscustomobject]@{} }
            $wtFont | Add-Member -NotePropertyName face -NotePropertyValue $detectedFamily -Force
            $wtFont | Add-Member -NotePropertyName features -NotePropertyValue ([pscustomobject]@{ liga = 1; calt = 1 }) -Force
            if ($PSBoundParameters.ContainsKey('FontSize')) {
                $wtFont | Add-Member -NotePropertyName size -NotePropertyValue $FontSize -Force
            }
            $j.profiles.defaults | Add-Member -NotePropertyName font -NotePropertyValue $wtFont -Force

            # Optional look-and-feel overrides, applied only when requested.
            $extra = @()
            if ($ColorScheme) {
                $j.profiles.defaults | Add-Member -NotePropertyName colorScheme -NotePropertyValue $ColorScheme -Force
                $extra += "colorScheme='$ColorScheme'"
            }
            if ($PSBoundParameters.ContainsKey('Opacity')) {
                $j.profiles.defaults | Add-Member -NotePropertyName opacity -NotePropertyValue $Opacity -Force
                $j.profiles.defaults | Add-Member -NotePropertyName useAcrylic -NotePropertyValue ($Opacity -lt 100) -Force
                $extra += "opacity=$Opacity"
            }
            if ($PSBoundParameters.ContainsKey('FontSize')) { $extra += "size=$FontSize" }

            # Ctrl+Left/Right (+Shift) pass-through: unbind in Terminal so the shell gets them.
            # Use the current { "id": null } schema (NOT { "command": "unbound" }, which makes
            # WT migrate-and-rewrite settings.json on every launch).
            $unbindKeys = 'ctrl+left','ctrl+right','ctrl+shift+left','ctrl+shift+right'
            $kb = @()
            if ($j.PSObject.Properties['keybindings']) { $kb = @($j.keybindings) }
            foreach ($k in $unbindKeys) {
                if (-not ($kb | Where-Object { $_.keys -eq $k })) { $kb += [pscustomobject]@{ id = $null; keys = $k } }
            }
            $j | Add-Member -NotePropertyName keybindings -NotePropertyValue $kb -Force

            $out = $j | ConvertTo-Json -Depth 32
            $null = $out | ConvertFrom-Json    # validate before writing
            Set-Content -Path $wt -Value $out -Encoding utf8
            $extraMsg = if ($extra) { " [$($extra -join ', ')]" } else { '' }
            Write-Ok "Font set to '$detectedFamily' (liga+calt) on profiles.defaults$extraMsg; Ctrl+Arrow freed"
        } catch {
            Write-Warn2 "Terminal patch failed: $($_.Exception.Message) (settings.json was not modified)"
        }
    }
}

# ---------------------------------------------------------------------
# 5. Verify
# ---------------------------------------------------------------------
Write-Step "Verifying"
$ms = [math]::Round((Measure-Command { pwsh -Command "exit" }).TotalMilliseconds)
Write-Ok "Cold startup: ${ms} ms"
$condaType = (pwsh -Command "(Get-Command conda -ErrorAction SilentlyContinue).CommandType") 2>$null
Write-Ok "conda resolves to: $([string]$condaType) (Function = lazy placeholder; loads on first use)"

Write-Host "`nDone." -ForegroundColor Magenta
Write-Host "Restart Windows Terminal, open a new PowerShell tab, and test:" -ForegroundColor Magenta
Write-Host ('  Write-Host "Icons: `u{e0a0}  `u{f07b}   Ligatures: ==> -> != >= <=   Emoji: ' +
            [char]::ConvertFromUtf32(0x1F680) + ' ' + [char]::ConvertFromUtf32(0x2705) + '"')
Write-Host "Then try Ctrl+Left / Ctrl+Right to jump word-by-word."
Write-Host "Log: $logPath" -ForegroundColor DarkGray
try { Stop-Transcript | Out-Null } catch { }
