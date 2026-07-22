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

### 기술 다이어그램 2: Solver 실행과 영속화 책임의 상호작용

시간축이나 생명선을 사용하는 Sequence Diagram이 아니라, 컴포넌트 카드와 연결선으로 책임 경계와
상호작용을 함께 표현한다. 다이어그램 상단 설명은 다음 문장을 사용한다.

> 컴포넌트를 연결하는 선은 책임 경계를 오가는 요청, 데이터, 콜백을 나타냅니다.

카드는 다음 세 영역으로 구성한다.

1. **요청과 최적화 실행:** 운영자, 최적화 API, `OptimizationJobService`, `SolverManager`, `Solver`
2. **영속화 경계:** 작업 저장소와 후보 해답 저장소
3. **승인과 업무 반영:** 승인 서비스와 예약·병상·시간표 업무 데이터

영속화 영역은 하나의 통합 저장소 카드로 압축하지 않는다. 문제 스냅샷·작업 상태·기준 버전을 보관하는
작업 저장소와, 가장 좋은 해답·Score·생성 시각을 보관하는 후보 해답 저장소를 별도 카드로 보여 준다.
이는 본문의 저장 단위 표와 직접 대응하며 Score 컬럼 지원을 전체 `PlanningSolution` 영속화로 오해하지
않게 한다.

연결선은 다음 상호작용을 복원한다.

- 작업 제출과 작업 ID 반환
- `problemFinder`를 통한 문제 스냅샷 조회
- 더 나은 해답 이벤트와 후보 해답·Score 저장
- 작업 상태와 후보 해답 조회
- 승인 요청과 스냅샷 버전 검증
- 업무 데이터 반영 또는 버전 충돌 후 재최적화

모든 관계는 별도 포트와 교차 없는 직각 통로를 사용한다. 요청·제어, 영속화·업무 반영, 비동기 콜백,
버전 충돌은 현재 범례 색을 유지한다. 네 역할의 화살촉은 넓은 캔버스와 확대 화면에서 방향이 분명하도록
동일한 확대 크기를 사용한다. 카드 침범, 선 교차, 공유 선분, 라벨 충돌은 각각 0건이어야 한다.

현재 workshop이 전체 저장·승인 경계를 이미 구현한 것으로 오해하지 않도록, quickstart가 제공하는
`SolverManager` 실행과 애플리케이션이 추가로 설계해야 할 저장·승인 책임을 카드의 역할 설명으로 구분한다.

## 영문 동등성

한국어 글의 승인이 끝나면 같은 slug의 영문 글을 `/blog/timefold-workshop-quickstarts-exposed-persistence/`에
제공한다. 영문판은 요약본이 아니라 한국어판과 같은 계획 모델, 점수 계층, `SolverManager` 실행 경계,
Exposed Score 저장 범위, 작업·후보 해답 저장소, 승인·업무 반영 책임을 설명한다. 코드, 수치, 표, 소스 링크와
섹션 순서는 두 언어에서 대응되어야 한다.

텍스트가 없는 hero 이미지는 공유한다. 두 기술 다이어그램은 한국어 텍스트가 포함되어 있으므로 다음 영문
자산을 별도로 만든다.

- `timefold-workshop-planning-model-comparison-01-en.svg`와 `.png`
- `timefold-workshop-solver-persistence-sequence-02-en.svg`와 `.png`

영문 다이어그램은 한국어판과 같은 카드, 연결선, 색상, 화살촉 방향과 책임 경계를 유지한다. 영문 문장 길이에
맞춰 라벨 캡슐과 카드 폭을 조정할 수 있지만, 관계를 생략하거나 저장소를 다시 합치지 않는다. 각 영문 PNG는
CairoSVG로 생성하고 한국어판과 독립적으로 전체 크기 검수와 연결선 감사를 통과해야 한다.

## 자료와 링크

독자용 자료에는 다음만 포함한다.

- `timefold-workshop` 루트와 두 quickstart 모듈
- `Stay`, `BedPlan`, `BedAllocationConstraintProvider`
- `Lesson`, `Timetable`, `TimetableController`, `TimetableConstraintProvider`
- JDBC/R2DBC Score 저장 테스트의 대표 파일
- Timefold 공식 문서 중 planning model, constraints, solver manager에 직접 필요한 문서

내부 작업 계획, raw review 자료, 이슈의 모든 메타데이터는 본문 참고 자료에 노출하지 않는다.

## 언어와 공개 범위

- 한국어 검토가 끝났으므로 이번 PR에 같은 범위의 영문 글과 영문 기술 다이어그램을 포함한다.
- hero는 언어 중립 이미지로 공유하고, 텍스트가 있는 기술 다이어그램은 언어별 SVG/PNG를 사용한다.
- 글은 독립 글이며 병원 예약 시리즈 Part 번호를 붙이지 않는다.
- 한국어·영문 동등성이 검증되면 PR 본문은 `Closes #191`을 사용한다.

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
- PR을 merge하거나 GitHub Pages에 배포하지 않는다.
