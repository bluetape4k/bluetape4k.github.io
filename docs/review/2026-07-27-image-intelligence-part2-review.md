# 이미지 인텔리전스 Part 2 최종 검토

## 검토 범위

- 한국어 글:
  `/ko/blog/image-intelligence-part2-input-qualification-and-single-decode/`
- 영어 글:
  `/blog/image-intelligence-part2-input-qualification-and-single-decode/`
- 대표 이미지 1개와 언어별 기술 다이어그램 2종
- Part 1에서 Part 2로 이어지는 한·영 시리즈 링크
- 근거 문서:
  `docs/review/2026-07-27-image-intelligence-part2-claim-ledger.md`

## 한국어 문체 검토

기술 문서의 격식은 유지하면서 번역투와 불필요한 영문 표현을 교정했다.

| 검토 기준 | 적용 결과 |
|---|---|
| 주어와 서술어 | 대명사인 `전자`를 없애고 입력 판정의 주체를 명시했다. |
| 기술 문서 용어 | `값싼 검사`를 `저비용 검사`로, `비싼 작업`을 `고비용 작업`으로, 다이어그램의 `값싼 거절`을 `조기 거부`로 바꿨다. |
| 기술 용어 | API, 클래스, 오류 코드, MIME, 픽셀 예산, 코루틴 취소 같은 기술 의미는 유지했다. |
| 불필요한 영문 | 일반 문장 속 `workflow`, `image backend`, `리사이즈`를 `워크플로`, `이미지 백엔드`, `크기 조정`으로 정리했다. |
| 의미의 정확성 | `전체 크기`를 `전체 픽셀 수`로 고쳐 압축 바이트 크기와 혼동하지 않도록 했다. |

교정 과정에서 수치, 식별자, 명령, 링크, 오류 코드와 기술 주장은 변경하지
않았다.

## 한·영 동등성

| 항목 | 한국어 | 영어 | 결과 |
|---|---|---|---|
| 경로 | `/ko/blog/...single-decode/` | `/blog/...single-decode/` | PASS |
| Part 번호 | Part 2 | Part 2 | PASS |
| 중심 주장 | 입력 자격 판정과 단일 디코딩 | Shared qualification and a single decode | PASS |
| 의사코드 | `qualify` 순서와 1회 디코딩 | 동일 | PASS |
| 표 | 자격/분석, 크기, 오류, 테스트, 비보장 범위 | 동일 | PASS |
| 수치 | 5 MiB, 8,192, 16,777,216 | 동일 | PASS |
| 소스 링크 | qualifier, test, service와 기존 글 | 동일한 영문 경로 | PASS |
| 다이어그램 | 한국어 PNG 2개 | 영어 PNG 2개 | PASS |
| 탐색 | Part 1 링크와 Part 3 예고 | 동일 | PASS |

## 검증 결과

| 항목 | 근거 | 결과 |
|---|---|---|
| 로컬 글 형태 | Part 1과 기존 OCR 글의 frontmatter, 본문 흐름, 자료 목록, 시리즈 탐색 비교 | PASS |
| 한국어 번역체 교정 | 문장별 자연스러움 검토와 의미 보존 확인 | PASS |
| 다이어그램 | XML, text hazard, CairoSVG 2배 변환, connector, endpoint, geometry, mixed-corner, 원본 크기 PNG 확인 | PASS |
| 한·영 동등성 | 경로, 주장, 링크, 표, 수치, 자산 대조 | PASS |
| 사이트 | `npm run build`, 한·영 경로, 이미지, 크게 보기 UI | PASS |

정적 빌드는 오류 없이 완료됐다. 최신 개발 서버에서 한·영 경로, 대표 이미지,
언어별 다이어그램 2개, 다이어그램 제목, 크게 보기 버튼과 확대 화면을 확인했다.
대표 이미지는 확대 대상에서 제외됐으며 브라우저 오류도 발견되지 않았다.
