# 사용량 과금 Part 1 Source Snapshot 교훈

## 범위

- `bluetape4k-workshop`의 사용량 과금 통합 시각 자료
- 한국어·영어 Part 1 본문과 언어·테마별 PNG 12개
- GitHub Pages에 게시하는 한국어·영어 대화형 시각 자료

## 블로그는 Source Branch가 아니라 게시 Route를 연결한다

Workshop의 HTML은 시각 자료 원본이지만 블로그 독자가 이동할 주소는 Site가 소유한다. 글에서 Workshop의
Branch 파일을 직접 연결하면 Source 구조와 GitHub UI가 노출되고, Locale 전환·공통 분석·공개 URL 계약을
Site가 통제할 수 없다. 따라서 Site가 Manifest를 동기화해 자체 Locale Route로 게시하고, 글은 그 Route의
안정된 Fragment를 연결한다.

## Merge SHA와 PNG Hash를 함께 고정한다

`sourceRef`를 Workshop Merge SHA로 고정하면 HTML, Source 링크와 Manifest가 어느 버전에서 왔는지 재현할
수 있다. 블로그에 넣는 PNG도 같은 Worktree에서 복사하고 Source·Target의 Byte Size와 SHA-256을 비교해야
HTML과 정적 Fallback이 서로 다른 구현 시점을 설명하는 문제를 막을 수 있다.

Branch의 최신 파일을 복사하거나 사람이 PNG를 골라 옮기는 절차는 검증 경계를 만들지 못한다. Source HEAD
불일치를 먼저 거부하는 복사 Script가 출처 고정과 자산 무결성을 하나의 실행 절차로 묶는다.

## 글의 공개 시점과 시각 자료의 화면 ID를 분리한다

Part 1·2·3은 서로 다른 시점에 공개할 수 있지만 통합 시각 자료는 처음부터 `ledger`, `event-sourcing`,
`microservices`라는 안정된 Fragment를 제공한다. 각 글은 현재 Part에 해당하는 Fragment만 연결한다. 이후
글을 추가해도 기존 Part의 URL이나 PNG 이름을 바꾸지 않으므로 시리즈 Navigation과 외부 공유 링크가
안정적으로 유지된다.

## 검증 기준

- Workshop Source Ref와 읽기 전용 Source Worktree HEAD 일치
- 공개 HTML 2개와 언어·테마별 PNG 12개 존재
- 복사한 PNG 12개의 Source·Target SHA-256 일치
- 한국어 글은 한국어 PNG와 `/ko/` Route만, 영어 글은 영어 PNG와 기본 Route만 사용
- 두 글의 제목 구조, 의사코드, 수치, Source 링크와 한계 동등성
- Site 테스트, Astro 검사와 정적 빌드 통과
