# 병원 예약 서비스 시리즈 분류 적용 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 병원 예약 서비스 글 19편의 한국어·영어 제목과 시리즈 탐색을 `프롤로그 → 설계 → 구현 → 운영 확장` 순서로 통일하고, Clinic Appointment Epic과 Issue 제목에도 같은 분류를 적용한다.

**Architecture:** 시리즈 순서와 양 언어 제목은 `src/data/clinic-appointment-series.mjs` 한 곳에서 관리한다. 각 MDX 글은 공용 `ClinicAppointmentSeries.astro` 컴포넌트에 현재 글의 slug와 언어만 전달하며, 회귀 테스트가 19개 항목의 순서, frontmatter 제목, 컴포넌트 연결을 검사한다. 사이트 검증이 모두 통과한 뒤 GitHub 제목과 Epic 본문을 변경하고 실제 원격 값을 다시 읽는다.

**Tech Stack:** Astro 6, Starlight 0.39, MDX, JavaScript ESM, Node.js test runner, GitHub CLI

---

## 승인된 기준과 변경 경계

- 설계: `docs/superpowers/specs/2026-08-15-clinic-appointment-series-classification-design.md`
- 설계 승인 기준 커밋: `693ad2fc1fa4d3cb25074c10099734679a85a049`
- 분류 순서: `프롤로그 → 설계 1~7 → 구현 1~7 → 운영 확장 1.1~1.3, 2`
- `구현 8·9`와 `운영 확장 3~11`은 아직 발행하지 않았으므로 사이트 탐색 데이터에 넣지 않는다.
- 기존 경로, 발행 날짜, 기술 본문, hero, 본문 그림은 변경하지 않는다.
- 명시적인 “다음 글” 본문은 이번 작업에서 재작성하지 않는다. 이 작업의 탐색 계약은 frontmatter 제목과 `## 시리즈 링크` 또는 `## Series` 영역이다.
- GitHub에서는 Epic #275 제목·본문 작업 목록, Issue #276~#294 제목, 신규 `구현 8·9` Issue만 변경한다.
- 기존 Issue의 상태, assignee, label, milestone, 댓글, PR 연결과 GitHub sub-issue 관계는 변경하지 않는다.
- 배포, PR 생성, 병합, push는 이 계획의 범위가 아니다.

구현을 시작할 때 다음 명령으로 계획 문서 커밋을 기준점으로 기록한다. 이후 diff
검증의 `CLINIC_SERIES_BASE`는 이 값을 사용한다.

```bash
CLINIC_SERIES_BASE=$(git log -1 --format=%H -- docs/superpowers/plans/2026-08-16-clinic-appointment-series-classification.md)
test -n "$CLINIC_SERIES_BASE"
```

## 파일 구조

- Create: `src/data/clinic-appointment-series.mjs` — 발행된 19편의 순서, 분류, slug, 한국어·영어 제목
- Create: `src/components/ClinicAppointmentSeries.astro` — 분류별 제목과 현재 글 표시를 렌더링하는 공용 탐색
- Create: `tests/ecosystem/clinic-appointment-series.test.mjs` — 데이터, 컴포넌트, 38개 MDX 연결의 회귀 테스트
- Modify: `src/content/docs/blog/clinic-appointment-*.mdx` 19개 — 영어 제목, import, 공용 탐색 호출
- Modify: `src/content/docs/ko/blog/clinic-appointment-*.mdx` 19개 — 한국어 제목, import, 공용 탐색 호출
- Remote: `bluetape4k/clinic-appointment` Issue #275~#294와 신규 Issue 2개

### Task 1: 발행된 시리즈 순서를 데이터로 고정

**Files:**

- Create: `src/data/clinic-appointment-series.mjs`
- Create: `tests/ecosystem/clinic-appointment-series.test.mjs`

- [ ] **Step 1: 시리즈 데이터가 아직 없음을 증명하는 테스트 작성**

`tests/ecosystem/clinic-appointment-series.test.mjs`를 다음 내용으로 만든다.

```js
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  clinicAppointmentGroups,
  clinicAppointmentSeries,
} from '../../src/data/clinic-appointment-series.mjs';

test('clinic appointment series keeps the approved published order', () => {
  assert.deepEqual(
    clinicAppointmentGroups.map(({ id }) => id),
    ['prologue', 'design', 'implementation', 'operations'],
  );
  assert.equal(clinicAppointmentSeries.length, 19);
  assert.deepEqual(
    clinicAppointmentGroups.map(({ id }) => [
      id,
      clinicAppointmentSeries.filter(({ group }) => group === id).length,
    ]),
    [
      ['prologue', 1],
      ['design', 7],
      ['implementation', 7],
      ['operations', 4],
    ],
  );
  assert.deepEqual(
    clinicAppointmentSeries.map(({ id }) => id),
    [
      'prologue',
      'design-1',
      'design-2',
      'design-3',
      'design-4',
      'design-5',
      'design-6',
      'design-7',
      'implementation-1',
      'implementation-2',
      'implementation-3',
      'implementation-4',
      'implementation-5',
      'implementation-6',
      'implementation-7',
      'operations-1-1',
      'operations-1-2',
      'operations-1-3',
      'operations-2',
    ],
  );
  assert.equal(new Set(clinicAppointmentSeries.map(({ slug }) => slug)).size, 19);
});
```

- [ ] **Step 2: 테스트를 실행해 데이터 모듈 부재로 실패하는지 확인**

Run:

```bash
node --test tests/ecosystem/clinic-appointment-series.test.mjs
```

Expected: `ERR_MODULE_NOT_FOUND`로 FAIL한다.

- [ ] **Step 3: 승인된 19편만 포함하는 데이터 모듈 작성**

`src/data/clinic-appointment-series.mjs`를 다음 내용으로 만든다.

