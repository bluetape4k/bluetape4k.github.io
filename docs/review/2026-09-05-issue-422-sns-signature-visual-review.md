# #422 SNS HTTP 서명 검증 시각 검토

## 스타일과 소스 계약

기존 Card, long-scroll interactive, Play animation, diagram을 비교했다. 이 주제는 parsing 성공과 신뢰 성공을 분리하고 조기 거부 순서를 따라가야 하므로 AWS Modulith의 긴 보안 경계 탐색형과 NATS JetStream의 dark sequence를 결합했다. Interactive explorer는 8개 상황을 단계별로 재생하며, 정적 자산은 동일한 data model에서 8단계 sequence와 두 fail-closed branch를 생성한다.

AWS source revision은 `f73f52e5497f3396d9ccc02c8acb1e3444986bc1`로 고정했다. 검토 중 source `develop`이 `5ea38f128bde0cb21c4d1f36635742be04c9dd7a`로 이동했지만 두 revision 사이 SNS 경로 diff가 없고 parser·verifier·resolver blob도 동일함을 다시 확인했다. 순서는 parse, exact `TopicArn` allowlist, certificate URL/host, certificate retrieval/cache와 X.509 chain, `SignatureVersion 1/2`, verified result, notification handler 또는 명시적 subscription confirmation이다. Allowlist 불일치는 certificate/network 전에 멈추고, malformed payload·certificate·signature failure는 handler와 confirmation에 도달하지 않는다.

## 브라우저 검증

- Chromium `151.0.7922.34`, viewport 1440×1080, deviceScaleFactor=1, locale=en-US, timezone=UTC, reducedMotion=reduce.
- 8개 상황 × 2개 언어 = **16개 terminal 상태 PASS**. 정상 v1 notification과 v2 confirmation은 `VERIFIED`, 나머지 6개 실패 상황은 `FAILED`와 단일 실패 row를 확인했다.
- Play 시작·정지·자동 종료, Reset, Enter 단계 선택과 focus 유지, End 이동, `Auto` 테마의 시스템 light/dark 반영 PASS.
- 390/768px × 2개 언어 × 2개 테마 = **8개 document overflow 검사 PASS**, JavaScript 오류 0.
- locale/theme 4개 화면을 각각 두 번 캡처했고 SHA-256이 일치했다. [브라우저 보고서](assets/issue-422/browser-report.json).
- PNG audit 4/4 PASS: EN 1440×2615, KO 1440×2570, alpha_min=255, bbox occupancy=0.968~0.969, margin imbalance=0.048~0.049.

| 언어 | Light | Dark |
| --- | --- | --- |
| English | [PNG](assets/issue-422/en.light.png) | [PNG](assets/issue-422/en.dark.png) |
| 한국어 | [PNG](assets/issue-422/ko.light.png) | [PNG](assets/issue-422/ko.dark.png) |

[EN 모바일](assets/issue-422/en.light.mobile.png), [KO 모바일](assets/issue-422/ko.dark.mobile.png).

## 정적 자산 검증

- 한·영 SVG와 semantic ledger 생성기 `--check` PASS. 각 ledger는 sequence nodes=8, edges=7, branches=2, loops=0, diagnostics=0이다.
- Sequence style, arrowhead, connector, endpoint, geometry, mixed-corner, XML text 감사 PASS. connector=8, direction/terminal checks=8, intrusion/crossing/shared segment=0, text_hazards=0이다.
- CairoSVG 2배 렌더링 PNG는 3600×7640, alpha_min=255, bbox occupancy=0.956, margin imbalance=0이다. 전체 크기로 한·영 PNG를 열어 glyph, participant header, branch frame, source note를 확인했다. [정적 감사 결과](assets/issue-422/static-audits.txt).
- Wave2 asset pair 16개, README PNG 참조 16개, 누락·중복·SVG embed 0.

[EN 정적 PNG](../../public/assets/visual-companions/wave2/aws-sns-signature-verification-en.png), [KO 정적 PNG](../../public/assets/visual-companions/wave2/aws-sns-signature-verification-ko.png).

## 발견 사항과 수정

