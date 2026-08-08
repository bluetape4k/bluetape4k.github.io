# Virtual Threads 4편 교정

## 배경

시간순 교정 작업이 Java 21/25 SPI 설계를 다루는 Virtual Threads 시리즈 마지막 글에 도달했다.

## 결정

API/SPI 설명과 코드 예제는 보존한다. Korean localization, Korean series route, runtime provider,
fallback, classpath 경계에 관한 표현을 다듬는다. English 문서는 의미를 더 분명하게 만드는 최소한의
수정만 적용한다.

## 결과

Korean post는 Korean metadata와 `/ko/blog/...` series navigation을 사용한다. 공개 API, ServiceLoader,
provider 선택 semantics는 바꾸지 않고 SPI 설명을 더 자연스럽게 다듬었다. English post에서는
compile classpath에 관한 문장을 더 분명하게 정리했다.

## 검증

- `git diff --check`
- `npm run build`

## 향후 지침

API/SPI 설계 글에서는 compile-time API, runtime provider, fallback의 경계를 명확히 유지한다.
자연스러운 표현으로 다듬더라도 각 JDK별 세부 사항을 어느 계층이 소유하는지 흐리지 않는다.
