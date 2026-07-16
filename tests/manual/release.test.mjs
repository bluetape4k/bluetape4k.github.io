import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertReleaseUnmoved,
  resolveRelease,
  sanitizeDiagnostic,
} from '../../scripts/manual/lib/release.mjs';

const PROJECTS = {
  slug: 'bluetape4k-projects',
  repository: 'bluetape4k/bluetape4k-projects',
  label: { en: 'Bluetape4k docs', ko: 'Bluetape4k 문서' },
  latestMinor: '1.11',
  route: { en: '/manual/bluetape4k-projects/', ko: '/ko/manual/bluetape4k-projects/' },
};
const EXPOSED = {
  slug: 'bluetape4k-exposed',
  repository: 'bluetape4k/bluetape4k-exposed',
  label: { en: 'Exposed docs', ko: 'Exposed 문서' },
  latestMinor: '1.11',
  route: { en: '/manual/bluetape4k-exposed/', ko: '/ko/manual/bluetape4k-exposed/' },
};
const REPOSITORY = PROJECTS.repository;
const COMMIT = '6187173b58e8b4c5c435c145e00e94708f31ef75';
const EXPOSED_COMMIT = '0b494a5fd1e083006046764757342b68a397e4c5';
const TAG_ONE = '1111111111111111111111111111111111111111';
const TAG_TWO = '2222222222222222222222222222222222222222';

function response(body, status = 200, url = 'https://api.github.com/') {
  return {
    ok: status >= 200 && status < 300,
    status,
    url,
    async json() { return body; },
    async text() { return JSON.stringify(body); },
  };
}

function githubFixture({
  repository = REPOSITORY,
  fullName = REPOSITORY,
  release = {},
  tagType = 'tag',
  commit = COMMIT,
  movedCommit,
  refSha = TAG_ONE,
  identities = {},
} = {}) {
  let refReads = 0;
  const requests = [];
  const fetchImpl = async (url, options = {}) => {
    requests.push({ url: String(url), options });
    const pathname = new URL(url).pathname;
    if (pathname === `/repos/${repository}`) return response({ full_name: fullName }, 200, url);
    if (pathname.endsWith('/releases/latest') || pathname.includes('/releases/tags/')) {
      return response({ tag_name: '1.11.0', draft: false, prerelease: false, ...release, ...identities.release }, 200, url);
    }
    if (pathname.endsWith('/git/ref/tags/1.11.0')) {
      refReads += 1;
      const sha = movedCommit && refReads > 1 ? movedCommit : refSha;
      return response({ object: { type: tagType, sha }, ...identities.ref }, 200, url);
    }
    if (pathname.endsWith(`/git/tags/${TAG_ONE}`)) {
      return response({ object: { type: 'tag', sha: TAG_TWO }, ...identities.tag }, 200, url);
    }
    if (pathname.endsWith(`/git/tags/${TAG_TWO}`)) {
      return response({ object: { type: 'commit', sha: commit } }, 200, url);
    }
    throw new Error(`Unexpected request: ${url}`);
  };
  return { fetchImpl, requests };
}

async function rejectsCode(promise, code) {
  await assert.rejects(promise, (error) => {
    assert.equal(error.code, code);
    assert.ok(Object.hasOwn(error, 'expected'));
    assert.ok(Object.hasOwn(error, 'actual'));
    return true;
  });
}

test('resolves an exact release through an annotated tag chain to an immutable commit', async () => {
  const fixture = githubFixture();
  assert.deepEqual(await resolveRelease({ repository: PROJECTS, releaseRef: '1.11.0', fetchImpl: fixture.fetchImpl }), {
    repository: REPOSITORY,
    releaseRef: '1.11.0',
    releaseCommit: COMMIT,
    minorVersion: '1.11',
  });
  assert.ok(fixture.requests.some(({ url }) => url.endsWith(`/git/tags/${TAG_TWO}`)));
});

test('resolves an Exposed release from the selected repository descriptor', async () => {
  const fixture = githubFixture({
    repository: EXPOSED.repository,
    fullName: EXPOSED.repository,
    tagType: 'commit',
    refSha: EXPOSED_COMMIT,
  });
  assert.deepEqual(await resolveRelease({ repository: EXPOSED, releaseRef: '1.11.0', fetchImpl: fixture.fetchImpl }), {
    repository: EXPOSED.repository,
    releaseRef: '1.11.0',
    releaseCommit: EXPOSED_COMMIT,
    minorVersion: '1.11',
  });
});

test('uses the latest release endpoint when no release ref is supplied', async () => {
  const fixture = githubFixture({ tagType: 'commit' });
  await resolveRelease({ repository: PROJECTS, fetchImpl: fixture.fetchImpl });
  assert.ok(fixture.requests.some(({ url }) => url.endsWith('/releases/latest')));
});

