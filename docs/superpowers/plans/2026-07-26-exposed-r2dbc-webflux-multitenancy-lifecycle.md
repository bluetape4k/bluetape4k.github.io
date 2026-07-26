# Spring WebFlux 멀티테넌시와 테넌트 생명주기 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reactor Context에서 Kotlin Coroutine으로 tenant 정보를 전달하는 요청 경로와 권한 검증·신규 tenant 온보딩 생명주기를 하나의 source-backed bilingual 블로그 글로 설명하고 Issue #189 연결 PR까지 제출한다.

**Architecture:** 글의 전반부는 `X-TENANT-ID + 인증 정보 → 권한 검증 → Reactor Context 공개 → Coroutine → DB 선택`이라는 요청 한 건의 흐름을 따라간다. 후반부는 “그 tenant가 어떻게 사용 가능한 상태가 되었는가?”라는 질문으로 전환하여 metadata 예약, 자원 준비, registry 공개, 즉시 실패 cleanup과 재시작 stale-row 복구를 설명한다. 기존 Ktor 글은 carrier 비교와 후속 읽기 링크로만 연결하고 구현 설명을 반복하지 않는다.

**Tech Stack:** Astro/Starlight MDX, Spring WebFlux, Project Reactor Context, Kotlin Coroutines `ReactorContext`, Exposed R2DBC, Spring Security, hand-authored SVG, CairoSVG PNG rendering, bluetape diagram audits, image generation, Node.js/npm, GitHub CLI.

---

## 파일 지도

### 생성

- `src/content/docs/ko/blog/exposed-r2dbc-webflux-multitenancy-lifecycle.mdx`: 한국어 원문과 로컬 검토 경로.
- `src/content/docs/blog/exposed-r2dbc-webflux-multitenancy-lifecycle.mdx`: 한국어 승인 후 작성할 자연스러운 영어 현지화 글.
- `public/assets/exposed-r2dbc-webflux-multitenancy-hero.png`: 대표 이미지. 기술 다이어그램 크게 보기 대상에서 제외한다.
- `public/assets/exposed-r2dbc-webflux-request-context-01-ko.svg`: 요청 context 전파·권한 검증 한국어 다이어그램 원본.
- `public/assets/exposed-r2dbc-webflux-request-context-01-ko.png`: CairoSVG 2배율 한국어 표시 자산.
- `public/assets/exposed-r2dbc-webflux-request-context-01-en.svg`: 영어 현지화 다이어그램 원본.
- `public/assets/exposed-r2dbc-webflux-request-context-01-en.png`: CairoSVG 2배율 영어 표시 자산.
- `public/assets/exposed-r2dbc-tenant-onboarding-01-ko.svg`: 신규 tenant 온보딩 상호작용 한국어 다이어그램 원본.
- `public/assets/exposed-r2dbc-tenant-onboarding-01-ko.png`: CairoSVG 2배율 한국어 표시 자산.
- `public/assets/exposed-r2dbc-tenant-onboarding-01-en.svg`: 영어 현지화 다이어그램 원본.
- `public/assets/exposed-r2dbc-tenant-onboarding-01-en.png`: CairoSVG 2배율 영어 표시 자산.

### 수정

- `tests/ecosystem/diagram-lightbox.test.mjs`: 두 locale 글의 기술 다이어그램 제목과 대표 이미지 제외 계약을 검증한다.

### 읽기 전용 근거

- `src/content/docs/ko/blog/exposed-r2dbc-ktor-multitenant-routing-patterns.mdx`
- `src/content/docs/blog/exposed-r2dbc-ktor-multitenant-routing-patterns.mdx`
- `/Users/debop/work/bluetape4k/exposed-r2dbc-workshop/10-multi-tenant/03-multitenant-spring-webflux/README.ko.md`
- `/Users/debop/work/bluetape4k/exposed-r2dbc-workshop/10-multi-tenant/03-multitenant-spring-webflux/src/main/kotlin/exposed/r2dbc/multitenant/webflux/tenant/TenantFilter.kt`
- `/Users/debop/work/bluetape4k/exposed-r2dbc-workshop/10-multi-tenant/03-multitenant-spring-webflux/src/main/kotlin/exposed/r2dbc/multitenant/webflux/tenant/TenantId.kt`
- `/Users/debop/work/bluetape4k/exposed-r2dbc-workshop/10-multi-tenant/04-connection-factory-per-tenant-spring-webflux/src/main/kotlin/exposed/r2dbc/multitenant/connectionfactory/tenant/TenantRoutingConnectionFactory.kt`
- `/Users/debop/work/bluetape4k/exposed-r2dbc-workshop/10-multi-tenant/04-connection-factory-per-tenant-spring-webflux/src/main/kotlin/exposed/r2dbc/multitenant/connectionfactory/tenant/TenantTransactionExecutor.kt`
- `/Users/debop/work/bluetape4k/exposed-r2dbc-workshop/10-multi-tenant/05-spring-security-tenant-authorization-spring-webflux/src/main/kotlin/exposed/r2dbc/multitenant/security/security/AuthorizedTenantContextWebFilter.kt`
- `/Users/debop/work/bluetape4k/exposed-r2dbc-workshop/10-multi-tenant/05-spring-security-tenant-authorization-spring-webflux/src/main/kotlin/exposed/r2dbc/multitenant/security/security/TenantAuthenticationResolver.kt`
- `/Users/debop/work/bluetape4k/exposed-r2dbc-workshop/10-multi-tenant/06-tenant-onboarding-spring-webflux/src/main/kotlin/exposed/r2dbc/multitenant/onboarding/tenant/TenantProvisioner.kt`
- `/Users/debop/work/bluetape4k/exposed-r2dbc-workshop/10-multi-tenant/06-tenant-onboarding-spring-webflux/src/main/kotlin/exposed/r2dbc/multitenant/onboarding/tenant/TenantRegistryRepository.kt`
- `/Users/debop/work/bluetape4k/exposed-r2dbc-workshop/10-multi-tenant/06-tenant-onboarding-spring-webflux/src/main/kotlin/exposed/r2dbc/multitenant/onboarding/tenant/TenantConnectionFactoryRegistry.kt`
- `/Users/debop/work/bluetape4k/exposed-r2dbc-workshop/10-multi-tenant/06-tenant-onboarding-spring-webflux/src/main/kotlin/exposed/r2dbc/multitenant/onboarding/tenant/TenantTypes.kt`

