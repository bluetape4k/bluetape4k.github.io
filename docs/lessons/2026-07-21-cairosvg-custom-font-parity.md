# Preserve custom-font parity in CairoSVG PNG output

## Context

Clinic Appointment diagrams declare `Architects Daughter` and `Comic Mono`
for English labels, and both fonts are installed on macOS. A sandboxed render
could resolve the font names with `fc-match` but could not write the Fontconfig
cache directories. Both librsvg and direct CairoSVG then silently substituted
fallback fonts. As a result, the published PNG and its editable SVG did not have
the same typography even though the declaration audit passed.

## Lesson

Font installation, `fc-match`, and SVG declarations do not prove raster parity.
Confirm that Fontconfig can use a writable cache, compare actual glyph shapes
with a specimen rendered from the font file, and inspect the full-size image for
changed line breaks, clipping, and label collisions.

When direct CairoSVG text rendering substitutes fonts, keep the editable SVG
unchanged and use this pipeline in an environment where Fontconfig can read and
write its cache:

1. Run `fc-cache -f` for the relevant user font directory and verify the exact
   font files with `fc-match`.
2. Render the source SVG to an intermediate SVG with librsvg so text becomes
   resolved glyph paths.
3. Compare a rendered title and body label with direct specimens of the
   `Architects Daughter` and `Comic Mono` font files.
4. Render that outlined SVG to the canonical PNG with CairoSVG.
5. Audit the original SVG for locale-specific font declarations and inspect the
   final PNG at full size.

Do not replace the original SVG with the outlined intermediate. The source must
remain editable, searchable, and localizable.

## Verification used

- `fc-cache -f` completed with writable cache directories and `fc-match`
  confirmed the requested font files.
- Direct font-file specimens confirmed the expected handwritten title and
  monospace body glyph shapes.
- All eight English Clinic Appointment PNGs were regenerated through the
  outlined-SVG pipeline.
- All eight Korean PNGs were retained because they already matched the expected
  goorm Sans and goorm Sans Code rendering.
- XML, text normalization, connector, geometry, endpoint, mixed-corner, font,
  full-size image, test, and site-build checks passed.
