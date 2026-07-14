---
slug: "manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate"
manualId: bluetape4k-hibernate
title: "Module bluetape4k-hibernate"
description: "Use Hibernate ORM and JPA from Kotlin while preserving entity, query, converter, transaction, and StatelessSession boundaries."
kind: library
group: data
manual:
  id: "bluetape4k-hibernate"
  repository: "bluetape4k-projects"
  group: "data"
  kind: "library"
  sourceCommit: "03115e34f03bad535921d3cad5cd23a2e7814581"
  sourcePath: "docs/manual/en/modules/bluetape4k-hibernate.md"
  minorVersion: "1.11"
  releaseRef: "1.11.0"
  releaseCommit: "6187173b58e8b4c5c435c145e00e94708f31ef75"
  sourceDir: "data/hibernate"
  layer: "build"
---


## Capabilities

`bluetape4k-hibernate` adds Kotlin-oriented entity base classes and extensions for Hibernate ORM and Jakarta Persistence. It covers `EntityManager` and `Session` operations, Criteria and Querydsl helpers, attribute converters, and bounded StatelessSession work.

The module does not remove Hibernate's persistence-context and transaction rules. Persist versus merge, lazy loading, flush timing, and bulk-query behavior still follow Hibernate. Learn the lifecycle owned by each helper before relying on its shorter syntax.

## Decisions before adoption

- Decide whether ORM-managed aggregates and entity lifecycle fit the domain.
- Choose between a Spring-owned transaction and an independent `withNewEntityManager` transaction.
- Define the business signature used by entity equality.
- Choose JPQL, Criteria, or Querydsl as the primary query style.
- Define the trust boundary and keyset storage and rotation policy for converters.
- Decide whether bulk work needs a stateful Session or can give up cascading and listeners for StatelessSession.

Use [bluetape4k-jdbc](/manual/bluetape4k-projects/1.11/modules/bluetape4k-jdbc/) for a smaller adapter that needs explicit SQL control. Compare Hibernate with Exposed in [Choosing the surrounding persistence stack](/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate/ecosystem-paths/).

## Coordinates

Consumers manage the central BOM version instead of aligning Hibernate, Querydsl, and subordinate bluetape4k libraries separately.

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k:bluetape4k-hibernate")

    runtimeOnly("org.postgresql:postgresql") // replace with the selected driver
}
```

The application separately selects Spring Data JPA, a cache provider, and the database driver.

## First transaction

In standalone code, `withNewEntityManager` owns an `EntityManager`, transaction, and close boundary.

```kotlin
import io.bluetape4k.hibernate.findAs
import io.bluetape4k.hibernate.withNewEntityManager
import jakarta.persistence.EntityManagerFactory

