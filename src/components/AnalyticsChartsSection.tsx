import React, { useState, useMemo, memo } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Activity,
  BarChart3,
  Layers,
  Radar,
  Calendar,
  Award,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { Language } from '../data/industrialData';

interface AnalyticsChartsSectionProps {
  lang: Language;
}

type RegionFilter = 'all' | 'eastern' | 'central' | 'western';

const TRADE_CAPACITY_DATA = [
  {
    code: 'TRD-CIV',
    shortName: { en: 'Civil & Structural Crew', ar: 'كوادر الإنشاءات المدنية' },
    label: {
      en: 'Civil Construction (Carpenters, Steel Fixers, Masons & Helpers)',
      ar: 'الإنشاءات المدنية (نجارون، حدادون، بناؤون وعمالة عامة)',
    },
    deployed: 7850,
    totalCapacity: 8500,
    rateSAR: 390,
    slaHours: 48,
    passRate: 98.4,
    color: '#1E4FD8',
    region: 'central' as const,
  },
  {
    code: 'TRD-WLD',
    shortName: { en: 'ASME 6G Welders & Piping', ar: 'لحامو 6G وفنيو الأنابيب' },
    label: {
      en: 'Oil, Gas & Petrochemical (ASME 6G Welders & Pipefitters)',
      ar: 'النفط والغاز والبتروكيماويات (لحامو 6G وفنيو أنابيب)',
    },
    deployed: 4620,
    totalCapacity: 5000,
    rateSAR: 480,
    slaHours: 72,
    passRate: 99.1,
    color: '#00B8D4',
    region: 'eastern' as const,
  },
  {
    code: 'TRD-RIG',
    shortName: { en: 'TUV Rigging & CISRS Scaffold', ar: 'الرفع الثقيل والسقالات' },
    label: {
      en: 'Heavy Rigging, CISRS Scaffolding & Industrial E&I Crew',
      ar: 'الرفع الثقيل والسقالات المعتمدة والكهرباء والأجهزة الدقيقة',
    },
    deployed: 3480,
    totalCapacity: 3800,
    rateSAR: 620,
    slaHours: 60,
    passRate: 99.5,
    color: '#0A1F44',
    region: 'western' as const,
  },
  {
    code: 'TRD-HSE',
    shortName: { en: 'Aramco WPR & NEBOSH HSE', ar: 'تصاريح أرامكو والسلامة' },
    label: {
      en: 'Aramco WPR Permit Receivers, NEBOSH HSE & Camp Logistics',
      ar: 'مستلمو تصاريح العمل WPR وضباط السلامة وإدارة المعسكرات',
    },
    deployed: 2470,
    totalCapacity: 2650,
    rateSAR: 680,
    slaHours: 36,
    passRate: 100.0,
    color: '#F39C12',
    region: 'eastern' as const,
  },
];

const YEARLY_TRAJECTORY = [
  { year: '2021', workers: 6400, safeHoursM: 12.4, contractsSARB: 4.2, iktvaPct: 58.0, campsBeds: 2200 },
  { year: '2022', workers: 9200, safeHoursM: 19.8, contractsSARB: 6.8, iktvaPct: 63.5, campsBeds: 3400 },
  { year: '2023', workers: 12850, safeHoursM: 27.5, contractsSARB: 9.6, iktvaPct: 67.8, campsBeds: 4500 },
  { year: '2024', workers: 15900, safeHoursM: 35.1, contractsSARB: 12.3, iktvaPct: 71.0, campsBeds: 5400 },
  { year: '2025', workers: 17400, safeHoursM: 39.4, contractsSARB: 13.9, iktvaPct: 72.9, campsBeds: 5900 },
  { year: '2026', workers: 18420, safeHoursM: 42.6, contractsSARB: 14.8, iktvaPct: 74.2, campsBeds: 6200 },
];

const MONTHLY_2026_STACK = [
  { month: { en: 'Jan', ar: 'يناير' }, civil: 580, oilGas: 390, rigging: 240, hse: 160, target: 1300 },
  { month: { en: 'Feb', ar: 'فبراير' }, civil: 610, oilGas: 420, rigging: 265, hse: 175, target: 1400 },
  { month: { en: 'Mar', ar: 'مارس' }, civil: 660, oilGas: 460, rigging: 290, hse: 190, target: 1500 },
  { month: { en: 'Apr', ar: 'أبريل' }, civil: 640, oilGas: 490, rigging: 310, hse: 205, target: 1550 },
  { month: { en: 'May', ar: 'مايو' }, civil: 700, oilGas: 520, rigging: 335, hse: 220, target: 1680 },
  { month: { en: 'Jun', ar: 'يونيو' }, civil: 740, oilGas: 545, rigging: 350, hse: 235, target: 1780 },
  { month: { en: 'Jul', ar: 'يوليو' }, civil: 765, oilGas: 570, rigging: 365, hse: 245, target: 1850 },
  { month: { en: 'Aug', ar: 'أغسطس' }, civil: 790, oilGas: 590, rigging: 380, hse: 260, target: 1920 },
  { month: { en: 'Sep', ar: 'سبتمبر' }, civil: 820, oilGas: 620, rigging: 400, hse: 270, target: 2020 },
  { month: { en: 'Oct', ar: 'أكتوبر' }, civil: 860, oilGas: 650, rigging: 420, hse: 285, target: 2120 },
];

const RADAR_METRICS = [
  {
    key: 'ajeer',
    label: { en: 'Ajeer & Qiwa Legal Sync', ar: 'توثيق أجير وقوى' },
    companyScore: 100,
    industryAvg: 78,
  },
  {
    key: 'wps',
    label: { en: 'WPS Wage Protection', ar: 'حماية الأجور WPS' },
    companyScore: 100,
    industryAvg: 82,
  },
  {
    key: 'hse',
    label: { en: 'ISO 45001 HSE Index', ar: 'معيار السلامة المهنية' },
    companyScore: 99.4,
    industryAvg: 79,
  },
  {
    key: 'sla',
    label: { en: '72h Dispatch Speed', ar: 'سرعة التعبئة (72 ساعة)' },
    companyScore: 96.8,
    industryAvg: 68,
  },
  {
    key: 'iktva',
    label: { en: 'IKTVA & Nitaqat Tier', ar: 'مؤشر اكتفاء ونطاقات' },
    companyScore: 92.5,
    industryAvg: 64,
  },
  {
    key: 'retention',
    label: { en: 'Workforce Retention', ar: 'استقرار الكوادر بالموقع' },
    companyScore: 97.2,
    industryAvg: 74,
  },
];

