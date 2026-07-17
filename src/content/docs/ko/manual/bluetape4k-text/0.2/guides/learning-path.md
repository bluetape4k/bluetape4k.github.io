---
slug: "ko/manual/bluetape4k-text/0.2/guides/learning-path"
title: "학습 경로"
manual:
  id: "guides/learning-path"
  repository: "bluetape4k-text"
  group: "overview"
  kind: "guide"
  sourceCommit: "1d28940432ea5dc3e8f608577682f76b357e4f7e"
  sourcePath: "docs/manual/ko/guides/learning-path.md"
  minorVersion: "0.2"
  releaseRef: "0.2.1"
  releaseCommit: "2db7671afad20045afdcb5793c0113b8b23b972b"
  sourceDir: "docs/manual"
  layer: "build"
---


저장소를 차례로 실행하며 결과를 확인하는 학습 순서다. 각 단계에서 무엇을 배우고, 어떤 예제를 실행하며, 무엇을 이해한 뒤 다음으로 넘어갈지 설명한다.

## 1단계: 15분 안에 첫 결과 얻기

[시작하기](/ko/manual/bluetape4k-text/0.2/getting-started/)를 읽고 한국어 정규화와 토큰화를 한 번 실행한다.

다음 내용을 설명할 수 있어야 한다.

- BOM을 가져와도 런타임 모듈을 따로 추가해야 하는 이유
- 뒤에서 품사나 위치를 사용할 때 구조화된 토큰을 유지해야 하는 이유
- 빈 입력과 지나치게 긴 입력을 어느 경계에서 거부할지

예제에서 `안돼ㅋㅋㅋ`와 `[주말, 특가, 쇼핑몰]`이 나오고, BOM이 관리하는 모듈에 버전을 다시 적지 않았다면 다음 단계로 넘어간다.

## 2단계: 언어 분기 방식 선택하기

[Lingua](/ko/manual/bluetape4k-text/0.2/modules/lingua/)와 [혼합 언어 처리](/ko/manual/bluetape4k-text/0.2/guides/mixed-language-processing/)를 읽은 뒤 [Lingua 예제](/ko/manual/bluetape4k-text/0.2/examples/lingua-examples/)를 실행한다.

예제에서 세 가지 선택을 살펴보자.

1. 감지기를 한 번 만들고 재사용한다.
2. 애플리케이션이 지원하는 언어 집합을 명시한다.
3. 저정확도 모드를 별도 선택으로 다룬다.

알 수 없는 입력, 모호한 입력, 혼합 입력의 처리 방식을 정했다면 다음으로 넘어간다. 문자 범위만 확인하면 되는 경로라면 통계 감지기가 필요하지 않을 수도 있다.

## 3단계: 한국어와 일본어 분석하기

[한국어](/ko/manual/bluetape4k-text/0.2/modules/tokenizer-korean/)와 [일본어](/ko/manual/bluetape4k-text/0.2/modules/tokenizer-japanese/) 모듈 문서를 비교하고 [토크나이저 안전 예제](/ko/manual/bluetape4k-text/0.2/examples/tokenizer-safety-examples/)를 살펴본다.

다음 차이를 이해해야 한다.

- 정규화와 토큰화
- surface 문자열과 품사 정보가 있는 토큰
- 애플리케이션 정책 사전과 패키지 사전
- 유효한 요청과 성공한 프로세서 호출

테스트가 사용자에게 보이는 token surface는 안정적으로 검사하되 내부 형태소 선택 전체에 지나치게 묶이지 않는다면 다음 단계로 넘어간다.

## 4단계: 여러 패턴 검색하기

[텍스트 검색](/ko/manual/bluetape4k-text/0.2/modules/text-search/)을 읽고 [검색 예제](/ko/manual/bluetape4k-text/0.2/examples/text-search-examples/)를 실행한다. 키워드 값을 하나 바꾼 뒤 builder 결과, DSL 결과, 치환 문자열, 첫 Flow 경고를 확인한다.

`parseText`, `containsMatch`, `firstMatch`, `replaceAll`, `matchesAsFlow` 중 알맞은 연산을 고를 수 있어야 한다. 공유 시점에 builder가 아닌 불변 automaton을 보관하는 이유와 겹침·단어 경계·정규화 옵션이 필요한 조건도 설명할 수 있어야 한다.

## 5단계: 운영할 수 있는 형태로 만들기

[입력 안전성](/ko/manual/bluetape4k-text/0.2/guides/input-safety/), [시작과 메모리](/ko/manual/bluetape4k-text/0.2/operations/startup-and-memory/), [실패 계약](/ko/manual/bluetape4k-text/0.2/operations/failure-contracts/), [품질 게이트](/ko/manual/bluetape4k-text/0.2/quality/quality-gates/)를 읽는다.

운영 전에 다음을 확인한다.

- 감지기, 사전, automaton의 소유자와 수명이 정해져 있다.
- 실제 사용할 고비용 경로를 warmup한다.
- 오류에는 길이와 분류만 넣고 제출 본문은 넣지 않는다.
- 벤치마크는 기록된 환경 안에서 해석한다.
- 사전 변경을 저장하고 배포하는 규칙이 있다.

## 문제별 확장 경로

| 문제 | 자세한 문서 |
|---|---|
| 사용자 사전과 moderation 정책 | [사전과 금칙어](/ko/manual/bluetape4k-text/0.2/guides/dictionaries-and-blockwords/) |
| 한국어·일본어·Latin 혼합 입력 | [혼합 언어 처리](/ko/manual/bluetape4k-text/0.2/guides/mixed-language-processing/) |
| 회귀 테스트 | [테스트](/ko/manual/bluetape4k-text/0.2/guides/testing/) |
| 모듈 선택 | [기능 선택](/ko/manual/bluetape4k-text/0.2/guides/capability-selection/) |
| 성능 수치 해석 | [Aho-Corasick 벤치마크](/ko/manual/bluetape4k-text/0.2/quality/aho-corasick-benchmarks/) |

모듈 문서는 API 중심 참고 자료이고, 이 가이드는 모듈을 애플리케이션 결정으로 연결한다. 기술 주장의 최종 근거는 각 문서에 연결한 안정 배포본 소스다.
