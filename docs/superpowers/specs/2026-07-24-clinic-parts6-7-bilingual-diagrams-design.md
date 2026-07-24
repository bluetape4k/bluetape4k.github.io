# Clinic Appointment Part 6·7 한·영 다이어그램 분리 설계

## 목적

Clinic Appointment 시리즈 Part 6과 Part 7의 텍스트 포함 다이어그램을 한국어와 영어 자산으로 분리한다. 각 언어 페이지는 해당 언어로 읽을 수 있는 다이어그램을 제공하고, 렌더링된 PNG에서도 `bluetape-diagram`의 언어별 글꼴이 실제 글리프로 유지되게 한다.

## 범위

- Part 6 재배정 흐름 다이어그램의 SVG와 PNG를 한국어·영어 자산으로 분리한다.
- Part 7 개발 루프 다이어그램의 SVG와 PNG를 한국어·영어 자산으로 분리한다.
- 현재 영문 문구, 색상, 연결선과 정보 구조는 유지한다. 한국어 자산의 레이아웃은 의미를 온전히 전달하기 위해 필요한 범위에서 조정한다.
- 한국어 자산은 영문 자산의 자연스러운 한국어 번역으로 만들고 기술 식별자는 보존한다.
- 한국어·영어 MDX가 각각 올바른 PNG를 참조하도록 수정한다.
- 영문과 한국어 SVG의 글꼴 선언뿐 아니라 최종 PNG의 실제 글리프까지 검증한다.

다음 항목은 범위에 포함하지 않는다.

- Part 6·7 본문, frontmatter, hero 이미지, `alt`, `figcaption`의 문안 개편
- 다이어그램의 구조·크기·색상·연결 관계 재설계
- Part 1–5 다이어그램의 추가 현지화
- 새로운 시각 컴포넌트나 빌드 의존성 추가

## 자산 명명과 로케일 계약

기존 시리즈에서 확립한 규칙을 그대로 적용한다.

| Part | 한국어 SVG/PNG | 영어 SVG/PNG |
| --- | --- | --- |
| Part 6 | `clinic-appointment-part6-rescheduling-flow-01.svg/png` | `clinic-appointment-part6-rescheduling-flow-01-en.svg/png` |
| Part 7 | `clinic-appointment-part7-development-loop-01.svg/png` | `clinic-appointment-part7-development-loop-01-en.svg/png` |

- 접미사가 없는 자산은 한국어 페이지 전용이다.
- `-en` 접미사 자산은 영어 페이지 전용이다.
- 현재 영문 자산을 먼저 `-en` 원본으로 보존한 뒤, 접미사가 없는 자산을 한국어로 현지화한다.
- SVG와 PNG는 항상 같은 basename의 쌍으로 관리한다.
- 공개 경로는 절대 `/assets/...` URL을 사용한다.

## 글꼴 계약

### 영어 자산

- 제목과 주요 라벨: `Architects Daughter`
- 본문, 보조 설명과 기술 식별자: `Comic Mono`

현재 SVG의 CSS 선언이 이 계약과 같더라도 최종 PNG에서 대체 글꼴이 사용됐다고 가정하고 다시 렌더링한다. `fc-match`와 원본 크기 PNG 검토로 실제 글리프를 확인한다.

### 한국어 자산

- 한국어 제목, 주요 라벨, 본문과 보조 설명: `goorm Sans`
- 클래스명, 상태값, 서비스명, 약어와 영문 기술 식별자: `goorm Sans Code`

한 `<text>` 안에 한국어와 기술 식별자가 함께 있으면 `<tspan>`으로 기술 식별자 구간을 분리한다. 글꼴 fallback에 의존하지 않고 각 구간에 의도한 font-family를 명시한다.

### 렌더링

