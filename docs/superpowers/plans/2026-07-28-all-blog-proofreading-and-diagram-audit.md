# 전체 블로그 한국어 교정과 기술 다이어그램 감사 계획

## 목표

한국어 블로그 글 87편을 모두 출판용 기술 한국어로 교정하고, 블로그에 포함된
기술 다이어그램 173종을 dark style·한영 분리·PNG 육안 검사 기준으로 검증한다.
대표 이미지와 일반 스크린샷은 다이어그램 확대·교정 대상에서 제외한다.

교정 작업은 오래된 글부터 2~3편씩 진행한다. 각 배치는 이전 교정 브랜치를
base로 하는 stacked PR로 만들고, 모든 배치가 완료된 뒤 한 번에 머지·배포한다.

## 범위와 기준

- 한국어 글: `src/content/docs/ko/blog/index.mdx`를 제외한 87편
- 영어 글: 한국어 글과 제목·주장·수치·소스 링크·시리즈 탐색·다이어그램 구성을 맞춘다.
  영어 본문 전체 문체 교정은 한국어 교정으로 의미가 달라진 부분에 한정한다.
- 기술 다이어그램: `bt4k-architecture`, `bt4k-chart`, `bt4k-sequence`로 분류된
  173개 stem
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
5. 글을 교정할 때마다 `bluetape-writer` 체크리스트를 다시 참조한다. 배치마다
   확인한 재사용 가능한 용어·문장·사실 검증 규칙을 chezmoi 원본 체크리스트에
   추가하고 apply·parity·push까지 완료하며, 별도 lessons 문서에도 근거를 남긴다.
6. targeted test, 전체 사이트 build, 변경 경로와 이미지 노출을 검증한 뒤 stacked PR을 만든다.
7. 87편과 173개 다이어그램을 다시 전수 집계한다. 누락이 0일 때만 전체 완료로 전환한다.
8. 모든 stacked PR의 exact head·CI·review를 확인한 뒤 별도의 최종 머지 승인을 받아
   순서대로 머지·배포하고 로컬을 정리한다.

## 현재 진행 상황

기준 시점: 2026-07-29, stacked PR #267~#288, #290~#292

| 구분 | 완료 | 전체 | 남음 | 상태 |
| --- | ---: | ---: | ---: | --- |
| 한국어 블로그 본문 교정 | 64 | 87 | 23 | 진행 중 |
| 기술 다이어그램 변경·배치 검증 | 120 | 173 | 53 | 진행 중 |
| stacked PR | 25 | 미정 | 미정 | #267~#288, #290~#292 open |
| 현재 배치 | 3 | 3 | 0 | 텍스트 검색·사전·아웃박스 PR #292 |
| 최종 전체 사이트 감사 | 0 | 1 | 1 | 대기 |
| 최종 머지·배포·정리 | 0 | 1 | 1 | 대기 |

현재 완료된 한국어 글 64편:

- AI 협업 글 2편
- Bluetape4k 생태계·GraphDB 글 2편
- 이미지 처리·Okio CSV 글 2편
- CSV Writer·CIO·버그 회고 글 3편
- Virtual Threads Part 1~4
- Cache Part 1~4
- Projects Part 1~6
- Exposed Part 1~6
- Leader Part 1~5
- AWS Part 1~5
- JaVers Part 1~3
- Graph Part 1~5
- 전역 고유 ID 생성기 성능 비교
- Dependencies 사용 가이드와 1.3.0 활용기 Part 1~3
- Dependencies 1.3.0 활용기 Part 4와 제작기 Part 1~2
- Dependencies 제작기 Part 3, Ktor 멀티테넌트 라우팅, 배치 벤치마크 방법론
- Spring Boot 4 Jackson 3 전환, Text Part 1~2
- Text Part 3~4, 트랜잭셔널 아웃박스와 멱등성

## 텍스트 검색·사전·아웃박스 배치 DoD

