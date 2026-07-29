# 한국어 블로그 교정 배치 02 계획

## 범위와 근거

- 작업 유형: Type E — 공개 블로그 문서·차트 자산 유지보수
- 승인 근거: 사용자가 오래된 글부터 한두 편씩 교정하고, 한국어 기술 다이어그램을 교정·다크 스타일로 전환하며, 누적 PR 하나만 병합해 한 번 배포하자고 승인했다.
- 기준 브랜치: `docs/korean-proofreading-ai-environment`
- 작업 브랜치: `docs/korean-proofreading-ecosystem-graphdb`
- 대상 순서: 2026-05-20 생태계 소개 글, 2026-05-28 GraphDB 도입 글

## 독자 질문과 보존 항목

| 대상 | 독자 질문 | 보존할 사실·범위 | 제외 |
|---|---|---|---|
| 생태계 소개 | 어떤 경계부터 Bluetape4k 모듈을 읽고 선택할까? | 저장소·모듈 이름, 계층 구조, 링크와 글의 주장 | 대표 이미지, 새로운 기술 주장 |
| GraphDB 도입 | 어떤 탐색 형태에서 GraphDB 추가 평가가 타당한가? | `long-chain`/`deep-wide` 값, AGE 시간 초과, Memgraph 적재 실패, 벤치마크 한계 | 대표 이미지, 벤치마크 재측정, 결론 확대 |

GraphDB 차트의 근거는 `bluetape4k-graph/docs/benchmark/2026-05-28-graphdb-adoption-decision-report.md`의 large fixture `resolveResources` 표다. `long-chain`의 Neo4j/CTE/iterative 값은 각각 12.731/55.364/47.568이고, `deep-wide`의 값은 56.467/11.596/27.836이다. 단위는 `ms/op`이며 낮을수록 좋다.

## 실행 순서

1. 두 한국어 글을 문단 단위로 교정한다. 식별자와 제품명은 그대로 두고, 일반 영어 명사·번역체·부정확한 기술 표현만 기술 문서에 맞는 한국어로 바꾼다.
   - **Expected DoD:** 주장, 수치, 링크, 코드가 유지되고 문장이 한국어 기술 글의 문체로 읽힌다.
2. GraphDB 차트를 한국어·영어 별도 SVG/PNG로 다시 만든다. 어두운 배경, 판독 가능한 단위·범례·실패 주석을 사용하고 원래 값과 막대 비례를 모두 대조한다.
   - **Expected DoD:** 독자가 두 시나리오의 승자와 비교 대상, `ms/op` 방향, AGE·Memgraph의 비정상 결과를 즉시 읽을 수 있다.
3. 두 GraphDB 글에서 차트를 `bt4k-chart`로 분류하고, 각각 현지화한 `data-diagram-title`을 지정한다. 대표 이미지는 계속 `bt4k-blog-hero`로 남긴다.
   - **Expected DoD:** 기술 차트만 확대 UI 대상이며 대표 이미지는 제외된다.
4. 회귀 테스트를 추가하고 SVG/XML·렌더·차트 값·전체 크기 PNG·사이트 빌드·변경 라우트를 검증한다.
   - **Expected DoD:** 차트의 의미와 접근성 분류, 한국어·영어 자산 분리가 자동·시각 검증으로 확인된다.
5. 계획과 교정 결과를 분리해 커밋한다. 로컬 미리보기를 제공하고, 검토가 끝나면 앞선 스택 PR을 기반으로 후속 PR을 만든다.
   - **Expected DoD:** 누적 병합 전까지는 배포하지 않으며, 최종 PR의 CI는 `develop` 재대상화 뒤 한 번만 실행한다.

## 검증 체크리스트

- [ ] **CG-01 — 권한과 작업 경계 재확인**
  - **Action:** 작업 트리·브랜치·승인 범위·제외 자산을 확인한다.
  - **Evidence:** `repo-status`, 현재 브랜치, 본 계획.
  - **Failure:** 편집 전에 범위를 복구한다.
- [ ] **CG-02 — 현재·과거 근거 조회**
  - **Action:** GNO와 직접 소스에서 벤치마크·스택 PR 근거를 확인한다.
  - **Evidence:** GNO 무결과 및 `bluetape4k-graph` 벤치마크 보고서의 값.
  - **Failure:** 값·해석을 변경하지 않는다.