```js
export const clinicAppointmentGroups = Object.freeze([
  { id: 'prologue', ko: '프롤로그', en: 'Prologue' },
  { id: 'design', ko: '설계', en: 'Design' },
  { id: 'implementation', ko: '구현', en: 'Implementation' },
  { id: 'operations', ko: '운영 확장', en: 'Operations' },
]);

export const clinicAppointmentSeries = Object.freeze([
  {
    id: 'prologue',
    group: 'prologue',
    slug: 'clinic-appointment-prologue-product-to-appointment',
    ko: '[프롤로그] 상품 정보가 고객의 방문 약속이 되기까지',
    en: "[Prologue] From Product Information to a Patient's Visit Commitment",
  },
  {
    id: 'design-1',
    group: 'design',
    slug: 'clinic-appointment-product-version-purchase-snapshot',
    ko: '[설계 1] 상품이 바뀌어도 고객의 약속은 변경하지 않는다: 상품 버전과 구매 스냅숏',
    en: "[Design 1] When a Product Changes, Preserve the Patient's Promise: Product Versions and Purchase Snapshots",
  },
  {
    id: 'design-2',
    group: 'design',
    slug: 'clinic-appointment-event-product-first-commitment',
    ko: '[설계 2] 이벤트 상품은 어떤 방문 약속을 만드는가',
    en: '[Design 2] What Visit Commitment Does an Event Product Create?',
  },
  {
    id: 'design-3',
    group: 'design',
    slug: 'clinic-appointment-n-visit-remaining-rights',
    ko: '[설계 3] N회 상품은 왜 예약 한 건이 아닌가',
    en: '[Design 3] Why an N-Visit Product Is Not One Appointment',
  },
  {
    id: 'design-4',
    group: 'design',
    slug: 'clinic-appointment-package-product-execution-graph',
    ko: '[설계 4] 패키지 상품은 왜 실행 그래프가 되는가',
    en: '[Design 4] Why a Package Product Becomes an Execution Graph',
  },
  {
    id: 'design-5',
    group: 'design',
    slug: 'clinic-appointment-execution-bom-to-appointment-plan',
    ko: '[설계 5] 상품 BOM은 어떻게 AppointmentPlan과 방문으로 번역되는가',
    en: '[Design 5] How a Product BOM Becomes an AppointmentPlan and a Visit',
  },
  {
    id: 'design-6',
    group: 'design',
    slug: 'clinic-appointment-desired-visit-date-and-confirmed-commitment',
    ko: '[설계 6] 고객 희망 내원 날짜는 예약 확정이 아니다',
    en: '[Design 6] A Preferred Visit Date Is Not an Appointment Confirmation',
  },
  {
    id: 'design-7',
    group: 'design',
    slug: 'clinic-appointment-scheduling-policy',
    ko: '[설계 7] 병원마다 예약 규칙이 다른 이유',
    en: '[Design 7] Why Every Clinic Has Different Booking Rules',
  },
  {
    id: 'implementation-1',
    group: 'implementation',
    slug: 'clinic-appointment-part1-not-just-crud',
    ko: '[구현 1] 병원 예약은 CRUD로 끝나지 않는다',
    en: '[Implementation 1] Clinic Appointments Are More Than CRUD',
  },
  {
    id: 'implementation-2',
    group: 'implementation',
    slug: 'clinic-appointment-part2-state-machine-and-history',
    ko: '[구현 2] 예약 상태는 열거형이 아니다',
    en: '[Implementation 2] Appointment State Is More Than an Enum',
  },
  {
    id: 'implementation-3',
    group: 'implementation',
    slug: 'clinic-appointment-part3-clinic-specific-availability',
    ko: '[구현 3] 병원마다 다른 업무시간과 자원으로 예약 가능 시간을 계산하기',
    en: '[Implementation 3] Computing Availability from Clinic-Specific Hours and Resources',
  },
  {
    id: 'implementation-4',
    group: 'implementation',
    slug: 'clinic-appointment-part4-greedy-vs-global-optimization',
    ko: '[구현 4] 한 건의 예약 가능 시간 조회와 전체 일정 최적화는 다르다',
    en: '[Implementation 4] Real-Time Slot Search and Global Optimization Solve Different Problems',
  },
  {
    id: 'implementation-5',
    group: 'implementation',
    slug: 'clinic-appointment-part5-timefold-constraints',
    ko: '[구현 5] 병원 업무 규칙을 Timefold 제약 조건으로 옮기기',
    en: '[Implementation 5] Translating Clinic Rules into Timefold Constraints',
  },
  {
    id: 'implementation-6',
    group: 'implementation',
    slug: 'clinic-appointment-part6-closure-equipment-rescheduling',
    ko: '[구현 6] 휴진과 장비 고장은 예약 설계를 어떻게 바꾸는가',
    en: '[Implementation 6] Rescheduling after Closures and Equipment Downtime',
  },
  {
    id: 'implementation-7',
    group: 'implementation',
    slug: 'clinic-appointment-part7-review-and-operational-evolution',
    ko: '[구현 7] 완성 뒤가 진짜 시작이다',
    en: '[Implementation 7] Reviews and Operations Start the Next Development Cycle',
  },
  {
    id: 'operations-1-1',
    group: 'operations',
    slug: 'clinic-appointment-waitlist-core',
    ko: '[운영 확장 1.1] 대기 목록은 이름표가 아니라 상태 머신이다',
    en: '[Operations 1.1] A Waitlist Is Not a Queue of Names',
  },
  {
    id: 'operations-1-2',
    group: 'operations',
    slug: 'clinic-appointment-waitlist-operations-dashboard',
    ko: '[운영 확장 1.2] 대기 목록 운영 화면은 상태판이 아니라 조치판이다',
    en: '[Operations 1.2] A Waitlist Dashboard Should Tell Staff What to Do Next',
  },
  {
    id: 'operations-1-3',
    group: 'operations',
    slug: 'clinic-appointment-waitlist-operations-command',
    ko: '[운영 확장 1.3] 대기 목록 운영 명령은 API 요청과 재조회로 완성된다',
    en: '[Operations 1.3] A Waitlist Operations Command Is Complete Only After the API Request and Re-read',
  },
  {
    id: 'operations-2',
    group: 'operations',
    slug: 'clinic-appointment-booking-reliability',
    ko: '[운영 확장 2] 예약 우선순위는 누구의 규칙인가',
    en: '[Operations 2] Who Owns Booking Priority?',
  },
]);
```

- [ ] **Step 4: 데이터 순서 테스트 통과 확인**

Run:

```bash
node --test tests/ecosystem/clinic-appointment-series.test.mjs
```

Expected: 1 test PASS, 0 FAIL.

- [ ] **Step 5: 첫 번째 변경 단위 커밋**

```bash
git add src/data/clinic-appointment-series.mjs tests/ecosystem/clinic-appointment-series.test.mjs
git commit -m "병원 예약 시리즈의 발행 순서를 한 곳에서 관리한다" -m "Constraint: 발행 전인 구현 8·9와 운영 확장 3~11은 탐색 데이터에서 제외한다
Confidence: high
Scope-risk: narrow
Directive: 새 글은 발행 파일이 생긴 뒤에만 이 목록에 추가한다
Tested: node --test tests/ecosystem/clinic-appointment-series.test.mjs
Not-tested: Astro 렌더링은 다음 작업에서 검증한다"
```

### Task 2: 분류별 공용 탐색 컴포넌트 추가

**Files:**

- Create: `src/components/ClinicAppointmentSeries.astro`
- Modify: `tests/ecosystem/clinic-appointment-series.test.mjs`

- [ ] **Step 1: 컴포넌트 계약 테스트 추가**

테스트 파일 상단 import에 다음을 추가한다.

```js
import { readFile } from 'node:fs/promises';
```

다음 테스트를 파일 끝에 추가한다.

