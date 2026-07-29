import { validateRepositoryRegistry } from './repositories.mjs';

export function buildStaticSidebar(registry) {
  const { repositories } = validateRepositoryRegistry(registry);
  return [
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
        { label: 'Ecosystem Atlas', translations: { ko: '생태계 지도' }, slug: 'ecosystem/atlas' },
        { label: 'Examples', translations: { ko: '예제' }, slug: 'ecosystem/examples' },
        { label: 'Visual Companions', translations: { ko: '시각 자료' }, slug: 'visual-companions' },
        { label: 'Version Governance', translations: { ko: '버전 거버넌스' }, slug: 'ecosystem/version-governance' },
      ],
    },
    {
      label: 'Manuals',
      translations: { ko: '매뉴얼' },
      items: [
        { label: 'Manual Home', translations: { ko: '매뉴얼 홈' }, slug: 'manual' },
        ...repositories.map((repository) => ({
          label: repository.label.en,
          translations: { ko: repository.label.ko },
          link: repository.route.en,
        })),
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
  ];
}
