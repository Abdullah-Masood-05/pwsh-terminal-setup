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
      0. Check prerequisites (PowerShell 7, Windows Terminal) — offers to
         install anything missing via winget instead of just stopping
      1. Persist telemetry / update-check opt-out (User scope)
      2. Install LigaConsolas Nerd Font (per-user, no admin)
      3. Install the PowerShell profile ($PROFILE.CurrentUserAllHosts)
      4. Patch Windows Terminal settings.json (font + Ctrl+Arrow pass-through)
      5. Verify

    If this script is started from Windows PowerShell 5.1 and PowerShell 7 is
    missing, it offers to install PowerShell 7 via winget and then re-launches
    itself under pwsh automatically, so the rest of the setup still runs on 7.

    Most settings can be customized from the command line — see the parameters
    below — so you can tune the font, colors, prompt, and prediction style
    without hand-editing any file first.

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
    Override the font family name used in Windows Terminal (default is read
    from the installed font via .NET).

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
    '❯').

.PARAMETER PredictionView
    PSReadLine prediction view style: ListView (default) or InlineView.

.PARAMETER Yes
    Don't prompt before installing a missing prerequisite (PowerShell 7 or
    Windows Terminal) via winget — assume "yes" to every confirmation. Use
    this for unattended runs.

.EXAMPLE
    pwsh -ExecutionPolicy Bypass -File .\install.ps1

.EXAMPLE
    # Customize the terminal settings in one run:
    .\install.ps1 -FontSize 12 -ColorScheme 'One Half Dark' -PromptSymbol '➜' -PredictionView InlineView

.EXAMPLE
    # Install the prompt + editing config only, without touching conda or fonts:
    .\install.ps1 -SkipConda -SkipFont

.EXAMPLE
    # Unattended: auto-install any missing prerequisite, no prompts:
    .\install.ps1 -Yes
