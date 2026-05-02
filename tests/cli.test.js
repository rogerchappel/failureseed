import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp } from 'node:fs/promises';
import {
  builtInScenarios,
  createSeed,
  loadManifest,
  renderManifestMarkdown,
  replayManifest,
  runFailureCapture,
} from '../src/index.js';

const snapshotDir = path.resolve('tests/snapshots');

test('list of scenarios is stable', () => {
  assert.deepEqual(
    builtInScenarios.map(({ id }) => id),
    ['command-fail', 'config-mismatch', 'missing-script'],
  );
});

test('seed writes deterministic manifest and markdown', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'failureseed-seed-'));
  const result = await createSeed({ scenarioId: 'command-fail', outputDir: path.join(temp, 'fixture') });
  const manifest = await loadManifest(result.manifestPath);
  const markdown = await fs.readFile(result.markdownPath, 'utf8');
  const manifestSnapshot = await fs.readFile(path.join(snapshotDir, 'command-fail.manifest.json'), 'utf8');
  const markdownSnapshot = await fs.readFile(path.join(snapshotDir, 'command-fail.md'), 'utf8');

  const normalizedManifest = `${JSON.stringify({
    ...manifest,
    scenario: { ...manifest.scenario, outputDir: '<OUTPUT_DIR>' },
    replay: { ...manifest.replay, cwd: '<OUTPUT_DIR>' },
  }, null, 2)}\n`;

  assert.equal(normalizedManifest, manifestSnapshot);
  assert.equal(markdown.replaceAll(result.outputDir, '<OUTPUT_DIR>'), markdownSnapshot);
});

test('runFailureCapture redacts tokens and writes outputs', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'failureseed-run-'));
  const fixture = path.join(temp, 'fixture.js');
  await fs.writeFile(fixture, "console.error('token=ghp_1234567890abcdefghijk'); process.exit(1);\n");
  const previous = process.cwd();
  process.chdir(temp);
  try {
    const result = await runFailureCapture({ command: [process.execPath, fixture], outputDir: path.join(temp, 'capture') });
    assert.equal(result.capture.exitCode, 1);
    assert.match(result.capture.stderr, /\[REDACTED(?:_TOKEN)?\]/);
    const manifest = await loadManifest(result.manifestPath);
    assert.equal(manifest.capture.exitCode, 1);
    assert.match(manifest.capture.stderr, /\[REDACTED(?:_TOKEN)?\]/);
  } finally {
    process.chdir(previous);
  }
});

test('replayManifest dry-run reports command', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'failureseed-replay-'));
  const result = await createSeed({ scenarioId: 'config-mismatch', outputDir: path.join(temp, 'fixture') });
  const replay = await replayManifest(result.manifestPath, { dryRun: true });
  assert.equal(replay.exitCode, 0);
  assert.match(replay.summary, /node scripts\/check-config.js/);
});

test('markdown rendering includes next steps', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'failureseed-markdown-'));
  const result = await createSeed({ scenarioId: 'missing-script', outputDir: path.join(temp, 'fixture') });
  const manifest = await loadManifest(result.manifestPath);
  const markdown = renderManifestMarkdown(manifest);
  assert.match(markdown, /## Next steps/);
  assert.match(markdown, /Inspect the listed touched files/);
});
