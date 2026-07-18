import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { loadRedirectCatalog } from './scripts/manual/lib/catalog.mjs';
import { loadRepositoryRegistry } from './scripts/manual/lib/repositories.mjs';
import { buildStaticSidebar } from './scripts/manual/lib/sidebar.mjs';

const manualRepositories = loadRepositoryRegistry(new URL('./src/data/manual/repositories.json', import.meta.url));
const staticSidebar = buildStaticSidebar(manualRepositories);
const redirectEntries = [];
const redirectSources = new Set();
for (const repository of manualRepositories.repositories) {
  const catalog = loadRedirectCatalog(
    new URL(`./src/data/manual/${repository.slug}.redirects.json`, import.meta.url),
    repository,
  );
  for (const entry of catalog.entries) {
    if (redirectSources.has(entry.source)) throw new Error(`REDIRECT_SOURCE_COLLISION: ${entry.source}`);
    redirectSources.add(entry.source);
    redirectEntries.push(entry);
  }
}

const cloudflareBeaconToken =
  process.env.PUBLIC_CLOUDFLARE_BEACON_TOKEN ??
  (process.env.NODE_ENV === 'production' ? 'a9408513fe144222b89e86151b26e70f' : '');
const cloudflareBeaconScriptUrl =
  process.env.PUBLIC_CLOUDFLARE_BEACON_SCRIPT_URL ?? 'https://static.cloudflareinsights.com/beacon.min.js';
const cloudflareAnalyticsHead = cloudflareBeaconToken
  ? [
      {
        tag: 'script',
        attrs: {
          defer: true,
          'data-cf-beacon': JSON.stringify({ token: cloudflareBeaconToken }),
          src: cloudflareBeaconScriptUrl,
        },
      },
    ]
  : [];

export default defineConfig({
  site: 'https://bluetape4k.github.io',
  redirects: Object.fromEntries(
    redirectEntries.map(({ source, destination }) => [source, destination]),
  ),
  integrations: [
    starlight({
      title: {
        en: 'bluetape4k',
        ko: 'bluetape4k',
      },
      description: 'Kotlin backend libraries, examples, and dependency governance for JVM services.',
      locales: {
        root: {
          label: 'English',
          lang: 'en',
        },
        ko: {
          label: '한국어',
          lang: 'ko',
        },
      },
      defaultLocale: 'root',
      routeMiddleware: './src/starlightRouteData.ts',
      logo: {
        src: './src/assets/logo.png',
      },
      favicon: '/avatar.png',
      components: {
        Footer: './src/components/StarlightFooter.astro',
        Header: './src/components/ManualHeader.astro',
        MobileMenuFooter: './src/components/ManualMobileMenuFooter.astro',
        Pagination: './src/components/ManualPagination.astro',
        PageTitle: './src/components/ManualPageTitle.astro',
      },
      customCss: ['./src/styles/custom.css', './src/styles/atlas.css', './src/styles/manual.css'],
      head: [
        {
          tag: 'meta',
          attrs: {
            name: 'robots',
            content: 'index,follow',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'keywords',
            content:
              'bluetape4k, Kotlin, JVM, Spring Boot, Ktor, Exposed, R2DBC, AWS, graph database, dependency governance',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:site_name',
            content: 'bluetape4k',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:type',
            content: 'website',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: 'https://bluetape4k.github.io/og-image.png',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image:alt',
            content: 'bluetape4k Kotlin backend libraries for JVM services',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image:width',
            content: '1200',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image:height',
            content: '630',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:card',
            content: 'summary_large_image',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:image',
            content: 'https://bluetape4k.github.io/og-image.png',
          },
        },
        ...cloudflareAnalyticsHead,
        {
          tag: 'script',
          attrs: {
            type: 'application/ld+json',
          },
          content: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'bluetape4k',
            url: 'https://bluetape4k.github.io',
            logo: 'https://bluetape4k.github.io/avatar.png',
            sameAs: ['https://github.com/bluetape4k'],
          }),
        },
        {
          tag: 'script',
          attrs: {
            type: 'application/ld+json',
          },
          content: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'bluetape4k',
            url: 'https://bluetape4k.github.io',
            description:
              'Kotlin backend libraries, examples, and dependency governance for JVM services.',
            publisher: {
              '@type': 'Organization',
              name: 'bluetape4k',
              url: 'https://github.com/bluetape4k',
            },
          }),
        },
        {
          tag: 'script',
          attrs: {
            type: 'application/ld+json',
          },
          content: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareSourceCode',
            name: 'bluetape4k',
            codeRepository: 'https://github.com/bluetape4k',
            programmingLanguage: ['Kotlin', 'Java'],
            runtimePlatform: 'JVM',
            url: 'https://bluetape4k.github.io',
            description:
              'Kotlin-first backend building blocks for Spring Boot, Ktor, Exposed, R2DBC, AWS, graph data, and production examples.',
          }),
        },
      ],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/bluetape4k',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/bluetape4k/bluetape4k.github.io/edit/develop/',
      },
      sidebar: staticSidebar,
    }),
  ],
});
