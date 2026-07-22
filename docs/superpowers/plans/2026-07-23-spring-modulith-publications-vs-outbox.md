# Spring Modulith Publication과 Outbox 경계 글 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Issue #253을 위해 같은 Spring Boot 애플리케이션 안의 Spring Modulith event publication과 외부 전달용 Transactional Outbox의 경계를 설명하는 한국어·영어 블로그 글과 검수된 시각 자료를 만들고, 검증된 PR까지 연다.

**Architecture:** 글은 주문 승인 뒤 재고 예약이 실패하는 하나의 흐름에서 시작한다. `EVENT_PUBLICATION`은 동일 애플리케이션 안의 `@ApplicationModuleListener` 완료·실패·재전송을 추적하는 저장소로, Outbox는 브로커와 다른 서비스에 전달할 이벤트를 보관하는 내보내기 경계로 분리해 설명한다. 기존 Outbox Part 1·Part 2는 비교용 독자 링크로만 연결하고, 구현과 재시도 계약을 반복하지 않는다.

**Tech Stack:** Astro/Starlight MDX, Spring Modulith, Kotlin/Exposed workshop source, SVG, CairoSVG PNG rendering, Node.js/npm, GitHub CLI.

---

## File Map

### Create

- `src/content/docs/ko/blog/spring-modulith-publications-vs-outbox.mdx`: 한국어 원문.
- `src/content/docs/blog/spring-modulith-publications-vs-outbox.mdx`: 자연스러운 영어 현지화 글.
- `public/assets/spring-modulith-publications-vs-outbox-hero.png`: 1672×941 다크 3D 미니어처 대표 이미지.
- `public/assets/spring-modulith-publications-vs-outbox-interaction-01.svg`: 한국어 다크 카드·연결선 상호작용 다이어그램 원본.
- `public/assets/spring-modulith-publications-vs-outbox-interaction-01.png`: 한국어 다이어그램의 CairoSVG 렌더 결과.
- `public/assets/spring-modulith-publications-vs-outbox-interaction-01-en.svg`: 영어 다이어그램 원본.
- `public/assets/spring-modulith-publications-vs-outbox-interaction-01-en.png`: 영어 다이어그램의 CairoSVG 렌더 결과.

### Modify

- `docs/superpowers/specs/2026-07-22-issue-253-modulith-publications-outbox-design.md`: 실행 중 확인된 사실과 최종 검증만 필요한 경우에 한해 보완한다.

### Evidence Sources — Read Only

- `/Users/debop/work/bluetape4k/exposed-workshop/13-ecosystem-integrations/06-spring-modulith-publications/README.ko.md`
- `/Users/debop/work/bluetape4k/exposed-workshop/13-ecosystem-integrations/06-spring-modulith-publications/README.md`
- `/Users/debop/work/bluetape4k/exposed-workshop/13-ecosystem-integrations/06-spring-modulith-publications/src/main/kotlin/exposed/examples/spring/modulith/publications/orders/OrderModule.kt`
- `/Users/debop/work/bluetape4k/exposed-workshop/13-ecosystem-integrations/06-spring-modulith-publications/src/main/kotlin/exposed/examples/spring/modulith/publications/fulfillment/FulfillmentModule.kt`
- `/Users/debop/work/bluetape4k/exposed-workshop/13-ecosystem-integrations/06-spring-modulith-publications/src/test/kotlin/exposed/examples/spring/modulith/publications/SpringModulithPublicationApplicationTest.kt`
- `/Users/debop/work/bluetape4k/bluetape4k-exposed/spring-boot/spring-modulith/src/main/kotlin/io/bluetape4k/spring/modulith/exposed/ExposedEventPublicationRepository.kt`
- `src/content/docs/ko/blog/transactional-outbox-idempotency-spring-ktor.mdx`
- `src/content/docs/ko/blog/transactional-outbox-kafka-first-fallback-part2.mdx`

## Task 1: 사실과 중복 경계를 다시 고정한다

**Files:**

- Read: 위의 Evidence Sources 전체.
- Read: `docs/superpowers/specs/2026-07-22-issue-253-modulith-publications-outbox-design.md`.
- Modify: 없음.

- [ ] **Step 1: 워크숍 코드와 테스트에서 기사에 쓸 계약을 다시 추출한다**

다음 명령으로 event 발행, listener 식별자, 실패·재전송·unloadable event 테스트를 확인한다.

