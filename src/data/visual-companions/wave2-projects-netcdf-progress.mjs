const text = (en, ko) => Object.freeze({ en, ko });

const lane = (action, guard, next, budget) => Object.freeze({
  action: text(...action),
  guard: text(...guard),
  next: text(...next),
  budget: text(...budget),
});
const frame = (id, phase, coordinates, boundedImport, progress) => Object.freeze({
  id,
  phase: text(...phase),
  coordinates: lane(...coordinates),
  boundedImport: lane(...boundedImport),
  progress: lane(...progress),
});

export const projectsNetCdfProgressCompanion = Object.freeze({
  issue: '418',
  repository: 'bluetape4k-projects',
  slug: 'projects-netcdf-cf-progress',
  sourceRevision: '8165a8989e0075e7c17c489bf3000bf41fef8232',
  lanes: Object.freeze(['coordinates', 'boundedImport', 'progress']),
  manual: Object.freeze({
    en: '/manual/bluetape4k-projects/2.0/modules/bluetape4k-science/',
    ko: '/ko/manual/bluetape4k-projects/2.0/modules/bluetape4k-science/',
  }),
  title: text('NetCDF 2D CF Import & Progress Lab', 'NetCDF 2D CF import와 progress 실험실'),
  summary: text(
    'Play coordinate resolution, bounded two-pass import, and recovery state as three synchronized lanes without hiding caller-owned policy.',
    '좌표 해석, 제한된 two-pass import, recovery 상태를 세 개의 동기화 lane으로 재생하며 caller 소유 정책을 숨기지 않습니다.',
  ),
  limits: Object.freeze({
    nameBytes: 128,
    coordinateTokens: 32,
    auxiliaryAxes: 16,
    variables: 1024,
    dimensions: 256,
    metadataBytes: 1024 * 1024,
    fileBytes: 64 * 1024 ** 3,
    cells: 100_000_000,
    sliceCells: 1_000_000,
    tileCells: 65_536,
    batchRows: 1000,
    auxiliaryJsonBytes: 8192,
    coordinateCacheBytes: 64 * 1024 ** 2,
    duplicateSetBytes: 32 * 1024 ** 2,
    ownedWorkingSetBytes: 128 * 1024 ** 2,
  }),
  progressStates: Object.freeze(['missing', 'pending', 'in-progress', 'completed', 'failed']),
  scenarios: Object.freeze([
    Object.freeze({
      id: 'normal-2d', label: text('Normal 2D CF grid', '정상 2D CF grid'), failAt: null, targets: Object.freeze([]),
      summary: text('Two-dimensional latitude and longitude variables resolve, every slice passes duplicate preflight, and the import completes.', '2차원 latitude와 longitude 변수를 해석하고 모든 slice가 duplicate preflight를 통과해 import를 완료합니다.'),
      outcome: text('COMPLETED after the final committed slice checkpoint.', '마지막 slice checkpoint를 commit한 뒤 COMPLETED가 됩니다.'),
    }),
    Object.freeze({
      id: 'one-dimensional-axes', label: text('One-dimensional axes', '1차원 axis'), failAt: null, targets: Object.freeze([]),
      summary: text('Independent latitude and longitude axes expand into the same row-major point grid while retaining CF semantics.', '독립적인 latitude와 longitude axis를 같은 row-major point grid로 확장하면서 CF 의미론을 보존합니다.'),
      outcome: text('COMPLETED with deterministic axis expansion and bounded coordinate caching.', '결정적인 axis 확장과 제한된 coordinate cache로 COMPLETED가 됩니다.'),
    }),
    Object.freeze({
      id: 'invalid-coordinate-crs', label: text('Invalid coordinate / CRS', '잘못된 coordinate / CRS'), failAt: 4, targets: Object.freeze(['coordinates', 'boundedImport', 'progress']),
      summary: text('Ambiguous axis binding, non-finite values, range violations, or unsupported CRS stop before spatial writes.', '모호한 axis binding, 유한하지 않은 값, 범위 위반, 지원하지 않는 CRS는 spatial write 전에 중단됩니다.'),
      outcome: text('FAILED with a typed coordinate or CRS error; no partial slice is committed.', 'typed coordinate 또는 CRS 오류로 FAILED가 되며 일부 slice를 commit하지 않습니다.'),
    }),
    Object.freeze({
      id: 'duplicate-preflight', label: text('Duplicate preflight', 'Duplicate preflight'), failAt: 6, targets: Object.freeze(['boundedImport', 'progress']),
      summary: text('The first pass detects duplicate cell identities before the second pass writes any row for that slice.', '첫 pass가 duplicate cell identity를 찾으면 두 번째 pass에서 해당 slice의 row를 쓰기 전에 중단합니다.'),
      outcome: text('FAILED with duplicate evidence and the previous slice checkpoint intact.', 'duplicate 근거와 이전 slice checkpoint를 보존한 채 FAILED가 됩니다.'),
    }),
    Object.freeze({
      id: 'timeout-worker-terminated', label: text('Timeout · worker terminated', 'Timeout · worker 종료됨'), failAt: 9, targets: Object.freeze(['boundedImport', 'progress']),
      summary: text('The deadline cancels cooperatively, worker termination is confirmed, and bounded cleanup makes retry eligible.', 'deadline이 cooperative cancellation을 요청하고 worker 종료를 확인한 뒤 제한된 cleanup을 거쳐 retry가 가능해집니다.'),
      outcome: text('FAILED for this attempt; a caller retry may resume at lastSliceIdx + 1.', '이번 시도는 FAILED이며 caller retry는 lastSliceIdx + 1부터 재개할 수 있습니다.'),
    }),
    Object.freeze({
      id: 'timeout-worker-alive', label: text('Timeout · worker still alive', 'Timeout · worker가 살아 있음'), failAt: 9, targets: Object.freeze(['boundedImport', 'progress']),
      summary: text('A timeout is not treated as cleanup success while the worker can still own memory, a DB connection, or a lease.', 'worker가 memory, DB connection, lease를 계속 소유할 수 있으면 timeout을 cleanup 성공으로 간주하지 않습니다.'),
      outcome: text('Recovery remains blocked until worker shutdown is proven; automatic retry would overlap ownership.', 'worker 종료를 증명할 때까지 recovery가 차단되며 자동 retry는 소유권을 겹치게 만듭니다.'),
    }),
    Object.freeze({
      id: 'lease-conflict-resume', label: text('Lease conflict & resume', 'Lease conflict와 resume'), failAt: 8, targets: Object.freeze(['boundedImport', 'progress']),
      summary: text('A stale lease cannot start or commit a tile; a valid owner resumes only after the last committed slice.', '오래된 lease는 tile을 시작하거나 commit할 수 없고 유효한 owner만 마지막 commit slice 다음부터 재개합니다.'),
      outcome: text('The stale attempt fails; the fenced owner resumes at lastSliceIdx + 1 without rewriting a completed import.', '오래된 시도는 실패하고 fenced owner가 lastSliceIdx + 1부터 재개하며 완료된 import는 다시 쓰지 않습니다.'),
    }),
  ]),
  frames: Object.freeze([
    frame('before-registration', ['Before registration', '등록 전'], [
      ['Receive a caller-selected NetCDF file and coordinate hints without interpreting fileId as authorization.', 'caller가 선택한 NetCDF file과 coordinate hint를 받고 fileId를 authorization으로 해석하지 않습니다.'],
      ['The caller must already enforce authentication, tenant boundaries, and approved filesystem roots.', 'caller가 authentication, tenant 경계, 허용된 filesystem root를 먼저 적용해야 합니다.'],
      ['Register immutable file identity before opening the bounded import worker.', '제한된 import worker를 열기 전에 immutable file identity를 등록합니다.'],
      ['Coordinate names are UTF-8 bounded to 128 bytes; coordinate-token input is capped at 32.', 'coordinate name은 UTF-8 128 bytes, coordinate token 입력은 32개로 제한합니다.'],
    ], [
      ['Inspect caller-supplied file metadata before allocating a worker, database connection, or coordinate cache.', 'worker, database connection, coordinate cache를 할당하기 전에 caller가 제공한 file metadata를 검사합니다.'],
      ['Reject oversized files and metadata early; no unbounded scan begins during registration.', '큰 file과 metadata를 일찍 거부하며 등록 과정에서 unbounded scan을 시작하지 않습니다.'],
      ['Persist registration, then start exactly one import worker when the caller supplies execution scope.', '등록을 저장한 뒤 caller가 execution scope를 제공하면 import worker 하나만 시작합니다.'],
      ['File ≤ 64 GiB; metadata ≤ 1 MiB; variables ≤ 1,024; dimensions ≤ 256.', 'file ≤ 64 GiB, metadata ≤ 1 MiB, variable ≤ 1,024, dimension ≤ 256입니다.'],
    ], [
      ['findImportProgress returns missing because no durable registration row exists yet.', 'durable registration row가 아직 없으므로 findImportProgress는 missing을 반환합니다.'],
      ['Missing is an absence result, not a synthetic PENDING row and not an authorization decision.', 'missing은 row 부재 결과이며 synthetic PENDING row나 authorization 결정이 아닙니다.'],
      ['Successful registration creates the PENDING state with a stable fileId.', '등록에 성공하면 stable fileId와 PENDING 상태를 만듭니다.'],
      ['Progress payloads remain internal and must be redacted by caller-owned DTO mapping.', 'progress payload는 내부 모델이며 caller 소유 DTO mapping에서 redaction해야 합니다.'],
    ]),
    frame('register', ['Register file identity', 'File identity 등록'], [
      ['Preserve fileId and record the heuristic fingerprint fileKey|size|lastModifiedTime for later comparisons.', 'fileId를 보존하고 이후 비교를 위해 heuristic fingerprint fileKey|size|lastModifiedTime을 기록합니다.'],
      ['The fingerprint is not a content hash and cannot prove protection from time-of-check/time-of-use changes.', 'fingerprint는 content hash가 아니며 time-of-check/time-of-use 변경을 방지한다고 증명하지 못합니다.'],
      ['Open metadata and resolve declared coordinate variables under the registered identity.', '등록된 identity 아래에서 metadata를 열고 선언된 coordinate variable을 해석합니다.'],
      ['Auxiliary coordinate axes are capped at 16 before CF binding begins.', 'CF binding을 시작하기 전에 auxiliary coordinate axis를 16개로 제한합니다.'],
    ], [
      ['Complete registerFile outside the import deadline so timeout cannot erase the durable fileId.', 'timeout이 durable fileId를 지우지 않도록 registerFile을 import deadline 밖에서 완료합니다.'],
      ['Registration performs bounded metadata checks but does not hold the later worker connection.', '등록은 bounded metadata 검사를 수행하지만 이후 worker connection을 점유하지 않습니다.'],
      ['Start one worker and one DB connection only after durable PENDING registration succeeds.', 'durable PENDING 등록이 성공한 뒤 worker 하나와 DB connection 하나만 시작합니다.'],
      ['Owned working set ≤ 128 MiB across coordinate cache, duplicate set, tiles, and batches.', 'coordinate cache, duplicate set, tile, batch를 합친 owned working set은 128 MiB 이하입니다.'],
    ], [
      ['Persist PENDING together with fileId, fingerprint, timestamps, and zero committed slices.', 'fileId, fingerprint, timestamp, commit된 slice 0개와 함께 PENDING을 저장합니다.'],
      ['A repeated completed registration is not permission to rewrite data; terminal no-op is preserved.', '완료된 등록을 반복해도 data를 다시 쓸 권한이 생기지 않으며 terminal no-op을 보존합니다.'],
      ['Worker acquisition transitions the durable attempt to IN_PROGRESS.', 'worker를 획득하면 durable attempt를 IN_PROGRESS로 전환합니다.'],
      ['State mapping is exact: PENDING → pending; no UI-specific status is stored.', '상태 mapping은 PENDING → pending으로 정확하며 UI 전용 status를 저장하지 않습니다.'],
    ]),
    frame('axes', ['Resolve coordinate axes', 'Coordinate axis 해석'], [
      ['Classify latitude, longitude, time, and auxiliary axes from explicit hints plus CF metadata.', '명시적 hint와 CF metadata를 함께 사용해 latitude, longitude, time, auxiliary axis를 분류합니다.'],
      ['Reject ambiguous matches instead of guessing which variable supplies a spatial coordinate.', '어떤 variable이 spatial coordinate인지 추측하지 않고 모호한 match를 거부합니다.'],
      ['Choose the two-dimensional grid path or deterministic one-dimensional axis expansion.', '2차원 grid 경로 또는 결정적인 1차원 axis 확장 경로를 선택합니다.'],
      ['Coordinate tokens ≤ 32 and auxiliary axes ≤ 16 keep resolution bounded.', 'coordinate token ≤ 32, auxiliary axis ≤ 16으로 resolution 비용을 제한합니다.'],
    ], [
      ['Read only the metadata and coordinate structures needed to construct the selected spatial grid.', '선택한 spatial grid를 구성하는 데 필요한 metadata와 coordinate structure만 읽습니다.'],
      ['Do not materialize every variable or cell while discovering the coordinate topology.', 'coordinate topology를 찾는 동안 모든 variable이나 cell을 materialize하지 않습니다.'],
      ['Bind resolved axes to the target variable dimensions before slice planning.', 'slice plan 전에 해석한 axis를 target variable dimension에 bind합니다.'],
      ['Coordinate cache ≤ 64 MiB and total variables ≤ 1,024.', 'coordinate cache ≤ 64 MiB이며 전체 variable은 1,024개 이하입니다.'],
    ], [
      ['Keep IN_PROGRESS while publishing the resolved axis mode and current phase internally.', '해석한 axis mode와 현재 phase를 내부에 기록하면서 IN_PROGRESS를 유지합니다.'],
      ['Progress must not expose raw filesystem paths, tenant keys, or unrestricted metadata.', 'progress에 raw filesystem path, tenant key, 제한 없는 metadata를 노출하지 않습니다.'],
      ['Continue to CF binding or fail with a typed coordinate-resolution error.', 'CF binding으로 진행하거나 typed coordinate-resolution 오류로 실패합니다.'],
      ['Only bounded phase metadata is added to the progress row.', 'progress row에는 bounded phase metadata만 추가합니다.'],
    ]),
    frame('cf-bind', ['Bind CF semantics', 'CF 의미론 binding'], [
      ['Bind axis order and dimensions, then normalize spatial points as longitude/latitude with SRID 4326.', 'axis 순서와 dimension을 bind한 뒤 spatial point를 longitude/latitude, SRID 4326으로 normalize합니다.'],
      ['One-dimensional axes expand by index; two-dimensional coordinates must match the target grid shape.', '1차원 axis는 index로 확장하고 2차원 coordinate는 target grid shape와 일치해야 합니다.'],
      ['Validate every bound coordinate before any duplicate or write pass begins.', 'duplicate pass나 write pass를 시작하기 전에 bound coordinate를 모두 검증합니다.'],
      ['Auxiliary numeric values serialize to JSONB with at most 8,192 bytes per row.', 'auxiliary numeric value는 row당 최대 8,192 bytes JSONB로 serialize합니다.'],
    ], [
      ['Construct a streaming row-major iterator over the chosen dimensions instead of a full-grid object.', 'full-grid object 대신 선택한 dimension 위에 streaming row-major iterator를 구성합니다.'],
      ['No parallel tile fan-out is introduced; ordering and memory ownership stay inside one worker.', 'parallel tile fan-out을 만들지 않으며 순서와 memory 소유권은 worker 하나 안에 둡니다.'],
      ['Feed normalized coordinate tuples into typed validation and slice accounting.', 'normalize한 coordinate tuple을 typed validation과 slice accounting으로 전달합니다.'],
      ['Total grid cells ≤ 100,000,000 before import planning proceeds.', 'import plan을 계속하려면 전체 grid cell이 100,000,000 이하이어야 합니다.'],
    ], [
      ['Record the coordinate mode and normalized CRS while IN_PROGRESS remains durable.', 'IN_PROGRESS를 유지하면서 coordinate mode와 normalized CRS를 기록합니다.'],
      ['SRID 4326 describes stored geometry; it does not authorize arbitrary CRS transformation.', 'SRID 4326은 저장 geometry를 설명하며 임의 CRS transformation 권한을 뜻하지 않습니다.'],
      ['Move to validation when binding is deterministic; otherwise transition to FAILED.', 'binding이 결정적이면 validation으로 이동하고 아니면 FAILED로 전환합니다.'],
      ['Progress details remain smaller than the already bounded metadata envelope.', 'progress detail은 이미 제한된 metadata envelope보다 작게 유지합니다.'],
    ]),
    frame('validate', ['Validate coordinates and shape', 'Coordinate와 shape 검증'], [
      ['Check finite values, latitude and longitude ranges, dimension compatibility, and supported CRS semantics.', '유한값, latitude와 longitude 범위, dimension 호환성, 지원하는 CRS 의미론을 검사합니다.'],
      ['Typed coordinate and CRS errors stop before spatial writes and preserve diagnosis without leaking input payloads.', 'typed coordinate·CRS 오류는 spatial write 전에 중단하고 input payload 노출 없이 진단 정보를 보존합니다.'],
      ['Validated coordinates become deterministic inputs to slice and tile planning.', '검증된 coordinate를 slice와 tile plan의 결정적인 입력으로 사용합니다.'],
      ['Names ≤ 128 bytes and auxiliary JSONB ≤ 8,192 bytes remain enforced per record.', 'record마다 name ≤ 128 bytes, auxiliary JSONB ≤ 8,192 bytes를 계속 적용합니다.'],
    ], [
      ['Validate declared variables, dimensions, metadata size, file size, cells, and per-slice cardinality.', '선언된 variable, dimension, metadata 크기, file 크기, cell, slice별 cardinality를 검증합니다.'],
      ['Any breached resource ceiling fails before allocating buffers proportional to the invalid input.', 'resource 상한을 넘으면 잘못된 입력 크기에 비례하는 buffer를 할당하기 전에 실패합니다.'],
      ['Calculate bounded slices, sequential tiles, and database batch sizes.', '제한된 slice, 순차 tile, database batch 크기를 계산합니다.'],
      ['Cells ≤ 100,000,000 and each slice ≤ 1,000,000 cells.', '전체 cell ≤ 100,000,000, 각 slice ≤ 1,000,000 cells입니다.'],
    ], [
      ['Keep IN_PROGRESS for valid input or store FAILED with the typed validation category.', '유효하면 IN_PROGRESS를 유지하고 아니면 typed validation category와 FAILED를 저장합니다.'],
      ['A validation failure has no committed slice and therefore no resume cursor to advance.', 'validation 실패에는 commit된 slice가 없으므로 전진할 resume cursor도 없습니다.'],
      ['Valid input enters tile planning; invalid input becomes terminal for this attempt.', '유효한 입력은 tile plan으로 이동하고 잘못된 입력은 이번 시도의 terminal이 됩니다.'],
      ['Failure detail is bounded and redacted before caller-owned DTO exposure.', 'caller 소유 DTO로 노출하기 전에 failure detail을 제한하고 redaction합니다.'],
    ]),
    frame('tile-plan', ['Plan sequential slices and tiles', '순차 slice와 tile 계획'], [
      ['Project row-major coordinate identity for each bounded slice without retaining the whole dataset.', '전체 dataset을 보관하지 않고 bounded slice마다 row-major coordinate identity를 계산합니다.'],
      ['The plan preserves deterministic indexes so resume and duplicate diagnosis refer to stable locations.', 'resume과 duplicate 진단이 stable location을 가리키도록 plan이 deterministic index를 보존합니다.'],
      ['Begin the first pass for duplicate preflight on the next uncommitted slice.', '다음 미commit slice에 대해 첫 번째 duplicate preflight pass를 시작합니다.'],
      ['Coordinate cache ≤ 64 MiB within the 128 MiB owned working-set ceiling.', 'coordinate cache ≤ 64 MiB이며 owned working set 128 MiB 상한 안에 있습니다.'],
    ], [
      ['Partition each slice into tiles of at most 65,536 cells and batches of at most 1,000 rows.', '각 slice를 최대 65,536 cell의 tile과 최대 1,000 row의 batch로 나눕니다.'],
      ['Tiles run sequentially on one worker and one DB connection; the model promises no parallel fan-out.', 'tile은 worker 하나와 DB connection 하나에서 순차 실행되며 parallel fan-out을 약속하지 않습니다.'],
      ['Acquire or verify the lease fence before starting the next tile.', '다음 tile을 시작하기 전에 lease fence를 획득하거나 검증합니다.'],
      ['Tile ≤ 65,536 cells; batch ≤ 1,000 rows; one worker / one DB connection.', 'tile ≤ 65,536 cells, batch ≤ 1,000 rows, worker 하나 / DB connection 하나입니다.'],
    ], [
      ['Expose current slice and tile plan internally while keeping the durable state IN_PROGRESS.', 'durable state는 IN_PROGRESS로 유지하면서 현재 slice와 tile plan을 내부에 표시합니다.'],
      ['Planned work is not completed work; lastSliceIdx changes only after the entire slice commits.', '계획한 작업은 완료된 작업이 아니며 전체 slice가 commit된 뒤에만 lastSliceIdx가 바뀝니다.'],
      ['Run duplicate preflight without advancing the durable checkpoint.', 'durable checkpoint를 전진시키지 않고 duplicate preflight를 실행합니다.'],
      ['Progress counters use bounded numeric fields, not unbounded per-cell histories.', 'progress counter는 unbounded per-cell history가 아니라 bounded numeric field를 사용합니다.'],
    ]),
    frame('duplicate-preflight', ['First pass: duplicate preflight', '첫 pass: duplicate preflight'], [
      ['Stream cell identities for the slice into a bounded duplicate set before constructing database rows.', 'database row를 만들기 전에 slice의 cell identity를 bounded duplicate set으로 stream합니다.'],
      ['A repeated identity raises a typed duplicate error before the second pass writes that slice.', '반복 identity가 있으면 두 번째 pass에서 해당 slice를 쓰기 전에 typed duplicate 오류를 발생시킵니다.'],
      ['A clean first pass releases or reuses bounded structures for the write pass.', '깨끗한 첫 pass는 write pass를 위해 bounded structure를 해제하거나 재사용합니다.'],
      ['Duplicate set ≤ 32 MiB inside the 128 MiB owned working set.', 'duplicate set ≤ 32 MiB이며 owned working set 128 MiB 안에 있습니다.'],
    ], [
      ['Read the slice once for identity validation without issuing any database insert for that slice.', 'identity 검증을 위해 slice를 한 번 읽되 해당 slice의 database insert는 실행하지 않습니다.'],
      ['The preflight is per slice and bounded; it does not claim global unbounded in-memory deduplication.', 'preflight는 slice 단위로 제한되며 전역 unbounded in-memory deduplication을 주장하지 않습니다.'],
      ['If clean, rewind or reread the bounded slice for sequential tile and batch writes.', '깨끗하면 bounded slice를 rewind하거나 다시 읽어 순차 tile·batch write를 수행합니다.'],
      ['Slice ≤ 1,000,000 cells and duplicate set ≤ 32 MiB.', 'slice ≤ 1,000,000 cells이며 duplicate set ≤ 32 MiB입니다.'],
    ], [
      ['Keep IN_PROGRESS on success; a duplicate stores FAILED without changing lastSliceIdx.', '성공하면 IN_PROGRESS를 유지하고 duplicate이면 lastSliceIdx를 바꾸지 않고 FAILED를 저장합니다.'],
      ['The previous committed slice remains the sole resume boundary after preflight failure.', 'preflight 실패 뒤에도 이전 commit slice만 resume 경계로 남습니다.'],
      ['Proceed to the write pass or return typed duplicate evidence to the caller boundary.', 'write pass로 진행하거나 typed duplicate 근거를 caller 경계로 반환합니다.'],
      ['Failure evidence is summarized; the full duplicate set is never stored in progress.', 'failure 근거는 요약하며 전체 duplicate set을 progress에 저장하지 않습니다.'],
    ]),
    frame('batch-write', ['Second pass: sequential writes', '두 번째 pass: 순차 write'], [
      ['Recompute normalized longitude/latitude points and auxiliary numeric values in stable row-major order.', 'stable row-major 순서로 normalize한 longitude/latitude point와 auxiliary numeric value를 다시 계산합니다.'],
      ['Every point remains SRID 4326 and auxiliary JSONB stays within its per-row bound.', '모든 point는 SRID 4326이며 auxiliary JSONB는 row별 상한 안에 있어야 합니다.'],
      ['Supply rows to the current tile batch without retaining earlier completed tiles.', '이전 완료 tile을 보관하지 않고 현재 tile batch에 row를 제공합니다.'],
      ['Auxiliary JSONB ≤ 8,192 bytes per row; coordinate cache ≤ 64 MiB.', 'row당 auxiliary JSONB ≤ 8,192 bytes, coordinate cache ≤ 64 MiB입니다.'],
    ], [
      ['Write batches sequentially on the single worker connection and fence both tile start and commit.', 'worker 하나의 connection에서 batch를 순차 write하고 tile 시작과 commit을 모두 fence합니다.'],
      ['Lease loss rejects stale commit; no concurrent retry may overlap the still-owning worker.', 'lease 상실은 stale commit을 거부하며 아직 소유 중인 worker와 concurrent retry가 겹치면 안 됩니다.'],
      ['Commit the tile, release its buffers, then advance to the next tile in the same slice.', 'tile을 commit하고 buffer를 해제한 뒤 같은 slice의 다음 tile로 이동합니다.'],
      ['Tile ≤ 65,536 cells; batch ≤ 1,000 rows; one worker / one DB connection.', 'tile ≤ 65,536 cells, batch ≤ 1,000 rows, worker 하나 / DB connection 하나입니다.'],
    ], [
      ['Report bounded row and tile counters while durable state remains IN_PROGRESS.', 'durable state를 IN_PROGRESS로 유지하면서 bounded row·tile counter를 기록합니다.'],
      ['A committed tile is not a resume checkpoint; only the last tile commits the whole slice cursor.', 'commit된 tile은 resume checkpoint가 아니며 마지막 tile만 전체 slice cursor를 commit합니다.'],
      ['After the final tile, atomically advance the slice checkpoint.', '마지막 tile 뒤에 slice checkpoint를 atomic하게 전진시킵니다.'],
      ['Counters are aggregate values and never retain every row outcome.', 'counter는 aggregate value이며 모든 row outcome을 보관하지 않습니다.'],
    ]),
    frame('slice-checkpoint', ['Commit the slice checkpoint', 'Slice checkpoint commit'], [
      ['Retain deterministic axis and slice identity so the next pass begins at the next row-major slice.', '다음 pass가 다음 row-major slice에서 시작하도록 deterministic axis와 slice identity를 보존합니다.'],
      ['No coordinate cache from the committed slice is required for resume correctness.', 'commit된 slice의 coordinate cache는 resume correctness에 필요하지 않습니다.'],
      ['Release slice-local coordinate and duplicate structures before planning the next slice.', '다음 slice를 계획하기 전에 slice-local coordinate와 duplicate structure를 해제합니다.'],
      ['Released buffers keep the owned working set below 128 MiB.', 'buffer를 해제해 owned working set을 128 MiB 아래로 유지합니다.'],
    ], [
      ['The last tile transaction advances lastSliceIdx only after every batch in the slice succeeds.', 'slice의 모든 batch가 성공한 뒤 마지막 tile transaction이 lastSliceIdx를 전진시킵니다.'],
      ['A stale lease cannot commit the cursor, and a failed last tile leaves the previous cursor intact.', 'stale lease는 cursor를 commit할 수 없고 마지막 tile 실패 시 이전 cursor를 유지합니다.'],
      ['Continue sequentially or enter deadline and worker-lifecycle resolution.', '순차 실행을 계속하거나 deadline과 worker lifecycle 판정으로 이동합니다.'],
      ['The slice transaction still uses one worker and one DB connection.', 'slice transaction은 계속 worker 하나와 DB connection 하나를 사용합니다.'],
    ], [
      ['Persist lastSliceIdx and updated aggregate counts while remaining IN_PROGRESS until all slices finish.', '모든 slice가 끝날 때까지 IN_PROGRESS를 유지하면서 lastSliceIdx와 aggregate count를 저장합니다.'],
      ['Resume means lastSliceIdx + 1; it never starts from an uncommitted tile counter.', 'resume은 lastSliceIdx + 1을 뜻하며 미commit tile counter에서 시작하지 않습니다.'],
      ['Process the next slice, complete the import, or handle timeout and cancellation.', '다음 slice를 처리하거나 import를 완료하거나 timeout·cancellation을 처리합니다.'],
      ['Progress stores one committed slice cursor rather than an unbounded checkpoint history.', 'progress는 unbounded checkpoint history 대신 commit된 slice cursor 하나를 저장합니다.'],
    ]),
    frame('timeout-worker-check', ['Resolve timeout and worker ownership', 'Timeout과 worker 소유권 판정'], [
      ['Coordinate work observes cooperative cancellation and stops producing new slice or tile inputs.', 'coordinate 작업은 cooperative cancellation을 관찰하고 새 slice·tile 입력 생성을 중단합니다.'],
      ['A timeout signal alone does not prove coordinate buffers or file handles were released.', 'timeout signal만으로 coordinate buffer나 file handle이 해제됐음을 증명할 수 없습니다.'],
      ['Await bounded worker shutdown before declaring the attempt recoverable.', 'attempt를 recoverable로 선언하기 전에 bounded worker shutdown을 기다립니다.'],
      ['All coordinate memory remains within the 128 MiB ownership envelope until shutdown.', 'shutdown 전까지 모든 coordinate memory는 128 MiB ownership envelope 안에 남습니다.'],
    ], [
      ['Cancel cooperatively, close the worker path, and await termination of its DB connection and lease scope.', 'cooperative cancellation 뒤 worker 경로를 닫고 DB connection·lease scope 종료를 기다립니다.'],
      ['If the worker is still alive, retry is blocked because two owners could write the same resume range.', 'worker가 살아 있으면 두 owner가 같은 resume 범위를 쓸 수 있어 retry를 차단합니다.'],
      ['A terminated worker releases resources; a live worker requires operator-visible recovery.', '종료된 worker는 resource를 해제하고 살아 있는 worker는 운영자가 볼 수 있는 recovery가 필요합니다.'],
      ['Shutdown wait is bounded; resource ownership is explicit, never assumed from timeout.', 'shutdown 대기는 bounded이며 timeout만 보고 resource ownership 해제를 추정하지 않습니다.'],
    ], [
      ['Store FAILED for the timed-out attempt, plus whether worker termination was confirmed.', 'timeout attempt를 FAILED로 저장하고 worker 종료 확인 여부도 함께 기록합니다.'],
      ['FAILED does not automatically mean retryable; a still-alive worker keeps recovery blocked.', 'FAILED가 자동으로 retryable을 뜻하지 않으며 살아 있는 worker는 recovery를 계속 차단합니다.'],
      ['Allow caller retry only after shutdown proof, resuming at lastSliceIdx + 1.', 'shutdown을 증명한 뒤에만 caller retry를 허용하며 lastSliceIdx + 1부터 재개합니다.'],
      ['Worker-liveness evidence is bounded and redacted for external DTOs.', 'worker-liveness 근거는 제한하며 외부 DTO에서는 redaction합니다.'],
    ]),
    frame('terminal-retry', ['Complete or make retry explicit', '완료 또는 명시적 retry'], [
      ['Release coordinate caches and file resources after the final committed slice or proven worker shutdown.', '마지막 slice commit 또는 worker 종료 증명 뒤 coordinate cache와 file resource를 해제합니다.'],
      ['A completed import is a no-op on repeat; a failed import never invents a new coordinate cursor.', '완료된 import 반복은 no-op이며 실패한 import가 새 coordinate cursor를 만들어내지 않습니다.'],
      ['Return the internal terminal model to caller-owned mapping and policy.', '내부 terminal model을 caller 소유 mapping과 policy로 반환합니다.'],
      ['No coordinate-owned buffers remain after confirmed termination.', '종료를 확인한 뒤에는 coordinate 소유 buffer가 남지 않습니다.'],
    ], [
      ['Mark COMPLETED after all slices commit, or leave FAILED with the last safe resume cursor.', '모든 slice commit 뒤 COMPLETED로 표시하거나 마지막 안전 resume cursor와 FAILED를 남깁니다.'],
      ['Retries remain sequential and caller-scheduled; the library never starts overlapping replacement workers.', 'retry는 순차적이며 caller가 schedule하고 library는 겹치는 replacement worker를 시작하지 않습니다.'],
      ['A permitted retry starts at lastSliceIdx + 1; COMPLETED returns without rewriting rows.', '허용된 retry는 lastSliceIdx + 1부터 시작하고 COMPLETED는 row를 다시 쓰지 않고 반환합니다.'],
      ['One worker / one DB connection remains invariant across initial and resumed attempts.', '최초와 resume attempt 모두 worker 하나 / DB connection 하나 invariant를 지킵니다.'],
    ], [
      ['Map durable PENDING, IN_PROGRESS, COMPLETED, and FAILED to pending, in-progress, completed, and failed.', 'durable PENDING, IN_PROGRESS, COMPLETED, FAILED를 pending, in-progress, completed, failed로 mapping합니다.'],
      ['The library does not own authorization, tenant policy, executor lifecycle, deadlines, retry, or public DTO shape.', 'library는 authorization, tenant policy, executor lifecycle, deadline, retry, public DTO shape를 소유하지 않습니다.'],
      ['Caller redacts and publishes progress, chooses retry timing, and closes every injected resource.', 'caller가 progress를 redaction·공개하고 retry 시점을 선택하며 주입한 resource를 모두 닫습니다.'],
      ['Terminal state is bounded to one current model plus aggregate counters and the last safe cursor.', 'terminal state는 현재 model 하나, aggregate counter, 마지막 safe cursor로 제한합니다.'],
    ]),
  ]),
  ownership: Object.freeze({
    library: text(
      'The library resolves CF coordinates, enforces resource ceilings, performs sequential two-pass imports, fences tile work, and maintains durable progress.',
      'library는 CF coordinate 해석, resource 상한, 순차 two-pass import, tile fencing, durable progress를 담당합니다.',
    ),
    caller: text(
      'The caller owns authentication and authorization, tenant and root selection, executors, deadlines, retry policy, DTO redaction, and every injected resource lifecycle.',
      'caller는 authentication·authorization, tenant·root 선택, executor, deadline, retry policy, DTO redaction, 주입한 모든 resource lifecycle을 소유합니다.',
    ),
  }),
  sources: Object.freeze([
    Object.freeze({ label: 'Issue #1352', url: 'https://github.com/bluetape4k/bluetape4k-projects/issues/1352' }),
    Object.freeze({ label: 'Issue #1421', url: 'https://github.com/bluetape4k/bluetape4k-projects/issues/1421' }),
    Object.freeze({ label: 'Issue #1561', url: 'https://github.com/bluetape4k/bluetape4k-projects/issues/1561' }),
    Object.freeze({ label: 'release 2.0.0', url: 'https://github.com/bluetape4k/bluetape4k-projects/releases/tag/2.0.0' }),
  ]),
});
