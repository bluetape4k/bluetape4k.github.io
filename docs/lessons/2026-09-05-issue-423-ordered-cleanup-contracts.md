# 순서가 있는 정리 계약은 실패 위치까지 경로로 모델링해야 한다

## 실패한 가정

기존 SNS 시각자료 생성기를 이름과 문구 중심으로 바꾸면 SQS Extended Client에도 충분할 것으로 예상했다. 그러나 이 기능의 핵심은 서비스 이름이 아니라 payload 소유권과 실패 위치에 따라 달라지는 경로다. 단순 치환 결과에는 SNS 상태와 설명이 남았고, `ack` 실패와 payload 정리 실패를 같은 일반 실패로 표현할 위험이 있었다.

Semantic budget도 화면에 보이는 모든 대안 frame을 branch로 세면 된다고 생각했다. 이 방식은 inline/offload, receive failure, cleanup failure가 어떤 결정에서 갈라지는지보다 장식적인 frame 수를 세게 만든다. 한국어 정적 이미지의 긴 제목은 geometry와 PNG 수치 감사가 모두 통과했지만 실제 전체 크기 검토에서 글자 일부가 잘렸다.

`from`과 `to`를 data attribute에 남겼다는 사실도 화살표가 올바르다는 증거가 아니었다. 첫 정적 그림은 producer 내부 `size-gate`를 SQS로 보내는 message처럼 그렸고, interactive explorer는 서로 다른 actor 관계를 모두 같은 전체 폭 화살표로 표시했다.

실패 terminal에서 단계의 일반 `signal`을 그대로 쓰면 상태가 더 심하게 왜곡됐다. Upload 실패 화면이 `S3 object=present`를, SQS send 실패 화면이 `queue message=visible`을, cleanup retry가 `payloadDeleted=true`를 보여주는 모순은 action과 outcome만 확인하는 테스트로는 잡히지 않았다.

## 증거와 수정

- data model에 각 상황의 정확한 step 경로를 선언했다. inline은 S3를 건드리지 않고, offload는 S3 upload 뒤 SQS envelope을 보내며, receive는 payload restore 뒤 handler로 진행한다.
- `ack`는 SQS message를 먼저 삭제한다. SQS 삭제 실패는 marker와 payload 정리를 시작하지 않고, 이후 정리 실패만 `CLEANUP_REQUIRED`와 retry handle로 표현하도록 상태를 분리했다.
- semantic ledger는 실제 분기 결정 3개와 cleanup retry loop 1개를 별도로 기록했다. 한·영 ledger 감사 결과는 nodes=9, edges=8, branches=3, loops=1이다.
- unit test와 Chromium 검증에서 활성 step뿐 아니라 각 상황에서 실행되면 안 되는 step이 muted인지 확인했다. 최종 상태만 맞고 중간 소유권 전이가 틀리는 회귀를 막기 위한 부정 assertion이다.
- 한국어 정적 제목을 짧고 직접적인 문장으로 바꾸고 SVG/PNG를 다시 생성했다. 수치 감사 뒤에도 전체 PNG를 열어 glyph와 카드 경계를 확인했다.
- 정적 `size-gate`는 producer 내부 decision diamond로 바꾸고 SQS connector가 없음을 회귀 검사로 고정했다. Interactive sequence는 participant별 lane 좌표에서 origin과 endpoint를 계산하고 역방향 화살표와 self-loop를 별도로 표시했다.
- 실패 scenario에 성공 단계와 분리된 `failure.signal`을 선언했다. Browser 검증은 각 terminal의 화면 신호가 모델의 한·영 신호와 일치하는지 확인하고, 남은 S3 object, SQS message, handler/ack 진입 여부, marker와 payload 삭제 결과를 직접 고정한다.
- Self-loop arrowhead는 귀환 방향으로 회전시키고, 정적 producer 내부 decision에는 message activation을 그리지 않았다. 수치 감사 뒤 최신 desktop/mobile/static PNG를 다시 열어 방향과 겹침을 확인했다.

## 재사용 규칙

1. 외부 저장소와 queue를 함께 쓰는 기능은 성공 상태만 나열하지 않는다. 각 실패 위치가 어떤 자원을 남기는지 경로와 상태로 고정한다.
2. `ack`와 cleanup을 하나의 단계로 합치지 않는다. queue acknowledgement가 성공한 뒤에만 marker와 payload 정리가 시작됨을 별도 step으로 표현한다.
3. 정리 재시도는 일반 실패가 아니라 복구 가능한 terminal과 loop로 모델링한다. retry에 필요한 handle이 독자에게 보이는지 확인한다.
4. 분기 예산은 그려진 frame 수보다 의미 있는 선택 지점을 센다. 반복 복구는 branch가 아니라 loop로 기록한다.
5. 생성기를 재사용할 때 문자열 치환으로 끝내지 않는다. 이전 도메인의 state, selector, 설명이 남았는지 `rg`와 계약 테스트로 확인한다.
6. 정적 감사 수치가 통과해도 locale별 전체 크기 PNG를 직접 검토한다. 특히 한국어 제목과 긴 결과 문장은 카드 경계와 줄바꿈을 눈으로 확인한다.
7. `from`/`to` metadata만 검사하지 않는다. 실제 렌더링의 origin, endpoint, 방향이 actor lane과 일치하는지 source 검토와 PNG 검토로 확인한다.
8. 실패 terminal에는 단계의 성공 `signal`을 재사용하지 않는다. 각 failure가 남긴 자원과 실행되지 않은 후속 작업을 별도 상태 신호로 모델링한다.
9. Self-loop와 내부 decision은 일반 message arrow/activation 규칙을 그대로 적용하지 않는다. 귀환 방향과 actor 내부 표기를 별도 시각 문법으로 검사한다.
