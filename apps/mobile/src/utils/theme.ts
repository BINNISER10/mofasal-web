export const colors = {
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
  white: '#FFFFFF',
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  surfaceWarm: '#F2E8D4',
  surfaceOlive: '#D1CDAE',
  surfaceGrey: '#D0D6D7',
  textPrimary: '#1A1A1A',
  textSecondary: '#4D3B32',
  textLight: '#8F786B',
  textMuted: '#B0B6B7',
  border: '#D0D6D7',
  divider: '#E5E5E5',
  error: '#D32F2F',
  success: '#2E7D32',
  warning: '#E65100',
  info: '#1565C0',
  inactive: '#B0B6B7',
  overlay: 'rgba(0,55,62,0.5)',
  gold: '#B8963E',
  starActive: '#B8963E',
  starInactive: '#D0D6D7',
  statusPending: '#E65100',
  statusActive: '#00373E',
  statusCompleted: '#2E7D32',
  statusCancelled: '#481719',
  tabBarBackground: '#FFFFFF',
  tabBarInactive: '#B0B6B7',
  tabBarActive: '#00373E',
};

export const fonts = {
  regular: {
    fontFamily: 'IBMPlexSansArabic-Regular',
    fontWeight: '400' as const,
  },
  medium: {
    fontFamily: 'IBMPlexSansArabic-Medium',
    fontWeight: '500' as const,
  },
  bold: {
    fontFamily: 'IBMPlexSansArabic-Bold',
    fontWeight: '700' as const,
  },
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
    title: 32,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  full: 50,
};

export const shadows = {
  sm: {
    shadowColor: '#00373E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#00373E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#00373E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 8,
  },
};
