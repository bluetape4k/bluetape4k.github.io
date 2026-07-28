# Kafka 우선 아웃박스·코루틴 관측성·Flow 교정 배치 Lessons

## 범위

- `transactional-outbox-kafka-first-fallback-part2`
- `coroutine-observability-micrometer-readiness`
- `bluetape4k-flow-extensions-workshop`
- 한국어·영어 글과 기술 다이어그램 13종의 KO/EN SVG·PNG

## 사실과 경계 검증

- Kafka 우선 발행은 주문 트랜잭션과 외부 발행을 하나의 원자적 경계로 만들지 않는다. 직접 발행과 대체 행 저장이 모두 실패하면 이벤트 유실 가능 구간이 생기며, 복구 작업과 소비자 멱등성이 별도로 필요하다.
- 코루틴 관측성은 현재 observation을 Reactor Context와 `ThreadContextElement`에 함께 연결해야 일시 중단·재개 뒤에도 span 부모·자식 관계를 유지할 수 있다. `CancellationException`은 오류 span으로 기록하지 않고 다시 던져야 한다.
- 생존 상태는 프로세스 재시작 여부를, 준비 상태는 트래픽 라우팅 여부를 판단한다. 프로세스와 DB가 실행 중이어도 연결 풀 고갈로 요청을 처리할 수 없다면 준비 상태는 실패해야 한다.
- `bufferingDebounce`는 검색어 하나가 아니라 `List<String>`을 방출한다. 마지막 검색어를 `SearchQuery`로 바꾸는 `mapNotNull` 단계를 생략하면 설명용 코드도 실제 타입과 맞지 않는다.

## 한국어 교정 교훈

- `liveness`, `readiness`, `process`, `traffic`, `connection pool`을 설명 문장에서 그대로 나열하지 않고 `생존 상태`, `준비 상태`, `프로세스`, `트래픽`, `연결 풀`로 정리했다. 첫 등장에서는 영문 용어를 병기해 검색 가능성을 유지했다.
- `source`, `fallback`, `partial result`, `subscriber`, `window`, `rail`처럼 일반 개념을 설명할 때는 `원본`, `대체 경로`, `부분 결과`, `구독자`, `윈도우`, `레일`로 통일했다. API 이름과 상태값은 원문을 유지했다.
- 코드 블록의 설명용 주석도 독자용 본문에 포함된다. 한국어 글에서는 입력·출력·시나리오 주석을 한국어로 바꾸되 식별자와 예제 값은 변경하지 않았다.
- “여담이지만”, “잘 동작한다”처럼 판단 근거가 흐려지는 표현은 관찰 가능한 상태와 플랫폼 동작을 직접 설명하는 문장으로 바꿨다.

## 다이어그램 교훈

- 한국어 다이어그램은 `data-diagram-title`과 캡션만 번역해서는 충분하지 않다. 제목, 레인, 행동, 분기, 범례, 하단 출처 문구까지 현지화하고 API·제품명·상태값만 원문으로 유지해야 한다.
- 영어 원본의 흰 배경을 단순 반전하지 않고 어두운 배경, 고대비 카드, 의미별 연결선 색상을 적용했다. KO/EN SVG 26개와 CairoSVG 2배 PNG 26개를 별도로 생성했다.
- 원본 크기 시각 검수에서 한국어 준비 상태 시퀀스의 레인 이름과 하단 출처가 영어로 남아 있던 문제, 아웃박스 다이어그램의 내부 PR 번호를 발견해 제거했다.
- 최종 자산은 XML 26/26, connector·geometry `--fail-diagonal`·endpoint·mixed-corner 26/26, sequence style 4/4 검사를 통과했다.

## 체크리스트 반영

- `bluetape-writer` 한국어 교정 체크리스트에 한국어 다이어그램 내부 라벨 전체의 현지화 규칙을 추가했다.
- 연산자 체인의 중간 타입을 검증하고, 축약한 코드가 데이터 형태를 바꾸거나 컴파일되지 않으면 편집 문제가 아니라 사실 오류로 처리하도록 추가했다.
- 생존 상태와 준비 상태를 각각 프로세스 재시작 판단과 트래픽 라우팅 판단으로 구분하도록 추가했다.
- chezmoi 원본을 live skill에 적용하고 source/live parity와 self-audit를 통과한 뒤 dotfiles 커밋 `9a42bfe`를 원격 저장소에 반영했다.
