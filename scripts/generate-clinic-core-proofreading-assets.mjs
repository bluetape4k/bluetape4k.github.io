import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const stems = [
  "clinic-appointment-part2-state-machine-history-01",
  "clinic-appointment-part3-availability-pipeline-01",
  "clinic-appointment-part3-availability-sequence-02",
  "clinic-appointment-part4-scheduling-choice-map-01",
  "clinic-appointment-part4-closure-reschedule-sequence-02",
];

const localizedStateFlow =
  "public/assets/clinic-appointment-part2-state-machine-history-01-ko.svg";

const stateFlowReplacements = new Map([
  [">Controller<", ">컨트롤러<"],
  [">State machine<", ">상태 머신<"],
  [">Database transaction<", ">데이터베이스 트랜잭션<"],
  [">Domain event<", ">도메인 이벤트<"],
  [
    ">History: fromState | toState | reason | note | changedBy | changedAt   /   newest first: changedAt DESC, id DESC<",
    ">변경 이력: fromState | toState | reason | note | changedBy | changedAt   /   최신순: changedAt DESC, id DESC<",
  ],
]);

let localized = readFileSync(localizedStateFlow, "utf8");
for (const [source, target] of stateFlowReplacements) {
  localized = localized.replaceAll(source, target);
}
writeFileSync(localizedStateFlow, localized);

const pipelineReplacements = new Map([
  [
    "public/assets/clinic-appointment-part3-availability-pipeline-01-ko.svg",
    [
      "모든 조건을 통과한 시간만 반환",
      "현재 구현의 조건을 통과한 시간만 반환",
    ],
  ],
  [
    "public/assets/clinic-appointment-part3-availability-pipeline-01-en.svg",
    [
      "Return only candidates that pass every check",
      "Return candidates that pass the current checks",
    ],
  ],
]);

for (const [path, [source, target]] of pipelineReplacements) {
  const svg = readFileSync(path, "utf8").replaceAll(source, target);
  writeFileSync(path, svg);
}

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

console.log(`Generated ${stems.length * 2} localized clinic diagram PNGs.`);