```js
test('clinic appointment series component renders groups and the current page', async () => {
  const source = await readFile('src/components/ClinicAppointmentSeries.astro', 'utf8');

  assert.match(source, /clinicAppointmentGroups\.map/);
  assert.match(source, /clinicAppointmentSeries\s*\.filter/);
  assert.match(source, /aria-current="page"/);
  assert.match(source, /throw new Error\(`Unknown clinic appointment series slug:/);
  assert.match(source, /locale === 'ko' \? '\/ko\/blog' : '\/blog'/);
});
```

- [ ] **Step 2: 테스트를 실행해 컴포넌트 부재로 실패하는지 확인**

Run:

```bash
node --test tests/ecosystem/clinic-appointment-series.test.mjs
```

Expected: `ENOENT`로 두 번째 테스트가 FAIL한다.

- [ ] **Step 3: 공용 Astro 컴포넌트 작성**

`src/components/ClinicAppointmentSeries.astro`를 다음 내용으로 만든다.

```astro
---
import {
  clinicAppointmentGroups,
  clinicAppointmentSeries,
} from '../data/clinic-appointment-series.mjs';

interface Props {
  current: string;
  locale: 'ko' | 'en';
}

const { current, locale } = Astro.props;
const currentEntry = clinicAppointmentSeries.find(({ slug }) => slug === current);

if (!currentEntry) {
  throw new Error(`Unknown clinic appointment series slug: ${current}`);
}

const blogRoot = locale === 'ko' ? '/ko/blog' : '/blog';
const navigationLabel = locale === 'ko' ? '병원 예약 서비스 시리즈' : 'Clinic appointment series';
---

<nav aria-label={navigationLabel}>
  {clinicAppointmentGroups.map((group) => (
    <section class="clinic-appointment-series-group">
      <h3>{group[locale]}</h3>
      <ul>
        {clinicAppointmentSeries
          .filter(({ group: groupId }) => groupId === group.id)
          .map((entry) => (
            <li>
              {entry.slug === current ? (
                <strong aria-current="page">{entry[locale]}</strong>
              ) : (
                <a href={`${blogRoot}/${entry.slug}/`}>{entry[locale]}</a>
              )}
            </li>
          ))}
      </ul>
    </section>
  ))}
</nav>

<style>
  .clinic-appointment-series-group + .clinic-appointment-series-group {
    margin-top: 1.5rem;
  }

  .clinic-appointment-series-group h3 {
    margin-bottom: 0.5rem;
  }
</style>
```

- [ ] **Step 4: 컴포넌트 계약 테스트 통과 확인**

Run:

```bash
node --test tests/ecosystem/clinic-appointment-series.test.mjs
```

Expected: 2 tests PASS, 0 FAIL.

- [ ] **Step 5: 두 번째 변경 단위 커밋**

```bash
git add src/components/ClinicAppointmentSeries.astro tests/ecosystem/clinic-appointment-series.test.mjs
git commit -m "시리즈 탐색에서 분류와 현재 글을 일관되게 보여 준다" -m "Constraint: 기존 글의 경로와 기술 본문은 유지한다
Rejected: 글마다 전체 링크 목록 복사 | 새 글을 추가할 때 언어와 순서가 다시 어긋난다
Confidence: high
Scope-risk: narrow
Directive: 탐색 제목과 순서는 clinic-appointment-series.mjs에서만 변경한다
Tested: node --test tests/ecosystem/clinic-appointment-series.test.mjs
Not-tested: 38개 MDX 연결은 다음 작업에서 검증한다"
```

### Task 3: 한국어·영어 글 38개를 공용 탐색에 연결

**Files:**

- Modify: `src/content/docs/blog/clinic-appointment-booking-reliability.mdx`
- Modify: `src/content/docs/blog/clinic-appointment-desired-visit-date-and-confirmed-commitment.mdx`
- Modify: `src/content/docs/blog/clinic-appointment-event-product-first-commitment.mdx`
- Modify: `src/content/docs/blog/clinic-appointment-execution-bom-to-appointment-plan.mdx`
- Modify: `src/content/docs/blog/clinic-appointment-n-visit-remaining-rights.mdx`
- Modify: `src/content/docs/blog/clinic-appointment-package-product-execution-graph.mdx`
- Modify: `src/content/docs/blog/clinic-appointment-part1-not-just-crud.mdx`
- Modify: `src/content/docs/blog/clinic-appointment-part2-state-machine-and-history.mdx`
- Modify: `src/content/docs/blog/clinic-appointment-part3-clinic-specific-availability.mdx`
- Modify: `src/content/docs/blog/clinic-appointment-part4-greedy-vs-global-optimization.mdx`
- Modify: `src/content/docs/blog/clinic-appointment-part5-timefold-constraints.mdx`
- Modify: `src/content/docs/blog/clinic-appointment-part6-closure-equipment-rescheduling.mdx`
- Modify: `src/content/docs/blog/clinic-appointment-part7-review-and-operational-evolution.mdx`
- Modify: `src/content/docs/blog/clinic-appointment-product-version-purchase-snapshot.mdx`
- Modify: `src/content/docs/blog/clinic-appointment-prologue-product-to-appointment.mdx`
- Modify: `src/content/docs/blog/clinic-appointment-scheduling-policy.mdx`
- Modify: `src/content/docs/blog/clinic-appointment-waitlist-core.mdx`
- Modify: `src/content/docs/blog/clinic-appointment-waitlist-operations-command.mdx`
- Modify: `src/content/docs/blog/clinic-appointment-waitlist-operations-dashboard.mdx`
- Modify: `src/content/docs/ko/blog/clinic-appointment-booking-reliability.mdx`
- Modify: `src/content/docs/ko/blog/clinic-appointment-desired-visit-date-and-confirmed-commitment.mdx`
- Modify: `src/content/docs/ko/blog/clinic-appointment-event-product-first-commitment.mdx`
- Modify: `src/content/docs/ko/blog/clinic-appointment-execution-bom-to-appointment-plan.mdx`
- Modify: `src/content/docs/ko/blog/clinic-appointment-n-visit-remaining-rights.mdx`
- Modify: `src/content/docs/ko/blog/clinic-appointment-package-product-execution-graph.mdx`
- Modify: `src/content/docs/ko/blog/clinic-appointment-part1-not-just-crud.mdx`
- Modify: `src/content/docs/ko/blog/clinic-appointment-part2-state-machine-and-history.mdx`
- Modify: `src/content/docs/ko/blog/clinic-appointment-part3-clinic-specific-availability.mdx`
- Modify: `src/content/docs/ko/blog/clinic-appointment-part4-greedy-vs-global-optimization.mdx`
- Modify: `src/content/docs/ko/blog/clinic-appointment-part5-timefold-constraints.mdx`
- Modify: `src/content/docs/ko/blog/clinic-appointment-part6-closure-equipment-rescheduling.mdx`
- Modify: `src/content/docs/ko/blog/clinic-appointment-part7-review-and-operational-evolution.mdx`
- Modify: `src/content/docs/ko/blog/clinic-appointment-product-version-purchase-snapshot.mdx`
- Modify: `src/content/docs/ko/blog/clinic-appointment-prologue-product-to-appointment.mdx`
- Modify: `src/content/docs/ko/blog/clinic-appointment-scheduling-policy.mdx`
- Modify: `src/content/docs/ko/blog/clinic-appointment-waitlist-core.mdx`
- Modify: `src/content/docs/ko/blog/clinic-appointment-waitlist-operations-command.mdx`
- Modify: `src/content/docs/ko/blog/clinic-appointment-waitlist-operations-dashboard.mdx`
- Modify: `tests/ecosystem/clinic-appointment-series.test.mjs`

- [ ] **Step 1: 38개 MDX 연결 계약 테스트 추가**

테스트 파일 상단 import를 다음과 같이 바꾼다.

```js
import { readFile, readdir } from 'node:fs/promises';
```

다음 helper와 테스트를 파일 끝에 추가한다.

```js
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('every published clinic appointment article uses the shared series navigation', async () => {
  const locales = [
    {
      id: 'en',
      directory: 'src/content/docs/blog',
      importPath: '../../../components/ClinicAppointmentSeries.astro',
      heading: '## Series',
    },
    {
      id: 'ko',
      directory: 'src/content/docs/ko/blog',
      importPath: '../../../../components/ClinicAppointmentSeries.astro',
      heading: '## 시리즈 링크',
    },
  ];

  for (const locale of locales) {
    const files = (await readdir(locale.directory))
      .filter((file) => file.startsWith('clinic-appointment-') && file.endsWith('.mdx'));
    assert.equal(files.length, 19, `${locale.id}: published article count`);

    for (const entry of clinicAppointmentSeries) {
      const source = await readFile(`${locale.directory}/${entry.slug}.mdx`, 'utf8');
      const title = entry[locale.id];
      const footer = source.slice(source.lastIndexOf(locale.heading));

      assert.match(source, new RegExp(`^title: "${escapeRegExp(title)}"$`, 'm'));
      assert.match(
        source,
        new RegExp(`import ClinicAppointmentSeries from '${escapeRegExp(locale.importPath)}';`),
      );
      assert.match(
        footer,
        new RegExp(`<ClinicAppointmentSeries current="${entry.slug}" locale="${locale.id}" \\/>`),
      );
      assert.doesNotMatch(footer, /\]\(\/(?:ko\/)?blog\/clinic-appointment-/);
    }
  }
});
```

- [ ] **Step 2: 테스트를 실행해 기존 제목과 복사된 링크 목록 때문에 실패하는지 확인**

Run:

```bash
node --test tests/ecosystem/clinic-appointment-series.test.mjs
```

Expected: 세 번째 테스트가 첫 번째 제목 불일치 또는 컴포넌트 import 부재로 FAIL한다.

- [ ] **Step 3: 영어 19개 글의 제목과 탐색 연결 변경**

각 영어 글에 다음 세 변경을 적용한다.

1. frontmatter `title`을 `clinicAppointmentSeries`의 같은 slug에 해당하는 `en` 값으로 바꾼다.
2. frontmatter 종료 구분자 다음에 아래 import를 추가한다.
3. `## Series` 아래의 기존 목록 전체를 현재 slug를 전달하는 컴포넌트 한 줄로 바꾼다.

