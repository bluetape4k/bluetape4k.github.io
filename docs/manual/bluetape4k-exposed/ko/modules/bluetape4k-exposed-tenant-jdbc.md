---
manualId: "bluetape4k-exposed-tenant-jdbc"
id: "bluetape4k-exposed-tenant-jdbc"
title: "Exposed 테넌트 JDBC 리소스 레지스트리"
locale: "ko"
kind: "library"
gradlePath: ":bluetape4k-exposed-tenant-jdbc"
sourceDir: "exposed/tenant-jdbc"
releaseRef: "develop"
releaseStatus: "develop-only"
artifact: io.github.bluetape4k.exposed:bluetape4k-exposed-tenant-jdbc
---

# Exposed 테넌트 JDBC 리소스 레지스트리

이 모듈은 유한한 테넌트별 JDBC `DataSource`와 Exposed `Database` 쌍을 만들고 수명을 관리합니다. 정확한 키 조회와 결정적인 정리 순서를 제공하며, 테넌트 인가와 애플리케이션 종료 정책은 호출자가 맡습니다.

## 문제 {#problem}

테넌트마다 JDBC 데이터베이스를 사용하는 애플리케이션은 Exposed 전역 기본 데이터베이스에 의존하지 않고 올바른 `Database`를 선택해야 합니다. 애플리케이션 어댑터마다 리소스 생성과 정리를 반복하면 소유권을 확인하기 어렵습니다. 이 레지스트리는 프레임워크 의존성 없이 해당 리소스 수명을 한곳에서 관리합니다.

## 사용 시점 {#when-to-use}

애플리케이션에 유한하게 구성된 테넌트 집합이 있고 테넌트마다 JDBC `DataSource`와 Exposed `Database`가 필요할 때 사용합니다. Ktor call이나 다른 애플리케이션 컨텍스트에 테넌트 선택을 결합해야 한다면 프레임워크 어댑터를 선택하세요. 이 레지스트리는 요청의 사용자나 테넌트를 판별하지 않습니다.

## 의존성 좌표 {#coordinates}

