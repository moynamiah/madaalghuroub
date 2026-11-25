/**
 * Pure, testable RFQ validation, anti-spam (honeypot + cooldown), Riyadh timestamping,
 * dynamic reference ID generation, and reliable Firestore submission orchestration.
 *
 * Guarantees:
 * - Never returns a confirmed receipt unless the Firestore write resolves before timeout.
 * - Surfaces an explicit "pending" state for network/offline/timeout uncertainty (no false receipt).
 * - Surfaces an explicit "error" state for validation, honeypot, cooldown, or rejected writes.
 * - Uses dynamic Asia/Riyadh (AST, UTC+3) year and timestamp formatting.
 */

export type RfqLanguage = 'en' | 'ar';

export interface AttachedTradeItem {
  code: string;
  title: string;
  headcount: number;
  dailyRateSAR: number;
}

export interface SubmittedTenderReceipt {
  referenceId: string;
  timestamp: string;
  organization: string;
  contactName: string;
  email: string;
  phone: string;
  region: string;
  contractPackageType: string;
  estimatedBudgetSAR: string;
  mobilizationTimeline: string;
  selectedScopes: string[];
  attachedTrades: AttachedTradeItem[];
  notes: string;
}

export interface PendingTenderSubmission {
  referenceId: string;
  timestamp: string;
  organization: string;
  contactName: string;
  email: string;
  message: string;
}

export interface RfqFormInput {
  organization: string;
  contactName: string;
  email: string;
  phone: string;
  region: string;
  contractPackageType: string;
  estimatedBudgetSAR: string;
  mobilizationTimeline: string;
  selectedScopes: string[];
  attachedTrades: AttachedTradeItem[];
  notes: string;
  honeypotWebsite: string;
}

export interface TenderInquiryPayload<TTimestamp = unknown> {
  referenceId: string;
  timestampDisplay: string;
  organization: string;
  contactName: string;
  email: string;
  phone: string;
  region: string;
  contractPackageType: string;
  estimatedBudgetSAR: string;
  mobilizationTimeline: string;
  selectedScopesSummary: string;
  attachedTradesSummary: string;
  notes: string;
  status: 'new';
  createdAt: TTimestamp;
}

export type RfqSubmissionErrorCode =
  | 'in_flight'
  | 'honeypot'
  | 'cooldown'
  | 'validation'
  | 'firestore_error';

export type RfqSubmissionResult =
  | {
      status: 'confirmed';
      receipt: SubmittedTenderReceipt;
      submittedAtMs: number;
    }
  | {
      status: 'pending';
      pending: PendingTenderSubmission;
    }
  | {
      status: 'error';
      code: RfqSubmissionErrorCode;
      message: string;
      remainingCooldownSeconds?: number;
      originalError?: unknown;
    };

export const RFQ_COOLDOWN_MS = 30_000;
export const RFQ_WRITE_TIMEOUT_MS = 15_000;

export const RFQ_FIELD_LIMITS = {
  referenceId: 40,
  timestampDisplay: 40,
  organization: 180,
  contactName: 140,
  email: 160,
  phone: 60,
  region: 140,
  contractPackageType: 120,
  estimatedBudgetSAR: 80,
  mobilizationTimeline: 80,
  selectedScopesSummary: 1200,
  attachedTradesSummary: 1500,
  notes: 2000,
} as const;

export const RFQ_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const RFQ_PHONE_REGEX = /^[+0-9\s\-()]{8,60}$/;
export const RFQ_REFERENCE_ID_REGEX = /^RFQ-MM-20[0-9]{2}-[0-9]{6}$/;

const UNSAFE_CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizeRfqText(value: string, maxLength: number): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(UNSAFE_CONTROL_CHARS_REGEX, '').trim().slice(0, maxLength);
}

export function getRiyadhYear(date: Date = new Date()): number {
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
  }).format(date);
  const parsed = Number.parseInt(formatted, 10);
  return Number.isFinite(parsed) ? parsed : date.getUTCFullYear();
}

