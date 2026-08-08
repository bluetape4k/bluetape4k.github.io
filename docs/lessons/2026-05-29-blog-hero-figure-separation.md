# 블로그 hero figure 분리

## 배경

여러 블로그 글이 첫 benchmark chart나 설명 다이어그램을 `bt4k-blog-hero`로 사용했다. 존재 여부 검사는 통과했지만, 본문 앞에 도입용 이미지를 두는 AI 협업 글의 시각 계약과는 맞지 않았다.

## 결정

`bt4k-blog-hero`는 글을 여는 editorial image에만 사용한다. benchmark chart, architecture diagram, measurement summary는 글에서 근거를 설명하는 위치의 `bt4k-architecture` 같은 본문 figure에 둔다. 글에서 가장 중요한 근거인 경우에도 동일하다.

## 결과

영어·한국어 글이 다음 구조를 공유한다.

1. Frontmatter
2. Editorial hero figure
3. Post metadata
4. Intro copy
5. 관련 근거 위치의 본문 chart 또는 diagram

## 검증

- `npm run build`
- `git diff --check`
- 영어·한국어 전체 블로그 글의 로컬 렌더 route를 확인했다. `bt4k-blog-hero`가 chart, benchmark, throughput, summary asset을 가리키지 않음을 검증했다.

## 향후 guard

글을 추가하거나 번역할 때 본문 chart를 맨 위로 옮겨 "hero가 있다" 검사를 통과시키지 않는다. 전용 editorial hero image를 만들거나 재사용하고, 데이터 시각화는 본문에 둔다.
