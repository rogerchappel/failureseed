# failureseed

failureseed is a local-first CLI for two adjacent jobs:

1. generate small deterministic failing fixtures for agent QA
2. capture a real failing command into a reviewable JSON/Markdown handoff bundle

It stays intentionally small: no network calls, no hosted backend, no secret dumping.

## What ships in this MVP

- Built-in deterministic failure scenarios
- Fixture manifests (`failureseed.json`) and human handoff docs (`FAILURESEED.md`)
- `list`, `seed`, `run`, `prompt`, and `replay` commands
- `--dry-run` and `--json` support where it matters
- Redaction for obvious token patterns in captured logs
- Snapshot and smoke coverage for stable output

## 60-second demo

```sh
npm test
node bin/failureseed.js list
node bin/failureseed.js seed command-fail --output ./tmp/command-fail
node bin/failureseed.js replay ./tmp/command-fail/failureseed.json --dry-run
node bin/failureseed.js run --output ./tmp/capture -- node -e "console.error('token=ghp_1234567890abcdefghijk'); process.exit(1)"
```

You should end up with:

- `tmp/command-fail/failureseed.json`
- `tmp/command-fail/FAILURESEED.md`
- `tmp/capture/failureseed.json`
- `tmp/capture/FAILURESEED.md`

For a guided version that prints a compact handoff summary, run:

```sh
bash examples/demo-failure-handoff.sh
```

See [Create a reproducible failure handoff](docs/tutorials/reproducible-agent-handoff.md)
for the full recipe.

For a focused capture and redaction walkthrough, run [`examples/redacted-capture-command.sh`](examples/redacted-capture-command.sh) and read [`docs/tutorials/review-redacted-capture.md`](docs/tutorials/review-redacted-capture.md).

## Install

Install from npm after release:

```sh
npm install -g failureseed
failureseed list
```

From a checkout:

```sh
npm install
```

Run the CLI directly during local development:

```sh
node bin/failureseed.js --help
```

## CLI reference

### `failureseed list`

List built-in deterministic scenarios.

```sh
node bin/failureseed.js list
node bin/failureseed.js list --json
```

### `failureseed seed <scenario>`

Create a failing fixture directory and manifest.

```sh
node bin/failureseed.js seed command-fail --output ./tmp/command-fail
node bin/failureseed.js seed config-mismatch --dry-run --json
```

Current scenarios:

- `command-fail` — script exits with code 1
- `config-mismatch` — config validation fails deterministically
- `missing-script` — package references a missing entry file

### `failureseed run -- <command ...>`

Capture a real command failure into JSON/Markdown.

```sh
node bin/failureseed.js run --output ./tmp/capture -- npm test
node bin/failureseed.js run --json -- node -e "console.error('boom'); process.exit(1)"
```

### `failureseed prompt <manifest>`

Render a manifest as Markdown or echo the JSON.

```sh
node bin/failureseed.js prompt ./tmp/command-fail/failureseed.json
node bin/failureseed.js prompt ./tmp/command-fail/failureseed.json --format json
```

### `failureseed replay <manifest>`

Replay a fixture/capture command or print the exact replay plan.

```sh
node bin/failureseed.js replay ./tmp/command-fail/failureseed.json --dry-run
node bin/failureseed.js replay ./tmp/command-fail/failureseed.json
```

## Agent handoff example

A tight OSS sprint flow can look like this:

1. Agent A hits a failing check.
2. Agent A runs `failureseed run --output ./.failureseed/lint -- pnpm test`.
3. Agent A pastes `FAILURESEED.md` into the handoff or attaches `failureseed.json`.
4. Agent B replays from the exact command, cwd, and summarized environment.
5. For QA or training, use `failureseed seed command-fail` to generate a stable failure without touching a real repo.

That gives you both real-world captures and deterministic synthetic failures for review pipelines.

## Local-first safety model

- No hidden network calls in the core workflow
- No destructive filesystem or git operations
- No environment dump beyond compact platform metadata
- Obvious token patterns are redacted from captured stderr/stdout
- Manifests are plain files you can inspect before sharing

## Non-goals

- No artifact uploads
- No autonomous fix generation
- No full machine snapshotting
- No hidden CI integration magic
- No broad secret scanning beyond obvious patterns in this MVP

## Verification

```sh
npm run check
npm test
npm run build
npm run smoke
bash scripts/validate.sh
npm run package:smoke
npm run release:check
```

## Documentation

- [Product requirements](docs/PRD.md)
- [Task breakdown](docs/TASKS.md)
- [Orchestration plan](docs/ORCHESTRATION.md)
- [Documentation index](docs/README.md)
- [Release checklist](docs/RELEASE.md)
- [Contributing guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## License

MIT