## Task 1: 근거와 중복 경계를 고정한다

- [ ] **Step 1: 구현 anchor를 다시 추출한다**

Run:

```bash
rg -n -C 4 'contextWrite|currentReactorTenant|coroutineContext\\[ReactorContext\\]|suspendTransactionWithCurrentTenant' \
  /Users/debop/work/bluetape4k/exposed-r2dbc-workshop/10-multi-tenant/03-multitenant-spring-webflux

rg -n -C 4 'determineCurrentLookupKey|TenantTransactionExecutor|TENANT_ID' \
  /Users/debop/work/bluetape4k/exposed-r2dbc-workshop/10-multi-tenant/04-connection-factory-per-tenant-spring-webflux/src/main/kotlin

rg -n -C 4 'AuthorizedTenantContextWebFilter|TenantAuthenticationResolver|contextWrite|FORBIDDEN' \
  /Users/debop/work/bluetape4k/exposed-r2dbc-workshop/10-multi-tenant/05-spring-security-tenant-authorization-spring-webflux

rg -n -C 4 'reserve|provision|register|cleanupAfterFailure|recoverStaleRows|TenantStatus|PROVISIONING|ACTIVE|FAILED' \
  /Users/debop/work/bluetape4k/exposed-r2dbc-workshop/10-multi-tenant/06-tenant-onboarding-spring-webflux
```

Expected: WebFlux context 저장·복원, 권한 확인 후 context 공개, tenant별 연결 선택, 온보딩 예약·pool 생성·registry 등록·즉시 실패 cleanup·재시작 stale-row 복구의 실제 클래스와 함수가 확인된다.

- [ ] **Step 2: 기존 Ktor 글의 중복 한계를 기록한다**

Run:

```bash
rg -n -C 3 'ReactorContext|Coroutine|coroutine|ApplicationCall\\.attributes|call attributes|currentTenant' \
  src/content/docs/ko/blog/exposed-r2dbc-ktor-multitenant-routing-patterns.mdx \
  src/content/docs/blog/exposed-r2dbc-ktor-multitenant-routing-patterns.mdx
```

Expected: Ktor 글은 Reactor Context를 비교 수준에서만 언급하고, 실제 요청 carrier는 `ApplicationCall.attributes`와 명시적 tenant 값 전달이다. 새 글은 Ktor plugin 코드와 schema helper를 재설명하지 않는다.

- [ ] **Step 3: 공식 외부 자료의 독자 가치만 선별한다**

현재 공식 문서에서 다음 두 항목만 확인한다.

```text
Project Reactor reference: Context가 subscriber별 immutable key/value carrier라는 설명
kotlinx-coroutines-reactor API: ReactorContext가 Reactor Context를 CoroutineContext로 노출하는 설명
```

Context7 또는 공식 문서를 사용하고, 글의 `자료`에는 한국 독자가 본문 없이 읽기 어려운 raw issue나 내부 spec 대신 위 공식 개념 문서와 대표 workshop 모듈·Service 소스만 제공한다.

- [ ] **Step 4: 사실 계약을 확인한다**

다음 문장이 구현과 일치해야 한다.

```text
schema 예제의 TenantFilter가 검증된 TenantId를 Reactor Context에 저장한다.
suspend 함수는 coroutineContext[ReactorContext]에서 Reactor Context를 읽는다.
권한 검증은 tenant routing context를 공개하기 전에 수행된다.
connection-factory 예제의 TenantTransactionExecutor는 deferContextual의 Reactor Context를 transaction용 mono coroutine에 다시 결합한다.
tenant별 ConnectionFactory 전략은 registry와 routing factory를 함께 운영한다.
onboarding은 metadata 예약, pool/database 준비, registry 공개를 분리한다.
즉시 실패 시 runtime registry, schema, pool과 metadata를 정리하고 실패 지표를 남긴다.
재시작 시 stale PROVISIONING·ACTIVE metadata를 FAILED로 전환한다.
```

