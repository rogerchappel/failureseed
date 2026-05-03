#!/usr/bin/env node
import { access } from 'node:fs/promises';
import path from 'node:path';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFile = promisify(execFileCallback);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function run(label, command, args, options = {}) {
  process.stdout.write(`\n==> ${label}\n`);
  const child = execFile(command, args, {
    cwd: root,
    env: { ...process.env, npm_config_fund: 'false', npm_config_audit: 'false' },
    maxBuffer: 1024 * 1024 * 10,
    ...options,
  });
  const { stdout, stderr } = await child;
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

await run('project check', 'npm', ['run', 'check']);
await run('unit tests', 'npm', ['test']);
await run('build', 'npm', ['run', 'build']);
await run('source smoke', 'npm', ['run', 'smoke']);
await run('packed package smoke', 'npm', ['run', 'package:smoke']);
await run('npm pack dry-run', 'npm', ['pack', '--dry-run']);

const configuredReleasebox = process.env.RELEASEBOX_CLI;
const siblingReleasebox = path.resolve(root, '..', 'releasebox', 'bin', 'releasebox.js');
const releaseboxCli = configuredReleasebox || ((await exists(siblingReleasebox)) ? siblingReleasebox : null);

if (releaseboxCli) {
  await run('ReleaseBox readiness', process.execPath, [releaseboxCli, 'check', '.']);
} else {
  process.stdout.write('\n==> ReleaseBox readiness\n');
  process.stdout.write('Skipped: set RELEASEBOX_CLI or keep releasebox as a sibling checkout to run `releasebox check .`.\n');
}
