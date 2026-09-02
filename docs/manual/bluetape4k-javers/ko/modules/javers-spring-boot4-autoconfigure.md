# JaVers Spring Boot 4 자동 구성

이 모듈은 bluetape4k JaVers repository를 Spring Boot 4에 연결합니다. 애플리케이션이 repository 구성을 직접 만들지 않고 설정 속성과 조건부 bean을 사용하려면 추가합니다.

```kotlin
dependencies {
    implementation(platform("io.github.bluetape4k:bluetape4k-dependencies:2.0.0"))
    implementation("io.github.bluetape4k.javers:javers-spring-boot4-autoconfigure")
}
```

repository 선택과 속성 바인딩은 다음 명령으로 검증합니다.

```bash
./gradlew :javers-spring-boot4-autoconfigure:test
```

정식 계약은 [JaversAutoConfiguration](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/javers-spring-boot4-autoconfigure/src/main/kotlin/io/bluetape4k/javers/autoconfigure/JaversAutoConfiguration.kt)과 [자동 구성 테스트](https://github.com/bluetape4k/bluetape4k-javers/blob/6648b73333cb665ecba0340588dbc3556c308a52/javers-spring-boot4-autoconfigure/src/test/kotlin/io/bluetape4k/javers/autoconfigure/JaversAutoConfigurationTest.kt)에 고정돼 있습니다.
