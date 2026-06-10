/** هوية مفصل الرسمية */
export const BRAND_DRIVE_URL =
  'https://drive.google.com/drive/folders/1BQRf-IaVxLe9gg_byuKzzejP2bbjVxfs';

export const BRAND_COLORS = {
  primary: '#00373E',
  primaryLight: '#0A5A64',
  primaryDark: '#002228',
  primaryMuted: '#D0E4E6',
  secondary: '#481719',
  secondaryLight: '#6A2C2E',
  secondaryDark: '#2E0E10',
  secondaryMuted: '#E8D4D4',
  accent: '#735B4D',
  accentLight: '#8F786B',
  accentDark: '#4D3B32',
  accentMuted: '#E0D8D3',
  gold: '#D4A017',
  goldLight: '#E8C84A',
  goldDark: '#A8892A',
  cream: '#F2E8D4',
  olive: '#D1CDAE',
  surface: '#F5F5F5',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#4D3B32',
  textMuted: '#8F786B',
} as const;

export const BRAND_FONT = {
  family: 'ITF Rawasi Display Arabic',
  familyFallback: 'Cairo, Tahoma, sans-serif',
  weights: { light: 300, regular: 400, medium: 500, bold: 700, extraBold: 800, black: 900 },
} as const;

export const BRAND_ASSETS = {
  logoSvg: '/images/logo.svg',
  logoPng: '/images/logo.png',
  logoBlackSvg: '/images/logo.svg',
} as const;

export const BRAND_NAME = {
  ar: 'مفصل',
  en: 'MUFASAL',
  taglineAr: 'منصة الخياطة الذكية في المملكة',
  taglineEn: "Saudi Arabia's Smart Tailoring Platform",
} as const;
