---
title: "순수 JVM에서 libvips까지: bluetape4k 이미지 처리 벤치마크"
description: bluetape4k-image의 순수 JVM scrimage 경로와 libvips Java 25 FFM 경로를 벤치마크 결과, Java 21 JNI의 호스트 제약, 워크숍 이미지 처리 예제와 함께 살펴봅니다.
sidebar:
  order: -202605282307
blog:
  date: 2026-05-28T23:07:00+09:00
  image: /assets/image-processing-hero.png
  imageAlt: JVM 픽셀 처리에서 네이티브 가속으로 이어지는 이미지 처리 흐름을 보여 주는 일러스트
  cardDescription: scrimage와 libvips 벤치마크, Java 21 JNI의 호스트 제약, Java 25 FFM 실측값, 워크숍 파생 이미지 처리 예제를 정리합니다.
---

<figure class="bt4k-blog-hero">
  <img src="/assets/image-processing-hero.png" alt="JVM 픽셀 처리에서 네이티브 가속으로 이어지는 이미지 처리 흐름을 보여 주는 일러스트" loading="eager" />
  <figcaption>이미지 백엔드를 고르면 CPU 시간과 메모리 사용량, 배포 방식, 운영 위험이 함께 달라집니다.</figcaption>
</figure>

<p class="bt4k-post-meta">2026-05-28 · bluetape4k 이미지 벤치마크 노트</p>

`bluetape4k-image`는 이미지 처리를 두 경로로 제공합니다. 하나는 순수 JVM 기반의 `scrimage` 경로이고,
다른 하나는 네이티브 `libvips`를 사용하는 고성능 경로입니다.

둘 중 하나가 언제나 정답인 것은 아닙니다. `scrimage`는 배포가 단순하고 네이티브 의존성이 없습니다. 반면 썸네일,
축소, 인코딩을 대량으로 처리할 때는 `libvips`의 수요 기반 처리 파이프라인이 유리합니다.

이 글은 `images-benchmark` 결과를 바탕으로 다음 질문에 답합니다.

- 순수 JVM 기준선과 네이티브 파이프라인의 성능 차이는 어느 정도인가?
- Java 21 JNI와 Java 25 FFM 백엔드는 어떻게 해석해야 하는가?
- 실제 서비스 처리 흐름에서는 이 차이가 어디에서 중요한가?

<figure class="bt4k-chart" data-diagram-title="자연 사진 처리에서 scrimage와 libvips의 처리 시간 비교">
  <img src="/assets/image-processing-benchmark-summary-01-ko.png" alt="자연 사진을 처리할 때 scrimage 순수 JVM 경로와 libvips Java 25 FFM 경로의 처리 시간을 비교한 차트" loading="lazy" />
  <figcaption>scrimage와 libvips 벤치마크, Java 21 JNI의 호스트 제약, Java 25 FFM 실측값, 워크숍 파생 이미지 처리 예제를 함께 살펴봅니다.</figcaption>
</figure>

## 벤치마크 구성

벤치마크는 `bluetape4k-image`의 `images-benchmark` 모듈에서 실행합니다. Gradle 태스크는
`kotlinx-benchmark`가 생성한 `benchmarkBenchmark`를 사용합니다.

```bash
./gradlew :bluetape4k-images-benchmark:benchmarkBenchmark \
  -Pvips.impl=java25 --console=plain
```

측정값은 JMH `AverageTime`이고 단위는 `ms/op`입니다. 낮을수록 좋습니다.

이번 글에서 사용하는 macOS Java 25 결과는 다음 보고서에 기록되어 있습니다.

