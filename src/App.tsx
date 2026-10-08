import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import {
  AdminSettingsModal,
  CloudPortfolioState,
  CompanyProfileDocState,
} from './components/AdminSettingsModal';
import {
  ASSETS,
  EXECUTIVE_PROFILE,
  PROJECT_DOSSIERS,
  WORKFORCE_ROSTER,
  Language,
  SectorFilter,
  ProjectDossier,
} from './data/industrialData';
import { NavbarHeader } from './components/NavbarHeader';
import { HeroSection } from './components/HeroSection';
import { ExecutiveProfileSection } from './components/ExecutiveProfileSection';
import { CapabilitiesSection } from './components/CapabilitiesSection';
import { ProjectDossiersSection } from './components/ProjectDossiersSection';
import {
  WorkforceMatrixSection,
  DisciplineFilterType,
  SelectedWorkforceMap,
} from './components/WorkforceMatrixSection';
import { AnalyticsChartsSection } from './components/AnalyticsChartsSection';
import { FieldOperationsAndGovernanceSection } from './components/FieldOperationsAndGovernanceSection';
import {
  ProcurementRfqSection,
  SubmittedTenderReceipt,
} from './components/ProcurementRfqSection';
import { FooterSection } from './components/FooterSection';
import { DossierModal } from './components/DossierModal';

const PORTRAIT_STORAGE_KEY = 'moyna_miah_custom_portrait_v1';
const LOGO_STORAGE_KEY = 'mada_al_ghuroub_custom_logo_v1';

