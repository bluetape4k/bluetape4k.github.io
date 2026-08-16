# 병원 사정으로 바뀐 예약을 STAFF가 복구하는 글 설계

## 문서 정보

- 시리즈: Clinic Appointment 운영 확장 3
- 한국어 제목: `[운영 확장 3] 병원 사정으로 바뀐 예약을 복구하는 법`
- 영어 제목: `[Operations 3] Recovering Appointments Changed by Clinic Disruptions`
- 원본 시리즈 Epic: [clinic-appointment #275](https://github.com/bluetape4k/clinic-appointment/issues/275)
- 원본 글 작성 이슈: [clinic-appointment #286](https://github.com/bluetape4k/clinic-appointment/issues/286)
- 블로그 작업 이슈: [bluetape4k.github.io #370](https://github.com/bluetape4k/bluetape4k.github.io/issues/370)
- 작업 브랜치: `docs/clinic-appointment-disruption-recovery`
- 기준 구현: `clinic-appointment` `develop`의 `90e50da4b49e35d667911418cc9578ab538898e3`
- 한국어 경로: `/ko/blog/clinic-appointment-disruption-recovery/`
- 영어 경로: `/blog/clinic-appointment-disruption-recovery/`

## 1. 독자와 목적

주 독자는 병원에서 예약 변경을 처리하는 `STAFF`다. 병원 관계자는 화면에서 어떤
작업을 먼저 확인해야 하는지, PO는 환자 책임과 병원 책임을 어디에서 나눠야 하는지,
개발자는 상태·버전·이력·알림을 어떤 저장 경계에서 묶어야 하는지를 함께 읽을 수 있어야
한다.

이 글은 휴진과 장비 사용 불가의 계산 로직을 다시 소개하지 않는다. 이미 발행된
`[구현 6] 휴진과 장비 고장은 예약 설계를 어떻게 바꾸는가`가 탐지와 재배정 구현을
설명했기 때문이다. 이번 글은 같은 구현을 STAFF의 실제 작업 순서로 다시 읽는다.

> **병원 사정으로 방문 약속을 지킬 수 없다면, 운영자는 영향받은 예약과 현재 버전을
> 먼저 확인하고 대체 시간을 제안해야 한다. 환자 책임 기록을 만들거나 기존 확정 방문
> 약속을 조용히 덮어써서는 안 된다.**

글의 목표는 다음 질문에 답하는 것이다.

1. 장비 고장이나 휴진이 생겼을 때 운영자는 어느 예약부터 확인하는가?
2. 충돌 탐지, 후보 계산, 재배정 확정은 왜 서로 다른 작업인가?
3. 현재 구현은 어느 시점에 원본 예약과 새 예약을 함께 바꾸는가?
4. 고객 동의 정책 모델과 현재 재배정 API의 기존 경로에는 어떤 차이가 있는가?
5. 병원 책임 변경이 환자의 노쇼·지각 취소 제한으로 잘못 이어지지 않게 하려면 무엇을
   기록해야 하는가?

## 2. 본문 시나리오

금요일 오전, STAFF가 오후 레이저 장비를 사용할 수 없다는 보고를 받는다. 장비 사용
불가 시간을 등록하기 전 충돌 예약을 미리 확인하고, 실제 영향 범위를 확정한 뒤 휴진
재배정 화면에서 후보 계산을 시작한다. 화면에는 처리 건수, 후보가 있는 예약과 없는
예약, 선택한 예약의 대체 시간 목록이 차례로 나타난다.

공개 화면의 숫자는 이해를 돕기 위한 예시로 고정한다.

| 운영 신호 | 예시 값 | 의미 |
| --- | ---: | --- |
| 영향 예약 | 8건 | 장비 사용 불가 시간과 겹치거나 휴진 범위에 포함된 예약 |
| 후보 있음 | 6건 | 현재 계산에서 대체 시간이 하나 이상 나온 예약 |
| 후보 없음 | 2건 | 자동 확정이 아니라 별도 연락과 수동 검토가 필요한 예약 |
| 선택 예약 후보 | 3건 | STAFF가 날짜·시간·담당 의료진·우선순위를 비교할 수 있는 대체 시간 |

이 숫자는 운영 환경의 실측치가 아니다. 환자 이름, 전화번호, 실제 병원 이름도 넣지
않는다. 예약은 공개용 참조값으로 표시하고, 실제 Angular 화면의 필드와 API 응답을
바탕으로 화면 구조만 단순화한다.

## 3. 글의 흐름

1. 장비 고장 신고를 받은 STAFF가 충돌 미리보기에서 영향 범위를 확인한다.
2. `예약 재배정 관리` 화면에서 병원, 날짜, 후보 검색 범위를 입력한다.
3. 일괄 처리가 예약별 후보 수를 전달하고, STAFF는 후보 없음 항목을 별도 작업으로
   남긴다.
4. 선택한 예약의 후보를 비교해 수동 확정하거나, 현재 구현의 자동 재배정을 실행한다.
5. 서비스가 대체 예약을 `CONFIRMED`로 만들고 원래 예약을 `RESCHEDULED`로 바꾸는
   트랜잭션 경계를 설명한다.
6. 현재 재배정 화면의 확정 버튼에는 별도 환자 동의 단계가 없다는 사실과,
   `DisruptionRecoveryPolicy`가 기존 확정 방문 약속 보호를 요구한다는 차이를 밝힌다.
7. Solver를 사용하는 별도 경로에서는 계산 결과의 원본 버전이 오래됐는지 원자적으로
   확인해야 한다고 설명한다.
8. 병원 책임 사건은 `CLINIC` 또는 `OPERATIONAL_EXCEPTION`으로 분류해 환자 신뢰도
   제한 계산에서 제외한다.
9. 복구 크레딧과 직원 보정은 재배정 확정에 자동으로 붙는 보상이 아니라 별도 권한과
   감사 기록을 가진 작업임을 구분한다.
10. 현재 재배정 경로, 정책 모델, 운영 준비, 후속 개선을 표로 정리하고 운영 확장 4인 CRM
    프로필 재평가 글로 연결한다.

## 4. 구현 근거와 주장 경계

| 독자에게 설명할 주장 | 근거 | 사실성 표지 |
| --- | --- | --- |
| 휴진 범위의 활성 예약과 버전을 먼저 읽고 후보를 계산한 뒤, 쓰기 직전에 같은 예약과 버전을 다시 확인한다 | `ClosureRescheduleService.processClosureReschedule()` | 현재 구현 |
| 상태를 `PENDING_RESCHEDULE`로 바꾸는 CAS, 상태 이력, 상태 이벤트 의도, 후보 저장은 같은 트랜잭션에 들어간다 | `ClosureRescheduleService`의 write validation과 commit loop | 현재 구현 |
| 진행률 스트림은 예약별 트랜잭션을 커밋한 다음 SSE 이벤트를 보내므로, 연결이 중단돼도 앞서 처리한 예약을 되돌리지 않는다 | `streamClosureReschedule()`, `RescheduleBatchStreamController` | 현재 구현, 동기 일괄 경로와 다른 경계 |
| 수동 확정은 대체 예약 `CONFIRMED`, 원본 예약 `RESCHEDULED`, 이력, 선택 후보, 알림 아웃박스(outbox) 연결을 한 트랜잭션에서 처리한다 | `confirmRescheduleInTransaction()` | 현재 구현 |
| 자동 재배정은 별도 최적화를 수행하지 않고 우선순위가 가장 높은 후보를 같은 확정 함수로 넘긴다 | `autoReschedule()` | 현재 구현 |
| 장비 사용 불가는 충돌 예약을 탐지·미리보기하지만 휴진 재배정 서비스를 자동 호출하지 않는다 | `EquipmentUnavailabilityService`, `EquipmentUnavailabilityController` | 현재 구현 |
| 실제 Angular 관리 화면에는 휴진 날짜·검색 일수, 처리 건수, 후보 있음·없음, 후보 날짜·시간·의사·우선순위, 수동 확정·자동 재배정 작업이 있다 | `RescheduleListComponent` | 현재 구현 |
| 기존 확정 방문 약속은 고객 동의나 명시적 취소 전까지 보존해야 한다 | `DisruptionRecoveryPolicy.preserveConfirmedAppointment`, `SchedulingPolicyValidator` | 현재 구현된 정책 모델, 기존 재배정 경로와는 미연결 |
| 현재 재배정 확정 API가 고객 동의 증빙을 받거나 제안 상태를 거치지는 않는다 | `RescheduleController.confirmReschedule()`, `ClosureRescheduleService.confirmRescheduleInTransaction()` | 현재 구현의 한계 |
| Solver 결과는 원본 예약을 잠근 뒤 조회 당시 버전 확인과 CAS를 모두 통과할 때만 반영한다 | `SolverService.applyOptimizedAssignments()` | 현재 구현, 별도 실행 경로 |
| 병원·운영 책임 사건은 환자 신뢰도 제한 집계에서 제외한다 | `BookingReliabilityResponsibility`, `BookingReliabilityEvaluator` | 현재 구현 |
| 복구 크레딧은 대기 목록 우선순위에 반영되는 별도 원장과 조정 권한 API다 | `DisruptionRecoveryCredits`, `WaitlistOperationsController`, `WaitlistPolicyEvaluator` | 현재 구현, 재배정과 별도 경계 |

### 4.1 서로 합쳐 쓰지 않을 경계

- `EquipmentUnavailabilityService`가 충돌을 반환한다고 해서 해당 예약이 자동으로
  `PENDING_RESCHEDULE`이 되지는 않는다.
- 동기 일괄 경로와 진행률 스트림을 같은 트랜잭션이라고 쓰지 않는다. 동기 경로는 전체
  조회 기준 상태와 버전을 다시 확인한 뒤 한 트랜잭션에서 저장하고, 스트림 경로는
  예약별 커밋 뒤 진행률을 보낸다.
- `ClosureRescheduleService.autoReschedule()`은 Timefold Solver 경로가 아니다. 저장된
  후보 중 우선순위가 가장 높은 항목을 선택한다.
- `SolverService.applyOptimizedAssignments()`의 version fence를 휴진 재배정 트랜잭션
  자체의 구현이라고 쓰지 않는다. 두 경로는 오래된 계산 결과를 막는 목적은 같지만
  진입점과 저장 방식이 다르다.
- `DisruptionRecoveryPolicy`의 고객 동의 원칙이 현재 재배정 API의 기존 확정 경로에
  완전히 연결됐다고 쓰지 않는다.
- 복구 크레딧이 병원 책임 재배정 때 자동 발급되거나 보상을 확정한다고 쓰지 않는다.
- 코드와 테스트가 있다는 사실을 특정 병원의 운영 적용 또는 복구 훈련 완료로
  표현하지 않는다.

### 4.2 동기 일괄 처리와 진행률 스트림

실제 화면에는 일반 조회 버튼과 `일괄 재배정 스트림` 버튼이 함께 있다. 두 버튼은 같은
작업을 다른 표시 방식으로만 실행하지 않는다.

| 경로 | 저장 단위 | 운영자가 알아야 할 점 |
| --- | --- | --- |
| `processClosureReschedule()` | 전체 영향 예약을 다시 검증한 뒤 한 트랜잭션으로 저장 | 예약 하나라도 조회 당시 상태나 버전과 다르면 전체 쓰기를 시작하지 않는다 |
| `streamClosureReschedule()` | 예약별 트랜잭션을 커밋한 뒤 진행률을 전송 | 중간에 연결이 끊기면 앞서 처리한 예약과 아직 처리하지 않은 예약을 다시 대조해야 한다 |

SSE 연결이 끊겼다고 해서 전체 작업이 되돌려졌다고 표시하면 안 된다. 이미 커밋된 예약은
남아 있으므로 재접속 뒤 현재 상태와 후보를 다시 조회해야 한다. 반대로
진행률을 받았다는 사실만으로 환자 연락이나 재배정 확정까지 끝났다고 표시해서도 안 된다.

## 5. STAFF 운영 화면 시안

시각 자료는 실제 운영 화면을 캡처한 것처럼 꾸미지 않는다. 현재 Angular 화면과 API가
제공하는 데이터로 구성한 **운영 화면 시안**임을 그림과 캡션에 함께 표시한다.

### 5.1 화면 구조

```text
장애 원인·시간 범위·후보 검색 범위
                ↓
영향 예약 / 후보 있음 / 후보 없음 / 처리 상태
                ↓
재배정 작업 목록
                ↓
선택 예약의 후보 시간과 현재 허용 작업
                ↓
현재 구현의 확정 경계와 동의 절차 보완 안내
```

화면은 다음 다섯 영역을 한 번에 읽을 수 있게 구성한다.

1. **장애 범위**: 장비 사용 불가 또는 휴진, 날짜와 시간, 후보 검색 일수
2. **요약 지표**: 영향 예약, 후보 있음, 후보 없음, 처리 완료 수
3. **재배정 작업 목록**: 공개용 예약 참조, 현재 상태, 후보 수, 다음 작업
4. **선택 예약 상세**: 후보 날짜, 시간, 담당 의료진 참조, 우선순위
5. **작업 경계**: `후보로 재배정`, `자동 재배정`, `후보 없음 별도 처리`와 현재
   확정 경로가 즉시 새 `CONFIRMED`를 만든다는 안내

`환자 동의 완료`나 `보상 지급` 버튼은 현재 구현 기능처럼 넣지 않는다. 대신 화면 아래의
`운영 보완이 필요한 경계`에 “고객 연락·동의 증빙을 별도 제안 단계로 연결해야 함”이라고
표시한다. 이 영역은 구현된 버튼과 색·배경을 다르게 해 로드맵임을 구분한다.

### 5.2 빈 상태와 실패 상태

| 상황 | 화면 문구 | 다음 작업 |
| --- | --- | --- |
| 영향 예약 없음 | `해당 범위에 변경할 예약이 없습니다` | 범위 확인 후 종료 |
| 후보 없음 | `대체 시간을 찾지 못했습니다` | 자동 확정 금지, 별도 연락·수동 일정 검토 |
| 사전 조회 뒤 예약 변경 | `예약 정보가 바뀌어 일괄 처리를 시작하지 못했습니다` | 최신 목록과 버전 재조회 |
| 후보 선택 중 동시 변경 | `선택한 후보 또는 원래 예약이 변경됐습니다` | 확정 결과로 보지 않고 후보 재조회 |
| 스트림 중단 | `처리 결과 수신이 중단됐습니다` | 이미 커밋된 예약과 미처리 예약을 다시 대조 |
| 오래된 Solver 결과 | `현재 예약 버전과 맞지 않아 적용하지 않았습니다` | 현재 상태와 버전을 다시 읽고 계산 |

### 5.3 공개 화면의 개인정보 경계

- 환자 이름과 전화번호를 넣지 않는다.
- 내부 테넌트·병원 식별자를 공개용 시안의 핵심 정보로 사용하지 않는다.
- 실제 API가 숫자 예약 ID를 사용하더라도 시안은 `예약 A-1042`처럼 익명화한 참조를
  사용한다.
- 운영 지표의 숫자는 예시라고 밝히고 실제 병원의 장애 건수로 보이게 만들지 않는다.
- 오류 문구에는 내부 예외 원문, SQL, 토큰, 상관관계 ID 전체를 노출하지 않는다.

## 6. 기술 다이어그램 계약

### 6.1 시퀀스 범위

다이어그램은 휴진 재배정의 실제 경로 하나를 중심으로 그린다.

```text
STAFF
  → 재배정 화면/API
  → 활성 예약·version 사전 확인
  → 트랜잭션 밖 후보 계산
  → 쓰기 직전 상태·version 재확인
  → PENDING_RESCHEDULE + 이력 + 상태 이벤트 + 후보 저장
  → STAFF 후보 선택 또는 자동 재배정
  → 대체 예약 CONFIRMED + 원본 RESCHEDULED + 선택 후보 + 알림 아웃박스
  → 최종 상태 결정
```

`최종 상태 결정`은 성공만 가리키지 않는다. `후보 준비`, `영향 예약 없음`, `조회 기준
충돌`, `후보 없음`, `재배정 완료`, `동시 변경으로 미완료`를 명시적인 종료 결과로
분리한다. 수평 점선만 남겨 의미를 추측하게 하지 않는다.

본문의 주 시퀀스는 전체 조회 기준 상태와 버전을 재확인하는 동기 일괄 경로를 사용한다.
예약별 진행률 스트림은 우측 보조 카드에서 `예약별 커밋 → SSE 진행률 → 중단 뒤 재조회`로
표시해, 두 저장 경계를 한 선으로 합치지 않는다.

장비 충돌 탐지와 Solver version fence는 본 흐름에 합치지 않고 하단의 `별도 경계`
카드로 둔다. 장비 경로는 충돌 목록을 반환하는 데서 끝나며, Solver 경로는 별도 계산
결과를 원자적으로 적용하거나 전부 되돌리는 경계임을 한 문장씩 적는다.

### 6.2 배치와 연결선

- 제목 아래에 범위와 사실성 표지를 작은 배지 행으로 둔다. 별도 scope/version 카드가
  본문 카드 사이에 떠 있거나 연결선을 가리지 않게 한다.
- 모든 참여자와 처리 카드는 같은 세로 그리드에 맞춘다.
- call line과 label 사이에 충분한 세로 공간을 두고, label을 선 위에 겹쳐 놓지 않는다.
- 카드 사이 기본 세로 간격은 최근 시리즈보다 좁아지지 않게 하고, 마지막 카드 아래에도
  넉넉한 여백을 둔다.
- 굽은 연결선은 방향을 읽을 수 있는 둥근 직각 경로를 사용한다. 카드 경계를 향하는
  짧은 사선이나 임의의 곡선은 사용하지 않는다.
- 화살촉과 연결선은 같은 색을 사용한다.
- 실선은 명령·상태 변경, 점선은 조회 결과·참조·설명에만 사용한다.
- 연결선은 카드나 label을 통과하지 않고 정확한 endpoint에 닿아야 한다.

### 6.3 의미 원장

기술 다이어그램은 semantic ledger에 다음 불변식을 기록한다.

- 모든 현재 구현 단계는 위 근거표의 소스 경로와 연결된다.
- `PENDING_RESCHEDULE` 전환과 후보 저장은 같은 쓰기 경계다.
- 확정 성공은 새 `CONFIRMED`와 원본 `RESCHEDULED`를 함께 만든다.
- 고객 동의 단계는 현재 재배정 확정 시퀀스에 존재하지 않는다.
- 장비 충돌 탐지와 Solver 적용은 별도 경계다.
- 종료 결과는 모두 `최종 상태 결정` 노드로 연결된다.
- 한국어·영어 자산은 같은 노드, 상태, 숫자, 분기를 사용한다.

## 7. Hero와 시각 자료 파일

### 7.1 Hero

기존 시리즈의 밝은 3D 미니어처와 흰색·파란색 로봇 운영자 스타일은 유지한다.
장비 고장 경고가 붙은 레이저 장비, 영향 예약 카드 묶음, 대체 시간 보드, 이를
연결하는 STAFF 작업대를 한 장면에 배치한다. 이전 패키지 실행 글의 상품 카드·그래프
구도와 대기 목록 글의 조치 큐 구도를 반복하지 않는다. Hero 안에는 읽어야 하는 작은
문자나 실제 병원 표식을 넣지 않는다.

### 7.2 자산 계획

- 공통 hero: `public/assets/clinic-appointment-disruption-recovery-hero.png`
- 기술 시퀀스:
  `public/assets/clinic-appointment-disruption-recovery-01-{ko,en}.{svg,png}`
- STAFF 운영 화면:
  `public/assets/clinic-appointment-disruption-recovery-staff-ui-{ko,en}.{svg,png}`
- 다이어그램 원본·의미 원장:
  `docs/diagrams/clinic-appointment-disruption-recovery/`
- 결정적 자산 생성기:
  `scripts/generate-clinic-appointment-disruption-recovery-assets.mjs`

본문은 PNG를 표시하고 원본 크기 보기(lightbox)를 적용한다. SVG는 구조·의미 감사와
선명한 원본 보존에 사용한다. UI 시안도 기술 다이어그램과 같은 확대 방식을 적용한다.

## 8. 한국어·영어 작성 규칙

- 한국어 글을 먼저 작성한다. `변경을 적용한다`, `후보를 확인한다`, `다시 조회한다`처럼
  주체와 작업이 드러나는 문장을 쓴다.
- `예약을 복구한다`만 반복하지 않고, 문맥에 따라 `영향 예약을 찾는다`, `대체 시간을
  계산한다`, `재배정을 확정한다`, `원래 예약과 새 예약을 연결한다`로 풀어 쓴다.
- `snapshot`은 독자 설명에서 `기준 데이터` 또는 `조회 시점의 예약 상태와 버전`으로
  풀어 쓰고, 코드 이름을 설명할 때만 영문 식별자를 병기한다.
- 기존 경로를 설명할 때는 `legacy`라고 줄이지 않고 `현재 재배정 API의 기존 경로`라고
  풀어 쓴다.
- 영어 글은 한국어 문장을 직역하지 않는다. 같은 시나리오, 기술 주장, 표, 숫자,
  시각 자료, 링크와 시리즈 순서를 유지하는 영어 기술 문서로 다시 쓴다.
- 본문에는 “특정 커밋의 소스를 대조해 작성했다”는 제작 메타 설명을 넣지 않는다.

## 9. 현재 상태를 구분하는 표

본문 끝부분에는 다음 구분을 그대로 유지한다.

| 구분 | 포함할 내용 |
| --- | --- |
| **현재 구현** | 휴진 영향 예약 확인, 동기 일괄 저장과 예약별 진행률 스트림, 후보 계산, `PENDING_RESCHEDULE`, 수동·자동 확정, 상태 이력, 알림 아웃박스 연결, 장비 충돌 미리보기, Angular 관리 화면, Solver version fence, 병원 책임 신뢰도 제외 |
| **현재 구현된 정책 모델** | 기존 확정 방문 약속 보호, 자동 대체 제안 여부와 제안 시간 한도, 고객 동의 전 원래 약속 보존. 단, 현재 재배정 API의 기존 확정 경로에는 아직 연결되지 않음 |
| **운영 준비** | 실제 병원 허용 범위, 알림 전달 결과, 중단 뒤 대조 절차, 후보 없음 상담 절차, 복구 훈련과 경보 기준 |
| **후속 개선** | 기존 재배정 API를 제안·고객 동의·확정 단계로 나누기, 장비 충돌에서 재배정 작업을 만드는 명시적 연결, 복구 크레딧 승인 흐름 통합 |

## 10. 대상 파일과 시리즈 연결

- 한국어 글: `src/content/docs/ko/blog/clinic-appointment-disruption-recovery.mdx`
- 영어 글: `src/content/docs/blog/clinic-appointment-disruption-recovery.mdx`
- 시리즈 목록: `src/data/clinic-appointment-series.mjs`
- 시리즈 테스트: `tests/ecosystem/clinic-appointment-series.test.mjs`

시리즈 탐색은 운영 확장 2인 `예약 우선순위는 누구의 규칙인가` 다음에 이번 글을
배치한다. 다음 글은 운영 확장 4인 `CRM 프로필과 예약 재평가의 경계`로 연결한다.
한국어·영어의 분류 번호, 이전·다음 링크와 카드 순서는 같아야 한다.

## 11. 검증 계획

### 11.1 문서와 사실

- 현재 동작을 설명하는 모든 문장을 기준 소스와 다시 대조한다.
- `ClosureRescheduleService`, `EquipmentUnavailabilityService`, `SolverService`의 경로가
  서로 섞인 문장을 검색한다.
- `고객 동의`, `확정 방문 약속 보호`, `복구 크레딧`을 현재 재배정 완료 기능으로
  오해할 표현이 없는지 확인한다.
- 한국어 용어집과 최근 Clinic Appointment 글의 용어를 대조한다.
- 한국어 글을 처음부터 끝까지 소리 내어 읽을 수 있는 자연스러운 문장으로 교정한다.

### 11.2 시각 자료

- 기술 다이어그램 semantic ledger와 한·영 자산 쌍을 검사한다.
- 연결선 endpoint, 둥근 직각 경로, 화살촉 색, label과 call line 간격을 감사한다.
- SVG와 2배 PNG를 원본 크기로 열어 글자 잘림, 작은 글씨, 빈 화면, 카드 하단 여백을
  확인한다.
- UI 시안의 숫자·상태·버튼이 본문과 일치하고, 실제 운영 화면 캡처가 아니라는 표시가
  보이는지 확인한다.
- 다크·라이트 본문에서 hero, 다이어그램, UI 시안과 확대 보기를 확인한다.

### 11.3 사이트

- `git diff --check`
- 시리즈 대상 테스트와 `npm test`
- `npm run build`
- 한국어·영어 경로와 모든 `/assets/...` 응답 확인
- 로컬 미리보기에서 두 글, 시리즈 이전·다음 링크, hero 중복 여부, 크게 보기 확인

## 12. 완료 기준

- [x] 주 독자를 STAFF로 고정하고 개발자·PO·병원 관계자가 함께 읽을 수 있는 목적을
  정했다.
- [x] 구현 6과 겹치지 않는 운영 화면 중심의 서사 흐름을 정했다.
- [x] 현재 재배정 경로, 고객 동의 정책 모델, 운영 준비, 후속 개선을 분리했다.
- [x] 현재 Angular 화면과 API를 근거로 한 운영 화면 시안을 정의했다.
- [x] 휴진 재배정 시퀀스와 장비·Solver 별도 경계를 정의했다.
- [x] 동기 일괄 처리와 예약별 진행률 스트림의 저장 단위를 구분했다.
- [x] 연결선, 화살촉, label, 수직 간격, 최종 상태 결정과 확대 보기 규칙을 정했다.
- [ ] 한국어·영어 원고와 시리즈 링크를 구현한다.
- [ ] hero, 기술 다이어그램, STAFF 운영 화면 자산을 만든다.
- [ ] 다이어그램 감사, 테스트, 빌드, 경로와 확대 보기 검증을 통과한다.
- [ ] PR 생성, 병합, 배포는 별도 승인 뒤 진행한다.

## 13. 제외 범위

- `clinic-appointment` 운영 코드를 변경하지 않는다.
- 실제 환자·병원 데이터나 운영 화면 캡처를 사용하지 않는다.
- 현재 재배정 API의 기존 경로에 고객 동의 단계를 새로 구현하지 않는다.
- 장비 충돌 탐지와 휴진 재배정을 코드로 자동 연결하지 않는다.
- 복구 크레딧 발급 기준이나 보상 금액을 새로 정하지 않는다.
- 이번 설계 승인만으로 PR, 병합, 배포를 진행하지 않는다.

## 14. 근거 링크

- [기존 구현 6 글](https://bluetape4k.github.io/ko/blog/clinic-appointment-part6-closure-equipment-rescheduling/)
- [예약 신뢰도 글](https://bluetape4k.github.io/ko/blog/clinic-appointment-booking-reliability/)
- [휴진 재배정 서비스](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/service/ClosureRescheduleService.kt)
- [장비 사용 불가 서비스](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/service/EquipmentUnavailabilityService.kt)
- [재배정 API](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-api/src/main/kotlin/io/bluetape4k/clinic/appointment/api/controller/RescheduleController.kt)
- [재배정 진행률 API](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-api/src/main/kotlin/io/bluetape4k/clinic/appointment/api/controller/RescheduleBatchStreamController.kt)
- [장비 사용 불가 API](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-api/src/main/kotlin/io/bluetape4k/clinic/appointment/api/controller/EquipmentUnavailabilityController.kt)
- [재배정 관리 화면](https://github.com/bluetape4k/clinic-appointment/blob/develop/frontend/appointment-frontend/src/app/features/management/reschedule-list/reschedule-list.component.ts)
- [장비 사용 불가 관리 화면](https://github.com/bluetape4k/clinic-appointment/blob/develop/frontend/appointment-frontend/src/app/features/management/equipment-unavailability-list/equipment-unavailability-list.component.ts)
- [Solver 결과 적용](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-solver/src/main/kotlin/io/bluetape4k/clinic/appointment/solver/service/SolverService.kt)
- [운영 장애 복구 정책](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/policy/OperationalSchedulingPolicies.kt)
- [예약 정책 검증기](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/service/SchedulingPolicyValidator.kt)
- [예약 신뢰도 책임 분류](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/reliability/BookingReliabilityModel.kt)
- [예약 신뢰도 판단기](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/service/reliability/BookingReliabilityEvaluator.kt)
- [대기 목록 복구 크레딧 API](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-api/src/main/kotlin/io/bluetape4k/clinic/appointment/api/controller/WaitlistOperationsController.kt)
