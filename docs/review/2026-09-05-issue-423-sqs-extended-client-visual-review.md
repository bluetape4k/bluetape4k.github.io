# #423 AWS SQS Extended Client 시각 검토

## 스타일과 소스 계약

기존 Card, long-scroll interactive, Play animation, diagram을 비교했다. 이 주제는 inline/offload 결정부터 restore, handler, acknowledgement, marker 검증, payload cleanup까지 시간 순서와 실패 위치를 함께 보여줘야 한다. 따라서 AWS Modulith의 긴 탐색형 화면, AWS SQS Reliability의 Play/Next/Reset 상호작용, AWS Streams의 순차 정적 diagram을 결합했다. Interactive explorer는 9개 상황을 9단계 lifecycle에 투영하고, 정적 자산은 같은 data model에서 5개 participant와 ordered cleanup sequence를 생성한다.

AWS source revision은 `30a28f80dbf995ca08bf86e64d3b60a93f1e2094`로 고정했다. 최종 검토 직전 `HEAD`와 `origin/develop`이 같은 revision임을 다시 확인했다. 작은 payload는 SQS body에 inline으로 남고, 큰 payload는 S3 upload 뒤 signed pointer를 SQS로 보낸다. 수신 시 pointer를 검증하고 bounded read로 payload를 복원한 뒤 handler를 실행한다. 성공한 handler만 acknowledgement로 진행하며, SQS receipt 삭제가 성공한 뒤에만 marker와 payload를 정리한다. SQS 삭제 실패는 cleanup을 시작하지 않고, 이후 정리 실패는 opaque cleanup handle을 반환한다. Bucket, IAM, encryption, retention, lifecycle, retry scheduling, orphan cleanup은 caller-owned이며 pointer는 AWS Java Extended Client나 legacy `@SqsListener`와 호환되지 않는다.

## 브라우저 검증

- Chromium `151.0.7922.34`, viewport 1440×1080, deviceScaleFactor=1, locale=en-US, timezone=UTC, reducedMotion=reduce.
- 9개 상황 × 2개 언어 = **18개 terminal 상태 PASS**. inline/offload 성공, S3 upload 실패, SQS send 실패, missing object, restore 실패, acknowledgement 실패, cleanup retry, caller-owned lifecycle의 활성·금지 step을 확인했다.
- Play 시작·정지·자동 종료, Reset, Next, Enter 단계 선택과 focus 유지, End 이동, `Auto` 테마의 시스템 light/dark 반영 PASS.
- 390/768px × 2개 언어 × 2개 테마 = **8개 document overflow 검사 PASS**, JavaScript 오류 0.
- locale/theme 4개 화면을 각각 두 번 캡처했고 SHA-256이 일치했다. [브라우저 보고서](assets/issue-423/browser-report.json).

| 언어 | Light | Dark |
| --- | --- | --- |
| English | [PNG](assets/issue-423/en.light.png) | [PNG](assets/issue-423/en.dark.png) |
| 한국어 | [PNG](assets/issue-423/ko.light.png) | [PNG](assets/issue-423/ko.dark.png) |

[EN 모바일](assets/issue-423/en.light.mobile.png), [KO 모바일](assets/issue-423/ko.dark.mobile.png).

## 정적 자산 검증

- 한·영 SVG와 semantic ledger 생성기 `--check` PASS. 각 ledger는 sequence nodes=9, edges=8, branches=3, loops=1, diagnostics=0이다.
- Arrowhead, connector, endpoint, geometry, mixed-corner, XML text 감사 PASS. producer 내부 size decision을 제외한 connector=8, direction/terminal checks=8, intrusion/crossing/shared segment=0, text_hazards=0이다.
- CairoSVG 2배 렌더링 PNG는 3600×8440, alpha_min=255, bbox occupancy=0.958, margin imbalance=0이다. 전체 크기로 한·영 PNG를 열어 glyph, participant header, branch frame, source note를 확인했다. [정적 감사 결과](assets/issue-423/static-audits.txt).
- Wave2 asset pair 18개, README PNG 참조 18개, 누락·중복·SVG embed 0.

[EN 정적 PNG](../../public/assets/visual-companions/wave2/aws-sqs-extended-client-en.png), [KO 정적 PNG](../../public/assets/visual-companions/wave2/aws-sqs-extended-client-ko.png).

## 발견 사항과 수정

기존 SNS 생성기의 구조를 재사용하는 첫 단계에서 이름 치환만으로는 domain state와 설명을 모두 바꿀 수 없음을 확인했다. SQS 전용 data model과 명시적인 per-scenario path를 만들고, 생성 결과에 SNS `TopicArn`, certificate, signature verification 문구가 남지 않는 회귀 검사를 추가했다. Semantic budget은 화면 frame 수가 아니라 세 결정 branch와 cleanup retry loop를 따로 세도록 고쳤다.

