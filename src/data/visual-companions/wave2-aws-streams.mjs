const text = (en, ko) => Object.freeze({ en, ko });

export const awsStreamsCompanion = Object.freeze({
  issue: '417',
  repository: 'bluetape4k-aws',
  slug: 'aws-streams-shard-consumers',
  sourceRevision: '632e0f346b807c4d50e3195f7b2b72082def9460',
  services: Object.freeze(['kinesis', 'dynamodb']),
  manual: Object.freeze({
    en: '/manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging/',
    ko: '/ko/manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging/',
  }),
  title: text('AWS Streams Shard Consumer Lab', 'AWS Streams shard consumer 실험실'),
  summary: text(
    'Play the same shard lifecycle across Kinesis and DynamoDB Streams to compare discovery, ordering, bounded concurrency, checkpoints, and failure boundaries.',
    '같은 shard lifecycle을 Kinesis와 DynamoDB Streams에서 재생해 discovery, 순서, 제한된 동시성, checkpoint, 실패 경계를 비교합니다.',
  ),
  servicesCopy: Object.freeze({
    kinesis: Object.freeze({
      name: text('Amazon Kinesis Data Streams', 'Amazon Kinesis Data Streams'),
      short: text('Kinesis', 'Kinesis'),
      concurrency: text('Semaphore(maxShardConcurrency)', 'Semaphore(maxShardConcurrency)'),
      order: text('Sequential polling inside each shard', 'shard 내부에서 순차 polling'),
      terminal: text('Durable KinesisCheckpoint.ShardEnd', 'durable KinesisCheckpoint.ShardEnd'),
    }),
    dynamodb: Object.freeze({
      name: text('Amazon DynamoDB Streams', 'Amazon DynamoDB Streams'),
      short: text('DynamoDB Streams', 'DynamoDB Streams'),
      concurrency: text('flatMapMerge(maxShardConcurrency)', 'flatMapMerge(maxShardConcurrency)'),
      order: text('Sequential parent-to-child traversal per root tree', 'root tree 안에서 parent 다음 child를 순차 처리'),
      terminal: text('Iterator completion unlocks child traversal', 'iterator 완료 뒤 child traversal 시작'),
    }),
  }),
  scenarios: Object.freeze([
    Object.freeze({
      id: 'normal',
      label: text('Normal completion', '정상 완료'),
      summary: text(
        'Both lanes finish emit-before-checkpoint processing; their shard-end contracts remain different.',
        '두 lane 모두 emit 이후 checkpoint를 저장하지만 shard 종료 계약은 서로 다릅니다.',
      ),
      failAt: null,
      targets: Object.freeze([]),
      kinesis: text(
        'A closed shard saves KinesisCheckpoint.ShardEnd, releases its lease, and makes dependent children eligible.',
        '닫힌 shard가 KinesisCheckpoint.ShardEnd를 저장하고 lease를 해제하면 dependent child가 실행 대상이 됩니다.',
      ),
      dynamodb: text(
        'A null nextShardIterator completes the parent Flow; the same root tree then enters each child sequentially.',
        'nextShardIterator가 null이면 parent Flow가 끝나고 같은 root tree의 child를 순서대로 처리합니다.',
      ),
    }),
    Object.freeze({
      id: 'resume',
      label: text('Inclusive resume', 'inclusive 재개'),
      summary: text(
        'Both stores resume at the saved sequence, so the last delivered record may be emitted again.',
        '두 저장소 모두 저장된 sequence부터 재개하므로 마지막으로 전달한 record가 다시 방출될 수 있습니다.',
      ),
      failAt: null,
      targets: Object.freeze([]),
      kinesis: text(
        'KinesisCheckpoint.Sequence becomes AtSequenceNumber on restart; a fenced durable store preserves at-least-once delivery, not exactly-once effects.',
        '재시작 시 KinesisCheckpoint.Sequence를 AtSequenceNumber로 바꿉니다. fenced durable store는 at-least-once 전달을 지킬 뿐 exactly-once side effect를 보장하지 않습니다.',
      ),
      dynamodb: text(
        'The saved sequence also becomes AtSequenceNumber; callers must make downstream work idempotent or deduplicate records.',
        '저장된 sequence 역시 AtSequenceNumber가 됩니다. downstream 처리는 caller가 idempotent하게 만들거나 중복을 제거해야 합니다.',
      ),
    }),
    Object.freeze({
      id: 'lease-loss',
      label: text('Kinesis lease loss', 'Kinesis lease loss'),
      summary: text(
        'Kinesis stops new emit and checkpoint work after fencing; DynamoDB Streams has no corresponding lease contract.',
        'Kinesis는 fencing 뒤 새 emit과 checkpoint를 중단합니다. DynamoDB Streams에는 대응하는 lease 계약이 없습니다.',
      ),
      failAt: 6,
      targets: Object.freeze(['kinesis']),
      kinesis: text(
        'A failed renew records KinesisLeaseLostException and cancels the shard job. An already-started emit may duplicate, while the stale fenced save is rejected.',
        'renew 실패는 KinesisLeaseLostException을 기록하고 shard job을 취소합니다. 이미 시작한 emit은 중복될 수 있고 stale fenced save는 거부됩니다.',
      ),
      dynamodb: text(
        'This lane keeps its own Flow lifecycle. Coordinating multiple consumers or assigning shard ownership remains caller architecture.',
        '이 lane은 자체 Flow lifecycle을 계속 따릅니다. 여러 consumer 조정과 shard 소유권 할당은 caller architecture에 남습니다.',
      ),
    }),
    Object.freeze({
      id: 'checkpoint-failure',
      label: text('Checkpoint failure', 'checkpoint 실패'),
      summary: text(
        'The delivered record is not followed by a durable position advance, so restart replays it.',
        '전달한 record 뒤 durable 위치가 전진하지 않으므로 재시작하면 해당 record를 다시 처리합니다.',
      ),
      failAt: 7,
      targets: Object.freeze(['kinesis', 'dynamodb']),
      kinesis: text(
        'The save carries the current lease. A store failure escapes the Flow and leaves the previous durable Sequence or ShardEnd unchanged.',
        'save에는 현재 lease가 함께 전달됩니다. 저장소 실패는 Flow 밖으로 전파되고 기존 durable Sequence 또는 ShardEnd는 그대로 남습니다.',
      ),
      dynamodb: text(
        'A save failure also escapes recordFlow after emit. The store retains its previous sequence and the caller observes at-least-once replay.',
        'save 실패는 emit 뒤 recordFlow 밖으로 전파됩니다. 저장소에는 이전 sequence가 남고 caller는 at-least-once replay를 관찰합니다.',
      ),
    }),
    Object.freeze({
      id: 'cancellation',
      label: text('Cancellation', 'cancellation'),
      summary: text(
        'Cancellation wins over retries; an unfinished downstream emit is never followed by checkpoint save.',
        'cancellation이 retry보다 우선하며 완료되지 않은 downstream emit 뒤에는 checkpoint를 저장하지 않습니다.',
      ),
      failAt: 6,
      targets: Object.freeze(['kinesis', 'dynamodb']),
      kinesis: text(
        'The collector cancellation closes the rendezvous output, cancels discovery and shard jobs, and performs a bounded NonCancellable lease release.',
        'collector cancellation은 rendezvous output을 닫고 discovery와 shard job을 취소한 뒤 제한된 NonCancellable lease release를 수행합니다.',
      ),
      dynamodb: text(
        'CancellationException is rethrown immediately. Iterator and throttle retry branches do not swallow it, and the incomplete record has no new checkpoint.',
        'CancellationException을 즉시 다시 던집니다. iterator와 throttle retry가 이를 삼키지 않으며 완료되지 않은 record에는 새 checkpoint가 없습니다.',
      ),
    }),
  ]),
  frames: Object.freeze([
    Object.freeze({
      id: 'ready',
      phase: text('Ready', '준비'),
      kinesis: Object.freeze({
        action: text('Collecting consumerFlow opens one discovery job, a rendezvous output channel, and a semaphore for active shards.', 'consumerFlow 수집을 시작하면 discovery job 하나, rendezvous output channel, active shard용 semaphore를 엽니다.'),
        guard: text('The adapter owns no AWS client or durable store lifecycle; those resources remain caller-owned.', 'adapter는 AWS client와 durable store lifecycle을 소유하지 않습니다. 이 자원의 lifecycle은 caller가 관리합니다.'),
        next: text('Start bounded ListShards discovery and discard any incomplete page set on a retryable token failure.', '제한된 ListShards discovery를 시작하고 retry 가능한 token 실패가 나면 불완전한 page 집합을 폐기합니다.'),
      }),
      dynamodb: Object.freeze({
        action: text('Collecting shardRecordFlow validates the stream ARN before making the first DescribeStream request.', 'shardRecordFlow 수집을 시작하면 첫 DescribeStream 요청 전에 stream ARN을 검증합니다.'),
        guard: text('The injected DynamoDbStreamsClient lifecycle stays with the caller; short-lived clients use the scoped helper.', '주입한 DynamoDbStreamsClient lifecycle은 caller가 소유하며 짧게 쓰는 client는 scoped helper로 닫습니다.'),
        next: text('Read the stream description through a bounded pagination loop.', '제한된 pagination loop로 stream description을 읽습니다.'),
      }),
    }),
    Object.freeze({
      id: 'discover',
      phase: text('Discover shards', 'shard 발견'),
      kinesis: Object.freeze({
        action: text('ListShards follows nextToken up to maxListShardsPages and de-duplicates entries by shardId.', 'ListShards는 maxListShardsPages까지 nextToken을 따라가며 shardId 기준으로 entry 중복을 제거합니다.'),
        guard: text('Non-progressing tokens, page overflow, shard-count overflow, and unresolved parents fail or retry within configured bounds.', '진행하지 않는 token, page 상한 초과, shard 수 초과, 찾지 못한 parent는 설정된 범위 안에서 실패하거나 재시도합니다.'),
        next: text('Convert parentShardId and adjacentParentShardId into a closed acyclic dependency graph.', 'parentShardId와 adjacentParentShardId를 닫힌 acyclic dependency graph로 바꿉니다.'),
      }),
      dynamodb: Object.freeze({
        action: text('DescribeStream follows lastEvaluatedShardId up to maxDescribePages and collects every returned shard.', 'DescribeStream은 maxDescribePages까지 lastEvaluatedShardId를 따라가며 반환된 모든 shard를 모읍니다.'),
        guard: text('Reaching the configured page ceiling without a terminal page fails instead of hiding missing shards.', '마지막 page에 도달하지 못한 채 설정한 상한을 채우면 누락된 shard를 숨기지 않고 실패합니다.'),
        next: text('Group children by parentShardId and identify roots for bounded tree traversal.', 'parentShardId별로 child를 묶고 제한된 tree traversal을 시작할 root를 찾습니다.'),
      }),
    }),
    Object.freeze({
      id: 'graph',
      phase: text('Build shard graph', 'shard graph 구성'),
      kinesis: Object.freeze({
        action: text('Each node keeps both parent and adjacent-parent dependencies plus the optional ending sequence number.', '각 node는 parent와 adjacent parent dependency, 선택적인 ending sequence number를 보존합니다.'),
        guard: text('Cycle detection and unknown-parent checks prevent a child from being promoted to a root by incomplete discovery.', 'cycle 검사와 unknown-parent 검사는 discovery가 불완전할 때 child를 root로 잘못 올리지 못하게 합니다.'),
        next: text('Check every dependency for durable KinesisCheckpoint.ShardEnd before scheduling the child.', 'child를 schedule하기 전에 모든 dependency의 durable KinesisCheckpoint.ShardEnd를 확인합니다.'),
      }),
      dynamodb: Object.freeze({
        action: text('The adapter builds parent-to-children lists and treats a shard with no known parent as a root tree.', 'adapter는 parent-to-children 목록을 만들고 알려진 parent가 없는 shard를 root tree로 취급합니다.'),
        guard: text('A concurrent visited set prevents the same shard from being consumed twice when the graph is traversed.', 'concurrent visited set은 graph traversal 중 같은 shard를 두 번 소비하지 못하게 합니다.'),
        next: text('Launch root trees with bounded flatMapMerge while preserving sequential work inside each tree.', 'root tree는 bounded flatMapMerge로 시작하되 각 tree 내부 작업은 순차로 유지합니다.'),
      }),
    }),
    Object.freeze({
      id: 'gate',
      phase: text('Apply ordering gate', '순서 gate 적용'),
      kinesis: Object.freeze({
        action: text('A child is eligible only when all parent checkpoints are durable ShardEnd values and an active slot is available.', '모든 parent checkpoint가 durable ShardEnd이고 active slot이 남아 있을 때만 child를 실행할 수 있습니다.'),
        guard: text('activeJobs and Semaphore(maxShardConcurrency) bound the number of shard jobs; a shard job polls sequentially.', 'activeJobs와 Semaphore(maxShardConcurrency)가 shard job 수를 제한하고 각 shard job은 순차로 polling합니다.'),
        next: text('Acquire a caller-provided lease before the eligible shard reads records.', '실행 대상 shard가 record를 읽기 전에 caller가 제공한 lease를 획득합니다.'),
      }),
      dynamodb: Object.freeze({
        action: text('flatMapMerge(maxShardConcurrency) bounds root trees, while consumeShardTree waits for the parent Flow to finish.', 'flatMapMerge(maxShardConcurrency)가 root tree 수를 제한하고 consumeShardTree는 parent Flow가 끝날 때까지 기다립니다.'),
        guard: text('Ordering is per shard and per root tree; no global record order is promised across roots.', '순서는 shard와 root tree 안에서만 보장하며 서로 다른 root 사이의 전역 record 순서는 보장하지 않습니다.'),
        next: text('Enter the root shard without acquiring a lease or fencing token.', 'lease나 fencing token을 획득하지 않고 root shard 처리를 시작합니다.'),
      }),
    }),
    Object.freeze({
      id: 'start',
      phase: text('Start shard', 'shard 시작'),
      kinesis: Object.freeze({
        action: text('The shard job acquires KinesisLeaseStore ownership, starts renewal, and loads Sequence or ShardEnd from the checkpoint store.', 'shard job은 KinesisLeaseStore 소유권을 획득하고 renew를 시작한 뒤 checkpoint store에서 Sequence 또는 ShardEnd를 읽습니다.'),
        guard: text('A missing lease skips this worker; ShardEnd skips completed work; Sequence resumes with AtSequenceNumber inclusively.', 'lease를 얻지 못하면 이 worker를 건너뛰고 ShardEnd면 완료된 작업을 건너뜁니다. Sequence는 AtSequenceNumber로 inclusive 재개합니다.'),
        next: text('Fetch a shard iterator and verify the lease again before polling.', 'shard iterator를 얻고 polling 전에 lease를 다시 검증합니다.'),
      }),
      dynamodb: Object.freeze({
        action: text('recordFlow loads the shard checkpoint and turns a stored sequence into AtSequenceNumber before iterator creation.', 'recordFlow는 shard checkpoint를 읽고 저장된 sequence를 iterator 생성 전에 AtSequenceNumber로 바꿉니다.'),
        guard: text('There is no lease SPI here; the adapter preserves streamArn and shardId in the emitted envelope instead.', '여기에는 lease SPI가 없습니다. 대신 adapter는 방출하는 envelope에 streamArn과 shardId를 보존합니다.'),
        next: text('Create the shard iterator and begin sequential GetRecords polling.', 'shard iterator를 만들고 순차 GetRecords polling을 시작합니다.'),
      }),
    }),
    Object.freeze({
      id: 'poll',
      phase: text('Poll records', 'record polling'),
      kinesis: Object.freeze({
        action: text('GetRecords runs sequentially per shard with a request limit bounded by batchLimit and maxRecordsPerPoll.', 'GetRecords는 shard마다 순차 실행되며 request limit은 batchLimit과 maxRecordsPerPoll로 제한됩니다.'),
        guard: text('Iterator expiry and retryable throttling use bounded retries; cancellation is rethrown immediately.', 'iterator 만료와 retry 가능한 throttling은 제한된 횟수만 재시도하며 cancellation은 즉시 다시 던집니다.'),
        next: text('Send one envelope through the rendezvous channel to the single outer emitter.', 'envelope 하나를 rendezvous channel로 단일 outer emitter에 전달합니다.'),
      }),
      dynamodb: Object.freeze({
        action: text('GetRecords runs sequentially in one shard, records batch metrics, and advances only with nextShardIterator.', 'GetRecords는 한 shard에서 순차 실행되고 batch metric을 기록하며 nextShardIterator가 있을 때만 계속 진행합니다.'),
        guard: text('Trimmed data fails immediately; iterator and throttle retries are bounded and never consume CancellationException.', 'trimmed data는 즉시 실패합니다. iterator와 throttle retry 횟수는 제한되며 CancellationException을 삼키지 않습니다.'),
        next: text('Emit each record directly from the shard Flow before touching its checkpoint.', 'checkpoint를 변경하기 전에 shard Flow에서 각 record를 직접 방출합니다.'),
      }),
    }),
    Object.freeze({
      id: 'emit',
      phase: text('Deliver downstream', 'downstream 전달'),
      kinesis: Object.freeze({
        action: text('The shard job sends PendingRecord and waits until the outer collector finishes emit and completes its acknowledgement.', 'shard job은 PendingRecord를 보내고 outer collector가 emit을 마친 뒤 acknowledgement를 완료할 때까지 기다립니다.'),
        guard: text('Rendezvous capacity prevents hidden buffering; lease checks surround emit so stale ownership cannot start new work.', 'rendezvous capacity는 숨은 buffering을 막고 emit 전후 lease 검사가 stale owner의 새 작업 시작을 차단합니다.'),
        next: text('After acknowledgement, verify the lease again and save the sequence checkpoint.', 'acknowledgement 뒤 lease를 다시 확인하고 sequence checkpoint를 저장합니다.'),
      }),
      dynamodb: Object.freeze({
        action: text('recordFlow emits the SDK Record to its collector and waits for the downstream call to return.', 'recordFlow는 SDK Record를 collector에 방출하고 downstream 호출이 반환될 때까지 기다립니다.'),
        guard: text('Cancellation or downstream failure exits before save, so an incomplete effect never advances the checkpoint.', 'cancellation 또는 downstream 실패는 save 전에 빠져나가므로 완료되지 않은 side effect가 checkpoint를 전진시키지 않습니다.'),
        next: text('Read the record sequence number and save it under streamArn plus shardId.', 'record sequence number를 읽고 streamArn과 shardId를 key로 저장합니다.'),
      }),
    }),
    Object.freeze({
      id: 'checkpoint',
      phase: text('Save checkpoint', 'checkpoint 저장'),
      kinesis: Object.freeze({
        action: text('KinesisCheckpointStore.save writes Sequence together with the currently renewed lease for fencing.', 'KinesisCheckpointStore.save는 fencing을 위해 현재 renew된 lease와 Sequence를 함께 저장합니다.'),
        guard: text('A save failure escapes the Flow and leaves the prior durable checkpoint intact for at-least-once replay.', 'save가 실패하면 Flow 밖으로 전파되고 이전 durable checkpoint가 남아 at-least-once replay가 일어납니다.'),
        next: text('Continue polling or persist ShardEnd when the closed shard reaches its ending sequence.', 'polling을 계속하거나 닫힌 shard가 ending sequence에 도달하면 ShardEnd를 저장합니다.'),
      }),
      dynamodb: Object.freeze({
        action: text('DynamoDbStreamsCheckpointStore.save records the emitted sequence under the current stream and shard.', 'DynamoDbStreamsCheckpointStore.save는 방출한 sequence를 현재 stream과 shard key로 저장합니다.'),
        guard: text('The stored value resumes inclusively and therefore permits duplicates; exactly-once side effects stay outside the adapter.', '저장된 값부터 inclusive 재개하므로 중복을 허용합니다. exactly-once side effect는 adapter 범위 밖입니다.'),
        next: text('Continue with nextShardIterator or complete the parent Flow when the iterator ends.', 'nextShardIterator로 계속 진행하거나 iterator가 끝나면 parent Flow를 완료합니다.'),
      }),
    }),
    Object.freeze({
      id: 'shard-end',
      phase: text('Finish shard', 'shard 종료'),
      kinesis: Object.freeze({
        action: text('A closed shard saves KinesisCheckpoint.ShardEnd, reports completion, and releases its lease within a bounded NonCancellable section.', '닫힌 shard는 KinesisCheckpoint.ShardEnd를 저장하고 완료를 보고한 뒤 제한된 NonCancellable 구간에서 lease를 해제합니다.'),
        guard: text('Dependent children remain blocked until every recorded parent, including adjacent parents, has durable ShardEnd.', 'dependent child는 adjacent parent를 포함한 모든 parent가 durable ShardEnd를 가질 때까지 계속 차단됩니다.'),
        next: text('The discovery loop may schedule newly eligible children without exceeding maxShardConcurrency.', 'discovery loop는 maxShardConcurrency를 넘지 않는 범위에서 새로 실행 가능한 child를 schedule합니다.'),
      }),
      dynamodb: Object.freeze({
        action: text('A null nextShardIterator returns from the parent Flow; consumeShardTree then visits each child sequentially.', 'nextShardIterator가 null이면 parent Flow를 끝내고 consumeShardTree가 각 child를 순서대로 방문합니다.'),
        guard: text('No durable ShardEnd marker or lease fencing is added; restart safety depends on the caller-provided sequence store.', 'durable ShardEnd marker나 lease fencing을 추가하지 않습니다. 재시작 안전성은 caller가 제공한 sequence store에 달려 있습니다.'),
        next: text('Other root trees may still run within flatMapMerge(maxShardConcurrency); no global order is implied.', '다른 root tree는 flatMapMerge(maxShardConcurrency) 안에서 계속 실행될 수 있으며 전역 순서를 뜻하지 않습니다.'),
      }),
    }),
  ]),
  ownership: Object.freeze({
    adapter: text(
      'Bounded pagination and concurrency · per-shard order · cancellation propagation · emit-before-checkpoint · at-least-once resume',
      '제한된 pagination과 동시성 · shard 내부 순서 · cancellation 전파 · emit 이후 checkpoint · at-least-once 재개',
    ),
    caller: text(
      'Durable stores · idempotency and deduplication · retry and retention policy · reshard operations · client lifecycle',
      'durable store · idempotency와 중복 제거 · retry와 retention 정책 · reshard 운영 · client lifecycle',
    ),
  }),
  sources: Object.freeze([
    Object.freeze({ label: 'Kinesis Issue #470', url: 'https://github.com/bluetape4k/bluetape4k-aws/issues/470' }),
    Object.freeze({ label: 'Kinesis PR #579', url: 'https://github.com/bluetape4k/bluetape4k-aws/pull/579' }),
    Object.freeze({ label: 'DynamoDB Streams Issue #469', url: 'https://github.com/bluetape4k/bluetape4k-aws/issues/469' }),
    Object.freeze({ label: 'DynamoDB Streams PR #578', url: 'https://github.com/bluetape4k/bluetape4k-aws/pull/578' }),
  ]),
});
