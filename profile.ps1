# =====================================================================
#  PowerShell 7 profile  —  fast startup + zsh-like prompt + PSReadLine
#  Installed to $PROFILE.CurrentUserAllHosts by install.ps1
#  Portable: no machine- or user-specific paths.
# =====================================================================

#region startup-env (telemetry + update-check opt-out for this session; install.ps1 also persists these at User scope)
$env:POWERSHELL_TELEMETRY_OPTOUT = 1
$env:POWERSHELL_UPDATECHECK = 'Off'
#endregion

#region conda lazy-init (fast startup — conda loads on first use, not on launch)
# Placeholder functions replace the eager `conda init` hook. The first time you call
# conda/activate/deactivate, the real hook is sourced once, then the command re-runs.
function global:Initialize-Conda {
    # Detect conda.exe across common install locations (user first, then system), else PATH.
    $candidates = @(
        "$env:USERPROFILE\anaconda3\Scripts\conda.exe",
        "$env:USERPROFILE\miniconda3\Scripts\conda.exe",
        "$env:USERPROFILE\miniforge3\Scripts\conda.exe",
        "$env:LOCALAPPDATA\anaconda3\Scripts\conda.exe",
        "$env:LOCALAPPDATA\miniconda3\Scripts\conda.exe",
        "$env:LOCALAPPDATA\Continuum\anaconda3\Scripts\conda.exe",
        "$env:ProgramData\anaconda3\Scripts\conda.exe",
        "$env:ProgramData\miniconda3\Scripts\conda.exe"
    )
    $condaExe = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
    if (-not $condaExe) {
        $cmd = Get-Command conda.exe -ErrorAction SilentlyContinue
        if ($cmd) { $condaExe = $cmd.Source }
    }
    if ($condaExe) {
        (& $condaExe "shell.powershell" "hook") | Out-String | Invoke-Expression
    } else {
        Write-Warning "conda.exe not found in common locations or PATH."
    }
}
function global:conda      { Remove-Item Function:\conda, Function:\activate, Function:\deactivate -ErrorAction SilentlyContinue; Initialize-Conda; conda @args }
function global:activate   { Remove-Item Function:\conda, Function:\activate, Function:\deactivate -ErrorAction SilentlyContinue; Initialize-Conda; activate @args }
function global:deactivate { Remove-Item Function:\conda, Function:\activate, Function:\deactivate -ErrorAction SilentlyContinue; Initialize-Conda; deactivate @args }
#endregion

#region prompt (fast, minimal, zsh-like / pure-style — no external modules, no git.exe spawn)
# Reads the branch straight from .git/HEAD on disk, so rendering the prompt never
# launches git. Walks up the tree to support subdirectories and worktrees/submodules.
function global:Get-GitBranch {
    $dir = $PWD.Path
    while ($dir) {
        $git = Join-Path $dir '.git'
        if (Test-Path $git) {
            if (Test-Path $git -PathType Leaf) {
                # ".git" is a file (worktree/submodule): "gitdir: <path>"
                if ((Get-Content $git -Raw) -match 'gitdir:\s*(.+)') {
                    $gd = $matches[1].Trim()
                    if (-not [System.IO.Path]::IsPathRooted($gd)) { $gd = Join-Path $dir $gd }
                    $git = $gd
                }
            }
            $head = Join-Path $git 'HEAD'
            if (Test-Path $head) {
                $h = (Get-Content $head -Raw).Trim()
                if ($h -match 'ref:\s*refs/heads/(.+)') { return $matches[1] }   # on a branch
                if ($h.Length -ge 7) { return $h.Substring(0, 7) }               # detached HEAD
            }
            return $null
        }
        $parent = Split-Path $dir -Parent
        if (-not $parent -or $parent -eq $dir) { break }
        $dir = $parent
    }
    return $null
}

