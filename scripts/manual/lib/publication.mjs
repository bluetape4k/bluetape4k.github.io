import { createHash, randomBytes } from 'node:crypto';
import {
  copyFile,
  lstat,
  mkdir,
  open,
  readFile,
  realpath,
  rename,
  rm,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';

const JOURNAL = '.manual-sync-journal.json';
const STATE = '.manual-sync';
const GENERATION = /^[0-9a-f]{64}$/;
const SCOPE = /^bluetape4k-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const METADATA = new Set([STATE, JOURNAL]);

function failure(code, detail, cause) {
  const error = new Error(`${code}: ${detail}`);
  error.code = code;
  if (cause) error.cause = cause;
  return error;
}

function safeRelative(value) {
  if (typeof value !== 'string' || value.length === 0 || value.includes('\0') || value.includes('\\')) {
    throw failure('PUBLICATION_PATH', String(value));
  }
  const normalized = path.posix.normalize(value);
  if (normalized !== value || normalized === '.' || normalized.startsWith('../') || path.posix.isAbsolute(normalized)) {
    throw failure('PUBLICATION_PATH', value);
  }
  return normalized;
}

function safeTargetRelative(value) {
  const safe = safeRelative(value);
  const top = safe.split('/')[0];
  if (METADATA.has(top) || top.startsWith('.manual-sync')) throw failure('PUBLICATION_PATH', value);
  return safe;
}

function validateScope(value) {
  if (typeof value !== 'string' || !SCOPE.test(value)) throw failure('PUBLICATION_SCOPE', String(value));
  return value;
}

const markerFor = (scope) => `.manual-sync-generation.${validateScope(scope)}.json`;

function validateGeneration(value) {
  if (!GENERATION.test(value)) throw failure('PUBLICATION_GENERATION', String(value));
  return value;
}

function canonicalBytes(entries) {
  const chunks = [];
  for (const entry of [...entries].sort((a, b) => a.path.localeCompare(b.path))) {
    const name = Buffer.from(entry.path);
    chunks.push(Buffer.from(`${name.length}:`), name, Buffer.from(`${entry.content.length}:`), entry.content);
  }
  return Buffer.concat(chunks);
}

const sha256 = (content) => createHash('sha256').update(content).digest('hex');

async function fsyncFile(file) {
  const handle = await open(file, 'r');
  try { await handle.sync(); } finally { await handle.close(); }
}

async function fsyncDirectory(directory) {
  const handle = await open(directory, 'r');
  try { await handle.sync(); } finally { await handle.close(); }
}

async function exists(file) {
  return stat(file).then(() => true, () => false);
}

async function existsBelow(root, relative) {
  await assertNoSymlink(root, relative);
  return exists(absoluteBelow(root, relative));
}

async function readBelow(root, relative, encoding) {
  await assertNoSymlink(root, relative, { allowMissing: false });
  return readFile(absoluteBelow(root, relative), encoding);
}

async function rootIdentity(targetRoot) {
  const absolute = path.resolve(targetRoot);
  const info = await lstat(absolute);
  if (info.isSymbolicLink() || !info.isDirectory()) throw failure('PUBLICATION_SYMLINK', absolute);
  return realpath(absolute);
}

function absoluteBelow(root, relative) {
  const safe = safeRelative(relative);
  const absolute = path.resolve(root, ...safe.split('/'));
  if (absolute === root || !absolute.startsWith(`${root}${path.sep}`)) throw failure('PUBLICATION_PATH', relative);
  return absolute;
}

async function assertNoSymlink(root, relative, { allowMissing = true } = {}) {
  const safe = safeRelative(relative);
  let current = root;
  for (const component of safe.split('/')) {
    current = path.join(current, component);
    let info;
    try { info = await lstat(current); } catch (error) {
      if (error.code === 'ENOENT' && allowMissing) return;
      throw error;
    }
    if (info.isSymbolicLink()) throw failure('PUBLICATION_SYMLINK', safe);
  }
}

async function assertParentNoSymlink(root, relative) {
  const parent = path.posix.dirname(relative);
  if (parent !== '.') await assertNoSymlink(root, parent, { allowMissing: false });
}

async function durableMkdir(directory) {
  const missing = [];
  let cursor = directory;
  while (!(await exists(cursor))) { missing.push(cursor); cursor = path.dirname(cursor); }
  await mkdir(directory, { recursive: true });
  for (const created of missing.reverse()) await fsyncDirectory(path.dirname(created));
}

async function durableWrite(root, relative, bytes) {
  const target = absoluteBelow(root, relative);
  await assertNoSymlink(root, relative);
  await durableMkdir(path.dirname(target));
  await assertParentNoSymlink(root, relative);
  const temporary = `${target}.tmp-${process.pid}-${randomBytes(8).toString('hex')}`;
  await writeFile(temporary, bytes, { flag: 'wx' });
  await fsyncFile(temporary);
  await assertParentNoSymlink(root, relative);
  await rename(temporary, target);
  await fsyncDirectory(path.dirname(target));
}

async function durableDelete(root, relative, recursive = false) {
  const target = absoluteBelow(root, relative);
  await assertNoSymlink(root, relative);
  if (!(await exists(target))) return;
  if (recursive) await rm(target, { recursive: true });
  else await unlink(target);
  await fsyncDirectory(path.dirname(target));
}

async function durableRename(root, sourceRelative, targetRelative) {
  await assertNoSymlink(root, sourceRelative, { allowMissing: false });
  await assertNoSymlink(root, targetRelative);
  const source = absoluteBelow(root, sourceRelative);
  const target = absoluteBelow(root, targetRelative);
  await durableMkdir(path.dirname(target));
  await assertParentNoSymlink(root, sourceRelative);
  await assertParentNoSymlink(root, targetRelative);
  await rename(source, target);
  await fsyncDirectory(path.dirname(target));
  if (path.dirname(source) !== path.dirname(target)) await fsyncDirectory(path.dirname(source));
}

async function copyDurable(root, sourceRelative, targetRelative) {
  await assertNoSymlink(root, sourceRelative, { allowMissing: false });
  await assertNoSymlink(root, targetRelative);
  const source = absoluteBelow(root, sourceRelative);
  const target = absoluteBelow(root, targetRelative);
  await durableMkdir(path.dirname(target));
  const temporaryRelative = `${targetRelative}.partial-${process.pid}-${randomBytes(5).toString('hex')}`;
  const temporary = absoluteBelow(root, temporaryRelative);
  await copyFile(source, temporary, undefined);
  await fsyncFile(temporary);
  await durableRename(root, temporaryRelative, targetRelative);
}

async function digestTargets(root, targets, overlay = new Map()) {
  const hash = createHash('sha256');
  for (const relative of [...targets].sort((left, right) => left.localeCompare(right))) {
    const name = Buffer.from(relative);
    if (overlay.has(relative)) {
      const content = overlay.get(relative);
      hash.update(`P${name.length}:`).update(name).update(`${content.length}:`).update(content);
      continue;
    }
    await assertNoSymlink(root, relative);
    const absolute = absoluteBelow(root, relative);
    if (!(await exists(absolute))) {
      hash.update(`M${name.length}:`).update(name);
      continue;
    }
    const content = await readFile(absolute);
    hash.update(`P${name.length}:`).update(name).update(`${content.length}:`).update(content);
  }
  return hash.digest('hex');
}

async function targetDigest(root, relative) {
  await assertNoSymlink(root, relative, { allowMissing: false });
  return sha256(await readFile(absoluteBelow(root, relative)));
}

function stableJson(value) {
  function sort(item) {
    if (Array.isArray(item)) return item.map(sort);
    if (item && typeof item === 'object') return Object.fromEntries(Object.keys(item).sort().map((key) => [key, sort(item[key])]));
    return item;
  }
  return `${JSON.stringify(sort(value), null, 2)}\n`;
}

async function persistJournal(root, journal) {
  await durableWrite(root, JOURNAL, stableJson(journal));
}

function validateStaged(staged) {
  if (!staged || typeof staged !== 'object') throw failure('PUBLICATION_STAGED', 'missing staged publication');
  const scope = validateScope(staged.scope);
  validateGeneration(staged.generationId);
  const expectedStagingRoot = path.posix.join(STATE, 'staging', scope, staged.generationId);
  if (safeRelative(staged.stagingRoot) !== expectedStagingRoot) throw failure('PUBLICATION_STAGED_PATH', staged.stagingRoot);
  if (!Array.isArray(staged.expected) || staged.expected.length === 0) throw failure('PUBLICATION_STAGED', 'missing targets');
  const targets = [];
  for (const item of staged.expected) {
    const target = safeTargetRelative(item.target);
    targets.push(target);
    if (safeRelative(item.staged) !== path.posix.join(expectedStagingRoot, target)) {
      throw failure('PUBLICATION_STAGED_PATH', item.staged);
    }
    if (!GENERATION.test(item.digest)) throw failure('PUBLICATION_DIGEST', item.digest);
  }
  if (new Set(targets).size !== targets.length || targets.some((target, index) => index > 0 && targets[index - 1].localeCompare(target) >= 0)) {
    throw failure('PUBLICATION_STAGED_ORDER', targets.join(','));
  }
  if (!GENERATION.test(staged.treeDigest)) throw failure('PUBLICATION_DIGEST', staged.treeDigest);
}

async function verifyStagedBytes(root, staged) {
  const entries = [];
  const overlay = new Map();
  for (const item of staged.expected) {
    const content = await readBelow(root, item.staged);
    const actualDigest = sha256(content);
    if (actualDigest !== item.digest) throw failure('PUBLICATION_STAGE_DIGEST', item.target);
    entries.push({ path: item.target, content });
    overlay.set(item.target, content);
  }
  const actualGeneration = sha256(canonicalBytes(entries));
  if (actualGeneration !== staged.generationId) throw failure('PUBLICATION_GENERATION_DIGEST', staged.generationId);
  const actualTreeDigest = await digestTargets(root, staged.expected.map(({ target }) => target), overlay);
  if (actualTreeDigest !== staged.treeDigest) throw failure('PUBLICATION_TREE_DIGEST', staged.treeDigest);
}

function validateJournal(journal, expectedScope) {
  if (!journal || journal.schema !== 1) throw failure('PUBLICATION_JOURNAL', 'invalid schema');
  const scope = validateScope(journal.scope);
  if (expectedScope !== undefined && scope !== validateScope(expectedScope)) {
    throw failure('PUBLICATION_SCOPE_MISMATCH', `${scope} != ${expectedScope}`);
  }
  validateGeneration(journal.generationId);
  const expectedStagingRoot = path.posix.join(STATE, 'staging', scope, journal.generationId);
  if (safeRelative(journal.stagingRoot) !== expectedStagingRoot) throw failure('PUBLICATION_JOURNAL_PATH', journal.stagingRoot);
  if (!GENERATION.test(journal.preTreeDigest) || !GENERATION.test(journal.expectedTreeDigest)) throw failure('PUBLICATION_JOURNAL', 'invalid tree digest');
  if (!Array.isArray(journal.targets)) throw failure('PUBLICATION_JOURNAL', 'targets');
  const targets = [];
  for (const [index, item] of journal.targets.entries()) {
    const target = safeTargetRelative(item.target);
    targets.push(target);
    if (safeRelative(item.staged) !== path.posix.join(expectedStagingRoot, target)) {
      throw failure('PUBLICATION_JOURNAL_PATH', item.staged);
    }
    const expectedBackup = path.posix.join(STATE, 'backups', scope, journal.generationId, String(index).padStart(6, '0'));
    if (safeRelative(item.backup) !== expectedBackup) throw failure('PUBLICATION_JOURNAL_PATH', item.backup);
    if (!GENERATION.test(item.expectedDigest)) throw failure('PUBLICATION_JOURNAL', 'target digest');
    if (item.preImageDigest !== null && !GENERATION.test(item.preImageDigest)) throw failure('PUBLICATION_JOURNAL', 'pre-image digest');
    for (const key of ['existedBefore', 'backupComplete', 'intentPersisted', 'completionPersisted']) {
      if (typeof item[key] !== 'boolean') throw failure('PUBLICATION_JOURNAL', key);
    }
  }
  if (new Set(targets).size !== targets.length || targets.some((target, index) => index > 0 && targets[index - 1].localeCompare(target) >= 0)) {
    throw failure('PUBLICATION_JOURNAL_ORDER', targets.join(','));
  }
  return journal;
}

async function cleanup(root, journal) {
  await durableDelete(root, path.posix.join(STATE, 'backups', journal.scope, journal.generationId), true);
  await durableDelete(root, journal.stagingRoot, true);
  await durableDelete(root, JOURNAL);
}

async function repairTargetPathForRollback(root, relative) {
  const components = safeTargetRelative(relative).split('/');
  let current = root;
  for (const [index, component] of components.entries()) {
    current = path.join(current, component);
    const last = index === components.length - 1;
    let info;
    try { info = await lstat(current); } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      if (!last) {
        await mkdir(current);
        await fsyncDirectory(path.dirname(current));
      }
      continue;
    }
    if (info.isSymbolicLink() || (!last && !info.isDirectory())) {
      if (info.isDirectory() && !info.isSymbolicLink()) await rm(current, { recursive: true });
      else await unlink(current);
      await fsyncDirectory(path.dirname(current));
      if (!last) {
        await mkdir(current);
        await fsyncDirectory(path.dirname(current));
      }
    }
  }
}