const REGIONAL_HUBS = [
  {
    id: 'eastern' as const,
    hub: { en: 'Eastern Province (Jubail · Dhahran · Dammam)', ar: 'المنطقة الشرقية (الجبيل · الظهران · الدمام)' },
    short: { en: 'Eastern Hub', ar: 'الشرقية' },
    workforceShare: 46,
    activePersonnel: 8470,
    buses: 98,
    campBeds: 3100,
    color: '#00B8D4',
  },
  {
    id: 'central' as const,
    hub: { en: 'Central & Mega-Projects (Riyadh · NEOM · Tabuk)', ar: 'الوسطى والمشاريع الكبرى (الرياض · نيوم · تبوك)' },
    short: { en: 'Central & NEOM', ar: 'الرياض ونيوم' },
    workforceShare: 34,
    activePersonnel: 6260,
    buses: 72,
    campBeds: 1950,
    color: '#1E4FD8',
  },
  {
    id: 'western' as const,
    hub: { en: 'Western & Red Sea Corridor (Yanbu · Jeddah)', ar: 'القطاع الغربي والبحر الأحمر (ينبع · جدة)' },
    short: { en: 'Western Hub', ar: 'ينبع وجدة' },
    workforceShare: 20,
    activePersonnel: 3690,
    buses: 40,
    campBeds: 1150,
    color: '#F39C12',
  },
];

// Helper to create smooth cubic bezier SVG path through points
function buildSmoothBezierPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const curr = pts[i];
    const next = pts[i + 1];
    const ctrlX1 = curr.x + (next.x - curr.x) * 0.45;
    const ctrlY1 = curr.y;
    const ctrlX2 = curr.x + (next.x - curr.x) * 0.55;
    const ctrlY2 = next.y;
    d += ` C ${ctrlX1},${ctrlY1} ${ctrlX2},${ctrlY2} ${next.x},${next.y}`;
  }
  return d;
}

