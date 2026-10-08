import React, { memo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CAPABILITIES, Language, SectorFilter } from '../data/industrialData';
import { ResilientImage } from './ResilientImage';

interface CapabilitiesSectionProps {
  lang: Language;
  sectorFilter: SectorFilter;
  onSelectCapability: (sector: Exclude<SectorFilter, 'all'>) => void;
}

export const CapabilitiesSection: React.FC<CapabilitiesSectionProps> = memo(
  ({ lang, sectorFilter, onSelectCapability }) => {
    return (
      <section
        id="capabilities"
        className="py-12 sm:py-16 lg:py-24 bg-white max-w-[1440px] mx-auto px-4 sm:px-10"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <p className="text-xs font-mono font-semibold text-[#1E4FD8] mb-2">
              {lang === 'en'
                ? '01. Saudi Manpower Supply & Contracting Divisions'
                : '01. قطاعات توريد القوى العاملة والمقاولات في المملكة'}
            </p>
            <h2 className="font-display text-[24px] leading-[32px] sm:text-[40px] sm:leading-[48px] font-bold tracking-[-0.015em] text-[#0A1F44]">
              {lang === 'en'
                ? 'Certified Skilled, Technical & General Manpower Across Saudi Arabia.'
                : 'توريد العمالة الفنية والماهرة والعامة المعتمدة لكبرى المشاريع بالمملكة.'}
            </h2>
          </div>
          <p className="text-xs sm:text-base text-[#44464e] max-w-md">
            {lang === 'en'
              ? 'Select any manpower division below to filter our executed workforce supply contracts and inspect available trade categories.'
              : 'اختر أي قطاع للقوى العاملة أدناه لتصفية عقود التوريد المنفذة واستعراض التخصصات المهنية المتاحة.'}
          </p>
        </div>

        {/* 12-Column Asymmetric Bento Grid */}
        <div className="grid grid-cols-12 gap-4 sm:gap-6">
          {CAPABILITIES.map((cap) => {
            const isSelected = sectorFilter === cap.sectorKey;
            const accentBorderClass =
              cap.accentColor === '#00B8D4'
                ? 'border-t-[#00B8D4]'
                : cap.accentColor === '#F39C12'
                ? 'border-t-[#F39C12]'
                : 'border-t-[#1E4FD8]';
            return (
              <div
                key={cap.id}
                className={`${cap.colSpan} bg-white rounded-[8px] border ${
                  isSelected
                    ? 'border-[#1E4FD8] shadow-[0_8px_24px_-4px_rgba(10,31,68,0.08)]'
                    : 'border-[#8A94A6]/25 hover:border-[#1E4FD8]/40 hover:shadow-[0_8px_24px_-4px_rgba(10,31,68,0.08)]'
                } border-t-[3px] ${accentBorderClass} overflow-hidden flex flex-col justify-between transition-all duration-150`}
              >
                <div>
                  {/* Capability Division Visual Banner */}
                  <div className="relative h-44 sm:h-52 w-full bg-[#0A1F44] overflow-hidden border-b border-[#8A94A6]/20">
                    <ResilientImage
                      src={cap.image}
                      alt={cap.title[lang]}
                      fallbackTitle={cap.title[lang]}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44]/90 via-[#0A1F44]/25 to-transparent" />
                    <div className="absolute bottom-3 inset-x-4 flex items-center justify-between gap-2 text-white">
                      <span className="font-mono text-xs font-bold text-[#00B8D4] bg-[#0A1F44]/85 px-2.5 py-1 rounded-[4px] border border-white/15">
                        {lang === 'en' ? `DIVISION ${cap.number}` : `قطاع ${cap.number}`}
                      </span>
                      <span className="font-mono text-xs font-semibold text-white bg-[#0A1F44]/85 px-2.5 py-1 rounded-[4px] border border-white/15 tabular-nums">
                        {cap.metrics[0]?.value}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-8 pb-0 sm:pb-0">
                    {/* Unboxed Kicker Subtitle */}
                    <div className="text-[11px] sm:text-xs text-[#8A94A6] font-medium mb-2">
                      {cap.subtitle[lang]}
                    </div>

                    {/* Capability Title with Editorial Numbering */}
                    <h3 className="font-display text-lg sm:text-2xl font-bold text-[#0A1F44] mb-2.5 sm:mb-3">
                      {cap.title[lang]}
                    </h3>

                    <p className="text-xs sm:text-base text-[#44464e] leading-relaxed mb-5 sm:mb-6">
                      {cap.description[lang]}
                    </p>

                    {/* Deliverable List */}
                    <ul className="space-y-2 mb-6 sm:mb-8 border-t border-[#8A94A6]/15 pt-4">
                      {cap.deliverables[lang].map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-[#121c2a]"
                        >
                          <span className="text-[#1E4FD8] font-mono font-bold mt-0.5">+</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Metrics & Interactive Filter Trigger */}
                <div className="px-5 sm:px-8 pb-5 sm:pb-8 pt-4 border-t border-[#8A94A6]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    {cap.metrics.map((m, i) => (
                      <div key={i}>
                        <div className="font-display text-base sm:text-lg font-extrabold text-[#0A1F44] tabular-nums">
                          {m.value}
                        </div>
                        <div className="text-[11px] text-[#8A94A6]">{m.label[lang]}</div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectCapability(cap.sectorKey)}
                    className="min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-display font-semibold text-[#0A1F44] border border-[#0A1F44] hover:bg-[#0A1F44] hover:text-white rounded-[4px] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>
                      {lang === 'en' ? 'Inspect Sector Dossiers' : 'استعراض مشاريع القطاع'}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }
);

CapabilitiesSection.displayName = 'CapabilitiesSection';
