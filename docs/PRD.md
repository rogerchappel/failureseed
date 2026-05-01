# PRD: failureseed

Status: ready
Decision: build now

## Scorecard

Total: 89/100
Band: build now
Last scored: 2026-05-02
Scored by: Atlas

| Criterion | Points | Notes |
|---|---:|---|
| Problem pain | 18/20 | Clear pain in high-throughput agentic development workflows. |
| Demand signal | 18/20 | Strong internal OSS sprint need plus adjacent public tooling demand. |
| V1 buildability | 18/20 | Feasible as a deterministic local-first CLI with fixtures and smoke tests. |
| Differentiation | 13/15 | Focused on agent handoff/review gaps rather than broad platform replacement. |
| Agentic workflow leverage | 15/15 | Directly improves agent dispatch, supervision, verification, or handoff quality. |
| Distribution potential | 7/10 | Easy to demo with real repo/PR workflows and build-in-public examples. |

## Pitch

A CLI that packages failing commands, logs, environment hints, and minimal repo context into a reproducible agent task seed.

## Why It Matters

The hardest agent handoff is “the build failed, figure it out.” FailureSeed captures the exact failure shape and produces a small, reviewable bundle another agent or human can replay without reading a giant transcript.

## Qualification

### Pub Test

“A CLI that packages failing commands, logs, environment hints, and minimal repo context into a reproducible agent task seed.” is understandable in one sentence by a developer who has used coding agents, CI, or multi-branch OSS workflows.

### Competitors / Adjacent Tools

- CI artifacts — preserve logs but are platform-specific and noisy.
- reprozip/Nix flakes/devcontainers — deeper reproducibility tools, but heavier than a V1 failure handoff.
- taskbrief/repoctx — adjacent context tools; FailureSeed specializes in failed command capture and replay instructions.

### Star / Demand Signal

Agent coding workflows, CI-heavy repos, and local OSS factories repeatedly need better proof, isolation, reproducibility, and review affordances. The recent sprint pipeline already has `repoctx`, `taskbrief`, `branchbrief`, `qualitygate`, `prpack`, `tooltrace`, `stackforge`, and `crewcmd`; this idea fills a neighboring gap without replacing those projects.

### Real Problem

Roger's OSS sprint is pushing multiple agents, repos, branches, checks, and handoffs at once. This project removes one recurring source of ambiguity or failure from that pipeline while remaining useful to any developer team adopting coding agents.

### V1 Buildability

V1 can be implemented as a TypeScript CLI using deterministic filesystem/git/process operations, fixture repos, and Markdown/JSON output. It does not require a hosted backend, hidden LLM calls, or privileged credentials.

## V1 Scope

- `failureseed run -- <command>` captures stdout, stderr, exit code, duration, cwd, git ref, and selected env metadata.
- Generate `FAILURESEED.md` and `failureseed.json`.
- Include replay command, suspected touched files, recent commits, and next diagnostic prompts.
- Redact environment variables and known token patterns.
- `failureseed pack` creates a small tarball with logs and selected config files.
- `failureseed replay` validates the command path exists and reruns locally.

## Out of Scope

- No uploading artifacts.
- No collecting full home-directory state.
- No automatic fix generation in V1.

## CLI/API Sketch

```bash
failureseed run -- pnpm test
failureseed pack --include package.json --include pnpm-lock.yaml
failureseed replay failureseed.json
failureseed prompt failureseed.json --format markdown
```

## Verification

- Tests for command capture success/failure paths.
- Redaction tests for env/log tokens.
- Fixture repo smoke test for pack/replay.
- Snapshot tests for generated Markdown prompt.

## Agent Prompt

Build `failureseed`, a local-first CLI for converting failed commands into reproducible agent task bundles. It should capture enough evidence to replay and debug while aggressively avoiding secrets and large accidental artifacts.