test('rejects non-allowlisted repositories and mismatched GitHub identity', async () => {
  await rejectsCode(resolveRelease({ repository: 'other/project', releaseRef: '1.11.0', fetchImpl: async () => response({}) }), 'REPOSITORY_IDENTITY');
  const fixture = githubFixture({ fullName: 'fork/bluetape4k-projects' });
  await rejectsCode(resolveRelease({ repository: PROJECTS, releaseRef: '1.11.0', fetchImpl: fixture.fetchImpl }), 'REPOSITORY_IDENTITY');
});

test('rejects Exposed payload identity when Projects is selected', async () => {
  const identities = {
    release: { repository_url: `https://api.github.com/repos/${EXPOSED.repository}` },
  };
  await rejectsCode(
    resolveRelease({ repository: PROJECTS, releaseRef: '1.11.0', fetchImpl: githubFixture({ identities }).fetchImpl }),
    'REPOSITORY_IDENTITY',
  );
});

test('rejects invalid repository_url identity on release, ref, and annotated-tag responses', async () => {
  const cases = [
    ['release', 'https://evil.example/repos/bluetape4k/bluetape4k-projects'],
    ['ref', 'https://api.github.com/repos/other/project'],
    ['tag', `https://api.github.com/repos/${REPOSITORY}?token=unexpected`],
  ];
  for (const [stage, repositoryUrl] of cases) {
    const identities = { [stage]: { repository_url: repositoryUrl } };
    await rejectsCode(
      resolveRelease({ repository: PROJECTS, releaseRef: '1.11.0', fetchImpl: githubFixture({ identities }).fetchImpl }),
      'REPOSITORY_IDENTITY',
    );
  }
});

test('validates repository.full_name and repository_url independently', async () => {
  const identities = {
    release: {
      repository: { full_name: REPOSITORY },
      repository_url: 'https://api.github.com/repos/other/project',
    },
  };
  await rejectsCode(
    resolveRelease({ repository: PROJECTS, releaseRef: '1.11.0', fetchImpl: githubFixture({ identities }).fetchImpl }),
    'REPOSITORY_IDENTITY',
  );
});

test('rejects draft, prerelease, release tag mismatch, and moved tags', async () => {
  await rejectsCode(resolveRelease({ repository: PROJECTS, releaseRef: '1.11.0', fetchImpl: githubFixture({ release: { draft: true } }).fetchImpl }), 'RELEASE_DRAFT');
  await rejectsCode(resolveRelease({ repository: PROJECTS, releaseRef: '1.11.0', fetchImpl: githubFixture({ release: { prerelease: true } }).fetchImpl }), 'RELEASE_PRERELEASE');
  await rejectsCode(resolveRelease({ repository: PROJECTS, releaseRef: '1.11.0', fetchImpl: githubFixture({ release: { tag_name: '1.11.1' } }).fetchImpl }), 'RELEASE_TAG_MISMATCH');

  const moved = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const fixture = githubFixture({ movedCommit: moved, tagType: 'commit' });
  const resolved = await resolveRelease({ repository: PROJECTS, releaseRef: '1.11.0', fetchImpl: fixture.fetchImpl });
  await rejectsCode(assertReleaseUnmoved(resolved, PROJECTS, fixture.fetchImpl), 'RELEASE_MOVED');
});

test('bounds annotated tag traversal and detects cycles', async () => {
  const cycleA = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const cycleB = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
  const fetchImpl = async (url) => {
    const pathname = new URL(url).pathname;
    if (pathname === `/repos/${REPOSITORY}`) return response({ full_name: REPOSITORY }, 200, url);
    if (pathname.includes('/releases/tags/')) return response({ tag_name: '1.11.0', draft: false, prerelease: false }, 200, url);
    if (pathname.includes('/git/ref/tags/')) return response({ object: { type: 'tag', sha: cycleA } }, 200, url);
    if (pathname.endsWith(`/git/tags/${cycleA}`)) return response({ object: { type: 'tag', sha: cycleB } }, 200, url);
    if (pathname.endsWith(`/git/tags/${cycleB}`)) return response({ object: { type: 'tag', sha: cycleA } }, 200, url);
    throw new Error(`Unexpected request: ${url}`);
  };
  await rejectsCode(resolveRelease({ repository: PROJECTS, releaseRef: '1.11.0', fetchImpl }), 'RELEASE_TAG_CYCLE');
});

test('rejects an actual seventeen-step annotated tag chain', async () => {
  let tagReads = 0;
  const fetchImpl = async (url) => {
    const pathname = new URL(url).pathname;
    if (pathname === `/repos/${REPOSITORY}`) return response({ full_name: REPOSITORY }, 200, url);
    if (pathname.includes('/releases/tags/')) return response({ tag_name: '1.11.0', draft: false, prerelease: false }, 200, url);
    if (pathname.includes('/git/ref/tags/')) return response({ object: { type: 'tag', sha: '0000000000000000000000000000000000000000' } }, 200, url);
    const match = pathname.match(/\/git\/tags\/([0-9a-f]{40})$/);
    if (match) {
      tagReads += 1;
      const step = Number.parseInt(match[1], 16);
      return response({ object: step === 16
        ? { type: 'commit', sha: COMMIT }
        : { type: 'tag', sha: (step + 1).toString(16).padStart(40, '0') } }, 200, url);
    }
    throw new Error(`Unexpected request: ${url}`);
  };
  await rejectsCode(
    resolveRelease({ repository: PROJECTS, releaseRef: '1.11.0', fetchImpl }),
    'RELEASE_TAG_DEPTH',
  );
  assert.equal(tagReads, 16);
});

