# Timefold Solver 실패 결과 보강 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 한글·영문 글에 Solver 종료, 실행 가능성, 최적성 미확인, 실행 예외, 취소를 구분하는 운영 판정 기준을 추가한다.

**Architecture:** 현재 글의 `SolverManager` 실행 설명 바로 뒤에 독립 섹션을 넣는다. 두 언어는 같은 결과 분류 표와 판정 순서를 사용하며, 현재 소스의 `withExceptionHandler`와 Timefold 공식 종료·Score 의미를 근거로 삼는다. 다이어그램은 변경하지 않는다.

**Tech Stack:** Astro, Starlight, MDX, Timefold Solver 2.2, Kotlin

---

### Task 1: 설계와 근거 고정

**Files:**
- Modify: `docs/superpowers/specs/2026-07-22-timefold-workshop-quickstarts-persistence-design.md`

- [x] **Step 1: 결과 분류를 설계에 추가**

실행 가능 해 없음, 실행 가능하지만 최적성 미확인, 실행 실패, 취소를 구분하고 `SolverStatus`만으로 승인하지 않는 판정 순서를 기록한다.

- [x] **Step 2: 현재 소스와 공식 문서를 확인**

`TimetableController.withExceptionHandler`, Timefold Score 실행 가능성, 메타휴리스틱 종료 의미를 현재 소스와 공식 문서에서 확인한다.

### Task 2: 한글 본문 보강

**Files:**
- Modify: `src/content/docs/ko/blog/timefold-workshop-quickstarts-exposed-persistence.mdx`

- [x] **Step 1: 실패 결과 분류 섹션 추가**

`Solver 실행을 API 요청과 분리한다` 다음에 결과 분류 표와 운영 판정 순서를 추가한다.

- [x] **Step 2: 현재 예외 처리 코드를 설명**

quickstart가 `withExceptionHandler`로 예외를 작업에 남긴다는 사실과, 실제 서비스가 재시도 가능성·원인·부분 저장 정리를 추가로 설계해야 한다는 경계를 설명한다.

- [x] **Step 3: 자연스러운 한국어 검수**

실행 종료와 최적화 성공을 혼동하지 않도록 용어를 통일하고, 번역투·홍보성 표현·불필요한 강조를 제거한다.

### Task 3: 영문 동등성 반영

**Files:**
- Modify: `src/content/docs/blog/timefold-workshop-quickstarts-exposed-persistence.mdx`

- [x] **Step 1: 같은 결과 분류와 판정 순서 추가**

한국어판의 네 결과, 운영 판정 순서, 코드 근거, 공식 문서 링크를 자연스러운 영어로 옮긴다.

- [x] **Step 2: 로케일 동등성 검사**

두 글의 `##` 제목, 표, 코드 블록, 링크 수와 새 섹션의 기술 의미가 대응하는지 비교한다.

### Task 4: 사이트와 PR 검증

**Files:**
- Verify: `src/content/docs/ko/blog/timefold-workshop-quickstarts-exposed-persistence.mdx`
- Verify: `src/content/docs/blog/timefold-workshop-quickstarts-exposed-persistence.mdx`

- [x] **Step 1: 형식과 빌드 검사**

Run:

```bash
git diff --check
npm run build
```

Expected: diff 오류 없음, Astro diagnostics 오류·경고 없음.

- [x] **Step 2: 로컬 경로 검사**

한글 `/ko/blog/timefold-workshop-quickstarts-exposed-persistence/`와 영문 `/blog/timefold-workshop-quickstarts-exposed-persistence/`가 HTTP 200이고 새 제목과 표를 포함하는지 확인한다.

- [x] **Step 3: 커밋과 기존 PR 갱신**

Lore 형식의 영문 커밋으로 변경을 묶고 현재 브랜치를 push한다. PR #251 본문의 검증 결과와 exact head를 갱신하고, CI·리뷰·스레드 상태를 다시 확인한다.
