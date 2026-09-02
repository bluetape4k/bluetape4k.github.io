---
slug: "manual/bluetape4k-leader/1.0/backends/document-stores"
title: "MongoDB and DynamoDB"
description: "Coordinate with atomic document updates or conditional key-value writes, then account for TTL and clock behavior."
releaseRef: 1.0.0
releaseCommit: e70146330302758f563a46b7286e3ce25f1bac49
manual:
  id: "backends/document-stores"
  repository: "bluetape4k-leader"
  group: "overview"
  kind: "guide"
  sourceCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourcePath: "docs/manual/bluetape4k-leader/en/backends/document-stores.md"
  minorVersion: "1.0"
  releaseRef: "1.0.0"
  releaseCommit: "e70146330302758f563a46b7286e3ce25f1bac49"
  sourceDir: "docs/manual/bluetape4k-leader"
  layer: "build"
---


Coordinate with atomic document updates or conditional key-value writes, then account for TTL and clock behavior.

## MongoDB

The MongoDB backend uses atomic `findOneAndUpdate` ownership changes and a TTL index for cleanup. It offers blocking and suspend variants and supports the shared single-leader extension path. TTL cleanup is not an exact deadline, so correctness relies on the acquisition predicate, not deletion timing.

## DynamoDB

The preview DynamoDB backend uses conditional writes and logical TTL. Design capacity for synchronized contender bursts and monitor throttling. DynamoDB TTL deletion is asynchronous; the stored expiry condition, not physical row removal, determines acquisition.

## When to use

Use these backends when the application already treats the store as an operational dependency. Test with the real service or a faithful emulator, including clock skew, conditional conflicts, throttling, and retry ambiguity. A client timeout may leave the write outcome unknown.

## Release sources

- [`leader-mongodb/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-mongodb/README.md)
- [`leader-dynamodb/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/leader-dynamodb/README.md)
- [`examples/dynamodb-export/README.md`](https://github.com/bluetape4k/bluetape4k-leader/blob/1.0.0/examples/dynamodb-export/README.md)

## Continue learning

- [Bluetape4k Leader manual](/manual/bluetape4k-leader/1.0/)
- [Choose a backend](/manual/bluetape4k-leader/1.0/guides/backend-selection/)
- [Failure and cancellation](/manual/bluetape4k-leader/1.0/guides/failure-and-cancellation/)
