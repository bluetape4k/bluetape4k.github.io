# Issue #448 PR #449 인라인 코드 검토

## 검토 범위와 근거

- 저장소: `bluetape4k/bluetape4k.github.io`
- 검토 대상: PR #449의 당시 head `fe4c2d0f5e5bd2542b080ad68d4c2ccb9c3a7a0d`와 Issue #448 완료 조건
- 검토 파일: 13개 변경 파일 전체. 매뉴얼 릴리스 생성기와 회귀 테스트, manifest, 영문·한글 문서와 소스 링크를 확인했다.
- 이전 검토 증거: `codex exec review --uncommitted --ephemeral`는 actionable finding 없음으로 끝났다. 이 결과는 현재 exact-head native review를 대신하지 않으며, 이번 판정은 별도의 인라인 검토다.
- 독립 reviewer 시도: native `code-reviewer`가 저장소를 읽기 전에 실패했다. 환경 오류는 `/opt/homebrew/Caskroom/codex/0.171.0/bin/codex-code-mode-host` 실행 파일 부재다. 이 시도는 독립 리뷰 PASS로 기록하지 않았다.
- 아래 판정은 main session의 inline review이며 독립 reviewer attestation이 아니다.

## 7-Tier 검토

| Tier | 결과 | 근거 |
|---|---|---|
| 1. Source와 데이터 흐름 | PASS | `scripts/manual/sync-manual.mjs:136-139`가 frontmatter의 따옴표·비따옴표 `develop-only` 값을 읽는다. `:243-294`는 모듈·장·자산 경로를 먼저 승인한 뒤 제외하고, `:297-311`, `:343-383`은 문서 집계·자산 목록·normalized manifest에 제외 상태를 반영한다. 기존 안전 경로 검증을 우회하지 않는다. |
| 2. Tests와 실패·재시도·건너뜀 | PASS (기존 증거) | `tests/manual/sync.test.mjs:242-308`은 모듈, 장, 한 locale만 표시된 가이드, 모듈 자산, manifest, catalog와 파일 집계를 확인한다. 기존 로컬 기록은 `npm test` 301/301, `npm run check:manual`, `npm run build` 통과다. 이번 inline review에서는 테스트를 다시 실행하지 않았다. |
| 3. CI와 toolchain | PASS (당시 head) | PR run `45612751591`의 `Build`는 당시 exact head에서 SUCCESS, `Deploy`는 SKIPPED였다. 이후 review artifact가 PR에 추가되면 새 head CI를 다시 확인해야 한다. |
| 4. API와 ABI | PASS | 이번 PR은 Kotlin/JVM 공개 API나 바이너리 ABI를 바꾸지 않는다. 릴리스 manifest와 문서 출력만 변경하며 schema version은 유지된다. |
| 5. Security와 lifecycle | PASS | 신규 dependency, 자격 증명, database 자원 수명 변경은 없다. manifest 경로와 자산을 승인한 뒤 filtering하며 사용자 입력을 코드로 실행하지 않는다. |
| 6. 문서·locale·source links | PENDING | EN/KO 문서 쌍이 있고 Tink Table DSL 링크는 실제 `TableExtensions.kt`를 가리킨다. Tenant JDBC 설명은 현재 registry 구현의 lookup, 소유권 이전과 종료 순서에 부합한다. Exposed 공식 문서는 `newSuspend`, R2DBC `suspendTransaction`, 관계 `Flow`, `attach()` 설명을 뒷받침한다. 다만 새 R2DBC DAO 매뉴얼의 `develop` source target은 아래 P1에 걸린다. |
| 7. Historical evidence와 issue traceability | FAIL | Issue #448은 PR에 연결되어 있다. 그러나 새 R2DBC DAO 페이지가 가리키는 모듈은 canonical `develop`에 없고, 구현 issue #942는 OPEN이며 연결된 open PR도 없다. |

## P1 발견 사항

**P1 — R2DBC DAO 매뉴얼이 아직 통합되지 않은 모듈을 `develop` 기준으로 선언한다.**

- 위치: `docs/manual/bluetape4k-exposed/en/modules/bluetape4k-exposed-r2dbc-dao.md:7-10`, `docs/manual/bluetape4k-exposed/manifest.yaml:512-522`
- 증거: 문서는 `sourceDir: exposed/r2dbc-dao`, `releaseRef: develop`, `releaseStatus: develop-only`를 선언한다. live Exposed `develop`의 `exposed/r2dbc-dao` 조회는 404이며, Issue #942는 2.2.0 milestone에서 OPEN이다. 연결된 open Exposed PR은 없다. 해당 module path는 로컬 `feat/issue-942-r2dbc-dao` worktree에만 있으며 그 worktree의 module 파일은 아직 untracked다.
- 영향: `develop-only`는 안정판 매뉴얼 결과물에서 문서를 제외하지만, `develop` 코드에 없는 모듈 경로를 제공하지는 않는다. 현재 ReleaseContract도 `develop-only` 매뉴얼을 source-link 검사에서 건너뛰므로, 그 검사 통과는 해당 개발 문서의 실제 `develop` 경로를 증명하지 않는다 (`scripts/manual/repositories/bluetape4k-exposed/release_contract.rb:58-63`).
- 조치: Exposed #942 구현을 `develop`에 통합한 뒤 이 문서와 manifest를 다시 검증한다. 통합 전에는 이 문서가 포함된 PR #449를 병합 준비 상태로 올리지 않는다. 별도 이슈는 만들지 않는다. 기존 #942가 코드 의존성을 추적한다.

## API 출처 대조

JetBrains Exposed 공식 문서의 현재 페이지를 대조했다. `newSuspend()`는 즉시 insert하고, R2DBC DAO collection은 `Flow`이며, 다른 transaction에서 Entity를 재사용하려면 `attach()`가 필요하다. R2DBC DAO artifact는 실험 API이고 JDBC DAO artifact와 같은 simple-name 타입을 선언한다.

- [JetBrains Exposed 1.6.0 변경 사항](https://www.jetbrains.com/help/exposed/whats-new-160.html)
- [JDBC DAO에서 R2DBC DAO로 이전](https://www.jetbrains.com/help/exposed/migrating-from-jdbc-to-r2dbc-dao.html)
- [Exposed 의존성 구성](https://www.jetbrains.com/help/exposed/adding-dependencies.html)

## Writer checklist

- SPW-01: PASS — 검토 대상, 독자, 목적, Issue/PR, source ref, 공식 API 출처와 미통합 모듈 상태를 고정했다.
- SPW-02: PASS — 검토 범위, 7개 tier, 위치가 있는 finding, 심각도, disposition, 검증 공백과 verdict를 기록했다.
- SPW-03: PASS — 한국어 기술 문체와 용어를 확인하고 코드 식별자·경로·명령·URL을 보존했다.
- SPW-04: PASS — line evidence를 Issue #448/#942, live GitHub 상태, 현재 코드 checkout, Exposed 공식 문서와 대조했다.
- SPW-05: PASS — 최종 Markdown을 다시 읽고 표, 링크, 코드 식별자와 DoD 순서를 확인했다.

## 검증과 판정

- 이번 inline review는 기능 코드에 대해 read-only였다. 리뷰 기록을 추가했으며 테스트는 실행하지 않았다.
- 당시 exact-head hosted check: `Build` SUCCESS; `Deploy` SKIPPED.
- P0=0, P1=1, P2=0, P3=0.

Inline verdict: FAIL; P0=0, P1=1.
