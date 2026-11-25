import React, { useState, memo } from 'react';
import {
  Truck,
  ShieldCheck,
  Wrench,
  Clock,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Gauge,
} from 'lucide-react';
import {
  EQUIPMENT_RENTAL_FLEET,
  EquipmentRentalItem,
  Language,
} from '../data/industrialData';
import { ResilientImage } from './ResilientImage';

interface EquipmentRentalSectionProps {
  lang: Language;
  isRTL: boolean;
  onRequestEquipmentQuote: (item: EquipmentRentalItem, rentalDuration: 'daily' | 'monthly') => void;
}

type CategoryFilter = 'all' | 'lifting' | 'earthmoving' | 'power';

export const EquipmentRentalSection: React.FC<EquipmentRentalSectionProps> = memo(
  ({ lang, isRTL, onRequestEquipmentQuote }) => {
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
    const [rateMode, setRateMode] = useState<'daily' | 'monthly'>('monthly');

    const filteredEquipment =
      categoryFilter === 'all'
        ? EQUIPMENT_RENTAL_FLEET
        : EQUIPMENT_RENTAL_FLEET.filter((item) => item.category === categoryFilter);

    return (
      <section
        id="equipment-rental"
        className="py-12 sm:py-16 lg:py-24 bg-white border-t border-[#8A94A6]/25 cv-auto"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-10">
          {/* Dedicated Page Header & Rental Proposition */}
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5 mb-8 sm:mb-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#1E4FD8] mb-2">
                <Truck className="w-4 h-4 text-[#00B8D4] shrink-0" />
                <span>
                  {lang === 'en'
                    ? '04. Heavy Equipment & Industrial Machinery Rental Division'
                    : '04. قسم تأجير المعدات الثقيلة والآليات الصناعية المعتمدة'}
                </span>
              </div>
              <h2 className="font-display text-[24px] leading-[32px] sm:text-[38px] sm:leading-[46px] font-bold tracking-[-0.015em] text-[#0A1F44]">
                {lang === 'en'
                  ? 'Certified Heavy Equipment & Machinery Available for Daily, Weekly & Monthly Rental.'
                  : 'تأجير المعدات الثقيلة والرافعات والآليات الصناعية بعقود يومية وأسبوعية وشهرية.'}
              </h2>
              <p className="text-xs sm:text-sm text-[#44464e] mt-3 leading-relaxed">
                {lang === 'en'
                  ? 'MADA AL-GHUROUB GENERAL CONTRACTING COMPANY provides turnkey heavy equipment rental across Saudi Arabia (Jubail, Dhahran, Dammam, Yanbu, Riyadh & NEOM). All machinery is supplied with valid Aramco third-party inspection stickers (TUV), certified operators, and 24/7 field maintenance support.'
                  : 'توفر شركة مدى الغروب للمقاولات العامة خدمات تأجير المعدات الثقيلة والآليات الصناعية في كافة أنحاء المملكة (الجبيل، الظهران، الدمام، ينبع، الرياض ونيوم)، شاملة شهادات الفحص المعتمدة من أرامكو (TUV) والمشغلين المرخصين والصيانة الميدانية 24/7.'}
              </p>
            </div>

            {/* Interactive Controls: Category Filter + Daily/Monthly Rate Switch */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <div
                className="grid grid-cols-2 sm:flex items-center gap-1 p-1 bg-white border border-[#8A94A6]/35 rounded-[6px] shadow-2xs"
                role="tablist"
                aria-label={lang === 'en' ? 'Filter equipment category' : 'تصفية فئة المعدات'}
              >
                {(
                  [
                    { key: 'all', en: 'All Fleet (735+)', ar: 'كل الأسطول (735+)' },
                    { key: 'lifting', en: 'Cranes & Lifting', ar: 'الرافعات والرفع' },
                    { key: 'earthmoving', en: 'Earthmoving', ar: 'معدات الحفر' },
                    { key: 'power', en: 'Power & Welding', ar: 'المولدات واللحام' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={categoryFilter === tab.key}
                    onClick={() => setCategoryFilter(tab.key)}
                    className={`min-h-[36px] px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-display font-semibold rounded-[4px] transition-colors cursor-pointer whitespace-nowrap ${
                      categoryFilter === tab.key
                        ? 'bg-[#0A1F44] text-white'
                        : 'text-[#44464e] hover:text-[#0A1F44] hover:bg-[#F4F6F9]'
                    }`}
                  >
                    {tab[lang]}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 p-1 bg-white border border-[#8A94A6]/35 rounded-[6px] shadow-2xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setRateMode('daily')}
                  className={`min-h-[36px] px-3 py-1 text-[11px] font-mono font-bold rounded-[4px] transition-colors cursor-pointer whitespace-nowrap ${
                    rateMode === 'daily'
                      ? 'bg-[#1E4FD8] text-white'
                      : 'text-[#44464e] hover:text-[#0A1F44]'
                  }`}
                >
                  {lang === 'en' ? 'Daily Rate' : 'إيجار يومي'}
                </button>
                <button
                  type="button"
                  onClick={() => setRateMode('monthly')}
                  className={`min-h-[36px] px-3 py-1 text-[11px] font-mono font-bold rounded-[4px] transition-colors cursor-pointer whitespace-nowrap ${
                    rateMode === 'monthly'
                      ? 'bg-[#1E4FD8] text-white'
                      : 'text-[#44464e] hover:text-[#0A1F44]'
                  }`}
                >
                  {lang === 'en' ? 'Monthly Rate' : 'إيجار شهري'}
                </button>
              </div>
            </div>
          </div>

          {/* 4 Quantified Rental Fleet Highlights Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8 sm:mb-10">
            <div className="bg-white rounded-[8px] border border-[#8A94A6]/25 p-4 sm:p-5 border-t-4 border-t-[#1E4FD8] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#44464e] font-semibold mb-1.5">
                <span>{lang === 'en' ? 'Total Rental Machinery Fleet' : 'إجمالي أسطول المعدات للإيجار'}</span>
                <Truck className="w-4 h-4 text-[#1E4FD8] shrink-0" />
              </div>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A1F44] tabular-nums">
                735+ Units
              </div>
              <div className="text-[11px] font-mono text-[#007E94] font-semibold mt-1">
                {lang === 'en'
                  ? 'Cranes · Excavators · Generators · Loaders'
                  : 'رافعات · حفارات · شيولات · مولدات كهرباء'}
              </div>
            </div>

            <div className="bg-white rounded-[8px] border border-[#8A94A6]/25 p-4 sm:p-5 border-t-4 border-t-[#00B8D4] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#44464e] font-semibold mb-1.5">
                <span>{lang === 'en' ? 'Aramco & Third-Party Certified' : 'فحص أرامكو والطرف الثالث TUV'}</span>
                <ShieldCheck className="w-4 h-4 text-[#00B8D4] shrink-0" />
              </div>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A1F44] tabular-nums">
                100% Vetted
              </div>
              <div className="text-[11px] font-mono text-[#007E94] font-semibold mt-1">
                {lang === 'en'
                  ? 'Valid TUV Sticker · PWAS · Spark Arrestors'
                  : 'ملصق فحص ساري · نظام PWAS · مانع شرر'}
              </div>
            </div>

            <div className="bg-white rounded-[8px] border border-[#8A94A6]/25 p-4 sm:p-5 border-t-4 border-t-[#F39C12] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#44464e] font-semibold mb-1.5">
                <span>{lang === 'en' ? 'Site Delivery & Lowbed Dispatch' : 'سرعة التوريد للموقع عبر اللوبد'}</span>
                <Clock className="w-4 h-4 text-[#F39C12] shrink-0" />
              </div>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A1F44] tabular-nums">
                24–48 Hours
              </div>
              <div className="text-[11px] font-mono text-[#1E4FD8] font-semibold mt-1">
                {lang === 'en'
                  ? 'With Aramco-Badged Certified Operators'
                  : 'شامل مشغلين وسائقين معتمدين بتصاريح سارية'}
              </div>
            </div>

            <div className="bg-white rounded-[8px] border border-[#8A94A6]/25 p-4 sm:p-5 border-t-4 border-t-[#0A1F44] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#44464e] font-semibold mb-1.5">
                <span>{lang === 'en' ? 'Field Maintenance & Backup SLA' : 'الصيانة الميدانية والمعدة البديلة'}</span>
                <Wrench className="w-4 h-4 text-[#0A1F44] shrink-0" />
              </div>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A1F44] tabular-nums">
                24/7 Service
              </div>
              <div className="text-[11px] font-mono text-[#44464e] font-semibold mt-1">
                {lang === 'en'
                  ? 'Mobile Workshop · Immediate Replacement'
                  : 'ورش صيانة متنقلة · استبدال فوري عند الأعطال'}
              </div>
            </div>
          </div>

          {/* 3 Natural Documentary Equipment Rental Showcase Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredEquipment.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-[8px] border border-[#8A94A6]/30 overflow-hidden flex flex-col justify-between shadow-xs hover:border-[#1E4FD8]/60 transition-all duration-200"
                style={{ borderTopWidth: '4px', borderTopColor: item.accentColor }}
              >
                <div>
                  {/* 4:3 High-Resolution Documentary Equipment Photograph */}
                  <div className="relative aspect-[4/3] w-full bg-[#0A1F44] overflow-hidden border-b border-[#8A94A6]/20">
                    <ResilientImage
                      src={item.image}
                      alt={item.title[lang]}
                      fallbackTitle={item.title[lang]}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44]/85 via-[#0A1F44]/20 to-transparent" />

                    {/* Top Status & Fleet Code */}
                    <div className="absolute top-3 inset-x-4 flex items-center justify-between gap-2 text-xs font-mono">
                      <span className="bg-[#0A1F44]/90 text-white px-2.5 py-1 rounded-[4px] border border-white/15 font-semibold">
                        {item.code}
                      </span>
                      <span className="bg-[#F39C12] text-[#0A1F44] px-2.5 py-1 rounded-[4px] font-bold tabular-nums">
                        {item.fleetSize}
                      </span>
                    </div>

                    {/* Bottom Location & Certification Overlay */}
                    <div className="absolute bottom-3 inset-x-4 flex flex-wrap items-center justify-between gap-2 text-xs text-white">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-white/95 bg-[#0A1F44]/80 px-2.5 py-0.5 rounded-[3px] border border-white/15">
                        <MapPin className="w-3 h-3 text-[#00B8D4] shrink-0" />
                        <span className="truncate">{item.location[lang]}</span>
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-[#00B8D4] bg-[#0A1F44]/85 px-2.5 py-0.5 rounded-[3px] border border-white/15">
                        {item.certificationBadge}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 sm:p-6">
                    <div className="text-[11px] font-mono font-semibold text-[#1E4FD8] mb-1.5">
                      {item.subtitle[lang]}
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-[#0A1F44] leading-snug mb-2.5">
                      {item.title[lang]}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#44464e] leading-relaxed mb-5">
                      {item.description[lang]}
                    </p>

                    {/* Rental Rate Callout Bar */}
                    <div className="bg-[#F4F6F9] border border-[#8A94A6]/25 rounded-[6px] p-3.5 mb-5 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#44464e]">
                          {rateMode === 'daily'
                            ? lang === 'en'
                              ? 'Standard Daily Rental Rate'
                              : 'سعر الإيجار اليومي القياسي'
                            : lang === 'en'
                            ? 'Contract Monthly Rental Rate'
                            : 'سعر الإيجار الشهري للعقود'}
                        </div>
                        <div className="font-display text-base sm:text-lg font-extrabold text-[#0A1F44] tabular-nums mt-0.5">
                          {rateMode === 'daily' ? item.dailyRateRangeSAR : item.monthlyRateRangeSAR}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#007E94] bg-white px-2.5 py-1 rounded-[4px] border border-[#8A94A6]/25 shrink-0">
                        <Gauge className="w-3.5 h-3.5 text-[#1E4FD8]" />
                        {lang === 'en' ? 'With Operator' : 'مع المشغل'}
                      </span>
                    </div>

                    {/* Technical Specifications Grid */}
                    <div className="space-y-2 border-t border-[#8A94A6]/20 pt-4 mb-5">
                      {item.specs.map((spec, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-start justify-between gap-3 text-xs leading-snug"
                        >
                          <span className="text-[#44464e] font-medium shrink-0">
                            {spec.label[lang]}:
                          </span>
                          <span className="font-mono font-semibold text-[#0A1F44] text-end">
                            {spec.value[lang]}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Available Equipment Models Checklist */}
                    <div className="border-t border-[#8A94A6]/20 pt-4">
                      <div className="text-[11px] font-mono font-bold text-[#0A1F44] mb-2.5">
                        {lang === 'en'
                          ? 'Available Models Ready for Dispatch:'
                          : 'الموديلات المتوفرة والجاهزة للتوريد الفوري:'}
                      </div>
                      <ul className="space-y-2">
                        {item.equipmentModels[lang].map((modelText, mIdx) => (
                          <li
                            key={mIdx}
                            className="flex items-start gap-2 text-xs text-[#121c2a] leading-relaxed"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#007E94] shrink-0 mt-0.5" />
                            <span>{modelText}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Card Footer CTA: Book / Request Rental Quote */}
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-2">
                  <button
                    type="button"
                    onClick={() => onRequestEquipmentQuote(item, rateMode)}
                    className="w-full min-h-[44px] px-4 py-2.5 bg-[#0A1F44] hover:bg-[#1E4FD8] text-white font-display font-bold text-xs sm:text-sm rounded-[4px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>
                      {lang === 'en'
                        ? 'Request Equipment Rental Quote'
                        : 'طلب عرض سعر لتأجير المعدات'}
                    </span>
                    <ArrowRight
                      className={`w-4 h-4 text-[#00B8D4] ${isRTL ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }
);

EquipmentRentalSection.displayName = 'EquipmentRentalSection';
