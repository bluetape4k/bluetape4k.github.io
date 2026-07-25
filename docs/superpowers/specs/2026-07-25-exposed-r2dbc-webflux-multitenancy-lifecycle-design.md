# Spring WebFlux 멀티테넌시와 테넌트 생명주기 블로그 설계

## 목표

`exposed-r2dbc-workshop`의 Spring WebFlux 멀티테넌시 예제를 바탕으로,
요청의 `X-TENANT-ID`가 Reactor Context와 Kotlin Coroutine을 거쳐 안전하게
데이터베이스 선택까지 전달되는 과정을 설명한다.

여기에 tenant 접근 권한 검증과 신규 tenant 온보딩을 연결하여, tenant context를
단순한 헤더 문자열이 아니라 식별·권한·자원·운영 상태를 묶는 서비스 계약으로
설명한다.

이 글은 GitHub Issue #189를 해결하는 한국어·영어 블로그 글과 현지화된 기술
다이어그램을 설계한다. 이번 작업은 PR 생성까지만 진행하며 머지와 배포는 범위에서
제외한다.

## 대상 독자

- Kotlin Coroutine과 R2DBC를 사용하는 멀티테넌트 서비스 개발자
- Spring WebFlux에서 요청 범위 정보를 안전하게 전달하는 방법을 찾는 개발자
- tenant별 데이터 격리뿐 아니라 권한과 온보딩까지 운영 관점에서 설계하려는 개발자

Spring WebFlux나 Reactor Context에 익숙하지 않은 독자도 따라올 수 있도록,
프레임워크 용어보다 요청 한 건이 이동하는 경로를 먼저 보여준다.

## 글이 답할 질문

1. HTTP 요청의 tenant 식별자는 어디에서 검증하고 저장하는가?
2. Reactor 기반 요청이 `suspend` 함수로 넘어갈 때 tenant 정보는 어떻게 유지되는가?
3. 인증된 사용자가 요청한 tenant에 접근할 권한이 있는지는 언제 확인하는가?
4. 검증된 tenant는 schema 또는 tenant별 `ConnectionFactory`를 어떻게 선택하는가?
5. 신규 tenant의 metadata와 DB 자원은 어떻게 준비하고 안전하게 공개하는가?
6. 온보딩 도중 실패하면 부분 생성 자원을 어떻게 정리하고 재시도하는가?

## 범위

- `X-TENANT-ID` 정규화와 검증
- `WebFilter.contextWrite`를 이용한 Reactor Context 저장
- `coroutineContext[ReactorContext]`를 이용한 tenant 복원
- 요청 tenant와 인증 주체의 접근 가능 tenant 비교
- 권한 검증 이후의 schema 또는 `ConnectionFactory` 선택
- 공유 DB·tenant별 schema와 tenant별 `ConnectionFactory` 전략 비교
- 신규 tenant metadata 예약과 `PREPARING` 상태
- schema, DB, connection pool, migration 준비와 검증
- routing registry 공개와 `ACTIVE` 전환
- 온보딩 실패 시 `FAILED` 기록, 부분 자원 정리와 안전한 재시도
- 컨텍스트 전파, 동시 요청 격리, 권한, 비활성 tenant, 온보딩 실패 테스트
- 기존 Ktor 글과 carrier 차이를 보여주는 짧은 비교

## 범위에서 제외할 내용

- 기존 Ktor 글에서 설명한 `ApplicationCall.attributes`와 Ktor plugin 구현의 반복
- Ktor routing datasource 전체 구현 재설명
- 모든 소스 클래스와 테스트 raw data의 본문 복사
- 특정 멀티테넌시 격리 전략이 모든 서비스에 우월하다는 결론
- Issue #189 범위를 넘어서는 멀티리전 tenant 배치나 과금 시스템 설계
- PR 머지와 운영 배포

## 기존 글과의 관계

