# 병원마다 예약 규칙이 다른 이유 글 설계

## 목적

같은 상품과 같은 환자 요청도 병원별 운영 정책에 따라 다른 예약 결과가 나오는
이유를 설명한다. 정책을 임의의 controller 조건문이나 환경설정으로 소개하지 않고,
테넌트 기본 정책과 병원별 override를 합성한 뒤 의사결정 시점의 유효 정책
스냅숏으로 고정하는 경계를 보여 준다.

## 독자와 서술 순서

- 병원 운영자: “우리 병원만 다른 결과를 받는 이유”와 정책 변경의 영향 범위를 먼저 읽는다.
- PO: 기본값, 병원별 예외, 승인·활성화, 기존 약속 보호의 책임 경계를 확인한다.
- 개발자: typed payload, lifecycle, generation/hash, CAS, effective read 계약을 근거로 확인한다.

한국어 원문은 한 환자의 같은 요청이 두 병원에서 다르게 처리되는 장면으로 시작한다.
그 다음 `INHERIT / SET / DISABLE`, lifecycle, effective snapshot, activation 충돌,
`FUTURE_ONLY`, `CONFIRMED` 보호 순서로 전개한다. 각 절은 업무 결과를 먼저 말하고
구현 토큰은 근거로 붙인다.

## 핵심 주장과 경계

1. tenant default는 공통 기준이고 clinic override는 허용된 범위의 부분 재정의다.
2. `INHERIT`는 tenant 값을 사용하고, `SET`은 clinic 값을 대체하며, `DISABLE`은
   schema가 선택 기능으로 선언한 경우에만 적용한다. tenant의 안전 상한을 낮출 수 없다.
3. 정책 payload는 수정하지 않고 새 version을 만든다. lifecycle은
   `DRAFT → SCHEDULED/ACTIVE → RETIRED` 이력으로 남긴다.
4. 예약 판단은 유효 정책을 `generation`과 `hash`가 있는 불변 snapshot으로 읽는다.
5. activation은 expected revision/generation과 CAS로 충돌을 거부하며, 정책 변경은
   기본적으로 미래 후보에만 적용한다.
6. 이미 `CONFIRMED`인 방문 약속은 새 정책으로 자동 재작성하지 않는다. 변경이
   필요하면 새 제안과 고객 동의를 별도 흐름으로 시작한다.
7. 현재 정책 foundation은 관리·조회·컴파일 경계를 준비하지만, 예약 생성 경로에
   새 정책을 강제하는 단계는 별도 작업이다. 이 차이를 현재 구현과 로드맵 사이에서
   명시한다.

## 시각자료

- 고유 hero: 정책 카드와 effective snapshot 영수증을 비교하는 로봇 운영자 장면.
- 본문 그림: `Tenant Default`와 `Clinic Override`가 `INHERIT / SET / DISABLE`로
  합성되고, `Effective Snapshot`을 거쳐 예약 판단으로 전달되는 구조. activation
  충돌과 기존 `CONFIRMED` 보호를 별도 명시적 노드로 표시한다.
- 기존 `/visual-companions/clinic-appointment/scheduling-policy-foundation/`는
  상세 설계·롤아웃 자료로 연결하고, 새 본문 그림은 그 문서를 대체하지 않는다.
- 그림 원본은 SVG, 게시용은 2배 크기 PNG로 만들고 connector·arrowhead·label
  geometry와 source/PNG parity를 점검한다.

## 현지화

한국어 글을 먼저 작성하고 영어 글은 같은 섹션·표·링크·그림 자산을 유지한다.
독자-facing 한국어 용어는 `예약 서비스`, `빈시간`, `스냅숏`, `최종 상태 결정`,
`대기 목록` 등 승인된 glossary를 따른다. 코드 토큰·API 이름·URL·상태 식별자는
그대로 보존한다.

## 검증

- `git diff --check`
- `npm run build`
- 한국어·영어 route와 이미지 응답 확인
- SVG text normalization, semantic/visual audit, PNG full-size inspection
- 로컬 preview에서 두 route와 시각자료를 실제로 읽어 보기

## 근거

- [clinic-appointment Issue #283](https://github.com/bluetape4k/clinic-appointment/issues/283)
- [Scheduling Policy Foundation 설계](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/superpowers/specs/2026-07-27-scheduling-policy-foundation-design.md)
- [예약 정책 API](https://github.com/bluetape4k/clinic-appointment/blob/develop/docs/api/scheduling-policy.md)
- [Scheduling Policy Foundation 시각 동반 문서](https://bluetape4k.github.io/ko/visual-companions/clinic-appointment/scheduling-policy-foundation/)
