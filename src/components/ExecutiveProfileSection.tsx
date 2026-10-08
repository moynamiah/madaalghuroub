import React, { memo } from 'react';
import { Briefcase } from 'lucide-react';
import { EXECUTIVE_PROFILE, Language } from '../data/industrialData';

interface ExecutiveProfileSectionProps {
  lang: Language;
  activeLogoSrc: string;
  activeName: string;
  activeRole: string;
  activeCompany: string;
}

export const ExecutiveProfileSection: React.FC<ExecutiveProfileSectionProps> = memo(
  ({ lang, activeLogoSrc, activeName, activeRole, activeCompany }) => {
    return (
      <section
        id="executive-profile"
        className="py-12 sm:py-16 lg:py-20 bg-white border-b border-[#8A94A6]/25"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8 sm:mb-10">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[8px] bg-white border-2 border-[#0A1F44] p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
                <img
                  src={activeLogoSrc}
                  alt="MADA AL-GHUROUB Company Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-mono font-semibold text-[#1E4FD8] mb-1">
                  {activeName} · {activeRole}
                </p>
                <h2 className="font-display text-[20px] leading-[28px] sm:text-[32px] sm:leading-[40px] font-bold tracking-[-0.015em] text-[#0A1F44] break-words">
                  {activeCompany}
                </h2>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <a
                href="#procurement-rfq"
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-display font-bold text-white bg-[#1E4FD8] hover:bg-[#0A1F44] rounded-[4px] transition-colors whitespace-nowrap"
              >
                <Briefcase className="w-3.5 h-3.5 shrink-0" />
                <span>{lang === 'en' ? 'Direct Executive Desk' : 'مكتب التواصل المباشر'}</span>
              </a>
            </div>
          </div>

          {/* 3-Column Executive Career Pillars */}
          <div className="grid grid-cols-12 gap-4 sm:gap-6">
            {EXECUTIVE_PROFILE.careerHighlights.map((pillar) => (
              <div
                key={pillar.index}
                className="col-span-12 lg:col-span-4 bg-white rounded-[8px] border border-[#8A94A6]/25 border-t-[3px] border-t-[#1E4FD8] p-5 sm:p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-[#1E4FD8] mb-2">
                    <span>{lang === 'en' ? 'Executive Focus' : 'المسؤولية التنفيذية'}</span>
                    <span className="font-bold text-[#0A1F44] tabular-nums">{pillar.metric}</span>
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#0A1F44] mb-2">
                    {pillar.title[lang]}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#44464e] leading-relaxed">
                    {pillar.detail[lang]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
);

ExecutiveProfileSection.displayName = 'ExecutiveProfileSection';
