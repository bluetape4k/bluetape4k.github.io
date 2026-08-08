# Kotlin 생태계 지도 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**목표:** 평면적인 Build/Learn/Apply 카드 그리드를 관계를 인식하는 Kotlin/JVM 여정 지도로 교체하고, Go, Rust, Python을 별도의 Other languages 레일로 이동한다.

**아키텍처:** 커밋된 JSON 카탈로그를 단일 기준으로 유지하되, 명시적인 `ecosystem` 경계와 안정적인 도메인 그룹을 추가한다. Kotlin 노드는 `relations`에서 파생한 관계 경로와 함께 세 개의 시맨틱 레인으로 렌더링하고, Kotlin이 아닌 노드는 별도의 내비게이션 랜드마크로 렌더링한다. 시각적 지도에는 CSS를 사용하고, 포커스/호버에 따른 관계 강조에는 작은 progressive-enhancement 스크립트를 사용하되 접근 가능한 중첩 목록 폴백을 유지한다.

**기술 스택:** Astro 5, Starlight, JSON 카탈로그, 시맨틱 HTML, CSS custom properties, vanilla browser JavaScript, Node test runner.

---

## 파일 구조

- `src/data/ecosystem/catalog.json` 수정: 모든 노드에 `ecosystem`과 정규화된 도메인 그룹을 선언한다.
- `src/data/ecosystem/schema.mjs` 수정: 생태계 경계, 레이어 규칙, 관계 대상을 검증한다.
- `src/components/EcosystemAtlas.astro` 수정: Kotlin 레인, 관계 경로, 상세 패널, Other languages 레일을 렌더링한다.
- `src/styles/atlas.css` 수정: 지도 그리드, 경로 선, 노드 상태, 반응형 폴백, 접근성 상태를 제공한다.
- `tests/ecosystem/catalog.test.mjs` 수정: Kotlin과 기타 언어 카탈로그의 분리를 고정한다.
- `tests/ecosystem/atlas.test.mjs` 수정: 시맨틱 레인, 관계 훅, progressive-enhancement 동작을 고정한다.
- `src/content/docs/ecosystem/atlas.mdx` 및 `src/content/docs/ko/ecosystem/atlas.mdx` 수정: 새 지도와 언어 경계를 설명한다.

### 작업 1: 카탈로그 생태계 경계 설정

**파일:**
- 수정: `src/data/ecosystem/catalog.json`
- 수정: `src/data/ecosystem/schema.mjs`
- 테스트: `tests/ecosystem/catalog.test.mjs`

- [x] **1단계: 실패하는 카탈로그 테스트 작성**

모든 노드에 `ecosystem`이 있고 Kotlin 노드는 `kotlin`을 사용하며, `bluetape-go`, `bluetape-rs`, `bluetape-py`, `bluetape-go-workshop`, `bluetape-rs-workshop`이 `go`, `rust`, `python` 중 하나를 사용하는지 검증하는 단언을 추가한다. Kotlin이 아닌 노드는 `apply`를 사용할 수 없고 Kotlin 노드와 관계를 맺을 수 없다는 점도 단언한다.

- [x] **2단계: 카탈로그 테스트를 실행하고 RED 확인**

실행: `node --test tests/ecosystem/catalog.test.mjs`

예상 결과: 기존 카탈로그에 `ecosystem`이 없으므로 FAIL.

- [x] **3단계: 카탈로그 경계 구현**

각 노드에 `ecosystem: "kotlin" | "go" | "rust" | "python"`을 추가한다. Kotlin 그룹은 `Foundation`, `Data`, `Infrastructure`, `Observability`, `Learning`, `Applications`로 정규화하고, Go/Rust/Python 그룹은 언어별로 유지한다. `validateCatalogNode()`와 카탈로그 전체 검증을 확장하여 지원하지 않는 생태계와 생태계 간 관계를 거부한다.

- [x] **4단계: 카탈로그 테스트를 실행하고 GREEN 확인**

실행: `node --test tests/ecosystem/catalog.test.mjs`