export const AnalyticsChartsSection: React.FC<AnalyticsChartsSectionProps> = memo(({ lang }) => {
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('all');
  const [selectedYearIdx, setSelectedYearIdx] = useState<number>(YEARLY_TRAJECTORY.length - 1);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(MONTHLY_2026_STACK.length - 1);
  const [chartMetric, setChartMetric] = useState<'workers' | 'safeHoursM' | 'contractsSARB'>('workers');
  const [showOverlayCurve, setShowOverlayCurve] = useState<boolean>(true);
  const [activeRadarIdx, setActiveRadarIdx] = useState<number>(0);

  // Interactive Forecasting Simulator state
  const [simWorkers, setSimWorkers] = useState<number>(350);
  const [simMonths, setSimMonths] = useState<number>(6);
  const [simTradeIdx, setSimTradeIdx] = useState<number>(1); // Default ASME 6G & Piping

  const filteredTrades = useMemo(
    () =>
      regionFilter === 'all'
        ? TRADE_CAPACITY_DATA
        : TRADE_CAPACITY_DATA.filter((t) => t.region === regionFilter),
    [regionFilter]
  );

  const activeYearData = YEARLY_TRAJECTORY[selectedYearIdx];
  const activeMonthData = MONTHLY_2026_STACK[selectedMonthIdx];

  // --- MODEL 01: Smooth Cubic-Bezier Dual-Curve SVG Geometry ---
  const svgWidth = 600;
  const svgHeight = 235;
  const padLeft = 46;
  const padRight = 38;
  const padTop = 28;
  const padBottom = 34;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const maxPrimaryVal =
    chartMetric === 'workers' ? 20000 : chartMetric === 'safeHoursM' ? 48 : 16;
  const maxSecondaryVal = 85; // IKTVA % scale

  const primaryPoints = YEARLY_TRAJECTORY.map((item, idx) => {
    const x = padLeft + (idx / (YEARLY_TRAJECTORY.length - 1)) * plotWidth;
    const val = item[chartMetric];
    const y = padTop + plotHeight - (val / maxPrimaryVal) * plotHeight;
    return { x, y, item, val, idx };
  });

  const secondaryPoints = YEARLY_TRAJECTORY.map((item, idx) => {
    const x = padLeft + (idx / (YEARLY_TRAJECTORY.length - 1)) * plotWidth;
    const val = item.iktvaPct;
    const y = padTop + plotHeight - (val / maxSecondaryVal) * plotHeight;
    return { x, y, val, idx };
  });

  const smoothLinePath = buildSmoothBezierPath(primaryPoints);
  const smoothAreaPath = `${smoothLinePath} L ${
    primaryPoints[primaryPoints.length - 1].x
  },${padTop + plotHeight} L ${primaryPoints[0].x},${padTop + plotHeight} Z`;
  const secondaryLinePath = buildSmoothBezierPath(secondaryPoints);

  // --- MODEL 02: 6-Axis Radar / Spider Chart Geometry ---
  const radarSize = 250;
  const radarCenter = radarSize / 2;
  const radarRadius = 86;

  const getRadarPoint = (index: number, valuePct: number) => {
    const angle = (Math.PI * 2 * index) / RADAR_METRICS.length - Math.PI / 2;
    const r = (valuePct / 100) * radarRadius;
    return {
      x: radarCenter + r * Math.cos(angle),
      y: radarCenter + r * Math.sin(angle),
      labelX: radarCenter + (radarRadius + 24) * Math.cos(angle),
      labelY: radarCenter + (radarRadius + 18) * Math.sin(angle),
    };
  };

  const companyPolygonPoints = RADAR_METRICS.map((m, idx) => {
    const pt = getRadarPoint(idx, m.companyScore);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  const benchmarkPolygonPoints = RADAR_METRICS.map((m, idx) => {
    const pt = getRadarPoint(idx, m.industryAvg);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  // --- MODEL 04: Multi-Ring Concentric Radial Gauge ---
  const outerRadius = 58;
  const outerCircumference = 2 * Math.PI * outerRadius;
  let cumulativePercent = 0;

  // --- MODEL 05: Live Workforce & Cost Estimator Math ---
  const simTrade = TRADE_CAPACITY_DATA[simTradeIdx];
  const workingDaysPerMonth = 26;
  const totalManHours = simWorkers * simMonths * workingDaysPerMonth * 10; // 10-hr standard shift
  const estimatedContractSAR = simWorkers * simMonths * workingDaysPerMonth * simTrade.rateSAR;
  const busesRequired = Math.ceil(simWorkers / 45);
  const hseOfficersRequired = Math.max(1, Math.ceil(simWorkers / 50));

  return (
    <section
      id="workforce-analytics"
      className="py-12 sm:py-16 lg:py-24 bg-white border-t border-[#8A94A6]/25 cv-auto"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-10">
        {/* Section Header + Executive Command Filter Bar */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 sm:gap-5 mb-8 sm:mb-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#1E4FD8] mb-2">
              <Activity className="w-3.5 h-3.5 text-[#00B8D4] shrink-0" />
              <span className="truncate">
                {lang === 'en'
                  ? 'Workforce & Operations Intelligence · KSA Industrial Corridors'
                  : 'تحليلات القوى العاملة والعمليات · المناطق الصناعية بالمملكة'}
              </span>
            </div>
            <h2 className="font-display text-[24px] leading-[32px] sm:text-[38px] sm:leading-[46px] font-bold tracking-[-0.015em] text-[#0A1F44]">
              {lang === 'en'
                ? 'Interactive Workforce Models, Radar Benchmarks & Dispatch Charts.'
                : 'نماذج تحليل القوى العاملة، رادار الامتثال ومخططات التعبئة الفورية.'}
            </h2>
          </div>

          {/* Interactive Regional Filter Bar (Responsive Grid on Mobile, Wrapped Flex on Tablet/Desktop) */}
          <div
            className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 p-1.5 bg-white border border-[#8A94A6]/35 rounded-[6px] shadow-xs w-full xl:w-auto max-w-full shrink-0"
            role="tablist"
            aria-label={lang === 'en' ? 'Filter analytics by region' : 'تصفية الإحصائيات حسب المنطقة'}
          >
            {(
              [
                { key: 'all', en: 'All KSA Corridors (18,420)', ar: 'كل مناطق المملكة (18,420)' },
                { key: 'eastern', en: 'Eastern Province (46%)', ar: 'المنطقة الشرقية (46%)' },
                { key: 'central', en: 'Riyadh & NEOM (34%)', ar: 'الرياض ونيوم (34%)' },
                { key: 'western', en: 'Yanbu & Red Sea (20%)', ar: 'ينبع والبحر الأحمر (20%)' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={regionFilter === tab.key}
                onClick={() => setRegionFilter(tab.key)}
                className={`min-h-[38px] px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-display font-semibold rounded-[4px] transition-all text-center cursor-pointer leading-snug ${
                  regionFilter === tab.key
                    ? 'bg-[#0A1F44] text-white shadow-xs'
                    : 'text-[#44464e] hover:text-[#0A1F44] hover:bg-[#F4F6F9]'
                }`}
              >
                {tab[lang]}
              </button>
            ))}
          </div>
        </div>

        {/* Top High-Contrast Executive Telemetry KPI Cards with Mini Sparklines */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
          <div className="bg-white rounded-[8px] border border-[#8A94A6]/25 p-4 sm:p-5 border-t-4 border-t-[#1E4FD8] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs text-[#44464e] font-semibold">
                {lang === 'en' ? 'Active Mobilized Workforce' : 'إجمالي القوى العاملة النشطة'}
              </span>
              <TrendingUp className="w-4 h-4 text-[#1E4FD8] shrink-0" />
            </div>
            <div className="my-2 flex items-baseline justify-between gap-2">
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A1F44] tabular-nums">
                18,420
              </div>
              <svg viewBox="0 0 70 24" className="w-16 h-6 overflow-visible">
                <polyline
                  fill="none"
                  stroke="#1E4FD8"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  points="2,20 15,16 28,12 42,8 55,5 68,2"
                />
                <circle cx="68" cy="2" r="3" fill="#00B8D4" />
              </svg>
            </div>
            <div className="text-[11px] font-mono text-[#007E94] font-semibold tabular-nums">
              {lang === 'en' ? '92.3% Utilization · +188% Since 2021' : 'نسبة التشغيل 92.3% · نمو +188%'}
            </div>
          </div>

          <div className="bg-white rounded-[8px] border border-[#8A94A6]/25 p-4 sm:p-5 border-t-4 border-t-[#00B8D4] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs text-[#44464e] font-semibold">
                {lang === 'en' ? 'Cumulative LTI-Free Hours' : 'ساعات العمل الآمنة بدون إصابات'}
              </span>
              <ShieldCheck className="w-4 h-4 text-[#00B8D4] shrink-0" />
            </div>
            <div className="my-2 flex items-baseline justify-between gap-2">
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A1F44] tabular-nums">
                42.6M
              </div>
              <svg viewBox="0 0 70 24" className="w-16 h-6 overflow-visible">
                <polyline
                  fill="none"
                  stroke="#00B8D4"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  points="2,21 16,18 30,13 44,9 56,5 68,2"
                />
                <circle cx="68" cy="2" r="3" fill="#0A1F44" />
              </svg>
            </div>
            <div className="text-[11px] font-mono text-[#007E94] font-semibold tabular-nums">
              {lang === 'en' ? '0.00 LTIFR · ISO 45001 Audited' : 'معدل إصابات 0.00 · معتمد ISO 45001'}
            </div>
          </div>

          <div className="bg-white rounded-[8px] border border-[#8A94A6]/25 p-4 sm:p-5 border-t-4 border-t-[#F39C12] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs text-[#44464e] font-semibold">
                {lang === 'en' ? 'Aramco IKTVA & Compliance' : 'مؤشر اكتفاء وتوثيق أجير'}
              </span>
              <Award className="w-4 h-4 text-[#F39C12] shrink-0" />
            </div>
            <div className="my-2 flex items-baseline justify-between gap-2">
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A1F44] tabular-nums">
                74.2%
              </div>
              <span className="text-[11px] font-mono font-bold text-[#0A1F44] bg-white px-2 py-0.5 rounded-[3px] border border-[#8A94A6]/30">
                100% AJEER
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#1E4FD8] font-semibold tabular-nums">
              {lang === 'en' ? 'Platinum Nitaqat · 100% WPS Sync' : 'النطاق البلاتيني · التزام كامل بالأجور'}
            </div>
          </div>

          <div className="bg-white rounded-[8px] border border-[#8A94A6]/25 p-4 sm:p-5 border-t-4 border-t-[#0A1F44] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs text-[#44464e] font-semibold">
                {lang === 'en' ? '72h Standby Reserve Pool' : 'الاحتياطي الجاهز للتعبئة (72 ساعة)'}
              </span>
              <Layers className="w-4 h-4 text-[#0A1F44] shrink-0" />
            </div>
            <div className="my-2 flex items-baseline justify-between gap-2">
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A1F44] tabular-nums">
                +1,530
              </div>
              <span className="text-[11px] font-mono font-bold text-[#007E94] bg-[#eff3ff] px-2 py-0.5 rounded-[3px]">
                READY NOW
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#44464e] tabular-nums">
              {lang === 'en' ? '6,200 Camp Beds · 210 AC Buses' : '6,200 سرير سكن · 210 حافلات مكيفة'}
            </div>
          </div>
        </div>

        {/* ROW 1: MODEL 01 (Dual-Curve Bezier Spline Chart) + MODEL 02 (6-Axis Radar Compliance Chart) */}
        <div className="grid grid-cols-12 gap-5 sm:gap-6 mb-6">
          {/* MODEL 01: Smooth Cubic-Bezier Area & Dual-Curve Chart (7 Columns) */}
          <div className="col-span-12 lg:col-span-7 bg-white rounded-[8px] border border-[#8A94A6]/25 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#8A94A6]/20">
                <div>
                  <span className="text-[11px] font-mono font-semibold text-[#1E4FD8] flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    {lang === 'en'
                      ? '01. Annual Growth & IKTVA Trajectory (2021–2026)'
                      : '01. المنحنى المزدوج للنمو السنوي ونسبة التوطين (2021–2026)'}
                  </span>
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#0A1F44] mt-0.5">
                    {lang === 'en'
                      ? 'Workforce Expansion vs. IKTVA Local Content Curve'
                      : 'منحنى التوسع في القوى العاملة مقابل نمو المحتوى المحلي (اكتفاء)'}
                  </h3>
                </div>

                {/* Metric Switcher + Dual-Axis Toggle */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="flex items-center gap-1 p-1 bg-white rounded-[4px] border border-[#8A94A6]/25">
                    {(
                      [
                        { key: 'workers', en: 'Workforce', ar: 'الكوادر' },
                        { key: 'safeHoursM', en: 'Safe Hrs (M)', ar: 'ساعات آمنة' },
                        { key: 'contractsSARB', en: 'Contracts (B)', ar: 'العقود (مليار)' },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setChartMetric(m.key)}
                        className={`px-2.5 py-1 text-[11px] font-display font-semibold rounded-[3px] transition-colors cursor-pointer whitespace-nowrap ${
                          chartMetric === m.key
                            ? 'bg-[#1E4FD8] text-white'
                            : 'text-[#44464e] hover:text-[#0A1F44]'
                        }`}
                      >
                        {m[lang]}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowOverlayCurve((prev) => !prev)}
                    className={`px-2.5 py-1.5 text-[11px] font-mono font-semibold rounded-[4px] border transition-colors cursor-pointer ${
                      showOverlayCurve
                        ? 'bg-[#0A1F44] text-[#00B8D4] border-[#0A1F44]'
                        : 'bg-white text-[#44464e] border-[#8A94A6]/35'
                    }`}
                  >
                    {lang === 'en' ? '+ IKTVA % Curve' : '+ منحنى اكتفاء %'}
                  </button>
                </div>
              </div>

              {/* Smooth Cubic-Bezier SVG Canvas */}
              <div className="mt-4">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-auto overflow-visible select-none"
                  role="img"
                  aria-label={
                    lang === 'en'
                      ? 'Multi-axis cubic bezier growth trajectory chart'
                      : 'مخطط المنحنى المزدوج للنمو السنوي'
                  }
                >
                  <defs>
                    <linearGradient id="PrimarySplineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1E4FD8" stopOpacity="0.30" />
                      <stop offset="65%" stopColor="#00B8D4" stopOpacity="0.10" />
                      <stop offset="100%" stopColor="#00B8D4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Reference Grid Lines + Left & Right Axis Labels */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = padTop + plotHeight - ratio * plotHeight;
                    const leftVal = Math.round(maxPrimaryVal * ratio);
                    const rightVal = Math.round(maxSecondaryVal * ratio);
                    return (
                      <g key={i}>
                        <line
                          x1={padLeft}
                          y1={y}
                          x2={svgWidth - padRight}
                          y2={y}
                          stroke="#8A94A6"
                          strokeOpacity={ratio === 0 ? '0.45' : '0.2'}
                          strokeDasharray={ratio === 0 ? undefined : '4 4'}
                        />
                        <text
                          x={padLeft - 8}
                          y={y + 4}
                          textAnchor="end"
                          className="fill-[#44464e] font-mono text-[10px]"
                        >
                          {chartMetric === 'workers'
                            ? `${(leftVal / 1000).toFixed(0)}k`
                            : chartMetric === 'safeHoursM'
                            ? `${leftVal}M`
                            : `${leftVal}B`}
                        </text>
                        {showOverlayCurve && (
                          <text
                            x={svgWidth - padRight + 6}
                            y={y + 4}
                            textAnchor="start"
                            className="fill-[#F39C12] font-mono text-[10px] font-semibold"
                          >
                            {rightVal}%
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Smooth Shaded Area Under Primary Curve */}
                  <path d={smoothAreaPath} fill="url(#PrimarySplineGrad)" />

                  {/* Secondary IKTVA % Overlay Smooth Curve */}
                  {showOverlayCurve && (
                    <path
                      d={secondaryLinePath}
                      fill="none"
                      stroke="#F39C12"
                      strokeWidth="2.2"
                      strokeDasharray="5 4"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Primary Smooth Cubic-Bezier Spline */}
                  <path
                    d={smoothLinePath}
                    fill="none"
                    stroke="#1E4FD8"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />

                  {/* Secondary Curve Nodes */}
                  {showOverlayCurve &&
                    secondaryPoints.map((sp) => (
                      <circle
                        key={`sec-${sp.idx}`}
                        cx={sp.x}
                        cy={sp.y}
                        r={sp.idx === selectedYearIdx ? 4.5 : 3}
                        fill="#F39C12"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                    ))}

                  {/* Interactive Primary Data Nodes & Callout Pills */}
                  {primaryPoints.map((p) => {
                    const isSelected = p.idx === selectedYearIdx;
                    const formattedValue =
                      chartMetric === 'workers'
                        ? p.val.toLocaleString()
                        : chartMetric === 'safeHoursM'
                        ? `${p.val}M`
                        : `SAR ${p.val}B`;
                    return (
                      <g
                        key={p.item.year}
                        onClick={() => setSelectedYearIdx(p.idx)}
                        className="cursor-pointer"
                      >
                        {isSelected && (
                          <line
                            x1={p.x}
                            y1={padTop}
                            x2={p.x}
                            y2={padTop + plotHeight}
                            stroke="#00B8D4"
                            strokeWidth="1.5"
                            strokeDasharray="3 2"
                          />
                        )}

                        <circle cx={p.x} cy={p.y} r="15" fill="transparent" />

                        {isSelected && (
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="10"
                            fill="#00B8D4"
                            fillOpacity="0.22"
                          />
                        )}

                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isSelected ? 6.5 : 4.5}
                          fill={isSelected ? '#00B8D4' : '#FFFFFF'}
                          stroke={isSelected ? '#0A1F44' : '#1E4FD8'}
                          strokeWidth="2.5"
                        />

                        {/* Value Badge Above Node */}
                        <rect
                          x={p.x - 26}
                          y={p.y - 25}
                          width="52"
                          height="16"
                          rx="3"
                          fill={isSelected ? '#0A1F44' : '#FFFFFF'}
                          stroke={isSelected ? '#00B8D4' : '#8A94A6'}
                          strokeOpacity={isSelected ? '1' : '0.4'}
                          strokeWidth="1"
                        />
                        <text
                          x={p.x}
                          y={p.y - 14}
                          textAnchor="middle"
                          className={`font-mono text-[9.5px] ${
                            isSelected ? 'fill-white font-bold' : 'fill-[#0A1F44] font-semibold'
                          }`}
                        >
                          {formattedValue}
                        </text>

                        {/* Year Label on X-Axis */}
                        <text
                          x={p.x}
                          y={svgHeight - 8}
                          textAnchor="middle"
                          className={`font-mono text-[11px] ${
                            isSelected ? 'fill-[#1E4FD8] font-extrabold' : 'fill-[#44464e]'
                          }`}
                        >
                          {p.item.year}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Interactive Selected Year Telemetry Footer */}
            <div className="mt-4 pt-3.5 border-t border-[#8A94A6]/20 flex flex-wrap items-center justify-between gap-3 bg-white text-[#0A1F44] border border-[#8A94A6]/25 px-4 py-3 rounded-[6px] text-xs tabular-nums">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white bg-[#1E4FD8] px-2 py-0.5 rounded-[3px]">
                  {activeYearData.year}
                </span>
                <span className="font-display font-semibold text-[#0A1F44]">
                  {lang === 'en' ? 'Audited Annual Snapshot:' : 'بيانات السنة المالية الموثقة:'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-[11px] text-[#44464e]">
                <span>
                  <strong className="text-[#1E4FD8]">{activeYearData.workers.toLocaleString()}</strong>{' '}
                  {lang === 'en' ? 'Personnel' : 'كادر'}
                </span>
                <span className="text-[#8A94A6]">·</span>
                <span>
                  <strong className="text-[#0A1F44]">{activeYearData.safeHoursM}M</strong>{' '}
                  {lang === 'en' ? 'Safe Hrs' : 'ساعة آمنة'}
                </span>
                <span className="text-[#8A94A6]">·</span>
                <span>
                  <strong className="text-[#A36605]">{activeYearData.iktvaPct}%</strong>{' '}
                  {lang === 'en' ? 'IKTVA' : 'اكتفاء'}
                </span>
                <span className="text-[#8A94A6]">·</span>
                <span>
                  <strong className="text-[#007E94]">SAR {activeYearData.contractsSARB}B</strong>
                </span>
              </div>
            </div>
          </div>

          {/* MODEL 02: 6-Axis Spider / Radar Governance Benchmark Chart (5 Columns) */}
          <div className="col-span-12 lg:col-span-5 bg-white rounded-[8px] border border-[#8A94A6]/25 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="pb-4 border-b border-[#8A94A6]/20 flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono font-semibold text-[#007E94] flex items-center gap-1.5">
                    <Radar className="w-3.5 h-3.5" />
                    {lang === 'en'
                      ? '02. 6-Axis Compliance & Governance Benchmark'
                      : '02. مخطط الرادار السداسي للحوكمة والامتثال'}
                  </span>
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#0A1F44] mt-0.5">
                    {lang === 'en'
                      ? 'Mada Al-Ghuroub vs. KSA Sector Benchmark'
                      : 'مقارنة أداء الشركة بمعيار قطاع المقاولات السعودي'}
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#007E94] bg-[#eff3ff] px-2 py-1 rounded-[3px] border border-[#1E4FD8]/20 shrink-0">
                  97.7% INDEX
                </span>
              </div>

              {/* SVG 6-Axis Radar Spider Chart */}
              <div className="my-3 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4 min-w-0">
                <div className="w-52 h-52 sm:w-56 sm:h-56 shrink-0 flex items-center justify-center">
                  <svg viewBox={`0 0 ${radarSize} ${radarSize}`} className="w-full h-full overflow-visible">
                    {/* Concentric Hexagonal Radar Grids (25%, 50%, 75%, 100%) */}
                    {[25, 50, 75, 100].map((level) => {
                      const ringPoints = RADAR_METRICS.map((_, idx) => {
                        const pt = getRadarPoint(idx, level);
                        return `${pt.x},${pt.y}`;
                      }).join(' ');
                      return (
                        <polygon
                          key={level}
                          points={ringPoints}
                          fill={level === 100 ? '#F4F6F9' : 'none'}
                          fillOpacity={level === 100 ? '0.45' : undefined}
                          stroke="#8A94A6"
                          strokeOpacity="0.28"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Radar Spokes */}
                    {RADAR_METRICS.map((_, idx) => {
                      const outerPt = getRadarPoint(idx, 100);
                      return (
                        <line
                          key={`spoke-${idx}`}
                          x1={radarCenter}
                          y1={radarCenter}
                          x2={outerPt.x}
                          y2={outerPt.y}
                          stroke="#8A94A6"
                          strokeOpacity="0.3"
                          strokeDasharray="2 2"
                        />
                      );
                    })}

                    {/* Industry Benchmark Polygon (Dashed Slate) */}
                    <polygon
                      points={benchmarkPolygonPoints}
                      fill="#8A94A6"
                      fillOpacity="0.18"
                      stroke="#44464e"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />

                    {/* Mada Al-Ghuroub Polygon (Electric Cobalt / Cyan) */}
                    <polygon
                      points={companyPolygonPoints}
                      fill="#00B8D4"
                      fillOpacity="0.24"
                      stroke="#1E4FD8"
                      strokeWidth="2.5"
                    />

                    {/* Interactive Vertex Nodes & Axis Labels */}
                    {RADAR_METRICS.map((m, idx) => {
                      const pt = getRadarPoint(idx, m.companyScore);
                      const isSelected = idx === activeRadarIdx;
                      return (
                        <g
                          key={m.key}
                          onClick={() => setActiveRadarIdx(idx)}
                          className="cursor-pointer"
                        >
                          <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isSelected ? 5.5 : 4}
                            fill={isSelected ? '#F39C12' : '#0A1F44'}
                            stroke="#FFFFFF"
                            strokeWidth="2"
                          />
                          <text
                            x={pt.labelX}
                            y={pt.labelY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className={`font-mono text-[9.5px] ${
                              isSelected
                                ? 'fill-[#1E4FD8] font-extrabold'
                                : 'fill-[#0A1F44] font-semibold'
                            }`}
                          >
                            {m.companyScore}%
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Radar Interactive Metric Selector List */}
                <div className="flex-1 min-w-0 w-full space-y-1.5">
                  {RADAR_METRICS.map((m, idx) => {
                    const isSelected = idx === activeRadarIdx;
                    const delta = (m.companyScore - m.industryAvg).toFixed(1);
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setActiveRadarIdx(idx)}
                        className={`w-full min-w-0 text-left px-2.5 py-1.5 rounded-[4px] border transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-[#eff3ff] border-[#1E4FD8]'
                            : 'bg-white border-[#8A94A6]/20 hover:border-[#0A1F44]/40'
                        }`}
                      >
                        <span className="text-[11px] font-display font-bold text-[#0A1F44] truncate min-w-0">
                          {m.label[lang]}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] shrink-0 tabular-nums">
                          <span className="font-bold text-[#1E4FD8]">{m.companyScore}%</span>
                          <span className="text-[10px] text-[#007E94] bg-white px-1 rounded-[2px] border border-[#8A94A6]/20">
                            +{delta}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-[#8A94A6]/20 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-[#0A1F44] font-semibold">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#1E4FD8] inline-block" />
                  {lang === 'en' ? 'Mada Al-Ghuroub' : 'مدى الغروب'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[#44464e]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#8A94A6] inline-block" />
                  {lang === 'en' ? 'KSA Sector Avg' : 'متوسط القطاع'}
                </span>
              </div>
              <span className="text-[#007E94] font-semibold">Aramco Audited</span>
            </div>
          </div>
        </div>

        {/* ROW 2: MODEL 03 (2026 Monthly Stacked Column Velocity Chart) + MODEL 04 (Concentric Regional Gauge) */}
        <div className="grid grid-cols-12 gap-5 sm:gap-6 mb-6">
          {/* MODEL 03: 2026 Monthly Stacked Column Mobilization Velocity Chart (7 Columns) */}
          <div className="col-span-12 lg:col-span-7 bg-white rounded-[8px] border border-[#8A94A6]/25 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#8A94A6]/20">
                <div>
                  <span className="text-[11px] font-mono font-semibold text-[#1E4FD8] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {lang === 'en'
                      ? '03. 2026 Monthly Mobilization Schedule'
                      : '03. الرسم العمودي التراكمي لتعبئة الكوادر شهرياً (2026)'}
                  </span>
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#0A1F44] mt-0.5">
                    {lang === 'en'
                      ? 'Monthly New Site Dispatches by Engineering Division'
                      : 'الدفعات الشهرية الجديدة الموفدة للمشاريع حسب القطاع الهندسي'}
                  </h3>
                </div>

                {/* Division Color Legend */}
                <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-[#0A1F44]">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#1E4FD8]" />
                    {lang === 'en' ? 'Civil' : 'مدني'}
                  </span>
                  <span className="flex items-center gap-1 text-[#0A1F44]">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#00B8D4]" />
                    {lang === 'en' ? '6G/Oil' : 'نفط/6G'}
                  </span>
                  <span className="flex items-center gap-1 text-[#0A1F44]">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#0A1F44]" />
                    {lang === 'en' ? 'Rigging' : 'رفع ثقيل'}
                  </span>
                  <span className="flex items-center gap-1 text-[#0A1F44]">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#F39C12]" />
                    {lang === 'en' ? 'HSE/WPR' : 'سلامة'}
                  </span>
                </div>
              </div>

              {/* Interactive Stacked Column Bars */}
              <div className="mt-5 pt-2">
                <div className="grid grid-cols-10 gap-1.5 sm:gap-2.5 items-end h-44 px-2 border-b border-[#8A94A6]/35">
                  {MONTHLY_2026_STACK.map((m, idx) => {
                    const total = m.civil + m.oilGas + m.rigging + m.hse;
                    const maxMonthlyScale = 2300;
                    const totalHeightPct = Math.round((total / maxMonthlyScale) * 100);
                    const isSelected = idx === selectedMonthIdx;

                    const civilShare = (m.civil / total) * 100;
                    const oilShare = (m.oilGas / total) * 100;
                    const rigShare = (m.rigging / total) * 100;
                    const hseShare = (m.hse / total) * 100;

                    return (
                      <div
                        key={m.month.en}
                        onClick={() => setSelectedMonthIdx(idx)}
                        className="h-full flex flex-col justify-end items-center group cursor-pointer"
                      >
                        <span
                          className={`text-[9.5px] font-mono mb-1 tabular-nums ${
                            isSelected
                              ? 'text-[#1E4FD8] font-extrabold'
                              : 'text-[#8A94A6] group-hover:text-[#0A1F44]'
                          }`}
                        >
                          {total}
                        </span>
                        <div
                          style={{ height: `${totalHeightPct}%` }}
                          className={`w-full max-w-[34px] rounded-t-[4px] overflow-hidden flex flex-col-reverse transition-all duration-200 ${
                            isSelected
                              ? 'ring-2 ring-[#1E4FD8] ring-offset-1 shadow-sm'
                              : 'opacity-85 group-hover:opacity-100'
                          }`}
                        >
                          <div style={{ height: `${civilShare}%` }} className="bg-[#1E4FD8] w-full" />
                          <div style={{ height: `${oilShare}%` }} className="bg-[#00B8D4] w-full" />
                          <div style={{ height: `${rigShare}%` }} className="bg-[#0A1F44] w-full" />
                          <div style={{ height: `${hseShare}%` }} className="bg-[#F39C12] w-full" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Month X-Axis Labels */}
                <div className="grid grid-cols-10 gap-1.5 sm:gap-2.5 px-2 pt-2">
                  {MONTHLY_2026_STACK.map((m, idx) => (
                    <button
                      key={m.month.en}
                      type="button"
                      onClick={() => setSelectedMonthIdx(idx)}
                      className={`text-center font-mono text-[10px] sm:text-[11px] cursor-pointer ${
                        idx === selectedMonthIdx
                          ? 'text-[#1E4FD8] font-bold'
                          : 'text-[#44464e] hover:text-[#0A1F44]'
                      }`}
                    >
                      {m.month[lang]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Month Detailed Breakdown Bar */}
            <div className="mt-4 pt-3.5 border-t border-[#8A94A6]/20 flex flex-wrap items-center justify-between gap-2 bg-white border border-[#8A94A6]/25 px-3.5 py-2.5 rounded-[5px] text-xs font-mono tabular-nums">
              <span className="font-display font-bold text-[#0A1F44]">
                {activeMonthData.month[lang]} 2026{' '}
                {lang === 'en' ? 'Dispatch Breakdown:' : 'تفاصيل التعبئة:'}
              </span>
              <div className="flex flex-wrap items-center gap-3 text-[11px]">
                <span>
                  <strong className="text-[#1E4FD8]">{activeMonthData.civil}</strong> Civil
                </span>
                <span>
                  <strong className="text-[#007E94]">{activeMonthData.oilGas}</strong> 6G/Piping
                </span>
                <span>
                  <strong className="text-[#0A1F44]">{activeMonthData.rigging}</strong> Rigging
                </span>
                <span>
                  <strong className="text-[#A36605]">{activeMonthData.hse}</strong> HSE/WPR
                </span>
              </div>
            </div>
          </div>

          {/* MODEL 04: Multi-Ring Regional Corridor Radial Gauge (5 Columns) */}
          <div className="col-span-12 lg:col-span-5 bg-white rounded-[8px] border border-[#8A94A6]/25 p-5 sm:p-6 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
            <div className="min-w-0">
              <div className="pb-4 border-b border-[#8A94A6]/20">
                <span className="text-[11px] font-mono font-semibold text-[#007E94] block">
                  {lang === 'en'
                    ? '04. Regional Corridor Distribution'
                    : '04. التوزيع الإقليمي للقوى العاملة والأسطول'}
                </span>
                <h3 className="font-display text-base sm:text-lg font-bold text-[#0A1F44] mt-0.5 break-words">
                  {lang === 'en'
                    ? 'Manpower, Fleet & Camp Allocation by KSA Zone'
                    : 'توزيع الكوادر والحافلات والمعسكرات حسب المناطق الصناعية'}
                </h3>
              </div>

              <div className="my-4 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4 min-w-0">
                <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 144 144" className="w-full h-full -rotate-90">
                    {/* Background Track Ring */}
                    <circle
                      cx="72"
                      cy="72"
                      r={outerRadius}
                      fill="transparent"
                      stroke="#F4F6F9"
                      strokeWidth="16"
                    />
                    {REGIONAL_HUBS.map((region) => {
                      const strokeDasharray = `${
                        (region.workforceShare / 100) * outerCircumference
                      } ${outerCircumference}`;
                      const strokeDashoffset = -(cumulativePercent / 100) * outerCircumference;
                      cumulativePercent += region.workforceShare;
                      const isHighlighted =
                        regionFilter === 'all' || regionFilter === region.id;
                      return (
                        <circle
                          key={region.id}
                          cx="72"
                          cy="72"
                          r={outerRadius}
                          fill="transparent"
                          stroke={region.color}
                          strokeWidth="16"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          strokeOpacity={isHighlighted ? 1 : 0.25}
                          className="transition-all duration-200 cursor-pointer"
                          onClick={() =>
                            setRegionFilter(
                              regionFilter === region.id ? 'all' : (region.id as RegionFilter)
                            )
                          }
                        />
                      );
                    })}
                    {/* Inner Utilization Ring (92.3%) */}
                    <circle
                      cx="72"
                      cy="72"
                      r="40"
                      fill="transparent"
                      stroke="#8A94A6"
                      strokeOpacity="0.2"
                      strokeWidth="6"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="40"
                      fill="transparent"
                      stroke="#0A1F44"
                      strokeWidth="6"
                      strokeDasharray={`${0.923 * (2 * Math.PI * 40)} ${2 * Math.PI * 40}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="font-display text-base font-extrabold text-[#0A1F44] tabular-nums leading-none">
                      18,420
                    </span>
                    <span className="text-[9px] font-mono font-bold text-[#007E94] mt-1">
                      92.3% ACTIVE
                    </span>
                  </div>
                </div>

                {/* Regional Selector Cards */}
                <div className="flex-1 min-w-0 w-full space-y-2">
                  {REGIONAL_HUBS.map((region) => {
                    const isSelected = regionFilter === region.id;
                    return (
                      <button
                        key={region.id}
                        type="button"
                        onClick={() =>
                          setRegionFilter(
                            regionFilter === region.id ? 'all' : (region.id as RegionFilter)
                          )
                        }
                        className={`w-full min-w-0 text-left p-2.5 rounded-[5px] border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#eff3ff] border-[#1E4FD8]'
                            : 'bg-white border-[#8A94A6]/20 hover:border-[#0A1F44]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs font-display font-bold text-[#0A1F44] min-w-0">
                          <span className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: region.color }}
                            />
                            <span className="truncate">{region.hub[lang]}</span>
                          </span>
                          <span className="font-mono text-[#1E4FD8] tabular-nums shrink-0">
                            {region.workforceShare}%
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-[11px] font-mono text-[#44464e] tabular-nums pl-4">
                          <span>
                            {region.activePersonnel.toLocaleString()}{' '}
                            {lang === 'en' ? 'Staff' : 'كادر'}
                          </span>
                          <span>
                            {region.buses} {lang === 'en' ? 'Buses' : 'حافلة'} · {region.campBeds}{' '}
                            {lang === 'en' ? 'Beds' : 'سرير'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#8A94A6]/20 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#44464e] tabular-nums">
              <span className="min-w-0">
                {lang === 'en'
                  ? 'Outer Ring: Workforce Share · Inner Ring: 92.3% Active'
                  : 'الحلقة الخارجية: التوزيع · الداخلية: 92.3% نسبة التشغيل'}
              </span>
              <span className="text-[#0A1F44] font-bold shrink-0">KSA-Wide</span>
            </div>
          </div>
        </div>

        {/* ROW 3: MODEL 05 (Trade Capacity & SLA Matrix) + MODEL 06 (Interactive Project Workforce & Cost Simulator) */}
        <div className="grid grid-cols-12 gap-5 sm:gap-6">
          {/* MODEL 05: Trade Division Utilization & SLA Velocity Bars (7 Columns) */}
          <div className="col-span-12 lg:col-span-7 bg-white rounded-[8px] border border-[#8A94A6]/25 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#8A94A6]/20 mb-4">
              <div>
                <span className="text-[11px] font-mono font-semibold text-[#1E4FD8] block">
                  {lang === 'en'
                    ? '05. Division Capacity, Standby Reserve & Dispatch SLA'
                    : '05. الطاقة الاستيعابية والاحتياطي الفوري حسب التخصص'}
                </span>
                <h3 className="font-display text-base sm:text-lg font-bold text-[#0A1F44] mt-0.5">
                  {lang === 'en'
                    ? 'Active Deployed Headcount vs. 72-Hour Vetted Standby Pool'
                    : 'مقارنة الكوادر العاملة بالمشاريع مع الاحتياطي الجاهز للتعبئة'}
                </h3>
              </div>
              <span className="text-xs font-mono text-[#007E94] font-semibold tabular-nums">
                {lang === 'en'
                  ? `Showing ${filteredTrades.length} Division(s)`
                  : `عرض ${filteredTrades.length} قطاعات`}
              </span>
            </div>

            <div className="space-y-3.5">
              {filteredTrades.map((trade) => {
                const utilizationPct = Math.round((trade.deployed / trade.totalCapacity) * 100);
                const standbyCount = trade.totalCapacity - trade.deployed;
                return (
                  <div
                    key={trade.code}
                    className="p-3.5 bg-white rounded-[6px] border border-[#8A94A6]/25 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-white bg-[#0A1F44] px-1.5 py-0.5 rounded-[2px]">
                            {trade.code}
                          </span>
                          <span className="text-[11px] font-mono text-[#007E94] font-semibold">
                            {lang === 'en'
                              ? `Trade Test Pass: ${trade.passRate}%`
                              : `اجتياز الاختبار: ${trade.passRate}%`}
                          </span>
                        </div>
                        <h4 className="font-display text-xs sm:text-sm font-bold text-[#0A1F44] mt-1">
                          {trade.label[lang]}
                        </h4>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#0A1F44] bg-white px-2.5 py-1 rounded-[3px] border border-[#8A94A6]/30 tabular-nums shrink-0">
                        {utilizationPct}% {lang === 'en' ? 'Utilized' : 'تشغيل'}
                      </span>
                    </div>

                    {/* Segmented Dual-Color Capacity Bar */}
                    <div className="w-full h-3.5 bg-white rounded-[3px] border border-[#8A94A6]/35 overflow-hidden p-0.5 flex">
                      <div
                        className="h-full rounded-l-[2px] transition-all duration-300"
                        style={{
                          width: `${utilizationPct}%`,
                          backgroundColor: trade.color,
                        }}
                      />
                      <div
                        className="h-full bg-[#00B8D4]/25 flex-1 rounded-r-[2px]"
                        title="Standby Reserve"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#44464e] tabular-nums">
                      <span>
                        <strong className="text-[#0A1F44]">
                          {trade.deployed.toLocaleString()}
                        </strong>{' '}
                        {lang === 'en' ? 'Active On-Site' : 'في الموقع'}
                      </span>
                      <span>
                        <strong className="text-[#007E94]">
                          +{standbyCount.toLocaleString()}
                        </strong>{' '}
                        {lang === 'en' ? 'Standby Reserve' : 'احتياطي جاهز'}
                      </span>
                      <span>
                        SLA: <strong className="text-[#0A1F44]">{trade.slaHours}h</strong> ·{' '}
                        <strong className="text-[#1E4FD8]">SAR {trade.rateSAR}/d</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MODEL 06: Interactive Turnkey Mobilization & Cost Forecasting Simulator (5 Columns) */}
          <div className="col-span-12 lg:col-span-5 bg-white text-[#0A1F44] rounded-[8px] border border-[#8A94A6]/25 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="pb-4 border-b border-[#8A94A6]/20 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono font-semibold text-[#1E4FD8] flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    {lang === 'en'
                      ? '06. Project Mobilization & Cost Estimator'
                      : '06. حاسبة تخطيط التعبئة والتكلفة التقديرية'}
                  </span>
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#0A1F44] mt-0.5">
                    {lang === 'en'
                      ? 'Simulate Site Headcount, Safe Hours & Fleet Needs'
                      : 'حاسبة فورية لساعات العمل، الحافلات والميزانية التقديرية'}
                  </h3>
                </div>
              </div>

              {/* Simulator Controls */}
              <div className="mt-4 space-y-4">
                {/* Trade Division Selector */}
                <div>
                  <label className="block text-[11px] font-mono text-[#44464e] mb-1.5">
                    {lang === 'en' ? '1. Select Engineering Division:' : '1. اختر القطاع الهندسي:'}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TRADE_CAPACITY_DATA.map((t, idx) => (
                      <button
                        key={t.code}
                        type="button"
                        onClick={() => setSimTradeIdx(idx)}
                        className={`px-2.5 py-2 rounded-[4px] text-left font-display text-xs font-semibold border transition-colors cursor-pointer truncate ${
                          simTradeIdx === idx
                            ? 'bg-[#1E4FD8] text-white border-[#1E4FD8]'
                            : 'bg-white text-[#0A1F44] border-[#8A94A6]/30 hover:border-[#1E4FD8]'
                        }`}
                      >
                        {t.shortName[lang]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Headcount Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-[#44464e]">
                      {lang === 'en' ? '2. Required Personnel Headcount:' : '2. عدد الكوادر المطلوبة:'}
                    </span>
                    <span className="text-[#1E4FD8] font-bold text-sm tabular-nums">
                      {simWorkers} {lang === 'en' ? 'Workers' : 'عامل'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={1500}
                    step={25}
                    value={simWorkers}
                    onChange={(e) => setSimWorkers(Number(e.target.value))}
                    className="w-full accent-[#1E4FD8] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#8A94A6]">
                    <span>50 Crew</span>
                    <span>750 Crew</span>
                    <span>1,500 Crew</span>
                  </div>
                </div>

                {/* Contract Duration Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-[#44464e]">
                      {lang === 'en' ? '3. Contract Duration (Months):' : '3. مدة العقد (بالأشهر):'}
                    </span>
                    <span className="text-[#A36605] font-bold text-sm tabular-nums">
                      {simMonths} {lang === 'en' ? 'Months' : 'أشهر'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={24}
                    step={1}
                    value={simMonths}
                    onChange={(e) => setSimMonths(Number(e.target.value))}
                    className="w-full accent-[#F39C12] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#8A94A6]">
                    <span>1 Mo (Shutdown)</span>
                    <span>12 Months</span>
                    <span>24 Months</span>
                  </div>
                </div>

                {/* Live Calculated Output Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <div className="p-3 rounded-[6px] bg-white border border-[#8A94A6]/25">
                    <div className="text-[10px] font-mono text-[#44464e]">
                      {lang === 'en' ? 'Projected Safe Man-Hours' : 'ساعات العمل المتوقعة'}
                    </div>
                    <div className="font-display text-lg font-extrabold text-[#1E4FD8] tabular-nums mt-0.5">
                      {totalManHours.toLocaleString()} hrs
                    </div>
                  </div>

                  <div className="p-3 rounded-[6px] bg-white border border-[#8A94A6]/25">
                    <div className="text-[10px] font-mono text-[#44464e]">
                      {lang === 'en' ? 'Est. Turnkey Budget (SAR)' : 'الميزانية التقديرية (ريال)'}
                    </div>
                    <div className="font-display text-lg font-extrabold text-[#A36605] tabular-nums mt-0.5">
                      SAR {(estimatedContractSAR / 1000000).toFixed(2)}M
                    </div>
                  </div>

                  <div className="p-3 rounded-[6px] bg-white border border-[#8A94A6]/25">
                    <div className="text-[10px] font-mono text-[#44464e]">
                      {lang === 'en' ? 'Dedicated AC Fleet Allocation' : 'الحافلات المكيفة المطلوبة'}
                    </div>
                    <div className="font-mono text-sm font-bold text-[#0A1F44] tabular-nums mt-0.5">
                      {busesRequired} {lang === 'en' ? 'Coaches (45-Seat)' : 'حافلة نقل'}
                    </div>
                  </div>

                  <div className="p-3 rounded-[6px] bg-white border border-[#8A94A6]/25">
                    <div className="text-[10px] font-mono text-[#44464e]">
                      {lang === 'en' ? 'NEBOSH HSE Supervision' : 'مشرفو السلامة NEBOSH'}
                    </div>
                    <div className="font-mono text-sm font-bold text-[#0A1F44] tabular-nums mt-0.5">
                      {hseOfficersRequired} {lang === 'en' ? 'HSE Officers' : 'ضابط سلامة'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#8A94A6]/20 flex items-center justify-between gap-2 text-[11px] font-mono text-[#44464e]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#007E94]" />
                {lang === 'en'
                  ? `SLA Target: ${simTrade.slaHours}-Hour Site Dispatch`
                  : `زمن التعبئة القياسي: ${simTrade.slaHours} ساعة`}
              </span>
              <a
                href="#procurement-rfq"
                className="text-[#1E4FD8] hover:underline font-bold"
              >
                {lang === 'en' ? 'Lock Allocation →' : 'احجز الكوادر ←'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

AnalyticsChartsSection.displayName = 'AnalyticsChartsSection';
