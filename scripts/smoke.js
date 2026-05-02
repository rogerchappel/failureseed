#!/usr/bin/env node
import { mkdtemp } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFile = promisify(execFileCallback);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temp = await mkdtemp(path.join(os.tmpdir(), 'failureseed-smoke-'));
const cli = path.join(root, 'bin/failureseed.js');
await execFile(process.execPath, [cli, 'seed', 'command-fail', '--output', path.join(temp, 'fixture')]);
await execFile(process.execPath, [cli, 'replay', path.join(temp, 'fixture', 'failureseed.json'), '--dry-run']);