예상 결과: 모든 카탈로그 테스트 통과.

- [x] **5단계: 커밋**

Kotlin 경계를 설명하는 Lore 형식의 메시지로 카탈로그, 스키마, 테스트 변경을 커밋한다.

### 작업 2: 시맨틱 단계 지도와 관계

**파일:**
- 수정: `src/components/EcosystemAtlas.astro`
- 테스트: `tests/ecosystem/atlas.test.mjs`

- [x] **1단계: 실패하는 컴포넌트 테스트 작성**

렌더링된 소스에 Kotlin 지도 랜드마크, Build/Learn/Apply용 세 레인 요소, 관계 훅(`data-node-id`, `data-relations`, `data-route-from`, `data-route-to`), 라이브 상세 패널, Go/Rust/Python 레이블을 포함한 별도의 Other languages 랜드마크가 있는지 단언한다.

- [x] **2단계: 아틀라스 테스트를 실행하고 RED 확인**

실행: `node --test tests/ecosystem/atlas.test.mjs`

예상 결과: 현재 컴포넌트가 세 개의 카드 열과 필터만 렌더링하므로 FAIL.

- [x] **3단계: 단계 지도 구현**

카탈로그 노드를 `ecosystem`별로 분할한다. 하나의 지도 표면에 Kotlin Build/Learn/Apply 레인을 렌더링하고, 각 레인 안에서 노드를 그룹화하며, Kotlin 노드에서 고유한 관계 쌍을 도출하고, 소스와 대상에 해당하는 키로 장식용 경로 요소를 출력한다. 현지화된 지도 범례와 단계 설명, Kotlin 생태계 요약을 기본값으로 하는 상세 패널을 추가한다. Go, Rust, Python은 Kotlin 지도 아래에 독립된 언어 트랙으로 렌더링한다.

- [x] **4단계: progressive 관계 강조 추가**

숨김/표시 필터 스크립트를 포커스, 포인터, 클릭 핸들러로 교체한다. 이 핸들러는 `data-active-node`를 설정하고, 관련 노드/경로에 `data-active`를 표시하며, 관련 없는 노드를 흐리게 하고, 현지화된 상세 패널을 갱신한다. Escape로 선택을 해제할 수 있고 포인터가 떠나도 키보드/클릭 선택은 해제되지 않는지 확인한다.

- [x] **5단계: 아틀라스 테스트를 실행하고 GREEN 확인**

실행: `node --test tests/ecosystem/atlas.test.mjs`

예상 결과: 모든 아틀라스 컴포넌트 테스트 통과.

- [x] **6단계: 커밋**

단계별 여정 상호작용을 설명하는 Lore 형식의 메시지로 컴포넌트와 테스트를 커밋한다.

### 작업 3: 시각적 지도 시스템과 반응형 폴백

**파일:**
- 수정: `src/styles/atlas.css`
- 테스트: `tests/ecosystem/atlas.test.mjs`

- [x] **1단계: 실패하는 스타일 단언 작성**

스타일이 세 레인 그리드, 경로 레이어, 활성/흐림 노드 상태, 구분된 Other languages 레일, 키보드 포커스, 고대비 처리, 동작 축소, 장식용 경로를 숨기고 레인을 쌓는 모바일 중단점을 정의하는지 단언한다.

- [x] **2단계: 아틀라스 테스트를 실행하고 RED 확인**

실행: `node --test tests/ecosystem/atlas.test.mjs`

예상 결과: 기존 스타일시트가 일반적인 세 열 카드 그리드만 정의하므로 FAIL.

- [x] **3단계: 시각 시스템 구현**

CSS grid와 custom properties를 사용해 은은한 좌표 그리드, 단계 헤더, 위치 표식과 같은 압축형 노드, 방향성 레인 연결선, 시각적으로 안쪽에 배치된 Other languages 레일을 갖춘 어두운 기술 지도를 만든다. 관계 경로 요소는 작성된 SVG 없이 CSS로 그린 가로/대각선 경로로 사용한다. 활성, 관련, 선택, 흐림 상태를 명확히 추가한다.