중앙 BOM과 모듈 artifact를 선언합니다. 모듈에 개별 버전을 지정하지 않습니다.

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.exposed:bluetape4k-exposed-tenant-jdbc")
}
```

이 artifact는 `2.1.0-SNAPSHOT` 개발선에서 도입되며 안정판 `2.0.0` BOM에는 포함되지 않습니다.

## 핵심 개념 {#concepts}

- `TenantJdbcResourceRegistry<K>`는 리소스를 만들기 전에 테넌트 키를 구체화하며, `configuredTenants`에 입력 순서를 보존합니다.
- `resourceFor`, `databaseFor`, `dataSourceFor`는 키를 정확히 일치시켜 조회합니다. 알 수 없는 키를 다른 테넌트에 연결하지 않습니다.
- 애플리케이션 factory가 `DataSource`를 생성합니다. factory가 반환한 시점에 레지스트리로 소유권이 넘어가며, 정리 시 `disposeDataSource`가 해당 인스턴스를 전달받습니다.
- `Database.connect(dataSource)`는 Exposed database를 등록하지만 연결 가능성이나 readiness를 검사하지 않습니다.
- 레지스트리 사용 중 테넌트 키의 `equals`와 `hashCode` 값은 안정적이어야 합니다. 불변 value object, enum, 문자열을 사용하세요.

## 빠른 시작 {#quick-start}

범위가 제한된 테넌트 집합으로 레지스트리를 한 번 생성합니다. 데이터베이스를 조회하기 전에 요청 테넌트를 인가하고, 선택한 데이터베이스를 트랜잭션에 명시적으로 전달합니다.

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

`createTenantDataSource`와 `loadTenantOrders`는 애플리케이션에서 제공하는 함수입니다. 레지스트리는 connection pool을 구성하거나 `tenantId`의 접근 권한을 확인하지 않습니다.

## 작업별 API {#api-by-task}

- `TenantJdbcResourceRegistry.create(tenants, dataSourceFactory, disposeDataSource)`로 레지스트리를 만듭니다.
- 리소스 쌍이 필요하면 `resourceFor(tenant)`, Exposed 트랜잭션에는 `databaseFor(tenant)`, 직접 JDBC 접근에는 `dataSourceFor(tenant)`를 사용합니다.
- 선택한 데이터베이스를 `transaction(db = registry.databaseFor(tenant))`처럼 명시적으로 전달합니다.
- `configuredTenants`에서 생성 시 복사한 불변 테넌트 키 집합을 입력 순서대로 조회합니다.
- 새 작업을 차단하고 진행 중인 작업을 drain한 뒤 애플리케이션 종료 경로에서 `close()`를 호출합니다.

## 권장 패턴 {#patterns}

레지스트리 조회 전에 요청 테넌트의 권한을 확인하세요. 불변이고 크기가 제한된 설정으로 레지스트리를 만들고, 키의 값은 사용 중 바꾸지 않습니다. 테넌트 작업에서 인자 없는 `transaction {}`을 사용하면 안 됩니다. Exposed가 전역 기본 데이터베이스를 선택할 수 있습니다. 조회 결과는 사용 lease가 아니므로 `close()` 전에 활성 트랜잭션이 끝나도록 종료 순서를 조정하세요.

## 연동 {#integrations}

레지스트리는 Exposed JDBC만 사용하며 Spring Boot나 Ktor 의존성을 갖지 않습니다. 애플리케이션 어댑터가 검증된 테넌트를 레지스트리에 연결할 수 있지만, 바인딩과 HTTP 오류 처리는 애플리케이션이 소유합니다. `TenantJdbcResource`는 `DataSource`와 `Database`를 읽기 전용으로 묶어 제공하며 리소스 수명을 연장하지 않습니다.

## 구성 {#configuration}

호출자가 유한한 테넌트 iterable, `DataSource` factory, 동기 disposer를 제공합니다. 모듈은 pool 구현·인증 정보·pool 크기·readiness 검사·callback timeout·재시도 정책을 선택하지 않습니다. null 및 중복 테넌트 키는 factory 호출 전에 거부됩니다. 레지스트리가 열린 동안 테넌트 키의 동등성 및 해시 값은 안정적이어야 합니다.

## 실패 처리 {#failures}

- null 또는 중복 테넌트 키가 있으면 리소스를 만들기 전에 생성이 실패합니다.
- 등록되지 않은 키를 조회하면 `UnknownTenantJdbcResourceException`이 발생합니다. 고정 메시지에는 테넌트 키가 들어가지 않습니다.
- 종료가 시작된 뒤 조회하면 `IllegalStateException`이 발생합니다.
- 여러 테넌트에 동일한 `DataSource` 인스턴스를 반환하면 거부됩니다. 소유권이 넘어간 뒤 설정에 실패하면 이미 소유한 리소스를 생성 역순으로 최선을 다해 정리합니다.
- 종료 시 각 Exposed `Database`의 등록을 해제한 뒤 disposer를 호출합니다. 정리 실패가 발생해도 계속 처리하며, 첫 실패를 기본 원인으로 두고 이후 실패를 suppressed 예외로 보존합니다. 치명적 정리 실패는 현재 정리 caller에 다시 전달하고, 이후 caller에는 고정 `IllegalStateException`을 반환합니다.

callback 실패에는 민감한 메시지와 stack trace가 포함될 수 있습니다. 로그에 기록하거나 외부에 노출하기 전에 애플리케이션 경계에서 비식별화하세요.

## 운영과 종료 {#operations}

애플리케이션 종료 순서는 다음과 같습니다.

1. 새 요청을 받지 않고 새 테넌트 작업의 시작을 차단합니다.
2. 이미 리소스를 얻은 트랜잭션과 작업이 끝날 때까지 drain합니다.
3. 애플리케이션 lifecycle에서 `registry.close()`를 한 번 호출합니다.

`close()`는 동기식입니다. callback timeout과 종료 watchdog은 애플리케이션이 관리합니다. 리소스는 생성 역순으로 등록을 해제하고 dispose합니다. 여러 caller가 동시에 또는 반복해서 `close()`를 호출하면 완료된 lifecycle 결과를 관찰합니다. 레지스트리는 readiness probe나 작업 lease를 제공하지 않습니다.

## 테스트 {#testing}

모듈 테스트는 정확한 조회, 입력 검증, 생성·정리 실패, 동시 close, Java interop을 다룹니다. 빠른 로컬 확인에는 H2 테스트를 사용합니다. 모듈 단위 테스트에는 Testcontainers 데이터베이스가 필요하지 않습니다.

## 워크숍 {#workshops}

현재 이 모듈을 위한 전용 워크숍은 등록되어 있지 않습니다.

## 제약 {#limitations}

이 모듈은 테넌트 header parsing, 인증·인가, 기본 테넌트, schema 생성·migration, readiness 검사, 요청 drain 조정을 제공하지 않습니다. connection pool 구성, callback 실패 비식별화, 프레임워크 lifecycle 연동도 애플리케이션 책임입니다.

## 소스 {#sources}

- [모듈 README](../../../../exposed/tenant-jdbc/README.ko.md)
- [Tenant JDBC resource registry](../../../../exposed/tenant-jdbc/src/main/kotlin/io/bluetape4k/exposed/tenant/jdbc/TenantJdbcResourceRegistry.kt)
- [Tenant JDBC resource view](../../../../exposed/tenant-jdbc/src/main/kotlin/io/bluetape4k/exposed/tenant/jdbc/TenantJdbcResource.kt)
- [알 수 없는 테넌트 예외](../../../../exposed/tenant-jdbc/src/main/kotlin/io/bluetape4k/exposed/tenant/jdbc/UnknownTenantJdbcResourceException.kt)
- [Kotlin registry 테스트](../../../../exposed/tenant-jdbc/src/test/kotlin/io/bluetape4k/exposed/tenant/jdbc/TenantJdbcResourceRegistryTest.kt)
- [동시성 테스트](../../../../exposed/tenant-jdbc/src/test/kotlin/io/bluetape4k/exposed/tenant/jdbc/TenantJdbcResourceRegistryConcurrencyTest.kt)
- [실패 테스트](../../../../exposed/tenant-jdbc/src/test/kotlin/io/bluetape4k/exposed/tenant/jdbc/TenantJdbcResourceRegistryFailureTest.kt)
- [Java interop 테스트](../../../../exposed/tenant-jdbc/src/test/java/io/bluetape4k/exposed/tenant/jdbc/TenantJdbcResourceRegistryJavaInteropTest.java)
