# Issue #417 AWS Streams 시각 자료 설계

## 문제와 독자

`bluetape4k-aws` 1.0.0은 Kinesis와 DynamoDB Streams에 서로 닮았지만 동일하지 않은 multi-shard `Flow`를 제공한다. 독자는 코드 전체를 읽지 않고도 shard 발견, parent/child 순서, 제한된 동시성, checkpoint 재개, 실패 시 상태 변화를 비교해야 한다.

기준 구현은 `bluetape4k-aws` tag `1.0.0`의 commit `632e0f346b807c4d50e3195f7b2b72082def9460`이다. 공개 근거는 Issue #469, #470과 PR #578, #579이며, 사이트에서는 1.0 매뉴얼과 연결한다.

## 범위

- GitHub Issue #417만 구현한다. Epic 2의 #418~#423은 이번 변경에 포함하지 않는다.
- 한국어와 영어에 동등한 대화형 페이지를 제공한다.
- locale별 SVG·PNG와 semantic ledger를 제공한다.
- 기존 Wave 1의 theme, `Reset / Play / Next`, 단계별 상세 설명 형식을 계승한다.
- 실제 AWS 실행, KCL, exactly-once, 무제한 병렬 처리, 운영 retry·retention 정책을 구현 또는 암시하지 않는다.

## 검토한 표현 방식

1. 하나의 긴 정적 sequence: 전체 topology는 잘 보이지만 실패 상태와 두 서비스의 차이를 단계별로 탐색하기 어렵다.
2. 서비스별 독립 페이지 두 개: 각 경로는 단순해지지만 같은 단계에서의 차이를 비교하기 어렵다.
3. 하나의 비교형 실험실: 공통 재생 축과 두 서비스 lane을 함께 보여 주면서 시나리오별 설명을 바꿀 수 있다.

3번을 선택한다. 정적 SVG는 전체 계약을 긴 한 장으로 요약하고, 대화형 페이지는 같은 source model에서 단계와 실패 상태를 재생한다.

## 정보 구조

### 공통 제어

- 시나리오: 정상 완료, inclusive 재개, Kinesis lease loss, checkpoint 실패, cancellation
- 재생: `Reset`, `Play`, `Next`
- 단계: 발견 → graph 구성 → child gate → shard 시작 → polling → downstream emit → checkpoint → shard 종료

### Kinesis lane

- `ListShards` pagination과 parent·adjacent-parent dependency graph
- `Semaphore(maxShardConcurrency)`와 shard별 순차 polling
- `KinesisLeaseStore` acquire/renew/fencing
- rendezvous `emit` 완료 뒤 `KinesisCheckpoint.Sequence` 저장
- 모든 parent의 durable `KinesisCheckpoint.ShardEnd` 뒤 child 시작
- lease loss 뒤 새 emit/save 중단, 이미 시작한 in-flight emit은 중복 가능

### DynamoDB Streams lane

- `DescribeStream` pagination과 parent→child tree
- root tree 사이 bounded `flatMapMerge(maxShardConcurrency)`
- 한 tree 안에서는 parent가 끝난 뒤 child를 순차 처리
- `emit` 완료 뒤 sequence checkpoint 저장
- `nextShardIterator == null`이면 shard를 완료하고 child traversal로 이동
- lease/fencing 계약은 제공하지 않음

### 책임 경계

- adapter: pagination 상한, 제한된 동시성, shard 내부 순서, cancellation 전파, emit 후 checkpoint, at-least-once 재개
- caller: durable checkpoint/lease 구현, idempotency·중복 제거, retry·retention·resharding 운영 정책, client lifecycle

## 실패 상태

- inclusive 재개: 저장된 sequence부터 다시 읽으므로 마지막 record가 중복될 수 있다.
- Kinesis lease loss: 새 emit/save를 중단하고 fenced save를 거부한다. DynamoDB Streams lane에는 해당 기능이 없음을 표시한다.
- checkpoint 실패: Flow가 실패하며 durable 위치는 전진하지 않는다.
- cancellation: downstream emit이 완료되지 않았다면 checkpoint를 저장하지 않는다.
- shard 종료: Kinesis는 durable `ShardEnd`를 저장하고, DynamoDB Streams는 iterator 종료 뒤 child traversal로 이동한다.

## 파일과 노출 경로

- 구조화 원본: `src/data/visual-companions/wave2-aws-streams.mjs`
- 대화형 생성기: `scripts/generate-2-0-wave2-interactive.mjs`
- 정적 생성기: `scripts/generate-2-0-wave2-visuals.mjs`
- 페이지: `/visual-companions/bluetape4k-aws/aws-streams-shard-consumers/`와 `/ko/...`
- 정적 자산: `/assets/visual-companions/wave2/aws-streams-shard-consumers-{en,ko}.{svg,png}`
- semantic ledger: `docs/diagrams/visual-companions-wave2/`
- 목록: Epic 2 페이지에는 완료된 #417만 표시한다.
- 매뉴얼: `storage-and-messaging` header에서 기존 SQS와 새 Streams companion을 각각 선택할 수 있게 한다.

## 검증

- structured source와 생성 산출물의 일치 검사
- semantic ledger, SVG XML, text, connector, arrowhead, geometry, endpoint, mixed-corner, PNG canvas, asset-pair audit
- EN/KO 단계·시나리오·식별자 parity와 한국어 용어 감사
- desktop/mobile, light/dark, keyboard focus, reduced-motion, `Play / Next`를 Playwright로 검증
- `git diff --check`, 관련 Node tests, `npm run build`, 변경 route와 절대 asset URL 확인

## 완료 조건

Issue #417의 모든 acceptance 항목을 만족하고 PR을 `develop` 대상으로 게시해 exact-head CI가 확인되면 merge-ready다. 병합과 배포는 별도 승인 전에는 실행하지 않는다.