- [x] **4단계: 반응형 및 접근성 상태 구현**

모바일 중단점에서는 단계를 쌓고 장식용 경로 도형을 숨기되 시맨틱 목록과 노드 설명을 유지한다. 동작 축소 환경에서는 변환을 비활성화하고, 고대비 환경에서는 테두리를 강화한다.

- [x] **5단계: 아틀라스 및 카탈로그 테스트를 실행하고 GREEN 확인**

실행: `node --test tests/ecosystem/*.test.mjs`

예상 결과: 모든 생태계 테스트 통과.

- [x] **6단계: 커밋**

시각적 계층을 설명하는 Lore 형식의 메시지로 스타일시트와 테스트 변경을 커밋한다.

### 작업 4: 페이지 문구, 통합, 브라우저 검증

**파일:**
- 수정: `src/content/docs/ecosystem/atlas.mdx`
- 수정: `src/content/docs/ko/ecosystem/atlas.mdx`
- 검증: `src/content/docs/index.mdx`
- 검증: `src/content/docs/ko/index.mdx`

- [x] **1단계: 실패하는 페이지 문구 단언 작성**

아틀라스 테스트를 확장하여 두 로케일 페이지 모두에 Kotlin/JVM 범위 문구와 Other languages 설명이 있어야 한다고 검증한다.

- [x] **2단계: 테스트를 실행하고 RED 확인**

실행: `node --test tests/ecosystem/atlas.test.mjs`

예상 결과: 현재 페이지가 모든 저장소를 하나의 생태계로 설명하므로 FAIL.

- [x] **3단계: 두 로케일 페이지 갱신**

기본 지도가 Kotlin/JVM을 대상으로 하고, 주요 여정이 Build → Learn → Apply이며, Go/Rust/Python은 별도로 표시되는 자매 언어 생태계라는 점을 설명한다.

- [x] **4단계: 전체 자동 검증 실행**

실행: `BLUETAPE4K_PROJECTS_SOURCE=/Users/debop/work/bluetape4k/bluetape4k-projects/.worktrees/feature-all-module-manuals npm test`

실행: `npm run check:manual`

실행: `npm run build`

예상 결과: 테스트가 통과하고 스냅샷에 90개 모듈과 186개 현지화 파일이 보고되며 Astro 정적 빌드가 완료된다.

- [x] **5단계: 브라우저에서 검증**

개발 서버를 `http://127.0.0.1:4321/`에서 실행 상태로 유지한다. 데스크톱과 모바일 너비에서 `/ecosystem/atlas/` 및 `/ko/ecosystem/atlas/`를 검증한다. 포인터와 키보드로 하나의 관계 경로가 강조되고, Other languages가 시각적으로 분리되며, 모바일 레이아웃이 읽기 쉽고, 콘솔에 오류가 없는지 확인한다.

- [x] **6단계: 커밋**

자동 및 브라우저 검증 결과를 기록하는 Lore 형식의 메시지로 로케일 문구와 최종 통합 수정을 커밋한다.

### 작업 5: 최종 검토와 브랜치 완료

**파일:**
- `98c964e` 이후의 모든 변경을 검토한다.

- [x] **1단계: 사양 준수 검토 실행**

force-directed graph나 새 의존성을 추가하지 않고 구현이 승인된 최상위 B 흐름, 더 깊은 A/C 구조, Other languages 분리를 충족하는지 확인한다.

- [x] **2단계: 코드 품질 검토 실행**

시맨틱 HTML, 카탈로그 검증, 스크립트 정리, CSS 유지보수성, 현지화 패리티, 테스트 구체성을 점검한다. 중요한 발견 사항을 모두 해결하고 영향을 받은 테스트를 다시 실행한다.

- [x] **3단계: 깨끗한 완료 상태 검증**

실행: `git diff --check && ~/.local/bin/repo-status`

예상 결과: 공백 오류가 없고 커밋 이후 기능 worktree가 깨끗하다.