## Task 2: 한국어 글의 구조와 핵심 코드를 작성한다

- [ ] **Step 1: frontmatter와 도입부를 만든다**

Create `src/content/docs/ko/blog/exposed-r2dbc-webflux-multitenancy-lifecycle.mdx` with:

```mdx
---
title: "Spring WebFlux 멀티테넌시: Reactor Context 전파에서 테넌트 온보딩까지"
description: X-TENANT-ID를 Reactor Context와 Kotlin Coroutine으로 전달하고, 권한 검증과 tenant별 ConnectionFactory 선택, 신규 tenant 온보딩까지 하나의 운영 흐름으로 설명합니다.
sidebar:
  order: -202607261000
blog:
  date: 2026-07-26T10:00:00+09:00
  image: /assets/exposed-r2dbc-webflux-multitenancy-hero.png
  imageAlt: WebFlux 요청 토큰이 Reactor Context와 Coroutine 작업대를 지나 tenant별 데이터베이스와 온보딩 제어판으로 연결되는 어두운 3D 미니어처 장면
  cardDescription: "요청의 tenant 정보를 Coroutine과 DB 선택까지 안전하게 전달하고, 권한 검증과 신규 tenant 온보딩을 같은 운영 계약으로 묶습니다."
---

<figure class="bt4k-blog-hero">
  <img src="/assets/exposed-r2dbc-webflux-multitenancy-hero.png" alt="WebFlux 요청 토큰이 Reactor Context와 Coroutine 작업대를 지나 tenant별 데이터베이스와 온보딩 제어판으로 연결되는 어두운 3D 미니어처 장면" loading="eager" />
  <figcaption>tenant context는 헤더 문자열이 아니라 요청 권한과 데이터 자원, 운영 상태를 연결하는 계약입니다.</figcaption>
</figure>

<p class="bt4k-post-meta">2026-07-26 · exposed-r2dbc-workshop · Spring WebFlux 멀티테넌시</p>
```

도입은 `X-TENANT-ID`가 올바르더라도 요청 사용자에게 접근 권한이 없거나 tenant가 아직 준비 중일 수 있다는 실패 사례로 시작한다.

- [ ] **Step 2: 요청 context 전파 섹션을 작성한다**

다음 순서와 책임을 유지한다.

```text
## 멀티테넌시의 출발점은 헤더가 아니다
## WebFlux에서는 요청과 스레드가 일치하지 않는다
## Reactor Context에서 Coroutine까지 tenant를 전달한다
```

세 번째 섹션에는 아래 핵심만 담은 축약 코드를 사용한다.

```kotlin
override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> = mono {
    val tenant = resolveTenant(exchange.request.headers)

    chain.filter(exchange)
        .contextWrite { context ->
            context.put(TenantId.TENANT_ID_KEY, TenantId(tenant))
        }
        .awaitSingleOrNull()
}

suspend fun currentReactorTenant(): Tenants.Tenant =
    coroutineContext[ReactorContext]
        ?.context
        ?.get<TenantId>(TenantId.TENANT_ID_KEY)
        ?.value
        ?: error("Tenant context is required")
```

실제 workshop의 direct-call fallback을 HTTP 요청의 정상 동작처럼 권장하지 않는다. 본문은 “조용한 기본 tenant fallback을 운영 요청에 사용하지 않는다”는 안전 원칙을 별도로 명시한다. 이어서 connection-factory 예제의 `TenantTransactionExecutor`가 `Mono.deferContextual`에서 받은 context를 `mono(bridgedContext)`에 결합하는 두 번째 bridge를 짧게 설명한다.

- [ ] **Step 3: 요청 다이어그램 자리를 연결한다**

다음 figure를 context 전파 설명 직후에 추가한다.

```mdx
<figure
  class="bt4k-architecture"
  data-diagram-title="Reactor Context에서 tenant별 Repository까지"
>
  <img src="/assets/exposed-r2dbc-webflux-request-context-01-ko.png" alt="X-TENANT-ID와 인증 정보가 TenantFilter, Reactor Context, Coroutine Service, 권한 검증, tenant transaction executor와 repository를 거치는 요청 상호작용 다이어그램" loading="lazy" />
  <figcaption>tenant 헤더는 입력일 뿐입니다. 검증된 tenant와 인증 주체의 권한이 일치한 뒤에만 Reactor Context를 공개하고 DB 연결을 선택합니다.</figcaption>
</figure>
```

- [ ] **Step 4: 권한과 DB 선택 섹션을 작성한다**

Use:

```text
## tenant 식별과 접근 권한은 같은 문제가 아니다
## 검증된 tenant가 DB 연결을 선택한다
```

권한 섹션은 `AuthorizedTenantContextWebFilter`의 순서를 의사코드로 보여준다.

```kotlin
authenticate(request)
requestedTenant = resolveTenant(request)
authorize(principal, requestedTenant)
publishTenantToReactorContext(requestedTenant)
continueFilterChain()
```

