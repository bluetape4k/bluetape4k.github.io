# 2026-06-02 AI 협업 환경 블로그 교정

## 맥락

두 번째 AI 협업 글에는 이미 bilingual route와 공용 hero asset이 있었지만 두 locale 모두 초안 같은 표현이
남아 있었다. 특히 영어 버전은 완성된 글보다 개요 메모에 가까웠다.

## 결정

route, hero asset, section order, Eugene Yan source link, technical scope를 보존하면서 두 locale의 본문을 다시
작성한다. 한국어 버전은 개발자에게 자연스럽게 다듬고, 영어 버전은 조각을 번역하는 대신 완성된 글로
현지화한다.

## 결과

한국어와 영어 `ai-collaboration-environment` 글을 업데이트하고, onboarding docs, skills, qmd, memory, hooks,
delegation, 공용 Codex/Claude guidance, environment maintenance, conclusion으로 이어지는 동일한 section에서
bilingual parity를 유지했다.

## 검증

PR을 merge하기 전에 `git diff --check`, `npm run build`, GitHub Pages Build를 실행한다.

## 다음 guidance

초기의 process/reflection 글에서는 운영 세부 사항을 보존한다. 자연스러움은 workflow 내용을 삭제해서가 아니라,
더 분명한 순서, 구체적인 동사, 완결된 문단에서 나오게 한다.
