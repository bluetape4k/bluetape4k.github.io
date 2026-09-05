# #422 SNS HTTP 서명 검증 시각자료 설계

## 목표와 근거

독자는 외부 SNS HTTP(S) endpoint를 Spring MVC 또는 WebFlux handler에 연결하는 Kotlin/JVM 개발자다. 입력 JSON의 구조가 맞는다는 사실과 신뢰할 수 있는 메시지라는 판단을 분리하고, 어떤 검사가 인증서 네트워크 접근보다 먼저 실행되는지 한·영으로 보여준다. Source revision은 `bluetape4k-aws`의 `f73f52e5497f3396d9ccc02c8acb1e3444986bc1`이다. `SnsHttpMessageParser`, `SnsHttpMessageVerifier`, `SnsHttpMessageResolverSupport`와 verifier fixture tests를 확인했다. 도메인 issue `bluetape4k-aws#457`, site issue #422, 상위 Epic #413을 연결한다.

## 구성과 선택

기존 `aws-modulith-event-externalization`의 긴 interactive explorer와 `projects-nats-jetstream-flow`의 번호가 표시된 sequence를 결합한다. 시나리오 선택, 단계별 Play/Next/Reset, 현재 신뢰 상태, 인증서 요청 횟수, 최종 handler 도달 여부를 한 화면에서 비교한다. 정적 SVG/PNG는 participant, lifeline, activation bar, 번호가 표시된 message lane과 fail-closed branch frame을 사용한다. 일반 카드형 아키텍처는 검사 순서와 조기 거부 지점을 충분히 설명하지 못하므로 선택하지 않는다.

## 계약

- Parser는 크기, message type, 필수 필드와 `SigningCertURL`의 HTTPS·host·region·partition 형식을 검사한다. 이 단계만으로 payload를 신뢰하지 않는다.
- Adapter는 exact `TopicArn` allowlist를 확인하고 불일치 메시지를 certificate retrieval 전에 거부한다.
- `SnsMessageManager`는 허용된 certificate URL에서 인증서를 조회하고 bounded cache, certificate chain, canonical string과 `SignatureVersion` 1/2 서명을 검증한다.
- malformed message, unknown topic, 비허용 certificate host, certificate/timeout 실패, 지원하지 않는 signature version, signature mismatch는 모두 fail closed한다.
- 검증에 성공한 `Notification`만 업무 handler로 전달한다. `SubscriptionConfirmation`은 검증 성공 뒤 `NotificationStatus`를 제공하며 실제 confirmation 호출은 handler가 명시적으로 소유한다.
- 구조만 맞는 payload, payload가 제시한 `TopicArn`, 서명 metadata만으로 메시지를 신뢰한다고 설명하지 않는다. 인증서 네트워크·cache 정책과 handler 업무 효과는 각 소유 경계를 명시한다.

## 수용 기준

정상 `SignatureVersion` 1/2와 여섯 실패 시나리오를 두 locale에서 검증한다. 모든 실패 경로에서 handler와 subscription confirmation은 도달하지 않아야 하며 unknown topic과 비허용 certificate host는 network request count가 0이어야 한다. auto/light/dark, keyboard, reduced motion, narrow viewport, Play/Next/Reset을 검증한다. sequence SVG/PNG와 semantic ledger, locale/theme HTML 캡처, catalog·Wave 2 README·AWS 1.0 manual 연결을 제공한다. 새 dependency와 backend 변경은 없다. 실제 AWS endpoint 호출과 Kotlin backend 재실행은 범위 밖이며 pinned source와 fixture tests로 계약을 대조한다.

## 승인 및 완료 경계

사용자가 #422 구현 계획을 승인했다. 저장소 `bluetape4k/bluetape4k.github.io`, base `develop`, head `docs/issue-422-sns-signature-verification`에서 구현·검증·PR 작성과 exact-head CI까지 진행한다. 새 PR 병합은 merge-ready 보고 뒤 별도 승인을 받는다.
