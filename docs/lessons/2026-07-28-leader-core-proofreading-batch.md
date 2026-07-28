# Leader Part 1~3 교정 배치 교훈

## 범위

- 한국어·영어 글: Leader Part 1~3
- 기술 다이어그램: Leader 생성기가 관리하는 14개 stem의 한영 SVG·PNG
- 원천 저장소: `bluetape4k-leader/develop`

## 교정 교훈

### API 식별자와 설명 문장을 분리한다

`LeaderElector`, `lockName`, `LeaderRunResult`처럼 독자가 코드에서 그대로 찾아야
하는 식별자는 보존한다. 반면 일반 설명의 `replica`, `job`, `lock`, `lease`,
`action`, `skip`은 각각 레플리카, 작업, 잠금, 리스, 실행 작업, 건너뛰기로
표현해야 문장이 번역체로 흐르지 않는다.

`multi-leader`는 이 시리즈에서 실행 권한을 가진 노드가 여러 개라는 의미이므로
“복수 리더”로 통일했다. `lease TTL`은 “임대 TTL”처럼 용어 체계를 섞지 않고
API와 같은 개념인 “리스 TTL”로 쓴다. 이 두 규칙은 chezmoi 원본의
`bluetape-writer` 한국어 교정 체크리스트에 반영하고 실행본과 동기화했다.

### 예제 설명은 현재 구현 경계를 다시 확인한다

기존 Part 1은 테넌트 집계 예제가 `forTenant()`를 사용한다고 설명했지만 현재
예제는 `lockNamePrefix`와 테넌트 ID로 잠금 이름을 조합한다. 라이브러리에
`forTenant()` API가 실제로 존재하더라도, 특정 예제가 이를 사용한다고 단정하려면
예제 소스를 별도로 확인해야 한다.

Part 2에서는 `leaseTime`을 작업 종료 뒤에도 유지하는 시간처럼 읽히지 않도록
“한 번 부여되는 리더십 리스의 TTL”로 정의하고, 장기 작업의 갱신은
`autoExtend`가 담당한다고 분리했다.

### 생성기 범위와 배치 범위가 다르면 생성기 전체 출력을 검증한다

Part 1~3 글만 교정했지만 공통 다이어그램 생성기의 색상·문구를 바꾸면 Part 4~5의
ERD, Spring AOP 시퀀스, 처리량·지연 시간 차트도 함께 다시 생성된다. 생성된 파일을
배치 범위 밖이라고 간주하지 않고, 실제 변경된 14개 stem 전부를 정적 감사와
PNG 원본 크기 육안 검사 대상으로 포함했다.

## 검증 결과

| 항목 | 결과 |
| --- | --- |
| 원래 공개일과 정렬 순서 | 한영 Part 1~3 모두 보존 |
| 원천 소스 링크 | 한영 글 91/91 로컬 경로 존재 |
| 다이어그램 텍스트 감사 | 28/28 PASS |
| 시퀀스 스타일 감사 | 4/4 PASS |
| 아키텍처 endpoint·connector·geometry·corner 감사 | 20/20 PASS |
| PNG 육안 검사 | 한영 14개 stem 원본 렌더 확인 |
| writer 체크리스트 영속화 | dotfiles `59efe31`, source/live 일치, upstream 일치 |

