import React, { memo } from 'react';
import { ShieldCheck, HardHat, Award, Lock } from 'lucide-react';
import { Language } from '../data/industrialData';
import { CertificationTooltip } from './CertificationTooltip';

interface FooterSectionProps {
  lang: Language;
  activeLogoSrc: string;
  activeName: string;
  activeRole: string;
  activeCompany: string;
  activeRegion: string;
  onOpenAdminModal: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = memo(
  ({
    lang,
    activeLogoSrc,
    activeName,
    activeRole,
    activeCompany,
    activeRegion,
    onOpenAdminModal,
  }) => {
    return (
      <footer className="bg-[#0A1F44] text-white/75 border-t border-white/15 py-10 sm:py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-10 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-3.5">
              <img
                src={activeLogoSrc}
                alt="MADA AL-GHUROUB Company Logo"
                className="w-11 h-11 rounded-[4px] object-contain bg-white p-1 border border-white/25 shrink-0"
              />
              <div>
                <div className="font-display text-base sm:text-lg font-extrabold text-white break-words">
                  {activeName} — {activeRole} | {activeCompany}
                </div>
                <p className="text-xs text-white/60 mt-1">
                  {activeCompany} · {activeRegion}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs text-white/75">
              <a href="#executive-profile" className="hover:text-white transition-colors">
                {lang === 'en' ? 'Executive Profile' : 'الملف التنفيذي'}
              </a>
              <a href="#capabilities" className="hover:text-white transition-colors">
                {lang === 'en' ? 'Capabilities' : 'القدرات الهندسية'}
              </a>
              <a href="#project-dossiers" className="hover:text-white transition-colors">
                {lang === 'en' ? 'Project Dossiers' : 'سجل المشاريع'}
              </a>
              <a href="#workforce-matrix" className="hover:text-white transition-colors">
                {lang === 'en' ? 'Workforce Matrix' : 'مصفوفة الكوادر'}
              </a>
              <a href="#governance" className="hover:text-white transition-colors">
                {lang === 'en' ? 'Governance' : 'الحوكمة والسلامة'}
              </a>
              <a href="#procurement-rfq" className="hover:text-white transition-colors">
                {lang === 'en' ? 'Tender & RFQ Desk' : 'المناقصات والعروض'}
              </a>
            </div>
          </div>

          {/* Footer Governance & Compliance Certifications Row with Hoverable Tooltips */}
          <div className="pt-6 border-t border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/80">
              <span className="font-mono text-[11px] text-[#8A94A6] uppercase tracking-wider w-full sm:w-auto">
                {lang === 'en' ? 'Governance & Compliance:' : 'الحوكمة والامتثال القياسي:'}
              </span>

              <CertificationTooltip
                title={
                  lang === 'en'
                    ? 'ISO 9001:2015 Quality Management'
                    : 'نظام إدارة الجودة ISO 9001:2015'
                }
                code="ISO 9001:2015"
                accentColor="#00B8D4"
                position="top"
                align="start"
                definition={
                  lang === 'en'
                    ? 'International benchmark certifying standardized quality control across EPC engineering, structural steel fabrication, and inspection test plans (ITP).'
                    : 'المعيار الدولي المعتمد لضبط الجودة الشاملة في التصميم الهندسي وتصنيع الهياكل الفولاذية وخطط الفحص والاختبار.'
                }
              >
                <ShieldCheck className="w-4 h-4 text-[#00B8D4] shrink-0" />
                <span className="hover:text-white underline decoration-dotted underline-offset-4 decoration-white/35 transition-colors">
                  {lang === 'en' ? 'ISO 9001:2015 QMS' : 'شهادة الجودة ISO 9001'}
                </span>
              </CertificationTooltip>

              <span aria-hidden="true" className="text-white/25">
                ·
              </span>

              <CertificationTooltip
                title={
                  lang === 'en'
                    ? 'ISO 45001:2018 Occupational Health & Safety'
                    : 'نظام السلامة والصحة المهنية ISO 45001:2018'
                }
                code="ISO 45001:2018"
                accentColor="#F39C12"
                position="top"
                align="center"
                definition={
                  lang === 'en'
                    ? 'Global occupational health and safety management certification governing hazard prevention, work-permit protocols, and LTI-free industrial site execution.'
                    : 'المعيار العالمي لإدارة السلامة والصحة المهنية والوقاية من المخاطر الميدانية وضمان بيئة عمل خالية من الإصابات.'
                }
              >
                <HardHat className="w-4 h-4 text-[#F39C12] shrink-0" />
                <span className="hover:text-white underline decoration-dotted underline-offset-4 decoration-white/35 transition-colors">
                  {lang === 'en' ? 'ISO 45001:2018 OHS' : 'شهادة السلامة ISO 45001'}
                </span>
              </CertificationTooltip>

              <span aria-hidden="true" className="text-white/25">
                ·
              </span>

              <CertificationTooltip
                title={
                  lang === 'en'
                    ? 'In-Kingdom Total Value Add (IKTVA)'
                    : 'برنامج القيمة المضافة الإجمالية في المملكة (اكتفاء)'
                }
                code="IKTVA 74.2%"
                accentColor="#1E4FD8"
                position="top"
                align="end"
                definition={
                  lang === 'en'
                    ? 'Saudi Aramco localization metric verifying 74.2% domestic value creation through local material procurement, Saudi engineering employment, and in-Kingdom fabrication.'
                    : 'معيار أرامكو السعودية لتوثيق نسبة المحتوى المحلي البالغة 74.2% عبر المشتريات الوطنية وتوظيف المهندسين السعوديين والتصنيع داخل المملكة.'
                }
              >
                <Award className="w-4 h-4 text-[#00B8D4] shrink-0" />
                <span className="hover:text-white underline decoration-dotted underline-offset-4 decoration-white/35 transition-colors">
                  {lang === 'en' ? 'IKTVA 74.2% Verified' : 'برنامج اكتفاء 74.2%'}
                </span>
              </CertificationTooltip>
            </div>

            <div className="flex items-center gap-3 text-xs text-white/50 tabular-nums">
              <span>© 2026 {activeName} · {activeCompany}.</span>
              <button
                type="button"
                onClick={onOpenAdminModal}
                className="inline-flex items-center gap-1 text-[#00B8D4] hover:text-white underline cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                <span>{lang === 'en' ? 'Admin Login' : 'دخول المسؤول'}</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    );
  }
);

FooterSection.displayName = 'FooterSection';
