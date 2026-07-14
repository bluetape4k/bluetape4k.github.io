# 다중 저장소 버전별 매뉴얼 설계

## 1. 목적

`bluetape4k-projects`에서 검증한 매뉴얼 제작·게시 방식을 다른 Kotlin/JVM
라이브러리 저장소로 확장한다. 첫 번째 확장 대상은
`bluetape4k-exposed`이며, 같은 계약을 `bluetape4k-aws`,
`bluetape4k-leader`, `bluetape4k-image`에 순서대로 적용한다.

각 저장소는 코드와 함께 관리하는 `docs/manual`을 기술 문서의 source of
truth로 소유한다. 웹사이트는 가변적인 `develop`을 직접 읽지 않고, 검증된
안정 릴리스와 원본 커밋을 기록한 불변 스냅샷만 게시한다.

## 2. 승인된 진행 순서

다음 저장소를 한 번에 묶지 않고, 하나를 완전히 공개한 뒤 다음 저장소로
넘어간다.

1. `bluetape4k-exposed`
2. `bluetape4k-aws`
3. `bluetape4k-leader`
4. `bluetape4k-image`

Exposed는 `bluetape4k-projects` 다음의 기준 구현이다. Exposed 원본 PR과
사이트 게시를 완료하면서 다중 저장소 게시 계약을 일반화하고, 나머지
저장소는 검증된 동일 계약을 재사용한다.

## 3. 안정판 기준선

2026-07-14에 GitHub Release와 원격 tag를 다시 확인한 결과다.

| 저장소 | 공개 minor | 안정 릴리스 | release commit | 안정판 Gradle project |
| --- | --- | --- | --- | ---: |
| `bluetape4k-exposed` | `1.11` | `1.11.0` | `0b494a5fd1e083006046764757342b68a397e4c5` | 40 |
| `bluetape4k-aws` | `0.4` | `0.4.0` | `be4e6daea5654f84579955307ec56a58c8f405be` | 14 |
| `bluetape4k-leader` | `0.4` | `0.4.0` | `17ab7f872c1f96318c73d3580729cac20a67e017` | 35 |
| `bluetape4k-image` | `0.3` | `0.3.0` | `a571c30004f571fe8cfcddc29670c1404d212ec6` | 15 |

현재 `develop`에는 다음 안정판 이후 기능이 포함되어 있다.

- Exposed: Druid와 DDD Spring Modulith demo
- AWS: service coverage example
- Image: barcode API/ZXing과 moderation workflow
- Leader: 모듈 구성은 같지만 README와 운영 문서가 안정판 이후 변경됨

따라서 현재 README를 그대로 복사해 이전 안정판 매뉴얼로 게시하지 않는다.
모듈, API, 예제, 코드 링크와 설명은 반드시 해당 release commit에서 확인한다.

## 4. 저장소 원본 계약

각 라이브러리 저장소는 다음 구조를 소유한다.

```text
docs/manual/
├── manifest.yaml
├── generated/manifest.json
├── assets/
├── en/
│   ├── index.md
│   ├── getting-started.md
│   ├── architecture/
│   ├── guides/
│   └── modules/
└── ko/
    ├── index.md
    ├── getting-started.md
    ├── architecture/
    ├── guides/
    └── modules/
```

`docs/manual`은 현재 최신 안정 minor의 편집 원본이다. 이전 minor는 사이트의
불변 스냅샷과 Git 이력으로 보존한다. 다음 안정 릴리스가 나오기 전에는
`develop` 전용 기능을 현재 안정 매뉴얼에 추가하지 않는다.

manifest의 각 항목은 다음 정보를 포함한다.

- 문서 ID와 Gradle project path
- release commit에서의 source directory
- `library`, `example`, `benchmark` 유형
- Maven artifact 좌표 또는 비배포 사유
- 영문·한국어 문서 경로
- 상세 chapter와 diagram asset
- 대표 source/test 경로
- workshop, 관련 저장소, 공식 upstream 문서

root project와 `buildSrc` 같은 build logic만 module coverage에서 제외한다.
안정 tag에 등록된 모든 Gradle subproject는 영문과 한국어 landing 문서를
각각 가져야 한다.

## 5. release-faithful 검증

저장소 validator는 현재 checkout과 release commit을 별도의 권위로 다룬다.

1. 현재 checkout의 `docs/manual` 구조와 locale parity를 검증한다.
2. manifest에 고정된 release ref가 실제 GitHub 안정 release인지 확인한다.
3. release tag의 Gradle inventory와 manifest의 module inventory를 양방향으로
   비교한다.
