# bluetape4k 공식 웹사이트

이 저장소는 <https://bluetape4k.github.io>에서 제공하는 bluetape4k 공식 웹사이트를 관리합니다.

<!-- README_VISUAL_OVERVIEW:START -->
## 개요 다이어그램

![Bluetape4k 웹사이트 개요 다이어그램](docs/images/readme-diagrams/root-readme-overview-01.png)

## 모듈 구성 차트

![Bluetape4k 웹사이트 모듈 구성 차트](docs/images/readme-charts/root-readme-module-chart-01.png)
<!-- README_VISUAL_OVERVIEW:END -->

## 개발

```bash
npm install
npm run dev
```

## 분석

이 사이트는 페이지 단위 트래픽을 개인정보 친화적으로 측정하기 위해 Cloudflare Web Analytics를 사용합니다.
`/blog/`와 `/ko/blog/` 아래의 블로그 경로, `/visual-companions/`와
`/ko/visual-companions/` 아래의 독립적인 Visual Companion 경로도 포함됩니다. Astro는 Starlight 페이지에
beacon을 주입하고, 프로덕션 빌드는 독립적인 Visual Companion HTML에도 같은 beacon을 추가합니다.

기본값:

- Beacon token: `a9408513fe144222b89e86151b26e70f`
- Script URL: `https://static.cloudflareinsights.com/beacon.min.js`

필요하면 Cloudflare Web Analytics snippet token을 재정의할 수 있습니다.

```bash
PUBLIC_CLOUDFLARE_BEACON_TOKEN=example-snippet-token npm run build
```

Cloudflare가 snippet source를 변경한 경우에만 beacon script URL을 재정의하세요.

```bash
PUBLIC_CLOUDFLARE_BEACON_TOKEN=example-snippet-token \
PUBLIC_CLOUDFLARE_BEACON_SCRIPT_URL=https://static.cloudflareinsights.com/beacon.min.js \
npm run build
```

## 검증

```bash
npm run build
```