DB 선택 섹션에는 다음 표를 포함한다.

| 전략 | 격리 단위 | 장점 | 운영 비용 |
|---|---|---|---|
| 공유 DB·tenant별 schema | schema | 자원을 효율적으로 공유한다 | connection 재사용 시 schema 설정과 누수 검증이 필요하다 |
| tenant별 `ConnectionFactory` | pool·database | 연결과 장애 범위를 더 강하게 격리한다 | tenant 수만큼 pool과 lifecycle을 관리해야 한다 |

다른 tenant로 fallback하는 동작을 장애 복구 전략으로 제안하지 않는다.

- [ ] **Step 5: 온보딩 전환과 생명주기 섹션을 작성한다**

Use:

```text
## 신규 tenant는 라우팅 목록에 어떻게 들어오는가
## 온보딩은 준비와 공개를 분리한다
## 온보딩 실패를 운영 가능한 상태로 남긴다
```

준비와 공개 절차는 다음 축약 의사코드로 설명한다.

```kotlin
suspend fun onboard(command: OnboardTenantCommand): TenantMetadata {
    val reserved = registryRepository.reserve(command)       // PROVISIONING
    val resources = provisioner.prepare(reserved)             // DB, pool, schema, seed
    runtimeRegistry.register(reserved.tenantId, resources)     // routing 공개
    return registryRepository.activate(reserved.tenantId)      // ACTIVE
}
```

실패 설명은 실제 `TenantProvisioner.cleanupAfterFailure()`의 경계를 따라 runtime registry 제거, schema·pool과 예약 metadata 삭제를 설명한다. 즉시 실패에서 `FAILED` 행이나 실패 원인을 남긴다고 쓰지 않는다. 별도의 재시작 복구에서 stale `PROVISIONING`·`ACTIVE` 행을 `FAILED`로 전환하고, 다음 `reserve()`가 `FAILED` 행을 새 `PROVISIONING` 시도로 갱신하는 과정을 구분한다.

- [ ] **Step 6: 온보딩 다이어그램 자리를 연결한다**

```mdx
<figure
  class="bt4k-architecture"
  data-diagram-title="신규 tenant 준비·공개·재시작 복구 생명주기"
>
  <img src="/assets/exposed-r2dbc-tenant-onboarding-01-ko.png" alt="운영자, 온보딩 서비스, metadata repository, 자원 공급자, routing registry가 PROVISIONING, ACTIVE, FAILED 상태와 즉시 cleanup을 거쳐 상호작용하는 tenant 온보딩 다이어그램" loading="lazy" />
  <figcaption>DB와 pool을 만들었다고 tenant가 곧바로 활성화되는 것은 아닙니다. 준비를 검증한 뒤 routing registry에 공개하고 ACTIVE로 전환합니다.</figcaption>
</figure>
```

- [ ] **Step 7: 테스트·Ktor 비교·자료·마무리를 작성한다**

Use:

```text
## 테스트는 정상 응답보다 경계를 증명해야 한다
## Ktor와 비교하면 carrier만 다르다
## 자료
## 마무리
```

테스트 표는 최소 다음 행을 포함한다.

| 검증 대상 | 실패하면 생기는 문제 |
|---|---|
| Reactor Context가 Coroutine까지 유지됨 | transaction에서 tenant를 잃거나 잘못된 기본값을 사용한다 |
| 동시 요청 tenant 격리 | 다른 tenant의 데이터가 섞인다 |
| 권한 거부가 DB 선택보다 먼저 수행됨 | 권한 없는 tenant 자원에 접근한다 |
| runtime registry에 없는 tenant 거부 | 준비가 끝나지 않은 DB를 사용한다 |
| 즉시 온보딩 실패 cleanup | metadata, pool과 registry 항목이 유출된다 |
| 재시작 stale-row 복구 | 존재하지 않는 메모리 pool을 ACTIVE로 오인한다 |
| `FAILED` 행 재예약 | 같은 tenant를 다시 온보딩할 수 없다 |

Ktor 비교표는 carrier 차이만 요약하고 기존 글로 연결한다. 자료에는 공식 Reactor/Kotlin Coroutines 개념 문서, workshop 03–06 모듈, `AuthorizedTenantContextWebFilter`, `TenantTransactionExecutor`, `TenantProvisioner`와 기존 Ktor 글만 제공한다.

- [ ] **Step 8: 한국어 source shape를 확인한다**

Run:

```bash
rg -n '^## |contextWrite|coroutineContext\\[ReactorContext\\]|AuthorizedTenantContextWebFilter|ConnectionFactory|PROVISIONING|ACTIVE|FAILED|cleanupAfterFailure|recoverStaleRows|data-diagram-title|## 자료|Ktor' \
  src/content/docs/ko/blog/exposed-r2dbc-webflux-multitenancy-lifecycle.mdx
```

Expected: 승인된 11개 내용 단위, 두 기술 다이어그램 자리, 두 축의 실패 경로와 독자용 자료가 모두 확인된다.

## Task 3: 대표 이미지를 생성한다

