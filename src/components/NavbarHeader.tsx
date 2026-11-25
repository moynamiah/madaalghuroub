import React, { useEffect, memo } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Language } from '../data/industrialData';
import { ResilientImage } from './ResilientImage';

export const NAV_ITEMS = [
  { href: '#executive-profile', en: 'Executive Profile', shortEn: 'Profile', ar: 'الملف التنفيذي', shortAr: 'الملف' },
  { href: '#capabilities', en: 'Capabilities', shortEn: 'Capabilities', ar: 'القدرات الهندسية', shortAr: 'القدرات' },
  { href: '#project-dossiers', en: 'Project Dossiers', shortEn: 'Projects', ar: 'سجل المشاريع', shortAr: 'المشاريع' },
  { href: '#workforce-matrix', en: 'Workforce Matrix', shortEn: 'Workforce', ar: 'مصفوفة الكوادر', shortAr: 'الكوادر' },
  { href: '#equipment-rental', en: 'Equipment Rental', shortEn: 'Equipment', ar: 'تأجير المعدات', shortAr: 'المعدات' },
  { href: '#workforce-analytics', en: 'Analytics & Charts', shortEn: 'Analytics', ar: 'الإحصائيات والبيانات', shortAr: 'الإحصائيات' },
  { href: '#governance', en: 'Governance', shortEn: 'Governance', ar: 'الحوكمة والسلامة', shortAr: 'الحوكمة' },
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
  }) => {
    useEffect(() => {
      if (!mobileMenuOpen) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onCloseMobileMenu();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mobileMenuOpen, onCloseMobileMenu]);

    return (
      <>
        {/* STRICT 3-ZONE TOP BAR CONTRACT (Compact 56px on Mobile, 64px on Desktop) */}
        <header className="sticky top-0 z-40 h-14 sm:h-16 bg-[#0A1F44] border-b border-white/10 px-3 sm:px-6 xl:px-8">
          <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between gap-2 sm:gap-3 xl:gap-5">
            {/* Zone 1: Moyna Miah Portrait + Brand Identity */}
            <a
              href="#top"
              onClick={onCloseMobileMenu}
              className="min-w-0 flex-1 lg:flex-none lg:shrink-0 flex items-center gap-2 sm:gap-2.5 font-display text-white select-none group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[4px] overflow-hidden bg-white border-2 border-[#00B8D4] group-hover:border-[#F39C12] transition-colors shrink-0 shadow-xs">
                <ResilientImage
                  src={activePortraitSrc}
                  alt="Moyna Miah — Business Development Manager"
                  fallbackTitle="MM"
                  loading="eager"
                  fetchPriority="high"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="flex flex-col min-w-0 leading-tight lg:max-w-[155px] xl:max-w-[185px]">
                <span className="truncate text-[13px] sm:text-[15px] font-extrabold text-white tracking-tight">
                  {activeName}
                </span>
                <span className="truncate text-[10px] sm:text-[11px] font-mono font-semibold text-[#00B8D4]">
                  {activeRole}
                </span>
              </div>
            </a>

            {/* Zone 2: Clean text navigation links (Desktop — spacious & centered) */}
            <nav className="hidden lg:flex flex-1 min-w-0 items-center justify-center gap-3.5 xl:gap-5 2xl:gap-6 text-xs xl:text-[13px] font-medium text-white/85">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="hover:text-white hover:underline underline-offset-8 decoration-[#00B8D4] decoration-2 transition-colors whitespace-nowrap"
                >
                  {lang === 'en' ? item.shortEn : item.shortAr}
                </a>
              ))}
            </nav>

            {/* Zone 3: Primary Actions (Bilingual Switch + Direct Inquiry Action + Mobile Menu Trigger) */}
            <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={onToggleLanguage}
                className="h-8 sm:h-[38px] px-2 sm:px-3 text-[11px] sm:text-xs font-display font-semibold text-white/90 border border-white/25 rounded-[4px] hover:border-white hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
              >
                {lang === 'en' ? 'العربية' : 'EN'}
              </button>
              <a
                href="#procurement-rfq"
                onClick={onCloseMobileMenu}
                className="h-8 sm:h-[38px] inline-flex items-center px-2.5 sm:px-3.5 text-[11px] sm:text-xs font-display font-bold text-[#0A1F44] bg-[#F39C12] hover:bg-[#f5ab29] rounded-[4px] transition-colors whitespace-nowrap shrink-0"
              >
                <span className="sm:hidden">{lang === 'en' ? 'RFQ' : 'عرض فني'}</span>
                <span className="hidden sm:inline">
                  {lang === 'en' ? 'Tender RFQ' : 'طلب عرض فني'}
                </span>
              </a>
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="lg:hidden h-8 w-8 sm:h-[38px] sm:w-[38px] flex items-center justify-center text-white border border-white/20 rounded-[4px] hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                aria-label={lang === 'en' ? 'Toggle navigation menu' : 'فتح القائمة'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* MOBILE SLIDE-DOWN NAVIGATION DRAWER */}
        {mobileMenuOpen && (
          <>
            <div
              aria-hidden="true"
              onClick={onCloseMobileMenu}
              className="lg:hidden fixed inset-0 top-14 sm:top-16 z-20 bg-[#0A1F44]/55 backdrop-blur-[1px]"
            />
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
          </>
        )}
      </>
    );
  }
);

NavbarHeader.displayName = 'NavbarHeader';
