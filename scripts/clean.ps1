param(
    [switch]$Client,
    [switch]$Server,
    [switch]$All,
    [switch]$NodeModules
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

if (-not $Client -and -not $Server -and -not $All) {
    $All = $true
}

function Remove-ProjectPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RelativePath
    )

    $target = Join-Path $root $RelativePath
    $resolvedRoot = (Resolve-Path -LiteralPath $root).Path
    $targetParent = Split-Path -Parent $target

    if (-not (Test-Path -LiteralPath $targetParent)) {
        return
    }

    $resolvedParent = (Resolve-Path -LiteralPath $targetParent).Path

    if (-not $resolvedParent.StartsWith($resolvedRoot, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to clean outside project root: $target"
    }

    if (Test-Path -LiteralPath $target) {
        Remove-Item -LiteralPath $target -Recurse -Force
        Write-Host "Removed $RelativePath"
    } else {
        Write-Host "Skipped $RelativePath"
    }
}

if ($All -or $Client) {
    Remove-ProjectPath "client\dist"
    Remove-ProjectPath "client\node_modules\.vite"

    if ($NodeModules) {
        Remove-ProjectPath "client\node_modules"
    }
}

if ($All -or $Server) {
    if ($NodeModules) {
        Remove-ProjectPath "server\node_modules"
    }
}

Write-Host "Clean complete."
