# CSV writer Okio 후속 블로그

## 배경

PR `bluetape4k-projects#675`가 앞서 CSV reader에서 `UnsafeCursor` 최적화를 적용한 데 이어, #674의 UTF-8 `FlowCsvWriter.writeFile` Okio `BufferedSink` fast path를 제공했다.

## 결정

raw work log가 아니라 narrative engineering note로 후속 글을 게시한다. coroutine `Flow` pipeline에서 시작해 기존 character writer 경로가 병목이었던 이유를 설명한 뒤 Okio sink fast path와 behavior lock을 보여준다. speedup ratio만이 아니라 baseline ops/s와 Okio ops/s를 직접 비교하는 chart를 추가한다.

## 결과

bilingual blog 글과 새로운 SVG+PNG chart asset을 추가했다.

- `src/content/docs/blog/csv-writer-okio-buffered-sink.mdx`
- `src/content/docs/ko/blog/csv-writer-okio-buffered-sink.mdx`
- `public/assets/csv-okio-writer-throughput-01.svg`
- `public/assets/csv-okio-writer-throughput-01.png`

## 검증

`rsvg-convert`로 chart를 렌더링하고 PNG를 검사했다. 첫 렌더 preview에서 text overflow를 수정한 뒤 글을 작성했다.

## 향후 guard

benchmark 후속 글은 이야기 중심으로 유지하고 baseline-vs-new chart를 직접 포함하며 source link는 `develop` branch에 고정한다.