```bash
rg -n -C 4 'publishEvent|OrderApprovedEvent|ApplicationModuleListener|reserve-stock|resubmitIncompletePublications|UnloadableEventPublicationException|FAILED|COMPLETED' \
  /Users/debop/work/bluetape4k/exposed-workshop/13-ecosystem-integrations/06-spring-modulith-publications
```

Expected: 주문 저장과 `OrderApprovedEvent` 발행은 같은 트랜잭션에 있고, listener id는 `fulfillment.reserve-stock`이며, 실패한 publication은 재전송 후 완료되고, 이전 event class를 읽을 수 없는 행은 객체 materialize 시점에 명시적 오류가 난다.

- [ ] **Step 2: Outbox 글·사이트·GitHub에서 중복 여부를 재확인한다**

```bash
rg -n -i 'spring modulith|applicationmodulelistener|event publication|event_publication' \
  src/content/docs/ko/blog src/content/docs/blog
gh issue list --state all --search 'modulith outbox' --limit 30
gh pr list --state all --search 'modulith outbox' --limit 30
```

Expected: 전용 publication 글과 PR은 없고, 기존 `transactional-outbox-idempotency-spring-ktor` 및 `transactional-outbox-kafka-first-fallback-part2`만 Outbox 비교 자료로 남는다.

- [ ] **Step 3: 독자용 source link를 `develop` 기준으로 확정한다**

본문 자료 섹션에는 아래 네 링크만 source 코드 근거로 사용한다.

```text
https://github.com/bluetape4k/exposed-workshop/tree/develop/13-ecosystem-integrations/06-spring-modulith-publications
https://github.com/bluetape4k/exposed-workshop/blob/develop/13-ecosystem-integrations/06-spring-modulith-publications/src/main/kotlin/exposed/examples/spring/modulith/publications/orders/OrderModule.kt
https://github.com/bluetape4k/exposed-workshop/blob/develop/13-ecosystem-integrations/06-spring-modulith-publications/src/main/kotlin/exposed/examples/spring/modulith/publications/fulfillment/FulfillmentModule.kt
https://github.com/bluetape4k/bluetape4k-exposed/blob/develop/spring-boot/spring-modulith/src/main/kotlin/io/bluetape4k/spring/modulith/exposed/ExposedEventPublicationRepository.kt
```

Expected: 링크가 로컬 파일, raw 검색 기록, issue 번호 나열이 아니라 독자가 추가로 확인할 구현과 README를 가리킨다.

## Task 2: 한국어 원문을 작성하고 자연스러움을 검수한다

**Files:**

- Create: `src/content/docs/ko/blog/spring-modulith-publications-vs-outbox.mdx`.
- Read: `src/content/docs/ko/blog/transactional-outbox-idempotency-spring-ktor.mdx`, `src/content/docs/ko/blog/transactional-outbox-kafka-first-fallback-part2.mdx`, `src/content/docs/ko/blog/bluetape4k-javers-part4-audit-cost.mdx`.

- [ ] **Step 1: frontmatter와 문제 중심의 도입부를 작성한다**

다음 frontmatter를 사용한다. 공개 일시는 작업 당일이 아니라 PR 작성 시점의 발행 계획에 맞춰 조정할 수 있지만, 한국어·영어 값은 반드시 같게 유지한다.

```mdx
---
title: "같은 애플리케이션 안의 이벤트 전달: Spring Modulith publication과 Outbox를 나누는 기준"
description: Spring Modulith publication store가 같은 Spring Boot 애플리케이션 안의 listener 실패를 어떻게 기록·복구하는지, 그리고 Transactional Outbox가 필요한 외부 전달 경계를 workshop 예제로 구분한다.
sidebar:
  order: -202607231100
blog:
  date: 2026-07-23T11:00:00+09:00
  image: /assets/spring-modulith-publications-vs-outbox-hero.png
  imageAlt: 주문과 재고 예약, event publication 저장소, 외부 전달 경계를 조립하는 로봇 작업자 3D 미니어처
  cardDescription: "같은 애플리케이션 안의 listener 복구와 외부 이벤트 전달을 같은 Outbox 문제로 섞지 않는 기준을 정리합니다."
---
```

대표 이미지를 `bt4k-blog-hero` figure로 배치하고, `2026-07-23 · exposed-workshop / bluetape4k-exposed · issue #253` 메타 행 뒤에 주문 승인 성공 후 재고 예약이 실패하는 사례를 제시한다. 도입부는 Spring Modulith와 Outbox를 대체재라고 부르지 않는다.

