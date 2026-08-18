# 운영 확장 7 글 작성 실행 계획

설계: `docs/superpowers/specs/2026-08-18-clinic-appointment-external-results-article-design.md`

## 1. 사실·스타일 고정

- `clinic-appointment` develop `f0c7614beed766efc4b88a1a59aa5c370f8fccf7`의 outbox, consumer, schema, projection, dashboard source를 다시 확인한다.
- 운영 확장 4~6의 한·영 글을 비교해 frontmatter, hero, heading, table, source, series navigation 모양을 맞춘다.
- 공개 관련 자료에서는 Issue·PR을 제외하고 같은 시리즈 글과 문서·소스코드만 사용한다.

## 2. 시각자료 생성

- 텍스트 없는 3D hero를 새 파일로 생성하고 기존 hero를 덮어쓰지 않는다.
- data-flow SVG/PNG를 한국어·영어 한 쌍으로 만든다. 카드 경계와 연결선 끝점을 직접 지정하고 rounded orthogonal path만 사용한다.
- STAFF 운영 화면 SVG/PNG를 한국어·영어 한 쌍으로 만든다. 조치 큐 열 제목과 선택 상세가 잘리지 않는 크기로 배치한다.
- `xmllint`, `cairosvg`, `diagram-connector-audit.py`, `diagram-endpoint-audit.py`, `diagram-geometry-audit.py`, `diagram-mixed-corner-audit.py`, `diagram-sequence-style-audit.py`로 SVG와 PNG를 검증한다.

## 3. 글과 시리즈 연결

- `src/content/docs/ko/blog/clinic-appointment-external-results.mdx`를 한국어 원문으로 작성한다.
- `src/content/docs/blog/clinic-appointment-external-results.mdx`를 주장·수치·링크·asset이 같은 영어 현지화로 작성한다.
- `src/data/clinic-appointment-series.mjs`에 `operations-7`을 추가한다.
- 본문에 data-flow diagram과 운영 화면을 삽입하고, `<ClinicAppointmentSeries current="clinic-appointment-external-results" ... />`를 유지한다.

## 4. 문장·근거 교정

- 제목과 section을 선언적이되 직역체가 아닌 자연스러운 한국어로 다듬는다.
- `예약 서비스`, `빈시간`, `확정 예약`, `아웃박스(outbox)`, `최종 상태 결정`, `조치 큐`, `기준 데이터 원본`을 glossary와 일치시킨다.
- 현재 구현·승인된 설계·운영 rollout 대기를 표로 분리하고, 실제 production 증거가 없는 항목은 pending으로 명시한다.

## 5. 검증·배포 준비

- `git diff --check`
- `npm test` 중 변경 범위에 해당하는 ecosystem/visual-companion tests
- `npm run build`
- `dist/ko/blog/clinic-appointment-external-results/index.html` 및 `dist/blog/clinic-appointment-external-results/index.html`과 asset references 확인
- local preview에서 한·영 route와 lightbox가 diagram·운영 화면을 크게 열어 주는지 확인
- 변경 파일을 한 commit으로 묶고 PR/CI/merge/Pages 배포는 별도 승인 게이트로 진행한다.

## 예상 DoD

- 변경 파일: 한·영 MDX 2개, series registry 1개, hero 1개, flow SVG/PNG 4개, 운영 화면 SVG/PNG 4개, 설계·계획·semantic ledger.
- 금지 범위: `clinic-appointment` 소스코드 수정, GitHub Issue/PR 변경, 기존 hero 덮어쓰기, production endpoint 변경.
