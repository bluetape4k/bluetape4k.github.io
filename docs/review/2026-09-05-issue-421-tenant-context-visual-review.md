# #421 Tenant context carrier 시각 검토

## 스타일과 소스 계약

기존 Clinic의 카드형, Exposed의 경계 탐색형, Leader의 단계 재생형을 비교했다. 서로 다른 저장 범위와 비동기 경계를 비교하는 주제이므로 Exposed의 절제된 청록색·긴 탐색 페이지를 선택하고 단계 재생을 결합했다. 네 carrier 사이의 자동 전파를 암시하지 않도록 정적 개요는 연결선 없는 네 카드로 구성했다.

Projects source revision은 `5954b6329a3e11c70ef12b6d4bd8480e7b38be1b`로 고정했다. ThreadLocal의 finally 복원, ScopedValue의 lexical 수명과 structured fork 상속, Reactor의 immutable outer Context, Ktor의 동일 call binding 보존을 각각 설명한다. 인증·인가·tenant resolution은 호출자 책임이며 기본 tenant를 만들지 않는다.

## 브라우저 검증

- Chromium `151.0.7922.34`, viewport 1440×1080, deviceScaleFactor=1, locale=en-US, timezone=UTC, reducedMotion=reduce.
- carrier 4개 × 상황 6개 × 언어 2개 = **48개 최종 상태 PASS**. 정상·중첩·누락·예외·취소·handoff의 상태와 scope 이후 값이 일치한다.
- 재생·정지·자동 종료·초기화, Enter 단계 선택과 focus 유지, auto 테마의 시스템 설정 반영 PASS.
- 390/768px × 2개 언어 × 2개 테마 = **8개 가로 overflow 검사 PASS**, JavaScript 오류 0.
- locale/theme 4개 화면을 각각 두 번 캡처했고 SHA-256이 일치했다. [브라우저 보고서](assets/issue-421/browser-report.json).
- 전체 PNG 4개와 모바일 PNG를 열어 제목 줄바꿈, 대비, 카드 라벨, 조작 영역, source 링크를 확인했다. 최종 source 링크 추가 후 캡처도 갱신했다.
- PNG audit 4/4 PASS: EN 1440×2892, KO 1440×2792, alpha_min=255, bbox occupancy 0.954~0.955, margin imbalance=0.082.

| 언어 | Light | Dark |
| --- | --- | --- |
| English | [PNG](assets/issue-421/en.light.png) | [PNG](assets/issue-421/en.dark.png) |
| 한국어 | [PNG](assets/issue-421/ko.light.png) | [PNG](assets/issue-421/ko.dark.png) |

[EN 모바일](assets/issue-421/en.light.mobile.png), [KO 모바일](assets/issue-421/ko.dark.mobile.png).

## 정적 자산 검증

- 한·영 SVG와 semantic ledger 생성기 `--check` PASS. 각 ledger architecture nodes=4, edges=0, branches=0, loops=0, diagnostics=0.
- XML 구조 검사 PASS, 실제 카드 4개, connector와 marker 참조 0. 선·화살표·endpoint 검사는 연결선 없는 소유 범위 비교로 미적용이다.
- SVG text_hazards=0, code_without_highlight=0. CairoSVG 2배 렌더링 후 한·영 PNG를 열어 glyph와 카드 여백을 확인했다.
- PNG 2880×2914, alpha_min=255, bbox occupancy=0.873, margin imbalance=0.021. [정적 감사 결과](assets/issue-421/static-audits.txt).
- Wave2 asset pair 14개, README PNG 참조 14개, 누락·중복·SVG embed 0.

[EN 정적 PNG](../../public/assets/visual-companions/wave2/projects-tenant-context-carriers-en.png), [KO 정적 PNG](../../public/assets/visual-companions/wave2/projects-tenant-context-carriers-ko.png).

## 발견 사항과 수정

Main source 검토에서 ThreadLocal·ScopedValue의 취소 요청을 자동 cleanup으로 표현한 오류를 고쳤다. 두 API는 non-suspending이며 실제 block 종료가 복원의 조건이다. Ktor의 정상 종료 결과도 call이 해제됐다고 가정하지 않고 동일 call에 값이 남는 것으로 고쳤다.

실제 Chromium 검증에서는 단계 DOM 교체 후 focus가 사라지는 결함과 비교 카드의 누락된 번역 키를 발견했다. 선택 버튼의 focus를 복원하고 locale 라벨을 정의했다. 외부 Google Fonts import는 로컬 fallback으로 대체했다. 이 경위와 예방 규칙은 [lesson](../lessons/2026-09-05-issue-421-tenant-carrier-lifetime.md)에 기록했다.

독립 native `code-reviewer`의 P0/P1은 0이었다. P2 한 건은 Reactor와 Ktor 테스트의 공개 source 링크 누락이었다. 고정 revision의 두 테스트 링크를 추가했고, 독립 재검토에서 실제 파일 및 한·영 HTML 반영을 확인해 해결 판정을 받았다. 잔여 P0/P1/P2는 없다. 이 검토를 별도 사람의 승인으로 기록하지 않는다.

## 재현과 한계

```sh
node scripts/generate-2-0-wave2-tenant-context.mjs --check
node scripts/generate-2-0-wave2-tenant-context-visuals.mjs --check
PLAYWRIGHT_MODULE=file:///opt/homebrew/lib/node_modules/@playwright/test/index.mjs node scripts/verify-tenant-context-browser.mjs
```

다른 환경에서는 설치한 Playwright module 경로를 지정한다. 새 dependency는 추가하지 않았다. 실제 JVM·Reactor·Ktor backend 테스트는 실행하지 않았으며, 해당 계약은 pinned 구현과 기존 테스트 소스를 읽어 대조했다. 설치된 `visual-verdict` skill이 없어 main PNG 검토와 Chromium 수치 검증을 사용하고 `.omx/state/issue-421/ralph-progress.json`에 판정을 기록했다. 전역 Codex/OMX 설정을 바꾸지 않아 전역 self-audit와 ChezMoi parity는 미적용이다.

설계·계획·review·lesson을 대상으로 SPW-01~05의 독자·계약·수용 기준·검증·기술 용어 일치를 확인했다.

## 최종 통합 검증

- `npm test`: 282/282 PASS, 실패·취소·누락 0. 이후 UI 라벨·focus·source 링크 보정의 대상 테스트 5/5 재검사 PASS.
- 최종 `npm run build`: 3,779페이지, Astro check 0 errors / 0 warnings / 기존 unused parameter hints 3개.
- 매뉴얼 snapshot 9개 저장소, 시각자료 snapshot 5개 저장소 / 17개 문서 / 34개 locale 자산 PASS.
- 최종 dist의 한·영 companion·catalog·매뉴얼 3종·SVG/PNG를 loopback HTTP로 검증: 14/14 PASS. [HTTP 보고서](assets/issue-421/http-report.json).
- shared Wave2 생성기와 Tenant HTML·SVG 생성기 `--check`, `git diff --check` PASS. 한국어 기술 용어 감사 4개 문서 / 0 findings.