test('rejects non-canonical intermediate and final Git object SHAs', async () => {
  const fixture = githubFixture({ tagType: 'commit', refSha: 'not-a-sha' });
  await rejectsCode(
    resolveRelease({ repository: PROJECTS, releaseRef: '1.11.0', fetchImpl: fixture.fetchImpl }),
    'RELEASE_TAG_SHA',
  );

  const invalidFinal = githubFixture({ commit: 'ABCDEF' });
  await rejectsCode(
    resolveRelease({ repository: PROJECTS, releaseRef: '1.11.0', fetchImpl: invalidFinal.fetchImpl }),
    'RELEASE_TAG_SHA',
  );
});

test('sanitizes diagnostics to stable safe fields and never emits a token sentinel', async () => {
  const sentinel = 'ghp_SENTINEL_SUPER_SECRET_1234567890';
  const previousToken = process.env.GITHUB_TOKEN;
  process.env.GITHUB_TOKEN = sentinel;
  const fixture = githubFixture({ release: { draft: true } });
  const stdout = [];
  const stderr = [];
  const originalLog = console.log;
  const originalError = console.error;
  console.log = (...values) => stdout.push(values.join(' '));
  console.error = (...values) => stderr.push(values.join(' '));
  try {
    let diagnostic;
    try {
      await resolveRelease({ repository: PROJECTS, releaseRef: '1.11.0', fetchImpl: fixture.fetchImpl });
      assert.fail('expected release rejection');
    } catch (error) {
      error.status = 422;
      error.url = `https://api.github.com/repos/${REPOSITORY}/releases/tags/1.11.0?access_token=${sentinel}`;
      error.headers = { Authorization: `Bearer ${sentinel}` };
      error.options = { token: sentinel };
      error.body = sentinel;
      error.cause = new Error(sentinel);
      diagnostic = sanitizeDiagnostic(error);
    }
    const authorization = fixture.requests[0].options.headers.Authorization;
    assert.equal(authorization, `Bearer ${sentinel}`);
    assert.deepEqual(diagnostic, {
      code: 'RELEASE_DRAFT',
      status: 422,
      url: `https://api.github.com/repos/${REPOSITORY}/releases/tags/1.11.0`,
      expected: false,
      actual: true,
    });
    const emitted = [...stdout, ...stderr, JSON.stringify(diagnostic)].join('\n');
    assert.equal(emitted.includes(sentinel), false);
  } finally {
    console.log = originalLog;
    console.error = originalError;
    if (previousToken === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = previousToken;
  }
});

test('sanitizer removes unsafe origins, nested values, and token-like scalars', () => {
  const error = Object.assign(new Error('secret'), {
    code: 'HTTP_STATUS',
    status: 500,
    url: 'https://evil.example/path?secret=yes',
    expected: { nested: 'unsafe' },
    actual: 'ghp_abcdefghijklmnopqrstuvwxyz1234567890',
  });
  assert.deepEqual(sanitizeDiagnostic(error), { code: 'HTTP_STATUS', status: 500 });
});

test('sanitizer rejects encoded, double-encoded, and malformed percent token scalars', () => {
  const sentinel = 'ghp_SENTINEL_SUPER_SECRET_1234567890';
  const encoded = [...sentinel].map((character) => `%${character.codePointAt(0).toString(16)}`).join('');
  const doubleEncoded = encoded.replaceAll('%', '%25');
  const stdout = [];
  const stderr = [];
  const originalLog = console.log;
  const originalError = console.error;
  console.log = (...values) => stdout.push(values.join(' '));
  console.error = (...values) => stderr.push(values.join(' '));
  try {
    const diagnostics = [
      sanitizeDiagnostic({ code: 'ENCODED', expected: encoded, actual: 'safe' }),
      sanitizeDiagnostic({ code: 'DOUBLE_ENCODED', expected: 'safe', actual: doubleEncoded }),
      sanitizeDiagnostic({ code: 'MALFORMED', expected: '%E0%A4%A', actual: '%ZZ' }),
    ];
    assert.deepEqual(diagnostics, [
      { code: 'ENCODED', actual: 'safe' },
      { code: 'DOUBLE_ENCODED', expected: 'safe' },
      { code: 'MALFORMED' },
    ]);
    const emitted = [...stdout, ...stderr, JSON.stringify(diagnostics)].join('\n');
    assert.equal(emitted.includes(sentinel), false);
    assert.equal(emitted.includes(encoded), false);
    assert.equal(emitted.includes(doubleEncoded), false);
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
});
