---
slug: "manual/bluetape4k-graph/1.0/modules/bluetape4k-graph-io-micrometer"
title: "bluetape4k-graph-io-micrometer"
manual:
  id: "bluetape4k-graph-io-micrometer"
  repository: "bluetape4k-graph"
  group: "graph-io"
  kind: "library"
  sourceCommit: "a405300799b36d4d6edb7267ad07ff34d4ad3afe"
  sourcePath: "docs/manual/bluetape4k-graph/en/modules/bluetape4k-graph-io-micrometer.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "a405300799b36d4d6edb7267ad07ff34d4ad3afe"
  sourceDir: "graph-io/micrometer"
  layer: "build"
---


This optional bridge converts graph-io progress events into bounded Micrometer meters. It depends on `graph-io-core`; applications that do not need metrics can omit it without changing import or export behavior.

## Dependency

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:2.0.0"))
    implementation("io.github.bluetape4k.graph:bluetape4k-graph-io-micrometer")
}
```

Create `GraphIoMicrometerProgressListener` with the application's `MeterRegistry`, then compose it with any domain listener through `GraphIoCompositeProgressListener`. The bridge exposes run, record, byte, duration, phase-duration, and active-run meters.

Tags contain only bounded operation, format, status, kind, and phase values. Dataset paths, record identifiers, run identifiers, and exception messages are deliberately excluded to prevent high-cardinality series.

## Verification and sources

```bash
./gradlew :bluetape4k-graph-io-micrometer:test
```

See the [module README](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/graph-io/micrometer/README.md), [listener implementation](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/graph-io/micrometer/src/main/kotlin/io/bluetape4k/graph/io/micrometer/GraphIoMicrometerProgressListener.kt), and [contract tests](https://github.com/bluetape4k/bluetape4k-graph/blob/a405300799b36d4d6edb7267ad07ff34d4ad3afe/graph-io/micrometer/src/test/kotlin/io/bluetape4k/graph/io/micrometer/GraphIoMicrometerProgressListenerTest.kt).
