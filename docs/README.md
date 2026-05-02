# failureseed Documentation

## Core docs

- [README](../README.md) — quickstart, CLI reference, safety model, non-goals
- [PRD](./PRD.md) — product intent and verification goals
- [TASKS](./TASKS.md) — implementation slices and acceptance criteria
- [ORCHESTRATION](./ORCHESTRATION.md) — suggested agent lanes and review gates

## MVP notes

The current MVP focuses on deterministic failure fixtures plus reproducible failure captures:

- built-in scenarios for agent QA
- manifest + Markdown handoff output
- dry-run/json-friendly CLI flows
- local replay without network access

## Suggested review path

1. Run the 60-second demo in the main README.
2. Inspect `tests/snapshots/` for stable output expectations.
3. Run `bash scripts/validate.sh` before handoff.
