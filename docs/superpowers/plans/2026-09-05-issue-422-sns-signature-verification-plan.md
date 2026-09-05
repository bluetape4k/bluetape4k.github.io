# #422 SNS HTTP 서명 검증 시각자료 구현 계획

## 범위와 실행

목표는 한·영 보안 checkpoint explorer와 sequence SVG/PNG를 pinned source 계약에 맞게 제공하는 것이다. Node ESM data model에서 HTML과 정적 자산을 생성하고 기존 visual companion catalog와 manual overlay를 재사용한다. 새 dependency를 추가하지 않는다.

1. [x] AGENTS·스킬·GNO·live issue·current source를 확인했다. GNO GitHub 검색은 결과가 없었고 docs의 #457 설계와 현재 sibling source로 보완했다. Type E, 격리 worktree, site-only write scope를 설정했다.
2. [x] 데이터와 HTML: `src/data/visual-companions/wave2-aws-sns-signature.mjs`, `scripts/generate-2-0-wave2-aws-sns-signature.mjs`. scenario별 단계, trust state, network request count, handler/confirmation 도달 여부를 한 구조에서 생성한다.
3. [x] 정적 자산: `scripts/generate-2-0-wave2-aws-sns-signature-visuals.mjs`, `public/assets/visual-companions/wave2/aws-sns-signature-verification-{en,ko}.{svg,png}`, `docs/diagrams/visual-companions-wave2/` semantic ledger. sequence 신호와 fail-closed branch frame을 감사한다.
4. [x] 등록: catalog, manual link overlay, Wave 2 README 생성 원본과 결과를 갱신한다. AWS 1.0 storage-and-messaging의 한·영 route와 절대 `/assets/...` 경로를 검증한다.
5. [x] 테스트: missing module RED 뒤 정상 v1/v2와 malformed, unknown topic, bad certificate host, certificate/timeout failure, signature mismatch, unsupported version을 GREEN으로 만든다. 실패 경로의 handler/confirmation 미도달과 조기 거부 network count를 확인한다.
6. [x] 생성기 `--check`, targeted/full Node tests, `npm run build`, manual/visual 등록 데이터, semantic/XML/text/sequence/arrowhead/geometry/PNG/asset-pair 감사, Chromium locale/theme/keyboard/responsive/동일 캡처 검증을 실행한다. 실패 시 원본을 수정하고 영향받은 검사를 다시 실행한다.
7. [x] 독립 source/visual 검토에서 P0/P1/P2를 0으로 수렴했다. 상호 배타 terminal의 선형 경로 투영, 정적 카드 overflow, 모바일 scroll discoverability, 한국어 제목 줄바꿈을 수정하고 final review와 lesson에 기록했다.
8. [ ] Lore protocol commit, push, PR 생성과 exact-head CI·review/thread·mergeability 확인까지 진행한다. merge-ready 상태에서 멈춘다.

## 검증과 복구

데이터/HTML과 정적 자산·등록의 write ownership을 분리하고 다른 변경을 되돌리지 않는다. 데이터 model이 source contract의 SSOT이며 생성기 `--check`로 source/output 차이를 차단한다. PNG가 audit와 모순하면 PNG 판정을 우선한다. build와 브라우저 검사는 순차 실행한다. diff-check 뒤 승인한 branch만 push하며 원본 `develop`은 clean으로 보존한다.

## Workflow DoD

WF-00~03, CL-01~05, CG-01~05, E-01~03을 완료했다. CG-06~15, E-04~07, DIA-01~08, DIA-SEQ-01~06, DIA-WORKFLOW-01~06, DIA-SEM-01~04는 구현·검증 증거로 완료한다. CG-16~18과 E-08은 새 PR 병합 승인 대기다. ChezMoi/global self-audit, backend build, publication/tag는 site-only 범위로 N/A다. 설계·계획·review·lesson에는 각각 SPW-01~05와 해당 한국어 자연스러움 검사를 적용한다.
