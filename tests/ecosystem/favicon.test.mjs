import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const faviconUrl = new URL('../../public/favicon.ico', import.meta.url);

test('root favicon is a valid multi-size ICO fallback', async () => {
  const favicon = await readFile(faviconUrl);

  assert.equal(favicon.readUInt16LE(0), 0, 'ICO reserved field must be zero');
  assert.equal(favicon.readUInt16LE(2), 1, 'ICO type must identify an icon');

  const imageCount = favicon.readUInt16LE(4);
  assert.equal(imageCount, 4);

  const sizes = [];
  for (let index = 0; index < imageCount; index += 1) {
    const entryOffset = 6 + (index * 16);
    const width = favicon[entryOffset] || 256;
    const height = favicon[entryOffset + 1] || 256;
    const imageSize = favicon.readUInt32LE(entryOffset + 8);
    const imageOffset = favicon.readUInt32LE(entryOffset + 12);

    assert.equal(width, height, 'favicon images must be square');
    assert.ok(imageSize > 0, 'favicon image data must not be empty');
    assert.ok(
      imageOffset + imageSize <= favicon.length,
      'favicon image data must stay inside the ICO container',
    );
    sizes.push(width);
  }

  assert.deepEqual(sizes, [16, 32, 48, 64]);
});
