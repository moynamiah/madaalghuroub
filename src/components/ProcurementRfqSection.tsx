import React, { memo } from 'react';
import {
  Check,
  FileCheck2,
  Download,
  RotateCcw,
  AlertCircle,
  Mail,
  Phone,
} from 'lucide-react';
import { Language } from '../data/industrialData';
import { ResilientImage } from './ResilientImage';

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
  attachedTrades: { code: string; title: string; headcount: number; dailyRateSAR: number }[];
  notes: string;
}

export const SCOPE_OPTIONS = [
  {
    en: 'Civil Construction Manpower (Carpenters, Steel Fixers, Masons & Helpers)',
    ar: 'عمالة الإنشاءات المدنية (نجارون، حدادون، بناؤون وعمالة عامة)',
  },
  {
    en: 'Oil, Gas & Petrochemical Shutdown Manpower (6G Welders & Pipefitters)',
    ar: 'كوادر صيانة النفط والغاز والبتروكيماويات (لحامو 6G وفنيو أنابيب)',
  },
  {
    en: 'Heavy Rigging, Scaffolding & Industrial E&I Technicians',
    ar: 'فنيو الرفع الثقيل والسقالات وكهرباء المصانع والأجهزة الدقيقة',
  },
  {
    en: 'Aramco WPR Permit Receivers, NEBOSH HSE Officers & Camp Logistics',
    ar: 'مستلمو تصاريح العمل WPR وضباط السلامة NEBOSH وإدارة السكن',
  },
] as const;

interface ProcurementRfqSectionProps {
  lang: Language;
  activePortraitSrc: string;
  activeLogoSrc: string;
  activeName: string;
  activeRole: string;
  activeCompany: string;
  activeEmail: string;
  activePhone: string;
  organization: string;
  contactName: string;
  email: string;
  phone: string;
  region: string;
  estimatedBudgetSAR: string;
  selectedScopes: string[];
  notes: string;
  formError: string | null;
  tenderReceipt: SubmittedTenderReceipt | null;
  onSetOrganization: (val: string) => void;
  onSetContactName: (val: string) => void;
  onSetEmail: (val: string) => void;
  onSetPhone: (val: string) => void;
  onSetRegion: (val: string) => void;
  onSetEstimatedBudgetSAR: (val: string) => void;
  onToggleScopeItem: (scopeLabel: string) => void;
  onSetNotes: (val: string) => void;
  onSubmitTender: (e: React.FormEvent) => void;
  onDownloadReceipt: () => void;
  onResetTenderReceipt: () => void;
  onTriggerPortraitUpload: () => void;
}

