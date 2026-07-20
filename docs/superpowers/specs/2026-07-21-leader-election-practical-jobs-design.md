# 리더 선출 실전 예제 글 설계

## 상태

- 작성일: 2026-07-21
- GitHub Issue: `bluetape4k/bluetape4k.github.io#192`
- 대상 저장소: `bluetape4k/bluetape4k.github.io`
- 사실 근거 저장소: `bluetape4k/bluetape4k-leader`의 `develop` 브랜치
- 언어: 한국어 원문 우선, 한국어 검수 후 대응 영문 작성
- 배포 경계: ready PR 생성과 exact-head CI 확인까지. 머지와 배포는 제외

## 목표

여러 서버가 같은 정기 작업을 동시에 시작하는 현실적인 장애에서 출발해, 리더 선출을 어디에 어떤 범위로 적용해야 하는지 설명한다. API와 backend 목록을 다시 소개하지 않고, `tenant-aggregator`와 `migration-gate` 예제가 서로 다른 coordination key와 완료 계약을 요구하는 이유를 실제 구현과 테스트로 보여 준다.

이 글은 기존 `bluetape4k-leader` 5편 시리즈의 후속 편이 아니다. 독립적으로 읽을 수 있는 실전 예제 글이며, 기존 시리즈는 기본 개념과 backend 상세 설명이 필요한 독자를 위한 참고 링크로만 사용한다.

## 제목과 경로

### 한국어

- 제목: `여러 서버가 같은 작업을 실행하지 않게 만드는 방법`
- 부제 방향: tenant별 집계와 migration gate로 보는 리더 선출의 범위
- 경로: `/ko/blog/leader-election-tenant-jobs-migration-gates/`
- 파일: `src/content/docs/ko/blog/leader-election-tenant-jobs-migration-gates.mdx`

### 영어

- 제목: `How to Keep Multiple Servers from Running the Same Job`
- 부제 방향: scoping leader election for tenant aggregation and migration gates
- 경로: `/blog/leader-election-tenant-jobs-migration-gates/`
- 파일: `src/content/docs/blog/leader-election-tenant-jobs-migration-gates.mdx`

## 독자와 중심 질문

주요 독자는 여러 인스턴스에서 scheduler, migration, polling, cache warm-up을 실행하는 JVM 백엔드 개발자다. 글은 다음 질문에 답해야 한다.

1. 모든 작업에 하나의 전역 leader를 두면 왜 tenant 간 병렬성을 잃는가.
2. tenant별 lock name은 어떤 단위로 중복 실행을 막으면서 다른 tenant의 작업을 병렬로 허용하는가.
3. migration은 leader lock만으로 정확히 한 번 실행된다고 말할 수 없는 이유가 무엇인가.
4. leader가 중단되었을 때 lease 만료와 다음 후보의 인계가 어떤 계약을 제공하는가.
5. Redis, Kubernetes Lease, RDB, etcd, Consul, Zookeeper, DynamoDB 중 무엇을 고를지 어떤 질문으로 좁힐 수 있는가.
6. acquisition 실패와 leadership churn을 운영에서 어떻게 발견하는가.

## 사실 근거와 우선순위

현재 동작은 아래 순서로 판정한다.

1. 예제의 Kotlin 구현과 테스트
2. 예제별 `README.md`와 `README.ko.md`
3. `bluetape4k-leader` core/backend 구현
4. 기존 `bluetape4k-leader` 블로그 시리즈
5. GitHub Issue #192의 작성 의도

주요 근거는 다음과 같다.

| 주제 | 근거 |
| --- | --- |
| tenant별 독립 선출 | `examples/tenant-aggregator` 구현과 `TenantAggregatorTest` |
| migration 동시 실행 방지와 완료 마커 | `examples/migration-gate` 구현과 `MigrationGateTest` |
| cache warm-up의 partition 단위 | `examples/cache-warmer` |
| poller의 claim, retry, failover | `examples/webhook-poller` |
| Kubernetes-native coordination | `examples/k8s-lease` |
| acquisition/leadership 관측 | `examples/prometheus-dashboard` |
| backend별 운영 특성 | 기존 Part 5와 각 backend 예제 README |

## 서술 구조

### 1. 장애 시나리오: 같은 작업이 두 번 시작된다

배포 직후 세 인스턴스가 같은 tenant 집계를 시작하거나 같은 migration을 동시에 수행하는 장면으로 시작한다. 문제를 단순히 “scheduler가 중복 실행됐다”로 줄이지 않고, 중복 집계는 비용과 결과 오염을 만들고 중복 migration은 schema/data 손상으로 이어질 수 있음을 구분한다.

### 2. 선출 범위는 작업의 충돌 범위와 같아야 한다

전역 leader 하나로 모든 tenant 집계를 직렬화하는 접근과 `tenant:{tenantId}` 단위 lock을 비교한다. 같은 tenant는 한 인스턴스만 처리하지만 서로 다른 tenant는 병렬 처리할 수 있어야 한다. `tenant-aggregator`의 lock name 생성과 테스트를 짧은 Kotlin 코드 또는 의사코드로 설명한다.

### 3. migration은 전역 lock과 완료 마커가 모두 필요하다

migration은 클러스터 전체에서 한 번에 하나만 실행되어야 하므로 전역 coordination key가 맞다. 그러나 lock은 동시 실행만 막고 영구적인 완료 사실을 보존하지 않는다. 따라서 `isApplied` 확인, leader 획득, 재확인, migration 실행, 완료 마커 기록의 순서를 설명한다. 프로세스가 실패할 수 있는 각 경계와 재시작 시 동작도 함께 다룬다.

