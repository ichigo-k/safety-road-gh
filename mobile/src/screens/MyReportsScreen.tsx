import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { apiFetch } from '../services/api';
import Icon from '../components/Icon';
import { colors, typography, spacing, radius, shadows } from '../theme';

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

  // Metrics summary
  const metrics = useMemo(() => {
    const total = reports.length;
    const resolved = reports.filter((r) => r.status === 'RESOLVED').length;
    const inReview = reports.filter((r) => r.status !== 'RESOLVED').length;
    return { total, inReview, resolved };
  }, [reports]);

  // Filter & search
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Filter tab
      if (filter === 'ACCIDENT' && r.type !== 'ACCIDENT') return false;
      if (filter === 'HAZARD' && r.type !== 'HAZARD') return false;
      if (filter === 'PENDING' && r.status === 'RESOLVED') return false;
      if (filter === 'RESOLVED' && r.status !== 'RESOLVED') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (r.title || '').toLowerCase().includes(q);
        const locMatch = (r.locationName || '').toLowerCase().includes(q);
        const descMatch = (r.description || '').toLowerCase().includes(q);
        return titleMatch || locMatch || descMatch;
      }
      return true;
    });
  }, [reports, filter, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Incident Tracking</Text>
            <Text style={styles.headerSubtitle}>
              Review status, officer verification & road clearance
            </Text>
          </View>
          {onNewReport && (
            <TouchableOpacity
              style={styles.newReportBtn}
              onPress={onNewReport}
              activeOpacity={0.85}
            >
              <Icon name="reports" size={14} color="#ffffff" />
              <Text style={styles.newReportBtnText}>+ New</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Summary Metrics Strip ───────────────────────────────────────────── */}
        <View style={styles.metricsStrip}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{metrics.total}</Text>
            <Text style={styles.metricLabel}>Total Filed</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: colors.warning }]}>{metrics.inReview}</Text>
            <Text style={styles.metricLabel}>In Review</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: colors.success }]}>{metrics.resolved}</Text>
            <Text style={styles.metricLabel}>Resolved</Text>
          </View>
        </View>

        {/* ── Search Input ────────────────────────────────────────────────────── */}
        <View style={styles.searchBar}>
          <Icon name="search" size={16} color={colors.textSubtle} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by landmark, title, or road..."
            placeholderTextColor={colors.textDisabled}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Filter Pills ────────────────────────────────────────────────────── */}
        <View style={styles.filterRow}>
          {(
            [
              { id: 'ALL', label: 'All' },
              { id: 'ACCIDENT', label: 'Accidents' },
              { id: 'HAZARD', label: 'Hazards' },
              { id: 'PENDING', label: 'In Review' },
              { id: 'RESOLVED', label: 'Resolved' },
            ] as { id: FilterType; label: string }[]
          ).map((item) => {
            const isActive = filter === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setFilter(item.id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Reports List ────────────────────────────────────────────────────── */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Syncing incident tracking logs...</Text>
          </View>
        ) : filteredReports.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Icon name="reports" size={24} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No Matches Found' : 'No Reports in this View'}
            </Text>
            <Text style={styles.emptyDesc}>
              {searchQuery
                ? 'Try a different landmark or clear the search filter.'
                : 'Accidents and road hazards you submit will be tracked here in real-time.'}
            </Text>
            {onNewReport && (
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={onNewReport}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyActionBtnText}>File Incident Report</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredReports.map((report) => {
            const isAccident = report.type === 'ACCIDENT';
            const isResolved = report.status === 'RESOLVED';
            const isVerified = report.status === 'VERIFIED';
            const statusColor = isResolved
              ? colors.success
              : isVerified
              ? colors.primary
              : colors.amber;
            const statusBg = isResolved
              ? colors.successLight
              : isVerified
              ? colors.primaryLight
              : colors.amberLight;

            return (
              <TouchableOpacity
                key={report.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => onSelectReport?.(report)}
              >
                {/* Photo thumbnail if available */}
                {report.photoUrl && (
                  <View style={styles.photoWrap}>
                    <Image
                      source={{ uri: report.photoUrl }}
                      style={styles.photo}
                      resizeMode="cover"
                    />
                    <View style={styles.photoBadge}>
                      <Icon name="camera" size={10} color="#ffffff" />
                      <Text style={styles.photoBadgeText}>Photo Attached</Text>
                    </View>
                  </View>
                )}

                <View style={styles.cardBody}>
                  {/* Category & Status Header */}
                  <View style={styles.cardTopRow}>
                    <View
                      style={[
                        styles.categoryTag,
                        {
                          backgroundColor: isAccident ? colors.dangerLight : colors.warningLight,
                        },
                      ]}
                    >
                      <Icon
                        name={isAccident ? 'accident' : 'hazard'}
                        size={11}
                        color={isAccident ? colors.danger : colors.warning}
                      />
                      <Text
                        style={[
                          styles.categoryTagText,
                          { color: isAccident ? colors.danger : colors.warning },
                        ]}
                      >
                        {report.type}
                      </Text>
                    </View>

                    <View style={[styles.statusTag, { backgroundColor: statusBg }]}>
                      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                      <Text style={[styles.statusTagText, { color: statusColor }]}>
                        {report.status}
                      </Text>
                    </View>
                  </View>

                  {/* Title & Description */}
                  <Text style={styles.cardTitle}>
                    {report.title || 'Road Incident Report'}
                  </Text>

                  <Text numberOfLines={2} style={styles.cardDesc}>
                    {report.description || 'Reported on Ghana road network.'}
                  </Text>

                  {/* Landmark */}
                  <View style={styles.locationRow}>
                    <Icon name="location" size={12} color={colors.textSubtle} />
                    <Text numberOfLines={1} style={styles.locationText}>
                      {report.locationName || 'Accra, Ghana'}
                    </Text>
                  </View>

                  {/* Footer Bar with Action */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.dateText}>
                      {new Date(report.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      ·{' '}
                      {new Date(report.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>

                    <View style={styles.reviewLink}>
                      <Text style={styles.reviewLinkText}>Review Details</Text>
                      <Icon name="chevron" size={12} color={colors.primary} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    ...typography.headline,
    fontSize: 20,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSubtle,
    marginTop: 1,
  },
  newReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    ...shadows.subtle,
  },
  newReportBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Summary Metrics Strip
  metricsStrip: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.subtle,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    ...typography.headline,
    fontSize: 18,
    color: colors.text,
    lineHeight: 22,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSubtle,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: '70%',
    backgroundColor: colors.divider,
    alignSelf: 'center',
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    padding: 0,
  },
  clearSearchText: {
    fontSize: 11,
    color: colors.textSubtle,
    fontWeight: '700',
  },

  // Filters
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.md,
  },
  filterChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSubtle,
  },
  filterChipTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },

  // Loading & Empty
  centerContainer: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.md,
    color: colors.textSubtle,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 3,
    ...shadows.card,
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.title,
    fontSize: 15,
  },
  emptyDesc: {
    ...typography.caption,
    color: colors.textSubtle,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.md,
    maxWidth: 280,
  },
  emptyActionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: radius.pill,
  },
  emptyActionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  photoWrap: {
    position: 'relative',
    width: '100%',
    height: 130,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  photoBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  cardBody: {
    padding: spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardTitle: {
    ...typography.title,
    fontSize: 14,
    marginBottom: 3,
  },
  cardDesc: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  locationText: {
    fontSize: 11,
    color: colors.textSubtle,
    fontWeight: '500',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  dateText: {
    fontSize: 11,
    color: colors.textDisabled,
  },
  reviewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reviewLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
