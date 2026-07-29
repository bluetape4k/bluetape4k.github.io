# Projects 도입 경로 글 재교정 배치 Lessons

## 범위

- `bluetape4k-projects-part4-data-infrastructure`
- `bluetape4k-projects-part5-utilities-adoption-path`
- `bluetape4k-projects-part6-spring-boot-ktor`

## 확인한 점

- 세 글은 Projects Part 1~3 다음에 이어지는 같은 날짜 연속 글이며, 최초 공개일과 sidebar order는 유지해야 한다.
- 앞 배치에서 공유 generator로 Part 4~6 다이어그램 SVG/PNG가 이미 dark style로 재생성되었으므로, 이번 배치는 본문·caption·alt text를 그 기준에 맞춘다.
- Part 4~6의 GitHub source link는 `bluetape4k-projects`와 `bluetape4k-workshop`의 현재 로컬 develop 계열 경로 기준으로 다시 확인한다.

## 교정 교훈

- `data`, `infrastructure`, `utility`, `adoption path`는 제목·caption·설명문에서 각각 `데이터`, `인프라`, `유틸리티`, `도입 경로`로 쓰는 편이 안정적이다.
- `observability`, `resilience`, `metric`, `trace`는 운영 설명문에서 `관측성`, `회복성`, `메트릭`, `추적`으로 정리한다. 단, 제품명·모듈명·태그·API 이름은 보존한다.
- Spring Boot/Ktor 비교 글에서는 `framework`, `runtime`, `application boundary`를 무조건 영어로 두기보다 `프레임워크`, `런타임`, `애플리케이션 경계`로 풀어 쓰면 문장이 덜 번역체처럼 보인다.
- 표의 첫 열과 diagram alt/caption은 독자가 훑어보는 영역이므로 본문보다 더 적극적으로 한국어화한다.

## 검증 메모

- writer 체크리스트는 chezmoi 원본과 live skill에 반영했고, dotfiles commit `b310bd6`으로 push했다.
- `sync-codex.sh --status`는 기존 live-owned surface drift를 보고했지만, managed Codex surface와 chezmoi source repository 상태는 정상이다.
