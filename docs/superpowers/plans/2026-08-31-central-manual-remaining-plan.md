# 중앙 매뉴얼 이동 계획

## 목표

가장 작은 `bluetape4k-text` 파일럿에서 확정한 경계를 나머지 7개 저장소에
적용한다. 매뉴얼과 매뉴얼 도구는 복사하지 않고 중앙 사이트로 이동하며,
소스 저장소에는 해당 경로를 남기지 않는다.

## 범위

- 대상: `bluetape4k-projects`, `bluetape4k-exposed`, `bluetape4k-aws`,
  `bluetape4k-graph`, `bluetape4k-image`, `bluetape4k-javers`,
  `bluetape4k-leader`
- 중앙 원본: `docs/manual/bluetape4k-<slug>`
- 중앙 도구: `scripts/manual/repositories/bluetape4k-<slug>`
- 변경: GitHub Pages registry, manifest provenance, README 링크와 검증 래퍼
- 제외: `bluetape4k-dependencies` 2.0.0 tag/publication/dispatch와 원격
  push, PR, merge

## 순서

1. 각 저장소의 원본 경로와 중앙 목적지 부재를 확인한다.
2. `mv`로 매뉴얼과 도구를 중앙 사이트 worktree로 이동한다.
3. 중앙 registry·manifest·경로 계약과 소스 README 링크를 갱신한다.
4. 원본 blob 동일성, 중앙 매뉴얼 계약, release/diagram 계약, Ruby/npm/build
   검증을 수행한다.
5. 각 격리 브랜치의 변경과 DoD 증거만 남기고 원격 반영은 보류한다.

## 완료 조건

- 소스 7개 저장소에 `docs/manual`과 `scripts/manual`이 존재하지 않는다.
- 중앙 사이트 registry가 8개 중앙 매뉴얼을 가리킨다.
- 매뉴얼 본문·자산은 이동 전 Git blob과 중앙 파일의 내용이 일치한다(중앙 provenance와
  generated snapshot은 새 경로에 맞게 재생성). 매뉴얼 도구는 중앙 경로를 이해하도록
  필요한 최소 adapter를 적용하고 계약 테스트로 고정한다.
- 배포 지침은 stable tag와 artifact 검증 뒤 중앙 매니페스트를 갱신하도록
  유지된다.
- `dependencies` 실제 2.0.0 배포는 별도 세션에서 수행한다.
