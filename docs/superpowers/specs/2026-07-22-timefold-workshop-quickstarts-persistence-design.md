# Timefold Workshop Quickstarts와 Exposed 영속화 블로그 설계

## 목적

GitHub Issue #191의 주제를 현재 `timefold-workshop` 소스에 맞춰 한국어 기술 글로 작성한다.
Timefold 예제를 실행하는 방법만 나열하지 않고, 서로 다른 최적화 문제를 어떻게 모델링하며 Solver의 결과를
애플리케이션과 데이터베이스 경계에서 어떻게 다뤄야 하는지 설명한다.

이번 작업은 글과 시각 자료를 검증한 뒤 Pull Request를 만드는 데서 끝낸다. PR을 merge하거나 사이트에
배포하지 않는다.

## 독자와 중심 질문

주요 독자는 Timefold quickstart를 실행해 봤지만 실제 서비스에 적용할 때 도메인 모델, 제약 조건,
비동기 실행, 저장 책임을 어디에서 나눠야 할지 고민하는 Kotlin/Spring 개발자다.

글은 다음 질문에 답한다.

> 병상 배정과 학교 시간표처럼 모양이 다른 계획 문제를 Timefold 모델로 어떻게 표현하고, Solver가 만든
> 점수와 해답을 Exposed 기반 애플리케이션의 저장 경계로 어떻게 가져갈 것인가?

## 현재 소스에서 확인한 사실

기준 저장소는 `bluetape4k/timefold-workshop`의 `develop` 브랜치다. 글 작성 시점의 로컬 기준 커밋은
`79eeac7`이며, 최종 PR 전에 원격 `develop`을 다시 확인한다.

### 병상 배정

- `Stay`는 `@PlanningEntity`이고 `bed`가 `@PlanningVariable(allowsUnassigned = true)`이다.
- `BedPlan`은 `HardMediumSoftScore`를 사용한다.
- 병상 중복, 성별 제한, 진료과 연령 제한, 필수 장비는 Hard 제약이다.
- 병상 미배정은 Medium 제약이며, 병실 수용 인원·진료과 우선순위·선호 장비는 더 나은 해답을 고르는
  계층으로 표현된다.
- `BedAllocationConstraintProviderTest`는 각 업무 규칙을 `ConstraintVerifier`로 따로 검증한다.

### 학교 시간표

- `Lesson`은 `@PlanningEntity`이고 `timeslot`과 `room`이 계획 변수다.
- `Timetable`은 `HardSoftScore`를 사용한다.
- 교실·교사·학생 그룹의 같은 시간 충돌은 Hard 제약이다.
- 교사의 교실 안정성, 수업 사이의 빈 시간, 학생 그룹의 과목 분산은 Soft 제약이다.
- `TimetableController`는 `SolverManager`로 비동기 작업을 시작하고 job ID로 상태와 결과를 조회한다.
- 현재 controller의 `ConcurrentHashMap`은 영구 저장소가 아니며 코드에도 TTL 부재가 TODO로 남아 있다.

### Exposed 예제의 실제 범위

- `exposed/jdbc-examples`와 `exposed/r2dbc-examples`는 완전한 계획 해답 저장소를 구현하지 않는다.
- 현재 예제는 Timefold의 `SimpleScore`, `HardSoftScore`, `HardMediumSoftScore`, `BendableScore`와
  BigDecimal 변형을 Exposed 컬럼에 저장하고 다시 읽는 계약을 검증한다.
- JDBC 예제는 Exposed DAO와 blocking transaction을 사용한다.
- R2DBC 예제는 Exposed R2DBC DSL과 suspend transaction 경계를 사용한다.
- 따라서 글은 “전체 Solver 해답이 이미 영속화된다”고 주장하지 않는다. 현재 검증된 Score 컬럼 지원과,
  실제 애플리케이션에서 별도로 설계해야 할 문제 입력·작업 상태·최종 배정 저장 책임을 구분한다.

## 글의 서술 구조

1. **문제 제기:** quickstart의 해답 객체를 얻는 것과 운영 가능한 기능을 만드는 것은 다르다.
2. **두 문제 비교:** 병상 배정은 한 입원 기간에 하나의 병상을 고르고, 시간표는 수업마다 시간과 교실을
   함께 고른다.
3. **모델 번역:** Planning Entity, Planning Variable, Problem Fact, Score를 두 예제에 대응한다.
4. **제약 조건 비교:** `HardMediumSoftScore`와 `HardSoftScore`가 업무 우선순위를 어떻게 드러내는지 설명한다.
5. **실행 경계:** `SolverManager`의 job ID 기반 비동기 실행과 메모리 저장소의 한계를 살펴본다.
6. **영속화 경계:** 현재 Exposed 예제가 보장하는 Score 컬럼 round-trip과 보장하지 않는 전체 해답 저장을
   나눈다.
