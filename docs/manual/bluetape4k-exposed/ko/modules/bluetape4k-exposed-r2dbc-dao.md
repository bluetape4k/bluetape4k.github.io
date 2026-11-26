---
manualId: "bluetape4k-exposed-r2dbc-dao"
id: "bluetape4k-exposed-r2dbc-dao"
title: "Exposed R2DBC DAO 연동"
locale: "ko"
kind: "library"
gradlePath: ":bluetape4k-exposed-r2dbc-dao"
sourceDir: "exposed/r2dbc-dao"
releaseRef: "develop"
artifact: io.github.bluetape4k.exposed:bluetape4k-exposed-r2dbc-dao
---

# Exposed R2DBC DAO 연동

> **2.2.0 개발 미리보기.** 이 페이지는 `2.2.0` 개발선에 추가할 실험 연동을 설명한다. 이 매뉴얼이 고정한 안정 릴리스 `2.0.0`에는 포함되지 않는다.

## 문제 {#problem}

JetBrains Exposed 1.6.0에서 `exposed-dao-r2dbc` 아티팩트와 함께 실험용 R2DBC DAO 지원이 도입됐으며, Exposed 1.6.1에서도 이 API를 제공한다. 이를 사용할 때는 Exposed core와 R2DBC 의존성을 포함하고, 같은 소스 세트에서 JDBC DAO 아티팩트를 제외해야 한다. 이 모듈은 Bluetape4k wrapper API 없이 해당 의존성 조합만 제공하며 데이터베이스 자원을 소유하지 않는다.

## 언제 사용할까 {#when-to-use}

Exposed의 R2DBC 접근 경로를 이미 선택했고 DAO 엔티티 모델이 필요한 경우 사용한다. R2DBC DSL로 충분하면 DSL 경로를 유지한다. JetBrains API는 실험 기능이며 릴리스 사이에 바뀔 수 있다. Exposed를 올릴 때마다 마이그레이션 안내를 확인하고 소비 코드를 다시 컴파일한다.

## 좌표 {#coordinates}

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<version>"))
    implementation("io.github.bluetape4k.exposed:bluetape4k-exposed-r2dbc-dao")
    runtimeOnly("org.postgresql:r2dbc-postgresql") // 배포 환경에 맞는 드라이버 선택
}
```

모듈은 `org.jetbrains.exposed:exposed-dao-r2dbc:1.6.1`, Exposed core, Exposed R2DBC를 API 의존성으로 노출한다. 드라이버, `ConnectionFactory` 또는 pool, `R2dbcDatabase`, 자원 종료는 애플리케이션이 맡는다.

## 핵심 개념 {#concepts}

- JetBrains DAO API를 사용하는 코드에서 `ExperimentalR2dbcDaoApi` 옵트인을 선언한다.
- 생성 ID나 데이터베이스가 만드는 값이 즉시 필요하면 반환 전에 삽입하는 `newSuspend`를 사용한다.
- 관계 컬렉션은 Kotlin `Flow`다. 소유한 `suspendTransaction`이 끝나기 전에 수집한다.
- 다른 R2DBC 트랜잭션으로 엔티티를 옮겨 수정하려면 먼저 `attach()`를 호출한다.
- R2DBC DAO와 JDBC DAO 아티팩트는 별도 소비 모듈이나 소스 세트에 둔다. JetBrains DAO 타입 이름이 겹치고 기존 Bluetape4k R2DBC 연동에도 JDBC DAO가 포함된다.

## 빠른 시작 {#quick-start}

```kotlin
@file:OptIn(org.jetbrains.exposed.v1.dao.r2dbc.ExperimentalR2dbcDaoApi::class)

import kotlinx.coroutines.flow.toList
import org.jetbrains.exposed.v1.core.dao.id.EntityID
import org.jetbrains.exposed.v1.core.dao.id.LongIdTable
import org.jetbrains.exposed.v1.dao.r2dbc.LongEntity
import org.jetbrains.exposed.v1.dao.r2dbc.LongEntityClass
import org.jetbrains.exposed.v1.r2dbc.SchemaUtils
import org.jetbrains.exposed.v1.r2dbc.transactions.suspendTransaction

object Users : LongIdTable("users") {
    val name = varchar("name", 100)
}

class User(id: EntityID<Long>) : LongEntity(id) {
    companion object : LongEntityClass<User>(Users)
    var name by Users.name
}

suspend fun createUser(database: org.jetbrains.exposed.v1.r2dbc.R2dbcDatabase) =
    suspendTransaction(db = database) {
        SchemaUtils.create(Users)
        val user = User.newSuspend { name = "Ada" }
        user.id.value to User.all().toList().map { it.name }
    }
