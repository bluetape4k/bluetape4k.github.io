# Virtual Threads Part 4 Proofread

## Context

The chronological proofreading stack reached the final Virtual Threads series
post about Java 21/25 SPI design.

## Decision

Preserve the API/SPI explanation and code examples. Improve Korean localization,
Korean series routes, and phrasing around runtime providers, fallback, and
classpath boundaries. Keep English edits minimal and focused on clarity.

## Outcome

The Korean post now uses Korean metadata and `/ko/blog/...` series navigation.
The SPI explanation reads more naturally without changing the public API,
ServiceLoader, or provider-selection semantics. The English post has a clearer
compile-classpath sentence.

## Verification

- `git diff --check`
- `npm run build`

## Future Guidance

For API/SPI design posts, keep compile-time API, runtime provider, and fallback
boundaries explicit. Naturalness edits should not blur which layer owns each
JDK-specific detail.
