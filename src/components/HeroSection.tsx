import React, { memo } from 'react';
import {
  ArrowRight,
  Building2,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import { ASSETS, Language } from '../data/industrialData';
import { ResilientImage } from './ResilientImage';
import { CertificationTooltip } from './CertificationTooltip';

interface HeroSectionProps {
  lang: Language;
  isRTL: boolean;
  activePortraitSrc: string;
  activeLogoSrc: string;
  activeName: string;
  activeRole: string;
  activeCompany: string;
  activeRegion: string;
  activeBio: string;
  activeEmail: string;
  activePhone: string;
  aramcoVendorId: string;
  iktvaScore: string;
  onTriggerPortraitUpload: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = memo(
  ({
    lang,
    isRTL,
    activePortraitSrc,
    activeLogoSrc,
    activeName,
    activeRole,
    activeCompany,
    activeRegion,
    activeBio,
    activeEmail,
    activePhone,
    aramcoVendorId,
    iktvaScore,
    onTriggerPortraitUpload,
  }) => {
    return (
      <section className="relative bg-[#0A1F44] text-white overflow-hidden border-b border-[#8A94A6]/25">
        {/* Background 16:9 Engineering Corridor Image with Measured Scrim */}
        <div className="absolute inset-0">
          <ResilientImage
            src={ASSETS.hero}
            alt="Saudi Arabian civil infrastructure and petrochemical corridor at golden hour"
            fallbackTitle="MADA AL-GHUROUB Industrial Corridor"
            loading="eager"
            fetchPriority="high"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1F44] via-[#0A1F44]/90 to-[#0A1F44]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44] via-transparent to-[#0A1F44]/65" />
        </div>

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-10 pt-8 pb-12 sm:pt-14 sm:pb-18 lg:pt-16 lg:pb-22">
          <div className="grid grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Portrait Card First on Mobile (`order-1 lg:order-2`) for Immediate Personal Portfolio Impact */}
            <div className="col-span-12 lg:col-span-4 order-1 lg:order-2">
              <div className="bg-white text-[#121c2a] border border-white/25 border-t-4 border-t-[#00B8D4] rounded-[8px] overflow-hidden shadow-[0_24px_54px_-10px_rgba(10,31,68,0.55)]">
                <div className="p-4 sm:p-6 flex flex-row lg:flex-col items-center gap-4 sm:gap-5 bg-gradient-to-b from-[#F4F6F9] to-white border-b border-[#8A94A6]/25">
                  {/* Framed Passport-Style Executive Portrait */}
                  <div
                    onDoubleClick={onTriggerPortraitUpload}
                    className="relative w-28 h-36 sm:w-36 sm:h-44 lg:w-42 lg:h-52 bg-white p-1.5 border-2 border-[#0A1F44] ring-2 ring-[#00B8D4]/40 rounded-[6px] shadow-md shrink-0 overflow-hidden select-none"
                  >
                    <ResilientImage
                      src={activePortraitSrc}
                      alt="Moyna Miah — Business Development Manager"
                      fallbackTitle="Moyna Miah"
                      loading="eager"
                      fetchPriority="high"
                      className="w-full h-full object-cover object-top rounded-[2px]"
                    />
                  </div>

                  {/* Executive Name, Title & Company with Company Logo */}
                  <div className="flex-1 min-w-0 text-left lg:text-center space-y-1.5 sm:space-y-2">
                    <div className="text-[11px] sm:text-xs font-mono font-semibold text-[#007E94]">
                      {lang === 'en' ? 'Verified Executive Profile' : 'بطاقة القيادة التنفيذية الموثقة'}
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0A1F44] leading-tight">
                      {activeName}
                    </h2>
                    <p className="font-display text-xs sm:text-sm font-bold text-[#1E4FD8] leading-snug">
                      {activeRole}
                    </p>

                    {/* Company Logo & Name Banner */}
                    <div className="pt-1.5 flex flex-col lg:items-center gap-2">
                      <div className="inline-flex items-center gap-2.5 p-2 bg-[#F4F6F9] border border-[#8A94A6]/35 rounded-[4px] shadow-xs max-w-full">
                        <img
                          src={activeLogoSrc}
                          alt="MADA AL-GHUROUB Logo"
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-[4px] object-contain bg-white border border-[#0A1F44]/15 p-0.5 shrink-0"
                        />
                        <p className="text-[11px] sm:text-xs font-display font-bold text-[#0A1F44] leading-snug text-left break-words">
                          {activeCompany}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Executive Metrics inside Portrait Card */}
                <div className="p-4 sm:p-5 bg-white space-y-2 text-xs">
                  <div className="flex items-baseline justify-between gap-2 py-1 border-b border-[#8A94A6]/20">
                    <span className="text-[#44464e] shrink-0">
                      {lang === 'en' ? 'Designation' : 'المسمى الوظيفي'}
                    </span>
                    <span className="font-mono font-semibold text-[#0A1F44] text-right">
                      {activeRole}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 py-1 border-b border-[#8A94A6]/20">
                    <span className="text-[#44464e] shrink-0">
                      {lang === 'en' ? 'Aramco Vendor ID' : 'رقم المورد لدى أرامكو'}
                    </span>
                    <span className="font-mono font-semibold text-[#0A1F44] tabular-nums">
                      {aramcoVendorId}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 py-1 border-b border-[#8A94A6]/20">
                    <CertificationTooltip
                      title={
                        lang === 'en'
                          ? 'In-Kingdom Total Value Add (IKTVA)'
                          : 'برنامج القيمة المضافة الإجمالية (اكتفاء)'
                      }
                      code="IKTVA 74.2%"
                      accentColor="#1E4FD8"
                      position="top"
                      align="end"
                      definition={
                        lang === 'en'
                          ? 'Saudi Aramco supply-chain localization certification measuring domestic manufacturing, local vendor procurement, and Saudi workforce training & Saudization.'
                          : 'برنامج أرامكو السعودية لتوطين سلاسل الإمداد، ويقيس نسبة التصنيع المحلي والمشتريات الوطنية وتدريب وتوظيف الكوادر الهندسية السعودية.'
                      }
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#1E4FD8] shrink-0" />
                      <span className="text-[#44464e] underline decoration-dotted underline-offset-4 decoration-[#8A94A6]">
                        {lang === 'en' ? 'IKTVA Local Content' : 'نسبة المحتوى المحلي (اكتفاء)'}
                      </span>
                    </CertificationTooltip>
                    <span className="font-mono font-semibold text-[#007E94] tabular-nums">
                      {iktvaScore}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 py-1">
                    <span className="text-[#44464e] shrink-0">
                      {lang === 'en' ? 'Mobilization Authority' : 'صلاحية التعبئة الفورية'}
                    </span>
                    <span className="font-mono font-semibold text-[#A36605] tabular-nums">
                      72-Hour Turnkey Dispatch
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Left 8 Columns on Desktop (`order-2 lg:order-1`): Executive Identity & Value Proposition */}
            <div className="col-span-12 lg:col-span-8 order-2 lg:order-1 space-y-5 sm:space-y-6">
              {/* Unboxed Regional & B2B Trust Markers (Zero-Pill Discipline) */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] sm:text-xs font-mono text-[#00B8D4] tracking-wide">
                <span className="font-semibold text-white">
                  {lang === 'en'
                    ? 'MOYNA MIAH · BUSINESS DEVELOPMENT MANAGER'
                    : 'معين مياه · مدير تطوير الأعمال والمشاريع'}
                </span>
                <span aria-hidden="true" className="text-white/40">
                  ·
                </span>
                <span className="font-semibold text-[#F39C12]">
                  {lang === 'en'
                    ? 'MADA AL-GHUROUB GENERAL CONTRACTING COMPANY'
                    : 'شركة مدى الغروب للمقاولات العامة'}
                </span>
                <span aria-hidden="true" className="text-white/40">
                  ·
                </span>
                <CertificationTooltip
                  title={
                    lang === 'en'
                      ? 'ISO 9001:2015 & ISO 45001:2018'
                      : 'معايير الجودة والسلامة ISO 9001 & 45001'
                  }
                  code="ISO-QMS/OHS"
                  accentColor="#00B8D4"
                  position="bottom"
                  align="start"
                  definition={
                    lang === 'en'
                      ? 'International standards governing Quality Management Systems (ISO 9001) for EPC fabrication traceability and Occupational Health & Safety (ISO 45001) for zero-LTI industrial site operations.'
                      : 'المعايير الدولية الحاكمة لأنظمة إدارة الجودة الهندسية (ISO 9001) وأنظمة الصحة والسلامة المهنية (ISO 45001) لضمان مواقع عمل خالية من الإصابات.'
                  }
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00B8D4] shrink-0" />
                  <span className="underline decoration-dotted underline-offset-4 decoration-[#00B8D4]/70">
                    {lang === 'en'
                      ? 'ISO 9001:2015 & ISO 45001 Certified'
                      : 'شهادات الجودة والسلامة ISO 9001 & 45001'}
                  </span>
                </CertificationTooltip>
              </div>

              {/* Display Hero Headline */}
              <div className="space-y-2">
                <h1 className="font-display text-[26px] leading-[34px] sm:text-[42px] sm:leading-[50px] lg:text-[46px] lg:leading-[54px] font-extrabold tracking-[-0.02em] text-white max-w-4xl break-words">
                  {activeName} — {activeRole}
                </h1>
                <div className="font-display text-sm sm:text-xl font-bold text-[#F39C12] tracking-wide">
                  {activeCompany}
                </div>
              </div>

              {/* Concrete Value Proposition */}
              <p className="text-sm sm:text-lg text-white/85 max-w-2xl leading-relaxed font-normal">
                {activeBio}
              </p>

              {/* Direct Contact Metadata Line (Unboxed Zero-Pill Discipline) */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs sm:text-sm text-white/85 font-mono">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#00B8D4] shrink-0" />
                  <span>{activeRegion}</span>
                </span>
                <span aria-hidden="true" className="hidden sm:inline text-white/30">
                  ·
                </span>
                <a
                  href={`mailto:${activeEmail}`}
                  className="inline-flex items-center gap-1.5 hover:text-[#00B8D4] transition-colors break-all"
                >
                  <Mail className="w-4 h-4 text-[#00B8D4] shrink-0" />
                  <span>{activeEmail}</span>
                </a>
                <span aria-hidden="true" className="hidden sm:inline text-white/30">
                  ·
                </span>
                <a
                  href={`tel:${activePhone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1.5 hover:text-[#00B8D4] transition-colors tabular-nums"
                >
                  <Phone className="w-4 h-4 text-[#00B8D4] shrink-0" />
                  <span>{activePhone}</span>
                </a>
              </div>

              {/* Primary CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <a
                  href="#procurement-rfq"
                  className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-display font-bold text-white bg-[#1E4FD8] hover:bg-[#163eb5] rounded-[4px] transition-colors whitespace-nowrap"
                >
                  <span>
                    {lang === 'en'
                      ? 'Initiate Project & Tender Inquiry'
                      : 'بدء استفسار المناقصة والتعاقد'}
                  </span>
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </a>
              </div>
            </div>
          </div>

          {/* QUANTIFIED SECTOR DATA MODULES & MANPOWER COUNTERS */}
          <div className="mt-10 sm:mt-14 pt-8 sm:pt-10 border-t border-white/15 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-white/[0.04] border border-white/10 rounded-[8px] p-4 sm:p-5">
              <div className="font-display text-2xl sm:text-[40px] xl:text-[48px] sm:leading-[52px] font-extrabold tracking-[-0.02em] text-white tabular-nums">
                18,420+
              </div>
              <div className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs font-medium text-[#8A94A6] leading-snug">
                {lang === 'en'
                  ? 'Active Ajeer-Ready Skilled & General Manpower'
                  : 'إجمالي القوى العاملة الماهرة والعامة الجاهزة بنظام أجير'}
              </div>
              <div className="mt-3 sm:mt-4 h-[2px] w-full bg-white/10 overflow-hidden">
                <div className="h-full w-[94%] bg-[#00B8D4]" />
              </div>
            </div>

            <div className="bg-white/[0.04] border border-white/10 rounded-[8px] p-4 sm:p-5">
              <div className="font-display text-2xl sm:text-[40px] xl:text-[48px] sm:leading-[52px] font-extrabold tracking-[-0.02em] text-white tabular-nums">
                72 Hrs
              </div>
              <div className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs font-medium text-[#8A94A6] leading-snug">
                {lang === 'en'
                  ? 'Rapid Workforce Mobilization Across Saudi Arabia'
                  : 'سرعة تعبئة ونشر الكوادر في كافة مناطق المملكة'}
              </div>
              <div className="mt-3 sm:mt-4 h-[2px] w-full bg-white/10 overflow-hidden">
                <div className="h-full w-[92%] bg-[#00B8D4]" />
              </div>
            </div>

            <div className="bg-white/[0.04] border border-white/10 rounded-[8px] p-4 sm:p-5">
              <div className="font-display text-2xl sm:text-[40px] xl:text-[48px] sm:leading-[52px] font-extrabold tracking-[-0.02em] text-white tabular-nums">
                42.6M
              </div>
              <div className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs font-medium text-[#8A94A6] leading-snug">
                {lang === 'en'
                  ? 'Consecutive LTI-Free Safe Man-Hours Supplied'
                  : 'ساعات عمل بشرية آمنة متتالية بدون إصابات'}
              </div>
              <div className="mt-3 sm:mt-4 h-[2px] w-full bg-white/10 overflow-hidden">
                <div className="h-full w-full bg-[#00B8D4]" />
              </div>
            </div>

            <div className="bg-white/[0.04] border border-white/10 rounded-[8px] p-4 sm:p-5">
              <div className="font-display text-2xl sm:text-[40px] xl:text-[48px] sm:leading-[52px] font-extrabold tracking-[-0.02em] text-white tabular-nums">
                100%
              </div>
              <div className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs font-medium text-[#8A94A6] leading-snug">
                {lang === 'en'
                  ? 'Ajeer, GOSI, Iqama & WPS Payroll Compliance'
                  : 'الامتثال الكامل لنظام أجير والتأمينات وحماية الأجور'}
              </div>
              <div className="mt-3 sm:mt-4 h-[2px] w-full bg-white/10 overflow-hidden">
                <div className="h-full w-full bg-[#00B8D4]" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

HeroSection.displayName = 'HeroSection';
