---
manualId: "bluetape4k-exposed-tenant-jdbc"
id: "bluetape4k-exposed-tenant-jdbc"
title: "Exposed Tenant JDBC Resource Registry"
locale: "en"
kind: "library"
gradlePath: ":bluetape4k-exposed-tenant-jdbc"
sourceDir: "exposed/tenant-jdbc"
releaseRef: "develop"
releaseStatus: "develop-only"
artifact: io.github.bluetape4k.exposed:bluetape4k-exposed-tenant-jdbc
---

# Exposed Tenant JDBC Resource Registry

This module creates and owns the lifecycle of a finite set of tenant-keyed JDBC `DataSource` and Exposed `Database` pairs. It provides exact lookup and deterministic cleanup while leaving tenant authorization and application shutdown policy with the caller.

## Problem {#problem}

An application that uses a separate JDBC database for each tenant needs to select the right Exposed `Database` without relying on the global primary database. Repeating resource creation and cleanup in each application adapter makes ownership harder to audit. The registry centralizes that resource lifecycle without adding a framework dependency.

## When to use it {#when-to-use}

Use this module when an application has a finite, configured set of tenants and needs one JDBC `DataSource` and Exposed `Database` per tenant. Choose a framework adapter when tenant selection must be bound to a Ktor call or another application context; this registry does not resolve request identity.

## Coordinates {#coordinates}

Declare the central BOM and the artifact without an individual module version:

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.exposed:bluetape4k-exposed-tenant-jdbc")
}
```

The module is on the `2.2.0` development line and is not included in the stable `2.0.0` BOM.

## Core concepts {#concepts}

- `TenantJdbcResourceRegistry<K>` materializes the tenant keys before creating resources and preserves their insertion order in `configuredTenants`.
- `resourceFor`, `databaseFor`, and `dataSourceFor` perform exact-match lookup. An unknown key does not fall back to another tenant.
- The application factory creates each `DataSource`. Ownership transfers to the registry when the factory returns it; `disposeDataSource` receives that instance during cleanup.
- `Database.connect(dataSource)` registers an Exposed database but does not check connectivity or readiness.
- Tenant keys need stable `equals` and `hashCode` values for the registry lifetime. Prefer immutable value objects, enums, or strings.

## Quick start {#quick-start}

Create the registry once from a bounded tenant set. Authorize the requested tenant before looking up its database, then pass that database explicitly to the transaction:

```kotlin
import io.bluetape4k.exposed.tenant.jdbc.TenantJdbcResourceRegistry
import org.jetbrains.exposed.v1.jdbc.transactions.transaction

enum class TenantId { ACME, GLOBEX }

val registry = TenantJdbcResourceRegistry.create(
    tenants = TenantId.entries,
    dataSourceFactory = ::createTenantDataSource,
    disposeDataSource = { _, dataSource -> dataSource.close() },
)

