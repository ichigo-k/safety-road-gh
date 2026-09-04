/* ─── Safety tip ──────────────────────────────────────────────────────────────
 *
 * Rewritten, and not only for looks.
 *
 * The previous version headed every tip "National Road Safety Authority (NRSA)
 * Publication", badged it "<CATEGORY> SAFETY MANUAL" and stamped it "Verified
 * for Ghana Highway Compliance". None of that is true. These tips are free text
 * an administrator types into the safety library form; the NRSA is not involved,
 * nothing is verified against any compliance standard, and attributing safety
 * advice to a real national authority that did not write it misleads the reader
 * about how much weight to give it.
 *
 * It also hardcoded the title "Driver Safety Guide" on every tip, including
 * ones written for pedestrians and passengers.
 *
 * What is left is what is real: who the advice is for, the title, the text, and
 * when it was published.
 * -------------------------------------------------------------------------- */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from '../components/Icon';
import { colors, radius, shadows, spacing, typography } from '../theme';

interface SafetyTipDetailsScreenProps {
  tip: any;
  onBack: () => void;
}

const AUDIENCE: Record<string, string> = {
  DRIVER: 'For drivers',
  MOTORCYCLIST: 'For riders',
  PEDESTRIAN: 'For pedestrians',
  PASSENGER: 'For passengers',
};

function formatWhen(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function SafetyTipDetailsScreen({ tip, onBack }: SafetyTipDetailsScreenProps) {
  const published = formatWhen(tip?.createdAt);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={onBack} activeOpacity={0.7}>
          <Icon name="back" size={18} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Safety guidance</Text>
        <View style={s.iconBtn} />
      </View>

      {!tip ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>No guidance selected.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.audiencePill}>
            <Text style={s.audiencePillText}>
              {AUDIENCE[tip.category] ?? 'For everyone'}
            </Text>
          </View>

          <Text style={s.title}>{tip.title}</Text>
          {published ? <Text style={s.published}>Published {published}</Text> : null}

          {/* Long-form reading: generous measure and line height, no card
              border boxing the text in. */}
          <Text style={s.content}>{tip.content}</Text>

          <View style={s.emergency}>
            <Icon name="phone" size={15} color={colors.danger} />
            <Text style={s.emergencyText}>
              In an emergency call <Text style={s.emergencyNumber}>191</Text> for police or{' '}
              <Text style={s.emergencyNumber}>193</Text> for an ambulance.
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  headerTitle: { ...typography.bodyStrong, color: colors.text },

  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },

  audiencePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  audiencePillText: { ...typography.tag, color: colors.primary },

  title: { ...typography.display, color: colors.text, lineHeight: 34 },
  published: { ...typography.caption, color: colors.textSubtle, marginTop: spacing.sm },

  content: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 26,
    marginTop: spacing.xl,
  },

  emergency: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.xxl,
  },
  emergencyText: { ...typography.callout, color: colors.textMuted, flex: 1, lineHeight: 20 },
  emergencyNumber: { ...typography.bodyStrong, color: colors.danger },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...typography.callout, color: colors.textSubtle },
});