async function markerMatches(root, journal) {
  const marker = markerFor(journal.scope);
  if (!(await existsBelow(root, marker))) return false;
  let markerData;
  try { markerData = JSON.parse(await readBelow(root, marker, 'utf8')); } catch { return false; }
  return markerData.generationId === journal.generationId
    && markerData.treeDigest === journal.expectedTreeDigest
    && await digestTargets(root, journal.targets.map(({ target }) => target)) === journal.expectedTreeDigest;
}

async function rollback(root, journal) {
  for (const item of [...journal.targets].reverse()) {
    await repairTargetPathForRollback(root, item.target);
    await assertNoSymlink(root, item.target);
    if (item.existedBefore) {
      const targetPresent = await exists(absoluteBelow(root, item.target));
      if (targetPresent && await targetDigest(root, item.target) === item.preImageDigest) continue;
      if (!item.backupComplete || !(await exists(absoluteBelow(root, item.backup)))) {
        throw failure('PUBLICATION_BACKUP', item.backup);
      }
      if (await targetDigest(root, item.backup) !== item.preImageDigest) throw failure('PUBLICATION_BACKUP_DIGEST', item.backup);
      await durableRename(root, item.backup, item.target);
      if (await targetDigest(root, item.target) !== item.preImageDigest) throw failure('PUBLICATION_RESTORE_DIGEST', item.target);
    } else if (await exists(absoluteBelow(root, item.target))) {
      await durableDelete(root, item.target);
    }
  }
  if (await digestTargets(root, journal.targets.map(({ target }) => target)) !== journal.preTreeDigest) {
    throw failure('PUBLICATION_ROLLBACK_DIGEST', journal.preTreeDigest);
  }
  await cleanup(root, journal);
}

