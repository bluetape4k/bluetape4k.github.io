# 생태계 BOM

게시 artifact는 다음 좌표다.

```text
io.github.bluetape4k:bluetape4k-dependencies:2.0.0-SNAPSHOT
```

이 artifact는 Maven POM/BOM이며 runtime class를 포함하지 않는다. Gradle에서는 `platform`으로, Maven에서는 `dependencyManagement` 항목으로 import한 뒤 실제 library 모듈을 별도로 선언한다.

## BOM이 관리하는 범위

- [저장소 지도](../architecture/repository-map.md)에 정리한 Bluetape4k 하위 BOM;
- Spring Boot, Kotlin, Coroutines, Jackson, Ktor, Netty, Kafka, Testcontainers 같은 중앙 framework·runtime BOM 계열;
- 생태계 published module이 소비하는 version constraint.

정확한 alias와 version inventory는 [`gradle/libs.versions.toml`](https://github.com/bluetape4k/bluetape4k-dependencies/blob/6073eefe7cd5d7bdf3bb5dec7103ffb5427a4e7b/gradle/libs.versions.toml)이 기준이다. 이 문서는 catalog 전체를 복제하지 않고 계약만 요약한다.

## 사용 계약

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:2.0.0-SNAPSHOT"))
    implementation("io.github.bluetape4k:bluetape4k-core")
}
```

같은 Bluetape4k 하위 BOM에 대해 충돌하는 두 번째 version을 함께 관리하지 않는다. 애플리케이션이 transitive library를 override해야 한다면 override를 명시하고 effective dependency graph를 검증한다.

## Stable 승격

Snapshot 좌표는 임시다. 안정 매뉴얼이 `2.0.0`을 주장하기 전에는 필요한 하위 artifact, 정확한 서명 tag와 commit, 공개 POM/module metadata, downstream resolution을 모두 검증해야 한다. 그 다음에만 중앙 매뉴얼 manifest에 stable provenance를 기록하고 site snapshot을 생성한다.
