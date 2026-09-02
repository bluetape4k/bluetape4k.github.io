# Snapshot 안전하게 소비하기

안정 `2.0.0` 이후 개발선은 `2.1.0-SNAPSHOT`이다. 변경 가능한 metadata이므로 저장소 설정, artifact availability, catalog provenance를 별도 검사로 취급한다. 안정 `2.0.0` 소비자는 이 저장소가 필요하지 않다.

## 저장소와 좌표

Sonatype snapshot 저장소와 timestamp가 없는 논리 version을 사용한다.

```text
Repository: https://central.sonatype.com/repository/maven-snapshots
Coordinate: io.github.bluetape4k:bluetape4k-dependencies:2.1.0-SNAPSHOT
```

Resolver는 `maven-metadata.xml`에서 timestamped POM을 선택한다. timestamped 파일명을 Gradle·Maven 의존성 선언에 직접 넣지 않으며, metadata 응답 성공만으로 모든 child BOM이 동시에 공개됐다고 판단하지 않는다.

Metadata는 2026-09-02에 조회했으며 `lastUpdated=20260902163844`, timestamp `20260902.163844`, build `1`을 반환했다. 이 값은 당시 관찰 증거일 뿐이므로 새 검증 전에 다시 조회한다.

## Gradle cache

```bash
./gradlew --refresh-dependencies dependencies
```

저장소와 논리 snapshot 좌표를 확인한 뒤 새 timestamp를 반영할 때만 `--refresh-dependencies`를 사용한다. 잘못된 저장소·좌표나 누락된 child artifact를 숨기는 해결책은 아니다.

## Maven cache

새 snapshot timestamp를 예상할 때 `-U`를 붙여 대표 Maven 빌드를 실행한다. Release 빌드에서는 snapshot 저장소를 비활성화하고 mutable snapshot을 사용한 애플리케이션을 배포하지 않는다.

## 수용 검사

- snapshot 저장소에서 BOM metadata와 POM이 해석된다.
- child BOM matrix가 의도한 catalog source와 일치한다.
- 버전 없는 대표 Bluetape4k 모듈이 해석된다.
- catalog checkout이 immutable commit이고 별도로 기록된다.
- stable 승격 전까지 결과가 개발 전용으로 표시된다.

정확한 release 경계와 명령은 [버전 거버넌스](version-governance.md)와 [검증](../operations/validation.md)을 참고한다.
