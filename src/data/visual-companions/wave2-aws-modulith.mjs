const bi = (en, ko) => ({ en, ko });
const revision = '870361650e6caf8b1ac3fae141789fccbb0969c7';
const source = (file) => `https://github.com/bluetape4k/bluetape4k-aws/blob/${revision}/aws-spring-boot/src/main/kotlin/io/bluetape4k/aws/spring/modulith/${file}.kt`;
const phase = (id, label, text, owner) => ({ id, label, text, owner });

export const modulith = {
  issue: 420, slug: 'aws-modulith-event-externalization', repository: 'bluetape4k-aws', revision,
  title: bi('Publish an event. Keep the boundaries.', '이벤트를 보내고, 처리 경계를 지킵니다.'),
  summary: bi('Follow a versioned event from its logical target to source verification, a fenced claim, local dispatch, and SQS acknowledgement.', '버전이 있는 이벤트가 논리 대상에서 출발해 입력 검증, fencing claim, 로컬 dispatch, SQS acknowledgement에 도달하는 과정을 살펴봅니다.'),
  invariant: bi('Publish success ≠ consumer completion', '발행 성공 ≠ 수신 처리 완료'),
  paths: [
    { id: 'sqs', label: 'SQS', summary: bi('SQS publish → DIRECT input', 'SQS 발행 → DIRECT 입력'), detail: bi('The publisher sends the envelope and String attributes to a configured queue. The consumer reads the body in DIRECT mode.', 'Publisher는 설정된 queue로 envelope와 String attribute를 보냅니다. Consumer는 DIRECT 모드로 body를 읽습니다.') },
    { id: 'sns', label: 'SNS', summary: bi('SNS publish → wrapped SNS input on SQS', 'SNS 발행 → SQS의 SNS 래핑 입력'), detail: bi('The configured subscription delivers a wrapped Notification to SQS. Check the allowed topic and signature before decoding its Message.', '설정된 subscription이 Notification으로 감싼 메시지를 SQS에 전달합니다. 허용 topic과 서명을 확인한 뒤 Message를 decode합니다.') },
    { id: 'direct', label: 'DIRECT', summary: bi('Start at the SQS input boundary', 'SQS 입력 경계에서 시작'), detail: bi('DIRECT is an inbound body mode, not a third publisher or a local shortcut. SNS-shaped bodies are rejected; queue access policy remains operator-owned.', 'DIRECT는 수신 body 모드입니다. 세 번째 publisher나 로컬 우회 경로가 아닙니다. SNS 형태의 body는 거부하며 queue 접근 정책은 운영자가 관리합니다.') },
  ],
  scenarios: [
    { id: 'normal', label: bi('Processed', '정상 처리') },
    { id: 'source', label: bi('Source rejected', '입력 거부') },
    { id: 'version', label: bi('Invalid envelope', '잘못된 envelope') },
    { id: 'duplicate', label: bi('Completed duplicate', '완료된 중복') },
    { id: 'busy', label: bi('Claim in progress', '처리 중인 claim') },
    { id: 'handler', label: bi('Handler failed', 'Handler 실패') },
    { id: 'claim', label: bi('Completion rejected', 'Claim 완료 거부') },
    { id: 'ack', label: bi('Ack failed', 'Ack 실패') },
    { id: 'publish', label: bi('Publish failed', '발행 실패'), outboundOnly: true },
    { id: 'cancel', label: bi('Dispatch cancelled', 'Dispatch 취소') },
  ],
  phases: {
    encode: phase('encode', bi('Resolve & encode', '대상 해석과 encode'), bi('Resolve the configured target and routing key, then the allowlisted event type and version. Preserve the stable event ID and permitted headers in the bounded envelope.', '설정된 대상과 routing key를 해석한 뒤 등록된 이벤트 type과 version을 찾습니다. 크기가 제한된 envelope에 안정적인 이벤트 ID와 허용 header를 담습니다.'), 'adapter'),
    publish: phase('publish', bi('Publish to AWS', 'AWS로 발행'), bi('The bounded transport completes its publication future only after the AWS publisher returns.', '동시 발행 수가 제한된 transport는 AWS publisher가 반환한 뒤 publication future를 완료합니다.'), 'adapter'),
    source: phase('source', bi('Verify source', '입력 검증'), bi('DIRECT rejects SNS-shaped bodies. SNS mode checks the topic allowlist, signature, and verified Message before envelope decode.', 'DIRECT는 SNS 형태의 body를 거부합니다. SNS 모드는 topic allowlist, 서명, 검증된 Message를 확인한 뒤 envelope를 decode합니다.'), 'adapter'),
    decode: phase('decode', bi('Decode envelope', 'Envelope decode'), bi('Validate specVersion, registered type/version, payload size, headers, system attributes, and event identity before claiming.', 'Claim 전에 specVersion, 등록된 type/version, payload 크기, header, system attribute와 이벤트 식별자를 검증합니다.'), 'adapter'),
    claim: phase('claim', bi('Claim the event', '이벤트 claim'), bi('Claim by event type and stable ID. Completed returns a duplicate outcome; InProgress fails; Acquired grants a fenced token.', '이벤트 type과 안정적인 ID로 claim합니다. Completed는 중복 결과를 반환하고 InProgress는 실패하며 Acquired는 fencing token을 부여합니다.'), 'store'),
    dispatch: phase('dispatch', bi('Dispatch locally', '로컬 dispatch'), bi('Maintain the claim heartbeat while publishEvent executes. Returning does not await asynchronous listeners or their final business effects.', 'publishEvent 실행 중 claim heartbeat를 유지합니다. 반환 시점은 비동기 listener나 그 최종 업무 결과의 완료를 보장하지 않습니다.'), 'application'),
    complete: phase('complete', bi('Complete the claim', 'Claim 완료'), bi('Complete using the current fenced token. Only APPLIED or ALREADY_APPLIED permits a processed outcome.', '현재 fencing token으로 claim을 완료합니다. APPLIED 또는 ALREADY_APPLIED만 처리 완료 결과를 허용합니다.'), 'store'),
    ack: phase('ack', bi('Acknowledge SQS', 'SQS acknowledgement'), bi('The manual listener acknowledges only after consume returns: PROCESSED or COMPLETED_DUPLICATE. Ack failure is still a failure.', 'Manual listener는 consume이 PROCESSED 또는 COMPLETED_DUPLICATE로 반환한 뒤에만 acknowledge합니다. Ack 자체의 실패도 별도로 처리합니다.'), 'adapter'),
  },
  failures: {
    source: { at: 'source', code: 'AwsModulithSourceException', text: bi('Source verification failed. No envelope decode, claim, dispatch, or acknowledgement follows.', '입력 검증에 실패했습니다. Envelope decode, claim, dispatch, acknowledgement를 수행하지 않습니다.') },
    version: { at: 'decode', code: 'INBOUND · envelope / type / version', text: bi('The envelope is invalid or its type/version is not registered. Reject before claim and dispatch; do not acknowledge.', 'Envelope가 잘못되었거나 type/version이 등록되지 않았습니다. Claim과 dispatch 전에 거부하며 acknowledge하지 않습니다.') },
    busy: { at: 'claim', code: 'AwsModulithEventInProgressException', text: bi('Another valid claim is active. Do not dispatch or acknowledge. The configured delivery policy determines a later attempt.', '유효한 다른 claim이 처리 중입니다. Dispatch와 acknowledge를 수행하지 않습니다. 이후 시도는 설정된 전달 정책에 따릅니다.') },
    handler: { at: 'dispatch', code: 'AwsModulithDispatchException', text: bi('Handler failure triggers bounded claim-release cleanup and propagates failure. No completion or ack; retry must account for partial business effects.', 'Handler 실패 시 제한 시간 내 claim 해제 cleanup을 시도하고 실패를 전파합니다. 완료와 ack는 수행하지 않으며 재시도는 부분 업무 결과를 고려해야 합니다.') },
    claim: { at: 'complete', code: 'AwsModulithClaimMutationException', text: bi('Dispatch returned, but fenced completion was rejected. Do not acknowledge; business work may already have happened.', 'Dispatch가 반환했지만 fencing 완료가 거부되었습니다. Acknowledge하지 않으며 업무 처리는 이미 실행되었을 수 있습니다.') },
    ack: { at: 'ack', code: 'AwsModulithAcknowledgementException', text: bi('The claim stays completed after ack failure. Redelivery can take the completed-duplicate path while that record remains available.', 'Ack 실패 뒤에도 claim 완료 상태는 유지됩니다. 완료 기록이 남아 있으면 재전달 시 완료된 중복 경로를 따를 수 있습니다.') },
    publish: { at: 'publish', code: 'Publication future failed', text: bi('A failed publish does not complete the publication successfully. Delivery may be uncertain; retry policy and duplicate safety remain explicit responsibilities.', '발행 실패를 publication 성공으로 처리하지 않습니다. 실제 전달 여부가 불확실할 수 있으므로 재시도 정책과 중복 안전성을 별도로 관리해야 합니다.') },
    cancel: { at: 'dispatch', code: 'CancellationException', text: bi('Cancellation is propagated and bounded release cleanup is attempted. No claim completion or ack follows; already-started work may have effects.', '취소를 전파하고 제한 시간 내 claim 해제 cleanup을 시도합니다. Claim 완료와 ack는 수행하지 않으며 이미 시작한 작업의 결과는 남을 수 있습니다.') },
  },
  envelope: [
    ['specVersion', bi('Wire format = 1', 'Wire 형식 = 1')],
    ['id', bi('Stable event identity', '안정적인 이벤트 식별자')],
    ['type + version', bi('Explicit registry entry', '명시적인 registry 항목')],
    ['payload', bi('Serialized string, byte limits', '직렬화 문자열, byte 상한')],
    ['headers', bi('Allowlisted business headers', '허용된 업무 header')],
    ['bt4k-event-*', bi('ID/type/version attributes must agree', 'ID/type/version attribute 일치')],
  ],
  responsibilities: [
    { title: bi('Adapter', 'Adapter'), text: bi('Bounded publication, envelope checks, source verification, fenced claim orchestration, synchronous dispatch, and manual acknowledgement ordering.', '동시 발행 제한, envelope 검사, 입력 검증, fencing claim 조정, 동기 dispatch와 manual acknowledgement 순서를 관리합니다.') },
    { title: bi('Application & operations', '애플리케이션과 운영'), text: bi('AWS clients and credentials, IAM, topics, queues, subscriptions, retry/DLQ policy, durable idempotency storage, and business-effect safety.', 'AWS client와 자격 증명, IAM, topic, queue, subscription, 재시도/DLQ 정책, 영속 idempotency 저장소와 업무 결과의 안전성을 관리합니다.') },
  ],
  caveats: bi('This explorer models control-flow boundaries, not a running broker. In-memory idempotency cannot provide cross-process or restart durability. Async handlers and partial side effects need application-level safeguards.', '이 탐색기는 실행 중인 broker가 아니라 제어 흐름의 경계를 설명합니다. 메모리 idempotency는 프로세스 간 공유나 재시작 후 영속성을 제공하지 않습니다. 비동기 handler와 부분 업무 결과에는 애플리케이션 수준의 안전장치가 필요합니다.'),
  sources: ['AwsModulithEventExternalizationTransport','AwsModulithEventCodec','AwsModulithSqsEventConsumer','AwsModulithSqsEventListener','AwsModulithIdempotency','AwsModulithEventsProperties'].map((name) => ({ name, url: source(name) })),
};

// 화면과 회귀 테스트가 동일한 처리 경로를 사용한다.
export function buildStory(path, scenario) {
  if (!modulith.paths.some(({ id }) => id === path)) throw new RangeError('Unknown path');
  if (!modulith.scenarios.some(({ id }) => id === scenario)) throw new RangeError('Unknown scenario');
  if (path === 'direct' && scenario === 'publish') throw new RangeError('DIRECT starts at input');
  let ids = ['source', 'decode', 'claim', 'dispatch', 'complete', 'ack'];
  if (path !== 'direct') ids.unshift('encode', 'publish');
  if (scenario === 'duplicate') ids = ids.filter((id) => !['dispatch', 'complete'].includes(id));
  const failure = modulith.failures[scenario];
  if (failure) ids = ids.slice(0, ids.indexOf(failure.at) + 1);
  return { ids, failure: failure ?? null, duplicate: scenario === 'duplicate', acknowledged: !failure, claimCompleted: ['normal', 'duplicate', 'ack'].includes(scenario) };
}