Sequence 감사에서 branch frame의 표준 `.alt` class 누락을 발견해 생성 원본을 고쳤다. 실제 Chromium 검증에서는 `Auto` 테마가 시스템 설정을 반영하지 않는 결함을 발견했다. `:root:not([data-theme])` light media query와 생성 결과 회귀 검사를 추가한 뒤 browser matrix를 다시 통과시켰다.

독립 시각 검토는 첫 판정에서 P1 2건과 P2 1건을 찾았다. EN 정적 VERIFIED 카드의 마지막 문장이 경계 밖으로 내려갔고, 모바일 sequence의 가로 스크롤 단서가 없었으며, KO 모바일 hero의 마지막 음절이 홀로 줄바꿈됐다. 카드 높이, locale별 스크롤 안내, 모바일 `word-break: keep-all`과 제목 크기를 생성 원본에서 수정하고 테스트·캡처·PNG 감사를 반복했다. 같은 검토자의 재판정은 **P0/P1/P2 모두 0**이며 세 항목이 해결됐음을 확인했다. [lesson](../lessons/2026-09-05-issue-422-generated-visual-contracts.md)에 실패한 가정과 예방 규칙을 기록했다.

독립 source 검토는 첫 판정에서 정상 `SignatureVersion 2` 상황에 `notification-handler`가 포함되는 P2 1건을 찾았다. 성공 경로를 전체 배열의 선형 `slice`로 만들면서 상호 배타적인 두 terminal을 함께 통과한 것이 원인이었다. 공통 검증 단계 뒤 선택한 terminal 하나만 추가하도록 경로 투영을 바꾸고, unit test와 Chromium 검증에 반대 terminal이 muted 상태인지 확인하는 부정 assertion을 추가했다. 수정 후 독립 재검토는 **P0/P1/P2 모두 0**, targeted test 6/6 PASS였다. 독립 검토 환경에는 Playwright package가 없어 브라우저 재실행이 PENDING이었지만, leader 환경의 최신 Chromium 행렬은 같은 assertion을 포함해 PASS했다.

## 재현과 한계

```sh
node scripts/generate-2-0-wave2-aws-sns-signature.mjs --check
node scripts/generate-2-0-wave2-aws-sns-signature-visuals.mjs --check
PLAYWRIGHT_MODULE=file:///opt/homebrew/lib/node_modules/@playwright/test/index.mjs node scripts/verify-aws-sns-signature-browser.mjs
```

다른 환경에서는 설치한 Playwright module 경로를 지정한다. 새 dependency는 추가하지 않았다. 실제 AWS SNS 전달과 backend Kotlin 테스트는 실행하지 않았고, pinned 구현과 기존 fixture test를 읽어 계약을 대조했다. 설치된 `visual-verdict` skill이 없어 main PNG 검토와 Chromium 수치 검증을 사용하고 `.omx/state/issue-422/ralph-progress.json`에 판정을 기록했다. 전역 Codex/OMX 설정을 바꾸지 않아 전역 self-audit와 ChezMoi parity는 미적용이다.

## 최종 통합 검증

- `npm test`: 288/288 PASS, 실패·취소·누락 0.
- `npm run build`: 분기 수정 후 다시 실행해 3,779 pages, Pagefind 5,017 HTML, analytics 56/56, Astro check 0 errors / 0 warnings / 기존 unused parameter hints 3개.
- 첫 최종 build는 추적 중인 기존 usage-billing PNG를 `dist`로 복사하는 순간 일시적인 `ENOENT`가 발생했다. source blob `fc83c6aca6e47d671651fcb7df2aa0e38aa4da46`의 존재와 변경 없음이 확인된 상태에서 같은 명령을 다시 실행해 3,779 pages와 analytics 56/56을 정상 완료했다.
- Manual 9개 저장소, companion 5개 저장소 / 17개 문서 / 34개 locale asset PASS.
- 최종 dist의 한·영 companion·catalog·AWS 1.0 manual·SVG/PNG를 loopback HTTP로 검증: 10/10 PASS. [HTTP 보고서](assets/issue-422/http-report.json).
- Shared Wave2와 SNS HTML·SVG 생성기 `--check`, `git diff --check` PASS. 한국어 기술 용어 감사 대상 6개 파일에서 발견 0건이다.
