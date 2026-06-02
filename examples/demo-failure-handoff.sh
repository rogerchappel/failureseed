#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

out_dir="${1:-tmp/demo-handoff}"
rm -rf "$out_dir"

echo "failureseed demo: built-in scenarios"
node bin/failureseed.js list

echo ""
echo "failureseed demo: create deterministic failing fixture"
node bin/failureseed.js seed command-fail --output "$out_dir/command-fail"

echo ""
echo "failureseed demo: replay plan"
node bin/failureseed.js replay "$out_dir/command-fail/failureseed.json" --dry-run

echo ""
echo "failureseed demo: capture a real failing command with redaction"
set +e
node bin/failureseed.js run --output "$out_dir/capture" -- node -e "console.error('token=ghp_1234567890abcdefghijk'); process.exit(1)"
capture_exit=$?
set -e

echo "capture exit: $capture_exit"
node - "$out_dir/capture/failureseed.json" <<'NODE'
const fs = require("node:fs");
const manifest = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
console.log(`captured command: ${manifest.capture.command.join(" ")}`);
console.log(`captured exit: ${manifest.capture.exitCode}`);
console.log(`stderr redacted: ${manifest.capture.stderr.includes("[REDACTED]")}`);
NODE
