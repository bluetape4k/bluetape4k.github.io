import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

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
            {
              label: 'From Pure JVM to libvips',
              translations: { ko: 'Pure JVM에서 libvips로: 이미지 처리 벤치마크' },
              slug: 'blog/from-pure-jvm-to-libvips-benchmarking-image-processing',
            },
            {
              label: 'When Should a Backend Service Adopt a Graph Database?',
              translations: { ko: 'Backend 서비스는 언제 GraphDB를 도입해야 할까?' },
              slug: 'blog/when-to-adopt-graphdb',
            },
            {
              label: 'Introduction to the Bluetape4k Ecosystem',
              translations: { ko: 'Bluetape4k Ecosystem 소개' },
              slug: 'blog/introduction-bluetape4k-part1-ecosystem',
            },
            {
              label: 'Turning AI Collaboration Into Infrastructure',
              translations: { ko: 'AI와 일하는 환경을 인프라로 만들기' },
              slug: 'blog/ai-collaboration-environment',
            },
            {
              label: 'Building a Large Kotlin Library Ecosystem with AI in Three Months',
              translations: { ko: 'AI와 3개월 동안 만든 대규모 Kotlin 라이브러리 생태계' },
              slug: 'blog/ai-assisted-library-development',
            },
          ],
        },
      ],
    }),
  ],
});