```mdx
import ClinicAppointmentSeries from '../../../components/ClinicAppointmentSeries.astro';

## Series

<ClinicAppointmentSeries current="clinic-appointment-prologue-product-to-appointment" locale="en" />
```

위 예시의 `current` 값은 각 파일명에서 `.mdx`를 뺀 정확한 slug로 바꾼다. 다른 본문은 수정하지 않는다.

- [ ] **Step 4: 한국어 19개 글의 제목과 탐색 연결 변경**

각 한국어 글에 다음 세 변경을 적용한다.

1. frontmatter `title`을 `clinicAppointmentSeries`의 같은 slug에 해당하는 `ko` 값으로 바꾼다.
2. frontmatter 종료 구분자 다음에 아래 import를 추가한다.
3. `## 시리즈 링크` 아래의 기존 목록 전체를 현재 slug를 전달하는 컴포넌트 한 줄로 바꾼다.

```mdx
import ClinicAppointmentSeries from '../../../../components/ClinicAppointmentSeries.astro';

## 시리즈 링크

<ClinicAppointmentSeries current="clinic-appointment-prologue-product-to-appointment" locale="ko" />
```

위 예시의 `current` 값은 각 파일명에서 `.mdx`를 뺀 정확한 slug로 바꾼다. 다른 본문은 수정하지 않는다.

- [ ] **Step 5: 38개 글 연결 테스트 통과 확인**

Run:

```bash
node --test tests/ecosystem/clinic-appointment-series.test.mjs
```

Expected: 3 tests PASS, 0 FAIL.

- [ ] **Step 6: 제목·날짜·자산 변경 범위 확인**

Run:

```bash
git diff -- src/content/docs/blog/clinic-appointment-*.mdx src/content/docs/ko/blog/clinic-appointment-*.mdx
```

Expected: 각 파일에서 `title`, 컴포넌트 import, 시리즈 목록만 바뀐다. `date`, `hero`, 이미지 URL, 기술 본문 변경은 없어야 한다.

- [ ] **Step 7: 세 번째 변경 단위 커밋**

```bash
git add src/content/docs/blog/clinic-appointment-*.mdx src/content/docs/ko/blog/clinic-appointment-*.mdx tests/ecosystem/clinic-appointment-series.test.mjs
git commit -m "병원 예약 글에서 새 분류와 탐색 순서를 함께 보여 준다" -m "Constraint: 기존 경로, 발행 날짜, 기술 본문, 시각 자료를 유지한다
Rejected: 각 글의 링크 목록을 개별 수정 | 양 언어와 19개 글의 순서가 다시 달라질 수 있다
Confidence: high
Scope-risk: moderate
Directive: frontmatter 제목과 공용 탐색 데이터의 제목을 항상 함께 변경한다
Tested: node --test tests/ecosystem/clinic-appointment-series.test.mjs
Not-tested: 전체 Astro 빌드와 브라우저 검증은 다음 작업에서 수행한다"
```

### Task 4: 전체 빌드와 로컬 경로 검증

**Files:**

- Verify only: `src/data/clinic-appointment-series.mjs`
- Verify only: `src/components/ClinicAppointmentSeries.astro`
- Verify only: 영어·한국어 Clinic Appointment MDX 38개

- [ ] **Step 1: diff 형식 검사**

Run:

```bash
CLINIC_SERIES_BASE=$(git log -1 --format=%H -- docs/superpowers/plans/2026-08-16-clinic-appointment-series-classification.md)
git diff --check "$CLINIC_SERIES_BASE..HEAD"
```

Expected: 출력 없이 exit 0.

- [ ] **Step 2: 전체 테스트 실행**

Run:

```bash
npm test
```

Expected: 모든 Node 테스트 PASS, 0 FAIL.

- [ ] **Step 3: Astro 검사와 정적 빌드 실행**

Run:

```bash
npm run build
```

Expected: `astro check` 오류 0건, `astro build` 성공.

- [ ] **Step 4: 로컬 preview 시작**