기존 `exposed-r2dbc-ktor-multitenant-routing-patterns` 글은 Ktor 요청의 tenant를
`ApplicationCall.attributes`에 저장하고 handler와 transaction helper에 명시적으로
전달하는 방식을 설명한다. 해당 글은 WebFlux가 Reactor Context를 사용한다고 비교
수준에서만 언급하며, Reactor Context가 Coroutine으로 이어지는 실제 전파 과정이나
tenant 권한·온보딩 생명주기는 다루지 않는다.

새 글은 다음 경계를 본문 주제로 삼아 중복을 피한다.

```text
X-TENANT-ID
→ WebFilter
→ Reactor Context
→ Coroutine
→ tenant 권한 검증
→ schema 또는 ConnectionFactory 선택
→ Repository
```

Ktor 방식은 글 후반의 비교표와 기존 글 링크로만 연결한다. 두 runtime의 carrier는
다르지만 입력 검증, 권한 확인, DB 선택, tenant 격리 테스트라는 불변식은 같다는 점을
강조한다.

## 제목

한국어 가제:

> Spring WebFlux 멀티테넌시: Reactor Context 전파에서 테넌트 온보딩까지

영어 가제:

> Spring WebFlux Multi-Tenancy: From Reactor Context Propagation to Tenant Onboarding

최종 제목은 글 작성 후 실제 내용과 검색 가독성을 기준으로 다듬되, Reactor Context,
멀티테넌시, tenant 온보딩이라는 세 축을 유지한다.

## 본문 구성

### 1. 멀티테넌시의 출발점은 헤더가 아니다

`X-TENANT-ID`는 caller가 tenant를 주장하는 입력일 뿐 신뢰할 수 있는 tenant
context가 아니다. 헤더 검증, 사용자 인증, tenant 접근 권한 확인이 서로 다른
책임임을 먼저 설명한다.

### 2. WebFlux에서는 요청과 스레드가 일치하지 않는다

비동기 요청 처리에서 `ThreadLocal`이 안전한 요청 범위 carrier가 될 수 없는 이유와
Reactor Context의 역할을 요청 흐름 중심으로 설명한다.

### 3. Reactor Context에서 Coroutine까지 tenant를 전달한다

다음 경로를 실제 workshop 코드와 함께 단계별로 설명한다.

```text
WebFilter
→ contextWrite
→ suspend controller/service
→ coroutineContext[ReactorContext]
→ tenant transaction
```

`TenantId`가 `CoroutineContext.Element`를 구현한다는 사실과 Reactor Context 안에
`TenantId`가 저장되는 방식을 구분하여, 두 context가 자동으로 같은 저장소가 된다는
오해를 만들지 않는다.

### 4. tenant 식별과 접근 권한은 같은 문제가 아니다

지원되는 tenant ID라도 현재 사용자가 접근할 수 없다면 거부해야 한다. 인증 주체의
허용 tenant와 요청 tenant를 비교하고, DB 라우팅보다 권한 검증이 먼저 수행되어야
하는 이유를 설명한다.

### 5. 검증된 tenant가 DB 연결을 선택한다

공유 DB·tenant별 schema와 tenant별 `ConnectionFactory`를 다음 기준으로 비교한다.

| 전략 | 장점 | 비용 |
|---|---|---|
| 공유 DB·tenant별 schema | 자원 효율과 비교적 단순한 운영 | connection 상태 초기화와 schema 누수 방지가 필요하다 |
| tenant별 `ConnectionFactory` | 연결 자원과 장애 범위를 더 강하게 격리한다 | pool 수 증가와 동적 자원 관리 부담이 생긴다 |

tenant 수, 규제 수준, 장애 격리 요구와 운영 비용에 따라 선택하도록 설명하며 우열로
단순화하지 않는다.

### 6. 신규 tenant는 라우팅 목록에 어떻게 들어오는가

요청 처리에서 온보딩 생명주기로 주제를 확장한다. 등록되지 않은 tenant를 일반 요청
시점에 즉석 생성하는 방식이 지연, 중복 생성, 부분 실패를 초래하는 이유를 설명한다.

### 7. 온보딩은 준비와 공개를 분리한다