| 검사 | 결과 | 근거 |
| --- | --- | --- |
| 글 교정 | PASS | Text Part 3~4·트랜잭셔널 아웃박스 한국어 본문과 대응 영어 글 |
| 날짜 보존 | PASS | base 대비 한영 `blog.date`와 `sidebar.order` 변경 없음 |
| 사실 검증 | PASS | 현재 Aho-Corasick Flow, 런타임 사전, Spring/Ktor 멱등성·아웃박스 구현 대조 |
| 소스 링크 | PASS | 한영 글의 독자용 자료 링크 30/30 HTTP 200 |
| 한영 정합성 | PASS | 제목·주장·코드·자료 링크·다이어그램 구성 동기화 |
| 다이어그램 정적 감사 | PASS | 한영 8/8, connector·endpoint·geometry·corner 실패 0, sequence 2/2 |
| 다이어그램 구조·PNG 검사 | PASS | 4개 stem, `shared_segments=0`, CairoSVG 2배 PNG 8개 원본 확인 |
| writer 체크리스트 | PASS | dotfiles `bd5fb27`, chezmoi apply·source/live·self-audit·upstream 일치 |
| 사이트 검사 | PASS | Node 166/166, Astro 오류·경고 0, 기존 힌트 3개, 1,303 pages build |
| 경로 검사 | PASS | 한영 글 6개 HTTP 200 |
| stacked PR | PASS | #292, base `docs/korean-proofreading-jackson-text-batch`, head `docs/korean-proofreading-text-outbox-batch` |

현재 배치 필수 검사: **11/11 완료, N/A 0, Blocked 0**

## Jackson 3·텍스트 처리 배치 DoD

| 검사 | 결과 | 근거 |
| --- | --- | --- |
| 글 교정 | PASS | Jackson 3·Text Part 1~2 한국어 본문과 대응 영어 글 |
| 날짜 보존 | PASS | 한영 `blog.date`와 `sidebar.order` 12개 필드 변경 없음 |
| 사실 검증 | PASS | Jackson 호환 속성, 입력 크기 검사 계층, 확률적 언어 감지 경계 대조 |
| 소스 링크 | PASS | 한영 글의 독자용 자료 링크 27/27 HTTP 200 |
| 한영 정합성 | PASS | 제목·주장·코드·자료 링크·다이어그램 구성 동기화 |
| 다이어그램 정적 감사 | PASS | 한영 6/6, connector·endpoint·geometry·corner 실패 0 |
| 다이어그램 구조·PNG 검사 | PASS | 3개 stem, `shared_segments=0`, CairoSVG 2배 PNG 6개 원본 확인 |
| writer 체크리스트 | PASS | dotfiles `fd2575d`, chezmoi apply·source/live·self-audit·upstream 일치 |
| 사이트 검사 | PASS | Node 165/165, Astro 오류·경고 0, 기존 힌트 3개, 전체 build |
| stacked PR | PASS | #291, base `docs/korean-proofreading-release-multitenancy-batch`, head `docs/korean-proofreading-jackson-text-batch` |

현재 배치 필수 검사: **10/10 완료, N/A 0, Blocked 0**

## 릴리스·멀티테넌트·벤치마크 배치 DoD

| 검사 | 결과 | 근거 |
| --- | --- | --- |
| 글 교정 | PASS | 릴리스 트레인·Ktor 멀티테넌트·배치 벤치마크 한국어 본문과 대응 영어 글 |
| 날짜 보존 | PASS | base 대비 한영 `blog.date`와 `sidebar.order` 변경 없음 |
| 사실 검증 | PASS | dependencies `1.3.1`, exposed `1.11.0`, 현재 Ktor 워크숍 구현 대조 |
| 한영 정합성 | PASS | 제목·주장·수치·자료 링크·다이어그램 구성 동기화 |
| 다이어그램 정적 감사 | PASS | 한영 12/12, sequence 2/2, connector 8/8, geometry·endpoint·corner 실패 0 |
| 다이어그램 구조·PNG 검사 | PASS | 6개 stem, CairoSVG 2배 PNG 12개와 한영 원본 크기 확인 |
| writer 체크리스트 | PASS | dotfiles `86bc658`, chezmoi apply·source/live·upstream 일치 |
| 사이트 검사 | PASS | Node 164/164, Astro 오류 0, 1,303 pages build |
| 경로 검사 | PASS | 한영 글 6개와 대표 PNG 6개 HTTP 200 |
| stacked PR | PASS | #290, base `docs/korean-proofreading-dependencies-making-batch`, head `docs/korean-proofreading-release-multitenancy-batch` |

