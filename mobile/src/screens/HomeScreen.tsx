import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiFetch, getUserData } from '../services/api';
import Icon from '../components/Icon';
import { colors, typography, spacing, radius, shadows } from '../theme';

interface HomeScreenProps {
  onNavigateToReport: (type: 'ACCIDENT' | 'HAZARD') => void;
  onNavigateToEmergency: () => void;
  onNavigateToMap: () => void;
  onNavigateToAlerts: () => void;
  onNavigateToTips: () => void;
}

export default function HomeScreen({
  onNavigateToReport,
  onNavigateToEmergency,
  onNavigateToMap,
  onNavigateToAlerts,
  onNavigateToTips,
}: HomeScreenProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>('Driver');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const [alertsRes, reportsRes, user] = await Promise.all([
      apiFetch('/alerts').catch(() => ({ alerts: [] })),
      apiFetch('/reports').catch(() => ({ reports: [] })),
      getUserData().catch(() => null),
    ]);
    setAlerts(alertsRes.alerts || []);
    setReports(reportsRes.reports || []);
    if (user?.name || user?.full_name) {
      const firstName = (user.name || user.full_name).split(' ')[0];
      setUserName(firstName);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const activeAlerts = alerts.slice(0, 3);
  const activeCount = alerts.length + reports.length;

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
        {/* ── Minimal Brand Top Bar ─────────────────────────────────────────── */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Icon name="shield" size={18} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.appName}>Safety Roads GH</Text>
              <View style={styles.liveChip}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Ghana Road Telemetry</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Warm User Greeting & Live Status ────────────────────────────────── */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Hello, {userName} 👋</Text>
          <Text style={styles.greetingSub}>
            {activeCount > 0
              ? `There are ${activeCount} active road updates and advisories reported today.`
              : 'Ghana road corridors are currently reporting smooth, clear flow.'}
          </Text>
        </View>

        {/* ── Action Cards: Report Accident or Hazard ─────────────────────────── */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionHeading}>REPORT AN INCIDENT</Text>

          {/* Accident Card Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.actionCard, styles.actionCardAccident]}
            onPress={() => onNavigateToReport('ACCIDENT')}
          >
            <View style={styles.actionIconWrapAccident}>
              <Icon name="accident" size={24} color={colors.danger} />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Report Accident</Text>
              <Text style={styles.actionSub}>Vehicle collision, breakdown, or casualties</Text>
            </View>
            <View style={styles.actionArrowWrap}>
              <Icon name="chevron" size={16} color={colors.danger} />
            </View>
          </TouchableOpacity>

          {/* Road Hazard Card Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.actionCard, styles.actionCardHazard]}
            onPress={() => onNavigateToReport('HAZARD')}
          >
            <View style={styles.actionIconWrapHazard}>
              <Icon name="hazard" size={24} color={colors.warning} />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Report Road Hazard</Text>
              <Text style={styles.actionSub}>Potholes, flash floods, broken signals, stalled trucks</Text>
            </View>
            <View style={styles.actionArrowWrap}>
              <Icon name="chevron" size={16} color={colors.warning} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Latest Road Updates / Advisories ────────────────────────────────── */}
        <View style={styles.updatesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>LATEST ROAD UPDATES</Text>
            <TouchableOpacity onPress={onNavigateToAlerts}>
              <Text style={styles.viewAllText}>View all →</Text>
            </TouchableOpacity>
          </View>

          {alerts.length === 0 && reports.length === 0 ? (
            <View style={styles.emptyCard}>
              <Icon name="check" size={20} color={colors.primary} />
              <Text style={styles.emptyTitle}>All Routes Clear</Text>
              <Text style={styles.emptySub}>No critical hazards or alerts at this moment.</Text>
            </View>
          ) : (
            <View style={styles.updatesList}>
              {/* Show alerts if available */}
              {activeAlerts.map((alert, idx) => (
                <TouchableOpacity
                  key={`alert-${alert.id || idx}`}
                  style={styles.updateCard}
                  activeOpacity={0.82}
                  onPress={onNavigateToAlerts}
                >
                  <View style={styles.updateTopRow}>
                    <View style={styles.alertPill}>
                      <Text style={styles.alertPillText}>ADVISORY</Text>
                    </View>
                    <Text style={styles.updateTime}>
                      {new Date(alert.createdAt || Date.now()).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <Text style={styles.updateTitle}>{alert.title || 'Official Road Advisory'}</Text>
                  <Text numberOfLines={2} style={styles.updateDesc}>
                    {alert.description || 'Cautionary traffic advisory issued for Ghana road network.'}
                  </Text>
                  {alert.locationName ? (
                    <View style={styles.locationRow}>
                      <Icon name="location" size={11} color={colors.textSubtle} />
                      <Text numberOfLines={1} style={styles.locationText}>
                        {alert.locationName}
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              ))}

              {/* Show recent reports if few alerts */}
              {activeAlerts.length < 2 &&
                reports.slice(0, 2).map((report, idx) => (
                  <View key={`report-${report.id || idx}`} style={styles.updateCard}>
                    <View style={styles.updateTopRow}>
                      <View
                        style={[
                          styles.alertPill,
                          {
                            backgroundColor:
                              report.type === 'ACCIDENT'
                                ? colors.dangerLight
                                : colors.warningLight,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.alertPillText,
                            {
                              color:
                                report.type === 'ACCIDENT'
                                  ? colors.danger
                                  : colors.warning,
                            },
                          ]}
                        >
                          {report.type}
                        </Text>
                      </View>
                      <Text style={styles.updateTime}>
                        {new Date(report.createdAt || Date.now()).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                    <Text style={styles.updateTitle}>{report.title}</Text>
                    <Text numberOfLines={1} style={styles.updateDesc}>
                      {report.description}
                    </Text>
                    <View style={styles.locationRow}>
                      <Icon name="location" size={11} color={colors.textSubtle} />
                      <Text numberOfLines={1} style={styles.locationText}>
                        {report.locationName || 'Accra, Ghana'}
                      </Text>
                    </View>
                  </View>
                ))}
            </View>
          )}
        </View>

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

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.subtle,
  },
  appName: {
    ...typography.headline,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 1,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSubtle,
  },

  // Greeting
  greetingSection: {
    marginBottom: spacing.xl,
  },
  greetingTitle: {
    ...typography.display,
    fontSize: 24,
    marginBottom: 4,
  },
  greetingSub: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },

  // Action Cards
  actionSection: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSubtle,
    letterSpacing: 1.1,
    marginBottom: spacing.xs,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.card,
  },
  actionCardAccident: {},
  actionCardHazard: {},
  actionIconWrapAccident: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconWrapHazard: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    ...typography.title,
    fontSize: 16,
    marginBottom: 2,
  },
  actionSub: {
    ...typography.caption,
    color: colors.textSubtle,
    lineHeight: 16,
  },
  actionArrowWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Updates Section
  updatesSection: {
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  updatesList: {
    gap: spacing.sm,
  },
  updateCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.subtle,
  },
  updateTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertPill: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  alertPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.warning,
    letterSpacing: 0.4,
  },
  updateTime: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textDisabled,
  },
  updateTitle: {
    ...typography.bodyStrong,
    fontSize: 13,
    marginBottom: 2,
  },
  updateDesc: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: 11,
    color: colors.textSubtle,
  },

  // Empty
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 3,
  },
  emptyTitle: {
    ...typography.title,
    fontSize: 14,
  },
  emptySub: {
    ...typography.caption,
    color: colors.textSubtle,
  },
});
