# Tenant carrier의 종료 동작을 소유 범위로 설명한다

## 배경과 판단

Site #421은 ThreadLocal, ScopedValue, Reactor, Ktor를 한 시각자료에서 비교한다. 이때 공통 cleanup 단계에 모두 `clear`를 배치하면 서로 다른 수명 계약을 같은 동작으로 오해하기 쉽다.

## 소스로 확인한 차이

Projects `5954b6329a3e11c70ef12b6d4bd8480e7b38be1b`에서 ThreadLocal은 `finally`로 이전 값을 복원하거나 제거한다. ScopedValue는 lexical scope를 벗어나며 outer binding으로 돌아간다. Reactor는 derived immutable Context가 outer를 변경하지 않는다. Ktor는 취소·예외 뒤에도 동일한 `ApplicationCall`에 tenant binding을 유지하고 새 call은 unbound다.

## 결정과 재발 방지

Carrier별 소유 객체와 범위 종료 뒤 조회 결과를 별도 데이터로 정의한다. Unsupported coroutine propagation은 실패하거나 지원 범위 밖인 상태로 보여주고, 인증·인가·tenant resolution은 호출자 책임으로 둔다. 특히 Ktor 취소를 attribute 제거로 그리지 않는다.

앞으로 context 전파 시각자료를 작성할 때는 scope 진입·조회·중첩·예외·취소·비동기 이동을 carrier별 소스와 테스트에 대조한 뒤 상태 모델을 만든다. 공통 인터페이스만 보고 전파나 cleanup을 일반화하지 않는다. 이번 구현에서는 nested 복원, immutable outer 보존, Ktor 중복 binding 거부와 same-call 유지, missing-context 상태를 테스트하며 실행 결과는 시각 검토 기록에 남긴다.

## 구현 검토에서 발견한 일반화

첫 데이터 모델은 ThreadLocal·ScopedValue의 취소 상황을 취소 도착 후 자동 정리 흐름으로 구성했다. 그러나 두 API는 non-suspending lexical wrapper이며 cancellation 요청을 감지해 block을 종료하는 API가 없다. Main 검토에서 source 계약과의 불일치를 발견해 지원 범위 밖인 상태로 수정하도록 했다. `finally` 또는 lexical 복원은 실제로 block을 벗어났을 때만 설명한다. 향후 테스트는 취소 요청, 제어 흐름 종료, context 복원을 서로 다른 조건으로 검증해야 한다.

## 생성 화면은 실제 브라우저에서 확인한다

전체 Node 테스트가 통과한 뒤에도 Chromium에서 Enter로 단계를 선택하면 DOM 재생성으로 focus가 사라졌다. PNG를 열어 확인하자 비교 카드의 번역 키 누락이 `UNDEFINED`로 노출됐다. 생성 성공과 데이터 계약 테스트만으로 접근성·표시 품질을 보장할 수 없었다. 단계 재생성 후 선택한 버튼으로 focus를 복원하고 누락된 locale 라벨을 정의했다. 앞으로 generated HTML을 검사할 때는 키보드 조작 뒤 activeElement와 화면에 보이는 undefined 라벨 유무를 브라우저에서 함께 검증한다. 시나리오 데이터가 바뀌면 HTML 재생성을 마친 동일 상태에서 캡처한다.

외부 Google Fonts import도 제거했다. 문서가 네트워크 없이 작동해야 할 때는 로컬 font fallback을 사용하고, 동일 상태의 두 캡처가 일치하는지 확인한다.

독립 검토에서는 공통 tenant 테스트 링크만으로 Reactor와 Ktor의 취소·중복 설정 계약을 추적하기 어렵다는 점을 발견했다. 각 carrier의 구현뿐 아니라 해당 계약을 검증하는 테스트도 같은 source revision의 공개 링크로 제공한다.
