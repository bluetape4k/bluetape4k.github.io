const bi = (en, ko) => ({ en, ko });

export const tenant = {
  issue: 421,
  repository: 'bluetape4k-projects',
  slug: 'projects-tenant-context-carriers',
  sourceRevision: '5954b6329a3e11c70ef12b6d4bd8480e7b38be1b',
  title: bi('Carry the tenant. Respect the boundary.', 'tenant를 전달하고, 경계를 지킵니다.'),
  summary: bi(
    'Compare four tenant carriers by the value a caller can read, the scope that owns it, and what survives a boundary.',
    '네 가지 tenant carrier를 읽을 수 있는 값, 소유하는 scope, 경계를 넘어 남는 범위로 비교합니다.',
  ),
  invariant: bi('No carrier invents a tenant.', '어떤 carrier도 tenant를 임의로 만들지 않습니다.'),
  sources: [
    {
      name: 'ThreadLocalTenantContext.kt',
      url: 'https://github.com/bluetape4k/bluetape4k-projects/blob/5954b6329a3e11c70ef12b6d4bd8480e7b38be1b/bluetape4k/tenant/src/main/kotlin/io/bluetape4k/tenant/ThreadLocalTenantContext.kt',
    },
    {
      name: 'ScopedValueTenantContext.kt',
      url: 'https://github.com/bluetape4k/bluetape4k-projects/blob/5954b6329a3e11c70ef12b6d4bd8480e7b38be1b/bluetape4k/tenant/src/main/kotlin/io/bluetape4k/tenant/ScopedValueTenantContext.kt',
    },
    {
      name: 'ReactorTenantContext.kt',
      url: 'https://github.com/bluetape4k/bluetape4k-projects/blob/5954b6329a3e11c70ef12b6d4bd8480e7b38be1b/bluetape4k/tenant-reactor/src/main/kotlin/io/bluetape4k/tenant/reactor/ReactorTenantContext.kt',
    },
    {
      name: 'KtorTenantContext.kt',
      url: 'https://github.com/bluetape4k/bluetape4k-projects/blob/5954b6329a3e11c70ef12b6d4bd8480e7b38be1b/ktor/tenant/src/main/kotlin/io/bluetape4k/ktor/tenant/KtorTenantContext.kt',
    },
    {
      name: 'Tenant context tests',
      url: 'https://github.com/bluetape4k/bluetape4k-projects/tree/5954b6329a3e11c70ef12b6d4bd8480e7b38be1b/bluetape4k/tenant/src/test/kotlin/io/bluetape4k/tenant',
    },
    {
      name: 'ReactorTenantContextTest.kt',
      url: 'https://github.com/bluetape4k/bluetape4k-projects/blob/5954b6329a3e11c70ef12b6d4bd8480e7b38be1b/bluetape4k/tenant-reactor/src/test/kotlin/io/bluetape4k/tenant/reactor/ReactorTenantContextTest.kt',
    },
    {
      name: 'KtorTenantContextTest.kt',
      url: 'https://github.com/bluetape4k/bluetape4k-projects/blob/5954b6329a3e11c70ef12b6d4bd8480e7b38be1b/ktor/tenant/src/test/kotlin/io/bluetape4k/ktor/tenant/KtorTenantContextTest.kt',
    },
  ],
  carriers: [
    {
      id: 'threadlocal',
      label: 'ThreadLocal',
      owner: bi('This carrier instance owns the binding on the current thread.', '현재 thread와 이 carrier instance 범위에 binding을 보관합니다.'),
      install: bi('withTenant(tenantId) sets the value before the block.', 'withTenant(tenantId)가 block 앞에서 값을 설정합니다.'),
      read: bi('Read from the same thread with currentOrNull or requireCurrent.', '같은 thread에서 currentOrNull 또는 requireCurrent로 읽습니다.'),
      cleanup: bi('finally restores the previous value or removes it.', 'finally에서 이전 값을 복원하거나 remove합니다.'),
      boundary: bi('A dispatcher or suspend hop has no automatic propagation.', 'dispatcher 또는 suspend hop으로 자동 전파되지 않습니다.'),
    },
    {
      id: 'scoped',
      label: 'ScopedValue',
      owner: bi('The lexical ScopedValue carrier owns the binding.', 'lexical ScopedValue carrier가 binding을 소유합니다.'),
      install: bi('ScopedValue.where(...).run opens a lexical binding.', 'ScopedValue.where(...).run이 lexical binding을 엽니다.'),
      read: bi('Read only while the lexical carrier is bound.', 'lexical carrier가 bound된 동안에만 읽습니다.'),
      cleanup: bi('Leaving run restores the previous lexical state.', 'run을 벗어나면 이전 lexical 상태로 복원합니다.'),
      boundary: bi('StructuredTaskScope.fork inherits; an independent virtual thread and coroutine bridge do not.', 'StructuredTaskScope.fork는 상속하지만 독립 virtual thread와 coroutine bridge는 전파하지 않습니다.'),
    },
    {
      id: 'reactor',
      label: 'Reactor Context',
      owner: bi('Each subscriber owns an immutable Context chain.', '각 subscriber가 immutable Context chain을 소유합니다.'),
      install: bi('contextWrite derives a Context for this subscription.', 'contextWrite가 이 subscription을 위한 Context를 파생합니다.'),
      read: bi('deferContextual reads the subscriber Context explicitly.', 'deferContextual이 subscriber Context를 명시적으로 읽습니다.'),
      cleanup: bi('Cancellation ends the subscription; the outer Context is unchanged.', 'cancel은 subscription을 끝내며 outer Context는 바뀌지 않습니다.'),
      boundary: bi('Scheduler work stays in the chain; hooks and coroutine bridges are not implied.', 'scheduler 작업은 chain 안에 있지만 hook과 coroutine bridge는 자동으로 생기지 않습니다.'),
    },
    {
      id: 'ktor',
      label: 'Ktor Call',
      owner: bi('The ApplicationCall attributes own the binding.', 'ApplicationCall attributes가 binding을 소유합니다.'),
      install: bi('bindTenant writes a private, write-once call attribute.', 'bindTenant가 private write-once call attribute를 기록합니다.'),
      read: bi('Read from the same ApplicationCall, even after a dispatcher hop.', 'dispatcher hop 뒤에도 같은 ApplicationCall에서 읽습니다.'),
      cleanup: bi('The call retains its tenant until the call is released.', 'call이 해제될 때까지 tenant를 유지합니다.'),
      boundary: bi('A new call is unbound; pass the call explicitly across a dispatcher.', '새 call은 unbound이며 dispatcher 경계에서는 call을 명시적으로 전달합니다.'),
    },
  ],
  scenarios: [
    { id: 'normal', label: bi('Normal binding', '정상 binding') },
    { id: 'nested', label: bi('Nested scope', '중첩 scope') },
    { id: 'missing', label: bi('Missing tenant', 'tenant 누락') },
    { id: 'error', label: bi('Exception cleanup', '예외 cleanup') },
    { id: 'cancel', label: bi('Cancellation cleanup', '취소 cleanup') },
    { id: 'handoff', label: bi('Boundary handoff', '경계 handoff') },
  ],
};

