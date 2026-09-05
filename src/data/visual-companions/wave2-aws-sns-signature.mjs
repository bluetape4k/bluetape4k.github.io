const text = (en, ko) => Object.freeze({ en, ko });

const sourceRevision = 'f73f52e5497f3396d9ccc02c8acb1e3444986bc1';
const sourcePath = 'aws-spring-boot/src/main/kotlin/io/bluetape4k/aws/spring/sns';
const sourceUrl = (file) =>
  `https://github.com/bluetape4k/bluetape4k-aws/blob/${sourceRevision}/${sourcePath}/${file}.kt`;

const participant = (id, label, role, tone) => Object.freeze({
  id,
  label: text(...label),
  role: text(...role),
  tone,
});

const step = (id, phase, from, to, tone, event, action, guard, next, signal) => Object.freeze({
  id,
  phase: text(...phase),
  from,
  to,
  tone,
  event: text(...event),
  action: text(...action),
  guard: text(...guard),
  next: text(...next),
  signal: text(...signal),
});

const scenario = (id, label, summary, outcome, focusAt, failAt, terminal, failure = null) => Object.freeze({
  id,
  label: text(...label),
  summary: text(...summary),
  outcome: text(...outcome),
  focusAt,
  failAt,
  terminal,
  failure: failure
    ? Object.freeze({
        at: failure.at,
        code: failure.code,
        text: text(...failure.text),
      })
    : null,
});

