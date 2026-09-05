const companions = new Map([
  ['manual/bluetape4k-image/1.0/modules/spring-boot-image-intelligence-api', [{
    route: '/visual-companions/bluetape4k-image/image-intelligence-policy-privacy/',
    image: '/assets/visual-companions/wave1/image-intelligence-policy-privacy-en.png',
    title: 'Image Intelligence policy and privacy',
    description: 'Step through qualification, parallel analysis, fail-closed policy, and application-owned privacy side effects.',
  }]],
  ['manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging', [{
    route: '/visual-companions/bluetape4k-aws/aws-sqs-reliability/',
    image: '/assets/visual-companions/wave1/aws-sqs-reliability-en.png',
    title: 'SQS batch reliability Flight Recorder',
    description: 'Play normal delivery, partial handler failure, delete failure, cancellation, and observation failure.',
  }, {
    route: '/visual-companions/bluetape4k-aws/aws-streams-shard-consumers/',
    image: '/assets/visual-companions/wave2/aws-streams-shard-consumers-en.png',
    title: 'AWS Streams shard consumer lab',
    description: 'Compare discovery, graph ordering, bounded concurrency, emit-then-checkpoint, and failure boundaries for Kinesis and DynamoDB Streams.',
  }, {
    route: '/visual-companions/bluetape4k-aws/aws-modulith-event-externalization/',
    image: '/assets/visual-companions/wave2/aws-modulith-event-externalization-en.png',
    title: 'Spring Modulith event externalization',
    description: 'Trace outbound SNS/SQS publishers and inbound DIRECT-body or SNS-wrapped-SQS-body envelopes through version validation, idempotency, dispatch, and acknowledgement boundaries.',
  }, {
    route: '/visual-companions/bluetape4k-aws/aws-sns-signature-verification/',
    image: '/assets/visual-companions/wave2/aws-sns-signature-verification-en.png',
    title: 'AWS SNS signature verification',
    description: 'Trace structural parsing, exact TopicArn allowlisting before network access, certificate retrieval and caching, SignatureVersion 1/2 verification, and fail-closed handler admission.',
  }, {
    route: '/visual-companions/bluetape4k-aws/aws-sqs-extended-client/',
    image: '/assets/visual-companions/wave2/aws-sqs-extended-client-en.png',
    title: 'AWS SQS Extended Client lifecycle',
    description: 'Trace inline and S3-offloaded payloads through signed pointers, bounded restore, handler completion, SQS acknowledgement, and retryable cleanup.',
  }]],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-cache-lettuce/near-cache-l1-l2', [{
    route: '/visual-companions/bluetape4k-projects/projects-nearjcache-semantics/',
    image: '/assets/visual-companions/wave1/projects-nearjcache-semantics-en.png',
    title: 'NearJCache consistency lab',
    description: 'Explore L1 hits, L2 fills, conditional writes, bounded bulk policy, and epoch-gated clear.',
  }]],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-coroutines/flow', [{
    route: '/visual-companions/bluetape4k-projects/projects-coroutines-flow-operators/',
    image: '/assets/visual-companions/wave2/projects-coroutines-flow-operators-en.png',
    title: 'Coroutines Flow operator Marble Explorer',
    description: 'Select and replay 66 reactive operators across six families with sample input, output, timing, and terminal contracts.',
  }]],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-science', [{
    route: '/visual-companions/bluetape4k-projects/projects-netcdf-cf-progress/',
    image: '/assets/visual-companions/wave2/projects-netcdf-cf-progress-en.png',
    title: 'NetCDF 2D CF import and progress lab',
    description: 'Play coordinate resolution, bounded two-pass writes, slice checkpoints, timeout cleanup, and caller-owned retry decisions.',
  }, {
    route: '/visual-companions/bluetape4k-projects/projects-netcdf-data-model/',
    image: '/assets/visual-companions/wave2/projects-netcdf-data-model-en.png',
    title: 'NetCDF scientific data model',
    description: 'Follow dimensions, variables, coordinates, and attributes from one container to series, fields, volumes, and domain-specific science products.',
  }]],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-nats/jetstream-streams-consumers', [{
    route: '/visual-companions/bluetape4k-projects/projects-nats-jetstream-flow/',
    image: '/assets/visual-companions/wave2/projects-nats-jetstream-flow-en.png',
    title: 'NATS JetStream Flow sequence',
    description: 'Play cold pull and push consumers through bounded delivery, manual ack/nak/term, redelivery, push drop, cancellation, and completion.',
  }]],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-tenant', [{
    route: '/visual-companions/bluetape4k-projects/projects-tenant-context-carriers/',
    image: '/assets/visual-companions/wave2/projects-tenant-context-carriers-en.png',
    title: 'Tenant context carrier comparison',
    description: 'Compare explicit ThreadLocal, ScopedValue, Reactor Context, and Ktor ApplicationCall tenant carriers, including missing-context failures and unsupported propagation boundaries.',
  }]],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-tenant-reactor', [{
    route: '/visual-companions/bluetape4k-projects/projects-tenant-context-carriers/',
    image: '/assets/visual-companions/wave2/projects-tenant-context-carriers-en.png',
    title: 'Tenant context carrier comparison',
    description: 'Compare explicit ThreadLocal, ScopedValue, Reactor Context, and Ktor ApplicationCall tenant carriers, including missing-context failures and unsupported propagation boundaries.',
  }]],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-ktor-tenant', [{
    route: '/visual-companions/bluetape4k-projects/projects-tenant-context-carriers/',
    image: '/assets/visual-companions/wave2/projects-tenant-context-carriers-en.png',
    title: 'Tenant context carrier comparison',
    description: 'Compare explicit ThreadLocal, ScopedValue, Reactor Context, and Ktor ApplicationCall tenant carriers, including missing-context failures and unsupported propagation boundaries.',
  }]],
]);

