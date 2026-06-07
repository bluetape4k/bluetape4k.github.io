# bluetape4k official website

This repository hosts the official bluetape4k website at <https://bluetape4k.github.io>.

<!-- README_VISUAL_OVERVIEW:START -->
## Overview Diagram

![Bluetape4k Website overview diagram](docs/images/readme-diagrams/root-readme-overview-01.png)

## Module Composition Chart

![Bluetape4k Website module composition chart](docs/images/readme-charts/root-readme-module-chart-01.png)
<!-- README_VISUAL_OVERVIEW:END -->

## Development

```bash
npm install
npm run dev
```

## Analytics

The site includes Cloudflare Web Analytics for privacy-friendly page-level
traffic, including blog paths under `/blog/` and `/ko/blog/`.

Defaults:

- Beacon token: `a9408513fe144222b89e86151b26e70f`
- Script URL: `https://static.cloudflareinsights.com/beacon.min.js`

Override the Cloudflare Web Analytics snippet token when needed:

```bash
PUBLIC_CLOUDFLARE_BEACON_TOKEN=example-snippet-token npm run build
```

Override the beacon script URL only when Cloudflare changes the snippet source:

```bash
PUBLIC_CLOUDFLARE_BEACON_TOKEN=example-snippet-token \
PUBLIC_CLOUDFLARE_BEACON_SCRIPT_URL=https://static.cloudflareinsights.com/beacon.min.js \
npm run build
```

## Verification

```bash
npm run build
```
