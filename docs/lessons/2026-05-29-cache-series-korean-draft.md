# Cache 시리즈 한국어 초안

## 배경

`bluetape4k.github.io`의 cache blog series를 한국어 우선으로 작성했다. cache module overview, Near Cache, Exposed strategies, workshop examples를 다룬다.

## 결정

첫 번째 pass는 `src/content/docs/ko/blog/`에만 둔다. 한국어 원고를 review하기 전에는 영어 default-locale 글을 추가하지 않는다.

hero 기준은 기존 blog와 root README hero style을 사용한다. miniature workshop desk, blue blueprint mat, taped module block, robot worker를 유지하며 human-like worker variant는 제외한다.

## 결과

전용 hero figure, Graphviz 기반 본문 diagram/chart, code snippet, develop-branch source link, 하단 series link가 있는 한국어 글 네 편을 추가했다.

첫 렌더 diagram batch는 raw Graphviz output과 너무 비슷했고 routing/label 결함이 보였다. 최종 batch는 `scripts/generate-cache-series-diagrams.mjs`로 `.dot`, `.plain`, `-sketch.svg` 근거를 보존하면서 글용 SVG/PNG asset을 수작업으로 다듬는다.

review에서 semantic issue도 발견했다. Part 3은 진짜 read-through/write-through/write-behind를 보여주기 위해 `JdbcCacheRepository`/`AbstractJdbcRedissonRepository`와 `exposed-workshop` chapter 11 예제를 사용해야 한다. `bluetape4k-workshop`의 cache-aside 방식 PUT 관리 예제를 write-through 사례로 사용하지 않는다. workshop 후속 작업은 `bluetape4k-workshop#246`으로 추적한다.

## 검증

- `npm run build`
- `git diff --check`
- 렌더링 후 다섯 본문 diagram의 PNG를 수동으로 검사했다.
- Part 2, Part 3, Part 4에 로컬 source report에서 가져온 benchmark 표/chart를 추가했다.
- 네 개 `/ko/blog/bluetape4k-cache-part*/` local preview route를 확인했다. 모두 `status=200`, hero image 존재, 예상 diagram count였다.

## 향후 guard

영어 버전을 작성할 때 review된 한국어 file에서 `src/content/docs/blog/`로 자연스럽게 옮기고 hero/image parity를 유지한다. 한국어 본문을 default locale의 placeholder로 복사하지 않는다.

앞으로 blog diagram batch에서는 Graphviz PNG output을 최종 asset으로 취급하지 않는다. Graphviz는 route 근거로 보존하고, diagram set이 준비됐다고 말하기 전에 렌더링된 PNG를 검사한다.
