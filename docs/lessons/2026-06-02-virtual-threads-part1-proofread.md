# Virtual Threads Part 1 교정

## 배경

시간순 blog proofreading stack이 `virtual-threads-part1-guide`에 도달했다. 기술 의미를 바꾸지 않고 한국어·영어 표현을 개선하는 작업이었다.

## 결정

영어 글은 이미 읽을 수 있으므로 대부분 유지하고, 한국어 pass에서 localized frontmatter, 더 자연스러운 표현, locale에 맞는 series link를 다룬다.

## 결과

한국어 글은 한국어 description, 더 명확한 alt/caption 문구, 한국어 series navigation용 `/ko/blog/...` link를 사용한다. 영어 글은 intro, downstream bottleneck, Kotlin section 주변 rhythm만 작게 수정했다.

## 검증

- `git diff --check`
- `npm run build`

## 향후 가이드

bilingual blog 교정에서는 frontmatter와 series link도 prose pass의 일부로 확인한다. 본문이 이미 잘 읽혀도 locale drift를 놓치기 쉽다.
