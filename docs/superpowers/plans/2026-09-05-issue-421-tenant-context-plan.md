# #421 Tenant context carrier 구현 계획

## 범위와 실행

목표는 한·영 carrier 비교 탐색기와 SVG/PNG를 소스 계약에 맞게 제공하는 것이다. Node ESM data model에서 HTML과 정적 자산을 생성한다. 기존 site registration을 재사용하며 새 dependency를 추가하지 않는다.

1. [x] 지침·GNO·현재 source·issue 확인. GNO github 초기 검색은 빈 결과이며 docs의 Reactor 매뉴얼을 조회한 뒤 현재 sibling 소스로 검증했다. Type E, 격리 worktree와 write scope를 설정했다.
2. [x] 데이터와 HTML: `src/data/visual-companions/wave2-tenant-context.mjs`, `scripts/generate-2-0-wave2-tenant-context.mjs`. `tenant.carriers`, `tenant.scenarios`, `buildStory(carrier,scenario)`에서 locale·상태를 생성한다. 반환 steps/outcome/status/after를 테스트한다.
3. [x] 정적 자산: `scripts/generate-2-0-wave2-tenant-context-visuals.mjs`, `public/assets/visual-companions/wave2/projects-tenant-context-carriers-{en,ko}.{svg,png}`, `docs/diagrams/visual-companions-wave2/`의 semantic ledger. 연결선 없는 네 소유 범위 비교이며 4개 card를 직접 검증한다.
4. [x] 등록: catalog, wave1-manual-links, Wave2 README 생성 원본과 결과. tenant / tenant-reactor / ktor-tenant 매뉴얼의 한·영 경로를 검증한다.
5. [x] 테스트: missing module RED 이후 `node --test tests/visual-companions/wave2-tenant-context.test.mjs` GREEN. nested restore, Ktor duplicate winner, immutable Reactor outer, unsupported coroutine propagation, 모든 24개 상태 조합을 확인한다.
6. [x] `npm test`, `npm run build`, manual/visual companion 검사, SVG semantic/text/XML/PNG 감사, Chromium 48개 locale/scenario와 반응형·테마·keyboard·동일 캡처 검증. 실패 시 원본을 수정하고 영향받은 검사를 재실행한다.
7. [ ] 독립 source/visual 검토와 한국어 lesson·review 완료. commit/push/PR 및 exact-head CI를 진행한다. merge 승인 전 멈춘다.

## 검증과 복구

한 번에 한 빌드만 실행한다. 데이터/HTML, 정적 자산, 등록의 write ownership을 나누며 작업자는 다른 변경을 되돌리지 않는다. 생성기 `--check`로 source/output 차이를 차단한다. diff-check 후 승인된 branch만 push한다. 원본 develop은 clean으로 보존한다.

## Workflow DoD

WF-00~04A, CG-01~05 완료. CG-06~15 및 E-03/05/06/07은 위 구현·검증 증거로 완료한다. CG-16~18은 새 PR 병합 승인 대기. ChezMoi/global self-audit 및 backend build는 site-only로 미적용이다. DIA common/workflow/architecture/semantic 규칙과 SPW-01~05를 설계·계획·review·lesson 각각에 적용한다. 설계/계획은 audience/계약/실패/수용 기준/검증/승인 연결을 읽고 한국어 기술 용어와 코드 token을 확인했다.
