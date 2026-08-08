---
title: AI 협업을 인프라로 만들기
description: bluetape4k AI 개발 글의 후속 글로, Codex와 Claude가 AGENTS.md, skills, qmd, memory, hooks를 기준 삼아 일하도록 구성한 방식을 설명합니다.
sidebar:
  order: -202605180200
blog:
  date: 2026-05-18T02:00:00+09:00
  image: /assets/ai-collaboration-infrastructure.png
  imageAlt: 관리자 AI와 작업자 AI가 skills, qmd, memory, 검증 게이트를 함께 관리하는 모습
  cardDescription: AGENTS.md, bluetape4k skills, qmd, memory, hooks로 Codex와 Claude가 같은 기준으로 일하게 만든 방식입니다.
---

<figure class="bt4k-blog-hero">
  <img src="/assets/ai-collaboration-infrastructure.png" alt="관리자 AI와 작업자 AI가 저장소 지도, skills, memory, 테스트 대시보드, 검증 게이트를 함께 관리하는 모습" loading="eager" />
  <figcaption>이 후속 글의 초점은 AI가 무엇을 생성했는지가 아니라, AI가 같은 기준으로 계속 일하게 만드는 환경에 있습니다.</figcaption>
</figure>

Eugene Yan의 [How to Work and Compound with AI](https://eugeneyan.com/writing/working-with-ai/)를 읽고,
이전 bluetape4k AI 글의 후속 글을 쓰고 싶어졌다. 앞선 글이 Claude Code와 Codex가 무엇을 만드는 데
도움을 주었는지를 다뤘다면, 이번 글은 그 작업을 반복 가능하게 만든 환경을 다룬다.

AI 협업에서 취약한 부분은 대개 모델 품질이 아니다. 모델을 둘러싼 시스템이다. 모델이 어디를 봐야 하는지
모르면 잘못된 파일을 읽는다. 프로젝트의 취향이 설정으로 표현되어 있지 않으면 같은 수정이 매 세션마다
반복된다. 검증 명령이 분명하지 않으면 그럴듯한 설명을 완료로 착각할 수 있다. bluetape4k에서는 이제
AI 환경도 코드베이스의 일부로 다룬다.

로컬 환경은 Codex와 Claude에 서로 다른 제어면을 제공하지만 운영 원칙은 공유하게 한다. Codex에는
`~/.codex/config.toml`, `AGENTS.md`, `RTK.md`, `hooks.json`, prompts, skills, agents, plugins, wiki content가
있다. 이 세션 기준으로는 33 prompts, 108 skills, 20 agents, 하나의 plugin이다. Claude에는
`~/.claude/CLAUDE.md`, `settings.json`, 24 commands, 84 skills, 37 hooks, 프로젝트별 history가 있다.
숫자 자체가 중요한 것은 아니다. 다음 AI 세션이 어디에서 규칙을 읽고, 어떤 절차를 불러오며, 어떤 memory를
재사용해야 하는지 알 수 있다는 점이 중요하다.

## 전체 프로세스

<figure class="bt4k-architecture">
  <img src="/assets/ai-collaboration-process.svg" alt="AI 협업의 의도 정의, 맥락 검색, skill 선택, 실행, 검증, memory 피드백 순환" loading="lazy" />
  <figcaption>작업 환경은 하나의 prompt가 아니다. 의도 정의, 맥락 검색, skill 선택, 실행, 검증, 지속되는 memory가
  이어지는 순환 구조다.</figcaption>
</figure>

## `AGENTS.md`와 `CLAUDE.md`는 온보딩 문서다

새 엔지니어가 프로젝트에 합류할 때 README만 건네지 않는다. 코드 구조, 브랜치 정책, 테스트 전략, 문서 언어,
피해야 할 지름길, 과거의 결정을 설명한다. AI에게도 같은 온보딩이 필요하다.

bluetape4k workspace의 `AGENTS.md`는 Codex의 기본 온보딩 문서다. 나와의 대화는 한국어로 유지하지만,
공개 KDoc, PR, commit message는 영어로 작성한다고 적혀 있다. Git 정책도 기록한다. `develop`은 통합
브랜치이고 `main`은 release-only다. Kotlin workflow도 정의한다. Kotlin 코드를 편집하기 전에 references와
impact를 확인하고, `.kt` 파일을 건드린 뒤에는 IDE diagnostics를 실행하고 import를 정리하며 deprecation을
해결한 다음 영향받는 모듈을 compile하고 test한다.

Claude는 `~/.claude/CLAUDE.md`, commands, skills, hooks를 통해 비슷한 계약을 받는다. 파일 이름과 hook
표면은 다르지만 의도는 같다. 각 세션을 새 동료처럼 온보딩하고, 반복되는 선호를 지속되는 설정으로 승격하는
것이다.

범위가 중요하다. 전역 규칙은 home directory 아래에 있다. bluetape4k 전체 규칙은 workspace root에 있다.
저장소 또는 모듈별 규칙은 자신이 다루는 파일 가까이에 있다. 더 가까운 규칙일수록 더 구체적이다. 이런
구조가 있어야 AI가 "모든 Kotlin 프로젝트"와 "이 저장소의 Kotlin 프로젝트"를 구분할 수 있다.

## Skills는 반복 작업의 실행 절차다

prompt가 지시라면 skill은 절차다. 작업이 자주 반복되면 skill로 만든다.

bluetape4k에서 `bluetape4k-workflow`는 첫 번째 router다. 작업을 Type A Full Feature, B Fast Track,
C Bug Fix, D Code Review, E Maintenance, P Publish, F Self Improve로 분류한 뒤, 안전성을 유지하면서 가장
가벼운 검증 수준을 선택한다.

그 router 아래에는 더 좁은 skill이 있다. `bluetape4k-full-feature`는 새 모듈, 넓은 API 변경, 다계층 작업을
다룬다. `bluetape4k-code-patterns`는 Kotlin 구현과 검증을 다룬다. `bluetape4k-bugfix`는 재현 가능한
수정을 맡고, `bluetape4k-publish`와 `bluetape4k-publish-go`는 release 작업을 맡는다.
`ecc-kotlin-exposed`, `ecc-springboot-kotlin`, `ecc-kotlin-testing`, `kotlin-coroutines-skill`은
도메인별 판단을 담당한다.

이 구조 덕분에 매 세션마다 "README도 업데이트하라", "deprecated Exposed import를 조심하라", "영향받는
모듈 테스트로 증명하라"를 반복하지 않아도 된다. 작업 형태가 정해지면 관련 skill이 차단 가능한 checklist를
가져온다. 실행 항목마다 action, evidence, failure behavior를 적는다. 확인하지 않은 항목은 의존 작업을
막고, `SKIPPED`는 허용하지 않으며, `N/A`에는 구체적인 범위 증거가 필요하다.

## qmd는 과거 결정을 찾는 검색 계층이다

AI 세션은 쉽게 잊는다. 저장소에는 docs, lessons, issues, PRs, plans, experiments가 쌓인다. qmd가 둘을
연결한다.

bluetape4k에서는 prior decisions, lessons, specs, plans, historical context를 먼저 qmd로 검색한다. workspace
문서는 `bluetape4k-docs` collection에 있고, 개인 및 프로젝트 간 지식은 `wiki` collection에 있다. 정확한
code symbol과 filename은 여전히 `rg`의 영역이지만, "왜 이것을 선택했지?", "비슷한 것을 어디에서 만들었지?",
"이전에 이런 실패가 있었나?" 같은 질문은 qmd가 더 잘 다룬다.

이 구분이 중요하다. AI에게 저장소 전체를 다시 읽으라고 하면 느리고 비용이 크다. qmd가 먼저 맥락을 좁히면
세션은 그 다음 코드로 내려갈 수 있다. 좋은 검색 계층은 context window를 절약하고 과거의 판단을 현재 작업으로
가져온다.

## Memory는 세션 밖으로 나와야 한다

Memory에는 여러 계층이 있다. Codex와 Claude의 project history는 최근 세션 흔적을 보존한다. `.omx/state`,
`.omx/notepad.md`, `.omx/plans` 같은 runtime state는 진행 중인 작업을 재개하게 돕는다. 하지만 이것들은
일시적인 표면이다.

지속되어야 할 결정은 저장소로 옮긴다. bluetape4k에서는 spec을 `docs/superpowers/specs` 아래에, plan을
`docs/superpowers/plans` 아래에, lesson을 `docs/lessons` 아래에 둔다. 작업 항목이 끝나면 짧은 lesson에
context, decision, outcome, verification evidence, future agent를 위한 guidance를 기록한다. 이 문서는 사람에게도
도움이 되지만 다음 AI 세션에는 더 큰 도움이 된다. 다음 세션이 왜 그런 결정을 했는지 다시 추론하지 않아도 되기
때문이다.

목표는 모든 것을 저장하는 것이 아니다. 같은 결정 비용을 다시 지불하지 않는 것이다.

## Hooks는 반복되는 실수를 일찍 잡는다

Markdown의 규칙은 유용하지만 중요한 규칙은 결국 자동화해야 한다. Claude에는 sensitive-file 차단,
destructive-git 방어, Kotlin check, Gradle test guard, README sync reminder, keyword detection, session reminder를
위한 hook이 있다. Codex는 비슷한 제어를 위해 hooks, skill routing, MCP surface, native subagents를 사용한다.

Hook은 모델을 신뢰하지 않는다는 표시가 아니다. 사람에게도 CI, pre-commit check, lint가 필요하다. 특히 여러
저장소를 오갈 때 AI에도 같은 guardrail이 필요하다. destructive command, branch-name 실수, sensitive file,
workflow drift를 일찍 차단하면 throughput이 좋아진다.

## 검증할 수 있는 일만 위임한다

AI에 큰 작업을 위임하려면 먼저 검증 방법이 분명해야 한다. bluetape4k에서 완료 여부는 설명으로 판단하지
않는다. 작은 변경에는 targeted test나 build check면 충분할 수 있다. Kotlin code가 바뀌면 IDE diagnostics,
import cleanup, deprecation check, 영향 모듈 테스트를 기대한다. public API가 바뀌면 KDoc과 README coverage가
중요하다. GitHub workflow file이 바뀌면 nightly workflow 영향도 확인한다.

이런 조건이 있어야 위임이 실용적이다. Codex native subagents와 OMX team mode는 작업을 병렬로 실행할 수
있지만, 병렬성이 품질을 보장하지는 않는다. 병목은 구현 속도에서 spec 작성과 review로 옮겨 간다. 작업을
나누기 전에 각 agent가 어떤 file과 responsibility를 소유하는지, 어떤 test가 완료를 증명하는지, shared-file
conflict를 어떻게 보고하는지 알고 싶다.

## Codex와 Claude는 같은 운영 체제를 다르게 읽는다

Codex와 Claude를 경쟁 도구로 보지 않는다. 두 도구가 같은 repository, convention, lesson을 읽게 하려고 한다.

Codex는 `AGENTS.md`, skills, MCP/context-mode, qmd, native subagents를 통해 운영한다. Claude는
`CLAUDE.md`, commands, skills, hooks, project histories를 통해 운영한다. 한쪽에서 지속될 lesson을 발견하면
repository docs나 shared skill로 옮겨 다른 쪽도 활용할 수 있게 해야 한다.

이렇게 하면 작업을 요청하는 방식도 달라진다. "이 파일을 수정해" 대신 "이 repository workflow를 따르고,
impact를 확인하고, test로 변경을 증명하고, 다음 agent를 위한 짧은 lesson을 남겨"에 가까워진다. 목표는 단순히
모델을 사용하는 것이 아니다. 모델을 둘러싼 운영 체제를 만드는 것이다.

## 남은 문제

환경이 커지면 중복과 충돌이 생길 수 있다. Skill이 겹치고 hook은 debugging이 필요하다. 긴 `AGENTS.md`와
`CLAUDE.md`가 실제로 중요한 규칙을 묻어 버릴 수도 있다. AI 환경 자체도 refactoring이 필요하다.

유지보수 규칙은 단순하다. 같은 수정을 두 번 하면 rule이나 skill로 만든다. 같은 실패를 세 번 보면 hook이나
test로 만든다. 더 이상 사용하지 않는 절차는 삭제한다. 일회성 메모리를 영원히 보존하지 말고, 반복 가능한
결정을 지속되는 산출물로 승격한다.

## 결론

AI와 오랫동안 일하며 얻은 가장 큰 교훈은 모델보다 환경이 더 많이 축적된다는 점이다. 모델은 바뀐다. 하지만
잘 정리된 repository, 명확한 `AGENTS.md`와 `CLAUDE.md`, 재사용 가능한 skills, qmd로 검색할 수 있는 지식,
검증 hook, 짧은 lesson은 세션을 넘어 유용하게 남는다.

bluetape4k에서 생산적인 AI 협업은 더 좋은 prompt보다 더 좋은 작업 환경에 가깝다. AI를 일회성 generator로
사용하면 세션마다 방향이 흐트러진다. AI를 동료처럼 온보딩하고, 절차를 코드처럼 관리하며, 검증과 memory를
인프라로 만들면 결과가 계속 축적된다.