Run in a long-running terminal:

```bash
npm run preview -- --host 127.0.0.1 --port 4325
```

Expected: `http://127.0.0.1:4325/`에서 preview가 시작된다.

- [ ] **Step 5: 발행된 38개 경로의 HTTP 응답 확인**

Run:

```bash
node --input-type=module -e "import { clinicAppointmentSeries as series } from './src/data/clinic-appointment-series.mjs'; for (const item of series) { for (const prefix of ['/blog', '/ko/blog']) { const url = 'http://127.0.0.1:4325' + prefix + '/' + item.slug + '/'; const response = await fetch(url); if (response.status !== 200) throw new Error(url + ' -> ' + response.status); } } console.log('38 clinic appointment routes: PASS');"
```

Expected: `38 clinic appointment routes: PASS`.

- [ ] **Step 6: 분류별 대표 화면을 브라우저에서 확인**

다음 경로를 실제 브라우저로 열고 `프롤로그/설계/구현/운영 확장` 또는 `Prologue/Design/Implementation/Operations` 그룹, 현재 글 굵은 표시, 링크 순서, 모바일 폭 줄바꿈을 확인한다.

- `http://127.0.0.1:4325/ko/blog/clinic-appointment-prologue-product-to-appointment/`
- `http://127.0.0.1:4325/ko/blog/clinic-appointment-scheduling-policy/`
- `http://127.0.0.1:4325/ko/blog/clinic-appointment-part1-not-just-crud/`
- `http://127.0.0.1:4325/ko/blog/clinic-appointment-waitlist-core/`
- `http://127.0.0.1:4325/blog/clinic-appointment-prologue-product-to-appointment/`
- `http://127.0.0.1:4325/blog/clinic-appointment-scheduling-policy/`
- `http://127.0.0.1:4325/blog/clinic-appointment-part1-not-just-crud/`
- `http://127.0.0.1:4325/blog/clinic-appointment-waitlist-core/`

Expected: 네 분류가 순서대로 보이고 현재 글만 링크 없이 굵게 표시된다. `구현 8·9`와 `운영 확장 3~11` 링크는 없어야 한다.

- [ ] **Step 7: 작업 트리와 커밋 범위 확인**

Run:

```bash
CLINIC_SERIES_BASE=$(git log -1 --format=%H -- docs/superpowers/plans/2026-08-16-clinic-appointment-series-classification.md)
git status --short
git diff --name-only "$CLINIC_SERIES_BASE..HEAD"
```

Expected: 미커밋 변경이 없고, 변경 경로는 데이터·컴포넌트·테스트·38개 MDX뿐이다.

### Task 5: GitHub 변경 전 상태 고정과 신규 구현 Issue 등록

**Remote:** `bluetape4k/clinic-appointment`

- [ ] **Step 1: Clinic Appointment 저장소 지침과 현재 인증 확인**

Run:

```bash
sed -n '1,260p' /Users/debop/work/bluetape4k/AGENTS.md
sed -n '1,260p' /Users/debop/work/bluetape4k/clinic-appointment/AGENTS.md
gh auth status
```

Expected: 적용 지침을 읽을 수 있고 `gh`가 Issue 수정 권한이 있는 계정으로 인증되어 있다. 지침이 달라졌다면 이 계획보다 최신 지침을 우선한다.

- [ ] **Step 2: Epic과 기존 Issue의 복구 기준을 읽어 보존**

Run:

```bash
gh issue view 275 -R bluetape4k/clinic-appointment --json number,title,body,state,assignees,labels,milestone,url
gh api 'repos/bluetape4k/clinic-appointment/issues?state=all&per_page=100' --jq '.[] | select(.number >= 276 and .number <= 294) | {number,title,state,assignees:[.assignees[].login],labels:[.labels[].name],milestone:(.milestone.title // null),url}'
```

Expected: #275~#294를 모두 읽을 수 있다. 실행 기록에는 변경 전 제목, Epic 본문, 상태, assignee, label, milestone을 남긴다.

- [ ] **Step 3: 신규 구현 글 Issue의 중복 여부 확인**

Run:

```bash
gh issue list -R bluetape4k/clinic-appointment --state all --search 'in:title N회 상품 구매를 방문 계획으로 펼치는 방법' --json number,title,state,url
gh issue list -R bluetape4k/clinic-appointment --state all --search 'in:title 패키지 상품의 실행 순서와 선택 조건을 방문 계획으로 고정하는 방법' --json number,title,state,url
```

Expected: 정확히 일치하는 Issue가 없다. 일치 항목이 있으면 새 Issue를 만들지 않고 중복 후보를 검토해 기존 Issue를 사용한다.

- [ ] **Step 4: `구현 8` Issue 본문 작성**

`apply_patch`로 `.omx/tmp/clinic-appointment-implementation-8-issue.md`를 만들고
다음 내용을 넣는다. 이 파일은 Issue 재조회가 끝난 뒤 `apply_patch`로 삭제한다.

```markdown
## 상위 Epic

- #275 — 병원 예약 서비스 — 프롤로그·설계·구현·운영 확장
- 분류: 구현 8

## 목적

N회 상품 구매가 예약 여러 건의 복사가 아니라, 구매 시점의 반복 횟수를 순번별 치료 계획과 앞으로 사용할 방문 권리로 고정하는 구현 과정을 설명한다.

## 다룰 범위

- `PurchaseCompletedHandler`가 신뢰할 수 있는 구매 정보를 받는 경계
- `AppointmentPlanFactory`가 `repeatCount`를 `PlannedTreatment`의 `sequenceNo`로 펼치는 과정
- 마지막 선행 회차와 첫 후행 회차를 연결하는 의존 관계 해석
- 같은 구매 이벤트를 다시 처리해도 계획을 중복 생성하지 않는 경계
- 설계 3의 남은 방문 권리와 현재 테스트의 연결

## 근거

- `appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/service/AppointmentPlanFactory.kt`
- `appointment-event/src/main/kotlin/io/bluetape4k/clinic/appointment/event/integration/PurchaseCompletedHandler.kt`
- `appointment-core/src/test/kotlin/io/bluetape4k/clinic/appointment/service/AppointmentPlanFactoryTest.kt`
- commit `f8dea826fdeb49da655123a6505d08ea7819f2ba`
- #181, #184

## 공개 범위

- 현재 코드, 승인된 설계, 운영 검증 대기, 후속 계획을 구분한다.
- 환자·병원 식별 정보와 내부 운영 임계값은 공개하지 않는다.
- 글 본문에 “특정 소스 커밋을 대조해 작성했다”는 메타 설명을 넣지 않고, 구현 경로를 기술 근거로만 사용한다.

## 완료 기준

- [ ] 한국어 글을 `src/content/docs/ko/blog/`에 추가한다.
- [ ] 영어 글을 `src/content/docs/blog/`에 추가한다.
- [ ] 구현 7 다음에 연결하고, 구현 9가 발행되기 전에는 운영 확장 1.1로 이어지게 한다.
- [ ] `repeatCount`, `sequenceNo`, `PlannedTreatment`의 의미를 현재 코드와 테스트에 맞게 설명한다.
- [ ] 기술 본문과 한국어 표현을 `bluetape-writer`로 검토한다.
- [ ] 시각 자료를 추가하면 `bluetape-diagram` 검증을 통과한다.
- [ ] `git diff --check`, 대상 테스트, `npm run build`, 양 언어 경로 확인을 통과한다.
```