export async function stagePublication({ targetRoot, entries, generationId, scope }) {
  validateScope(scope);
  const root = await rootIdentity(targetRoot);
  validateGeneration(generationId);
  if (!Array.isArray(entries) || entries.length === 0) throw failure('PUBLICATION_ENTRIES', 'empty');
  const normalized = entries.map((entry) => ({
    path: safeTargetRelative(entry?.path),
    content: Buffer.isBuffer(entry?.content) ? Buffer.from(entry.content) : Buffer.from(entry?.content ?? ''),
  })).sort((a, b) => a.path.localeCompare(b.path));
  if (new Set(normalized.map(({ path: entryPath }) => entryPath)).size !== normalized.length) throw failure('PUBLICATION_DUPLICATE', 'entry path');
  for (let index = 1; index < normalized.length; index += 1) {
    if (normalized[index].path.startsWith(`${normalized[index - 1].path}/`)) throw failure('PUBLICATION_OVERLAP', normalized[index].path);
  }
  const actualGeneration = sha256(canonicalBytes(normalized));
  if (generationId !== actualGeneration) throw failure('PUBLICATION_GENERATION_DIGEST', generationId);
  const stagingRoot = path.posix.join(STATE, 'staging', scope, generationId);
  await assertNoSymlink(root, stagingRoot);
  if (await exists(absoluteBelow(root, stagingRoot))) await durableDelete(root, stagingRoot, true);
  const expected = [];
  for (const entry of normalized) {
    const stagedPath = path.posix.join(stagingRoot, entry.path);
    await durableWrite(root, stagedPath, entry.content);
    const entryDigest = await targetDigest(root, stagedPath);
    if (entryDigest !== sha256(entry.content)) throw failure('PUBLICATION_STAGE_DIGEST', entry.path);
    expected.push({ target: entry.path, staged: stagedPath, digest: entryDigest });
  }
  const overlay = new Map(normalized.map((entry) => [entry.path, entry.content]));
  return { scope, generationId, stagingRoot, expected, treeDigest: await digestTargets(root, normalized.map(({ path: entryPath }) => entryPath), overlay) };
}

