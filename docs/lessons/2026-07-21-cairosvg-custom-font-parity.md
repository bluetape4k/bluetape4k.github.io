# Preserve custom-font parity in CairoSVG PNG output

## Context

Clinic Appointment diagrams declare `Architects Daughter` and `Comic Mono`
for English labels, and both fonts are installed on macOS. The source SVGs
rendered correctly in browsers and with librsvg, but direct CairoSVG output
silently substituted fallback fonts. As a result, the published PNG and its
editable SVG did not have the same typography.

## Lesson

Font installation and SVG declarations do not prove raster parity. Compare the
canonical PNG against a renderer that demonstrably resolves the requested font,
and inspect the full-size image for changed line breaks, clipping, and label
collisions.

When direct CairoSVG text rendering substitutes fonts, keep the editable SVG
unchanged and use this pipeline:

1. Render the source SVG to an intermediate SVG with librsvg so text becomes
   resolved glyph paths.
2. Render that outlined SVG to the canonical PNG with CairoSVG.
3. Audit the original SVG for locale-specific font declarations and inspect the
   final PNG at full size.

Do not replace the original SVG with the outlined intermediate. The source must
remain editable, searchable, and localizable.

## Verification used

- `fc-match` confirmed the requested fonts were installed.
- All eight English Clinic Appointment PNGs were regenerated through the
  outlined-SVG pipeline.
- All eight Korean PNGs were retained because they already matched the expected
  goorm Sans and goorm Sans Code rendering.
- XML, text normalization, connector, geometry, endpoint, mixed-corner, font,
  full-size image, test, and site-build checks passed.
