import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const projectRoot = new URL('../../', import.meta.url);
const hero = '/assets/bluetape4k-dependencies-2-0-hero.png';
const releases = [
  'bluetape4k-dependencies/releases/tag/2.0.0',
  'bluetape4k-projects/releases/tag/2.0.0',
  'bluetape4k-exposed/releases/tag/2.0.0',
  'bluetape4k-aws/releases/tag/1.0.0',
  'bluetape4k-image/releases/tag/1.0.0',
  'bluetape4k-text/releases/tag/1.0.0',
  'bluetape4k-graph/releases/tag/1.0.0',
  'bluetape4k-javers/releases/tag/1.0.0',
  'bluetape4k-leader/releases/tag/1.0.0',
];
const parts = [
  {
    slug: 'bluetape4k-dependencies-2-0-part1-compatibility-boundaries',
    koTitle: 'Java 25와 호환성 경계',
    enTitle: 'Java 25 and Compatibility Boundaries',
  },
  {
    slug: 'bluetape4k-dependencies-2-0-part2-data-lifecycles',
    koTitle: '데이터 접근과 처리 수명주기',
    enTitle: 'Data Access and Processing Lifecycles',
  },
  {
    slug: 'bluetape4k-dependencies-2-0-part3-messaging-stream-ownership',
    koTitle: '메시징과 스트림의 소유권',
    enTitle: 'Ownership in Messaging and Streams',
  },
  {
    slug: 'bluetape4k-dependencies-2-0-part4-operational-safety',
    koTitle: '운영 진단과 안전한 실패',
    enTitle: 'Operational Diagnostics and Fail-Closed Boundaries',
  },
];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function article(locale, slug) {
  const directory = locale === 'ko' ? 'src/content/docs/ko/blog' : 'src/content/docs/blog';
  return readFile(new URL(`${directory}/${slug}.mdx`, projectRoot), 'utf8');
}

test('dependencies 2.0 series keeps locale parity and the shared hero', async () => {
  for (const [index, { slug, koTitle, enTitle }] of parts.entries()) {
    const [ko, en] = await Promise.all([article('ko', slug), article('en', slug)]);
    const part = index + 1;

    assert.match(
      ko,
      new RegExp(`^title: "bluetape4k-dependencies 2\\.0\\.0 활용기 Part ${part}: ${escapeRegExp(koTitle)}"$`, 'm'),
    );
    assert.match(
      en,
      new RegExp(`^title: "bluetape4k-dependencies 2\\.0\\.0 in Practice Part ${part}: ${escapeRegExp(enTitle)}"$`, 'm'),
    );

    for (const source of [ko, en]) {
      assert.match(source, new RegExp(`^  image: ${escapeRegExp(hero)}$`, 'm'));
      assert.match(source, /bluetape4k-dependencies\/releases\/tag\/2\.0\.0/);
      for (const { slug: seriesSlug } of parts) {
        assert.match(source, new RegExp(`blog/${escapeRegExp(seriesSlug)}/`));
      }
    }
  }

  await assert.doesNotReject(access(new URL(`public${hero}`, projectRoot)));
});

test('dependencies 2.0 series cites every owned release line', async () => {
  const sources = (
    await Promise.all(
      parts.flatMap(({ slug }) => [article('ko', slug), article('en', slug)]),
    )
  ).join('\n');

  for (const release of releases) {
    assert.match(sources, new RegExp(escapeRegExp(release)));
  }
  assert.doesNotMatch(sources, /exactly-once guarantee|exactly-once 보장/);
});
