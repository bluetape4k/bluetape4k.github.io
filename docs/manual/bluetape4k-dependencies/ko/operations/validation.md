# 검증 런북

catalog와 BOM source를 제공하는 `bluetape4k-dependencies` checkout에서 명령을 실행한다. release 증거를 수집할 때 중앙 manual checkout과 code checkout은 각각 clean 상태로 유지한다.

## Catalog와 artifact 검사

```bash
scripts/sync-managed-catalog.py --check --summary
scripts/verify-managed-artifacts.py --summary
python3 -m unittest tests/test_sync_managed_catalog.py
scripts/sync-shared-versions.py --workspace .. --check --summary
scripts/sync-dependabot-ignores.py --workspace .. --check --summary
```

이 검사는 생성 alias, published artifact coordinate, shared-version adoption, ignore-file parity를 다룬다. mutable snapshot이 production release에 안전하다는 증거는 아니다.

## Build와 snapshot 검사

```bash
./gradlew build --no-daemon --no-configuration-cache
curl -fsSL \
  https://central.sonatype.com/repository/maven-snapshots/io/github/bluetape4k/bluetape4k-dependencies/2.0.0-SNAPSHOT/maven-metadata.xml
```

Metadata timestamp와 build number를 읽은 뒤 BOM을 통한 버전 없는 child artifact 하나를 해석한다. catalog commit과 metadata 관찰값은 함께 기록하되 하나의 release SHA로 합치지 않는다.

## Manual source 검사

중앙 site checkout에서 실행한다.

```bash
git diff --check
npm run check:manual
npm test
npm run build
```

`npm run check:manual`은 site에 등록된 기존 stable snapshot을 검증한다. 이 snapshot 초안은 의도적으로 source-only이며 stable registry에 추가하지 않았으므로, 문서 검토에서 manifest·locale parity·relative link도 별도로 검사한다.

## 승격 증거

정확한 stable tag, release commit, public artifact metadata, downstream validation이 모두 일치할 때에만 stable 매뉴얼을 생성할 수 있다. 하나라도 없으면 `contentStatus: in-progress`를 유지하고 초안 manifest에는 `releaseRef`/`releaseCommit`을 넣지 않는다.
