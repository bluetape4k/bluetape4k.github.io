---
slug: "manual/bluetape4k-projects/1.12/modules/bluetape4k-core/validation"
title: Validation and invariants
description: Express caller arguments, object state, and domain-rule failures at their owning boundary.
manualId: bluetape4k-core
chapterId: validation
manual:
  id: "bluetape4k-core"
  repository: "bluetape4k-projects"
  group: "foundation"
  kind: "library"
  sourceCommit: "ffde7b8be16124b1c538bb318a7d482927f738ad"
  sourcePath: "docs/manual/en/modules/bluetape4k-core/validation.md"
  minorVersion: "1.12"
  releaseRef: "1.12.1"
  releaseCommit: "7cf0b73646af05c0f8872cc4f6a16983949c4e3e"
  sourceDir: "bluetape4k/core"
  layer: "build"
  learningOrder: 110
  chapterId: "validation"
  chapterOrder: 1
---


Validation is the boundary that prevents invalid state from entering the system. Exception meaning follows the owner of the failed rule.

![Validation boundaries for caller arguments, object state, and domain rules](/manual-assets/bluetape4k-projects/1.12/core/validation-boundary.svg)

## The three boundaries

| Failed rule | Default tool | Surface |
| --- | --- | --- |
| caller argument | `require`, `requireNotBlank`, `requirePositiveNumber`, etc. | `IllegalArgumentException` |
| state of an existing object | `check` or explicit state guard | `IllegalStateException` |
| business/domain rule | domain validator/result/exception | domain-specific surface |

Replacing domain failure with a generic precondition prevents callers from distinguishing retry, user feedback, and state transitions.

## Helpers preserve the receiver

Most `require*` extensions return the validated receiver.

```kotlin
class SearchRequest(rawQuery: String?, limit: Int) {
    val query: String = rawQuery.requireNotBlank("query").trim()
    val limit: Int = limit.requireInRange(1, 100, "limit")
}
```

The helper set covers null/empty/blank, text containment, equality/comparison, closed/open ranges, numeric signs, and array/collection/map conditions. Keep plain `require` when it is clearer.

## Validate before side effects

```kotlin
fun createAccount(command: CreateAccount): AccountId {
    val email = command.email.requireNotBlank("email")
    command.initialCredit.requireZeroOrPositiveNumber("initialCredit")
    return repository.insert(email, command.initialCredit)
}
```

Racy invariants still require transactions or uniqueness constraints; preconditions alone cannot make them atomic.

## Messages and observability

- include parameter name and expected condition;
- never include passwords, tokens, or raw sensitive payloads;
- count caller argument failures separately from server-state violations;
- keep high-cardinality raw values out of metric labels.

## Testing

Cover values immediately below and above boundaries, null, empty, blank, open/closed endpoints, and returned receiver identity. Assert exception type and parameter name when they are public contract.

## Source and representative tests

- [`RequireSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/bluetape4k/core/src/main/kotlin/io/bluetape4k/support/RequireSupport.kt)
- [`RequireSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.12.1/bluetape4k/core/src/test/kotlin/io/bluetape4k/support/RequireSupportTest.kt)

Next, keep validated data inside a fixed memory budget with [Bounded collections](/manual/bluetape4k-projects/1.12/modules/bluetape4k-core/bounded-collections/).
