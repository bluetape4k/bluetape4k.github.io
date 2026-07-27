# 이미지·CSV 한국어 교정 배치

## 맥락

오래된 블로그 글 세 편을 다시 교정했다.

- `from-pure-jvm-to-libvips-benchmarking-image-processing`
- `reducing-csv-parser-allocations-with-okio`
- `introduction-bluetape4k-part1-ecosystem`

이번 배치는 한국어 본문만 다듬는 작업으로 끝나지 않았다. 독자가 읽는 차트와 생태계 개요 다이어그램의
한글 라벨을 다크 스타일로 다시 만들고, 한·영문 차트 자산과 확대 보기 제목을 함께
정비했다. 이미지 벤치마크 모듈이 `benchmark/images-benchmark`로 옮겨진 사실도
확인해 두 로케일의 소스 링크를 현재 `develop` 경로로 수정했다.

## 확인한 문제

이 글들은 예전에 한 번 교정한 이력이 있었지만, 이번 PR에 해당하는 lessons 문서는
만들지 않았다. 또한 최종 한국어 교정이 본문 중심으로 진행되어, 처음에는
frontmatter, 캡션, 대체 텍스트, 차트 라벨에 남은 일반 영어와 오래된 소스 경로를
별도 항목으로 점검하지 못했다.

## 결정

교정 PR은 과거에 같은 글의 lessons 문서가 있더라도 새 lessons 문서를 추가한다.
문서에는 이번 PR에서 실제로 확인한 근거, 교정 범위, 검증 결과, 재사용할 규칙만
기록한다. 이전 lessons 문서는 대체하지 않는다.

한국어 교정은 다음 경계를 따른다.

| 보존하는 항목 | 문맥에 맞게 교정하는 항목 |
|---|---|
| API·클래스·메서드·CLI 플래그·코드 토큰 | 제목, 설명, 카드 설명, 캡션, 대체 텍스트, 표, 차트 라벨의 일반 영어 |
| 벤치마크 수치·단위·명령·환경 조건 | `fallback`의 문맥상 의미, `content type`, `storage`, `variant`, `worker`, `artifact` |
| `UnsafeCursor`, `BufferedSource`, `libvips`처럼 제품·기술 식별성이 있는 명칭 | `delimiter`, `quote`, `payload`, `upstream`처럼 일반 설명에 쓰인 영어 |
| 저장소·모듈명, 코드 경로, 제품명 | `module`, `framework`, `layer`, `backend`, `service`, `workflow`, `pipeline`, `fixture`, `wrapper`처럼 설명 문장에 남은 영어 |

이번 문맥에서 적용한 대표 표현은 다음과 같다.

- `fallback` → 대체 이미지 또는 기존 경로
- `content type` → 콘텐츠 유형
- `storage` → 스토리지
- `variant` → 변형 이미지
- `worker` → 작업자
- `artifact` → 아티팩트
- `delimiter`, `quote`, `payload`, `upstream` → 구분자, 인용 부호, 필드 본문, 상위 입력 스트림
- `module`, `framework`, `layer` → 모듈, 프레임워크, 계층
- `backend`, `service`, `workflow`, `pipeline` → 백엔드, 서비스, 처리 흐름, 파이프라인
- `fixture`, `wrapper` → 픽스처, 래퍼

기계적으로 치환하지 않는다. 코드 식별자나 설정 이름인 경우에는 원문을 보존하고,
일반 문장일 때만 한국어 기술 용어를 선택한다.

## 검증

- 이미지·CSV 글의 대표 GitHub 링크 18개가 현재 저장소의 `develop` 경로에서 HTTP 200을 반환하는지 한·영문에서 확인했다.
- 차트 네 장과 생태계 다이어그램 두 장의 SVG XML, 표시 수치, 한·영문 자산 쌍, 확대 보기 제목을 검증했다.
- 전체 크기 PNG 6장으로 다크 배경의 대비와 라벨 여백을 확인했다.
- `node --test tests/ecosystem/blog-diagram-locales.test.mjs tests/ecosystem/diagram-lightbox.test.mjs`가 21개 테스트를 통과했다.
- `npm run build`, `git diff --check`, 한·영문 여섯 route의 정적 산출물과 localized `data-diagram-title`을 확인했다.

## 후속 규칙

`bluetape-writer`의 한국어 자연스러움 체크리스트에는 교정 범위와 문맥별 용어 선택을
명시한다. PR 단위 lessons 작성 책임은 `bluetape-workflow`의 lesson gate에 둔다.
다음 교정 PR에서는 초안 작성 시작 전에 lessons 문서를 만들고, PR 생성 전 검증 증거를 채운다.
