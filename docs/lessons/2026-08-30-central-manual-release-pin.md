# 중앙 매뉴얼 원본과 stable release pin 분리

## 배경

라이브러리 저장소의 `docs/manual`을 stable tag 이후에 수정하면 매뉴얼
commit과 코드 tag가 서로 다른 시점을 가리킨다. 반대로 tag 전에 최종
버전을 기록하면 아직 공개되지 않은 tag와 commit을 문서가 참조하게 된다.

## 결정

`bluetape4k-text`를 pilot으로 선정하고 매뉴얼 원본과 전용 검증 tooling을
`bluetape4k.github.io`로 이동했다. source registry의 `manual` descriptor는
`ownership`, 중앙 `sourceRoot`, `toolingRoot`를 명시한다. site sync는 코드
checkout(`--source`)과 중앙 매뉴얼 checkout(`--manual-source`)을 분리하며,
snapshot provenance에도 코드 SHA와 매뉴얼 authoring SHA를 별도로 기록한다.

## 배포 순서

1. stable release 전에는 중앙 `manifest.yaml`을 `contentStatus: in-progress`로
   두고, 미래 `releaseRef`·`releaseCommit`을 기록하지 않는다.
2. source tag, Maven Central artifact, GitHub Release를 exact SHA로 확인한다.
3. 중앙 manifest와 generated manifest를 exact release provenance로 갱신하고
   중앙 validator를 해당 tag의 code checkout에 실행한다.
4. site snapshot을 생성한 뒤 manual snapshot check, locale/asset parity, site
   build를 통과시킨다.
5. stable pin 이후 source repository에는 매뉴얼 원본을 다시 추가하거나
   수정하지 않는다.

## 배포 후 현재 버전 검증

Stable 매뉴얼 배포 성공만으로 사이트 전체의 현재 버전 안내가 갱신됐다고
판단하지 않는다. 배포 후에는 홈, 시작하기, 저장소 목록, 버전 거버넌스의
영문·한국어 페이지가 stable manifest의 `releaseRef`와 일치하는지 함께
검증한다. 이 저장소에서는 `dependencies-current-release.test.mjs`가 해당
표시 영역과 `bluetape4k-dependencies` stable manifest의 불일치를 차단한다.

중앙화되지 않은 저장소는 별도 cutover 전까지 기존 `docs/manual/**`
handoff를 사용한다. 중앙과 legacy 경로를 한 번의 sync에서 섞지 않는다.

## 검증 근거

- `bluetape4k-text` 원본 63개와 전용 tooling 17개를 복사하지 않고 이동했다.
- `0.3.0` tag `aead213d2d25307d7d3684226943a5f95c7411f2`를 대상으로 manifest,
  release, diagram validator와 EN/KO 계약이 통과했다.
- site manual sync의 legacy 회귀 테스트와 중앙 code/manual workspace 분리
  테스트가 통과했다.

이 pilot은 다른 저장소의 이전, 원격 push/merge, `dependencies 2.0.0` 실제
배포를 수행하지 않는다.