fun loadOrders(tenantId: TenantId, allowedTenants: Set<TenantId>) {
    check(tenantId in allowedTenants) { "Forbidden tenant access." }
    val database = registry.databaseFor(tenantId)

    transaction(db = database) {
        loadTenantOrders()
    }
}
```

`createTenantDataSource` and `loadTenantOrders` represent application-owned functions. The registry does not configure a pool or authorize `tenantId`.

## API by task {#api-by-task}

- Create the registry with `TenantJdbcResourceRegistry.create(tenants, dataSourceFactory, disposeDataSource)`.
- Use `resourceFor(tenant)` when the caller needs the resource pair, `databaseFor(tenant)` for Exposed transactions, or `dataSourceFor(tenant)` for direct JDBC access.
- Pass the selected database explicitly, for example `transaction(db = registry.databaseFor(tenant))`.
- Read `configuredTenants` for the immutable, insertion-ordered key set captured at construction.
- Call `close()` from the application shutdown path after stopping new work and draining active work.

## Recommended patterns {#patterns}

Authorize the requested tenant before calling any registry lookup. Build the registry from an immutable, bounded configuration and keep keys stable. Do not use a parameterless `transaction {}` for tenant work: Exposed may select the global primary database instead of the tenant database. Treat returned resources as references, not leases; coordinate shutdown so active transactions finish before `close()` begins.

## Integrations {#integrations}

The registry uses Exposed JDBC directly and has no Spring Boot or Ktor dependency. An application adapter can bind a validated tenant to this registry, but it owns that binding and any HTTP error policy. `TenantJdbcResource` exposes the paired `DataSource` and `Database` as a read-only view; it does not extend the resource lifetime.

## Configuration {#configuration}

The caller supplies a finite tenant iterable, a `DataSource` factory, and a synchronous disposer. The module does not choose pool implementation, credentials, pool sizing, readiness checks, callback timeouts, or retries. Null and duplicate tenant keys are rejected before the factory is called. A key's equality and hash code must remain stable while the registry is open.

## Failure handling {#failures}

- A null or duplicate tenant key fails construction before resource creation.
- A tenant key with no registered resource throws `UnknownTenantJdbcResourceException`; its fixed message does not include the tenant key.
- A lookup after shutdown has started fails with `IllegalStateException`.
- Returning the same `DataSource` instance for multiple tenants is rejected. If setup fails after ownership transfers, already-owned resources receive best-effort cleanup in reverse creation order.
- During close, the registry unregisters each Exposed `Database` before calling the disposer. It continues after cleanup failures and preserves the first failure with later failures suppressed. A fatal cleanup failure is rethrown to the cleanup owner; later callers receive a fixed `IllegalStateException`.

Callback failures can carry sensitive messages and stack traces. Redact them at the application boundary before logging or exposing them.

## Operations {#operations}

Use this order at shutdown:

1. Stop accepting requests and prevent new tenant work from starting.
2. Drain transactions and other work that already obtained a resource.
3. Call `registry.close()` once from the application lifecycle.

Close is synchronous. The application owns callback timeouts and shutdown watchdogs. Resources are unregistered and disposed in reverse creation order. Repeated or concurrent close calls observe the registry's completed lifecycle result; the registry does not provide a readiness probe or work lease.

## Testing {#testing}

The module tests exact lookup, input validation, construction and cleanup failures, concurrent close behavior, and Java interoperability. Use the module's H2-backed tests as the fast local path; the module does not require a Testcontainers database for its unit tests.

## Workshops {#workshops}

No dedicated workshop is currently listed for this module.

## Limitations {#limitations}

This module does not parse tenant headers, authenticate or authorize callers, provide a default tenant, create or migrate schemas, test readiness, or coordinate graceful request draining. It also does not configure pools, redact callback failures, or provide framework lifecycle integration. Those responsibilities remain with the application.

## Sources {#sources}

- [Module README](../../../../exposed/tenant-jdbc/README.md)
- [Tenant JDBC resource registry](../../../../exposed/tenant-jdbc/src/main/kotlin/io/bluetape4k/exposed/tenant/jdbc/TenantJdbcResourceRegistry.kt)
- [Tenant JDBC resource view](../../../../exposed/tenant-jdbc/src/main/kotlin/io/bluetape4k/exposed/tenant/jdbc/TenantJdbcResource.kt)
- [Unknown tenant exception](../../../../exposed/tenant-jdbc/src/main/kotlin/io/bluetape4k/exposed/tenant/jdbc/UnknownTenantJdbcResourceException.kt)
- [Kotlin registry tests](../../../../exposed/tenant-jdbc/src/test/kotlin/io/bluetape4k/exposed/tenant/jdbc/TenantJdbcResourceRegistryTest.kt)
- [Concurrency tests](../../../../exposed/tenant-jdbc/src/test/kotlin/io/bluetape4k/exposed/tenant/jdbc/TenantJdbcResourceRegistryConcurrencyTest.kt)
- [Failure tests](../../../../exposed/tenant-jdbc/src/test/kotlin/io/bluetape4k/exposed/tenant/jdbc/TenantJdbcResourceRegistryFailureTest.kt)
- [Java interop test](../../../../exposed/tenant-jdbc/src/test/java/io/bluetape4k/exposed/tenant/jdbc/TenantJdbcResourceRegistryJavaInteropTest.java)