현재 배치 필수 검사: **10/10 완료, N/A 0, Blocked 0**

## Dependencies 입력·BOM 제작기 배치 DoD

| 검사 | 결과 | 근거 |
| --- | --- | --- |
| 글 교정 | PASS | Input Part 4·제작기 Part 1·2 한국어 본문과 대응 영어 글 |
| 날짜 보존 | PASS | base 대비 한영 `blog.date`와 `sidebar.order` 변경 없음 |
| 사실 검증 | PASS | dependencies 1.0.0·1.3.0, image 0.3.0, text 0.2.1 태그 소스 대조 |
| 한영 정합성 | PASS | 제목·주장·자료 링크·다이어그램 구성 동기화 |
| 다이어그램 정적 감사 | PASS | 한영 6/6 connector·endpoint·geometry·corner 실패 0 |
| 다이어그램 구조·PNG 검사 | PASS | 3개 stem, CairoSVG 2배 PNG 6개와 한영 원본 크기 확인 |
| writer 체크리스트 | PASS | dotfiles `3d7e2db`, chezmoi apply·source/live·upstream 일치 |
| 사이트 검사 | PASS | Node 전체 테스트, Astro check·build |
| 경로 검사 | PASS | 한영 글 6개와 대표 PNG 3개 HTTP 200 |
| stacked PR | PASS | #288, base `docs/korean-proofreading-dependencies-operations-batch`, head `docs/korean-proofreading-dependencies-making-batch` |

현재 배치 필수 검사: **10/10 완료, N/A 0, Blocked 0**

## Dependencies 사용·서비스·운영 배치 DoD

| 검사 | 결과 | 근거 |
| --- | --- | --- |
| 글 교정 | PASS | 사용 가이드·Part 2·Part 3 한국어 본문과 대응 영어 글 |
| 날짜 보존 | PASS | base 대비 한영 `blog.date`와 `sidebar.order` 변경 없음 |
| 사실 검증 | PASS | Exposed 1.11.0 상태 표시기와 AWS 0.4.0 Ktor 플러그인 태그 소스 대조 |
| 한영 정합성 | PASS | 제목·주장·코드·자료·다이어그램 구성 동기화 |
| 다이어그램 정적 감사 | PASS | 한영 6/6 connector·endpoint·geometry·corner 실패 0 |
| 다이어그램 구조·PNG 검사 | PASS | 3개 stem, CairoSVG 2배 PNG 6개와 한영 원본 크기 확인 |
| writer 체크리스트 | PASS | dotfiles `f25b110`, chezmoi apply·source/live·upstream 일치 |
| 사이트 검사 | PASS | Node 테스트, Astro check·build |
| 경로 검사 | PASS | 한영 글 6개와 대표 PNG 3개 HTTP 200 |
| stacked PR | PASS | #287, base `docs/korean-proofreading-id-dependencies-batch`, head `docs/korean-proofreading-dependencies-operations-batch` |

현재 배치 필수 검사: **10/10 완료, N/A 0, Blocked 0**

## ID 생성기·Dependencies 배치 DoD

| 검사 | 결과 | 근거 |
| --- | --- | --- |
| 글 교정 | PASS | ID 생성기 비교·Dependencies Part 1 한국어 본문과 대응 영어 글 |
| 날짜 보존 | PASS | base 대비 한영 `blog.date`와 `sidebar.order` 변경 없음 |
| 사실 검증 | PASS | 현재 Go API, 2026-06-10~11 벤치마크 리비전, BOM 1.3.0 버전 집합 대조 |
| 한영 정합성 | PASS | 제목·주장·코드·자료·다이어그램 구성 동기화 |
| 다이어그램 정적 감사 | PASS | 한영 8/8 XML·텍스트·캔버스·구조 불변식 통과 |
| 다이어그램 구조·PNG 검사 | PASS | 4개 stem, CairoSVG 2배 PNG 8개와 한영 원본 크기 확인 |
| writer 체크리스트 | PASS | dotfiles `e5dd2b6`, chezmoi apply·source/live·upstream 일치 |
| 사이트 검사 | PASS | Node 테스트 162/162, Astro 오류·경고 0, 기존 힌트 3개, 1,303 pages build |
| 경로 검사 | PASS | 한영 글 4개와 대표 PNG 2개 HTTP 200 |
| stacked PR | PASS | #286, base `docs/korean-proofreading-graph-integrations-batch`, head `docs/korean-proofreading-id-dependencies-batch` |

