import React, { useState, useEffect, useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { apiFetch } from '../services/api';
import Icon from '../components/Icon';
import {
  EmptyState,
  FilterChips,
  Screen,
  SearchField,
  SkeletonCard,
  SkeletonGroup,
  Surface,
  Tag,
} from '../components/ui';
import { AREA_RADIUS_KM, areaQuery, useArea } from '../services/area';
import { colors, radius, spacing, typography } from '../theme';

interface NotificationsScreenProps {
  onSelectAlert?: (alert: any) => void;
}

type AlertFilter = 'ALL' | 'CRITICAL' | 'ADVISORY' | 'WEATHER';

const isCriticalAlert = (a: any) => a.severity === 'HIGH' || a.severity === 'CRITICAL';

const isWeatherAlert = (a: any) => {
  const text = `${a.title || ''} ${a.description || ''}`.toLowerCase();
  return text.includes('flood') || text.includes('rain');
};

export default function NotificationsScreen({ onSelectAlert }: NotificationsScreenProps) {
  const { area } = useArea();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<AlertFilter>('ALL');

  const fetchAlerts = async () => {
    try {
      // Scoped to the selected area: a broadcast about the Weija Highway is
      // not news to someone in Tamale, and burying the relevant one under
      // national noise is how people stop reading alerts at all.
      const res = await apiFetch(`/alerts?${areaQuery(area)}`);
      if (res.alerts) setAlerts(res.alerts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area.latitude, area.longitude]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  };

  const criticalCount = useMemo(() => alerts.filter(isCriticalAlert).length, [alerts]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (filter === 'CRITICAL' && !isCriticalAlert(alert)) return false;
      if (filter === 'ADVISORY' && isCriticalAlert(alert)) return false;
      if (filter === 'WEATHER' && !isWeatherAlert(alert)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (alert.title || '').toLowerCase().includes(q) ||
          (alert.description || '').toLowerCase().includes(q) ||
          (alert.locationName || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [alerts, filter, searchQuery]);

  const filterItems: { id: AlertFilter; label: string; count?: number }[] = [
    { id: 'ALL', label: 'All', count: alerts.length },
    { id: 'CRITICAL', label: 'Critical', count: criticalCount },
    { id: 'ADVISORY', label: 'Advisories' },
    { id: 'WEATHER', label: 'Weather' },
  ];

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <Text style={s.pageTitle}>Road alerts</Text>
        <Text style={s.pageSub}>
          MTTD bulletins within {AREA_RADIUS_KM} km of {area.name}
        </Text>

        {criticalCount > 0 ? (
          <View style={s.criticalBanner}>
            <View style={s.criticalIcon}>
              <Icon name="alert-triangle" size={17} color={colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.criticalTitle}>
                {criticalCount} critical {criticalCount === 1 ? 'alert' : 'alerts'} active
              </Text>
              <Text style={s.criticalCopy}>Avoid affected corridors where possible.</Text>
            </View>
          </View>
        ) : null}

        {/* ── Search + filters ───────────────────────────────────────────── */}
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by highway, corridor or town"
          style={{ marginBottom: spacing.md }}
        />

        <FilterChips items={filterItems} value={filter} onChange={setFilter} style={s.chips} />

        {/* ── List ───────────────────────────────────────────────────────── */}
        {loading ? (
          <SkeletonGroup>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </SkeletonGroup>
        ) : filteredAlerts.length === 0 ? (
          <Surface>
            <EmptyState
              icon="check-badge"
              title={searchQuery ? 'No matching broadcasts' : 'All routes clear'}
              description={
                searchQuery
                  ? 'Try a different road name, or clear the search.'
                  : 'No active road warnings or hazard broadcasts at this time.'
              }
            />
          </Surface>
        ) : (
          <Surface padded={false}>
            {filteredAlerts.map((alert, i) => (
              <AlertRow
                key={alert.id}
                alert={alert}
                last={i === filteredAlerts.length - 1}
                onPress={() => onSelectAlert?.(alert)}
              />
            ))}
          </Surface>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

// One grouped list, not a stack of floating cards. Every alert came from the
// same dispatch and offers the same action, so repeating a source line and a
// "View advisory" link on each one was pure noise — the source is stated once
// in the header and the whole row is the target.
function AlertRow({
  alert,
  last,
  onPress,
}: {
  alert: any;
  last?: boolean;
  onPress: () => void;
}) {
  const critical = isCriticalAlert(alert);
  const when = new Date(alert.createdAt || Date.now());
  const sameDay = when.toDateString() === new Date().toDateString();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${critical ? 'Urgent' : 'Advisory'}: ${alert.title || 'Road broadcast'}`}
      style={({ pressed }) => [
        s.row,
        last && { borderBottomWidth: 0 },
        pressed && { backgroundColor: colors.surfaceMuted },
      ]}
    >
      <View style={s.rowTop}>
        <Tag label={critical ? 'Urgent' : 'Advisory'} tone={critical ? 'danger' : 'warning'} />
        <Text style={s.stamp}>
          {sameDay
            ? when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : when.toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </Text>
      </View>

      <Text style={s.title} numberOfLines={2}>
        {alert.title?.trim() ? alert.title : 'Road broadcast'}
      </Text>

      {alert.description?.trim() ? (
        <Text style={s.desc} numberOfLines={2}>
          {alert.description}
        </Text>
      ) : null}

      {alert.locationName ? (
        <View style={s.locRow}>
          <Icon name="location" size={14} color={colors.textDisabled} />
          <Text style={s.locText} numberOfLines={1}>
            {alert.locationName}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  pageTitle: { ...typography.display },
  pageSub: {
    ...typography.callout,
    color: colors.textSubtle,
    marginTop: 2,
    marginBottom: spacing.xl,
  },

  criticalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.dangerLight,
    marginBottom: spacing.lg,
  },
  criticalIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(188,59,47,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  criticalTitle: { fontSize: 15, fontWeight: '600', color: colors.dangerDark },
  criticalCopy: { fontSize: 13, color: colors.dangerDark, opacity: 0.75, marginTop: 1 },

  chips: { marginBottom: spacing.lg, marginHorizontal: -spacing.xl, paddingLeft: spacing.xl },

  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  stamp: { ...typography.micro, color: colors.textDisabled, fontVariant: ['tabular-nums'] },
  title: { fontSize: 15.5, fontWeight: '500', color: colors.text, letterSpacing: -0.2 },
  desc: { ...typography.micro, marginTop: 3, lineHeight: 17 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  locText: { ...typography.micro, flex: 1 },
});
