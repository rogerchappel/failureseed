import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import crypto from 'node:crypto';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templateRoot = path.resolve(__dirname, '../../tests/fixtures/templates');

export const builtInScenarios = [
  {
    id: 'command-fail',
    summary: 'A project whose test script deterministically exits 1.',
    command: ['node', 'scripts/fail.js'],
    touchedFiles: ['package.json', 'scripts/fail.js'],
    tags: ['command', 'exit-code'],
  },
  {
    id: 'config-mismatch',
    summary: 'A config validator that rejects an intentional expected/actual mismatch.',
    command: ['node', 'scripts/check-config.js'],
    touchedFiles: ['config.json', 'scripts/check-config.js'],
    tags: ['config', 'assertion'],
  },
  {
    id: 'missing-script',
    summary: 'A package manifest that references a missing script file.',
    command: ['node', 'scripts/missing-entry.js'],
    touchedFiles: ['package.json'],
    tags: ['missing-file', 'node'],
  },
];

export async function createSeed({ scenarioId, outputDir, dryRun = false, manifestName = 'failureseed.json' }) {
  const scenario = builtInScenarios.find((item) => item.id === scenarioId);
  if (!scenario) {
    throw createError(`Unknown scenario: ${scenarioId}`, 'UNKNOWN_SCENARIO');
  }

  const destination = path.resolve(outputDir ?? path.join(process.cwd(), '.failureseed', scenarioId));
  const manifestPath = path.join(destination, manifestName);
  const markdownPath = path.join(destination, 'FAILURESEED.md');
  const files = await collectTemplateFiles(scenario.id);

  const manifest = {
    schemaVersion: 1,
    kind: 'failureseed-fixture',
    createdAt: '2026-05-02T00:00:00.000Z',
    scenario: {
      ...scenario,
      outputDir: destination,
    },
    replay: {
      cwd: destination,
      command: scenario.command,
      shellEscaped: scenario.command.map(shellEscape).join(' '),
    },
    files: files.map((file) => ({
      path: file.relativePath,
      sha256: file.sha256,
      bytes: Buffer.byteLength(file.content, 'utf8'),
    })),
    diagnostics: [
      'Run the replay command inside the fixture directory.',
      'Read FAILURESEED.md for a compact agent handoff prompt.',
      'Inspect the listed touched files before changing anything.',
    ],
    safety: {
      localFirst: true,
      networkAccessRequired: false,
      destructiveActions: false,
    },
  };

  const markdown = renderManifestMarkdown(manifest);

  if (!dryRun) {
    await fs.mkdir(destination, { recursive: true });
    for (const file of files) {
      const target = path.join(destination, file.relativePath);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, file.content);
    }
    await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    await fs.writeFile(markdownPath, `${markdown}\n`);
  }

  return {
    dryRun,
    outputDir: destination,
    manifestPath,
    markdownPath,
    scenario: manifest.scenario,
    replay: manifest.replay,
    files: manifest.files,
    diagnostics: manifest.diagnostics,
  };
}

export async function runFailureCapture({ command, outputDir, label = 'capture' }) {
  if (!Array.isArray(command) || command.length === 0) {
    throw createError('Command is required', 'MISSING_COMMAND');
  }

  const startedAt = Date.now();
  const cwd = process.cwd();
  let captured;
  try {
    const result = await execFileAsync(command[0], command.slice(1), {
      cwd,
      encoding: 'utf8',
      timeout: 30_000,
      maxBuffer: 1024 * 1024,
      env: process.env,
    });
    captured = {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: 0,
    };
  } catch (error) {
    captured = {
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? error.message,
      exitCode: typeof error.code === 'number' ? error.code : 1,
    };
  }

  const durationMs = Date.now() - startedAt;
  const destination = path.resolve(outputDir ?? path.join(cwd, '.failureseed', safeSlug(label)));
  const manifestPath = path.join(destination, 'failureseed.json');
  const markdownPath = path.join(destination, 'FAILURESEED.md');

  const manifest = {
    schemaVersion: 1,
    kind: 'failureseed-capture',
    createdAt: new Date(startedAt).toISOString(),
    capture: {
      cwd,
      command,
      shellEscaped: command.map(shellEscape).join(' '),
      exitCode: captured.exitCode,
      durationMs,
      stdout: redactSecrets(captured.stdout),
      stderr: redactSecrets(captured.stderr),
    },
    environment: {
      node: process.version,
      platform: `${process.platform}-${process.arch}`,
      hostname: os.hostname(),
      git: await getGitSummary(cwd),
    },
    diagnostics: buildDiagnostics(command, captured.exitCode),
    safety: {
      redacted: true,
      networkAccessRequired: false,
    },
  };

  const markdown = renderManifestMarkdown(manifest);
  await fs.mkdir(destination, { recursive: true });
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await fs.writeFile(markdownPath, `${markdown}\n`);

  return {
    manifestPath,
    markdownPath,
    capture: manifest.capture,
    environment: manifest.environment,
    diagnostics: manifest.diagnostics,
    markdown,
  };
}

