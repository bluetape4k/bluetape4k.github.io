# `bluetape4k-text` 중앙 매뉴얼 pilot 실행 계획

설계: `docs/superpowers/specs/2026-08-30-central-manual-text-pilot-design.md`

## 1. 기준 상태 고정

- site, `bluetape4k-text`, managed chezmoi source의 worktree와 기존 dirty
  path를 기록한다.
- `bluetape4k-text`의 `docs/manual` 63개와 manual tooling 목록, 현재 stable
  `0.3.0`/`aead213d2d25307d7d3684226943a5f95c7411f2`를 ledger로 남긴다.
- site의 `npm run check:manual`과 text의 기존 manual validators를 baseline으로
  실행한다.

## 2. 설계·계약 commit

- 설계와 이 계획을 site worktree에 먼저 commit한다.
- 중앙 source root와 tooling root, legacy fallback, stable promotion 순서를
  명시한 뒤 구현에 들어간다.

## 3. 중앙 원본 이전

- text worktree의 `docs/manual/**`를 site의
  `docs/manual/bluetape4k-text/**`로 이동한다.
- manual 전용 `scripts/manual/**`와 tests를 site의
  `scripts/manual/repositories/bluetape4k-text/**`로 이동한다.
- source manifest의 `publication.sourceRoot`와 migration provenance를 중앙
  경로에 맞춘다.
- source worktree에서 이전된 경로를 제거하고 다른 코드·문서 변경은 건드리지
  않는다.

## 4. 중앙 sync/검증 계약

- repository registry에 central manual descriptor와 경로 검증을 추가한다.
- `sync-manual`이 `--manual-source`를 받아 code checkout과 manual checkout을
  분리하고, 기존 `--source` legacy invocation을 유지하게 한다.
- 중앙 tooling validator가 exact release tag/commit, manifest parity, 문서·asset
  안전성, locale parity, source inventory를 검사하게 한다.
- 중앙 source 검사와 generated snapshot 검사에 대한 회귀 테스트를 추가한다.

## 5. 배포 guidance 갱신

- managed source의 `bluetape-publish-jvm/SKILL.md` PUB-10, primary flow,
  completion output을 central manual contract로 갱신한다.
- managed source의 `references/release-checklist.md` REL-08과 pressure test를
  같은 계약으로 갱신한다.
- `chezmoi --source <pilot-worktree> apply` 후 live skill과 source parity,
  ownership를 확인한다. retired alias는 규칙을 소유하지 않으므로 수정하지
  않는다.

## 6. 검증과 handoff

- `git diff --check`, moved Ruby tests, central validator, site manual tests,
  `npm run check:manual`, `npm test`, `npm run build`를 실행한다.
- source/site/chezmoi 각 branch의 diff와 exact SHA를 확인한다.
- PR/merge/push/release/tag는 별도 승인 gate로 남기고, 미완료 항목과 다음
  repository cutover 순서를 DoD에 기록한다.

## 예상 DoD

- 변경 저장소: site, `bluetape4k-text`, managed chezmoi source
- 중앙 이전: text manual 63개 + manual tooling/tests
- 배포 지침: `bluetape-publish-jvm` PUB-10/REL-08 및 completion/pressure 문구
- 금지 범위: 다른 repository, Maven Central/GitHub Release, PR/merge/push,
  기존 snapshot history
