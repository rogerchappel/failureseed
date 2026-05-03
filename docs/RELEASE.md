# Release checklist

failureseed releases are reviewed and dry-run first. The project currently produces a GitHub release artifact only; npm publishing and Homebrew updates remain disabled in `releasebox.config.json` until explicitly approved.

## Local candidate gate

Run the full deterministic gate before opening or approving a release PR:

```sh
npm ci
npm run release:check
```

The gate runs:

- repository file checks (`npm run check`)
- unit tests (`npm test`)
- build proof (`npm run build`)
- source CLI smoke (`npm run smoke`)
- packed package install smoke (`npm run package:smoke`)
- `npm pack --dry-run`
- `releasebox check .` when the ReleaseBox CLI is available as `RELEASEBOX_CLI` or in a sibling `../releasebox` checkout

## Packed package smoke

`npm run package:smoke` creates a tarball with `npm pack`, installs that tarball into a temporary npm project, then verifies the installed `failureseed` binary can:

- print `--help`
- print `--version`
- list built-in scenarios
- seed and dry-run replay the `command-fail` fixture

This proves the package artifact works after installation, not just from source.

## GitHub Actions

- `CI` runs `npm run release:check` on pushes and pull requests.
- `Release dry run` runs the same gate and uploads reviewable release notes on relevant PRs or manual dispatch.
- `Release` is tag-gated (`v*.*.*`) and creates a GitHub release with the packed npm artifact. It does not run `npm publish`.

## Human review before release

Before pushing a release tag, confirm:

- [ ] CI is green on `main`
- [ ] `npm run release:check` passed locally or in CI
- [ ] `npm run package:smoke` passed against the packed tarball
- [ ] release notes were reviewed
- [ ] npm publishing is still intentionally disabled, or explicit approval exists to change it
- [ ] a release-readiness issue tracks any remaining blockers
