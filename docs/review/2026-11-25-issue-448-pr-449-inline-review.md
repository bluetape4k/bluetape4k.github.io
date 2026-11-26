# Issue #448 PR #449 인라인 코드 검토

## 검토 범위와 판정 기준

- 저장소: `bluetape4k/bluetape4k.github.io`
- 대상: PR #449의 재배치된 변경 집합, 코드 커밋 `68dea6d33b7dc283027cf597dacd7f48bbd18d28`, 기준 `develop` `ab9af40a3167834843fb54b75b014b6f49ee5d86`
- 범위: 안정판 Exposed 매뉴얼 manifest, 영문·한글 문서, release-contract 검증기와 회귀 테스트 등 12개 변경 파일
- 선행 상태: PR #449를 최신 `develop`에 rebase하고 PR #450의 이미 통합된 R2DBC DAO 문서를 충돌 해결 기준으로 채택했다. PR #449 고유 변경은 유지했다.
- 도메인 근거: Exposed Issue #942의 구현 PR #955가 `develop`에 병합되어 `exposed/r2dbc-dao` 경로가 존재한다. 그러나 Exposed `2.0.0` 태그의 안정판 inventory에는 이 모듈이 없다.
- 독립 검토 경계: 이 문서는 main session의 인라인 검토 기록이다. native `code-reviewer` 호스트 실패 이력은 독립 PASS로 간주하지 않으며, 최종 exact-head 독립 리뷰와 hosted CI를 별도 확인한다.

## 변경 검토

- manifest의 중복 `bluetape4k-exposed-r2dbc-dao` 항목을 제거하고 source/generated module identity가 유일하고 일치하는지 회귀 테스트를 추가했다.
- R2DBC DAO 영문·한글 문서에는 `releaseStatus: develop-only`를 함께 선언했다. release validator는 양 locale의 상태가 일치하는지 확인하고, 양쪽이 모두 개발 전용인 항목만 안정판 inventory·source existence 비교에서 제외한다. 문서 frontmatter, 안전한 경로, 구조, 자산 형식은 계속 검증한다.
- Tink와 serialization 문서는 안정 릴리스 `2.0.0` 및 실제 태그 소스인 `Tables.kt`를 가리키도록 복원했다.
- Tenant JDBC 설명은 실제 README 근거에 맞춰 `2.1.0-SNAPSHOT` 개발선 도입과 안정판 `2.0.0` BOM 제외를 명시했다.
- 공개 API/ABI, 의존성, 인증 정보, 런타임 자원 수명 변경은 없다.

## 7-Tier 검토

| Tier | 결과 | 근거 |
|---|---|---|
| 1. Source와 데이터 흐름 | PASS | `manual_contract.rb`가 bilingual `releaseStatus`를 읽고, 개발 전용 항목을 안정판 inventory 비교에서 제외하면서 문서·경로·구조 검증은 유지한다. `sync-manual.mjs`의 snapshot filtering과 생성 manifest 계약이 같은 상태를 사용한다. |
| 2. Tests와 실패·재시도·건너뜀 | PASS | `npm test -- --test-concurrency=1`: 302 pass, 0 fail, 0 skipped. Ruby 계약 테스트: 11 runs, 48 assertions, 0 failures/errors/skips. |
| 3. CI와 toolchain | PENDING | 로컬 build는 통과했지만, 새 exact head를 push한 뒤 hosted `Build`와 `Deploy` 결과를 다시 읽어야 한다. |
| 4. API와 ABI | PASS | Kotlin/JVM 공개 API와 ABI를 변경하지 않고 문서, manifest, 검증기와 테스트만 조정했다. |
| 5. Security와 lifecycle | PASS | 신규 dependency·credential·database lifecycle 변경이 없고, 개발 전용 filtering도 기존 안전 경로 검사를 우회하지 않는다. |
| 6. 문서·locale·source links | PASS | EN/KO 문서의 상태를 대칭으로 맞췄고, 안정판 Tink/serialization 링크와 Tenant JDBC 버전 설명을 실제 source/tag와 대조했다. 한국어 용어 감사는 4개 파일, findings 0이다. |
| 7. Historical evidence와 issue traceability | PASS | site Issue #448과 PR #449를 유지하고, Exposed Issue #942/PR #955의 통합 상태와 `2.0.0` tag inventory를 분리해 기록했다. |

## 검증 증거

- `git diff --check`: PASS
- `npm run check:manual`: `repositories=9`, PASS
- `npm run build`: 3,921 pages, Pagefind 5,161 HTML files, Visual Companion analytics 58/58, exit 0
- Exposed `2.0.0` tag export 및 strict release validator: 52 modules, 0 missing, commit `d632a0bc0662ae616b786f552150a7fabd1cee3e`
- 한국어 기술 용어 감사: 4 files, findings 0
- 기존 version-ui의 단발성 Pagefind race는 변경 파일과 무관했고 targeted rerun 8/8 및 전체 재실행 302/302로 해소를 확인했다.

## Writer checklist

- SPW-01: PASS — 검토 대상, Issue/PR, rebase 기준, stable/develop-only 경계와 source/tag 근거를 고정했다.
- SPW-02: PASS — 7개 tier, 위치가 있는 변경 근거, 검증 공백과 별도 merge gate를 기록했다.
- SPW-03: PASS — 한국어 기술 문체를 사용하고 코드 식별자·경로·명령·URL·버전을 보존했다.
- SPW-04: PASS — live GitHub 상태, Exposed tag inventory, 현재 checkout, 로컬 테스트·빌드 결과를 대조했다.
- SPW-05: PASS — 최종 Markdown을 다시 읽고 표, 수치, 상태와 verdict를 확인했다.

## 판정

- Inline review: `PASS; P0=0, P1=0, P2=0, P3=0.`
- Merge-ready 상태: hosted exact-head CI, 최종 독립 reviewer/architect, review/thread read-back을 반영하기 전까지 `PENDING`.
