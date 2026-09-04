# Issue #418 Projects NetCDF 진행 상태 시각 자료 설계

## 문제와 독자

`bluetape4k-projects` 2.0.0의 `bluetape4k-science`는 CF 1D/2D 좌표를 해석하고 제한된 tile과 JDBC batch로 PostGIS에 저장한다. 같은 import 작업은 lease와 slice checkpoint로 재개할 수 있지만, timeout은 worker 종료를 보장하지 않는다. 독자는 좌표 의미, 자원 상한, 진행·복구 상태를 서로 다른 계약으로 이해하면서도 한 import 안에서 어떤 순서로 연결되는지 확인해야 한다.

기준 구현은 release `2.0.0` commit `8165a8989e0075e7c17c489bf3000bf41fef8232`다. 좌표·자원 계약은 `NetCdfCatalogService`, `VariableAxisMap`, `NetCdfCoordinateSampler`, `NetCdfTilePlanner`, `NetCdfImportLimits`를 근거로 삼는다. 진행·복구 계약은 `NetCdfImportProgressRepository`, `NetCdfModels`, Issue #1421과 #1561의 명세를 근거로 삼는다.

## 범위

- GitHub Issue #418만 구현한다. Epic #413의 #419~#423은 포함하지 않는다.
- 한국어와 영어에 동등한 대화형 페이지를 제공한다.
- locale별 SVG·PNG와 semantic ledger를 제공한다.
- 기존 #417의 theme, `Reset / Play / Next`, 단계별 `현재 동작 / 보장되는 계약 / 다음 전이` 형식을 계승한다.
- 별도 Epic/Wave 허브를 만들지 않고 `bluetape4k-projects` 기본 Card에 추가한다.
- science 2.0 매뉴얼에 절대 `/assets/...` URL을 쓰는 Card를 추가한다.
- parallel tile fan-out, content-hash 검증, 자동 retry, exactly-once, 무제한 파일·메모리 처리를 구현하거나 암시하지 않는다.

## 검토한 표현 방식

1. 진행 상태 중심 state machine: `missing`부터 `failed`까지는 선명하지만 좌표 해석과 tile 예산을 부속 설명으로 밀어낸다.
2. 하나의 대형 swimlane: 전체 순서는 보이지만 coordinate validation과 timeout recovery가 같은 실패 축으로 읽힌다.
3. 세 개의 동기화된 lane: coordinate semantics, bounded import, progress & recovery를 분리하고 공통 frame으로 함께 재생한다.

3번을 선택한다. 대화형 페이지는 scenario와 frame을 바꾸며 세 lane의 상세 설명을 함께 갱신한다. 정적 SVG는 같은 source model을 세로형 계약 지도로 요약한다.

## 정보 구조

### 공통 제어

- 시나리오: 정상 2D CF import, 1D coordinate axes, 잘못된 coordinate/CRS, duplicate preflight, timeout 뒤 worker 종료, timeout 뒤 worker 잔존, lease 충돌과 resume
- 재생: `Reset`, `Play`, `Next`
- 단계: 등록 전 → 등록 → axis 탐색 → CF 결합 → 좌표 검증 → tile 계획 → duplicate preflight → batch 저장 → slice checkpoint → timeout/worker 판정 → 완료·실패·재개

### Coordinate semantics lane

- `CoordinateAxis1D`와 `CoordinateAxis2D`를 data dimension 위치와 별도로 binding한다.
- CF `coordinates` token을 최대 32개, auxiliary coordinate를 최대 16개로 제한한다.
- longitude와 latitude를 canonical `(lon, lat)` 순서로 만든다.
- spatial 값은 SRID 4326 PostGIS point로 저장하고 추가 numeric coordinate만 JSONB `attrs`에 둔다.
- 2D axis와 auxiliary 값은 tile-local window로 읽고 full-grid materialization을 금지한다.
- 누락·모호한 axis, shape 불일치, unsupported CRS는 data-coordinate validation 실패다.

### Bounded import lane

- 최대 100,000,000 logical cells, 1,000,000 slices, tile당 65,536 cells, JDBC batch당 1,000 rows를 표시한다.
- coordinate cache는 64 MiB, duplicate set은 32 MiB, importer-owned working set은 128 MiB로 제한한다.
- 한 spatial slice를 두 번 읽는다. 첫 pass는 canonical coordinate duplicate만 검사하고 DB insert를 하지 않는다.
- 두 번째 pass만 tile transaction과 JDBC batch를 실행한다.
- tile은 한 worker와 한 DB connection에서 순차 처리한다. 내부 parallel fan-out은 없다.
- 각 tile 시작과 commit 직전에 lease fence를 확인하고 마지막 tile에서만 slice checkpoint를 전진시킨다.

### Progress & recovery lane

