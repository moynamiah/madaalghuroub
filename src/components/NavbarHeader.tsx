import React, { memo } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Language } from '../data/industrialData';
import { ResilientImage } from './ResilientImage';

export const NAV_ITEMS = [
  { href: '#executive-profile', en: 'Executive Profile', ar: 'الملف التنفيذي' },
  { href: '#capabilities', en: 'Capabilities', ar: 'القدرات الهندسية' },
  { href: '#project-dossiers', en: 'Project Dossiers', ar: 'سجل المشاريع' },
  { href: '#workforce-matrix', en: 'Workforce Matrix', ar: 'مصفوفة الكوادر' },
  { href: '#workforce-analytics', en: 'Analytics & Charts', ar: 'الإحصائيات والرسوم' },
  { href: '#governance', en: 'Governance', ar: 'الحوكمة والسلامة' },
] as const;

interface NavbarHeaderProps {
  lang: Language;
  isRTL: boolean;
  mobileMenuOpen: boolean;
  activePortraitSrc: string;
  activeName: string;
  activeRole: string;
  activeCompany: string;
  onToggleLanguage: () => void;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
  onTriggerPortraitUpload: () => void;
}

export const NavbarHeader: React.FC<NavbarHeaderProps> = memo(
  ({
    lang,
    isRTL,
    mobileMenuOpen,
    activePortraitSrc,
    activeName,
    activeRole,
    activeCompany,
    onToggleLanguage,
    onToggleMobileMenu,
    onCloseMobileMenu,
    onTriggerPortraitUpload,
  }) => {
    return (
      <>
        {/* STRICT 3-ZONE TOP BAR CONTRACT (Compact 56px on Mobile, 64px on Desktop) */}
        <header className="sticky top-0 z-40 h-14 sm:h-16 bg-[#0A1F44] border-b border-white/10 px-4 sm:px-10 flex items-center justify-between">
          {/* Zone 1: Moyna Miah Portrait + Brand Identity */}
          <a
            href="#top"
            onClick={onCloseMobileMenu}
            onDoubleClick={(e) => {
              e.preventDefault();
              onTriggerPortraitUpload();
            }}
            className="flex items-center gap-2 sm:gap-2.5 font-display text-base sm:text-xl font-extrabold tracking-tight text-white whitespace-nowrap truncate max-w-[175px] xs:max-w-[215px] sm:max-w-none select-none group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[4px] overflow-hidden bg-white border-2 border-[#00B8D4] group-hover:border-[#F39C12] transition-colors shrink-0 shadow-xs">
              <ResilientImage
                src={activePortraitSrc}
                alt="Moyna Miah — Business Development Manager"
                fallbackTitle="MM"
                loading="eager"
                fetchPriority="high"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="truncate text-sm sm:text-base font-extrabold text-white tracking-tight">
                {activeName}
              </span>
              <span className="truncate text-[10px] sm:text-[11px] font-mono font-semibold text-[#00B8D4]">
                {activeRole}
              </span>
            </div>
          </a>

          {/* Zone 2: Clean text navigation links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-white/80">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-white hover:underline underline-offset-8 decoration-[#00B8D4] decoration-2 transition-colors whitespace-nowrap"
              >
                {item[lang]}
              </a>
            ))}
          </nav>

          {/* Zone 3: Primary Actions (Bilingual Switch + Direct Inquiry Action + Mobile Menu Trigger) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onToggleLanguage}
              className="min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-3 py-1.5 text-xs font-display font-semibold text-white/90 border border-white/25 rounded-[4px] hover:border-white hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
            >
              {lang === 'en' ? 'العربية' : 'EN'}
            </button>
            <a
              href="#procurement-rfq"
              className="min-h-[38px] sm:min-h-[40px] inline-flex items-center px-3 sm:px-4 py-1.5 text-xs font-display font-bold text-[#0A1F44] bg-[#F39C12] hover:bg-[#f5ab29] rounded-[4px] transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'en' ? 'Tender RFQ' : 'طلب عرض فني'}
            </a>
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="lg:hidden min-h-[40px] min-w-[40px] flex items-center justify-center text-white border border-white/20 rounded-[4px] hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={lang === 'en' ? 'Toggle navigation menu' : 'فتح القائمة'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* MOBILE SLIDE-DOWN NAVIGATION DRAWER */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-14 sm:top-16 z-30 bg-[#0A1F44] border-b border-white/20 shadow-[0_20px_48px_-8px_rgba(10,31,68,0.65)] px-4 py-5 space-y-4">
            <div className="pb-3 border-b border-white/10">
              <div className="text-xs font-mono text-[#00B8D4] font-semibold">
                {activeRole}
              </div>
              <div className="text-xs font-display font-bold text-white mt-0.5">
                {activeCompany}
              </div>
            </div>
            <nav className="grid grid-cols-1 gap-1">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobileMenu}
                  className="min-h-[44px] px-3 flex items-center justify-between text-sm font-display font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-[4px] transition-colors"
                >
                  <span>{item[lang]}</span>
                  <ArrowRight className={`w-4 h-4 text-[#00B8D4] ${isRTL ? 'rotate-180' : ''}`} />
                </a>
              ))}
            </nav>
          </div>
        )}
      </>
    );
  }
);

NavbarHeader.displayName = 'NavbarHeader';