현재 배치 필수 검사: **10/10 완료, N/A 0, Blocked 0**

## Graph Part 1~3 배치 DoD

| 검사 | 결과 | 근거 |
| --- | --- | --- |
| 글 교정 | PASS | 한국어 Part 1~3, frontmatter·본문·표·캡션·대체 텍스트 |
| 날짜 보존 | PASS | base 대비 한영 `blog.date`와 `sidebar.order` 변경 없음 |
| 사실 검증 | PASS | 현재 Graph API·backend capability·I/O 구현과 보존된 JMH 실행 조건 대조 |
| 소스 링크 | PASS | 한영 글의 로컬 소스 대상 44/44 존재 |
| 한영 정합성 | PASS | 제목·주장·코드·링크·다이어그램·시리즈 탐색 동기화 |
| 다이어그램 정적 감사 | PASS | 한영 14/14, connector·endpoint·geometry·corner·sequence 실패 0 |
| 다이어그램 구조·PNG 검사 | PASS | 7개 stem, 14×14 marker, 2배 PNG 14개와 대표 sequence 원본 확인 |
| writer 체크리스트 | PASS | dotfiles `aadba43`, chezmoi apply·source/live·upstream 일치 |
| 사이트 검사 | PASS | Node 테스트 22/22, Astro 오류·경고 0, 1,303 pages build, 한영 6개 경로 HTTP 200 |
| stacked PR | PASS | #284, base `docs/korean-proofreading-javers-core-batch`, head `docs/korean-proofreading-graph-core-batch` |

현재 배치 필수 검사: **10/10 완료, N/A 0, Blocked 0**

## Graph Part 4~5 배치 DoD

| 검사 | 결과 | 근거 |
| --- | --- | --- |
| 글 교정 | PASS | 한국어 Part 4~5, frontmatter·본문·표·캡션·대체 텍스트 |
| 날짜 보존 | PASS | base 대비 한영 `blog.date`와 `sidebar.order` 변경 없음 |
| 사실 검증 | PASS | 현재 Graph·Workshop 구현과 2026-04-17 JMH 실행 조건 대조 |
| 소스 링크 | PASS | 한영 글의 로컬 `develop` 대상 40/40 존재 |
| 한영 정합성 | PASS | 제목·주장·코드·링크·다이어그램·시리즈 탐색 동기화 |
| 다이어그램 정적 감사 | PASS | 한영 16/16, connector·endpoint·geometry·corner 실패 0 |
| 다이어그램 구조·PNG 검사 | PASS | 8개 stem, 14×14 marker, 2배 PNG 16개와 대표 자산 원본 확인 |
| writer 체크리스트 | PASS | dotfiles `02c6573`, chezmoi apply·source/live·upstream 일치 |
| 외부 근거 보존 | PASS | JEP 444 연구 노트, wiki `57c8ffd`, GNO update·embed·search 통과 |
| 사이트 검사 | PASS | Node 테스트 18/18, Astro 오류·경고 0, 전체 build, 한영 4개 경로 HTTP 200 |
| stacked PR | PASS | #285, base `docs/korean-proofreading-graph-core-batch`, head `docs/korean-proofreading-graph-integrations-batch` |

현재 배치 필수 검사: **11/11 완료, N/A 0, Blocked 0**

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

## Leader Part 4~5 배치 DoD