- [ ] **Step 2: 내부 전달과 실패 복구 섹션을 작성한다**

아래 heading과 책임을 사용한다.

```text
## 주문은 승인됐는데 재고 예약이 실패했다
## 같은 트랜잭션에서 주문과 이벤트의 출발점을 만든다
## 처리기가 끝나야 publication도 끝난다
## 실패한 publication은 운영 대상이다
```

두 번째 섹션에는 `OrderApplicationService.approve`의 핵심만 보여 주는 짧은 Kotlin snippet을 넣는다. 세 번째·네 번째 섹션에서는 `@ApplicationModuleListener(id = "fulfillment.reserve-stock")`, `EVENT_PUBLICATION`의 listener id/event type/serialized payload/status/attempts/date, `FAILED` publication 재전송, legacy event class의 `UnloadableEventPublicationException`을 차례대로 설명한다. 구현이 제공하지 않는 자동 무한 재시도나 외부 전달 보장은 추가하지 않는다.

- [ ] **Step 3: 경계 비교와 선택 절차를 작성한다**

`/assets/spring-modulith-publications-vs-outbox-interaction-01.png`을 다음 heading 직후에 배치한다.

```text
## 같은 앱 안과 앱 밖은 다른 전달 경계다
## 어떤 저장소를 선택할지 정하는 순서
```

첫 섹션에는 아래 행을 포함하는 비교 표를 넣는다.

| 판단 지점 | Spring Modulith publication | Transactional Outbox |
| --- | --- | --- |
| 소비자 위치 | 같은 Spring Boot 애플리케이션의 다른 모듈 | 다른 프로세스·서비스·브로커·runtime |
| 남기는 기록 | listener의 완료·실패·재전송 상태 | 외부로 보낼 이벤트 intent |
| 주된 실패 | commit 뒤 로컬 listener 작업 실패 | 네트워크 전달·브로커·외부 소비자 실패 |
| 운영 질문 | 어떤 listener가 끝나지 않았는가 | 어느 이벤트를 외부에 아직 전달하지 못했는가 |

선택 절차는 `소비자가 같은 앱인가 → 로컬 listener의 복구만으로 충분한가 → 외부 소비자·브로커 전달을 보장해야 하는가` 순서로 쓴다. 기존 Outbox Part 1·Part 2는 이 절차를 끝낸 뒤 비교 심화 자료로만 링크한다.

- [ ] **Step 4: 자료와 마무리를 작성한다**

마지막 heading은 아래 순서로 둔다.

```text
## 자료
## 마무리
```

자료에는 워크숍 README·주문 서비스·fulfillment listener·Exposed repository와 기존 Outbox Part 1·Part 2의 독자용 링크만 넣는다. 마무리는 `같은 저장소에 행이 남는다`는 외형이 아니라 `누가 어느 실행 경계에서 그 행을 다시 읽는가`로 선택한다고 정리한다.

- [ ] **Step 5: 한국어 자연스러움 체크리스트로 교정한다**

`/Users/debop/.codex/skills/bluetape-writer/references/korean-naturalness-checklist.md`의 KO-01~KO-06을 적용한다. 특히 `~를 통해`, `중요하다`, `강력하다`, 기계적인 세 항목 나열, "A뿐만 아니라 B도"를 구체적인 동작과 문장으로 바꾼다. API 이름·상태 이름·예외 타입·링크는 변경하지 않는다.

- [ ] **Step 6: 한국어 기사 형태를 확인한다**

```bash
rg -n '^## |spring-modulith-publications-vs-outbox|ApplicationModuleListener|EVENT_PUBLICATION|resubmitIncompletePublications|UnloadableEventPublicationException|Transactional Outbox' \
  src/content/docs/ko/blog/spring-modulith-publications-vs-outbox.mdx
```

Expected: 네 개의 내부 전달·복구 heading, 경계 비교·선택 heading, 자료·마무리 heading, 대표 이미지와 한국어 다이어그램 embed, source-backed identifier가 모두 있다.

## Task 3: 대표 이미지와 한국어 상호작용 다이어그램을 만든다

**Files:**

- Create: `public/assets/spring-modulith-publications-vs-outbox-hero.png`.
- Create: `public/assets/spring-modulith-publications-vs-outbox-interaction-01.svg`.
- Create: `public/assets/spring-modulith-publications-vs-outbox-interaction-01.png`.