```

DAO 작업과 Flow 수집을 같은 트랜잭션 안에서 수행한다. Database와 연결 자원은 애플리케이션이 소유한다.

## 작업별 API {#api-by-task}

| 작업 | JetBrains API |
|---|---|
| insert와 생성 ID 읽기 | `EntityClass.newSuspend { ... }` |
| 관계 행 읽기 | 관계 `Flow`와 `toList()`, `count()` 같은 terminal operator |
| 트랜잭션 사이에서 엔티티 이동 | `User.attach(entity)` |
| 현재 캐시의 변경된 엔티티를 의도적으로 교체 | `User.attach(entity, force = true)`. 기존 엔티티의 미반영 변경이 사라진다. |

## 권장 패턴 {#patterns}

하나의 데이터베이스 업무를 하나의 `suspendTransaction` 안에 둔다. 트랜잭션이 끝나기 전에 엔티티를 만들고 관계를 탐색하며 `Flow`를 수집한다. 다른 트랜잭션으로 엔티티를 옮길 때는 새 트랜잭션에서 사용하거나 수정하기 전에 연결한다. JDBC DAO 타입이 R2DBC DAO 타입을 가리지 않도록 import도 분명하게 작성한다.

## 연동 {#integrations}

이 모듈은 Spring Boot나 Ktor에 의존하지 않는다. 프레임워크가 트랜잭션 context를 제공하더라도 DAO 작업이 같은 `R2dbcDatabase`와 트랜잭션 경계를 사용하는지 확인한다. 선택한 데이터베이스용 R2DBC 드라이버와 pool은 별도로 설정한다.

## 설정 {#configuration}

모듈은 실행 클래스나 설정을 추가하지 않는다. 애플리케이션에서 `ConnectionFactory`, 선택적인 pool 제한과 timeout, `R2dbcDatabase`, 정상 종료 절차를 설정한다. JDBC `Database` 또는 JDBC DAO 의존성을 같은 소비자 classpath에 넣지 않는다.

## 실패 사례 {#failures}

- flush 전 `new()` 결과에서 생성 ID를 바로 읽으면 실패할 수 있다. 즉시 필요할 때는 `newSuspend()`를 사용한다.
- 트랜잭션이 끝난 뒤 관계 Flow를 수집하면 트랜잭션 connection을 사용할 수 없다.
- 다른 트랜잭션에서 `attach()` 없이 엔티티를 수정하면 엔티티 캐시 경계를 위반한다.
- `attach(force = true)`는 현재 트랜잭션에서 추적하던 엔티티의 미반영 변경을 버릴 수 있다.
- JDBC와 R2DBC DAO 아티팩트를 한 소비자 소스 세트에 넣으면 이름이 같은 DAO 타입이 충돌하므로 지원하지 않는다.

## 운영 {#operations}

선택한 드라이버에서 pool 대기, 트랜잭션 시간, query 오류, timeout, 취소를 관찰한다. 취소와 rollback이 데이터베이스 및 connection pool에 미치는 영향을 테스트한다. 이 동작은 모든 드라이버에서 동일하다고 보장하지 않는다. Pool의 소유와 종료는 애플리케이션에서 관리한다.

## 테스트 {#testing}

연동 테스트는 생성 ID, 관계 Flow 수집, 트랜잭션 간 `attach()`, 삭제된 행, 변경된 캐시 충돌, 강제 교체, 동시 트랜잭션의 캐시 분리, rollback 뒤 취소와 connection 재사용을 확인한다. H2와 PostgreSQL에서 실행한 뒤 실제 애플리케이션 드라이버 및 스키마로 소비자 테스트를 추가한다. 게시 좌표 검증에서는 옵트인한 소비 코드가 컴파일되고 의존성을 빼면 예상한 누락 아티팩트 진단이 발생하는지도 확인한다.

## 워크숍과 학습 경로 {#workshops}

[R2DBC 모듈](bluetape4k-exposed-r2dbc.md)에서 코루틴 트랜잭션과 DSL 경로를 먼저 확인하고 JetBrains의 [R2DBC DAO 전환 가이드](https://www.jetbrains.com/help/exposed/migrating-from-jdbc-to-r2dbc-dao.html)를 읽는다. 엔티티와 관계 예제는 연동 [README](https://github.com/bluetape4k/bluetape4k-exposed/blob/develop/exposed/r2dbc-dao/README.ko.md)와 [영문 문서](https://github.com/bluetape4k/bluetape4k-exposed/blob/develop/exposed/r2dbc-dao/README.md)를 참고한다.

## 제약 {#limitations}

이 모듈은 `2.2.0` 개발선에 계획된 실험 의존성 연동이다. 안정된 Bluetape4k DAO 추상화, 드라이버, connection pool, transaction manager, 자원 관리 기능을 제공하지 않는다. JetBrains API와 동작은 바뀔 수 있다. 이 페이지는 안정 릴리스 `2.0.0` 범위에 포함되지 않는다.

## 출처 {#sources}

- [연동 모듈 build](https://github.com/bluetape4k/bluetape4k-exposed/blob/develop/exposed/r2dbc-dao/build.gradle.kts)
- [DAO 계약 테스트](https://github.com/bluetape4k/bluetape4k-exposed/blob/develop/exposed/r2dbc-dao/src/test/kotlin/io/bluetape4k/exposed/r2dbc/dao/ExposedR2dbcDaoContractTest.kt)
- [JetBrains: Exposed 1.6.0 R2DBC DAO 지원](https://www.jetbrains.com/help/exposed/whats-new-160.html)
- [JetBrains: Exposed 의존성 추가](https://www.jetbrains.com/help/exposed/adding-dependencies.html)
