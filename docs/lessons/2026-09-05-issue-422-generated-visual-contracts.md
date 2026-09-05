# 생성된 시각자료는 의미와 동작을 각각 검증해야 한다

## 실패한 가정

SVG에 `data-branch`가 있고 사각형이 보이면 branch frame 감사도 통과할 것으로 예상했다. 브라우저의 `Auto` 버튼도 `data-theme`만 지우면 시스템 light/dark 설정을 자동으로 따를 것으로 봤다.

두 가정 모두 불완전했다. Sequence 감사기는 표준 `.alt` class로 branch region을 식별했고, HTML의 기본 변수는 dark로 고정되어 있어 `data-theme`을 지운 뒤에도 `prefers-color-scheme: light`를 반영하지 않았다.

자동 감사가 통과한 첫 결과도 완전하지 않았다. 독립 시각 검토에서 정적 카드 문장이 경계 밖으로 내려간 문제, 모바일 내부 가로 스크롤을 발견하기 어려운 문제, 한국어 제목의 고립된 마지막 음절을 찾았다.

상호 배타적인 성공 terminal도 배열 순서만으로 경로를 잘라 만들면 안 된다. 첫 구현은 `SignatureVersion 2` confirmation 상황이 앞선 `notification-handler`를 함께 통과하도록 투영했다. 최종 상태 assertion만으로는 중간 경로의 의미 오류를 찾지 못했다.

## 증거와 수정

- 첫 sequence style 감사가 branch region styling 누락을 보고했다. 생성 원본의 두 branch frame에 `.alt` class를 추가하고 SVG를 다시 생성하자 한·영 감사가 통과했다.
- Chromium에서 `Auto`를 선택한 뒤 시스템 color scheme을 바꿔도 `--bg`가 같은 값으로 남았다. `:root:not([data-theme])`에 대한 light media query를 생성 원본에 추가하고 HTML 계약 테스트와 실제 브라우저 검사를 함께 보강했다.
- 정적 overview 카드 높이를 늘리고 전체 크기 PNG로 텍스트가 경계 안에 들어오는지 확인했다. 모바일에는 locale별 가로 스크롤 안내를 표시하고, 한국어 hero에는 `word-break: keep-all`과 좁은 화면 글꼴 크기를 적용했다. 새 Chromium 캡처를 같은 독립 검토자에게 다시 맡겨 P0/P1/P2 0을 확인했다.
- 정상 경로는 공통 단계와 선택 terminal을 명시적으로 합성했다. v1에서는 confirmation, v2에서는 notification handler가 muted인지 unit test와 실제 Chromium에서 각각 검증했다.

## 재사용 규칙

1. 첫 SVG 생성 직후 PNG 검토보다 먼저 semantic·sequence style 감사를 실행한다.
2. 생성된 HTML의 테마 버튼 존재만 검사하지 않는다. 실제 브라우저에서 `Auto`를 선택한 뒤 `prefers-color-scheme`을 light와 dark로 전환하고 계산된 CSS 변수가 달라지는지 확인한다.
3. 생성 결과를 직접 고치지 않고 생성 원본과 회귀 검사를 먼저 수정한 뒤 `--check`로 동등성을 증명한다.
4. 내부 scroll container는 document overflow 검사만으로 충분하지 않다. 좁은 화면 캡처에서 독자가 이동 가능성을 알아볼 단서를 확인한다.
5. 정적 카드와 한국어 제목은 수치 감사 뒤에도 전체 크기와 모바일 실물을 독립적으로 검토한다.
6. 상호 배타 terminal이 있는 sequence는 선형 `slice`로 경로를 만들지 않는다. 각 성공 상황에서 선택하지 않은 terminal이 비활성인지 부정 assertion으로 고정한다.
