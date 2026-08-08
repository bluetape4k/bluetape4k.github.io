# Cache Part 2 교정

## 배경

이전 교정 stack을 merge하고 sync한 뒤 다음 글은 Near Cache benchmark 글이었다.

## 결정

benchmark 표, source link, drawer/warehouse metaphor를 유지한다. remote-cache cost, invalidation semantics, benchmark 해석 주변만 작게 수정한다.

## 결과

한국어 글이 remote access cost와 Pub/Sub invalidation을 더 자연스럽게 설명한다. 영어 글도 remote access, invalidation, benchmark environment 해석을 더 직접적으로 표현한다.

## 검증

- `git diff --check`
- `npm run build`

## 향후 가이드

Near Cache 글의 benchmark 값과 metric 방향은 새로운 source 근거가 바뀌지 않는 한 유지한다. 대부분의 교정 가치는 invalidation과 remote cost 표현을 정확하게 만드는 데 있다.
