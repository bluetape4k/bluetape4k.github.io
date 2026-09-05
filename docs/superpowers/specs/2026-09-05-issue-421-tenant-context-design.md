# #421 Tenant context carrier 시각자료 설계

## 목표와 근거

독자는 Kotlin/JVM 애플리케이션 개발자다. 네 carrier가 tenant를 어디에 보관하고 어떤 경계에서 읽거나 복원하는지 한·영으로 비교한다. Source revision은 Projects `5954b6329a3e11c70ef12b6d4bd8480e7b38be1b`. `bluetape4k/tenant`, `bluetape4k/tenant-reactor`, `ktor/tenant`의 구현과 테스트를 확인했다. 도메인 issue #1562, site #421, 상위 #413을 연결한다.

## 구성과 선택

기존 Exposed `ddd-modulith-boundaries`의 절제된 청록색 카드와 Clinic의 긴 페이지 흐름을 선택한다. 단일 sequence는 carrier 사이의 자동 전파를 암시하기 쉬우며, 정적 표만으로는 중첩·실패·취소의 소유 범위 차이를 탐색하기 어렵다. 네 carrier 탭, 상황 선택, 현재 scope/visible tenant 설명, 단계 재생, 비교 카드와 책임 설명을 제공한다. 정적 SVG/PNG는 네 carrier의 독립 소유 범위를 비교하고 carrier 간 connector는 그리지 않는다.

## 계약

- ThreadLocal: 같은 thread의 lexical binding. finally에서 이전 값 복원 또는 remove. suspend/dispatcher hop 자동 전파 없음.
- ScopedValue: lexical scope 종료로 복원. StructuredTaskScope fork 상속과 독립 virtual thread 비전파를 구분한다. coroutine bridge 없음.
- Reactor: contextWrite와 deferContextual로 immutable subscriber Context를 명시적으로 사용한다. 중첩 derived Context는 outer를 바꾸지 않으며 cancellation이 ThreadLocal clear를 호출하는 것으로 그리지 않는다.
- Ktor: 동일 ApplicationCall의 write-once attribute. 중복 binding은 거부하고 winner를 보존한다. exception/cancellation 이후에도 같은 call은 값을 유지하고 새 call은 unbound다. 명시적으로 call을 전달하는 dispatcher hop과 자동 propagation을 구분한다.
- 모든 carrier의 missing 조회는 null 또는 MissingTenantContextException이다. default tenant, 인증/인가/tenant resolution, 자동 bridge를 제공한다고 설명하지 않는다.

## 수용 기준

정상·중첩·누락·오류·취소·전파 경계 6개 상황을 4개 carrier와 양 locale에서 검증한다. 지원하지 않는 상황은 성공으로 보이지 않아야 한다. auto/light/dark, keyboard, reduced motion, narrow viewport, reset/play/next를 검증한다. SVG/PNG와 semantic ledger, 4개 locale/theme HTML 캡처, catalog와 세 매뉴얼의 locale별 연결을 제공한다. 새 dependency와 backend 변경은 없다. 실제 Kotlin backend 실행은 범위 밖이다.

## 승인 및 완료 경계

사용자가 기존 대표 스타일 선택을 위임하고 배포·정리 후 다음 이슈 작업을 지시했다. 저장소 bluetape4k/bluetape4k.github.io, base develop, head docs/issue-421-tenant-context-carriers에서 구현·검증·PR 작성까지 진행한다. 새 PR 병합은 exact-head 결과 보고 후 별도 승인이다.
