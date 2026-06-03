#!/usr/bin/env node
/**
 * PostToolUse hook — fire-and-forget QMD re-index after any vault .md write.
 * Debounced: one worker per 30s window, never blocks the agent.
 */

import { spawn } from "node:child_process";
import { readFileSync, statSync, utimesSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DEBOUNCE_MS = 30_000;
const VAULT_PATH = "C:\\Users\\kaink\\OneDrive\\Documents\\GitHub\\Sports-Card-Website\\docs";
const QMD_JS = "C:\\Users\\kaink\\AppData\\Roaming\\npm\\node_modules\\@tobilu\\qmd\\dist\\cli\\qmd.js";
const INDEX = "slabmetrics-docs";
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const SENTINEL = join(SCRIPT_DIR, ".qmd-refresh-sentinel");

let input;
try {
  const raw = readFileSync(process.stdin.fd, "utf8");
  input = JSON.parse(raw);
} catch {
  process.exit(0);
}

const filePath = input?.tool_input?.file_path ?? "";
if (!filePath || !filePath.endsWith(".md")) process.exit(0);
if (!filePath.replace(/\\/g, "/").includes(VAULT_PATH.replace(/\\/g, "/"))) process.exit(0);

// Debounce: skip if sentinel was touched within DEBOUNCE_MS
try {
  const mtime = statSync(SENTINEL).mtimeMs;
  if (Date.now() - mtime < DEBOUNCE_MS) process.exit(0);
} catch { /* sentinel doesn't exist yet */ }

// Touch sentinel
try { writeFileSync(SENTINEL, ""); } catch { process.exit(0); }

// Fire-and-forget detached qmd update
spawn(
  process.execPath,
  [QMD_JS, "update", "-c", INDEX],
  { detached: true, stdio: "ignore", windowsHide: true }
).unref();

process.exit(0);