- progress row가 없으면 `missing`, 생성 직후 `pending`, lease 보유 중 `in-progress`, 정상 종료는 `completed`, typed failure는 `failed`로 표시한다.
- `findImportProgress()`가 반환하는 내부 모델은 직접 외부 직렬화하지 않는다. 예시 DTO는 allowlist status, `lastSliceIdx`, 제한된 outcome만 포함한다.
- `registerFile()`은 deadline 밖에서 완료해 `fileId`를 보존한다.
- timeout은 `Future.cancel(true)` 뒤 executor 종료와 bounded `awaitTermination`을 확인해야 한다.
- worker가 남아 있으면 progress는 진단에만 쓰고 `RECOVERY_REQUIRED`로 중지한다.
- worker가 종료됐더라도 상태만으로 자동 retry하지 않는다. 입력 수정 또는 caller-owned retry 심사를 거친다.
- 활성 lease 여부는 caller clock이 아니라 DB와 `ImportAlreadyRunning` 결과로 판정한다.

## 시나리오별 실패 경계

- 정상 2D CF import: 두 pass와 tile batch를 거쳐 마지막 slice가 `completed`가 된다.
- 1D coordinate axes: 동일 pipeline을 사용하되 2D window가 아니라 global offset의 1D 값을 읽는다.
- coordinate/CRS invalid: tile write 전에 typed validation failure로 `failed`가 된다.
- duplicate preflight: 첫 pass에서 중단되며 해당 slice의 새 row는 0개다.
- timeout + worker terminated: 최종 예외와 progress를 조회하고 `COMPLETED`, `RUNNING`, `RETRY_REVIEW` 중 하나로 분류한다.
- timeout + worker alive: retry를 시작하지 않고 `RECOVERY_REQUIRED`로 격리한다.
- lease conflict/resume: DB가 active lease를 거부하거나 만료된 작업을 `lastSliceIdx + 1`부터 재개한다. 자동 retry 횟수는 0회다.

## 책임 경계

- library: bounded metadata/axis/tile validation, two-pass duplicate preflight, lease fencing, progress lookup, slice checkpoint, cancellation 신호 보존
- caller: authentication·authorization, tenant/job binding, allowed-root, immutable/quarantined file 운영, executor/deadline, worker 종료 확인, retry budget, redacted DTO, DB/client lifecycle

`fileId`는 권한 token이 아니다. `fileKey|size|lastModifiedTime` fingerprint도 content hash나 hostile TOCTOU 방지 수단이 아니다.

## 파일과 노출 경로

- 구조화 원본: `src/data/visual-companions/wave2-projects-netcdf-progress.mjs`
- 대화형 생성기: `scripts/generate-2-0-wave2-projects-netcdf-interactive.mjs`
- 정적 생성기: `scripts/generate-2-0-wave2-projects-netcdf-visuals.mjs`
- 페이지: `/visual-companions/bluetape4k-projects/projects-netcdf-cf-progress/`와 `/ko/...`
- 정적 자산: `/assets/visual-companions/wave2/projects-netcdf-cf-progress-{en,ko}.{svg,png}`
- semantic ledger: `docs/diagrams/visual-companions-wave2/`
- 카탈로그: `src/data/visual-companions/catalog.json`의 `bluetape4k-projects` Card
- 매뉴얼: EN/KO `bluetape4k-science` 2.0 entry의 header Card

## 접근성과 시각 계약

- native button, keyboard focus, `aria-live="polite"`, progressbar를 제공한다.
- `auto`, `light`, `dark` theme와 `prefers-reduced-motion`을 지원한다.
- 320px부터 overflow 없이 lane을 세로로 재배치한다.
- 상태는 색만으로 표현하지 않고 이름과 상세 설명을 함께 표시한다.
- static SVG는 1800px 폭, 약 4400px 높이의 불투명 dark canvas로 만든다.
- generated SVG는 marker role·size·direction을 기계적으로 노출하고 PNG를 CairoSVG `-s 2`로 렌더링한다.

## 검증

- structured source와 생성된 HTML·SVG·ledger의 일치 검사
- semantic ledger, XML, text, connector, arrowhead, geometry, endpoint, mixed-corner, PNG canvas, asset-pair audit
- EN/KO frame·scenario·identifier parity와 한국어 용어 감사
- desktop/mobile, light/dark, keyboard, reduced-motion, `Play / Next / Reset` 브라우저 검증
- `git diff --check`, 관련 Node tests, 전체 `npm test`, `npm run build`
- Projects Card와 science 매뉴얼에서 locale별 route와 절대 PNG URL 확인

## 완료 조건

Issue #418 acceptance를 모두 만족하고 local server에서 두 locale의 Card, 대화형 route, 정적 자산을 직접 확인하면 로컬 제작이 완료된다. PR 생성, merge, deployment는 별도 workflow gate에서 다룬다.