export async function replayManifest(manifestPath, { dryRun = false } = {}) {
  const manifest = await loadManifest(manifestPath);
  const command = manifest.replay?.command ?? manifest.capture?.command;
  const cwd = manifest.replay?.cwd ?? manifest.capture?.cwd;
  if (!command || !cwd) {
    throw createError('Manifest is missing replay information', 'INVALID_MANIFEST');
  }

  if (dryRun) {
    return {
      dryRun: true,
      summary: `[dry-run] ${command.map(shellEscape).join(' ')} @ ${cwd}`,
      exitCode: 0,
    };
  }

  try {
    const result = await execFileAsync(command[0], command.slice(1), {
      cwd,
      encoding: 'utf8',
      timeout: 30_000,
      maxBuffer: 1024 * 1024,
    });
    return {
      dryRun: false,
      summary: result.stdout.trim() || 'Command completed successfully.',
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: 0,
    };
  } catch (error) {
    return {
      dryRun: false,
      summary: redactSecrets((error.stderr ?? error.message ?? '').trim()),
      stdout: redactSecrets(error.stdout ?? ''),
      stderr: redactSecrets(error.stderr ?? error.message ?? ''),
      exitCode: typeof error.code === 'number' ? error.code : 1,
    };
  }
}

export async function loadManifest(manifestPath) {
  const raw = await fs.readFile(path.resolve(manifestPath), 'utf8');
  return JSON.parse(raw);
}

export function renderManifestMarkdown(manifest) {
  const lines = ['# FAILURESEED'];

  if (manifest.scenario) {
    lines.push('', '## Scenario');
    lines.push(`- id: ${manifest.scenario.id}`);
    lines.push(`- summary: ${manifest.scenario.summary}`);
    lines.push(`- replay: ${manifest.replay.shellEscaped}`);
  }

  if (manifest.capture) {
    lines.push('', '## Capture');
    lines.push(`- command: ${manifest.capture.shellEscaped}`);
    lines.push(`- exit code: ${manifest.capture.exitCode}`);
    lines.push(`- duration ms: ${manifest.capture.durationMs}`);
    lines.push(`- cwd: ${manifest.capture.cwd}`);
  }

  if (manifest.files?.length) {
    lines.push('', '## Files');
    for (const file of manifest.files) {
      lines.push(`- ${file.path} (${file.bytes} bytes)`);
    }
  }

  if (manifest.environment) {
    lines.push('', '## Environment');
    lines.push(`- node: ${manifest.environment.node}`);
    lines.push(`- platform: ${manifest.environment.platform}`);
    if (manifest.environment.git?.branch) {
      lines.push(`- git branch: ${manifest.environment.git.branch}`);
    }
    if (manifest.environment.git?.head) {
      lines.push(`- git head: ${manifest.environment.git.head}`);
    }
  }

  if (manifest.capture) {
    lines.push('', '## Logs', '```text');
    if (manifest.capture.stdout) {
      lines.push('$ stdout');
      lines.push(manifest.capture.stdout.trimEnd());
    }
    if (manifest.capture.stderr) {
      lines.push('$ stderr');
      lines.push(manifest.capture.stderr.trimEnd());
    }
    lines.push('```');
  }

  if (manifest.diagnostics?.length) {
    lines.push('', '## Next steps');
    for (const item of manifest.diagnostics) {
      lines.push(`- ${item}`);
    }
  }

  return lines.join('\n');
}

function redactSecrets(value) {
  return value
    .replace(/(ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{10,}/g, '[REDACTED_TOKEN]')
    .replace(/AKIA[0-9A-Z]{16}/g, '[REDACTED_AWS_KEY]')
    .replace(/(api[_-]?key|token|secret)\s*[=:]\s*[^\s"']+/gi, '$1=[REDACTED]');
}

async function collectTemplateFiles(scenarioId) {
  const base = path.join(templateRoot, scenarioId);
  const files = [];

  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(absolute);
      } else {
        const content = await fs.readFile(absolute, 'utf8');
        files.push({
          relativePath: path.relative(base, absolute),
          content,
          sha256: crypto.createHash('sha256').update(content).digest('hex'),
        });
      }
    }
  }

  await walk(base);
  return files;
}

async function getGitSummary(cwd) {
  try {
    const { stdout: branchRaw } = await execFileAsync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd, encoding: 'utf8' });
    const { stdout: headRaw } = await execFileAsync('git', ['rev-parse', '--short', 'HEAD'], { cwd, encoding: 'utf8' });
    return { branch: branchRaw.trim(), head: headRaw.trim() };
  } catch {
    return { branch: null, head: null };
  }
}

function buildDiagnostics(command, exitCode) {
  const rendered = command.map(shellEscape).join(' ');
  return [
    `Replay locally: ${rendered}`,
    `Confirm the exit code (${exitCode}) is expected before editing.`,
    'Review stderr first; it is usually the fastest path to a root cause.',
  ];
}

function safeSlug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'capture';
}

function shellEscape(part) {
  if (/^[A-Za-z0-9_./:-]+$/.test(part)) {
    return part;
  }
  return `'${part.replace(/'/g, `'\\''`)}'`;
}

function createError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}