const step = (id, title, text, visible, owner) => ({ id, title, text, visible, owner });
const missing = (locale) => locale === 'ko' ? 'tenant 없음' : 'no tenant';

const stories = {
  threadlocal: {
    normal: {
      steps: [
        step('bind', bi('Bind tenant', 'tenant binding'), bi('withTenant installs clinic-a on this thread.', 'withTenant가 이 thread에 clinic-a를 설치합니다.'), 'tenant=clinic-a', 'ThreadLocal'),
        step('read', bi('Read current tenant', '현재 tenant 읽기'), bi('requireCurrent returns clinic-a from the same thread.', 'requireCurrent가 같은 thread의 clinic-a를 반환합니다.'), 'tenant=clinic-a', 'caller'),
        step('restore', bi('Leave lexical block', 'lexical block 종료'), bi('finally restores the previous thread value.', 'finally가 이전 thread 값을 복원합니다.'), missing('en'), 'ThreadLocal'),
      ],
      outcome: bi('The value is available only inside the thread-bound block.', '값은 thread에 binding된 block 안에서만 사용할 수 있습니다.'),
      status: 'APPLIED',
      after: 'unbound',
    },
    nested: {
      steps: [
        step('outer', bi('Bind outer', 'outer binding'), bi('The outer block binds clinic-a.', 'outer block이 clinic-a를 binding합니다.'), 'tenant=clinic-a', 'ThreadLocal'),
        step('inner', bi('Bind inner', 'inner binding'), bi('A nested block temporarily replaces it with clinic-b.', '중첩 block이 잠시 clinic-b로 바꿉니다.'), 'tenant=clinic-b', 'ThreadLocal'),
        step('restore-inner', bi('Restore outer', 'outer 복원'), bi('The inner finally restores clinic-a.', 'inner finally가 clinic-a를 복원합니다.'), 'tenant=clinic-a', 'ThreadLocal'),
        step('restore-outer', bi('Remove at boundary', '경계에서 제거'), bi('The top-level finally removes the binding.', 'top-level finally가 binding을 제거합니다.'), missing('en'), 'ThreadLocal'),
      ],
      outcome: bi('Nested binding restores the outer value in LIFO order.', '중첩 binding은 LIFO 순서로 outer 값을 복원합니다.'),
      status: 'RESTORED',
      after: 'unbound',
    },
    missing: {
      steps: [
        step('read-missing', bi('Require current tenant', '현재 tenant 요구'), bi('There is no binding, so requireCurrent throws MissingTenantContextException.', 'binding이 없어 requireCurrent가 MissingTenantContextException을 던집니다.'), missing('en'), 'caller'),
      ],
      outcome: bi('Missing context fails closed; no default tenant is invented.', 'context가 없으면 fail closed하며 default tenant를 만들지 않습니다.'),
      status: 'MISSING',
      after: 'unbound',
    },
    error: {
      steps: [
        step('bind', bi('Bind tenant', 'tenant binding'), bi('The block binds clinic-a on the current thread.', 'block이 현재 thread에 clinic-a를 binding합니다.'), 'tenant=clinic-a', 'ThreadLocal'),
        step('throw', bi('Block throws', 'block 예외'), bi('The caller raises an exception inside the lexical block.', 'caller가 lexical block 안에서 예외를 발생시킵니다.'), 'tenant=clinic-a · exception', 'caller'),
        step('cleanup', bi('finally cleans up', 'finally cleanup'), bi('The exception escapes after finally restores or removes the value.', 'finally가 값을 복원하거나 제거한 뒤 예외가 전파됩니다.'), missing('en'), 'ThreadLocal'),
      ],
      outcome: bi('Failure does not leak the tenant into a reused thread.', '실패해도 재사용 thread에 tenant가 누출되지 않습니다.'),
      status: 'FAILED_AND_CLEANED',
      after: 'unbound',
    },
    cancel: {
      steps: [
        step('bind', bi('Bind tenant', 'tenant binding'), bi('The block binds clinic-a before cancellation.', '취소 전에 block이 clinic-a를 binding합니다.'), 'tenant=clinic-a', 'ThreadLocal'),
        step('cancel-request', bi('Cancellation request', '취소 요청'), bi('This non-suspending API has no coroutine cancellation bridge; a request alone does not unwind the block.', '이 non-suspending API에는 coroutine 취소 bridge가 없으므로 요청만으로 block이 자동 종료되지 않습니다.'), 'tenant=clinic-a · no bridge', 'caller'),
        step('unwind', bi('Caller must unwind', 'caller가 block 종료'), bi('Only returning or throwing from the block reaches finally and restores or removes the value.', 'block에서 return하거나 throw해야 finally가 실행되어 값을 복원하거나 제거합니다.'), 'tenant=clinic-a until block exits', 'caller'),
      ],
      outcome: bi('Coroutine cancellation is unsupported here; cleanup happens only when the caller actually exits the block.', 'coroutine 취소는 지원되지 않으며 caller가 실제로 block을 종료할 때만 cleanup이 실행됩니다.'),
      status: 'UNSUPPORTED_COROUTINE_CANCELLATION',
      after: 'caller must unwind block',
    },
    handoff: {
      steps: [
        step('bind', bi('Bind on thread A', 'thread A에서 binding'), bi('clinic-a is installed on the current thread.', '현재 thread에 clinic-a가 설치됩니다.'), 'thread A: clinic-a', 'ThreadLocal'),
        step('handoff', bi('Dispatcher hop', 'dispatcher hop'), bi('A different thread does not automatically carry the ThreadLocal value.', '다른 thread에는 ThreadLocal 값이 자동 전파되지 않습니다.'), 'thread B: no tenant', 'boundary'),
        step('caller', bi('Caller transports explicitly', 'caller가 명시적으로 전달'), bi('Use an explicit carrier or a supported context element when the application needs a handoff.', '애플리케이션이 handoff를 요구하면 명시적 carrier 또는 지원되는 context element를 사용해야 합니다.'), 'thread B: caller-owned', 'caller'),
      ],
      outcome: bi('ThreadLocal has no automatic suspend or dispatcher propagation.', 'ThreadLocal은 suspend 또는 dispatcher 자동 전파를 제공하지 않습니다.'),
      status: 'UNSUPPORTED_AUTO_PROPAGATION',
      after: 'boundary requires explicit transport',
    },
  },
  scoped: {
    normal: {
      steps: [
        step('bind', bi('Open lexical carrier', 'lexical carrier 열기'), bi('ScopedValue.where binds clinic-a for the run.', 'ScopedValue.where가 run 동안 clinic-a를 binding합니다.'), 'tenant=clinic-a', 'ScopedValue'),
        step('read', bi('Read in scope', 'scope 안에서 읽기'), bi('requireCurrent reads the value while the carrier is bound.', 'carrier가 bound된 동안 requireCurrent가 값을 읽습니다.'), 'tenant=clinic-a', 'caller'),
        step('restore', bi('Exit carrier', 'carrier 종료'), bi('Leaving run restores the previous lexical state.', 'run을 벗어나면 이전 lexical 상태로 복원됩니다.'), missing('en'), 'ScopedValue'),
      ],
      outcome: bi('ScopedValue makes the lexical lifetime explicit.', 'ScopedValue는 lexical lifetime을 명시적으로 만듭니다.'),
      status: 'APPLIED',
      after: 'unbound',
    },
    nested: {
      steps: [
        step('outer', bi('Open outer carrier', 'outer carrier 열기'), bi('The outer lexical carrier binds clinic-a.', 'outer lexical carrier가 clinic-a를 binding합니다.'), 'tenant=clinic-a', 'ScopedValue'),
        step('inner', bi('Open inner carrier', 'inner carrier 열기'), bi('A nested where/run temporarily exposes clinic-b.', '중첩 where/run이 잠시 clinic-b를 노출합니다.'), 'tenant=clinic-b', 'ScopedValue'),
        step('restore-inner', bi('Return to outer', 'outer로 복귀'), bi('The inner carrier closes and clinic-a is visible again.', 'inner carrier가 닫히고 clinic-a가 다시 보입니다.'), 'tenant=clinic-a', 'ScopedValue'),
        step('restore-outer', bi('Exit outer carrier', 'outer carrier 종료'), bi('The outer run closes with no tenant remaining.', 'outer run이 종료되면 tenant가 남지 않습니다.'), missing('en'), 'ScopedValue'),
      ],
      outcome: bi('Nested lexical carriers restore the outer value without mutable cleanup.', '중첩 lexical carrier는 mutable cleanup 없이 outer 값을 복원합니다.'),
      status: 'RESTORED',
      after: 'unbound',
    },
    missing: {
      steps: [
        step('read-missing', bi('Require current tenant', '현재 tenant 요구'), bi('An unbound ScopedValue fails with MissingTenantContextException.', 'bound되지 않은 ScopedValue는 MissingTenantContextException으로 실패합니다.'), missing('en'), 'caller'),
      ],
      outcome: bi('An unbound lexical carrier has no default tenant.', 'bound되지 않은 lexical carrier에는 default tenant가 없습니다.'),
      status: 'MISSING',
      after: 'unbound',
    },
    error: {
      steps: [
        step('bind', bi('Open lexical carrier', 'lexical carrier 열기'), bi('clinic-a is bound for the run.', 'run 동안 clinic-a가 binding됩니다.'), 'tenant=clinic-a', 'ScopedValue'),
        step('throw', bi('Block throws', 'block 예외'), bi('The block raises an exception while the value is visible.', '값이 보이는 동안 block이 예외를 발생시킵니다.'), 'tenant=clinic-a · exception', 'caller'),
        step('cleanup', bi('Carrier closes', 'carrier 종료'), bi('The lexical carrier closes while the exception propagates.', '예외가 전파되는 동안 lexical carrier가 종료됩니다.'), missing('en'), 'ScopedValue'),
      ],
      outcome: bi('Lexical exit restores the outer state even when the block fails.', 'block이 실패해도 lexical 종료가 outer 상태를 복원합니다.'),
      status: 'FAILED_AND_CLEANED',
      after: 'unbound',
    },
    cancel: {
      steps: [
        step('bind', bi('Open lexical carrier', 'lexical carrier 열기'), bi('clinic-a is visible for the run.', 'run 동안 clinic-a가 보입니다.'), 'tenant=clinic-a', 'ScopedValue'),
        step('cancel-request', bi('Cancellation request', '취소 요청'), bi('ScopedValue.withTenant accepts a non-suspending block and supplies no coroutine cancellation bridge.', 'ScopedValue.withTenant는 non-suspending block을 받으며 coroutine 취소 bridge를 제공하지 않습니다.'), 'tenant=clinic-a · no bridge', 'caller'),
        step('unwind', bi('Caller must leave run', 'caller가 run 종료'), bi('The lexical carrier closes only when control actually leaves the run.', '제어가 실제로 run을 벗어날 때만 lexical carrier가 종료됩니다.'), 'tenant=clinic-a until run exits', 'caller'),
      ],
      outcome: bi('Coroutine cancellation is unsupported; lexical restoration occurs when the caller exits the non-suspending run.', 'coroutine 취소는 지원되지 않으며 caller가 non-suspending run을 종료할 때 lexical 복원이 일어납니다.'),
      status: 'UNSUPPORTED_COROUTINE_CANCELLATION',
      after: 'caller must leave run',
    },
    handoff: {
      steps: [
        step('bind', bi('Open lexical carrier', 'lexical carrier 열기'), bi('clinic-a is bound in the parent lexical scope.', 'parent lexical scope에 clinic-a가 binding됩니다.'), 'parent: clinic-a', 'ScopedValue'),
        step('fork', bi('StructuredTaskScope.fork', 'StructuredTaskScope.fork'), bi('A structured fork inherits the lexical value.', 'structured fork는 lexical 값을 상속합니다.'), 'fork: clinic-a', 'StructuredTaskScope'),
        step('independent', bi('Independent virtual thread', '독립 virtual thread'), bi('A separately started virtual thread is unbound.', '별도로 시작한 virtual thread는 unbound입니다.'), 'thread: no tenant', 'boundary'),
        step('coroutine', bi('Coroutine dispatcher hop', 'coroutine dispatcher hop'), bi('No coroutine bridge is supplied by this carrier.', '이 carrier는 coroutine bridge를 제공하지 않습니다.'), 'coroutine: unsupported', 'caller'),
      ],
      outcome: bi('Inheritance is limited to structured lexical forks; other hops need an explicit design.', '상속은 structured lexical fork로 제한되며 다른 hop에는 명시적 설계가 필요합니다.'),
      status: 'PARTIAL_INHERITANCE',
      after: 'boundary requires explicit transport',
    },
  },
  reactor: {
    normal: {
      steps: [
        step('derive', bi('Derive subscriber Context', 'subscriber Context 파생'), bi('contextWrite returns a derived Context containing clinic-a.', 'contextWrite가 clinic-a를 담은 derived Context를 반환합니다.'), 'outer: none → derived: clinic-a', 'Reactor Context'),
        step('read', bi('Read contextual value', 'contextual 값 읽기'), bi('deferContextual reads clinic-a from this subscription.', 'deferContextual이 이 subscription에서 clinic-a를 읽습니다.'), 'subscriber: clinic-a', 'caller'),
        step('complete', bi('Complete subscription', 'subscription 완료'), bi('The subscriber completes without mutating an outer Context.', 'subscriber가 outer Context를 바꾸지 않고 완료됩니다.'), 'outer: none', 'Reactor Context'),
      ],
      outcome: bi('The subscriber Context carries the value through its reactive chain.', 'subscriber Context가 reactive chain 안에서 값을 전달합니다.'),
      status: 'APPLIED',
      after: 'outer context unchanged',
    },
    nested: {
      steps: [
        step('outer', bi('Derive outer Context', 'outer Context 파생'), bi('The outer chain derives clinic-a.', 'outer chain이 clinic-a를 파생합니다.'), 'outer: clinic-a', 'Reactor Context'),
        step('inner', bi('Derive inner Context', 'inner Context 파생'), bi('A nested contextWrite derives clinic-b without mutating outer.', '중첩 contextWrite가 outer를 바꾸지 않고 clinic-b를 파생합니다.'), 'inner: clinic-b', 'Reactor Context'),
        step('restore', bi('Return to outer chain', 'outer chain 복귀'), bi('After the inner chain, the outer subscriber still sees clinic-a.', 'inner chain 뒤에도 outer subscriber는 clinic-a를 봅니다.'), 'outer: clinic-a', 'Reactor Context'),
      ],
      outcome: bi('Derived Contexts are immutable views; nesting does not overwrite the outer value.', 'derived Context는 immutable view이며 중첩이 outer 값을 덮어쓰지 않습니다.'),
      status: 'RESTORED',
      after: 'outer context=clinic-a',
    },
    missing: {
      steps: [
        step('read-missing', bi('Require contextual tenant', 'contextual tenant 요구'), bi('An empty subscriber Context throws MissingTenantContextException.', '빈 subscriber Context는 MissingTenantContextException을 던집니다.'), missing('en'), 'caller'),
      ],
      outcome: bi('An empty subscriber Context fails closed.', '빈 subscriber Context는 fail closed합니다.'),
      status: 'MISSING',
      after: 'outer context unchanged',
    },
    error: {
      steps: [
        step('derive', bi('Derive subscriber Context', 'subscriber Context 파생'), bi('The chain derives clinic-a before the failing operator.', '실패하는 operator 앞에서 chain이 clinic-a를 파생합니다.'), 'subscriber: clinic-a', 'Reactor Context'),
        step('throw', bi('Operator fails', 'operator 실패'), bi('The reactive operator raises an error with clinic-a visible.', 'clinic-a가 보이는 상태에서 reactive operator가 오류를 냅니다.'), 'subscriber: clinic-a · error', 'caller'),
        step('outer', bi('Keep outer Context', 'outer Context 유지'), bi('The error terminates the subscription; an outer Context remains unchanged.', '오류가 subscription을 종료하며 outer Context는 바뀌지 않습니다.'), 'outer: unchanged', 'Reactor Context'),
      ],
      outcome: bi('Error termination does not mutate an outer subscriber Context.', '오류 종료가 outer subscriber Context를 변경하지 않습니다.'),
      status: 'FAILED_AND_ISOLATED',
      after: 'outer context unchanged',
    },
    cancel: {
      steps: [
        step('derive', bi('Derive subscriber Context', 'subscriber Context 파생'), bi('The subscription derives clinic-a before cancellation.', '취소 전에 subscription이 clinic-a를 파생합니다.'), 'subscriber: clinic-a', 'Reactor Context'),
        step('cancel', bi('Cancel subscription', 'subscription 취소'), bi('Cancellation stops the reactive chain.', '취소가 reactive chain을 중지합니다.'), 'subscriber: cancelling', 'caller'),
        step('outer', bi('Leave outer Context alone', 'outer Context 유지'), bi('There is no ThreadLocal cleanup call; the outer Context stays unchanged.', 'ThreadLocal cleanup 호출은 없으며 outer Context가 바뀌지 않습니다.'), 'outer: unchanged', 'Reactor Context'),
      ],
      outcome: bi('Cancellation ends the subscription without mutating an outer Context or implying ThreadLocal cleanup.', '취소는 subscription을 종료하며 outer Context를 바꾸거나 ThreadLocal cleanup을 뜻하지 않습니다.'),
      status: 'CANCELLED_AND_ISOLATED',
      after: 'outer context unchanged',
    },
    handoff: {
      steps: [
        step('derive', bi('Write subscriber Context', 'subscriber Context 기록'), bi('contextWrite places clinic-a in the reactive subscriber chain.', 'contextWrite가 reactive subscriber chain에 clinic-a를 기록합니다.'), 'subscriber: clinic-a', 'Reactor Context'),
        step('schedule', bi('Scheduler boundary', 'scheduler 경계'), bi('The same subscriber Context is read after a scheduler hop through deferContextual.', 'deferContextual이 scheduler hop 뒤에도 같은 subscriber Context를 읽습니다.'), 'scheduler: clinic-a', 'Reactor Context'),
        step('bridge', bi('No coroutine bridge', 'coroutine bridge 없음'), bi('Hooks and coroutine bridges are not implied; the reactive chain must remain explicit.', 'hook과 coroutine bridge는 자동으로 생기지 않으며 reactive chain을 명시적으로 유지해야 합니다.'), 'coroutine: caller-owned', 'caller'),
      ],
      outcome: bi('Reactor context follows the subscriber chain, not an ambient thread or coroutine.', 'Reactor context는 ambient thread나 coroutine이 아니라 subscriber chain을 따릅니다.'),
      status: 'EXPLICIT_REACTIVE_HANDOFF',
      after: 'subscriber context ends with subscription',
    },
  },
  ktor: {
    normal: {
      steps: [
        step('bind', bi('Bind to ApplicationCall', 'ApplicationCall에 binding'), bi('bindTenant writes clinic-a to the private call attribute.', 'bindTenant가 private call attribute에 clinic-a를 기록합니다.'), 'call: clinic-a', 'Ktor Call'),
        step('read', bi('Read from same call', '같은 call에서 읽기'), bi('requireCurrent(call) returns clinic-a.', 'requireCurrent(call)이 clinic-a를 반환합니다.'), 'call: clinic-a', 'caller'),
        step('retain', bi('Retain through call lifetime', 'call lifetime 동안 유지'), bi('The call keeps the attribute until the call is released.', 'call이 해제될 때까지 attribute가 유지됩니다.'), 'call: clinic-a', 'ApplicationCall'),
      ],
      outcome: bi('The call owns a stable binding for its request lifetime.', 'call이 request lifetime 동안 안정적인 binding을 소유합니다.'),
      status: 'APPLIED',
      after: 'call: clinic-a',
    },
    nested: {
      steps: [
        step('bind', bi('First binding wins', '첫 binding 승리'), bi('The call binds clinic-a once.', 'call이 clinic-a를 한 번 binding합니다.'), 'call: clinic-a', 'Ktor Call'),
        step('reject', bi('Reject duplicate binding', '중복 binding 거부'), bi('A second bind for clinic-b throws TenantAlreadyBoundException.', 'clinic-b로 두 번째 bind를 시도하면 TenantAlreadyBoundException을 던집니다.'), 'call: clinic-a · duplicate rejected', 'Ktor Call'),
        step('retain', bi('Preserve the winner', 'winner 보존'), bi('The original clinic-a remains readable on the call.', '원래의 clinic-a를 call에서 계속 읽을 수 있습니다.'), 'call: clinic-a', 'ApplicationCall'),
      ],
      outcome: bi('Ktor uses write-once call attributes; a duplicate cannot overwrite the winner.', 'Ktor는 write-once call attribute를 사용하므로 중복 binding이 winner를 덮어쓰지 못합니다.'),
      status: 'DUPLICATE_REJECTED',
      after: 'call: clinic-a',
    },
    missing: {
      steps: [
        step('read-missing', bi('Require call tenant', 'call tenant 요구'), bi('A fresh call has no binding and throws MissingTenantContextException.', '새 call에는 binding이 없어 MissingTenantContextException을 던집니다.'), missing('en'), 'caller'),
      ],
      outcome: bi('A new call is unbound; no request-wide default is assumed.', '새 call은 unbound이며 request-wide default를 가정하지 않습니다.'),
      status: 'MISSING',
      after: 'call unbound',
    },
    error: {
      steps: [
        step('bind', bi('Bind to call', 'call에 binding'), bi('The call attribute stores clinic-a.', 'call attribute가 clinic-a를 저장합니다.'), 'call: clinic-a', 'Ktor Call'),
        step('throw', bi('Handler throws', 'handler 예외'), bi('An exception occurs while handling the same call.', '같은 call을 처리하는 동안 예외가 발생합니다.'), 'call: clinic-a · exception', 'caller'),
        step('read', bi('Call still retains it', 'call이 계속 보존'), bi('The attribute remains available on that call after the exception is handled.', '예외를 처리한 뒤에도 해당 call에서 attribute를 읽을 수 있습니다.'), 'call: clinic-a', 'ApplicationCall'),
      ],
      outcome: bi('Exception handling does not overwrite or clear the call-owned tenant.', '예외 처리가 call 소유 tenant를 덮어쓰거나 지우지 않습니다.'),
      status: 'FAILED_AND_RETAINED',
      after: 'call: clinic-a',
    },
    cancel: {
      steps: [
        step('bind', bi('Bind to call', 'call에 binding'), bi('The call attribute stores clinic-a before cancellation.', '취소 전에 call attribute가 clinic-a를 저장합니다.'), 'call: clinic-a', 'Ktor Call'),
        step('cancel', bi('Cancel handler work', 'handler 작업 취소'), bi('A child handler is cancelled while the call remains active.', 'call이 활성인 동안 child handler가 취소됩니다.'), 'call: clinic-a · cancelling', 'caller'),
        step('read', bi('Same call still reads it', '같은 call에서 계속 읽기'), bi('The call attribute remains clinic-a after cancellation.', '취소 뒤에도 call attribute는 clinic-a입니다.'), 'call: clinic-a', 'ApplicationCall'),
      ],
      outcome: bi('Call retention is independent of child coroutine cancellation.', 'call 보존은 child coroutine 취소와 독립적입니다.'),
      status: 'CANCELLED_AND_RETAINED',
      after: 'call: clinic-a',
    },
    handoff: {
      steps: [
        step('bind', bi('Bind to call', 'call에 binding'), bi('The request call stores clinic-a.', 'request call이 clinic-a를 저장합니다.'), 'call: clinic-a', 'Ktor Call'),
        step('dispatcher', bi('Pass call explicitly', 'call 명시적 전달'), bi('A dispatcher hop can read the value when the same call is passed.', '같은 call을 전달하면 dispatcher hop 뒤에도 값을 읽습니다.'), 'dispatcher: clinic-a', 'caller'),
        step('new-call', bi('Create a new call', '새 call 생성'), bi('A new ApplicationCall has no binding and stays unbound.', '새 ApplicationCall에는 binding이 없어 unbound 상태입니다.'), 'new call: no tenant', 'boundary'),
      ],
      outcome: bi('Ktor survives an explicit same-call handoff; a new call needs its own binding.', 'Ktor는 같은 call을 명시적으로 전달하면 유지되며 새 call에는 별도 binding이 필요합니다.'),
      status: 'EXPLICIT_CALL_HANDOFF',
      after: 'new call unbound',
    },
  },
};

export function buildStory(carrier, scenario) {
  if (!tenant.carriers.some(({ id }) => id === carrier)) throw new RangeError(`Unknown carrier: ${carrier}`);
  if (!tenant.scenarios.some(({ id }) => id === scenario)) throw new RangeError(`Unknown scenario: ${scenario}`);
  const story = stories[carrier][scenario];
  return {
    carrier,
    scenario,
    steps: story.steps.map((item) => ({ ...item })),
    outcome: { ...story.outcome },
    status: story.status,
    after: story.after,
  };
}
