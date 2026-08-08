# Exposed 블로그 시리즈 한국어 초안

## 배경

epic #85를 위한 `bluetape4k-exposed` 한국어 blog series를 초안으로 작성했다. choice journey, JDBC repository, R2DBC/coroutines/virtual threads, JSON과 dialect, production example을 다룬다.

## 결정

처음 배포는 한국어만 유지하고 한국어 원고를 review할 때까지 영어 버전은 추가하지 않는다. 시리즈는 저자의 Exposed note처럼 library나 extension이 필요한 이유에서 시작해 code, benchmark 근거, selection rule로 이어져야 한다.

각 편마다 서로 다른 3D workbench/robot hero figure를 사용한다. 본문 diagram과 chart에는 최종 PNG/SVG asset과 함께 source/evidence artifact를 둔다.

## 결과

source link, benchmark chart, Graphviz 기반 diagram, series navigation이 있는 한국어 글 다섯 편을 추가했다. Part 5는 피해야 할 failure만 설명하는 대신 Exposed를 사용해 performance를 높이고 cache strategy, multitenancy, outbox/idempotency를 더 쉽게 구현하는 방향으로 재구성했다.

## 검증

- `git diff --check`
- `npm run build`
- Part 5 local route에서 새 framing text와 기존 "which failure is this preventing" phrase가 없는지 확인했다.

## 향후 guard

영어 버전을 추가할 때 review된 한국어 글에서 번역하고 route parity를 유지한다. 앞으로 Exposed 글을 쓸 때는 source README/example과 benchmark result를 먼저 확인하고, detached third-party review tone을 피한다.
