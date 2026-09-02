# JaVers Exposed 벤치마크

이 벤치마크는 하나의 로컬 PostgreSQL Testcontainer에서 JaVers, Exposed DDD, Envers의 일부 영속 경로를 비교합니다. 보편적인 순위가 아니라 재현 가능한 릴리스 근거로 사용하십시오.

```bash
./gradlew :benchmark-javers-exposed-benchmark:jmh
```

결과를 비교할 때 backend, JVM, warmup, iteration, dataset 매개변수를 동일하게 유지해야 합니다. [벤치마크 소스](https://github.com/bluetape4k/bluetape4k-javers/tree/6648b73333cb665ecba0340588dbc3556c308a52/benchmark/javers-exposed-benchmark)와 [고정된 결과 산출물](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/docs/benchmark/2026-05-27-javers-exposed-ddd-envers-comparison.json)이 정식 릴리스 경계를 정의합니다.