- [ ] **Step 1: 기존 dark blog hero를 시각 기준으로 검사한다**

Inspect at least:

```text
public/assets/exposed-r2dbc-ktor-multitenant-hero.png
public/assets/timefold-workshop-persistence-hero.png
public/assets/leader-election-practical-jobs-hero.png
```

Record: 16:9 wide composition, dark miniature technical workbench, small robotic workers, clear foreground subject, no diagram labels, no logos, no watermark.

- [ ] **Step 2: built-in image generation으로 hero를 만든다**

Use the `imagegen` skill and built-in `image_gen` tool with this prompt contract:

```text
Use case: stylized-concept
Asset type: technical blog hero
Primary request: A dark premium 3D miniature workbench showing a WebFlux request token traveling through a Reactor Context bridge into a Kotlin Coroutine service, with two tenant database stations and a separate tenant onboarding control console.
Scene/backdrop: dark navy studio workbench with subtle cyan and amber edge lighting
Subject: small white and cobalt robotic engineers monitoring request routing and preparing a newly isolated tenant database
Style/medium: polished cinematic toy-diorama 3D render
Composition/framing: wide 16:9, readable central flow, generous edge padding
Constraints: no human characters, no flat infographic, no readable product text, no logos, no watermark
Avoid: bright white background, dense UI text, malformed arrows, duplicated robots, visible brand marks
```

Move the selected project-bound output to `public/assets/exposed-r2dbc-webflux-multitenancy-hero.png`.

- [ ] **Step 3: 크기와 시각 품질을 검사한다**

Run:

```bash
sips -z 941 1672 public/assets/exposed-r2dbc-webflux-multitenancy-hero.png \
  --out public/assets/exposed-r2dbc-webflux-multitenancy-hero.png
sips -g pixelWidth -g pixelHeight public/assets/exposed-r2dbc-webflux-multitenancy-hero.png
```

Expected: `1672×941`. Full-size inspection must confirm subject separation, no cropped component, no accidental text or watermark, and visual continuity with the inspected dark heroes.

## Task 4: 한국어 요청 context 상호작용 다이어그램을 만든다

- [ ] **Step 1: 다이어그램 규칙과 두 reference PNG를 연다**

Read:

```text
/Users/debop/.codex/skills/bluetape-diagram/references/common.md
/Users/debop/.codex/skills/bluetape-diagram/references/sequence.md
```

Inspect full-size:

```text
/Users/debop/work/bluetape4k/bluetape4k-wiki/docs/diagrams/best-practices/assets/bluetape4k-coroutines-sequence-01.png
public/assets/timefold-workshop-solver-persistence-sequence-02-ko.png
```

The approved visual language uses component header cards and numbered connections. Preserve sequence rules for chronological order, visible labels, semantic colors and 16×16 arrowheads; do not collapse the content into an unnumbered generic flowchart.

- [ ] **Step 2: source-backed interaction model을 고정한다**

Use these components and messages:

```text
1. Client → TenantFilter: X-TENANT-ID + credentials
2. TenantFilter → Tenant resolver: normalize and validate
3. Security context → Tenant authorization: authenticated tenant
4. Tenant authorization: requested tenant matches authenticated tenant
5. Tenant authorization → Reactor Context: publish authorized TenantId
6. Reactor Context → Coroutine service: expose through coroutineContext[ReactorContext]
7. Coroutine service → Transaction executor: authorized tenant work
8. Transaction executor → Routing ConnectionFactory: select tenant pool or schema
9. Transaction executor → Repository: execute in tenant boundary
10. Repository → Client: tenant-scoped result
```

Error branches:

```text
400 missing/unknown tenant
401 unauthenticated
403 tenant not allowed
5xx routing failure, no cross-tenant fallback
```

- [ ] **Step 3: SVG를 작성한다**

Create `public/assets/exposed-r2dbc-webflux-request-context-01-ko.svg` as a dark 1800×1500 interaction diagram. Requirements:

```text
Architects Daughter / Comic Mono
component header cards with adequate horizontal spacing
visible numbered message pills
muted blue normal calls, olive authorization success, teal return, muted red rejection
explicit per-color 16×16 userSpaceOnUse markers
rounded orthogonal connectors
no line through cards, labels, or other connector corridors
transparent alt/error frame with enough row height
```

- [ ] **Step 4: XML, text, render와 audits를 실행한다**

Run:

```bash
xmllint --noout public/assets/exposed-r2dbc-webflux-request-context-01-ko.svg
python3 "${CODEX_HOME:-$HOME/.codex}/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py" \
  public/assets/exposed-r2dbc-webflux-request-context-01-ko.svg
cairosvg public/assets/exposed-r2dbc-webflux-request-context-01-ko.svg \
  -o public/assets/exposed-r2dbc-webflux-request-context-01-ko.png -s 2
python3 "${CODEX_HOME:-$HOME/.codex}/skills/bluetape-diagram/scripts/diagram-connector-audit.py" \
  public/assets/exposed-r2dbc-webflux-request-context-01-ko.svg
python3 "${CODEX_HOME:-$HOME/.codex}/skills/bluetape-diagram/scripts/diagram-geometry-audit.py" --fail-diagonal \
  public/assets/exposed-r2dbc-webflux-request-context-01-ko.svg
python3 "${CODEX_HOME:-$HOME/.codex}/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py" \
  public/assets/exposed-r2dbc-webflux-request-context-01-ko.svg
python3 "${CODEX_HOME:-$HOME/.codex}/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py" \
  public/assets/exposed-r2dbc-webflux-request-context-01-ko.svg
python3 "${CODEX_HOME:-$HOME/.codex}/skills/bluetape-diagram/scripts/diagram-sequence-style-audit.py" \
  public/assets/exposed-r2dbc-webflux-request-context-01-ko.svg
```

