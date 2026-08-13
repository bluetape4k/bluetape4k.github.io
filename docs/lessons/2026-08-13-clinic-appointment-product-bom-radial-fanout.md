# 방사형 fan-out 연결선을 구조로 검증하기

## 배경

예약 서비스 시리즈의 상품 BOM 다이어그램은 `패키지 상품` 하나가 `사전 상담`, `사전 검사`, `본 시술`, `진정 관리`, `사후 점검`으로 갈라지는 구조를 보여 준다. 독자가 보아야 할 핵심은 개별 화살표 다섯 개가 아니라, 하나의 상품에서 다섯 구성 항목이 나온다는 공통 출발 관계다.

이 관계를 고치는 과정에서 같은 문제가 여러 번 반복됐다.

- 패키지 상품에서 나온 선이 위쪽 trunk에만 합류해, 아래쪽 항목은 공통 출발점이 없는 것처럼 보였다.
- source link와 세로 trunk를 별도 path로 나누면서 접점이 직각으로 남았다.
- 분기 path 앞에 짧은 직선을 둔 뒤 `Q`를 추가해, 직선과 rounded corner가 겹쳤다.
- 각 branch의 corner는 둥글어졌지만 첫 번째 꺾임의 x 좌표가 달라 fan-out 전체가 흐트러졌다.
- 일반 connector 감사는 `.bus` 구조 path를 세지 않아, 눈에 보이는 결함이 있어도 `failures=0`을 출력했다.

마지막 항목이 특히 중요하다. 당시 감사 결과는 `paths=24 q_bends=22 failures=0`이었지만, 그 수치에는 문제의 구조 bus가 들어 있지 않았다. 자동 검사가 통과했다는 사실과 사용자가 지적한 출발점 형상이 맞다는 사실은 서로 다른 주장인데, 이를 같은 것으로 취급했다.

## 기대 구조

목적지가 출발점의 위와 아래에 함께 놓이면 이 fan-out은 위쪽으로 합류한 뒤 아래로 이어지는 trunk가 아니다. 하나의 source stem에서 상·하 arm이 동시에 갈라지는 방사형 `ㅓ` 구조다.

| 요소 | 불변식 |
| --- | --- |
| source stem | 패키지 상품에서 보이는 수평선은 하나다. |
| junction | 상단 arm과 하단 arm은 stem의 정확히 같은 끝점에서 시작한다. |
| rounded arms | 두 arm은 모두 첫 segment로 `Q`를 사용한다. |
| bend axis | 상·하 arm의 첫 bend가 끝나는 x 좌표는 같다. |
| direction | 상단 arm은 junction에서 위로, 하단 arm은 아래로 계속된다. |
| structural path | stem과 두 arm은 세 개의 `M` subpath를 가진 하나의 bus path에 들어간다. |
| target branch | 각 branch는 공통 bend x축에서 시작하고, 첫 segment가 `Q`여야 한다. |
| overlap | branch의 `Q` 앞에 별도 `H`나 `V`를 두지 않는다. |

현재 상품 BOM의 좌표 계약은 다음과 같다.

- 패키지 stem: `M 450 585 H 481`
- 공통 junction: `(481, 585)`
- 공통 bend x축: `x=505`
- 상단 arm: `M 481 585 Q 505 585 505 561 V 362`
- 하단 arm: `M 481 585 Q 505 585 505 609 V 967`
- 다섯 branch의 시작 x 좌표: 모두 `505`

이 좌표는 단순한 미관 설정이 아니다. “하나의 상품에서 여러 구성 항목이 나온다”는 관계를 눈에 보이는 형태로 보존하는 모델이다.

## 실패한 접근과 이유

### 1. 위쪽 merge와 계속되는 trunk

source link를 위쪽 방향으로만 둥글게 연결하고 그 끝에서 세로선을 아래로 내리면, 위쪽 arm은 있지만 아래쪽 arm은 없다. 선이 이어져 있다는 이유만으로 공통 출발점이 표현되지는 않는다. source junction을 기준으로 위와 아래가 동시에 갈라져야 한다.

### 2. source link와 trunk의 분리

link path와 trunk path를 따로 그리면 두 path가 만나는 점의 곡률을 하나의 명령으로 보장할 수 없다. 화면에서는 직각 접점이나 미세한 겹침으로 보이고, path 단위 감사에서는 경계가 사라진다. 같은 fan-out의 stem과 arm은 하나의 structural path로 묶어야 한다.

### 3. 직선을 남긴 채 `Q` 추가

branch가 `M ... H ... Q ...`로 시작하면 rounded corner를 넣었어도 첫 직선과 곡선이 같은 구간을 차지할 수 있다. branch는 공통 bend 축에서 `Q`로 바로 시작해야 한다. `Q`가 존재하는지만 세는 검사는 이 중복을 찾지 못한다.

### 4. branch만 개별 보정

다섯 branch를 각각 보기 좋게 고치면 각 선은 둥글어도 fan-out 전체의 정렬은 깨질 수 있다. 공통 source, 공통 junction, 공통 bend axis를 먼저 고정하고 branch를 그 축에 붙여야 한다.

