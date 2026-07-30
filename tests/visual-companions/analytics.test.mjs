import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  DEFAULT_CLOUDFLARE_BEACON_SCRIPT_URL,
  DEFAULT_CLOUDFLARE_BEACON_TOKEN,
  cloudflareAnalyticsScriptTag,
  resolveCloudflareAnalytics,
} from '../../scripts/site/cloudflare-analytics.mjs';
import {
  injectCloudflareAnalyticsIntoHtml,
  injectVisualCompanionAnalytics,
} from '../../scripts/visual-companions/inject-analytics.mjs';

const HTML = '<!doctype html><html><head><title>Visual</title></head><body></body></html>';

test('resolves production analytics defaults and honors explicit overrides', () => {
  assert.deepEqual(resolveCloudflareAnalytics({ production: false, env: {} }), null);
  assert.deepEqual(resolveCloudflareAnalytics({ production: true, env: {} }), {
    token: DEFAULT_CLOUDFLARE_BEACON_TOKEN,
    scriptUrl: DEFAULT_CLOUDFLARE_BEACON_SCRIPT_URL,
  });
  assert.deepEqual(resolveCloudflareAnalytics({
    production: true,
    env: {
      PUBLIC_CLOUDFLARE_BEACON_TOKEN: 'override-token',
      PUBLIC_CLOUDFLARE_BEACON_SCRIPT_URL: 'https://example.com/beacon.js',
    },
  }), {
    token: 'override-token',
    scriptUrl: 'https://example.com/beacon.js',
  });
});

test('injects one Cloudflare beacon before the closing head and remains idempotent', () => {
  const analytics = resolveCloudflareAnalytics({ production: true, env: {} });
  const injected = injectCloudflareAnalyticsIntoHtml(HTML, analytics);

  assert.match(injected, /data-cf-beacon=/);
  assert.equal(injected.match(/data-cf-beacon=/g)?.length, 1);
  assert.ok(injected.indexOf('data-cf-beacon=') < injected.indexOf('</head>'));
  assert.equal(injectCloudflareAnalyticsIntoHtml(injected, analytics), injected);
});

test('escapes analytics values before rendering the script tag', () => {
  const tag = cloudflareAnalyticsScriptTag({
    token: 'token"></script>',
    scriptUrl: 'https://example.com/beacon.js?x="unsafe"',
  });

  assert.doesNotMatch(tag, /token"><\/script>/);
  assert.match(tag, /&quot;/);
});

test('rejects conflicting beacons and malformed head markup', () => {
  const analytics = resolveCloudflareAnalytics({ production: true, env: {} });
  assert.throws(
    () => injectCloudflareAnalyticsIntoHtml(
      HTML.replace('</head>', '<script data-cf-beacon="other"></script></head>'),
      analytics,
    ),
    /CLOUDFLARE_ANALYTICS_CONFLICT/,
  );
  assert.throws(
    () => injectCloudflareAnalyticsIntoHtml('<html><body></body></html>', analytics),
    /VISUAL_ANALYTICS_HEAD/,
  );
  assert.throws(
    () => injectCloudflareAnalyticsIntoHtml(`${HTML}</head>`, analytics),
    /VISUAL_ANALYTICS_HEAD/,
  );
});

test('injects analytics into every Korean and English visual companion page', async (t) => {
  const siteRoot = await mkdtemp(path.join(tmpdir(), 'visual-analytics-'));
  t.after(() => rm(siteRoot, { recursive: true, force: true }));
  const routes = [
    'dist/visual-companions/repository/first/index.html',
    'dist/visual-companions/repository/second/index.html',
    'dist/ko/visual-companions/repository/first/index.html',
    'dist/ko/visual-companions/repository/second/index.html',
  ];
  for (const route of routes) {
    const absolute = path.join(siteRoot, route);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, HTML);
    const publicSource = path.join(siteRoot, route.replace(/^dist\//, 'public/'));
    await mkdir(path.dirname(publicSource), { recursive: true });
    await writeFile(publicSource, HTML);
  }
  const catalog = path.join(siteRoot, 'dist/visual-companions/index.html');
  const catalogContent = HTML.replace(
    '</head>',
    '<script data-cf-beacon="starlight"></script></head>',
  );
  await mkdir(path.dirname(catalog), { recursive: true });
  await writeFile(catalog, catalogContent);

  const result = await injectVisualCompanionAnalytics({
    siteRoot,
    analytics: resolveCloudflareAnalytics({ production: true, env: {} }),
  });

  assert.deepEqual(result, { pageCount: 4, changedCount: 4 });
  assert.equal(await readFile(catalog, 'utf8'), catalogContent);
  for (const route of routes) {
    const content = await readFile(path.join(siteRoot, route), 'utf8');
    assert.equal(content.match(/data-cf-beacon=/g)?.length, 1);
  }
});
