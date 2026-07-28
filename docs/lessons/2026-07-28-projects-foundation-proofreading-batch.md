# Projects 기반 글 재교정 배치 Lessons

## 범위

- `bluetape4k-projects-part1-shared-foundation`
- `bluetape4k-projects-part2-core-coroutines-tests`
- `bluetape4k-projects-part3-io-serialization-http-encryption`

## 확인한 점

- 세 글은 이미 KO/EN locale pair가 존재하고, 최초 공개일은 `2026-05-30T16:30:00+09:00`부터 1분 간격으로 유지하는 것이 맞다.
- 세 글의 GitHub source link는 현재 로컬 `bluetape4k-projects`, `bluetape4k-workshop` 경로 기준으로 모두 존재한다.
- Projects 시리즈 다이어그램 generator는 Part 1~6 asset을 함께 만든다. Part 1~3만 고치더라도 같은 generator의 색상·폰트·KO 라벨 정책은 시리즈 전체에 영향을 준다.
- 기존 다이어그램은 light style이었으므로 dark style SVG/PNG로 다시 생성했다. KO 다이어그램은 설명용 영어를 줄이고, EN 다이어그램은 기존 영문 표기를 유지했다.

## 교정 교훈

- `runtime adapter`, `application support`, `application layer`는 설명문에서 각각 `런타임 어댑터`, `애플리케이션 지원`, `애플리케이션 계층`으로 쓰는 편이 자연스럽다.
- `fixture`, `wrapper`, `framework`는 코드 식별자가 아니라 설명용 일반 명사일 때 `픽스처`, `래퍼`, `프레임워크`로 정리한다.
- I/O 글에서는 `byte stream`, `wire format`, `header`, `timeout`, 일반 `payload`를 각각 `바이트 스트림`, `전송 형식`, `헤더`, `타임아웃`, `페이로드`로 정리하면 한국어 기술 문체가 안정된다.
- 코드 변수명과 API 이름은 그대로 둔다. 예를 들어 `payload`, `bytes`, `BinarySerializers`는 코드 블록 안에서 보존한다.

## 검증 메모

- writer 체크리스트는 chezmoi 원본과 live skill에 반영했고, dotfiles commit `b1be9f7`로 push했다.
- `Pillow 11.3.0`이 설치된 Python으로 Projects 다이어그램 contact sheet를 생성해 실제 PNG 가독성을 확인했다.
