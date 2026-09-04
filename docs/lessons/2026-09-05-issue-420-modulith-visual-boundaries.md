# #420 Modulith 시각자료의 전송·입력 경계

## 판단과 근거

이슈의 DIRECT·SNS·SQS 목록을 세 가지 동등한 outbound transport로 해석하면 잘못된 모델이 된다. `AwsModulithSqsEventConsumer`는 DIRECT/SNS 입력 모드를 선택하고 publisher는 SNS/SQS 서비스를 선택한다. 구현 조사에서 이 차이를 확인해 SQS 발행, SNS 발행, DIRECT 입력부터 시작하는 세 가지 탐색 관점으로 구성했다.

## 재발 방지

- 같은 화면에 나열된 enum 이름은 먼저 소유 타입과 적용 방향을 확인한다. `AwsModulithEventsProperties`와 source decoder/publisher 양쪽을 교차 확인한다.
- 사용자의 스타일 선택 지시에 따라 Clinic, Exposed, Leader의 실제 화면을 비교했다. 이번에는 처리 경계 비교에 맞는 Exposed 경계 탐색형을 선택했다. 다음 시각자료도 직전 템플릿을 자동 재사용하지 말고 독자 질문과 대표 화면을 비교한다.
- 발행 성공, 동기 dispatch 반환, claim 완료, SQS ack를 각각 표현한다. 비동기 listener 완료나 업무 side effect의 exactly-once를 추론하지 않는다.
- 브라우저 검증 중 `data-path`가 root 상태와 button 선택자에 함께 사용되어 strict locator 오류가 발생했다. 검증 선택자를 `button[data-path]`로 좁혔고 실제 UI 행위를 58개 locale/시나리오 조합으로 재검사했다. 상태 선택자와 조작 대상 선택자를 구분한다.
- Workflow helper는 owner handle을 `.bluetape/handles/` 아래에 두고 write scope를 저장소 상대 경로로 받는다. 초기화/등록 오류에서 반환된 계약을 확인해 복구하고 mutation-check를 통과한 뒤 구현했다.

## 검증 범위

브라우저 29개 조합 × 2개 언어, 4개 locale/theme 이중 캡처 해시 일치, 모바일 390/768px × 2개 언어 × 2개 테마를 검사했다. 원본 AWS 구현과 인프라는 변경·실행하지 않았다. 이는 설명 모델과 화면 검증이며 AWS 통합 테스트를 대신하지 않는다.
