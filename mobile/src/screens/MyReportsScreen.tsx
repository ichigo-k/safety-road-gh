import React, { useState, useEffect, useMemo } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { apiFetch } from '../services/api';
import Icon from '../components/Icon';
import {
  EmptyState,
  FilterChips,
  Screen,
  SearchField,
  SkeletonCard,
  SkeletonGroup,
  StatusText,
  Surface,
  Tag,
  Tone,
} from '../components/ui';
import { colors, radius, spacing, typography } from '../theme';

interface MyReportsScreenProps {
  onSelectReport?: (report: any) => void;
  onNewReport?: () => void;
}

type FilterType = 'ALL' | 'ACCIDENT' | 'HAZARD' | 'PENDING' | 'RESOLVED';

export default function MyReportsScreen({ onSelectReport, onNewReport }: MyReportsScreenProps) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');

  const fetchMyReports = async () => {
    try {
      const res = await apiFetch('/reports/my');
      if (res.reports) setReports(res.reports);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyReports();
    setRefreshing(false);
  };

  const metrics = useMemo(() => {
    const total = reports.length;
    const resolved = reports.filter((r) => r.status === 'RESOLVED').length;
    const inReview = total - resolved;
    return { total, inReview, resolved };
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (filter === 'ACCIDENT' && r.type !== 'ACCIDENT') return false;
      if (filter === 'HAZARD' && r.type !== 'HAZARD') return false;
      if (filter === 'PENDING' && r.status === 'RESOLVED') return false;
      if (filter === 'RESOLVED' && r.status !== 'RESOLVED') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (r.title || '').toLowerCase().includes(q) ||
          (r.locationName || '').toLowerCase().includes(q) ||
          (r.description || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reports, filter, searchQuery]);

  const filterItems: { id: FilterType; label: string; count?: number }[] = [
    { id: 'ALL', label: 'All', count: metrics.total },
    { id: 'ACCIDENT', label: 'Accidents' },
    { id: 'HAZARD', label: 'Hazards' },
    { id: 'PENDING', label: 'In review', count: metrics.inReview },
    { id: 'RESOLVED', label: 'Resolved', count: metrics.resolved },
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
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.pageTitle}>My reports</Text>
            <Text style={s.pageSub}>Track verification and road clearance</Text>
          </View>
          {onNewReport ? (
            <Pressable
              onPress={onNewReport}
              accessibilityRole="button"
              accessibilityLabel="File a new report"
              style={({ pressed }) => [s.newBtn, pressed && { opacity: 0.85 }]}
            >
              <Icon name="plus" size={20} color={colors.onPrimary} />
            </Pressable>
          ) : null}
        </View>

        {/* ── Metrics ────────────────────────────────────────────────────── */}
        <View style={s.metrics}>
          <Metric value={metrics.total} label="Filed" tint={colors.text} />
          <View style={s.metricDivider} />
          <Metric value={metrics.inReview} label="In review" tint={colors.warning} />
          <View style={s.metricDivider} />
          <Metric value={metrics.resolved} label="Resolved" tint={colors.success} />
        </View>

        {/* ── Search + filters ───────────────────────────────────────────── */}
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by road, landmark or title"
          style={{ marginBottom: spacing.md }}
        />

        <FilterChips
          items={filterItems}
          value={filter}
          onChange={setFilter}
          style={s.chips}
        />

        {/* ── List ───────────────────────────────────────────────────────── */}
        {loading ? (
          <SkeletonGroup>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </SkeletonGroup>
        ) : filteredReports.length === 0 ? (
          <Surface>
            <EmptyState
              icon="document"
              title={searchQuery ? 'No matches found' : 'Nothing filed yet'}
              description={
                searchQuery
                  ? 'Try a different landmark, or clear the search.'
                  : 'Accidents and road hazards you submit are tracked here in real time.'
              }
              action={!searchQuery && onNewReport ? 'File a report' : undefined}
              onAction={onNewReport}
            />
          </Surface>
        ) : (
          <Surface padded={false}>
            {filteredReports.map((report, i) => (
              <ReportRow
                key={report.id}
                report={report}
                last={i === filteredReports.length - 1}
                onPress={() => onSelectReport?.(report)}
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

function Metric({ value, label, tint }: { value: number; label: string; tint: string }) {
  return (
    <View style={s.metric}>
      <Text style={[s.metricValue, { color: tint }]}>{value}</Text>
      <Text style={s.metricLabel}>{label}</Text>
    </View>
  );
}

const STATUS: Record<string, { tone: Tone; label: string }> = {
  RESOLVED: { tone: 'success', label: 'Resolved' },
  VERIFIED: { tone: 'primary', label: 'Verified' },
  PENDING: { tone: 'warning', label: 'In review' },
};

// Grouped rows rather than a stack of cards. The photo becomes a thumbnail
// instead of a full-bleed banner, so a list of ten reports stays scannable
// and every row starts at the same place.
function ReportRow({
  report,
  last,
  onPress,
}: {
  report: any;
  last?: boolean;
  onPress: () => void;
}) {
  const isAccident = report.type === 'ACCIDENT';
  const status = STATUS[report.status] ?? { tone: 'warning' as Tone, label: 'In review' };
  const stamp = report.createdAt ? new Date(report.createdAt) : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${isAccident ? 'Accident' : 'Hazard'}, ${status.label}: ${
        report.title || 'Road incident report'
      }`}
      style={({ pressed }) => [
        s.row,
        last && { borderBottomWidth: 0 },
        pressed && { backgroundColor: colors.surfaceMuted },
      ]}
    >
      <View style={{ flex: 1 }}>
        <View style={s.rowTop}>
          <Tag
            label={isAccident ? 'Accident' : 'Hazard'}
            tone={isAccident ? 'danger' : 'warning'}
          />
          <StatusText label={status.label} tone={status.tone} />
        </View>

        <Text style={s.rowTitle} numberOfLines={2}>
          {report.title || 'Road incident report'}
        </Text>

        <View style={s.rowMeta}>
          <Icon name="location" size={14} color={colors.textDisabled} />
          <Text style={s.rowMetaText} numberOfLines={1}>
            {report.locationName || 'Accra, Ghana'}
          </Text>
          {stamp ? (
            <Text style={s.rowStamp}>
              {stamp.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </Text>
          ) : null}
        </View>
      </View>

      {report.photoUrl ? (
        <Image
          source={{ uri: report.photoUrl }}
          style={s.thumb}
          resizeMode="cover"
          accessibilityLabel="Photo attached to this report"
        />
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  pageTitle: { ...typography.display },
  pageSub: { ...typography.callout, color: colors.textSubtle, marginTop: 2 },
  newBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  metric: { flex: 1, alignItems: 'center' },
  metricValue: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.9,
    fontVariant: ['tabular-nums'],
  },
  metricLabel: { ...typography.micro, marginTop: 1 },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    height: 30,
    backgroundColor: colors.border,
  },

  chips: { marginBottom: spacing.lg, marginHorizontal: -spacing.xl, paddingLeft: spacing.xl },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  rowTitle: { fontSize: 15.5, fontWeight: '500', color: colors.text, letterSpacing: -0.2 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  rowMetaText: { ...typography.micro, flex: 1 },
  rowStamp: { ...typography.micro, color: colors.textDisabled, fontVariant: ['tabular-nums'] },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
});
