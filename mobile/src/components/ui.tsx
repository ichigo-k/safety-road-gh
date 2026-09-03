// ─── Safety Road Ghana — UI Kit ───────────────────────────────────────────────
//
// Surfaces are flat. Grouping comes from spacing and hairlines, not from a
// border-plus-shadow on every box. Elevation is reserved for chrome that
// genuinely floats above content (the tab bar, the call bar).
//
// Motion budget is deliberately small: press feedback at 120ms and nothing
// else. Press feedback fires on press-IN — waiting for release feels dead.

import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Icon from './Icon';
import { colors, motion, radius, shadows, spacing, typography } from '../theme';

const EASE_OUT = Easing.bezier(...motion.easeOut);
const useNative = Platform.OS !== 'web';

/* ── Press feedback ─────────────────────────────────────────────────────────
 * scale 0.97 over 120ms, starting the instant the finger lands. Shared by
 * every pressable surface so the whole app responds with one physics.
 * ------------------------------------------------------------------------ */

function usePressScale() {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) =>
    Animated.timing(scale, {
      toValue: v,
      duration: motion.press,
      easing: EASE_OUT,
      useNativeDriver: useNative,
    }).start();
  return {
    scale,
    onPressIn: () => to(motion.pressScale),
    onPressOut: () => to(1),
  };
}

/* ── Screen ──────────────────────────────────────────────────────────────── */

export function Screen({
  children,
  style,
  background = colors.background,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  background?: string;
}) {
  return (
    <SafeAreaView style={[s.screen, { backgroundColor: background }, style]}>
      <StatusBar barStyle="dark-content" backgroundColor={background} />
      {children}
    </SafeAreaView>
  );
}

/* ── Screen header ───────────────────────────────────────────────────────── */

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={s.header}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={s.backBtn}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="back" size={22} color={colors.text} />
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={typography.headline} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={s.headerSub} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

/* ── Section label ───────────────────────────────────────────────────────────
 * Sentence case. Hierarchy comes from weight and colour, not from shouting in
 * letter-spaced capitals.
 * ------------------------------------------------------------------------ */

