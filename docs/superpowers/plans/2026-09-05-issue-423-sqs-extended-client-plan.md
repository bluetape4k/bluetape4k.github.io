# #423 SQS Extended Client 시각자료 구현 계획

## 범위와 실행

목표는 한·영 payload offload lifecycle explorer와 source-backed sequence SVG/PNG를 제공하는 것이다. Node ESM data model을 단일 의미 원본으로 삼아 HTML과 정적 자산을 생성하고, 기존 visual companion catalog와 AWS manual overlay를 재사용한다. 새 dependency를 추가하지 않는다.

1. [x] AGENTS·스킬·GNO·live issue·source issue/PR·current source를 확인했다. GNO가 충분한 결과를 주지 않아 live GitHub와 sibling source `30a28f80dbf995ca08bf86e64d3b60a93f1e2094`로 보완했다. Type E, 격리 worktree, site-only write scope를 설정했다.
2. [x] 데이터와 HTML: `src/data/visual-companions/wave2-aws-sqs-extended-client.mjs`, `scripts/generate-2-0-wave2-aws-sqs-extended-client.mjs`. inline/offload와 수신·ack·cleanup 시나리오를 하나의 story projection에서 생성한다.
3. [x] 정적 자산: `scripts/generate-2-0-wave2-aws-sqs-extended-client-visuals.mjs`, `public/assets/visual-companions/wave2/aws-sqs-extended-client-{en,ko}.{svg,png}`, locale별 semantic ledger. 순서형 message lane, failure branch, caller-owned boundary를 감사한다.
4. [x] 등록: catalog, manual link overlay, Wave 2 README 생성 원본과 결과를 갱신한다. AWS 1.0 storage-and-messaging의 한·영 route와 absolute `/assets/...` 경로를 검증한다.
5. [x] 테스트: missing module RED 뒤 inline/offload, missing object, restore failure, ack failure, cleanup retry, caller-owned lifecycle을 GREEN으로 만든다. 상호 배타 경로와 AWS Java Extended Client 비호환·no auto bucket/IAM 문구를 고정한다.
6. [x] 생성기 `--check`, targeted/full Node tests, `npm run build`, manual/visual 등록, semantic/XML/text/sequence/arrowhead/geometry/PNG/asset-pair 감사, Chromium locale/theme/keyboard/responsive/deterministic capture를 순서대로 실행한다. 실패 시 생성 원본을 수정하고 영향받은 검사를 다시 실행한다.
7. [x] 독립 source/visual 검토에서 P0/P1/P2를 0으로 수렴하고 review와 lesson에 실패한 가정, 수정, 재발 방지 규칙을 기록했다.
8. [ ] Lore protocol commit, push, PR 생성과 exact-head CI·review/thread·mergeability 확인까지 진행한다. merge-ready 상태에서 멈춘다.

## 예상 DoD와 복구

데이터 model과 generator가 source/output drift를 `--check`로 차단하고, PNG가 source-only 판정과 모순하면 PNG를 기준으로 수정한다. build와 브라우저 검사는 순차 실행한다. diff-check 뒤 승인한 branch만 push하며 원본 `develop`은 clean으로 보존한다. source revision이 이동하면 Extended Client 관련 blob과 계약 diff를 다시 비교한다.

## Workflow DoD

WF-00~04A, CL-01~05, CG-01~05, E-01~03을 완료한다. CG-06~15, E-04~07, DIA-01~08, DIA-SEQ-01~06, DIA-WORKFLOW-01~06, DIA-SEM-01~04는 구현·검증 증거로 완료한다. CG-16~18과 E-08은 새 PR 병합 승인 대기다. ChezMoi/global self-audit, backend build, publication/tag는 site-only 범위로 N/A다. 설계·계획·review·lesson에는 각각 SPW-01~05를 적용한다.
