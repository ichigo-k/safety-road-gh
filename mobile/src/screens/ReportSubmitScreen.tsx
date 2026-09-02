import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { apiFetch } from '../services/api';
import { uploadImageToCloudinary } from '../services/cloudinary';
import Icon from '../components/Icon';
import { colors, typography, spacing, radius, shadows } from '../theme';

interface ReportSubmitScreenProps {
  initialType?: 'ACCIDENT' | 'HAZARD';
  onBack?: () => void;
  onSuccess: () => void;
}

export default function ReportSubmitScreen({
  initialType = 'ACCIDENT',
  onBack,
  onSuccess,
}: ReportSubmitScreenProps) {
  const [type, setType] = useState<'ACCIDENT' | 'HAZARD'>(initialType);
  const [hazardCategory, setHazardCategory] = useState<string>('POTHOLE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [injuredCount, setInjuredCount] = useState('0');
  const [vehicleCount, setVehicleCount] = useState('1');
  const [locationName, setLocationName] = useState('Accra, Ghana');
  const [latitude, setLatitude] = useState<number>(5.556);
  const [longitude, setLongitude] = useState<number>(-0.1969);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  const fetchCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Needed',
          'GPS access helps pinpoint the exact road incident location for faster response.'
        );
        setLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        const name = [place.name, place.street, place.city, place.region]
          .filter(Boolean)
          .join(', ');
        if (name) setLocationName(name);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLocating(false);
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Photo library permission is needed to attach images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Camera permission is needed to snap live incident photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !locationName.trim()) {
      Alert.alert('Incomplete Report', 'Please enter a title, description, and location.');
      return;
    }

    setLoading(true);
    try {
      let uploadedPhotoUrl: string | null = null;
      if (photoUri) {
        uploadedPhotoUrl = await uploadImageToCloudinary(photoUri);
      }

      const payload = {
        type,
        hazardCategory: type === 'HAZARD' ? hazardCategory : undefined,
        title: title.trim(),
        description: description.trim(),
        injuredCount: parseInt(injuredCount, 10) || 0,
        vehicleCount: parseInt(vehicleCount, 10) || 0,
        latitude,
        longitude,
        locationName: locationName.trim(),
        photoUrl: uploadedPhotoUrl ?? null,
      };

      await apiFetch('/reports', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      Alert.alert(
        'Report Submitted',
        'Your incident report has been received by Ghana MTTD Officers for verification.'
      );
      setTitle('');
      setDescription('');
      setPhotoUri(null);
      onSuccess();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  const hazardCategories = [
    { id: 'POTHOLE', label: 'Pothole', icon: 'hazard' },
    { id: 'FLOODING', label: 'Flooding', icon: 'hazard' },
    { id: 'BROKEN_TRAFFIC_LIGHT', label: 'Signal Out', icon: 'hazard' },
    { id: 'FALLEN_TREE', label: 'Fallen Tree', icon: 'hazard' },
    { id: 'BROKEN_VEHICLE', label: 'Stalled Vehicle', icon: 'car' },
    { id: 'ANIMALS_ON_ROAD', label: 'Animals on Road', icon: 'hazard' },
    { id: 'OTHER', label: 'Other Danger', icon: 'info' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <Icon name="back" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>File Road Incident</Text>
            <Text style={styles.headerSubtitle}>Direct transmission to Ghana Police MTTD</Text>
          </View>
        </View>

        {/* ── Segmented Control ─────────────────────────────────────────────── */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.segmentBtn, type === 'ACCIDENT' && styles.segmentBtnActiveAccident]}
            onPress={() => setType('ACCIDENT')}
          >
            <Icon
              name="accident"
              size={18}
              color={type === 'ACCIDENT' ? '#ffffff' : colors.textMuted}
            />
            <Text
              style={[
                styles.segmentBtnText,
                type === 'ACCIDENT' && styles.segmentBtnTextActive,
              ]}
            >
              Accident
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.segmentBtn, type === 'HAZARD' && styles.segmentBtnActiveHazard]}
            onPress={() => setType('HAZARD')}
          >
            <Icon
              name="hazard"
              size={18}
              color={type === 'HAZARD' ? '#ffffff' : colors.textMuted}
            />
            <Text
              style={[
                styles.segmentBtnText,
                type === 'HAZARD' && styles.segmentBtnTextActive,
              ]}
            >
              Road Hazard
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Hazard Categories ─────────────────────────────────────────────── */}
        {type === 'HAZARD' && (
          <View style={styles.sectionBox}>
            <Text style={styles.sectionLabel}>Hazard Category</Text>
            <View style={styles.chipRow}>
              {hazardCategories.map((item) => {
                const isActive = hazardCategory === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.75}
                    style={[styles.hazardChip, isActive && styles.hazardChipActive]}
                    onPress={() => setHazardCategory(item.id)}
                  >
                    <Icon
                      name={item.icon}
                      size={14}
                      color={isActive ? '#ffffff' : colors.textMuted}
                    />
                    <Text style={[styles.hazardChipText, isActive && styles.hazardChipTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Incident Details ──────────────────────────────────────────────── */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionLabel}>Incident Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder={
                type === 'ACCIDENT'
                  ? 'e.g. 2-car collision near Tema Motorway flyover'
                  : 'e.g. Deep pothole on N1 Expressway outer lane'
              }
              placeholderTextColor={colors.textDisabled}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe road condition, lane obstruction, traffic impact..."
              placeholderTextColor={colors.textDisabled}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {type === 'ACCIDENT' && (
            <View style={styles.twoColRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Injured Persons</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={injuredCount}
                  onChangeText={setInjuredCount}
                  placeholderTextColor={colors.textDisabled}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Vehicles Involved</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={vehicleCount}
                  onChangeText={setVehicleCount}
                  placeholderTextColor={colors.textDisabled}
                />
              </View>
            </View>
          )}
        </View>

        {/* ── Location Card ─────────────────────────────────────────────────── */}
        <View style={styles.sectionBox}>
          <View style={styles.locationHeaderRow}>
            <Text style={styles.sectionLabel}>Incident Location</Text>
            <TouchableOpacity
              onPress={fetchCurrentLocation}
              disabled={locating}
              style={styles.gpsDetectBtn}
            >
              <Icon name="location" size={13} color={colors.primary} />
              <Text style={styles.gpsDetectText}>
                {locating ? 'Locating GPS…' : 'Detect GPS'}
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            value={locationName}
            onChangeText={setLocationName}
            placeholder="Address, road name or nearby landmark..."
            placeholderTextColor={colors.textDisabled}
          />
          <Text style={styles.coordsText}>
            GPS Fix: {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° W
          </Text>
        </View>

        {/* ── Photo Evidence ────────────────────────────────────────────────── */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionLabel}>Photo Evidence</Text>

          <View style={styles.photoActionsRow}>
            <TouchableOpacity style={styles.photoActionBtn} onPress={takePhoto} activeOpacity={0.8}>
              <Icon name="camera" size={18} color={colors.primary} />
              <Text style={styles.photoActionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoActionBtn} onPress={pickImage} activeOpacity={0.8}>
              <Icon name="gallery" size={18} color={colors.primary} />
              <Text style={styles.photoActionText}>Gallery</Text>
            </TouchableOpacity>
          </View>

          {photoUri && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: photoUri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => setPhotoUri(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.removeBtnText}>✕ Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Submit CTA ────────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Icon name="shield" size={18} color="#ffffff" />
              <Text style={styles.submitBtnText}>Submit Incident Report</Text>
            </>
          )}
        </TouchableOpacity>

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
    fontSize: 20,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSubtle,
    marginTop: 1,
  },

  // Segmented Control
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: 4,
    marginBottom: spacing.lg,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: radius.md,
  },
  segmentBtnActiveAccident: {
    backgroundColor: colors.danger,
    ...shadows.subtle,
  },
  segmentBtnActiveHazard: {
    backgroundColor: colors.warning,
    ...shadows.subtle,
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  segmentBtnTextActive: {
    color: '#ffffff',
  },

  // Section Box
  sectionBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  sectionLabel: {
    ...typography.title,
    fontSize: 14,
    marginBottom: spacing.md,
  },

  // Hazard Chips
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hazardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  hazardChipActive: {
    backgroundColor: colors.warning,
  },
  hazardChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  hazardChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },

  // Inputs
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 5,
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 84,
    textAlignVertical: 'top',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  // Location
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  gpsDetectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  gpsDetectText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  coordsText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSubtle,
    marginTop: 6,
  },

  // Photos
  photoActionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoActionBtn: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  previewContainer: {
    marginTop: spacing.md,
    position: 'relative',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 170,
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  removeBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },

  // Submit Button
  submitBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: radius.md,
    ...shadows.card,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
