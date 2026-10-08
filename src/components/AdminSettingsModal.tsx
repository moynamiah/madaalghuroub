import React, { useState, useRef, useEffect, memo } from 'react';
import {
  X,
  Lock,
  LogOut,
  Save,
  Camera,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  Inbox,
  Settings,
  Phone,
  Mail,
  Building2,
  Trash2,
  Check,
  Clock,
  Search,
  Download,
  FileText,
  Upload,
  Link as LinkIcon,
} from 'lucide-react';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  ADMIN_EMAIL,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { Language } from '../data/industrialData';

export interface CloudPortfolioState {
  nameEn: string;
  nameAr: string;
  roleEn: string;
  roleAr: string;
  companyEn: string;
  companyAr: string;
  email: string;
  phone: string;
  regionEn: string;
  regionAr: string;
  bioEn: string;
  bioAr: string;
  aramcoVendorId: string;
  iktvaScore: string;
  portraitDataUrl: string;
  logoDataUrl: string;
}

export interface CompanyProfileDocState {
  crNumber: string;
  headquartersEn: string;
  headquartersAr: string;
  companyOverviewEn: string;
  companyOverviewAr: string;
  externalPdfUrl: string;
  uploadedFileName: string;
  uploadedFileDataUrl: string;
}

export interface TenderInquiryRecord {
  id: string;
  referenceId: string;
  timestampDisplay: string;
  organization: string;
  contactName: string;
  email: string;
  phone: string;
  region: string;
  contractPackageType: string;
  estimatedBudgetSAR: string;
  mobilizationTimeline: string;
  selectedScopesSummary: string;
  attachedTradesSummary: string;
  notes: string;
  status: 'new' | 'reviewed' | 'contacted';
}

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentUser: User | null;
  currentSettings: CloudPortfolioState;
  currentCompanyProfile: CompanyProfileDocState;
  defaultPortraitUrl: string;
  defaultLogoUrl: string;
  onSaved: (updated: CloudPortfolioState) => void;
  onCompanyProfileSaved: (updated: CompanyProfileDocState) => void;
}

