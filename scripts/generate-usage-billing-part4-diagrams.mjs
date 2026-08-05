import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const outputDir = path.resolve('public/assets/blog/usage-billing/part4');

const copy = {
  ko: {
    title: '장애를 복구하는 여섯 단계',
    subtitle: '기준 데이터를 보존한 채 탐지부터 재개 승인까지 증거로 연결합니다.',
    detect: ['1. 탐지', 'Lag · 실패 상태 · 금액 불일치'],
    scope: ['2. 영향 범위 식별', 'Tenant · 기간 · Event · Generation'],
    classify: ['3. 실패 분류', '자동 복구와 운영자 개입 경계를 결정'],
    transient: ['일시적 장애', '재시도 · Lease 인계', '기존 작업 재사용'],
    contract: ['영구 계약 오류', '격리 · 계약 수정', '불변 원본 Redrive'],
    mismatch: ['정합성 오류', 'Replay · Rebuild', 'Append-only 보정'],
    reconcile: ['4. 정합성 검증', '원장 · Event Store · Projection · Read Model 대조'],
    gate: ['5. 복구 완료 Gate', 'Cursor · Quarantine · 금액 · Fencing Token · Lag'],
    resume: ['6. 재개 승인', '관찰 범위를 유지하며 트래픽을 단계적으로 복원'],
    footer: '금지: 원본 사실 수정 · Checkpoint 건너뛰기 · 실패 상태 강제 완료 · 재무 이력 덮어쓰기',
  },
  en: {
    title: 'Six stages of failure recovery',
    subtitle: 'Preserve the system of record and connect detection to resume approval with evidence.',
    detect: ['1. Detect', 'lag / failed states / amount mismatch'],
    scope: ['2. Identify scope', 'tenant / period / event / generation'],
    classify: ['3. Classify', 'choose the automation and operator boundary'],
    transient: ['Transient failure', 'retry / lease takeover', 'reuse durable work'],
    contract: ['Permanent contract error', 'quarantine / fix contract', 'redrive immutable source'],
    mismatch: ['Consistency mismatch', 'replay / rebuild', 'append-only adjustment'],
    reconcile: ['4. Reconcile', 'ledger / event store / projection / read model'],
    gate: ['5. Recovery gate', 'cursor / quarantine / amounts / fencing token / lag'],
    resume: ['6. Approve resume', 'restore traffic gradually while keeping the recovery scope observable'],
    footer: 'Forbidden: edit source facts / skip checkpoints / force failed work complete / overwrite financial history',
  },
};

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function lines(values, x, y, className, gap = 28, anchor = 'middle') {
  return values.map((value, index) =>
    `<text x="${x}" y="${y + index * gap}" class="${className}" text-anchor="${anchor}">${escapeXml(value)}</text>`,
  ).join('\n');
}

function card({ x, y, w, h, kind = 'normal', values, titleGap = 32 }) {
  return `
    <g class="card-group ${kind}">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" class="card" />
      ${lines(values.slice(0, 1), x + w / 2, y + 45, 'card-title')}
      ${lines(values.slice(1), x + w / 2, y + 45 + titleGap, 'card-copy', 27)}
    </g>`;
}

function connector(d, kind = 'cyan') {
  return `<path d="${d}" class="connector ${kind}" marker-end="url(#arrow-${kind})" />`;
}

