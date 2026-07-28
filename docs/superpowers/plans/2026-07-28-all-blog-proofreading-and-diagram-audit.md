# 전체 블로그 한국어 교정과 기술 다이어그램 감사 계획

## 목표

한국어 블로그 글 87편을 모두 출판용 기술 한국어로 교정하고, 블로그에 포함된
기술 다이어그램 165종을 dark style·한영 분리·PNG 육안 검사 기준으로 검증한다.
대표 이미지와 일반 스크린샷은 다이어그램 확대·교정 대상에서 제외한다.

교정 작업은 오래된 글부터 2~3편씩 진행한다. 각 배치는 이전 교정 브랜치를
base로 하는 stacked PR로 만들고, 모든 배치가 완료된 뒤 한 번에 머지·배포한다.

## 범위와 기준

- 한국어 글: `src/content/docs/ko/blog/index.mdx`를 제외한 87편
- 영어 글: 한국어 글과 제목·주장·수치·소스 링크·시리즈 탐색·다이어그램 구성을 맞춘다.
  영어 본문 전체 문체 교정은 한국어 교정으로 의미가 달라진 부분에 한정한다.
- 기술 다이어그램: `bt4k-architecture`, `bt4k-chart`, `bt4k-sequence`로 분류된
  165개 stem
- 제외: `bt4k-blog-hero`, `bt4k-post-hero`, `bt4k-screenshot`
- 날짜: 교정 PR 날짜가 아니라 최초 공개 시점을 유지한다.
- 공개 GitHub PR: 제목과 본문은 영어로 작성하고 마지막 H2는 `## DoD Status`로 둔다.

## 실행 순서

1. 전체 글·다이어그램 목록과 완료 상태를 집계한다.
2. 오래된 미완료 글을 2~3편씩 교정하고 사실·식별자·수치·링크를 대조한다.
3. 해당 글의 기술 다이어그램을 한 자산씩 SVG → CairoSVG PNG → 정적 감사 →
   원본 크기 육안 검사 순서로 검증한다.
4. 한글 다이어그램은 출판용 기술 한국어로 교정하고, 영어 전용 자산은 별도
   `-ko` 자산을 만든다. 한영 자산은 동일한 구조를 유지한다.
5. 배치마다 lessons 문서를 작성한다. 재사용할 교정 규칙이 생기면 chezmoi 원본의
   `bluetape-writer` 체크리스트를 수정하고 apply·parity·push까지 완료한다.
6. targeted test, 전체 사이트 build, 변경 경로와 이미지 노출을 검증한 뒤 stacked PR을 만든다.
7. 87편과 165개 다이어그램을 다시 전수 집계한다. 누락이 0일 때만 전체 완료로 전환한다.
8. 모든 stacked PR의 exact head·CI·review를 확인한 뒤 별도의 최종 머지 승인을 받아
   순서대로 머지·배포하고 로컬을 정리한다.

## 현재 진행 상황

기준 시점: 2026-07-28, stacked PR #267~#278

| 구분 | 완료 | 전체 | 남음 | 상태 |
| --- | ---: | ---: | ---: | --- |
| 한국어 블로그 본문 교정 | 29 | 87 | 58 | 진행 중 |
| 기술 다이어그램 변경·배치 검증 | 44 | 165 | 121 | 진행 중 |
| stacked PR | 12 | 미정 | 미정 | #267~#278 open |
| 현재 배치 | 3 | 3 | 0 | Exposed Part 4~6 PR #278 |
| 최종 전체 사이트 감사 | 0 | 1 | 1 | 대기 |
| 최종 머지·배포·정리 | 0 | 1 | 1 | 대기 |

현재 완료된 한국어 글 29편:

- AI 협업 글 2편
- Bluetape4k 생태계·GraphDB 글 2편
- 이미지 처리·Okio CSV 글 2편
- CSV Writer·CIO·버그 회고 글 3편
- Virtual Threads Part 1~4
- Cache Part 1~4
- Projects Part 1~6
- Exposed Part 1~6

Exposed Part 4~6 배치에서는 본문 3편과 기술 다이어그램 8종을 다시 검증했다.
Part 4~5의 4종은 앞선 40개 집계에 이미 포함되어 중복 계산하지 않았고,
Part 6의 새 다이어그램 4종만 전체 완료 수에 더했다.

## Exposed Part 4~6 배치 DoD

