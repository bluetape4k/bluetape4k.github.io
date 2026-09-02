---
slug: "manual/bluetape4k-exposed/2.0/modules/bluetape4k-exposed-ktor-tenant-r2dbc"
manualId: "bluetape4k-exposed-ktor-tenant-r2dbc"
id: "bluetape4k-exposed-ktor-tenant-r2dbc"
title: "Exposed Ktor Tenant R2DBC Adapter"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-exposed-ktor-tenant-r2dbc"
sourceDir: "ktor/tenant-r2dbc"
releaseRef: "develop"
artifact: io.github.bluetape4k.exposed:bluetape4k-exposed-ktor-tenant-r2dbc
manual:
  id: "bluetape4k-exposed-ktor-tenant-r2dbc"
  repository: "bluetape4k-exposed"
  group: "integration"
  kind: "library"
  sourceCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourcePath: "docs/manual/bluetape4k-exposed/en/modules/bluetape4k-exposed-ktor-tenant-r2dbc.md"
  minorVersion: "2.0"
  releaseRef: "2.0.0"
  releaseCommit: "d632a0bc0662ae616b786f552150a7fabd1cee3e"
  sourceDir: "ktor/tenant-r2dbc"
  layer: "build"
---


An opt-in adapter that routes a Ktor call to the R2DBC `R2dbcDatabase`
selected by its already-bound `TenantId`, then delegates to the existing
coroutine-native transaction helper.

## Problem

Applications that use one R2DBC database per tenant need tenant selection to
remain isolated across concurrent calls without introducing blocking work or
thread-local state. The adapter keeps the call binding and database resolver
explicit and preserves the existing `suspendTransaction` boundary.

## When to use it

Use this module when a Ktor application has a validated tenant context and one
caller-owned R2DBC `R2dbcDatabase` per tenant. Choose the regular Ktor R2DBC
adapter when the database is not tenant-selected.

## Core concepts

`KtorTenantContext` supplies the call-local `TenantId`; the resolver maps it to
`R2dbcDatabase`; `exposedTenantR2dbcTransaction` delegates to the existing
coroutine-native helper. No thread-local tenant state or implicit default is
introduced.

## Coordinates

```kotlin
implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
implementation("io.github.bluetape4k.exposed:bluetape4k-exposed-ktor-tenant-r2dbc")
```

The module exposes the upstream `bluetape4k-tenant` and `bluetape4k-ktor-tenant`
contracts through its public API. The central catalog aliases
`bt4k.bluetape4k.tenant` and `bt4k.bluetape4k.ktor.tenant` are available and
were verified at catalog commit `29d858bd22553a31709123908a2eb5c5644093b3`.
Keep the dependency platform aligned with the `2.0.0-SNAPSHOT` development
train.

## Quick start

Bind a validated tenant at the authentication or routing boundary and use an
immutable exact-match map:

```kotlin
val databases = mapOf(
    TenantId("acme") to acmeDatabase,
    TenantId("globex") to globexDatabase,
)

routing {
    get("/orders") {
        KtorTenantContext.bindTenant(call, authenticatedTenantId)
        val orders = call.exposedTenantR2dbcTransaction(
            databaseResolver = databases::getValue,
        ) {
            Orders.selectAll().toList()
        }
        call.respond(orders)
    }
}
```

The resolver is synchronous by contract, but must be fast and non-blocking.
Resolve remote or asynchronous tenant state before entering this transaction
helper.

## API by task

- Bind once with `KtorTenantContext.bindTenant(call, tenantId)`.
- Call `ApplicationCall.exposedTenantR2dbcTransaction` for tenant-routed work.
- Keep HTTP error mapping in the application's existing `StatusPages` policy.

## Recommended patterns

Build the resolver from an immutable map and resolve authentication before
entering the transaction. Never mutate the map or infer a tenant from an
unvalidated request value inside the adapter.

## Integrations

Use with `bluetape4k-exposed-ktor-core` and the existing Ktor R2DBC adapter.
JDBC and cache integrations remain separate artifacts; this module does not
install Ktor plugins or own application resources.

## Configuration

Configure the tenant map, R2DBC pools, optional `MeterRegistry`, and
`StatusPages` in application code. Keep all upstream tenant artifacts on the
same dependency-platform version.

## Resolver contract

`databaseResolver` is called after `KtorTenantContext.requireCurrent(call)` and
before `suspendTransaction` or metric timing starts. It must be an O(1),
exact-match lookup over immutable, thread-safe state. Do not perform network or
database I/O, lazy pool creation, or default-tenant fallback in the resolver.

Missing context throws `MissingTenantContextException` without invoking the
resolver. Resolver exceptions are propagated unchanged. Once an
`R2dbcDatabase` is resolved, transaction exception, cancellation, and metrics
behavior are inherited from `exposedR2dbcTransaction`.

## Failure handling

The adapter does not install `StatusPages` or select an HTTP policy. Compose
the application's existing policy and expose stable classifications:

```kotlin
install(StatusPages) {
    exception<MissingTenantContextException> { call, _ ->
        call.respond(HttpStatusCode.BadRequest, "tenant_context_missing")
    }
    exception<NoSuchElementException> { call, _ ->
        call.respond(HttpStatusCode.NotFound, "tenant_resolution_failed")
    }
}
```

Map the resolver's own exception type in the same way when it is not
`NoSuchElementException`. Do not log or tag raw tenant identifiers, request
headers, URLs, SQL, credentials, or exception messages containing them.

## Lifecycle and metrics

The caller owns the tenant-to-database map, databases, pools, and optional
`MeterRegistry`. The adapter creates none of these and never closes them.
Existing transaction timers retain the `r2dbc` backend and success, failure,
or cancellation outcome tags without adding a tenant identifier.

## Testing

Cover missing context fail-fast, resolver exception identity, exact routing of
multiple databases, concurrent call isolation, and cancellation
re-propagation. Run the H2 R2DBC test first, then configured PostgreSQL and
MySQL Testcontainers suites.

## Workshops

No selective tenant R2DBC workshop is published in the `2.0.0` release line.

## Limitations

This adapter does not parse tenant headers, authenticate requests, create
databases, migrate schemas, or provide a fallback database. Those policies
remain application responsibilities. The upstream tenant coordinates are
pinned to the verified `2.0.0-SNAPSHOT` snapshot and the immutable catalog
commit `29d858bd22553a31709123908a2eb5c5644093b3` for this development train.

## Sources

- [Ktor server StatusPages](https://ktor.io/docs/server-status-pages.html)
- [Exposed R2DBC transactions](https://www.jetbrains.com/help/exposed/transactions.html)
