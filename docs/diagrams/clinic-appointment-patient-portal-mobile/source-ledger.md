# 환자 포털·모바일 채널 시각자료 근거

이 폴더의 시각자료는 `clinic-appointment` 저장소의 `develop` 브랜치
`f7dc25285f66f623db05ade6b273bb8fe2a8ec8d`를 기준으로 만들었다.

## 읽은 구현·설계 근거

- `frontend/appointment-frontend/src/app/app.routes.ts`: `/portal` lazy route와 `patientAuthGuard`
- `frontend/appointment-frontend/src/app/features/patient-portal/patient-portal.routes.ts`: 예약 현황·알림·내 정보 하위 경로
- `frontend/appointment-frontend/src/app/features/patient-portal/patient-portal-shell.component.html`: 포털 탐색 메뉴와 세션 경계
- `frontend/appointment-frontend/src/app/features/patient-portal/appointments/appointment-commitment.facade.ts`: 요청·수락·거절·취소, ETag, 멱등 키, 충돌 재조회
- `frontend/appointment-frontend/src/app/core/api/portal-api.models.ts`: `PROPOSED`, `HELD`, `CONFIRMED`, `EXPIRED`, `CANCELLED` 상태 계약
- `frontend/appointment-frontend/src/app/core/api/portal-event-stream.adapter.ts`: SSE 수신, sequence 정렬, polling 대체, 재조회
- `docs/superpowers/specs/2026-08-11-patient-portal-design.md`: 만료·충돌·재시도와 예약 서비스 책임 경계
- `docs/superpowers/specs/2026-08-11-patient-portal-visual-reference.html`: 예약 현황·알림·내 정보 화면 구성, 320px 재배치, 키보드 포커스
- `docs/superpowers/specs/2026-08-11-patient-portal-design.md`의 모바일 항목: Capacitor/WebView, PWA, 오프라인·푸시·딥 링크는 열린 로드맵

`Mobile channel roadmap` 카드는 현재 운영 중인 모바일 앱을 뜻하지 않는다. 모바일
WebView, PWA, native messaging, offline cache, push, deep link는 별도 검증이
필요한 열린 범위로 표시했다.
