#!/usr/bin/env node
import { main } from '../src/cli.js';

main(process.argv.slice(2)).catch((error) => {
  const payload = error?.code && error?.message
    ? { error: { code: error.code, message: error.message } }
    : { error: { code: 'UNEXPECTED_ERROR', message: error?.message ?? String(error) } };
  process.stderr.write(`${JSON.stringify(payload, null, 2)}\n`);
  process.exit(error?.exitCode ?? 1);
});
