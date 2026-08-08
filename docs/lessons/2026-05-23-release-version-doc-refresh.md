# 릴리스 버전 문서 갱신

## 배경

공식 웹사이트는 생태계 전체에 갱신된 라이브러리 기준선이 릴리스된 뒤에도 `bluetape4k-dependencies` 1.0.0과 Exposed 1.8.0 quick-start 예제를 계속 보여주고 있었다.

## 결정

quick-start 예제와 버전 거버넌스 페이지를 현재 공개 기준선으로 갱신한다.

- `io.github.bluetape4k:bluetape4k-dependencies:1.1.1`
- `io.github.bluetape4k:bluetape4k-bom:1.9.0`
- `io.github.bluetape4k.exposed:bluetape4k-exposed-bom:1.9.0`
- `io.github.bluetape4k.aws:bluetape4k-aws-bom:0.2.0`
- `io.github.bluetape4k.graph:bluetape4k-graph-bom:0.4.0`
- `io.github.bluetape4k.leader:bluetape4k-leader-bom:0.2.0`
- `io.github.bluetape4k.image:bluetape4k-image-bom:0.1.1`
- `io.github.bluetape4k.javers:bluetape4k-javers-bom:0.1.1`
- `io.github.bluetape4k.text:bluetape4k-text-bom:0.1.1`

저장소별 BOM 좌표가 실제로 공개됐고 public quick-start에 사용할 의도가 확인되지 않은 경우에는 저장소별 BOM 안내를 일반적으로 유지한다.

## 결과

영어와 한국어 home/getting-started/version-governance 페이지가 새 사용자를 최신 중앙 dependency BOM, core bluetape4k BOM, 저장소별 BOM 버전으로 안내하도록 갱신됐다. 저장소 맵에도 공개된 각 라이브러리 저장소의 최신 릴리스 버전이 표시된다.

## 검증

- Maven Central `repo1`에서 공개된 BOM POM이 200을 반환했다.
- `git diff --check`
- `npm run build`

## 향후 가이드

각 release train 뒤에는 동일한 release checklist 단계에서 웹사이트 quick start와 version governance를 갱신한다. public entrypoint 페이지에 오래된 BOM 예제를 남겨두지 않는다.
