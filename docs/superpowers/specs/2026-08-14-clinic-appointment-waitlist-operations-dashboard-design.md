# 대기 목록 운영 화면과 조치 큐 글 설계

> 기준일: 2026-08-14
> 대상 시리즈: `clinic-appointment`
> 작업 유형: Type E 기술문서
> 선행 글: [대기 목록은 이름표가 아니라 상태 머신이다](/ko/blog/clinic-appointment-waitlist-core/)

## 1. 독자와 목적

주 독자는 같은 병원의 `STAFF`다. 개발자는 화면이 어떤 API·상태·불변식을 드러내야
하는지, PO와 병원 관계자는 어떤 지표가 운영 판단을 돕는지를 참고한다.

이 글은 대기 후보를 더 많이 보여주는 방법을 설명하지 않는다. 운영자가 다음 질문에
답할 수 있는 화면 경계를 설명한다.

> 지금 병원에서 가장 먼저 확인할 대기 항목은 무엇이며, 이 운영자가 실행할 수 있는
> 다음 명령은 어디까지인가?

핵심 문장은 다음과 같다.

> **대기 목록 운영 화면은 상태 배지를 나열하는 목록이 아니라, 병원 상태를 요약하고
> 조치 우선순위를 정하며, 근거와 허용 명령을 한 항목에 묶는 조치판이다.**

## 2. 범위와 용어

- `STAFF`는 같은 병원 범위에서 대기 entry와 offer를 읽고, 허용된 confirm·decline 명령을
  실행하는 운영자다.
- `ADMIN` 전용 정책·제한·recovery credit·benefit 조정과 운영 강제 명령은 본문의 주
  흐름에서 제외하고 별도 경계로 표시한다.
- `조치 큐`는 상태를 다시 저장하는 테이블이 아니라, 현재 관측된 상태에서 운영자가
  확인하거나 명령을 실행해야 하는 작업의 정렬된 뷰다.
- `근거 패널`은 왜 이 항목이 선택됐는지를 설명하는 제한된 provenance다. 이름, 연락처,
  clinical note, 원시 policy score vector를 공개하지 않는다.
- `전송 결과 미확인`은 실제 구현의 `deliveryState=UNKNOWN`을 독자 문장에서 풀어 쓴
  표현이다. 알림 전송 성공이나 offer 수락으로 간주하지 않는다.
- `오래된 결정`은 version·expiry·decision freshness를 다시 확인해야 하는 상태를
  가리키며, 자동 성공을 뜻하지 않는다.

## 3. 서사 구조

한 병원의 같은 운영 시간대를 따라간다.

1. 취소로 vacancy가 생기고, 이미 발행된 offer 하나의 전송 결과가 `UNKNOWN`으로 남는다.
2. 다른 offer 하나는 만료 시각에 가까워지고, 한 hold는 reconcile 대기 상태가 된다.
3. 운영자가 entry 전체를 훑는 대신 상단 지표에서 병원 상태와 backlog를 확인한다.
4. 전체 폭 조치 큐에서 urgency와 age가 높은 항목을 선택한다.
5. 선택한 offer의 opaque ref, version, expiry, delivery state와 제한된 policy 근거를
   확인한 뒤, 화면이 허용한 confirm·decline 명령만 실행한다.
6. 같은 명령을 다시 보내거나 version이 오래된 경우 replay·processing·conflict 결과를
   새 상태로 해석하고, 전송 장애를 수락 성공으로 덮지 않는다.

화면은 “누가 1등인가?”보다 “무엇을 먼저 확인해야 하는가?”를 중심으로 읽힌다.

## 4. 화면 구조: A 형태

선택한 레이아웃은 다음 순서를 고정한다.

```text
병원 단위 지표 한 줄
        ↓
전체 폭 조치 큐
        ↓
선택 항목의 근거·현재 상태·허용 명령
        ↓
명령 결과(성공·처리 중·충돌·재큐)
```

### 4.1 상단 지표 한 줄

