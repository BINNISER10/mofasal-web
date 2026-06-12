/**
 * قالب Lomar Minimal — فخامة هادئة، مساحات بيضاء، خط حديث.
 * مرجع موحّد للويب والجوال.
 */
import { BRAND_COLORS } from './brand';

export const LOMAR_TEMPLATE = {
  id: 'lomar-minimal',
  nameAr: 'لومار مينيمال',
  nameEn: 'Lomar Minimal',

  fonts: {
    arabic: 'IBM Plex Sans Arabic',
    english: 'Inter',
    fallback: 'system-ui, sans-serif',
  },

  colors: {
    background: '#FFFFFF',
    backgroundMuted: '#FAFAFA',
    backgroundWarm: '#F7F5F2',
    text: '#0A0A0A',
    textMuted: '#6B6B6B',
    textSubtle: '#9A9A9A',
    border: '#E8E8E8',
    borderStrong: '#D4D4D4',
    primary: BRAND_COLORS.primary,
    accent: BRAND_COLORS.gold,
  },

  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    pill: '9999px',
  },

  shadow: {
    card: '0 1px 3px rgba(0,0,0,0.04)',
    cardHover: '0 8px 30px rgba(0,0,0,0.08)',
    nav: '0 1px 0 rgba(0,0,0,0.06)',
  },

  spacing: {
    sectionY: '5rem',
    sectionYLg: '7rem',
    container: '1280px',
  },
} as const;
