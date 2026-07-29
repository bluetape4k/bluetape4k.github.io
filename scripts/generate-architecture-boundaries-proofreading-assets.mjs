import { spawnSync } from "node:child_process";

const stems = [
  "bluetape4k-javers-part4-audit-cost-map-01",
  "bluetape4k-javers-part4-benchmark-paths-01",
  "bluetape4k-javers-part4-metadata-indexes-01",
  "spring-modulith-publications-vs-outbox-interaction-01",
  "exposed-r2dbc-webflux-request-context-01",
  "exposed-r2dbc-tenant-onboarding-01",
  "exposed-r2dbc-ktor-webflux-carrier-map-01",
];

for (const stem of stems) {
  for (const locale of ["en", "ko"]) {
    const svg = `public/assets/${stem}-${locale}.svg`;
    const png = `public/assets/${stem}-${locale}.png`;
    const result = spawnSync("cairosvg", [svg, "-o", png, "-s", "2"], {
      encoding: "utf8",
    });
    if (result.status !== 0) {
      throw new Error(
        `CairoSVG failed for ${svg}: ${result.stderr || result.stdout}`,
      );
    }
  }
}

console.log(
  `Generated ${stems.length * 2} architecture-boundary diagram PNGs.`,
);
