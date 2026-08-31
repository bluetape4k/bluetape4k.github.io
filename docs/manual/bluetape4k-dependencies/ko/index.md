# bluetape4k-dependencies 2.0.0-SNAPSHOT 매뉴얼

이 문서는 `2.0.0-SNAPSHOT` 개발선을 위한 중앙 원본 초안이다. 안정 버전 `2.0.0` 매뉴얼이 아니므로 미래의 stable tag나 release commit을 기록하지 않는다. 안정 artifact와 tag를 검증한 뒤에만 버전이 붙은 site snapshot을 생성한다.

`bluetape4k-dependencies`에는 서로 다르지만 함께 쓰는 두 계약이 있다.

- Maven BOM은 실제로 해석되는 의존성 버전을 맞춘다.
- `gradle/libs.versions.toml`은 Bluetape4k 빌드가 사용하는 Gradle alias와 plugin version을 제공한다.

Catalog는 BOM을 대신하지 않는다. 빌드 authoring alias와 BOM의 dependency-management constraint가 모두 필요할 때만 둘을 함께 import한다.

## 목적별 시작점

| 하려는 일 | 먼저 읽을 문서 |
|---|---|
| Gradle 또는 Maven에서 개발 BOM 사용 | [시작하기](getting-started.md) |
| 여덟 upstream BOM 계열 이해 | [저장소 지도](architecture/repository-map.md) |
| checkout한 catalog에서 `bt4k` alias 사용 | [Gradle Version Catalog](modules/gradle-version-catalog.md) |
| 생태계 BOM이 관리하는 범위 이해 | [생태계 BOM](modules/ecosystem-bom.md) |
| timestamped snapshot 안전하게 사용 | [Snapshot 소비](guides/snapshot-consumption.md) |
| 버전 변경과 stable 승격 | [버전 거버넌스](guides/version-governance.md) |
| catalog·publication 변경 검증 | [검증](operations/validation.md) |

## 현재 개발선

Catalog source는 `bluetape4k-dependencies = "2.0.0"`을 선언하고, publish workflow가 BOM 좌표에 `-SNAPSHOT`을 붙인다. 따라서 현재 중앙 BOM 좌표는 다음과 같다.

```text
io.github.bluetape4k:bluetape4k-dependencies:2.0.0-SNAPSHOT
```

이 초안의 source 기준은 [`6073eefe`](https://github.com/bluetape4k/bluetape4k-dependencies/tree/6073eefe7cd5d7bdf3bb5dec7103ffb5427a4e7b)다. Snapshot metadata는 시간에 따라 바뀌므로 실제 소비 전에는 snapshot 안내의 저장소·metadata 검사를 다시 실행한다.

## 원본과 승격 경계

이 매뉴얼은 중앙 site 저장소의 `docs/manual/bluetape4k-dependencies/`가 소유한다. 대상이 snapshot인 동안에는 source-only로 유지한다. 향후 stable 승격 시 manifest를 정확한 `2.0.0` tag와 release commit에 고정하고 site snapshot을 생성하며, 이 원본을 공개 매뉴얼의 provenance로 보존한다.

- [현재 dependencies README](https://github.com/bluetape4k/bluetape4k-dependencies/blob/6073eefe7cd5d7bdf3bb5dec7103ffb5427a4e7b/README.ko.md)
- [현재 영문 README](https://github.com/bluetape4k/bluetape4k-dependencies/blob/6073eefe7cd5d7bdf3bb5dec7103ffb5427a4e7b/README.md)
- [Snapshot 소비자 체크리스트](https://github.com/bluetape4k/bluetape4k-dependencies/blob/6073eefe7cd5d7bdf3bb5dec7103ffb5427a4e7b/docs/releases/2026-08-21-dependencies-2.0.0-snapshot-consumer-checklist.md)
