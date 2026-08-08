# JaVers Part 4 DB 쓰기 경로 설명 설계

## 목표

`JaVers + Exposed repository` 벤치마크 경로가 데이터베이스 기반 쓰기에서
Hibernate Envers 경로보다 오래 걸릴 수 있는 이유를 설명하되, 커밋된
벤치마크를 일반적인 라이브러리 순위로 바꾸지 않는다.

## 범위

- Part 4 벤치마크 결과 표 바로 다음에 한국어 섹션을 하나 추가한다.
- 짝을 이루는 글에 동일한 내용의 영어 섹션을 추가한다.
- Hibernate Envers와 JaVers + Exposed repository의 의사코드 블록 두 개를
  나란히 제시한다.
- JaVers 쓰기 경로 비용을 증가시키는 조건을 설명하는 간결한 표를
  추가한다. 조건은 더 큰 aggregate 상태, 더 잦은 변경, 더 많은 snapshot,
  더 넓은 commit 메타데이터다.
- 다음 현재 구현 경계에 설명을 연결한다.
  `ExposedCdoSnapshotRepository.saveSnapshot()` 및
  `AggregateRepository.save()`.

## 비목표

- 벤치마크 값, 차트, 다이어그램, 벤치마크 방법론은 변경하지 않는다.
- 어느 한 라이브러리가 항상 더 빠르다고 주장하지 않는다.
- 새 시각 자산을 추가하지 않는다. 비교 내용은 코드와 작은 운영 표를
  선형으로 읽는 방식이 가장 적합하다.

## 설명 모델

Envers 경로는 JPA entity를 영속화하고 트랜잭션 flush 중에 Hibernate가
revision 및 audit 레코드를 기록하도록 한다. JaVers + Exposed repository
경로는 먼저 JaVers commit과 인코딩된 snapshot을 만들고, commit 메타데이터가
이미 존재하는지 확인한 뒤 필요하면 저장하며, 인코딩된 전체 상태와 변경된
속성 메타데이터를 포함하는 snapshot 행을 기록한다.

추가하는 prose에서는 이러한 구현 경로를 순수한 라이브러리 비용 비교와
구분해야 한다. 두 경로 모두 변경 사항을 감사하지만, 저장 모델과 측정된
연산 내부에서 수행하는 작업은 서로 다르다.

## 의사코드 계약

Envers 의사코드는 다음 순서를 보여준다: 트랜잭션 시작, 현재 entity
영속화, Hibernate flush/change detection, revision 및 entity audit 레코드
기록, 커밋.

JaVers 의사코드는 다음 순서를 보여준다: commit 생성, snapshot 인코딩,
트랜잭션 시작, commit 메타데이터 확인, 없으면 메타데이터 삽입, snapshot
필드 삽입, 커밋.

블록 아래의 본문에서는 serialization, 메타데이터 존재 확인, 추가 행, 더 큰
페이로드, JDBC/SQL 실행이 각각 쓰기 경로 비용을 늘릴 수 있음을 설명한다.
또한 aggregate 영속화는 별도의 DDD 경로에서만 추가되는 단계이며
repository-only 벤치마크 경로에는 포함되지 않는다는 점도 설명한다.

## 검증

- 모든 의사코드 주장을 벤치마크 구현과 연결된 두 소스 클래스에 대조하여
  검증한다.
- 한국어와 영어의 heading, 주장, source-link, 표 패리티를 검증한다.
- `git diff --check`, 사이트 빌드, 두 글의 라우트 검사를 실행한다.
- 기존 PR을 merge하거나 배포하지 않고 갱신한다.
