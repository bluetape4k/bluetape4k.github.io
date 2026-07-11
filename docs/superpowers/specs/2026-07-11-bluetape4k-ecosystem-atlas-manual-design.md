# bluetape4k 생태계 지도와 전체 모듈 매뉴얼 설계

## 1. 목적

`bluetape4k.github.io`를 단순한 저장소 링크 모음에서 다음 세 가지 역할을 수행하는 공식 문서 허브로 개선한다.

1. bluetape4k 저장소와 모듈의 관계를 직관적으로 보여 준다.
2. 사용자가 해결하려는 과제에서 적합한 라이브러리, 모듈, workshop, 실제 애플리케이션으로 안내한다.
3. `bluetape4k-projects`의 모든 등록 모듈에 README보다 상세한 영문·한글 공식 매뉴얼을 제공한다.

첫 적용 대상은 사이트 전체 디자인과 `bluetape4k-projects` 하나다. 다른 라이브러리 저장소의 상세 매뉴얼은 이번 범위에 포함하지 않지만, 이후 같은 구조로 확장할 수 있어야 한다.

## 2. 설계 원칙

- 문서는 링크 목록이 아니라 문제 해결과 학습을 지원하는 제품 문서여야 한다.
- 첫 화면은 관계와 범위를 보여 주고, 하위 페이지는 긴 문서를 읽기 좋은 고밀도 레이아웃을 사용한다.
- README는 저장소 소개와 기여자 진입점으로 유지하고, 사용자용 상세 매뉴얼은 저장소의 `docs/manual/`에 둔다.
- 매뉴얼 원본은 코드와 같은 저장소에서 관리한다. 사이트는 검증된 스냅샷만 게시한다.
- 모든 매뉴얼은 영문과 한글을 동등하게 제공한다.
- 저장소, 모듈, workshop, 참조 애플리케이션의 관계를 문서 문맥 안에서 연결한다.
- 사이트 배포는 재현 가능해야 하며, 일부만 동기화된 상태를 게시하지 않는다.

## 3. 정보 구조

### 3.1 생태계의 세 층

사이트의 최상위 탐색 모델은 다음 세 층이다.

- **Build**: 실제 제품 코드에서 사용하는 라이브러리 저장소와 모듈
- **Learn**: 단계별 chapter와 실행 가능한 코드를 제공하는 workshop
- **Apply**: 여러 라이브러리와 패턴을 결합한 참조 애플리케이션, production recipe, benchmark

사용자는 특정 기술 영역이나 과제를 선택한 뒤 세 층을 오갈 수 있어야 한다. 예를 들어 Redis near-cache 매뉴얼은 관련 모듈, workshop 예제, 실제 적용 recipe를 함께 연결한다.

이 세 층은 Kotlin/JVM 생태계의 주 탐색 축이다. `bluetape-go`, `bluetape-rs`, `bluetape-py`와 각 언어 workshop은 Kotlin Build/Learn 열에 섞지 않는다. 이들은 동일 조직에서 관리하는 별도 언어 생태계이므로 주 지도 아래의 **Other languages** 영역에서 Go, Rust, Python별로 독립된 library → workshop 흐름을 제공한다.

### 3.2 두 단계 지도

지도는 두 단계로 제공한다.

1. **생태계 지도**: bluetape4k 조직의 저장소, workshop, 참조 애플리케이션과 역할을 보여 준다.
2. **저장소 지도**: 선택한 저장소의 도메인 그룹과 모듈 관계를 보여 준다.

이번 범위에서는 `bluetape4k-projects`의 저장소 지도를 구현한다. 지도는 장식용 그래픽이 아니라 검색과 페이지 이동을 위한 탐색 UI다. 모바일과 키보드 환경에서는 동일한 내용을 계층형 목록으로 사용할 수 있어야 한다.

### 3.3 선택한 지도 표현

검토한 표현은 다음 세 가지다.