export function formatRiyadhTimestamp(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const getPart = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? '00';

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const rawHour = getPart('hour');
  const hour = rawHour === '24' ? '00' : rawHour;
  const minute = getPart('minute');

  return `${year}-${month}-${day} ${hour}:${minute} AST`;
}

function generateSecureSixDigitCode(): number {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.getRandomValues === 'function') {
    const arr = new Uint32Array(1);
    globalThis.crypto.getRandomValues(arr);
    return 100_000 + (arr[0] % 900_000);
  }
  return Math.floor(100_000 + Math.random() * 900_000);
}

export function generateRfqReferenceId(
  date: Date = new Date(),
  randomCodeGenerator: () => number = generateSecureSixDigitCode
): string {
  const year = getRiyadhYear(date);
  const rawCode = Math.floor(Math.abs(randomCodeGenerator()));
  const sixDigit = 100_000 + (rawCode % 900_000);
  return `RFQ-MM-${year}-${sixDigit}`;
}

export function isHoneypotTriggered(honeypotValue: string): boolean {
  return typeof honeypotValue === 'string' && honeypotValue.trim().length > 0;
}

export function checkRfqCooldown(
  lastConfirmedSubmitAtMs: number,
  nowMs: number = Date.now(),
  cooldownMs: number = RFQ_COOLDOWN_MS
): { allowed: boolean; remainingSeconds: number } {
  if (!lastConfirmedSubmitAtMs || lastConfirmedSubmitAtMs <= 0) {
    return { allowed: true, remainingSeconds: 0 };
  }
  const elapsedMs = nowMs - lastConfirmedSubmitAtMs;
  if (elapsedMs >= cooldownMs) {
    return { allowed: true, remainingSeconds: 0 };
  }
  const remainingSeconds = Math.max(1, Math.ceil((cooldownMs - elapsedMs) / 1000));
  return { allowed: false, remainingSeconds };
}

export interface SanitizedRfqInput {
  organization: string;
  contactName: string;
  email: string;
  phone: string;
  region: string;
  contractPackageType: string;
  estimatedBudgetSAR: string;
  mobilizationTimeline: string;
  selectedScopes: string[];
  attachedTrades: AttachedTradeItem[];
  notes: string;
}

export type RfqValidationResult =
  | { valid: true; sanitized: SanitizedRfqInput }
  | { valid: false; message: string };

