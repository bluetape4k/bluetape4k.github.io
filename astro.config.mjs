import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const cloudflareBeaconToken =
  process.env.PUBLIC_CLOUDFLARE_BEACON_TOKEN ?? 'a9408513fe144222b89e86151b26e70f';
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
      logo: {
        src: './src/assets/logo.png',
      },
      favicon: '/avatar.png',
      components: {
        Footer: './src/components/StarlightFooter.astro',
      },
      customCss: ['./src/styles/custom.css'],
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
      sidebar: [
        {
          label: 'Start',
          translations: { ko: '시작' },
          items: [
            { label: 'Overview', translations: { ko: '개요' }, slug: '' },
            { label: 'Getting Started', translations: { ko: '시작하기' }, slug: 'getting-started' },
          ],
        },
        {
          label: 'Ecosystem',
          translations: { ko: '생태계' },
          items: [
            { label: 'Repositories', translations: { ko: '리포지토리' }, slug: 'ecosystem/repositories' },
            { label: 'Examples', translations: { ko: '예제' }, slug: 'ecosystem/examples' },
            {
              label: 'Version Governance',
              translations: { ko: '버전 거버넌스' },
              slug: 'ecosystem/version-governance',
            },
          ],
        },
        {
          label: 'Blog',
          translations: { ko: '블로그' },
          items: [
            { label: 'Posts', translations: { ko: '글' }, slug: 'blog' },
            { autogenerate: { directory: 'blog' } },
          ],
        },
      ],
    }),
  ],
});
