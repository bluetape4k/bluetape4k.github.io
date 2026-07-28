# Dependencies 입력 경계·BOM 제작기 교정 배치 교훈

## 배경

이번 배치는 `bluetape4k-dependencies 1.3.0` 활용기 Part 4와
`bluetape4k-dependencies` 제작기 Part 1·2를 교정했다. 세 글은 입력 자원
안전성, 중앙 BOM의 필요성, 공개 BOM의 구현 경계를 설명하지만, 본문 일부가
구어체 회고 표현에 기대거나 버전 카탈로그와 공개 POM의 독자를 충분히
분리하지 못했다.

교정 목표는 단순한 용어 치환이 아니었다. 입력이 처음 완전히 구체화되는
지점과 자원 제한 순서를 보여 주고, BOM 공급자의 내부 빌드 입력과 소비자가
가져오는 공개 계약을 서로 다른 경계로 설명하도록 글과 다이어그램을 함께
정리했다.

## 확인한 교정 원칙

### 입력 안전성은 기능 호출보다 앞에서 시작한다

- OCR이나 토크나이저 호출 자체를 자원 안전성의 근거로 사용하지 않는다.
- 요청 크기와 콘텐츠 유형을 저비용 검사로 확인한 뒤 제한된 디코딩과
  고비용 처리를 수행한다.
- 요청이 `ByteArray`, `String`, 디코딩 이미지처럼 완전히 구체화되는 지점을
  명시한다.
- 오류 응답과 로그에는 원문 입력을 노출하지 않고, 요청 ID·필드·규칙 ID처럼
  추적에 필요한 정보만 남긴다.

### 버전 카탈로그와 공개 BOM은 독자와 결과물이 다르다

- Gradle 버전 카탈로그는 저장소 관리자가 빌드 스크립트를 작성할 때 사용하는
  내부 입력이다.
- 소비자가 가져오는 공개 계약은 Maven Central에 게시된 POM과
  `dependencyManagement`이다.
- 각 저장소 BOM은 자체 모듈 목록을 책임지고, 중앙 BOM은 하위 BOM과 외부
  의존성 계열의 호환 조합을 책임진다.
- 글이 다루는 릴리스가 정해져 있으면 자료 링크도 해당 태그에 고정한다.

### 출판용 기술 문체는 실패를 직접 설명한다

- `똥 치우기`, `뒤통수`, `삽질` 같은 표현은 개인 회고의 의도가 분명하지
  않다면 사용하지 않는다.
- 대신 `계약 불일치`, `원인 분석 비용`, `의존성 해석 실패`, `중복 관리
  비용`처럼 독자가 판단에 사용할 수 있는 실패 형태를 직접 쓴다.
- 본문뿐 아니라 제목, 설명, 카드 설명, 대체 텍스트, 캡션, 표, 다이어그램
  라벨까지 동일한 문체 기준으로 검토한다.

## 발견한 기존 문서 결함

- 제작기 Part 1의 AWS 의존성 예제에 중복 선언이 있었다.
- `javaPlatform` 예제에 중복 블록이 있었다.
- 동일한 문장 일부와 주어가 반복되어 문단 의미가 끊겼다.
- 현재 브랜치의 자료 링크가 과거 릴리스 설명에 사용되어, 독자가 다른
  시점의 계약을 읽을 수 있었다.

중복 코드는 제거했고, 자료 링크는 Input 글의 `image 0.3.0`·`text 0.2.1`,
제작기 Part 1의 `dependencies 1.3.0`, Part 2의 `dependencies 1.0.0`
태그로 고정했다.

## 다이어그램 검증 원장

| stem | 용도 | 정적 감사 | 보조 불변식 | PNG |
| --- | --- | --- | --- | --- |
| `bluetape4k-dependencies-bom-flow-01-{ko,en}` | 저장소별 BOM → 중앙 BOM → 소비자 | marker 1, connector 2, intrusion·crossing·shared segment·geometry failure 0 | 실제 카드 4, 관계 라벨 2 | 3200×1960, 한영 원본 크기 검사 |
| `bluetape4k-dependencies-input-boundary-01-{ko,en}` | 저비용 검사 → 제한된 디코딩 → 기능 처리·조기 거부 | marker 1, connector 5, intrusion·crossing·shared segment·geometry failure 0 | 실제 카드 6, 관계 라벨 5 | 3200×1960, 한영 원본 크기 검사 |
| `bluetape4k-dependencies-public-bom-contract-01-{ko,en}` | 내부 카탈로그 → 게시 POM → 소비자 해석 | marker 1, connector 3, intrusion·crossing·shared segment·geometry failure 0 | 실제 카드 5, 관계 라벨 3 | 3200×1960, 한영 원본 크기 검사 |

세 stem 모두 XML 파싱, CairoSVG 2배 렌더링, 텍스트 위험,
코드 강조, connector, geometry, endpoint, mixed-corner 감사를 통과했다.
최종 PNG에서는 글자 잘림, 카드 침범, 라벨 충돌, 화살표 방향 오류를 찾지
못했다.

## 체크리스트 반영

이번 배치에서 재사용할 수 있는 다음 규칙을 chezmoi 원본
`bluetape-writer` 한국어 교정 체크리스트에 추가했다.

- BOM 공급자의 내부 빌드 작성 입력과 소비자의 공개 POM 계약 구분
- 입력이 완전히 구체화되는 지점과 저비용 검사 → 제한된 디코딩 → 고비용
  처리 → 안전한 실패 응답 순서
- 출판용 기술 글에서 구어체 회고 표현 대신 실패 형태를 직접 설명하는 기준

chezmoi apply 후 원본과 live skill의 byte parity를 확인했고, dotfiles
commit `3d7e2db`를 upstream에 push했다. self-audit는 `PASS=7`,
`WARN=0`, `FAIL=0`으로 통과했다.

## 검증 결과

| 항목 | 결과 |
| --- | --- |
| 한국어·영어 글 | 제목·주장·자료 링크·다이어그램 구성 일치 |
| 날짜·순서 | 최초 `blog.date`와 `sidebar.order` 보존 |
| 사실 검증 | dependencies 1.0.0·1.3.0, image 0.3.0, text 0.2.1 태그 소스 대조 |
| 자료 링크 | 독자가 확인할 GitHub 링크 HTTP 200 |
| 기술 다이어그램 | 3개 stem, 한영 SVG·PNG 6개 |
| SVG 감사 | XML, 텍스트, connector, geometry, endpoint, mixed-corner 실패 0 |
| PNG 검사 | CairoSVG 2배 렌더링, 6개 모두 3200×1960, 한영 원본 크기 검사 |
| 대상 테스트 | 다이어그램 지역화·확대 UI 23/23 통과 |
| 전체 테스트 | Node 전체 테스트 통과 |
| 사이트 검사 | Astro check 오류·경고 0, 기존 힌트 3개, 정적 build 통과 |
| 로컬 경로 | 한영 글 6개와 대표 PNG 3개 HTTP 200 |
| writer 체크리스트 | dotfiles `3d7e2db`, chezmoi apply·source/live·upstream 일치 |
| stacked PR | #288, base `docs/korean-proofreading-dependencies-operations-batch` |

## 다음 작업에 적용할 지침

다음 글을 열기 전과 완료 직전에 live `bluetape-writer` 체크리스트를 다시
읽는다. 릴리스 글은 자료 링크와 코드 예제를 해당 태그에 고정하고, 입력 처리
글은 기능 호출보다 앞선 자원 경계를 확인한다. 새로 발견한 반복 규칙은 같은
배치에서 chezmoi 원본 체크리스트와 lessons 문서에 함께 반영한다.
