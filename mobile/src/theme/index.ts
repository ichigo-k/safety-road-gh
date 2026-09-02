// ─── Safety Road Ghana — Premium Design System ─────────────────────────────────

export const colors = {
  // Brand Primary — Deep Forest Safety Green
  primary: '#0B7A46',
  primaryHover: '#086338',
  primaryDark: '#044224',
  primaryLight: '#E8F5EE',
  primaryContainer: '#D1EEDB',

  // Semantics & Urgency
  accent: '#186FE8', // Transport Blue
  accentLight: '#EBF3FE',
  googleBlue: '#186FE8',
  googleBlueLight: '#EBF3FE',
  danger: '#DC2626', // Accident / Critical Red
  dangerLight: '#FEE2E2',
  googleRed: '#DC2626',
  googleRedLight: '#FEE2E2',
  accident: '#DC2626',
  accidentLight: '#FEE2E2',
  warning: '#EA580C', // Hazard Sunset Orange
  warningLight: '#FFEDD5',
  hazard: '#EA580C',
  hazardLight: '#FFEDD5',
  amber: '#D97706',
  amberLight: '#FEF3C7',
  success: '#16A34A',
  successLight: '#DCFCE7',
  verified: '#0B7A46',
  verifiedLight: '#E8F5EE',
  pending: '#D97706',
  pendingLight: '#FEF3C7',
  resolved: '#16A34A',
  resolvedLight: '#DCFCE7',

  // Clean Neutral Surfaces
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F3F5',
  surfaceVariant: '#F1F3F5',
  surfaceMuted: '#F1F3F5',
  surfaceHighlight: '#E9ECEF',
  surfaceHover: '#E9ECEF',

  // Text Hierarchy
  text: '#111827', // Ink 900
  textPrimary: '#111827',
  textMuted: '#4B5563', // Slate 600
  textSecondary: '#4B5563',
  textSubtle: '#6B7280', // Gray 500
  textTertiary: '#6B7280',
  textDisabled: '#9CA3AF', // Gray 400
  textInverse: '#FFFFFF',
  textLink: '#186FE8',

  // Borders & Dividers
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',
  borderFocused: '#0B7A46',
  divider: '#F3F4F6',
};

export const typography = {
  display: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: -0.6,
  },
  headline: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: -0.4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textMuted,
    lineHeight: 20,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textMuted,
    lineHeight: 21,
  },
  bodyStrong: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textSubtle,
    lineHeight: 16,
  },
  tag: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  label: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.textSubtle,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
};

export const shadows = {
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
};