- [ ] **Step 5: `구현 8` Issue 생성과 즉시 재조회**

Run:

```bash
gh issue create -R bluetape4k/clinic-appointment --title '[구현 8] N회 상품 구매를 방문 계획으로 펼치는 방법' --body-file .omx/tmp/clinic-appointment-implementation-8-issue.md --assignee debop --label documentation
gh issue list -R bluetape4k/clinic-appointment --state all --search 'in:title N회 상품 구매를 방문 계획으로 펼치는 방법' --json number,title,body,state,assignees,labels,milestone,url --jq 'map(select(.title == "[구현 8] N회 상품 구매를 방문 계획으로 펼치는 방법")) | if length == 1 then .[0] else error("expected exactly one implementation 8 issue") end'
```

Expected: 새 Issue URL 하나를 반환한다. 이어지는 재조회 결과가 한 건인지 확인하고,
그 번호를 `nVisitIssueNumber`로 기록한다. title과 body가 작성 내용과 같고,
assignee=`debop`, label=`documentation`, milestone=`null`, state=`OPEN`이어야 한다.

- [ ] **Step 6: `구현 9` Issue 본문 작성**

`apply_patch`로 `.omx/tmp/clinic-appointment-implementation-9-issue.md`를 만들고
다음 내용을 넣는다. 이 파일은 Issue 재조회가 끝난 뒤 `apply_patch`로 삭제한다.

```markdown
## 상위 Epic

- #275 — 병원 예약 서비스 — 프롤로그·설계·구현·운영 확장
- 분류: 구현 9

## 목적

패키지 상품의 구성 요소를 단순 목록으로 복사하지 않고, 실행 순서·선택 조건·수량을 검증한 불변 방문 계획으로 고정하는 구현 과정을 설명한다.

## 다룰 범위

- `PackageExecutionSnapshot`이 구매 시점의 구성 상품과 선택 결과를 보존하는 경계
- `PackageExecutionPlanner`의 수량 상한, 선택 그룹, 의존 관계, 순환 검증
- 검증된 실행 정보를 `AppointmentPlanRevisionDraft`로 옮기는 과정
- `PurchaseCompletedHandler`와 실행 계획 생성의 연결
- 설계 4의 실행 그래프와 설계 5의 `AppointmentPlan`이 만나는 지점

## 근거

- `appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/service/PackageExecutionPlanner.kt`
- `appointment-core/src/main/kotlin/io/bluetape4k/clinic/appointment/model/plan/PackageExecutionSnapshot.kt`
- `appointment-core/src/test/kotlin/io/bluetape4k/clinic/appointment/service/PackageExecutionPlannerTest.kt`
- `appointment-event/src/main/kotlin/io/bluetape4k/clinic/appointment/event/integration/PurchaseCompletedHandler.kt`
- commit `e5fe7d1104df10c53f202995799bfb237fe1a8f5`
- #181, #184

## 공개 범위

- 현재 코드, 승인된 설계, 운영 검증 대기, 후속 계획을 구분한다.
- 환자·병원 식별 정보와 내부 운영 임계값은 공개하지 않는다.
- 글 본문에 “특정 소스 커밋을 대조해 작성했다”는 메타 설명을 넣지 않고, 구현 경로를 기술 근거로만 사용한다.

## 완료 기준

- [ ] 한국어 글을 `src/content/docs/ko/blog/`에 추가한다.
- [ ] 영어 글을 `src/content/docs/blog/`에 추가한다.
- [ ] 구현 8과 운영 확장 1.1 사이에 연결하고 미발행 글의 링크는 노출하지 않는다.
- [ ] 수량, 선택 그룹, 의존 관계, 순환 검증을 현재 코드와 테스트에 맞게 설명한다.
- [ ] 기술 본문과 한국어 표현을 `bluetape-writer`로 검토한다.
- [ ] 시각 자료를 추가하면 `bluetape-diagram` 검증을 통과한다.
- [ ] `git diff --check`, 대상 테스트, `npm run build`, 양 언어 경로 확인을 통과한다.
```

- [ ] **Step 7: `구현 9` Issue 생성과 즉시 재조회**

Run:

```bash
gh issue create -R bluetape4k/clinic-appointment --title '[구현 9] 패키지 상품의 실행 순서와 선택 조건을 방문 계획으로 고정하는 방법' --body-file .omx/tmp/clinic-appointment-implementation-9-issue.md --assignee debop --label documentation
gh issue list -R bluetape4k/clinic-appointment --state all --search 'in:title 패키지 상품의 실행 순서와 선택 조건을 방문 계획으로 고정하는 방법' --json number,title,body,state,assignees,labels,milestone,url --jq 'map(select(.title == "[구현 9] 패키지 상품의 실행 순서와 선택 조건을 방문 계획으로 고정하는 방법")) | if length == 1 then .[0] else error("expected exactly one implementation 9 issue") end'
```

Expected: 새 Issue URL 하나를 반환한다. 이어지는 재조회 결과가 한 건인지 확인하고,
그 번호를 `packageIssueNumber`로 기록한다. title과 body가 작성 내용과 같고,
assignee=`debop`, label=`documentation`, milestone=`null`, state=`OPEN`이어야 한다.

### Task 6: Epic과 기존 Issue 제목을 새 분류에 맞게 변경

**Remote:** `bluetape4k/clinic-appointment` Issue #275~#294

- [ ] **Step 1: Epic과 Issue 제목 변경**

다음 명령을 순서대로 실행한다. 한 명령이 실패하면 다음 번호로 진행하지 않고 현재 원격 상태를 다시 읽는다.

