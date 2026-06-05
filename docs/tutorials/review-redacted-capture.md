# Review A Redacted Failure Capture

This recipe captures a deliberately failing command that prints an obvious token-shaped string. It is designed to show the handoff shape and redaction guardrail without using a real secret.

## Run The Demo

```sh
npm install
bash examples/redacted-capture-command.sh
```

The script writes:

- `tmp/redacted-capture/failureseed.json`
- `tmp/redacted-capture/FAILURESEED.md`
- `tmp/redacted-capture/RENDERED.md`

## Inspect The Capture

Open the generated Markdown and JSON files. The important fields for a reviewer are:

- the captured command
- the working directory
- the exit code
- the redacted stderr/stdout summary
- the replay instructions

The example uses `ghp_1234567890abcdefghijk` because it matches an obvious token pattern. Do not treat this as broad secret scanning; it is a small redaction guardrail for handoff logs.

## Replay Plan

Before rerunning a captured command, print the dry-run plan:

```sh
node bin/failureseed.js replay tmp/redacted-capture/failureseed.json --dry-run
```

Only run the real replay after checking that the command and working directory are appropriate for your machine.
