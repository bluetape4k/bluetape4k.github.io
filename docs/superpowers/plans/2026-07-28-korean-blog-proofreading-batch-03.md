# 한국어 블로그 교정 배치 03 계획

## 범위

- 작업 유형: Type E — 공개 블로그 문서와 차트 자산 유지보수
- 대상 글: `from-pure-jvm-to-libvips-benchmarking-image-processing`,
  `reducing-csv-parser-allocations-with-okio`
- 로케일: 한국어 본문 교정, 한·영 차트 자산 동시 갱신
- 제외: 대표 이미지, 벤치마크 재실행, 수치·명령·소스 링크·성능 결론 변경

## 고정 근거

| 글 | 기준 근거 | 보존하는 핵심 |
|---|---|---|
| 이미지 처리 | `bluetape4k-image/benchmark/images-benchmark`의 2026-05-28 자연 사진 보고서 | `ms/op`은 낮을수록 좋음, Java 25 FFM 실측, Java 21 JNI macOS arm64 N/A |
| CSV 파서 | `bluetape4k-projects/io/csv`의 `OkioCsvLexer`, `CsvParserBenchmark` | UTF-8 fast path와 fallback 경계, read-only `UnsafeCursor`, throughput `ops/s`는 높을수록 좋음 |

## 실행 순서

1. 두 한국어 글을 문단 단위로 교정하고, 수치·식별자·소스 링크의 전후 값을 대조한다.
   - Expected DoD: 번역체와 일반 영어를 정리하되 성능 주장과 구현 경계는 변하지 않는다.
2. 이미지 처리 차트의 한·영 SVG/PNG를 다크 스타일로 다시 만들고, 로그 축·단위·Java 21 N/A 주석을 보존한다.
   - Expected DoD: 색만으로 비교 대상을 구분하지 않고, `ms/op`의 방향과 실행 환경을 차트 안에서 읽을 수 있다.
3. CSV 차트의 한·영 SVG/PNG를 다크 스타일로 다시 만들고, 한국어 차트의 일반 설명을 한국어로 바꾼다.
   - Expected DoD: public reader/direct lexer, small/medium/large workload, `ops/s` 방향과 두 처리 경로의 비교가 한눈에 드러난다.
4. SVG XML·텍스트·정적 감사, 전체 크기 PNG 검수, 로케일 참조 테스트와 사이트 빌드를 수행한다.
   - Expected DoD: 한·영 자산과 MDX 참조가 맞고, 차트 문구가 잘리지 않으며, 변경한 로컬 경로가 응답한다.

## 다이어그램 불변식

- 각 차트는 설명용 비교 차트이며, 흐름이나 의존성 그래프가 아니다. connector와 marker는 N/A다.
- 한국어 차트는 `goorm Sans`와 `goorm Sans Code`, 영문 차트는 승인된 영문 글꼴 조합을 사용한다.
- 한국어 차트의 일반 독자용 설명은 한국어로 쓴다. `scrimage`, `libvips`, `FFM`, `UnsafeCursor`, API·모듈 식별자는 그대로 둔다.
- 값, 막대 비율, 단위, 벤치마크 환경과 N/A 사유는 원본과 동일하게 유지한다.
