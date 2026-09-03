// ─── Safety Road Ghana — Design System ────────────────────────────────────────
//
// Design read: trust-first public-safety tool, used by drivers under stress,
// often one-handed, often on a cheap Android in daylight. That dictates
// everything below — low variance, restrained motion, high legibility.
//
// Rules this file holds to:
//   · One neutral family (cool-tinted). Never mix warm and cool grays.
//   · Accents stay under ~70% saturation so they sit beside the neutrals
//     instead of screaming over them.
//   · Semantic colour (red/amber) is reserved for incident severity. It is
//     never decoration — if it is red, it means something is wrong.
//   · Shadows carry the neutral hue, never pure black.
//   · Tracking is size-specific: negative on display text, ~0 on body,
//     slightly positive on small text.

const ink = {
  900: '#14181D', // off-black — never pure #000
  800: '#252B33',
  700: '#3D444D',
  600: '#525A64',
  500: '#69727D',
  400: '#8A929C',
  300: '#B2B9C2',
  200: '#D7DCE2',
  100: '#E7EBEF',
  50: '#F0F3F6',
};

export const colors = {
  // ── Brand ────────────────────────────────────────────────────────────────
  // Desaturated forest green. Reads as institutional and calm rather than
  // the neon "safety green" every civic app defaults to.
  primary: '#146B45',
  primaryHover: '#105638',
  primaryPressed: '#105638',
  primaryDark: '#0C4630',
  primaryLight: '#E9F1EC',
  primaryContainer: '#D3E5DA',
  primarySoft: '#F3F8F5',
  onPrimary: '#FFFFFF',

  // ── Severity ─────────────────────────────────────────────────────────────
  danger: '#BC3B2F',
  dangerDark: '#8F2A21',
  dangerLight: '#FAEEEC',
  hazard: '#B4661C',
  hazardLight: '#FBF3E9',
  warning: '#B4661C',
  warningDark: '#8A4E15',
  warningLight: '#FBF3E9',
  amber: '#9A7016',
  amberLight: '#FAF4E6',
  success: '#1F7A4D',
  successLight: '#E9F3ED',
  accent: '#2B5F9E',
  accentDark: '#1F4877',
  accentLight: '#EDF2F9',

  // Aliases kept so untouched screens keep compiling.
  googleBlue: '#2B5F9E',
  googleBlueLight: '#EDF2F9',
  googleRed: '#BC3B2F',
  googleRedLight: '#FAEEEC',
  accident: '#BC3B2F',
  accidentLight: '#FAEEEC',
  verified: '#146B45',
  verifiedLight: '#E9F1EC',
  pending: '#9A7016',
  pendingLight: '#FAF4E6',
  resolved: '#1F7A4D',
  resolvedLight: '#E9F3ED',

  // ── Surfaces ─────────────────────────────────────────────────────────────
  // The page is one continuous tone. Sections differentiate by spacing and
  // hairlines, never by dropping a dark block into a light page.
  background: '#F4F6F8',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSunken: '#EDF0F3',
  surfaceSecondary: '#F0F3F6',
  surfaceVariant: '#F0F3F6',
  surfaceMuted: '#F0F3F6',
  surfaceHighlight: '#E7EBEF',
  surfaceHover: '#E7EBEF',
  surfaceInverse: ink[900],

  // ── Text ─────────────────────────────────────────────────────────────────
  text: ink[900],
  textPrimary: ink[900],
  textMuted: ink[600],
  textSecondary: ink[600],
  textSubtle: ink[500],
  textTertiary: ink[500],
  textDisabled: ink[400],
  textInverse: '#FFFFFF',
  textLink: '#2B5F9E',

  // ── Lines ────────────────────────────────────────────────────────────────
  border: ink[200],
  borderSubtle: ink[100],
  borderStrong: ink[300],
  borderFocused: '#146B45',
  divider: ink[100],
  scrim: 'rgba(20, 24, 29, 0.4)',

  ink,
};

// Tracking is size-specific — a single letterSpacing value is wrong somewhere.
export const typography = {
  display: {
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
    color: colors.text,
  },
  headline: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    color: colors.text,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500' as const,
    letterSpacing: -0.1,
    color: colors.textMuted,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
    letterSpacing: -0.05,
    color: colors.textMuted,
  },
  bodyStrong: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600' as const,
    letterSpacing: -0.15,
    color: colors.text,
  },
  callout: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    color: colors.textMuted,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    color: colors.textSubtle,
  },
  // Small text gets slightly positive tracking for legibility.
  micro: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    color: colors.textSubtle,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
    letterSpacing: 0,
    color: colors.textSubtle,
  },
  tag: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.1 },
  badge: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.1 },
  // Counts and metrics — tabular figures so digits do not jitter on refresh.
  numeric: {
    fontVariant: ['tabular-nums'] as const,
    letterSpacing: -0.5,
    color: colors.text,
  },
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
};

// Radius varies by role: tighter on inner elements, softer on containers.
export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 30,
  pill: 999,
};

// Elevation is scarce on purpose. Content surfaces are flat and separated by
// hairlines; only genuinely floating chrome casts a shadow.
export const shadows = {
  none: {},
  subtle: {
    shadowColor: ink[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  card: {
    shadowColor: ink[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  elevated: {
    shadowColor: ink[900],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  floating: {
    shadowColor: ink[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  modal: {
    shadowColor: ink[900],
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 8,
  },
};

// Motion. Trust-first read → MOTION 3: press feedback and state changes only.
// No decorative loops, no entrance choreography on tab content.
export const motion = {
  press: 120, // feedback must land on press-in, not on release
  state: 180,
  surface: 260,
  pressScale: 0.97,
  // Strong ease-out. Never ease-in on UI — it delays the moment being watched.
  easeOut: [0.23, 1, 0.32, 1] as const,
};

export const layout = {
  screenPadding: spacing.xl,
  minTouchTarget: 44,
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
};
