import { readFileSync } from 'node:fs';
const config = JSON.parse(readFileSync(new URL('../config.json', import.meta.url), 'utf8'));
if (config.expected !== config.actual) {
  console.error(`config mismatch: expected ${config.expected} but got ${config.actual}`);
  process.exit(1);
}
console.log('config ok');
