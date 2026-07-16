---
slug: "ko/manual/bluetape4k-javers/0.2/getting-started"
title: "시작하기"
manual:
  id: "getting-started"
  repository: "bluetape4k-javers"
  group: "overview"
  kind: "guide"
  sourceCommit: "37423566ffd4f389ce3e85c573ed8348bbeaff2c"
  sourcePath: "docs/manual/ko/getting-started.md"
  minorVersion: "0.2"
  releaseRef: "0.2.1"
  releaseCommit: "bffe19439ca891fa5301a76421bdef7ba75252a0"
  sourceDir: "docs/manual"
  layer: "build"
---


먼저 JaVers, Exposed, Redis, Kafka 버전을 각각 고르는 일부터 하지 마세요. JaVers `0.2.1`을 포함한 `bluetape4k-dependencies` 생태계 버전 하나를 정하고, 서비스에 필요한 모듈만 선언합니다. 이 플랫폼이 저장소별 BOM과 공통 라이브러리 버전을 함께 맞춥니다.

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:<ecosystem-version>"))
    implementation("io.github.bluetape4k.javers:javers-core")
    implementation("io.github.bluetape4k.javers:javers-exposed")
}
```

조직 사정으로 생태계 플랫폼을 쓸 수 없다면 `bluetape4k-javers-bom:0.2.1`을 좁은 대안으로 사용할 수 있습니다. 이 경우 저장소 사이의 호환성은 애플리케이션이 확인해야 합니다.

## 가장 작은 영속 저장소

```kotlin
val repository = ExposedCdoSnapshotRepository(database)
repository.ensureSchema()

val javers = JaversBuilder.javers()
    .registerJaversRepository(repository)
    .registerEntity(Order::class.java)
    .build()

javers.commit("order-service", order)
```

`ensureSchema()`는 `javers_commit`, `javers_snapshot` 테이블을 만듭니다. 로컬 실행과 테스트에는 편리하지만 운영 스키마 변경까지 맡기는 마이그레이션 도구는 아닙니다. 저장소 메서드마다 Exposed 트랜잭션을 열기 때문에 애플리케이션의 도메인 트랜잭션과 JaVers 저장이 자동으로 하나의 원자 작업이 되지도 않습니다.

정확한 구현은 [`ExposedCdoSnapshotRepository`](https://github.com/bluetape4k/bluetape4k-javers/blob/bffe19439ca891fa5301a76421bdef7ba75252a0/javers-exposed/src/main/kotlin/io/bluetape4k/javers/persistence/exposed/repository/ExposedCdoSnapshotRepository.kt)와 [`JaversExposedTables.kt`](https://github.com/bluetape4k/bluetape4k-javers/blob/bffe19439ca891fa5301a76421bdef7ba75252a0/javers-exposed/src/main/kotlin/io/bluetape4k/javers/persistence/exposed/schema/JaversExposedTables.kt)에서 확인할 수 있습니다. 다음은 [감사 모델](/ko/manual/bluetape4k-javers/0.2/architecture/audit-model/)과 [영속 방식 선택](/ko/manual/bluetape4k-javers/0.2/persistence/selection-guide/)입니다.
