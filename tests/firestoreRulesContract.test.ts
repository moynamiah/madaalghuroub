import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { RFQ_FIELD_LIMITS } from '../src/utils/rfqSubmission.ts';

/**
 * Static Firestore rules & blueprint contract assertions.
 * NOTE: These verify static rule syntax, security invariants, and client/schema alignment.
 * They do NOT replace live Firebase Firestore Emulator execution (which requires Java).
 */

const rootDir = process.cwd();
const rulesText = fs.readFileSync(path.join(rootDir, 'firestore.rules'), 'utf8');
const blueprint = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'firebase-blueprint.json'), 'utf8')
) as {
  entities: Record<string, { required: string[]; properties: Record<string, unknown> }>;
  firestore: Record<string, { schema: string }>;
};

test('firestore.rules enforces global default-deny catch-all and strict verified admin email check', () => {
  assert.match(rulesText, /match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;\s*\}/);
  assert.match(rulesText, /request\.auth\.token\.email_verified == true/);
  assert.match(rulesText, /request\.auth\.token\.email == 'sabbirhossenksa\.2\.6@gmail\.com'/);
});

test('firestore.rules enforces tender_inquiries PII isolation, dynamic year regex, ID binding, and server timestamp', () => {
  assert.match(rulesText, /match \/tender_inquiries\/\{inquiryId\}/);
  assert.match(rulesText, /incoming\(\)\.referenceId == inquiryId/);
  assert.match(rulesText, /incoming\(\)\.status == 'new'/);
  assert.match(rulesText, /incoming\(\)\.createdAt == request\.time/);
  assert.match(rulesText, /\^RFQ-MM-20\[0-9\]\{2\}-\[0-9\]\{6\}\$/);
  assert.match(rulesText, /allow get: if isAdmin\(\) && isValidId\(inquiryId\);/);
  assert.match(rulesText, /allow list: if isAdmin\(\);/);
  assert.match(rulesText, /allow delete: if isAdmin\(\) && isValidId\(inquiryId\);/);
});

test('firestore.rules restricts portfolio_config and company_profile_doc public read strictly to singleton main', () => {
  assert.match(rulesText, /match \/portfolio_config\/\{configId\}[\s\S]*?allow get: if isValidId\(configId\) && configId == 'main';/);
  assert.match(rulesText, /match \/company_profile_doc\/\{docId\}[\s\S]*?allow get: if isValidId\(docId\) && docId == 'main';/);
});

test('client RFQ_FIELD_LIMITS strictly align with firestore.rules TenderInquiry size bounds', () => {
  assert.match(rulesText, new RegExp(`data\\.referenceId\\.size\\(\\) <= ${RFQ_FIELD_LIMITS.referenceId}`));
  assert.match(rulesText, new RegExp(`data\\.timestampDisplay\\.size\\(\\) <= ${RFQ_FIELD_LIMITS.timestampDisplay}`));
  assert.match(rulesText, new RegExp(`data\\.organization\\.size\\(\\) <= ${RFQ_FIELD_LIMITS.organization}`));
  assert.match(rulesText, new RegExp(`data\\.contactName\\.size\\(\\) <= ${RFQ_FIELD_LIMITS.contactName}`));
  assert.match(rulesText, new RegExp(`data\\.email\\.size\\(\\) <= ${RFQ_FIELD_LIMITS.email}`));
  assert.match(rulesText, new RegExp(`data\\.phone\\.size\\(\\) <= ${RFQ_FIELD_LIMITS.phone}`));
  assert.match(rulesText, new RegExp(`data\\.region\\.size\\(\\) <= ${RFQ_FIELD_LIMITS.region}`));
  assert.match(rulesText, new RegExp(`data\\.contractPackageType\\.size\\(\\) <= ${RFQ_FIELD_LIMITS.contractPackageType}`));
  assert.match(rulesText, new RegExp(`data\\.estimatedBudgetSAR\\.size\\(\\) <= ${RFQ_FIELD_LIMITS.estimatedBudgetSAR}`));
  assert.match(rulesText, new RegExp(`data\\.mobilizationTimeline\\.size\\(\\) <= ${RFQ_FIELD_LIMITS.mobilizationTimeline}`));
  assert.match(rulesText, new RegExp(`data\\.selectedScopesSummary\\.size\\(\\) <= ${RFQ_FIELD_LIMITS.selectedScopesSummary}`));
  assert.match(rulesText, new RegExp(`data\\.attachedTradesSummary\\.size\\(\\) <= ${RFQ_FIELD_LIMITS.attachedTradesSummary}`));
  assert.match(rulesText, new RegExp(`data\\.notes\\.size\\(\\) <= ${RFQ_FIELD_LIMITS.notes}`));
});

test('firebase-blueprint.json defines TenderInquiry with exact 15 required fields', () => {
  const tenderEntity = blueprint.entities.TenderInquiry;
  assert.ok(tenderEntity);
  assert.equal(tenderEntity.required.length, 15);
  assert.deepEqual(
    [...tenderEntity.required].sort(),
    [
      'attachedTradesSummary',
      'contactName',
      'contractPackageType',
      'createdAt',
      'email',
      'estimatedBudgetSAR',
      'mobilizationTimeline',
      'notes',
      'organization',
      'phone',
      'referenceId',
      'region',
      'selectedScopesSummary',
      'status',
      'timestampDisplay',
    ].sort()
  );
});


test('Firebase config keeps the original named Firestore database and prevents implicit default fallback', () => {
  const config = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'firebase-applet-config.json'), 'utf8')
  ) as { projectId?: string; firestoreDatabaseId?: string };
  assert.equal(config.projectId, 'gen-lang-client-0758969490');
  assert.equal(
    config.firestoreDatabaseId,
    'ai-studio-apexengineeringi-81fc4664-fe21-4148-bbcd-1b096e805312'
  );
  const firebaseSource = fs.readFileSync(path.join(rootDir, 'src/firebase.ts'), 'utf8');
  assert.match(firebaseSource, /throw new Error\('Missing required named Firestore database configuration\.'/);
  assert.match(firebaseSource, /initializeFirestore\(/);
  assert.match(firebaseSource, /firestoreDatabaseId\s*\)/);
});