export function SectionLabel({
  children,
  action,
  onAction,
  style,
}: {
  children: React.ReactNode;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.sectionRow, style]}>
      <Text style={s.sectionLabel}>{children}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button">
          <Text style={s.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ── Surface ─────────────────────────────────────────────────────────────────
 * The default content container. Flat white on the sunken page tone — no
 * border, no shadow. `raised` exists for the rare case where elevation is
 * actually communicating hierarchy.
 * ------------------------------------------------------------------------ */

export function Surface({
  children,
  style,
  containerStyle,
  onPress,
  padded = true,
  variant = 'plain',
  accessibilityLabel,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Applied to the outer pressable wrapper. Layout that has to reach the
   *  parent flex row — `flex`, `alignSelf` — belongs here, not in `style`,
   *  which lands on the inner surface and never sees the parent. */
  containerStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padded?: boolean;
  variant?: 'plain' | 'outlined' | 'raised' | 'sunken';
  accessibilityLabel?: string;
}) {
  const variantStyle =
    variant === 'outlined'
      ? s.surfaceOutlined
      : variant === 'raised'
      ? [s.surfacePlain, shadows.card]
      : variant === 'sunken'
      ? s.surfaceSunken
      : s.surfacePlain;

  const body = (
    <View style={[s.surface, variantStyle, padded && { padding: spacing.lg }, style]}>
      {children}
    </View>
  );

  if (!onPress) {
    return containerStyle ? <View style={containerStyle}>{body}</View> : body;
  }

  return (
    <PressableSurface onPress={onPress} label={accessibilityLabel} style={containerStyle}>
      {body}
    </PressableSurface>
  );
}

// Kept as an alias so screens that already import `Card` keep working.
export const Card = Surface;

function PressableSurface({
  children,
  onPress,
  label,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const press = usePressScale();
  return (
    <Pressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      pressRetentionOffset={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={style}
    >
      {/* The scale wrapper must stretch, or a flexed pressable collapses back
          to content width once the animated view sits between them. */}
      <Animated.View style={[{ flexGrow: 1 }, { transform: [{ scale: press.scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

/* ── Severity tag ────────────────────────────────────────────────────────────
 * Squared, not pill. Reads as a system label rather than a marketing badge.
 * ------------------------------------------------------------------------ */

export type Tone = 'primary' | 'danger' | 'warning' | 'success' | 'accent' | 'neutral';

const TONES: Record<Tone, { fg: string; bg: string }> = {
  primary: { fg: colors.primaryDark, bg: colors.primaryLight },
  danger: { fg: colors.dangerDark, bg: colors.dangerLight },
  warning: { fg: colors.warningDark, bg: colors.warningLight },
  success: { fg: colors.primaryDark, bg: colors.successLight },
  accent: { fg: colors.accentDark, bg: colors.accentLight },
  neutral: { fg: colors.textMuted, bg: colors.surfaceMuted },
};

export function Tag({
  label,
  tone = 'neutral',
  icon,
  style,
}: {
  label: string;
  tone?: Tone;
  icon?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = TONES[tone];
  return (
    <View style={[s.tag, { backgroundColor: t.bg }, style]}>
      {icon ? <Icon name={icon} size={12} color={t.fg} /> : null}
      <Text style={[s.tagText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

export const Badge = Tag;

/* ── Status dot + text ───────────────────────────────────────────────────────
 * For live state, a dot plus plain text beats another coloured pill.
 * ------------------------------------------------------------------------ */

export function StatusText({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const t = TONES[tone];
  return (
    <View style={s.statusRow}>
      <View style={[s.statusDot, { backgroundColor: t.fg }]} />
      <Text style={[s.statusLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

/* ── Button ──────────────────────────────────────────────────────────────── */

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  disabled,
  full,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'danger' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconRight?: string;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const press = usePressScale();
  const isDisabled = disabled || loading;

  const palette: Record<string, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.primary, fg: colors.onPrimary },
    danger: { bg: colors.danger, fg: '#FFFFFF' },
    secondary: { bg: colors.surfaceMuted, fg: colors.text },
    ghost: { bg: 'transparent', fg: colors.primary },
    outline: { bg: 'transparent', fg: colors.text, border: colors.borderStrong },
  };
  const p = palette[variant];

  const sizing = {
    sm: { h: 40, px: spacing.lg, fs: 14, gap: 6 },
    md: { h: 48, px: spacing.xl, fs: 15, gap: 8 },
    lg: { h: 54, px: spacing.xxl, fs: 16, gap: 8 },
  }[size];

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      onPressIn={isDisabled ? undefined : press.onPressIn}
      onPressOut={isDisabled ? undefined : press.onPressOut}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      style={full ? { width: '100%' } : undefined}
    >
      <Animated.View
        style={[
          s.btn,
          {
            height: sizing.h,
            paddingHorizontal: sizing.px,
            gap: sizing.gap,
            backgroundColor: p.bg,
            borderWidth: p.border ? 1 : 0,
            borderColor: p.border,
            transform: [{ scale: press.scale }],
            opacity: isDisabled ? 0.45 : 1,
          },
          full && { width: '100%' },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={p.fg} />
        ) : (
          <>
            {icon ? <Icon name={icon} size={sizing.fs + 3} color={p.fg} /> : null}
            <Text style={[s.btnText, { color: p.fg, fontSize: sizing.fs }]}>{label}</Text>
            {iconRight ? <Icon name={iconRight} size={sizing.fs + 1} color={p.fg} /> : null}
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

/* ── Filter chips ────────────────────────────────────────────────────────── */

export function FilterChips<T extends string>({
  items,
  value,
  onChange,
  style,
}: {
  items: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.chipRow}
      style={style}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[s.chip, active && s.chipActive]}
          >
            <Text style={[s.chipText, active && s.chipTextActive]}>{item.label}</Text>
            {typeof item.count === 'number' ? (
              <Text style={[s.chipCount, active && s.chipCountActive]}>{item.count}</Text>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* ── Search field ────────────────────────────────────────────────────────── */

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search',
  style,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.search, style]}>
      <Icon name="search" size={18} color={colors.textSubtle} />
      <TextInput
        style={s.searchInput}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        accessibilityLabel={placeholder}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Icon name="close" size={17} color={colors.textSubtle} />
        </Pressable>
      ) : null}
    </View>
  );
}

/* ── Form field ──────────────────────────────────────────────────────────── */

export function Field({
  label,
  hint,
  error,
  children,
  style,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ marginBottom: spacing.lg }, style]}>
      {label ? <Text style={s.fieldLabel}>{label}</Text> : null}
      {children}
      {error ? (
        <Text style={s.fieldError}>{error}</Text>
      ) : hint ? (
        <Text style={s.fieldHint}>{hint}</Text>
      ) : null}
    </View>
  );
}

export const inputStyle: TextStyle = {
  height: 52,
  borderRadius: radius.md,
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  paddingHorizontal: spacing.lg,
  fontSize: 15,
  color: colors.text,
};

/* ── Metric ──────────────────────────────────────────────────────────────────
 * Tabular figures so the digits do not shift width when data refreshes.
 * ------------------------------------------------------------------------ */

export function Metric({
  value,
  label,
  tone = 'neutral',
  style,
}: {
  value: React.ReactNode;
  label: string;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
}) {
  const fg = tone === 'neutral' ? colors.text : TONES[tone].fg;
  return (
    <View style={style}>
      <Text style={[s.metricValue, { color: fg }]}>{value}</Text>
      <Text style={s.metricLabel}>{label}</Text>
    </View>
  );
}

export const StatTile = Metric;

/* ── List row ────────────────────────────────────────────────────────────── */

export function ListRow({
  icon,
  label,
  detail,
  right,
  onPress,
  last,
  danger,
}: {
  icon?: string;
  label: string;
  detail?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  last?: boolean;
  danger?: boolean;
}) {
  const tint = danger ? colors.danger : colors.textMuted;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
      style={({ pressed }) => [
        s.row,
        last && { borderBottomWidth: 0 },
        pressed && onPress ? { backgroundColor: colors.surfaceMuted } : null,
      ]}
    >
      {icon ? <Icon name={icon} size={20} color={tint} /> : null}
      <View style={s.rowCopy}>
        <Text style={[s.rowLabel, danger && { color: colors.danger }]}>{label}</Text>
        {detail ? <Text style={s.rowDetail}>{detail}</Text> : null}
      </View>
      {right !== undefined ? (
        right
      ) : onPress ? (
        <Icon name="chevron" size={18} color={colors.textDisabled} />
      ) : null}
    </Pressable>
  );
}

/* ── Empty state ─────────────────────────────────────────────────────────── */

export function EmptyState({
  icon = 'info',
  tone = 'neutral',
  title,
  description,
  action,
  onAction,
}: {
  icon?: string;
  tone?: Tone;
  title: string;
  description?: string;
  action?: string;
  onAction?: () => void;
}) {
  const t = TONES[tone];
  return (
    <View style={s.empty}>
      <View style={[s.emptyIcon, { backgroundColor: t.bg }]}>
        <Icon name={icon} size={24} color={t.fg} />
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      {description ? <Text style={s.emptyDesc}>{description}</Text> : null}
      {action && onAction ? (
        <Button
          label={action}
          onPress={onAction}
          variant="outline"
          size="sm"
          style={{ marginTop: spacing.lg }}
        />
      ) : null}
    </View>
  );
}

/* ── Avatar ──────────────────────────────────────────────────────────────────
 * Squircle rather than a circle — circles everywhere is the default look.
 * ------------------------------------------------------------------------ */

export function Avatar({ name, size = 52 }: { name: string; size?: number }) {
  const initials = (name || '?')
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <View
      style={[
        s.avatar,
        { width: size, height: size, borderRadius: size * 0.32 },
      ]}
    >
      <Text style={{ color: colors.primaryDark, fontWeight: '600', fontSize: size * 0.34 }}>
        {initials}
      </Text>
    </View>
  );
}

/* ── Skeleton ────────────────────────────────────────────────────────────────
 * A single shared opacity drives every bar, so the placeholder reads as one
 * surface loading rather than a wall of independently blinking rectangles.
 * ------------------------------------------------------------------------ */

const SkeletonPulse = React.createContext<Animated.Value | null>(null);

export function SkeletonGroup({ children }: { children: React.ReactNode }) {
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: useNative,
        }),
        Animated.timing(pulse, {
          toValue: 0.5,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: useNative,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return <SkeletonPulse.Provider value={pulse}>{children}</SkeletonPulse.Provider>;
}

export function Skeleton({
  height = 14,
  width = '100%',
  style,
}: {
  height?: number;
  width?: number | string;
  style?: StyleProp<ViewStyle>;
}) {
  const shared = React.useContext(SkeletonPulse);
  const own = useRef(new Animated.Value(0.7)).current;
  const opacity = shared ?? own;

  return (
    <Animated.View
      style={[
        {
          height,
          width: width as any,
          borderRadius: radius.xs,
          backgroundColor: colors.surfaceHighlight,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <Surface style={{ marginBottom: spacing.sm }}>
      <Skeleton height={12} width={70} />
      <Skeleton height={16} width="72%" style={{ marginTop: spacing.md }} />
      <Skeleton height={13} width="52%" style={{ marginTop: spacing.sm }} />
    </Surface>
  );
}

/* ── Divider ─────────────────────────────────────────────────────────────── */

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }, style]} />;
}

/* ──────────────────────────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  screen: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    marginLeft: -spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSub: { ...typography.caption, marginTop: 3 },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
  sectionAction: { fontSize: 14, fontWeight: '500', color: colors.primary },

  surface: { borderRadius: radius.lg },
  surfacePlain: { backgroundColor: colors.surface },
  surfaceOutlined: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  surfaceSunken: { backgroundColor: colors.surfaceSunken },

  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  tagText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.1 },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusLabel: { fontSize: 13, fontWeight: '500' },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  btnText: { fontWeight: '600', letterSpacing: -0.2 },

  chipRow: { gap: spacing.sm, paddingRight: spacing.xl },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '500', color: colors.textMuted },
  chipTextActive: { color: colors.onPrimary, fontWeight: '600' },
  chipCount: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textDisabled,
    fontVariant: ['tabular-nums'],
  },
  chipCountActive: { color: 'rgba(255,255,255,0.8)' },

  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 46,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  fieldHint: { ...typography.micro, marginTop: 6 },
  fieldError: { fontSize: 13, color: colors.danger, fontWeight: '500', marginTop: 6 },

  metricValue: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.9,
    fontVariant: ['tabular-nums'],
  },
  metricLabel: { ...typography.micro, marginTop: 1 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowCopy: { flex: 1 },
  rowLabel: { fontSize: 15.5, fontWeight: '500', color: colors.text, letterSpacing: -0.2 },
  rowDetail: { ...typography.micro, marginTop: 2 },

  empty: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: { ...typography.title, textAlign: 'center' },
  emptyDesc: {
    ...typography.callout,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },

  avatar: {
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
