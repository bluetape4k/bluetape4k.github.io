# 차단된 run과 손상된 영수증을 구분한다

## 배경

issue #448 작업을 이어가며 `receipt-diagnose`의 `effective_state: blocked`를 영수증 손상으로 잘못 해석했다. 실제로는 기존 영수증이 정상 검증된 terminal `blocked` 상태였고, 진단에 손상 위치나 영수증 해시가 없어 `recovery-run-create` 대상이 아니었다. 이 시도는 새 복구 자료를 만들지 않고 종료됐다. 이어서 현재 세션에 `running` 상태로 남은 원본 run을 찾았고, 중복 실행이 `mutation-check`의 단일 run 조건을 위반한 원인을 확인했다.

## 결정

`recovery-run-create`는 진단에 손상된 receipt의 `first_bad_sequence`, `receipt_hash`, `receipt_size`가 포함된 경우에만 사용한다. 정상 검증된 terminal run은 보존하고, 새 작업이 필요하면 현재 `CODEX_THREAD_ID`가 연결된 새 `init` run을 만든다. 파일을 수정하기 전에 해당 세션·저장소에 연결된 실행 중 run이 정확히 하나인지 `mutation-check`로 확인한다.

## 결과와 검증

issue #448의 기존 실행 run은 `verify`를 통과했고 아직 원래 문서 작업을 소유하고 있어 재사용했다. 파일을 수정하지 않은 중복 run은 취소한 뒤 11개 대상 경로에 대해 `mutation-check`가 통과했다. 기존 차단 run과 quarantine 자료는 변경하지 않았다.

## 다음 작업을 위한 확인

- 먼저 `verify`와 `receipt-diagnose`를 실행해 영수증 무결성과 run 상태를 구분한다.
- `effective_state: blocked`만으로 receipt 손상을 추론하지 않는다. 손상 필드가 없는 정상 terminal run에는 `recovery-run-create`를 호출하지 않는다.
- `mutation-check` 실패 시 대상 경로보다 먼저 같은 세션의 모든 run 상태를 확인하고, 불필요하게 생성된 중복 run만 지원되는 취소 전이로 정리한다.