| 검사 | 결과 | 근거 |
| --- | --- | --- |
| 글 교정 | PASS | 한국어 Part 4~5, frontmatter·본문·표·캡션·대체 텍스트 |
| 날짜 보존 | PASS | 한영 `blog.date`와 `sidebar.order` 변경 없음 |
| 사실 검증 | PASS | 현재 Ktor 설정명, 예제 백엔드, 2026-07-02 Kubernetes 측정값 대조 |
| 소스 링크 | PASS | 한영 글의 로컬 `develop` 대상 62/62 존재 |
| 한영 정합성 | PASS | 제목·주장·수치·링크·다이어그램·시리즈 탐색 동기화 |
| 다이어그램 정적 감사 | PASS | 한영 2/2, text hazards 0, geometry·endpoint·corner 실패 0 |
| 다이어그램 구조·PNG 검사 | PASS | 각 SVG 주 카드 4·보조 카드 5·연결선 4, 3000×2160 원본 확인 |
| writer 체크리스트 | PASS | dotfiles `53024e5`, chezmoi apply·source/live·upstream 일치 |
| 사이트 검사 | PASS | Node 테스트 21/21, Astro 오류 0, 1,303 pages build, 한영 4개 경로 HTTP 200 |

현재 배치 필수 검사: **9/9 완료, N/A 0, Blocked 0**

## JaVers Part 1~3 배치 DoD

| 검사 | 결과 | 근거 |
| --- | --- | --- |
| 글 교정 | PASS | 한국어 Part 1~3, frontmatter·본문·표·캡션·대체 텍스트 |
| 날짜 보존 | PASS | base 대비 한영 `blog.date`와 `sidebar.order` 변경 없음 |
| 사실 검증 | PASS | 현재 JaVers·워크숍 구현의 저장소 계약, 쓰기 순서, 실패 경계 대조 |
| 소스 링크 | PASS | 한영 글의 로컬 `develop` 대상 32/32 존재 |
| 한영 정합성 | PASS | 제목·주장·코드·링크·다이어그램·시리즈 탐색 동기화 |
| 다이어그램 정적 감사 | PASS | 한영 16/16, text hazards 0, sequence 4/4, geometry·endpoint·corner 실패 0 |
| 다이어그램 구조·PNG 검사 | PASS | 8개 stem, 연결선 78개, 14×14 marker, 2배 PNG 16개 원본 확인 |
| writer 체크리스트 | PASS | dotfiles `fb20568`, chezmoi apply·source/live·upstream 일치 |
| 사이트 검사 | PASS | Node 테스트 35/35, Astro 오류·경고 0, 1,303 pages build, 한영 6개 경로 HTTP 200 |
| stacked PR | PASS | #283, base `docs/korean-proofreading-aws-integrations-batch`, head `docs/korean-proofreading-javers-core-batch` |

현재 배치 필수 검사: **10/10 완료, N/A 0, Blocked 0**

## AWS Part 1~3 배치 DoD

| 검사 | 결과 | 근거 |
| --- | --- | --- |
| 글 교정 | PASS | 한국어 Part 1~3, frontmatter·본문·표·캡션·대체 텍스트 |
| 날짜 보존 | PASS | 한영 `blog.date`와 `sidebar.order` 변경 없음 |
| 사실 검증 | PASS | 현재 `bluetape4k-aws/develop`의 README·빌드·대표 구현·호출 경로 대조 |
| 소스 링크 | PASS | 한영 글의 로컬 `develop` 대상 47/47 존재 |
| 한영 정합성 | PASS | 제목·주장·수치·링크·다이어그램·시리즈 탐색 동기화 |
| 다이어그램 정적 감사 | PASS | 한영 18/18, text hazards 0, sequence 4/4, geometry·endpoint·corner 실패 0 |
| 다이어그램 구조·PNG 검사 | PASS | 9개 stem 유형별 불변식과 2배 PNG 18개 원본 크기 확인 |
| writer 체크리스트 | PASS | dotfiles `f7a5ec6`, chezmoi apply·source/live·upstream 일치 |
| 사이트 검사 | PASS | Node 테스트 33/33, Astro 오류 0, 1,303 pages build, 한영 6개 경로 HTTP 200 |
| stacked PR | PASS | #281, base `docs/korean-proofreading-leader-integrations-batch`, head `docs/korean-proofreading-aws-core-batch` |

현재 배치 필수 검사: **9/9 완료, N/A 0, Blocked 0**

## AWS Part 4~5 배치 DoD

