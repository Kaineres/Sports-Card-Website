# Fires on PostCompact — reads the compaction summary from stdin and spawns a headless
# Claude agent to propagate vault-worthy items back into the docs/ vault.
# Logs to %TEMP%\obsidian-bg-agent.log for debugging.

$summary = [Console]::In.ReadToEnd()

if ([string]::IsNullOrWhiteSpace($summary)) {
    exit 0
}

$vaultRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\docs")

$prompt = @"
Read _CLAUDE.md first. This is a PostCompact background pass — the conversation context was just compacted.

Here is the summary of the session so far:

$summary

Scan the summary for vault-worthy items and update the vault:
- Factual claims about cards, grading services, parallels, or market data → update the relevant wiki/entities/ or wiki/concepts/ page
- Engineering decisions made in conversation → add to engineering/wiki/scratch/ or decisions/ as appropriate
- Ingest work completed in the session → append to the relevant log.md if not already there
- Entities or concepts mentioned 3+ times with no existing wiki page → create a stub with frontmatter and TL;DR

Rules (same as _CLAUDE.md):
- Never modify raw/, superpowers/, or company/
- Never delete or archive anything
- Never silently overwrite a claim that conflicts with new evidence — add a Contradictions section
- Append to log.md, never edit past entries
- If nothing vault-worthy is in the summary, exit without touching any file

End with: list every file you touched and one sentence explaining why.
"@

$logFile = Join-Path $env:TEMP "obsidian-bg-agent.log"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

try {
    $result = $prompt | claude --dangerously-skip-permissions -p --cwd $vaultRoot 2>&1
    Add-Content -Path $logFile -Value "[$timestamp] SUCCESS`n$result`n---"
} catch {
    Add-Content -Path $logFile -Value "[$timestamp] ERROR: $_`n---"
}