const korean = new Map([
  ['manual/bluetape4k-image/1.0/modules/spring-boot-image-intelligence-api', [{
    title: 'Image Intelligence 정책과 개인정보 경계',
    description: '입력 검증, 병렬 분석, fail-closed 정책, 애플리케이션 소유 개인정보 side effect 경계를 단계별로 확인합니다.',
  }]],
  ['manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging', [{
    title: 'SQS batch 신뢰성 Flight Recorder',
    description: '정상 처리, handler 부분 실패, delete 실패, cancellation, observation 실패를 같은 흐름에서 비교합니다.',
  }, {
    title: 'AWS Streams shard consumer 실험실',
    description: 'Kinesis와 DynamoDB Streams의 discovery, graph ordering, bounded concurrency, emit-then-checkpoint, 실패 경계를 비교합니다.',
  }, {
    title: 'Spring Modulith 이벤트 외부화',
    description: 'SNS/SQS outbound publisher와 DIRECT body 또는 SNS-wrapped SQS body inbound envelope가 version 검증, idempotency, dispatch, acknowledgement 경계를 통과하는 흐름을 추적합니다.',
  }, {
    title: 'AWS SNS 서명 검증',
    description: '구조 파싱, network 접근 전 정확한 TopicArn allowlist, 인증서 조회와 cache, SignatureVersion 1/2 검증, fail-closed handler 진입 순서를 추적합니다.',
  }, {
    title: 'AWS SQS Extended Client lifecycle',
    description: 'inline payload와 S3 offload payload가 signed pointer, bounded restore, handler 완료, SQS acknowledgement, 재시도 가능한 cleanup을 통과하는 순서를 추적합니다.',
  }]],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-cache-lettuce/near-cache-l1-l2', [{
    title: 'NearJCache 일관성 실험실',
    description: 'L1 hit, L2 fill, conditional write, bounded bulk policy, epoch 기반 clear를 단계별로 살펴봅니다.',
  }]],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-coroutines/flow', [{
    title: 'Coroutines Flow 연산자 Marble Explorer',
    description: '6개 family의 reactive operator 66개를 선택하고 샘플 input, output, timing, terminal 계약을 단계별로 재생합니다.',
  }]],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-science', [{
    title: 'NetCDF 2D CF import와 progress 실험실',
    description: 'coordinate 해석, bounded two-pass write, slice checkpoint, timeout cleanup, caller 소유 retry 결정을 단계별로 살펴봅니다.',
  }, {
    title: 'NetCDF 과학 자료 모델',
    description: 'dimension, variable, coordinate, attribute가 하나의 container에서 series, field, volume, 분야별 과학 산출물로 이어지는 과정을 살펴봅니다.',
  }]],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-nats/jetstream-streams-consumers', [{
    title: 'NATS JetStream Flow sequence',
    description: 'cold pull과 push consumer가 bounded delivery, manual ack/nak/term, redelivery, push drop, cancellation, completion으로 이어지는 과정을 재생합니다.',
  }]],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-tenant', [{
    title: 'Tenant context carrier 비교',
    description: '명시적인 ThreadLocal, ScopedValue, Reactor Context, Ktor ApplicationCall tenant carrier를 비교하고 missing-context 실패와 지원하지 않는 전파 경계를 확인합니다.',
  }]],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-tenant-reactor', [{
    title: 'Tenant context carrier 비교',
    description: '명시적인 ThreadLocal, ScopedValue, Reactor Context, Ktor ApplicationCall tenant carrier를 비교하고 missing-context 실패와 지원하지 않는 전파 경계를 확인합니다.',
  }]],
  ['manual/bluetape4k-projects/2.0/modules/bluetape4k-ktor-tenant', [{
    title: 'Tenant context carrier 비교',
    description: '명시적인 ThreadLocal, ScopedValue, Reactor Context, Ktor ApplicationCall tenant carrier를 비교하고 missing-context 실패와 지원하지 않는 전파 경계를 확인합니다.',
  }]],
]);

export function resolveManualVisualCompanions(entryId, locale = 'en') {
  const key = String(entryId).replace(/^ko\//, '').replace(/\.(?:md|mdx)$/, '').replace(/\/$/, '');
  const entries = companions.get(key) ?? [];
  if (locale !== 'ko') return entries.map((entry) => ({ ...entry, label: 'Open interactive visual companion' }));

  const localized = korean.get(key) ?? [];
  return entries.map((entry, index) => ({
    ...entry,
    ...localized[index],
    route: `/ko${entry.route}`,
    image: entry.image.replace('-en.png', '-ko.png'),
    label: '대화형 시각 자료 열기',
  }));
}

export function resolveWave1ManualCompanion(entryId, locale = 'en') {
  return resolveManualVisualCompanions(entryId, locale)[0];
}