export async function recoverPublication(targetRoot, expectedScope) {
  if (expectedScope !== undefined) validateScope(expectedScope);
  const root = await rootIdentity(targetRoot);
  await assertNoSymlink(root, JOURNAL);
  if (!(await existsBelow(root, JOURNAL))) {
    return { recovered: false };
  }
  let journal;
  try { journal = validateJournal(JSON.parse(await readBelow(root, JOURNAL, 'utf8')), expectedScope); }
  catch (error) { throw error.code?.startsWith('PUBLICATION_') ? error : failure('PUBLICATION_JOURNAL', error.message, error); }
  for (const item of journal.targets) {
    await assertNoSymlink(root, item.target);
    await assertNoSymlink(root, item.backup);
    await assertNoSymlink(root, item.staged);
  }
  if (await markerMatches(root, journal)) {
    await cleanup(root, journal);
    return { recovered: true, committed: true };
  }
  await rollback(root, journal);
  return { recovered: true, committed: false };
}

export async function publishStaged({ targetRoot, staged, injectFailure = async () => {} }) {
  const root = await rootIdentity(targetRoot);
  validateStaged(staged);
  if (await existsBelow(root, JOURNAL)) await recoverPublication(root, staged.scope);
  await verifyStagedBytes(root, staged);
  const markerPath = markerFor(staged.scope);
  if (await existsBelow(root, markerPath)) {
    const marker = JSON.parse(await readBelow(root, markerPath, 'utf8'));
    if (marker.generationId === staged.generationId
      && marker.treeDigest === staged.treeDigest
      && await digestTargets(root, staged.expected.map(({ target }) => target)) === staged.treeDigest) {
      await durableDelete(root, staged.stagingRoot, true);
      return { changed: false };
    }
  }
  const journal = {
    schema: 1,
    scope: staged.scope,
    generationId: staged.generationId,
    stagingRoot: staged.stagingRoot,
    preTreeDigest: await digestTargets(root, staged.expected.map(({ target }) => target)),
    expectedTreeDigest: staged.treeDigest,
    targets: [],
  };
  for (const [index, item] of staged.expected.entries()) {
    const present = await existsBelow(root, item.target);
    journal.targets.push({
      target: item.target,
      staged: item.staged,
      backup: path.posix.join(STATE, 'backups', staged.scope, staged.generationId, String(index).padStart(6, '0')),
      existedBefore: present,
      preImageDigest: present ? await targetDigest(root, item.target) : null,
      backupComplete: false,
      expectedDigest: item.digest,
      intentPersisted: false,
      completionPersisted: false,
    });
  }
  let markerWritten = false;
  try {
    await injectFailure('beforeJournalPersistence', { journal });
    await persistJournal(root, journal);
    await injectFailure('afterJournalPersistence', { journal });
    for (const item of journal.targets) {
      if (!item.existedBefore) continue;
      await injectFailure('beforeBackupPersistence', { target: item.target });
      await copyDurable(root, item.target, item.backup);
      if (await targetDigest(root, item.backup) !== item.preImageDigest) throw failure('PUBLICATION_BACKUP_DIGEST', item.target);
      await injectFailure('duringBackupPersistence', { target: item.target });
      item.backupComplete = true;
      await persistJournal(root, journal);
      await injectFailure('afterBackupPersistence', { target: item.target });
    }
    for (const item of journal.targets) {
      await injectFailure('beforeIntentPersistence', { target: item.target });
      item.intentPersisted = true;
      await persistJournal(root, journal);
      await injectFailure('afterIntentPersistence', { target: item.target });
      await assertNoSymlink(root, item.target);
      await injectFailure('beforeTargetRename', { target: item.target });
      await durableRename(root, item.staged, item.target);
      await injectFailure('afterTargetRename', { target: item.target });
      await injectFailure('beforeCompletionPersistence', { target: item.target });
      item.completionPersisted = true;
      await persistJournal(root, journal);
      await injectFailure('afterCompletionPersistence', { target: item.target });
    }
    for (const item of journal.targets) {
      if (await targetDigest(root, item.target) !== item.expectedDigest) throw failure('PUBLICATION_TARGET_DIGEST', item.target);
    }
    if (await digestTargets(root, journal.targets.map(({ target }) => target)) !== journal.expectedTreeDigest) {
      throw failure('PUBLICATION_TREE_DIGEST', journal.expectedTreeDigest);
    }
    await injectFailure('beforeCommitMarkerPersistence', { journal });
    await durableWrite(root, markerPath, stableJson({ generationId: journal.generationId, treeDigest: journal.expectedTreeDigest }));
    markerWritten = true;
    await injectFailure('afterCommitMarkerPersistence', { journal });
    await injectFailure('beforeCleanup', { journal });
    await cleanup(root, journal);
    await injectFailure('afterCleanup', { journal });
    return { changed: true };
  } catch (cause) {
    if (markerWritten && await markerMatches(root, journal)) {
      await cleanup(root, journal);
      throw cause;
    }
    try { await rollback(root, journal); }
    catch (rollbackError) {
      if (rollbackError.code === 'PUBLICATION_SYMLINK' || rollbackError.code === 'PUBLICATION_SECURITY') throw rollbackError;
      throw failure('PUBLICATION_ROLLBACK_FAILED', rollbackError.message, rollbackError);
    }
    throw failure('PUBLICATION_ROLLBACK', cause.message, cause);
  }
}
