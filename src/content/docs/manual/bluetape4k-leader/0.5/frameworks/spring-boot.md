---
slug: "manual/bluetape4k-leader/0.5/frameworks/spring-boot"
title: "Spring Boot integration"
description: "Auto-configure electors and guard invocations with AspectJ compile-time weaving."
releaseRef: 0.5.0
releaseCommit: 721a9a3808f67489d2bdb8177734325981c24977
manual:
  id: "frameworks/spring-boot"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "5a4837e374df53c5a2c272b7a1d883f07abda6ae"
  sourcePath: "docs/manual/en/frameworks/spring-boot.md"
  minorVersion: "0.5"
  releaseRef: "0.5.0"
  releaseCommit: "721a9a3808f67489d2bdb8177734325981c24977"
  sourceDir: "docs/manual"
  layer: "build"
---


Auto-configure electors and guard invocations with AspectJ compile-time weaving.

## Interactive visual companions

The detailed [`LeaderElector` walkthrough](/visual-companions/bluetape4k-leader/leader-elector/) connects lock, token, TTL, lease expiry, `autoExtend`, the direct API, and `@LeaderElection`. The [`LeaderGroupElector` delta](/visual-companions/bluetape4k-leader/leader-group-elector/) adds bounded `maxLeaders` slots and the `@LeaderGroupElection` constraints without repeating the single-leader model.

[![LeaderElector lock and lease visual companion](/manual-assets/bluetape4k-leader/0.5/visual-companions/leader-elector.en.png)](/visual-companions/bluetape4k-leader/leader-elector/)

[![LeaderGroupElector slot capacity visual companion](/manual-assets/bluetape4k-leader/0.5/visual-companions/leader-group-elector.en.png)](/visual-companions/bluetape4k-leader/leader-group-elector/)

## Weaving model

Release 0.5.0 uses Freefair post-compile AspectJ weaving. Do not add `@EnableAspectJAutoProxy`, and Kotlin methods do not need to be `open`. Private methods are not intercepted; startup validation reports invalid declarations. Verify the woven application artifact, not only a plain unit test.

## Annotations

`@LeaderElection` supports nullable synchronous and suspend results plus Mono, Flux, and Flow. Long streams require `autoExtend=true`, or `streamBounded=true` only when completion is guaranteed inside the lease. `@LeaderGroupElection` supports synchronous, suspend, and Mono, but rejects Flux and Flow because per-slot stream extension is undefined.

## Configuration safety

Use valid SpEL such as `"'prefix-' + #param"`. Invalid expressions and impossible group settings fail validation. Auto-configuration orders elector creation, AOP factories, Micrometer, then aspects so instrumentation sees the same execution boundary.

## Release sources

- [`leader-spring-boot/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-spring-boot/README.md)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/annotation/LeaderElection.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-core/src/main/kotlin/io/bluetape4k/leader/annotation/LeaderElection.kt)
- [`leader-core/src/main/kotlin/io/bluetape4k/leader/annotation/LeaderGroupElection.kt`](https://github.com/bluetape4k/bluetape4k-leader/blob/0.5.0/leader-core/src/main/kotlin/io/bluetape4k/leader/annotation/LeaderGroupElection.kt)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/0.5/)
- [Spring Boot or Ktor](/manual/bluetape4k-leader/0.5/guides/spring-vs-ktor/)
- [Micrometer integration](/manual/bluetape4k-leader/0.5/frameworks/micrometer/)
