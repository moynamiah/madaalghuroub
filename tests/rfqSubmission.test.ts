import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RFQ_COOLDOWN_MS,
  RFQ_FIELD_LIMITS,
  RFQ_REFERENCE_ID_REGEX,
  checkRfqCooldown,
  formatRiyadhTimestamp,
  generateRfqReferenceId,
  getRiyadhYear,
  isHoneypotTriggered,
  submitRfqInquiry,
  validateRfqInput,
  type RfqFormInput,
  type TenderInquiryPayload,
} from '../src/utils/rfqSubmission.ts';

function createValidInput(overrides: Partial<RfqFormInput> = {}): RfqFormInput {
  return {
    organization: 'Jubail Petrochemical Complex Co.',
    contactName: 'Eng. Khalid Al-Harbi',
    email: 'k.alharbi@jubailpetrochem.sa',
    phone: '+966 50 123 4567',
    region: 'Jubail / Eastern Province Corridor',
    contractPackageType: 'Turnkey EPC Contracting',
    estimatedBudgetSAR: 'SAR 100M – 500M',
    mobilizationTimeline: 'Immediate (Within 30 Days)',
    selectedScopes: [
      'Civil Construction Manpower (Carpenters, Steel Fixers, Masons & Helpers)',
    ],
    attachedTrades: [
      { code: 'MG-W01', title: '6G Certified Welders', headcount: 25, dailyRateSAR: 420 },
    ],
    notes: 'Mobilization target Q2 with Saudi Aramco WPR coverage.',
    honeypotWebsite: '',
    ...overrides,
  };
}

test('dynamic Asia/Riyadh year & timestamp handle year rollover across UTC midnight boundary', () => {
  // 2026-12-31 21:30 UTC is 2027-01-01 00:30 AST (Asia/Riyadh is UTC+3)
  const rolloverDate = new Date('2026-12-31T21:30:00.000Z');
  assert.equal(getRiyadhYear(rolloverDate), 2027);
  assert.equal(formatRiyadhTimestamp(rolloverDate), '2027-01-01 00:30 AST');

  const ref2027 = generateRfqReferenceId(rolloverDate, () => 234567);
  assert.equal(ref2027, 'RFQ-MM-2027-334567');
  assert.match(ref2027, RFQ_REFERENCE_ID_REGEX);

  const futureDate = new Date('2031-06-15T10:15:00.000Z');
  const ref2031 = generateRfqReferenceId(futureDate, () => 12345);
  assert.equal(ref2031, 'RFQ-MM-2031-112345');
  assert.match(ref2031, RFQ_REFERENCE_ID_REGEX);
  assert.equal(formatRiyadhTimestamp(futureDate), '2031-06-15 13:15 AST');
});

test('validateRfqInput rejects invalid emails, malformed phones, missing scopes, and over-limit lengths', () => {
  assert.equal(validateRfqInput(createValidInput(), 'en').valid, true);

  assert.equal(validateRfqInput(createValidInput({ organization: '   ' }), 'en').valid, false);
  assert.equal(validateRfqInput(createValidInput({ contactName: '' }), 'ar').valid, false);
  assert.equal(validateRfqInput(createValidInput({ email: 'not-an-email' }), 'en').valid, false);
  assert.equal(validateRfqInput(createValidInput({ phone: '12345' }), 'en').valid, false);
  assert.equal(validateRfqInput(createValidInput({ phone: '+966 50 ABC 1234' }), 'en').valid, false);
  assert.equal(validateRfqInput(createValidInput({ selectedScopes: [] }), 'en').valid, false);
  assert.equal(
    validateRfqInput(
      createValidInput({ organization: 'A'.repeat(RFQ_FIELD_LIMITS.organization + 1) }),
      'en'
    ).valid,
    false
  );
  assert.equal(
    validateRfqInput(
      createValidInput({ notes: 'N'.repeat(RFQ_FIELD_LIMITS.notes + 1) }),
      'en'
    ).valid,
    false
  );
});

test('honeypot blocks submission immediately without invoking Firestore write', async () => {
  assert.equal(isHoneypotTriggered(''), false);
  assert.equal(isHoneypotTriggered('   '), false);
  assert.equal(isHoneypotTriggered('https://spam-bot.example'), true);

  let writeCalls = 0;
  const inFlightRef = { current: false };
  const result = await submitRfqInquiry({
    input: createValidInput({ honeypotWebsite: 'https://bot.example' }),
    lang: 'en',
    inFlightRef,
    lastConfirmedSubmitAtMs: 0,
    createTimestampValue: () => 'SERVER_TS',
    writeInquiry: async () => {
      writeCalls += 1;
    },
  });

  assert.equal(result.status, 'error');
  if (result.status === 'error') {
    assert.equal(result.code, 'honeypot');
  }
  assert.equal(writeCalls, 0);
  assert.equal(inFlightRef.current, false);
});

test('30-second cooldown blocks rapid resubmissions and unlocks after 30s', async () => {
  const baseTime = Date.parse('2027-03-10T09:00:00.000Z');
  assert.deepEqual(checkRfqCooldown(baseTime, baseTime + 10_000, RFQ_COOLDOWN_MS), {
    allowed: false,
    remainingSeconds: 20,
  });
  assert.deepEqual(checkRfqCooldown(baseTime, baseTime + 30_000, RFQ_COOLDOWN_MS), {
    allowed: true,
    remainingSeconds: 0,
  });

  let writeCalls = 0;
  const blocked = await submitRfqInquiry({
    input: createValidInput(),
    lang: 'en',
    inFlightRef: { current: false },
    lastConfirmedSubmitAtMs: baseTime,
    now: () => baseTime + 5_000,
    createTimestampValue: () => 'SERVER_TS',
    writeInquiry: async () => {
      writeCalls += 1;
    },
  });

  assert.equal(blocked.status, 'error');
  if (blocked.status === 'error') {
    assert.equal(blocked.code, 'cooldown');
    assert.equal(blocked.remainingCooldownSeconds, 25);
  }
  assert.equal(writeCalls, 0);
});