```bash
gh issue edit 275 -R bluetape4k/clinic-appointment --title 'Epic: 병원 예약 서비스 — 프롤로그·설계·구현·운영 확장'
gh issue edit 276 -R bluetape4k/clinic-appointment --title '[프롤로그] 상품 정보가 고객의 방문 약속이 되기까지'
gh issue edit 277 -R bluetape4k/clinic-appointment --title '[설계 1] 상품 버전과 구매 스냅숏으로 고객의 약속을 고정하는 이유'
gh issue edit 278 -R bluetape4k/clinic-appointment --title '[설계 2] 이벤트 상품은 어떤 방문 약속을 만드는가'
gh issue edit 279 -R bluetape4k/clinic-appointment --title '[설계 3] N회 상품은 왜 예약 한 건이 아닌가'
gh issue edit 280 -R bluetape4k/clinic-appointment --title '[설계 4] 패키지 상품은 왜 실행 그래프가 되는가'
gh issue edit 281 -R bluetape4k/clinic-appointment --title '[설계 5] 상품 BOM이 AppointmentPlan과 방문으로 번역되는 과정'
gh issue edit 282 -R bluetape4k/clinic-appointment --title '[설계 6] 고객 희망 내원 날짜는 예약 확정이 아니다'
gh issue edit 283 -R bluetape4k/clinic-appointment --title '[설계 7] 병원마다 예약 규칙이 다른 이유'
gh issue edit 284 -R bluetape4k/clinic-appointment --title '[운영 확장 1] 빈시간 제안과 대기 목록 운영'
gh issue edit 285 -R bluetape4k/clinic-appointment --title '[운영 확장 2] 예약 우선순위는 누구의 규칙인가'
gh issue edit 286 -R bluetape4k/clinic-appointment --title '[운영 확장 3] 병원 사정으로 바뀐 예약을 복구하는 법'
gh issue edit 287 -R bluetape4k/clinic-appointment --title '[운영 확장 4] CRM 프로필과 예약 재평가의 경계'
gh issue edit 288 -R bluetape4k/clinic-appointment --title '[운영 확장 5] 내원 실적과 실제 시술 완료는 같은 데이터가 아니다'
gh issue edit 289 -R bluetape4k/clinic-appointment --title '[운영 확장 6] 알림과 리마인더는 왜 별도 서비스인가'
gh issue edit 290 -R bluetape4k/clinic-appointment --title '[운영 확장 7] 예약 결과가 외부 시스템과 통계로 전달되는 과정'
gh issue edit 291 -R bluetape4k/clinic-appointment --title '[운영 확장 8] 여러 병원을 하나의 서비스로 운영하는 데이터 경계'
gh issue edit 292 -R bluetape4k/clinic-appointment --title '[운영 확장 9] 재시도·replay·quarantine에도 예약을 한 번만 바꾸는 방법'
gh issue edit 293 -R bluetape4k/clinic-appointment --title '[운영 확장 10] 최신 계산 결과만 예약에 적용하는 운영 신뢰성'
gh issue edit 294 -R bluetape4k/clinic-appointment --title '[운영 확장 11·부록] 환자 포털·모바일 채널에서 만나는 예약 약속'
```

Expected: 각 명령이 해당 Issue URL을 반환한다. 닫힌 Issue는 닫힌 상태를 유지한다.

- [ ] **Step 2: Epic 본문의 `등록 순서`를 분류별 작업 목록으로 교체**

현재 #275 본문에서 `## 등록 순서` 앞부분은 그대로 보존하고, 해당 절부터 끝까지 아래 구조로 교체한다. `nVisitIssueNumber`와 `packageIssueNumber`에는 Task 5에서 실제로 다시 읽어 확인한 번호와 URL을 넣는다.

```markdown
## 등록 순서

### 프롤로그

1. [#276 — 상품 정보가 고객의 방문 약속이 되기까지](https://github.com/bluetape4k/clinic-appointment/issues/276)

### 설계

1. [#277 — 상품 버전과 구매 스냅숏으로 고객의 약속을 고정하는 이유](https://github.com/bluetape4k/clinic-appointment/issues/277)
2. [#278 — 이벤트 상품은 어떤 방문 약속을 만드는가](https://github.com/bluetape4k/clinic-appointment/issues/278)
3. [#279 — N회 상품은 왜 예약 한 건이 아닌가](https://github.com/bluetape4k/clinic-appointment/issues/279)
4. [#280 — 패키지 상품은 왜 실행 그래프가 되는가](https://github.com/bluetape4k/clinic-appointment/issues/280)
5. [#281 — 상품 BOM이 AppointmentPlan과 방문으로 번역되는 과정](https://github.com/bluetape4k/clinic-appointment/issues/281)
6. [#282 — 고객 희망 내원 날짜는 예약 확정이 아니다](https://github.com/bluetape4k/clinic-appointment/issues/282)
7. [#283 — 병원마다 예약 규칙이 다른 이유](https://github.com/bluetape4k/clinic-appointment/issues/283)

### 구현

1. [병원 예약은 CRUD로 끝나지 않는다](https://bluetape4k.github.io/ko/blog/clinic-appointment-part1-not-just-crud/)
2. [예약 상태는 열거형이 아니다](https://bluetape4k.github.io/ko/blog/clinic-appointment-part2-state-machine-and-history/)
3. [병원마다 다른 업무시간과 자원으로 예약 가능 시간을 계산하기](https://bluetape4k.github.io/ko/blog/clinic-appointment-part3-clinic-specific-availability/)
4. [한 건의 예약 가능 시간 조회와 전체 일정 최적화는 다르다](https://bluetape4k.github.io/ko/blog/clinic-appointment-part4-greedy-vs-global-optimization/)
5. [병원 업무 규칙을 Timefold 제약 조건으로 옮기기](https://bluetape4k.github.io/ko/blog/clinic-appointment-part5-timefold-constraints/)
6. [휴진과 장비 고장은 예약 설계를 어떻게 바꾸는가](https://bluetape4k.github.io/ko/blog/clinic-appointment-part6-closure-equipment-rescheduling/)
7. [완성 뒤가 진짜 시작이다](https://bluetape4k.github.io/ko/blog/clinic-appointment-part7-review-and-operational-evolution/)
8. [#${nVisitIssueNumber} — N회 상품 구매를 방문 계획으로 펼치는 방법](https://github.com/bluetape4k/clinic-appointment/issues/${nVisitIssueNumber})
9. [#${packageIssueNumber} — 패키지 상품의 실행 순서와 선택 조건을 방문 계획으로 고정하는 방법](https://github.com/bluetape4k/clinic-appointment/issues/${packageIssueNumber})

### 운영 확장

1. [#284 — 빈시간 제안과 대기 목록 운영](https://github.com/bluetape4k/clinic-appointment/issues/284)
2. [#285 — 예약 우선순위는 누구의 규칙인가](https://github.com/bluetape4k/clinic-appointment/issues/285)
3. [#286 — 병원 사정으로 바뀐 예약을 복구하는 법](https://github.com/bluetape4k/clinic-appointment/issues/286)
4. [#287 — CRM 프로필과 예약 재평가의 경계](https://github.com/bluetape4k/clinic-appointment/issues/287)
5. [#288 — 내원 실적과 실제 시술 완료는 같은 데이터가 아니다](https://github.com/bluetape4k/clinic-appointment/issues/288)
6. [#289 — 알림과 리마인더는 왜 별도 서비스인가](https://github.com/bluetape4k/clinic-appointment/issues/289)
7. [#290 — 예약 결과가 외부 시스템과 통계로 전달되는 과정](https://github.com/bluetape4k/clinic-appointment/issues/290)
8. [#291 — 여러 병원을 하나의 서비스로 운영하는 데이터 경계](https://github.com/bluetape4k/clinic-appointment/issues/291)
9. [#292 — 재시도·replay·quarantine에도 예약을 한 번만 바꾸는 방법](https://github.com/bluetape4k/clinic-appointment/issues/292)
10. [#293 — 최신 계산 결과만 예약에 적용하는 운영 신뢰성](https://github.com/bluetape4k/clinic-appointment/issues/293)
11. [#294 — 부록: 환자 포털·모바일 채널에서 만나는 예약 약속](https://github.com/bluetape4k/clinic-appointment/issues/294)

다음 작업은 설계 7을 마무리한 뒤 구현 8, 구현 9 순서로 진행한다. 운영 확장 3 이후 글은 각 Issue의 현재 구현 근거와 선행 글을 다시 확인한 뒤 작성한다.
```