Expected: PNG `3600×3000`; `text_hazards=0`, `code_without_highlight=0`, ten visible numbered messages, meaningful connector/card/label counts, `shared_segments=0`, label/card/connector collisions `0`, endpoints and mixed corners failures `0`.

- [ ] **Step 5: full-size PNG를 검사한다**

Inspect `public/assets/exposed-r2dbc-webflux-request-context-01-ko.png` at full size. Verify every arrowhead direction, 16×16 visual size, label continuity, error-frame transparency, row spacing, card separation and Korean text clipping. Any PNG defect returns to Step 3.

## Task 5: 한국어 tenant 온보딩 다이어그램을 만든다

- [ ] **Step 1: source interaction과 상태 변화를 고정한다**

Use these components:

```text
운영자
TenantOnboardingController
TenantProvisioner
TenantRegistryRepository
Resource Provider
TenantConnectionFactoryRegistry
```

Use these messages:

```text
1. 운영자 → Controller: 온보딩 요청
2. Controller → Provisioner: provision(command)
3. Provisioner → RegistryRepository: reserve(PROVISIONING)
4. Provisioner → Resource Provider: DB·pool 준비
5. Provisioner → Resource Provider: schema·seed와 연결 검증
6. Provisioner → Runtime Registry: register
7. Provisioner → RegistryRepository: activate(ACTIVE)
8. Provisioner → 운영자: 사용 가능한 tenant 반환
```

Immediate failure branch:

```text
pool·schema·seed·register 실패
→ runtime registry 제거
→ schema/pool 정리
→ 예약 metadata 삭제
```

Restart recovery branch:

```text
애플리케이션 재시작
→ stale PROVISIONING·ACTIVE 행을 FAILED로 전환
→ 다음 reserve가 FAILED 행을 PROVISIONING으로 갱신
```

- [ ] **Step 2: SVG를 작성한다**

Create `public/assets/exposed-r2dbc-tenant-onboarding-01-ko.svg` as a dark 1800×1500 interaction/lifecycle diagram. Use the same fonts, palette, card geometry, message numbering and 16×16 markers as Task 4. Make `PROVISIONING`, `ACTIVE`, `FAILED` visible as state badges attached to the metadata interaction rather than a detached state machine. `FAILED`는 즉시 실패 branch가 아니라 재시작 복구 branch에 배치한다.

- [ ] **Step 3: parse, normalize, render와 audits를 실행한다**

Run the same XML, text normalization, CairoSVG scale 2, connector, geometry, endpoint, mixed-corner and sequence-style audit commands as Task 4 with the onboarding SVG/PNG paths.

Expected: PNG `3600×3000`; eight happy-path message labels, 즉시 cleanup branch와 별도의 재시작 복구 branch가 보인다. connector/card/label counts는 0이 아니며 collision, shared-corridor, endpoint, marker, corner failures는 모두 `0`이다.

- [ ] **Step 4: full-size PNG를 검사한다**

Verify `PROVISIONING → ACTIVE` order, immediate cleanup arrow direction, stale-row `FAILED` recovery, retry direction, label visibility, marker size/color and absence of card overlap. SVG audit success cannot replace PNG inspection.

## Task 6: 한국어 글과 시각 자료를 교정하고 로컬 검토한다

- [ ] **Step 1: 한국어 자연스러움 체크리스트를 적용한다**

Read:

```text
/Users/debop/.codex/skills/bluetape-writer/references/korean-naturalness-checklist.md
/Users/debop/.codex/skills/bluetape-writer/references/blog-style-checklist.md
```

Remove translated word order, repeated conclusions, noun-heavy prose, unexplained jargon and internal review language. Preserve identifiers such as `TenantFilter`, `ReactorContext`, `ConnectionFactory`, `PROVISIONING`, `ACTIVE`, `FAILED`.

- [ ] **Step 2: 중복과 독자용 자료 형식을 검사한다**

Run:

```bash
rg -n 'Issue #|raw data|설계 문서|검토 기록|내부' \
  src/content/docs/ko/blog/exposed-r2dbc-webflux-multitenancy-lifecycle.mdx || true

rg -n 'ApplicationCall\\.attributes|createApplicationPlugin|normalizeTenantHeader' \
  src/content/docs/ko/blog/exposed-r2dbc-webflux-multitenancy-lifecycle.mdx || true
```

