import { BRAND_COLORS } from './brand';

export const MUFASAL_GOLD = BRAND_COLORS.gold;

export const SAUDI_DESIGN_TOKENS = {
  teal: { deep: BRAND_COLORS.primary, mid: BRAND_COLORS.primaryLight, muted: BRAND_COLORS.primaryMuted },
  burgundy: { deep: BRAND_COLORS.secondary, mid: BRAND_COLORS.secondaryLight, muted: BRAND_COLORS.secondaryMuted },
  sand: { cream: BRAND_COLORS.cream, olive: BRAND_COLORS.olive, warm: BRAND_COLORS.accent },
  gold: { primary: BRAND_COLORS.gold, light: BRAND_COLORS.goldLight, dark: BRAND_COLORS.goldDark },
  night: { deep: '#001518', mid: BRAND_COLORS.primaryDark },
} as const;
