# 이미지 인텔리전스 Part 1 최종 검토

## 검토 기준

- 구현 근거: `bluetape4k-image` `develop`의 Spring Boot Image Intelligence API
- 한국어 글: `/ko/blog/image-intelligence-part1-multi-analysis-boundaries/`
- 영어 글: `/blog/image-intelligence-part1-multi-analysis-boundaries/`
- 공개 범위: PR 생성까지. 병합과 배포는 제외한다.

## 사실과 표현 검토

| 항목 | 결과 | 확인 내용 |
|---|---|---|
| 입력 자격 판정 | PASS | OCR 가능성이나 QR 존재 여부와 구분해 설명했다. |
| 단일 디코딩 | PASS | 자격을 통과한 입력을 `ImmutableImage`로 한 번 디코딩한다고 설명했다. |
| 병렬 처리 | PASS | OCR·객체 검출·QR을 독립 작업으로 설명했다. |
| 작업 성공 의미 | PASS | `WorkReport.Success`와 분석 결과의 `Completed`를 구분했다. |
| 부분 실패 | PASS | `Empty`, `Unavailable`, `Failed`를 합치지 않았다. |
| 집계와 정책 | PASS | `COMPLETED/PARTIAL/FAILED`와 `ALLOW/MANUAL_REVIEW/REJECT/QUARANTINE`을 별도 책임으로 설명했다. |
| 취소 전파 | PASS | 상위 coroutine 취소를 경로별 실패로 바꾸지 않는다고 설명했다. |
| 예제의 한계 | PASS | fixture OCR·검출과 실제 ZXing의 차이, production ML detector 비포함을 밝혔다. |

- 사실 검증: P0 0건, P1 0건
- 기존 OCR·입력 경계·이미지 backend 글의 내용을 반복하지 않고 필요한 문맥만 요약한 뒤 링크했다.
- 현재 HTTP 계약에 없는 검출·QR 좌표 필드는 결과 계약 다이어그램에 추가하지 않았다.

## 한국어 문장 검토

| 기준 | 결과 |
|---|---|
| 도입부에서 방문증 시나리오와 글의 목적을 먼저 설명한다. | PASS |
| 기술 용어를 불필요하게 영어로 나열하지 않는다. | PASS |
| 긴 문장은 의미 단위로 나누고 주어와 서술어를 가깝게 둔다. | PASS |
| 상태와 코드 식별자는 원문 표기를 유지한다. | PASS |
| 기획자도 이해할 수 있도록 분석 사실과 업무 결정을 사례로 구분한다. | PASS |
| 자료 목록은 독자가 이어서 읽을 구현 코드와 글만 제공한다. | PASS |

한국어 자연스러움 KO-01~KO-06: PASS

## Locale parity

| 항목 | 한국어 | 영어 | 결과 |
|---|---|---|---|
| route | `/ko/blog/image-intelligence-part1-multi-analysis-boundaries/` | `/blog/image-intelligence-part1-multi-analysis-boundaries/` | PASS |
| heading 수 | 10 | 10 | PASS |
| 기술 다이어그램 | 3 | 3 | PASS |
| `bluetape4k-image` source link | 7개 대상 | 같은 7개 대상 | PASS |
| 집계 상태 | `COMPLETED/PARTIAL/FAILED` | 동일 | PASS |
| 다음 Part 안내 | Part 2~7 | Part 2~7 | PASS |

## 다이어그램 검토

| 다이어그램 | 한국어 | 영어 | PNG 원본 검수 |
|---|---|---|---|
| 방문증 분석 영역 | PASS | PASS | 3600×2160 |
| 결과 계약과 정책 | PASS | PASS | 4000×2200 |
| 전체 처리 흐름 | PASS | PASS | 3600×5220 |

- 3종 × 2 locale의 SVG와 PNG가 모두 존재한다.
- SVG text normalize, connector, geometry, endpoint, mixed-corner 검사를 통과했다.
- 전체 처리 흐름은 위에서 아래로 읽히며 OCR·객체 검출·QR을 같은 수준의 병렬 경로로 표현한다.
- 영문 route에서 기술 다이어그램 3개에 크게 보기 버튼과 명시적 제목이 제공된다.
- 크게 보기에서 영문 방문증 다이어그램의 3600×2160 PNG와 제목을 확인했다.
- 대표 이미지는 크게 보기 대상에서 제외된다.
- 브라우저 폭 1265px에서 문서의 가로 overflow가 없다.

## 빌드와 테스트

- `npm run build`: PASS, 1301 pages
- 한국어·영어 정적 route: PASS
- Part 1 asset 13개: 대표 이미지 1개, 다이어그램 SVG/PNG 12개
- `npm test`: PASS, 146 tests
- `git diff --check`: PASS

첫 테스트 실행에서 새 다이어그램 stem 3개 때문에 고정된 locale 자산 수 검사가 실패했다. 기대값을
159개에서 162개로 갱신한 뒤 대상 테스트와 전체 테스트를 다시 실행해 통과했다. 같은 실행에서 일시적으로
실패한 격리 Pagefind 검사는 단독 재현과 전체 재실행에서 모두 통과했다.

## 알려진 한계

- 예제는 production ML detector runtime을 번들하지 않는다. 실제 애플리케이션이 `ImageDetector` 구현과
  품질 측정, 모델 버전 관리, 드리프트 감시를 제공해야 한다.
- 이번 변경은 Part 1 한·영 글과 시각 자료만 다룬다. Part 2~7 본문은 후속 작업이다.