| 검사 | 결과 | 근거 |
| --- | --- | --- |
| 글 교정 | PASS | 한국어 Part 4~5, frontmatter·본문·표·캡션·대체 텍스트 |
| 날짜 보존 | PASS | base 대비 한영 `blog.date`와 `sidebar.order` 변경 없음 |
| 사실 검증 | PASS | Spring Cloud AWS 4.0.2 공식 문서와 현재 AWS 모듈·예제 구현 대조 |
| 소스 링크 | PASS | 한영 글의 로컬 `develop` 대상 28/28 존재 |
| 한영 정합성 | PASS | 제목·주장·코드·링크·다이어그램·시리즈 탐색 동기화 |
| 다이어그램 정적 감사 | PASS | 한영 12/12, text hazards 0, geometry·endpoint·corner 실패 0 |
| 다이어그램 구조·PNG 검사 | PASS | 직교 연결선 78개, 14×14 marker, 2배 PNG 12개 원본 확인 |
| writer 체크리스트 | PASS | dotfiles `bbd6d53`, chezmoi apply·source/live·upstream 일치 |
| 사이트 검사 | PASS | Node 테스트 33/33, Astro 오류 0, 1,303 pages build, 한영 4개 경로 HTTP 200 |
| stacked PR | PASS | #282, base `docs/korean-proofreading-aws-core-batch`, head `docs/korean-proofreading-aws-integrations-batch` |

현재 배치 필수 검사: **9/9 완료, N/A 0, Blocked 0**

## Leader Part 1~3 배치 DoD

| 검사 | 결과 | 근거 |
| --- | --- | --- |
| 글 교정 | PASS | 한국어 Part 1~3, frontmatter·본문·표·캡션·대체 텍스트 |
| 날짜 보존 | PASS | 한영 `blog.date`와 `sidebar.order` 변경 없음 |
| 사실 검증 | PASS | 현재 `bluetape4k-leader/develop`의 API·예제·README 대조 |
| 소스 링크 | PASS | 한영 글의 로컬 원천 대상 91/91 존재 |
| 한영 정합성 | PASS | 제목·주장·링크·다이어그램·시리즈 탐색 동기화 |
| 다이어그램 정적 감사 | PASS | 텍스트 28/28, sequence 4/4, architecture 20/20 |
| PNG 시각 검사 | PASS | 변경된 한영 14개 stem 원본 크기 확인 |
| writer 체크리스트 | PASS | dotfiles `59efe31`, chezmoi apply·source/live·upstream 일치 |
| 사이트 검사 | PASS | Node 테스트 21/21, Astro 0 errors, 전체 build, 한영 6개 경로 HTTP 200 |

현재 배치 필수 검사: **9/9 완료, N/A 0, Blocked 0**

## DoD

- [x] **ALL-01 — 전체 대상 수를 고정한다**
  - **Action:** 한국어 글과 기술 다이어그램을 저장소 기준으로 집계한다.
  - **Evidence:** 한국어 글 87편, 기술 다이어그램 stem 173개,
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

- [ ] **ALL-04 — 기술 다이어그램 173개를 모두 검증한다**
  - **Action:** 각 stem에 `DIA-01~08`, 한영 자산, CairoSVG PNG,
    정적 감사와 원본 크기 육안 검사를 적용한다.
  - **Evidence:** 173/173, 미검증 0, 자산별 검증 원장.
  - **Failure:** 생성 성공이나 SVG 검사만으로 완료 처리하지 않는다.

- [ ] **ALL-05 — 배치별 전달 계약을 지킨다**
  - **Action:** lessons, 글마다 writer 체크리스트 참조, 배치마다 체크리스트 보강과 chezmoi 동기화,
    Lore commit, stacked PR, exact-head CI를 배치마다 완료한다.
  - **Evidence:** 각 PR의 base/head/SHA/CI/마지막 `## DoD Status`.
  - **Failure:** 누락된 배치는 다음 배치 전에 보강한다.

- [ ] **ALL-06 — 전체 사이트를 최종 재검증한다**
  - **Action:** locale parity, diagram tests, lightbox tests, 전체 build,
    모든 변경 route와 자산 노출을 검사한다.
  - **Evidence:** 테스트·build 성공, 87개 한영 route, 173개 stem parity,
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
