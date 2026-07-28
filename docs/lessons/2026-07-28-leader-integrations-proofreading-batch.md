# Leader Part 4~5 교정 배치 교훈

## 범위

- 한국어·영어 글: Leader Part 4~5
- 기술 다이어그램: 백엔드 선택 지도 한영 SVG·PNG
- 원천 저장소: `bluetape4k-leader/develop`

## 교정 교훈

### 프레임워크 용어는 식별자와 설명 문장을 구분한다

`@LeaderElection`, `managementRouteEnabled`, `LockExtender`처럼 소스에서
찾아야 하는 식별자는 그대로 둔다. 반면 설명 문장의 `annotation`, `method`,
`lock`, `backend`, `metrics`, `route`, `lifecycle`, `prefix`는 애너테이션,
메서드, 잠금, 백엔드, 메트릭, 경로, 생명주기, 접두사로 통일했다.

“딱 좋다”, “얄밉다”, “비싼 질문”처럼 판단 근거를 가리는 구어적 평가는 실제
운영 적합성, TOCTOU 경쟁 조건, 미뤄진 설계 결정으로 바꿨다. 이 규칙은 chezmoi
원본의 `bluetape-writer` 체크리스트에 추가하고 실행본과 동기화했다.

### 문장 교정 중에도 현재 설정 계약을 다시 확인한다

Part 4의 Ktor 예제는 이전 설정명인 `enableManagementRoute`,
`managementPath`를 사용하고 있었다. 현재 소스의 `managementRouteEnabled`,
`managementRoutePath`로 수정하고, 관리 경로가 자체 인증·권한 검사를 제공하지
않는다는 운영 경계도 한영 글에 반영했다.

자연스러운 문장으로 고치는 작업은 오래된 식별자를 보존하는 이유가 될 수 없다.
프레임워크 통합 글에서는 설정 속성명과 생명주기 설명을 현재 구현과 별도로
대조해야 한다.

### 예제 표와 벤치마크는 완료 경계를 근거로 읽는다

Part 5의 예제 백엔드는 예제 이름에서 추정하지 않고 현재 README와 설정을
대조했다. 그 결과 `webhook-poller`는 MongoDB, `cache-warmer`는 Hazelcast,
`batch-scheduler`는 Lettuce Redis로 바로잡았다.

벤치마크 수치는 측정 날짜와 완료 경계를 함께 적었다. Kubernetes Lease의
신규 리스 획득·해제와 활성 소유자 확인 후 건너뛰기는 같은 `ops/s` 단위여도
수행한 작업이 다르므로 직접 순위를 매길 수 없다. Redis 리스 갱신 측정도
작업 대기 시간이 포함된 행을 일반 리더 선출 비용으로 해석하지 않도록 범위를
제한했다.

### 일반 감사의 약한 탐지는 구조별 불변식으로 보강한다

백엔드 선택 지도는 다이어그램 감사에서 연결선 4개와 marker 5개를 확인했지만
일반 카드 탐지는 `cards=0`으로 보고했다. 이를 통과로 간주하지 않고 SVG 구조를
직접 계수해 전체 사각형 14개, 주 백엔드 카드 4개, 보조 백엔드 카드 5개,
연결선 4개를 확인했다. 원본 크기 PNG 검사에서는 글자 잘림, 이상한 글리프,
화살촉 방향 오류가 없음을 확인했다.

## 검증 결과

| 항목 | 결과 |
| --- | --- |
| 원래 공개일과 정렬 순서 | 한영 Part 4~5 모두 보존 |
| 원천 소스 링크 | 한영 글 62/62 로컬 경로 존재 |
| 다이어그램 공통 감사 | 한영 2/2, text hazards 0, geometry·endpoint·corner 실패 0 |
| 다이어그램 구조 보강 | 각 SVG rect 14, 주 카드 4, 보조 카드 5, 연결선 4 |
| PNG 육안 검사 | 한영 3000×2160 원본 렌더 확인 |
| writer 체크리스트 영속화 | dotfiles `53024e5`, source/live 일치, upstream 일치 |
| 사이트 검사 | Node 테스트 21/21, Astro 오류 0, 1,303개 페이지 빌드 |
| 경로 검사 | 변경된 한영 경로 4/4 HTTP 200 |
