import React, { memo } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { Language, ProjectDossier, SectorFilter } from '../data/industrialData';
import { ResilientImage } from './ResilientImage';

interface ProjectDossiersSectionProps {
  lang: Language;
  sectorFilter: SectorFilter;
  projectSearch: string;
  filteredProjects: ProjectDossier[];
  onSetSectorFilter: (sector: SectorFilter) => void;
  onSetProjectSearch: (query: string) => void;
  onOpenDossier: (dossier: ProjectDossier) => void;
}

const SECTOR_TABS = [
  { key: 'all', en: 'All Sectors', ar: 'جميع القطاعات' },
  { key: 'petrochemical', en: 'Petrochemical', ar: 'البتروكيماويات' },
  { key: 'civil', en: 'Civil & Infra', ar: 'الإنشاءات المدنية' },
  { key: 'marine', en: 'Rigging & E&I', ar: 'الرفع والكهرباء' },
  { key: 'workforce', en: 'HSE & Camps', ar: 'السلامة والمعسكرات' },
] as const;

export const ProjectDossiersSection: React.FC<ProjectDossiersSectionProps> = memo(
  ({
    lang,
    sectorFilter,
    projectSearch,
    filteredProjects,
    onSetSectorFilter,
    onSetProjectSearch,
    onOpenDossier,
  }) => {
    return (
      <section
        id="project-dossiers"
        className="py-12 sm:py-16 lg:py-24 bg-white border-y border-[#8A94A6]/25"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8 sm:mb-10">
            <div>
              <p className="text-xs font-mono font-semibold text-[#1E4FD8] mb-2">
                {lang === 'en'
                  ? '02. Executed Manpower Supply & Workforce Track Record'
                  : '02. سجل عقود توريد القوى العاملة والمشاريع المنفذة'}
              </p>
              <h2 className="font-display text-[24px] leading-[32px] sm:text-[40px] sm:leading-[48px] font-bold tracking-[-0.015em] text-[#0A1F44]">
                {lang === 'en'
                  ? 'Proven Manpower Mobilization Across Jubail, NEOM, Riyadh & Yanbu.'
                  : 'سجل موثق لتعبئة وتوريد القوى العاملة في الجبيل ونيوم والرياض وينبع.'}
              </h2>
            </div>

            {/* Interactive Filter Controls */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full lg:w-auto max-w-full">
              <div className="relative w-full sm:w-auto">
                <Search className="w-4 h-4 text-[#8A94A6] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => onSetProjectSearch(e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'Search contract code or city...'
                      : 'ابحث برقم العقد أو المدينة...'
                  }
                  aria-label={lang === 'en' ? 'Search project dossiers' : 'البحث في ملفات المشاريع'}
                  className="min-h-[44px] w-full sm:w-60 pl-9 pr-3 py-2 text-xs bg-white border border-[#8A94A6]/35 rounded-[4px] text-[#0A1F44] placeholder:text-[#8A94A6] focus:outline-none focus:border-[#1E4FD8] transition-colors"
                />
              </div>

              <div
                className="flex flex-wrap items-center gap-1 p-1 bg-white border border-[#8A94A6]/25 rounded-[4px] w-full sm:w-auto max-w-full"
                role="tablist"
                aria-label="Sector filter"
              >
                {SECTOR_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={sectorFilter === tab.key}
                    onClick={() => onSetSectorFilter(tab.key)}
                    className={`min-h-[38px] px-2.5 sm:px-3 py-1.5 text-xs font-display font-semibold rounded-[4px] transition-colors whitespace-nowrap cursor-pointer ${
                      sectorFilter === tab.key
                        ? 'bg-[#1E4FD8] text-white'
                        : 'text-[#44464e] hover:text-[#0A1F44]'
                    }`}
                  >
                    {tab[lang]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dossier Cards Grid */}
          {filteredProjects.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-white rounded-[8px] border border-[#8A94A6]/25">
              <p className="font-display text-base font-bold text-[#0A1F44] mb-2">
                {lang === 'en'
                  ? 'No matching project dossiers found for this filter.'
                  : 'لا توجد ملفات مشاريع مطابقة لمعايير البحث الحالية.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  onSetSectorFilter('all');
                  onSetProjectSearch('');
                }}
                className="min-h-[44px] mt-2 px-4 py-2 text-xs font-display font-semibold text-white bg-[#1E4FD8] rounded-[4px] hover:bg-[#0A1F44] transition-colors cursor-pointer"
              >
                {lang === 'en' ? 'Reset Dossier Filters' : 'إعادة ضبط الفلاتر'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-5 sm:gap-6">
              {filteredProjects.map((project) => {
                const accentBorderClass =
                  project.accentColor === '#00B8D4'
                    ? 'border-t-[#00B8D4]'
                    : project.accentColor === '#F39C12'
                    ? 'border-t-[#F39C12]'
                    : 'border-t-[#1E4FD8]';
                return (
                  <article
                    key={project.id}
                    className={`col-span-12 md:col-span-6 bg-white rounded-[8px] border border-[#8A94A6]/25 hover:border-[#1E4FD8]/50 border-t-[3px] ${accentBorderClass} hover:shadow-[0_8px_24px_-4px_rgba(10,31,68,0.08)] flex flex-col justify-between overflow-hidden transition-all duration-150`}
                  >
                    <div>
                      {/* 4:3 Project Photography */}
                      <div className="relative aspect-[4/3] w-full bg-[#0A1F44] overflow-hidden border-b border-[#8A94A6]/20">
                        <ResilientImage
                          src={project.image}
                          alt={project.title[lang]}
                          fallbackTitle={project.title[lang]}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44]/85 via-transparent to-transparent" />
                        <div className="absolute bottom-3 inset-x-4 flex items-center justify-between text-xs font-mono text-white tabular-nums">
                          <span>{project.contractCode}</span>
                          <span className="text-[#00B8D4] font-semibold">
                            {project.completionRate}% {lang === 'en' ? 'COMPLETE' : 'مكتمل'}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 sm:p-6">
                        {/* Clean Unboxed Metadata Line (Zero-Pill Discipline) */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#8A94A6] mb-2">
                          <span className="font-medium text-[#0A1F44]">
                            {project.location[lang]}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{project.clientEntity[lang]}</span>
                        </div>

                        {/* Card Title */}
                        <h3 className="font-display text-base sm:text-lg font-bold text-[#0A1F44] mb-2.5 sm:mb-3 leading-snug">
                          {project.title[lang]}
                        </h3>

                        {/* Scope Summary */}
                        <p className="text-xs sm:text-sm text-[#44464e] leading-relaxed mb-5">
                          {project.summary[lang]}
                        </p>

                        {/* Tabular Metric Trio */}
                        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#8A94A6]/20 text-xs tabular-nums">
                          <div>
                            <div className="text-[10px] sm:text-[11px] text-[#8A94A6]">
                              {lang === 'en' ? 'Contract Value' : 'قيمة العقد'}
                            </div>
                            <div className="font-mono font-semibold text-[#0A1F44] mt-0.5 text-[11px] sm:text-xs">
                              {project.contractValueSAR}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] sm:text-[11px] text-[#8A94A6]">
                              {lang === 'en' ? 'Safe Hours' : 'ساعات آمنة'}
                            </div>
                            <div className="font-mono font-semibold text-[#0A1F44] mt-0.5 text-[11px] sm:text-xs">
                              {project.manHoursSafe}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] sm:text-[11px] text-[#8A94A6]">
                              {lang === 'en' ? 'Peak Force' : 'ذروة الكوادر'}
                            </div>
                            <div className="font-mono font-semibold text-[#0A1F44] mt-0.5 text-[11px] sm:text-xs">
                              {project.peakWorkforce}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Action */}
                    <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-white border-t border-[#8A94A6]/20 flex items-center justify-between gap-3">
                      <span className="text-xs text-[#007E94] font-medium truncate">
                        {project.completionStatus[lang]}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenDossier(project)}
                        className="min-h-[42px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-display font-bold text-white bg-[#1E4FD8] hover:bg-[#0A1F44] rounded-[4px] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>{lang === 'en' ? 'Open Dossier' : 'فتح الملف الفني'}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    );
  }
);

ProjectDossiersSection.displayName = 'ProjectDossiersSection';
