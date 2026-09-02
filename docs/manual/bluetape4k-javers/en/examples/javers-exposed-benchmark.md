# JaVers Exposed benchmark

This benchmark compares selected JaVers, Exposed DDD, and Envers persistence paths under one local PostgreSQL Testcontainer. Treat it as reproducible release evidence, not a universal ranking.

```bash
./gradlew :benchmark-javers-exposed-benchmark:jmh
```

Keep backend, JVM, warmup, iteration, and dataset parameters unchanged when comparing results. The [benchmark sources](https://github.com/bluetape4k/bluetape4k-javers/tree/6648b73333cb665ecba0340588dbc3556c308a52/benchmark/javers-exposed-benchmark) and [pinned result artifact](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/docs/benchmark/2026-05-27-javers-exposed-ddd-envers-comparison.json) define the release boundary.
