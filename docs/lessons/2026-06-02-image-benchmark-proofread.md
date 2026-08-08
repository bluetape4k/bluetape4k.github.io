# Image benchmark 교정

## 배경

시간순 blog proofreading stack이 benchmark 기반 image processing note `from-pure-jvm-to-libvips-benchmarking-image-processing`까지 진행됐다.

## 결정

benchmark 값, source link, runtime caveat, code example, adoption guidance를 유지한다. service workflow, benchmark 한계, backend 선택을 더 쉽게 읽을 수 있을 때만 한국어·영어 표현을 개선한다.

## 결과

측정된 Java 25 FFM과 Java 21 JNI host-limit caveat를 유지하면서 scrimage/libvips tradeoff를 더 자연스러운 개발자 대상 문장으로 설명한다.

## 검증

- `git diff --check`
- `npm run build`

## 향후 가이드

benchmark 글에서는 측정값과 caveat를 anchor로 유지한다. 그 주위를 자연스럽게 다시 쓰되, 입력이 뒷받침하는 범위보다 benchmark 결과를 넓게 말하지 않는다.
