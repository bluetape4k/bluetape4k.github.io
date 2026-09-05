# #423 SQS Extended Client 시각자료 설계

## 목표와 근거

독자는 SQS의 inline 한계를 넘는 payload를 `bluetape4k-aws`의 opt-in Extended Client로 처리하려는 Kotlin/Spring 개발자다. 작은 payload의 기존 wire format과 큰 payload의 S3 offload 경로를 나란히 보여주고, 수신 복원부터 handler 완료, SQS acknowledgement, marker와 payload cleanup까지의 순서를 한·영으로 설명한다. Source revision은 `bluetape4k-aws`의 `30a28f80dbf995ca08bf86e64d3b60a93f1e2094`다. `SqsExtendedClient`, `SqsExtendedOperations`, pointer codec, acknowledgement tests와 AWS manual을 확인했다. 도메인 issue `bluetape4k-aws#455`, site issue #423, 상위 Epic #413을 연결한다.

## 기존 스타일 비교와 선택

Card는 inline/offload 비교를 빠르게 요약하지만 acknowledgement와 cleanup의 시간 순서를 충분히 보여주지 못한다. AWS SQS Reliability의 Play animation은 성공과 실패 경로를 단계별로 비교하기 좋고, AWS Streams의 sequence는 participant 사이의 호출 순서와 반복 가능한 복구 경계를 잘 드러낸다. AWS Modulith의 long-scroll explorer는 여러 시나리오와 ownership 설명을 한 문맥에 유지한다.

따라서 **AWS Modulith의 장문 explorer, AWS SQS Reliability의 Play/Next/Reset, AWS Streams의 순서형 static sequence**를 결합한다. 독자는 `inline`, `offload-success`, `missing-object`, `restore-failure`, `ack-failure`, `cleanup-retry`, `caller-owned-lifecycle` 시나리오를 선택하고 같은 시간 축에서 producer, S3, SQS, consumer, handler 경계를 따라간다. 정적 SVG/PNG는 정상 offload 경로와 failure/ownership branch를 numbered message lane과 `alt` frame으로 표현한다.

## 동작 계약

- Extended Client는 queue별 opt-in이다. Rollout에서는 consumer가 pointer를 복원할 수 있는 상태에서 producer offload를 활성화한다.
- threshold 이하 payload는 기존 SQS body로 전송하며 S3 upload와 pointer 생성이 없다.
- threshold 초과 payload는 idempotency key와 정책을 검증한 뒤 S3에 먼저 저장하고, module 전용 signed pointer를 SQS body로 전송한다.
- SQS send가 실패한 경우 이미 생성된 S3 object는 orphan cleanup 대상으로 남는다. 자동으로 성공했다고 표시하지 않는다.
- 수신자는 policy가 있는 queue에서 pointer를 검증한 뒤 bounded S3 read로 payload를 복원한다. missing object, bounded capability 부재, 크기 초과, content/encryption mismatch는 handler 전에 typed failure로 끝난다.
- handler 성공만으로 acknowledgement가 끝나지 않는다. 동일한 identity-bound `SqsExtendedReceivedMessage`로 SQS receipt를 먼저 삭제한다.
- `delete-on-ack=true`에서는 SQS delete 성공 뒤 marker를 생성·검증하고 payload를 삭제한다. payload delete 실패는 opaque cleanup retry handle을 반환한다.
- SQS acknowledgement 실패 시 marker와 payload를 삭제하지 않는다. `delete-on-ack=false`는 payload lifecycle을 caller가 소유한다.
- pointer wire format은 AWS Java Extended Client와 호환되지 않는다. legacy `@SqsListener` 또는 AWS Java Extended Client를 extended pointer queue에 연결하지 않는다.

## 소유권과 비범위

Adapter는 inline/offload 결정, signed pointer, bounded restore, acknowledgement ordering과 retry handle을 제공한다. 애플리케이션은 S3 bucket, IAM, encryption identity/context, retention/lifecycle, queue별 opt-in, handler idempotency, retry scheduling, orphan cleanup과 rollout/rollback을 소유한다. 시각자료는 bucket이나 IAM policy를 생성하지 않으며 AWS 호출을 실행하지 않는다. 실제 AWS 비용·latency·throughput 수치는 제시하지 않는다.

## 실패 모델과 수용 기준

두 locale에서 inline과 offload 성공을 완주하고, missing object/restore failure는 handler 전에 끝나며, ack failure는 payload delete 전에 끝나고, cleanup failure는 retry handle을 남겨야 한다. `delete-on-ack=false`는 SQS delete 뒤 caller-owned lifecycle로 종료한다. Play/Next/Reset, keyboard, reduced motion, auto/light/dark, narrow viewport를 검증한다. sequence SVG/PNG, locale별 semantic ledger, catalog, Wave 2 README, AWS 1.0 manual 연결과 absolute `/assets/...` URL을 제공한다. 새 dependency와 backend 변경은 없다.

## 승인 및 완료 경계

사용자가 #423 구현 계획을 승인했다. 저장소 `bluetape4k/bluetape4k.github.io`, base `develop`, head `docs/issue-423-sqs-extended-client`에서 구현·검증·PR 작성과 exact-head CI까지 진행한다. 새 PR 병합은 merge-ready 보고 뒤 별도 승인을 받는다.