- [ ] **Step 1: 비슷한 대표 이미지를 확인한 뒤 hero를 생성한다**

`transactional-outbox-idempotency-hero.png`, `transactional-outbox-kafka-first-fallback-part2-hero.png`, `bluetape4k-javers-part4-hero.png`를 같은 크기로 열어 3D 미니어처, 로봇 작업자, 밝은 작업대, 큰 읽을거리 없는 구성을 확인한다. 이어서 다음 프롬프트로 새 hero를 생성하고 1672×941로 맞춘다.

```text
A polished 16:9 3D miniature workbench for a Kotlin/Spring engineering blog. Small white and cobalt-blue robotic engineers manage an approved order card, a local event publication ledger, and a fulfillment reservation station. In a separate clearly bounded area, an outbox tray points toward a small external broker gateway. Bright clean studio lighting, premium toy-diorama materials, shallow depth of field, no human characters, no readable text, no logos, no flat infographic.
```

```bash
sips -z 941 1672 public/assets/spring-modulith-publications-vs-outbox-hero.png \
  --out public/assets/spring-modulith-publications-vs-outbox-hero.png
sips -g pixelWidth -g pixelHeight public/assets/spring-modulith-publications-vs-outbox-hero.png
```

Expected: `pixelWidth: 1672`, `pixelHeight: 941`; hero가 본문 다이어그램처럼 읽히지 않고 기존 기술 블로그 대표 이미지의 시각 언어와 맞는다.

- [ ] **Step 2: 한국어 카드·연결선 다이어그램을 작성한다**

`common.md`와 `architecture.md`를 기준으로 1800×1120 dark SVG를 만든다. 상단에는 `같은 Spring Boot 애플리케이션 안` 영역, 하단에는 `애플리케이션 밖으로 전달` 영역을 둔다. 상단 카드와 연결선은 다음 책임을 빠짐없이 보여 준다.

```text
Orders → 트랜잭션 → OrderApprovedEvent → EVENT_PUBLICATION → fulfillment.reserve-stock → 완료
                                                   └────────────── 실패 → 재전송
```

하단은 `Orders → Outbox → Broker → 외부 소비자`를 별도 흐름으로 둔다. 두 영역 사이에는 화살표를 두지 않는다. primary flow arrowhead는 14×14이고, card와 card 사이의 선은 수평·수직·둥근 모서리만 사용한다. 각 카드는 가장 긴 라벨에 맞게 넓히고, `EVENT_PUBLICATION`에는 listener id/status/attempts의 보조 문구를 둔다.

- [ ] **Step 3: 한국어 SVG를 한 자산 루프로 검증한다**

```bash
xmllint --noout public/assets/spring-modulith-publications-vs-outbox-interaction-01.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py \
  public/assets/spring-modulith-publications-vs-outbox-interaction-01.svg
cairosvg public/assets/spring-modulith-publications-vs-outbox-interaction-01.svg \
  -o public/assets/spring-modulith-publications-vs-outbox-interaction-01.png -s 2
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py \
  public/assets/spring-modulith-publications-vs-outbox-interaction-01.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py --fail-diagonal \
  public/assets/spring-modulith-publications-vs-outbox-interaction-01.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py \
  public/assets/spring-modulith-publications-vs-outbox-interaction-01.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py \
  public/assets/spring-modulith-publications-vs-outbox-interaction-01.svg
```

Expected: XML parses, raster-text hazards and unhighlighted code counts are zero, connector audit has meaningful card/connector counts with no shared segment or label collision, endpoint and mixed-corner audits have no failure. Open the final 3600×2240 PNG at full size; arrowhead direction, terminal clearance, label contrast, card spacing, rounded bends, and the absence of a "Modulith replaces Outbox" implication decide PASS.

## Task 4: 영어 글과 영어 다이어그램을 동등한 정보량으로 작성한다

**Files:**

- Create: `src/content/docs/blog/spring-modulith-publications-vs-outbox.mdx`.
- Create: `public/assets/spring-modulith-publications-vs-outbox-interaction-01-en.svg`.
- Create: `public/assets/spring-modulith-publications-vs-outbox-interaction-01-en.png`.

- [ ] **Step 1: 한국어 글을 자연스럽게 영어로 현지화한다**

아래 frontmatter로 시작하고, Korean 글과 동일한 hero, `blog.date`, source links, 표 행, 코드 식별자, 자료 항목을 유지한다.

