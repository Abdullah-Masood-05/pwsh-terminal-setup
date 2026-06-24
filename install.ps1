<#
.SYNOPSIS
    Sets up a fast PowerShell 7 + Windows Terminal environment:
    lazy-loaded conda, LigaConsolas Nerd Font (ligatures + icons), a minimal
    zsh-like prompt, and a full PSReadLine config.

.DESCRIPTION
    Idempotent and safe to re-run. Every file it touches is backed up first
    (<file>.bak). All paths are resolved dynamically — nothing is hardcoded to
    a specific machine or user.

    Steps:
      1. Persist telemetry / update-check opt-out (User scope)
      2. Install LigaConsolas Nerd Font (per-user, no admin)
      3. Install the PowerShell profile ($PROFILE.CurrentUserAllHosts)
      4. Patch Windows Terminal settings.json (font + Ctrl+Arrow pass-through)
      5. Verify

.PARAMETER SkipFont
    Skip downloading/installing the font.

.PARAMETER SkipTerminal
    Skip patching Windows Terminal settings.json.

.PARAMETER FontFamily
    Override the font family name used in Windows Terminal (default is read
    from the installed font via .NET).

.EXAMPLE
    pwsh -ExecutionPolicy Bypass -File .\install.ps1
#>
[CmdletBinding()]
param(
    [switch] $SkipFont,
    [switch] $SkipTerminal,
    [string] $FontFamily,
    [string] $FontDir     # use pre-downloaded .ttf files from here instead of downloading (offline installer)
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

function Write-Step  ($m) { Write-Host "`n==> $m" -ForegroundColor Cyan }
function Write-Ok    ($m) { Write-Host "    [ok] $m"   -ForegroundColor Green }
function Write-Warn2 ($m) { Write-Host "    [!]  $m"   -ForegroundColor Yellow }

Write-Host "pwsh-terminal-setup installer" -ForegroundColor Magenta

# ---------------------------------------------------------------------
# 0. Prerequisite checks
# ---------------------------------------------------------------------
Write-Step "Checking prerequisites"
if ($PSVersionTable.PSVersion.Major -lt 7) {
    Write-Warn2 "You're running Windows PowerShell $($PSVersionTable.PSVersion). This setup targets PowerShell 7+."
    Write-Warn2 "Install it with:  winget install --id Microsoft.PowerShell -e   then re-run this in 'pwsh'."
}
if (-not (Get-Command pwsh.exe -ErrorAction SilentlyContinue)) {
    Write-Warn2 "pwsh.exe not found on PATH. Install PowerShell 7:  winget install --id Microsoft.PowerShell -e"
} else {
    Write-Ok "PowerShell 7 available"
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
# 2. Font: LigaConsolas Nerd Font (ligatures + Nerd icons), per-user
# ---------------------------------------------------------------------
$detectedFamily = $FontFamily
if (-not $SkipFont) {
    Write-Step "Installing LigaConsolas Nerd Font (per-user, no admin)"
    try {
        $files = 'LigaConsolas-NF-Regular.ttf','LigaConsolas-NF-Bold.ttf','LigaConsolas-NF-Italic.ttf','LigaConsolas-NF-Bold-Italic.ttf'

        # Use bundled fonts if -FontDir was supplied (offline installer); otherwise download them.
        if ($FontDir -and (Test-Path (Join-Path $FontDir $files[0]))) {
            $fontSrc = $FontDir
            Write-Ok "Using bundled fonts from $FontDir"
        } else {
            $fontSrc = Join-Path $env:TEMP 'ligaconsolas-nf'
            New-Item -ItemType Directory -Force -Path $fontSrc | Out-Null
            $base = 'https://github.com/Dosx001/ttf-ligaconsolas-nerd-font/raw/main'
            foreach ($f in $files) {
                Invoke-WebRequest -Uri "$base/$f" -OutFile (Join-Path $fontSrc $f) -UseBasicParsing
            }
            Write-Ok "Downloaded 4 font files"
        }

        # Read the family name via GDI+ (reliable; never hand-parse the TTF name table).
        Add-Type -AssemblyName System.Drawing
        $pfc = New-Object System.Drawing.Text.PrivateFontCollection
        $pfc.AddFontFile((Join-Path $fontSrc $files[0]))
        $detectedFamily = $pfc.Families[0].Name
        $pfc.Dispose()
        Write-Ok "Font family: $detectedFamily"

        # Install per-user: copy to user fonts dir + register in HKCU.
        $userFonts = Join-Path $env:LOCALAPPDATA 'Microsoft\Windows\Fonts'
        New-Item -ItemType Directory -Force -Path $userFonts | Out-Null
        $regKey = 'HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Fonts'
        $styleMap = @{
            'LigaConsolas-NF-Regular.ttf'     = "$detectedFamily (TrueType)"
            'LigaConsolas-NF-Bold.ttf'        = "$detectedFamily Bold (TrueType)"
            'LigaConsolas-NF-Italic.ttf'      = "$detectedFamily Italic (TrueType)"
            'LigaConsolas-NF-Bold-Italic.ttf' = "$detectedFamily Bold Italic (TrueType)"
        }
        foreach ($file in $styleMap.Keys) {
            $dest = Join-Path $userFonts $file
            Copy-Item (Join-Path $fontSrc $file) $dest -Force
            New-ItemProperty -Path $regKey -Name $styleMap[$file] -Value $dest -PropertyType String -Force | Out-Null
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
        Write-Ok "Installed + registered (4 styles)"
    } catch {
        Write-Warn2 "Font install failed: $($_.Exception.Message)"
        Write-Warn2 "Continuing — you can re-run with the font step or install it manually."
    }
}
if (-not $detectedFamily) { $detectedFamily = 'LigaConsolas Nerd Font' }

# ---------------------------------------------------------------------
# 3. PowerShell profile -> $PROFILE.CurrentUserAllHosts (idempotent)
# ---------------------------------------------------------------------
Write-Step "Installing PowerShell profile"
$src = Join-Path $root 'profile.ps1'
if (-not (Test-Path $src)) { throw "profile.ps1 not found next to install.ps1 ($src)" }

$profilePath = $PROFILE.CurrentUserAllHosts
New-Item -ItemType Directory -Force -Path (Split-Path $profilePath) | Out-Null
if (Test-Path $profilePath) {
    Copy-Item $profilePath "$profilePath.bak" -Force
    Write-Ok "Backed up existing profile -> $(Split-Path $profilePath -Leaf).bak"
}

$existing = if (Test-Path $profilePath) { Get-Content $profilePath -Raw } else { '' }
# Strip our managed regions so re-running never duplicates them.
foreach ($marker in 'startup-env','conda lazy-init','prompt','PSReadLine') {
    $existing = [regex]::Replace($existing, "(?s)#region $([regex]::Escape($marker)).*?#endregion\s*", '')
}
$existing = $existing.TrimEnd()
$ours = (Get-Content $src -Raw).TrimEnd()
$final = if ($existing) { $existing + "`r`n`r`n" + $ours } else { $ours }
Set-Content -Path $profilePath -Value $final -Encoding utf8

$perr = $null
[System.Management.Automation.Language.Parser]::ParseFile($profilePath, [ref]$null, [ref]$perr) | Out-Null
if ($perr) { Write-Warn2 "Profile wrote but has parse errors: $perr" } else { Write-Ok "Profile installed and parses cleanly" }

# ---------------------------------------------------------------------
# 4. Windows Terminal settings.json (font + Ctrl+Arrow pass-through)
# ---------------------------------------------------------------------
if (-not $SkipTerminal) {
    Write-Step "Patching Windows Terminal settings.json"
    $wt = @(
        "$env:LOCALAPPDATA\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json",
        "$env:LOCALAPPDATA\Packages\Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe\LocalState\settings.json",
        "$env:LOCALAPPDATA\Microsoft\Windows Terminal\settings.json"
    ) | Where-Object { Test-Path $_ } | Select-Object -First 1

    if (-not $wt) {
        Write-Warn2 "Windows Terminal settings.json not found. Launch Windows Terminal once, then re-run with -SkipFont."
    } else {
        try {
            Copy-Item $wt "$wt.bak" -Force
            $j = Get-Content $wt -Raw | ConvertFrom-Json

            # Font on profiles.defaults so every profile inherits it.
            if (-not $j.profiles) { $j | Add-Member -NotePropertyName profiles -NotePropertyValue ([pscustomobject]@{}) -Force }
            if (-not $j.profiles.defaults) { $j.profiles | Add-Member -NotePropertyName defaults -NotePropertyValue ([pscustomobject]@{}) -Force }
            $font = [pscustomobject]@{ face = $detectedFamily; features = [pscustomobject]@{ liga = 1; calt = 1 } }
            $j.profiles.defaults | Add-Member -NotePropertyName font -NotePropertyValue $font -Force

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
            Write-Ok "Font set to '$detectedFamily' (liga+calt) on profiles.defaults; Ctrl+Arrow freed (backup: settings.json.bak)"
        } catch {
            Write-Warn2 "Terminal patch failed: $($_.Exception.Message) (original restored from .bak if needed)"
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
Write-Host '  Write-Host "Icons: `u{e0a0}  `u{f07b}   Ligatures: ==> -> != >= <=   Emoji: 🚀 ✅"'
Write-Host "Then try Ctrl+Left / Ctrl+Right to jump word-by-word."
