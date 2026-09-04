import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Share,
  Linking,
} from 'react-native';
import Icon from '../components/Icon';
import { colors, typography, spacing, radius, shadows } from '../theme';

interface AlertDetailsScreenProps {
  alert: any;
  onBack: () => void;
  onOpenMap?: () => void;
}

export default function AlertDetailsScreen({
  alert,
  onBack,
  onOpenMap,
}: AlertDetailsScreenProps) {
  if (!alert) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Icon name="back" size={18} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Road Alert</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No advisory broadcast selected.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCritical = alert.severity === 'HIGH' || alert.severity === 'CRITICAL';
  const severityColor = isCritical ? colors.danger : colors.warning;
  const severityBg = isCritical ? colors.dangerLight : colors.warningLight;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Ghana MTTD Road Advisory: [${alert.severity || 'BROADCAST'}] ${alert.title}. ${alert.description} (${alert.locationName || 'Ghana Road Network'}).`,
      });
    } catch (e) {}
  };

  const handleCallPolice = () => {
    Linking.openURL('tel:18555');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Top Bar ────────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Icon name="back" size={18} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Advisory</Text>
            <Text style={styles.headerSubtitle}>Ghana Police MTTD Broadcast Network</Text>
          </View>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
            <Icon name="logout" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* ── Severity & Header Hero Card ─────────────────────────────────────── */}
        <View style={styles.heroCard}>
          <View style={styles.badgeRow}>
            <View style={[styles.severityBadge, { backgroundColor: severityBg }]}>
              <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
              <Text style={[styles.severityText, { color: severityColor }]}>
                {alert.severity || 'BROADCAST'} SEVERITY
              </Text>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>OFFICIAL BULLETIN</Text>
            </View>
          </View>

          <Text style={styles.alertTitle}>
            {alert.title && alert.title.trim() ? alert.title : 'Ghana Road Cautionary Advisory'}
          </Text>

          {alert.locationName ? (
            <View style={styles.locationRow}>
              <Icon name="location" size={13} color={colors.textSubtle} />
              <Text style={styles.locationText}>{alert.locationName}</Text>
            </View>
          ) : null}

          <Text style={styles.timestampText}>
            Dispatched on {new Date(alert.createdAt || Date.now()).toLocaleString()}
          </Text>
        </View>

        {/* ── Broadcast Message Details ───────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>BROADCAST ADVISORY DETAILS</Text>
          <Text style={styles.broadcastText}>
            {alert.description && alert.description.trim()
              ? alert.description
              : 'Caution is advised on this highway corridor. Road safety authorities and traffic officers are monitoring flow.'}
          </Text>
        </View>

        {/* ── Driver Action Recommendations ───────────────────────────────────── */}
        <View style={styles.adviceCard}>
          <View style={styles.adviceHeader}>
            <Icon name="shield" size={15} color={colors.warning} />
            <Text style={styles.adviceTitle}>Recommended Driver Protocol</Text>
          </View>
          <View style={styles.adviceList}>
            <Text style={styles.adviceBullet}>
              • Maintain safe following distance and adjust headlights if visibility is reduced.
            </Text>
            <Text style={styles.adviceBullet}>
              • Avoid sudden braking on wet corridors, bridges, or unpaved shoulders.
            </Text>
            <Text style={styles.adviceBullet}>
              • Follow hand signals and detour instructions from on-scene Ghana Police officers.
            </Text>
          </View>
        </View>

        {/* ── Action Buttons ──────────────────────────────────────────────────── */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.callPoliceBtn}
            onPress={handleCallPolice}
            activeOpacity={0.85}
          >
            <Icon name="phone" size={16} color="#ffffff" />
            <Text style={styles.callPoliceBtnText}>Contact Police MTTD (18555)</Text>
          </TouchableOpacity>

          {onOpenMap && (
            <TouchableOpacity
              style={styles.viewOnMapBtn}
              onPress={onOpenMap}
              activeOpacity={0.85}
            >
              <Icon name="map" size={16} color={colors.primary} />
              <Text style={styles.viewOnMapBtnText}>View on Live Radar Map</Text>
            </TouchableOpacity>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    ...typography.headline,
    fontSize: 18,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSubtle,
    marginTop: 1,
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero Card
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.sm,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
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
  typeBadge: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSubtle,
  },
  alertTitle: {
    ...typography.title,
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: colors.textSubtle,
    fontWeight: '500',
  },
  timestampText: {
    fontSize: 11,
    color: colors.textDisabled,
    marginTop: 2,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSubtle,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  broadcastText: {
    ...typography.body,
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },

  // Advisory Checklist Card
  adviceCard: {
    backgroundColor: colors.warningLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  adviceTitle: {
    ...typography.title,
    fontSize: 13,
    color: colors.warning,
  },
  adviceList: {
    gap: 6,
  },
  adviceBullet: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },

  // Actions
  actionsContainer: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  callPoliceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: radius.md,
    ...shadows.subtle,
  },
  callPoliceBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  viewOnMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingVertical: 13,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  viewOnMapBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyWrap: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSubtle,
  },
});
