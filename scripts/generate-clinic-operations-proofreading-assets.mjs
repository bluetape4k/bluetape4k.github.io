import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const replacements = new Map([
  [
    "public/assets/clinic-appointment-part5-timefold-model-01-ko.svg",
    new Map([
      [">장비 · 사용 불가 시간<", ">장비 · 사용 불가 시간(모델)<"],
      [
        "H4는 H4a 요일별 휴식과 H4b 병원 기본 휴식으로 나뉘므로, H1–H11은 실제로 12개 필수 Constraint Stream이 됩니다.",
        "H11은 모델과 제약에 정의돼 있지만, 현재 SolverService는 장비 사용 불가 정보를 적재하지 않습니다.",
      ],
    ]),
  ],
  [
    "public/assets/clinic-appointment-part5-benchmark-scale-02-ko.svg",
    new Map([
      [
        "모든 기준 시나리오에서 필수 제약을 지키며 설정한 제한 시간의 절반 안팎으로 탐색을 마쳤습니다.",
        "각 기준 시나리오에 입력된 문제 정보에서 필수 제약을 지키며 제한 시간 안에 탐색을 마쳤습니다.",
      ],
    ]),
  ],
  [
    "public/assets/reservation-control-plane-architecture-01-ko.svg",
    new Map([
      ["replay를 결정한다", "재생 응답을 결정한다"],
      ["하나의 transaction 경계", "하나의 트랜잭션 경계"],
      ["Reservation HTTP API", "예약 HTTP API"],
      ["hold · cancel · waitlist", "임시 예약 · 취소 · 대기 목록"],
      ["offer 수락", "제안 수락"],
      ["Node-local bulkhead", "노드 로컬 벌크헤드"],
      ["Redis semaphore", "Redis 세마포어"],
      ["보조 admission", "보조 진입 제어"],
      ["Redis suppression lock", "Redis 중복 억제 잠금"],
      ["짧은 in-flight lease", "짧은 실행 중 리스"],
      ["HTTP idempotency", "HTTP 멱등성"],
      ["mutation과 replay body를 함께 commit", "변경과 재생 응답 본문을 함께 커밋"],
      ["Capacity + hold", "예약 수량 + 임시 예약"],
      ["state + revision CAS", "상태 + 리비전 CAS"],
      ["owner + expiry", "소유자 + 만료 시각"],
      ["Waitlist + offer", "대기 목록 + 제안"],
      ["owner + revision", "소유자 + 리비전"],
      ["ACTIVE + expiry", "ACTIVE + 만료 시각"],
      ["Audit + notification outbox", "감사 + 알림 아웃박스"],
      ["안정적인 delivery id · worker claim lease", "안정적인 전송 ID · 작업자 선점 리스"],
      ["bounded retry · crash recovery 의도", "제한된 재시도 · 프로세스 중단 복구"],
      ["Expiry sweeper", "만료 정리 작업자"],
      ["bounded batch", "제한된 배치"],
      ["resource-first lock", "자원 우선 잠금"],
      ["hold / offer 만료", "임시 예약 / 제안 만료"],
      ["Notification worker", "알림 작업자"],
      ["delivery claim", "전송 작업 선점"],
      ["crash 이후 복구", "프로세스 중단 후 복구"],
      ["fail open", "장애 시 우회"],
      [
        "commit된 PostgreSQL transaction만 영속 예약 수량과 replay 상태를 바꿀 수 있다.",
        "커밋된 PostgreSQL 트랜잭션만 영속 예약 수량과 재생 상태를 바꿀 수 있다.",
      ],
    ]),
  ],
  [
    "public/assets/reservation-control-plane-last-seat-retry-sequence-02-ko.svg",
    new Map([
      ["timeout은 지식만 잃고, commit된 자리는 잃지 않는다", "타임아웃은 응답만 잃고, 커밋된 자리는 잃지 않는다"],
      [
        "capacity = 1 · example revision = 42 · 같은 idempotency key는 durable outcome을 replay한다",
        "예약 수량 = 1 · 예시 리비전 = 42 · 같은 멱등 키는 저장된 결과를 재생한다",
      ],
      ["HTTP command 경계", "HTTP 명령 경계"],
      ["Local / Redis Gate", "로컬 / Redis 게이트"],
      ["admission + suppression", "진입 제어 + 중복 억제"],
      ["idempotency + capacity", "멱등성 + 예약 수량"],
      ["Redis unavailable · local fallback", "Redis 연결 실패 · 로컬 대체 경로"],
      ["동시 hold 요청 · revision 42", "동시 임시 예약 요청 · 리비전 42"],
      ["node-local admission 통과", "노드 로컬 진입 제어 통과"],
      ["Redis error · local fallback 진행", "Redis 오류 · 로컬 대체 경로 진행"],
      ["idempotency record 확보", "멱등 기록 확보"],
      ["Alice CAS 성공 · hold 생성", "Alice CAS 성공 · 임시 예약 생성"],
      ["Bob CAS 갱신 0 rows", "Bob CAS 갱신 행 0개"],
      ["outcome commit + replay body 저장", "결과 커밋 + 재생 응답 본문 저장"],
      ["client timeout 후 같은 key A", "클라이언트 타임아웃 후 같은 키 A"],
      ["Replay · capacity 두 번 증가 없음", "응답 재생 · 예약 수량 중복 증가 없음"],
      [
        "timeout은 Alice의 지식만 바꾸고, commit된 transaction은 되돌리지 않는다",
        "타임아웃은 Alice가 결과를 아는 시점만 바꾸며, 커밋된 트랜잭션을 되돌리지 않는다",
      ],
    ]),
  ],
  [
    "public/assets/reservation-control-plane-waitlist-handoff-sequence-03-ko.svg",
    new Map([
      ["점유된 자리를 다시 열지 않고 handoff한다", "점유된 자리를 다시 열지 않고 인계한다"],
      [
        "resource-first locking이 FIFO 소유권을 지키고 occupiedCount를 유지한다",
        "자원 우선 잠금이 FIFO 소유권과 occupiedCount를 지킨다",
      ],
      ["현재 hold 소유자", "현재 임시 예약 소유자"],
      ["Reservation API", "예약 API"],
      ["Command / Handoff", "명령 / 인계"],
      ["resource-first transaction", "자원 우선 트랜잭션"],
      ["holds · waitlist · offers", "임시 예약 · 대기 목록 · 제안"],
      ["Bob이 waitlist에 등록", "Bob이 대기 목록에 등록"],
      ["Alice가 현재 hold 취소", "Alice가 현재 임시 예약 취소"],
      ["resource row FOR UPDATE", "자원 행 FOR UPDATE"],
      ["Alice hold → CANCELLED", "Alice 임시 예약 → CANCELLED"],
      ["가장 오래된 WAITING row 선택", "가장 오래된 WAITING 행 선택"],
      ["ACTIVE offer + outbox 생성 · commit", "ACTIVE 제안 + 아웃박스 생성 · 커밋"],
      ["capacity 반환 · occupiedCount − 1", "예약 수량 반환 · occupiedCount − 1"],
      ["Bob이 offer 수락", "Bob이 제안 수락"],
      ["소유자 · state · revision · expiry 검증", "소유자 · 상태 · 리비전 · 만료 시각 검증"],
      ["offer + entry 수락 · confirmed hold 생성", "제안 + 대기 항목 수락 · 확정 예약 생성"],
      ["commit · occupiedCount는 1 유지", "커밋 · occupiedCount는 1 유지"],
    ]),
  ],
  [
    "public/assets/leader-election-coordination-scope-01-ko.svg",
    new Map([
      ["요구사항에 맞는 Backend를 고릅니다.", "요구사항에 맞는 백엔드를 고릅니다."],
      ["Tenant A 집계 작업", "테넌트 A 집계 작업"],
      ["Tenant B와 동시에 실행 가능", "테넌트 B와 동시에 실행 가능"],
      ["Migration + 완료 마커", "마이그레이션 + 완료 마커"],
      ["Tenant B 집계 작업", "테넌트 B 집계 작업"],
      ["Tenant A와 독립적으로 실행 가능", "테넌트 A와 독립적으로 실행 가능"],
    ]),
  ],
  [
    "public/assets/leader-election-lease-failover-sequence-01-ko.svg",
    new Map([
      ["Lease가 만료돼도 이미 반영된 변경은 남는다", "리스가 만료돼도 이미 반영된 변경은 남는다"],
      [
        "중복 실행을 막으려면 fencing token, 멱등성 또는 영구 완료 마커가 필요합니다.",
        "중복 실행을 막으려면 펜싱 토큰, 멱등성 또는 영구 완료 마커가 필요합니다.",
      ],
      ["Node A", "노드 A"],
      ["lease 관리", "리스 관리"],
      ["Node B", "노드 B"],
      ["실행자가 lease를 반납하기 전에 중단됨", "실행자가 리스를 반납하기 전에 중단됨"],
      ["t + lease 시점까지 소유권 유효", "t + 리스 시점까지 소유권 유효"],
      ["Node A 중단", "노드 A 중단"],
      ["lease 만료", "리스 만료"],
      ["새 token B로 소유권 부여", "새 토큰 B로 소유권 부여"],
      [
        "Lease 만료는 소유권 인계만 허용하며, 이미 반영된 변경의 중복 방지를 보증하지 않습니다.",
        "리스 만료는 소유권 인계만 허용하며, 이미 반영된 변경의 중복 방지를 보증하지 않습니다.",
      ],
    ]),
  ],
]);

for (const [path, pathReplacements] of replacements) {
  let svg = readFileSync(path, "utf8");
  for (const [source, target] of pathReplacements) {
    svg = svg.replaceAll(source, target);
  }
  writeFileSync(path, svg);
}

const stems = [
  "clinic-appointment-part5-timefold-model-01",
  "clinic-appointment-part5-benchmark-scale-02",
  "reservation-control-plane-architecture-01",
  "reservation-control-plane-last-seat-retry-sequence-02",
  "reservation-control-plane-waitlist-handoff-sequence-03",
  "leader-election-coordination-scope-01",
  "leader-election-lease-failover-sequence-01",
];

for (const stem of stems) {
  for (const locale of ["en", "ko"]) {
    const svg = `public/assets/${stem}-${locale}.svg`;
    const png = `public/assets/${stem}-${locale}.png`;
    const result = spawnSync("cairosvg", [svg, "-o", png, "-s", "2"], {
      encoding: "utf8",
    });
    if (result.status !== 0) {
      throw new Error(
        `CairoSVG failed for ${svg}: ${result.stderr || result.stdout}`,
      );
    }
  }
}

console.log(`Generated ${stems.length * 2} clinic operations diagram PNGs.`);
