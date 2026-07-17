---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-csv"
manualId: bluetape4k-csv
title: "Module bluetape4k-csv"
description: "bluetape4k-csv is a Kotlin-native CSV/TSV parsing library with a self-implemented RFC 4180 compliant engine."
kind: library
group: io
manual:
  id: "bluetape4k-csv"
  repository: "bluetape4k-projects"
  group: "io"
  kind: "library"
  sourceCommit: "e89bf724fd018af8c2ab4564a5c9a007fe27b46a"
  sourcePath: "docs/manual/en/modules/bluetape4k-csv.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "io/csv"
  layer: "build"
---


## Problem

bluetape4k-csv is a Kotlin-native CSV/TSV parsing library with a self-implemented RFC 4180 compliant engine. This manual connects that purpose to the current build, source entry points, tests, configuration resources, and lifecycle evidence instead of duplicating the README feature list.

## When to use

Use `bluetape4k-csv` when the application needs encoding boundaries, resource ownership, streaming, compatibility, and malformed input. Start with the source entry points below and confirm that their ownership and failure contracts match the calling component. Prefer a smaller standard-library or already-adopted module when it satisfies the same contract without another runtime boundary.

## Coordinates

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-csv")
}
```

Gradle project path: `:bluetape4k-csv`. Source directory: `io/csv`.

## Concepts

The first source-level concepts to inspect are `CsvRecordReader`, `CsvRecordWriter`, `CsvSettings`, `CvsParserDefaults`, `Record`, `RecordFactory`, `RecordReader`, and `RecordReaderSupport`. File names are navigation anchors; read each declaration and its tests before treating it as a public contract.

## Quick start

Add the coordinate above, refresh Gradle, and start from the smallest entry point that owns the required task. Open [`CsvRecordReader`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/CsvRecordReader.kt) first; it is a concrete source entry point for the module.

## API by task

| Entry point | What to verify |
| --- | --- |
| [`CsvRecordReader`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/CsvRecordReader.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CsvRecordWriter`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/CsvRecordWriter.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CsvSettings`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/CsvSettings.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`CvsParserDefaults`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/CvsParserDefaults.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`Record`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/Record.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RecordFactory`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/RecordFactory.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RecordReader`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/RecordReader.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RecordReaderSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/RecordReaderSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RecordWriter`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/RecordWriter.kt) | Inspect this declaration's constructors, functions, and ownership contract. |
| [`RecordWriterSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/RecordWriterSupport.kt) | Inspect this declaration's constructors, functions, and ownership contract. |

## Patterns

The README evidence is organized around **Overview**, **Architecture**, **CSV/TSV Class Structure**, **CSV/TSV Processing Flow**, **Key Features**, **Sync vs Async API**, **Settings**, **null vs Empty String**, **UTF-8 Writer Fast Path**, and **Usage Examples**. Use those topics as a navigation map, then confirm behavior in source and tests. Keep adoption narrow and connect owned resources to the caller lifecycle.

## Integrations

The current build declares these integration edges:

```kotlin
api(project(":bluetape4k-io"))
implementation(libs.okio)
compileOnly(project(":bluetape4k-coroutines"))
compileOnly(libs.kotlinx.coroutines.core)
```

Treat `compileOnly` edges as caller-provided capabilities and verify runtime availability before using their APIs.

## Configuration

No module-level configuration resource was found under `src/main/resources`. Configuration is supplied through constructors, builders, function arguments, or the integrating framework; confirm defaults in source.

## Failures

Failure semantics are defined by the linked entry points and tests, not inferred from the artifact name. Keep cancellation and timeout signals intact, close owned resources, and translate backend exceptions only at a boundary that can add a stable domain contract. Use the test anchors below to verify the exact behavior before adding retries or fallbacks.

## Operations

Track payload size, allocation, latency, malformed-input rate, resource closure, and protocol errors. Keep capacity, timeout, retry, and shutdown settings next to the component that owns the resource; avoid process-wide defaults that hide which caller accepted the trade-off.

## Testing

Run the module test task:

```bash
./gradlew :bluetape4k-csv:test --no-configuration-cache
```

Representative test anchors:

- [`AbstractRecordReaderTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/test/kotlin/io/bluetape4k/csv/AbstractRecordReaderTest.kt)
- [`CsvEdgeCaseTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/test/kotlin/io/bluetape4k/csv/CsvEdgeCaseTest.kt)
- [`CsvRecordReaderTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/test/kotlin/io/bluetape4k/csv/CsvRecordReaderTest.kt)
- [`CsvRecordWriterTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/test/kotlin/io/bluetape4k/csv/CsvRecordWriterTest.kt)
- [`NativeCsvRecordReaderTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/test/kotlin/io/bluetape4k/csv/NativeCsvRecordReaderTest.kt)
- [`RFC4180ComplianceTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/test/kotlin/io/bluetape4k/csv/RFC4180ComplianceTest.kt)
- [`RecordReaderSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/test/kotlin/io/bluetape4k/csv/RecordReaderSupportTest.kt)
- [`RecordWriterSupportTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/test/kotlin/io/bluetape4k/csv/RecordWriterSupportTest.kt)

## Workshops

No dedicated workshop path is registered in the manual manifest. Use the module README and the representative tests above as runnable evidence.

## Limitations

This page documents the repository state represented by the linked source and tests. It does not turn optional backends into application defaults or claim performance without a benchmark artifact. Re-check compatibility and lifecycle notes when the module version changes.

<!-- release-readme-diagrams:start -->
## Release diagrams

These diagrams are copied byte-for-byte from README assets in the `1.11.0` release tag. They describe this manual's released structure and runtime flows, not later Snapshot changes. Select a preview to open the SVG source.

### CSV/TSV Class Structure diagram

[![CSV/TSV Class Structure diagram](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/io-csv-diagram-01.png)](../../assets/readme-diagrams/io-csv-diagram-01.svg)

_Release README: [`io/csv/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/io/csv/README.md)_

### CSV/TSV Processing Flow diagram

[![CSV/TSV Processing Flow diagram](/manual-assets/bluetape4k-projects/1.11/readme-diagrams/io-csv-diagram-02.png)](../../assets/readme-diagrams/io-csv-diagram-02.svg)

_Release README: [`io/csv/README.md`](https://github.com/bluetape4k/bluetape4k-projects/blob/6187173b58e8b4c5c435c145e00e94708f31ef75/io/csv/README.md)_

<!-- release-readme-diagrams:end -->

## Sources

- [Module README](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/README.md)
- [Module build](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/build.gradle.kts)
- [`CsvRecordReader`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/CsvRecordReader.kt)
- [`CsvRecordWriter`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/CsvRecordWriter.kt)
- [`CsvSettings`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/CsvSettings.kt)
- [`CvsParserDefaults`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/CvsParserDefaults.kt)
- [`Record`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/Record.kt)
- [`RecordFactory`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/RecordFactory.kt)
- [`RecordReader`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/RecordReader.kt)
- [`RecordReaderSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/RecordReaderSupport.kt)
- [`RecordWriter`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/RecordWriter.kt)
- [`RecordWriterSupport`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/main/kotlin/io/bluetape4k/csv/RecordWriterSupport.kt)
- [`AbstractRecordReaderTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/test/kotlin/io/bluetape4k/csv/AbstractRecordReaderTest.kt)
- [`CsvEdgeCaseTest`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/io/csv/src/test/kotlin/io/bluetape4k/csv/CsvEdgeCaseTest.kt)
