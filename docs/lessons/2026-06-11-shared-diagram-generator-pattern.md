# 공용 다이어그램 생성기 패턴

## 배경

`bluetape4k-*`와 `bluetape-*` 저장소의 diagram generator를 다시 작성하는 작업이 반복되고 있다. Graphviz 근거, 최종 SVG/PNG rendering, font binding, README PNG-only validation, geometry summary, rendered PNG inspection이 같은 형태로 반복되기 때문이다.

검색 keyword: `diagram generator`, `readme-diagrams`, `Graphviz evidence`, `geometry-summary`, `Architects Daughter`, `Comic Mono`, `shortConnectors`, `minConnectorStem`, `bluetape4k-diagram`.

## 근거

workspace의 generator 예시는 다음과 같다.

| Repo | Script |
|---|---|
| `bluetape-go-workshop` | `scripts/generate-*-diagrams.sh` |
| `bluetape-rs-workshop` | `scripts/generate-foundation-diagrams.py` |
| `bluetape4k-leader` | `scripts/generate-example-readme-diagrams.mjs`, `scripts/generate-module-architecture-diagrams.mjs` |
| `bluetape4k-projects` | `scripts/generate-observability-example-diagrams.mjs`, `scripts/generate-reviewed-readme-diagrams.mjs` |
| `bluetape4k.github.io` | `scripts/generate-cache-series-diagrams.mjs` |

## 결정

어떤 `bluetape4k-*` 또는 `bluetape-*` 저장소에서 새 README diagram generator를 작성하기 전에 다음을 수행한다.

1. workspace에서 `scripts/generate-*diagram*`을 검색한다.
2. 가장 가까운 rendered baseline PNG를 확인한다. workshop diagram에서는 특히 `bluetape-go-workshop`을 기준으로 삼는다.
3. 새 repo-local generator를 만들기 전에 기존 generator 구조와 gate를 재사용한다.
4. repo-local customization은 model data와 작은 layout rule로 유지한다.
5. 반복되는 모든 visual review defect를 generator failure로 승격한다.

## 최소 생성기 계약

모든 README node-and-connector generator는 다음을 수행해야 한다.

- rendering 전에 필요한 tool을 탐색한다.
- 필요한 font file을 탐색하고 명시적으로 연결한다.
- Graphviz 근거를 출력한다.
  - `.dot`
  - `.plain`
  - `*-graphviz.svg`
  - `*-graphviz.png`
- 최종 asset을 출력한다.
  - `.svg`
  - `.png`
- README embed는 PNG-only로 유지한다.
- `Inter`, `Arial`, `Helvetica`를 포함한 최종 SVG를 거부한다.
- `geometry-summary.txt` 또는 동등한 tracked summary를 보존한다.
- 최소한 다음 값을 출력한다.
  - `nodes`
  - `routes`
  - `segments`
  - `badEndpointAngle`
  - `badBends`
  - `interiorCrossings`
  - `marginImbalance`
  - `margins=L/R/T/B`
  - `titleGap`
  - `fontFallback`

Flow/card diagram은 다음도 출력하고 gate해야 한다.

- `shortConnectors`
- `minConnectorStem`

direct card-to-card connector의 stem이 README 크기에서 보이지 않을 만큼 짧으면 generator는 실패해야 한다.

## 검증 명령

```bash
python3 scripts/generate-<subject>-diagrams.py
find docs/images/readme-diagrams -name '*.svg' -print0 | xargs -0 -n1 xmllint --noout
find docs/images/readme-diagrams -name '*.svg' -exec sh -c 'test -f "${1%.svg}.png"' sh {} \;
rg 'docs/images/readme-diagrams/.*\.svg' README*.md examples/*/README*.md && exit 1 || true
rg 'Inter|Arial|Helvetica' docs/images/readme-diagrams/*.svg && exit 1 || true
git diff --check
```

## 결과

`bluetape4k-diagram` skill에 `references/shared-diagram-generator-pattern.md`가 생겼고, 향후 diagram 작업에서 GNO가 검색할 수 있도록 동일한 가이드를 이 lesson에도 보존한다.
