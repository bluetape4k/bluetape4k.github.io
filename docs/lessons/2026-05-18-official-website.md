# 2026-05-18 공식 웹사이트

## 배경

첫 번째 공식 bluetape4k 웹사이트를 별도의 `bluetape4k.github.io` 저장소로 만들었다.

## 결정

GitHub Pages에서 Astro + Starlight를 사용한다. 웹사이트는 선별된 소개와 생태계 허브로 유지하고, 상세 API와 모듈 문서는 각 소스 저장소에 둔다.

## 결과

사이트에 랜딩 페이지, 시작 가이드, 저장소 개요, 예제 인덱스, 의존성 거버넌스 페이지가 포함됐다.

## 검증

사이트를 게시하거나 갱신하기 전에 `npm run build`를 실행한다.

## 향후 규칙

웹사이트의 초점은 온보딩과 탐색에 둔다. 처음 방문한 사용자에게 제공할 목적으로 의도적으로 선별한 경우가 아니라면 긴 README나 KDoc 내용을 복제하지 않는다.

## 2026-05-18 콘텐츠 확장

개요 콘텐츠는 하나의 넓은 "Backend libraries" 묶음 대신 사용 영역별로 백엔드 라이브러리 표면을 보여줘야 한다. 버전 거버넌스는 전용 페이지로 유지하되, 사용자의 즉시 온보딩 작업이 아닌 이상 개요의 주요 카드로 만들지 않는다.

개요 페이지의 아키텍처 다이어그램은 레이블을 우선하고 간결하게 만든다. 특히 모바일과 임베디드 SVG 렌더링에서는 긴 문장을 다이어그램 안에 넣지 말고 인접한 카드나 본문으로 옮긴다.

저장소 페이지에는 공식 라이브러리와 프로젝트 진입 저장소를 표시한다. 독자가 실행 라이브러리와 학습 자료를 구분할 수 있도록 워크숍, 샘플, 참조 애플리케이션 저장소는 Examples 페이지에 둔다. 명시적인 사용자 대상 산출물이 되지 않는 한 demo/profile 저장소는 제외한다.

공식 웹사이트의 SEO 기준선에는 크롤러 탐색(`robots.txt`의 sitemap URL), 1200x630 PNG Open Graph 이미지, 전역 Open Graph/Twitter 메타데이터, Organization·WebSite·SoftwareSourceCode용 JSON-LD를 포함한다. 게시 전에 `npm run build`를 실행하고 `dist/`에서 이를 확인한다.

Bing 호환 검색 엔진의 IndexNow 제출에는 루트의 UTF-8 key 파일과 배포 후 API 호출이 필요하다. Google Search Console sitemap 제출은 OAuth와 속성 소유권이 필요하므로 인증되지 않은 agent 세션에서는 수행할 수 없다.

문서 예제에는 웹사이트 프로젝트의 패키지 버전이 아니라 릴리스된 Maven 좌표를 사용한다. 특히 `bluetape4k-exposed-bom`은 `bluetape4k-exposed` 릴리스 라인을 따르고, `bluetape4k-dependencies`는 자체 중앙 BOM 릴리스 라인을 따른다.

Getting Started는 가장 많이 쓰이는 라이브러리만 보여주면 안 된다. 사용자가 모든 페이지를 먼저 둘러보지 않아도 leader election, text, image, Javers, experiments, workshop 저장소를 찾을 수 있도록 시작점 표를 전체 Repositories 및 Examples 페이지와 맞춘다.

실제 제품, 저장소 상태, 코드 경로를 설명하지 않는 생성 workbench 이미지는 보관하지 않는다. 장식용 스크린샷보다 저장소 카드, 간결한 설명, 관심사별 학습 경로, 아키텍처 위치 지도를 우선한다. 학습 경로 표에는 긴 저장소 이름이 문서 페이지에서 어색하게 줄바꿈되므로 inline-code 링크가 아니라 일반 텍스트 링크를 사용한다.

Starlight i18n은 영어를 루트 경로에 두고 한국어 페이지를 `/ko/` 아래에 둔다. 모든 공개 영어 페이지와 같은 상대 경로에 한국어 페이지를 추가하고, `astro.config.mjs`에 사이드바 번역을 유지하며, 각 로케일 변경 후 sitemap `hreflang` 대체 링크와 언어 선택기를 검증한다.

기본 Starlight 언어 선택기는 홈페이지 hero에서 너무 눈에 띄지 않는다. 처음 방문한 사용자가 헤더 컨트롤을 훑지 않아도 영어와 한국어를 찾을 수 있도록 첫 콘텐츠 블록 근처에 홈페이지용 언어 링크를 명시한다.

공식 블로그는 별도 저장소가 아니라 웹사이트 저장소 안에서 시작한다. 블로그는 같은 도메인, sitemap, Starlight 스타일, 배포 workflow를 함께 사용할 수 있다. 게시 전 검토가 필요하면 한국어 초안을 먼저 작성하고 영어 번역을 나중에 게시한다. 번역 대기 placeholder를 가리키도록 영어 블로그 인덱스를 연결하되, Starlight 언어 대체 링크가 없는 페이지를 가리키지 않도록 대응하는 로케일 slug를 유지한다.

AI 협업을 설명할 때 custom workflow skill을 일반적인 prompt 모음이 아니라 작업을 위한 운영체제로 설명한다. `bluetape4k-workflow`에서는 task classification, skip/deepen 결정, superpowers spec/plan 산출물, 다중 관점 review, Claude/Codex 교차 review, 명시적인 완료 증거를 강조한다.

`bluetape4k-workflow`를 설명할 때는 단계별 gatekeeper 역할을 강조한다. Maintenance와 Full Design처럼 대비되는 workflow 예제를 사용해 작은 작업에서는 불필요한 의식을 건너뛰고, 위험한 변경에서는 spec·plan·review·test·CI·benchmark·lessons gate를 강제하는 모습을 보여준다.

한국어 초안을 승인한 뒤 영어 번역 placeholder를 완전한 영어 글로 바꾸고 영어 블로그 인덱스 문구를 갱신한다. 로케일 대체 링크가 안정적으로 유지되도록 같은 slug 쌍을 유지한다.