function createSvg(locale) {
  const t = copy[locale];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1650" viewBox="0 0 1440 1650" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(t.title)}</title>
  <desc id="desc">${escapeXml(t.subtitle)}</desc>
  <defs>
    <pattern id="grid" width="120" height="120" patternUnits="userSpaceOnUse">
      <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#16304a" stroke-width="1" opacity="0.42" />
    </pattern>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <marker id="arrow-cyan" viewBox="0 0 14 14" refX="12" refY="7" markerWidth="14" markerHeight="14" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
      <path d="M 1 1 L 13 7 L 1 13 Z" fill="#38bdf8" />
    </marker>
    <marker id="arrow-amber" viewBox="0 0 14 14" refX="12" refY="7" markerWidth="14" markerHeight="14" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
      <path d="M 1 1 L 13 7 L 1 13 Z" fill="#f59e0b" />
    </marker>
    <style>
      .title { fill:#f8fafc; font:700 48px Inter, Pretendard, sans-serif; }
      .subtitle { fill:#9fb3c8; font:500 22px Inter, Pretendard, sans-serif; }
      .card-group rect { fill:#111f34; stroke:#476581; stroke-width:3; }
      .card-title { fill:#f8fafc; font:700 25px Inter, Pretendard, sans-serif; }
      .card-copy { fill:#b8c9dc; font:500 18px Inter, Pretendard, sans-serif; }
      .transient rect { stroke:#38bdf8; }
      .contract rect { stroke:#f59e0b; }
      .mismatch rect { stroke:#a78bfa; }
      .gate rect { fill:#102c35; stroke:#22c55e; stroke-width:4; }
      .gate .card-title { fill:#86efac; }
      .resume rect { fill:#102b3c; stroke:#22d3ee; stroke-width:4; }
      .connector { fill:none; stroke-width:5; stroke-linecap:round; stroke-linejoin:round; }
      .connector.cyan { stroke:#38bdf8; }
      .connector.amber { stroke:#f59e0b; }
      .branch-label rect { fill:#082f49; stroke:#0ea5e9; stroke-width:2; }
      .branch-label text { fill:#7dd3fc; font:700 18px Inter, Pretendard, sans-serif; }
      .footer { fill:#fbbf24; font:650 20px Inter, Pretendard, sans-serif; }
    </style>
  </defs>
  <rect width="1440" height="1650" fill="#071423" />
  <rect width="1440" height="1650" fill="url(#grid)" />
  <text x="80" y="86" class="title">${escapeXml(t.title)}</text>
  <text x="80" y="128" class="subtitle">${escapeXml(t.subtitle)}</text>

  ${card({ x: 430, y: 180, w: 580, h: 120, values: t.detect })}
  ${connector('M 720 300 L 720 350')}
  ${card({ x: 430, y: 365, w: 580, h: 120, values: t.scope })}
  ${connector('M 720 485 L 720 535')}
  ${card({ x: 430, y: 550, w: 580, h: 120, values: t.classify })}

  ${connector('M 610 670 L 610 710 Q 610 730 590 730 L 280 730 Q 260 730 260 750 L 260 760')}
  ${connector('M 720 670 L 720 760', 'amber')}
  ${connector('M 830 670 L 830 710 Q 830 730 850 730 L 1160 730 Q 1180 730 1180 750 L 1180 760')}

  ${card({ x: 70, y: 775, w: 380, h: 170, kind: 'transient', values: t.transient })}
  ${card({ x: 530, y: 775, w: 380, h: 170, kind: 'contract', values: t.contract })}
  ${card({ x: 990, y: 775, w: 380, h: 170, kind: 'mismatch', values: t.mismatch })}

  ${connector('M 260 945 L 260 990 Q 260 1010 280 1010 L 670 1010 Q 690 1010 690 1030 L 690 1055')}
  ${connector('M 720 945 L 720 1055', 'amber')}
  ${connector('M 1180 945 L 1180 990 Q 1180 1010 1160 1010 L 770 1010 Q 750 1010 750 1030 L 750 1055')}
  ${card({ x: 330, y: 1070, w: 780, h: 120, values: t.reconcile })}
  ${connector('M 720 1190 L 720 1240')}
  ${card({ x: 330, y: 1255, w: 780, h: 120, kind: 'gate', values: t.gate })}
  ${connector('M 720 1375 L 720 1415')}
  ${card({ x: 330, y: 1430, w: 780, h: 120, kind: 'resume', values: t.resume })}
  <text x="720" y="1590" class="footer" text-anchor="middle">${escapeXml(t.footer)}</text>
</svg>`;
}

await mkdir(outputDir, { recursive: true });
for (const locale of ['ko', 'en']) {
  const svg = createSvg(locale);
  const svgPath = path.join(outputDir, `usage-billing-recovery-01-${locale}.svg`);
  const pngPath = path.join(outputDir, `usage-billing-recovery-01-${locale}.png`);
  await writeFile(svgPath, svg);
  await sharp(Buffer.from(svg)).resize({ width: 2880 }).png().toFile(pngPath);
}