#>
[CmdletBinding()]
param(
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
    [Alias('y')]
    [switch] $Yes
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

function Write-Step  ($m) { Write-Host "`n==> $m" -ForegroundColor Cyan }
function Write-Ok    ($m) { Write-Host "    [ok] $m"   -ForegroundColor Green }
function Write-Warn2 ($m) { Write-Host "    [!]  $m"   -ForegroundColor Yellow }

# Always keep a log on disk — the console this runs in (e.g. from the .exe
# installer) may close before there's time to read it.
$logPath = Join-Path $env:TEMP 'pwsh-terminal-setup-install.log'
try { Start-Transcript -Path $logPath -Append -ErrorAction Stop | Out-Null } catch { }

Write-Host "pwsh-terminal-setup installer" -ForegroundColor Magenta

# ---------------------------------------------------------------------
# 0. Prerequisite checks — offers to install anything missing via winget
#    instead of just stopping and telling you to do it yourself.
# ---------------------------------------------------------------------
Write-Step "Checking prerequisites"

$winget = Get-Command winget.exe -ErrorAction SilentlyContinue

function Confirm-Action ($Message) {
    if ($Yes) { return $true }
    try {
        $resp = Read-Host "$Message [Y/n]"
    } catch {
        # Non-interactive host (no console to prompt on) — don't hang, just skip.
        Write-Warn2 "Non-interactive session — skipping. Re-run with -Yes to auto-confirm."
        return $false
    }
    return ($resp -eq '' -or $resp -match '^(y|yes)$')
}

function Sync-PathFromRegistry {
    # An installer that just ran (winget/MSI) updates PATH in the registry, but
    # this process's $env:Path is a stale copy taken at process start — refresh it
    # so a just-installed .exe can be found without opening a new terminal.
    $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $user    = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = @($machine, $user) -join ';'
}

function Install-Prerequisite ($Name, $WingetId, [scriptblock] $Test) {
    if (& $Test) { Write-Ok "$Name available"; return $true }

    Write-Warn2 "$Name was not found."
    if (-not $winget) {
        Write-Warn2 "winget isn't available either, so this can't be installed automatically."
        Write-Warn2 "Install $Name manually, then re-run this script."
        return $false
    }
    if (-not (Confirm-Action "Install $Name now via winget?")) {
        Write-Warn2 "Skipped. Install $Name manually (winget install --id $WingetId -e), then re-run this script."
        return $false
    }

    Write-Step "Installing $Name"
    # Let winget resolve its own install scope — forcing --scope user can make it
    # install a redundant duplicate alongside an existing machine-scope install
    # instead of recognizing it as already present.
    winget install --id $WingetId -e --accept-package-agreements --accept-source-agreements
    $wingetExit = $LASTEXITCODE
    Sync-PathFromRegistry

    if (& $Test) { Write-Ok "$Name installed"; return $true }
    Write-Warn2 "$Name still isn't detected in this session (winget exit code: $wingetExit). Reopen your terminal and re-run this script."
    return $false
}

$hasPwsh = Install-Prerequisite -Name 'PowerShell 7' -WingetId 'Microsoft.PowerShell' -Test {
    [bool](Get-Command pwsh.exe -ErrorAction SilentlyContinue)
}

if (-not $SkipTerminal) {
    Install-Prerequisite -Name 'Windows Terminal' -WingetId 'Microsoft.WindowsTerminal' -Test {
        [bool]((Get-Command wt.exe -ErrorAction SilentlyContinue) -or
               (Get-AppxPackage -Name 'Microsoft.WindowsTerminal*' -ErrorAction SilentlyContinue))
    } | Out-Null
}

# If we're on Windows PowerShell 5.1 but pwsh is available (it already was, or
# we just installed it above), hand off so the rest of the setup runs on 7.
if ($PSVersionTable.PSVersion.Major -lt 7 -and $hasPwsh -and -not $env:PWSH_TERMINAL_SETUP_RELAUNCHED) {
    Write-Step "Switching to PowerShell 7"
    $forward = @()
    foreach ($key in $PSBoundParameters.Keys) {
        $val = $PSBoundParameters[$key]
        if ($val -is [switch] -or $val -is [bool]) {
            if ([bool]$val) { $forward += "-$key" }
        } else {
            $forward += "-$key"; $forward += [string]$val
        }
    }
    $env:PWSH_TERMINAL_SETUP_RELAUNCHED = '1'
    # Release the log file before handing off — the child process appends to
    # the same path, which would otherwise fail silently while we still hold it open.
    try { Stop-Transcript | Out-Null } catch { }
    & pwsh -NoLogo -NoProfile -ExecutionPolicy Bypass -File $PSCommandPath @forward
    exit $LASTEXITCODE
}

if ($PSVersionTable.PSVersion.Major -lt 7) {
    Write-Warn2 "Continuing on Windows PowerShell $($PSVersionTable.PSVersion) — PowerShell 7 wasn't installed, so some steps may not apply correctly."
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
if (-not $SkipProfile) {
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

    $final = if ($existing) { $existing + "`r`n`r`n" + $ours } else { $ours }
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
    $wt = @(
        "$env:LOCALAPPDATA\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json",
        "$env:LOCALAPPDATA\Packages\Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe\LocalState\settings.json",
        "$env:LOCALAPPDATA\Microsoft\Windows Terminal\settings.json"
    ) | Where-Object { Test-Path $_ } | Select-Object -First 1

    if (-not $wt) {
        Write-Warn2 "Windows Terminal settings.json not found. It's created the first time Windows Terminal runs — launch it once, then re-run this script. Re-running is safe: the font and profile steps just redo idempotently."
    } else {
        try {
            Copy-Item $wt "$wt.bak" -Force
            $j = Get-Content $wt -Raw | ConvertFrom-Json

            # Font on profiles.defaults so every profile inherits it.
            if (-not $j.profiles) { $j | Add-Member -NotePropertyName profiles -NotePropertyValue ([pscustomobject]@{}) -Force }
            if (-not $j.profiles.defaults) { $j.profiles | Add-Member -NotePropertyName defaults -NotePropertyValue ([pscustomobject]@{}) -Force }
            $font = [pscustomobject]@{ face = $detectedFamily; features = [pscustomobject]@{ liga = 1; calt = 1 } }
            if ($PSBoundParameters.ContainsKey('FontSize')) {
                $font | Add-Member -NotePropertyName size -NotePropertyValue $FontSize -Force
            }
            $j.profiles.defaults | Add-Member -NotePropertyName font -NotePropertyValue $font -Force

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
            Write-Ok "Font set to '$detectedFamily' (liga+calt) on profiles.defaults$extraMsg; Ctrl+Arrow freed (backup: settings.json.bak)"
        } catch {
            Write-Warn2 "Terminal patch failed: $($_.Exception.Message) (original restored from .bak if needed)"
        }
    }
}

# ---------------------------------------------------------------------
# 5. Verify
# ---------------------------------------------------------------------
Write-Step "Verifying"
if (Get-Command pwsh.exe -ErrorAction SilentlyContinue) {
    $ms = [math]::Round((Measure-Command { pwsh -Command "exit" }).TotalMilliseconds)
    Write-Ok "Cold startup: ${ms} ms"
    $condaType = (pwsh -Command "(Get-Command conda -ErrorAction SilentlyContinue).CommandType") 2>$null
    Write-Ok "conda resolves to: $([string]$condaType) (Function = lazy placeholder; loads on first use)"
} else {
    Write-Warn2 "Skipping startup check — pwsh.exe still isn't available in this session. The rest of the setup (font, profile, Windows Terminal) is done; open pwsh once PowerShell 7 is installed."
}

Write-Host "`nDone." -ForegroundColor Magenta
Write-Host "Restart Windows Terminal, open a new PowerShell tab, and test:" -ForegroundColor Magenta
Write-Host '  Write-Host "Icons: `u{e0a0}  `u{f07b}   Ligatures: ==> -> != >= <=   Emoji: 🚀 ✅"'
Write-Host "Then try Ctrl+Left / Ctrl+Right to jump word-by-word."
Write-Host "`nLog saved to: $logPath" -ForegroundColor DarkGray

try { Stop-Transcript | Out-Null } catch { }
Start-Sleep -Seconds 4   # give a visible console a moment to be read before it closes