const WORKFORCE_BY_ID = new Map(WORKFORCE_ROSTER.map((t) => [t.id, t]));

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sectorFilter, setSectorFilter] = useState<SectorFilter>('all');
  const [projectSearch, setProjectSearch] = useState('');
  const [activeDossier, setActiveDossier] = useState<ProjectDossier | null>(null);

  // Executive Portrait & Company Logo State
  const [customPortrait, setCustomPortrait] = useState<string | null>(null);
  const portraitInputRef = useRef<HTMLInputElement | null>(null);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // Firebase Auth & Cloud Portfolio Settings State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [cloudSettings, setCloudSettings] = useState<CloudPortfolioState>({
    nameEn: EXECUTIVE_PROFILE.name.en,
    nameAr: EXECUTIVE_PROFILE.name.ar,
    roleEn: EXECUTIVE_PROFILE.role.en,
    roleAr: EXECUTIVE_PROFILE.role.ar,
    companyEn: EXECUTIVE_PROFILE.company.en,
    companyAr: EXECUTIVE_PROFILE.company.ar,
    email: EXECUTIVE_PROFILE.email,
    phone: EXECUTIVE_PROFILE.phone,
    regionEn: EXECUTIVE_PROFILE.region.en,
    regionAr: EXECUTIVE_PROFILE.region.ar,
    bioEn: EXECUTIVE_PROFILE.bio.en,
    bioAr: EXECUTIVE_PROFILE.bio.ar,
    aramcoVendorId: '#10048921 (Active)',
    iktvaScore: '74.2% Certified',
    portraitDataUrl: '',
    logoDataUrl: '',
  });
  const [companyProfileDoc, setCompanyProfileDoc] = useState<CompanyProfileDocState>({
    crNumber: 'CR #2050148920 — Eastern Province, KSA',
    headquartersEn:
      'King Salman Industrial Road, Support Industrial Area II, Dhahran / Jubail, Kingdom of Saudi Arabia',
    headquartersAr:
      'طريق الملك سلمان الصناعي، المنطقة الصناعية المساندة الثانية، الظهران / الجبيل، المملكة العربية السعودية',
    companyOverviewEn:
      'MADA AL-GHUROUB GENERAL CONTRACTING COMPANY is a premier Saudi general contracting and certified technical manpower supply enterprise delivering turnkey civil engineering, oil & gas shutdown maintenance, 6G certified welding teams, and Ajeer-compliant industrial workforce solutions across Dhahran, Jubail, Yanbu, Riyadh, and NEOM.',
    companyOverviewAr:
      'شركة مدى الغروب للمقاولات العامة هي شركة سعودية رائدة في مجال المقاولات العامة وتوريد القوى العاملة الفنية المعتمدة، متخصصة في المشاريع المدنية وصيانة المصانع والبتروكيماويات وتوفير الكوادر الهندسية واللحامين المعتمدين بنظام أجير في الظهران والجبيل وينبع والرياض ونيوم.',
    externalPdfUrl: '',
    uploadedFileName: '',
    uploadedFileDataUrl: '',
  });

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    const configRef = doc(db, 'portfolio_config', 'main');
    const unsubDoc = onSnapshot(
      configRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<CloudPortfolioState>;
          const normalizeRoleEn = (val?: string) =>
            val ? val.replace(/Game Development Manager/gi, 'Business Development Manager') : '';
          const normalizeRoleAr = (val?: string) =>
            val
              ? val
                  .replace(/Game Development Manager/gi, 'Business Development Manager')
                  .replace(/مدير تطوير الألعاب/g, 'مدير تطوير الأعمال')
              : '';
          setCloudSettings((prev) => ({
            nameEn: data.nameEn || prev.nameEn,
            nameAr: data.nameAr || prev.nameAr,
            roleEn: normalizeRoleEn(data.roleEn) || prev.roleEn,
            roleAr: normalizeRoleAr(data.roleAr) || prev.roleAr,
            companyEn: data.companyEn || prev.companyEn,
            companyAr: data.companyAr || prev.companyAr,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            regionEn: data.regionEn || prev.regionEn,
            regionAr: data.regionAr || prev.regionAr,
            bioEn: normalizeRoleEn(data.bioEn) || prev.bioEn,
            bioAr: normalizeRoleAr(data.bioAr) || prev.bioAr,
            aramcoVendorId: data.aramcoVendorId || prev.aramcoVendorId,
            iktvaScore: data.iktvaScore || prev.iktvaScore,
            portraitDataUrl: data.portraitDataUrl ?? prev.portraitDataUrl,
            logoDataUrl: data.logoDataUrl ?? prev.logoDataUrl,
          }));
        }
      },
      (err) => {
        console.warn('Firestore portfolio_config listener info:', err.message);
      }
    );

    const profileDocRef = doc(db, 'company_profile_doc', 'main');
    const unsubProfileDoc = onSnapshot(
      profileDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<CompanyProfileDocState>;
          setCompanyProfileDoc((prev) => ({
            crNumber: data.crNumber || prev.crNumber,
            headquartersEn: data.headquartersEn || prev.headquartersEn,
            headquartersAr: data.headquartersAr || prev.headquartersAr,
            companyOverviewEn: data.companyOverviewEn || prev.companyOverviewEn,
            companyOverviewAr: data.companyOverviewAr || prev.companyOverviewAr,
            externalPdfUrl: data.externalPdfUrl ?? prev.externalPdfUrl,
            uploadedFileName: data.uploadedFileName ?? prev.uploadedFileName,
            uploadedFileDataUrl: data.uploadedFileDataUrl ?? prev.uploadedFileDataUrl,
          }));
        }
      },
      (err) => {
        console.warn('Firestore company_profile_doc listener info:', err.message);
      }
    );

    return () => {
      unsubAuth();
      unsubDoc();
      unsubProfileDoc();
    };
  }, []);

  useEffect(() => {
    try {
      const savedPortrait = localStorage.getItem(PORTRAIT_STORAGE_KEY);
      if (savedPortrait) {
        setCustomPortrait(savedPortrait);
      }
      const savedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
      if (savedLogo) {
        setCustomLogo(savedLogo);
      }
    } catch {
      // Ignore storage access errors in restricted frames
    }

    const handleSecretShortcut = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        portraitInputRef.current?.click();
      } else if (e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setAdminModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleSecretShortcut);
    return () => window.removeEventListener('keydown', handleSecretShortcut);
  }, []);

  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomPortrait(reader.result);
        try {
          localStorage.setItem(PORTRAIT_STORAGE_KEY, reader.result);
        } catch {
          // Ignore quota errors
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomLogo(reader.result);
        try {
          localStorage.setItem(LOGO_STORAGE_KEY, reader.result);
        } catch {
          // Ignore quota errors
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const activePortraitSrc =
    cloudSettings.portraitDataUrl || customPortrait || ASSETS.moynaPortrait;
  const activeLogoSrc = cloudSettings.logoDataUrl || customLogo || ASSETS.companyLogo;
  const activeName = lang === 'en' ? cloudSettings.nameEn : cloudSettings.nameAr;
  const activeRole = lang === 'en' ? cloudSettings.roleEn : cloudSettings.roleAr;
  const activeCompany = lang === 'en' ? cloudSettings.companyEn : cloudSettings.companyAr;
  const activeRegion = lang === 'en' ? cloudSettings.regionEn : cloudSettings.regionAr;
  const activeBio = lang === 'en' ? cloudSettings.bioEn : cloudSettings.bioAr;
  const activeEmail = cloudSettings.email;
  const activePhone = cloudSettings.phone;

  // Workforce Matrix State
  const [disciplineFilter, setDisciplineFilter] = useState<DisciplineFilterType>('all');
  const [selectedTrades, setSelectedTrades] = useState<SelectedWorkforceMap>({
    'wf-01': 45,
    'wf-03': 12,
  });

  // Tender / RFQ Form State
  const [organization, setOrganization] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('Jubail / Eastern Province Corridor');
  const [contractPackageType, setContractPackageType] = useState('Turnkey EPC Contracting');
  const [estimatedBudgetSAR, setEstimatedBudgetSAR] = useState('SAR 100M – 500M');
  const [mobilizationTimeline] = useState('Immediate (Within 30 Days)');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'Civil Construction Manpower (Carpenters, Steel Fixers, Masons & Helpers)',
    'Oil, Gas & Petrochemical Shutdown Manpower (6G Welders & Pipefitters)',
  ]);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [tenderReceipt, setTenderReceipt] = useState<SubmittedTenderReceipt | null>(null);

  const isRTL = lang === 'ar';

  // Filtered Project Dossiers
  const filteredProjects = useMemo(() => {
    return PROJECT_DOSSIERS.filter((project) => {
      const matchesSector = sectorFilter === 'all' || project.sector === sectorFilter;
      const query = projectSearch.trim().toLowerCase();
      if (!query) return matchesSector;
      const matchesQuery =
        project.title.en.toLowerCase().includes(query) ||
        project.title.ar.toLowerCase().includes(query) ||
        project.contractCode.toLowerCase().includes(query) ||
        project.location.en.toLowerCase().includes(query) ||
        project.location.ar.toLowerCase().includes(query);
      return matchesSector && matchesQuery;
    });
  }, [sectorFilter, projectSearch]);

  // Filtered Workforce Roster
  const filteredWorkforce = useMemo(() => {
    return WORKFORCE_ROSTER.filter((row) =>
      disciplineFilter === 'all' ? true : row.discipline === disciplineFilter
    );
  }, [disciplineFilter]);

  // Workforce Requisition Summary Totals
  const workforceSummary = useMemo(() => {
    let totalHeadcount = 0;
    let dailyTotalSAR = 0;
    const items: { code: string; title: string; headcount: number; dailyRateSAR: number }[] = [];

    Object.entries(selectedTrades).forEach(([tradeId, count]) => {
      if (count > 0) {
        const trade = WORKFORCE_BY_ID.get(tradeId);
        if (trade) {
          totalHeadcount += count;
          dailyTotalSAR += count * trade.dailyRateSAR;
          items.push({
            code: trade.code,
            title: trade.tradeTitle[lang],
            headcount: count,
            dailyRateSAR: trade.dailyRateSAR,
          });
        }
      }
    });

    return {
      totalHeadcount,
      dailyTotalSAR,
      monthlyEstimateSAR: dailyTotalSAR * 26,
      items,
    };
  }, [selectedTrades, lang]);

  const toggleTradeSelection = useCallback((tradeId: string, defaultCount = 25) => {
    setSelectedTrades((prev) => {
      const next = { ...prev };
      if (next[tradeId]) {
        delete next[tradeId];
      } else {
        next[tradeId] = defaultCount;
      }
      return next;
    });
  }, []);

  const updateTradeHeadcount = useCallback((tradeId: string, count: number) => {
    const trade = WORKFORCE_BY_ID.get(tradeId);
    const maxPool = trade ? trade.availablePool : 1200;
    const clamped = Math.max(1, Math.min(maxPool, count || 1));
    setSelectedTrades((prev) => ({
      ...prev,
      [tradeId]: clamped,
    }));
  }, []);

  const toggleScopeItem = useCallback((scopeLabel: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeLabel) ? prev.filter((s) => s !== scopeLabel) : [...prev, scopeLabel]
    );
  }, []);

  const handleCapabilitySelect = useCallback((sector: Exclude<SectorFilter, 'all'>) => {
    setSectorFilter(sector);
    const el = document.getElementById('project-dossiers');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleRequestSimilarScope = useCallback(
    (dossier: ProjectDossier) => {
      setActiveDossier(null);
      setContractPackageType('Turnkey EPC Contracting');
      setNotes(
        lang === 'en'
          ? `Attention: Moyna Miah (Business Development Manager — MADA AL-GHUROUB GENERAL CONTRACTING COMPANY) — Reference Benchmark Dossier: ${dossier.contractCode} (${dossier.title.en}). Requesting technical pre-qualification and commercial tender schedule.`
          : `عناية: معين مياه (مدير تطوير الأعمال والمشاريع — شركة مدى الغروب للمقاولات العامة) — ملف المشروع المرجعي: ${dossier.contractCode} (${dossier.title.ar}). نرجو تزويدنا بجدول التأهيل الفني والعرض التجاري.`
      );
      const rfqSection = document.getElementById('procurement-rfq');
      if (rfqSection) {
        rfqSection.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [lang]
  );

  const handleCloseDossier = useCallback(() => setActiveDossier(null), []);
  const handleCloseAdminModal = useCallback(() => setAdminModalOpen(false), []);
  const handleOpenAdminModal = useCallback(() => setAdminModalOpen(true), []);
  const handleToggleLanguage = useCallback(
    () => setLang((prev) => (prev === 'en' ? 'ar' : 'en')),
    []
  );
  const handleToggleMobileMenu = useCallback(
    () => setMobileMenuOpen((prev) => !prev),
    []
  );
  const handleCloseMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const handleTriggerPortraitUpload = useCallback(
    () => portraitInputRef.current?.click(),
    []
  );
  const handleResetTenderReceipt = useCallback(() => setTenderReceipt(null), []);

  const handleAttachWorkforceToRFQ = useCallback(() => {
    const defaultScope =
      'Civil Construction Manpower (Carpenters, Steel Fixers, Masons & Helpers)';
    setSelectedScopes((prev) => (prev.length === 0 ? [defaultScope] : prev));
    const summaryLines = workforceSummary.items
      .map((item) => `${item.code}: ${item.headcount} personnel (${item.title})`)
      .join('; ');
    setNotes((prev) => {
      const prefix =
        lang === 'en'
          ? `Attached Technical Manpower Requisition for Business Development Manager Review (${workforceSummary.totalHeadcount} total personnel): ${summaryLines}.`
          : `جدول القوى العاملة الفنية المرفق لمراجعة مدير تطوير الأعمال والمشاريع (${workforceSummary.totalHeadcount} كادر فني): ${summaryLines}.`;
      return prev ? `${prev}\n\n${prefix}` : prefix;
    });
    const rfqSection = document.getElementById('procurement-rfq');
    if (rfqSection) {
      rfqSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lang, workforceSummary]);

  const handleTenderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!organization.trim() || !contactName.trim()) {
      setFormError(
        lang === 'en'
          ? 'Please enter both the Contracting Entity / Organization name and Principal Contact name.'
          : 'يرجى إدخال اسم الجهة المتعاقدة واسم المسؤول المفوض.'
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFormError(
        lang === 'en'
          ? 'Please provide a valid corporate or government email address.'
          : 'يرجى إدخال بريد إلكتروني رسمي صحيح.'
      );
      return;
    }

    const phoneClean = phone.replace(/[\s\-()]/g, '');
    if (phoneClean.length < 8) {
      setFormError(
        lang === 'en'
          ? 'Please provide a valid direct telephone or mobile number (minimum 8 digits).'
          : 'يرجى إدخال رقم هاتف مباشر صحيح (8 أرقام على الأقل).'
      );
      return;
    }

    if (selectedScopes.length === 0) {
      setFormError(
        lang === 'en'
          ? 'Please select at least one engineering or workforce scope package.'
          : 'يرجى اختيار نطاق هندسي أو تشغيلي واحد على الأقل.'
      );
      return;
    }

    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const referenceId = `RFQ-MM-2026-${randomCode}`;
    const timestampDisplay = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' AST';

    const receipt: SubmittedTenderReceipt = {
      referenceId,
      timestamp: timestampDisplay,
      organization: organization.trim(),
      contactName: contactName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      region,
      contractPackageType,
      estimatedBudgetSAR,
      mobilizationTimeline,
      selectedScopes,
      attachedTrades: workforceSummary.items,
      notes: notes.trim(),
    };

    const docPath = `tender_inquiries/${referenceId}`;
    try {
      const attachedTradesSummary = workforceSummary.items
        .map((t) => `[${t.code}] ${t.title}: ${t.headcount} personnel @ SAR ${t.dailyRateSAR}/day`)
        .join(' | ')
        .slice(0, 1500);

      await setDoc(doc(db, 'tender_inquiries', referenceId), {
        referenceId: referenceId.slice(0, 40),
        timestampDisplay: timestampDisplay.slice(0, 40),
        organization: receipt.organization.slice(0, 180),
        contactName: receipt.contactName.slice(0, 140),
        email: receipt.email.slice(0, 160),
        phone: receipt.phone.slice(0, 60),
        region: receipt.region.slice(0, 140),
        contractPackageType: receipt.contractPackageType.slice(0, 120),
        estimatedBudgetSAR: receipt.estimatedBudgetSAR.slice(0, 80),
        mobilizationTimeline: receipt.mobilizationTimeline.slice(0, 80),
        selectedScopesSummary: receipt.selectedScopes.join(' · ').slice(0, 1200),
        attachedTradesSummary,
        notes: receipt.notes.slice(0, 2000),
        status: 'new',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }

    setTenderReceipt(receipt);
  };

  const handleDownloadReceipt = useCallback(() => {
    if (!tenderReceipt) return;
    const content = [
      'MOYNA MIAH (BUSINESS DEVELOPMENT MANAGER) — OFFICIAL TENDER / RFQ RECEIPT',
      'MADA AL-GHUROUB GENERAL CONTRACTING COMPANY',
      '========================================================================',
      `Tender Reference ID : ${tenderReceipt.referenceId}`,
      `Submission Timestamp: ${tenderReceipt.timestamp}`,
      `Executive Desk      : Moyna Miah — Business Development Manager`,
      `Company             : MADA AL-GHUROUB GENERAL CONTRACTING COMPANY`,
      `Contracting Entity  : ${tenderReceipt.organization}`,
      `Authorized Contact  : ${tenderReceipt.contactName}`,
      `Official Email      : ${tenderReceipt.email}`,
      `Direct Phone        : ${tenderReceipt.phone}`,
      `Corridor / Region   : ${tenderReceipt.region}`,
      `Contract Model      : ${tenderReceipt.contractPackageType}`,
      `Estimated CapEx     : ${tenderReceipt.estimatedBudgetSAR}`,
      `Target Mobilization : ${tenderReceipt.mobilizationTimeline}`,
      '',
      'SELECTED EPC & WORKFORCE SCOPES:',
      ...tenderReceipt.selectedScopes.map((s) => `  - ${s}`),
      '',
      'ATTACHED TECHNICAL MANPOWER SCHEDULE:',
      ...(tenderReceipt.attachedTrades.length > 0
        ? tenderReceipt.attachedTrades.map(
            (t) => `  - [${t.code}] ${t.title}: ${t.headcount} personnel @ SAR ${t.dailyRateSAR}/day`
          )
        : ['  - Standard EPC project staffing (no custom trade roster attached)']),
      '',
      'TECHNICAL NOTES / BOQ REFERENCE:',
      tenderReceipt.notes || 'None provided.',
      '========================================================================',
      'Dhahran Industrial HQ · Jubail · Yanbu · Riyadh · Tabuk Corridor',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tenderReceipt.referenceId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [tenderReceipt]);

  return (
    <div
      id="top"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-white text-[#121c2a] overflow-x-hidden"
    >
      {/* Hidden File Input for Instant Company Logo Upload */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoUpload}
        className="hidden"
        aria-label="Upload company logo"
      />

      {/* Hidden File Input for Secret Personal Portrait Upload (Double-click portrait or Shift+P) */}
      <input
        ref={portraitInputRef}
        type="file"
        accept="image/*"
        onChange={handlePortraitUpload}
        className="hidden"
        aria-label="Upload personal portrait"
      />

      {/* Top Navigation & Mobile Drawer */}
      <NavbarHeader
        lang={lang}
        isRTL={isRTL}
        mobileMenuOpen={mobileMenuOpen}
        activePortraitSrc={activePortraitSrc}
        activeName={activeName}
        activeRole={activeRole}
        activeCompany={activeCompany}
        onToggleLanguage={handleToggleLanguage}
        onToggleMobileMenu={handleToggleMobileMenu}
        onCloseMobileMenu={handleCloseMobileMenu}
        onTriggerPortraitUpload={handleTriggerPortraitUpload}
      />

      {/* Hero Section & Quantified KPI Modules */}
      <HeroSection
        lang={lang}
        isRTL={isRTL}
        activePortraitSrc={activePortraitSrc}
        activeLogoSrc={activeLogoSrc}
        activeName={activeName}
        activeRole={activeRole}
        activeCompany={activeCompany}
        activeRegion={activeRegion}
        activeBio={activeBio}
        activeEmail={activeEmail}
        activePhone={activePhone}
        aramcoVendorId={cloudSettings.aramcoVendorId}
        iktvaScore={cloudSettings.iktvaScore}
        onTriggerPortraitUpload={handleTriggerPortraitUpload}
      />

      {/* Executive Leadership Track Record */}
      <ExecutiveProfileSection
        lang={lang}
        activeLogoSrc={activeLogoSrc}
        activeName={activeName}
        activeRole={activeRole}
        activeCompany={activeCompany}
      />

      {/* 01. Core Manpower Supply & Contracting Divisions */}
      <CapabilitiesSection
        lang={lang}
        sectorFilter={sectorFilter}
        onSelectCapability={handleCapabilitySelect}
      />

      {/* 02. Executed Project Dossiers */}
      <ProjectDossiersSection
        lang={lang}
        sectorFilter={sectorFilter}
        projectSearch={projectSearch}
        filteredProjects={filteredProjects}
        onSetSectorFilter={setSectorFilter}
        onSetProjectSearch={setProjectSearch}
        onOpenDossier={setActiveDossier}
      />

      {/* 03. Specialized Workforce Logistics & Allocation Matrix */}
      <WorkforceMatrixSection
        lang={lang}
        isRTL={isRTL}
        disciplineFilter={disciplineFilter}
        filteredWorkforce={filteredWorkforce}
        selectedTrades={selectedTrades}
        workforceSummary={workforceSummary}
        onSetDisciplineFilter={setDisciplineFilter}
        onToggleTradeSelection={toggleTradeSelection}
        onUpdateTradeHeadcount={updateTradeHeadcount}
        onAttachWorkforceToRFQ={handleAttachWorkforceToRFQ}
      />

      {/* 03A. Interactive Workforce Analytics, Charts & Regional Capacity Graphs */}
      <AnalyticsChartsSection lang={lang} />

      {/* 03B & 04. Field Operations Gallery & Regulatory Governance */}
      <FieldOperationsAndGovernanceSection lang={lang} />

      {/* 05. Direct Manpower Requisition & Tender RFQ Portal */}
      <ProcurementRfqSection
        lang={lang}
        activePortraitSrc={activePortraitSrc}
        activeLogoSrc={activeLogoSrc}
        activeName={activeName}
        activeRole={activeRole}
        activeCompany={activeCompany}
        activeEmail={activeEmail}
        activePhone={activePhone}
        organization={organization}
        contactName={contactName}
        email={email}
        phone={phone}
        region={region}
        estimatedBudgetSAR={estimatedBudgetSAR}
        selectedScopes={selectedScopes}
        notes={notes}
        formError={formError}
        tenderReceipt={tenderReceipt}
        onSetOrganization={setOrganization}
        onSetContactName={setContactName}
        onSetEmail={setEmail}
        onSetPhone={setPhone}
        onSetRegion={setRegion}
        onSetEstimatedBudgetSAR={setEstimatedBudgetSAR}
        onToggleScopeItem={toggleScopeItem}
        onSetNotes={setNotes}
        onSubmitTender={handleTenderSubmit}
        onDownloadReceipt={handleDownloadReceipt}
        onResetTenderReceipt={handleResetTenderReceipt}
        onTriggerPortraitUpload={handleTriggerPortraitUpload}
      />

      {/* Quiet Architectural Footer */}
      <FooterSection
        lang={lang}
        activeLogoSrc={activeLogoSrc}
        activeName={activeName}
        activeRole={activeRole}
        activeCompany={activeCompany}
        activeRegion={activeRegion}
        onOpenAdminModal={handleOpenAdminModal}
      />

      {/* Level-3 Architectural Dossier Modal */}
      <DossierModal
        dossier={activeDossier}
        lang={lang}
        onClose={handleCloseDossier}
        onRequestSimilarScope={handleRequestSimilarScope}
      />

      {/* Cloud Admin Settings Modal (Gmail Authenticated Owner Only) */}
      {adminModalOpen && (
        <AdminSettingsModal
          isOpen={adminModalOpen}
          onClose={handleCloseAdminModal}
          lang={lang}
          currentUser={currentUser}
          currentSettings={cloudSettings}
          currentCompanyProfile={companyProfileDoc}
          defaultPortraitUrl={ASSETS.moynaPortrait}
          defaultLogoUrl={ASSETS.companyLogo}
          onSaved={setCloudSettings}
          onCompanyProfileSaved={setCompanyProfileDoc}
        />
      )}
    </div>
  );
}
