---
slug: "manual/bluetape4k-image/1.0/modules/bluetape4k-images-benchmark"
manualId: "bluetape4k-images-benchmark"
id: "bluetape4k-images-benchmark"
title: "Image processing benchmarks"
locale: "en"
kind: "benchmark"
gradlePath: ":bluetape4k-images-benchmark"
sourceDir: "benchmark/images-benchmark"
releaseRef: "1.0.0"
artifact: null
manual:
  id: "bluetape4k-images-benchmark"
  repository: "bluetape4k-image"
  group: "benchmarks"
  kind: "benchmark"
  sourceCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourcePath: "docs/manual/bluetape4k-image/en/modules/bluetape4k-images-benchmark.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "b38d4891b66dff8bc63db0018b5e41810d1da9bc"
  sourceDir: "benchmark/images-benchmark"
  layer: "apply"
---


> Performance benchmark

## Problem

This non-published module keeps reproducible evidence for Scrimage and libvips decisions. It measures geometry, encoding, filter chains, IO boundaries, concurrent compressed-file IO, managed allocation, and complete large-file load-transform-write pipelines using `kotlinx-benchmark` on its JVM JMH backend.

## When to use it

Use it before claiming that a backend or IO boundary is faster, when checking a performance regression, or when choosing Scrimage versus libvips for a measured workload. Do not use one headline ratio as a production capacity estimate.

## Coordinates

The benchmark is repository-only and publishes no artifact. Its project dependencies are aligned from the same `bluetape4k-dependencies` release catalog used by the 1.0.0 source.

## Core concepts

- `AverageTime` is lower-is-better; throughput is higher-is-better.
- Fixture, host, JVM, backend, warmups, iterations, fork count, command, and raw JSON belong to every comparison.
- The benchmark runs on JDK 25. `-Pvips.impl=java25` selects FFM, while `-Pvips.impl=java21` selects the legacy JVips JNI backend; the property is a backend name and does not select a JDK 21 toolchain.
- GC-profiler results cover managed heap only, not libvips native memory.
- Full pipelines provide stronger application evidence than isolated, potentially lazy geometry operations.

## Quick start

For the Java 25 FFM lane, install JDK 25 and system libvips (`brew install vips` on macOS).

```bash
./gradlew :bluetape4k-images-benchmark:benchmarkBenchmark \
  -Pvips.impl=java25 --console=plain
```

Focused large-file evidence:

```bash
./gradlew :bluetape4k-images-benchmark:benchmarkLargeStreamingBenchmark \
  -Pvips.impl=java25 --console=plain
```

Run the JDK 25 backends sequentially on the same compatible host. Historical JDK 21 JNI rows remain frozen benchmark evidence and are not the current runtime baseline.

## API by task

| Question | Benchmark |
| --- | --- |
| Resize/encode backend latency | `ImageResizeBenchmark`, `ImageEncodeBenchmark` |
| Scrimage filter cost | `ImageFilterBenchmark` |
| Chained transform allocation | `ImagePipelineBenchmark` |
| Path/stream/Okio/suspended boundary | `ImageIoBoundaryBenchmark` |
| Concurrent compressed-file throughput | `ImageFileIoThroughputBenchmark` |
| End-to-end large-file behavior | `ImageLargeStreamingBenchmark` |
| JNI versus FFM wrapper | `VipsBackendBenchmark`, `VipsBackendEncodeBenchmark` |

## Recommended patterns

Start with the production-shaped scenario, then isolate a suspected boundary. Preserve raw JSON and environment metadata. Re-run both candidates on one host, one JVM policy, and equivalent fixtures. Use native profiling in addition to JMH GC data for libvips lifetime questions.

## Integrations

The suite compares [`bluetape4k-images`](/manual/bluetape4k-image/1.0/modules/bluetape4k-images/) with the binding-neutral [`vips API`](/manual/bluetape4k-image/1.0/modules/bluetape4k-images-vips-api/) and the [JDK 25 JVips JNI](/manual/bluetape4k-image/1.0/modules/bluetape4k-images-vips-java21/) or [JDK 25 FFM](/manual/bluetape4k-image/1.0/modules/bluetape4k-images-vips-java25/) runtime.

## Configuration

