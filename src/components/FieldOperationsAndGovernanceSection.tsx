import React, { memo } from 'react';
import { ShieldCheck, Building2, HardHat, Info } from 'lucide-react';
import { FIELD_OPERATIONS_GALLERY, Language } from '../data/industrialData';
import { ResilientImage } from './ResilientImage';
import { CertificationTooltip } from './CertificationTooltip';

interface FieldOperationsAndGovernanceSectionProps {
  lang: Language;
}

export const FieldOperationsAndGovernanceSection: React.FC<FieldOperationsAndGovernanceSectionProps> =
  memo(({ lang }) => {
    return (
      <>
        {/* SECTION 03B: ON-SITE MANPOWER, TRADE TESTING & CAMP LOGISTICS VISUAL GALLERY */}
        <section className="py-12 sm:py-16 lg:py-24 bg-white border-t border-[#8A94A6]/25">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8 sm:mb-12">
              <div>
                <p className="text-xs font-mono font-semibold text-[#1E4FD8] mb-2">
                  {lang === 'en'
                    ? 'Field Operations Gallery · Saudi Workforce Infrastructure'
                    : 'معرض العمليات الميدانية · البنية التحتية للقوى العاملة بالمملكة'}
                </p>
                <h2 className="font-display text-[24px] leading-[32px] sm:text-[38px] sm:leading-[46px] font-bold tracking-[-0.015em] text-[#0A1F44]">
                  {lang === 'en'
                    ? 'Inside Our 6G Trade Test Centers, Worker Camps & Transport Fleet.'
                    : 'جولة داخل مراكز اختبارات اللحام 6G ومعسكرات السكن وأسطول النقل.'}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#44464e] max-w-md">
                {lang === 'en'
                  ? 'Verified operational assets managed by Moyna Miah across Dhahran, Jubail, Yanbu, Riyadh, and NEOM.'
                  : 'أصول تشغيلية وميدانية موثقة بإشراف معين مياه في الظهران والجبيل وينبع والرياض ونيوم.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {FIELD_OPERATIONS_GALLERY.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-[8px] border border-[#8A94A6]/25 border-t-[3px] border-t-[#0A1F44] overflow-hidden flex flex-col justify-between hover:border-[#1E4FD8]/50 transition-all duration-150 shadow-2xs"
                >
                  <div>
                    <div className="relative aspect-[4/3] w-full bg-[#0A1F44] overflow-hidden border-b border-[#8A94A6]/20">
                      <ResilientImage
                        src={item.image}
                        alt={item.title[lang]}
                        fallbackTitle={item.title[lang]}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44]/85 via-transparent to-transparent" />
                      <div className="absolute bottom-3 inset-x-4 flex items-center justify-between gap-2 text-xs font-mono text-white">
                        <span className="bg-[#0A1F44]/80 px-2 py-0.5 rounded-[3px] border border-white/15">
                          {item.code}
                        </span>
                        <span className="text-[#00B8D4] font-semibold bg-[#0A1F44]/80 px-2.5 py-0.5 rounded-[3px] border border-white/15 tabular-nums">
                          {item.metricBadge}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5">
                      <div className="text-[11px] font-mono font-semibold text-[#1E4FD8] mb-1">
                        {item.location[lang]}
                      </div>
                      <h3 className="font-display text-sm sm:text-base font-bold text-[#0A1F44] mb-2 leading-snug">
                        {item.title[lang]}
                      </h3>
                      <p className="text-xs text-[#44464e] leading-relaxed">
                        {item.caption[lang]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 04: GOVERNANCE, HSE & CLIENT ENDORSEMENTS */}
        <section
          id="governance"
          className="py-12 sm:py-16 lg:py-20 bg-white text-[#0A1F44] border-y border-[#8A94A6]/25"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-10">
            <div className="grid grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="col-span-12 lg:col-span-5 space-y-3 sm:space-y-4">
                <p className="text-xs font-mono font-semibold text-[#1E4FD8]">
                  {lang === 'en'
                    ? '04. Regulatory & HSE Governance'
                    : '04. الحوكمة التنظيمية والسلامة المهنية'}
                </p>
                <h2 className="font-display text-[24px] leading-[32px] sm:text-[36px] sm:leading-[44px] font-bold text-[#0A1F44]">
                  {lang === 'en'
                    ? 'Uncompromising Compliance with Saudi Sovereign Standards.'
                    : 'التزام صارم بالمعايير السيادية واللوائح الهندسية في المملكة.'}
                </h2>
                <p className="text-xs sm:text-sm text-[#44464e] leading-relaxed">
                  {lang === 'en'
                    ? 'Tap or hover on any governance icon to inspect our ISO 9001, ISO 45001, and Saudi Aramco IKTVA certification definitions.'
                    : 'اضغط أو مرر المؤشر فوق أيقونات الحوكمة والامتثال لاستعراض تعريفات شهادات ISO 9001 و ISO 45001 وبرنامج اكتفاء.'}
                </p>
              </div>

              <div className="col-span-12 lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-[#8A94A6]/25 border-t-2 border-t-[#00B8D4] rounded-[8px] p-5 shadow-2xs">
                  <div className="mb-3 flex items-center justify-between">
                    <CertificationTooltip
                      title={
                        lang === 'en'
                          ? 'Aramco CSM & ISO 45001 Safety Governance'
                          : 'دليل سلامة الإنشاءات لأرامكو ومعيار ISO 45001'
                      }
                      code="CSM / ISO 45001"
                      accentColor="#00B8D4"
                      position="top"
                      align="start"
                      definition={
                        lang === 'en'
                          ? 'ISO 45001 & Saudi Aramco Construction Safety Manual (CSM) mandate strict occupational hazard controls, certified Work Permit Receivers (WPR), and audited LOTO procedures.'
                          : 'يفرض معيار ISO 45001 ودليل سلامة الإنشاءات لأرامكو ضوابط صارمة لمنع المخاطر الميدانية، واعتماد مستلمي تصاريح العمل (WPR)، وتدقيق العزل الآمن.'
                      }
                    >
                      <span className="inline-flex items-center gap-1.5 p-1.5 -m-1.5 rounded-[4px] hover:bg-[#eff3ff] transition-colors">
                        <ShieldCheck className="w-6 h-6 text-[#00B8D4]" />
                        <Info className="w-3.5 h-3.5 text-[#8A94A6]" />
                      </span>
                    </CertificationTooltip>
                    <span className="text-[11px] font-mono font-semibold text-[#007E94] tabular-nums">
                      ISO 45001
                    </span>
                  </div>
                  <div className="font-display text-base font-bold text-[#0A1F44] mb-1">
                    {lang === 'en' ? 'Aramco CSM & WPR' : 'سلامة الإنشاءات وتصاريح العمل'}
                  </div>
                  <p className="text-xs text-[#44464e] leading-relaxed">
                    {lang === 'en'
                      ? '100% digital permit-to-work tracking, daily LOTO audits, and certified Level-3 rigging plans on every heavy lift.'
                      : 'تتبع رقمي كامل لتصاريح العمل وتدقيق يومي لإجراءات العزل وخطط رفع معتمدة من المستوى الثالث.'}
                  </p>
                </div>

                <div className="bg-white border border-[#8A94A6]/25 border-t-2 border-t-[#1E4FD8] rounded-[8px] p-5 shadow-2xs">
                  <div className="mb-3 flex items-center justify-between">
                    <CertificationTooltip
                      title={
                        lang === 'en'
                          ? 'IKTVA (In-Kingdom Total Value Add)'
                          : 'برنامج القيمة المضافة الإجمالية في المملكة (اكتفاء)'
                      }
                      code="IKTVA 74.2%"
                      accentColor="#1E4FD8"
                      position="top"
                      align="center"
                      definition={
                        lang === 'en'
                          ? 'IKTVA is Saudi Aramco’s flagship localization program certifying domestic economic contribution through Saudi workforce employment, local manufacturing, and domestic supply-chain spend.'
                          : 'برنامج اكتفاء هو مبادرة أرامكو السعودية لتعزيز المحتوى المحلي وتوثيق المساهمة الاقتصادية عبر توظيف وتدريب الكوادر الوطنية والتصنيع المحلي.'
                      }
                    >
                      <span className="inline-flex items-center gap-1.5 p-1.5 -m-1.5 rounded-[4px] hover:bg-[#eff3ff] transition-colors">
                        <Building2 className="w-6 h-6 text-[#1E4FD8]" />
                        <Info className="w-3.5 h-3.5 text-[#8A94A6]" />
                      </span>
                    </CertificationTooltip>
                    <span className="text-[11px] font-mono font-semibold text-[#1E4FD8] tabular-nums">
                      IKTVA
                    </span>
                  </div>
                  <div className="font-display text-base font-bold text-[#0A1F44] mb-1">
                    {lang === 'en' ? '74.2% IKTVA Score' : '74.2% برنامج اكتفاء'}
                  </div>
                  <p className="text-xs text-[#44464e] leading-relaxed">
                    {lang === 'en'
                      ? 'Domestic steel & concrete sourcing combined with Saudi engineering cadet development programs in Dammam and Yanbu.'
                      : 'توريد محلي للفولاذ والخرسانة مع برامج تدريب وتأهيل المهندسين السعوديين في الدمام وينبع.'}
                  </p>
                </div>

                <div className="bg-white border border-[#8A94A6]/25 border-t-2 border-t-[#F39C12] rounded-[8px] p-5 shadow-2xs">
                  <div className="mb-3 flex items-center justify-between">
                    <CertificationTooltip
                      title={
                        lang === 'en'
                          ? 'ISO 9001:2015 & ASME Quality Management'
                          : 'نظام إدارة الجودة ISO 9001:2015 واعتماد ASME'
                      }
                      code="ISO 9001:2015"
                      accentColor="#F39C12"
                      position="top"
                      align="end"
                      definition={
                        lang === 'en'
                          ? 'ISO 9001:2015 certifies end-to-end Quality Management Systems across engineering design, material traceability, NDT weld radiography, and pressure-vessel testing.'
                          : 'يوثق معيار ISO 9001:2015 كفاءة نظام إدارة الجودة الشامل بدءاً من التصميم الهندسي وتتبع المواد وحتى الفحص الإشعاعي للحام واختبارات الضغط.'
                      }
                    >
                      <span className="inline-flex items-center gap-1.5 p-1.5 -m-1.5 rounded-[4px] hover:bg-[#eff3ff] transition-colors">
                        <HardHat className="w-6 h-6 text-[#F39C12]" />
                        <Info className="w-3.5 h-3.5 text-[#8A94A6]" />
                      </span>
                    </CertificationTooltip>
                    <span className="text-[11px] font-mono font-semibold text-[#A36605] tabular-nums">
                      ISO 9001
                    </span>
                  </div>
                  <div className="font-display text-base font-bold text-[#0A1F44] mb-1">
                    {lang === 'en' ? 'ASME & ISO QA/QC' : 'اعتمادات الجودة ASME و ISO'}
                  </div>
                  <p className="text-xs text-[#44464e] leading-relaxed">
                    {lang === 'en'
                      ? 'Full weld traceability, phased-array ultrasonic testing (PAUT), and hydro-test certification packages.'
                      : 'تتبع كامل للوصلات الملحومة وفحوصات الموجات فوق الصوتية المتقدمة وشهادات الاختبار الهيدروستاتيكي.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  });

FieldOperationsAndGovernanceSection.displayName = 'FieldOperationsAndGovernanceSection';
