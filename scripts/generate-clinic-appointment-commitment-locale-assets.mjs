import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const assets = [
  {
    source: 'public/assets/clinic-appointment-desired-visit-date-commitment-sequence-01-ko.svg',
    target: 'public/assets/clinic-appointment-desired-visit-date-commitment-sequence-01-en.svg',
    replacements: [
      ['환자 A의 희망 내원 날짜가 예약 확정에 이르는 순서', "How Patient A's Preferred Visit Date Becomes an Appointment Confirmation"],
      ['환자 A가 고객 채널에 희망 내원 날짜를 제출하면 예약서비스가 계획과 정책을 검증하고 자원을 선점한다. 병원이 같은 조건을 승인하면 해당 제안에 대한 동의와 자원 점유를 결합해 예약을 확정한다. 조건이 달라지면 새 제안과 새 동의가 필요하며 기존 예약은 먼저 취소하지 않는다.', 'Patient A submits a preferred visit date. The appointment service validates the plan and policy, then holds resources. If the clinic approves the same terms, exact consent and allocation produce an appointment confirmation. Changed terms require a new proposal and fresh consent, while an existing confirmed appointment remains protected.'],
      ['희망 내원 날짜는 검증과 동의를 거쳐 예약 확정에 이른다', 'A Preferred Visit Date Becomes an Appointment Confirmation After Validation and Consent'],
      ['일정 의도 → PROPOSED 또는 HELD → 병원 승인 → 해당 제안에 동의 → CONFIRMED', 'Scheduling intent → PROPOSED or HELD → clinic approval → exact consent → CONFIRMED'],
      ['환자 A', 'Patient A'], ['일정 선택 · 동의', 'date choice · consent'],
      ['고객 채널', 'Customer Channel'], ['희망·증빙 전달', 'intent · evidence handoff'],
      ['예약서비스', 'Appointment Service'], ['제안 · 예약 확정', 'proposal · commitment'],
      ['병원 운영', 'Clinic Operations'], ['승인 · 대안 제안', 'approval · alternative'],
      ['자원 원장', 'Resource Ledger'], ['의료진 · 장비 · 공간', 'staff · equipment · space'],
      ['고객 희망 내원 날짜 제출', 'Submit preferred visit date'],
      ['Plan + 희망 구간 + 동의 증빙 참조', 'Plan + preferred window + consent reference'],
      ['계획 버전 · 상품 정의 해시', 'Plan revision · catalog hash'],
      ['적용 정책 기록 · 요청당 처리 한도', 'policy snapshot · per-request processing limits'],
      ['정책이 허용하면 자원 HELD', 'HELD when policy allows'],
      ['점유 결과 + 만료 시각', 'allocation result + expiry'],
      ['제시한 조건 그대로 승인 요청', 'Request approval for exact proposal'],
      ['같은 조건을 승인한 경우', 'Clinic approves the same terms'],
      ['동일 제안 승인', 'Approve the same proposal'],
      ['동의·자원 점유 원자 결합', 'Bind consent and allocation atomically'],
      ['시간·항목·자원이 달라진 경우', 'Time, items, or resources change'],
      ['새 제안 버전 전달', 'Send a new proposal revision'],
      ['변경된 제안에 고객 동의', 'Consent to the exact new proposal'],
      ['CONFIRMED · 예약 확정', 'CONFIRMED appointment'],
      ['변경 제안은 기존 예약을 먼저 취소하지 않는다', 'A change proposal does not release the existing appointment first'],
      ['거절·만료·자원 충돌이면 기존 confirmedProposalId와 자원 점유를 유지한다.', 'Decline, expiry, or resource conflict preserves the current confirmedProposalId and allocation.'],
    ],
  },
  {
    source: 'public/assets/clinic-appointment-commitment-responsibility-boundaries-01-ko.svg',
    target: 'public/assets/clinic-appointment-commitment-responsibility-boundaries-01-en.svg',
    replacements: [
      ['희망 내원 날짜와 예약 확정을 둘러싼 서비스 책임 경계', 'Service Boundaries Around Preferred Visit Dates and Appointment Confirmation'],
      ['고객 채널과 동의 서비스는 희망과 동의 원문을, 예약서비스는 제안과 예약 확정 상태를, 병원 운영은 승인과 대안을, 자원 원장은 의료 자원 점유를, 임상서비스는 실제 완료를 소유한다.', 'The customer channel owns intent and source consent, the appointment service owns proposals and appointment confirmation, clinic operations owns approval and alternatives, the resource ledger owns availability, and the clinical service owns actual completion.'],
      ['서비스별 책임: 희망 일정과 예약 확정의 경계', 'Service Responsibilities: Intent and Appointment Confirmation'],
      ['희망과 동의 원문, 일정 합의, 운영 승인, 자원 점유, 임상 완료는 서로 다른 책임 시스템이 소유한다.', 'Intent, source consent, scheduling agreement, operational approval, resource allocation, and clinical completion have distinct owners.'],
      ['고객 채널은 희망과 동의를 전달한다.', 'The customer channel hands off intent and consent.'],
      ['예약서비스는 일정 합의를 확정한다.', 'The appointment service confirms the scheduling agreement.'],
      ['임상서비스는 진료 완료를 판단한다.', 'The clinical service determines completion.'],
      ['원장·입력', 'Source'], ['고객 채널·동의 서비스', 'Customer Channel · Consent Service'],
      ['고객 희망 내원 날짜', 'preferred visit date'], ['제시 조건 · 동의 원문', 'presented terms · source consent'],
      ['검증용 증빙 참조', 'opaque evidence reference'],
      ['판단', 'Decision'], ['병원 운영', 'Clinic Operations'], ['고객 요청 승인 · 대안 제안', 'approve request · propose alternative'],
      ['자원 원장', 'Resource Ledger'], ['>원장<', '>Source<'], ['의료진 · 장비 · 공간 · 수용량', 'staff · equipment · space · capacity'],
      ['임상·시술 서비스', 'Clinical Service'], ['실제 시작 · 완료 · 부분 완료', 'actual start · completion · partial completion'],
      ['예약서비스가 소유하는 정보', 'Information Owned by the Appointment Service'],
      ['제안, 상태, 적용 정책과 자원 점유 연결을 한 트랜잭션으로 관리한다.', 'It atomically manages proposals, state, policy snapshots, and allocation bindings.'],
      ['>제안<', '>Proposal<'], ['시간 · 항목 · 자원 후보 · 제안 해시', 'time · items · resource candidates · proposal hash'],
      ['CONFIRMED + 적용 정책 기록', 'CONFIRMED + policy snapshot'],
      ['>예약 확정<', '>Commitment<'], ['새 제안이 실패해도 기존의 확정된 예약일시와 자원 점유를 유지한다.', 'A failed new proposal preserves the existing commitment and allocation.'],
      ['보호 규칙', 'Protection rule'], ['경계의 읽는 규칙', 'How to read the boundary'],
    ],
  },
];

for (const asset of assets) {
  let svg = await readFile(resolve(root, asset.source), 'utf8');
  for (const [from, to] of asset.replacements) {
    if (!svg.includes(from)) {
      throw new Error(`Missing localization source text: ${from}`);
    }
    svg = svg.replaceAll(from, to);
  }
  await writeFile(resolve(root, asset.target), svg, 'utf8');
}
