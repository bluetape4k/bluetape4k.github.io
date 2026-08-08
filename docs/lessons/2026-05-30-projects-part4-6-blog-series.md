# Projects Part 4-6 블로그 시리즈

## 배경

data/infra, utilities/adoption, Spring Boot 4/Ktor application-layer 범위를 다루는 `bluetape4k-projects` blog series issue를 완료했다.

## 결정

시리즈는 bilingual·source-grounded로 유지한다. 새 public asset에는 `bluetape4k-diagram`을 사용한다. 각 module-map diagram에는 SVG+PNG output과 Graphviz `.dot`, `.plain`, sketch SVG/PNG, 작은 graph-vs-final summary를 함께 둔다.

hero figure는 module-map diagram이 아니다. `bluetape4k-projects` series에서는 평면 SVG flow placeholder를 만들지 말고 주변 글의 3D workbench/robot diorama style을 맞춘다.

## 결과

Part 4, 5, 6의 한국어·영어 글을 추가하고 Part 1-3 series navigation을 갱신했으며, `scripts/generate-projects-part4-6-assets.mjs` 아래 reusable asset generation을 추가했다.

Part 4는 기존 cache deep-dive series로 cache 독자를 연결하고, Part 6은 모호한 "quiet foundation" 표현 대신 명시적인 operational closing을 사용한다.

## 검증

- `node --check scripts/generate-projects-part4-6-assets.mjs`
- `node scripts/generate-projects-part4-6-assets.mjs`
- 렌더링된 PNG contact sheet를 검사
- `git diff --check`
- `npm run build`에서 새 한국어·영어 route를 모두 생성
- 새 글 route 6개와 변경 asset의 local preview가 HTTP 200을 반환

## 향후 guard

향후 `bluetape4k.github.io` series 글에서는 새 hero figure를 만들기 전에 기존 hero art를 확인하고 `/assets/...` public path, bilingual route parity, diagram evidence file을 함께 유지한다. 대상 글이 생긴 뒤에도 이전 series 글이 planned link를 가리키도록 두지 않는다.