### 5. 구조 bus를 제외한 자동 감사

기존 `diagram-mixed-corner-audit.py`는 marker나 connector 힌트가 있는 path를 중심으로 검사했다. `.bus`는 구조선이라는 이유로 대상에서 빠졌고, `M`으로 나뉜 subpath 경계도 보존하지 않았다. 그 결과 올바른 단일 bus는 subpath 사이를 가짜 직각으로 판정하고, 잘못된 분리형 bus는 검사하지 않는 두 문제가 함께 있었다.

## 결정

`bluetape-diagram`의 공통 connector 계약에 방사형 fan-out 규칙을 추가했다.

1. 구조 bus에 `data-fanout="radial"`과 안정적인 `data-fanout-id`를 둔다.
2. 같은 fan-out에 속한 branch에는 동일한 값을 `data-fanout-branch`로 기록한다.
3. 감사기는 `M` subpath 경계를 보존한다.
4. 같은 fan-out id에는 structural bus path가 정확히 하나만 있어야 한다.
5. bus는 하나의 stem과 두 개의 rounded arm, 총 세 subpath로 구성한다.
6. 두 arm은 같은 junction에서 출발하고 같은 bend x축을 공유해야 한다.
7. branch는 공통 축에서 `Q`로 바로 갈라져야 한다.

`data-*` 속성은 렌더링을 바꾸지 않는다. 사람이 보는 형상과 기계가 검사하는 구조를 연결하는 감사 표식이다.

## 테스트로 고정한 회귀

먼저 두 fixture를 추가해 기존 감사기의 한계를 실패로 재현했다.

- 올바른 단일 radial bus fixture: subpath 경계를 직각으로 오인해 실패했다.
- 잘못된 `link + trunk` fixture: structural path가 둘인데도 통과했다.

감사기를 수정한 뒤 두 fixture와 기존 corner 테스트가 모두 통과했다. 여기에 branch의 `Q` 앞에 직선이 있는 경우와 상·하 arm의 bend x 좌표가 다른 경우도 회귀 fixture로 고정했다. 전체 `bluetape-diagram` 테스트는 변경 전 50개에서 변경 후 54개가 됐다.

실제 한·영 상품 BOM SVG에도 구조 표식을 추가했고 다음 수치를 얻었다.

```text
diagram mixed-corner audit: PASS files=2 paths=26 q_bends=26 bus_paths=2 radial_fanouts=2 radial_branches=10 failures=0
```

이제 `failures=0`만으로는 충분하지 않다. 방사형 fan-out이 있는 자산에서는 `bus_paths`, `radial_fanouts`, `radial_branches`가 모두 0보다 커야 한다. 구조가 감사 대상에 실제로 포함됐다는 사실까지 증명해야 한다.

## 시각 검사의 초점

전체 PNG만 축소해서 보면 source junction의 작은 직각이나 겹침을 놓치기 쉽다. 방사형 fan-out을 수정한 뒤에는 최종 크기의 PNG와 함께 다음 범위를 확대해 본다.

- source card의 출구
- 하나의 stem
- stem 끝의 junction
- 상·하 arm의 첫 `Q`
- 공통 bend x축에서 출발하는 첫 branch들

확대 화면에서는 다음 질문에 각각 답해야 한다.

1. 출발선이 정말 하나인가?
2. 상단과 하단 arm이 같은 점에서 갈라지는가?
3. 첫 꺾임의 x 좌표가 같은가?
4. branch 앞에 겹친 직선이 없는가?
5. 선의 밝기와 굵기가 같은 connector family와 일치하는가?

“전체적으로 좋아 보인다”는 판정은 이 다섯 항목의 대체물이 아니다.

## 적용 범위와 예외

모든 fan-out을 대칭형으로 그릴 필요는 없다. 이 계약은 하나의 출발점에서 위·아래 목적지로 갈라지는 구조를 `data-fanout="radial"`로 선언한 경우에 적용한다. 목적지가 한쪽에만 있거나 의미상 순차 trunk가 맞다면 다른 topology를 사용하되, 그 선택을 semantic ledger에 기록한다.

## 향후 작업 순서

1. 독자가 읽어야 할 출발 관계를 먼저 한 문장으로 적는다.
2. source junction, arm 방향, bend axis를 좌표 불변식으로 정한다.
3. structural bus와 branch에 fan-out 메타데이터를 붙인다.
4. 잘못된 구조 fixture가 실패하는 RED 테스트를 먼저 만든다.
5. SVG를 렌더링하고 source junction 중심의 full-size crop을 검사한다.
6. 감사 결과에서 구조 count가 0이 아닌지 확인한다.
7. 같은 generator나 같은 시리즈의 관련 자산도 동일 패턴으로 검색한다.

이 순서를 지키면 “rounded corner가 있는가”만 확인하는 데서 멈추지 않고, 그 corner들이 하나의 올바른 fan-out 구조를 이루는지까지 검증할 수 있다.