1. **단순 카드 그리드**: 구현과 반응형 처리는 쉽지만, 관계 데이터가 시각적으로 드러나지 않아 현재 결과처럼 링크 목록으로 보인다.
2. **자유 배치 네트워크 그래프**: 관계선은 풍부하지만 노드가 많아질수록 위치가 불안정하고, 문서 탐색과 모바일 접근성이 나빠진다.
3. **단계형 생태계 맵**: Build → Learn → Apply를 가로 흐름으로 고정하고, 각 단계 안에서 도메인 cluster와 연결선을 보여 준다. 선택한 노드의 실제 관계는 강조하고 나머지는 낮은 대비로 유지한다.

세 번째 방식을 채택한다. 첫 화면은 사용 흐름을 즉시 설명하고, 노드를 선택하거나 저장소 지도로 내려가면 분야별 전체 지형과 실제 관계를 더 자세히 보여 준다. 즉 상위는 흐름 중심, 하위는 구조·관계 중심이다.

### 3.4 맵의 공간 구조

- 중앙의 주 무대는 **Kotlin/JVM ecosystem**이다.
- Build에는 Foundation, Data, Web, Distributed systems, Observability, Testing 같은 repository cluster를 둔다.
- Learn에는 core workshop과 Exposed, R2DBC, Timefold 등 목적별 workshop cluster를 둔다.
- Apply에는 reference application, production recipe, benchmark를 둔다.
- repository와 workshop, workshop과 application 사이에는 catalog의 `relations`를 사용한 연결선을 표시한다.
- hover, focus, 선택 상태에서는 관련 경로만 밝게 강조하고 설명 패널에 다음 이동 목적을 표시한다.
- Other languages는 주 무대와 연결선을 공유하지 않는 하단 rail로 분리하고 Go, Rust, Python의 독립 생태계를 각각 표시한다.
- 모바일에서는 연결선을 제거하고 Kotlin 단계와 Other languages를 접을 수 있는 순서형 section으로 바꾼다.

### 3.5 하위 문서 유형

- **Repository hub**: 저장소 역할, 도메인 지도, 권장 학습 순서, 관련 workshop
- **Task guide**: HTTP 호출, 캐시, 직렬화, 데이터 접근, 관측성과 같은 문제 중심 안내
- **Module manual**: 개별 모듈의 전체 사용자 매뉴얼
- **Workshop path**: 학습 목표, 선행 지식, chapter 순서, 관련 라이브러리
- **Engineering journal**: 설계 결정, benchmark, 운영 경험과 trade-off
- **Reference**: artifact 좌표, 호환성, 소스, 테스트, 관련 API

## 4. 화면 방향

### 4.1 홈과 허브

홈과 저장소 허브는 어두운 기술 지도 스타일을 사용한다. 배경에는 절제된 grid와 단계 간 흐름을 나타내는 lane을 사용하고, 노드는 둥근 카드보다 지도상의 장소처럼 보이는 compact panel로 표현한다. 저장소와 모듈은 색상만으로 구분하지 않고 레이블, 그룹, 유형 표식을 함께 제공한다.

상단에는 Kotlin/JVM이라는 명확한 범위 표식과 Build/Learn/Apply 단계 설명을 둔다. 검색과 기술 영역 필터는 맵의 보조 수단으로 유지하며, 필터를 눌러 열 전체를 숨기는 대신 관련 경로를 강조하는 방식으로 동작한다. 지도 아래에는 Other languages rail을 시각적으로 분리해 Go, Rust, Python을 Kotlin 생태계의 일부로 오해하지 않게 한다.

### 4.2 매뉴얼

매뉴얼은 고밀도 문서 레이아웃을 사용한다.

- 왼쪽: 현재 저장소와 모듈의 계층 탐색
- 가운데: 문서 본문, 코드 예제, 표, 주의사항
- 오른쪽: 현재 페이지 목차, 관련 소스와 테스트
- 상단: breadcrumb, 언어 전환, 검색, 원본 커밋 정보
- 하단: 관련 task guide, workshop chapter, 다음 문서