`구현 8·9` 두 줄도 다른 항목처럼 실제 Issue 번호와 URL을 가진 Markdown 링크로
작성한다. 현재 본문과 교체할 절을 합친 전체 내용을
`.omx/tmp/clinic-appointment-epic-275.md`에 저장한다. Task 7 재조회가 끝나면 이
파일과 신규 Issue 본문 파일 두 개를 `apply_patch`로 삭제한다.

Run:

```bash
gh issue edit 275 -R bluetape4k/clinic-appointment --body-file .omx/tmp/clinic-appointment-epic-275.md
```

Expected: #275 URL을 반환한다.

### Task 7: GitHub 원격 상태와 최종 작업 상태 검증

**Remote:** `bluetape4k/clinic-appointment`

- [ ] **Step 1: #275~#294 제목과 메타데이터 재조회**

Run:

```bash
gh api 'repos/bluetape4k/clinic-appointment/issues?state=all&per_page=100' --jq '.[] | select(.number >= 275 and .number <= 294) | {number,title,state,assignees:[.assignees[].login],labels:[.labels[].name],milestone:(.milestone.title // null),url}'
```

Expected:

- #275 제목은 `Epic: 병원 예약 서비스 — 프롤로그·설계·구현·운영 확장`이다.
- #276~#294 제목은 Task 6의 정확한 값과 같다.
- 기존 Issue의 OPEN/CLOSED 상태는 변경 전과 같다.
- 기존 Issue의 assignee=`debop`, label=`documentation`, milestone=`null`이 유지된다.

- [ ] **Step 2: 신규 Issue 두 개 재조회**

정확한 제목으로 신규 Issue를 다시 검색한다.

```bash
gh issue list -R bluetape4k/clinic-appointment --state all --search 'in:title N회 상품 구매를 방문 계획으로 펼치는 방법' --json number,title,body,state,assignees,labels,milestone,url --jq 'map(select(.title == "[구현 8] N회 상품 구매를 방문 계획으로 펼치는 방법")) | if length == 1 then .[0] else error("expected exactly one implementation 8 issue") end'
gh issue list -R bluetape4k/clinic-appointment --state all --search 'in:title 패키지 상품의 실행 순서와 선택 조건을 방문 계획으로 고정하는 방법' --json number,title,body,state,assignees,labels,milestone,url --jq 'map(select(.title == "[구현 9] 패키지 상품의 실행 순서와 선택 조건을 방문 계획으로 고정하는 방법")) | if length == 1 then .[0] else error("expected exactly one implementation 9 issue") end'
```

Expected: 제목과 본문이 Task 5의 값과 같고 state=`OPEN`, assignee=`debop`, label=`documentation`, milestone=`null`이다.

- [ ] **Step 3: Epic 본문 분류와 링크 재조회**

Run:

```bash
gh issue view 275 -R bluetape4k/clinic-appointment --json title,body,url
```

Expected: `프롤로그`, `설계`, `구현`, `운영 확장`이 이 순서로 한 번씩 나타나고, 구현 8·9의 실제 Issue 링크가 포함된다. GitHub sub-issue 관계는 변경하지 않는다.

- [ ] **Step 4: 사이트 저장소 최종 증거 수집**

Run:

```bash
CLINIC_SERIES_BASE=$(git log -1 --format=%H -- docs/superpowers/plans/2026-08-16-clinic-appointment-series-classification.md)
git status --short --branch
git log --oneline "$CLINIC_SERIES_BASE..HEAD"
git diff --check "$CLINIC_SERIES_BASE..HEAD"
node --test tests/ecosystem/clinic-appointment-series.test.mjs
npm run build
```

Expected: 작업 트리가 깨끗하고 계획된 세 커밋만 추가되어 있으며 모든 검증이 통과한다.

- [ ] **Step 5: 최종 보고**

다음을 빠짐없이 보고한다.

- 변경된 데이터·컴포넌트·테스트와 MDX 38개
- 세 커밋 SHA
- `git diff --check`, `npm test`, `npm run build`, 38개 경로 응답 결과
- 대표 로컬 preview URL 8개와 시각 확인 결과
- Epic #275, #276~#294, 신규 구현 8·9 Issue의 실제 URL과 재조회 결과
- 배포·push·PR·merge를 수행하지 않았다는 경계
- 남은 작업: 구현 8·9 글 작성과 운영 확장 3 이후 글 작성

## 중단과 복구 기준

- 테스트나 build가 실패하면 GitHub 변경을 시작하지 않는다.
- GitHub 제목 변경 중 실패하면 다음 Issue로 진행하지 않고 #275~#294를 다시 읽어 성공한 번호와 실패한 번호를 구분한다.
- 신규 Issue 생성 직후 재조회가 실패하면 Epic 본문에 연결하지 않는다.
- 중복 Issue가 발견되면 새 Issue를 만들지 않고 기존 Issue 번호를 사용하기 전에 제목·본문·상태·메타데이터를 검토한다.
- 기존 제목과 Epic 본문은 Task 5 Step 2의 실행 기록을 복구 기준으로 삼는다. 복구가 필요하면 임의로 추정하지 않고 기록한 값으로 되돌린다.
- 로컬 커밋을 되돌려야 할 때는 `git reset --hard`를 사용하지 않는다. 사용자 승인 후 `git revert <sha>`로 복구한다.
- Issue를 닫거나 삭제하고, 배포·push·PR·merge로 범위를 넓히려면 별도 승인을 받는다.

## 계획 완료 기준

- [ ] 발행된 19편만 공용 데이터에 있고 승인된 분류 순서를 따른다.
- [ ] 한국어·영어 38개 글의 제목이 데이터와 정확히 일치한다.
- [ ] 모든 글이 공용 탐색 컴포넌트를 사용하고 현재 글을 올바르게 표시한다.
- [ ] `구현 8·9`와 미발행 운영 확장 링크가 공개 탐색에 없다.
- [ ] 전체 테스트, Astro 빌드, 38개 경로, 대표 화면 검증이 통과한다.
- [ ] Epic과 기존 Issue 제목이 승인된 분류와 일치한다.
- [ ] 신규 구현 8·9 Issue가 중복 없이 등록되고 Epic 본문에 연결된다.
- [ ] 기존 Issue 상태와 메타데이터가 유지된다.
- [ ] 사이트와 GitHub 원격 값을 모두 다시 읽은 증거가 있다.
