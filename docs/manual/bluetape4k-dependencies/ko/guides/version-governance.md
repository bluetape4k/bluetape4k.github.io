# 버전 거버넌스와 stable 승격

dependencies 저장소는 여덟 upstream 저장소의 독립적인 release 소유권을 없애지 않으면서 해석 정책을 중앙화한다.

## Source of truth

`gradle/libs.versions.toml`은 catalog alias와 import한 child BOM version을 소유한다. `gradle.properties`의 `baseVersion`은 이 저장소 version을 소유한다. 현재 개발선은 다음과 같다.

| 권위 | 값 |
|---|---|
| `baseVersion` | `2.0.0` |
| catalog self version | `2.0.0` |
| published development BOM | `2.0.0-SNAPSHOT` |
| source `snapshotVersion` | 비어 있음; publish workflow가 `-SNAPSHOT`을 주입 |

Upstream 저장소는 독립적인 version line을 유지한다. 이 초안에서 Projects와 Exposed는 `2.0.0-SNAPSHOT`, AWS·Image·Text·Graph·Leader·JaVers는 `1.0.0-SNAPSHOT`이다. dependencies 자체 version만 보고 child stable release를 추론하지 않는다.

## 개발선 변경

1. 소비할 upstream artifact와 source commit을 확인한다.
2. 생성 alias가 아닌 catalog source-of-truth block을 변경한다.
3. managed alias와 shared-version adoption을 다시 생성·검증한다.
4. 생성 BOM/POM과 대표 downstream graph를 검증한다.
5. 정확한 candidate와 metadata를 기록한 뒤에만 snapshot을 publish하거나 소비한다.

현재 train의 상세 운영 기록은 [snapshot consumer checklist](https://github.com/bluetape4k/bluetape4k-dependencies/blob/6073eefe7cd5d7bdf3bb5dec7103ffb5427a4e7b/docs/releases/2026-08-21-dependencies-2.0.0-snapshot-consumer-checklist.md)다.

## Stable 승격

Stable 승격은 별도의 gate다.

1. 필요한 upstream stable tag와 public artifact를 모두 확인한다.
2. 검토한 candidate에서 child version과 catalog self-version을 갱신한다.
3. full build, managed alias, publication POM, 대표 consumer를 검증한다.
4. 정확한 `2.0.0` tag와 GitHub Release, Maven Central metadata를 publish하고 확인한다.
5. 그 뒤에만 중앙 매뉴얼 manifest에 `releaseRef: 2.0.0`과 정확한 `releaseCommit`을 기록하고 `contentStatus: complete`로 바꾼 후 site snapshot을 생성한다.

5단계 전까지 이 매뉴얼은 in-progress snapshot 초안으로 남아야 한다. site commit과 code release commit은 서로 다른 provenance이며 서로 대체하지 않는다.