fun renameAccount(
    emf: EntityManagerFactory,
    id: Long,
    newName: String,
) = emf.withNewEntityManager { em ->
    val account = checkNotNull(em.findAs<Account>(id))
    account.name = newName
    account
}
```

The helper commits dirty-checking changes and closes the `EntityManager`. On failure it attempts rollback and rethrows the original exception. In 1.11.0, rollback failure is only logged as a warning and is not attached as a suppressed exception. A Spring application normally lets `@Transactional` and its injected `EntityManager` own this boundary instead of nesting another transaction.

## API by task

| Task | Start with | Boundary to preserve |
| --- | --- | --- |
| Run an independent EntityManager transaction | `EntityManagerFactory.withNewEntityManager` | The helper owns commit, rollback, and close. |
| Save or delete entities | `save`, `delete`, `deleteById` | A merge result may be a different managed instance. |
| Remove repeated type arguments | `findAs`, `findOne`, `createQueryAs` | Proxy initialization and SQL timing still follow Hibernate. |
| Query natural IDs | `findBySimpleNaturalId`, `findByNaturalId` | A composite natural-id map must not be empty. |
| Build Criteria queries | `createQueryAs`, `attribute`, `eq`, `ne`, `inValues` | Property names must match JPA mappings. |
| Build Querydsl expressions | `querydsl.core` and `querydsl.jpa` extensions | Q-type annotation processing is still required. |
| Temporarily change JDBC batch size | `Session.withBatchSize` | The size must be positive and is restored afterward. |
| Perform lower-level bulk work | `SessionFactory.withStateless` | There is no first-level cache, dirty checking, cascading, or JPA listener. |
| Convert column values | `converters` package | JSON, encryption, and serialization converters have different failure contracts. |

## Learning path

Each chapter combines detailed explanation, working examples, common failure modes, and links to the 1.11.0 release source and representative tests.

1. [Entity model and lifecycle](/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate/entity-model-lifecycle/) — identifiers, transient and persisted equality, tree entities, and proxies.
2. [EntityManager and transactions](/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate/entitymanager-transactions/) — transaction ownership, save and delete behavior, flush, and bulk queries.
3. [JPQL, Criteria, and Querydsl](/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate/queries-criteria-querydsl/) — move from basic queries to dynamic composition and projections.
4. [Converters and security boundaries](/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate/converters-security/) — JSON, compression, encryption keysets, and typed serialization.
5. [StatelessSession, batches, and events](/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate/stateless-batch-events/) — understand which ORM features bulk processing gives up.
6. [Choosing the surrounding persistence stack](/manual/bluetape4k-projects/1.11/modules/bluetape4k-hibernate/ecosystem-paths/) — compare JDBC, Exposed, JPA examples, and reactive paths.

New users should normally read chapters 1 through 3 in order. Review chapter 4 before deploying any converter, and start with chapter 5 when designing a bulk path.

## Recommended pattern

Place the transaction around the smallest service operation whose changes must commit together. Continue with the managed entity returned by `merge`, load required associations or map to a DTO inside the transaction, paginate large queries, and clear the persistence context after bulk updates or deletes.

Define business equality from values stable at entity creation. The 1.11.0 transient hash contract has a known limitation, so do not use identifier-less entities as deduplication keys in hash-based collections.

## Integrations

The module exposes Hibernate ORM, Jakarta Persistence, Transaction, Validation, and Querydsl JPA APIs. Spring Boot JPA integration is `compileOnly`; the application configures its starter and transaction manager. Converter runtime support includes Tink, Jackson, compression, and serialization implementations.

Evaluate `bluetape4k-hibernate-cache-lettuce` for second-level caching. When the execution model must be non-blocking, choose `bluetape4k-hibernate-reactive` or R2DBC instead of wrapping a normal Session in a coroutine.

## Configuration

The application owns datasource, dialect, schema migration, connection pool, statement timeout, batch size, SQL logging, and cache configuration. `HibernateConsts.DefaultJpaProperties` disables schema generation but enables `SHOW_SQL` and formatted SQL and sets pool size 30. Treat it as a sample, not a production default.

Applications using encrypted converters must load key material from a protected external store and configure `EncryptedStringConverterKeysets` before reading or writing encrypted fields. Do not embed cleartext keyset JSON in source or plain configuration.

## Failure behavior

Hibernate and database-provider failures normally propagate. SQL and constraint failures may appear at flush or commit instead of the helper call. `findOneOrNull` converts only `NoResultException` to null; non-unique and database failures still propagate.

`AbstractObjectAsJsonConverter` logs Jackson conversion failures and returns null. Validate required data around the converter when silent null is unacceptable. Encrypted converters fail fast without a configured keyset and cannot decrypt ciphertext produced by a different keyset.

## Operations

Observe query latency, flush counts, transaction rollbacks, pool usage, batch size, first- and second-level cache behavior, and lazy-loading query counts together. `findAll` defaults to `Int.MAX_VALUE`, so production queries need explicit pagination. Entity-listener trace logs can contain complete entities, including personal or pre-encryption values.

## Testing

The module test suite covers EntityManager and Session helpers, mappings, converters, Querydsl, StatelessSession, and Spring integration. Some paths use Testcontainers.

```bash
./gradlew :bluetape4k-hibernate:test --no-build-cache --no-configuration-cache
```

The source tree contains a `TestEntityManager` helper under `src/test`, but it is not public API in the normal main artifact.

## Workshops

No dedicated workshop is registered. Tests under `mapping`, `SimpleQuerydslExamples`, and `StatelessSessionStandaloneTest` provide executable learning material for associations, inheritance, natural IDs, trees, queries, and bulk work.

Continue to the [JPA Querydsl demo](/manual/bluetape4k-projects/1.11/modules/bluetape4k-examples-jpa-querydsl-demo/) and [Blaze-Persistence demo](/manual/bluetape4k-projects/1.11/modules/bluetape4k-examples-jpa-blazepersistence-demo/) for application-shaped examples.

## 1.11.0 scope

This manual targets source published by the `bluetape4k-projects` 1.11.0 tag. Later `develop` fixes for the transient entity hash contract and the Spring StatelessSession transaction resource key are not described as 1.11.0 behavior.

In 1.11.0, `StatelessSessionFactoryBean` can collide with an existing JPA resource key in a Spring transaction. Prefer explicit `SessionFactory.withStateless` to the injected Spring proxy for this release. StatelessSession itself omits cascading, dirty checking, the first-level cache, and JPA listeners.

## Sources and tests

- [`EntityManagerFactorySupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/EntityManagerFactorySupport.kt)
- [`EntityManagerSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/EntityManagerSupport.kt)
- [`SessionSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/SessionSupport.kt)
- [`AbstractJpaEntity.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/model/AbstractJpaEntity.kt)
- [`CriteriaSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/criteria/CriteriaSupport.kt)
- [`EncryptedStringConverters.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/converters/EncryptedStringConverters.kt)
- [`StatelessSesisonSupport.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/hibernate/src/main/kotlin/io/bluetape4k/hibernate/stateless/StatelessSesisonSupport.kt)
- [`EntityManagerSupportTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/hibernate/src/test/kotlin/io/bluetape4k/hibernate/EntityManagerSupportTest.kt)
- [`SimpleQuerydslExamples.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/hibernate/src/test/kotlin/io/bluetape4k/hibernate/querydsl/simple/SimpleQuerydslExamples.kt)
- [`StatelessSessionStandaloneTest.kt`](https://github.com/bluetape4k/bluetape4k-projects/blob/1.11.0/data/hibernate/src/test/kotlin/io/bluetape4k/hibernate/standalone/StatelessSessionStandaloneTest.kt)
