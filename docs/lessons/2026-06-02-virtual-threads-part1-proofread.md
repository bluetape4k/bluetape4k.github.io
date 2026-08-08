# Virtual Threads 1편 교정

## 배경

시간순 blog 교정 스택이 `virtual-threads-part1-guide`에 도달했다.
기술적 의미는 바꾸지 않고 한국어와 영어 표현을 개선하는 작업이었다.

## 결정

영문 게시글은 이미 읽을 수 있는 수준이었으므로 대부분 유지하고, 한국어 작업은
현지화한 frontmatter, 더 자연스러운 표현, 올바른 locale series link에 집중했다.

## 결과

한국어 게시글은 한국어 description과 더 명확한 alt/caption 표현을 사용하며,
한국어 series navigation에는 `/ko/blog/...` link를 사용한다. 영문 게시글은 도입부,
downstream bottleneck, Kotlin section 주변의 문장 흐름만 작게 다듬었다.

## 검증

- `git diff --check`
- `npm run build`

## 향후 지침

이중 언어 blog를 교정할 때는 prose 작업의 일부로 frontmatter와 series link를 함께
확인한다. 본문이 이미 자연스럽게 읽히면 locale drift를 놓치기 쉽다.