| 검사 | 결과 | 근거 |
| --- | --- | --- |
| 글 교정 | PASS | 한국어 Part 4~6, frontmatter·본문·표·캡션·대체 텍스트 |
| 날짜 보존 | PASS | base 대비 `blog.date`와 `sidebar.order` 변경 없음 |
| 사실 검증 | PASS | Part 5 벤치마크를 2026-07-27 JMH 결과로 갱신 |
| 소스 링크 | PASS | 한영 글의 로컬 `develop` 대상 56/56 존재 |
| 한영 정합성 | PASS | 제목·수치·링크·다이어그램·시리즈 탐색 동기화 |
| 다이어그램 정적 감사 | PASS | 텍스트 16/16, sequence 6/6, architecture 6/6 |
| PNG 시각 검사 | PASS | KO/EN Part 5 차트와 Part 6 다이어그램 원본 크기 확인 |
| 사이트 검사 | PASS | Node 테스트 21/21, Astro 0 errors, 1,303 pages build |
| 경로 검사 | PASS | 변경된 한영 경로 6/6 HTTP 200 |

현재 배치 필수 검사: **9/9 완료, N/A 0, Blocked 0**

## DoD

- [x] **ALL-01 — 전체 대상 수를 고정한다**
  - **Action:** 한국어 글과 기술 다이어그램을 저장소 기준으로 집계한다.
  - **Evidence:** 한국어 글 87편, 기술 다이어그램 stem 165개,
    `blog-diagram-locales.test.mjs`의 기술 figure 분류.
  - **Failure:** 분모가 달라지면 이 문서와 모든 진행률을 다시 계산한다.

- [x] **ALL-02 — 기존 완료 범위를 재구성한다**
  - **Action:** stacked PR #267~#277과 `origin/develop...HEAD`를 대조한다.
  - **Evidence:** 본문 교정 26편, 변경된 기술 다이어그램 stem 40개,
    Exposed Part 4~6의 1행 변경은 완료 집계에서 제외.
  - **Failure:** PR별 실제 diff와 맞지 않는 글은 완료에서 제외한다.

- [ ] **ALL-03 — 한국어 글 87편을 모두 교정한다**
  - **Action:** 자연스러운 출판용 기술 한국어, 사실 보존, 원래 공개일 유지,
    소스 링크 확인을 글마다 수행한다.
  - **Evidence:** 87/87, 미완료 0, 글별 배치 PR과 lessons.
  - **Failure:** 한 편이라도 근거가 없으면 전체 완료를 선언하지 않는다.

- [ ] **ALL-04 — 기술 다이어그램 165개를 모두 검증한다**
  - **Action:** 각 stem에 `DIA-01~08`, 한영 자산, CairoSVG PNG,
    정적 감사와 원본 크기 육안 검사를 적용한다.
  - **Evidence:** 165/165, 미검증 0, 자산별 검증 원장.
  - **Failure:** 생성 성공이나 SVG 검사만으로 완료 처리하지 않는다.

- [ ] **ALL-05 — 배치별 전달 계약을 지킨다**
  - **Action:** lessons, 필요 시 writer 체크리스트 chezmoi 동기화,
    Lore commit, stacked PR, exact-head CI를 배치마다 완료한다.
  - **Evidence:** 각 PR의 base/head/SHA/CI/마지막 `## DoD Status`.
  - **Failure:** 누락된 배치는 다음 배치 전에 보강한다.

- [ ] **ALL-06 — 전체 사이트를 최종 재검증한다**
  - **Action:** locale parity, diagram tests, lightbox tests, 전체 build,
    모든 변경 route와 자산 노출을 검사한다.
  - **Evidence:** 테스트·build 성공, 87개 한영 route, 165개 stem parity,
    누락·깨진 링크·잘린 텍스트 0.
  - **Failure:** 실패한 글·자산 배치로 돌아가 수정한다.

- [ ] **ALL-07 — 최종 머지·배포·로컬 정리를 완료한다**
  - **Action:** 모든 PR의 CI와 review를 exact head에서 확인하고, 최종 머지 승인 후
    순차 머지·배포·develop 동기화·작업 트리 정리를 수행한다.
  - **Evidence:** merged PR 목록, 배포 URL과 성공 상태, develop SHA,
    보존할 사용자 변경과 제거한 작업 트리 목록.
  - **Failure:** 승인 전 머지하거나 배포하지 않는다.

현재 필수 검사: **2/7 완료, N/A 0, Blocked 0**  
미완료: `ALL-03`, `ALL-04`, `ALL-05`, `ALL-06`, `ALL-07`
