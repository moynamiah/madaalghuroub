import React, { useState, useRef, memo } from 'react';
import {
  Check,
  SlidersHorizontal,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ASSETS, Language, WorkforceTradeRow } from '../data/industrialData';
import { ResilientImage } from './ResilientImage';

export type DisciplineFilterType = 'all' | 'civil' | 'mechanical' | 'electrical' | 'heavylift';

export interface SelectedWorkforceMap {
  [tradeId: string]: number;
}

export interface WorkforceSummaryData {
  totalHeadcount: number;
  dailyTotalSAR: number;
  monthlyEstimateSAR: number;
  items: { code: string; title: string; headcount: number; dailyRateSAR: number }[];
}

interface WorkforceMatrixSectionProps {
  lang: Language;
  isRTL: boolean;
  disciplineFilter: DisciplineFilterType;
  filteredWorkforce: WorkforceTradeRow[];
  selectedTrades: SelectedWorkforceMap;
  workforceSummary: WorkforceSummaryData;
  onSetDisciplineFilter: (filter: DisciplineFilterType) => void;
  onToggleTradeSelection: (tradeId: string, defaultCount?: number) => void;
  onUpdateTradeHeadcount: (tradeId: string, count: number) => void;
  onAttachWorkforceToRFQ: () => void;
}

const DISCIPLINE_TABS = [
  { key: 'all', en: 'All Trades (3,060)', ar: 'الكل (3,060)' },
  { key: 'mechanical', en: 'Mechanical & 6G', ar: 'ميكانيكا ولحام 6G' },
  { key: 'civil', en: 'Civil & WPR', ar: 'مدني وتصاريح عمل' },
  { key: 'electrical', en: 'E&I Control', ar: 'كهرباء وتحكم' },
  { key: 'heavylift', en: 'Heavy Rigging', ar: 'رفع ثقيل' },
] as const;