export function validateRfqInput(input: RfqFormInput, lang: RfqLanguage): RfqValidationResult {
  const organization = sanitizeRfqText(input.organization, RFQ_FIELD_LIMITS.organization);
  const contactName = sanitizeRfqText(input.contactName, RFQ_FIELD_LIMITS.contactName);
  const email = sanitizeRfqText(input.email, RFQ_FIELD_LIMITS.email);
  const phone = sanitizeRfqText(input.phone, RFQ_FIELD_LIMITS.phone);
  const region = sanitizeRfqText(input.region, RFQ_FIELD_LIMITS.region);
  const contractPackageType = sanitizeRfqText(
    input.contractPackageType,
    RFQ_FIELD_LIMITS.contractPackageType
  );
  const estimatedBudgetSAR = sanitizeRfqText(
    input.estimatedBudgetSAR,
    RFQ_FIELD_LIMITS.estimatedBudgetSAR
  );
  const mobilizationTimeline = sanitizeRfqText(
    input.mobilizationTimeline,
    RFQ_FIELD_LIMITS.mobilizationTimeline
  );
  const notes = sanitizeRfqText(input.notes, RFQ_FIELD_LIMITS.notes);
  const selectedScopes = (input.selectedScopes ?? [])
    .map((scope) => sanitizeRfqText(scope, 240))
    .filter(Boolean);

  if (!organization || !contactName) {
    return {
      valid: false,
      message:
        lang === 'en'
          ? 'Please enter both the Contracting Entity / Organization name and Principal Contact name.'
          : 'يرجى إدخال اسم الجهة المتعاقدة واسم المسؤول المفوض.',
    };
  }

  if (input.organization.trim().length > RFQ_FIELD_LIMITS.organization) {
    return {
      valid: false,
      message:
        lang === 'en'
          ? `Organization name must not exceed ${RFQ_FIELD_LIMITS.organization} characters.`
          : `يجب ألا يتجاوز اسم الجهة المتعاقدة ${RFQ_FIELD_LIMITS.organization} حرفاً.`,
    };
  }

  if (input.contactName.trim().length > RFQ_FIELD_LIMITS.contactName) {
    return {
      valid: false,
      message:
        lang === 'en'
          ? `Contact name must not exceed ${RFQ_FIELD_LIMITS.contactName} characters.`
          : `يجب ألا يتجاوز اسم المسؤول المفوض ${RFQ_FIELD_LIMITS.contactName} حرفاً.`,
    };
  }

  if (
    email.length < 3 ||
    input.email.trim().length > RFQ_FIELD_LIMITS.email ||
    !RFQ_EMAIL_REGEX.test(email)
  ) {
    return {
      valid: false,
      message:
        lang === 'en'
          ? 'Please provide a valid corporate or government email address.'
          : 'يرجى إدخال بريد إلكتروني رسمي صحيح.',
    };
  }

  const digitCount = phone.replace(/\D/g, '').length;
  if (
    input.phone.trim().length > RFQ_FIELD_LIMITS.phone ||
    !RFQ_PHONE_REGEX.test(phone) ||
    digitCount < 8
  ) {
    return {
      valid: false,
      message:
        lang === 'en'
          ? 'Please provide a valid direct telephone or mobile number (8–60 characters; digits, spaces, +, -, and parentheses only).'
          : 'يرجى إدخال رقم هاتف مباشر صحيح (من 8 إلى 60 خانة؛ أرقام ومسافات ورموز الهاتف المعتمدة فقط).',
    };
  }

  if (selectedScopes.length === 0) {
    return {
      valid: false,
      message:
        lang === 'en'
          ? 'Please select at least one engineering or workforce scope package.'
          : 'يرجى اختيار نطاق هندسي أو تشغيلي واحد على الأقل.',
    };
  }

  if (!region || !contractPackageType || !estimatedBudgetSAR || !mobilizationTimeline) {
    return {
      valid: false,
      message:
        lang === 'en'
          ? 'Please complete the project corridor, contract package, and budget selections.'
          : 'يرجى استكمال اختيار المنطقة ونوع التعاقد والميزانية التقديرية.',
    };
  }

  if (input.notes.trim().length > RFQ_FIELD_LIMITS.notes) {
    return {
      valid: false,
      message:
        lang === 'en'
          ? `Technical scope notes must not exceed ${RFQ_FIELD_LIMITS.notes} characters.`
          : `يجب ألا يتجاوز ملخص النطاق الفني ${RFQ_FIELD_LIMITS.notes} حرفاً.`,
    };
  }

  return {
    valid: true,
    sanitized: {
      organization,
      contactName,
      email,
      phone,
      region,
      contractPackageType,
      estimatedBudgetSAR,
      mobilizationTimeline,
      selectedScopes,
      attachedTrades: input.attachedTrades ?? [],
      notes,
    },
  };
}

