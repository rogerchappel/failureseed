#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

out_dir="${1:-tmp/redacted-capture}"
rm -rf "$out_dir"

set +e
node bin/failureseed.js run --output "$out_dir" -- node -e "console.error('token=ghp_1234567890abcdefghijk'); process.exit(1)"
status=$?
set -e

echo "capture command exit: $status"
node bin/failureseed.js prompt "$out_dir/failureseed.json" > "$out_dir/RENDERED.md"
echo "wrote $out_dir/failureseed.json"
echo "wrote $out_dir/FAILURESEED.md"
echo "wrote $out_dir/RENDERED.md"
