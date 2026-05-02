import process from 'node:process';
import {
  builtInScenarios,
  createSeed,
  loadManifest,
  renderManifestMarkdown,
  replayManifest,
  runFailureCapture,
} from './lib/failureseed.js';

const VERSION = '0.1.0';

export async function main(argv) {
  const args = [...argv];
  const command = args.shift();

  if (!command || command === '--help' || command === 'help') {
    printHelp();
    return;
  }

  if (command === '--version' || command === 'version') {
    process.stdout.write(`${VERSION}\n`);
    return;
  }

  switch (command) {
    case 'list':
      await handleList(args);
      return;
    case 'seed':
    case 'generate':
      await handleSeed(args);
      return;
    case 'run':
      await handleRun(args);
      return;
    case 'prompt':
      await handlePrompt(args);
      return;
    case 'replay':
      await handleReplay(args);
      return;
    default:
      throw cliError(`Unknown command: ${command}`, 'UNKNOWN_COMMAND', 1);
  }
}

async function handleList(args) {
  const { flags } = parseFlags(args, { boolean: ['json'] });
  if (flags.json) {
    process.stdout.write(`${JSON.stringify({ scenarios: builtInScenarios }, null, 2)}\n`);
    return;
  }

  const lines = ['failureseed scenarios'];
  for (const scenario of builtInScenarios) {
    lines.push(`- ${scenario.id}: ${scenario.summary}`);
  }
  process.stdout.write(`${lines.join('\n')}\n`);
}

async function handleSeed(args) {
  const scenarioId = args[0];
  if (!scenarioId || scenarioId.startsWith('-')) {
    throw cliError('seed requires a scenario id. Try: failureseed list', 'MISSING_SCENARIO', 1);
  }

  const { flags } = parseFlags(args.slice(1), {
    boolean: ['dry-run', 'json'],
    string: ['output', 'manifest-name'],
  });

  const result = await createSeed({
    scenarioId,
    outputDir: flags.output,
    dryRun: Boolean(flags['dry-run']),
    json: Boolean(flags.json),
    manifestName: flags['manifest-name'],
  });

  if (flags.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  const lines = [
    `Created scenario ${result.scenario.id}`,
    `Output: ${result.outputDir}`,
    `Manifest: ${result.manifestPath}`,
    `Command: ${result.replay.command.join(' ')}`,
  ];
  if (result.dryRun) {
    lines.unshift('[dry-run] No files were written.');
  }
  process.stdout.write(`${lines.join('\n')}\n`);
}

async function handleRun(args) {
  const separatorIndex = args.indexOf('--');
  if (separatorIndex === -1 || separatorIndex === args.length - 1) {
    throw cliError('run requires `-- <command ...>`', 'MISSING_COMMAND', 1);
  }

  const before = args.slice(0, separatorIndex);
  const commandArgs = args.slice(separatorIndex + 1);
  const { flags } = parseFlags(before, {
    boolean: ['json'],
    string: ['output', 'label'],
  });

  const result = await runFailureCapture({
    command: commandArgs,
    outputDir: flags.output,
    label: flags.label,
  });

  if (flags.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(`${result.markdown}\n`);
  }

  process.exitCode = result.capture.exitCode;
}

async function handlePrompt(args) {
  const manifestPath = args[0];
  if (!manifestPath || manifestPath.startsWith('-')) {
    throw cliError('prompt requires a manifest path', 'MISSING_MANIFEST', 1);
  }

  const { flags } = parseFlags(args.slice(1), {
    string: ['format'],
  });

  const manifest = await loadManifest(manifestPath);
  if ((flags.format ?? 'markdown') === 'json') {
    process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
    return;
  }

  process.stdout.write(`${renderManifestMarkdown(manifest)}\n`);
}

async function handleReplay(args) {
  const manifestPath = args[0];
  if (!manifestPath || manifestPath.startsWith('-')) {
    throw cliError('replay requires a manifest path', 'MISSING_MANIFEST', 1);
  }

  const { flags } = parseFlags(args.slice(1), {
    boolean: ['dry-run', 'json'],
  });

  const result = await replayManifest(manifestPath, { dryRun: Boolean(flags['dry-run']) });
  if (flags.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(`${result.summary}\n`);
  }
  process.exitCode = result.exitCode ?? 0;
}

function parseFlags(args, schema) {
  const flags = {};
  const rest = [];
  const booleanFlags = new Set(schema.boolean ?? []);
  const stringFlags = new Set(schema.string ?? []);

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (!token.startsWith('--')) {
      rest.push(token);
      continue;
    }

    const name = token.slice(2);
    if (booleanFlags.has(name)) {
      flags[name] = true;
      continue;
    }

    if (stringFlags.has(name)) {
      const next = args[index + 1];
      if (!next || next.startsWith('--')) {
        throw cliError(`Missing value for --${name}`, 'MISSING_FLAG_VALUE', 1);
      }
      flags[name] = next;
      index += 1;
      continue;
    }

    throw cliError(`Unknown flag: --${name}`, 'UNKNOWN_FLAG', 1);
  }

  return { flags, rest };
}

function printHelp() {
  process.stdout.write(`failureseed ${VERSION}\n\n` +
`Generate deterministic failing fixtures and reproducible failure bundles.\n\n` +
`Usage:\n` +
`  failureseed list [--json]\n` +
`  failureseed seed <scenario> [--output <dir>] [--manifest-name <name>] [--dry-run] [--json]\n` +
`  failureseed run [--output <dir>] [--label <name>] [--json] -- <command ...>\n` +
`  failureseed prompt <manifest.json> [--format markdown|json]\n` +
`  failureseed replay <manifest.json> [--dry-run] [--json]\n` +
`  failureseed --version\n`);
}

function cliError(message, code, exitCode) {
  const error = new Error(message);
  error.code = code;
  error.exitCode = exitCode;
  return error;
}
