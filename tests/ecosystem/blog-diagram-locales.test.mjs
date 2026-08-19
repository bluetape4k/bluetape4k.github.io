import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const technicalClasses = new Set(['bt4k-architecture', 'bt4k-chart', 'bt4k-sequence']);

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(target) : [target];
  }));
  return nested.flat();
}

function technicalAssets(source, file) {
  const assets = [];
  for (const match of source.matchAll(/<figure\b([^>]*)>([\s\S]*?)<\/figure>/g)) {
    const className = match[1].match(/\bclass="([^"]+)"/)?.[1];
    if (!technicalClasses.has(className)) continue;
    const asset = match[2].match(/<img\b[^>]*\bsrc="\/assets\/([^"]+\.png)"/)?.[1];
    assert.ok(asset, `${file}: technical figure must contain one local PNG`);
    assets.push(asset);
  }
  return assets;
}

async function assertAssetPair(asset, file) {
  const svg = asset.replace(/\.png$/, '.svg');
  await assert.doesNotReject(
    access(path.join(root, 'public/assets', asset)),
    `${file}: missing PNG ${asset}`,
  );
  const stem = asset.replace(/-(?:en|ko)\.png$/, '');
  const visualCompanionFallbacks = new Set([
    'blog/usage-billing/part1/usage-billing-ledger-01',
    'blog/usage-billing/part2/usage-billing-event-sourcing-01',
  ]);
  if (visualCompanionFallbacks.has(stem)) {
    for (const locale of ['en', 'ko']) {
      const counterpart = `${stem}-${locale}.png`;
      await assert.doesNotReject(
        access(path.join(root, 'public/assets', counterpart)),
        `${file}: missing locale counterpart ${counterpart}`,
      );
    }
    return stem;
  }
  await assert.doesNotReject(
    access(path.join(root, 'public/assets', svg)),
    `${file}: missing canonical SVG ${svg}`,
  );
  for (const locale of ['en', 'ko']) {
    for (const extension of ['png', 'svg']) {
      const counterpart = `${stem}-${locale}.${extension}`;
      await assert.doesNotReject(
        access(path.join(root, 'public/assets', counterpart)),
        `${file}: missing locale counterpart ${counterpart}`,
      );
    }
  }
  return stem;
}

test('blog technical diagrams use explicit locale assets with matching SVG sources', async () => {
  const localeRoots = [
    ['en', path.join(root, 'src/content/docs/blog')],
    ['ko', path.join(root, 'src/content/docs/ko/blog')],
  ];
  const stems = new Set();

  for (const [locale, directory] of localeRoots) {
    const files = (await filesUnder(directory)).filter((file) => file.endsWith('.mdx'));
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      for (const asset of technicalAssets(source, file)) {
        assert.match(asset, new RegExp(`-${locale}\\.png$`), `${file}: ${asset}`);
        stems.add(await assertAssetPair(asset, file));
      }
    }
  }

  assert.equal(stems.size, 210);
});

test('attendance fulfillment flow keeps an explicit localized final decision', async () => {
  const diagrams = {
    ko: {
      path: 'public/assets/clinic-appointment-attendance-fulfillment-flow-01-ko.svg',
      label: '최종 상태 결정',
    },
    en: {
      path: 'public/assets/clinic-appointment-attendance-fulfillment-flow-01-en.svg',
      label: 'Final State Decision',
    },
  };

  for (const [locale, { path: diagramPath, label }] of Object.entries(diagrams)) {
    const source = await readFile(diagramPath, 'utf8');
    assert.match(source, new RegExp(`>${label}<`), `${locale}: missing final decision label`);
    assert.equal((source.match(/id="outcome-\d+"/g) ?? []).length, 4, `${locale}: expected four outcomes`);
  }
});

test('attendance fulfillment outcome routes are independent rounded paths from the decision node', async () => {
  const expected = [
    ['outcome-0', 'M650 1480 V1524 Q650 1548 626 1548 H271 Q247 1548 247 1572 V1680'],
    ['outcome-1', 'M720 1480 V1564 Q720 1588 696 1588 H641 Q617 1588 617 1612 V1680'],
    ['outcome-2', 'M880 1480 V1564 Q880 1588 904 1588 H963 Q987 1588 987 1612 V1680'],
    ['outcome-3', 'M950 1480 V1524 Q950 1548 974 1548 H1333 Q1357 1548 1357 1572 V1680'],
  ];

  for (const locale of ['ko', 'en']) {
    const source = await readFile(
      `public/assets/clinic-appointment-attendance-fulfillment-flow-01-${locale}.svg`,
      'utf8',
    );
    assert.doesNotMatch(source, /class="fanout-bus"/);
    assert.doesNotMatch(source, /class="fanout-stem"/);
    assert.doesNotMatch(source, /분기 시작점|Outcome fan-out origin/);
    for (const [target, pathData] of expected) {
      assert.match(
        source,
        new RegExp(`data-target-node="${target}" d="${pathData.replaceAll(' ', '\\s+') }"`),
        `${locale}: ${target} must have an independent rounded route from the decision node`,
      );
    }
  }
});

