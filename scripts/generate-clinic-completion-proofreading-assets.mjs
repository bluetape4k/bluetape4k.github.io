import { spawnSync } from "node:child_process";

const stems = [
  "clinic-appointment-part6-rescheduling-flow-01",
  "timefold-workshop-planning-model-comparison-01",
  "timefold-workshop-solver-persistence-sequence-02",
  "clinic-appointment-part7-development-loop-01",
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

console.log(`Generated ${stems.length * 2} clinic completion diagram PNGs.`);
