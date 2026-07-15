# 블로그 SNS 미리보기 Hero 연결 설계

## 목표

블로그 링크를 SNS에 공유할 때 모든 글에 공통 사이트 이미지가 나타나는 대신, 각 글의 `blog.image` Hero가 미리보기 이미지로 나타나게 한다.

## 현재 문제

- `astro.config.mjs`가 모든 페이지의 `og:image`와 `twitter:image`를 `/og-image.png`로 고정한다.
- 모든 한글·영문 블로그 글은 이미 `blog.image`와 `blog.imageAlt`를 제공하지만, 이 값은 블로그 목록과 본문에서만 사용된다.
- Hero 이미지 크기는 여러 규격이므로 전역 `og:image:width=1200`과 `og:image:height=630`을 글별 Hero에 그대로 적용하면 잘못된 메타데이터가 된다.

## 승인된 방향

- 이미지에 글자나 로고를 다시 합성하지 않고 기존 Hero를 그대로 사용한다.
- 블로그 route에서만 `og:image`, `og:image:alt`, `twitter:image`, `twitter:image:alt`를 글별 값으로 교체한다.
- 글별 Hero를 사용할 때 전역 이미지 전용 `og:image:width`와 `og:image:height`는 제거한다.
- 홈페이지, 매뉴얼, 일반 문서는 현재 전역 대표 이미지를 유지한다.

## 구조

메타데이터 배열 변환은 `src/lib/socialPreview.ts`의 순수 함수가 담당한다. `src/starlightRouteData.ts`는 블로그 frontmatter가 존재할 때만 이 함수를 호출한다. 이 경계 덕분에 변환 동작은 Node 내장 테스트 러너로 직접 검증하고, Starlight 통합은 실제 Astro build 결과의 HTML로 검증할 수 있다.

## 검증 기준

- 대표 한글 글의 SNS 이미지 URL이 해당 Hero의 절대 URL이다.
- 대응 영문 글도 동일한 Hero 절대 URL과 영문 `imageAlt`를 사용한다.
- 일반 페이지는 기존 `/og-image.png`를 유지한다.
- 글별 Hero 페이지에는 잘못된 고정 width/height 메타가 없다.
- `npm test`와 `npm run build`가 통과한다.
