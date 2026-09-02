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

이 검사는 생성 alias, published artifact coordinate, shared-version adoption, ignore-file parity를 다룬다. 공개 릴리스와 provenance 검사를 보완하지만 대체하지 않는다.

## Build와 안정 artifact 검사

```bash
./gradlew build --no-daemon --no-configuration-cache
curl -fsSL \
  https://repo1.maven.org/maven2/io/github/bluetape4k/bluetape4k-dependencies/2.0.0/bluetape4k-dependencies-2.0.0.pom
```

BOM을 통해 버전 없는 대표 하위 artifact를 해석하고 공개 POM을 release catalog와 비교한다. Code tag, site authoring commit, artifact 관찰을 별도로 기록한다.

## Manual source 검사

중앙 site checkout에서 실행한다.

```bash
git diff --check
npm run check:manual
npm test
npm run build
```

`npm run check:manual`은 등록된 stable snapshot, generated manifest, locale parity, 공개 routing 계약을 검증한다.

## 승격 증거

이 매뉴얼은 정확한 `2.0.0` tag, release commit, public artifact metadata, downstream validation이 모두 일치한 뒤 생성했다. 다음 릴리스도 같은 gate를 반복하며 이 `2.0` snapshot을 다시 쓰지 않는다.