지표는 개별 환자나 offer를 식별하는 목록이 아니라 병원 운영 상태를 요약한다.

| 지표 | 화면 의미 | 코드 근거 |
| --- | --- | --- |
| `active offers` | 현재 열린 대기 offer 수 | `appointment_waitlist_active_offers` |
| `active holds` | 자원 hold가 남아 있는 수 | `appointment_waitlist_active_holds` |
| `expired backlog` | 만료 후 아직 정리되지 않은 backlog | `appointment_waitlist_expired_backlog` |
| `oldest vacancy age` | 가장 오래 기다린 vacancy의 경과 시간 | `appointment_waitlist_oldest_vacancy_seconds` |
| readiness | adapter/schema/policy와 backlog를 합친 운영 상태 | `UP`/`DEGRADED`/`OUT_OF_SERVICE` health |

지표 tag에는 tenant, member, entry, offer ID를 넣지 않는다. low-cardinality 상태와 병원
운영 규모만 관측해야 하며, 개별 식별자는 선택 항목의 상세 영역에서 opaque ref로
필요할 때만 사용한다.

### 4.2 전체 폭 조치 큐

조치 큐의 행은 “상태가 무엇인가”와 “운영자가 다음에 무엇을 해야 하는가”를 함께
표현한다.

| 큐 신호 | 기본 조치 | 자동 성공으로 해석하지 않는 이유 |
| --- | --- | --- |
| 만료 임박 | expiry·version을 확인하고 confirm 가능 여부 판단 | 시각이 지나면 `409 OFFER_EXPIRED`가 될 수 있음 |
| `deliveryState=UNKNOWN` | provider 결과와 offer 상태를 재확인 | notification delivery는 acceptance가 아님 |
| 오래된 결정 | policy/version·현재 slot을 재검증 | stale decision을 성공으로 승격할 수 없음 |
| stuck hold | hold·offer·vacancy를 reconcile 결과와 함께 확인 | DB fence가 최종 소유권을 결정함 |

정렬은 임의의 상태 문자열 순서가 아니라 urgency, age, expiry 임박도, 재시도 가능성,
correlation을 설명할 수 있는 결정적 규칙으로 만든다. 글에서는 구체적인 제품 UI 정렬
알고리즘을 발명하지 않고, 이 네 가지 조치 유형과 “왜 지금 보이는가”를 명시하는 데
집중한다.

### 4.3 선택 항목의 근거 패널

선택한 행은 다음의 최소 정보를 보여준다.

- `offerRef`, `entryRef`: 내부 정수 ID가 아닌 scope 검증된 opaque reference
- `version`, `expiresAt`, `status`, `deliveryState`: 현재 명령의 전제
- `policyVersion`, rank, 안정적인 reason category: 선택 순서를 설명하는 제한된 provenance
- `correlationId`, 마지막 결과와 retryable 여부: 장애·재시도의 연결 고리
- 역할에 따라 활성화된 명령과 금지된 명령

이름·전화번호·원문 상담 메모·JWT claim·provider exception text·원시 score vector는
패널에 넣지 않는다. “왜 선택됐는가?”를 설명하되 “누구의 민감정보를 더 보여줄 것인가?”
로 화면의 목적을 바꾸지 않는다.

## 5. 명령 경계와 결과 표현

STAFF 화면의 confirm·decline은 다음 계약을 전제로 한다.

- 기본 경로는 `/api/{tenantCode}/clinics/{clinicId}/waitlist`다.
- offer reference는 scope를 확인한 뒤 해석하고, 잘못된 종류·병원·형식은
  `404 WAITLIST_REFERENCE_NOT_FOUND`로 처리한다.
- 모든 mutation은 16–128자 출력 가능한 ASCII `Idempotency-Key`를 요구한다.
- 기존 row를 변경하는 명령은 `expectedVersion`을 함께 보낸다.
- 목록은 bounded keyset pagination이며 기본 50건, 최대 100건이다.

confirm 결과는 화면에서 다음처럼 표현한다.