다음 절차를 중심으로 설명한다.

```text
metadata 예약
→ PREPARING 기록
→ schema 또는 DB·pool 구성
→ migration·연결 검증
→ routing registry 등록
→ ACTIVE 전환
```

`ACTIVE`가 되기 전에는 일반 요청에서 해당 tenant를 선택하지 못하도록 준비 단계와
공개 단계를 분리한다.

### 8. 온보딩 실패를 운영 가능한 상태로 남긴다

pool 생성, migration, registry 공개 실패를 구분한다. 생성된 자원을 정리하고
`FAILED` 상태와 실패 원인을 남기며, 같은 온보딩 요청이 재실행되어도 schema나 pool이
중복 생성되지 않는 멱등성 기준을 설명한다.

### 9. 테스트는 정상 응답보다 경계를 증명해야 한다

테스트가 다음 사실을 증명해야 한다.

- Reactor Context의 tenant가 Coroutine 경계에서도 유지된다.
- 동시에 처리되는 요청의 tenant 정보가 섞이지 않는다.
- 권한 없는 tenant 접근은 DB 선택 전에 거부된다.
- `PREPARING`과 `FAILED` tenant는 일반 요청에서 라우팅되지 않는다.
- 온보딩 실패 후 부분 생성 자원이 정리된다.
- 재시도가 중복 pool이나 schema를 만들지 않는다.

### 10. Ktor와 비교하면 carrier만 다르다

Ktor의 `ApplicationCall.attributes`와 명시적인 값 전달, WebFlux의 Reactor Context와
Coroutine bridge를 짧게 비교한다. runtime 도구보다 검증·권한·격리·테스트라는
불변식을 재사용해야 함을 설명한다.

### 11. tenant context는 운영 계약이다

tenant 식별부터 권한, DB 선택, 온보딩 상태까지 한 흐름으로 정리한 절차표로
마무리한다.

## 다이어그램 설계

### 다이어그램 1: 요청 컨텍스트 전파와 권한 검증

카드와 연결선을 이용해 한 요청의 상호작용을 표현한다.

```text
HTTP 요청
X-TENANT-ID + 인증 정보
        ↓
TenantFilter
헤더 정규화·tenant 확인
        ↓
Reactor Context
TenantId 저장
        ↓
Coroutine Controller / Service
ReactorContext에서 TenantId 복원
        ↓
TenantAuthorization
사용자의 접근 권한 확인
        ↓
TenantTransactionExecutor
schema 또는 ConnectionFactory 선택
        ↓
Repository
tenant 격리 영역에서 쿼리
```

다음 오류 경로를 본 흐름에서 분기하여 보여준다.

- 헤더 누락 또는 지원하지 않는 tenant: `400`
- 인증되지 않은 사용자: `401`
- tenant 접근 권한 없음: `403`
- `PREPARING` 또는 `FAILED` tenant: 일반 요청에서 사용 불가
- DB 라우팅 실패: `5xx`, 다른 tenant로 fallback 금지

### 다이어그램 2: 신규 tenant 온보딩 생명주기

단순 상태도가 아니라 운영자, 온보딩 서비스, 자원 공급자, routing registry와 tenant
metadata의 상호작용을 카드와 연결선으로 표현한다.

```text
운영자
→ 온보딩 요청
TenantOnboardingService
→ metadata 예약: PREPARING
ResourceProvisioner
→ schema 또는 DB·pool 생성
→ migration·연결 검증
RoutingRegistry
→ tenant 공개
TenantMetadata
→ ACTIVE
```

실패한 단계에서는 `FAILED` 기록과 함께 이미 만든 pool, schema, registry 항목을
정리하는 보상 절차를 표시한다. 재시도는 기존 metadata와 준비된 자원을 확인한 뒤
안전하게 이어서 수행하도록 표현한다.

### 다이어그램 제작 규칙

