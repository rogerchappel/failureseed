# failureseed — QA scenario recipes

Deterministic failure fixtures for training reviews, CI testing, and agent QA.

## Scenario: Test a CI pipeline's failure handling

Generate a stable failing fixture and use it to verify your CI pipeline
actually catches and reports the failure correctly.

```sh
# Create a deterministic failure in a temp dir
mkdir -p /tmp/failing-test
cd /tmp/failing-test

node bin/failureseed.js seed command-fail --output .

# Verify the fixture exists
cat failureseed.json
```

Your CI pipeline should:
1. Detect the non-zero exit code
2. Attach the failureseed.json or FAILURESEED.md to the report

## Scenario: Train agents to read failure bundles

Give agents a `failureseed.json` + `FAILURESEED.md` to practice triaging.
They get exact:
- Original command and working directory
- Exit code, stdout, stderr (with token-redacted output)
- Platform metadata

```sh
# Generate a fixture for training
node bin/failureseed.js seed config-mismatch --output ./training/config-mismatch

# Agent replays it
node bin/failureseed.js replay ./training/config-mismatch/failureseed.json --dry-run
```

## Scenario: Capture a real CI failure for handoff

```sh
# Inside a real failing test run
node bin/failureseed.js run --output ./.failureseed/test-run -- npm test

# Share FAILURESEED.md with the next agent
cat ./.failureseed/test-run/FAILURESEED.md
```

## Scenario: Build a test matrix of failure types

```sh
# List all built-in scenarios
node bin/failureseed.js list

# Seed each one into a test matrix
for scenario in $(node bin/failureseed.js list --json | jq -r '.scenarios[].name'); do
  node bin/failureseed.js seed "$scenario" --output "./test-matrix/$scenario" --dry-run
done
```
