# Booking reliability article diagram source ledger

These assets explain the responsibility and decision boundaries described in
the bilingual clinic appointment article. The rendered PNG is a reading aid;
the implementation and approved design remain the source of truth.

## Sources

- Approved design: `clinic-appointment/docs/superpowers/specs/2026-08-01-issue-176-booking-reliability-design.md`
- Approved waitlist boundary: `clinic-appointment/docs/superpowers/specs/2026-08-01-issue-170-waitlist-core-design.md`
- Current booking reliability evaluator: `clinic-appointment/appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/service/reliability/BookingReliabilityEvaluator.kt`
- Current gate: `clinic-appointment/appointment-api/src/main/kotlin/io/bluetape4k/clinic/appointment/api/commitment/BookingEligibilityGate.kt`
- API contract: `clinic-appointment/docs/api/booking-reliability.md`
- Waitlist contract: `clinic-appointment/docs/api/waitlist-delivery.md`

The upstream sources are linked from the article's evidence section. The
ledger is intentionally kept in this repository so every SVG can be audited
against the same reader question and source revision. In reader-facing labels,
“policy snapshot” is phrased as “effective policy” or “policy version”; the
implementation identifier remains unchanged.
