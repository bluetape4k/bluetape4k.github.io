# README 다이어그램 소스 드리프트 규칙

## 배경

생성된 README 다이어그램은 보기 좋지만 deprecated 또는 이름이 바뀐 API를 포함한 오래된 Mermaid 내용을 그대로 보존할 수 있다.

## 결정

스타일 가이드는 class/API 다이어그램에서 복원된 Mermaid history보다 현재 소스 코드를 우선 기준으로 삼는다.

## 결과

생성된 SVG/PNG 자산을 승인하기 전에 deprecated API, 삭제된 클래스, 오래된 필드명, 관계 방향의 source drift를 확인하도록 가이드에 규칙을 추가했다.

## 검증

갱신된 가이드 문구를 검토하고 Exposed `HasIdentifier` correction과 맞췄다.

## 다음 작업

소스 모델이 현재 public API와 더 이상 일치하지 않으면 시각적으로 정교한 다이어그램도 거부한다.

## 2026-05-20 Class 및 ERD 배치 규칙

Class diagram과 ERD는 균일한 grid 이상의 배치 자유도가 필요하다. 이제 스타일 가이드는 자유 배치, 직교 관계 lane, 클래스나 테이블 내부를 가로지르는 connector path 거부를 요구한다.

`clinicId` 같은 반복 dependency나 공통 interface 구현 대상을 공유 lane으로 배치한다. 그러면 관계 묶음을 복잡한 화살표 다발로 해석하지 않아도 되므로 README, slides, blog에서 다이어그램을 재사용하기 쉽다.
