---
name: Release readiness
about: Track whether this project can safely release end-to-end
title: 'Release readiness: <version or date>'
labels: release,e2e,ci
---

## Release goal

- Target version/date:
- Release owner:
- Package/artifact targets:

## Required checks

- [ ] CI is green on main
- [ ] Source CLI/app smoke passes
- [ ] Installed/package artifact smoke passes
- [ ] Realistic e2e fixture passes
- [ ] Release notes generated from merged PRs/issues
- [ ] GitHub release dry-run completed
- [ ] Publish dry-run completed, if applicable

## Blockers

- [ ] No known release blockers

## Post-release verification

- [ ] Install from public package/artifact
- [ ] Run documented quickstart
- [ ] Confirm version output matches release
