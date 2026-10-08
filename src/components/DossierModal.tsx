import React, { useEffect, memo } from 'react';
import { X, ArrowUpRight, CheckCircle2, FileText } from 'lucide-react';
import { ProjectDossier, Language } from '../data/industrialData';
import { ResilientImage } from './ResilientImage';

interface DossierModalProps {
  dossier: ProjectDossier | null;
  lang: Language;
  onClose: () => void;
  onRequestSimilarScope: (dossier: ProjectDossier) => void;
}

export const DossierModal: React.FC<DossierModalProps> = memo(({
  dossier,
  lang,
  onClose,
  onRequestSimilarScope,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (dossier) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [dossier, onClose]);

  if (!dossier) return null;

  const accentBorderClass =
    dossier.accentColor === '#00B8D4'
      ? 'border-t-[#00B8D4]'
      : dossier.accentColor === '#F39C12'
      ? 'border-t-[#F39C12]'
      : 'border-t-[#1E4FD8]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-[#0A1F44]/70 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-modal-title"
    >
      <div
        className={`relative w-full max-w-4xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col bg-white rounded-t-[12px] sm:rounded-[8px] border border-[#8A94A6]/30 border-t-4 ${accentBorderClass} shadow-[0_20px_48px_-8px_rgba(10,31,68,0.35)] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle Visual Affordance */}
        <div className="sm:hidden pt-2 pb-1 bg-white flex justify-center shrink-0">
          <div className="w-10 h-1 bg-[#8A94A6]/40 rounded-full" />
        </div>

        {/* Top Dossier Header Bar */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-white border-b border-[#8A94A6]/20 shrink-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs text-[#44464e] font-mono tabular-nums min-w-0">
            <span className="font-semibold text-[#0A1F44]">{dossier.contractCode}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate max-w-[180px] sm:max-w-none">{dossier.location[lang]}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#44464e] hover:text-[#0A1F44] hover:bg-[#F4F6F9] rounded-[4px] transition-colors cursor-pointer shrink-0 -mr-1"
            aria-label={lang === 'en' ? 'Close technical dossier' : 'إغلاق الملف الفني'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto flex-1">
          {/* Hero Visual Banner inside Modal */}
          <div className="relative h-48 sm:h-68 w-full overflow-hidden bg-[#0A1F44]">
            <ResilientImage
              src={dossier.image}
              alt={dossier.title[lang]}
              fallbackTitle={dossier.title[lang]}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44] via-[#0A1F44]/50 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 text-white">
              <p className="text-[11px] sm:text-xs font-mono text-[#00B8D4] mb-1">
                {lang === 'en' ? 'Principal Contracting Authority:' : 'الجهة المالكة للمشروع:'}{' '}
                {dossier.clientEntity[lang]}
              </p>
              <h2
                id="dossier-modal-title"
                className="font-display text-lg sm:text-2xl font-bold tracking-tight text-white leading-snug"
              >
                {dossier.title[lang]}
              </h2>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            {/* Quantified Metric Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-4 bg-[#F4F6F9] rounded-[4px] border border-[#8A94A6]/20">
              <div className="flex sm:block items-baseline justify-between border-b sm:border-b-0 border-[#8A94A6]/15 pb-2 sm:pb-0">
                <div className="text-xs text-[#44464e] sm:mb-1">
                  {lang === 'en' ? 'Manpower Contract Value' : 'قيمة عقد القوى العاملة'}
                </div>
                <div className="font-display text-base sm:text-lg font-extrabold text-[#0A1F44] tabular-nums">
                  {dossier.contractValueSAR}
                </div>
              </div>
              <div className="flex sm:block items-baseline justify-between border-b sm:border-b-0 sm:border-x border-[#8A94A6]/20 pb-2 sm:pb-0 sm:px-4">
                <div className="text-xs text-[#44464e] sm:mb-1">
                  {lang === 'en' ? 'Safe Man-Hours (Zero LTI)' : 'ساعات العمل الآمنة'}
                </div>
                <div className="font-display text-base sm:text-lg font-extrabold text-[#0A1F44] tabular-nums">
                  {dossier.manHoursSafe}
                </div>
              </div>
              <div className="flex sm:block items-baseline justify-between">
                <div className="text-xs text-[#44464e] sm:mb-1">
                  {lang === 'en' ? 'Peak Workforce' : 'ذروة القوى العاملة'}
                </div>
                <div className="font-display text-base sm:text-lg font-extrabold text-[#0A1F44] tabular-nums">
                  {dossier.peakWorkforce}
                </div>
              </div>
            </div>

            {/* Scope Summary */}
            <div>
              <h3 className="font-display text-sm sm:text-base font-bold text-[#0A1F44] mb-2">
                {lang === 'en' ? 'Engineering & Execution Scope' : 'نطاق الأعمال الهندسية والتنفيذية'}
              </h3>
              <p className="text-xs sm:text-base text-[#44464e] leading-relaxed">
                {dossier.summary[lang]}
              </p>
            </div>

            {/* Technical Parameter Matrix */}
            <div>
              <h3 className="font-display text-sm sm:text-base font-bold text-[#0A1F44] mb-3">
                {lang === 'en'
                  ? 'Verified Engineering Quantities & Compliance Specifications'
                  : 'الكميات الهندسية الموثقة ومواصفات الامتثال'}
              </h3>
              <div className="border border-[#8A94A6]/25 rounded-[4px] divide-y divide-[#8A94A6]/20">
                {dossier.technicalSpecs.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-3 text-xs sm:text-sm bg-white hover:bg-[#F4F6F9]/60 transition-colors"
                  >
                    <div className="sm:col-span-5 font-medium text-[#0A1F44] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00B8D4] shrink-0" />
                      <span>{item.parameter[lang]}</span>
                    </div>
                    <div className="sm:col-span-7 font-mono text-xs text-[#44464e] tabular-nums pl-6 sm:pl-0">
                      {item.specification[lang]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attributable Executive Testimonial */}
            <div className="p-4 sm:p-5 bg-[#F4F6F9] border-l-4 border-[#1E4FD8] rounded-r-[4px]">
              <p className="text-xs sm:text-sm text-[#121c2a] italic leading-relaxed mb-3">
                "{dossier.testimonial.quote[lang]}"
              </p>
              <div className="text-xs text-[#44464e]">
                <span className="font-semibold text-[#0A1F44]">
                  {dossier.testimonial.author[lang]}
                </span>
                <span aria-hidden="true"> · </span>
                <span>{dossier.testimonial.role[lang]}</span>
                <span aria-hidden="true"> · </span>
                <span className="font-medium text-[#1E4FD8]">
                  {dossier.testimonial.organization[lang]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Thumb-Friendly Modal Footer */}
        <div className="px-4 sm:px-8 py-3.5 bg-white border-t border-[#8A94A6]/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 text-xs text-[#44464e]">
            <FileText className="w-4 h-4 text-[#0A1F44] shrink-0" />
            <span>
              {lang === 'en'
                ? 'Full QA/QC ITP Dossier & Weld Maps available for pre-qualification review.'
                : 'سجلات الجودة وخرائط اللحام متاحة للمراجعة ضمن ملف التأهيل المسبق.'}
            </span>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2.5 text-xs font-display font-semibold text-[#0A1F44] border border-[#0A1F44] rounded-[4px] hover:bg-[#0A1F44] hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              {lang === 'en' ? 'Close' : 'إغلاق'}
            </button>
            <button
              type="button"
              onClick={() => onRequestSimilarScope(dossier)}
              className="flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 text-xs font-display font-bold text-white bg-[#1E4FD8] hover:bg-[#0A1F44] rounded-[4px] transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>
                {lang === 'en'
                  ? 'Request Similar Scope Tender'
                  : 'طلب عرض فني لنطاق مماثل'}
              </span>
              <ArrowUpRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
DossierModal.displayName = 'DossierModal';