test('paired English and Korean posts reference the same technical diagram stems', async () => {
  const englishRoot = path.join(root, 'src/content/docs/blog');
  const koreanRoot = path.join(root, 'src/content/docs/ko/blog');
  const englishFiles = (await filesUnder(englishRoot)).filter((file) => file.endsWith('.mdx'));

  for (const englishFile of englishFiles) {
    const relative = path.relative(englishRoot, englishFile);
    const koreanFile = path.join(koreanRoot, relative);
    try {
      await access(koreanFile);
    } catch {
      continue;
    }
    const english = technicalAssets(await readFile(englishFile, 'utf8'), englishFile)
      .map((asset) => asset.replace(/-en\.png$/, ''))
      .sort();
    const korean = technicalAssets(await readFile(koreanFile, 'utf8'), koreanFile)
      .map((asset) => asset.replace(/-ko\.png$/, ''))
      .sort();
    assert.deepEqual(korean, english, relative);
  }
});

test('cache strategy diagram follows the Exposed workshop loader and writer contracts', async () => {
  const expectations = {
    en: {
      readThrough: ['JdbcCacheRepository', 'EntityMapLoader.load', 'loaded entity'],
      writeThrough: ['JdbcCacheRepository', 'EntityMapWriter.write', 'immediate DB write'],
      writeBehind: ['JdbcCacheRepository', 'write-behind queue', 'batch flush'],
    },
    ko: {
      readThrough: ['JdbcCacheRepository', 'EntityMapLoader.load', '조회 결과 반환'],
      writeThrough: ['JdbcCacheRepository', 'EntityMapWriter.write', '즉시 DB write'],
      writeBehind: ['JdbcCacheRepository', 'write-behind queue', 'batch flush'],
    },
  };

  for (const [locale, labels] of Object.entries(expectations)) {
    const source = await readFile(
      path.join(root, 'public/assets', `cache-series-workshop-strategy-01-${locale}.svg`),
      'utf8',
    );
    const rows = [
      source.match(/<rect class="row"[^>]*>[\s\S]*?<rect class="row-alt"/)?.[0],
      source.match(/<rect class="row-alt"[^>]*>[\s\S]*?<rect class="row"/)?.[0],
      source.match(/<rect class="row"[^>]*y="750"[\s\S]*?<\/svg>/)?.[0],
    ];

    const [readThroughRow, writeThroughRow, writeBehindRow] = rows;
    assert.ok(readThroughRow, `${locale}: missing read-through row`);
    assert.ok(writeThroughRow, `${locale}: missing write-through row`);
    assert.ok(writeBehindRow, `${locale}: missing write-behind row`);
    assert.doesNotMatch(readThroughRow, />persist</, `${locale}: read-through row shows a write path`);
    assert.ok(
      readThroughRow.indexOf('JdbcCacheRepository') < readThroughRow.indexOf('RMap / Near Cache')
        && readThroughRow.indexOf('RMap / Near Cache') < readThroughRow.indexOf('Exposed DB'),
      `${locale}: repository must access the map before EntityMapLoader accesses DB`,
    );
    for (const [row, expectedLabels] of [
      [readThroughRow, labels.readThrough],
      [writeThroughRow, labels.writeThrough],
      [writeBehindRow, labels.writeBehind],
    ]) {
      for (const label of expectedLabels) {
        assert.match(row, new RegExp(`>${label}<`), `${locale}: missing ${label}`);
      }
    }
    assert.doesNotMatch(writeThroughRow, /dual-write|same request|같은 request/);
    assert.doesNotMatch(writeBehindRow, /proxy @Async|new entity/);
    assert.match(writeBehindRow, />putAll</, `${locale}: write-behind call must match putAll(events)`);
  }
});

