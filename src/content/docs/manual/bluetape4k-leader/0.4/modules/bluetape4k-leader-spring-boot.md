---
slug: "manual/bluetape4k-leader/0.4/modules/bluetape4k-leader-spring-boot"
manualId: "bluetape4k-leader-spring-boot"
id: "bluetape4k-leader-spring-boot"
title: "Spring Boot integration"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-leader-spring-boot"
sourceDir: "leader-spring-boot"
releaseRef: "0.4.0"
artifact: io.github.bluetape4k.leader:bluetape4k-leader-spring-boot
manual:
  id: "bluetape4k-leader-spring-boot"
  repository: "bluetape4k-leader"
  group: "frameworks"
  kind: "library"
  sourceCommit: "27627f5cf430ef2640d5847ecfeef914ea935c4c"
  sourcePath: "docs/manual/en/modules/bluetape4k-leader-spring-boot.md"
  minorVersion: "0.4"
  releaseRef: "0.4.0"
  releaseCommit: "17ab7f872c1f96318c73d3580729cac20a67e017"
  sourceDir: "leader-spring-boot"
  layer: "build"
---


> Library module

## Problem

Provides Spring Boot auto-configuration, backend factories, compile-time-woven AOP for `@LeaderElection`/`@LeaderGroupElection`, SpEL lock names, failure policy, and lock scope utilities.

## When to use it

Use it for Spring-managed jobs that benefit from declarative election. Use direct elector calls when ownership should remain explicit in application code.

## Coordinates

Artifact: `io.github.bluetape4k.leader:bluetape4k-leader-spring-boot`

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.leader:bluetape4k-leader-spring-boot")
}
```

## Core concepts

The aspect resolves a factory, builds options, acquires, and invokes the method only when elected. Private methods are not intercepted. This project uses AspectJ compile-time weaving, so `@EnableAspectJAutoProxy` is not the activation switch.

## Quick start

```kotlin
@Service
class Jobs {
    @LeaderElection(name = "daily-settlement", leaseTime = "30m")
    fun settle(): SettlementReport? = settlementService.settle()
}
```

## API by task

Use `@LeaderElection` for one owner and `@LeaderGroupElection` for bounded parallelism. Select a factory with `@LeaderElectionBackend`; `LockAssert`/`LockExtender` work only inside an active scope.

## Recommended patterns

Keep annotated methods externally reachable by the woven aspect, use stable or validated SpEL names, disable method invocation in SpEL unless trusted, and keep `FAIL_OPEN_RUN` for idempotent work only.

## Integrations

Auto-configuration supports available backend clients and Micrometer recording. batch-scheduler and webhook-poller show annotation-driven jobs.

## Configuration

Configure defaults under `bluetape4k.leader`, backend-specific properties, AOP order, failure mode, SpEL policy, single/group leases, and factory bean selection.

## Failure modes

`RETHROW` surfaces backend failure, `SKIP` suppresses execution, and `FAIL_OPEN_RUN` executes without ownership. Invalid annotations or ambiguous factories should fail startup. Long streams need explicit renewal.

## Operations

Monitor elected/skipped/failure outcomes, selected factory, resolved lock name, duration, and extension. Document fail-open decisions in the runbook.

## Testing

Use application-context tests for auto-configuration and CTW interception; cover private/non-intercepted methods, SpEL, meta-annotations, failure modes, suspend/reactive results, and cancellation.

## Workshops and learning path

Start with batch-scheduler, then webhook-poller and prometheus-dashboard. Read the chosen backend manual for its client and lease operations.

## Limitations

AOP cannot make arbitrary side effects exactly once. Self/private invocation and long-lived streams require careful boundary testing; `FAIL_OPEN_RUN` permits duplicates by design.

## Sources

[Auto-configuration](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-spring-boot/src/main/kotlin/io/bluetape4k/leader/spring/LeaderElectionAutoConfiguration.kt) · [Aspect](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-spring-boot/src/main/kotlin/io/bluetape4k/leader/spring/aop/LeaderElectionAspect.kt) · [Stable guide](https://github.com/bluetape4k/bluetape4k-leader/blob/0.4.0/leader-spring-boot/README.md)
