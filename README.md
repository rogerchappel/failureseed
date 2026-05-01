# failureseed

failureseed packages failing commands, logs, environment hints, and minimal repo context into a replayable task seed.

## Status

This repository is an early StackForge scaffold. The public contract is the PRD-driven V1 described in `docs/PRD.md`; implementation should stay local-first, deterministic, and reviewable.

## What it will do

- Capture stdout, stderr, exit code, duration, cwd, git ref, and selected environment metadata.
- Generate FAILURESEED.md and failureseed.json for handoff.
- Pack small evidence bundles with allowlisted files.
- Redact environment variables and known token patterns from logs.

## Install

```sh
npm install failureseed
```

For local development from this repository:

```sh
npm install
npm test
```

## CLI sketch

```sh
failureseed run -- pnpm test
failureseed pack --include package.json --include pnpm-lock.yaml
failureseed replay failureseed.json
failureseed prompt failureseed.json --format markdown
```

These commands describe the intended V1 interface from the PRD. Keep implementation changes aligned with `docs/TASKS.md` and update this section as behavior lands.

## Local-first safety

- No hidden network calls in core flows.
- No credential exfiltration or secret value printing.
- No destructive filesystem or Git operations without explicit user intent.
- Prefer deterministic JSON/Markdown output that agents and humans can review.

## Verify

Run the local validation script before opening a pull request:

```sh
npm test
bash scripts/validate.sh
```

`scripts/validate.sh` checks required repo files and runs package scripts that exist. Missing optional `agent-qc` is treated as a skip, not a failure.

## Documentation

- [Product requirements](docs/PRD.md)
- [Task breakdown](docs/TASKS.md)
- [Orchestration plan](docs/ORCHESTRATION.md)
- [Contributing guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## License

MIT
