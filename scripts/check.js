#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'bin/failureseed.js',
  'src/cli.js',
  'src/index.js',
  'src/lib/failureseed.js',
  'tests/cli.test.js'
];

for (const file of required) {
  await fs.access(path.join(root, file));
}
