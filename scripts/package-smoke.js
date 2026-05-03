#!/usr/bin/env node
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFile = promisify(execFileCallback);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temp = await mkdtemp(path.join(os.tmpdir(), 'failureseed-package-smoke-'));

async function run(command, args, options = {}) {
  return execFile(command, args, {
    cwd: options.cwd ?? root,
    env: { ...process.env, npm_config_fund: 'false', npm_config_audit: 'false' },
    maxBuffer: 1024 * 1024,
  });
}

try {
  const packResult = await run('npm', ['pack', '--pack-destination', temp]);
  const tarballName = packResult.stdout.trim().split('\n').at(-1);
  if (!tarballName) {
    throw new Error('npm pack did not report a tarball name');
  }

  const tarballPath = path.join(temp, tarballName);
  const appDir = path.join(temp, 'app');
  await run('npm', ['init', '-y'], { cwd: temp });
  await run('npm', ['install', tarballPath], { cwd: temp });

  const checks = [
    ['--help'],
    ['--version'],
    ['list'],
  ];

  for (const args of checks) {
    await run('npx', ['--no-install', 'failureseed', ...args], { cwd: temp });
  }

  await run('npx', ['--no-install', 'failureseed', 'seed', 'command-fail', '--output', path.join(appDir, 'fixture')], { cwd: temp });
  await run('npx', ['--no-install', 'failureseed', 'replay', path.join(appDir, 'fixture', 'failureseed.json'), '--dry-run'], { cwd: temp });

  console.log(`Package smoke passed for ${tarballName}`);
} finally {
  await rm(temp, { recursive: true, force: true });
}
