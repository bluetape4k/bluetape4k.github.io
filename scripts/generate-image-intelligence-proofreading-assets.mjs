import { spawnSync } from "node:child_process";

const stems = [
  "public/assets/blog/image-intelligence/part1/image-intelligence-processing-flow-01",
  "public/assets/blog/image-intelligence/part1/image-intelligence-visitor-pass-overlay-02",
  "public/assets/blog/image-intelligence/part1/image-intelligence-result-contracts-03",
  "public/assets/blog/image-intelligence/part2/image-intelligence-qualification-flow-01",
  "public/assets/blog/image-intelligence/part2/image-intelligence-single-decode-02",
];

for (const stem of stems) {
  for (const locale of ["en", "ko"]) {
    const svg = `${stem}-${locale}.svg`;
    const png = `${stem}-${locale}.png`;
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

console.log(`Generated ${stems.length * 2} image-intelligence diagram PNGs.`);
