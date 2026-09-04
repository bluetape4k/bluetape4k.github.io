# Wave 2 visual companion assets

Generated source-backed assets for Epic #413, wave 2. Each delivery issue keeps its own interactive route and locale-matched static assets.

| Issue | English | 한국어 | Interactive |
| --- | --- | --- | --- |
| #417 | [SVG](/assets/visual-companions/wave2/aws-streams-shard-consumers-en.svg) · [PNG](/assets/visual-companions/wave2/aws-streams-shard-consumers-en.png) | [SVG](/assets/visual-companions/wave2/aws-streams-shard-consumers-ko.svg) · [PNG](/assets/visual-companions/wave2/aws-streams-shard-consumers-ko.png) | [EN](/visual-companions/bluetape4k-aws/aws-streams-shard-consumers/) · [KO](/ko/visual-companions/bluetape4k-aws/aws-streams-shard-consumers/) |
| #418 | [SVG](/assets/visual-companions/wave2/projects-netcdf-cf-progress-en.svg) · [PNG](/assets/visual-companions/wave2/projects-netcdf-cf-progress-en.png) | [SVG](/assets/visual-companions/wave2/projects-netcdf-cf-progress-ko.svg) · [PNG](/assets/visual-companions/wave2/projects-netcdf-cf-progress-ko.png) | [EN](/visual-companions/bluetape4k-projects/projects-netcdf-cf-progress/) · [KO](/ko/visual-companions/bluetape4k-projects/projects-netcdf-cf-progress/) |

![AWS Streams shard consumers (EN)](./aws-streams-shard-consumers-en.png)
![AWS Streams shard consumers (KO)](./aws-streams-shard-consumers-ko.png)

![Projects NetCDF CF progress (EN)](./projects-netcdf-cf-progress-en.png)
![Projects NetCDF CF progress (KO)](./projects-netcdf-cf-progress-ko.png)

Regenerate Issue #417 SVG and semantic ledgers with `node scripts/generate-2-0-wave2-visuals.mjs`; regenerate Issue #418 with `node scripts/generate-2-0-wave2-projects-netcdf-visuals.mjs`. PNG files are rendered from the generated SVG files at 2x resolution.