export function buildTenderInquiryPayload<TTimestamp>(
  receipt: SubmittedTenderReceipt,
  createdAtValue: TTimestamp
): TenderInquiryPayload<TTimestamp> {
  const attachedTradesSummary = receipt.attachedTrades
    .map((t) => `[${t.code}] ${t.title}: ${t.headcount} personnel @ SAR ${t.dailyRateSAR}/day`)
    .join(' | ')
    .slice(0, RFQ_FIELD_LIMITS.attachedTradesSummary);

  return {
    referenceId: receipt.referenceId.slice(0, RFQ_FIELD_LIMITS.referenceId),
    timestampDisplay: receipt.timestamp.slice(0, RFQ_FIELD_LIMITS.timestampDisplay),
    organization: receipt.organization.slice(0, RFQ_FIELD_LIMITS.organization),
    contactName: receipt.contactName.slice(0, RFQ_FIELD_LIMITS.contactName),
    email: receipt.email.slice(0, RFQ_FIELD_LIMITS.email),
    phone: receipt.phone.slice(0, RFQ_FIELD_LIMITS.phone),
    region: receipt.region.slice(0, RFQ_FIELD_LIMITS.region),
    contractPackageType: receipt.contractPackageType.slice(0, RFQ_FIELD_LIMITS.contractPackageType),
    estimatedBudgetSAR: receipt.estimatedBudgetSAR.slice(0, RFQ_FIELD_LIMITS.estimatedBudgetSAR),
    mobilizationTimeline: receipt.mobilizationTimeline.slice(0, RFQ_FIELD_LIMITS.mobilizationTimeline),
    selectedScopesSummary: receipt.selectedScopes
      .join(' · ')
      .slice(0, RFQ_FIELD_LIMITS.selectedScopesSummary),
    attachedTradesSummary,
    notes: receipt.notes.slice(0, RFQ_FIELD_LIMITS.notes),
    status: 'new',
    createdAt: createdAtValue,
  };
}

export function classifyFirestoreWriteError(error: unknown): 'network_uncertain' | 'rejected' {
  const errObj = error && typeof error === 'object' ? (error as { code?: unknown; message?: unknown; name?: unknown }) : null;
  const code = typeof errObj?.code === 'string' ? errObj.code.toLowerCase() : '';
  const name = typeof errObj?.name === 'string' ? errObj.name.toLowerCase() : '';
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : typeof errObj?.message === 'string'
      ? errObj.message.toLowerCase()
      : String(error ?? '').toLowerCase();

  if (
    name === 'rfqwritetimeouterror' ||
    code === 'unavailable' ||
    code === 'deadline-exceeded' ||
    code === 'aborted' ||
    message.includes('offline') ||
    message.includes('unavailable') ||
    message.includes('network') ||
    message.includes('timed out') ||
    message.includes('timeout')
  ) {
    return 'network_uncertain';
  }

  return 'rejected';
}

