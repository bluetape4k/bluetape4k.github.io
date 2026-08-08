# AI 협업 환경 블로그 후속 글

## 맥락

블로그에는 AI 작업을 축적하는 방법을 다룬 Eugene Yan의 글에서 영감을 얻은 기존 AI 지원 라이브러리 개발
글의 후속 글이 필요했다.

## 결정

한국어와 영어 bilingual MDX 글을 추가하고, 유머러스한 manager/worker AI 협업 hero image와 process diagram을
추가하며, 두 블로그 색인 페이지를 업데이트한다. 이 글은 로컬 Codex와 Claude 설정을 guidance file, skills,
qmd, memory, hooks, verification으로 구성된 인프라로 설명한다.

## 결과

블로그에 두 번째 AI 협업 글이 생겼다.

- `src/content/docs/ko/blog/ai-collaboration-environment.mdx`
- `src/content/docs/blog/ai-collaboration-environment.mdx`
- `public/assets/ai-collaboration-infrastructure.png`
- `public/assets/ai-collaboration-process.svg`

## 검증

편집 후 `bluetape4k.github.io`에서 `npm run build`를 실행한다.

## 향후 guidance

향후 bilingual 블로그 글에서는 같은 변경으로 두 locale 파일과 두 블로그 색인의 card를 함께 업데이트한다.
내부 lesson은 간결하게 유지하고 한국어로 작성한다.