- 한국어와 영어 자산을 별도로 제작한다.
- dark style SVG 원본을 유지하고 CairoSVG 2배율 PNG를 블로그 표시 자산으로 사용한다.
- 화살촉을 충분히 크게 만들고 카드 간격을 확보한다.
- 연결선, 라벨과 카드가 겹치거나 잘리는 부분이 없어야 한다.
- SVG뿐 아니라 전체 크기 PNG를 직접 검사한다.
- 기술 다이어그램 크게 보기 UI와 제목을 제공한다.
- 대표 이미지는 크게 보기 대상에서 제외한다.

## 코드 인용과 자료

본문에는 흐름을 이해하는 데 필요한 짧은 코드만 싣는다.

- `TenantFilter.contextWrite`
- `currentReactorTenant()`
- tenant 권한 검증
- `TenantTransactionExecutor`
- 온보딩의 metadata 예약, 자원 준비, registry 공개를 보여주는 축약 코드

전체 클래스와 테스트 raw data는 복사하지 않는다. 자료 섹션에는 독자가 이어서 볼
수 있는 대표 모듈과 Service 소스 링크를 제공한다. 실제 조사 과정에서만 사용하고
독자에게 도움이 되지 않는 issue raw data, 설계 기록과 내부 검토 링크는 노출하지
않는다.

주요 source anchor는 다음 workshop 모듈이다.

- `10-multi-tenant/03-multitenant-spring-webflux`
- `10-multi-tenant/04-connection-factory-per-tenant-spring-webflux`
- `10-multi-tenant/05-spring-security-tenant-authorization-spring-webflux`
- `10-multi-tenant/06-tenant-onboarding-spring-webflux`
- 기존 비교 자료인 `10-multi-tenant/07-multitenant-ktor`

## 오류와 안전 원칙

- 요청 header를 인증이나 권한의 증거로 취급하지 않는다.
- 권한 검증 전에는 tenant별 DB 자원을 선택하거나 쿼리를 실행하지 않는다.
- 누락되거나 알 수 없는 tenant를 기본 tenant로 조용히 fallback하지 않는다.
- 비활성 tenant를 routing registry에서 일반 요청에 노출하지 않는다.
- DB 선택 실패 시 다른 tenant 연결을 대체 경로로 사용하지 않는다.
- 온보딩의 준비와 공개를 분리하고, 부분 실패를 추적 가능한 상태로 남긴다.
- 재시도와 중복 요청이 자원을 중복 생성하지 않도록 멱등성을 보장한다.

## 검증

- 한국어 글을 먼저 작성하고 자연스러운 한국어 체크리스트로 교정한다.
- 설명과 의사코드를 현재 workshop README와 구현에 대조한다.
- 기존 Ktor 글과 문단·코드 단위 중복을 검사한다.
- 다이어그램 skill 체크리스트와 전체 크기 PNG 검사를 수행한다.
- 다이어그램 제목, 크게 보기, 한국어·영어 자산 연결을 확인한다.
- 사이트 테스트와 production build를 실행한다.
- 한국어 글과 다이어그램을 로컬 사이트에서 검토한다.
- 한국어 승인 후 영어 글과 영문 다이어그램을 작성한다.
- 제목, 본문 구조, 표, 코드, 자료 링크와 다이어그램의 bilingual parity를 검사한다.
- Issue #189를 연결하고 assignee, label과 PR 본문 규칙을 지킨 PR을 생성한다.
- PR 생성 후 머지와 배포 없이 중단한다.

## 완료 조건

- 요청 컨텍스트 전파와 tenant 온보딩 생명주기가 한 글의 연속된 문제로 설명된다.
- 기존 Ktor 글과 겹치지 않으면서 두 runtime의 carrier 차이를 정확히 비교한다.
- 정상 경로뿐 아니라 권한 거부, 비활성 tenant, 라우팅 실패와 온보딩 부분 실패를
  설명한다.
- 한국어와 영어 글, 다이어그램과 자료 링크가 동등한 정보를 제공한다.
- 검증을 통과한 변경이 Issue #189 연결 PR로 제출된다.
- PR은 머지하거나 배포하지 않는다.
