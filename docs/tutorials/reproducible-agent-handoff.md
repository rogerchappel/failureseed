# Create a reproducible failure handoff

This recipe shows both sides of failureseed's MVP workflow: generate a
deterministic failing fixture for QA, then capture a real failing command into a
JSON and Markdown bundle.

## Run the demo

```sh
bash examples/demo-failure-handoff.sh
```

The demo writes files under `tmp/demo-handoff`:

- `command-fail/failureseed.json`
- `command-fail/FAILURESEED.md`
- `capture/failureseed.json`
- `capture/FAILURESEED.md`

It also runs `replay --dry-run` so reviewers can see the command and working
directory before executing anything.

## Why this is useful

Use `failureseed seed command-fail` when you need a stable failing fixture for a
QA or agent-evaluation loop. Use `failureseed run -- <command>` when a real
command failed and another reviewer needs the command, captured output, compact
environment metadata, and replay instructions in one handoff.

## Safety boundaries

failureseed does not upload artifacts, run hidden network calls, or generate
fixes. It redacts obvious token patterns from captured logs, but the generated
manifest and Markdown should still be reviewed before sharing outside a trusted
channel.
