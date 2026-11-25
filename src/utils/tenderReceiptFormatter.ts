import type { SubmittedTenderReceipt } from '../components/ProcurementRfqSection';

export interface TenderReceiptIdentity {
  executiveName?: string;
  executiveRole?: string;
  companyName?: string;
}

export function downloadOfficialTenderReceipt(
  tenderReceipt: SubmittedTenderReceipt,
  identity?: TenderReceiptIdentity
): void {
  const execName = identity?.executiveName || 'Moyna Miah';
  const execRole = identity?.executiveRole || 'Business Development Manager';
  const company = identity?.companyName || 'MADA AL-GHUROUB GENERAL CONTRACTING COMPANY';

  const content = [
    `${execName.toUpperCase()} (${execRole.toUpperCase()}) — OFFICIAL TENDER / RFQ RECEIPT`,
    company.toUpperCase(),
    '========================================================================',
    `Tender Reference ID : ${tenderReceipt.referenceId}`,
    `Submission Timestamp: ${tenderReceipt.timestamp}`,
    `Executive Desk      : ${execName} — ${execRole}`,
    `Company             : ${company}`,
    `Contracting Entity  : ${tenderReceipt.organization}`,
    `Authorized Contact  : ${tenderReceipt.contactName}`,
    `Official Email      : ${tenderReceipt.email}`,
    `Direct Phone        : ${tenderReceipt.phone}`,
    `Corridor / Region   : ${tenderReceipt.region}`,
    `Contract Model      : ${tenderReceipt.contractPackageType}`,
    `Estimated CapEx     : ${tenderReceipt.estimatedBudgetSAR}`,
    `Target Mobilization : ${tenderReceipt.mobilizationTimeline}`,
    '',
    'SELECTED EPC & WORKFORCE SCOPES:',
    ...tenderReceipt.selectedScopes.map((s) => `  - ${s}`),
    '',
    'ATTACHED TECHNICAL MANPOWER SCHEDULE:',
    ...(tenderReceipt.attachedTrades.length > 0
      ? tenderReceipt.attachedTrades.map(
          (t) => `  - [${t.code}] ${t.title}: ${t.headcount} personnel @ SAR ${t.dailyRateSAR}/day`
        )
      : ['  - Standard EPC project staffing (no custom trade roster attached)']),
    '',
    'TECHNICAL NOTES / BOQ REFERENCE:',
    tenderReceipt.notes || 'None provided.',
    '========================================================================',
    'Dhahran Industrial HQ · Jubail · Yanbu · Riyadh · Tabuk Corridor',
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${tenderReceipt.referenceId}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
