# Launch Note Draft

`failureseed` is a local-first CLI for turning failures into reproducible handoff bundles. It can generate deterministic failing fixtures with `seed`, capture a real failing command with `run`, render Markdown with `prompt`, and print or replay the captured command with `replay`.

## Demo Path

```sh
node bin/failureseed.js list
node bin/failureseed.js seed command-fail --output tmp/command-fail
node bin/failureseed.js replay tmp/command-fail/failureseed.json --dry-run
bash examples/redacted-capture-command.sh
```

## What To Emphasize

- Plain JSON and Markdown outputs.
- Built-in deterministic scenarios: `command-fail`, `config-mismatch`, and `missing-script`.
- Local-first workflow with no artifact uploads or hosted backend.
- Redaction for obvious token patterns in captured logs.

## Limitations To Say Out Loud

- Redaction is not a complete secret scanner.
- The tool does not generate fixes.
- The tool does not upload or share artifacts.
- Human review is still required before replaying captured commands.