- [Image Processing JMH Benchmark Results - 2026-05-28 Natural Photos](https://github.com/bluetape4k/bluetape4k-image/blob/develop/benchmark/images-benchmark/docs/benchmark-results-2026-05-28-natural-photos.md)
- [Vips Backend Comparison Benchmark](https://github.com/bluetape4k/bluetape4k-image/blob/develop/benchmark/images-benchmark/docs/vips-backend-comparison.md)

## 입력 이미지가 결과를 바꾼다

이번 벤치마크에서는 숫자보다 입력 이미지를 먼저 봐야 합니다. 이전 대표 수치는 단색 합성
대체 이미지로 측정했기 때문에 실제 사진의 질감, 노이즈, 색차 변화에서 발생하는 코덱 비용을
대표하기 어려웠습니다.

이번 실행에서는 `bluetape4k-image/images/src/test/resources/images/`의 자연 사진 픽스처를
`images-benchmark/src/main/resources/bench/`로 복사해 클래스패스 리소스로 포함한 뒤, 같은
벤치마크를 다시 실행했습니다.

| `cafe.jpg` | `landscape.jpg` |
|---|---|
| <img class="bt4k-screenshot" src="/assets/image-benchmark-input-cafe.jpg" alt="카페 벤치마크 입력 이미지" loading="lazy" /> | <img class="bt4k-screenshot" src="/assets/image-benchmark-input-landscape.jpg" alt="풍경 벤치마크 입력 이미지" loading="lazy" /> |
| 4032x3024 JPEG, 2.9 MiB | 4032x3024 JPEG, 3.4 MiB |

이 수치도 모든 이미지에 적용되는 일반 법칙은 아닙니다. 자연 사진 JPEG 두 장에 대한 결과입니다. 문서 스캔,
평면 그래픽, 애니메이션 이미지, 작은 UI 자산은 디코딩·축소·인코딩 비용 구조가 다를 수 있습니다.
그래도 단색 대체 이미지보다는 실제 사진 처리 파이프라인의 의사결정에 가까운 기준점입니다.

## 같은 작업, 두 가지 처리 경로

축소 벤치마크는 `cafe`와 `landscape` 자연 사진 픽스처를 같은 방식으로 처리합니다.

```kotlin
@Benchmark
fun scrimage_scaleTo(state: VipsBenchmarkState, bh: Blackhole) {
    val resized = BenchmarkImageSets.naturalPhoto(state.imageName)
        .scaleTo(targetWidth, targetHeight)
    bh.consume(resized)
}

@Benchmark
fun vips_resize(state: VipsBenchmarkState, bh: Blackhole) {
    if (!state.vipsAvailable) {
        bh.consume(null)
        return
    }
    state.createVipsImage(state.photo4kJpegBytes).use { img ->
        val resized = img.resize(targetWidth, targetHeight)
        bh.consume(resized)
    }
}
```

전체 소스:
[ImageResizeBenchmark.kt](https://github.com/bluetape4k/bluetape4k-image/blob/develop/benchmark/images-benchmark/src/benchmark/kotlin/io/bluetape4k/images/benchmark/ImageResizeBenchmark.kt)

차이는 축소 작업에서 가장 크게 나타납니다.

| 작업 | 입력 | scrimage | libvips Java 25 FFM | 상대 속도 |
|---|---|---:|---:|---:|
| 4K → 1920×1080 축소 | cafe | 114.89 ms/op | 0.257 ms/op | 446배 빠름 |
| 4K → 1920×1080 축소 | landscape | 115.64 ms/op | 0.244 ms/op | 473배 빠름 |
| JPEG 인코딩 | cafe | 137.95 ms/op | 58.35 ms/op | 2.4배 빠름 |
| JPEG 인코딩 | landscape | 144.96 ms/op | 46.75 ms/op | 3.1배 빠름 |
| PNG 인코딩 | cafe | 884.10 ms/op | 585.29 ms/op | 1.5배 빠름 |
| PNG 인코딩 | landscape | 989.37 ms/op | 546.39 ms/op | 1.8배 빠름 |

`scrimage`는 JVM 안에서 `BufferedImage` 중심으로 전체 이미지를 다룹니다. 이 방식은 이식성이 좋고
이해하기 쉽지만, 큰 이미지에서는 메모리 할당과 픽셀 처리 비용이 그대로 드러납니다.

`libvips`는 지연 평가와 수요 기반 파이프라인을 사용합니다. 축소처럼 출력 픽셀에 필요한 영역만 계산해도
되는 작업에서는 이 구조 차이가 크게 드러납니다.

## 인코딩 차이는 작지만 여전히 의미 있다

인코딩 벤치마크도 같은 원칙으로 구성했습니다. 순수 JVM 경로는 scrimage writer를 사용하고,
네이티브 경로는 `VipsImage.toBytes()`를 호출합니다.

```kotlin
@Benchmark
fun scrimage_encodeJpeg(state: VipsBenchmarkState, bh: Blackhole) {
    val bytes = BenchmarkImageSets.naturalPhoto(state.imageName).bytes(JPEG_WRITER)
    bh.consume(bytes)
}

@Benchmark
fun vips_encodeJpeg(state: VipsBenchmarkState, bh: Blackhole) {
    if (!state.vipsAvailable) {
        bh.consume(null)
        return
    }
    state.createVipsImage(state.photo4kJpegBytes).use { img ->
        val bytes = img.toBytes(VipsImageFormat.JPEG)
        bh.consume(bytes)
    }
}
```

전체 소스:
[ImageEncodeBenchmark.kt](https://github.com/bluetape4k/bluetape4k-image/blob/develop/benchmark/images-benchmark/src/benchmark/kotlin/io/bluetape4k/images/benchmark/ImageEncodeBenchmark.kt)

인코딩은 축소만큼 차이가 크지는 않습니다. JPEG는 약 2.4~3.1배, PNG는 약 1.5~1.8배입니다. 그래도
썸네일을 여러 개 만들거나 업로드를 처리할 때처럼 요청 하나가 여러 파생 이미지를 만드는 흐름에서는
이 차이가 누적됩니다.

## Java 21 JNI와 Java 25 FFM

`bluetape4k-image`는 두 네이티브 백엔드를 제공합니다.

| 백엔드 | 실행 환경 | 용도 |
|---|---|---|
| `images-vips-java21` | JVips / JNI | Java 21 환경을 위한 네이티브 백엔드 |
| `images-vips-java25` | FFM / Panama | Java 25 환경의 권장 고성능 백엔드 |

이번 macOS arm64 실행에서는 Java 21 JNI 값을 `N/A`로 표시했습니다. Java 21이 느려서가 아닙니다.
현재 호스트에서 번들된 JVips 동적 라이브러리는 x86_64이고 JVM은 arm64이므로, 같은 호스트에서는 네이티브 측정값을
만들 수 없었습니다.

그래서 이 글의 결론은 "Java 21 JNI가 느리다"가 아닙니다. 더 정확한 결론은 다음과 같습니다.

- Java 25 FFM은 이번 호스트에서 실제로 측정한 고성능 경로입니다.
- Java 21 JNI는 Linux CI 또는 아키텍처가 호환되는 호스트에서 따로 측정해야 합니다.
- macOS Java 25 실측값과 오래된 Linux Java 21 값을 한 표에 섞어 최신 비교처럼 보여서는 안 됩니다.

`VipsBenchmarkState`는 런타임 클래스패스를 확인해 리플렉션으로 백엔드를 선택합니다.

전체 소스:
[VipsBenchmarkState.kt](https://github.com/bluetape4k/bluetape4k-image/blob/develop/benchmark/images-benchmark/src/benchmark/kotlin/io/bluetape4k/images/benchmark/VipsBenchmarkState.kt)

## 벤치마크에서 서비스 처리 흐름으로

벤치마크 숫자만으로는 실제 적용 지점이 잘 보이지 않습니다. 그래서 `bluetape4k-workshop`에는
운영 환경을 본뜬 예제를 따로 두었습니다.

예제:
[image-processing-advanced-workflow](https://github.com/bluetape4k/bluetape4k-workshop/tree/develop/image-processing/advanced-workflow)

이 예제는 Spring Boot 4 기반 업로드 처리 흐름입니다.

1. 업로드 파일의 크기, 콘텐츠 유형, 매직 바이트를 검증합니다.
2. 원본 이미지 객체를 스토리지에 저장합니다.
3. Java 25 `libvips` 백엔드로 WebP 파생 이미지를 만듭니다.
4. S3 또는 로컬 스토리지에 원본과 변형 이미지를 저장합니다.
5. 공개 URL과 처리 메타데이터를 반환합니다.

실제 파생 이미지 생성 지점은 짧습니다.

```kotlin
return suspendFfmVipsImageOf(bytes).use { image ->
    image.thumbnail(variant.maxDimension).use { thumbnail ->
        val output = thumbnail.suspendToBytes(VipsImageFormat.WEBP, webpOptions)
        ProcessedImageVariant(
            name = variant.name,
            key = keyFactory.variantKey(imageId, variant.name, variant.extension),
            bytes = output,
            width = thumbnail.width,
            height = thumbnail.height,
            contentType = variant.contentType,
        )
    }
}
```

전체 소스:
[DerivativeProcessor.kt](https://github.com/bluetape4k/bluetape4k-workshop/blob/develop/image-processing/advanced-workflow/src/main/kotlin/io/bluetape4k/workshop/imageprocessing/advanced/service/DerivativeProcessor.kt#L57-L75)

이 코드가 벤치마크와 실제 서비스가 만나는 지점입니다. 서비스는 업로드 하나에서 여러 변형 이미지를 만들 수 있고,
각 변형 이미지는 축소와 인코딩을 모두 수행합니다. 이 경로에서는 `scrimage`와 `libvips`의 차이가 단일
측정값보다 더 크게 누적됩니다.

## 실무 적용 기준

간단한 이미지 처리이거나 네이티브 의존성을 피해야 하는 환경이라면 `images`의 scrimage 경로가 좋은
출발점입니다. 배포가 쉽고 JVM만 있으면 동작합니다.

하지만 다음 조건이라면 `images-vips-java25`를 먼저 검토할 만합니다.

- 업로드 뒤 썸네일, 미리 보기, WebP 변형 이미지를 여러 개 생성합니다.
- 4K 이상 원본 이미지를 자주 처리합니다.
- 축소 지연 시간이 요청 시간 또는 작업자 처리량을 제한합니다.
- Java 25 런타임을 사용할 수 있고 `libvips` 네이티브 의존성을 운영할 수 있습니다.

Java 21 환경이라면 `images-vips-java21`도 선택지입니다. 다만 JNI 네이티브 아티팩트와 호스트 아키텍처를
검증해야 합니다. macOS arm64처럼 번들된 네이티브 아티팩트가 맞지 않는 환경에서는 벤치마크와 통합
테스트를 `N/A`로 처리하고, Linux 또는 아키텍처가 호환되는 호스트에서 별도로 측정하는 편이 안전합니다.

AVIF/HEIC도 같은 원칙입니다. API에 형식 상수가 있어도 실제 디코딩·인코딩 가능 여부는
호스트의 `libvips`, `libheif`, AV1/HEVC 코덱 빌드에 달려 있습니다.

## 대표 소스 링크

아래 링크는 단순 참고 목록이 아니라, 이 글의 주장과 예제를 따라가기 위한 출발점입니다.

벤치마크 코드:

- [ImageResizeBenchmark.kt](https://github.com/bluetape4k/bluetape4k-image/blob/develop/benchmark/images-benchmark/src/benchmark/kotlin/io/bluetape4k/images/benchmark/ImageResizeBenchmark.kt)는 `cafe`와 `landscape`의 4K→1080p 축소 작업을 scrimage와 libvips 양쪽에서 실행해 비교합니다.
- [ImageEncodeBenchmark.kt](https://github.com/bluetape4k/bluetape4k-image/blob/develop/benchmark/images-benchmark/src/benchmark/kotlin/io/bluetape4k/images/benchmark/ImageEncodeBenchmark.kt)는 같은 자연 사진 픽스처로 JPEG/PNG 인코딩 경로를 동일한 조건에서 비교합니다.
- [VipsBackendBenchmark.kt](https://github.com/bluetape4k/bluetape4k-image/blob/develop/benchmark/images-benchmark/src/benchmark/kotlin/io/bluetape4k/images/benchmark/VipsBackendBenchmark.kt)는 JNI와 FFM 백엔드의 libvips 호출 경로를 백엔드 수준에서 분리해 확인합니다.
- [VipsBackendEncodeBenchmark.kt](https://github.com/bluetape4k/bluetape4k-image/blob/develop/benchmark/images-benchmark/src/benchmark/kotlin/io/bluetape4k/images/benchmark/VipsBackendEncodeBenchmark.kt)는 코덱과 호스트 라이브러리 지원 여부가 중요한 네이티브 인코딩 경로를 따로 확인합니다.
- [VipsBenchmarkState.kt](https://github.com/bluetape4k/bluetape4k-image/blob/develop/benchmark/images-benchmark/src/benchmark/kotlin/io/bluetape4k/images/benchmark/VipsBenchmarkState.kt)는 런타임 클래스패스에서 활성 백엔드를 선택하고, 사용할 수 없는 백엔드는 숫자를 꾸며내지 않고 측정 불가로 남깁니다.
- [BenchmarkImageSets.kt](https://github.com/bluetape4k/bluetape4k-image/blob/develop/benchmark/images-benchmark/src/main/kotlin/io/bluetape4k/images/benchmark/BenchmarkImageSets.kt)는 `cafe`와 `landscape` 자연 사진 픽스처를 로드하고, 아직 커밋하지 않은 선택적 문서·썸네일 리소스에는 합성 이미지 대체값을 유지합니다.

리포트와 원본 근거:

- [benchmark-results-2026-05-28-natural-photos.md](https://github.com/bluetape4k/bluetape4k-image/blob/develop/benchmark/images-benchmark/docs/benchmark-results-2026-05-28-natural-photos.md)는 이 글의 표와 차트에 사용한 사람이 읽기 좋은 벤치마크 보고서입니다.
- [vips-backend-comparison.md](https://github.com/bluetape4k/bluetape4k-image/blob/develop/benchmark/images-benchmark/docs/vips-backend-comparison.md)는 Java 21 JNI와 Java 25 FFM의 비교 원칙, 그리고 macOS arm64의 `N/A` 구간을 설명합니다.
- [raw macOS Java 25 benchmark JSON](https://github.com/bluetape4k/bluetape4k-image/blob/develop/benchmark/images-benchmark/docs/raw/benchmark-results-2026-05-28-macos-java25-natural-photos.json)은 보고서의 근거가 되는 `kotlinx-benchmark` 원본 출력입니다.

Workshop 예제:

- [image-processing-advanced-workflow](https://github.com/bluetape4k/bluetape4k-workshop/tree/develop/image-processing/advanced-workflow)는 업로드부터 파생 이미지 생성까지 이어지는 전체 서비스 흐름을 보여 줍니다.
- [ImageDerivativeWorkflowService.kt](https://github.com/bluetape4k/bluetape4k-workshop/blob/develop/image-processing/advanced-workflow/src/main/kotlin/io/bluetape4k/workshop/imageprocessing/advanced/service/ImageDerivativeWorkflowService.kt)는 검증, 저장소 처리, 파생 이미지 생성, 응답 메타데이터를 조율하는 애플리케이션 서비스입니다.
- [DerivativeProcessor.kt](https://github.com/bluetape4k/bluetape4k-workshop/blob/develop/image-processing/advanced-workflow/src/main/kotlin/io/bluetape4k/workshop/imageprocessing/advanced/service/DerivativeProcessor.kt)는 벤치마크의 libvips 축소·인코딩 호출이 실제 변형 이미지 파이프라인으로 연결되는 지점입니다.
- [UploadImageValidator.kt](https://github.com/bluetape4k/bluetape4k-workshop/blob/develop/image-processing/advanced-workflow/src/main/kotlin/io/bluetape4k/workshop/imageprocessing/advanced/service/UploadImageValidator.kt)는 네이티브 이미지 처리 전에 크기, 콘텐츠 유형, 매직 바이트를 검증하는 보호 장치입니다.
- [ImageDerivativesController.kt](https://github.com/bluetape4k/bluetape4k-workshop/blob/develop/image-processing/advanced-workflow/src/main/kotlin/io/bluetape4k/workshop/imageprocessing/advanced/web/ImageDerivativesController.kt)는 이 흐름을 HTTP 업로드 엔드포인트로 노출합니다.

## 마무리

`scrimage`와 `libvips`는 경쟁 관계라기보다 선택 가능한 두 운영 모드에 가깝습니다. 순수 JVM 경로는
단순하고 이식성이 좋습니다. 네이티브 경로는 운영 준비가 필요하지만, 대량 이미지 처리 파이프라인에서는 성능 차이가
명확합니다.

`bluetape4k-image`의 목표는 둘 중 하나를 강요하는 것이 아닙니다. 서비스가 처음에는 순수 JVM으로
시작하고, 처리량이 필요해지는 시점에 `libvips` 백엔드로 이동할 수 있도록 같은 생태계 안에 두
경로를 제공합니다.


## 벤치마크 근거

벤치마크 수치와 구현은 다음 source에서 확인한다.

- [자연 이미지 benchmark 결과](https://github.com/bluetape4k/bluetape4k-image/blob/develop/images-benchmark/docs/benchmark-results-2026-05-28-natural-photos.md)
- [vips backend 비교](https://github.com/bluetape4k/bluetape4k-image/blob/develop/images-benchmark/docs/vips-backend-comparison.md)
- [ImageResizeBenchmark](https://github.com/bluetape4k/bluetape4k-image/blob/develop/images-benchmark/src/benchmark/kotlin/io/bluetape4k/images/benchmark/ImageResizeBenchmark.kt)
- [ImageEncodeBenchmark](https://github.com/bluetape4k/bluetape4k-image/blob/develop/images-benchmark/src/benchmark/kotlin/io/bluetape4k/images/benchmark/ImageEncodeBenchmark.kt)
- [VipsBenchmarkState](https://github.com/bluetape4k/bluetape4k-image/blob/develop/images-benchmark/src/benchmark/kotlin/io/bluetape4k/images/benchmark/VipsBenchmarkState.kt)
- [VipsBackendBenchmark](https://github.com/bluetape4k/bluetape4k-image/blob/develop/images-benchmark/src/benchmark/kotlin/io/bluetape4k/images/benchmark/VipsBackendBenchmark.kt)
- [VipsBackendEncodeBenchmark](https://github.com/bluetape4k/bluetape4k-image/blob/develop/images-benchmark/src/benchmark/kotlin/io/bluetape4k/images/benchmark/VipsBackendEncodeBenchmark.kt)
- [BenchmarkImageSets](https://github.com/bluetape4k/bluetape4k-image/blob/develop/images-benchmark/src/main/kotlin/io/bluetape4k/images/benchmark/BenchmarkImageSets.kt)
- [raw benchmark JSON](https://github.com/bluetape4k/bluetape4k-image/blob/develop/images-benchmark/docs/raw/benchmark-results-2026-05-28-macos-java25-natural-photos.json)

![이미지 처리 benchmark 요약](/assets/image-processing-benchmark-summary-01.png)