export const awsSnsSignatureCompanion = Object.freeze({
  issue: '422',
  repository: 'bluetape4k-aws',
  slug: 'aws-sns-signature-verification',
  version: '1.0.0',
  sourceRevision,
  manual: Object.freeze({
    en: '/manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging/',
    ko: '/ko/manual/bluetape4k-aws/1.0/modules/bluetape4k-aws-spring-boot/storage-and-messaging/',
  }),
  title: text(
    'Trust the notification only after every gate passes.',
    '모든 gate를 통과한 notification만 신뢰합니다.',
  ),
  summary: text(
    'Play an SNS HTTP notification through parsing, exact TopicArn policy, certificate retrieval and chain validation, SignatureVersion 1/2 verification, and the post-verification handler boundary.',
    'SNS HTTP notification이 parsing, 정확한 TopicArn 정책, 인증서 조회와 chain 검증, SignatureVersion 1/2 검증을 거쳐 검증 이후 handler 경계에 도달하는 과정을 재생합니다.',
  ),
  invariant: text(
    'A payload that parses is not a trusted payload.',
    '파싱되는 payload가 곧 신뢰할 수 있는 payload는 아닙니다.',
  ),
  participants: Object.freeze([
    participant(
      'http',
      ['SNS HTTP endpoint', 'SNS HTTP endpoint'],
      ['untrusted raw JSON', '신뢰하지 않는 raw JSON'],
      'http',
    ),
    participant(
      'parser',
      ['SnsHttpMessageParser', 'SnsHttpMessageParser'],
      ['shape and URL checks', '구조와 URL 검사'],
      'parser',
    ),
    participant(
      'policy',
      ['TopicArn policy', 'TopicArn policy'],
      ['exact allowlist', '정확한 allowlist'],
      'policy',
    ),
    participant(
      'manager',
      ['SnsMessageManager', 'SnsMessageManager'],
      ['certificate and signature', '인증서와 signature'],
      'manager',
    ),
    participant(
      'application',
      ['Application boundary', 'Application boundary'],
      ['verified handler or confirmation', '검증된 handler 또는 confirmation'],
      'application',
    ),
  ]),
  security: Object.freeze({
    allowlistBeforeNetwork: true,
    acceptedSignatureVersions: Object.freeze(['1', '2']),
    failureMode: 'fail-closed',
    network: 'offline model; no browser fetch',
  }),
  steps: Object.freeze([
    step(
      'parse',
      ['1 · Parse the envelope', '1 · Envelope를 파싱합니다'],
      'http',
      'parser',
      'metadata',
      ['raw SNS HTTP JSON + optional x-amz-sns-message-type', 'raw SNS HTTP JSON + 선택적인 x-amz-sns-message-type'],
      ['SnsHttpMessageParser.parse validates size, field types, message Type, TopicArn shape, and SigningCertURL shape.', 'SnsHttpMessageParser.parse가 size, field type, message Type, TopicArn 형태와 SigningCertURL 형태를 검사합니다.'],
      ['Parsing establishes structure only. It does not authenticate the publisher, certificate, or signature.', 'Parsing은 구조만 확인합니다. publisher, certificate, signature를 인증하지 않습니다.'],
      ['Compare the parsed TopicArn with the configured exact allowlist before any certificate access.', '인증서에 접근하기 전에 파싱한 TopicArn을 설정된 정확한 allowlist와 비교합니다.'],
      ['parsed · network=0 · handler=0', 'parsed · network=0 · handler=0'],
    ),
    step(
      'topic-allowlist',
      ['2 · Enforce exact TopicArn', '2 · 정확한 TopicArn을 적용합니다'],
      'parser',
      'policy',
      'policy',
      ['parsed.topicArn === expectedTopicArn', 'parsed.topicArn === expectedTopicArn'],
      ['The verifier rejects a blank or mismatched expectedTopicArn before calling SnsMessageManager.', 'verifier는 blank 또는 일치하지 않는 expectedTopicArn을 SnsMessageManager 호출 전에 거부합니다.'],
      ['An exact, non-empty allowlist is the application trust policy; payload shape alone never grants trust.', '비어 있지 않은 exact allowlist가 애플리케이션 trust 정책이며 payload 형태만으로 신뢰를 부여하지 않습니다.'],
      ['Validate the HTTPS SNS certificate URL and its region/partition host.', 'HTTPS SNS certificate URL과 region/partition host를 검사합니다.'],
      ['TopicArn exact · certificate fetch=0', 'TopicArn exact · certificate fetch=0'],
    ),
    step(
      'certificate-url',
      ['3 · Check certificate URL and host', '3 · Certificate URL과 host를 검사합니다'],
      'policy',
      'manager',
      'policy',
      ['SigningCertURL = https://sns.<region>.amazonaws.com/...pem', 'SigningCertURL = https://sns.<region>.amazonaws.com/...pem'],
      ['The parser requires HTTPS, no userinfo/query/fragment/port, a .pem path, and an SNS host matching TopicArn region and partition.', 'parser는 HTTPS, userinfo/query/fragment/port 없음, .pem path, TopicArn region과 partition에 맞는 SNS host를 요구합니다.'],
      ['Reject a non-SNS host before opening a certificate request. The certificate URL is input, not a trust root.', '인증서 요청 전에 SNS가 아닌 host를 거부합니다. Certificate URL은 입력이며 trust root가 아닙니다.'],
      ['Use the SDK manager certificate boundary for bounded retrieval, cache lookup, and chain validation.', 'SDK manager certificate 경계에서 제한된 조회, cache 조회와 chain 검증을 수행합니다.'],
      ['SNS host + region/partition · network=0 until accepted', 'SNS host + region/partition · 허용 전 network=0'],
    ),
    step(
      'certificate-fetch',
      ['4 · Retrieve, cache, and validate the chain', '4 · 조회·cache·chain을 검증합니다'],
      'manager',
      'manager',
      'certificate',
      ['SnsMessageManager.parseMessage → certificate retrieval/cache → X.509 chain validation', 'SnsMessageManager.parseMessage → certificate 조회/cache → X.509 chain 검증'],
      ['The AWS SDK manager owns certificate retrieval, cache behavior, and chain validation after the policy and URL gates pass.', '정책과 URL gate를 통과한 뒤 인증서 조회, cache 동작과 chain 검증은 AWS SDK manager가 담당합니다.'],
      ['A timeout, unreachable certificate, expired or untrusted chain fails closed; the parsed message is not released.', 'timeout, 인증서 접근 실패, 만료 또는 신뢰할 수 없는 chain은 fail closed이며 parsed message를 release하지 않습니다.'],
      ['Build the canonical string for SignatureVersion 1 or 2 and verify it with the same manager.', 'SignatureVersion 1 또는 2의 canonical string을 구성해 같은 manager로 검증합니다.'],
      ['certificate cache/chain · handler=0', 'certificate cache/chain · handler=0'],
    ),
    step(
      'signature',
      ['5 · Verify SignatureVersion 1 or 2', '5 · SignatureVersion 1 또는 2를 검증합니다'],
      'manager',
      'manager',
      'signature',
      ['SignatureVersion 1 / SignatureVersion 2 · canonical SNS fields', 'SignatureVersion 1 / SignatureVersion 2 · SNS canonical field'],
      ['SnsMessageManager verifies the supported version and canonical fields, then throws on an unsupported version or signature mismatch.', 'SnsMessageManager가 지원하는 version과 canonical field를 검증하고 unsupported version 또는 signature mismatch에서 예외를 던집니다.'],
      ['Only a cryptographically verified result can leave SnsHttpMessageVerifier. Do not implement a parser-only fallback.', '암호학적으로 검증된 결과만 SnsHttpMessageVerifier를 통과합니다. parser-only fallback을 구현하지 않습니다.'],
      ['Return the verified parsed message to the application boundary; choose notification or confirmation by message Type.', '검증된 parsed message를 애플리케이션 경계로 전달하고 message Type에 따라 notification 또는 confirmation을 선택합니다.'],
      ['SignatureVersion ∈ {1,2} · signature=verified', 'SignatureVersion ∈ {1,2} · signature=verified'],
    ),
    step(
      'verified',
      ['6 · Release only verified data', '6 · 검증된 데이터만 release합니다'],
      'manager',
      'application',
      'return',
      ['SnsHttpMessageVerifier.verify(...) returns SnsHttpMessage', 'SnsHttpMessageVerifier.verify(...) returns SnsHttpMessage'],
      ['The verifier returns the parser result only after the SDK manager accepts the original JSON.', 'verifier는 SDK manager가 원문 JSON을 수락한 뒤에만 parser 결과를 반환합니다.'],
      ['Handler and confirmation operations are downstream of this return. Every earlier failure ends the story here.', 'Handler와 confirmation operation은 이 반환 이후에만 실행합니다. 앞 단계의 모든 실패는 여기 전에 종료됩니다.'],
      ['Route a verified Notification to its handler or a verified Confirmation to explicit subscription status logic.', '검증된 Notification은 handler로, 검증된 Confirmation은 명시적인 subscription status logic으로 보냅니다.'],
      ['verified message · trust boundary crossed', 'verified message · trust boundary crossed'],
    ),
    step(
      'notification-handler',
      ['7 · Dispatch Notification handler', '7 · Notification handler로 dispatch합니다'],
      'application',
      'application',
      'success',
      ['NotificationMessage / NotificationSubject / NotificationRawMessage', 'NotificationMessage / NotificationSubject / NotificationRawMessage'],
      ['A notification handler may read Message, Subject, attributes, or the verified raw envelope after verification succeeds.', 'Notification handler는 검증 성공 뒤 Message, Subject, attribute 또는 검증된 raw envelope를 읽을 수 있습니다.'],
      ['The handler never receives a parser-only result. Business authorization and idempotency remain caller-owned.', 'Handler는 parser-only 결과를 받지 않습니다. 업무 인가와 idempotency는 caller가 소유합니다.'],
      ['For a confirmation message, use the separate confirmation path instead of notification payload parameters.', 'Confirmation message는 notification payload parameter가 아닌 별도의 confirmation path를 사용합니다.'],
      ['handler reached · verification=pass', 'handler reached · verification=pass'],
    ),
    step(
      'subscription-confirmation',
      ['8 · Handle SubscriptionConfirmation', '8 · SubscriptionConfirmation을 처리합니다'],
      'application',
      'application',
      'success',
      ['NotificationStatus → confirmSubscription() (explicit caller action)', 'NotificationStatus → confirmSubscription() (caller의 명시적 동작)'],
      ['A verified SubscriptionConfirmation may expose NotificationStatus; the caller explicitly chooses confirmSubscription through SnsOperations.', '검증된 SubscriptionConfirmation은 NotificationStatus를 제공할 수 있으며 caller가 SnsOperations를 통해 confirmSubscription을 명시적으로 선택합니다.'],
      ['Verification success precedes confirmation. The explorer does not execute AWS calls and does not imply automatic confirmation.', '검증 성공이 confirmation보다 먼저입니다. 탐색기는 AWS call을 실행하지 않으며 자동 confirmation을 의미하지 않습니다.'],
      ['End with an application-owned confirmation decision and preserve the verified TopicArn boundary.', '애플리케이션 소유 confirmation 결정으로 종료하고 검증된 TopicArn 경계를 보존합니다.'],
      ['confirmation path · verification=pass · network=offline', 'confirmation path · verification=pass · network=offline'],
    ),
  ]),
  scenarios: Object.freeze([
    scenario(
      'valid-v1',
      ['Valid SignatureVersion 1 notification', '정상 SignatureVersion 1 notification'],
      ['A structurally valid Notification passes the exact topic, certificate, chain, and SignatureVersion 1 gates.', '구조가 올바른 Notification이 정확한 topic, certificate, chain과 SignatureVersion 1 gate를 통과합니다.'],
      ['VERIFIED: the notification handler is reachable after every trust gate passes.', 'VERIFIED: 모든 trust gate를 통과한 뒤 notification handler에 도달합니다.'],
      6,
      null,
      'notification-handler',
    ),
    scenario(
      'valid-v2',
      ['Valid SignatureVersion 2 confirmation', '정상 SignatureVersion 2 confirmation'],
      ['A SubscriptionConfirmation passes the same trust gates with SignatureVersion 2 before reaching explicit confirmation logic.', 'SubscriptionConfirmation이 SignatureVersion 2로 같은 trust gate를 통과한 뒤 명시적인 confirmation logic에 도달합니다.'],
      ['VERIFIED: confirmation status is available only after signature verification; confirmation remains caller-owned.', 'VERIFIED: confirmation status는 signature 검증 뒤에만 사용할 수 있으며 confirmation은 caller가 소유합니다.'],
      7,
      null,
      'subscription-confirmation',
    ),
    scenario(
      'malformed',
      ['Malformed notification', 'Malformed notification'],
      ['A missing, oversized, incorrectly typed, or inconsistent field stops at parser validation.', '필드가 없거나 크기가 초과되었거나 type이 잘못되었거나 서로 맞지 않으면 parser 검증에서 멈춥니다.'],
      ['REJECTED: no allowlist decision, certificate request, signature verification, or handler call follows.', 'REJECTED: allowlist 결정, certificate 요청, signature 검증과 handler 호출을 수행하지 않습니다.'],
      0,
      0,
      'parse',
      { at: 'parse', code: 'PARSER_REJECTED', text: ['Malformed input is rejected before trust policy or network access.', 'Malformed input은 trust 정책과 network access 전에 거부됩니다.'] },
    ),
    scenario(
      'unknown-topic',
      ['Unknown TopicArn', '알 수 없는 TopicArn'],
      ['The message parses, but its TopicArn is absent from the configured exact allowlist.', '메시지는 파싱되지만 TopicArn이 설정된 정확한 allowlist에 없습니다.'],
      ['REJECTED: the certificate URL is never opened and no downstream path is reachable.', 'REJECTED: certificate URL을 열지 않으며 downstream path에 도달하지 않습니다.'],
      1,
      1,
      'topic-allowlist',
      { at: 'topic-allowlist', code: 'TOPIC_NOT_ALLOWED', text: ['An unallowlisted TopicArn fails closed before certificate or network access.', 'allowlist에 없는 TopicArn은 certificate 또는 network access 전에 fail closed합니다.'] },
    ),
    scenario(
      'bad-cert-host',
      ['Invalid certificate host', '잘못된 certificate host'],
      ['The exact topic is allowed, but SigningCertURL is not a valid SNS HTTPS certificate endpoint.', '정확한 topic은 허용되지만 SigningCertURL이 올바른 SNS HTTPS certificate endpoint가 아닙니다.'],
      ['REJECTED: URL and region/partition checks stop the request before certificate retrieval.', 'REJECTED: URL과 region/partition 검사가 certificate retrieval 전에 요청을 멈춥니다.'],
      2,
      2,
      'certificate-url',
      { at: 'certificate-url', code: 'CERTIFICATE_URL_REJECTED', text: ['The certificate URL fails the HTTPS, SNS host, region, or partition contract.', 'Certificate URL이 HTTPS, SNS host, region 또는 partition 계약을 위반했습니다.'] },
    ),
    scenario(
      'cert-timeout',
      ['Certificate fetch or chain failure', 'Certificate fetch 또는 chain 실패'],
      ['The topic and certificate URL pass, but bounded certificate retrieval, cache lookup, or chain validation fails.', 'topic과 certificate URL은 통과했지만 제한된 certificate retrieval, cache 조회 또는 chain 검증이 실패합니다.'],
      ['REJECTED: a timeout, unreachable endpoint, expired certificate, or bad chain never releases a message.', 'REJECTED: timeout, 접근할 수 없는 endpoint, 만료 certificate 또는 잘못된 chain은 message를 release하지 않습니다.'],
      3,
      3,
      'certificate-fetch',
      { at: 'certificate-fetch', code: 'CERTIFICATE_VALIDATION_FAILED', text: ['Certificate retrieval or chain validation failed; no signature or handler path follows.', 'Certificate retrieval 또는 chain 검증이 실패해 signature와 handler path를 수행하지 않습니다.'] },
    ),
    scenario(
      'signature-mismatch',
      ['Signature mismatch', 'Signature mismatch'],
      ['The certificate chain is accepted, but the canonical SignatureVersion 1/2 value does not match the message.', 'Certificate chain은 통과했지만 canonical SignatureVersion 1/2 값이 message와 일치하지 않습니다.'],
      ['REJECTED: the SDK verification exception is propagated and no handler or confirmation operation runs.', 'REJECTED: SDK verification exception을 전파하며 handler와 confirmation operation을 실행하지 않습니다.'],
      4,
      4,
      'signature',
      { at: 'signature', code: 'SIGNATURE_MISMATCH', text: ['The canonical signature does not match, so the verifier fails closed.', 'Canonical signature가 일치하지 않아 verifier가 fail closed합니다.'] },
    ),
    scenario(
      'unsupported-version',
      ['Unsupported SignatureVersion', '지원하지 않는 SignatureVersion'],
      ['The message reaches signature verification with a version outside the supported SignatureVersion 1 or 2 contract.', '메시지가 SignatureVersion 1 또는 2 계약 밖의 version으로 signature 검증에 도달합니다.'],
      ['REJECTED: unsupported versions never become trusted handler or confirmation input.', 'REJECTED: 지원하지 않는 version은 신뢰된 handler 또는 confirmation input이 되지 않습니다.'],
      4,
      4,
      'signature',
      { at: 'signature', code: 'SIGNATURE_VERSION_UNSUPPORTED', text: ['Only SignatureVersion 1 and 2 are accepted; all other versions fail closed.', 'SignatureVersion 1과 2만 허용하며 나머지 version은 fail closed합니다.'] },
    ),
  ]),
  ownership: Object.freeze({
    adapter: text(
      'Parser ordering · exact TopicArn gate · SDK manager delegation · fail-closed handoff',
      'Parser 순서 · 정확한 TopicArn gate · SDK manager 위임 · fail-closed handoff',
    ),
    caller: text(
      'Allowlist policy · runtime dependency · handler authorization · idempotency · explicit confirmation decision',
      'allowlist 정책 · runtime dependency · handler 인가 · idempotency · 명시적인 confirmation 결정',
    ),
    boundary: text(
      'No certificate or handler access before trust',
      '신뢰 전에는 certificate와 handler에 접근하지 않음',
    ),
  }),
  caveats: text(
    'This offline explorer models the ordering and failure boundaries. The AWS SDK owns the concrete certificate cache and cryptographic implementation; the application owns its exact allowlist, runtime dependency, authorization, idempotency, and confirmation policy.',
    '이 offline 탐색기는 순서와 실패 경계를 모델링합니다. 구체적인 certificate cache와 암호 구현은 AWS SDK가 담당하고 exact allowlist, runtime dependency, 인가, idempotency와 confirmation 정책은 애플리케이션이 담당합니다.',
  ),
  sources: Object.freeze([
    Object.freeze({ label: 'SnsHttpMessageParser.kt', name: 'SnsHttpMessageParser.kt', url: sourceUrl('SnsHttpMessageParser') }),
    Object.freeze({ label: 'SnsHttpMessageVerifier.kt', name: 'SnsHttpMessageVerifier.kt', url: sourceUrl('SnsHttpMessageVerifier') }),
    Object.freeze({ label: 'SnsHttpMessageResolverSupport.kt', name: 'SnsHttpMessageResolverSupport.kt', url: sourceUrl('SnsHttpMessageResolverSupport') }),
    Object.freeze({ label: 'SnsHttpMessageVerifierTest.kt', name: 'SnsHttpMessageVerifierTest.kt', url: `${sourceUrl('SnsHttpMessageVerifier').replace('/main/', '/test/').replace('/SnsHttpMessageVerifier.kt', '/SnsHttpMessageVerifierTest.kt')}` }),
    Object.freeze({ label: 'SNS signature verification issue #457', name: 'SNS signature verification issue #457', url: 'https://github.com/bluetape4k/bluetape4k-aws/issues/457' }),
  ]),
});

