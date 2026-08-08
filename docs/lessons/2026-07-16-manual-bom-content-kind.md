# Manual BOM content kind 경계

## 배경

Javers manual inventory는 repository BOM을 `bom`으로 분류한다. 웹사이트 content schema는 `library` 같은 user-facing manual kind는 허용하지만 Astro content kind로 `bom`은 허용하지 않는다.

## 근본 원인

manual sync pipeline이 repository inventory kind를 generated page frontmatter에 그대로 복사했다. 이로 인해 source repository taxonomy가 website presentation schema와 결합되어 Astro build가 Javers BOM 페이지를 거부했다.

## 결정

- release snapshot과 source manifest에서는 `bom`을 유지한다. 이는 유효한 source metadata이며 published release inventory의 일부다.
- website page frontmatter를 생성할 때만 `bom`을 `library`로 매핑한다.
- website schema를 약화하거나 repository 소유 metadata를 다시 쓰지 않고 rendering boundary에서 normalization한다.
- BOM manual을 게시하는 다른 repository를 추가하기 전에 이 경계를 regression test로 고정한다.

## 검증

```bash
node --test tests/manual/frontmatter.test.mjs
npm run check:manual -- --repository bluetape4k-javers
npm run build
```

## 향후 규칙

repository inventory가 더 풍부한 source kind를 도입하면 먼저 source taxonomy인지 user-facing website content kind인지 결정한다. provenance artifact에는 source taxonomy를 보존하고, 사이트가 더 좁은 vocabulary를 필요로 할 때 generated frontmatter boundary에 명시적이고 테스트된 매핑을 추가한다.
