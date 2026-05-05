# Release candidate readiness

Generated: 2026-05-05T21:28:01Z
Branch: `release-candidate/readiness`
Base: `main`

## Verification

Status: PASS

Checks run:
- `npm ci`
- `npm run release:check`
- `bash scripts/validate.sh`
- `node releasebox check .`

## Check output summary

    ## npm ci
    ```
    npm ci
    ```
    ```text
    
    up to date, audited 1 package in 122ms
    
    found 0 vulnerabilities
    ```
    RESULT: 0 (0s)
    
    ## npm run release:check
    ```
    npm run release:check
    ```
    ```text
    
    > failureseed@0.1.0 release:check
    > node scripts/release-check.js
    
    
    ==> project check
    
    > failureseed@0.1.0 check
    > node scripts/check.js
    
    
    ==> unit tests
    
    > failureseed@0.1.0 test
    > node --test
    
    ✔ list of scenarios is stable (1.113125ms)
    ✔ seed writes deterministic manifest and markdown (13.574166ms)
    ✔ runFailureCapture redacts tokens and writes outputs (66.289084ms)
    ✔ replayManifest dry-run reports command (1.999333ms)
    ✔ markdown rendering includes next steps (0.980334ms)
    ℹ tests 5
    ℹ suites 0
    ℹ pass 5
    ℹ fail 0
    ℹ cancelled 0
    ℹ skipped 0
    ℹ todo 0
    ℹ duration_ms 167.701125
    
    ==> build
    
    > failureseed@0.1.0 build
    > node scripts/build.js
    
    
    ==> source smoke
    
    > failureseed@0.1.0 smoke
    > node scripts/smoke.js
    
    
    ==> packed package smoke
    
    > failureseed@0.1.0 package:smoke
    > node scripts/package-smoke.js
    
    Package smoke passed for failureseed-0.1.0.tgz
    
    ==> npm pack dry-run
    failureseed-0.1.0.tgz
    npm notice
    npm notice package: failureseed@0.1.0
    npm notice Tarball Contents
    npm notice 1.1kB LICENSE
    npm notice 4.2kB README.md
    npm notice 412B bin/failureseed.js
    npm notice 1.1kB package.json
    npm notice 5.8kB src/cli.js
    npm notice 188B src/index.js
    npm notice 10.8kB src/lib/failureseed.js
    npm notice 115B tests/fixtures/templates/command-fail/package.json
    npm notice 67B tests/fixtures/templates/command-fail/scripts/fail.js
    npm notice 45B tests/fixtures/templates/config-mismatch/config.json
    npm notice 311B tests/fixtures/templates/config-mismatch/scripts/check-config.js
    npm notice 126B tests/fixtures/templates/missing-script/package.json
    npm notice Tarball Details
    npm notice name: failureseed
    npm notice version: 0.1.0
    npm notice filename: failureseed-0.1.0.tgz
    npm notice package size: 7.8 kB
    npm notice unpacked size: 24.2 kB
    npm notice shasum: aa664fff42245e9ef549d1b7d46c1492c977c135
    npm notice integrity: sha512-DgEkJ3kQbEVEQ[...]sBxRB82/pCV3w==
    npm notice total files: 12
    npm notice
    
    ==> ReleaseBox readiness
    Skipped: set RELEASEBOX_CLI or keep releasebox as a sibling checkout to run `releasebox check .`.
    ```
    RESULT: 0 (4s)
    
    ## bash scripts/validate.sh
    ```
    bash scripts/validate.sh
    ```
    ```text
    Checking failureseed required files...
    PASS: required file exists: README.md
    PASS: required file exists: AGENTS.md
    PASS: required file exists: CONTRIBUTING.md
    PASS: required file exists: SECURITY.md
    PASS: required file exists: .github/pull_request_template.md
    PASS: required file exists: scripts/validate.sh
    
    Checking failureseed required directories...
    PASS: required directory exists: .github
    PASS: required directory exists: docs
    PASS: required directory exists: scripts
    
    Running local project checks where present...
    NOTE: using package manager: npm
    
    > failureseed@0.1.0 check
    > node scripts/check.js
    
    PASS: package script: check
    
    > failureseed@0.1.0 test
    > node --test
    
    ✔ list of scenarios is stable (2.532917ms)
    ✔ seed writes deterministic manifest and markdown (26.827ms)
    ✔ runFailureCapture redacts tokens and writes outputs (81.739833ms)
    ✔ replayManifest dry-run reports command (3.212792ms)
    ✔ markdown rendering includes next steps (2.38075ms)
    ℹ tests 5
    ℹ suites 0
    ℹ pass 5
    ℹ fail 0
    ℹ cancelled 0
    ℹ skipped 0
    ℹ todo 0
    ℹ duration_ms 255.842833
    PASS: package script: test
    
    > failureseed@0.1.0 build
    > node scripts/build.js
    
    PASS: package script: build
    NOTE: agent-qc not installed; skipping optional agent check
    
    Validation passed.
    ```
    RESULT: 0 (1s)
    
    ## ReleaseBox check
    ```
    node '/Users/roger/Developer/my-opensource/releasebox/bin/releasebox.js' check .
    ```
    ```text
    ✅ releasebox config: node-cli
    ✅ ci workflow: .github/workflows/ci.yml
    ✅ release dry run workflow: .github/workflows/release-dry-run.yml
    ✅ task breakdown: docs/TASKS.md
    ✅ orchestration plan: docs/ORCHESTRATION.md
    ✅ dependabot config: .github/dependabot.yml
    ✅ npm test script: node --test
    ✅ build script: node scripts/build.js
    ✅ smoke script: node scripts/smoke.js
    ✅ bin entry: {"failureseed":"./bin/failureseed.js"}
    ```
    RESULT: 0 (0s)
    
