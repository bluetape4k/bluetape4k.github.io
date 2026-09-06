---
manualId: "testing-and-operations"
title: "Testing and Operations"
locale: "en"
releaseRef: "1.0.0"
---

# Testing and Operations

Test the boundary the deployment actually uses. A pure JVM unit test cannot prove host Tesseract, system libvips, S3 credentials, or filesystem permissions.

## Test pyramid

1. Unit-test transformations, validation, CAPTCHA state, and storage policy with small deterministic fixtures.
2. Use golden images or numeric similarity assertions for visual operations. Avoid byte-for-byte comparisons when encoder metadata is nondeterministic.
3. Run module tests for the selected framework path.
4. Run host-native OCR and libvips checks sequentially on a runner with the required packages.
5. Smoke-test storage and CDN configuration in the deployment environment.

Representative commands:

    ./gradlew :bluetape4k-images:test
    ./gradlew :bluetape4k-images-ocr:test -Docr.enabled=true
    ./gradlew :bluetape4k-images-vips-java21:test

## Operational signals

Measure input bytes, decoded dimensions, processing duration, output bytes, failure category, queue depth, and storage latency. Spring Boot integration can contribute health and metrics, but application-level dimensions and alert thresholds remain local decisions.

## Capacity and isolation

Bound request size before decode. Limit concurrent OCR and native work rather than allowing an unbounded coroutine fanout. Separate benchmark jobs and native test jobs from normal fast CI when their host requirements differ, but keep a scheduled path that proves them.

## Diagram provenance

The manual diagrams use the SVG source in `scripts/manual/render_image_diagrams.rb` and a controlled `rsvg-convert` delivery profile. [`diagram-provenance.yaml`](../../diagram-provenance.yaml) records the renderer version, requested and resolved font inventory, execution environment, source and PNG SHA-256 values, dimensions, color/alpha metadata, and content fingerprints for each of the five SVG/PNG pairs. Each asset keeps both the tracked PNG baseline and a rendered receipt from the recorded toolchain; the receipt is never inferred from the tracked file after the fact.

Run the provenance check before publishing a manual change:

    ruby -I scripts/manual scripts/manual/diagram_provenance_test.rb
    ruby scripts/manual/verify_diagram_provenance.rb
    ruby scripts/manual/render_image_diagrams.rb --output-root build/manual/diagram-render
    ruby scripts/manual/validate_diagrams.rb

The verifier renders the source twice in an isolated directory, requires equal PNG SHA-256 values, and compares that output with the recorded render receipt. It also validates the tracked baseline's content fingerprint, so a same-sized swapped or unrelated PNG fails. The tracked baseline uses the semantic-fingerprint mode because PNG bytes produced by a different renderer, font inventory, operating system, or architecture are not portable; tracked-versus-receipt byte or semantic differences are therefore intentional, non-failing notes in this mode, while renderer and font drift fail with a diagnostic for the recorded delivery profile. `--write-manifest` performs this isolated render before writing a manifest and records the receipt separately from the tracked baseline.

## Release discipline

This manual targets 1.0.0. Tests and source links must stay on that release commit. A green develop build cannot prove a frozen manual example.

The Pages `Build` job is the primary stable-manual provenance gate. It reads the latest Image `releaseRef` from the committed catalog, resolves that exact GitHub release and peeled tag commit, and requires the result to equal the catalog's `releaseCommit`. The same job validates the committed snapshot, locale parity, manifests, redirects, and generated content before deployment.

    npm run check:manual -- --verify-release-provenance bluetape4k-image --report build/manual-validation.json

`RELEASE_TAG_MISMATCH` means the GitHub release no longer names the catalog's exact tag. `RELEASE_MOVED` means that tag resolves to a different commit. Repository identity and GitHub request failures also fail closed. Do not update `releaseCommit` merely to accept a moved tag. Restore the immutable release reference, or publish and sync a new stable patch release when the source change is intentional, then rerun Pages `Build`.

The Image source repository keeps a small local contract: `MANUAL_TAG` must resolve to a commit and the tag-driven generator inputs must remain valid. It does not check out the Pages repository or repeat the full manual drift suite, so catalog-only source changes stay on the fast CI path. Full inventory and generated-content drift belong to the central manual tooling and Pages deployment gate.

## Sources

- [Release test configuration](https://github.com/bluetape4k/bluetape4k-image/blob/b38d4891b66dff8bc63db0018b5e41810d1da9bc/build.gradle.kts)
- [Spring Boot health and metrics module](https://github.com/bluetape4k/bluetape4k-image/tree/b38d4891b66dff8bc63db0018b5e41810d1da9bc/images-spring-boot/src/main/kotlin/io/bluetape4k/images/spring)