4. source, test, README, example 링크가 release tree에 존재하는지 검사한다.
5. 현재 `develop`에만 존재하는 경로를 안정판 매뉴얼이 참조하면 실패한다.
6. 모든 검증이 끝난 뒤 normalized JSON manifest를 생성한다.

문서 편집을 위해 현재 checkout의 보조 자료를 참고할 수는 있지만, 안정판에
없는 동작은 본문에 포함하지 않는다. 향후 기능은 다음 minor 설계나 backlog로
분리한다.

## 6. 웹사이트 다중 저장소 계약

현재 사이트 코드는 repository, route, schema, release API, version selector를
`bluetape4k-projects`에 고정한다. 이를 다음 registry 기반 구조로 바꾼다.

```text
src/data/manual/repositories.json
src/data/manual/<repository>.versions.json
src/data/manual/<repository>.<minor>.manifest.json
src/data/manual/<repository>.<minor>.snapshot.json
src/data/manual/<repository>.redirects.json
```

repository registry는 다음 필드를 가진다.

- `slug`: URL과 파일명에 사용하는 저장소 ID
- `repository`: `bluetape4k/<name>` GitHub identity
- `label.en`, `label.ko`: 버전 선택기와 제목에 표시할 이름
- `latestMinor`: 현재 공개 안정 minor
- `route`: locale별 매뉴얼 root

sync 명령은 repository를 명시적으로 받는다.

```bash
npm run sync:manual -- \
  --repository bluetape4k-exposed \
  --source /absolute/path/to/bluetape4k-exposed \
  --refresh 1.11.0
```

허용되지 않은 repository, registry와 다른 GitHub identity, 이동한 tag,
prerelease, draft release, 비정규 SHA는 기존과 동일하게 fail closed로 처리한다.

## 7. 경로와 버전 선택기

Exposed의 첫 공개 경로는 다음과 같다.

- `/manual/bluetape4k-exposed/1.11/`
- `/ko/manual/bluetape4k-exposed/1.11/`
- `/manual/bluetape4k-exposed/`
- `/ko/manual/bluetape4k-exposed/`

상단 버전 선택기는 현재 route에서 repository와 minor를 추출하고 해당
repository catalog만 읽는다. 표시 문구는 `Exposed docs 1.11` 또는
`Exposed 문서 1.11`처럼 저장소별 label을 사용한다.

이 버전은 사용자가 Gradle에 입력할 dependency 버전이 아니다. 설치 예제는
계속 `bluetape4k-dependencies` 하나만 사용하고, repository release는 문서의
기술 기준선으로만 표시한다.

## 8. Exposed 정보 구조

Exposed `1.11` 매뉴얼은 안정 tag에 존재하는 40개 Gradle project를 모두
포함한다. 모든 module은 landing을 가지며, 다음 영역은 여러 상세 chapter로
구성한다.

1. 설치, 중앙 BOM, 모듈 선택 지도
2. Core와 DAO, JDBC와 R2DBC의 transaction·repository 모델
3. JDBC production path와 Spring Boot JDBC 적용
4. R2DBC coroutine path와 Spring Boot R2DBC 적용
5. Caffeine·Lettuce·Redisson cache matrix와 lifecycle
6. Jackson 2/3, Fastjson2, Tink, measured type
7. PostgreSQL, MySQL, DuckDB, ClickHouse, Trino, BigQuery, StarRocks,
   CockroachDB 등 database·analytics adapter
8. Spring Boot, Ktor, Batch 통합과 resource ownership
9. jdbc-tests·r2dbc-tests, Testcontainers, 운영·문제 해결, benchmark 해석
10. persistence 선택과 JaVers audit/history 경계

학습 경로는 다음 저장소로 연결한다.

- `exposed-workshop`: JDBC와 SQL DSL
- `exposed-r2dbc-workshop`: R2DBC와 coroutine
- `bluetape4k-workshop`: application recipe
- `bluetape4k-javers`: audit, history, diff 책임
- JetBrains Exposed 공식 문서: upstream API와 변경 이력

기존 사이트 blog와 diagram은 사실 자료로 참고할 수 있다. 하지만 매뉴얼을
다듬어 source of truth로 만들고, blog가 매뉴얼의 미완성 문장을 그대로
지배하지 않게 한다.

## 9. 문장과 시각 자산

- 한국어는 번역체가 아닌 자연스러운 기술 문장으로 작성한다.
- 영문과 한국어는 module, chapter, 사실, 코드, 링크, diagram inventory를
  동등하게 유지한다.