7. **애플리케이션 설계:** 문제 입력, Solver 작업, 최고 해답, 승인된 업무 상태를 한 테이블에 섞지 않는
   저장 모델을 제안한다.
8. **테스트와 리뷰:** Constraint Verifier, Score 컬럼 round-trip, job lifecycle, 재시작·동시 업데이트에서
   확인할 항목을 정리한다.
9. **선택 기준:** 데모를 실제 기능으로 옮길 때 필요한 체크리스트로 끝낸다.

## 시각 자료

### 대표 이미지

기존 bluetape4k 기술 글의 3D 미니어처 작업대 스타일을 따른다. 한쪽에는 병상 배정 보드, 다른 쪽에는 학교
시간표 보드가 있고, 가운데 Solver 장치에서 나온 결과를 데이터베이스 저장 장치로 옮기는 장면을 구성한다.
대표 이미지에는 읽어야 하는 텍스트를 넣지 않는다.

### 기술 다이어그램 1: 두 계획 문제의 모델 비교

병상 배정과 학교 시간표를 다음 열로 비교한다.

- 업무 질문
- 계획 대상
- 계획 변수
- 문제 정보
- 점수 계층
- 대표 제약

이 다이어그램은 정적 architecture/comparison 형태로 만들고 어두운 배경, 한국어 설명, 실제 클래스 이름을
사용한다.

### 기술 다이어그램 2: Solver 실행과 영속화 책임의 경계

다음 순서를 Sequence Diagram으로 표현한다.

1. API가 문제 입력을 검증한다.
2. 애플리케이션이 작업 ID와 문제 snapshot을 저장한다.
3. `SolverManager`가 문제를 읽어 Solver를 실행한다.
4. 최선 해답과 Score를 작업 결과로 갱신한다.
5. 사용자가 결과를 조회하고 승인한다.
6. 승인된 배정만 업무 데이터에 반영한다.

현재 workshop이 2~6 전체를 구현한 것으로 오해하지 않도록, “현재 quickstart”, “현재 Score persistence
예제”, “실제 서비스에서 추가할 경계”를 시각적으로 구분한다.

## 자료와 링크

독자용 자료에는 다음만 포함한다.

- `timefold-workshop` 루트와 두 quickstart 모듈
- `Stay`, `BedPlan`, `BedAllocationConstraintProvider`
- `Lesson`, `Timetable`, `TimetableController`, `TimetableConstraintProvider`
- JDBC/R2DBC Score 저장 테스트의 대표 파일
- Timefold 공식 문서 중 planning model, constraints, solver manager에 직접 필요한 문서

내부 작업 계획, raw review 자료, 이슈의 모든 메타데이터는 본문 참고 자료에 노출하지 않는다.

## 언어와 공개 범위

- 이번 PR은 한국어 글 하나를 우선 작성한다.
- Issue #191의 영어 parity 항목은 한국어 검토 후 별도 PR에서 처리할 수 있도록 PR 본문에 남긴다.
- 글은 독립 글이며 병원 예약 시리즈 Part 번호를 붙이지 않는다.
- PR 본문은 `Closes #191` 대신 `Refs #191`을 사용한다. 영어 글 parity가 남기 때문에 이번 PR merge만으로
  이슈를 자동 종료하지 않는다.

## 검증

- 사실 검증: 모든 클래스·제약·Score·저장 방식이 현재 `timefold-workshop` 소스와 일치하는지 확인한다.
- 시각 검증: SVG/PNG 렌더링, 텍스트 겹침, 연결선, 확대 UI와 다이어그램 제목을 확인한다.
- 문장 검증: 한국어 자연스러움 검토에서 식별자·링크·숫자·기술적 한계를 보존한다.
- 사이트 검증: `git diff --check`, `npm run build`, 새 로컬 route와 모든 asset HTTP 200을 확인한다.
- PR 검증: assignee `debop`, issue의 `documentation`·`enhancement` 라벨, `develop` base, 최종
  `## DoD Status` 섹션을 확인한다.

## 비목표

- `timefold-workshop` 소스 코드를 변경하지 않는다.
- 새로운 영속화 모듈이나 production repository를 구현하지 않는다.
- 실제 운영 성능이나 Solver 품질 benchmark를 주장하지 않는다.
- 영어 글을 같은 PR에 넣지 않는다.
- PR을 merge하거나 GitHub Pages에 배포하지 않는다.
