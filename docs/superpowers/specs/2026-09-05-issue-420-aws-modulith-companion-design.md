# #420 Spring Modulith 이벤트 외부화 시각자료 설계

## 목적과 기준

독자가 발행 성공과 수신 처리 완료를 구별하고, DIRECT/SNS 입력 검증부터 claim·dispatch·ack까지의 실패 경계를 비교하도록 한다.
사용자가 2026-09-05 대화에서 기존 대표 스타일 중 가장 알맞은 스타일을 선택해 작업하도록 승인했다. Type E, site-only 작업이며 원본 Kotlin 구현은 변경하지 않는다.

## 스타일 결정

실제 Chromium 1440×1000 화면으로 Clinic appointment-plan-and-capacity, Exposed ddd-modulith-boundaries, Leader leader-elector를 비교했다.
Exposed의 절제된 청록색 경계 탐색형 화면과 단계별 설명을 기준으로 선택했다. Clinic의 긴 스크롤 섹션 구성을 참고한다. Leader의 TTL 시간축은 이번 입력 검증·책임 비교에 맞지 않아 채택하지 않는다.
상단은 핵심 계약과 작은 경계 개요, 다음은 전송 경로·실패 조건 선택과 단계별 결과, 하단은 envelope 필드·전송 차이·운영 책임이다. 실제 AWS 요청은 발생하지 않는다.

## 계약

원본: bluetape4k-aws `870361650e6caf8b1ac3fae141789fccbb0969c7`, `aws-spring-boot/src/main/kotlin/io/bluetape4k/aws/spring/modulith/`.
`AwsModulithEventExternalizationTransport`, `AwsModulithEventCodec`, `AwsModulithSqsEventConsumer`, `AwsModulithSqsEventListener`를 근거로 한다.
DIRECT는 로컬 호출이 아니라 SQS body에 직접 담긴 envelope를 읽는 입력 모드다. outbound publisher는 SNS와 SQS다. SNS 입력은 topic allowlist와 signature 검증 이후 envelope를 읽는다. SQS 직접 발행은 DIRECT 입력으로 연결하고 SNS 발행은 wrapped SNS notification이 SQS에 도달하는 구성으로 설명한다.
정상 claim 완료와 완료된 중복만 ack로 이어진다. 처리 중 중복, 검증 실패, handler 실패, claim 완료 실패는 ack하지 않는다. ack 실패는 완료된 claim을 되돌리지 않는다. Spring publishEvent 반환은 비동기 listener 최종 완료를 보장하지 않는다.

## 산출물과 검증

한·영 독립 HTML, 단일 bilingual data module, 생성기, SVG/PNG 정적 개요, semantic ledger, 카탈로그·매뉴얼 overlay 등록, 회귀 테스트, 시각 검토 기록을 만든다.
상호작용은 경로·시나리오 변경, 단계 선택, 재생·정지·초기화, auto/light/dark 테마다. 모바일은 세로로 재배치한다. 키보드, reduced motion, JS 오류, overflow, locale parity, 모든 시나리오의 terminal 상태를 검사한다.
`npm test`, `npm run build`, 생성기 `--check`, `git diff --check`와 Chromium 시각 검토 후 PR을 만든다. 병합과 배포는 별도 승인 단계다.