- [ ] **CG-03 — 사용자 작업과 격리 보호**
  - **Action:** 분리 작업 트리의 기능 브랜치에서만 수정한다.
  - **Evidence:** 깨끗한 작업 트리, `develop`이 아닌 브랜치.
  - **Failure:** 작업을 중단하고 격리한다.
- [ ] **CG-04 — 언어·시각 정책 적용**
  - **Action:** 한국어 독자용 문체, 로케일별 자산, 다크 차트, 대표 이미지 제외 정책을 적용한다.
  - **Evidence:** 수정 파일과 렌더 결과.
  - **Failure:** 범위를 벗어난 자산을 되돌린다.
- [ ] **CG-05 — 기존 패턴 재사용**
  - **Action:** 기존 `bt4k-chart`, 제목 속성, SVG→PNG 파이프라인을 따른다.
  - **Evidence:** 기존 테스트·차트 패턴과 새 자산 비교.
  - **Failure:** 새 UI 또는 의존성을 추가하지 않는다.
- [ ] **CG-06 — 공개 문서 계약 확인**
  - **Action:** 한국어·영어 차트 제목, 자산, figure 분류를 함께 갱신한다.
  - **Evidence:** 두 MDX와 PNG/SVG 경로.
  - **Failure:** 로케일·접근성 불일치를 고친다.
- [ ] **CG-07 — 회귀 계약과 표적 검증**
  - **Action:** 차트 제목·유형 회귀 테스트를 추가하고 SVG/PNG/값을 검증한다.
  - **Evidence:** 실패 후 통과한 테스트, XML·렌더·정규화·시각 점검.
  - **Failure:** 수정으로 되돌아간다.
- [ ] **CG-08 — 고비용 검사 직렬화**
  - **Action:** 해당 없음. 사이트 테스트·빌드는 단일 작업 트리에서 순차 실행한다.
  - **Evidence:** 단일 실행 로그.
  - **Failure:** 병렬 결과를 증거로 쓰지 않는다.
- [ ] **CG-09 — 교훈 게이트**
  - **Action:** 기존 한국어 자연스러움 체크리스트가 새 반복 문제를 포착하는지 평가한다.
  - **Evidence:** 새 일반화 규칙 필요 여부와 근거.
  - **Failure:** 반복 가능한 누락이면 별도 개선한다.
- [ ] **CG-10 — PR 전 최종 검증**
  - **Action:** 전체 diff·테스트·빌드·라우트·한국어 교정을 다시 확인하고 커밋한다.
  - **Evidence:** 명령 결과와 커밋 SHA.
  - **Failure:** PR 생성을 보류한다.
- [ ] **CG-11~CG-18 — 스택 PR·CI·병합**
  - **Action:** 로컬 검토 후 앞선 스택 PR을 기반으로 PR을 만들고, 누적 PR만 `develop`으로 재대상화해 CI·검토·사용자 병합 승인을 받는다.
  - **Evidence:** PR URL, 재대상화된 CI, 명시적 최종 병합 승인.
  - **Failure:** 이 배치에서 배포·자동 병합을 하지 않는다.

## 차트 설계 결정

- SVG→PNG를 유지한다. 두 패널의 막대 길이는 각 패널 내 최대값에 비례하므로, 절대 성능을 패널 간 막대 길이로 비교하지 않는다는 설명을 차트 안에 둔다.
- 각 패널은 같은 세 후보(Neo4j Cypher, PostgreSQL CTE, PostgreSQL iterative)를 같은 색으로 보인다. `AGE: 75초 초과`, `Memgraph: 로컬 대용량 적재 실패`는 값을 숨기지 않는 실패 주석으로 남긴다.
- 한국어 차트 제목은 `GraphDB 도입 판단용 권한 상속 지연 시간 비교`, 영어 차트 제목은 `Authorization inheritance latency comparison for GraphDB adoption`으로 한다.
- 한국어 SVG는 `goorm Sans`/`goorm Sans Code`, 영어 SVG는 `goorm Sans`/`goorm Sans Code`를 사용해 CairoSVG 렌더 시 글자 누락을 피한다.
