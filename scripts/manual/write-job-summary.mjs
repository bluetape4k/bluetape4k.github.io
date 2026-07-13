import { readFile } from 'node:fs/promises';
import { sanitizeDiagnostic } from './lib/release.mjs';

const reportPath = process.argv[2];
if (!reportPath) {
  console.error('Usage: node scripts/manual/write-job-summary.mjs <report.json>');
  process.exit(2);
}

const safe = (value) => {
  const sanitized = sanitizeDiagnostic({ actual: value }).actual;
  return String(sanitized ?? 'n/a').replace(/[|`\r\n]/g, ' ').slice(0, 200);
};
let report;
try {
  report = JSON.parse(await readFile(reportPath, 'utf8'));
} catch {
  report = { status: 'missing', code: 'REPORT_MISSING', driftPaths: [] };
}

const lines = ['## Manual validation', ''];
if (report.status === 'pass') {
  lines.push(
    '| Field | Value |',
    '| --- | --- |',
    `| Status | pass |`,
    `| Repository | ${safe(report.repository)} |`,
    `| Latest minor | ${safe(report.latest)} |`,
    `| Release | ${safe(report.releaseRef)} |`,
    `| Release commit | ${safe(report.releaseCommit)} |`,
    `| Source commit | ${safe(report.sourceCommit)} |`,
    `| Versions | ${safe(report.versions)} |`,
    `| Documents | ${safe(report.documents)} |`,
    `| Assets | ${safe(report.assets)} |`,
    `| Redirects | ${safe(report.redirects)} |`,
    `| Generation | ${safe(report.generationId)} |`,
  );
} else {
  lines.push(`**Status:** ${safe(report.status)}`, '', `**Code:** ${safe(report.code)}`);
  const paths = Array.isArray(report.driftPaths) ? report.driftPaths.slice(0, 10) : [];
  if (paths.length > 0) lines.push('', 'First drift paths:', '', ...paths.map((item) => `- ${safe(item)}`));
}

process.stdout.write(`${lines.join('\n')}\n`);