| 응답 | 화면 의미 |
| --- | --- |
| `201` + `appointmentRef` | 하나의 replacement appointment가 만들어짐 |
| 같은 key·같은 요청의 `201` replay | 새 appointment를 만들지 않고 원 결과 재표시 |
| `202 IDEMPOTENCY_IN_PROGRESS` | 처리 중인 명령으로 표시하고 `Retry-After` 후 재조회 |
| `409 OFFER_EXPIRED`/`DECISION_STALE`/`SLOT_OCCUPIED` | 성공으로 덮지 않고 큐에 남기거나 다음 조치로 전환 |

`ADMIN` 전용 재큐·suppression·policy/adjustment 변경은 STAFF의 confirm·decline과 같은
버튼 묶음에 섞지 않는다. 권한이 없다는 사실도 화면의 명령 경계로 드러나야 한다.

## 6. 장애와 rollout 해석

`WaitlistDeliveryHealthIndicator`의 readiness는 다음 순서를 사용한다.

- 필수 adapter/schema/active policy가 없거나 failed job이 있거나 expired backlog가
  100을 초과하거나 oldest vacancy age가 5분을 초과하면 `OUT_OF_SERVICE`
- provider failure ratio가 5% 이상이거나 unknown delivery가 있거나 oldest vacancy age가
  2분 이상이면 `DEGRADED`
- 그 외에는 `UP`

이 값은 “새 dispatch를 지금 시작해도 되는가”를 판단하는 운영 신호이지, 개별 offer가
성공했다는 증명이 아니다.

`appointment.waitlist.delivery.enabled=false` 또는 clinic allowlist 밖인 경우에도 expiry,
notification suppression, stuck-hold reconcile은 계속 실행된다. 새 vacancy dispatch만
멈추는 것이므로, 화면은 `GLOBAL_OFF`·`CLINIC_DISABLED`를 “상태 데이터 삭제”로 표시하지
않는다.

## 7. 시각 자료

### 7.1 메인 운영 화면/흐름

`clinic-appointment-waitlist-operations-dashboard-01`이라는 이름으로 EN/KO 각각 SVG와
PNG를 만든다. 다이어그램은 다음 네 층을 수직으로 배치한다.

1. clinic readiness와 운영 지표
2. 전체 폭 action queue
3. 선택 item의 evidence panel
4. 허용 명령과 결과 decision(`replay`, `processing`, `conflict`, `requeue`)

연결선은 각 층의 실제 입력·출력만 연결한다. 지표에서 선택 item으로 내려가는 선은
“지표가 후보를 자동 확정한다”는 뜻이 아니라 “운영자가 큐의 우선순위를 읽는다”는
설명으로 분리한다. `OFFERED`에서 수평 점선으로 빠지는 모호한 연결은 사용하지 않고,
명시적인 `종료 상태 결정` 노드를 둔다.

### 7.2 보조 시퀀스

`clinic-appointment-waitlist-operations-command-01`이라는 이름으로 STAFF → UI/API →
DB fence/idempotency → 결과를 그린다. call line과 label은 서로 다른 수직 위치에 두고,
confirm 성공·동일 요청 replay·processing·stale/expired conflict를 분기한다.

### 7.3 시각 품질 규칙

- 생성 라벨은 EN/KO 모두 독자가 읽을 수 있는 짧은 문장으로 제한한다.
- 연결선과 화살촉은 같은 의미 층의 색을 사용하고, 점선은 “관측/참조”에만 사용한다.
- 수직 간격과 카드 하단 여백을 충분히 두어 call line·label·카드가 겹치지 않게 한다.
- SVG를 원본으로 만들고 CairoSVG scale 2로 PNG를 생성한다. full-size 렌더와 XML,
  semantic, connector, endpoint/geometry, arrowhead, visual, EN/KO asset-pair 감사를
  모두 통과한 PNG를 게시한다.

## 8. 사실성 표지와 공개 범위