- diagram은 승인된 dark technical style을 사용한다.
- source SVG와 rendered PNG를 함께 보관한다.
- 모든 diagram은 `bluetape-diagram` checklist, 자동 geometry 검사, 원본 크기
  눈 검수를 통과해야 한다.
- README diagram을 재사용할 때도 release 기준 내용과 연결선을 다시 검증한다.

## 10. 원자적 게시와 실패 처리

sync는 source documents, assets, manifest, snapshot, version catalog,
redirect를 임시 generation에 모두 만든 뒤 한 번에 교체한다.

다음 조건에서는 기존 공개본을 유지하고 실패한다.

- 안정 tag module이 manifest에서 누락됨
- manifest module이 release inventory에 없음
- 영문·한국어 문서 또는 chapter가 대응하지 않음
- source/test/workshop/asset 링크가 깨짐
- repository identity나 release tag가 이동함
- 이전 minor snapshot이 의도 없이 변경됨
- latest alias가 latest minor와 byte parity를 이루지 않음
- 사이트 route schema 또는 검색 index 생성이 실패함

한 저장소의 실패가 다른 저장소의 이미 검증된 snapshot을 삭제하거나
재작성해서는 안 된다.

## 11. 테스트 전략

### 원본 저장소

- release tag Gradle inventory와 manifest의 양방향 비교
- duplicate ID/path와 invalid kind 검사
- 영문·한국어 landing/chapter parity
- 필수 section과 자연스러운 한국어 검수
- source/test/workshop/link 존재 검사
- diagram SVG/PNG pair와 rendered QA
- normalized manifest freshness
- release tree reference 검사
- `git diff --check`

### 사이트 저장소

- 기존 Projects 테스트를 변경 없이 계속 통과
- 두 개 이상의 repository fixture를 사용한 registry·routing 테스트
- repository identity와 cross-repository path 격리 테스트
- repository별 version selector와 release link 테스트
- snapshot atomicity, recovery, historical immutability 테스트
- locale route, latest alias, unavailable document redirect 테스트
- 모든 repository snapshot check
- Astro diagnostics와 production build
- 배포 후 영문·한국어 root, module, chapter, asset HTTP 200 확인

## 12. PR과 배포 순서

각 저장소는 다음 gate를 모두 끝낸 뒤 다음 저장소로 넘어간다.

1. 원본 저장소에 spec과 구현 plan 작성
2. `docs/manual`과 validator 구현
3. 독립 review에서 P0/P1 0건 확인
4. 원본 PR 생성, 해당 안정 릴리스 milestone 지정, CI 통과 후 병합
5. 병합된 source commit에서 사이트 snapshot 생성
6. 사이트의 registry·route·version selector·snapshot 검사
7. 사이트 PR 생성, CI 통과 후 병합
8. GitHub Pages 배포와 공개 URL 검증

Exposed PR은 `1.11.0`, AWS와 Leader PR은 `0.4.0`, Image PR은 `0.3.0`
milestone을 사용한다. 닫힌 milestone도 해당 릴리스의 사후 문서 이력으로
지정한다.

## 13. 범위 경계

이번 순차 작업에 포함한다.

- 네 저장소의 안정판 전체 module manual
- 영문·한국어 매뉴얼과 우선 상세 chapter
- repository-owned diagram과 release validator
- 사이트의 다중 저장소 manual registry와 공통 게시 pipeline
- ecosystem atlas에서 repository manual로 이동하는 링크
- PR, CI, Pages 배포와 공개 route 검증

포함하지 않는다.

- 안정판에 없는 develop 전용 기능의 선공개
- library production API 변경
- 안정 release, tag, Maven Central publication
- workshop 저장소의 전면 재작성
- Go, Rust, Python 매뉴얼을 Kotlin/JVM registry에 혼합
- 모든 생태계 저장소를 한 PR로 묶는 일

## 14. 완료 조건

- 해당 안정 tag의 모든 Gradle project가 locale별 매뉴얼에서 누락 없이
  검색·탐색된다.
- 상세 chapter는 README 복제가 아니라 선택 기준, lifecycle, 실패 경계,
  운영, 테스트, workshop까지 설명한다.
- 사이트 상단에서 repository별 문서 minor를 선택할 수 있다.
- 일반 사용자는 `bluetape4k-dependencies` 버전만 선택하면 된다는 안내가
  유지된다.
- 이전 minor snapshot과 다른 repository snapshot이 새 sync의 영향을 받지
  않는다.
- source PR과 site PR의 CI가 통과하고, 공개 영문·한국어 route와 asset을
  실제로 확인한다.
- 한 저장소의 전체 DoD가 끝난 뒤에만 다음 저장소 작업을 시작한다.
