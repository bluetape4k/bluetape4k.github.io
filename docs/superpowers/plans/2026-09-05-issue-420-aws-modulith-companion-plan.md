# #420 Spring Modulith 시각자료 구현 계획

## 승인과 작업 범위

대화의 첫 계획과 사용자의 스타일 선택·작업 지시에 따라 구현한다. 저장소 `bluetape4k/bluetape4k.github.io`, base `develop`, head `docs/issue-420-aws-modulith-companion`. 독립 worktree에서 진행하며 원본 checkout은 보존한다.

1. [x] 지침·이슈·스타일·소스 확인: 사용자/워크스페이스/저장소 AGENTS, workflow/maintenance/writer/diagram 계약을 읽었다. #420과 AWS #471을 확인했고 GNO 결과가 부족하여 직접 소스를 사용했다.
2. [x] `src/data/visual-companions/wave2-aws-modulith.mjs`: locale 데이터와 순수 시나리오 모델 작성. DIRECT 의미, 검증 이전 claim 금지, 중복 처리, 실패 후 ack 금지를 테스트한다.
3. [x] `scripts/generate-2-0-wave2-aws-modulith.mjs`와 `scripts/generate-2-0-wave2-aws-modulith-visuals.mjs`: HTML과 SVG·ledger를 생성한다. `--check`로 재생성 차이가 없어야 한다.
4. [x] `catalog.json`, `wave1-manual-links.mjs`, Wave2 README 생성 원본에 등록한다. 각 locale route와 PNG 링크가 존재해야 한다.
5. [x] `tests/visual-companions/wave2-aws-modulith.test.mjs`: 정상·실패·중복·취소 상태, locale·정적 자산·생성기 일치를 검증한다.
6. [x] `npm test`, `npm run build`, `git diff --check`, SVG/PNG 감사, desktop/mobile Chromium 검사와 독립 검토를 수행한다. 실패하면 해당 원본을 수정하고 영향받은 검사를 다시 실행한다.
7. [ ] 한국어 lesson과 검증 기록을 남기고 commit/push/PR 생성 후 exact-head CI와 review를 확인한다. merge 승인은 별도다.

## DoD와 미적용 항목

WF-00~04A와 CG-01~05: 완료. helper owner 경로와 상대 write scope를 보정했고 mutation-check가 running receipt 1개를 확인했다.
CG-06~10, E-03/05/06/07, DIA-* 및 시나리오 검증: 아래 로컬 완료 증거와 시각 검토 문서로 확인했다. CG-11~15: 승인된 PR 생성 및 CI 확인 진행 중. CG-16~18: 병합 승인 대기.
E-04 chezmoi, global self-audit, Kotlin compile/containers: site-only 변경으로 미적용. 새 의존성 없음. 원본 AWS 계약 검토는 읽기 전용 discovery다.
SPW-01~05: 한국어 설계/계획의 독자·근거·순서·완료 기준 및 최종 문구를 검토했다. 의미 변경과 근거 없는 완료 주장을 배제했다.

## 로컬 완료 증거

- 전체 Node test 276/276, 새 시나리오 검사 5/5.
- Chromium 58개 시나리오, 모바일/태블릿 8개 조건, 테마 캡처 4쌍 해시 일치.
- 매뉴얼 동기화 검사 9개 저장소, 시각자료 동기화 검사 5개 저장소/17개 문서/34개 locale 자산 통과.
- SVG/PNG EN·KO 각각 2880×2840. Text/connector/arrowhead/geometry/endpoint/PNG 검사 통과. Wave2 12쌍 asset audit 통과.
- 독립 code-reviewer: P0/P1/P2 발견 없음. Native LSP unavailable은 node --check와 Astro check로 보완하며 formal human approval을 뜻하지 않는다.
- SPW-01~05: 설계·계획·lesson·시각 검토 문서의 사실/명령/링크/완료 범위를 재검토했다. Terminology audit findings=0.
- CI·PR 생성과 CG-16 병합 승인은 다음 단계에서 최신 상태로 기록한다.