- 편집 가능한 canonical SVG에는 텍스트를 유지한다.
- 기본 렌더링은 CairoSVG `-s 2`를 사용한다.
- CairoSVG가 지정 글꼴을 대체하면 writable fontconfig cache를 갱신하고, librsvg로 텍스트를 glyph path로 해석한 중간 SVG를 만든 뒤 CairoSVG로 canonical PNG를 생성한다.
- glyph path 중간 산출물은 canonical SVG를 대체하거나 저장소에 커밋하지 않는다.

## 번역 계약

한국어는 영문 문장의 의미와 정보 계층을 유지하되 직역투를 피한다. 다음 식별자는 번역하지 않는다.

- 상태와 선택값: `REQUESTED`, `CONFIRMED`, `PENDING_RESCHEDULE`, `RESCHEDULED`, `SKIP`, `selected`
- 서비스와 도구: `SlotCalculationService`, `Solver`
- 기술 약어와 우선순위: `DB`, `SDK`, `P0/P1`
- 도메인 경계 용어: `tenant`

`selected`는 단독 상태값으로 쓰일 때 보존하고, 일반 문장 의미로 쓰일 때는 한국어로 설명한다. `tenant`는 본문 문맥과 일치하도록 영문 식별자를 유지한다.

## Part 6 문구

| 영어 원문 | 한국어 자산 문구 |
| --- | --- |
| Incidents create a workflow, not just a new date | 사건은 단순히 새 날짜가 아니라 워크플로를 만든다 |
| Closure automation and equipment conflict detection meet at an explicit operational decision boundary. | 휴진 자동화와 장비 충돌 탐지는 명시적인 운영 의사결정 경계에서 만난다. |
| CLINIC CLOSURE | 병원 휴진 |
| Implemented reschedule path | 구현된 재배정 경로 |
| Active appointments | 활성 예약 |
| REQUESTED · CONFIRMED · active states | REQUESTED · CONFIRMED · 활성 상태 |
| PENDING_RESCHEDULE + history | PENDING_RESCHEDULE + 이력 |
| Preserve why the original slot changed | 원래 시간대가 변경된 이유를 보존 |
| Persist ranked candidates | 순위가 매겨진 후보 저장 |
| SlotCalculationService · next 1–30 days | SlotCalculationService · 향후 1–30일 |
| Progress callback after DB transaction | DB 트랜잭션 이후 진행 콜백 |
| EQUIPMENT DOWNTIME | 장비 사용 불가 |
| Implemented detection path | 구현된 탐지 경로 |
| Unavailability rule | 사용 불가 규칙 |
| One-time · recurring · SKIP/RESCHEDULE | 일회성 · 반복 · SKIP/RESCHEDULE |
| Expand periods and find overlap | 기간을 펼쳐 겹침 탐색 |
| Preview before save or detect after save | 저장 전 미리보기 또는 저장 후 탐지 |
| Tenant-scoped equipment ownership guard | tenant 범위 장비 소유권 가드 |
| Return conflicting appointments | 충돌 예약 반환 |
| No automatic reschedule in this service | 이 서비스는 자동 재배정하지 않음 |
| DECISION BOUNDARY | 의사결정 경계 |
| Review, confirm, communicate | 검토, 확정, 소통 |
| Choose the execution path | 실행 경로 선택 |
| Ranked candidate or separate Solver run | 순위 후보 또는 별도 Solver 실행 |
| Confirm with tenant guards | tenant 가드로 확정 |
| New CONFIRMED appointment | 새 CONFIRMED 예약 |
| Original becomes RESCHEDULED · selected | 원본은 RESCHEDULED · selected |
| Publish and notify separately | 발행과 알림을 분리 |
| Current closure service does not emit it | 현재 휴진 서비스는 이를 발행하지 않음 |
| Operational invariant: commit state and candidate data before network progress; keep detection, approval, persistence, and notification as explicit boundaries. | 운영 불변조건: 네트워크 진행 전에 상태와 후보 데이터를 커밋하고, 탐지·승인·영속화·알림을 명시적인 경계로 유지한다. |
| A Solver result is a proposal until another workflow validates and persists it. | Solver 결과는 다른 워크플로가 검증하고 영속화하기 전까지 제안일 뿐이다. |

