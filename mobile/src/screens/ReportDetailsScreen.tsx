import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  Share,
  Linking,
  Modal,
} from 'react-native';
import Icon from '../components/Icon';
import { colors, typography, spacing, radius, shadows } from '../theme';

interface ReportDetailsScreenProps {
  report: any;
  onBack: () => void;
  onOpenMap?: () => void;
}

export default function ReportDetailsScreen({
  report,
  onBack,
  onOpenMap,
}: ReportDetailsScreenProps) {
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Icon name="back" size={18} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Incident Dossier</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No report selected for review.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isAccident = report.type === 'ACCIDENT';
  const isResolved = report.status === 'RESOLVED';
  const isVerified = report.status === 'VERIFIED';
  const isPending = !isResolved && !isVerified;

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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Safety Roads GH Incident Dossier: [${report.type}] ${report.title} at ${report.locationName}. Status: ${report.status}.`,
      });
    } catch (e) {}
  };

  const handleCallMTTD = () => {
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
            <Text style={styles.headerTitle}>Incident Dossier</Text>
            <Text style={styles.headerSubtitle}>Official Ghana MTTD Review Record</Text>
          </View>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
            <Icon name="logout" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* ── Live Review Status Banner ───────────────────────────────────────── */}
        <View style={styles.statusHeroCard}>
          <View style={styles.statusHeroHeader}>
            <View
              style={[
                styles.categoryTag,
                { backgroundColor: isAccident ? colors.dangerLight : colors.warningLight },
              ]}
            >
              <Icon
                name={isAccident ? 'accident' : 'hazard'}
                size={12}
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
              <Text style={[styles.statusTagText, { color: statusColor }]}>{report.status}</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{report.title || 'Road Incident'}</Text>

          <View style={styles.landmarkRow}>
            <Icon name="location" size={13} color={colors.textSubtle} />
            <Text style={styles.landmarkText}>{report.locationName || 'Accra, Ghana'}</Text>
          </View>

          <Text style={styles.timestampText}>
            Logged {new Date(report.createdAt).toLocaleString()}
          </Text>
        </View>

        {/* ── Visual Evidence Review Card ─────────────────────────────────────── */}
        {report.photoUrl && (
          <View style={styles.card}>
            <View style={styles.cardSectionHeader}>
              <Text style={styles.cardSectionLabel}>PHOTOGRAPHIC EVIDENCE</Text>
              <TouchableOpacity onPress={() => setPhotoModalVisible(true)}>
                <Text style={styles.zoomLink}>Fullscreen ⤢</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setPhotoModalVisible(true)}
              style={styles.photoContainer}
            >
              <Image source={{ uri: report.photoUrl }} style={styles.evidenceImage} resizeMode="cover" />
              <View style={styles.photoOverlayBadge}>
                <Icon name="camera" size={12} color="#ffffff" />
                <Text style={styles.photoOverlayText}>Tap to inspect</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Modal for Fullscreen Photo Zoom ─────────────────────────────────── */}
        {report.photoUrl && (
          <Modal visible={photoModalVisible} transparent animationType="fade">
            <View style={styles.modalBg}>
              <SafeAreaView style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setPhotoModalVisible(false)}
                >
                  <Text style={styles.closeModalText}>✕ Close</Text>
                </TouchableOpacity>
                <Image
                  source={{ uri: report.photoUrl }}
                  style={styles.fullscreenImage}
                  resizeMode="contain"
                />
              </SafeAreaView>
            </View>
          </Modal>
        )}

        {/* ── Description Breakdown ───────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>INCIDENT DESCRIPTION</Text>
          <Text style={styles.descriptionText}>
            {report.description || 'No extended description provided.'}
          </Text>

          {/* Telemetry metadata chips */}
          <View style={styles.telemetryGrid}>
            <View style={styles.telemetryTile}>
              <Text style={styles.telemetryNum}>{report.injuredCount || 0}</Text>
              <Text style={styles.telemetryLabel}>Casualties</Text>
            </View>
            <View style={styles.telemetryTile}>
              <Text style={styles.telemetryNum}>{report.vehicleCount || 0}</Text>
              <Text style={styles.telemetryLabel}>Vehicles</Text>
            </View>
            <View style={styles.telemetryTile}>
              <Text style={styles.telemetryNum}>
                {report.latitude ? `${report.latitude.toFixed(3)}°` : 'GPS'}
              </Text>
              <Text style={styles.telemetryLabel}>Latitude</Text>
            </View>
            <View style={styles.telemetryTile}>
              <Text style={styles.telemetryNum}>
                {report.longitude ? `${report.longitude.toFixed(3)}°` : 'GPS'}
              </Text>
              <Text style={styles.telemetryLabel}>Longitude</Text>
            </View>
          </View>
        </View>

        {/* ── MTTD Verification Progress Stepper ───────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>VERIFICATION & CLEARANCE LIFECYCLE</Text>

          <View style={styles.stepperContainer}>
            {/* Step 1 */}
            <View style={styles.stepRow}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Icon name="check" size={11} color="#ffffff" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>1. Transmitted & Logged</Text>
                <Text style={styles.stepDesc}>
                  Captured by citizen and uploaded to Ghana safety network.
                </Text>
              </View>
            </View>

            <View style={styles.stepLine} />

            {/* Step 2 */}
            <View style={styles.stepRow}>
              <View style={[styles.stepCircle, (isVerified || isResolved) && styles.stepCircleActive]}>
                <Icon
                  name={isVerified || isResolved ? 'check' : 'radio'}
                  size={11}
                  color={isVerified || isResolved ? '#ffffff' : colors.textSubtle}
                />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>2. MTTD Radar Ingestion</Text>
                <Text style={styles.stepDesc}>
                  Queued for traffic command center telemetry mapping.
                </Text>
              </View>
            </View>

            <View style={styles.stepLine} />

            {/* Step 3 */}
            <View style={styles.stepRow}>
              <View style={[styles.stepCircle, isResolved && styles.stepCircleActive]}>
                <Icon
                  name={isResolved ? 'check' : 'police'}
                  size={11}
                  color={isResolved ? '#ffffff' : colors.textSubtle}
                />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>3. On-Scene Patrol Verification</Text>
                <Text style={styles.stepDesc}>
                  Patrol officers dispatched to secure sector and direct traffic.
                </Text>
              </View>
            </View>

            <View style={styles.stepLine} />

            {/* Step 4 */}
            <View style={styles.stepRow}>
              <View style={[styles.stepCircle, isResolved && styles.stepCircleResolved]}>
                <Icon
                  name="check"
                  size={11}
                  color={isResolved ? '#ffffff' : colors.textSubtle}
                />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>4. Hazard Cleared / Case Closed</Text>
                <Text style={styles.stepDesc}>
                  Obstruction cleared and highway sector restored to normal.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Officer Review Notes Timeline ───────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>OFFICER REVIEW LOGS</Text>
          {report.history && report.history.length > 0 ? (
            report.history.map((hist: any, idx: number) => (
              <View key={hist.id || idx} style={styles.historyRow}>
                <View style={styles.historyDot} />
                <View style={styles.historyContent}>
                  <Text style={styles.historyStatus}>{hist.status}</Text>
                  <Text style={styles.historyNotes}>{hist.notes || 'Status updated by MTTD desk.'}</Text>
                  <Text style={styles.historyDate}>{new Date(hist.createdAt).toLocaleString()}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.historyRow}>
              <View style={[styles.historyDot, { backgroundColor: colors.primary }]} />
              <View style={styles.historyContent}>
                <Text style={styles.historyStatus}>Initial Submission Verified</Text>
                <Text style={styles.historyNotes}>Telemetry logged and transmitted successfully.</Text>
                <Text style={styles.historyDate}>{new Date(report.createdAt).toLocaleString()}</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Action Buttons ──────────────────────────────────────────────────── */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.callMTTDBtn}
            onPress={handleCallMTTD}
            activeOpacity={0.85}
          >
            <Icon name="phone" size={16} color="#ffffff" />
            <Text style={styles.callMTTDBtnText}>Contact MTTD Desk (18555)</Text>
          </TouchableOpacity>

          {onOpenMap && (
            <TouchableOpacity
              style={styles.viewOnMapBtn}
              onPress={onOpenMap}
              activeOpacity={0.85}
            >
              <Icon name="map" size={16} color={colors.primary} />
              <Text style={styles.viewOnMapBtnText}>View on Live Map</Text>
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

  // Hero Status Card
  statusHeroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  statusHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
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
  heroTitle: {
    ...typography.title,
    fontSize: 16,
    marginBottom: 4,
  },
  landmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  landmarkText: {
    fontSize: 13,
    color: colors.textSubtle,
    fontWeight: '500',
  },
  timestampText: {
    fontSize: 11,
    color: colors.textDisabled,
    marginTop: 2,
  },

  // Card general
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSubtle,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  zoomLink: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  photoContainer: {
    position: 'relative',
    borderRadius: radius.md,
    overflow: 'hidden',
    height: 180,
    width: '100%',
  },
  evidenceImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlayBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  photoOverlayText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },

  // Description & Telemetry
  descriptionText: {
    ...typography.body,
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  telemetryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  telemetryTile: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  telemetryNum: {
    ...typography.bodyStrong,
    fontSize: 14,
    color: colors.primaryDark,
  },
  telemetryLabel: {
    fontSize: 10,
    color: colors.textSubtle,
    fontWeight: '600',
    marginTop: 1,
  },

  // Stepper
  stepperContainer: {
    paddingLeft: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepCircleResolved: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.divider,
    marginLeft: 10,
    marginVertical: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  stepDesc: {
    fontSize: 11,
    color: colors.textSubtle,
    marginTop: 1,
    lineHeight: 15,
  },

  // History Log
  historyRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.sm,
  },
  historyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  historyContent: {
    flex: 1,
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  historyNotes: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  historyDate: {
    fontSize: 10,
    color: colors.textDisabled,
    marginTop: 2,
  },

  // Actions
  actionsContainer: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  callMTTDBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: radius.md,
    ...shadows.subtle,
  },
  callMTTDBtnText: {
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

  // Modal
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  closeModalBtn: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 20,
    padding: 8,
  },
  closeModalText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  fullscreenImage: {
    flex: 1,
    width: '100%',
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