The complete benchmark uses three warmups, five measurements, one fork, average-time mode, and milliseconds. Focused configurations use one warmup and three one-second measurements. The build uses the JDK 25 toolchain; `vips.impl` selects the backend and adds `--enable-native-access=ALL-UNNAMED` for FFM benchmark forks.

## Failure modes

- Near-zero vips rows: verify native availability; unavailable methods consume `null` and return immediately.
- Historical Java 21 JNI row skips on macOS arm64: the recorded 1.0.0 host found an incompatible x86_64 JVips dylib; use a compatible host for reproductions and label the result as historical.
- Large variance: avoid parallel benchmark processes, check thermal/load state, and keep fixtures and forks identical.
- Native load failure: verify system libvips and the FFM/JNI library path before interpreting results.

## Operations

Representative 1.0.0 evidence on macOS arm64, GraalVM Java 25.0.3 found the full libvips `Path` pipeline at `7.13 ms/op` for `large-photo` and `5.47 ms/op` for `ocr-document`; Scrimage `Path` measured `223.19` and `145.13 ms/op`. These are local comparable snapshots, not a universal ranking. Scrimage suspended boundaries were slower in both boundary and many-file tests, so they are documented as lifecycle/integration APIs rather than performance optimizations.

## Testing

Validate task wiring without paying for a full run:

```bash
./gradlew :bluetape4k-images-benchmark:benchmarkBenchmark \
  -Pvips.impl=java25 --dry-run --console=plain
```

For publishable evidence, retain generated JSON, record the exact command/environment, update the dated report, and regenerate matching SVG/PNG charts.

## Workshops and learning path

1. Run [`basic-processing`](/manual/bluetape4k-image/1.0/modules/basic-processing/) to understand the user-facing operations.
2. Read the natural-photo result and benchmark source together.
3. Study IO-boundary and allocation reports before interpreting coroutine APIs.
4. Use the large-streaming report for the strongest end-to-end backend comparison.
5. Re-run the focused scenario on deployment-like hardware before deciding.

## Limitations

- The 1.0.0 reports mix a fresh macOS Java 25 run with explicitly historical Linux rows; they are not one experiment.
- The macOS arm64 run did not produce compatible historical Java 21 JNI measurements; this does not change the current JDK 25 requirement.
- `vips_resize` does not encode its result; libvips lazy evaluation means geometry-only speedups do not equal completed pixel-pipeline speedups.
- GC allocation excludes native memory.
- IO API convenience, latency, throughput, and backend selection are separate questions.
- No benchmark proves production behavior under different data, concurrency, hardware, JVM, codecs, or storage.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are loaded directly from README assets published with the `1.0.0` release and pinned to its immutable commit. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG at the same release commit.

### images benchmark Architecture diagram

[![images benchmark Architecture diagram](https://raw.githubusercontent.com/bluetape4k/bluetape4k-image/b38d4891b66dff8bc63db0018b5e41810d1da9bc/docs/images/readme-diagrams/images-benchmark-architecture-01.png)](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/docs/images/readme-diagrams/images-benchmark-architecture-01.svg)

_Release README: [`benchmark/images-benchmark/README.md`](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/benchmark/images-benchmark/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Benchmark README](https://github.com/bluetape4k/bluetape4k-image/blob/1.0.0/benchmark/images-benchmark/README.md)
- [Natural-photo results](https://github.com/bluetape4k/bluetape4k-image/blob/1.0.0/benchmark/images-benchmark/docs/benchmark-results-2026-05-28-natural-photos.md)
- [IO-boundary baseline](https://github.com/bluetape4k/bluetape4k-image/blob/1.0.0/benchmark/images-benchmark/docs/io-boundary-baseline-2026-05-29.md)
- [File IO throughput](https://github.com/bluetape4k/bluetape4k-image/blob/1.0.0/benchmark/images-benchmark/docs/file-io-throughput-2026-05-29.md)
- [Memory profile](https://github.com/bluetape4k/bluetape4k-image/blob/1.0.0/benchmark/images-benchmark/docs/memory-profile-2026-05-29.md)
- [Large streaming pipeline](https://github.com/bluetape4k/bluetape4k-image/blob/1.0.0/benchmark/images-benchmark/docs/large-streaming-2026-06-05.md)
- [Gradle build file](https://github.com/bluetape4k/bluetape4k-image/blob/1.0.0/benchmark/images-benchmark/build.gradle.kts)
