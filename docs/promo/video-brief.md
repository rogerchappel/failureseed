# Video brief: turn a failing command into a handoff bundle

## Angle

Show failureseed as a local-first way to make failures reproducible for another
developer or agent without asking them to reverse-engineer terminal history.

## Demo beats

1. Run `node bin/failureseed.js list` to show the built-in scenarios.
2. Run `node bin/failureseed.js seed command-fail --output tmp/command-fail`.
3. Open `tmp/command-fail/failureseed.json` and `tmp/command-fail/FAILURESEED.md`.
4. Run `node bin/failureseed.js replay tmp/command-fail/failureseed.json --dry-run`.
5. Run a captured failure with an obvious token pattern:

```sh
node bin/failureseed.js run --output tmp/capture -- node -e "console.error('token=ghp_1234567890abcdefghijk'); process.exit(1)"
```

6. Open `tmp/capture/FAILURESEED.md` and point out the command, exit code, and
   redacted output.

## Grounded talking points

- Commands include `list`, `seed`, `run`, `prompt`, and `replay`.
- Built-in scenarios currently include `command-fail`, `config-mismatch`, and
  `missing-script`.
- Output is plain JSON and Markdown.

## Claims to avoid

- Do not call redaction a complete secret scanner.
- Do not claim failureseed uploads, hosts, or shares artifacts.
- Do not imply it generates fixes.
