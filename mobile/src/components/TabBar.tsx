import React, { useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';
import { colors, motion, radius, shadows, spacing } from '../theme';

export interface TabItem {
  key: string;
  label: string;
  icon: string;
  badge?: number;
}

// Base internal padding below the tabs, before any system-inset is added.
const BAR_PADDING_BOTTOM = Platform.OS === 'ios' ? spacing.lg : spacing.md;

/* ── Tab bar ─────────────────────────────────────────────────────────────────
 * Deliberately unanimated. A tab switch happens dozens of times a session, so
 * it sits in the "no animation" tier — the user pays the cost of a transition
 * every time and gets nothing back. Sliding between tabs would also imply a
 * depth relationship that peers do not have.
 *
 * The active state is carried by the filled icon plus colour, which is legible
 * at a glance and survives reduced-motion and colour-blindness better than
 * motion would.
 * ------------------------------------------------------------------------ */

function Tab({ item, active, onPress }: { item: TabItem; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={s.tab}
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
    >
      <View style={s.iconWrap}>
        <Icon
          name={active ? `${item.icon}-filled` : item.icon}
          size={23}
          color={active ? colors.primary : colors.textSubtle}
        />
        {item.badge ? (
          <View style={s.badge}>
            <Text style={s.badgeText}>{item.badge > 9 ? '9+' : item.badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[s.label, active && s.labelActive]} numberOfLines={1}>
        {item.label}
      </Text>
    </Pressable>
  );
}

export default function TabBar({
  items,
  activeKey,
  onSelect,
}: {
  items: TabItem[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  // Android draws edge-to-edge, so the system navigation bar (three-button
  // ~48dp, gesture ~24dp) sits on top of this bar and hides the tabs. Pad by
  // its real height. iOS is already cleared by the root SafeAreaView, so we
  // keep the base gap there and avoid double-insetting.
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android' ? insets.bottom : 0;

  return (
    <View
      style={[s.bar, { paddingBottom: BAR_PADDING_BOTTOM + bottomInset }]}
      accessibilityRole="tablist"
    >
      {items.map((item) => (
        <Tab
          key={item.key}
          item={item}
          active={item.key === activeKey}
          onPress={() => onSelect(item.key)}
        />
      ))}
    </View>
  );
}

/* ── Report FAB ──────────────────────────────────────────────────────────────
 * Only shown on the map, which has no other route into reporting. Press
 * feedback fires on press-in at 120ms, matching every other pressable.
 * ------------------------------------------------------------------------ */

export function ReportFab({ onPress, label = 'Report' }: { onPress: () => void; label?: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) =>
    Animated.timing(scale, {
      toValue: v,
      duration: motion.press,
      easing: Easing.bezier(...motion.easeOut),
      useNativeDriver: Platform.OS !== 'web',
    }).start();

  return (
    <Pressable
      style={s.fabWrap}
      onPress={onPress}
      onPressIn={() => to(motion.pressScale)}
      onPressOut={() => to(1)}
      accessibilityRole="button"
      accessibilityLabel="Report an incident"
    >
      <Animated.View style={[s.fab, { transform: [{ scale }] }]}>
        <Icon name="plus" size={19} color={colors.onPrimary} />
        <Text style={s.fabText}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.surface,
    paddingTop: spacing.sm,
    paddingBottom: BAR_PADDING_BOTTOM,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrap: { width: 28, height: 26, alignItems: 'center', justifyContent: 'center' },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSubtle,
    letterSpacing: 0,
  },
  labelActive: { color: colors.primary, fontWeight: '600' },
  badge: {
    position: 'absolute',
    top: -2,
    right: 0,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },

  fabWrap: { position: 'absolute', right: spacing.xl, bottom: spacing.xl },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 50,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    ...shadows.floating,
  },
  fabText: { color: colors.onPrimary, fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
});
