# GraphDB 도입 블로그

## 배경

graph benchmark PR은 좁지만 분명한 도입 신호를 만들었다. Neo4j는 긴 authorization inheritance 대형 행에서 이겼고, PostgreSQL CTE는 deep-wide 작업에서 여전히 이겼다. AGE는 두 대형 도입 시나리오에서 timeout이 발생했고, Memgraph는 smoke parity 이후 로컬 대형 fixture load 중 실패했다.

## 결정

graph benchmark PR을 merge하기 전에 웹사이트 글을 작성하되 별도의 웹사이트 PR로 게시한다. 그러면 글의 시점을 최신으로 유지하면서도 benchmark PR이 들어온 뒤 최종 link를 안정화할 수 있다.

## 결과

언제 backend service가 GraphDB를 도입해야 하는지를 다루는 영어·한국어 글을 추가했다. benchmark 결과를 사용해 적합한 GraphDB 후보와 일반적인 relational workload를 구분했다. 글의 끝에는 cache-assisted traversal, materialized view, incremental graph projection, candidate pruning, online/offline split, correctness validation, operational-cost measurement를 포함한 hybrid performance 개선 TODO를 남겼다.

## 검증

- `npm run build`

## 다음 작업

benchmark 기반 public 글에는 실패한 후보도 주 표에 포함한다. timeout과 load failure는 각주가 아니라 도입 근거의 일부다.

## 후속 조치

첫 게시 버전은 근거가 충분했지만 너무 추상적이었다. library feature를 설명할 때는 최소 하나의 코드 형태 예제를 추가하고 실행 가능한 workshop 예제로 연결한다. 독자가 결론에서 실행 가능한 사용법으로 이동할 수 있을 때 benchmark 해석이 더 강해진다.

비교한 접근 방식의 pseudocode도 나란히 보여준다. GraphDB benchmark 글에서는 native Cypher, JDBC recursive CTE, JDBC iterative traversal을 함께 제시해 비교 대상이 제품 이름만이 아니라 실행 형태임을 보여준다.
