# 상품이 바뀌어도 고객의 약속은 다시 쓰지 않는다 설계

- **Issue**: [#277 상품·구매·예약의 경계: 상품 버전과 구매 snapshot을 고정하는 이유](https://github.com/bluetape4k/clinic-appointment/issues/277)
- **Parent Epic**: [#275 진료 예약 서비스 전체 흐름을 읽는 블로그 시리즈](https://github.com/bluetape4k/clinic-appointment/issues/275)
- **상태**: 사용자 승인 완료
- **작업 유형**: Type E — 기술 블로그 문서 유지보수
- **대상 저장소**: `bluetape4k/bluetape4k.github.io`
- **근거 저장소**: `bluetape4k/clinic-appointment`
- **관찰한 원본 기준**: `develop` at `b052a69` (2026-08-12 관찰)
- **승인된 범위**: 한국어 글, 영어 현지화 글, 기존 시리즈 내비게이션, 기존 visual companion 연결, 버전 전환 시간축 diagram

## 1. 결정 요약

이번 글의 첫 갈등은 멱등성이나 메시지 브로커가 아니라 **상품이 바뀌었을 때 이미 구매한 환자의
약속이 어떻게 보호되는가**로 잡는다. 환자 A가 이벤트 상품, N회 상품, 패키지 상품을 구매한 뒤
상품팀이 상품 정의를 새 version으로 발행하는 장면을 시간축으로 따라간다.

구매 당시의 상품 version과 실행 BOM은 `AppointmentPlan`의 불변 provenance다. 새 version은 이후 구매에
적용되며, 기존 Plan을 현재 catalog로 자동 재전개하지 않는다. 기존 구매에도 새 version을 적용해야 하는
예외는 상품팀의 명시적인 전환표와 고객 동의를 포함한 `ProductVersionMigrationApproved` 사실로만 다룬다.
이때 완료 항목은 과거 revision에 남기고, 미진행 항목만 같은 Plan의 새 `AppointmentPlanRevision`으로
승계한다. 확정 방문은 자동으로 취소하거나 다시 계산하지 않으며, 일정 변경이 필요하면 별도 제안과 동의를
거친다.

한 번 구매한 사실이 재시도로 두 번 전달되는 문제는 본문의 주제가 아니다. 후반부의 짧은 기술 안전장치로
“중복 전달된 구매 완료 event”와 “환자가 실제로 추가 구매한 것”을 구분하고, 전자는 같은 Plan으로 수렴하며
후자는 새 구매 ID와 새 Plan을 만든다고만 설명한다.

## 2. 독자와 성공 기준

### 2.1 독자

- 상품개발·상품관리 담당자: 상품 version과 BOM 변경이 기존 구매에 미치는 영향을 이해할 독자
- 예약서비스 개발자: catalog projection, Plan snapshot, Plan revision의 경계를 설계할 독자
- 고객상담·CRM 담당자: 변경 제안, 동의 거부, 확정 방문 보호 이후의 handoff를 이해할 독자
- 운영·기획 담당자: 새 구매와 기존 구매의 적용 규칙을 환자 관점에서 설명해야 하는 독자

### 2.2 성공 기준

독자는 글을 읽은 뒤 다음 질문에 답할 수 있어야 한다.

1. 상품을 수정했는데 왜 이미 구매한 환자의 `AppointmentPlan`을 자동으로 다시 만들면 안 되는가?
2. 상품 version, 구매 당시 혜택, BOM과 예약서비스의 정책 snapshot은 각각 어떤 시간축을 보존하는가?
3. 이미 완료했거나 확정된 항목과 아직 미진행인 항목은 상품 전환 시 어떻게 달라지는가?
4. 기존 구매에 새 version을 적용하려면 누가 전환표와 동의를 소유하며, 예약서비스는 무엇을 검증하는가?
5. 실제 추가 구매와 같은 구매 event의 재전달은 왜 서로 다른 Plan 결과를 만드는가?

## 3. 공통 환자 사례

모든 상품명·병원명·금액·개인 식별 정보는 일반화한다. 글에서는 한 명의 환자를 **환자 A**로 부른다.

| 시점 | 환자 A의 행위 또는 이벤트 | 상품·구매 의미 | 예약서비스가 보존하는 것 |
|---|---|---|---|
| T1 | 당일 이벤트 상품을 구매한다 | 구매 당시 `v1`의 한 번 사용 권리 | `sourcePurchaseId`, `catalogVersion`, 혜택·예약 규칙 snapshot으로 만든 Plan |
| T2 | N회 방문 상품을 추가 구매한다 | `v1` BOM이 여러 회차 의무로 전개됨 | 회차별 `PlannedTreatment`와 반복 간격 |
| T3 | 여러 치료 항목의 패키지를 구매한다 | 선택·반복·의존성을 가진 실행 BOM | 항목별 version provenance와 dependency DAG |
| T4 | 일부 항목을 완료하고 일부는 미래로 남긴다 | 과거 사실과 미진행 의무가 갈라짐 | 완료 항목은 기존 revision, 미래 항목은 `PENDING` 상태 |
| T5 | 상품팀이 같은 상품을 `v2`로 발행한다 | 새 구매의 계약이 변경됨 | `v1` Plan과 `v2` catalog projection을 동시에 보존 |
| T6 | 상품팀이 기존 구매에 전환을 제안하고 A가 동의한다 | 예외적인 기존 구매 전환 | 전환표·동의 증거를 검증한 새 Plan revision |
| T7 | 전환으로 일정 변경이 필요하거나 A가 거부한다 | 상품 변경과 방문 약속 변경은 별도 업무 | 기존 확정 방문 보호, 객관적 handoff 사실과 운영 예외 |

세 상품을 하나의 상품이나 하나의 예약으로 합치지 않는다. 각 구매는 자신의 Plan을 만들고, 같은 방문에
묶을 수 있는 항목만 별도의 `AppointmentItem` 합의로 연결한다.

## 4. 글의 구조

### 4.1 제목과 route

- 한국어 제목: `상품이 바뀌어도 고객의 약속은 다시 쓰지 않는다: 상품 버전과 구매 snapshot`
- 영어 제목: `When a Product Changes, Don't Rewrite the Patient's Promise: Product Versions and Purchase Snapshots`
- 한국어 route: `src/content/docs/ko/blog/clinic-appointment-product-version-purchase-snapshot.mdx`
- 영어 route: `src/content/docs/blog/clinic-appointment-product-version-purchase-snapshot.mdx`
- 게시 예정 meta date: `2026-08-12T10:00:00+09:00`
- sidebar order: `-202608121000`
- hero: 기존 `/assets/clinic-appointment-prologue-hero.png` 재사용, 새 hero 생성은 범위 밖

글 본문이나 시리즈 링크에 `Issue #277` 같은 내부 관리 번호를 독자-facing 제목으로 노출하지 않는다. 원본
근거 링크는 저장소의 설계 문서·소스 파일·visual companion으로 연결하고, 이슈 번호는 설계 문서와 claim
ledger에만 남긴다.

### 4.2 섹션 순서

1. **상품을 바꿨는데, 이미 산 환자는 무엇을 받는가** — 환자 A의 `v1 → v2` 사건으로 시작한다.
2. **상품 version은 판매 문구가 아니라 구매 시점의 계약이다** — catalog projection, BOM, 혜택, 예약 규칙과 hash를 snapshot으로 설명한다.
3. **환자 A의 세 Plan을 다시 읽기** — 이벤트·N회·패키지를 별도 Plan과 `PlannedTreatment`로 비교한다.
4. **완료된 것과 아직 하지 않은 것을 분리한다** — 완료·진행·확정·미진행 항목의 변경 가능 범위를 보여 준다.
5. **기존 구매에 새 version을 적용하는 예외** — 전환표, 고객 동의, 같은 Plan의 새 revision, `FUTURE_ONLY` 적용을 설명한다.
6. **상품 변경이 방문 일정까지 바뀌는 순간** — 확정 방문 보호, 새 proposal, 동의 거부, CRM/운영 handoff를 구분한다.
7. **중복 전달과 추가 구매는 다른 문제다** — 멱등성은 한 박스에서 짧게 설명하고 본문 갈등으로 확대하지 않는다.
8. **현재 구현·승인 설계·운영 대기·로드맵** — 공개 가능한 사실과 아직 약속할 수 없는 범위를 표로 정리한다.
9. **다음 글 예고** — 이벤트 상품의 최초 예약 규칙과 한 번의 방문으로 이어지는 실행을 다룬다.

각 섹션은 `환자 A의 업무 질문 → 최소 데이터/상태 → 소유 서비스 → 예외와 다음 행동` 순서를 따른다.
상품 기능 목록이나 내부 운영 threshold를 먼저 나열하지 않는다.

### 4.3 본문에 넣을 핵심 관계

```text
상품 catalog v1 ──구매 시 고정──> Purchase snapshot ──> AppointmentPlan v1
      │                                      │
      └─ 새 version v2 발행                   └─ 완료 항목은 v1에 보존
                                               └─ 미진행 항목만 승인된 전환으로
                                                  AppointmentPlanRevision v2
```

본문에서는 기술 identifier를 보존하되, “snapshot”을 고객에게 보이는 가격표 복사본으로 설명하지 않는다.
그것은 해당 구매의 권리와 예약 의무를 재현하기 위한 최소 실행 계약이다.

## 5. 상품 변경 업무 규칙

### 5.1 기본 적용

상품 원본은 기존 version을 수정하지 않고 새 version으로 발행한다. 이후 구매는 `v2`를 참조하고, 환자 A의
기존 Plan은 구매 당시 `v1`과 BOM snapshot을 계속 참조한다. catalog projection이 최신 상태가 되었다고
해서 기존 Plan의 항목·횟수·간격·자원 요구를 자동으로 바꾸지 않는다.

### 5.2 항목 상태별 보호

| Plan 항목 상태 | `v2` 발행 뒤 기본 처리 | 고객에게 설명할 업무 의미 |
|---|---|---|
| `COMPLETED` | 구 revision과 구 version에 영구 보존 | 이미 제공된 서비스의 기록을 나중 정의로 다시 쓰지 않음 |
| `IN_PROGRESS` | 현재 실행과 임상 사실을 보호 | 진행 중인 행위를 상품 개편으로 되돌리지 않음 |
| `CONFIRMED` 방문에 연결된 미래 항목 | 당시 약속과 snapshot 보호 | 확정된 시간·항목·자원을 자동 취소하지 않음 |
| `PENDING` 또는 미확정 미래 항목 | 명시적 전환표와 동의가 있을 때만 새 revision으로 승계 | 아직 약속하지 않은 부분만 협의 가능한 변경 대상으로 봄 |
| `CANCELLED` | 과거 취소 사실 유지 | 환불·취소를 상품 version 변경으로 부활시키지 않음 |

### 5.3 예외적인 기존 구매 전환

상품팀이 기존 구매에도 새 version을 적용해야 한다면 예약서비스가 상품의 의미를 이름이나 코드 유사도로
추측하지 않는다. 상품팀이 `KEEP`, `REPLACE`, `SPLIT`, `MERGE`, `REMOVE`, `ADD` 전환표를 만들고,
대상 구매·from/to version·전환 사유·승인자·고객 동의 증거를 포함한 `ProductVersionMigrationApproved`
사실을 발행한다.

예약서비스의 역할은 다음에 한정한다.

1. 대상 Plan과 현재 active revision이 `fromProductVersionId`와 일치하는지 확인한다.
2. 미진행 source 항목이 전환표에서 정확히 한 번 설명되는지 검증한다.
3. 완료 항목은 새 revision에 복사하지 않고 기존 provenance를 보존한다.
4. 새 실행 BOM과 dependency·visit grouping 제약을 검증한다.
5. 같은 구매의 Plan 아래 새 immutable revision을 append하고 활성화한다.
6. 일정 변경이 필요하면 별도 proposal·동의 흐름과 운영 예외를 발행한다.

고객이 변경 제안을 거부해도 기존 확정 방문을 먼저 취소하지 않는다. 예약서비스는 `ProductVersionMigrationRejected`
또는 운영 예외 같은 객관적 사실을 남기고, 상담·환불·보상 판단은 CRM과 커머스에 넘긴다.

## 6. 서비스 권한 경계

| 업무 영역 | 권위 데이터 | 상품 변경 시 넘기는 사실 | 예약서비스의 책임 |
|---|---|---|---|
| 상품관리/상품개발 | 상품 version, BOM, 혜택, 전환표 | `ProductCatalogChanged`, `ProductVersionMigrationApproved` | version·BOM·mapping을 재현 가능한 입력으로 검증 |
| 구매/커머스 | 구매 계약, 추가 구매, 환불 | `PurchaseCompleted`, `PurchaseRefunded` | 구매별 Plan 생성과 미래 의무 반영 |
| 예약서비스 | Plan, Plan revision, 방문 약속, 자원, 상태 이력 | 객관적 전환·일정 사실 | 과거 snapshot·현재 revision·확정 약속의 권위 보존 |
| 임상/시술 | 실제 시작·완료·부분 완료 | completion/fulfillment fact | 완료 항목과 미래 항목의 상태 반영 |
| 고객상담/CRM | 상담, 민원, 보상, 고객 동의 원본 | 변경 제안 거부·운영 handoff 사실 | 상담이 판단할 수 있는 객관적 사실 제공 |
| 알림 | 연락처·동의·발송 이력 | 예약·전환 event와 outbox 결과 | 예약 트랜잭션과 채널 발송을 직접 결합하지 않음 |
| 통계/외부 consumer | 조회 projection·지표 | Plan/revision/event schema | 예약 원본의 권위를 외부 projection에 넘기지 않음 |

상품 version snapshot과 병원 운영정책 snapshot도 합치지 않는다. 상품은 “무엇을 구매했는가”를, 정책은
“그 시점에 어떤 운영 조건으로 제안·확정했는가”를 보존한다.

## 7. 멱등성과 추가 구매를 짧게 구분하기

이 글에서 “중복”이라는 단어를 단독으로 사용하지 않는다.

- **중복 전달**: 한 번의 구매에 대한 같은 `PurchaseCompleted`가 재시도·replay로 두 번 도착한다. 같은
  authority-qualified 구매 identity와 payload라면 Plan을 두 번 만들지 않고 inbox와 Plan 수렴 결과를 재사용한다.
- **추가 구매**: 환자가 실제로 다시 결제해 새로운 `sourcePurchaseId`를 얻는다. 새 구매는 새 Plan이며,
  두 Plan 항목을 한 방문에 함께 배치하려면 별도 eligibility·proposal·동의가 필요하다.

첫 번째는 기술적인 전달 안정성이고, 두 번째는 상품·커머스 업무 사건이다. 둘을 같은 “중복 구매”로 쓰지
않는다.

## 8. 사실성 표지

| 표지 | 이 글에서의 사용 | 근거 |
|---|---|---|
| **현재 구현** | versioned catalog projection, 구매별 Plan snapshot, explicit migration mapping 검증, Plan revision append/activate, 완료 항목 provenance 보존 | 현재 `clinic-appointment` `develop` 소스의 `ProductCatalogDefinition`, `PurchaseCompletedHandler`, `ProductVersionMigrationPlanner`, `ProductVersionMigrationHandler`, 관련 테스트 |
| **승인된 설계** | 상품 변경이 기존 확정 방문의 자원·시간을 실제로 바꾸는 경우의 proposal·동의·운영 정책 적용 | [진료 계획·예약·수용량 관리 설계](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/superpowers/specs/2026-07-26-appointment-plan-and-capacity-design.md), [방문 약속 설계](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/superpowers/specs/2026-07-29-issue-184-visit-commitment-design.md) |
| **운영 대기** | 전환 event·outbox의 실제 broker 전달, canary·backfill·production readiness | 원본 저장소의 rollout/runbook 문서와 운영 issue |
| **로드맵** | 환자 포털·모바일에서 변경 동의와 새 제안을 직접 처리하는 공개 채널 | 해당 채널의 후속 issue |

현재 구현으로 표시하는 항목도 “소스와 테스트에서 계약을 확인했다”는 의미로 제한한다. 실제 병원 운영에서
전 상품 변경을 자동 적용하거나 환자에게 보상·환불하는 기능으로 확대해 쓰지 않는다.

## 9. 시각 자료

### 9.1 기존 companion 재사용

본문의 시각 링크는 다음 기존 자료를 재사용한다. 새 interactive companion route나 visualization catalog
항목은 추가하지 않는다.

- 한국어: `/ko/visual-companions/clinic-appointment/product-scheduling-classification/`
- 한국어: `/ko/visual-companions/clinic-appointment/package-product-composition/`
- 한국어: `/ko/visual-companions/clinic-appointment/product-bom-to-appointment-flow/`
- 영어: 각 route에서 `/ko`를 제거한 대응 경로

각 companion은 원본 설계 Markdown을 대체하지 않는 보조 자료로 소개한다.

### 9.2 본문 diagram

기존 companion만으로는 “상품 v2 발행”과 “기존 Plan의 미래 항목만 승인된 전환으로 revision에 승계”하는
시간축을 충분히 보여 주지 못한다. 따라서 본문에만 삽입하는 정적 diagram 한 세트를 추가한다.

| asset | 독자의 질문 | 시각 계약 |
|---|---|---|
| `clinic-appointment-product-version-migration-01-ko.svg/png` | 상품 v2가 발행된 뒤 환자 A의 v1 Plan이 어떤 부분을 보호하고 어떤 부분만 전환하는가? | `상품관리`, `환자 A의 구매 snapshot/Plan`, `예약서비스 전환 경계` 3 lane; T1~T7 시간 순서; 완료·확정 보호와 미진행 전환 branch; 동의 거부 handoff |
| `clinic-appointment-product-version-migration-01-en.svg/png` | 같은 흐름을 영어 독자가 읽을 수 있는가? | 한국어 asset과 동일한 node·edge·state·identifier, 영어 reader-facing label |

SVG를 구조적 원본으로 삼고 CairoSVG로 PNG를 만든다. diagram 안에는 환자 식별자·가격·내부 운영 threshold를
넣지 않는다. 기존 prologue diagram과 동일한 dark workbench 계열을 유지하되, 이 글의 시간축과 branch가
읽히도록 캔버스를 넉넉히 잡는다.

Semantic ledger 위치:

- `docs/review/2026-08-12-clinic-appointment-product-version-migration-01-ko.semantic.json`
- `docs/review/2026-08-12-clinic-appointment-product-version-migration-01-en.semantic.json`

### 9.3 Diagram source contract

- **kind**: `workflow`
- **reader question**: “상품 version이 바뀌었을 때 환자 A의 구매 snapshot과 Plan revision은 무엇을 보호하는가?”
- **source revision**: `clinic-appointment` `develop` at `b052a69`
- **source paths**:
  - `docs/superpowers/specs/2026-07-29-issue-184-visit-commitment-design.md`
  - `appointment-core/.../model/catalog/ProductCatalogDefinition.kt`
  - `appointment-core/.../model/plan/ProductVersionMigration.kt`
  - `appointment-core/.../service/ProductVersionMigrationPlanner.kt`
  - `appointment-event/.../event/integration/ProductVersionMigrationHandler.kt`
- **complexity**: 최대 9 nodes, 10 edges, 2 branches로 workflow 기본 예산 안에 유지한다.
- **pipeline**: static SVG → PNG; HTML workflow companion은 추가하지 않는다.

## 10. locale·시리즈 parity

한국어 원고를 사실의 기준으로 먼저 쓰고, 영어는 문장 구조를 직역하지 않되 다음 항목은 일치시킨다.

| 항목 | 한국어 | 영어 |
|---|---|---|
| route | `/ko/blog/clinic-appointment-product-version-purchase-snapshot/` | `/blog/clinic-appointment-product-version-purchase-snapshot/` |
| 사례 | 환자 A, `v1 → v2`, 동일한 상태·mapping type | 동일한 환자·version·identifier·상태 |
| 상태 표지 | 현재 구현 / 승인된 설계 / 운영 대기 / 로드맵 | Current implementation / Approved design / Awaiting operations / Roadmap |
| visual link | `/ko/visual-companions/...` | `/visual-companions/...` |
| series | 프롤로그 → 현재 글 → Part 1~7 | Prologue → current article → Part 1~7 |

프롤로그의 “다음 글” 문단은 현재 글의 locale route를 명시적으로 연결한다. 기존 Part 1~7의 시리즈 링크에도
프롤로그 다음에 현재 글을 추가한다. 현재 글에는 아직 route가 없는 다음 글을 가짜 링크로 만들지 않고,
이벤트 상품의 최초 예약 규칙을 다음 주제로 예고한다.

## 11. 근거 ledger

| 주장 | 근거 | 글에서의 사용 |
|---|---|---|
| 구매 당시 상품 version과 BOM snapshot이 Plan provenance다 | [Appointment Plan and Capacity 설계](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/superpowers/specs/2026-07-26-appointment-plan-and-capacity-design.md), `ProductCatalogDefinition.kt`, `AppointmentPlanModel.kt` | 상품 version과 구매 계약의 시간축 |
| 새 catalog version은 기존 Plan을 자동으로 다시 전개하지 않는다 | `ProductCatalogProjection`/`AppointmentPlan` 불변 규칙, [방문 약속 설계 §8](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/superpowers/specs/2026-07-29-issue-184-visit-commitment-design.md#8-상품-버전-고정과-승인된-전환) | 새 구매와 기존 구매 분리 |
| 완료 항목은 기존 revision에 남고 미래 항목만 전환된다 | `ProductVersionMigrationPlanner.kt`, `ProductVersionMigrationHandler.kt` | 상태별 보호 표 |
| 전환표는 `KEEP/REPLACE/SPLIT/MERGE/REMOVE/ADD`를 명시한다 | [방문 약속 설계 §9](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/superpowers/specs/2026-07-29-issue-184-visit-commitment-design.md#9-bom-전환표와-의존-관계), `ProductVersionMigration.kt` | 상품팀과 예약서비스의 책임 경계 |
| 확정 방문 변경은 새 proposal과 고객 동의가 필요하다 | [방문 약속 설계 §6·§8](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/superpowers/specs/2026-07-29-issue-184-visit-commitment-design.md) | 일정 변경·거부·CRM handoff |
| 같은 구매 event 재전달과 추가 구매는 다르다 | `PurchaseCompletedHandler.kt`, `SchedulingInboxEvents.kt`, [Appointment Plan 설계 이벤트 계약](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/superpowers/specs/2026-07-26-appointment-plan-and-capacity-design.md#13-이벤트-계약) | 짧은 멱등성 보조 상자 |
| 상품 변경·환불·상담 판단의 소유권은 예약서비스 밖에 있다 | [Appointment Plan 서비스 경계](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/superpowers/specs/2026-07-26-appointment-plan-and-capacity-design.md#2-서비스-경계) | 권한 표와 공개 범위 |

`latest`, `완료`, `운영 중` 같은 시점 의존 표현은 원본 `develop`을 다시 확인한 뒤에만 사용한다. 내부
threshold, 환자 식별 정보, 실제 상품 가격, 병원별 노쇼·VIP 순위 규칙은 ledger와 글 모두에서 제외한다.

## 12. 비범위와 보호선

- 상품 가격·할인·환불 금액, 실제 병원·환자 정보, 직원별 점수와 내부 threshold를 공개하지 않는다.
- 예약서비스가 상품 원본·가격·환불·상담·임상 판단을 소유한다고 쓰지 않는다.
- 상품 version 변경만으로 기존 `CONFIRMED` 방문이 취소되거나 자원이 자동 재배정된다고 쓰지 않는다.
- “중복 이벤트”를 “중복 구매”로 표현하지 않는다.
- 새 visual companion route, visualization catalog, 원본 `clinic-appointment` 코드 변경은 수행하지 않는다.
- 운영 rollout과 broker 전달이 완료됐다고 추정하지 않는다.

## 13. 구현·검증 DoD

### 13.1 원고와 시리즈

- [ ] 한국어 글을 `src/content/docs/ko/blog/`에 추가한다.
- [ ] 영어 글을 `src/content/docs/blog/`에 추가한다.
- [ ] 프롤로그의 다음 글 링크를 양 locale에서 현재 글로 연결한다.
- [ ] Part 1~7 양 locale의 시리즈 링크에 현재 글을 프롤로그 다음으로 추가한다.
- [ ] 내부 Issue 번호 없이 독자-facing 제목·본문을 구성한다.
- [ ] 상품 version, 구매 snapshot, Plan revision, 확정 방문 보호, CRM handoff의 의미가 양 locale에서 일치한다.

### 13.2 시각 자료

- [ ] 양 locale SVG semantic ledger가 `diagram-semantic-audit.py`를 통과한다.
- [ ] 각 SVG를 `xmllint`와 `diagram-svg-text-normalize.py`로 검증한다.
- [ ] CairoSVG scale 2로 대응 PNG를 렌더링한다.
- [ ] connector·arrowhead·endpoint·geometry·visual audit와 full-size PNG inspection을 수행한다.
- [ ] PNG는 `/assets/clinic-appointment-product-version-migration-01-{ko,en}.png`에 둔다.

### 13.3 사이트 검증

- [ ] `git diff --check`가 통과한다.
- [ ] `npm run build`가 통과한다.
- [ ] 양 locale route와 모든 새 PNG가 `dist`에 존재하고 HTML에서 참조된다.
- [ ] 기존 visual companion route는 변경하지 않고 locale 대응 링크만 확인한다.
- [ ] 변경 파일 범위에 원본 서비스 코드·catalog·companion HTML이 포함되지 않는다.

### 13.4 상태 경계

실제 글·diagram 작성과 build 검증은 이 설계 문서에 대한 사용자 검토가 끝난 뒤 `writing-plans`로
세부 실행 순서를 만든 다음 시작한다. PR 생성·push·merge·Pages 배포는 이 Issue의 글 작성 DoD와 별도
승인 경계로 남긴다.

## 14. 자기 검토

- 상품 변경을 첫 갈등으로 두고 멱등성은 보조 설명으로 제한했다.
- 실제 추가 구매와 같은 구매 event의 재전달을 별도 업무 사건으로 구분했다.
- 완료·진행·확정·미진행 항목의 변경 범위를 분리했다.
- 기존 구매 전환에는 상품팀 전환표와 고객 동의를 요구하고, 예약서비스의 역할을 검증·revision·사실 발행으로 제한했다.
- 기존 companion 재사용과 본문 diagram 한 세트만 허용해 시각 범위를 통제했다.
- 새 hero·interactive companion·원본 서비스 코드 변경을 제외했다.
- 내부 issue 번호를 reader-facing 블로그 제목·본문에서 제거하도록 결정했다.
- 현재 구현·승인 설계·운영 대기·로드맵을 source-backed 표지로 분리했다.