export const ProcurementRfqSection: React.FC<ProcurementRfqSectionProps> = memo(
  ({
    lang,
    activePortraitSrc,
    activeLogoSrc,
    activeName,
    activeRole,
    activeCompany,
    activeEmail,
    activePhone,
    organization,
    contactName,
    email,
    phone,
    region,
    estimatedBudgetSAR,
    selectedScopes,
    notes,
    formError,
    tenderReceipt,
    onSetOrganization,
    onSetContactName,
    onSetEmail,
    onSetPhone,
    onSetRegion,
    onSetEstimatedBudgetSAR,
    onToggleScopeItem,
    onSetNotes,
    onSubmitTender,
    onDownloadReceipt,
    onResetTenderReceipt,
    onTriggerPortraitUpload,
  }) => {
    return (
      <section
        id="procurement-rfq"
        className="py-12 sm:py-16 lg:py-24 bg-white max-w-[1440px] mx-auto px-4 sm:px-10"
      >
        <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left 5 Columns: Moyna Miah Direct Development Desk Info */}
          <div className="col-span-12 lg:col-span-5 space-y-5 sm:space-y-6">
            <div>
              <p className="text-xs font-mono font-semibold text-[#1E4FD8] mb-2">
                {lang === 'en'
                  ? '05. Direct Manpower Requisition & Contracting Desk'
                  : '05. مكتب طلب القوى العاملة والتعاقد المباشر'}
              </p>
              <h2 className="font-display text-[24px] leading-[32px] sm:text-[38px] sm:leading-[46px] font-bold tracking-[-0.015em] text-[#0A1F44]">
                {lang === 'en'
                  ? 'Connect Directly with Moyna Miah for Saudi Manpower Supply.'
                  : 'تواصل مباشرة مع معين مياه لتوريد القوى العاملة وعقود المقاولات.'}
              </h2>
              <p className="mt-2.5 sm:mt-3 text-xs sm:text-base text-[#44464e] leading-relaxed">
                {lang === 'en'
                  ? 'Submit your manpower requisition, shutdown labor schedule, or general contracting inquiry directly to Moyna Miah (Business Development Manager — MADA AL-GHUROUB GENERAL CONTRACTING COMPANY) for immediate 24-hour commercial quotation and Ajeer workforce mobilization.'
                  : 'قدم طلبات توريد العمالة الماهرة والعامة أو عقود المقاولات مباشرة إلى مكتب معين مياه (مدير تطوير الأعمال والمشاريع — شركة مدى الغروب للمقاولات العامة) للحصول على عرض أسعار فوري وتعبئة الكوادر بنظام أجير.'}
              </p>
            </div>

            <div className="bg-white rounded-[8px] border border-[#8A94A6]/25 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3.5 pb-4 border-b border-[#8A94A6]/20">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    onDoubleClick={onTriggerPortraitUpload}
                    className="w-14 h-18 rounded-[4px] overflow-hidden border border-[#0A1F44] shrink-0 bg-white select-none"
                  >
                    <ResilientImage
                      src={activePortraitSrc}
                      alt="Moyna Miah"
                      fallbackTitle="MM"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-base font-extrabold text-[#0A1F44]">
                      {activeName}
                    </div>
                    <div className="text-xs font-display font-bold text-[#1E4FD8]">
                      {activeRole}
                    </div>
                    <div className="text-[11px] font-display font-bold text-[#0A1F44] mt-0.5 break-words">
                      {activeCompany}
                    </div>
                  </div>
                </div>
                <img
                  src={activeLogoSrc}
                  alt="MADA AL-GHUROUB Logo"
                  className="w-12 h-12 rounded-[4px] object-contain bg-white border border-[#8A94A6]/30 p-1 shrink-0"
                />
              </div>

              {/* Direct Tap-to-Call & Tap-to-Email Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-2">
                <a
                  href={`tel:${activePhone.replace(/\s+/g, '')}`}
                  className="min-h-[42px] px-3 py-2 bg-white hover:bg-[#eff3ff] border border-[#8A94A6]/30 rounded-[4px] flex items-center gap-2 text-xs font-mono font-semibold text-[#0A1F44] transition-colors tabular-nums"
                >
                  <Phone className="w-3.5 h-3.5 text-[#1E4FD8] shrink-0" />
                  <span className="truncate">{activePhone}</span>
                </a>
                <a
                  href={`mailto:${activeEmail}`}
                  className="min-h-[42px] px-3 py-2 bg-white hover:bg-[#eff3ff] border border-[#8A94A6]/30 rounded-[4px] flex items-center gap-2 text-xs font-mono font-semibold text-[#0A1F44] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#1E4FD8] shrink-0" />
                  <span className="truncate">{activeEmail}</span>
                </a>
              </div>

              <h3 className="font-display text-xs font-bold text-[#0A1F44] uppercase tracking-wider pt-2 border-t border-[#8A94A6]/20">
                {lang === 'en'
                  ? 'Regional Operations & Estimating Hubs'
                  : 'مكاتب العمليات والتسعير الإقليمية'}
              </h3>
              <div className="space-y-3 text-xs sm:text-sm text-[#44464e] divide-y divide-[#8A94A6]/15">
                <div className="pt-2 first:pt-0">
                  <div className="font-display font-semibold text-[#0A1F44]">
                    {lang === 'en'
                      ? 'Eastern Province HQ (Dhahran / Jubail)'
                      : 'المقر الرئيسي بالمنطقة الشرقية (الظهران / الجبيل)'}
                  </div>
                  <div className="font-mono text-xs text-[#8A94A6] mt-0.5 tabular-nums">
                    King Salman Industrial Road, Support Industrial Area II · +966 13 884 9200
                  </div>
                </div>
                <div className="pt-3">
                  <div className="font-display font-semibold text-[#0A1F44]">
                    {lang === 'en'
                      ? 'Western & Red Sea Operations (Yanbu / Jeddah)'
                      : 'عمليات القطاع الغربي والبحر الأحمر (ينبع / جدة)'}
                  </div>
                  <div className="font-mono text-xs text-[#8A94A6] mt-0.5 tabular-nums">
                    Royal Commission Heavy Industrial Zone, Port Gate 4 · +966 14 392 4410
                  </div>
                </div>
                <div className="pt-3">
                  <div className="font-display font-semibold text-[#0A1F44]">
                    {lang === 'en'
                      ? 'Central & Northwestern Mega-Projects (Riyadh / Tabuk)'
                      : 'مشاريع المنطقة الوسطى والشمالية الغربية (الرياض / تبوك)'}
                  </div>
                  <div className="font-mono text-xs text-[#8A94A6] mt-0.5 tabular-nums">
                    KAFD Parcel 4.08, Tower B, Floor 14, Riyadh · +966 11 219 7700
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 7 Columns: Validated Architectural RFQ Form or Confirmed Receipt */}
          <div className="col-span-12 lg:col-span-7">
            {tenderReceipt ? (
              <div
                className="bg-white rounded-[8px] border border-[#1E4FD8] border-t-4 border-t-[#00B8D4] p-5 sm:p-8 space-y-6 shadow-[0_8px_24px_-4px_rgba(10,31,68,0.08)]"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#8A94A6]/20 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[4px] bg-[#0A1F44] text-[#00B8D4] flex items-center justify-center shrink-0">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-semibold text-[#007E94]">
                        {lang === 'en'
                          ? 'LOGGED WITH MOYNA MIAH — BUSINESS DEVELOPMENT MANAGER'
                          : 'تم تسجيل الطلب لدى مكتب مدير تطوير الأعمال والمشاريع — معين مياه'}
                      </div>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-[#0A1F44] tabular-nums">
                        {tenderReceipt.referenceId}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#8A94A6] tabular-nums">
                    {tenderReceipt.timestamp}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white border border-[#8A94A6]/25 rounded-[4px] text-xs">
                  <div>
                    <span className="text-[#8A94A6] block">
                      {lang === 'en' ? 'Contracting Entity:' : 'الجهة المتعاقدة:'}
                    </span>
                    <span className="font-display font-bold text-[#0A1F44] text-sm">
                      {tenderReceipt.organization}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8A94A6] block">
                      {lang === 'en' ? 'Authorized Officer:' : 'المسؤول المفوض:'}
                    </span>
                    <span className="font-semibold text-[#0A1F44] text-sm break-all">
                      {tenderReceipt.contactName} ({tenderReceipt.email})
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8A94A6] block">
                      {lang === 'en' ? 'Industrial Corridor & Model:' : 'المنطقة ونوع التعاقد:'}
                    </span>
                    <span className="font-medium text-[#0A1F44]">
                      {tenderReceipt.region} · {tenderReceipt.contractPackageType}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8A94A6] block">
                      {lang === 'en' ? 'CapEx Bracket & Mobilization:' : 'الميزانية وجدول التعبئة:'}
                    </span>
                    <span className="font-mono font-semibold text-[#1E4FD8] tabular-nums">
                      {tenderReceipt.estimatedBudgetSAR} · {tenderReceipt.mobilizationTimeline}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-display font-bold text-[#0A1F44] uppercase mb-2">
                    {lang === 'en' ? 'Registered Scope Packages' : 'نطاقات العمل المسجلة'}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#44464e]">
                    {tenderReceipt.selectedScopes.map((s, i) => (
                      <span key={s}>
                        {i > 0 && <span aria-hidden="true"> · </span>}
                        <span className="font-medium text-[#0A1F44]">{s}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {tenderReceipt.attachedTrades.length > 0 && (
                  <div className="border-t border-[#8A94A6]/20 pt-4">
                    <div className="text-xs font-display font-bold text-[#0A1F44] uppercase mb-2">
                      {lang === 'en'
                        ? 'Attached Technical Workforce Schedule'
                        : 'جدول القوى العاملة الفنية المرفق'}
                    </div>
                    <div className="space-y-1.5 text-xs font-mono text-[#44464e] tabular-nums">
                      {tenderReceipt.attachedTrades.map((t) => (
                        <div
                          key={t.code}
                          className="flex flex-col sm:flex-row sm:justify-between gap-0.5"
                        >
                          <span>
                            [{t.code}] {t.title}
                          </span>
                          <span className="font-semibold text-[#0A1F44]">
                            {t.headcount} personnel @ SAR {t.dailyRateSAR}/day
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-[#8A94A6]/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={onDownloadReceipt}
                    className="min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-display font-bold text-white bg-[#1E4FD8] hover:bg-[#0A1F44] rounded-[4px] transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>
                      {lang === 'en'
                        ? 'Download Official Tender Receipt (.TXT)'
                        : 'تحميل إيصال المناقصة الرسمي (.TXT)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={onResetTenderReceipt}
                    className="min-h-[46px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-display font-semibold text-[#0A1F44] border border-[#0A1F44] hover:bg-[#0A1F44] hover:text-white rounded-[4px] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {lang === 'en' ? 'Submit Another Tender Package' : 'تقديم طلب عرض جديد'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={onSubmitTender}
                noValidate
                className="bg-white rounded-[8px] border border-[#8A94A6]/30 border-t-[3px] border-t-[#1E4FD8] p-5 sm:p-8 space-y-5 sm:space-y-6"
              >
                <div className="border-b border-[#8A94A6]/20 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#0A1F44]">
                    {lang === 'en'
                      ? 'Direct Project Inquiry & Tender Requisition Form'
                      : 'نموذج التواصل المباشر وتقديم المناقصات الهندسية'}
                  </h3>
                  <span className="text-xs font-mono text-[#8A94A6]">ATTN: MOYNA MIAH</span>
                </div>

                {formError && (
                  <div
                    role="alert"
                    className="p-3.5 bg-[#ffdad6]/50 border-l-4 border-[#ba1a1a] rounded-r-[4px] flex items-center gap-2.5 text-xs font-medium text-[#93000a]"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#ba1a1a]" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label
                      htmlFor="rfq-org"
                      className="block text-xs font-semibold uppercase tracking-[0.02em] text-[#0A1F44] mb-1.5"
                    >
                      {lang === 'en'
                        ? 'Contracting Entity / Organization *'
                        : 'اسم الجهة المتعاقدة / الشركة *'}
                    </label>
                    <input
                      id="rfq-org"
                      type="text"
                      required
                      value={organization}
                      onChange={(e) => onSetOrganization(e.target.value)}
                      placeholder={
                        lang === 'en'
                          ? 'e.g., Jubail Petrochemical Co. / Royal Commission'
                          : 'مثال: شركة الجبيل للبتروكيماويات / الهيئة الملكية'
                      }
                      className="min-h-[44px] w-full px-3.5 py-2.5 text-sm bg-white border-[1.5px] border-[#8A94A6]/35 rounded-[4px] text-[#121c2a] focus:outline-none focus:border-[#1E4FD8] focus:ring-1 focus:ring-[#1E4FD8] transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="rfq-contact"
                      className="block text-xs font-semibold uppercase tracking-[0.02em] text-[#0A1F44] mb-1.5"
                    >
                      {lang === 'en'
                        ? 'Authorized Procurement / Project Director *'
                        : 'اسم مدير المشتريات أو المشروع *'}
                    </label>
                    <input
                      id="rfq-contact"
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => onSetContactName(e.target.value)}
                      placeholder={
                        lang === 'en' ? 'Eng. Full Name & Title' : 'الاسم الكامل والمسمى الوظيفي'
                      }
                      className="min-h-[44px] w-full px-3.5 py-2.5 text-sm bg-white border-[1.5px] border-[#8A94A6]/35 rounded-[4px] text-[#121c2a] focus:outline-none focus:border-[#1E4FD8] focus:ring-1 focus:ring-[#1E4FD8] transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="rfq-email"
                      className="block text-xs font-semibold uppercase tracking-[0.02em] text-[#0A1F44] mb-1.5"
                    >
                      {lang === 'en' ? 'Corporate / Official Email *' : 'البريد الإلكتروني الرسمي *'}
                    </label>
                    <input
                      id="rfq-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => onSetEmail(e.target.value)}
                      placeholder="procurement@organization.sa"
                      className="min-h-[44px] w-full px-3.5 py-2.5 text-sm bg-white border-[1.5px] border-[#8A94A6]/35 rounded-[4px] text-[#121c2a] focus:outline-none focus:border-[#1E4FD8] focus:ring-1 focus:ring-[#1E4FD8] transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="rfq-phone"
                      className="block text-xs font-semibold uppercase tracking-[0.02em] text-[#0A1F44] mb-1.5"
                    >
                      {lang === 'en' ? 'Direct Telephone / Mobile *' : 'رقم الهاتف المباشر / الجوال *'}
                    </label>
                    <input
                      id="rfq-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => onSetPhone(e.target.value)}
                      placeholder="+966 50 000 0000"
                      className="min-h-[44px] w-full px-3.5 py-2.5 text-sm bg-white border-[1.5px] border-[#8A94A6]/35 rounded-[4px] text-[#121c2a] focus:outline-none focus:border-[#1E4FD8] focus:ring-1 focus:ring-[#1E4FD8] transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="rfq-region"
                      className="block text-xs font-semibold uppercase tracking-[0.02em] text-[#0A1F44] mb-1.5"
                    >
                      {lang === 'en' ? 'Project Corridor / Region' : 'الممر الصناعي / منطقة المشروع'}
                    </label>
                    <select
                      id="rfq-region"
                      value={region}
                      onChange={(e) => onSetRegion(e.target.value)}
                      className="min-h-[44px] w-full px-3.5 py-2.5 text-sm bg-white border-[1.5px] border-[#8A94A6]/35 rounded-[4px] text-[#121c2a] focus:outline-none focus:border-[#1E4FD8] focus:ring-1 focus:ring-[#1E4FD8] transition-colors"
                    >
                      <option value="Jubail / Eastern Province Corridor">
                        {lang === 'en'
                          ? 'Jubail / Eastern Province Corridor'
                          : 'الجبيل / الممر الصناعي بالمنطقة الشرقية'}
                      </option>
                      <option value="Yanbu / Red Sea Industrial Port">
                        {lang === 'en'
                          ? 'Yanbu / Red Sea Industrial Port'
                          : 'ينبع / الميناء الصناعي بالبحر الأحمر'}
                      </option>
                      <option value="NEOM / Tabuk Northwestern Spine">
                        {lang === 'en'
                          ? 'NEOM / Tabuk Northwestern Spine'
                          : 'نيوم / قطاع تبوك الشمالي الغربي'}
                      </option>
                      <option value="Riyadh Central Infrastructure Corridor">
                        {lang === 'en'
                          ? 'Riyadh Central Infrastructure Corridor'
                          : 'الرياض / ممر البنية التحتية بالمنطقة الوسطى'}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="rfq-budget"
                      className="block text-xs font-semibold uppercase tracking-[0.02em] text-[#0A1F44] mb-1.5"
                    >
                      {lang === 'en'
                        ? 'Estimated Contract Value (SAR)'
                        : 'القيمة التقديرية للعقد (ريال سعودي)'}
                    </label>
                    <select
                      id="rfq-budget"
                      value={estimatedBudgetSAR}
                      onChange={(e) => onSetEstimatedBudgetSAR(e.target.value)}
                      className="min-h-[44px] w-full px-3.5 py-2.5 text-sm bg-white border-[1.5px] border-[#8A94A6]/35 rounded-[4px] text-[#121c2a] focus:outline-none focus:border-[#1E4FD8] focus:ring-1 focus:ring-[#1E4FD8] transition-colors"
                    >
                      <option value="SAR 25M – 100M">SAR 25M – 100M</option>
                      <option value="SAR 100M – 500M">SAR 100M – 500M</option>
                      <option value="SAR 500M – 1.5B">SAR 500M – 1.5B</option>
                      <option value="SAR 1.5B+ Sovereign Package">
                        SAR 1.5B+ Sovereign Package
                      </option>
                    </select>
                  </div>
                </div>

                {/* Rectilinear Checkboxes for Required EPC & Workforce Scopes */}
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-[0.02em] text-[#0A1F44] mb-2">
                    {lang === 'en'
                      ? 'Required Engineering & Workforce Disciplines *'
                      : 'النطاقات الهندسية والتشغيلية المطلوبة *'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SCOPE_OPTIONS.map((item) => {
                      const checked = selectedScopes.includes(item.en);
                      return (
                        <div
                          key={item.en}
                          onClick={() => onToggleScopeItem(item.en)}
                          className={`min-h-[44px] flex items-center gap-3 p-3 rounded-[4px] border cursor-pointer transition-colors ${
                            checked
                              ? 'bg-[#eff3ff] border-[#1E4FD8]'
                              : 'bg-white border-[#8A94A6]/30 hover:border-[#0A1F44]'
                          }`}
                        >
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={checked}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleScopeItem(item.en);
                            }}
                            className={`w-4 h-4 rounded-[2px] flex items-center justify-center border shrink-0 transition-colors ${
                              checked
                                ? 'bg-[#1E4FD8] border-[#1E4FD8] text-white'
                                : 'bg-white border-[#8A94A6]'
                            }`}
                          >
                            {checked && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                          <span className="text-xs font-medium text-[#0A1F44]">{item[lang]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="rfq-notes"
                    className="block text-xs font-semibold uppercase tracking-[0.02em] text-[#0A1F44] mb-1.5"
                  >
                    {lang === 'en'
                      ? 'Technical Scope Summary / BOQ Reference & Mobilization Window'
                      : 'ملخص النطاق الفني / مرجع جدول الكميات والجدول الزمني للتعبئة'}
                  </label>
                  <textarea
                    id="rfq-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => onSetNotes(e.target.value)}
                    placeholder={
                      lang === 'en'
                        ? 'Specify tender package code, target mobilization date, concrete/piping tonnage, or special Aramco WPR manpower requirements...'
                        : 'حدد رقم كراسة الشروط، تاريخ التعبئة المستهدف، كميات الخرسانة أو الأنابيب، أو متطلبات الكوادر المعتمدة...'
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-white border-[1.5px] border-[#8A94A6]/35 rounded-[4px] text-[#121c2a] focus:outline-none focus:border-[#1E4FD8] focus:ring-1 focus:ring-[#1E4FD8] transition-colors"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-xs text-[#8A94A6]">
                    {lang === 'en'
                      ? 'Direct dispatch to Moyna Miah (Business Development Manager) under Mutual NDA.'
                      : 'إرسال مباشر إلى مكتب مدير تطوير الأعمال والمشاريع (معين مياه) بموجب اتفاقية عدم الإفصاح.'}
                  </span>
                  <button
                    type="submit"
                    className="min-h-[48px] w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm font-display font-bold text-white bg-[#F39C12] hover:bg-[#d9880b] rounded-[4px] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {lang === 'en'
                      ? 'Transmit Official Tender RFQ'
                      : 'إرسال طلب العرض الفني والتجاري'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    );
  }
);

ProcurementRfqSection.displayName = 'ProcurementRfqSection';