작은 화면에서는 왼쪽 탐색과 오른쪽 목차를 접을 수 있어야 하며, 본문 읽기 흐름을 우선한다.

### 4.3 기술 저널

블로그와 설계 배경은 편집형 화면을 유지한다. 매뉴얼의 정확한 사용법과 저널의 의사결정 배경을 혼합하지 않고 상호 링크한다.

## 5. 매뉴얼 원본 구조

`bluetape4k-projects`에 다음 구조를 추가한다.

```text
docs/manual/
├── manifest.yaml
├── en/
│   ├── index.md
│   ├── getting-started.md
│   ├── architecture/
│   ├── guides/
│   └── modules/<module-id>.md
└── ko/
    ├── index.md
    ├── getting-started.md
    ├── architecture/
    ├── guides/
    └── modules/<module-id>.md
```

매뉴얼 원본은 사이트 구현에 종속되지 않는 Markdown과 YAML frontmatter를 사용한다. `manifest.yaml`은 도메인 그룹, 모듈 ID, Gradle project path, artifact 좌표, locale 문서 경로, 관련 workshop과 소스 링크를 선언한다.

## 6. 모든 모듈의 필수 내용

`settings.gradle.kts`가 Gradle subproject로 등록하는 모든 first-party 모듈은 영문과 한글 문서를 각각 하나씩 가져야 한다. root project와 `buildSrc` 같은 included build logic만 제외한다. 배포 라이브러리는 모듈 매뉴얼을, `examples/`와 `benchmark/` 모듈은 같은 깊이의 학습·실험 문서를 제공한다.

각 모듈 문서는 다음 내용을 반드시 포함한다.

1. 해결하는 문제
2. 사용해야 할 때와 사용하지 말아야 할 때
3. Maven/Gradle 좌표와 관련 모듈
4. 핵심 개념과 내부 동작
5. 실행 가능한 빠른 시작
6. 주요 API를 과제별로 설명
7. 실전 사용 패턴
8. 프레임워크와 coroutine 통합 방식
9. 구성 옵션과 기본값
10. 오류 처리와 실패 경계
11. 성능, 동시성, 보안 주의사항
12. 테스트 방법
13. 관련 workshop chapter와 예제
14. 호환성, 제약, 알려진 한계
15. 소스 코드와 테스트 링크

내용이 적용되지 않는 항목은 생략하지 않는다. 적용되지 않는 이유를 짧게 명시해 문서 누락과 실제 비적용을 구분한다.

## 7. 동기화와 데이터 흐름

동기화는 검증된 스냅샷 방식으로 구현한다.

```text
bluetape4k-projects/docs/manual
        ↓ validate + sync
bluetape4k.github.io/src/content/manual
        ↓ Astro/Starlight build
GitHub Pages
```

사이트 저장소는 다음 정보를 함께 기록한다.

- 원본 저장소 이름
- 원본 branch 또는 tag
- 원본 commit SHA
- 동기화 시각
- manifest schema version

사이트 빌드가 원격 저장소의 가변 상태를 직접 읽지 않는다. 동기화 도구가 원본을 검증한 뒤 사이트 저장소에 스냅샷을 반영하고, 사이트 CI는 스냅샷과 메타데이터의 일관성을 다시 검사한다.

## 8. 검색과 연결

검색 인덱스는 다음 항목을 공통 문서 모델로 다룬다.

- 저장소
- 도메인 그룹
- 모듈과 artifact
- task guide
- workshop과 chapter
- 참조 애플리케이션
- engineering journal

검색 결과는 문서 유형과 Build/Learn/Apply 층을 표시한다. 모듈 페이지는 관련 task guide와 workshop을, workshop 페이지는 사용하는 라이브러리와 모듈을 역방향으로 연결한다.

## 9. 실패 처리

다음 조건에서는 동기화 또는 배포를 실패시킨다.

