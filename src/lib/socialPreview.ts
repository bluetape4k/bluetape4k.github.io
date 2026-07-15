import type { StarlightRouteData } from '@astrojs/starlight/route-data';

type HeadConfig = StarlightRouteData['head'];
type MetaAttribute = 'name' | 'property';

export interface BlogSocialPreview {
  image: string;
  imageAlt: string;
}

const GLOBAL_IMAGE_DIMENSIONS = new Set(['og:image:width', 'og:image:height']);

function isMeta(entry: HeadConfig[number], attribute: MetaAttribute, value: string): boolean {
  return entry.tag === 'meta' && entry.attrs?.[attribute] === value;
}

function upsertMeta(
  head: HeadConfig,
  attribute: MetaAttribute,
  value: string,
  content: string,
): HeadConfig {
  let replaced = false;
  const updated = head.map((entry) => {
    if (!isMeta(entry, attribute, value)) return entry;
    replaced = true;
    return { ...entry, attrs: { ...entry.attrs, content } };
  });

  if (!replaced) {
    const attrs = attribute === 'property' ? { property: value, content } : { name: value, content };
    updated.push({ tag: 'meta', attrs });
  }

  return updated;
}

export function withBlogSocialPreview(
  head: HeadConfig,
  blog: BlogSocialPreview,
  site: URL,
): HeadConfig {
  const image = new URL(blog.image, site).href;
  let updated = head.filter(
    (entry) =>
      entry.tag !== 'meta' ||
      typeof entry.attrs?.property !== 'string' ||
      !GLOBAL_IMAGE_DIMENSIONS.has(entry.attrs.property),
  );

  updated = upsertMeta(updated, 'property', 'og:image', image);
  updated = upsertMeta(updated, 'property', 'og:image:alt', blog.imageAlt);
  updated = upsertMeta(updated, 'name', 'twitter:image', image);
  return upsertMeta(updated, 'name', 'twitter:image:alt', blog.imageAlt);
}
