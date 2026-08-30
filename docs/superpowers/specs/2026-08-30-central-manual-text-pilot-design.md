# 매뉴얼 중앙 원본 이전 pilot 설계

## 상태

- 산출물: `bluetape4k-text` 매뉴얼 원본과 배포 계약의 중앙화 pilot
- 분류: Type A — 배포 경계와 여러 저장소의 기준 원본을 함께 바꾸는 변경
- 대상: `bluetape4k-text` (매뉴얼 48 Markdown, 전체 manual 파일 63개)
- 중앙 저장소: `bluetape4k/bluetape4k.github.io`
- 기준 소스 저장소: `bluetape4k/bluetape4k-text`
- 적용 branch: `docs/manual-centralize-text-pilot` (site, text, managed skill source)

## 문제와 결정

각 라이브러리 저장소의 `docs/manual`을 stable tag 뒤에 고치면 문서 commit과
코드 tag가 서로 다른 시점을 가리킨다. 반대로 tag 전에 최종 버전을 준비하면
아직 존재하지 않는 tag를 문서에 기록하게 된다.

이번 pilot은 매뉴얼의 기준 원본을 site 저장소로 옮기고, 코드 release와 문서
promotion을 분리한다.

1. 중앙 초안은 release 전에 작성할 수 있다. 이때 `publication.contentStatus`
   는 `in-progress`이고, 미래 tag나 미래 commit을 `releaseRef`/`releaseCommit`
   으로 기록하지 않는다.
2. stable tag와 public artifact를 먼저 증명한 뒤 중앙 manifest의
   `releaseRef`와 `releaseCommit`을 정확한 tag와 commit으로 pin하고
   `contentStatus: complete`로 바꾼다.
3. 중앙 원본에서 생성한 site snapshot은 source manual의 파생물이다. 과거
   minor snapshot은 다시 쓰지 않는다.
4. source repository에는 `docs/manual/**`와 manual 전용 tooling을 남기지
   않는다. 중앙 이전이 끝난 repository에서 두 원본을 동시에 유지하지 않는다.
5. 문서의 API·module·example 링크는 계속 코드 repository의 immutable release
   ref를 가리킨다. 중앙 site commit SHA와 코드 release SHA는 서로 다른
   provenance이며 하나로 합치지 않는다.

## 경로와 책임

| 역할 | 경로 | 책임 |
|---|---|---|
| 중앙 편집 원본 | `docs/manual/bluetape4k-text/` | `manifest.yaml`, EN/KO Markdown, assets, generated manifest, diagram inventory |
| 중앙 검증 tooling | `scripts/manual/repositories/bluetape4k-text/` | manifest export, manual/release/diagram/inventory 검사와 테스트 |
| site 파생 snapshot | `src/content/docs/manual/bluetape4k-text/`, `src/data/manual/bluetape4k-text*`, `public/manual-assets/bluetape4k-text/` | 공개 route와 과거 release 보존 |
| source repository | `bluetape4k-text` | 코드, release metadata, manual 원본 없음 |

`src/data/manual/repositories.json`의 `manual` descriptor가 중앙 원본과
tooling root를 선언한다. legacy repository는 descriptor를 생략하고 기존
`docs/manual` handoff를 central cutover 전까지 사용한다.

## Release contract

### Release 전

- 중앙 manual source와 EN/KO 문서를 develop 또는 승인된 authoring ref에서
  편집한다.
- 문서가 아직 stable release를 설명하지 않으면 `contentStatus`를
  `in-progress`로 유지한다.
- 미래 version/tag/commit을 stable provenance 필드에 넣지 않는다.
- source code checkout과 중앙 site checkout은 각각 clean 상태와 현재 SHA를
  기록한다.

### Stable promotion

- target tag가 annotated tag인지, exact release commit으로 resolve되는지,
  Maven Central artifact와 GitHub Release가 public인지 확인한다.
- source code checkout을 exact tag commit에 맞춘다.
- 중앙 `manifest.yaml`을 target `releaseRef`/`releaseCommit`으로 갱신하고
  generated manifest를 다시 만든다.
- central release validator로 module/example/evidence 존재, manifest parity,
  EN/KO parity, relative link와 asset 안전성, release source link를 검사한다.
- site sync로 현재 snapshot을 생성하고 `npm run check:manual` 및 site build를
  실행한다.
- stable promotion 뒤 source repository의 manual path를 수정하지 않는다.

### 역사 보존

기존 `0.2`와 `0.3` 공개 snapshot은 그대로 둔다. 중앙 manifest에는 이전
원본의 repository/path와 migration source commit을 기록해 cross-repository
이동으로 Git history가 자동 연결되지 않는 한계를 추적한다. 한 commit 안에
site SHA를 자기 자신으로 기록하지 않고, source release SHA와 중앙 manual
tree digest를 별도 provenance로 취급한다.

## 범위 밖

- 다른 7개 repository의 실제 이전
- `dependencies 2.0.0` tag, Maven Central publication, GitHub Release 생성
- 기존 snapshot의 재생성 또는 route 변경
- PR 생성, merge, branch 삭제, 원격 push

## 수용 기준

- [ ] `bluetape4k-text` source branch에 `docs/manual`과 manual 전용 tooling이
  없다.
- [ ] site branch에 63개 원본 파일과 중앙 descriptor가 있고 source bytes와
  byte-for-byte 동일하다.
- [ ] manifest/generated manifest가 중앙 경로와 migration provenance를
  나타낸다.
- [ ] central validator가 exact code tag와 중앙 원본을 함께 검증한다.
- [ ] `sync:manual`이 central descriptor를 통해 code source와 manual source를
  분리할 수 있고 legacy flow도 계속 통과한다.
- [ ] `bluetape-publish-jvm`의 PUB-10/REL-08과 checklist pressure test가
  중앙 초안 → stable tag 후 pin 순서를 명시한다.
- [ ] 기존 generated snapshots와 unrelated dirty worktree가 변경되지 않는다.