export const WorkforceMatrixSection: React.FC<WorkforceMatrixSectionProps> = memo(
  ({
    lang,
    isRTL,
    disciplineFilter,
    filteredWorkforce,
    selectedTrades,
    workforceSummary,
    onSetDisciplineFilter,
    onToggleTradeSelection,
    onUpdateTradeHeadcount,
    onAttachWorkforceToRFQ,
  }) => {
    const disciplineSliderRef = useRef<HTMLDivElement | null>(null);
    const [isDraggingSlider, setIsDraggingSlider] = useState(false);
    const [sliderStartX, setSliderStartX] = useState(0);
    const [sliderScrollLeft, setSliderScrollLeft] = useState(0);

    const slideDisciplineBar = (direction: 'left' | 'right') => {
      const el = disciplineSliderRef.current;
      if (!el) return;
      const offset = direction === 'left' ? -220 : 220;
      el.scrollBy({ left: isRTL ? -offset : offset, behavior: 'smooth' });
    };

    const handleSliderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      const el = disciplineSliderRef.current;
      if (!el) return;
      setIsDraggingSlider(true);
      setSliderStartX(e.pageX - el.offsetLeft);
      setSliderScrollLeft(el.scrollLeft);
    };

    const handleSliderMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDraggingSlider) return;
      const el = disciplineSliderRef.current;
      if (!el) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - sliderStartX) * 1.5;
      el.scrollLeft = sliderScrollLeft - walk;
    };

    const handleSliderMouseUp = () => {
      setIsDraggingSlider(false);
    };

    return (
      <section
        id="workforce-matrix"
        className="py-12 sm:py-16 lg:py-24 bg-white max-w-[1440px] mx-auto px-4 sm:px-10"
      >
        <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left 4 Columns: Workforce Command Briefing & Requisition Calculator */}
          <div className="col-span-12 lg:col-span-4 space-y-5 sm:space-y-6">
            <div>
              <p className="text-xs font-mono font-semibold text-[#1E4FD8] mb-2">
                {lang === 'en'
                  ? '03. Technical Workforce Logistics & Rates'
                  : '03. لوجستيات القوى العاملة الفنية المتخصصة'}
              </p>
              <h2 className="font-display text-[24px] leading-[32px] sm:text-[28px] sm:leading-[36px] font-bold tracking-[-0.01em] text-[#0A1F44]">
                {lang === 'en'
                  ? 'Aramco & SABIC Vetted Trades Ready for 72-Hour Mobilization.'
                  : 'كوادر فنية معتمدة لدى أرامكو وسابك جاهزة للتعبئة خلال 72 ساعة.'}
              </h2>
              <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-[#44464e] leading-relaxed">
                {lang === 'en'
                  ? 'Select required technical classifications from the allocation matrix to compute daily deployment rates and attach a verified manpower schedule directly to Moyna Miah’s tender desk.'
                  : 'حدد التخصصات الفنية المطلوبة من المصفوفة لحساب تكلفة التعبئة اليومية وإرفاق جدول الكوادر مباشرة بمكتب مدير التطوير.'}
              </p>
            </div>

            {/* Live Requisition Calculator Card */}
            <div className="bg-white rounded-[8px] border border-[#8A94A6]/30 border-t-4 border-t-[#F39C12] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#8A94A6]/20 pb-3">
                <h3 className="font-display text-sm font-bold text-[#0A1F44]">
                  {lang === 'en'
                    ? 'Active Manpower Requisition Schedule'
                    : 'ملخص جدول طلب القوى العاملة الفنية'}
                </h3>
                <span className="font-mono text-xs font-semibold text-[#1E4FD8] tabular-nums">
                  {workforceSummary.items.length}{' '}
                  {lang === 'en' ? 'Trades Selected' : 'تخصصات مختارة'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2">
                <div>
                  <div className="text-xs text-[#8A94A6]">
                    {lang === 'en' ? 'Total Requested Force' : 'إجمالي الكوادر المطلوبة'}
                  </div>
                  <div className="font-display text-xl sm:text-2xl font-extrabold text-[#0A1F44] tabular-nums">
                    {workforceSummary.totalHeadcount}{' '}
                    <span className="text-xs font-normal text-[#44464e]">
                      {lang === 'en' ? 'Personnel' : 'كادر'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#8A94A6]">
                    {lang === 'en' ? 'Est. Monthly Burn (26d)' : 'التكلفة الشهرية التقديرية'}
                  </div>
                  <div className="font-display text-xl sm:text-2xl font-extrabold text-[#1E4FD8] tabular-nums">
                    SAR {(workforceSummary.monthlyEstimateSAR / 1000).toFixed(1)}K
                  </div>
                </div>
              </div>

              {workforceSummary.items.length > 0 ? (
                <div className="space-y-1.5 pt-2 border-t border-[#8A94A6]/20 text-xs">
                  {workforceSummary.items.map((item) => (
                    <div
                      key={item.code}
                      className="flex items-center justify-between text-[#44464e] font-mono tabular-nums"
                    >
                      <span>
                        {item.code} × {item.headcount}
                      </span>
                      <span className="text-[#0A1F44] font-semibold">
                        SAR {(item.headcount * item.dailyRateSAR).toLocaleString()}/d
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8A94A6] italic">
                  {lang === 'en'
                    ? 'Tap one or more trades in the matrix to build a mobilization estimate.'
                    : 'اختر تخصصاً واحداً أو أكثر من القائمة لحساب تكلفة التعبئة.'}
                </p>
              )}

              <button
                type="button"
                onClick={onAttachWorkforceToRFQ}
                disabled={workforceSummary.items.length === 0}
                className="min-h-[46px] w-full py-3 px-4 text-xs font-display font-bold text-white bg-[#F39C12] hover:bg-[#d9880b] disabled:opacity-40 disabled:pointer-events-none rounded-[4px] transition-colors cursor-pointer whitespace-nowrap"
              >
                {lang === 'en'
                  ? 'Attach Selected Roster to Tender RFQ'
                  : 'إرفاق جدول الكوادر بطلب العرض الفني'}
              </button>
            </div>

            {/* Documentary Engineering Command Visual */}
            <div className="relative rounded-[8px] overflow-hidden border border-[#8A94A6]/25 bg-white">
              <div className="aspect-[16/10] sm:aspect-[4/3] w-full">
                <ResilientImage
                  src={ASSETS.workforce}
                  alt="Saudi HSE safety officers conducting morning toolbox briefing with manpower crew"
                  fallbackTitle="Technical Workforce Command"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 bg-white text-[#0A1F44] border-t border-[#8A94A6]/20">
                <div className="text-xs font-mono font-semibold text-[#1E4FD8] mb-1">
                  {lang === 'en'
                    ? 'TURNKEY CAMP & HSE LOGISTICS INCLUDED'
                    : 'شامل السكن الميداني والتموين والسلامة المهنية'}
                </div>
                <p className="text-xs text-[#44464e] leading-relaxed">
                  {lang === 'en'
                    ? 'All mobilized personnel deploy with Aramco medical fitness clearance, H2S breathing apparatus training, and self-contained life-support camp logistics.'
                    : 'تنتشر جميع الكوادر مع فحص اللياقة الطبية المعتمد وتدريب السلامة من غاز H2S ولوجستيات المعسكرات المتكاملة.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right 8 Columns: Dual-Mode Responsive Workforce Allocation Matrix */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-[8px] border border-[#8A94A6]/25 overflow-hidden">
            {/* Matrix Top Filter Bar */}
            <div className="p-4 sm:p-5 bg-white border-b border-[#8A94A6]/25 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-display font-bold text-[#0A1F44]">
                  <SlidersHorizontal className="w-4 h-4 text-[#1E4FD8] shrink-0" />
                  <span>
                    {lang === 'en'
                      ? 'Filter Roster by Engineering Discipline'
                      : 'تصفية المصفوفة حسب التخصص الهندسي'}
                  </span>
                </div>

                {/* Left / Right Slide Arrow Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => slideDisciplineBar('left')}
                    className="w-8 h-8 rounded-[4px] bg-white border border-[#8A94A6]/35 hover:border-[#0A1F44] hover:bg-[#0A1F44] hover:text-white text-[#0A1F44] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                    aria-label={lang === 'en' ? 'Slide categories left' : 'التمرير لليمين'}
                    title={lang === 'en' ? 'Slide Left' : 'تمرير'}
                  >
                    <ChevronLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => slideDisciplineBar('right')}
                    className="w-8 h-8 rounded-[4px] bg-white border border-[#8A94A6]/35 hover:border-[#0A1F44] hover:bg-[#0A1F44] hover:text-white text-[#0A1F44] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                    aria-label={lang === 'en' ? 'Slide categories right' : 'التمرير لليسار'}
                    title={lang === 'en' ? 'Slide Right' : 'تمرير'}
                  >
                    <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Smooth Horizontal Slide Track */}
              <div
                ref={disciplineSliderRef}
                onMouseDown={handleSliderMouseDown}
                onMouseMove={handleSliderMouseMove}
                onMouseUp={handleSliderMouseUp}
                onMouseLeave={handleSliderMouseUp}
                className={`flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 select-none ${
                  isDraggingSlider ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              >
                {DISCIPLINE_TABS.map((tab, idx) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={(e) => {
                      onSetDisciplineFilter(tab.key);
                      e.currentTarget.scrollIntoView({
                        behavior: 'smooth',
                        inline: 'center',
                        block: 'nearest',
                      });
                    }}
                    className={`snap-start min-h-[40px] px-4 py-2 text-xs font-display font-semibold rounded-[4px] transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 ${
                      disciplineFilter === tab.key
                        ? 'bg-[#0A1F44] text-white shadow-xs ring-2 ring-[#00B8D4]/50'
                        : 'bg-white text-[#44464e] border border-[#8A94A6]/30 hover:border-[#0A1F44] hover:text-[#0A1F44]'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-mono ${
                        disciplineFilter === tab.key ? 'text-[#00B8D4]' : 'text-[#8A94A6]'
                      }`}
                    >
                      0{idx + 1}
                    </span>
                    <span>{tab[lang]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* MOBILE TOUCH CARD VIEW (`md:hidden`) */}
            <div className="md:hidden divide-y divide-[#8A94A6]/20">
              {filteredWorkforce.map((row) => {
                const isChecked = Boolean(selectedTrades[row.id]);
                const currentQty = selectedTrades[row.id] || 0;
                return (
                  <div
                    key={row.id}
                    onClick={() => onToggleTradeSelection(row.id, 25)}
                    className={`p-4 transition-colors cursor-pointer ${
                      isChecked ? 'bg-[#eff3ff]' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isChecked}
                        aria-label={`Select ${row.tradeTitle[lang]}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTradeSelection(row.id, 25);
                        }}
                        className={`mt-0.5 w-5 h-5 rounded-[2px] flex items-center justify-center border shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-[#1E4FD8] border-[#1E4FD8] text-white'
                            : 'bg-white border-[#8A94A6]'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="font-display text-sm font-bold text-[#0A1F44] leading-snug">
                          {row.tradeTitle[lang]}
                        </div>
                        <div className="text-[11px] font-mono text-[#8A94A6] mt-0.5">
                          {row.code} · {row.certificationStandard}
                        </div>

                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums">
                          <span className="font-semibold text-[#0A1F44]">
                            SAR {row.dailyRateSAR}/day
                          </span>
                          <span className="text-[#44464e]">
                            {row.availablePool.toLocaleString()} {lang === 'en' ? 'avail.' : 'متاح'}
                          </span>
                          <span
                            className={`font-sans font-medium ${
                              row.readinessState === 'immediate'
                                ? 'text-[#007E94]'
                                : 'text-[#A36605]'
                            }`}
                          >
                            {row.mobilizationWindow[lang]}
                          </span>
                        </div>

                        {isChecked && (
                          <div
                            className="mt-3 pt-2.5 border-t border-[#1E4FD8]/20 flex items-center justify-between gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-xs font-display font-semibold text-[#0A1F44]">
                              {lang === 'en' ? 'Requested Personnel:' : 'العدد المطلوب:'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onUpdateTradeHeadcount(row.id, currentQty - 5)}
                                className="w-9 h-9 rounded-[4px] bg-white border border-[#8A94A6]/40 flex items-center justify-center text-[#0A1F44] active:bg-[#dde5f5]"
                                aria-label="Decrease headcount by 5"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={row.availablePool}
                                value={currentQty}
                                aria-label={`Quantity for ${row.tradeTitle[lang]}`}
                                onChange={(e) =>
                                  onUpdateTradeHeadcount(row.id, parseInt(e.target.value, 10))
                                }
                                className="w-16 h-9 px-2 text-center text-xs font-mono font-bold text-[#0A1F44] bg-white border border-[#1E4FD8] rounded-[4px] tabular-nums focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => onUpdateTradeHeadcount(row.id, currentQty + 5)}
                                className="w-9 h-9 rounded-[4px] bg-white border border-[#8A94A6]/40 flex items-center justify-center text-[#0A1F44] active:bg-[#dde5f5]"
                                aria-label="Increase headcount by 5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP & TABLET TABULAR MATRIX (`hidden md:block`) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#8A94A6]/25 bg-white text-[11px] font-display font-bold text-[#0A1F44] uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-10 text-center">
                      {lang === 'en' ? 'Req' : 'طلب'}
                    </th>
                    <th className="py-3.5 px-4">
                      {lang === 'en'
                        ? 'Trade Classification & Standard'
                        : 'التصنيف المهني والمعيار القياسي'}
                    </th>
                    <th className="py-3.5 px-4 whitespace-nowrap">
                      {lang === 'en' ? 'Vetted Pool' : 'العدد المتاح'}
                    </th>
                    <th className="py-3.5 px-4 whitespace-nowrap">
                      {lang === 'en' ? 'Dispatch Window' : 'نافذة التعبئة'}
                    </th>
                    <th className="py-3.5 px-4 whitespace-nowrap">
                      {lang === 'en' ? 'Rate (SAR/Day)' : 'السعر اليومي'}
                    </th>
                    <th className="py-3.5 px-4 whitespace-nowrap">
                      {lang === 'en' ? 'Req. Qty' : 'الكمية المطلوبة'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#8A94A6]/20 text-xs sm:text-sm">
                  {filteredWorkforce.map((row) => {
                    const isChecked = Boolean(selectedTrades[row.id]);
                    const currentQty = selectedTrades[row.id] || 0;
                    return (
                      <tr
                        key={row.id}
                        onClick={() => onToggleTradeSelection(row.id, 25)}
                        className={`transition-colors cursor-pointer ${
                          isChecked ? 'bg-[#eff3ff]' : 'hover:bg-[#F4F6F9]/60'
                        }`}
                      >
                        <td
                          className="py-4 px-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={isChecked}
                            aria-label={`Select ${row.tradeTitle[lang]}`}
                            onClick={() => onToggleTradeSelection(row.id, 25)}
                            className={`w-4 h-4 rounded-[2px] flex items-center justify-center border transition-colors cursor-pointer mx-auto ${
                              isChecked
                                ? 'bg-[#1E4FD8] border-[#1E4FD8] text-white'
                                : 'bg-white border-[#8A94A6] hover:border-[#1E4FD8]'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-display font-semibold text-[#0A1F44]">
                            {row.tradeTitle[lang]}
                          </div>
                          <div className="text-xs text-[#8A94A6] font-mono mt-0.5">
                            {row.code} · {row.certificationStandard}
                          </div>
                        </td>

                        <td className="py-4 px-4 font-mono font-semibold text-[#0A1F44] tabular-nums whitespace-nowrap">
                          {row.availablePool.toLocaleString()}{' '}
                          <span className="text-xs font-normal text-[#8A94A6]">
                            {lang === 'en' ? 'certified' : 'معتمد'}
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`text-xs font-medium ${
                              row.readinessState === 'immediate'
                                ? 'text-[#007E94]'
                                : 'text-[#A36605]'
                            }`}
                          >
                            {row.mobilizationWindow[lang]}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-mono font-semibold text-[#0A1F44] tabular-nums whitespace-nowrap">
                          SAR {row.dailyRateSAR}
                        </td>

                        <td
                          className="py-4 px-4 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isChecked ? (
                            <input
                              type="number"
                              min={1}
                              max={row.availablePool}
                              value={currentQty}
                              aria-label={`Quantity for ${row.tradeTitle[lang]}`}
                              onChange={(e) =>
                                onUpdateTradeHeadcount(row.id, parseInt(e.target.value, 10))
                              }
                              className="w-20 px-2.5 py-1 text-xs font-mono font-semibold text-[#0A1F44] bg-white border border-[#1E4FD8] rounded-[4px] tabular-nums focus:outline-none"
                            />
                          ) : (
                            <span className="text-xs font-mono text-[#8A94A6]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Matrix Footer Note */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-white border-t border-[#8A94A6]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#44464e]">
              <span>
                {lang === 'en'
                  ? 'All rates include Ajeer documentation, GOSI coverage, PPE, and site transport.'
                  : 'جميع الأسعار تشمل توثيق أجير والتأمينات الاجتماعية ومعدات الوقاية والنقل الميداني.'}
              </span>
              <span className="font-mono text-[#0A1F44] font-semibold tabular-nums">
                {lang === 'en' ? 'Nitaqat Tier: Platinum Green' : 'النطاق: البلاتيني الأخضر'}
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

WorkforceMatrixSection.displayName = 'WorkforceMatrixSection';
