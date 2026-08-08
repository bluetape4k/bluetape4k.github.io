# Leader Part 5 블로그

## 배경

bluetape4k-leader blog series Part 5에 storage backend, operational feature, benchmark interpretation, example을 다루는 bilingual 게시 가능 글이 필요했다. 사용자는 source link를 bullet로 정리하고 이전 series navigation을 수정하길 원했다.

## 결정

`docs/drafts`가 아니라 게시 가능한 site path를 사용한다. 한국어·영어 글을 구조적으로 맞춘다. 직접 작성한 SVG/PNG backend-picker와 leader repository에서 복사한 benchmark chart SVG/PNG asset을 사용한다.

## 결과

Part 5 한국어·영어 글, backend-picker asset, distributed throughput/latency chart asset을 추가하고 기존 Part 1-4 series link가 Part 5를 가리키도록 갱신했다.

## 검증

새 SVG는 `xmllint`로 검사하고, label/connector overlap이 없는지 rendered PNG를 확인하며, `git diff --check`와 Astro site build를 실행한다.

## 향후 참고

앞으로 Leader series 글은 `bluetape4k-leader/benchmark/README.md`와 benchmark claim을 대조하고, benchmark caveat를 source link에만 두지 말고 chart 가까이에 표시한다.