function global:prompt {
    $ok = $?                      # capture success of the last command FIRST
    $e  = [char]27
    $r  = "$e[0m"

    # path: ~ for $HOME, soft blue
    $path = $PWD.Path
    if ($path.StartsWith($HOME, [System.StringComparison]::OrdinalIgnoreCase)) {
        $path = '~' + $path.Substring($HOME.Length)
    }
    $line = "`n$e[38;5;111m$path$r"

    # conda env (only after `conda activate`; CONDA_DEFAULT_ENV is set regardless of changeps1)
    if ($env:CONDA_DEFAULT_ENV) {
        $line += " $e[38;5;108m($env:CONDA_DEFAULT_ENV)$r"
    }

    # git branch — instant, read from .git/HEAD (no git.exe)
    $branch = Get-GitBranch
    if ($branch) {
        $glyph = [char]0xe0a0     # Nerd Font branch glyph
        $line += " $e[38;5;245m$glyph $branch$r"
    }

    # prompt symbol: magenta normally, pink-red after a failed command
    $sym = [char]0x276F           # the prompt char
    $col = if ($ok) { "$e[38;5;170m" } else { "$e[38;5;204m" }
    "$line`n$col$sym$r "
}
#endregion

#region PSReadLine (syntax highlighting + interactive editing)
# Configured only for interactive sessions, so non-interactive `pwsh -Command` / script
# runs don't pay the PSReadLine load cost (keeps scripted startup fast).
$__cmdArgs = [Environment]::GetCommandLineArgs()
$__interactive = ($__cmdArgs -contains '-NoExit') -or
                 -not ($__cmdArgs | Where-Object { $_ -match '^-(c|Command|e|ec|EncodedCommand|f|File|NonInteractive)$' })
if ($__interactive) {
    Import-Module PSReadLine -ErrorAction SilentlyContinue        # ships in-box with PowerShell 7
    try {
        Set-PSReadLineOption -EditMode Windows                    # Windows word-nav defaults
        Set-PSReadLineOption -HistoryNoDuplicates
        Set-PSReadLineOption -HistorySearchCursorMovesToEnd
        Set-PSReadLineOption -MaximumHistoryCount 10000
        Set-PSReadLineOption -BellStyle None

        # Rich prediction: history + any installed predictor plugin, shown as a dropdown list.
        # Needs a VT-capable console; isolate so a non-VT host can't take down the rest.
        try {
            Set-PSReadLineOption -PredictionSource HistoryAndPlugin
            Set-PSReadLineOption -PredictionViewStyle ListView
        } catch { }

        # --- word movement (explicit, so it's guaranteed regardless of edit mode) ---
        Set-PSReadLineKeyHandler -Key Ctrl+LeftArrow        -Function BackwardWord
        Set-PSReadLineKeyHandler -Key Ctrl+RightArrow       -Function ForwardWord
        Set-PSReadLineKeyHandler -Key Ctrl+Shift+LeftArrow  -Function SelectBackwardWord
        Set-PSReadLineKeyHandler -Key Ctrl+Shift+RightArrow -Function SelectForwardWord

        # --- history search + completion ---
        Set-PSReadLineKeyHandler -Key UpArrow   -Function HistorySearchBackward   # prefix history search
        Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward
        Set-PSReadLineKeyHandler -Key Ctrl+r    -Function ReverseSearchHistory
        Set-PSReadLineKeyHandler -Key Tab       -Function MenuComplete            # menu completion

        # --- syntax-highlight palette for a dark background (Tokyo Night-inspired) ---
        Set-PSReadLineOption -Colors @{
            Command          = '#7aa2f7'   # blue
            Parameter        = '#e0af68'   # gold
            Operator         = '#89ddff'   # cyan
            Variable         = '#bb9af7'   # purple
            String           = '#9ece6a'   # green
            Number           = '#ff9e64'   # orange
            Type             = '#2ac3de'   # sky
            Comment          = '#565f89'   # dim slate
            Keyword          = '#f7768e'   # rose
            # extras to keep the ListView prediction + selection legible
            InlinePrediction = '#565f89'
            ListPrediction   = '#7dcfff'
            Selection        = '#283457'
        }
    } catch { }
}
Remove-Variable __cmdArgs, __interactive -ErrorAction SilentlyContinue
#endregion