한국어 문구가 기존 카드 폭을 넘으면 번역을 축약해 의미를 줄이지 않는다. 자연스러운 한국어 문장과 정보 계층을 먼저 확정한 뒤 카드 폭·높이, 카드 사이 간격, 캔버스 크기와 연결선 좌표를 함께 조정한다. 줄바꿈은 의미 단위를 기준으로 사용하고, 카드 확장 후에도 글자 크기와 내부 여백을 기존 가독성 수준 이상으로 유지한다.

## Part 7 문구

| 영어 원문 | 한국어 자산 문구 |
| --- | --- |
| Done is a checkpoint in a living development loop | 완료는 살아 움직이는 개발 루프의 체크포인트다 |
| Review findings and production-shaped evidence become the next small, testable requirement. | 리뷰 결과와 운영 환경을 닮은 증거는 다음의 작고 검증 가능한 요구사항이 된다. |
| 01 · REQUIREMENTS | 01 · 요구사항 |
| Describe the observable need | 관찰 가능한 필요를 설명 |
| Behavior · boundary · acceptance evidence | 동작 · 경계 · 인수 증거 |
| 02 · DESIGN / PLAN | 02 · 설계 / 계획 |
| Choose the smallest safe change | 가장 작고 안전한 변경 선택 |
| Data · API · migration · verification | 데이터 · API · 마이그레이션 · 검증 |
| 03 · IMPLEMENTATION | 03 · 구현 |
| Keep boundaries explicit | 경계를 명시적으로 유지 |
| Tenant · transaction · event · dependency | tenant · 트랜잭션 · 이벤트 · 의존성 |
| 04 · TESTS / REVIEW | 04 · 테스트 / 리뷰 |
| Turn findings into evidence | 발견 사항을 증거로 전환 |
| Negative paths · compatibility · P0/P1 | 실패 경로 · 호환성 · P0/P1 |
| 05 · LESSONS | 05 · 교훈 |
| Record why the fix exists | 수정 이유를 기록 |
| Decision · rejected path · future guard | 결정 · 거부한 경로 · 향후 가드 |
| 06 · NEW REQUIREMENT | 06 · 새 요구사항 |
| Feed the learning back | 배운 내용을 다시 반영 |
| One review gap becomes one contract | 리뷰 공백 하나를 계약 하나로 전환 |
| OPERATIONAL INPUTS | 운영 입력 |
| Tenant isolation | tenant 격리 |
| Notification | 알림 |
| Database parity | 데이터베이스 호환성 |
| Performance / SDK | 성능 / SDK |
| Living specifications, plans, tests, review findings, and lessons keep the implementation aligned with what operations actually reveal. | 살아 있는 명세·계획·테스트·리뷰 결과·교훈은 구현이 운영에서 실제로 드러난 사실과 계속 일치하게 한다. |

## MDX 참조

| 페이지 | 참조할 PNG |
| --- | --- |
| `src/content/docs/ko/blog/clinic-appointment-part6-closure-equipment-rescheduling.mdx` | `/assets/clinic-appointment-part6-rescheduling-flow-01.png` |
| `src/content/docs/blog/clinic-appointment-part6-closure-equipment-rescheduling.mdx` | `/assets/clinic-appointment-part6-rescheduling-flow-01-en.png` |
| `src/content/docs/ko/blog/clinic-appointment-part7-review-and-operational-evolution.mdx` | `/assets/clinic-appointment-part7-development-loop-01.png` |
| `src/content/docs/blog/clinic-appointment-part7-review-and-operational-evolution.mdx` | `/assets/clinic-appointment-part7-development-loop-01-en.png` |

현재 한국어 MDX 경로는 유지하고 영어 MDX만 `-en` PNG로 변경한다. 기존 `alt`, `figcaption`, `data-diagram-title`은 수정하지 않는다.

