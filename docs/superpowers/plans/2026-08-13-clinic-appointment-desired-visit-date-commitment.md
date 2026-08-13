# 고객 희망 내원 날짜와 예약 확정 글 구현 계획

> 기준일: 2026-08-13
> 설계: `docs/superpowers/specs/2026-08-13-clinic-appointment-desired-visit-date-commitment-design.md`

## 목표

한국어 기술문서 초안과 로케일 대응 다이어그램을 완성하고, 한국어 글을 로컬에서
검토할 수 있게 띄운다. 영어 본문 현지화와 최종 배포는 한국어 내용 승인 뒤에 진행한다.

## Task 1: 근거와 용어 고정

- `clinic-appointment`의 `AppointmentCommitmentModel.kt`,
  `AppointmentCommitmentRequests.kt`, `DefaultAppointmentCommitmentApplicationService.kt`를
  확인한다.
- Issue #184, PR #197, 방문 commitment 설계와 profile 재평가 설계를 확인한다.
- 상태·행위에는 `예약 확정`, 결과의 실제 시간값에는 `확정된 예약일시`를 사용한다.
  `고객 희망 내원 날짜`, `제안`, `자원 점유`도 문서 전체에서 같은 표현을 유지한다.

## Task 2: 한국어 기술문서 작성

**파일:**

- `src/content/docs/ko/blog/clinic-appointment-desired-visit-date-and-confirmed-commitment.mdx`
- `src/content/docs/ko/blog/clinic-appointment-execution-bom-to-appointment-plan.mdx`

**작업:**

- 환자 A 사례로 시작하되 상태 의미, 검증 불변식, 동의 경계, 기존 확정 보호를 본문
  중심으로 쓴다.
- 앞 글의 다음 글 표현을 `고객 희망 내원 날짜`로 수정하고 새 글로 연결한다.
- 새 글의 시리즈 링크에서 Part 1 바로 앞에 현재 글을 배치한다.

## Task 3: 시각 자료 작성

**파일:**

- `public/assets/clinic-appointment-desired-visit-date-commitment-sequence-01-{ko,en}.svg`
- `public/assets/clinic-appointment-desired-visit-date-commitment-sequence-01-{ko,en}.png`
- `public/assets/clinic-appointment-commitment-responsibility-boundaries-01-{ko,en}.svg`
- `public/assets/clinic-appointment-commitment-responsibility-boundaries-01-{ko,en}.png`
- `docs/review/2026-08-13-clinic-appointment-desired-visit-date-commitment-*.semantic.json`

**작업:**

- 환자 A의 요청부터 확정까지를 시퀀스 다이어그램으로 표현한다.
- 고객 채널, 예약서비스, 병원 운영, 자원 원장, 임상서비스의 책임 경계를 표현한다.
- 연결선은 양의 진행 방향, 충분한 화살촉, 둥근 직교 꺾임, 카드 비침범을 지킨다.
- SVG를 원본으로 두고 CairoSVG 2배 렌더링으로 PNG를 만든다.

## Task 4: 기술문서와 시각 검증

- `$bluetape-writer` 체크리스트로 용어, 사실성 표지, 문단 목적, 근거 링크를 검토한다.
- `$bluetape-diagram`의 XML, 텍스트, connector, geometry, endpoint, mixed-corner,
  arrowhead, locale pair 검사를 수행한다.
- 모든 PNG를 원본 크기로 한 장씩 시각 검사한다.
- `git diff --check`, 관련 Node test, `npm run build`를 수행한다.

## Task 5: 로컬 검토 제공

- 로컬 개발 서버를 실행한다.
- 새 한국어 route가 HTTP 200인지 확인한다.
- 사용자가 바로 검토할 수 있는 URL과 변경 파일, 검증 결과, 남은 승인 게이트를 보고한다.

## 완료 조건

- [x] 한국어 기술문서 초안이 구현·설계 근거와 모순되지 않는다.
- [x] `고객 희망 내원 날짜` 표현이 일관된다.
- [x] 두 다이어그램의 한국어·영어 asset pair가 정적·시각 검사를 통과한다.
- [x] 사이트 build와 한국어 route 확인이 통과한다.
- [x] 로컬 검토 URL을 제공한다.
- [x] 영어 본문과 배포는 한국어 승인 전까지 진행하지 않는다.
- [x] 한국어 승인 후 영어 본문을 현지화하고 양쪽 시리즈 탐색 링크를 동기화한다.

## 검증 기록

- `npm run build`: 통과, 2,466개 페이지 생성
- 한국어 route: `HTTP 200`
- 화살촉 수정 전: 역할별 marker 감사 자체는 통과했지만, 2,200px 캔버스가 본문 폭으로
  축소될 때 `16x16`, `14x14`, `10x10` 머리의 방향 식별성이 부족했다.
- 화살촉 수정 후: 역할별 marker 규격은 유지하고 실제 가시 크기를 시퀀스 `32x32`,
  주 흐름 `28x28`, 보조 관계 `30x30`으로 확대했다. 시퀀스는 markers 5,
  direction/terminal checks 11/11, 책임 경계는 markers 2, checks 6/6,
  failures 0이며 네 PNG의 원본 크기와 본문 축소 크기 눈 검사를 통과했다.
- 관련 Node test: 전체 199건 중 196건 통과. 영어 본문을 아직 작성하지 않아 로케일
  쌍과 태그 일치 검사 2건은 승인 후 현지화 단계까지 보류한다. 함께 실패한 Pagefind
  fixture는 격리 재실행에서 8건 모두 통과해 새 글과 무관한 일시적 실패로 확인했다.
- 한국어 승인 후 영어 본문과 영어 다이어그램 연결을 추가했으며, 양쪽 시리즈에서
  프롤로그부터 현재 글까지의 탐색 링크를 같은 순서로 맞췄다.
