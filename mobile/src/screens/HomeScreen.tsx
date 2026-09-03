import React, { useEffect, useState } from 'react';
import {
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { apiFetch, getUserData } from '../services/api';
import Icon from '../components/Icon';
import {
  Divider,
  EmptyState,
  Screen,
  SectionLabel,
  Skeleton,
  SkeletonGroup,
  Surface,
  Tag,
} from '../components/ui';
import { AREA_RADIUS_KM, areaQuery, useArea } from '../services/area';
import { colors, radius, spacing, typography } from '../theme';

interface HomeScreenProps {
  onNavigateToReport: (type: 'ACCIDENT' | 'HAZARD') => void;
  onNavigateToEmergency: () => void;
  onNavigateToMap: () => void;
  onNavigateToAlerts: () => void;
  onNavigateToTips: () => void;
  onNavigateToRoute?: () => void;
  onChangeArea?: () => void;
}

function greetingFor(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen({
  onNavigateToReport,
  onNavigateToEmergency,
  onNavigateToMap,
  onNavigateToAlerts,
  onNavigateToTips,
  onNavigateToRoute,
  onChangeArea,
}: HomeScreenProps) {
  const { area, detecting } = useArea();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [userName, setUserName] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    // Everything here is scoped to the selected area. Previously the home
    // screen reported national totals, which told a driver in Tamale about
    // incidents 600 km away and nothing about the road outside.
    const q = areaQuery(area);
    const [alertsRes, reportsRes, user] = await Promise.all([
      // strict=true so the headline count means "here". The unfiltered
      // endpoint deliberately returns distant alerts too (nothing is hidden
      // from the Alerts tab), which would otherwise make this number the
      // national total no matter where you looked.
      apiFetch(`/alerts?${q}&strict=true`).catch(() => ({ alerts: [] })),
      apiFetch(`/reports?${q}`).catch(() => ({ reports: [] })),
      getUserData().catch(() => null),
    ]);
    setAlerts(alertsRes.alerts || []);
    setReports(reportsRes.reports || []);
    const full = user?.name || user?.full_name;
    if (full) setUserName(full.split(' ')[0]);
    setLoading(false);
  };

  // Re-fetch whenever the area changes — switching to Tamale should redraw
  // the numbers, not just the label.
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area.latitude, area.longitude]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const now = new Date();
  const total = alerts.length + reports.length;
  const clear = total === 0;

  // Newest first, alerts ahead of reports — an advisory outranks a log entry.
  const feed = [
    ...alerts.map((a) => ({ kind: 'alert' as const, data: a })),
    ...reports.map((r) => ({ kind: 'report' as const, data: r })),
  ].slice(0, 4);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* ── Chrome ─────────────────────────────────────────────────────── */}
        <View style={s.topBar}>
          <Pressable
            onPress={onChangeArea}
            disabled={!onChangeArea}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Area: ${area.label}. Tap to change.`}
            style={({ pressed }) => [s.areaBtn, pressed && { opacity: 0.6 }]}
          >
            <Icon name="location" size={16} color={colors.primary} />
            <Text style={s.areaLabel} numberOfLines={1}>
              {detecting ? 'Finding you…' : area.name}
            </Text>
            {onChangeArea ? (
              <Icon name="chevron-down" size={16} color={colors.textSubtle} />
            ) : null}
          </Pressable>
          <Pressable
            onPress={onNavigateToAlerts}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={
              alerts.length ? `Alerts, ${alerts.length} active` : 'Alerts'
            }
          >
            <Icon name="bell" size={22} color={colors.textMuted} />
            {alerts.length > 0 ? <View style={s.bellDot} /> : null}
          </Pressable>
        </View>

        {/* ── Greeting ───────────────────────────────────────────────────── */}
        <Text style={s.greeting}>
          {greetingFor(now.getHours())}
          {userName ? `, ${userName}` : ''}
        </Text>
        <Text style={s.date}>
          {now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>

        {/* ── Network status ──────────────────────────────────────────────
            Asymmetric on purpose: the headline number carries the weight,
            the breakdown sits quietly beside it. */}
        <Surface style={s.status} padded={false}>
          <View style={s.statusTop}>
            <View style={s.statusHeadline}>
              {loading ? (
                <Skeleton height={38} width={54} />
              ) : (
                <Text style={s.statusValue}>{total}</Text>
              )}
              <Text style={s.statusUnit}>
                {clear
                  ? `incidents within ${AREA_RADIUS_KM} km of ${area.name}`
                  : `open ${total === 1 ? 'report' : 'reports'} within ${AREA_RADIUS_KM} km of ${area.name}`}
              </Text>
            </View>

            <View style={s.statusBreakdown}>
              <View style={s.breakdownItem}>
                <View style={[s.breakdownDot, { backgroundColor: colors.danger }]} />
                <Text style={s.breakdownValue}>{reports.length}</Text>
                <Text style={s.breakdownLabel}>incidents</Text>
              </View>
              <View style={s.breakdownItem}>
                <View style={[s.breakdownDot, { backgroundColor: colors.warning }]} />
                <Text style={s.breakdownValue}>{alerts.length}</Text>
                <Text style={s.breakdownLabel}>advisories</Text>
              </View>
            </View>
          </View>

          <Divider />

          <Pressable
            onPress={onNavigateToMap}
            accessibilityRole="button"
            style={({ pressed }) => [s.statusLink, pressed && { backgroundColor: colors.surfaceMuted }]}
          >
            <Icon name="map" size={18} color={colors.primary} />
            <Text style={s.statusLinkText}>See what is happening around {area.name}</Text>
            <Icon name="chevron" size={17} color={colors.textDisabled} />
          </Pressable>
        </Surface>

        {/* ── Reporting ───────────────────────────────────────────────────
            Weighted, not a 50/50 split — an accident is the more urgent and
            more common report, so it gets the larger target. */}
        <SectionLabel style={s.section}>Report an incident</SectionLabel>

        <View style={s.reportRow}>
          <ReportTile
            flex={1.35}
            icon="accident"
            title="Accident"
            copy="Collision, breakdown or casualty"
            tint={colors.danger}
            tintBg={colors.dangerLight}
            onPress={() => onNavigateToReport('ACCIDENT')}
          />
          <ReportTile
            flex={1}
            icon="hazard"
            title="Hazard"
            copy="Pothole, flooding, debris"
            tint={colors.warning}
            tintBg={colors.warningLight}
            onPress={() => onNavigateToReport('HAZARD')}
          />
        </View>

        {/* ── Emergency ───────────────────────────────────────────────────
            Given its own weight rather than a third slot in a card row —
            this is the one action that has to be findable without reading. */}
        <Pressable
          onPress={() => Linking.openURL('tel:193')}
          onLongPress={onNavigateToEmergency}
          accessibilityRole="button"
          accessibilityLabel="Call ambulance on 193"
          accessibilityHint="Opens the dialler. Long press for the full directory."
          style={({ pressed }) => [s.emergency, pressed && { backgroundColor: '#F6E3E0' }]}
        >
          <View style={s.emergencyIcon}>
            <Icon name="ambulance" size={22} color={colors.danger} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.emergencyTitle}>Call an ambulance</Text>
            <Text style={s.emergencyCopy}>193, toll free · hold for all services</Text>
          </View>
          <Icon name="phone-filled" size={20} color={colors.danger} />
        </Pressable>

        {/* ── Shortcuts ───────────────────────────────────────────────────
            A grouped list, not a row of identical tiles. */}
        <Surface style={s.section} padded={false}>
          {onNavigateToRoute ? (
            <ShortcutRow
              icon="navigate"
              label="Check a route"
              detail="See hotspots before you drive"
              onPress={onNavigateToRoute}
            />
          ) : null}
          <ShortcutRow
            icon="map"
            label="Live hazard map"
            detail="Hotspots and road closures"
            onPress={onNavigateToMap}
          />
          <ShortcutRow
            icon="lightbulb"
            label="Safety guidance"
            detail="What to do at a crash scene"
            onPress={onNavigateToTips}
          />
          <ShortcutRow
            icon="hospital"
            label="Emergency directory"
            detail="Hospitals, police and fire stations"
            onPress={onNavigateToEmergency}
            last
          />
        </Surface>

        {/* ── Feed ────────────────────────────────────────────────────────── */}
        <SectionLabel style={s.section} action="See all" onAction={onNavigateToAlerts}>
          Latest on the network
        </SectionLabel>

        {loading ? (
          <SkeletonGroup>
            <Surface padded={false}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={s.feedRow}>
                  <Skeleton height={13} width="30%" />
                  <Skeleton height={15} width="80%" style={{ marginTop: spacing.sm }} />
                  <Skeleton height={13} width="45%" style={{ marginTop: 6 }} />
                </View>
              ))}
            </Surface>
          </SkeletonGroup>
        ) : clear ? (
          <Surface>
            <EmptyState
              icon="check-badge"
              tone="success"
              title="Nothing reported today"
              description="No open incidents or advisories on the network right now."
            />
          </Surface>
        ) : (
          <Surface padded={false}>
            {feed.map((entry, i) => (
              <FeedRow
                key={`${entry.kind}-${entry.data.id ?? i}`}
                entry={entry}
                last={i === feed.length - 1}
                onPress={onNavigateToAlerts}
              />
            ))}
          </Surface>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </Screen>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function ReportTile({
  flex,
  icon,
  title,
  copy,
  tint,
  tintBg,
  onPress,
}: {
  flex: number;
  icon: string;
  title: string;
  copy: string;
  tint: string;
  tintBg: string;
  onPress: () => void;
}) {
  return (
    <Surface
      onPress={onPress}
      accessibilityLabel={`Report ${title}. ${copy}`}
      containerStyle={{ flex }}
      style={{ minHeight: 138 }}
    >
      <View style={[s.reportIcon, { backgroundColor: tintBg }]}>
        <Icon name={icon} size={22} color={tint} />
      </View>
      <Text style={s.reportTitle}>{title}</Text>
      <Text style={s.reportCopy}>{copy}</Text>
    </Surface>
  );
}

function ShortcutRow({
  icon,
  label,
  detail,
  onPress,
  last,
}: {
  icon: string;
  label: string;
  detail: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        s.shortcut,
        last && { borderBottomWidth: 0 },
        pressed && { backgroundColor: colors.surfaceMuted },
      ]}
    >
      <Icon name={icon} size={20} color={colors.textMuted} />
      <View style={{ flex: 1 }}>
        <Text style={s.shortcutLabel}>{label}</Text>
        <Text style={s.shortcutDetail}>{detail}</Text>
      </View>
      <Icon name="chevron" size={17} color={colors.textDisabled} />
    </Pressable>
  );
}

function FeedRow({
  entry,
  last,
  onPress,
}: {
  entry: { kind: 'alert' | 'report'; data: any };
  last?: boolean;
  onPress: () => void;
}) {
  const { kind, data } = entry;
  const critical = data.severity === 'HIGH' || data.severity === 'CRITICAL';
  const isAccident = data.type === 'ACCIDENT';

  const tone = kind === 'alert' ? (critical ? 'danger' : 'warning') : isAccident ? 'danger' : 'warning';
  const label =
    kind === 'alert' ? (critical ? 'Urgent advisory' : 'Advisory') : isAccident ? 'Accident' : 'Hazard';

  const when = new Date(data.createdAt || Date.now());
  const sameDay = when.toDateString() === new Date().toDateString();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        s.feedRow,
        last && { borderBottomWidth: 0 },
        pressed && { backgroundColor: colors.surfaceMuted },
      ]}
    >
      <View style={s.feedTop}>
        <Tag label={label} tone={tone} />
        <Text style={s.feedTime}>
          {sameDay
            ? when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : when.toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </Text>
      </View>

      <Text style={s.feedTitle} numberOfLines={1}>
        {data.title?.trim() || 'Road advisory'}
      </Text>

      {data.locationName ? (
        <View style={s.feedLoc}>
          <Icon name="location" size={14} color={colors.textDisabled} />
          <Text style={s.feedLocText} numberOfLines={1}>
            {data.locationName}
          </Text>
        </View>
      ) : data.description ? (
        <Text style={s.feedLocText} numberOfLines={1}>
          {data.description}
        </Text>
      ) : null}
    </Pressable>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    marginBottom: spacing.lg,
  },
  areaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
    paddingVertical: 4,
    paddingRight: 4,
  },
  areaLabel: {
    fontSize: 15.5,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  bellDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },

  greeting: { ...typography.display },
  date: { ...typography.callout, color: colors.textSubtle, marginTop: 2 },

  // Status
  status: { marginTop: spacing.xl },
  statusTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  statusHeadline: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  statusValue: {
    fontSize: 40,
    lineHeight: 42,
    fontWeight: '700',
    letterSpacing: -1.6,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  statusUnit: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 18,
    color: colors.textSubtle,
    paddingTop: 3,
  },
  statusBreakdown: { gap: spacing.sm, paddingTop: 4 },
  breakdownItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  breakdownDot: { width: 7, height: 7, borderRadius: 4 },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontVariant: ['tabular-nums'],
    minWidth: 14,
    textAlign: 'right',
  },
  breakdownLabel: { fontSize: 13, color: colors.textSubtle },

  statusLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  statusLinkText: { flex: 1, fontSize: 14.5, fontWeight: '500', color: colors.text },

  section: { marginTop: spacing.xxl },

  // Report tiles
  reportRow: { flexDirection: 'row', gap: spacing.md },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  reportTitle: { ...typography.title },
  reportCopy: { ...typography.micro, marginTop: 2, lineHeight: 17 },

  // Emergency
  emergency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.dangerLight,
  },
  emergencyIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(188,59,47,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTitle: { fontSize: 15.5, fontWeight: '600', color: colors.dangerDark, letterSpacing: -0.2 },
  emergencyCopy: { fontSize: 13, color: colors.dangerDark, opacity: 0.75, marginTop: 1 },

  // Shortcuts
  shortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 60,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  shortcutLabel: { fontSize: 15.5, fontWeight: '500', color: colors.text, letterSpacing: -0.2 },
  shortcutDetail: { ...typography.micro, marginTop: 2 },

  // Feed
  feedRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  feedTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  feedTime: { ...typography.micro, color: colors.textDisabled, fontVariant: ['tabular-nums'] },
  feedTitle: { fontSize: 15.5, fontWeight: '500', color: colors.text, letterSpacing: -0.2 },
  feedLoc: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  feedLocText: { ...typography.micro, flex: 1, marginTop: 0 },
});
