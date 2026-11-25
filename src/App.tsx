import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { useCloudPortfolio } from './hooks/useCloudPortfolio';
import { downloadOfficialTenderReceipt } from './utils/tenderReceiptFormatter';
import {
  submitRfqInquiry,
  RFQ_COOLDOWN_MS,
  type PendingTenderSubmission,
} from './utils/rfqSubmission';
import {
  ASSETS,
  PROJECT_DOSSIERS,
  WORKFORCE_ROSTER,
  Language,
  SectorFilter,
  ProjectDossier,
  EquipmentRentalItem,
} from './data/industrialData';
import {
  NavbarHeader,
  HeroSection,
  ExecutiveProfileSection,
  CapabilitiesSection,
  ProjectDossiersSection,
  WorkforceMatrixSection,
  DisciplineFilterType,
  SelectedWorkforceMap,
  EquipmentRentalSection,
  AnalyticsChartsSection,
  FieldOperationsAndGovernanceSection,
  ProcurementRfqSection,
  SubmittedTenderReceipt,
  FooterSection,
  DossierModal,
} from './components';

const WORKFORCE_BY_ID = new Map(WORKFORCE_ROSTER.map((trade) => [trade.id, trade]));
const RFQ_COOLDOWN_STORAGE_KEY = 'mgcc_last_rfq_submit_at_v1';

