# Injected at SessionStart — outputs vault context to stdout so Claude Code includes
# it as a system-reminder at the start of every session in this project.

$vaultRoot = Join-Path $PSScriptRoot "..\..\docs"

$files = @(
    "CRITICAL_FACTS.md",
    "_CLAUDE.md",
    "cards\index.md",
    "engineering\index.md"
)

foreach ($file in $files) {
    $path = Join-Path $vaultRoot $file
    if (Test-Path $path) {
        Write-Output "=== $file ==="
        Get-Content $path -Raw
        Write-Output ""
    }
}
