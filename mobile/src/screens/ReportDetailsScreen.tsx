/* ─── Report details ──────────────────────────────────────────────────────────
 *
 * Rewritten. The previous version presented a citizen's own report as an
 * "Incident Dossier — Official Ghana MTTD Review Record", with sections headed
 * PHOTOGRAPHIC EVIDENCE, TELEMETRY and VERIFICATION & CLEARANCE LIFECYCLE.
 *
 * The bigger problem was not the tone. That lifecycle described four stages —
 * "MTTD Radar Ingestion", "Queued for traffic command center telemetry
 * mapping", "Patrol officers dispatched to secure sector and direct traffic" —
 * that correspond to nothing the system does. Reports carry a status of
 * PENDING, VERIFIED, DISPATCHED, RESOLVED or REJECTED and nothing else. When a
 * report had no history the screen invented one, printing "Telemetry logged and
 * transmitted successfully". Someone who reported a crash was being shown
 * official activity that had not happened.
 *
 * This version shows what is actually known: the photo they took, what they
 * wrote, where and when, and the real status — with the progress track derived
 * from that status rather than narrated around it.
 * -------------------------------------------------------------------------- */

import React, { useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from '../components/Icon';
import { colors, radius, shadows, spacing, typography } from '../theme';

interface ReportDetailsScreenProps {
  report: any;
  onBack: () => void;
  onOpenMap?: () => void;
}

/* The real statuses, in the order a report moves through them. REJECTED is
   deliberately outside the track: it is an end state, not a stage. */
const TRACK = [
  { key: 'PENDING', label: 'Submitted', caption: 'Received and waiting on review.' },
  { key: 'VERIFIED', label: 'Verified', caption: 'Confirmed by a road safety officer.' },
  { key: 'DISPATCHED', label: 'Dispatched', caption: 'A response team is on the way.' },
  { key: 'RESOLVED', label: 'Resolved', caption: 'Cleared and closed.' },
];

function statusTone(status: string) {
  switch (status) {
    case 'RESOLVED':
      return { fg: colors.success, bg: colors.successLight };
    case 'VERIFIED':
    case 'DISPATCHED':
      return { fg: colors.primary, bg: colors.primaryLight };
    case 'REJECTED':
      return { fg: colors.danger, bg: colors.dangerLight };
    default:
      return { fg: colors.amber, bg: colors.amberLight };
  }
}

function formatWhen(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ReportDetailsScreen({
  report,
  onBack,
  onOpenMap,
}: ReportDetailsScreenProps) {
  const [photoOpen, setPhotoOpen] = useState(false);

  if (!report) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <TouchableOpacity style={s.iconBtn} onPress={onBack}>
            <Icon name="back" size={18} color={colors.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Report</Text>
          <View style={s.iconBtn} />
        </View>
        <View style={s.empty}>
          <Text style={s.emptyText}>No report selected.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isAccident = report.type === 'ACCIDENT';
  const status = report.status || 'PENDING';
  const tone = statusTone(status);
  const rejected = status === 'REJECTED';
  const currentIndex = TRACK.findIndex((t) => t.key === status);

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `${report.title || 'Road incident'} — ${report.locationName || 'Ghana'}. ` +
          `Status: ${status}. Reported via Safety Road GH.`,
      });
    } catch {
      /* the user dismissed the sheet */
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={s.header}>
        <TouchableOpacity style={s.iconBtn} onPress={onBack} activeOpacity={0.7}>
          <Icon name="back" size={18} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>
          {isAccident ? 'Accident report' : 'Hazard report'}
        </Text>
        <TouchableOpacity style={s.iconBtn} onPress={handleShare} activeOpacity={0.7}>
          <Icon name="share" size={16} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* The photo is the most informative thing here, so it leads rather
            than sitting below three cards of chrome. */}
        {report.photoUrl ? (
          <TouchableOpacity activeOpacity={0.95} onPress={() => setPhotoOpen(true)}>
            <Image source={{ uri: report.photoUrl }} style={s.photo} resizeMode="cover" />
          </TouchableOpacity>
        ) : null}

        <View style={s.body}>
          <View style={s.pillRow}>
            <View
              style={[
                s.pill,
                { backgroundColor: isAccident ? colors.dangerLight : colors.warningLight },
              ]}
            >
              <Text
                style={[s.pillText, { color: isAccident ? colors.danger : colors.warning }]}
              >
                {isAccident ? 'Accident' : 'Hazard'}
              </Text>
            </View>
            <View style={[s.pill, { backgroundColor: tone.bg }]}>
              <View style={[s.dot, { backgroundColor: tone.fg }]} />
              <Text style={[s.pillText, { color: tone.fg }]}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </Text>
            </View>
          </View>

          <Text style={s.title}>{report.title || 'Road incident'}</Text>

          <View style={s.metaRow}>
            <Icon name="location" size={13} color={colors.textSubtle} />
            <Text style={s.metaText} numberOfLines={2}>
              {report.locationName || 'Location not recorded'}
            </Text>
          </View>
          {formatWhen(report.createdAt) ? (
            <Text style={s.when}>Reported {formatWhen(report.createdAt)}</Text>
          ) : null}

          {report.description ? (
            <Text style={s.description}>{report.description}</Text>
          ) : null}

          {/* Counts only where they mean something. A pothole has no casualty
              count, and printing "0 injured" on one reads as a finding. */}
          {isAccident ? (
            <View style={s.facts}>
              <View style={s.fact}>
                <Text style={s.factNum}>{report.injuredCount ?? 0}</Text>
                <Text style={s.factLabel}>
                  {(report.injuredCount ?? 0) === 1 ? 'person injured' : 'people injured'}
                </Text>
              </View>
              <View style={s.factDivider} />
              <View style={s.fact}>
                <Text style={s.factNum}>{report.vehicleCount ?? 0}</Text>
                <Text style={s.factLabel}>
                  {(report.vehicleCount ?? 0) === 1 ? 'vehicle' : 'vehicles'}
                </Text>
              </View>
            </View>
          ) : null}

          {/* ── Progress ────────────────────────────────────────────────── */}
          <Text style={s.sectionLabel}>Progress</Text>

          {rejected ? (
            <View style={[s.noticeCard, { backgroundColor: colors.dangerLight }]}>
              <Text style={[s.noticeTitle, { color: colors.danger }]}>
                This report was not accepted
              </Text>
              <Text style={s.noticeBody}>
                A road safety officer reviewed it and closed it without action.
              </Text>
            </View>
          ) : (
            <View style={s.track}>
              {TRACK.map((step, i) => {
                const done = currentIndex >= 0 && i <= currentIndex;
                const isLast = i === TRACK.length - 1;
                return (
                  <View key={step.key} style={s.step}>
                    <View style={s.stepRail}>
                      <View style={[s.stepDot, done && s.stepDotDone]}>
                        {done ? <Icon name="check" size={10} color="#FFFFFF" /> : null}
                      </View>
                      {!isLast ? (
                        <View style={[s.stepLine, done && s.stepLineDone]} />
                      ) : null}
                    </View>
                    <View style={s.stepCopy}>
                      <Text style={[s.stepLabel, !done && s.stepLabelPending]}>
                        {step.label}
                      </Text>
                      <Text style={s.stepCaption}>{step.caption}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Officer notes, only when they exist. The old screen invented an
              entry when there were none. */}
          {Array.isArray(report.history) && report.history.length > 0 ? (
            <>
              <Text style={s.sectionLabel}>Updates</Text>
              {report.history.map((h: any, i: number) => (
                <View key={h.id ?? i} style={s.update}>
                  <Text style={s.updateStatus}>{h.status}</Text>
                  {h.notes ? <Text style={s.updateNotes}>{h.notes}</Text> : null}
                  <Text style={s.updateWhen}>{formatWhen(h.createdAt)}</Text>
                </View>
              ))}
            </>
          ) : null}

          {/* ── Actions ─────────────────────────────────────────────────── */}
          {onOpenMap ? (
            <TouchableOpacity style={s.secondaryBtn} onPress={onOpenMap} activeOpacity={0.85}>
              <Icon name="map" size={16} color={colors.primary} />
              <Text style={s.secondaryBtnText}>See it on the map</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={s.dangerBtn}
            onPress={() => Linking.openURL('tel:191')}
            activeOpacity={0.85}
          >
            <Icon name="phone" size={16} color="#FFFFFF" />
            <Text style={s.dangerBtnText}>Call police — 191</Text>
          </TouchableOpacity>
          <Text style={s.callHint}>
            If someone is hurt right now, call instead of waiting for this report.
          </Text>
        </View>
      </ScrollView>

      {report.photoUrl ? (
        <Modal visible={photoOpen} transparent animationType="fade" onRequestClose={() => setPhotoOpen(false)}>
          <View style={s.lightbox}>
            <SafeAreaView style={s.lightboxInner}>
              <TouchableOpacity style={s.lightboxClose} onPress={() => setPhotoOpen(false)}>
                <Text style={s.lightboxCloseText}>Close</Text>
              </TouchableOpacity>
              <Image
                source={{ uri: report.photoUrl }}
                style={s.lightboxImage}
                resizeMode="contain"
              />
            </SafeAreaView>
          </View>
        </Modal>
      ) : null}
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
  headerTitle: { ...typography.bodyStrong, color: colors.text, flex: 1, textAlign: 'center' },

  scroll: { paddingBottom: spacing.xxxl },

  photo: { width: '100%', height: 260, backgroundColor: colors.surfaceSunken },

  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },

  pillRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  pillText: { ...typography.tag },
  dot: { width: 6, height: 6, borderRadius: 3 },

  title: { ...typography.headline, color: colors.text, marginBottom: spacing.sm },

  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  metaText: { ...typography.callout, color: colors.textMuted, flex: 1 },
  when: { ...typography.caption, color: colors.textSubtle, marginTop: 4 },

  description: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
    marginTop: spacing.lg,
  },

  facts: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    marginTop: spacing.xl,
    ...shadows.card,
  },
  fact: { flex: 1, alignItems: 'center' },
  factNum: { ...typography.display, color: colors.text },
  factLabel: { ...typography.caption, color: colors.textSubtle, marginTop: 2 },
  factDivider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.borderSubtle },

  sectionLabel: {
    ...typography.label,
    color: colors.textSubtle,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },

  track: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  step: { flexDirection: 'row', gap: spacing.md },
  stepRail: { alignItems: 'center', width: 20 },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSunken,
  },
  stepDotDone: { backgroundColor: colors.primary },
  stepLine: { width: 2, flex: 1, minHeight: 24, backgroundColor: colors.borderSubtle },
  stepLineDone: { backgroundColor: colors.primary },
  stepCopy: { flex: 1, paddingBottom: spacing.lg },
  stepLabel: { ...typography.bodyStrong, color: colors.text },
  stepLabelPending: { color: colors.textDisabled },
  stepCaption: { ...typography.caption, color: colors.textSubtle, marginTop: 2 },

  noticeCard: { borderRadius: radius.md, padding: spacing.lg },
  noticeTitle: { ...typography.bodyStrong },
  noticeBody: { ...typography.callout, color: colors.textMuted, marginTop: 4 },

  update: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  updateStatus: { ...typography.bodyStrong, color: colors.text },
  updateNotes: { ...typography.callout, color: colors.textMuted, marginTop: 4 },
  updateWhen: { ...typography.micro, color: colors.textSubtle, marginTop: 6 },

  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    marginTop: spacing.xxl,
  },
  secondaryBtnText: { ...typography.bodyStrong, color: colors.primary },

  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.danger,
    marginTop: spacing.md,
  },
  dangerBtnText: { ...typography.bodyStrong, color: '#FFFFFF' },
  callHint: {
    ...typography.caption,
    color: colors.textSubtle,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...typography.callout, color: colors.textSubtle },

  lightbox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.94)' },
  lightboxInner: { flex: 1 },
  lightboxClose: { alignSelf: 'flex-end', padding: spacing.lg },
  lightboxCloseText: { ...typography.bodyStrong, color: '#FFFFFF' },
  lightboxImage: { flex: 1, width: '100%' },
});
