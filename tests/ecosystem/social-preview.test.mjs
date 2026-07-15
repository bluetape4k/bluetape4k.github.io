import assert from 'node:assert/strict';
import test from 'node:test';
import { withBlogSocialPreview } from '../../src/lib/socialPreview.ts';

function metaContent(head, attribute, value) {
  return head.find((entry) => entry.tag === 'meta' && entry.attrs?.[attribute] === value)?.attrs?.content;
}

test('blog Hero replaces the global SNS image without mutating the original head', () => {
  const head = [
    { tag: 'meta', attrs: { property: 'og:image', content: 'https://bluetape4k.github.io/og-image.png' } },
    { tag: 'meta', attrs: { property: 'og:image:alt', content: 'bluetape4k site card' } },
    { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
    { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
    { tag: 'meta', attrs: { name: 'twitter:image', content: 'https://bluetape4k.github.io/og-image.png' } },
  ];
  const original = structuredClone(head);

  const result = withBlogSocialPreview(
    head,
    {
      image: '/assets/bluetape-workflow-guide-hero.png',
      imageAlt: 'Workflow robots moving an approved request through verification gates',
    },
    new URL('https://bluetape4k.github.io'),
  );

  const expectedImage = 'https://bluetape4k.github.io/assets/bluetape-workflow-guide-hero.png';
  assert.equal(metaContent(result, 'property', 'og:image'), expectedImage);
  assert.equal(
    metaContent(result, 'property', 'og:image:alt'),
    'Workflow robots moving an approved request through verification gates',
  );
  assert.equal(metaContent(result, 'name', 'twitter:image'), expectedImage);
  assert.equal(
    metaContent(result, 'name', 'twitter:image:alt'),
    'Workflow robots moving an approved request through verification gates',
  );
  assert.equal(metaContent(result, 'property', 'og:image:width'), undefined);
  assert.equal(metaContent(result, 'property', 'og:image:height'), undefined);
  assert.deepEqual(head, original);
});

test('blog Hero metadata is added when the global head has no image entries', () => {
  const result = withBlogSocialPreview(
    [{ tag: 'meta', attrs: { property: 'og:title', content: 'Article title' } }],
    { image: 'https://cdn.example.com/hero.png', imageAlt: 'Article Hero' },
    new URL('https://bluetape4k.github.io'),
  );

  assert.equal(metaContent(result, 'property', 'og:image'), 'https://cdn.example.com/hero.png');
  assert.equal(metaContent(result, 'property', 'og:image:alt'), 'Article Hero');
  assert.equal(metaContent(result, 'name', 'twitter:image'), 'https://cdn.example.com/hero.png');
  assert.equal(metaContent(result, 'name', 'twitter:image:alt'), 'Article Hero');
});