export class RfqWriteTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Tender submission confirmation timed out after ${timeoutMs}ms.`);
    this.name = 'RfqWriteTimeoutError';
  }
}

export interface SubmitRfqOptions<TTimestamp> {
  input: RfqFormInput;
  lang: RfqLanguage;
  inFlightRef: { current: boolean };
  lastConfirmedSubmitAtMs: number;
  now?: () => number;
  cooldownMs?: number;
  timeoutMs?: number;
  randomCodeGenerator?: () => number;
  createTimestampValue: () => TTimestamp;
  writeInquiry: (referenceId: string, payload: TenderInquiryPayload<TTimestamp>) => Promise<void>;
}

export async function submitRfqInquiry<TTimestamp>(
  options: SubmitRfqOptions<TTimestamp>
): Promise<RfqSubmissionResult> {
  const {
    input,
    lang,
    inFlightRef,
    lastConfirmedSubmitAtMs,
    now = () => Date.now(),
    cooldownMs = RFQ_COOLDOWN_MS,
    timeoutMs = RFQ_WRITE_TIMEOUT_MS,
    randomCodeGenerator,
    createTimestampValue,
    writeInquiry,
  } = options;

  // 1. Synchronous double-submit guard
  if (inFlightRef.current) {
    return {
      status: 'error',
      code: 'in_flight',
      message:
        lang === 'en'
          ? 'Your tender inquiry is already being transmitted. Please wait for server confirmation.'
          : 'جاري إرسال طلب المناقصة بالفعل. يرجى انتظار تأكيد الخادم.',
    };
  }

  // 2. Honeypot validation (blocks automated form-fill bots without impacting accessibility)
  if (isHoneypotTriggered(input.honeypotWebsite)) {
    return {
      status: 'error',
      code: 'honeypot',
      message:
        lang === 'en'
          ? 'Submission could not be verified. Please clear autofilled hidden fields or contact our desk directly.'
          : 'تعذر التحقق من الطلب. يرجى المحاولة يدوياً أو التواصل معنا مباشرة عبر الهاتف أو البريد الإلكتروني.',
    };
  }

  // 3. Client-side 30-second cooldown enforcement after confirmed submissions
  const currentNowMs = now();
  const cooldownCheck = checkRfqCooldown(lastConfirmedSubmitAtMs, currentNowMs, cooldownMs);
  if (!cooldownCheck.allowed) {
    return {
      status: 'error',
      code: 'cooldown',
      remainingCooldownSeconds: cooldownCheck.remainingSeconds,
      message:
        lang === 'en'
          ? `Please wait ${cooldownCheck.remainingSeconds} seconds before submitting another tender inquiry.`
          : `يرجى الانتظار ${cooldownCheck.remainingSeconds} ثانية قبل إرسال طلب مناقصة جديد.`,
    };
  }

  // 4. Input validation & sanitization
  const validation = validateRfqInput(input, lang);
  if (!validation.valid) {
    return {
      status: 'error',
      code: 'validation',
      message: validation.message,
    };
  }

  // 5. Build dynamic Asia/Riyadh reference ID, timestamp, and Firestore payload
  const submitDate = new Date(currentNowMs);
  const referenceId = generateRfqReferenceId(submitDate, randomCodeGenerator);
  const timestamp = formatRiyadhTimestamp(submitDate);

  const receipt: SubmittedTenderReceipt = {
    referenceId,
    timestamp,
    organization: validation.sanitized.organization,
    contactName: validation.sanitized.contactName,
    email: validation.sanitized.email,
    phone: validation.sanitized.phone,
    region: validation.sanitized.region,
    contractPackageType: validation.sanitized.contractPackageType,
    estimatedBudgetSAR: validation.sanitized.estimatedBudgetSAR,
    mobilizationTimeline: validation.sanitized.mobilizationTimeline,
    selectedScopes: validation.sanitized.selectedScopes,
    attachedTrades: validation.sanitized.attachedTrades,
    notes: validation.sanitized.notes,
  };

  const payload = buildTenderInquiryPayload(receipt, createTimestampValue());

  inFlightRef.current = true;
  let timerId: ReturnType<typeof setTimeout> | undefined;

  try {
    const writePromise = writeInquiry(referenceId, payload);
    // Prevent unhandled rejection if timeout settles first and the underlying write rejects later
    writePromise.catch(() => undefined);
    const timeoutPromise = new Promise<never>((_, reject) => {
      timerId = setTimeout(() => {
        reject(new RfqWriteTimeoutError(timeoutMs));
      }, timeoutMs);
    });

    await Promise.race([writePromise, timeoutPromise]);

    return {
      status: 'confirmed',
      receipt,
      submittedAtMs: now(),
    };
  } catch (error) {
    const classification = classifyFirestoreWriteError(error);
    if (classification === 'network_uncertain') {
      return {
        status: 'pending',
        pending: {
          referenceId,
          timestamp,
          organization: receipt.organization,
          contactName: receipt.contactName,
          email: receipt.email,
          message:
            lang === 'en'
              ? 'Server confirmation could not be verified due to a network interruption or timeout. Do not immediately resubmit to avoid duplicate enquiries — please verify connectivity or contact our desk directly with this pending reference.'
              : 'تعذر تأكيد استلام الخادم بسبب انقطاع الاتصال أو انتهاء مهلة الاستجابة. يرجى عدم إعادة الإرسال فوراً لتجنب التكرار، والتحقق من الاتصال أو التواصل معنا مباشرة مع ذكر هذا الرقم المرجعي المعلق.',
        },
      };
    }

    return {
      status: 'error',
      code: 'firestore_error',
      originalError: error,
      message:
        lang === 'en'
          ? 'Unable to transmit your tender inquiry right now. Your submission was not recorded — please verify your entries and retry, or contact us directly by phone/email.'
          : 'تعذر إرسال طلب المناقصة حالياً ولم يتم تسجيل الطلب. يرجى التحقق من البيانات والمحاولة مرة أخرى أو التواصل معنا مباشرة عبر الهاتف أو البريد الإلكتروني.',
    };
  } finally {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    inFlightRef.current = false;
  }
}