- **현재 구현**: `WaitlistController`의 entry/offer 조회·confirm·decline 경로,
  `WaitlistOfferResponse`의 version/expiry/delivery state, health indicator, metrics,
  rollout properties, bounded scheduler가 `clinic-appointment` `develop` 소스에 존재한다.
- **승인된 설계/계약**: keyset cursor, opaque ref와 scope 404, idempotency replay,
  unknown delivery 비수락, rollout off에서도 expiry/suppression/reconcile을 계속하는
  규칙은 delivery API 계약·요구사항·설계 문서에서 확인한다.
- **운영 대기**: 특정 병원의 production allowlist 활성화, 실제 provider 장애 수치,
  staging 성능 기준 충족, canary와 복구 훈련 결과는 이 글의 증거가 없으므로 완료로
  표현하지 않는다.
- **공개 제한**: 실제 병원·환자·연락처·정책 내부값을 만들지 않고, 공개 API 이름·상태·
  reason code와 저장소 링크만 사용한다.

## 9. EN/KO 작성 규칙

- 한국어 글은 운영자의 판단 흐름을 중심으로 자연스럽게 쓴다. 번역투의 “상태를 관리한다”
  반복을 피하고 `확인할 항목`, `허용된 명령`, `재조회`처럼 행위를 명확히 쓴다.
- 영어 글은 같은 시나리오·섹션·표·다이어그램 의미를 유지하되 영어 기술 문체로 다시
  작성한다. 한국어 문장을 직역하지 않는다.
- 두 locale의 frontmatter, hero, 근거 링크, 시리즈 navigation, asset basename은 parity를
  유지한다.
- 공개 URL은 `/blog/clinic-appointment-waitlist-operations-dashboard/`와
  `/ko/blog/clinic-appointment-waitlist-operations-dashboard/`로 맞춘다.

## 10. 작성 품질 게이트

- [x] SPW-01: 주 독자 STAFF와 보조 독자 개발자·PO·병원 관계자를 고정했다.
- [x] SPW-02: A 형태의 지표 → 조치 큐 → 근거 → 명령 흐름을 고정했다.
- [x] SPW-03: STAFF 명령과 ADMIN 경계를 분리했다.
- [x] SPW-04: 현재 구현·승인된 계약·운영 대기를 구분했다.
- [x] SPW-05: unknown delivery, idempotency, version conflict, rollout off를 화면 의미와
  연결했다.
- [x] SPW-06: 메인 다이어그램과 보조 시퀀스의 연결선·종료 상태·레이블 간격 규칙을
  명시했다.
- [ ] SPW-07: EN/KO 글·asset pair·라우트·빌드 검증은 작성 단계에서 수행한다.

## 11. 근거 자료

- [clinic-appointment 저장소](https://github.com/bluetape4k/clinic-appointment)
- [대기 목록 전달 API 계약](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/api/waitlist-delivery.md)
- [대기 목록 전달 요구사항](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/requirements/waitlist-delivery.md)
- [대기 목록 전달 설계](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/superpowers/specs/2026-08-03-issue-170-waitlist-delivery-design.md)
- [WaitlistController](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-api/src/main/kotlin/io/bluetape4k/clinic/appointment/api/controller/WaitlistController.kt)
- [WaitlistResponses](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-api/src/main/kotlin/io/bluetape4k/clinic/appointment/api/dto/WaitlistResponses.kt)
- [WaitlistDeliveryHealthIndicator](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-api/src/main/kotlin/io/bluetape4k/clinic/appointment/api/waitlist/WaitlistDeliveryHealthIndicator.kt)
- [WaitlistDeliveryMetrics](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-api/src/main/kotlin/io/bluetape4k/clinic/appointment/api/waitlist/WaitlistDeliveryMetrics.kt)
- [WaitlistDeliveryScheduling](https://github.com/bluetape4k/clinic-appointment/blob/develop/appointment-api/src/main/kotlin/io/bluetape4k/clinic/appointment/api/waitlist/WaitlistDeliveryScheduling.kt)