const byId = new Map(awsSnsSignatureCompanion.scenarios.map((item) => [item.id, item]));
const aliases = new Map([
  ['certificate-failure', 'cert-timeout'],
  ['certificate-timeout', 'cert-timeout'],
  ['bad-certificate-host', 'bad-cert-host'],
]);

// Interactive and static visuals share this story projection so failure paths cannot drift.
export function buildSnsVerificationStory(requestedScenario) {
  const scenarioId = aliases.get(requestedScenario) ?? requestedScenario;
  const selected = byId.get(scenarioId);
  if (!selected) throw new RangeError(`Unknown SNS verification scenario: ${requestedScenario}`);

  const allIds = awsSnsSignatureCompanion.steps.map(({ id }) => id);
  const failure = selected.failure;
  const terminalIndex = selected.failAt ?? allIds.indexOf(selected.terminal);
  const verifiedIndex = allIds.indexOf('verified');
  const ids = failure
    ? allIds.slice(0, terminalIndex + 1)
    : [...allIds.slice(0, verifiedIndex + 1), selected.terminal];
  const networkStarted = ids.includes('certificate-fetch');
  const verified = !failure;
  const dispatched = verified && selected.terminal === 'notification-handler';
  const confirmationReached = verified && selected.terminal === 'subscription-confirmation';

  return Object.freeze({
    scenario: selected.id,
    ids: Object.freeze(ids),
    steps: Object.freeze(ids.map((id) => awsSnsSignatureCompanion.steps.find((item) => item.id === id))),
    failure,
    focusAt: selected.focusAt,
    terminal: selected.terminal,
    networkStarted,
    verified,
    dispatched,
    confirmationReached,
    failClosed: Boolean(failure),
  });
}

export const snsSignature = awsSnsSignatureCompanion;
