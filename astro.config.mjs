import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://bluetape4k.github.io',
  integrations: [
    starlight({
      title: 'bluetape4k',
      description: 'Kotlin backend libraries, examples, and dependency governance for JVM services.',
      logo: {
        src: './src/assets/logo.png',
      },
      favicon: '/avatar.png',
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
          items: [
            { label: 'Overview', slug: '' },
            { label: 'Getting Started', slug: 'getting-started' },
          ],
        },
        {
          label: 'Ecosystem',
          items: [
            { label: 'Repositories', slug: 'ecosystem/repositories' },
            { label: 'Examples', slug: 'ecosystem/examples' },
            { label: 'Version Governance', slug: 'ecosystem/version-governance' },
          ],
        },
      ],
    }),
  ],
});
