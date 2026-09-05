const text = (en, ko) => Object.freeze({ en, ko });

const sourceRevision = '30a28f80dbf995ca08bf86e64d3b60a93f1e2094';
const sourceUrl = (file, area = 'main') =>
  `https://github.com/bluetape4k/bluetape4k-aws/blob/${sourceRevision}/aws-spring-boot/src/${area}/kotlin/io/bluetape4k/aws/spring/sqs/${file}.kt`;

const participant = (id, label, role, tone) => Object.freeze({ id, label: text(...label), role: text(...role), tone });
const step = (id, phase, from, to, tone, event, action, guard, next, signal) => Object.freeze({
  id, phase: text(...phase), from, to, tone, event: text(...event), action: text(...action),
  guard: text(...guard), next: text(...next), signal: text(...signal),
});
const scenario = (id, label, summary, outcome, path, terminal, failure = null) => Object.freeze({
  id, label: text(...label), summary: text(...summary), outcome: text(...outcome),
  path: Object.freeze(path), terminal,
  failure: failure ? Object.freeze({
    at: failure.at,
    code: failure.code,
    text: text(...failure.text),
    signal: text(...failure.signal),
  }) : null,
});

export const awsSqsExtendedCompanion = Object.freeze({
  issue: '423',
  repository: 'bluetape4k-aws',
  slug: 'aws-sqs-extended-client',
  version: '1.0.0',
  sourceRevision,
  manual: Object.freeze({
    en: '/manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging/',
    ko: '/ko/manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging/',
  }),
  title: text(
    'Follow the payload until acknowledgement and cleanup finish.',
    'Payload가 acknowledgement와 cleanup을 마칠 때까지 추적합니다.',
  ),
  summary: text(
    'Compare inline and S3-offloaded payloads through a module-local signed pointer, bounded restore, handler completion, SQS delete, marker creation, payload cleanup, and an opaque retry handle.',
    'inline payload와 S3 offload payload가 module 전용 signed pointer, bounded restore, handler 완료, SQS delete, marker 생성, payload cleanup, 불투명한 retry handle을 통과하는 순서를 비교합니다.',
  ),
  invariant: text(
    'SQS acknowledgement succeeds before any payload cleanup starts.',
    'Payload cleanup은 SQS acknowledgement가 성공한 뒤에만 시작합니다.',
  ),
  participants: Object.freeze([
    participant('producer', ['Producer', 'Producer'], ['size gate + idempotency', 'size gate + idempotency'], 'http'),
    participant('s3', ['Amazon S3', 'Amazon S3'], ['payload + cleanup marker', 'payload + cleanup marker'], 'manager'),
    participant('sqs', ['Amazon SQS', 'Amazon SQS'], ['inline body or signed pointer', 'inline body 또는 signed pointer'], 'policy'),
    participant('consumer', ['Extended consumer', 'Extended consumer'], ['bounded restore + acknowledgement', 'bounded restore + acknowledgement'], 'parser'),
    participant('handler', ['Application handler', 'Application handler'], ['business completion', '업무 처리 완료'], 'application'),
  ]),
  steps: Object.freeze([
    step('size-gate', ['1 · Choose inline or offload', '1 · inline 또는 offload를 선택합니다'], 'producer', 'producer', 'metadata',
      ['UTF-8 payload bytes ≤ offloadThresholdBytes?', 'UTF-8 payload byte ≤ offloadThresholdBytes?'],
      ['Validate queue policy, strict UTF-8 size, max payload, and the required idempotency key before offloading.', 'offload 전에 queue policy, strict UTF-8 크기, 최대 payload, 필수 idempotency key를 검증합니다.'],
      ['A small payload stays byte-for-byte in the existing SQS body. Offload is opt-in and queue-scoped.', '작은 payload는 기존 SQS body에 그대로 남습니다. Offload는 opt-in이며 queue별로 적용합니다.'],
      ['Inline sends the body directly; offload builds a deterministic object key and signed pointer.', 'inline은 body를 바로 전송하고 offload는 deterministic object key와 signed pointer를 만듭니다.'],
      ['branch=inline|offload · S3=0 before decision', 'branch=inline|offload · 결정 전 S3=0']),
    step('s3-upload', ['2 · Store the large payload', '2 · 큰 payload를 저장합니다'], 'producer', 's3', 'certificate',
      ['Put payload before queue send', 'Queue 전송 전에 payload 저장'],
      ['Upload the payload under the configured bucket/prefix, optionally through the exact encryption identity and context.', '설정한 bucket/prefix에 payload를 저장하며 선택적으로 정확한 encryption identity와 context를 사용합니다.'],
      ['Upload failure stops before SQS send. Cancellation is reported without hiding potential orphan state.', 'Upload 실패는 SQS 전송 전에 끝납니다. Cancellation은 잠재적인 orphan 상태를 숨기지 않고 보고합니다.'],
      ['Send only the authenticated module-local pointer to SQS.', '인증된 module 전용 pointer만 SQS로 전송합니다.'],
      ['S3 object=present · SQS message=0', 'S3 object=present · SQS message=0']),
    step('send-envelope', ['3 · Send body or signed pointer', '3 · body 또는 signed pointer를 전송합니다'], 'producer', 'sqs', 'policy',
      ['SqsOperations.send(body)', 'SqsOperations.send(body)'],
      ['Inline sends the original body. Offload sends bt4k-sqs-extended/v1 with bucket, key, policy fingerprint, content metadata, and HMAC signature.', 'inline은 원본 body를 전송합니다. Offload는 bucket, key, policy fingerprint, content metadata와 HMAC signature가 포함된 bt4k-sqs-extended/v1을 전송합니다.'],
      ['An offloaded SQS send failure leaves an S3 orphan that requires caller-owned cleanup.', 'Offload 뒤 SQS send가 실패하면 caller가 정리해야 하는 S3 orphan이 남습니다.'],
      ['Receive one message and distinguish opaque inline data from a policy-bound pointer.', '메시지 하나를 받아 opaque inline data와 policy-bound pointer를 구분합니다.'],
      ['queue message=visible · wire format preserved', 'queue message=visible · wire format preserved']),
    step('restore', ['4 · Validate and restore', '4 · 검증하고 복원합니다'], 'sqs', 'consumer', 'signature',
      ['receive → pointer verify → bounded S3 read', 'receive → pointer 검증 → bounded S3 read'],
      ['A policy-less body remains opaque inline data. A recognized pointer must pass version, signature, queue/policy fingerprint, content, encryption, and bounded-size checks.', 'policy가 없는 body는 opaque inline data로 유지합니다. 인식한 pointer는 version, signature, queue/policy fingerprint, content, encryption, bounded-size 검사를 통과해야 합니다.'],
      ['Missing object, absent bounded-read capability, oversize data, or metadata mismatch fails before the handler.', 'object 없음, bounded-read capability 부재, 크기 초과, metadata 불일치는 handler 전에 실패합니다.'],
      ['Release an identity-bound SqsExtendedReceivedMessage to the application.', 'identity-bound SqsExtendedReceivedMessage를 애플리케이션에 전달합니다.'],
      ['restored|inline · handler=0 until success', 'restored|inline · 성공 전 handler=0']),
    step('handler', ['5 · Run the application handler', '5 · Application handler를 실행합니다'], 'consumer', 'handler', 'success',
      ['Materialized payload', '복원된 payload'],
      ['The handler receives the original payload and owns business authorization, idempotency, and side effects.', 'Handler는 원본 payload를 받고 업무 인가, idempotency, side effect를 소유합니다.'],
      ['A handler failure leaves the SQS receipt and S3 payload available for the queue retry policy.', 'Handler가 실패하면 queue retry 정책을 위해 SQS receipt와 S3 payload를 보존합니다.'],
      ['Return success to the extended consumer before acknowledgement.', 'acknowledgement 전에 extended consumer로 성공을 반환합니다.'],
      ['handler entered · ack=0', 'handler entered · ack=0']),
    step('handler-complete', ['6 · Complete business work', '6 · 업무 처리를 완료합니다'], 'handler', 'consumer', 'return',
      ['Handler success', 'Handler success'],
      ['Only a completed handler may advance to acknowledgement; the visual does not imply automatic business success.', '완료된 handler만 acknowledgement로 이동합니다. 시각자료는 자동 업무 성공을 의미하지 않습니다.'],
      ['Acknowledge the same identity-bound received instance; raw receipt handles and cleanup handles are not public payload data.', '같은 identity-bound received instance를 acknowledge합니다. raw receipt handle과 cleanup handle은 공개 payload data가 아닙니다.'],
      ['Delete the SQS receipt first.', 'SQS receipt를 먼저 삭제합니다.'],
      ['handler=complete · SQS delete pending', 'handler=complete · SQS delete pending']),
    step('sqs-ack', ['7 · Delete the SQS receipt', '7 · SQS receipt를 삭제합니다'], 'consumer', 'sqs', 'policy',
      ['sqsOperations.delete(queueUrl, receiptHandle)', 'sqsOperations.delete(queueUrl, receiptHandle)'],
      ['Acknowledgement validates message identity and policy fingerprint, then deletes the SQS receipt before touching cleanup metadata or payload.', 'Acknowledgement는 message identity와 policy fingerprint를 검증한 뒤 cleanup metadata나 payload를 건드리기 전에 SQS receipt를 삭제합니다.'],
      ['If SQS delete fails, no marker or payload delete follows. The message remains retryable.', 'SQS delete가 실패하면 marker와 payload를 삭제하지 않습니다. 메시지는 다시 처리할 수 있습니다.'],
      ['For delete-on-ack=true create or verify the cleanup marker; otherwise stop at caller-owned lifecycle.', 'delete-on-ack=true이면 cleanup marker를 생성·검증하고, 아니면 caller-owned lifecycle에서 멈춥니다.'],
      ['sqsDeleted=true required before cleanup', 'cleanup 전에 sqsDeleted=true 필요']),
    step('marker', ['8 · Create or verify the marker', '8 · Marker를 생성하거나 검증합니다'], 'consumer', 's3', 'metadata',
      ['put-if-absent marker + constant-time metadata check', 'put-if-absent marker + constant-time metadata 검사'],
      ['The marker binds queue digest, policy fingerprint, pointer digest, and marker version before payload deletion.', 'Marker는 payload 삭제 전에 queue digest, policy fingerprint, pointer digest, marker version을 묶습니다.'],
      ['Foreign or unverifiable marker metadata blocks payload deletion. Marker creation failure returns cleanup-required state.', '다른 marker이거나 metadata를 검증할 수 없으면 payload를 삭제하지 않습니다. Marker 생성 실패는 cleanup-required 상태를 반환합니다.'],
      ['Delete the exact payload object only after marker verification.', 'Marker 검증 뒤 정확한 payload object만 삭제합니다.'],
      ['marker=verified · receipt already deleted', 'marker=verified · receipt already deleted']),
    step('payload-delete', ['9 · Delete or retry payload cleanup', '9 · Payload cleanup을 완료하거나 재시도합니다'], 'consumer', 's3', 'success',
      ['delete(payloadKey)', 'delete(payloadKey)'],
      ['Successful deletion completes delete-on-ack. A failure returns SqsExtendedCleanupHandle(available=true) for explicit retry through cleanup(handle).', '삭제가 성공하면 delete-on-ack이 끝납니다. 실패하면 cleanup(handle)로 명시적으로 재시도할 SqsExtendedCleanupHandle(available=true)을 반환합니다.'],
      ['The handle is opaque, marker-verified, policy-bound, and never a license to delete an arbitrary S3 key.', 'Handle은 불투명하고 marker 검증과 policy에 묶이며 임의의 S3 key를 삭제할 권한이 아닙니다.'],
      ['Finish or schedule bounded caller-owned cleanup retry.', '완료하거나 제한된 caller-owned cleanup retry를 예약합니다.'],
      ['payloadDeleted=true | cleanupRequired=true', 'payloadDeleted=true | cleanupRequired=true']),
  ]),
  scenarios: Object.freeze([
    scenario('inline', ['Small payload stays inline', '작은 payload는 inline 유지'],
      ['The payload stays in the SQS body and never creates an S3 object or pointer.', 'Payload가 SQS body에 남아 S3 object와 pointer를 만들지 않습니다.'],
      ['ACKNOWLEDGED: handler completion is followed by SQS delete; S3 cleanup is not applicable.', 'ACKNOWLEDGED: handler 완료 뒤 SQS delete를 수행하며 S3 cleanup은 적용되지 않습니다.'],
      ['size-gate', 'send-envelope', 'restore', 'handler', 'handler-complete', 'sqs-ack'], 'sqs-ack'),
    scenario('offload-success', ['Large payload completes cleanup', '큰 payload가 cleanup까지 완료'],
      ['The producer stores the payload, sends a signed pointer, and the consumer restores it before ordered acknowledgement and cleanup.', 'Producer가 payload를 저장하고 signed pointer를 전송하며 consumer가 복원한 뒤 순서대로 acknowledgement와 cleanup을 수행합니다.'],
      ['CLEAN: SQS receipt, marker verification, and payload deletion finish in order.', 'CLEAN: SQS receipt, marker 검증, payload 삭제가 순서대로 끝납니다.'],
      ['size-gate', 's3-upload', 'send-envelope', 'restore', 'handler', 'handler-complete', 'sqs-ack', 'marker', 'payload-delete'], 'payload-delete'),
    scenario('s3-upload-failure', ['S3 upload fails', 'S3 upload 실패'],
      ['The large payload cannot be stored.', '큰 payload를 저장할 수 없습니다.'],
      ['FAILED: no SQS message is sent and no handler path begins.', 'FAILED: SQS message를 전송하지 않고 handler path를 시작하지 않습니다.'],
      ['size-gate', 's3-upload'], 's3-upload', {
        at: 's3-upload',
        code: 'S3_UPLOAD_FAILED',
        text: ['Upload failed before queue publication.', 'Queue 게시 전에 upload가 실패했습니다.'],
        signal: ['S3 object=absent · SQS message=0', 'S3 object=absent · SQS message=0'],
      }),
    scenario('sqs-send-failure', ['Pointer send fails', 'Pointer send 실패'],
      ['The S3 object exists, but SQS rejects the pointer send.', 'S3 object는 존재하지만 SQS pointer 전송이 실패합니다.'],
      ['FAILED: orphanCleanupRequired=true; caller policy must reconcile the object.', 'FAILED: orphanCleanupRequired=true이며 caller 정책이 object를 정리해야 합니다.'],
      ['size-gate', 's3-upload', 'send-envelope'], 'send-envelope', {
        at: 'send-envelope',
        code: 'SQS_SEND_FAILED_ORPHAN',
        text: ['The stored object is an explicit orphan candidate.', '저장된 object는 명시적인 orphan 후보입니다.'],
        signal: ['S3 orphan candidate=present · SQS message=0', 'S3 orphan candidate=present · SQS message=0'],
      }),
    scenario('missing-object', ['Pointer object is missing', 'Pointer object 없음'],
      ['A valid signed pointer resolves to an object that S3 cannot return.', '유효한 signed pointer가 S3에서 찾을 수 없는 object를 가리킵니다.'],
      ['FAILED: restore stops before handler and acknowledgement.', 'FAILED: restore가 handler와 acknowledgement 전에 멈춥니다.'],
      ['size-gate', 's3-upload', 'send-envelope', 'restore'], 'restore', {
        at: 'restore',
        code: 'S3_OBJECT_MISSING',
        text: ['Bounded restore failed before payload admission.', 'Payload 진입 전에 bounded restore가 실패했습니다.'],
        signal: ['S3 object=missing · handler=0 · ack=0', 'S3 object=missing · handler=0 · ack=0'],
      }),
    scenario('restore-failure', ['Pointer or bounded restore fails', 'Pointer 또는 bounded restore 실패'],
      ['Signature, policy, encryption, content, or maximum-size validation fails.', 'Signature, policy, encryption, content, 최대 크기 검증이 실패합니다.'],
      ['FAILED: typed restore failure reaches no handler and deletes no receipt.', 'FAILED: typed restore failure는 handler에 도달하지 않고 receipt도 삭제하지 않습니다.'],
      ['size-gate', 's3-upload', 'send-envelope', 'restore'], 'restore', {
        at: 'restore',
        code: 'RESTORE_VALIDATION_FAILED',
        text: ['The pointer or restored payload did not satisfy the queue policy.', 'Pointer 또는 복원된 payload가 queue 정책을 충족하지 못했습니다.'],
        signal: ['restore=failed · handler=0 · ack=0', 'restore=failed · handler=0 · ack=0'],
      }),
    scenario('ack-failure', ['SQS acknowledgement fails', 'SQS acknowledgement 실패'],
      ['The handler completes, but SQS receipt deletion fails.', 'Handler는 완료됐지만 SQS receipt 삭제가 실패합니다.'],
      ['FAILED: marker and payload deletion remain untouched for redelivery.', 'FAILED: redelivery를 위해 marker와 payload 삭제를 수행하지 않습니다.'],
      ['size-gate', 's3-upload', 'send-envelope', 'restore', 'handler', 'handler-complete', 'sqs-ack'], 'sqs-ack', {
        at: 'sqs-ack',
        code: 'SQS_ACK_FAILED',
        text: ['Payload cleanup is forbidden because sqsDeleted=false.', 'sqsDeleted=false이므로 payload cleanup을 수행할 수 없습니다.'],
        signal: ['sqsDeleted=false · marker=0 · payload delete=0', 'sqsDeleted=false · marker=0 · payload delete=0'],
      }),
    scenario('cleanup-retry', ['Payload delete needs retry', 'Payload 삭제 재시도 필요'],
      ['SQS delete and marker verification succeed, but payload deletion fails.', 'SQS delete와 marker 검증은 성공했지만 payload 삭제가 실패합니다.'],
      ['CLEANUP REQUIRED: return an opaque handle and retry explicitly.', 'CLEANUP REQUIRED: 불투명한 handle을 반환하고 명시적으로 재시도합니다.'],
      ['size-gate', 's3-upload', 'send-envelope', 'restore', 'handler', 'handler-complete', 'sqs-ack', 'marker', 'payload-delete'], 'payload-delete', {
        at: 'payload-delete',
        code: 'S3_DELETE_RETRY',
        text: ['cleanupRequired=true with an opaque policy-bound handle.', '불투명한 policy-bound handle과 cleanupRequired=true를 반환합니다.'],
        signal: ['sqsDeleted=true · marker=verified · payloadDeleted=false · cleanupRequired=true', 'sqsDeleted=true · marker=verified · payloadDeleted=false · cleanupRequired=true'],
      }),
    scenario('caller-owned-lifecycle', ['delete-on-ack is disabled', 'delete-on-ack 비활성화'],
      ['The default policy acknowledges SQS but retains the S3 payload.', '기본 정책은 SQS를 acknowledge하지만 S3 payload를 보존합니다.'],
      ['ACKNOWLEDGED: retention, lifecycle, and orphan cleanup remain caller-owned.', 'ACKNOWLEDGED: retention, lifecycle, orphan cleanup은 caller가 소유합니다.'],
      ['size-gate', 's3-upload', 'send-envelope', 'restore', 'handler', 'handler-complete', 'sqs-ack'], 'sqs-ack'),
  ]),
  ownership: Object.freeze({
    adapter: text(
      'Inline/offload decision · deterministic key · signed pointer · bounded restore · identity-bound acknowledgement · opaque retry handle',
      'inline/offload 결정 · deterministic key · signed pointer · bounded restore · identity-bound acknowledgement · 불투명한 retry handle',
    ),
    caller: text(
      'Bucket and IAM · encryption identity/context · retention/lifecycle · rollout/rollback · handler idempotency · retry scheduling · orphan cleanup',
      'bucket과 IAM · encryption identity/context · retention/lifecycle · rollout/rollback · handler idempotency · retry scheduling · orphan cleanup',
    ),
    boundary: text(
      'No automatic bucket, IAM, lifecycle, or AWS Java Extended Client interoperability',
      'bucket, IAM, lifecycle을 자동 구성하지 않으며 AWS Java Extended Client와 호환되지 않음',
    ),
  }),
  caveats: text(
    'This offline explorer models bluetape4k-aws ordering. The pointer is local to this module and is not interoperable with the AWS Java Extended Client or a legacy @SqsListener. The application must provision S3, IAM, encryption, retention, lifecycle, rollout, rollback, retries, and orphan cleanup.',
    '이 offline 탐색기는 bluetape4k-aws의 순서를 모델링합니다. Pointer는 이 module 전용이며 AWS Java Extended Client 또는 legacy @SqsListener와 호환되지 않습니다. 애플리케이션이 S3, IAM, encryption, retention, lifecycle, rollout, rollback, retry, orphan cleanup을 구성해야 합니다.',
  ),
  sources: Object.freeze([
    Object.freeze({ label: 'SqsExtendedClient.kt', name: 'SqsExtendedClient.kt', url: sourceUrl('SqsExtendedClient') }),
    Object.freeze({ label: 'SqsExtendedOperations.kt', name: 'SqsExtendedOperations.kt', url: sourceUrl('SqsExtendedOperations') }),
    Object.freeze({ label: 'SqsExtendedPointer.kt', name: 'SqsExtendedPointer.kt', url: sourceUrl('SqsExtendedPointer') }),
    Object.freeze({ label: 'SqsExtendedClientAcknowledgementTest.kt', name: 'SqsExtendedClientAcknowledgementTest.kt', url: sourceUrl('SqsExtendedClientAcknowledgementTest', 'test') }),
    Object.freeze({ label: 'SQS Extended Client issue #455', name: 'SQS Extended Client issue #455', url: 'https://github.com/bluetape4k/bluetape4k-aws/issues/455' }),
  ]),
});

const byId = new Map(awsSqsExtendedCompanion.scenarios.map((item) => [item.id, item]));

export function buildSqsExtendedStory(requestedScenario) {
  const selected = byId.get(requestedScenario);
  if (!selected) throw new RangeError(`Unknown SQS Extended Client scenario: ${requestedScenario}`);
  const ids = selected.path;
  return Object.freeze({
    scenario: selected.id,
    ids,
    steps: Object.freeze(ids.map((id) => awsSqsExtendedCompanion.steps.find((item) => item.id === id))),
    failure: selected.failure,
    focusAt: ids.length - 1,
    terminal: selected.terminal,
    s3Touched: ids.includes('s3-upload'),
    handlerReached: ids.includes('handler'),
    sqsDeleted: ids.includes('sqs-ack') && selected.failure?.at !== 'sqs-ack',
    cleanupRequired: selected.id === 'cleanup-retry',
    failClosed: Boolean(selected.failure),
  });
}

export const sqsExtended = awsSqsExtendedCompanion;