test('cache workshop article excludes the invalid benchmark and keeps canonical strategy evidence', async () => {
  const articles = {
    en: await readFile(
      path.join(root, 'src/content/docs/blog/bluetape4k-cache-part4-workshop-examples.mdx'),
      'utf8',
    ),
    ko: await readFile(
      path.join(root, 'src/content/docs/ko/blog/bluetape4k-cache-part4-workshop-examples.mdx'),
      'utf8',
    ),
  };

  for (const [locale, source] of Object.entries(articles)) {
    assert.doesNotMatch(source, /cache-benchmark/i, `${locale}: invalid benchmark reference`);
    assert.doesNotMatch(source, /ProductCacheService|NearCacheService/, `${locale}: invalid service reference`);
    assert.doesNotMatch(source, /cache-series-workshop-profile-01/, `${locale}: stale profile diagram`);
    assert.doesNotMatch(source, /issues\/585/, `${locale}: implementation issue leaked into article`);
    assert.match(source, /AbstractJdbcRedissonRepository\.kt/, `${locale}: missing canonical repository reference`);
    assert.match(source, /UserCacheRepositoryTest\.kt/, `${locale}: missing read\/write-through test reference`);
    assert.match(source, /UserEventCacheRepositoryTest\.kt/, `${locale}: missing write-behind test reference`);
    assert.match(
      source,
      locale === 'en'
        ? /## Canonical Cache Strategies: Exposed Workshop Chapter 11/
        : /## 정식 캐시 전략 예제: Exposed Workshop 11장/,
      `${locale}: missing canonical strategy section`,
    );
    for (const example of ['cache-caffeine', 'cache-redis', 'cache-resilience']) {
      assert.match(source, new RegExp(`/spring-boot/${example}`), `${locale}: missing ${example}`);
    }
  }

  const generator = await readFile(
    path.join(root, 'scripts/generate-cache-series-diagrams.mjs'),
    'utf8',
  );
  assert.doesNotMatch(generator, /cache-series-workshop-profile-01|ProductCacheService/);
});

test('clinic completion articles separate implemented boundaries from reference designs', async () => {
  const clinic = {
    en: await readFile(
      path.join(root, 'src/content/docs/blog/clinic-appointment-part7-review-and-operational-evolution.mdx'),
      'utf8',
    ),
    ko: await readFile(
      path.join(root, 'src/content/docs/ko/blog/clinic-appointment-part7-review-and-operational-evolution.mdx'),
      'utf8',
    ),
  };
  assert.match(clinic.en, /Network-retry idempotency is therefore an implemented boundary/);
  assert.match(clinic.en, /Capacity integrity remains separate/);
  assert.match(clinic.ko, /요청 멱등성은 현재 구현된\s+경계/);
  assert.match(clinic.ko, /수용 인원 무결성은 여전히 남은 경계/);

  const timefold = {
    en: await readFile(
      path.join(root, 'src/content/docs/blog/timefold-workshop-quickstarts-exposed-persistence.mdx'),
      'utf8',
    ),
    ko: await readFile(
      path.join(root, 'src/content/docs/ko/blog/timefold-workshop-quickstarts-exposed-persistence.mdx'),
      'utf8',
    ),
  };
  assert.match(timefold.en, /application reference design, not a set of services currently implemented/);
  assert.match(timefold.en, /does not implement the `OptimizationJobService`/);
  assert.match(timefold.ko, /애플리케이션이 채울 수 있는 참조 설계/);
  assert.match(timefold.ko, /현재 `timefold-workshop`에는 이 그림의 `OptimizationJobService`/);
});

test('architecture boundary articles keep localized diagram titles and precise recovery semantics', async () => {
  const articles = {
    javers: {
      en: await readFile(
        path.join(root, 'src/content/docs/blog/bluetape4k-javers-part4-audit-cost.mdx'),
        'utf8',
      ),
      ko: await readFile(
        path.join(root, 'src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx'),
        'utf8',
      ),
    },
    modulith: {
      ko: await readFile(
        path.join(root, 'src/content/docs/ko/blog/spring-modulith-publications-vs-outbox.mdx'),
        'utf8',
      ),
    },
    multitenancy: {
      ko: await readFile(
        path.join(root, 'src/content/docs/ko/blog/exposed-r2dbc-webflux-multitenancy-lifecycle.mdx'),
        'utf8',
      ),
    },
  };

  for (const title of [
    '감사 이력 비용이 발생하는 지점',
    '감사 저장 경로별 평균 처리 시간',
    '커밋 메타데이터 인덱스별 처리량',
  ]) {
    assert.match(articles.javers.ko, new RegExp(`data-diagram-title="${title}"`));
  }
  for (const title of [
    'Where audit-history cost occurs',
    'Mean operation time by audit path',
    'Commit-metadata throughput by index configuration',
  ]) {
    assert.match(articles.javers.en, new RegExp(`data-diagram-title="${title}"`));
  }

  assert.match(articles.modulith.ko, /원래 트랜잭션 안에서 리스너별 발행 기록을 저장/);
  assert.match(articles.modulith.ko, /커밋 뒤 리스너가 성공적으로 끝난 경우에만 행을 완료 상태로/);
  assert.doesNotMatch(articles.modulith.ko, /가벼운 아웃박스|경량 아웃박스/);

  assert.match(articles.multitenancy.ko, /권한 확인이 Reactor Context 공개보다 앞선다/);
  assert.match(articles.multitenancy.ko, /생명주기 행은 `FAILED`/);
  assert.doesNotMatch(articles.multitenancy.ko, /수명주기 행/);
});