Expected: Issue raw data와 내부 과정 링크가 없고, Ktor 구현 코드가 반복되지 않는다. 기존 Ktor 글은 비교와 자료 링크로만 등장한다.

- [ ] **Step 3: lightbox 계약 테스트를 먼저 추가한다**

Append a focused test to `tests/ecosystem/diagram-lightbox.test.mjs` that reads the Korean article and asserts:

```js
assert.match(ko, /class="bt4k-architecture"\s+data-diagram-title="Reactor Context에서 tenant별 Repository까지"/);
assert.match(ko, /class="bt4k-architecture"\s+data-diagram-title="신규 tenant 준비·공개·재시작 복구 생명주기"/);
assert.doesNotMatch(ko, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
```

- [ ] **Step 4: 대상 테스트와 build를 실행한다**

Run:

```bash
node --test tests/ecosystem/diagram-lightbox.test.mjs
npm run build
```

Expected: lightbox tests pass; `astro check` reports zero errors; production build exits `0`; generated route exists at:

```text
dist/ko/blog/exposed-r2dbc-webflux-multitenancy-lifecycle/index.html
```

- [ ] **Step 5: 로컬 사이트를 띄우고 한국어 route를 검사한다**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Use an available port and inspect:

```text
/ko/blog/exposed-r2dbc-webflux-multitenancy-lifecycle/
```

Verify hero exclusion, both diagram titles, click/icon lightbox entry, full-size PNG readability, code wrapping, tables, source links and mobile-width overflow.

- [ ] **Step 6: 한국어 검토 checkpoint를 사용자에게 제공한다**

Report the local Korean URL and the two diagram titles. Pause English localization until the user approves the Korean article and Korean diagrams.

- [ ] **Step 7: 승인된 한국어 slice를 commit한다**

After approval, stage only:

```text
src/content/docs/ko/blog/exposed-r2dbc-webflux-multitenancy-lifecycle.mdx
public/assets/exposed-r2dbc-webflux-multitenancy-hero.png
public/assets/exposed-r2dbc-webflux-request-context-01-ko.svg
public/assets/exposed-r2dbc-webflux-request-context-01-ko.png
public/assets/exposed-r2dbc-tenant-onboarding-01-ko.svg
public/assets/exposed-r2dbc-tenant-onboarding-01-ko.png
tests/ecosystem/diagram-lightbox.test.mjs
```

Commit with a Lore message whose intent is to make tenant routing and onboarding one verified operational story. Record Korean review, diagram audit values, local route and build evidence in `Tested:`.

## Task 7: 영어 글과 영문 다이어그램을 현지화한다

- [ ] **Step 1: 영어 글을 작성한다**

Create `src/content/docs/blog/exposed-r2dbc-webflux-multitenancy-lifecycle.mdx` with:

```mdx
---
title: "Spring WebFlux Multi-Tenancy: From Reactor Context Propagation to Tenant Onboarding"
description: Follow X-TENANT-ID through Reactor Context and Kotlin Coroutines, then connect authorization, tenant-specific connection selection, and safe tenant onboarding.
sidebar:
  order: -202607261000
blog:
  date: 2026-07-26T10:00:00+09:00
  image: /assets/exposed-r2dbc-webflux-multitenancy-hero.png
  imageAlt: A dark 3D miniature workbench where a WebFlux request token crosses Reactor Context and Coroutine stations toward tenant databases and an onboarding control panel
  cardDescription: "Carry tenant identity safely from a reactive request to database selection, then connect authorization and onboarding as one operational contract."
---
```

Keep the same facts, code behavior, table rows, figures, resources and error semantics. Localize prose naturally; do not mirror Korean sentence order.

- [ ] **Step 2: 영어 다이어그램 SVG를 각각 만든다**

Create:

```text
public/assets/exposed-r2dbc-webflux-request-context-01-en.svg
public/assets/exposed-r2dbc-tenant-onboarding-01-en.svg
```

Preserve the approved Korean geometry, component count, connector paths, marker definitions and state/message semantics. Change only reader-facing text and adjust card widths/label positions where English length requires it.

- [ ] **Step 3: 영문 PNG를 한 자산씩 render하고 audit한다**

For each English SVG:

```bash
xmllint --noout <asset>.svg
python3 "${CODEX_HOME:-$HOME/.codex}/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py" <asset>.svg
cairosvg <asset>.svg -o <asset>.png -s 2
python3 "${CODEX_HOME:-$HOME/.codex}/skills/bluetape-diagram/scripts/diagram-connector-audit.py" <asset>.svg
python3 "${CODEX_HOME:-$HOME/.codex}/skills/bluetape-diagram/scripts/diagram-geometry-audit.py" --fail-diagonal <asset>.svg
python3 "${CODEX_HOME:-$HOME/.codex}/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py" <asset>.svg
python3 "${CODEX_HOME:-$HOME/.codex}/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py" <asset>.svg
python3 "${CODEX_HOME:-$HOME/.codex}/skills/bluetape-diagram/scripts/diagram-sequence-style-audit.py" <asset>.svg
```

Inspect each `3600×3000` PNG full-size after its final coordinate change.

- [ ] **Step 4: English lightbox contract를 추가한다**