## 작업 순서

한 자산씩 완료하고 검증하는 `bluetape-diagram` 규칙을 따른다.

1. Part 6 현재 영문 SVG를 `-en.svg`로 보존하고 영어 글꼴 계약을 적용한다.
2. Part 6 영어 PNG를 다시 렌더링하고 자동 감사와 원본 크기 검토를 마친다.
3. Part 6 접미사 없는 SVG를 한국어로 번역하고 혼합 글꼴 구간을 분리한다.
4. Part 6 한국어 PNG를 렌더링하고 같은 검증을 마친다.
5. Part 6 영어 MDX를 `-en.png`로 전환한다.
6. Part 7에 같은 순서를 적용한다.
7. locale별 자산 참조와 전체 사이트 빌드를 검증한다.

## 검증

각 SVG/PNG 쌍에 대해 다음을 확인한다.

- SVG XML 파싱
- 글꼴 선언과 언어별 텍스트 감사
- 텍스트 잘림, 상자 이탈과 겹침 검사
- 연결선, 끝점과 혼합 모서리 검사
- SVG/PNG 쌍 존재와 2배 렌더 크기 확인
- `fc-match`로 지정 글꼴 해석 확인
- 원본 크기 PNG에서 실제 글리프, 대비, 줄바꿈, 정렬과 여백 검토
- 한국어 SVG에 번역되지 않은 일반 영문 문장이 남지 않았는지 확인
- 영어 SVG에 한국어 문자가 들어가지 않았는지 확인
- 한국어와 영어 다이어그램의 박스, 연결선과 의미 계층이 동일한지 확인

저장소 검증은 다음 순서로 수행한다.

1. `git diff --check`
2. 자산 참조 검색으로 한국어는 unsuffixed, 영어는 `-en`만 사용하는지 확인
3. 다이어그램 감사 스크립트
4. `npm run build`
5. Part 6·7의 한국어·영어 네 경로에서 이미지 로드와 크게 보기 확인

## 위험과 대응

- **한국어 문구가 카드 폭을 초과할 수 있다.** 의미를 축약하지 않고 카드와 필요한 주변 레이아웃을 확장한다. 변경된 카드에 맞춰 연결선 끝점, 카드 간격, 캔버스 경계와 2배 PNG 크기를 다시 검증한다.
- **SVG 선언과 PNG 실제 글리프가 다를 수 있다.** fontconfig 확인과 librsvg 중간 렌더링 경로로 대체 글꼴을 방지한다.
- **한 언어의 MDX가 반대 언어 자산을 참조할 수 있다.** basename 계약을 검색으로 검증하고 네 locale 경로를 직접 확인한다.
- **현지화 과정에서 연결선이나 정보 구조가 바뀔 수 있다.** 영어 자산의 의미 구조를 기준선으로 삼되, 한국어 의미 전달과 가독성에 필요한 카드·캔버스 확장은 허용한다. 연결 관계와 단계 순서는 변경하지 않는다.

## 완료 조건

- Part 6과 Part 7 각각에 한국어 unsuffixed SVG/PNG와 영어 `-en` SVG/PNG가 존재한다.
- 영어 PNG는 `Architects Daughter`와 `Comic Mono`, 한국어 PNG는 `goorm Sans`와 `goorm Sans Code`의 실제 글리프를 사용한다.
- 한국어 다이어그램의 일반 설명은 한국어이고 보존 대상 기술 식별자는 원문과 일치한다.
- 한국어 문구를 카드 폭에 맞추기 위해 의미가 축약되지 않으며, 필요한 카드·캔버스 확장 후에도 글자 크기와 여백이 충분하다.
- 영어 다이어그램의 기존 의미와 구조가 유지된다.
- 한국어·영어 MDX가 각 locale 자산을 참조한다.
- 모든 다이어그램 감사, `git diff --check`, `npm run build`, 네 경로의 렌더링 확인이 통과한다.