정적 수치 감사가 통과한 뒤 전체 PNG 검토에서 한국어 제목 일부가 잘린 것을 발견했다. 제목을 짧고 직접적인 문장으로 바꾸고 SVG/PNG를 다시 생성한 뒤 모든 정적 감사를 반복했다. 첫 전체 `npm test`에서는 이 변경과 무관한 Pagefind entry length assertion 한 건이 실패했다. 같은 test 단독 실행은 1/1, 전체 재실행은 294/294 PASS여서 변경 경로 회귀가 아닌 기존 timing flake로 분리했다.

독립 source 검토는 첫 판정에서 P1 1건과 P2 1건을 찾았다. 정적 sequence의 `size-gate`가 producer 내부 판단인데 SQS로 향하는 화살표로 그려졌고, 인터랙티브 sequence는 `data-from`/`data-to`를 기록하면서도 모든 화살표를 같은 전체 폭으로 표시했다. 정적 첫 행을 producer 내부 decision diamond로 바꾸고 SQS connector가 생기지 않는 회귀 검사를 추가했다. 인터랙티브에는 5개 participant의 실제 lane 위치를 계산해 origin, endpoint, 방향, self-loop를 배치했고, 정방향·역방향 좌표를 생성 결과 검사로 고정했다. 최신 PNG와 Chromium 행렬을 다시 검토한 결과 actor endpoint와 `SQS delete → marker → payload delete` 순서가 일치했다.

수정 산출물에 대한 독립 시각 재검토는 interactive self-loop의 arrowhead가 귀환 방향과 반대로 향하는 P1 한 건과, 정적 첫 행의 decision diamond가 단계 badge와 activation을 겹치는 P2 한 건을 찾았다. Self-loop는 180° arrowhead로 고정했고 생성 결과 검사에 회귀 assertion을 추가했다. 정적 decision diamond와 self badge를 축소하고 producer 내부 판단에 불필요한 activation을 제거했다. 최신 한·영 desktop/mobile과 전체 정적 PNG를 다시 열어 clipping, overlap, arrow endpoint, scroll 안내, provenance를 확인했다.

독립 source 재검토는 실패 terminal에서 `event`, `action`, `next`만 failure 정보로 바뀌고 `VISIBLE SIGNAL`은 성공 step의 신호를 계속 표시하는 P1 한 건을 찾았다. 여섯 failure scenario에 별도의 한·영 `failure.signal`을 선언하고 실패 시 해당 신호를 렌더링하도록 고쳤다. Unit test는 각 신호의 locale과 잔여 자원 상태를 검증하고, Chromium 검증은 18개 terminal에서 화면 신호가 scenario 모델과 정확히 일치하는지 확인한다. 최종 독립 source/visual 재판정은 **P0/P1/P2 모두 0**이다.

## 재현과 한계

```sh
node scripts/generate-2-0-wave2-aws-sqs-extended-client.mjs --check
node scripts/generate-2-0-wave2-aws-sqs-extended-client-visuals.mjs --check
PLAYWRIGHT_MODULE=file:///opt/homebrew/lib/node_modules/@playwright/test/index.mjs node scripts/verify-aws-sqs-extended-client-browser.mjs
```

다른 환경에서는 설치한 Playwright module 경로를 지정한다. 새 dependency는 추가하지 않았다. 실제 AWS SQS/S3 호출과 backend Kotlin 테스트는 실행하지 않았고, pinned 구현과 기존 test를 읽어 계약을 대조했다. 설치된 `visual-verdict` skill이 없어 main PNG 검토와 Chromium 수치 검증을 사용하고 `.omx/state/issue-423/ralph-progress.json`에 iteration 2 PASS 판정을 기록했다. 전역 Codex/OMX 설정을 바꾸지 않아 전역 self-audit와 ChezMoi parity는 미적용이다.

## 최종 통합 검증

- `npm test`: 최신 수정 기준 전체 실행 294/294 PASS, 실패·취소·누락 0. 앞선 실행에서 발생한 무관한 Pagefind timing failure는 단독 1/1과 다음 전체 294/294 PASS로 기존 timing flake임을 분리했다.
- `npm run build`: 3,779 pages, Pagefind 5,019 HTML, analytics 58/58, Astro check 0 errors / 0 warnings / 기존 hints 3개.
- Manual snapshot 9개 저장소와 visual companion snapshot 5개 저장소 / 17개 문서 / 34개 locale asset PASS. #423의 site-local 생성 자산은 별도 catalog·route·asset-pair 검사로 검증했다.
- 최종 dist의 한·영 companion·catalog·AWS 1.0 manual·SVG/PNG를 loopback HTTP로 검증: 10/10 PASS. Companion HTML은 build 단계에서 Cloudflare analytics가 정확히 1회 주입되므로 원본 `public`보다 각 166 bytes 크며, 보고서에 원본/배포 SHA와 주입 횟수를 함께 기록했다. [HTTP 보고서](assets/issue-423/http-report.json).
- Shared Wave2와 SQS HTML·SVG 생성기 `--check`, `git diff --check` PASS.
