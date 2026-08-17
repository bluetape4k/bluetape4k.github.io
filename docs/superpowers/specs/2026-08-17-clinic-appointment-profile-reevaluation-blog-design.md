# CRM 프로필 변경과 예약 재평가의 경계를 설명하는 글 설계

## 문서 정보

- 시리즈: Clinic Appointment 운영 확장 4
- 한국어 제목: `[운영 확장 4] CRM 프로필이 바뀌어도 확정 방문 약속은 자동으로 바꾸지 않는다`
- 영어 제목: `[Operations 4] Profile Changes Do Not Rewrite Confirmed Visit Commitments`
- 원본 시리즈 이슈: [clinic-appointment #275](https://github.com/bluetape4k/clinic-appointment/issues/275)
- 원본 글 작성 이슈: [clinic-appointment #287](https://github.com/bluetape4k/clinic-appointment/issues/287)
- 관련 구현 PR: [clinic-appointment #200](https://github.com/bluetape4k/clinic-appointment/pull/200)
- 기준 구현: `clinic-appointment`의 profile reevaluation 구현과 `develop` 기준 소스
- 한국어 경로: `/ko/blog/clinic-appointment-profile-reevaluation/`
- 영어 경로: `/blog/clinic-appointment-profile-reevaluation/`
- 기존 시각 자료: `/ko/visual-companions/clinic-appointment/profile-change-reservation-reevaluation/`

## 1. 글의 목표와 독자

주 독자는 CRM 프로필 변경을 예약에 반영해야 하는 병원 `STAFF`다. 개발자는 CRM과 예약
서비스 사이에서 어떤 데이터만 넘기고 어떤 상태를 보호하는지 확인하고, PO와 병원
관계자는 프로필 변경이 기존 방문 약속을 언제 다시 검토할 수 있는지와 언제 운영자의
확인이 필요한지를 이해할 수 있어야 한다.

이 글의 한 문장 결론은 다음과 같다.

> CRM 프로필이 바뀌었다는 사실은 예약을 다시 평가할 이유가 될 수 있지만, 이미 확정한
> 방문 약속을 자동으로 덮어쓸 권한은 아니다. `PROPOSED`와 `HELD`만 재평가하고,
> `CONFIRMED`는 현재 약속·동의·자원 점유를 보호한다.

글은 CRM의 원본 프로필 계산 방법을 설명하지 않는다. 예약 서비스가 받아야 할 최소
이벤트, 재평가 대상, 상태별 결과, 실패 복구와 운영 화면의 권한 경계를 설명한다.

## 2. 본문 흐름

본문은 STAFF가 먼저 보는 운영 화면에서 시작하고, 선택한 재평가 작업 항목 하나의 흐름을
따라가며 구현 근거를 설명한다.

1. **운영 화면에서 현재 상태를 확인한다.** 상단에는 `PENDING`, `RUNNING`,
   `RETRY_WAIT`, `FAILED`, 활성 lease 수, 가장 오래된 대기 시간, `drainState`를
   표시한다. 아래 조치 큐에는 `targetRevision`, 우선순위, `dueAt`,
   `nextAttemptAt`, 마지막 실패 코드와 결과 수를 둔다.
2. **CRM은 최소 이벤트만 보낸다.** 예약 서비스에는 원본 프로필·특징·점수·설명 대신
   `tenantGroupId`, `clinicId`, `patientReferenceFingerprint`, `profileRevision`,
   변경 여부, `assessmentRef`, `assessmentHash`, 발생 시각이 전달된다.
3. **최신 revision을 확인하고 재평가 대상을 좁힌다.** 신뢰 검증과 중복 이벤트
   병합을 마친 뒤 현재 상태가 `PROPOSED` 또는 `HELD`인 예약만 대상으로 삼는다.
4. **assessment를 조회한 뒤 최종 상태를 결정한다.** 새 결과가 유효하면 제안을
   교체하거나 hold를 유지한다. 조건을 더 이상 만족하지 않으면 `FALLBACK_TO_PROPOSED`
   또는 `SKIPPED_INELIGIBLE` 같은 결과를 기록한다.
5. **`CONFIRMED`는 보호한다.** 확정 방문 약속은 CRM 변경만으로 다시 쓰지 않는다.
   변경이 필요하면 새 제안을 만들고 환자 동의와 운영자의 확정 작업을 별도로 거친다.
6. **실패와 운영 작업을 분리한다.** 일시적인 assessment 조회 실패는 제한된 재시도와
   `RETRY_WAIT`로 보낼 수 있지만, 개인정보 경계 위반·신뢰할 수 없는 이벤트·반복
   실패는 quarantine이나 수동 검토로 보낸다.
7. **현재 구현과 운영 준비를 나눈다.** 재평가 작업 모델과 actuator 스냅숏이
   구현되어 있다는 사실, rollout 단계와 STAFF/ADMIN 작업이 운영에 준비되었다는
   판단, 후속 개선이 필요한 영역을 별도 표로 구분한다.

## 3. 구현 근거와 주장 경계

| 글에서 설명할 주장 | 코드·문서 근거 | 사실성 표지 |
| --- | --- | --- |
| CRM 이벤트는 원본 프로필을 넘기지 않고 pseudonymous fingerprint와 revision, assessment 참조·해시를 전달한다 | `PatientSchedulingAssessmentChanged.kt` | 현재 구현 |
| 재평가 작업은 `PENDING`, `RUNNING`, `RETRY_WAIT`, `COMPLETED`, `STALE`, `FAILED` 상태를 가진다 | `ProfileReevaluationModel.kt` | 현재 구현 |
| `PROPOSED`와 `HELD`만 재평가 대상이며 `CONFIRMED`는 대상이 아니다 | `ProfileReevaluationModel.isProfileReevaluationEligible` | 현재 구현 |
| 작업 scope는 tenant group, clinic, fingerprint이며 fingerprint는 소문자 SHA-256이다 | `ProfileReevaluationRecords.kt` | 현재 구현 |
| `HELD_PRESENT`를 먼저 처리하고 `PROPOSED_ONLY`를 뒤따르게 하는 우선순위 분류가 있다 | `ProfileReevaluationRecords.kt` | 현재 구현 |
| 운영 스냅숏은 backlog, lease, 오래된 대기 시간, 연속 assessment 실패와 drain 상태를 제공한다 | `ProfileReevaluationHealthIndicator.kt` | 현재 구현 |
| 메트릭 label에는 tenant·clinic·patient·appointment·event ID를 넣지 않는다 | `ProfileReevaluationMetrics.kt` | 현재 구현 |
| 스냅숏 조회와 redrive는 인증된 운영 주체와 tenant·clinic scope를 확인한다 | `ProfileReevaluationEndpoint.kt` | 현재 구현 |
| 운영 runbook은 `PREVIEW` 뒤에 제한된 `EXECUTE(redrive)`를 허용하고, `retry all`을 제공하지 않는다 | `docs/runbooks/profile-reevaluation.ko.md` | 승인된 운영 설계 |
| rollout 순서는 `DISABLED → DRY_RUN → APPLY_PROPOSED → APPLY_PROPOSED_AND_HELD`다 | `docs/runbooks/profile-reevaluation.ko.md` | 승인된 운영 설계 |
| `CONFIRMED` 보호와 유효한 `HELD` 보호는 rollback 시에도 유지해야 한다 | runbook rollback 규칙과 profile reevaluation 설계 | 승인된 운영 설계 |

### 3.1 합쳐서 쓰지 않을 경계

- CRM이 assessment를 계산한다는 사실과 예약 서비스가 예약 상태를 바꾼다는 사실을 한
  서비스의 책임처럼 쓰지 않는다.
- fingerprint가 있다고 해서 예약 서비스가 원본 프로필을 복원할 수 있다고 쓰지 않는다.
- `CONFIRMED`를 재평가하지 않는 현재 eligibility 규칙을 “모든 프로필 변경은 무시한다”로
  넓히지 않는다. 확정 약속을 보호하면서 별도 제안을 만들 수 있다는 운영 경계를 함께
  설명한다.
- `RETRY_WAIT`를 모든 실패의 공통 해결책으로 쓰지 않는다. 개인정보 경계 위반, 신뢰할
  수 없는 이벤트, 반복 assessment 실패는 quarantine이나 수동 검토가 필요하다.
- actuator 스냅숏과 실제 운영 적용을 같은 뜻으로 쓰지 않는다. 스냅숏은 상태를 읽는
  근거이고, rollout·권한·redrive 훈련은 운영 준비의 별도 판단이다.
- 메트릭에 low-cardinality label을 사용한다는 사실을 환자 단위 추적이 가능하다는
  뜻으로 바꾸지 않는다.

## 4. STAFF 운영 화면 시안

이번 글은 기존 시리즈의 조치 큐 화면과 다른 **프로필 재평가 전용 운영 화면**을 넣는다.
시안은 `ProfileReevaluationOperationalSnapshot`과 운영 endpoint가 제공하는 정보만
사용하며, 실제 환자 정보나 CRM 원문을 흉내 내지 않는다.

### 4.1 화면 배치

```text
운영 상태 카드: PENDING | RUNNING | RETRY_WAIT | FAILED | active lease | oldest backlog
                                   ↓
조치 큐: target revision · priority · dueAt · nextAttemptAt · failure code · outcome count
                                   ↓
선택 항목 상세: scope · revision · policy reference · generation · state · outcome
                                   ↓
STAFF 미리보기 → ADMIN 제한 redrive(EXECUTE)
```

상단 상태 카드에는 `drainState`와 lease 갱신 실패 수, 연속 assessment 실패 수도 함께
표시한다. 조치 큐의 각 행에는 환자 이름 대신 익명화한 재평가 작업 참조값을 사용한다.
상세 패널에는 다음 필드만 둔다.

- scope: tenant group와 clinic의 운영 범위
- revision: 재평가 대상 profile revision
- policy reference와 generation
- 현재 작업 상태와 최근 결과
- `dueAt`, `nextAttemptAt`, 마지막 실패 코드, 결과 수

원본 프로필, 특징 벡터, 점수, assessment 본문, 환자 이름·연락처는 화면에 넣지 않는다.

### 4.2 권한과 작업

- `STAFF`는 스냅숏을 읽고 `PREVIEW` 결과를 확인한다.
- `ADMIN`은 인증된 사용자·clinic scope·`profile-reevaluation:operate` 권한을 갖춘
  경우에만 특정 범위의 `EXECUTE(redrive)`를 수행한다.
- “전체 다시 시도” 버튼은 만들지 않는다. 선택한 범위와 대상 revision을 다시 확인한
  뒤 제한된 redrive만 허용한다.
- `DRAINING`이나 `DRAINED` 상태에서는 새 작업을 자동으로 확장하지 않고, 활성 lease와
  backlog를 확인한 뒤 운영자가 다음 작업을 결정한다.

## 5. 기술 다이어그램 계약

### 5.1 주 흐름

diagram은 다음 순서를 한 장에서 읽게 한다.

```text
CRM 최소 이벤트
  → 신뢰 검증·최신 revision 병합
  → 병원별 공정 dispatch
  → assessment 조회
  → 최종 상태 결정
  → 결과·아웃박스(outbox)·메트릭
```

`최종 상태 결정`은 추상적인 수평 점선이 아니라 명시적인 결정 노드다. 그 노드에서
`PROPOSED`, `HELD`, `CONFIRMED`를 구분하고, `CONFIRMED`는 보호 경로로, 나머지는 결과
계산 경로로 연결한다. 결과 카드는 `PROPOSAL_SUPERSEDED`, `HOLD_KEPT`,
`HOLD_REPLACED`, `FALLBACK_TO_PROPOSED`, `SKIPPED_INELIGIBLE`,
`SKIPPED_UNCHANGED`를 보여 준다. assessment 조회 실패는 `RETRY_WAIT`, 개인정보·신뢰
오류는 `QUARANTINE`으로 명확히 나눈다.

### 5.2 diagram 품질 규칙

- scope/version 카드는 제목과 본문 카드 사이의 고정 영역에 두고 연결선을 가리지 않게
  한다.
- 수직 간격을 넉넉히 두고, 마지막 카드 아래에도 충분한 여백을 둔다.
- call line과 label은 겹치지 않게 하며, label은 선의 중간이 아니라 별도 여백에 둔다.
- rounded corner 연결선은 직각 경로로 방향을 읽을 수 있게 하고, 모든 endpoint에 정확히
  닿게 한다.
- 화살촉과 연결선은 같은 색을 쓴다.
- 실선은 호출·상태 변경, 점선은 조회·참조에만 사용한다.
- 모든 branch는 명시적인 `최종 상태 결정`에 연결한다.
- 한국어와 영어 diagram은 노드·상태·분기·레이아웃을 같게 유지하고 텍스트만 번역한다.

### 5.3 기존 시각 자료와의 관계

기존 visual companion `profile-change-reservation-reevaluation`은 설계와 상태 경계를
깊게 살펴보는 독립 자료다. 본문에는 이 자료 링크를 유지하되, 이번 글에는 독자가
STAFF 운영 순서를 바로 이해할 수 있도록 별도의 운영 화면 PNG를 추가한다. 두 그림을
같은 hero나 같은 파일로 재사용하지 않는다.

## 6. Hero와 자산 계획

Hero는 Clinic Appointment 시리즈의 밝은 3D 미니어처 분위기를 유지하되, 이전 글의
대기 목록 조치 큐나 장애 복구 화면을 복제하지 않는다. CRM 프로필 변경 신호가 예약
서비스의 보호된 확정 방문 약속과 분리되어 들어오는 장면, 운영 화면을 확인하는 STAFF,
보호된 `CONFIRMED` 카드와 재평가 가능한 `PROPOSED`·`HELD` 카드의 대비를 중심으로
구성한다. Hero 안에는 읽어야 할 작은 문자, 환자 정보, 실제 병원 표식을 넣지 않는다.

예정 자산은 다음과 같다.

- `public/assets/clinic-appointment-profile-reevaluation-hero.png`
- `public/assets/clinic-appointment-profile-reevaluation-flow-01-ko.svg`
- `public/assets/clinic-appointment-profile-reevaluation-flow-01-ko.png`
- `public/assets/clinic-appointment-profile-reevaluation-flow-01-en.svg`
- `public/assets/clinic-appointment-profile-reevaluation-flow-01-en.png`
- `public/assets/clinic-appointment-profile-reevaluation-operations-screen-ko.png`
- `public/assets/clinic-appointment-profile-reevaluation-operations-screen-en.png`
- `scripts/generate-clinic-appointment-profile-reevaluation-visuals.mjs`

본문은 PNG를 표시하고, diagram과 운영 화면 모두 기존 시리즈의 크게 보기(lightbox)를
적용한다. SVG는 구조·endpoint·semantic ledger 검증과 원본 보존에 사용한다. 생성기와
다이어그램 semantic 파일은 `docs/diagrams/clinic-appointment-profile-reevaluation/`
아래에 둔다.

## 7. bilingual parity와 검증 기준

한국어 글을 기준으로 작성하되 영어 글도 같은 사실, 상태, 숫자, 분기, 자산을 사용한다.
한국어는 번역체를 피하고 설명이 필요한 곳에서는 풀어 쓴다. 다음 용어를 시리즈 전체와
같게 유지한다.

| 뜻 | 사용할 용어 |
| --- | --- |
| temporary reservation candidate | 제안 |
| temporary held reservation | 보류(hold) |
| confirmed appointment | 확정 방문 약속 |
| final state decision | 최종 상태 결정 |
| message relay | 아웃박스(outbox) |
| queue item | 재평가 작업 항목 |

완료 조건은 다음과 같다.

1. 설계 문서와 한국어·영어 글의 제목·경로·시리즈 번호가 일치한다.
2. 한국어·영어 글 모두 기존 visual companion 링크, 새 diagram, 새 운영 화면 PNG,
   hero와 다음 글 링크를 갖는다.
3. `최종 상태 결정` 노드가 명시적이고, `CONFIRMED` 보호·`PROPOSED`/`HELD` 재평가,
   retry/quarantine 결과가 연결선과 캡션으로 확인된다.
4. 운영 화면에 원본 개인정보와 무제한 redrive가 없고, STAFF 읽기/미리보기와 ADMIN
   제한 실행이 구분된다.
5. `npm test`, `git diff --check`, `npm run build`가 통과하고, 변경 라우트와 모든 자산이
   실제로 열리며, locale별 파일 수·series registry·자산 parity 검사가 통과한다.
6. diagram 연결선, 화살촉 색, label 간격, scope/version card 위치와 운영 화면 크게
   보기를 실제 렌더링에서 확인한다.

### 7.1 현재 구현·승인된 설계·운영 준비의 구분

| 구분 | 이 글에서 말할 수 있는 범위 | 근거 또는 남은 확인 |
| --- | --- | --- |
| 현재 구현 | 최소 CRM 이벤트 모델, 재평가 상태·결과, 대상 상태 필터, 운영 스냅숏, 인증·scope 검증 endpoint가 소스에 있다 | `clinic-appointment`의 profile reevaluation 소스와 테스트 |
| 승인된 설계 | `PREVIEW` 후 제한된 `EXECUTE(redrive)`, rollout 단계, retry와 quarantine 분리, rollback 때 `CONFIRMED` 보호를 요구한다 | `docs/runbooks/profile-reevaluation.ko.md`와 profile reevaluation 설계 문서 |
| 운영 준비 | 실제 병원에서 rollout하거나 redrive 훈련을 끝냈다고 단정하지 않는다 | 운영자 권한·훈련·모니터링·drain 리허설은 배포 전에 별도로 확인 |

## 8. 범위 밖

- CRM assessment 알고리즘이나 개인정보 저장 정책의 구현 변경
- `CONFIRMED` 예약을 자동으로 다시 확정하는 기능
- 실제 clinic-appointment 저장소의 코드·API·운영 설정 변경
- GitHub Issue/PR 종료, merge, Pages 배포
- 실제 병원 데이터나 운영 지표의 수집·공개
