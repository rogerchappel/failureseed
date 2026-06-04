# failureseed — social hook pack (draft)

## X / Twitter (280 chars max)

### Hook 1 — Real failures
```
Agent A: hits a test failure.
Usually you get "something broke" and nothing else.

With failureseed:

failureseed run -- node test.js
→ failureseed.json + FAILURESEED.md

Exact command, cwd, exit code, redacted output.

Agent B replays it deterministically.

https://github.com/rogerchappel/failureseed
```

### Hook 2 — Deterministic failures for QA
```
Need to test your failure handler but don't want to break something real?

failureseed seed command-fail --output ./tmp

Generates a stable failing command — no network, no side effects.

Great for CI test matrices and agent training.

https://github.com/rogerchappel/failureseed
```

### Hook 3 — The handoff
```
The worst kind of bug handoff:

"It failed. I don't know why. Good luck."

The failureseed handoff:

"Here's the exact command, cwd, exit code 1, stdout, and stderr.
Tokens are redacted. Replay it with: failureseed replay ..."

https://github.com/rogerchappel/failureseed
```

## LinkedIn
```
Reproducing failures is harder than it should be. You know something broke, but the next developer doesn't know your exact command, working directory, environment, or what stderr actually said.

failureseed captures real command failures into a JSON + Markdown bundle with:
- Exact command and cwd
- Exit code, stdout, stderr (with obvious tokens redacted)
- Compact platform metadata
- A replayable manifest

For QA: it also generates deterministic synthetic failures you can use to test your CI pipelines without breaking real things.

Local-first. No network calls. No hidden backends.

https://github.com/rogerchappel/failureseed
```

## Reddit / Hacker News title ideas
- "A CLI to capture real command failures into reviewable JSON bundles"
- "Deterministic failing fixtures for agent QA — no network, no side effects"
- "I built a tool to make failure handoffs between agents actually useful"