```mdx
---
title: "Event Delivery Inside One Application: Choosing Between Spring Modulith Publications and an Outbox"
description: A workshop-based guide to Spring Modulith publication recovery inside one Spring Boot application and the external delivery boundary that still calls for a transactional outbox.
sidebar:
  order: -202607231100
blog:
  date: 2026-07-23T11:00:00+09:00
  image: /assets/spring-modulith-publications-vs-outbox-hero.png
  imageAlt: 3D miniature of robotic engineers arranging an approved order, event publication ledger, fulfillment reservation, and external delivery boundary
  cardDescription: "Separate local listener recovery inside one application from event delivery across an external boundary."
---
```

한국어 관용구를 직역하지 않는다. `publication`, `listener`, `outbox`, `runtime`은 문맥상 자연스러운 기술 용어로 유지하고, "not a replacement"은 두 저장소의 적용 범위가 다르다는 문장으로 구체화한다.

- [ ] **Step 2: 영어 다이어그램을 한국어 원본과 같은 geometry로 현지화한다**

한국어 SVG를 복제한 뒤 제목·카드·보조 문구·figure alt와 caption만 영어로 바꾼다. 상단에는 `Inside one Spring Boot application`, 하단에는 `Across an external delivery boundary`를 사용한다. 카드 흐름은 다음을 유지한다.

```text
Orders → Transaction → OrderApprovedEvent → EVENT_PUBLICATION → fulfillment.reserve-stock → Completed
                                                        └──────────── Failed → Resubmit
Orders → Outbox → Broker → External consumer
```

영문 라벨 길이 때문에 카드를 좁히거나 글자 크기를 줄이지 않는다. 필요하면 card width와 canvas만 넓히고 연결선 port·label 좌표를 함께 옮긴다.

- [ ] **Step 3: 영어 SVG를 독립적으로 렌더·감사한다**

```bash
xmllint --noout public/assets/spring-modulith-publications-vs-outbox-interaction-01-en.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-svg-text-normalize.py \
  public/assets/spring-modulith-publications-vs-outbox-interaction-01-en.svg
cairosvg public/assets/spring-modulith-publications-vs-outbox-interaction-01-en.svg \
  -o public/assets/spring-modulith-publications-vs-outbox-interaction-01-en.png -s 2
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-connector-audit.py \
  public/assets/spring-modulith-publications-vs-outbox-interaction-01-en.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-geometry-audit.py --fail-diagonal \
  public/assets/spring-modulith-publications-vs-outbox-interaction-01-en.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-endpoint-audit.py \
  public/assets/spring-modulith-publications-vs-outbox-interaction-01-en.svg
python3 /Users/debop/.codex/skills/bluetape-diagram/scripts/diagram-mixed-corner-audit.py \
  public/assets/spring-modulith-publications-vs-outbox-interaction-01-en.svg
```

Expected: 한국어 자산과 별도로 XML·text·connector·geometry·endpoint·corner 검사를 통과하고, 3600×2240 PNG를 full size로 열었을 때 영어 라벨이 잘리지 않으며 화살표·카드 간격이 동일한 의미를 보인다.

- [ ] **Step 4: 이중 언어 parity를 확인한다**

```bash
for f in \
  src/content/docs/ko/blog/spring-modulith-publications-vs-outbox.mdx \
  src/content/docs/blog/spring-modulith-publications-vs-outbox.mdx; do
  printf '\n%s\n' "$f"
  rg -n '^title:|^description:|^  date:|spring-modulith-publications-vs-outbox|ApplicationModuleListener|EVENT_PUBLICATION|resubmitIncompletePublications|UnloadableEventPublicationException|Transactional Outbox' "$f"
done
```

Expected: 두 글 모두 같은 날짜, hero, source links, 핵심 API·상태·예외, Outbox Part 1·Part 2 링크, 현지화한 상호작용 PNG를 포함한다.

## Task 5: 사이트와 PR 전달을 검증한다

**Files:**

- Verify: Task 2~4의 새 MDX·SVG·PNG 전체.
- Modify: PR body only.

- [ ] **Step 1: MDX·링크·자산 참조를 정적 검사한다**

