#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(path.join(dist, 'bin'), { recursive: true });
await fs.mkdir(path.join(dist, 'src/lib'), { recursive: true });
await fs.copyFile(path.join(root, 'bin/failureseed.js'), path.join(dist, 'bin/failureseed.js'));
await fs.copyFile(path.join(root, 'src/cli.js'), path.join(dist, 'src/cli.js'));
await fs.copyFile(path.join(root, 'src/index.js'), path.join(dist, 'src/index.js'));
await fs.copyFile(path.join(root, 'src/lib/failureseed.js'), path.join(dist, 'src/lib/failureseed.js'));