- 등록된 Gradle 모듈에 대응하는 매뉴얼이 없음
- 영문과 한글 문서가 1:1로 대응하지 않음
- manifest에 중복되거나 존재하지 않는 모듈이 있음
- artifact 좌표가 실제 빌드 설정과 다름
- 내부 링크, workshop 링크, 소스 또는 테스트 경로가 잘못됨
- 필수 문서 섹션이 없음
- 사이트 스냅샷과 기록된 원본 commit이 일치하지 않음

동기화는 임시 위치에서 전부 검증한 뒤 한 번에 교체한다. 실패 시 기존에 검증된 사이트 스냅샷을 유지한다.

## 10. 접근성과 반응형 동작

- 지도 기능은 pointer 없이 키보드로 사용할 수 있어야 한다.
- 지도와 같은 정보를 계층형 목록으로도 제공한다.
- 관계선은 장식이며 접근성 트리의 유일한 정보 전달 수단이 아니다.
- 색상 외에 레이블, 아이콘, 그룹 제목으로 유형을 구분한다.
- 본문 제목 구조와 landmark를 의미에 맞게 사용한다.
- 코드 블록, 표, 경고 문구는 작은 화면에서 가로 스크롤이나 재배치가 가능해야 한다.
- 영문과 한글에서 navigation 폭과 줄바꿈을 각각 검증한다.

## 11. 검증 기준

### 11.1 원본 저장소

- `settings.gradle.kts`의 등록 모듈과 manifest가 정확히 대응한다.
- root project와 included build logic을 제외한 모든 등록 subproject에 영문과 한글 문서가 있다.
- 각 문서가 15개 필수 항목을 충족한다.
- 코드 예제와 artifact 좌표가 실제 소스와 빌드 설정에 맞는다.
- 관련 workshop과 테스트 경로가 존재한다.

### 11.2 사이트 저장소

- 동기화 도구의 check 모드가 변경 필요 여부를 정확히 보고한다.
- locale parity와 내부 링크 검사가 통과한다.
- Astro/Starlight build가 통과한다.
- 지도, 목록 fallback, 검색, breadcrumb, 언어 전환을 검증한다.
- Kotlin/JVM 노드와 Other languages 노드가 서로 다른 영역과 탐색 landmark에 렌더링되는지 검증한다.
- 관계 강조가 hover뿐 아니라 keyboard focus에서도 동일하게 동작하는지 검증한다.
- 데스크톱과 모바일의 대표 viewport에서 탐색 흐름을 검증한다.
- GitHub Pages 배포 후 대표 영문·한글 경로와 정적 자산을 확인한다.

## 12. 구현 경계

이번 구현은 다음을 포함한다.

- `bluetape4k.github.io`의 새로운 생태계 지도와 문서 디자인 시스템
- Build/Learn/Apply 탐색 구조
- `bluetape4k-projects` 저장소 허브와 모듈 지도
- `bluetape4k-projects`의 모든 등록 모듈에 대한 영문·한글 상세 매뉴얼
- 두 저장소 사이의 검증·동기화 도구
- 사이트 검색, 링크, locale parity, 빌드 검증

다음은 포함하지 않는다.

- 다른 bluetape4k 라이브러리 저장소의 전체 모듈 매뉴얼 작성
- workshop 저장소 내부 문서의 전면 재작성
- GitHub Pages에서 다른 호스팅 제품으로의 이전
- 자동 생성 API reference 시스템 도입

## 13. 완료 조건

- 사용자가 홈에서 Build, Learn, Apply 중 하나를 선택해 관련 저장소나 학습 경로로 이동할 수 있다.
- `bluetape4k-projects`의 모든 등록 subproject를 지도, 목록, 검색으로 찾을 수 있다.
- root project와 included build logic을 제외한 모든 등록 subproject에 README보다 상세한 영문·한글 문서가 존재한다.
- 매뉴얼에서 관련 workshop과 실제 예제로 이동할 수 있다.
- 저장소 원본과 사이트 스냅샷의 불일치를 자동으로 탐지한다.
- 검증과 GitHub Pages 배포가 통과하고 대표 공개 경로를 확인한다.