function readLastRfqSubmitTimestamp(): number {
  try {
    const raw = sessionStorage.getItem(RFQ_COOLDOWN_STORAGE_KEY);
    if (!raw) return 0;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export default function App() {
  // ---------------------------------------------------------------------------
  // 1. UI Navigation & Filtering State
  // ---------------------------------------------------------------------------
  const [lang, setLang] = useState<Language>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sectorFilter, setSectorFilter] = useState<SectorFilter>('all');
  const [projectSearch, setProjectSearch] = useState('');
  const [activeDossier, setActiveDossier] = useState<ProjectDossier | null>(null);

  // ---------------------------------------------------------------------------
  // 2. Cloud Portfolio & Executive Identity Hook
  // ---------------------------------------------------------------------------
  const { cloudSettings } = useCloudPortfolio();

  const isRTL = lang === 'ar';
  const activePortraitSrc = cloudSettings.portraitDataUrl || ASSETS.moynaPortrait;
  const activeLogoSrc = cloudSettings.logoDataUrl || ASSETS.companyLogo;
  const activeName = lang === 'en' ? cloudSettings.nameEn : cloudSettings.nameAr;
  const activeRole = lang === 'en' ? cloudSettings.roleEn : cloudSettings.roleAr;
  const activeCompany = lang === 'en' ? cloudSettings.companyEn : cloudSettings.companyAr;
  const activeRegion = lang === 'en' ? cloudSettings.regionEn : cloudSettings.regionAr;
  const activeBio = lang === 'en' ? cloudSettings.bioEn : cloudSettings.bioAr;
  const activeEmail = cloudSettings.email;
  const activePhone = cloudSettings.phone;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [lang, isRTL]);

  // ---------------------------------------------------------------------------
  // 3. Workforce Allocation Matrix State
  // ---------------------------------------------------------------------------
  const [disciplineFilter, setDisciplineFilter] = useState<DisciplineFilterType>('all');
  const [selectedTrades, setSelectedTrades] = useState<SelectedWorkforceMap>({
    'wf-01': 45,
    'wf-03': 12,
  });

  // ---------------------------------------------------------------------------
  // 4. Tender & Manpower Requisition (RFQ) Form State
  // ---------------------------------------------------------------------------
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
  const [honeypotWebsite, setHoneypotWebsite] = useState('');
  const lastRfqSubmitAtRef = useRef<number>(readLastRfqSubmitTimestamp());
  const isSubmittingRfqRef = useRef<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmittingTender, setIsSubmittingTender] = useState(false);
  const [tenderReceipt, setTenderReceipt] = useState<SubmittedTenderReceipt | null>(null);
  const [tenderPending, setTenderPending] = useState<PendingTenderSubmission | null>(null);

  // ---------------------------------------------------------------------------
  // 5. Memoized Selectors (Filtered Projects, Workforce & Financial Summary)
  // ---------------------------------------------------------------------------
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

  const filteredWorkforce = useMemo(() => {
    return WORKFORCE_ROSTER.filter((row) =>
      disciplineFilter === 'all' ? true : row.discipline === disciplineFilter
    );
  }, [disciplineFilter]);

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

  // ---------------------------------------------------------------------------
  // 7. Interactive Handlers & Callbacks
  // ---------------------------------------------------------------------------
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
    document.getElementById('project-dossiers')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleRequestSimilarScope = useCallback(
    (dossier: ProjectDossier) => {
      setActiveDossier(null);
      setContractPackageType('Turnkey EPC Contracting');
      setNotes(
        lang === 'en'
          ? `Attention: ${activeName} (${activeRole} — ${activeCompany}) — Reference Benchmark Dossier: ${dossier.contractCode} (${dossier.title.en}). Requesting technical pre-qualification and commercial tender schedule.`
          : `عناية: ${activeName} (${activeRole} — ${activeCompany}) — ملف المشروع المرجعي: ${dossier.contractCode} (${dossier.title.ar}). نرجو تزويدنا بجدول التأهيل الفني والعرض التجاري.`
      );
      document.getElementById('procurement-rfq')?.scrollIntoView({ behavior: 'smooth' });
    },
    [lang, activeName, activeRole, activeCompany]
  );

  const handleCloseDossier = useCallback(() => setActiveDossier(null), []);
  const handleToggleLanguage = useCallback(
    () => setLang((prev) => (prev === 'en' ? 'ar' : 'en')),
    []
  );
  const handleToggleMobileMenu = useCallback(
    () => setMobileMenuOpen((prev) => !prev),
    []
  );
  const handleCloseMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const handleResetTenderReceipt = useCallback(() => setTenderReceipt(null), []);
  const handleResetTenderPending = useCallback(() => setTenderPending(null), []);

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

    document.getElementById('procurement-rfq')?.scrollIntoView({ behavior: 'smooth' });
  }, [lang, workforceSummary]);

  const handleRequestEquipmentQuote = useCallback(
    (item: EquipmentRentalItem, rentalDuration: 'daily' | 'monthly' = 'monthly') => {
      const equipmentScope =
        'Industrial Support & Equipment Operations (Crane & Heavy Equipment Operators)';
      setSelectedScopes((prev) =>
        prev.includes(equipmentScope) ? prev : [...prev, equipmentScope]
      );
      setContractPackageType('Equipment Rental & Heavy Plant Leasing');
      setNotes((prev) => {
        const rateText =
          rentalDuration === 'daily' ? item.dailyRateRangeSAR : item.monthlyRateRangeSAR;
        const line =
          lang === 'en'
            ? `Equipment Rental Requisition [${item.code}]: ${item.title.en} (${item.subtitle.en}) — Selected Rate (${rentalDuration.toUpperCase()}): ${rateText}. Includes certified operator & field maintenance.`
            : `طلب استئجار معدات ثقيلة [${item.code}]: ${item.title.ar} (${item.subtitle.ar}) — السعر المختار (${rentalDuration === 'daily' ? 'يومي' : 'شهري'}): ${rateText}. شامل المشغل المعتمد والصيانة الميدانية.`;
        return prev ? `${prev}\n\n${line}` : line;
      });
      document.getElementById('procurement-rfq')?.scrollIntoView({ behavior: 'smooth' });
    },
    [lang]
  );

  const handleTenderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRfqRef.current || isSubmittingTender) return;
    setFormError(null);
    setIsSubmittingTender(true);

    try {
      const result = await submitRfqInquiry({
        input: {
          organization,
          contactName,
          email,
          phone,
          region,
          contractPackageType,
          estimatedBudgetSAR,
          mobilizationTimeline,
          selectedScopes,
          attachedTrades: workforceSummary.items,
          notes,
          honeypotWebsite,
        },
        lang,
        inFlightRef: isSubmittingRfqRef,
        lastConfirmedSubmitAtMs: lastRfqSubmitAtRef.current,
        cooldownMs: RFQ_COOLDOWN_MS,
        createTimestampValue: () => serverTimestamp(),
        writeInquiry: async (referenceId, payload) => {
          await setDoc(doc(db, 'tender_inquiries', referenceId), payload);
        },
      });

      if (result.status === 'confirmed') {
        lastRfqSubmitAtRef.current = result.submittedAtMs;
        try {
          sessionStorage.setItem(RFQ_COOLDOWN_STORAGE_KEY, String(result.submittedAtMs));
        } catch {
          // Ignore sessionStorage restrictions in private/embedded frames
        }
        setTenderPending(null);
        setTenderReceipt(result.receipt);
        setHoneypotWebsite('');
      } else if (result.status === 'pending') {
        setTenderReceipt(null);
        setTenderPending(result.pending);
      } else {
        if (result.code === 'firestore_error' && result.originalError) {
          try {
            handleFirestoreError(result.originalError, OperationType.CREATE, 'tender_inquiries');
          } catch {
            // Structured error logged by handleFirestoreError; surface clean UI feedback instead
          }
        }
        setFormError(result.message);
      }
    } finally {
      setIsSubmittingTender(false);
    }
  };

  const handleDownloadReceipt = useCallback(() => {
    if (!tenderReceipt) return;
    downloadOfficialTenderReceipt(tenderReceipt, {
      executiveName: activeName,
      executiveRole: activeRole,
      companyName: activeCompany,
    });
  }, [tenderReceipt, activeName, activeRole, activeCompany]);

  // ---------------------------------------------------------------------------
  // 8. Main Application Layout
  // ---------------------------------------------------------------------------
  return (
    <div
      id="top"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-white text-[#121c2a] overflow-x-hidden"
    >
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

      {/* 03A. Dedicated Heavy Equipment & Plant Machinery Rental Fleet Division */}
      <EquipmentRentalSection
        lang={lang}
        isRTL={isRTL}
        onRequestEquipmentQuote={handleRequestEquipmentQuote}
      />

      {/* 03B. Interactive Workforce Analytics, Charts & Regional Capacity Graphs */}
      <AnalyticsChartsSection lang={lang} />

      {/* Field Operations Gallery & 05. Regulatory Governance */}
      <FieldOperationsAndGovernanceSection
        lang={lang}
        iktvaScore={cloudSettings.iktvaScore}
      />

      {/* 06. Direct Manpower Requisition & Tender RFQ Portal */}
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
        honeypotWebsite={honeypotWebsite}
        formError={formError}
        isSubmitting={isSubmittingTender}
        tenderReceipt={tenderReceipt}
        tenderPending={tenderPending}
        onSetOrganization={setOrganization}
        onSetContactName={setContactName}
        onSetEmail={setEmail}
        onSetPhone={setPhone}
        onSetRegion={setRegion}
        onSetEstimatedBudgetSAR={setEstimatedBudgetSAR}
        onToggleScopeItem={toggleScopeItem}
        onSetNotes={setNotes}
        onSetHoneypotWebsite={setHoneypotWebsite}
        onSubmitTender={handleTenderSubmit}
        onDownloadReceipt={handleDownloadReceipt}
        onResetTenderReceipt={handleResetTenderReceipt}
        onResetTenderPending={handleResetTenderPending}
      />

      {/* Quiet Architectural Footer */}
      <FooterSection
        lang={lang}
        activeLogoSrc={activeLogoSrc}
        activeName={activeName}
        activeRole={activeRole}
        activeCompany={activeCompany}
        activeRegion={activeRegion}
        iktvaScore={cloudSettings.iktvaScore}
      />

      {/* Level-3 Architectural Dossier Modal */}
      <DossierModal
        dossier={activeDossier}
        lang={lang}
        onClose={handleCloseDossier}
        onRequestSimilarScope={handleRequestSimilarScope}
      />
    </div>
  );
}
