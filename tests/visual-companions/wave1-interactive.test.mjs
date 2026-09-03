import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '../..');

const companions = [
  {
    issue: '414',
    source: 'issue-414-image-intelligence',
    route: 'bluetape4k-image/image-intelligence-policy-privacy',
    rootId: 'bt4k-issue-414',
    steps: 4,
  },
  {
    issue: '415',
    source: 'issue-415-aws-sqs-reliability',
    route: 'bluetape4k-aws/aws-sqs-reliability',
    rootId: 'bt4k-issue-415',
    scenarios: 5,
    sourceFrames: 28,
  },
  {
    issue: '416',
    source: 'issue-416-projects-nearjcache',
    route: 'bluetape4k-projects/projects-nearjcache-semantics',
    rootId: 'bt4k-issue-416',
    operations: 5,
    sourceFrames: 35,
  },
];

test('wave 1 interactive routes are generated from committed fragments', () => {
  execFileSync(process.execPath, ['scripts/generate-2-0-wave1-interactive.mjs', '--check'], {
    cwd: root,
    stdio: 'pipe',
  });
});

test('wave 1 inline scripts are valid JavaScript', async () => {
  for (const companion of companions) {
    for (const locale of ['en', 'ko']) {
      const source = await readFile(
        resolve(root, 'src/visual-companions/wave1', `${companion.source}.${locale}.fragment.html`),
        'utf8',
      );
      const scripts = [...source.matchAll(/<script>([\s\S]*?)<\/script>/g)];
      assert.ok(scripts.length > 0, `missing inline script: #${companion.issue} ${locale}`);
      for (const [, script] of scripts) {
        new vm.Script(script, { filename: `issue-${companion.issue}-${locale}.js` });
      }
    }
  }
});

for (const companion of companions) {
  for (const locale of ['en', 'ko']) {
    test(`#${companion.issue} ${locale} route keeps its interactive and provenance contracts`, async () => {
      const prefix = locale === 'ko' ? 'ko/' : '';
      const routePath = resolve(root, 'public', prefix, 'visual-companions', companion.route, 'index.html');
      const html = await readFile(routePath, 'utf8');

      assert.match(html, new RegExp(`<html lang="${locale}">`));
      assert.match(html, new RegExp(`id="${companion.rootId}"`));
      assert.match(html, new RegExp(`issues/${companion.issue}`));
      assert.equal((html.match(/data-theme-button=/g) ?? []).length, 3);
      assert.doesNotMatch(html, /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/);
      assert.match(html, /aria-live="polite"/);

      if (companion.steps) {
        assert.equal((html.match(/data-step-button=/g) ?? []).length, companion.steps);
      } else {
        assert.match(html, /data-action="play"/);
        assert.match(html, /data-action="next"/);
      }

      if (locale === 'en') {
        const fragment = await readFile(resolve(root, 'src/visual-companions/wave1', `${companion.source}.en.fragment.html`), 'utf8');
        assert.doesNotMatch(fragment, /[가-힣]/);
      }
    });
  }
}

test('#415 preserves five scenarios and forty playback states', async () => {
  const fragment = await readFile(resolve(root, 'src/visual-companions/wave1/issue-415-aws-sqs-reliability.en.fragment.html'), 'utf8');
  assert.equal((fragment.match(/data-scenario-button=/g) ?? []).length, 5);
  assert.equal((fragment.match(/^\s*\{ pos:/gm) ?? []).length, 28);
  assert.match(fragment, /const frames = \(\) => \[\.\.\.common, \.\.\.tails\[scenario\]\];/);
});

test('#416 preserves five operations and thirty-five detailed states', async () => {
  const fragment = await readFile(resolve(root, 'src/visual-companions/wave1/issue-416-projects-nearjcache.en.fragment.html'), 'utf8');
  assert.equal((fragment.match(/data-operation-button=/g) ?? []).length, 5);
  assert.equal((fragment.match(/^\s*frame\(/gm) ?? []).length, 35);
});
