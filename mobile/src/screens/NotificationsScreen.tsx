import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { apiFetch } from '../services/api';
import Icon from '../components/Icon';
import { colors, typography, spacing, radius, shadows } from '../theme';

interface NotificationsScreenProps {
  onSelectAlert?: (alert: any) => void;
}

type AlertFilter = 'ALL' | 'CRITICAL' | 'ADVISORY' | 'WEATHER';

export default function NotificationsScreen({ onSelectAlert }: NotificationsScreenProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<AlertFilter>('ALL');

  const fetchAlerts = async () => {
    try {
      const res = await apiFetch('/alerts');
      if (res.alerts) setAlerts(res.alerts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const isCritical = alert.severity === 'HIGH' || alert.severity === 'CRITICAL';
      if (filter === 'CRITICAL' && !isCritical) return false;
      if (filter === 'ADVISORY' && isCritical) return false;
      if (filter === 'WEATHER' && !((alert.title || '') + (alert.description || '')).toLowerCase().includes('flood') && !((alert.title || '') + (alert.description || '')).toLowerCase().includes('rain')) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (alert.title || '').toLowerCase().includes(q);
        const descMatch = (alert.description || '').toLowerCase().includes(q);
        const locMatch = (alert.locationName || '').toLowerCase().includes(q);
        return titleMatch || descMatch || locMatch;
      }
      return true;
    });
  }, [alerts, filter, searchQuery]);

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
        {/* ── App Bar / Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Road Alerts & Advisories</Text>
            <Text style={styles.headerSubtitle}>
              Live Ghana MTTD traffic bulletins & safety warnings
            </Text>
          </View>
        </View>

        {/* ── Search Bar ────────────────────────────────────────────────── */}
        <View style={styles.searchBar}>
          <Icon name="search" size={16} color={colors.textSubtle} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by highway, corridor, or town..."
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

        {/* ── Filter Pills ──────────────────────────────────────────────── */}
        <View style={styles.filterRow}>
          {(
            [
              { id: 'ALL', label: `All (${alerts.length})` },
              { id: 'CRITICAL', label: 'Critical / Urgent' },
              { id: 'ADVISORY', label: 'Advisories' },
              { id: 'WEATHER', label: 'Weather & Floods' },
            ] as { id: AlertFilter; label: string }[]
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

        {/* ── Content List ──────────────────────────────────────────────── */}
        {loading ? (
          <View style={styles.centerWrap}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Syncing emergency broadcasts...</Text>
          </View>
        ) : filteredAlerts.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Icon name="check" size={24} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No Matching Broadcasts' : 'All Routes Clear'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try a different road name or clear the search query.'
                : 'No active road warnings or traffic hazard broadcasts at this time.'}
            </Text>
          </View>
        ) : (
          filteredAlerts.map((alert) => {
            const isHigh = alert.severity === 'HIGH' || alert.severity === 'CRITICAL';
            const severityColor = isHigh ? colors.danger : colors.warning;
            const severityBg = isHigh ? colors.dangerLight : colors.warningLight;

            return (
              <TouchableOpacity
                key={alert.id}
                style={styles.card}
                activeOpacity={0.82}
                onPress={() => onSelectAlert?.(alert)}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.severityBadge, { backgroundColor: severityBg }]}>
                    <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
                    <Text style={[styles.severityText, { color: severityColor }]}>
                      {alert.severity || 'BROADCAST'}
                    </Text>
                  </View>

                  <Text style={styles.timeText}>
                    {new Date(alert.createdAt || Date.now()).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>
                  {alert.title && alert.title.trim() ? alert.title : 'Official Road Broadcast'}
                </Text>

                {/* Description */}
                <Text numberOfLines={2} style={styles.desc}>
                  {alert.description && alert.description.trim()
                    ? alert.description
                    : 'Cautionary traffic advisory issued for Ghana road network.'}
                </Text>

                {/* Landmark Location if present */}
                {alert.locationName ? (
                  <View style={styles.locationRow}>
                    <Icon name="location" size={12} color={colors.textSubtle} />
                    <Text numberOfLines={1} style={styles.locationText}>
                      {alert.locationName}
                    </Text>
                  </View>
                ) : null}

                {/* Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.sourceRow}>
                    <Icon name="shield" size={12} color={colors.textSubtle} />
                    <Text style={styles.sourceText}>Ghana MTTD Dispatch</Text>
                  </View>
                  <View style={styles.viewLink}>
                    <Text style={styles.viewLinkText}>View Advisory</Text>
                    <Icon name="chevron" size={12} color={colors.primary} />
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
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.headline,
    fontSize: 20,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSubtle,
    marginTop: 1,
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

  // Filter Pills
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

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textDisabled,
  },
  title: {
    ...typography.title,
    fontSize: 14,
    color: colors.text,
    marginBottom: 3,
  },
  desc: {
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
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sourceText: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  viewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },

  // Loading & Empty
  centerWrap: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSubtle,
    marginTop: spacing.sm,
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
    color: colors.text,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textSubtle,
    textAlign: 'center',
    maxWidth: 280,
  },
});
