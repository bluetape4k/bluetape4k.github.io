# Virtual Threads Part 4 교정

## 배경

시간순 교정 stack이 Java 21/25 SPI 설계를 다루는 마지막 Virtual Threads series 글에 도달했다.

## 결정

API/SPI 설명과 code example을 유지한다. 한국어 localization, 한국어 series route, runtime provider·fallback·classpath boundary 주변 표현을 개선한다. 영어 수정은 명확성에 필요한 범위로 최소화한다.

## 결과

한국어 글이 한국어 metadata와 `/ko/blog/...` series navigation을 사용한다. public API, ServiceLoader, provider-selection semantics를 바꾸지 않고 SPI 설명을 더 자연스럽게 다듬었다. 영어 글은 compile-classpath 문장을 더 명확하게 했다.

## 검증

- `git diff --check`
- `npm run build`

## 향후 가이드

API/SPI 설계 글에서는 compile-time API, runtime provider, fallback boundary를 명시적으로 구분한다. 자연스러움 수정으로 각 JDK별 세부를 어느 layer가 소유하는지 흐리지 않는다.
