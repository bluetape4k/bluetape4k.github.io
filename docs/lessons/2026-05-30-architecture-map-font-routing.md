# 아키텍처 지도 글꼴 및 routing 수정

## 배경

public homepage가 `public/assets/bluetape4k-architecture-map.svg`에서 `bluetape4k-diagram` visual language 대신 `Inter, Arial, sans-serif` inline font family를 사용하고 있었다.

## 결정

title과 주요 card label에는 `Architects Daughter`, subtitle과 detail text에는 `Comic Mono`를 사용한다. asset을 수정하면서 arrowhead가 target node boundary가 아니라 diagram 중간에서 끝나던 connector route도 고친다.

## 결과

Architecture Position Map이 표준 diagram font와 명시적인 orthogonal connector lane을 사용한다. 아래쪽 `Foundation Modules` 및 `Example Applications` connector는 중간 좌표가 아니라 `Application Runtime` card에서 끝난다.

후속 layout review에서는 `Application Runtime`을 상단 hub에서 map의 시각적 중심으로 옮겼다. 네 service-layer family를 runtime card 주변에 배치해 Kotlin backend application이 runtime layer를 통해 edge, persistence, integration, operations library를 조합한다는 의도된 mental model을 더 잘 표현한다.

## 검증

- `xmllint --noout public/assets/bluetape4k-architecture-map.svg`
- SVG에 남은 `Inter, Arial` 또는 `font-family="Inter"` 0개
- 렌더링된 PNG를 시각적으로 검사
- `npm run build`
- center-hub layout 변경 후 PNG를 다시 검사하고, `Operations` card 내부를 가로지르지 않도록 아래 connector lane을 카드 아래로 옮겼다.
