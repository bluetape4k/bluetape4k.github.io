# Exposed 핵심 글 재교정 배치 Lessons

## 범위

- `bluetape4k-exposed-part1-why-exposed`
- `bluetape4k-exposed-part2-jdbc-repositories-sql-dsl`
- `bluetape4k-exposed-part3-r2dbc-coroutines-virtual-threads`

## 확인한 점

- 세 글은 같은 시리즈의 Part 1~3이므로 최초 공개일과 sidebar order는 유지한다.
- 글 범위는 Part 1~3 본문 교정이지만, Exposed 시리즈 diagram generator가 Part 1~5와 README 개요 자산을 함께 생성한다. 따라서 다이어그램 변경 검증은 공유 generator 출력 전체를 대상으로 한다.
- GitHub source link는 `bluetape4k-exposed`, `exposed-workshop`, `exposed-r2dbc-workshop`의 현재 로컬 경로 기준으로 확인한다.

## 교정 교훈

- 데이터 접근 글에서 `repository`, `transaction`, `query`, `mapping`, `paging`은 일반 설명문에서는 `저장소`, `트랜잭션`, `쿼리`, `매핑`, `페이징`으로 정리한다. 단, `JdbcRepository`, `LongJdbcRepository`, `transaction { ... }` 같은 코드 식별자는 그대로 둔다.
- `Virtual Threads`, `Coroutines`, `blocking`, `non-blocking`은 본문과 한국어 다이어그램에서 각각 `가상 스레드`, `코루틴`, `블로킹`, `논블로킹`으로 쓰면 기술 의미를 잃지 않으면서 번역투를 줄일 수 있다.
- `workload`, `driver`, `connection pool`, `event loop`, `backpressure`는 런타임 비교 설명에서 `워크로드`, `드라이버`, `커넥션 풀`, `이벤트 루프`, `배압`으로 고정하는 편이 좋다.
- Exposed 글에서는 `dialect`를 `방언`으로 직역하기보다 프로젝트 문맥에 맞게 `다이얼렉트`로 쓰는 편이 독자가 모듈명을 바로 연결하기 쉽다.
- 한국어 다이어그램은 본문보다 영어 표현이 더 오래 남기 쉽다. generator 번역표를 본문 교정과 같은 기준으로 점검해야 한다.

## 검증 메모

- writer 체크리스트는 chezmoi 원본과 live skill에 반영했고, dotfiles commit `decd972`로 push했다.
- `sync-codex.sh --status`는 기존 live-owned/config drift를 보고했지만, 이번 범위인 managed Codex surface는 chezmoi source와 일치했다.
