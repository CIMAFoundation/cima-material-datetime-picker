import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

process.chdir(fileURLToPath(new URL('..', import.meta.url)));
const manifestPath = 'projects/material-datetime-picker/package.json';
const packageDirectory = './dist/material-datetime-picker';
const registry = 'https://registry.npmjs.org/';
const dryRun = process.argv.includes('--dry-run');

/** Runs a command without shell interpolation, optionally capturing its output. */
function run(command, args = [], capture = false, env = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    env: { ...process.env, ...env },
  })?.trim();
}

/** Rejects an unmet release prerequisite with an actionable message. */
function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}

/** Compares stable semantic versions numerically. */
function compareVersions(left, right) {
  const a = left.split('.').map(Number);
  const b = right.split('.').map(Number);
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

/** Checks prerequisites, prepares the package, then performs the confirmed release. */
async function release() {
  requireCondition(process.argv.slice(2).every(arg => arg === '--dry-run'),
    'Usage: npm run release [-- --dry-run]');
  requireCondition(!run('git', ['status', '--porcelain'], true),
    'Commit or stash all changes before releasing.');
  requireCondition(run('git', ['branch', '--show-current'], true) === 'main',
    'Run the release from main.');
  run('gh', ['auth', 'status']);
  run('npm', ['whoami', '--registry', registry]);
  run('git', ['fetch', 'origin', '--tags']);
  requireCondition(run('git', ['rev-parse', 'HEAD'], true)
    === run('git', ['rev-parse', 'origin/main'], true),
  'Push or pull main first: HEAD must match origin/main.');

  const originalManifest = readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(originalManifest);
  const tags = run('git', ['tag', '--merged', 'HEAD', '--sort=-version:refname'], true)
    .split('\n').filter(tag => /^v\d+\.\d+\.\d+$/.test(tag));
  const latestTag = tags[0];
  if (latestTag) {
    requireCondition(run('git', ['rev-list', '-n', '1', latestTag], true)
      !== run('git', ['rev-parse', 'HEAD'], true), 'No new commits since the latest tag.');
  }
  const publishedVersions = JSON.parse(run('npm', [
    'view', manifest.name, 'versions', '--json', '--registry', registry,
  ], true));
  const versions = [manifest.version, ...tags.map(tag => tag.slice(1)),
    ...[publishedVersions].flat()].filter(version => /^\d+\.\d+\.\d+$/.test(version));
  const current = versions.sort(compareVersions).at(-1);
  const parts = current.split('.').map(Number);
  const proposed = `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  console.log(`Latest tag: ${latestTag ?? 'none'}; current version: ${current}; proposed: ${proposed}`);
  if (dryRun) {
    console.log('Dry run complete. No files, commits, tags or publications changed.');
    return;
  }

  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  let manifestChanged = false;
  let staged = false;
  let committed = false;
  let published = false;
  let tag;
  try {
    const version = (await prompt.question(`Version [${proposed}]: `)).trim() || proposed;
    requireCondition(/^\d+\.\d+\.\d+$/.test(version)
      && compareVersions(version, current) > 0, `Enter a stable version greater than ${current}.`);
    tag = `v${version}`;
    requireCondition(!run('git', ['tag', '--list', tag], true), `${tag} already exists.`);
    manifest.version = version;
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    manifestChanged = true;
    run('npm', ['run', 'test:lib', '--', '--watch=false'], false, { TZ: 'Europe/Rome' });
    run('npm', ['test', '--', '--watch=false']);
    run('npm', ['run', 'build:lib']);
    run('npm', ['pack', packageDirectory, '--dry-run']);
    run('git', ['diff', '--check']);
    run('git', ['diff', '--', manifestPath]);
    const answer = await prompt.question(
      `Commit, push ${tag}, publish ${manifest.name}@${version} and create GitHub Release? [y/N]: `);
    if (answer.trim().toLowerCase() !== 'y') {
      console.log('Release cancelled.');
      return;
    }
    run('git', ['add', '--', manifestPath]);
    staged = true;
    run('git', ['commit', '-m', `chore: release ${tag}`]);
    committed = true;
    run('git', ['tag', '-a', tag, '-m', `Release ${tag}`]);
    run('git', ['push', '--atomic', 'origin', 'main', tag]);
    run('npm', ['publish', packageDirectory, '--access', 'public', '--tag', 'latest',
      '--registry', registry]);
    published = true;
    run('gh', ['release', 'create', tag, '--verify-tag', '--title', tag, '--generate-notes',
      ...(latestTag ? ['--notes-start-tag', latestTag] : [])]);
    console.log(`Released ${manifest.name}@${version}. npm propagation may take a few minutes.`);
  } catch (error) {
    if (committed) {
      console.error(`Release stopped after commit/tag preparation (${tag}). Inspect Git and npm before retrying.`);
      console.error(published
        ? `npm publication succeeded. Create the missing GitHub Release with: gh release create ${tag} --verify-tag --generate-notes`
        : `Do not bump again automatically: check whether ${manifest.name}@${manifest.version} exists on npm first.`);
    }
    throw error;
  } finally {
    prompt.close();
    if (manifestChanged && !committed) {
      writeFileSync(manifestPath, originalManifest);
      if (staged) run('git', ['restore', '--staged', '--', manifestPath]);
      console.log('Original manifest restored. The next release will rebuild the package.');
    }
  }
}

release().catch(error => {
  console.error(`Release failed: ${error.message}`);
  process.exitCode = 1;
});