Extend the focused test with:

```js
assert.match(en, /class="bt4k-architecture"\s+data-diagram-title="From Reactor Context to a tenant-scoped repository"/);
assert.match(en, /class="bt4k-architecture"\s+data-diagram-title="New tenant preparation, publication, and restart recovery"/);
assert.doesNotMatch(en, /class="bt4k-blog-hero"[^>]*data-diagram-title/);
```

- [ ] **Step 5: bilingual parity를 검사한다**

Compare Korean and English files for:

```text
heading count and order
figure count and localized asset path
code-block count
table count and rows
HTTP status values
PROVISIONING / ACTIVE / FAILED
source URL set
Ktor comparison link
```

Expected: facts and structure match while prose is natural in each language.

- [ ] **Step 6: 영어 locale slice를 commit한다**

Commit the English MDX, two English SVG/PNG pairs and updated lightbox test with a Lore message. Record bilingual parity and all four diagram audit/PNG inspection results in `Tested:`.

## Task 8: 전체 검증과 Issue #189 PR을 완료한다

- [ ] **Step 1: placeholder, 링크와 diff hygiene를 검사한다**

Run:

```bash
rg -n 'TBD|TODO|PLACEHOLDER|example\\.com|Issue #189|raw data' \
  src/content/docs/ko/blog/exposed-r2dbc-webflux-multitenancy-lifecycle.mdx \
  src/content/docs/blog/exposed-r2dbc-webflux-multitenancy-lifecycle.mdx \
  public/assets/exposed-r2dbc-webflux-request-context-01-{ko,en}.svg \
  public/assets/exposed-r2dbc-tenant-onboarding-01-{ko,en}.svg || true
git diff --check origin/develop...HEAD
```

Expected: no placeholder, internal issue narration, whitespace errors or unintended raw references.

- [ ] **Step 2: 전체 테스트와 production build를 실행한다**

Run:

```bash
npm test
npm run build
```

Expected: all Node tests pass, `astro check` reports zero errors, production build exits `0`, and both routes exist:

```text
dist/ko/blog/exposed-r2dbc-webflux-multitenancy-lifecycle/index.html
dist/blog/exposed-r2dbc-webflux-multitenancy-lifecycle/index.html
```

- [ ] **Step 3: 네 기술 다이어그램의 evidence ledger를 작성한다**

For each `ko/en` SVG/PNG pair record:

```text
canonical paths
source files read
common.md + sequence.md
two reference PNGs
XML result
CairoSVG command and 3600×3000 dimensions
text_hazards=0 and code_without_highlight=0
connector/card/label/marker counts
shared_segments=0
label_cards=0, label_labels=0, label_connectors=0
geometry/endpoint/mixed-corner/sequence failures=0
full-size PNG inspection notes
MDX embed and data-diagram-title
```

Weak or zero-count audit rows require a targeted fallback count before the asset can pass.

- [ ] **Step 4: 최종 commit 상태를 확인한다**

Run:

```bash
git status --short --branch
git log --oneline --decorate origin/develop..HEAD
```

Expected: no unstaged or untracked implementation artifacts; plan/spec and article commits are visible on `docs/issue-189-r2dbc-webflux-multitenancy`.

- [ ] **Step 5: Issue metadata를 실시간 확인한다**

Run:

```bash
gh issue view 189 --repo bluetape4k/bluetape4k.github.io \
  --json state,assignees,labels,milestone,title,url
```

Ensure issue assignee is `debop`. Copy current issue labels and milestone exactly to the PR; do not rely on the earlier snapshot.

- [ ] **Step 6: branch를 push하고 PR을 만든다**

Push:

```bash
git push -u origin docs/issue-189-r2dbc-webflux-multitenancy
```

Create an English PR targeting `develop`, assign `debop`, copy live Issue #189 labels and milestone, and include `Closes #189`. The final Markdown `##` heading in the PR body must be exactly:

```markdown
## DoD Status
```

The DoD lists Korean/English parity, source anchors, four diagram ledgers, `npm test`, `npm run build`, local route review and the explicit boundary “PR only; not merged or deployed.”

- [ ] **Step 7: PR metadata를 live readback한다**

Run:

```bash
gh pr view <number> --repo bluetape4k/bluetape4k.github.io \
  --json url,title,body,baseRefName,headRefName,assignees,labels,milestone,state
```

Expected:

```text
baseRefName=develop
headRefName=docs/issue-189-r2dbc-webflux-multitenancy
assignee includes debop
labels/milestone match live Issue #189
body contains Closes #189
last ## heading is ## DoD Status
state=OPEN
```

- [ ] **Step 8: CI와 review 상태를 확인하고 중단한다**

Run:

```bash
gh pr checks <number> --repo bluetape4k/bluetape4k.github.io --watch
gh pr view <number> --repo bluetape4k/bluetape4k.github.io \
  --json reviewDecision,reviews,comments
```

Address only actionable feedback within the approved article scope. Once checks pass and the PR is review-ready, report the exact PR URL and stop. Do not merge, deploy, enable auto-merge, delete the branch, or close Issue #189 manually.
