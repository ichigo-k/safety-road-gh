import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Icon from '../components/Icon';
import { colors, typography, spacing, radius, shadows } from '../theme';

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

export default function PrivacyPolicyScreen({ onBack }: PrivacyPolicyScreenProps) {
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
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <Text style={styles.headerSubtitle}>Ghana Data Protection Act (Act 843) Compliant</Text>
          </View>
        </View>

        {/* ── Summary Highlights ──────────────────────────────────────────────── */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryBadge}>
            <Icon name="shield" size={13} color={colors.primary} />
            <Text style={styles.summaryBadgeText}>PRIVACY COMMITMENT</Text>
          </View>
          <Text style={styles.summaryTitle}>Your Data Protects Ghana Roads</Text>
          <Text style={styles.summaryDesc}>
            We collect only the minimum telemetry required to verify incidents, deploy emergency units,
            and map road hazards. Your private data is never sold or used for commercial ads.
          </Text>
        </View>

        {/* ── Sectioned Policy Clauses ────────────────────────────────────────── */}
        <View style={styles.policyCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Icon name="profile" size={14} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          </View>
          <Text style={styles.policyBody}>
            • <Text style={styles.boldText}>Account Credentials:</Text> Your full name, email address, and verified phone number used to validate citizen credibility.{'\n\n'}
            • <Text style={styles.boldText}>Incident Telemetry:</Text> GPS latitude and longitude coordinates, photographic evidence, and casualty/vehicle estimates you submit.{'\n\n'}
            • <Text style={styles.boldText}>Device Telemetry:</Text> Device model, operating system version, and network latency used solely for application diagnostics.
          </Text>
        </View>

        <View style={styles.policyCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Icon name="location" size={14} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>2. GPS & Location Permissions</Text>
          </View>
          <Text style={styles.policyBody}>
            Location telemetry is accessed <Text style={styles.boldText}>strictly when you trigger incident reporting or use the Live Radar Map</Text>. We do not perform background tracking of your routine travel when the application is closed.
          </Text>
        </View>

        <View style={styles.policyCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Icon name="police" size={14} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>3. Information Sharing & Emergency Dispatch</Text>
          </View>
          <Text style={styles.policyBody}>
            Incident reports and photo evidence are transmitted directly to the <Text style={styles.boldText}>Ghana Police Service (MTTD)</Text>, National Ambulance Service, and Ghana National Fire Service to facilitate rapid triage and road clearance.
          </Text>
        </View>

        <View style={styles.policyCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Icon name="check" size={14} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>4. Data Security & Citizen Rights</Text>
          </View>
          <Text style={styles.policyBody}>
            All transmissions are secured with 256-bit TLS encryption. In compliance with the Ghana Data Protection Commission (DPC), you maintain the right to inspect, update, or request the deletion of your account and filed incident records at any time.
          </Text>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            For privacy inquiries or Data Protection Officer requests, contact support@safetyroad.gov.gh
          </Text>
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

  // Summary Card
  summaryCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primaryContainer,
    marginBottom: spacing.lg,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: spacing.xs,
  },
  summaryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 0.6,
  },
  summaryTitle: {
    ...typography.title,
    fontSize: 15,
    color: colors.primaryDark,
    marginBottom: 4,
  },
  summaryDesc: {
    ...typography.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },

  // Policy Cards
  policyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  sectionIconWrap: {
    width: 26,
    height: 26,
    borderRadius: radius.xs,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 14,
    color: colors.text,
  },
  policyBody: {
    ...typography.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '700',
    color: colors.text,
  },

  // Footer
  footerNote: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  footerNoteText: {
    fontSize: 11,
    color: colors.textDisabled,
    textAlign: 'center',
    lineHeight: 16,
  },
});
