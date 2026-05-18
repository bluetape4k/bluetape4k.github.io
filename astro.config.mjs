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