// Compress uploaded image so it safely fits inside Firestore 1MB document limit
function compressImageFile(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth || h > maxHeight) {
          const ratio = Math.min(maxWidth / w, maxHeight / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = memo(({
  isOpen,
  onClose,
  lang,
  currentUser,
  currentSettings,
  currentCompanyProfile,
  defaultPortraitUrl,
  defaultLogoUrl,
  onSaved,
  onCompanyProfileSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'company_profile' | 'inquiries'>('settings');
  const [formState, setFormState] = useState<CloudPortfolioState>(currentSettings);
  const [profileDocState, setProfileDocState] = useState<CompanyProfileDocState>(currentCompanyProfile);
  const [saving, setSaving] = useState(false);
  const [savingProfileDoc, setSavingProfileDoc] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [inquiries, setInquiries] = useState<TenderInquiryRecord[]>([]);
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'new' | 'reviewed' | 'contacted'>('all');
  const [inquirySearch, setInquirySearch] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const portraitFileRef = useRef<HTMLInputElement | null>(null);
  const logoFileRef = useRef<HTMLInputElement | null>(null);
  const companyProfileFileRef = useRef<HTMLInputElement | null>(null);

  const isAuthorizedAdmin =
    Boolean(currentUser) &&
    currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    setFormState(currentSettings);
    setProfileDocState(currentCompanyProfile);
    setStatusMessage(null);
  }, [currentSettings, currentCompanyProfile, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Real-time listener for Client Tender Inquiries (active only when authorized admin is logged in)
  useEffect(() => {
    if (!isOpen || !isAuthorizedAdmin) {
      setInquiries([]);
      return;
    }

    const q = query(collection(db, 'tender_inquiries'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: TenderInquiryRecord[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            referenceId: d.referenceId || docSnap.id,
            timestampDisplay: d.timestampDisplay || '',
            organization: d.organization || '',
            contactName: d.contactName || '',
            email: d.email || '',
            phone: d.phone || '',
            region: d.region || '',
            contractPackageType: d.contractPackageType || '',
            estimatedBudgetSAR: d.estimatedBudgetSAR || '',
            mobilizationTimeline: d.mobilizationTimeline || '',
            selectedScopesSummary: d.selectedScopesSummary || '',
            attachedTradesSummary: d.attachedTradesSummary || '',
            notes: d.notes || '',
            status: d.status || 'new',
          });
        });
        setInquiries(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'tender_inquiries');
      }
    );

    return () => unsub();
  }, [isOpen, isAuthorizedAdmin]);

  if (!isOpen) return null;

  const newInquiryCount = inquiries.filter((inq) => inq.status === 'new').length;
  const contactedCount = inquiries.filter((inq) => inq.status === 'contacted').length;
  const reviewedCount = inquiries.filter((inq) => inq.status === 'reviewed').length;

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus = inquiryFilter === 'all' || inq.status === inquiryFilter;
    const q = inquirySearch.trim().toLowerCase();
    if (!q) return matchesStatus;
    const matchesText =
      inq.organization.toLowerCase().includes(q) ||
      inq.contactName.toLowerCase().includes(q) ||
      inq.referenceId.toLowerCase().includes(q) ||
      inq.phone.toLowerCase().includes(q) ||
      inq.region.toLowerCase().includes(q);
    return matchesStatus && matchesText;
  });

  const handleExportInquiriesCSV = () => {
    if (inquiries.length === 0) return;
    const headers = [
      'Reference ID',
      'Timestamp',
      'Status',
      'Organization',
      'Contact Name',
      'Phone',
      'Email',
      'Region',
      'Budget (SAR)',
      'Mobilization',
      'Scopes',
      'Attached Trades',
      'Notes',
    ];
    const escapeCsv = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
    const rows = inquiries.map((i) =>
      [
        i.referenceId,
        i.timestampDisplay,
        i.status,
        i.organization,
        i.contactName,
        i.phone,
        i.email,
        i.region,
        i.estimatedBudgetSAR,
        i.mobilizationTimeline,
        i.selectedScopesSummary,
        i.attachedTradesSummary,
        i.notes,
      ]
        .map(escapeCsv)
        .join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mada_Al_Ghuroub_Client_Inquiries_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setStatusMessage(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        await signOut(auth);
        setStatusMessage({
          type: 'error',
          text:
            lang === 'en'
              ? `Access Denied: "${result.user.email}" is not authorized. Only ${ADMIN_EMAIL} can modify portfolio settings.`
              : `تم رفض الوصول: البريد "${result.user.email}" غير مصرح له. فقط ${ADMIN_EMAIL} يمكنه تعديل الإعدادات.`,
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Google Sign-In was cancelled or blocked by popup settings.',
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setStatusMessage(null);
  };

  const handlePortraitChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 600, 800, 0.84);
      setFormState((prev) => ({ ...prev, portraitDataUrl: compressed }));
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Could not process selected portrait image.',
      });
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 450, 450, 0.86);
      setFormState((prev) => ({ ...prev, logoDataUrl: compressed }));
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Could not process selected company logo image.',
      });
    }
  };

  const handleCompanyProfileFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatusMessage(null);

    if (file.type.startsWith('image/')) {
      try {
        const compressed = await compressImageFile(file, 1400, 1800, 0.82);
        setProfileDocState((prev) => ({
          ...prev,
          uploadedFileName: file.name.slice(0, 180),
          uploadedFileDataUrl: compressed,
        }));
        setStatusMessage({
          type: 'success',
          text:
            lang === 'en'
              ? `Attached "${file.name}"! Click "Save Company Profile to Cloud" below to publish it.`
              : `تم إرفاق "${file.name}"! اضغط على زر الحفظ بالأسفل لنشره.`,
        });
      } catch {
        setStatusMessage({
          type: 'error',
          text: 'Could not process selected image file.',
        });
      }
      return;
    }

    // For PDF or document files, ensure it fits within Firestore's 1MB document limit (~500KB binary -> ~680KB base64)
    if (file.size > 510 * 1024) {
      setStatusMessage({
        type: 'error',
        text:
          lang === 'en'
            ? `This file (${(file.size / 1024 / 1024).toFixed(2)} MB) is larger than the 500 KB direct cloud document limit. Please either compress the PDF under 500 KB, OR upload it to Google Drive and paste the link in the "Google Drive / Direct PDF Link" box below.`
            : `حجم الملف (${(file.size / 1024 / 1024).toFixed(2)} ميجابايت) أكبر من حد الرفع المباشر (500 كيلوبايت). يرجى ضغط ملف PDF أو رفعه على Google Drive ولصق الرابط في الحقل المخصص بالأسفل.`,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfileDocState((prev) => ({
          ...prev,
          uploadedFileName: file.name.slice(0, 180),
          uploadedFileDataUrl: reader.result as string,
        }));
        setStatusMessage({
          type: 'success',
          text:
            lang === 'en'
              ? `Attached "${file.name}"! Click "Save Company Profile to Cloud" below to publish it.`
              : `تم إرفاق "${file.name}"! اضغط على زر الحفظ بالأسفل لنشره.`,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCompanyProfileToCloud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorizedAdmin || !currentUser?.email) return;

    setSavingProfileDoc(true);
    setStatusMessage(null);

    const sanitizedDoc: CompanyProfileDocState = {
      crNumber:
        profileDocState.crNumber.trim().slice(0, 120) ||
        'CR #2050148920 — Eastern Province, KSA',
      headquartersEn:
        profileDocState.headquartersEn.trim().slice(0, 300) ||
        'King Salman Industrial Road, Support Industrial Area II, Dhahran / Jubail, Kingdom of Saudi Arabia',
      headquartersAr:
        profileDocState.headquartersAr.trim().slice(0, 300) ||
        'طريق الملك سلمان الصناعي، المنطقة الصناعية المساندة الثانية، الظهران / الجبيل، المملكة العربية السعودية',
      companyOverviewEn:
        profileDocState.companyOverviewEn.trim().slice(0, 3000) ||
        'MADA AL-GHUROUB GENERAL CONTRACTING COMPANY is a premier Saudi general contracting and certified technical manpower supply enterprise delivering turnkey civil engineering, oil & gas shutdown maintenance, 6G certified welding teams, and Ajeer-compliant industrial workforce solutions across Dhahran, Jubail, Yanbu, Riyadh, and NEOM.',
      companyOverviewAr:
        profileDocState.companyOverviewAr.trim().slice(0, 3000) ||
        'شركة مدى الغروب للمقاولات العامة هي شركة سعودية رائدة في مجال المقاولات العامة وتوريد القوى العاملة الفنية المعتمدة، متخصصة في المشاريع المدنية وصيانة المصانع والبتروكيماويات وتوفير الكوادر الهندسية واللحامين المعتمدين بنظام أجير في الظهران والجبيل وينبع والرياض ونيوم.',
      externalPdfUrl: profileDocState.externalPdfUrl.trim().slice(0, 600),
      uploadedFileName: profileDocState.uploadedFileName.trim().slice(0, 200),
      uploadedFileDataUrl: profileDocState.uploadedFileDataUrl.slice(0, 700000),
    };

    const docPath = 'company_profile_doc/main';
    try {
      await setDoc(doc(db, 'company_profile_doc', 'main'), {
        ...sanitizedDoc,
        updatedByEmail: currentUser.email,
        updatedAt: serverTimestamp(),
      });
      onCompanyProfileSaved(sanitizedDoc);
      setStatusMessage({
        type: 'success',
        text:
          lang === 'en'
            ? 'Official Company Profile saved to Cloud! Visitors clicking "Download Company Profile" will now receive your updated Company Profile.'
            : 'تم حفظ ملف الشركة الرسمي في السحابة بنجاح! سيحصل الزوار الآن على ملف الشركة المحدث عند الضغط على زر التحميل.',
      });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Failed to save Company Profile to Cloud Database.',
      });
      handleFirestoreError(error, OperationType.WRITE, docPath);
    } finally {
      setSavingProfileDoc(false);
    }
  };

  const handleSaveToCloud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorizedAdmin || !currentUser?.email) return;

    setSaving(true);
    setStatusMessage(null);

    const sanitized: CloudPortfolioState = {
      nameEn: formState.nameEn.trim().slice(0, 120) || 'Moyna Miah',
      nameAr: formState.nameAr.trim().slice(0, 160) || 'معين مياه (Moyna Miah)',
      roleEn: formState.roleEn.trim().slice(0, 160) || 'Business Development Manager',
      roleAr:
        formState.roleAr.trim().slice(0, 200) ||
        'مدير تطوير الأعمال والمشاريع (Business Development Manager)',
      companyEn:
        formState.companyEn.trim().slice(0, 200) ||
        'MADA AL-GHUROUB GENERAL CONTRACTING COMPANY',
      companyAr:
        formState.companyAr.trim().slice(0, 240) ||
        'شركة مدى الغروب للمقاولات العامة (MADA AL-GHUROUB GENERAL CONTRACTING COMPANY)',
      email: formState.email.trim().slice(0, 160) || ADMIN_EMAIL,
      phone: formState.phone.trim().slice(0, 60) || '+966 50 884 9200',
      regionEn:
        formState.regionEn.trim().slice(0, 240) ||
        'Kingdom of Saudi Arabia · Dhahran · Jubail · Yanbu · Riyadh · NEOM',
      regionAr:
        formState.regionAr.trim().slice(0, 240) ||
        'المملكة العربية السعودية · الظهران · الجبيل · ينبع · الرياض · نيوم',
      bioEn: formState.bioEn.trim().slice(0, 1200) || 'Executive Manpower & Contracting Portfolio.',
      bioAr: formState.bioAr.trim().slice(0, 1200) || 'ملف توريد القوى العاملة والمقاولات العامة.',
      aramcoVendorId: formState.aramcoVendorId.trim().slice(0, 80) || '#10048921 (Active)',
      iktvaScore: formState.iktvaScore.trim().slice(0, 60) || '74.2% Certified',
      portraitDataUrl: formState.portraitDataUrl.slice(0, 450000),
      logoDataUrl: formState.logoDataUrl.slice(0, 350000),
    };

    const docPath = 'portfolio_config/main';
    try {
      await setDoc(doc(db, 'portfolio_config', 'main'), {
        ...sanitized,
        updatedByEmail: currentUser.email,
        updatedAt: serverTimestamp(),
      });
      onSaved(sanitized);
      setStatusMessage({
        type: 'success',
        text:
          lang === 'en'
            ? 'All portfolio settings, photos & contact details saved to Cloud Database!'
            : 'تم حفظ جميع الإعدادات والصور وبيانات التواصل في قاعدة البيانات السحابية بنجاح!',
      });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Failed to save settings to Cloud Database.',
      });
      handleFirestoreError(error, OperationType.WRITE, docPath);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateInquiryStatus = async (
    inquiryId: string,
    nextStatus: 'new' | 'reviewed' | 'contacted'
  ) => {
    const path = `tender_inquiries/${inquiryId}`;
    try {
      await updateDoc(doc(db, 'tender_inquiries', inquiryId), {
        status: nextStatus,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    const path = `tender_inquiries/${inquiryId}`;
    try {
      await deleteDoc(doc(db, 'tender_inquiries', inquiryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-[#0A1F44]/75 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <div
        className="relative w-full max-w-4xl max-h-[94dvh] sm:max-h-[90vh] flex flex-col bg-white rounded-t-[12px] sm:rounded-[8px] border border-[#8A94A6]/30 border-t-4 border-t-[#00B8D4] shadow-[0_24px_54px_-8px_rgba(10,31,68,0.45)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle Visual Affordance */}
        <div className="sm:hidden pt-2 pb-1 bg-[#0A1F44] flex justify-center shrink-0">
          <div className="w-10 h-1 bg-white/30 rounded-full" />
        </div>

        {/* Top Bar */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 bg-[#0A1F44] text-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Lock className="w-4 h-4 text-[#00B8D4] shrink-0" />
            <div className="min-w-0">
              <h2
                id="admin-modal-title"
                className="font-display text-sm sm:text-base font-bold truncate"
              >
                {lang === 'en'
                  ? 'Executive Admin Control Panel & Client RFQ Inbox'
                  : 'لوحة تحكم المسؤول وصندوق طلبات المناقصات'}
              </h2>
              <p className="text-[10px] sm:text-[11px] font-mono text-[#00B8D4] truncate">
                {lang === 'en'
                  ? `Authorized Owner Only: ${ADMIN_EMAIL}`
                  : `للمالك المفوض فقط: ${ADMIN_EMAIL}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-[4px] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Close admin panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs when Authorized Admin is Logged In */}
        {isAuthorizedAdmin && (
          <div className="bg-[#F4F6F9] border-b border-[#8A94A6]/25 px-3 sm:px-6 flex items-center justify-between gap-2 shrink-0 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 min-w-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('settings');
                  setStatusMessage(null);
                }}
                className={`min-h-[44px] px-3 sm:px-4 py-2.5 text-xs font-display font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'border-[#1E4FD8] text-[#0A1F44] bg-white'
                    : 'border-transparent text-[#44464e] hover:text-[#0A1F44]'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-[#1E4FD8] shrink-0" />
                <span>
                  {lang === 'en' ? 'Profile & Photo Settings' : 'إعدادات الملف والصور'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('company_profile');
                  setStatusMessage(null);
                }}
                className={`min-h-[44px] px-3 sm:px-4 py-2.5 text-xs font-display font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'company_profile'
                    ? 'border-[#1E4FD8] text-[#0A1F44] bg-white'
                    : 'border-transparent text-[#44464e] hover:text-[#0A1F44]'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#007E94] shrink-0" />
                <span>
                  {lang === 'en'
                    ? 'Company Profile Setup'
                    : 'إعداد ملف الشركة (Company Profile)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('inquiries');
                  setStatusMessage(null);
                }}
                className={`min-h-[44px] px-3 sm:px-4 py-2.5 text-xs font-display font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'inquiries'
                    ? 'border-[#1E4FD8] text-[#0A1F44] bg-white'
                    : 'border-transparent text-[#44464e] hover:text-[#0A1F44]'
                }`}
              >
                <Inbox className="w-3.5 h-3.5 text-[#1E4FD8] shrink-0" />
                <span>
                  {lang === 'en'
                    ? `Client RFQ Inbox (${inquiries.length})`
                    : `صندوق طلبات العملاء (${inquiries.length})`}
                </span>
                {newInquiryCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#F39C12] text-[#0A1F44] rounded-[2px]">
                    {newInquiryCount} NEW
                  </span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-display font-semibold text-[#ba1a1a] bg-white border border-[#ba1a1a]/30 hover:bg-[#ba1a1a] hover:text-white rounded-[4px] transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Sign Out' : 'تسجيل الخروج'}</span>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto p-4 sm:p-7 space-y-5 sm:space-y-6 flex-1">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-[4px] border-l-4 flex items-start gap-2.5 text-xs font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-[#e6f8fa] border-[#007E94] text-[#0A1F44]'
                  : 'bg-[#ffdad6]/60 border-[#ba1a1a] text-[#93000a]'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#007E94] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#ba1a1a] shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {!isAuthorizedAdmin ? (
            /* GOOGLE SIGN-IN GATE FOR OWNER */
            <div className="py-8 px-4 text-center space-y-5 bg-[#F4F6F9] rounded-[8px] border border-[#8A94A6]/25">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#0A1F44] text-[#00B8D4] flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-display text-lg font-extrabold text-[#0A1F44]">
                  {lang === 'en'
                    ? 'Sign In with Your Admin Gmail Account'
                    : 'تسجيل الدخول بحساب جوجل الخاص بالمسؤول'}
                </h3>
                <p className="text-xs sm:text-sm text-[#44464e] leading-relaxed">
                  {lang === 'en'
                    ? `This portfolio is protected by Google Cloud Firestore Security Rules. Only "${ADMIN_EMAIL}" can sign in to view client RFQ messages or modify photos, logos, and personal details.`
                    : `هذا الموقع محمي بقواعد أمان سحابة جوجل. فقط الحساب "${ADMIN_EMAIL}" يمكنه الدخول لعرض طلبات العملاء وتعديل الصور أو الشعار أو البيانات الشخصية.`}
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="min-h-[48px] inline-flex items-center justify-center gap-3 px-6 py-3 text-xs sm:text-sm font-display font-bold text-white bg-[#1E4FD8] hover:bg-[#0A1F44] rounded-[4px] transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Lock className="w-4 h-4 text-[#00B8D4]" />
                <span>
                  {authLoading
                    ? lang === 'en'
                      ? 'Verifying Google Account...'
                      : 'جاري التحقق من الحساب...'
                    : lang === 'en'
                    ? 'Sign In with Google (Admin Only)'
                    : 'تسجيل الدخول عبر Google (للمسؤول فقط)'}
                </span>
              </button>
            </div>
          ) : activeTab === 'inquiries' ? (
            /* CLIENT TENDER & RFQ INBOX TAB (OPTIMIZED DASHBOARD VIEW) */
            <div className="space-y-4">
              {/* Dashboard KPI Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="p-3 bg-[#F4F6F9] rounded-[6px] border border-[#8A94A6]/25">
                  <div className="text-[10px] font-mono uppercase text-[#44464e]">
                    {lang === 'en' ? 'Total RFQs' : 'إجمالي الطلبات'}
                  </div>
                  <div className="font-display text-lg sm:text-xl font-extrabold text-[#0A1F44] tabular-nums mt-0.5">
                    {inquiries.length}
                  </div>
                </div>
                <div className="p-3 bg-[#fff8eb] rounded-[6px] border border-[#F39C12]/40">
                  <div className="text-[10px] font-mono uppercase text-[#A36605]">
                    {lang === 'en' ? 'New / Unread' : 'طلبات جديدة'}
                  </div>
                  <div className="font-display text-lg sm:text-xl font-extrabold text-[#A36605] tabular-nums mt-0.5">
                    {newInquiryCount}
                  </div>
                </div>
                <div className="p-3 bg-[#e6f8fa] rounded-[6px] border border-[#007E94]/35">
                  <div className="text-[10px] font-mono uppercase text-[#007E94]">
                    {lang === 'en' ? 'Contacted' : 'تم التواصل'}
                  </div>
                  <div className="font-display text-lg sm:text-xl font-extrabold text-[#007E94] tabular-nums mt-0.5">
                    {contactedCount}
                  </div>
                </div>
                <div className="p-3 bg-[#eff3ff] rounded-[6px] border border-[#1E4FD8]/30">
                  <div className="text-[10px] font-mono uppercase text-[#1E4FD8]">
                    {lang === 'en' ? 'Reviewed' : 'تمت المراجعة'}
                  </div>
                  <div className="font-display text-lg sm:text-xl font-extrabold text-[#1E4FD8] tabular-nums mt-0.5">
                    {reviewedCount}
                  </div>
                </div>
              </div>

              {/* Filter & Search Bar + CSV Export */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#8A94A6]/20">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {(
                    [
                      { key: 'all', en: 'All', ar: 'الكل' },
                      { key: 'new', en: 'New', ar: 'جديد' },
                      { key: 'contacted', en: 'Contacted', ar: 'تم التواصل' },
                      { key: 'reviewed', en: 'Reviewed', ar: 'مراجع' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setInquiryFilter(tab.key)}
                      className={`min-h-[36px] px-3 py-1 text-xs font-display font-semibold rounded-[4px] transition-colors cursor-pointer whitespace-nowrap ${
                        inquiryFilter === tab.key
                          ? 'bg-[#0A1F44] text-white'
                          : 'bg-[#F4F6F9] text-[#44464e] hover:text-[#0A1F44]'
                      }`}
                    >
                      {tab[lang]}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-52">
                    <Search className="w-3.5 h-3.5 text-[#8A94A6] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={inquirySearch}
                      onChange={(e) => setInquirySearch(e.target.value)}
                      placeholder={
                        lang === 'en' ? 'Search company or phone...' : 'بحث بالشركة أو الجوال...'
                      }
                      className="min-h-[36px] w-full pl-8 pr-2.5 py-1 text-xs bg-[#F4F6F9] border border-[#8A94A6]/35 rounded-[4px] text-[#0A1F44] focus:outline-none focus:bg-white focus:border-[#1E4FD8]"
                    />
                  </div>
                  {inquiries.length > 0 && (
                    <button
                      type="button"
                      onClick={handleExportInquiriesCSV}
                      className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1 text-xs font-display font-bold text-[#0A1F44] bg-white border border-[#0A1F44] hover:bg-[#0A1F44] hover:text-white rounded-[4px] transition-colors cursor-pointer shrink-0"
                      title="Export all client inquiries to Excel/CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {lang === 'en' ? 'Export CSV' : 'تصدير CSV'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {filteredInquiries.length === 0 ? (
                <div className="py-12 px-4 text-center bg-[#F4F6F9] rounded-[8px] border border-[#8A94A6]/25 space-y-2">
                  <Inbox className="w-8 h-8 text-[#8A94A6] mx-auto" />
                  <div className="font-display text-sm font-bold text-[#0A1F44]">
                    {lang === 'en'
                      ? 'No Matching Client Tender Inquiries'
                      : 'لا توجد طلبات مناقصات مطابقة'}
                  </div>
                  <p className="text-xs text-[#44464e] max-w-md mx-auto">
                    {lang === 'en'
                      ? 'When any company fills out the "Direct Project Inquiry & Tender Requisition Form" at the bottom of your website, their full contact details and manpower order will appear here.'
                      : 'عندما يقوم أي عميل بتعبئة نموذج طلب المناقصة في أسفل الموقع، ستظهر كافة بياناته وتفاصيل طلبه هنا فوراً.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInquiries.map((inq) => {
                    const statusBorderClass =
                      inq.status === 'new'
                        ? 'border-l-[#F39C12]'
                        : inq.status === 'contacted'
                        ? 'border-l-[#007E94]'
                        : 'border-l-[#1E4FD8]';
                    return (
                    <div
                      key={inq.id}
                      className={`bg-white rounded-[8px] border border-[#8A94A6]/35 border-l-4 ${statusBorderClass} p-4 sm:p-5 space-y-3.5`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#8A94A6]/20">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#0A1F44] bg-white px-2.5 py-1 rounded-[4px] border border-[#8A94A6]/30 tabular-nums">
                            {inq.referenceId}
                          </span>
                          <span
                            className={`text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded-[2px] ${
                              inq.status === 'new'
                                ? 'bg-[#F39C12] text-[#0A1F44]'
                                : inq.status === 'contacted'
                                ? 'bg-[#007E94] text-white'
                                : 'bg-[#1E4FD8] text-white'
                            }`}
                          >
                            {inq.status}
                          </span>
                          <span className="text-xs font-mono text-[#44464e] inline-flex items-center gap-1 tabular-nums">
                            <Clock className="w-3 h-3 text-[#8A94A6]" />
                            {inq.timestampDisplay}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateInquiryStatus(
                                inq.id,
                                inq.status === 'contacted' ? 'reviewed' : 'contacted'
                              )
                            }
                            className="min-h-[36px] inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-display font-semibold bg-white border border-[#0A1F44]/30 hover:bg-[#0A1F44] hover:text-white text-[#0A1F44] rounded-[4px] transition-colors cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>
                              {inq.status === 'contacted'
                                ? lang === 'en'
                                  ? 'Mark Reviewed'
                                  : 'تمت المراجعة'
                                : lang === 'en'
                                ? 'Mark Contacted'
                                : 'تم التواصل'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="min-h-[36px] inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-display font-semibold bg-white border border-[#ba1a1a]/30 hover:bg-[#ba1a1a] hover:text-white text-[#ba1a1a] rounded-[4px] transition-colors cursor-pointer"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-white p-3 rounded-[4px] border border-[#8A94A6]/20">
                          <div className="text-[11px] text-[#8A94A6] font-mono uppercase">
                            {lang === 'en' ? 'Client Company & Contact' : 'الشركة والمسؤول'}
                          </div>
                          <div className="font-display font-bold text-sm text-[#0A1F44] mt-0.5 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#1E4FD8] shrink-0" />
                            <span>{inq.organization}</span>
                          </div>
                          <div className="text-[#121c2a] font-medium mt-0.5">{inq.contactName}</div>
                          <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-[#8A94A6]/15 font-mono">
                            <a
                              href={`tel:${inq.phone.replace(/\s+/g, '')}`}
                              className="inline-flex items-center gap-1 text-[#1E4FD8] hover:underline"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{inq.phone}</span>
                            </a>
                            <a
                              href={`mailto:${inq.email}`}
                              className="inline-flex items-center gap-1 text-[#1E4FD8] hover:underline break-all"
                            >
                              <Mail className="w-3 h-3" />
                              <span>{inq.email}</span>
                            </a>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-[4px] border border-[#8A94A6]/20 space-y-1.5">
                          <div>
                            <span className="text-[11px] text-[#8A94A6] font-mono uppercase block">
                              {lang === 'en' ? 'Region & Contract Value' : 'المنطقة والميزانية'}
                            </span>
                            <span className="font-semibold text-[#0A1F44]">{inq.region}</span>
                            <span className="block font-mono font-bold text-[#1E4FD8]">
                              {inq.estimatedBudgetSAR} · {inq.mobilizationTimeline}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-[#8A94A6] font-mono uppercase block">
                              {lang === 'en' ? 'Requested Scopes' : 'النطاقات المطلوبة'}
                            </span>
                            <span className="text-[#121c2a]">{inq.selectedScopesSummary}</span>
                          </div>
                        </div>
                      </div>

                      {inq.attachedTradesSummary && (
                        <div className="bg-white p-3 rounded-[4px] border border-[#8A94A6]/20 text-xs">
                          <span className="text-[11px] font-mono uppercase text-[#007E94] font-semibold block mb-1">
                            {lang === 'en'
                              ? 'Attached Workforce Schedule:'
                              : 'جدول القوى العاملة المرفق:'}
                          </span>
                          <p className="font-mono text-[#0A1F44]">{inq.attachedTradesSummary}</p>
                        </div>
                      )}

                      {inq.notes && (
                        <div className="bg-white p-3 rounded-[4px] border border-[#8A94A6]/20 text-xs">
                          <span className="text-[11px] font-mono uppercase text-[#8A94A6] block mb-1">
                            {lang === 'en' ? 'Client Notes / BOQ Details:' : 'ملاحظات العميل:'}
                          </span>
                          <p className="text-[#121c2a] whitespace-pre-line">{inq.notes}</p>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'company_profile' ? (
            /* COMPANY PROFILE DOCUMENT SETUP TAB (UPLOAD PDF / LINK / CUSTOM PROFILE TEXT) */
            <form onSubmit={handleSaveCompanyProfileToCloud} className="space-y-6">
              <input
                ref={companyProfileFileRef}
                type="file"
                accept=".pdf,image/*,.doc,.docx,.txt"
                onChange={handleCompanyProfileFileChange}
                className="hidden"
              />

              <div className="p-4 bg-[#0A1F44] text-white rounded-[8px] border-l-4 border-[#00B8D4] space-y-1.5">
                <div className="flex items-center gap-2 font-display text-sm sm:text-base font-bold">
                  <FileText className="w-4 h-4 text-[#00B8D4] shrink-0" />
                  <span>
                    {lang === 'en'
                      ? 'Configure "Download Company Profile" Button'
                      : 'إعداد زر "تحميل ملف الشركة (Download Company Profile)"'}
                  </span>
                </div>
                <p className="text-xs text-white/80 leading-relaxed">
                  {lang === 'en'
                    ? 'Here you can upload your official Company Profile PDF/Brochure file, paste a Google Drive PDF link, or customize the official Company Profile text that clients download when they click "Download Company Profile".'
                    : 'من هنا يمكنك رفع ملف بروفايل الشركة (PDF أو صورة)، أو وضع رابط مباشر من Google Drive، أو تعديل النصوص الرسمية لملف الشركة الذي يقوم العملاء بتحميله.'}
                </p>
              </div>

              {/* Option 1: Direct File Upload (PDF / Image Brochure) */}
              <div className="p-4 sm:p-5 bg-[#F4F6F9] rounded-[8px] border border-[#8A94A6]/35 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono font-bold text-[#1E4FD8] uppercase">
                      {lang === 'en'
                        ? 'OPTION 1 · UPLOAD PDF OR IMAGE BROCHURE FILE'
                        : 'الخيار 1 · رفع ملف بروفايل الشركة (PDF أو صورة)'}
                    </div>
                    <h4 className="font-display text-sm font-bold text-[#0A1F44] mt-0.5">
                      {lang === 'en'
                        ? 'Upload Official Company Profile File from Your Device'
                        : 'رفع ملف تعريف الشركة مباشرة من جهازك أو جوالك'}
                    </h4>
                    <p className="text-xs text-[#44464e] mt-0.5">
                      {lang === 'en'
                        ? 'Supports PDF files (up to 500 KB) or high-resolution Brochure Images (auto-compressed).'
                        : 'يدعم ملفات PDF (حتى 500 كيلوبايت) أو صور البروشور عالية الدقة.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => companyProfileFileRef.current?.click()}
                    className="min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0A1F44] hover:bg-[#1E4FD8] text-white text-xs font-display font-bold rounded-[4px] transition-colors cursor-pointer shrink-0"
                  >
                    <Upload className="w-4 h-4 text-[#00B8D4]" />
                    <span>
                      {lang === 'en'
                        ? 'Choose PDF / Brochure File'
                        : 'اختر ملف PDF أو صورة البروشور'}
                    </span>
                  </button>
                </div>

                {profileDocState.uploadedFileName ? (
                  <div className="p-3 bg-white rounded-[4px] border border-[#007E94]/40 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-[#007E94] shrink-0" />
                      <span className="font-mono font-bold text-[#0A1F44]">
                        {profileDocState.uploadedFileName}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#e6f8fa] text-[#007E94] rounded-[2px]">
                        {lang === 'en' ? 'Attached & Ready' : 'مرفق وجاهز'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setProfileDocState((prev) => ({
                          ...prev,
                          uploadedFileName: '',
                          uploadedFileDataUrl: '',
                        }))
                      }
                      className="text-xs font-mono text-[#ba1a1a] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Remove File' : 'حذف الملف المرفق'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-[#8A94A6]">
                    {lang === 'en'
                      ? 'No custom file uploaded yet (Using generated Official Company Profile or External Link).'
                      : 'لم يتم رفع ملف مخصص بعد (سيتم استخدام الرابط الخارجي أو ملف الشركة التلقائي الموثق).'}
                  </div>
                )}
              </div>

              {/* Option 2: External PDF / Google Drive Link (For large multi-megabyte PDFs) */}
              <div className="p-4 sm:p-5 bg-[#F4F6F9] rounded-[8px] border border-[#8A94A6]/35 space-y-2.5">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-[#1E4FD8] shrink-0" />
                  <span className="text-xs font-mono font-bold text-[#1E4FD8] uppercase">
                    {lang === 'en'
                      ? 'OPTION 2 · GOOGLE DRIVE OR DIRECT PDF LINK (FOR LARGE PDF FILES)'
                      : 'الخيار 2 · رابط ملف PDF من Google Drive (للملفات ذات الحجم الكبير)'}
                  </span>
                </div>
                <p className="text-xs text-[#44464e]">
                  {lang === 'en'
                    ? 'If your Company Profile PDF is large (e.g., 5 MB – 50 MB), upload it to Google Drive or Dropbox and paste the share link here. Clicking "Download Company Profile" will open this link directly.'
                    : 'إذا كان حجم ملف PDF كبيراً (مثل 5 إلى 50 ميجابايت)، ارفعه على Google Drive والصق الرابط هنا ليتم فتحه مباشرة عند الضغط على زر التحميل.'}
                </p>
                <input
                  type="url"
                  value={profileDocState.externalPdfUrl}
                  onChange={(e) =>
                    setProfileDocState((prev) => ({ ...prev, externalPdfUrl: e.target.value }))
                  }
                  placeholder="https://drive.google.com/file/d/... or https://.../company-profile.pdf"
                  className="min-h-[42px] w-full px-3.5 py-2 text-xs sm:text-sm font-mono bg-white border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                />
              </div>

              {/* Option 3: Built-in Official Printable/Downloadable Company Profile Content */}
              <div className="p-4 sm:p-5 bg-white rounded-[8px] border border-[#8A94A6]/35 space-y-4">
                <div>
                  <div className="text-xs font-mono font-bold text-[#007E94] uppercase">
                    {lang === 'en'
                      ? 'OPTION 3 · OFFICIAL COMPANY PROFILE DETAILS & REGISTRATION INFO'
                      : 'الخيار 3 · البيانات الرسمية وتفاصيل السجل التجاري في ملف الشركة'}
                  </div>
                  <p className="text-xs text-[#44464e] mt-0.5">
                    {lang === 'en'
                      ? 'These details are automatically included in your downloadable Official Company Profile brochure.'
                      : 'تظهر هذه البيانات تلقائياً داخل النسخة الرسمية القابلة للطباعة والتحميل لملف الشركة.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#0A1F44] mb-1">
                      {lang === 'en'
                        ? 'Commercial Registration (CR) & License Number'
                        : 'رقم السجل التجاري والترخيص الرسمي'}
                    </label>
                    <input
                      type="text"
                      value={profileDocState.crNumber}
                      onChange={(e) =>
                        setProfileDocState((prev) => ({ ...prev, crNumber: e.target.value }))
                      }
                      placeholder="CR #2050148920 — Eastern Province, KSA"
                      className="min-h-[42px] w-full px-3 py-2 text-xs sm:text-sm font-mono border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0A1F44] mb-1">
                      {lang === 'en'
                        ? 'Headquarters Address (English)'
                        : 'عنوان المقر الرئيسي (إنجليزي)'}
                    </label>
                    <input
                      type="text"
                      value={profileDocState.headquartersEn}
                      onChange={(e) =>
                        setProfileDocState((prev) => ({ ...prev, headquartersEn: e.target.value }))
                      }
                      className="min-h-[42px] w-full px-3 py-2 text-xs sm:text-sm border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0A1F44] mb-1">
                      {lang === 'en'
                        ? 'Headquarters Address (Arabic)'
                        : 'عنوان المقر الرئيسي (عربي)'}
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={profileDocState.headquartersAr}
                      onChange={(e) =>
                        setProfileDocState((prev) => ({ ...prev, headquartersAr: e.target.value }))
                      }
                      className="min-h-[42px] w-full px-3 py-2 text-xs sm:text-sm border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#0A1F44] mb-1">
                      {lang === 'en'
                        ? 'Company Profile Overview & Core Mission (English)'
                        : 'نبذة ملف الشركة والرسالة المؤسسية (إنجليزي)'}
                    </label>
                    <textarea
                      rows={4}
                      value={profileDocState.companyOverviewEn}
                      onChange={(e) =>
                        setProfileDocState((prev) => ({
                          ...prev,
                          companyOverviewEn: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#0A1F44] mb-1">
                      {lang === 'en'
                        ? 'Company Profile Overview & Core Mission (Arabic)'
                        : 'نبذة ملف الشركة والرسالة المؤسسية (عربي)'}
                    </label>
                    <textarea
                      rows={4}
                      dir="rtl"
                      value={profileDocState.companyOverviewAr}
                      onChange={(e) =>
                        setProfileDocState((prev) => ({
                          ...prev,
                          companyOverviewAr: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#8A94A6]/25 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] px-4 py-2 text-xs font-display font-semibold text-[#0A1F44] border border-[#0A1F44] rounded-[4px] hover:bg-[#F4F6F9] transition-colors cursor-pointer"
                >
                  {lang === 'en' ? 'Cancel' : 'إلغاء'}
                </button>
                <button
                  type="submit"
                  disabled={savingProfileDoc}
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-display font-bold text-white bg-[#1E4FD8] hover:bg-[#0A1F44] rounded-[4px] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {savingProfileDoc
                      ? lang === 'en'
                        ? 'Saving Company Profile...'
                        : 'جاري حفظ ملف الشركة...'
                      : lang === 'en'
                      ? 'Save Company Profile to Cloud'
                      : 'حفظ ملف الشركة في السحابة'}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            /* FULL CLOUD SETTINGS FORM FOR VERIFIED ADMIN (BILINGUAL EN + AR) */
            <form onSubmit={handleSaveToCloud} className="space-y-6">
              {/* Quick Banner to Configure Company Profile Document */}
              <div className="p-3.5 bg-[#fff8eb] border border-[#F39C12]/50 rounded-[6px] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-[#0A1F44]">
                  <FileText className="w-4 h-4 text-[#A36605] shrink-0" />
                  <span className="font-medium">
                    {lang === 'en'
                      ? 'Want to upload your Company Profile PDF or set the "Download Company Profile" file?'
                      : 'هل تريد رفع ملف PDF للشركة أو تعديل محتوى زر "تحميل ملف الشركة"؟'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('company_profile');
                    setStatusMessage(null);
                  }}
                  className="px-3 py-1.5 text-xs font-display font-bold text-[#0A1F44] bg-[#F39C12] hover:bg-[#f5ab29] rounded-[4px] transition-colors cursor-pointer shrink-0"
                >
                  {lang === 'en'
                    ? 'Open Company Profile Setup →'
                    : 'افتح إعداد ملف الشركة ←'}
                </button>
              </div>
              {/* Hidden file inputs */}
              <input
                ref={portraitFileRef}
                type="file"
                accept="image/*"
                onChange={handlePortraitChange}
                className="hidden"
              />
              <input
                ref={logoFileRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />

              {/* Signed-in Admin Bar (Mobile sign-out visible here) */}
              <div className="p-3.5 bg-[#eff3ff] border border-[#1E4FD8]/30 rounded-[4px] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs min-w-0">
                  <ShieldCheck className="w-4 h-4 text-[#1E4FD8] shrink-0" />
                  <span className="font-mono font-semibold text-[#0A1F44] truncate">
                    {lang === 'en' ? 'Verified Admin:' : 'المسؤول الموثق:'} {currentUser?.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-display font-semibold text-[#ba1a1a] bg-white border border-[#ba1a1a]/30 hover:bg-[#ba1a1a] hover:text-white rounded-[4px] transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Sign Out' : 'تسجيل الخروج'}</span>
                </button>
              </div>

              {/* 1. Profile Picture & Company Logo Upload Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F4F6F9] rounded-[8px] border border-[#8A94A6]/25">
                {/* Executive Portrait */}
                <div className="flex items-center gap-3.5">
                  <div className="w-18 h-24 rounded-[4px] bg-white border-2 border-[#0A1F44] p-0.5 shrink-0 overflow-hidden">
                    <img
                      src={formState.portraitDataUrl || defaultPortraitUrl}
                      alt="Executive Portrait"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs font-display font-bold text-[#0A1F44]">
                      {lang === 'en' ? 'Personal Profile Picture' : 'الصورة الشخصية'}
                    </div>
                    <button
                      type="button"
                      onClick={() => portraitFileRef.current?.click()}
                      className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A1F44] hover:bg-[#1E4FD8] text-white text-xs font-display font-semibold rounded-[4px] transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#00B8D4]" />
                      <span>{lang === 'en' ? 'Upload New Photo' : 'تغيير الصورة'}</span>
                    </button>
                    {formState.portraitDataUrl && (
                      <button
                        type="button"
                        onClick={() => setFormState((prev) => ({ ...prev, portraitDataUrl: '' }))}
                        className="block text-[11px] font-mono text-[#44464e] hover:text-[#ba1a1a] underline cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3 inline mr-1" />
                        {lang === 'en' ? 'Restore Default Photo' : 'استعادة الافتراضية'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Company Logo */}
                <div className="flex items-center gap-3.5">
                  <div className="w-18 h-18 rounded-[4px] bg-white border-2 border-[#0A1F44] p-1 shrink-0 overflow-hidden flex items-center justify-center">
                    <img
                      src={formState.logoDataUrl || defaultLogoUrl}
                      alt="Company Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs font-display font-bold text-[#0A1F44]">
                      {lang === 'en' ? 'Company Logo' : 'شعار الشركة'}
                    </div>
                    <button
                      type="button"
                      onClick={() => logoFileRef.current?.click()}
                      className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A1F44] hover:bg-[#1E4FD8] text-white text-xs font-display font-semibold rounded-[4px] transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#00B8D4]" />
                      <span>{lang === 'en' ? 'Upload New Logo' : 'تغيير الشعار'}</span>
                    </button>
                    {formState.logoDataUrl && (
                      <button
                        type="button"
                        onClick={() => setFormState((prev) => ({ ...prev, logoDataUrl: '' }))}
                        className="block text-[11px] font-mono text-[#44464e] hover:text-[#ba1a1a] underline cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3 inline mr-1" />
                        {lang === 'en' ? 'Restore Default Logo' : 'استعادة الشعار الافتراضي'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Personal & Company Identity Fields (English + Arabic) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0A1F44] mb-1">
                    {lang === 'en' ? 'Full Name (English)' : 'الاسم الكامل (إنجليزي)'}
                  </label>
                  <input
                    type="text"
                    value={formState.nameEn}
                    onChange={(e) => setFormState((p) => ({ ...p, nameEn: e.target.value }))}
                    className="min-h-[42px] w-full px-3 py-2 text-xs sm:text-sm border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A1F44] mb-1">
                    {lang === 'en' ? 'Full Name (Arabic)' : 'الاسم الكامل (عربي)'}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formState.nameAr}
                    onChange={(e) => setFormState((p) => ({ ...p, nameAr: e.target.value }))}
                    className="min-h-[42px] w-full px-3 py-2 text-xs sm:text-sm border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0A1F44] mb-1">
                    {lang === 'en' ? 'Designation / Title (English)' : 'المسمى الوظيفي (إنجليزي)'}
                  </label>
                  <input
                    type="text"
                    value={formState.roleEn}
                    onChange={(e) => setFormState((p) => ({ ...p, roleEn: e.target.value }))}
                    className="min-h-[42px] w-full px-3 py-2 text-xs sm:text-sm border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A1F44] mb-1">
                    {lang === 'en' ? 'Designation / Title (Arabic)' : 'المسمى الوظيفي (عربي)'}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formState.roleAr}
                    onChange={(e) => setFormState((p) => ({ ...p, roleAr: e.target.value }))}
                    className="min-h-[42px] w-full px-3 py-2 text-xs sm:text-sm border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0A1F44] mb-1">
                    {lang === 'en' ? 'Company Name (English)' : 'اسم الشركة (إنجليزي)'}
                  </label>
                  <input
                    type="text"
                    value={formState.companyEn}
                    onChange={(e) => setFormState((p) => ({ ...p, companyEn: e.target.value }))}
                    className="min-h-[42px] w-full px-3 py-2 text-xs sm:text-sm border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A1F44] mb-1">
                    {lang === 'en' ? 'Company Name (Arabic)' : 'اسم الشركة (عربي)'}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formState.companyAr}
                    onChange={(e) => setFormState((p) => ({ ...p, companyAr: e.target.value }))}
                    className="min-h-[42px] w-full px-3 py-2 text-xs sm:text-sm border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0A1F44] mb-1">
                    {lang === 'en' ? 'Direct Phone / WhatsApp' : 'رقم الجوال / واتساب'}
                  </label>
                  <input
                    type="text"
                    value={formState.phone}
                    onChange={(e) => setFormState((p) => ({ ...p, phone: e.target.value }))}
                    className="min-h-[42px] w-full px-3 py-2 text-xs sm:text-sm font-mono border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0A1F44] mb-1">
                    {lang === 'en' ? 'Official Contact Email' : 'البريد الإلكتروني للتواصل'}
                  </label>
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState((p) => ({ ...p, email: e.target.value }))}
                    className="min-h-[42px] w-full px-3 py-2 text-xs sm:text-sm font-mono border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0A1F44] mb-1">
                    {lang === 'en' ? 'Aramco Vendor ID' : 'رقم المورد لدى أرامكو'}
                  </label>
                  <input
                    type="text"
                    value={formState.aramcoVendorId}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, aramcoVendorId: e.target.value }))
                    }
                    className="min-h-[42px] w-full px-3 py-2 text-xs sm:text-sm font-mono border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0A1F44] mb-1">
                    {lang === 'en' ? 'IKTVA Local Content Score' : 'نسبة المحتوى المحلي (اكتفاء)'}
                  </label>
                  <input
                    type="text"
                    value={formState.iktvaScore}
                    onChange={(e) => setFormState((p) => ({ ...p, iktvaScore: e.target.value }))}
                    className="min-h-[42px] w-full px-3 py-2 text-xs sm:text-sm font-mono border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0A1F44] mb-1">
                    {lang === 'en'
                      ? 'Operating Cities / Corridors (English)'
                      : 'المدن والمناطق التشغيلية (إنجليزي)'}
                  </label>
                  <input
                    type="text"
                    value={formState.regionEn}
                    onChange={(e) => setFormState((p) => ({ ...p, regionEn: e.target.value }))}
                    className="min-h-[42px] w-full px-3 py-2 text-xs sm:text-sm border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A1F44] mb-1">
                    {lang === 'en'
                      ? 'Operating Cities / Corridors (Arabic)'
                      : 'المدن والمناطق التشغيلية (عربي)'}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formState.regionAr}
                    onChange={(e) => setFormState((p) => ({ ...p, regionAr: e.target.value }))}
                    className="min-h-[42px] w-full px-3 py-2 text-xs sm:text-sm border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0A1F44] mb-1">
                    {lang === 'en'
                      ? 'Executive Summary / Bio (English)'
                      : 'النبذة التنفيذية (إنجليزي)'}
                  </label>
                  <textarea
                    rows={3}
                    value={formState.bioEn}
                    onChange={(e) => setFormState((p) => ({ ...p, bioEn: e.target.value }))}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A1F44] mb-1">
                    {lang === 'en'
                      ? 'Executive Summary / Bio (Arabic)'
                      : 'النبذة التنفيذية (عربي)'}
                  </label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={formState.bioAr}
                    onChange={(e) => setFormState((p) => ({ ...p, bioAr: e.target.value }))}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-[#8A94A6]/40 rounded-[4px] focus:outline-none focus:border-[#1E4FD8]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#8A94A6]/25 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] px-4 py-2 text-xs font-display font-semibold text-[#0A1F44] border border-[#0A1F44] rounded-[4px] hover:bg-[#F4F6F9] transition-colors cursor-pointer"
                >
                  {lang === 'en' ? 'Cancel' : 'إلغاء'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-display font-bold text-white bg-[#1E4FD8] hover:bg-[#0A1F44] rounded-[4px] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {saving
                      ? lang === 'en'
                        ? 'Saving to Cloud...'
                        : 'جاري الحفظ...'
                      : lang === 'en'
                      ? 'Save All Changes to Cloud'
                      : 'حفظ جميع التغييرات في السحابة'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
});

AdminSettingsModal.displayName = 'AdminSettingsModal';
