# Wave 2 visual companion assets

Generated source-backed assets for Epic #413, wave 2, and its linked follow-up visual issues. Each delivery issue keeps its own interactive route and locale-matched static assets.

| Issue | English | 한국어 | Interactive |
| --- | --- | --- | --- |
| #417 | [SVG](/assets/visual-companions/wave2/aws-streams-shard-consumers-en.svg) · [PNG](/assets/visual-companions/wave2/aws-streams-shard-consumers-en.png) | [SVG](/assets/visual-companions/wave2/aws-streams-shard-consumers-ko.svg) · [PNG](/assets/visual-companions/wave2/aws-streams-shard-consumers-ko.png) | [EN](/visual-companions/bluetape4k-aws/aws-streams-shard-consumers/) · [KO](/ko/visual-companions/bluetape4k-aws/aws-streams-shard-consumers/) |
| #418 | [SVG](/assets/visual-companions/wave2/projects-netcdf-cf-progress-en.svg) · [PNG](/assets/visual-companions/wave2/projects-netcdf-cf-progress-en.png) | [SVG](/assets/visual-companions/wave2/projects-netcdf-cf-progress-ko.svg) · [PNG](/assets/visual-companions/wave2/projects-netcdf-cf-progress-ko.png) | [EN](/visual-companions/bluetape4k-projects/projects-netcdf-cf-progress/) · [KO](/ko/visual-companions/bluetape4k-projects/projects-netcdf-cf-progress/) |
| #426 | [SVG](/assets/visual-companions/wave2/projects-netcdf-data-model-en.svg) · [PNG](/assets/visual-companions/wave2/projects-netcdf-data-model-en.png) | [SVG](/assets/visual-companions/wave2/projects-netcdf-data-model-ko.svg) · [PNG](/assets/visual-companions/wave2/projects-netcdf-data-model-ko.png) | [EN](/visual-companions/bluetape4k-projects/projects-netcdf-data-model/) · [KO](/ko/visual-companions/bluetape4k-projects/projects-netcdf-data-model/) |
| #430 | [SVG](/assets/visual-companions/wave2/projects-coroutines-flow-operators-en.svg) · [PNG](/assets/visual-companions/wave2/projects-coroutines-flow-operators-en.png) | [SVG](/assets/visual-companions/wave2/projects-coroutines-flow-operators-ko.svg) · [PNG](/assets/visual-companions/wave2/projects-coroutines-flow-operators-ko.png) | [EN](/visual-companions/bluetape4k-projects/projects-coroutines-flow-operators/) · [KO](/ko/visual-companions/bluetape4k-projects/projects-coroutines-flow-operators/) |

![AWS Streams shard consumers (EN)](./aws-streams-shard-consumers-en.png)
![AWS Streams shard consumers (KO)](./aws-streams-shard-consumers-ko.png)

![Projects NetCDF CF progress (EN)](./projects-netcdf-cf-progress-en.png)
![Projects NetCDF CF progress (KO)](./projects-netcdf-cf-progress-ko.png)

![Projects NetCDF data model (EN)](./projects-netcdf-data-model-en.png)
![Projects NetCDF data model (KO)](./projects-netcdf-data-model-ko.png)

![Projects Coroutines Flow operators (EN)](./projects-coroutines-flow-operators-en.png)
![Projects Coroutines Flow operators (KO)](./projects-coroutines-flow-operators-ko.png)

Regenerate Issue #417 SVG and semantic ledgers with `node scripts/generate-2-0-wave2-visuals.mjs`; regenerate Issue #418 with `node scripts/generate-2-0-wave2-projects-netcdf-visuals.mjs`; regenerate Issue #426 with `node scripts/generate-2-0-wave2-projects-netcdf-data-model-visuals.mjs`; regenerate Issue #430 with `node scripts/generate-2-0-wave2-projects-coroutines-flow-operators-interactive.mjs` and `node scripts/generate-2-0-wave2-projects-coroutines-flow-operators-visuals.mjs`. PNG files are rendered from the generated SVG files at 2x resolution.
