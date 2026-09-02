import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapViewComponent from '../components/MapViewComponent';
import Icon from '../components/Icon';
import { colors, typography, spacing, radius, shadows } from '../theme';

interface LocationPickerScreenProps {
  onLocationSelected: (locationName: string, lat: number, lng: number) => void;
  onCancel: () => void;
}

const START = {
  latitude: 5.5597,
  longitude: -0.215,
  latitudeDelta: 0.045,
  longitudeDelta: 0.045,
};

export default function LocationPickerScreen({
  onLocationSelected,
  onCancel,
}: LocationPickerScreenProps) {
  const [search, setSearch] = useState('Kwame Nkrumah Interchange, Accra');
  const [pin, setPin] = useState({ latitude: START.latitude, longitude: START.longitude });

  const handleConfirm = () =>
    onLocationSelected(search || 'Pinned Location, Ghana', pin.latitude, pin.longitude);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backBtn}>
          <Icon name="back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Pin Incident Spot</Text>
          <Text style={styles.headerSubtitle}>Drag pin or search landmark location</Text>
        </View>
        <TouchableOpacity style={styles.doneBtn} onPress={handleConfirm}>
          <Text style={styles.doneText}>Confirm</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapWrap}>
        <MapViewComponent
          style={styles.map}
          region={START}
          draggablePin={pin}
          onPinDragEnd={(coords: { latitude: number; longitude: number }) => setPin(coords)}
        />
        <View pointerEvents="none" style={styles.centerPin}>
          <View style={styles.pinHalo}>
            <View style={styles.pinDot} />
          </View>
          <Text style={styles.pinLabel}>Drag map or marker</Text>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.sheetTitle}>Confirm Exact Coordinates</Text>
        <Text style={styles.sheetSub}>Specify landmark or intersection description</Text>

        <View style={styles.inputWrap}>
          <Icon name="search" size={16} color={colors.textTertiary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            style={styles.input}
            placeholder="Search road, junction or landmark"
            placeholderTextColor={colors.textDisabled}
          />
        </View>

        <View style={styles.coordsRow}>
          <View>
            <Text style={styles.coordLabel}>LATITUDE</Text>
            <Text style={styles.coordValue}>{pin.latitude.toFixed(5)}° N</Text>
          </View>
          <View>
            <Text style={styles.coordLabel}>LONGITUDE</Text>
            <Text style={styles.coordValue}>{pin.longitude.toFixed(5)}° W</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Icon name="check" size={12} color={colors.primary} />
            <Text style={styles.verifiedText}>GPS Ready</Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.85} style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Use This Location</Text>
          <Icon name="chevron" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerTitle: {
    ...typography.title,
    fontSize: 15,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  doneText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  mapWrap: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  centerPin: {
    position: 'absolute',
    top: '36%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  pinHalo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 135, 90, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  pinLabel: {
    backgroundColor: colors.textPrimary,
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginTop: 6,
    ...shadows.card,
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.modal,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  sheetSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: 8,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
  },
  coordsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  coordLabel: {
    ...typography.label,
    fontSize: 9,
    color: colors.textTertiary,
  },
  coordValue: {
    ...typography.bodyStrong,
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  verifiedText: {
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '700',
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    ...shadows.card,
  },
  confirmText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
