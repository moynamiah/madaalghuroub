import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { EXECUTIVE_PROFILE } from '../data/industrialData';
import { safeImageSrc } from '../utils/safeImageSrc';

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

export const CLOUD_PORTFOLIO_CACHE_KEY = 'mada_al_ghuroub_cloud_portfolio_cache_v2';

export const DEFAULT_CLOUD_SETTINGS: CloudPortfolioState = {
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
};

function normalizeBusinessEmail(val?: string): string {
  if (!val) return '';
  const trimmed = val.trim();
  if (/^madaa?l?ghuroub@gmail\.com$/i.test(trimmed)) {
    return EXECUTIVE_PROFILE.email;
  }
  return trimmed;
}

export function sanitizeImageSrc(val?: string): string {
  return safeImageSrc(val);
}

function loadInitialPortfolioSettings(): CloudPortfolioState {
  try {
    const raw = localStorage.getItem(CLOUD_PORTFOLIO_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CloudPortfolioState>;
      return {
        ...DEFAULT_CLOUD_SETTINGS,
        ...parsed,
        email: normalizeBusinessEmail(parsed.email) || DEFAULT_CLOUD_SETTINGS.email,
        portraitDataUrl: sanitizeImageSrc(parsed.portraitDataUrl),
        logoDataUrl: sanitizeImageSrc(parsed.logoDataUrl),
      };
    }
  } catch {
    // Ignore storage read errors in restricted frames
  }
  return DEFAULT_CLOUD_SETTINGS;
}

export function useCloudPortfolio() {
  const [cloudSettings, setCloudSettings] = useState<CloudPortfolioState>(
    loadInitialPortfolioSettings
  );

  useEffect(() => {
    try {
      localStorage.removeItem('moyna_miah_custom_portrait_v1');
      localStorage.removeItem('mada_al_ghuroub_custom_logo_v1');
    } catch {
      // Ignore storage access errors in restricted frames
    }

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

          setCloudSettings((prev) => {
            const nextState: CloudPortfolioState = {
              nameEn: data.nameEn || prev.nameEn,
              nameAr: data.nameAr || prev.nameAr,
              roleEn: normalizeRoleEn(data.roleEn) || prev.roleEn,
              roleAr: normalizeRoleAr(data.roleAr) || prev.roleAr,
              companyEn: data.companyEn || prev.companyEn,
              companyAr: data.companyAr || prev.companyAr,
              email: normalizeBusinessEmail(data.email) || prev.email,
              phone: data.phone || prev.phone,
              regionEn: data.regionEn || prev.regionEn,
              regionAr: data.regionAr || prev.regionAr,
              bioEn: normalizeRoleEn(data.bioEn) || prev.bioEn,
              bioAr: normalizeRoleAr(data.bioAr) || prev.bioAr,
              aramcoVendorId: data.aramcoVendorId || prev.aramcoVendorId,
              iktvaScore: data.iktvaScore || prev.iktvaScore,
              portraitDataUrl:
                data.portraitDataUrl !== undefined
                  ? sanitizeImageSrc(data.portraitDataUrl)
                  : prev.portraitDataUrl,
              logoDataUrl:
                data.logoDataUrl !== undefined
                  ? sanitizeImageSrc(data.logoDataUrl)
                  : prev.logoDataUrl,
            };
            try {
              localStorage.setItem(CLOUD_PORTFOLIO_CACHE_KEY, JSON.stringify(nextState));
            } catch {
              // Ignore quota or storage errors
            }
            return nextState;
          });
        }
      },
      (err) => {
        console.warn('Firestore portfolio_config listener info:', err.message);
      }
    );

    return () => {
      unsubDoc();
    };
  }, []);

  return {
    cloudSettings,
  };
}
