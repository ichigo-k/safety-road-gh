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

interface TermsConditionsScreenProps {
  onBack: () => void;
}

export default function TermsConditionsScreen({ onBack }: TermsConditionsScreenProps) {
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
            <Text style={styles.headerTitle}>Terms & Conditions</Text>
            <Text style={styles.headerSubtitle}>Citizen Code of Conduct · Republic of Ghana</Text>
          </View>
        </View>

        {/* ── Key Principles Banner ───────────────────────────────────────────── */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerBadge}>
            <Icon name="shield" size={13} color={colors.warning} />
            <Text style={styles.bannerBadgeText}>COMMUNITY INTEGRITY CODE</Text>
          </View>
          <Text style={styles.bannerTitle}>Honest Reporting Saves Lives</Text>
          <Text style={styles.bannerDesc}>
            Safety Roads GH is an official public safety tool. All users are expected to submit truthful,
            accurate incident reports to protect motorists and emergency responders.
          </Text>
        </View>

        {/* ── Terms Clauses ───────────────────────────────────────────────────── */}
        <View style={styles.clauseCard}>
          <View style={styles.clauseHeader}>
            <View style={styles.clauseIconWrap}>
              <Icon name="profile" size={14} color={colors.primary} />
            </View>
            <Text style={styles.clauseTitle}>1. Account Responsibility & Verification</Text>
          </View>
          <Text style={styles.clauseBody}>
            By signing up, you confirm that your provided name, contact number, and identification details are accurate. You are solely responsible for maintaining the confidentiality of your credentials and all incident reports dispatched from your account.
          </Text>
        </View>

        <View style={styles.clauseCard}>
          <View style={styles.clauseHeader}>
            <View style={[styles.clauseIconWrap, { backgroundColor: colors.dangerLight }]}>
              <Icon name="accident" size={14} color={colors.danger} />
            </View>
            <Text style={styles.clauseTitle}>2. Strict Prohibition of Hoax Reports</Text>
          </View>
          <Text style={styles.clauseBody}>
            Submitting fabricated accident claims, false road blockades, or fraudulent hazard reports is <Text style={styles.boldText}>strictly prohibited and punishable under Ghana Law</Text>. Violations result in immediate permanent account suspension and forwarding to the Ghana Police Service Criminal Investigation Department (CID).
          </Text>
        </View>

        <View style={styles.clauseCard}>
          <View style={styles.clauseHeader}>
            <View style={[styles.clauseIconWrap, { backgroundColor: colors.warningLight }]}>
              <Icon name="ambulance" size={14} color={colors.warning} />
            </View>
            <Text style={styles.clauseTitle}>3. Emergency Dispatch & Liability Limitation</Text>
          </View>
          <Text style={styles.clauseBody}>
            While Safety Roads GH facilitates direct transmission to MTTD and emergency services, network latency, weather, or cellular outages may affect dispatch speed. In immediate life-threatening situations, <Text style={styles.boldText}>always dial national hotlines directly (193 / 18555 / 192 / 112)</Text>.
          </Text>
        </View>

        <View style={styles.clauseCard}>
          <View style={styles.clauseHeader}>
            <View style={styles.clauseIconWrap}>
              <Icon name="map" size={14} color={colors.primary} />
            </View>
            <Text style={styles.clauseTitle}>4. Telemetry License & Public Good</Text>
          </View>
          <Text style={styles.clauseBody}>
            By submitting road hazard telemetry and photos, you grant Safety Roads GH a non-exclusive license to aggregate, map, and share anonymized hazard data with Ghana road safety agencies for public safety enhancements.
          </Text>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            Governed under the laws and jurisdiction of the Republic of Ghana.
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

  // Banner
  bannerCard: {
    backgroundColor: colors.warningLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: spacing.xs,
  },
  bannerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.warning,
    letterSpacing: 0.6,
  },
  bannerTitle: {
    ...typography.title,
    fontSize: 15,
    color: colors.text,
    marginBottom: 4,
  },
  bannerDesc: {
    ...typography.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },

  // Clauses
  clauseCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  clauseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  clauseIconWrap: {
    width: 26,
    height: 26,
    borderRadius: radius.xs,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clauseTitle: {
    ...typography.title,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  clauseBody: {
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
  },
});