test('synchronous in-flight guard prevents duplicate concurrent submissions', async () => {
  let resolveWrite!: () => void;
  let writeCalls = 0;
  const inFlightRef = { current: false };
  const fixedNow = Date.parse('2027-05-01T12:00:00.000Z');

  const firstPromise = submitRfqInquiry({
    input: createValidInput(),
    lang: 'en',
    inFlightRef,
    lastConfirmedSubmitAtMs: 0,
    now: () => fixedNow,
    createTimestampValue: () => 'SERVER_TS',
    writeInquiry: () =>
      new Promise<void>((resolve) => {
        writeCalls += 1;
        resolveWrite = resolve;
      }),
  });

  // Trigger second submission synchronously while first is still awaiting Firestore
  const secondResult = await submitRfqInquiry({
    input: createValidInput(),
    lang: 'en',
    inFlightRef,
    lastConfirmedSubmitAtMs: 0,
    now: () => fixedNow,
    createTimestampValue: () => 'SERVER_TS',
    writeInquiry: async () => {
      writeCalls += 1;
    },
  });

  assert.equal(secondResult.status, 'error');
  if (secondResult.status === 'error') {
    assert.equal(secondResult.code, 'in_flight');
  }
  assert.equal(writeCalls, 1);

  resolveWrite();
  const firstResult = await firstPromise;
  assert.equal(firstResult.status, 'confirmed');
  assert.equal(inFlightRef.current, false);
});

test('confirmed Firestore write returns receipt with matching 15-field schema payload', async () => {
  const captured: { id: string; payload?: TenderInquiryPayload<string> } = { id: '' };
  const fixedNow = Date.parse('2027-08-20T07:45:00.000Z');

  const result = await submitRfqInquiry({
    input: createValidInput(),
    lang: 'en',
    inFlightRef: { current: false },
    lastConfirmedSubmitAtMs: 0,
    now: () => fixedNow,
    randomCodeGenerator: () => 456789,
    createTimestampValue: () => 'SERVER_TIMESTAMP_SENTINEL',
    writeInquiry: async (referenceId, payload) => {
      captured.id = referenceId;
      captured.payload = payload;
    },
  });

  assert.equal(result.status, 'confirmed');
  if (result.status === 'confirmed') {
    assert.equal(result.receipt.referenceId, 'RFQ-MM-2027-556789');
    assert.equal(result.receipt.timestamp, '2027-08-20 10:45 AST');
    assert.equal(captured.id, result.receipt.referenceId);
    assert.ok(captured.payload);
    assert.equal(captured.payload.referenceId, captured.id);
    assert.equal(captured.payload.status, 'new');
    assert.equal(captured.payload.createdAt, 'SERVER_TIMESTAMP_SENTINEL');
    assert.equal(Object.keys(captured.payload).length, 15);
  }
});

test('offline or unavailable Firestore error NEVER returns a confirmed receipt (returns pending)', async () => {
  const result = await submitRfqInquiry({
    input: createValidInput(),
    lang: 'en',
    inFlightRef: { current: false },
    lastConfirmedSubmitAtMs: 0,
    createTimestampValue: () => 'SERVER_TS',
    writeInquiry: async () => {
      const err = new Error('Failed to write document because the client is offline.');
      (err as Error & { code?: string }).code = 'unavailable';
      throw err;
    },
  });

  assert.equal(result.status, 'pending');
  assert.equal('receipt' in result, false);
  if (result.status === 'pending') {
    assert.match(result.pending.referenceId, RFQ_REFERENCE_ID_REGEX);
    assert.match(result.pending.message, /do not immediately resubmit/i);
  }
});

test('Firestore write timeout NEVER returns a confirmed receipt (returns pending)', async () => {
  const result = await submitRfqInquiry({
    input: createValidInput(),
    lang: 'en',
    inFlightRef: { current: false },
    lastConfirmedSubmitAtMs: 0,
    timeoutMs: 25,
    createTimestampValue: () => 'SERVER_TS',
    writeInquiry: () => new Promise<void>(() => {
      // Intentionally never settles to simulate hung network confirmation
    }),
  });

  assert.equal(result.status, 'pending');
  assert.equal('receipt' in result, false);
});

test('Firestore permission-denied error NEVER returns a receipt and allows safe retry', async () => {
  const inFlightRef = { current: false };
  const result = await submitRfqInquiry({
    input: createValidInput(),
    lang: 'en',
    inFlightRef,
    lastConfirmedSubmitAtMs: 0,
    createTimestampValue: () => 'SERVER_TS',
    writeInquiry: async () => {
      const err = new Error('Missing or insufficient permissions.');
      (err as Error & { code?: string }).code = 'permission-denied';
      throw err;
    },
  });

  assert.equal(result.status, 'error');
  assert.equal('receipt' in result, false);
  if (result.status === 'error') {
    assert.equal(result.code, 'firestore_error');
  }
  assert.equal(inFlightRef.current, false);
});
