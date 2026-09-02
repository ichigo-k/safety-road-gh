import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Icon from '../components/Icon';
import { colors, typography, spacing, radius, shadows } from '../theme';

interface AboutScreenProps {
  onBack: () => void;
}

export default function AboutScreen({ onBack }: AboutScreenProps) {
  const openUrl = (url: string) => Linking.openURL(url).catch(() => {});

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
            <Text style={styles.headerTitle}>About Platform</Text>
            <Text style={styles.headerSubtitle}>Safety Roads GH Initiative</Text>
          </View>
        </View>

        {/* ── Brand Hero Badge ────────────────────────────────────────────────── */}
        <View style={styles.brandHeroCard}>
          <View style={styles.flagStrip}>
            <View style={[styles.flagColor, { backgroundColor: '#DC2626' }]} />
            <View style={[styles.flagColor, { backgroundColor: '#F59E0B' }]} />
            <View style={[styles.flagColor, { backgroundColor: '#0B7A46' }]} />
          </View>

          <View style={styles.shieldWrap}>
            <Icon name="shield" size={32} color="#ffffff" />
          </View>

          <Text style={styles.brandTitle}>Safety Roads GH</Text>
          <Text style={styles.brandVersion}>Version 1.0.0 (Release Build 2026)</Text>
          <Text style={styles.brandMotto}>Citizen Incident Telemetry & Road Safety Network</Text>
        </View>

        {/* ── Mission & Vision ────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderLabel}>MISSION & OVERVIEW</Text>
          <Text style={styles.cardBody}>
            Safety Roads GH is a real-time incident reporting and hazard telemetry network engineered
            specifically for Ghana's road ecosystem. It empowers everyday motorists and pedestrians to
            report accidents, dangerous potholes, flash floods, and non-functional traffic lights
            with pinpoint GPS coordinates and live evidence.
          </Text>
        </View>

        {/* ── Core Platform Pillars ───────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderLabel}>CORE CAPABILITIES</Text>

          <View style={styles.pillarItem}>
            <View style={[styles.pillarIcon, { backgroundColor: colors.dangerLight }]}>
              <Icon name="accident" size={15} color={colors.danger} />
            </View>
            <View style={styles.pillarText}>
              <Text style={styles.pillarTitle}>1-Tap Incident Telemetry</Text>
              <Text style={styles.pillarSub}>
                Instant accident and hazard reporting with automated GPS reverse-geocoding.
              </Text>
            </View>
          </View>

          <View style={styles.pillarItem}>
            <View style={[styles.pillarIcon, { backgroundColor: colors.primaryLight }]}>
              <Icon name="police" size={15} color={colors.primary} />
            </View>
            <View style={styles.pillarText}>
              <Text style={styles.pillarTitle}>MTTD Command Center Integration</Text>
              <Text style={styles.pillarSub}>
                Direct transmission to Ghana Police Service (MTTD) patrol dispatch desks.
              </Text>
            </View>
          </View>

          <View style={styles.pillarItem}>
            <View style={[styles.pillarIcon, { backgroundColor: colors.warningLight }]}>
              <Icon name="map" size={15} color={colors.warning} />
            </View>
            <View style={styles.pillarText}>
              <Text style={styles.pillarTitle}>Live Hazard Radar</Text>
              <Text style={styles.pillarSub}>
                Real-time mapping of high-risk road sectors, flood spots, and traffic slowdowns.
              </Text>
            </View>
          </View>
        </View>

        {/* ── Technical Specifications & Partners ─────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderLabel}>PLATFORM SPECIFICATIONS</Text>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Ecosystem</Text>
            <Text style={styles.specVal}>React Native & Node.js REST Engine</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>GIS Mapping</Text>
            <Text style={styles.specVal}>OpenStreetMap & Leaflet Vector Radar</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Emergency Direct Lines</Text>
            <Text style={styles.specVal}>193 (Ambulance), 18555 (MTTD), 192 (Fire)</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Data Jurisdiction</Text>
            <Text style={styles.specVal}>Accra, Republic of Ghana</Text>
          </View>
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

  // Brand Hero Card
  brandHeroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.card,
  },
  flagStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    flexDirection: 'row',
  },
  flagColor: {
    flex: 1,
  },
  shieldWrap: {
    width: 58,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
    ...shadows.subtle,
  },
  brandTitle: {
    ...typography.headline,
    fontSize: 20,
    color: colors.text,
  },
  brandVersion: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  brandMotto: {
    ...typography.caption,
    color: colors.textSubtle,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 260,
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
  cardHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSubtle,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  cardBody: {
    ...typography.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },

  // Pillars
  pillarItem: {
    flexDirection: 'row',
    gap: 10,
    marginTop: spacing.sm,
  },
  pillarIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  pillarText: {
    flex: 1,
  },
  pillarTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  pillarSub: {
    fontSize: 11,
    color: colors.textSubtle,
    lineHeight: 16,
    marginTop: 1,
  },

  // Specs
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  specKey: {
    fontSize: 12,
    color: colors.textSubtle,
    fontWeight: '500',
  },
  specVal: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    maxWidth: 200,
    textAlign: 'right',
  },
});