### 4. lease와 failover가 보장하지 않는 것

leader 중단 뒤 다음 후보가 lease 만료를 기다려 인계하는 흐름을 보여 준다. 이 계약은 즉시 failover, exactly-once side effect, 장기 작업의 자동 fencing을 보장하지 않는다. action 자체의 idempotency, checkpoint, persistent marker가 필요한 경우를 구분한다.

### 5. 다른 현실적인 작업으로 확장한다

`cache-warmer`와 `webhook-poller`를 짧은 보조 사례로 사용한다. 각 사례에서 coordination key, 작업 상태 저장 위치, 재시도와 실패 종결 방식이 다르다는 점만 설명하고 또 다른 API 개요로 확장하지 않는다.

### 6. provider는 익숙함보다 실패 모델로 고른다

아래 열을 가진 표를 제공한다.

| 시나리오 | coordination key | 필요한 상태 | 고려할 provider 계열 | 주의점 |
| --- | --- | --- | --- | --- |

Redis, Kubernetes Lease, RDB/Exposed, etcd, Consul, Zookeeper, DynamoDB를 절대적인 순위로 정하지 않는다. 이미 운영 중인 인프라, lease/consistency 모델, 장애 시 복구 방식, 관측 가능성, 추가 운영 비용을 질문으로 제시한다.

### 7. 운영에서는 선출 결과보다 churn을 본다

`prometheus-dashboard` 예제를 근거로 acquisition 성공/실패, 현재 leader, leadership 변경 빈도, action 실패를 확인할 수 있어야 한다고 설명한다. metric name과 실제 제공 범위는 작성 시 현재 source에서 다시 고정한다.

## 시각 자료

### Hero

- 파일: `public/assets/leader-election-practical-jobs-hero.png`
- 형식: polished dark 3D miniature workbench raster image
- 장면: 세 JVM service node가 tenant job cards와 하나의 migration gate를 두고 coordination console을 통과하는 모습
- 제약: 텍스트와 로고 없이 16:9, 기존 블로그 hero의 navy/teal/purple 조명과 miniature robot language 유지

### Architecture diagram

- SVG: `public/assets/leader-election-coordination-scope-01.svg`
- PNG: `public/assets/leader-election-coordination-scope-01.png`
- 질문: 전역 key와 tenant-scoped key가 실행 병렬성을 어떻게 다르게 만드는가.
- 내용: service nodes, provider/storage, `tenant:A`, `tenant:B`, `migration:global`, guarded jobs, persistent migration marker
- 스타일: deep navy canvas, dark cards, teal/purple/amber accents, English labels for locale parity

### Failover sequence diagram

- SVG: `public/assets/leader-election-lease-failover-sequence-01.svg`
- PNG: `public/assets/leader-election-lease-failover-sequence-01.png`
- 질문: acquire, renew, action, node failure, lease expiry, successor acquisition이 어떤 순서로 이어지는가.
- 내용: Node A, Provider, Guarded Job, Node B와 failure/failover branch
- 주석: lease expiry가 exactly-once side effect를 증명하지 않는다는 경계 표시
- 스타일: architecture diagram과 동일한 dark palette, English labels

각 SVG는 한 asset씩 XML 검사, text hazard 검사, CairoSVG 2배 PNG 렌더링, connector/geometry/endpoint/type-specific audit, full-size PNG 검사를 수행한다.

## 코드와 테스트 설명 원칙

- 긴 구현을 복사하지 않고 coordination key와 상태 전이를 설명하는 8~20줄의 Kotlin 또는 의사코드만 사용한다.
- 테스트 이름을 나열하는 대신 arrange/act/assert 흐름으로 계약을 설명한다.
- 한국어 의사코드의 assertion은 실제 예제에서 사용하는 bluetape4k assertion 스타일과 맞춘다.
- source link는 `develop`의 실제 존재 경로로 연결한다.
- lock이 정확히 한 번 실행을 보장한다거나 특정 provider가 항상 더 안전하다는 주장은 하지 않는다.

## 한·영문 일치 계약

- 한국어 원문에서 사실, 용어, 그림, 표, 코드, 링크를 먼저 확정한다.
- 영문판은 문장별 직역이 아니라 같은 주장과 구조를 자연스럽게 현지화한다.
- 두 언어는 동일 slug, 날짜, source link, asset, section 순서, 표 행, caveat를 공유한다.
- diagram label은 두 언어에서 공통으로 사용할 수 있도록 영어로 작성한다.
- 한국어 문맥에서는 `leader`, `lock name`, `lease` 같은 식별 가능한 기술 용어를 억지로 번역하지 않되, 첫 등장에 역할을 설명한다.

## 검증

1. `git diff --check`
2. 두 SVG의 XML, text, connector, geometry, endpoint, kind-specific audit
3. CairoSVG `-s 2` 렌더링과 full-size PNG 육안 검사
4. `npm run build`
5. 한국어와 영어 route 파일 존재 확인
6. 두 MDX의 title, source link, asset, section/table parity 확인
7. 한국어 자연스러움 독립 검토에서 P0=0, P1=0
8. 최종 branch diff 검토에서 P0=0, P1=0
9. Issue #192를 연결한 ready PR 생성, exact-head CI와 live review 확인

## 비목표

- 기존 `bluetape4k-leader` 5편 시리즈 개편
- `bluetape4k-leader` production/example 코드 수정
- 새로운 benchmark 실행이나 backend 성능 순위 작성
- 모든 provider의 설치 튜토리얼
- exactly-once 실행을 보장한다고 주장하는 범용 설계
- PR 머지와 사이트 배포
