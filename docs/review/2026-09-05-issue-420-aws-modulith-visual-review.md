# #420 Spring Modulith 시각 검토

## 선택한 스타일과 근거

Clinic `appointment-plan-and-capacity`, Exposed `ddd-modulith-boundaries`, Leader `leader-elector`를 Chromium 화면에서 비교했다. Exposed의 경계 탐색형을 기준으로 절제된 청록색, 밝은 canvas와 명확한 surface, 단계 선택과 설명 패널을 사용했다. 긴 페이지는 입력 검증, envelope, 전송 관점, 운영 책임 순서로 읽는다.

## 브라우저 증거

- Chromium `151.0.7922.34`, viewport 1440×1080, deviceScaleFactor=1, locale=en-US, timezone=UTC, reducedMotion=reduce.
- 29개 유효 경로·상황 × 2개 언어 = 58개 terminal 상태 검사 통과. DIRECT에서 outbound publish 실패 선택 불가.
- 재생 자동 정지, 수동 정지, 초기화, 단계 선택, Enter 키·focus 보존, auto 테마의 시스템 설정 반영 검사 통과.
- 모바일 390/768px × 2개 언어 × 2개 테마 = 8개 overflow 검사 통과. JavaScript 오류 0.
- 4개 locale/theme PNG를 같은 상태에서 각각 두 번 캡처했고 SHA-256이 일치했다. [기계 판독 보고서](assets/issue-420/browser-report.json).
- EN 1440×2707, KO 1440×2685. PNG visual audit 4/4 PASS, alpha_min=255, bbox occupancy 0.976~0.994, margin imbalance 0.012~0.033.
- 전체 PNG와 모바일 화면을 열어 제목 줄바꿈, 카드 대비, 버튼 접근, 내용 잘림을 확인했다. 첫 KO 제목의 단어 중간 줄바꿈을 `word-break:keep-all`로 보정했다.

| 언어 | Light | Dark |
| --- | --- | --- |
| English | [PNG](assets/issue-420/en.light.png) | [PNG](assets/issue-420/en.dark.png) |
| 한국어 | [PNG](assets/issue-420/ko.light.png) | [PNG](assets/issue-420/ko.dark.png) |

## 재현

```sh
node scripts/generate-2-0-wave2-aws-modulith.mjs --check
PLAYWRIGHT_MODULE=file:///opt/homebrew/lib/node_modules/@playwright/test/index.mjs node scripts/verify-aws-modulith-browser.mjs
```

다른 환경에서는 설치한 Playwright module 경로를 지정하거나 로컬 `playwright` package를 사용한다. 설치·의존성 변경 없이 검증했다. HTTP 검증에는 `VISUAL_BASE_URL`을 지정한다.

## 검증 한계

실제 AWS 요청과 backend 테스트는 수행하지 않았다. 시각자료는 pinned source의 제어 흐름 설명이며 운영 시스템이 아니다. 설치된 `visual-verdict` skill이 없어 main PNG 검토와 Playwright의 수치 검증으로 대체했고 `.omx/state/issue-420/ralph-progress.json`에 iteration verdict를 기록했다.

## 정적 SVG/PNG 검증

- 생성기: `scripts/generate-2-0-wave2-aws-modulith-visuals.mjs`, `--check`로 SVG와 semantic ledger 재현성을 검사한다.
- Canonical source/PNG: `public/assets/visual-companions/wave2/aws-modulith-event-externalization-{en,ko}.{svg,png}`.
- 각 locale ledger: architecture nodes=3, edges=2, branches=0, loops=0, diagnostics=0. 세 개 책임 경계 사이의 데이터 전달을 나타내며 세부 시나리오는 HTML에 있다.
- `xmllint`: 2/2 통과. CairoSVG `-s 2`: 2/2 생성, PNG 각 2880×2840.
- SVG text: text_hazards=0, code_without_highlight=0. 첫 EN PNG의 지원되지 않는 기호를 단어와 ASCII 구분자로 고쳤다. 최종 PNG 2개를 열어 한글 줄바꿈·glyph·카드 여백을 다시 확인했다.
- 각 locale connector audit: markers=1, connectors=2, cards=3, intrusions=0, crossings=0, shared_segments=0. 관계 라벨을 사용하지 않아 labels=0이며 카드 제목으로 경계 의미를 제시한다.
- 각 locale arrowhead audit: used_markers=1, direction_checks=2, terminal_checks=2. secondary 10×10, positive-x, solid head.
- geometry_failures=0, endpoint PASS. 경로 2개는 직선이므로 q_bends=0이며 혼합 corner 없음.
- PNG visual audit: opaque, alpha_min=255, 2880×2840, aspect=1.01. 한국어 bbox occupancy=0.850, margin imbalance=0.017.
- Wave2 asset-pair audit: SVG=12, PNG=12, pairs=12, missing=0, README PNG refs=12, SVG embeds=0.
- 실제 AWS service icon card를 그리지 않고 producer/source/consumer 책임 영역을 사용했다. 기술 로고는 만들지 않았다.

검토 파일의 reader-facing 링크는 현재 worktree canonical 자산으로 연결한다: [EN PNG](../../public/assets/visual-companions/wave2/aws-modulith-event-externalization-en.png), [KO PNG](../../public/assets/visual-companions/wave2/aws-modulith-event-externalization-ko.png), [EN SVG](../../public/assets/visual-companions/wave2/aws-modulith-event-externalization-en.svg), [KO SVG](../../public/assets/visual-companions/wave2/aws-modulith-event-externalization-ko.svg).

## 독립 코드 검토

Native `code-reviewer`가 단일 데이터 모델, HTML 생성기, 브라우저 검증기, 시나리오 테스트와 등록 diff를 검토했다. P0/P1/P2 발견 없음. Source SHA `870361650e6caf8b1ac3fae141789fccbb0969c7`의 DIRECT·SNS·claim·dispatch·ack 경계를 확인했고 새 테스트 5/5, Node syntax와 diff 검사에 통과했다. Native LSP 도구는 제공되지 않아 `node --check`와 사이트 `astro check`를 사용했다. 이 결과는 별도 사람의 승인으로 기록하지 않는다.

## 최종 로컬 통합 검증

- `npm test`: 276/276 PASS. 정적 생성기 drift 검사를 추가한 새 테스트도 5/5 재검사 통과.
- `npm run build`: 3,779페이지 생성. Astro check 0 errors / 0 warnings / 기존 파일의 unused parameter hints 3개.
- `npm run check:manual`: 9개 저장소 통과. `npm run check:visual-companions`: 5개 저장소 / 17개 문서 / 34개 locale 자산 통과.
- 최종 `dist`를 loopback HTTP server에서 제공하고 한·영 companion, catalog, manual, SVG/PNG를 요청했다. HTTP status와 route 연결 10/10 PASS.
- `git diff --check`: PASS. CairoSVG 2.9.0, Node v26.8.1.

추가 독립 정적 검토에서도 EN/KO PNG의 잘림·화살표·카드 레이아웃과 source/semantic ledger의 일치를 확인했다. P0/P1/P2 발견 없음이며 최종 iteration 4를 PASS로 기록했다.
