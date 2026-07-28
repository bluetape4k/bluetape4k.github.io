# JaVers Part 1~3 교정 lessons

## 범위

- `bluetape4k-javers-part1-audit-diff-overview`
- `bluetape4k-javers-part2-persistence-options`
- `bluetape4k-javers-part3-ddd-workshop-example`
- 한국어·영어 본문과 기술 다이어그램 8종의 SVG/PNG

## 사실 검증 lessons

- `planned`, `not yet`, `future` 같은 문구는 현재 기본 브랜치에서 다시 확인해야 한다.
  이번 교정에서는 이미 구현된 `CompositeCdoSnapshotRepository`를 향후 기능으로 설명하던 내용을
  현재의 주 저장소 읽기, 주 저장소 우선 쓰기, 순차 보조 저장소 전파 구조로 바로잡았다.
- `BEST_EFFORT`라는 이름만 보고 실패를 무시한다고 해석하면 안 된다. 현재 복합 저장소는 모든 보조
  저장소를 시도한 뒤 집계 예외를 전달하며, 자동 재시도나 분산 트랜잭션은 제공하지 않는다.
- 같은 Redis 모듈이어도 Lettuce와 Redisson의 원자성은 다르다. Lettuce의 커밋 단위
  `MULTI/EXEC`와 Redisson의 부분 저장 가능성을 개별 구현에서 확인했다.
- 예제의 실행 순서는 원자성을 증명하지 않는다. 작은 워크숍 예제는 JaVers와 Exposed 쓰기가
  분리되어 있고, DDD 예제는 DB·감사 저장 경계가 끝난 뒤 Kafka 이벤트를 발행한다. 각 예제가
  증명하는 정상 흐름과 운영 환경에서 추가로 검증할 복구 경계를 구분했다.
- 후속 실행에서 재현되지 않고 README와 원시 결과가 일치하지 않는 벤치마크 이상치는 제거했다.
  검증되지 않은 수치를 유지하는 대신 현재 벤치마크 경계를 설명하는 Part 4로 연결했다.

## 한국어 교정 lessons

- 한 시리즈에서는 반복 용어를 통일해야 한다. 일반 설명, 대체 텍스트, 캡션, 다이어그램의
  `snapshot`은 `스냅숏`으로 통일하고, 코드 식별자의 `Snapshot`은 원문을 유지했다.
- `audit`, `diff`, `history`, `repository`, `read model` 같은 일반 개념은 각각 `감사`,
  `객체 차이`, `이력`, `저장소`, `조회 모델`로 표현했다. API와 클래스 이름은 검색 가능성을
  위해 원문을 유지했다.
- 설명형 문장은 개인 경험이나 계획을 중심으로 쓰지 않고, 현재 구현이 보장하는 책임과
  독자가 추가로 검증할 경계를 중심으로 다시 구성했다.

## 다이어그램 lessons

- Graphviz `.dot`·`.plain` 중간 산출물과 최종 KO/EN SVG·PNG를 함께 보관하면 편집 원본이
  모호해진다. 생성기가 완결된 자산을 만들도록 정리하고 중간 산출물을 제거했다.
- 한 컴포넌트에서 두 대상으로 나가는 연결선이 같은 구간을 공유하면 관계가 하나로 보일 수 있다.
  복합 저장소의 주·보조 저장소 연결 시작점을 분리하고, 모든 직교 모서리를 `Q` 곡선으로 다듬었다.
- 시퀀스 화살촉은 실제 표시 크기와 표준 도형을 함께 맞춰야 한다. `markerWidth`와
  `markerHeight`는 14로 유지하되, 10×10 viewBox와 표준 삼각형 경로를 사용해 가독성과
  정적 감사 규칙을 모두 충족했다.
- 기술 그림 8종은 한영 구조를 유지하고 한국어 라벨을 별도 자산으로 제공했다. 모든 기술
  `figure`에 언어별 `data-diagram-title`을 두고 대표 이미지는 확대 대상에서 제외했다.

## writer checklist 반영

- 감사 이력과 업무 데이터의 트랜잭션 구분, 추상 저장소의 전체 계약 확인, 로드맵 문구의
  현재 구현 재검증, 복합 저장소 실패 정책, Redis 구현별 원자성, 벤치마크 이상치 처리,
  기술 그림 제목, `스냅숏` 표기 규칙을 체크리스트에 추가했다.
- chezmoi 원본 수정 후 live skill 적용, source/live parity, self-audit와 workflow contract를
  확인하고 dotfiles commit `fb20568`을 push했다.
