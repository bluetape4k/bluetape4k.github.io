# Visual Companion 분석 스크립트 적용 범위

## 배경

Visual Companion 경로에는 두 종류의 HTML이 함께 배포됩니다.

- Astro가 생성하는 카탈로그와 저장소 소개 페이지
- 각 저장소에서 동기화한 독립 실행형 Visual Companion HTML

두 종류 모두 `dist/visual-companions/` 아래에 있으므로 빌드 결과의 경로만
검색하면 Astro 페이지에도 분석 스크립트를 다시 삽입할 수 있습니다.

## 결정

분석 스크립트 후처리 대상은 `public/visual-companions/`와
`public/ko/visual-companions/`에 등록된 독립 HTML을 기준으로 정합니다.
각 파일과 대응하는 `dist` 파일에만 Cloudflare Web Analytics Beacon을
삽입합니다. Astro 페이지는 기존 공통 `<head>` 설정을 그대로 사용합니다.

Visual Companion 원본과 Snapshot은 분석 도구 설정을 포함하지 않습니다.
토큰과 스크립트 URL은 Pages 저장소의 공통 설정에서 관리하고 운영 빌드
결과에만 적용합니다.

## 검증

- 운영 빌드의 독립 HTML 14개에 Beacon이 정확히 하나씩 존재합니다.
- Astro가 생성한 영문·한국어 카탈로그에도 기존 Beacon이 하나씩 존재합니다.
- `public`의 원본 HTML 14개에는 Beacon이 없습니다.
- 후처리를 다시 실행하면 변경 파일 수가 `0/14`로 유지됩니다.
- 기존 Beacon이나 잘못된 `<head>` 구조가 발견되면 빌드를 중단합니다.