```bash
git diff --check
for path in \
  public/assets/spring-modulith-publications-vs-outbox-hero.png \
  public/assets/spring-modulith-publications-vs-outbox-interaction-01.png \
  public/assets/spring-modulith-publications-vs-outbox-interaction-01-en.png; do
  test -s "$path" && sips -g pixelWidth -g pixelHeight "$path"
done
! rg -n 'http://|file:|/Users/' \
  src/content/docs/ko/blog/spring-modulith-publications-vs-outbox.mdx \
  src/content/docs/blog/spring-modulith-publications-vs-outbox.mdx
```

Expected: diff whitespace errors가 없고, 세 PNG가 비어 있지 않으며, 로컬 경로·placeholder·비보안 링크가 없다.

- [ ] **Step 2: Astro 검사와 빌드를 실행한다**

```bash
npm run build
npm test
```

Expected: `astro check`, `astro build`, repository manual/ecosystem tests 모두 exit code 0으로 끝난다.

- [ ] **Step 3: 생성된 두 route와 이미지 embed를 확인한다**

```bash
test -f dist/ko/blog/spring-modulith-publications-vs-outbox/index.html
test -f dist/blog/spring-modulith-publications-vs-outbox/index.html
rg -n 'spring-modulith-publications-vs-outbox-(hero|interaction-01)' \
  dist/ko/blog/spring-modulith-publications-vs-outbox/index.html \
  dist/blog/spring-modulith-publications-vs-outbox/index.html
```

Expected: 한국어·영어 route가 모두 생성되고, 한국어 HTML은 기본 interaction PNG, 영어 HTML은 `-en` PNG를 참조한다. 로컬 preview에서 두 route의 hero·figure·caption·자료 링크·확대 보기 UI까지 확인한다.

- [ ] **Step 4: 변경을 Lore 형식으로 커밋하고 PR을 연다**

```bash
git add \
  docs/superpowers/plans/2026-07-23-spring-modulith-publications-vs-outbox.md \
  src/content/docs/ko/blog/spring-modulith-publications-vs-outbox.mdx \
  src/content/docs/blog/spring-modulith-publications-vs-outbox.mdx \
  public/assets/spring-modulith-publications-vs-outbox-hero.png \
  public/assets/spring-modulith-publications-vs-outbox-interaction-01.svg \
  public/assets/spring-modulith-publications-vs-outbox-interaction-01.png \
  public/assets/spring-modulith-publications-vs-outbox-interaction-01-en.svg \
  public/assets/spring-modulith-publications-vs-outbox-interaction-01-en.png
git commit -m "Explain Modulith publications and outbox boundaries" \
  -m "Constraint: Keep local module-event recovery separate from cross-process delivery.\nRejected: A second generic outbox article | Existing Part 1 and Part 2 already cover that surface.\nConfidence: high\nScope-risk: narrow\nDirective: Preserve bilingual claim and asset parity when this article changes.\nTested: source duplicate preflight; SVG/PNG audits; Korean naturalness; site build; tests; route and asset checks.\nNot-tested: GitHub CI and production deployment."
git push -u origin docs/issue-253-modulith-publications-outbox
```

Open a PR to `develop` that closes #253, assign `debop`, and copy the issue labels `documentation` and `enhancement`. Its final Markdown `##` heading must be exactly `## DoD Status`. Verify the live PR body and metadata with:

```bash
gh pr view <number> --json url,baseRefName,headRefName,assignees,labels,milestone,body
```

Expected: base is `develop`, head is `docs/issue-253-modulith-publications-outbox`, assignee is `debop`, labels match issue #253, the final heading is `## DoD Status`, and the body records source preflight, Korean/English parity, diagram PNG evidence, build/tests, and the explicit no-merge/no-deploy boundary.

- [ ] **Step 5: stop at PR readiness**

Do not merge, delete the branch, or deploy the site. Report the PR URL, current CI state, and exact validation evidence; wait for a separate user instruction for any irreversible delivery step.

## Self-Review

- **Spec coverage:** Task 1 implements duplicate prevention and source fact locking. Task 2 handles Korean problem-first prose, recovery behaviour, selection table, resources, and naturalness. Task 3 implements a series-matched hero plus source-backed local/external boundary visual. Task 4 establishes English content and visual parity. Task 5 performs static/site/route checks and PR-only delivery.
- **Placeholder scan:** The plan contains no unresolved article content, vague testing instructions, or temporary asset names.
- **Consistency:** Both routes use `spring-modulith-publications-vs-outbox`; Korean artwork ends with `interaction-01`, English with `interaction-01-en`; both use the shared hero. The publication worktree and the eventual PR head branch are `docs/issue-253-modulith-publications-outbox`.
