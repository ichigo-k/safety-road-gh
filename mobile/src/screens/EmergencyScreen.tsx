import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { apiFetch } from '../services/api';
import Icon from '../components/Icon';
import { colors, typography, spacing, radius, shadows } from '../theme';

interface EmergencyScreenProps {
  onBack?: () => void;
}

export default function EmergencyScreen({ onBack }: EmergencyScreenProps) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    fetchEmergencyServices();
  }, []);

  const fetchEmergencyServices = async () => {
    try {
      const res = await apiFetch('/emergency-services');
      if (res.services) setServices(res.services);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const makeCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const filteredServices = services.filter(
    (s) => selectedCategory === 'ALL' || s.category === selectedCategory
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── App Bar / Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <Icon name="back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Emergency Services</Text>
            <Text style={styles.headerSubtitle}>
              National Ghana hotlines & rapid dispatch direct dial
            </Text>
          </View>
        </View>

        {/* ── Toll-Free Priority Hotlines Hero Card ────────────────────── */}
        <View style={styles.hotlineHeroCard}>
          <Text style={styles.hotlineHeader}>NATIONAL 24/7 TOLL-FREE NUMBERS</Text>
          <View style={styles.hotlineGrid}>
            <TouchableOpacity
              style={styles.hotlineChip}
              onPress={() => makeCall('193')}
              activeOpacity={0.8}
            >
              <View style={[styles.hotlineIconWrap, { backgroundColor: colors.googleRedLight }]}>
                <Icon name="ambulance" size={20} color={colors.googleRed} />
              </View>
              <Text style={styles.hotlineTitle}>Ambulance</Text>
              <Text style={[styles.hotlineNum, { color: colors.googleRed }]}>193 / 112</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hotlineChip}
              onPress={() => makeCall('18555')}
              activeOpacity={0.8}
            >
              <View style={[styles.hotlineIconWrap, { backgroundColor: colors.googleBlueLight }]}>
                <Icon name="police" size={20} color={colors.googleBlue} />
              </View>
              <Text style={styles.hotlineTitle}>Police MTTD</Text>
              <Text style={[styles.hotlineNum, { color: colors.googleBlue }]}>18555 / 191</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hotlineChip}
              onPress={() => makeCall('192')}
              activeOpacity={0.8}
            >
              <View style={[styles.hotlineIconWrap, { backgroundColor: colors.hazardLight }]}>
                <Icon name="fire" size={20} color={colors.hazard} />
              </View>
              <Text style={styles.hotlineTitle}>Fire Service</Text>
              <Text style={[styles.hotlineNum, { color: colors.hazard }]}>192 / 112</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Filter Categories ────────────────────────────────────────── */}
        <View style={styles.filterRow}>
          {['ALL', 'HOSPITAL', 'POLICE', 'FIRE_AMBULANCE'].map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.filterBtn, isActive && styles.filterBtnActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.75}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {cat === 'ALL'
                    ? 'All Units'
                    : cat === 'FIRE_AMBULANCE'
                    ? 'Fire & Amb'
                    : cat.charAt(0) + cat.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Directory List ──────────────────────────────────────────── */}
        {loading ? (
          <View style={styles.centerWrap}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Fetching emergency stations...</Text>
          </View>
        ) : filteredServices.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No emergency contacts found in this category.</Text>
          </View>
        ) : (
          filteredServices.map((service) => (
            <View key={service.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{service.category}</Text>
                </View>
                <Text style={styles.regionText}>{service.region || 'Greater Accra'}</Text>
              </View>

              <Text style={styles.serviceName}>{service.name}</Text>
              <View style={styles.addressRow}>
                <Icon name="location" size={14} color={colors.textTertiary} />
                <Text style={styles.addressText}>{service.address}</Text>
              </View>

              <View style={styles.callRow}>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => makeCall(service.phone)}
                  activeOpacity={0.85}
                >
                  <Icon name="phone" size={15} color="#ffffff" />
                  <Text style={styles.callButtonText}>Call {service.phone}</Text>
                </TouchableOpacity>

                {service.altPhone && (
                  <TouchableOpacity
                    style={styles.altCallButton}
                    onPress={() => makeCall(service.altPhone)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.altCallButtonText}>Alt: {service.altPhone}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
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
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  backBtn: {
    width: 38,
    height: 38,
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
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Hotline Hero Card
  hotlineHeroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  hotlineHeader: {
    ...typography.label,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  hotlineGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  hotlineChip: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  hotlineIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  hotlineTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  hotlineNum: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },

  // Filter Row
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.lg,
  },
  filterBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 8,
    borderRadius: radius.pill,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  regionText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  serviceName: {
    ...typography.title,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.md,
  },
  addressText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  callRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  callButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  callButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  altCallButton: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  altCallButtonText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 11,
  },

  // Loading & Empty
  centerWrap: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
