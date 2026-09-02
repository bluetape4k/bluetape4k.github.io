---
slug: "ko/manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-io-micrometer"
title: "bluetape4k-graph-io-micrometer"
manual:
  id: "bluetape4k-graph-io-micrometer"
  repository: "bluetape4k-graph"
  group: "graph-io"
  kind: "library"
  sourceCommit: "a405300799b36d4d6edb7267ad07ff34d4ad3afe"
  sourcePath: "docs/manual/bluetape4k-graph/ko/modules/bluetape4k-graph-io-micrometer.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "a405300799b36d4d6edb7267ad07ff34d4ad3afe"
  sourceDir: "graph-io/micrometer"
  layer: "build"
---


이 선택 모듈은 graph-io 진행 이벤트를 cardinality가 제한된 Micrometer meter로 변환합니다. `graph-io-core`에 의존하며, 메트릭이 필요 없는 애플리케이션은 import/export 동작을 바꾸지 않고 제외할 수 있습니다.

## 의존성

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:2.0.0"))
    implementation("io.github.bluetape4k.graph:bluetape4k-graph-io-micrometer")
}
```

애플리케이션의 `MeterRegistry`로 `GraphIoMicrometerProgressListener`를 만들고, 도메인 listener가 있다면 `GraphIoCompositeProgressListener`로 합성합니다. 실행·레코드·바이트·전체 시간·단계 시간·활성 실행 meter를 제공합니다.

tag에는 제한된 operation, format, status, kind, phase 값만 사용합니다. 고 cardinality 시계열을 막기 위해 dataset 경로, record ID, run ID, 예외 메시지는 포함하지 않습니다.

## 검증과 소스

```bash
./gradlew :bluetape4k-graph-io-micrometer:test
```

[모듈 README](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/graph-io/micrometer/README.ko.md), [listener 구현](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/graph-io/micrometer/src/main/kotlin/io/bluetape4k/graph/io/micrometer/GraphIoMicrometerProgressListener.kt), [계약 테스트](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/graph-io/micrometer/src/test/kotlin/io/bluetape4k/graph/io/micrometer/GraphIoMicrometerProgressListenerTest.kt)를 함께 확인하십시오.
