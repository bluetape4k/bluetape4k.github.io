---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-core/time-ranges"
title: Time and ranges
description: Make inclusive endpoints, overlap, and timezone conversion explicit.
manualId: bluetape4k-core
chapterId: time-ranges
manual:
  id: "bluetape4k-core"
  repository: "bluetape4k-projects"
  group: "foundation"
  kind: "library"
  sourceCommit: "ece059d6f79ae8b6d769e44ec98483a1225f6260"
  sourcePath: "docs/manual/en/modules/bluetape4k-core/time-ranges.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "bluetape4k/core"
  layer: "build"
  chapterId: "time-ranges"
---


## Problem

The most expensive time-query defects are often boundary mismatches rather than type errors. If one side includes the end and another excludes it, aggregation duplicates or drops events. Treating a zone-less local time as a timeline point adds ambiguity at daylight-saving transitions.

## Two independent decisions

1. **Time representation**: prefer `Instant` for storage/transport and a `ZonedDateTime` or `LocalDate` with explicit `ZoneId` for user schedules.
2. **Range boundary**: represent endpoint inclusion in the type, then use the same contract in repository queries and tests.

| Type | Notation | Equal start/end | Typical use |
| --- | --- | --- | --- |
| `ClosedClosedRange` | `[start, end]` | One point | Value interval including both endpoints |
| `ClosedOpenRange` | `[start, end)` | Empty | Time windows and paging cursors |
| `OpenClosedRange` | `(start, end]` | Empty | Aggregation after a previous checkpoint |
| `OpenOpenRange` | `(start, end)` | Empty | Mathematical interval excluding both endpoints |

## Time-window example

```kotlin
import io.bluetape4k.javatimes.toZonedDateTime
import io.bluetape4k.ranges.closedOpenRangeOf
import java.time.Instant
import java.time.ZoneId

val zone = ZoneId.of("Asia/Seoul")
val from = Instant.parse("2026-07-11T15:00:00Z")
val until = Instant.parse("2026-07-12T15:00:00Z")
val queryWindow = closedOpenRangeOf(from, until)

check(from in queryWindow)
check(until !in queryWindow)
check(from.toZonedDateTime(zone).toLocalDate().toString() == "2026-07-12")
```

Adjacent `[dayStart, nextDayStart)` windows do not overlap, making them a good fit for daily queries. Do not derive the next local day with `plusSeconds(86400)`; calculate the start of the next `LocalDate` in the business zone, then convert it to `Instant`.

## Range-operation contract

- `value in range` honors open/closed endpoints.
- `range.contains(other)` checks that the whole other range is included.
- `range.overlaps(other)` checks for a real common element. Touching endpoints overlap only when both relevant sides include the value.
- Reversed ranges are empty. For equal endpoints, only `[x, x]` is non-empty.
- `1 until 3` constructs Core's `ClosedOpenRange`.

```kotlin
val left = closedOpenRangeOf(0, 5)       // [0, 5)
val right = closedOpenRangeOf(5, 10)     // [5, 10)
check(!left.overlaps(right))

val includingFive = closedClosedRangeOf(0, 5)
check(includingFive.overlaps(right))      // both ranges contain 5
```

## Conversion warning

`(0..10).toClosedOpenRange()` reuses the `ClosedRange.endInclusive` value `10` as the new `endExclusive`. The result is `[0, 10)`, so the previously included `10` is excluded. This conversion does not preserve all integer elements.

If changing endpoint meaning is not the intention, calculate the desired exclusive endpoint and use the factory directly.

## Choosing a time type

| Situation | Representation/tool |
| --- | --- |
| Database storage, event timestamps, service transport | UTC `Instant` |
| A user's “every day at 09:00” rule | `LocalTime` plus explicit `ZoneId` |
| Calendar-date business policy | `LocalDate`; do not convert to `Instant` too early |
| Offset is part of the protocol | `OffsetDateTime` |
| Regional timezone rules matter | `ZonedDateTime` |

Core's `instantOf`, `toLocalDateTime`, `toOffsetDateTime`, and `toZonedDateTime` shorten JDK conversions. Helpers without a zone argument default to UTC; pass a zone whenever the value represents user-local time.

## Failures and operations

- Never use the system-default timezone for business policy.
- Lock the chosen offset in DST gaps/overlaps with fixture tests.
- Logs and metrics must identify UTC, zone, or offset.
- Verify SQL comparison operators and the `Range` endpoint contract in the same repository test.
- Decide at the API boundary whether empty/reversed ranges mean “no result” or caller error.

## Source and representative tests

- [`Range.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/bluetape4k/core/src/main/kotlin/io/bluetape4k/ranges/Range.kt)
- [`ClosedOpenRange.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/bluetape4k/core/src/main/kotlin/io/bluetape4k/ranges/ClosedOpenRange.kt)
- [`InstantSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/bluetape4k/core/src/main/kotlin/io/bluetape4k/javatimes/InstantSupport.kt)
- [`RangeBoundaryTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/bluetape4k/core/src/test/kotlin/io/bluetape4k/ranges/RangeBoundaryTest.kt)
- [`RangeSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/bluetape4k/core/src/test/kotlin/io/bluetape4k/ranges/RangeSupportTest.kt)
- [`InstantSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/bluetape4k/core/src/test/kotlin/io/bluetape4k/javatimes/InstantSupportTest.kt)

Continue with [Validation and invariants](/manual/bluetape4k-projects/1.11/modules/bluetape4k-core/validation/) for input boundaries and [Core recipes](/manual/bluetape4k-projects/1.11/modules/bluetape4k-core/recipes/) for assembly.
