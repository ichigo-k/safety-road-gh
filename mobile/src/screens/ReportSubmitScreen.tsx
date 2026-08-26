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
import Icon from '../components/Icon';

interface ReportSubmitScreenProps {
  initialType?: 'ACCIDENT' | 'HAZARD';
  onSuccess: () => void;
}

export default function ReportSubmitScreen({ initialType = 'ACCIDENT', onSuccess }: ReportSubmitScreenProps) {
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
        Alert.alert('Permission Denied', 'GPS location permission is recommended to accurately pinpoint incidents.');
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
        const name = [place.name, place.street, place.city, place.region].filter(Boolean).join(', ');
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
      Alert.alert('Permission required', 'Camera roll permission is needed to attach evidence.');
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
      Alert.alert('Permission required', 'Camera permission is needed to snap live photos.');
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
    if (!title || !description || !locationName) {
      Alert.alert('Required Fields', 'Please provide a title, description, and location name.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        type,
        hazardCategory: type === 'HAZARD' ? hazardCategory : undefined,
        title,
        description,
        injuredCount: parseInt(injuredCount) || 0,
        vehicleCount: parseInt(vehicleCount) || 0,
        latitude,
        longitude,
        locationName,
        photoUrl: photoUri || 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800',
      };

      await apiFetch('/reports', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      Alert.alert('Report Submitted!', 'Your report has been received by MTTD Officers for verification.');
      setTitle('');
      setDescription('');
      setPhotoUri(null);
      onSuccess();
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Failed to submit report. Are you signed in?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Report Incident or Hazard</Text>
        <Text style={styles.headerSubtitle}>Submit evidence to emergency services & fellow road users</Text>

        {/* Type Toggle */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'ACCIDENT' && styles.activeAccidentBtn]}
            onPress={() => setType('ACCIDENT')}
          >
            <View style={styles.typeRow}>
              <Icon name="accident" size={16} color={type === 'ACCIDENT' ? '#ffffff' : '#94a3b8'} />
              <Text style={[styles.typeBtnText, type === 'ACCIDENT' && styles.activeTypeBtnText]}>Accident</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'HAZARD' && styles.activeHazardBtn]}
            onPress={() => setType('HAZARD')}
          >
            <View style={styles.typeRow}>
              <Icon name="hazard" size={16} color={type === 'HAZARD' ? '#ffffff' : '#94a3b8'} />
              <Text style={[styles.typeBtnText, type === 'HAZARD' && styles.activeTypeBtnText]}>Road Hazard</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Hazard Category picker */}
        {type === 'HAZARD' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hazard Category</Text>
            <View style={styles.chipGrid}>
              {[
                { id: 'POTHOLE', label: 'Pothole' },
                { id: 'FLOODING', label: 'Flooding' },
                { id: 'BROKEN_TRAFFIC_LIGHT', label: 'Traffic Light' },
                { id: 'FALLEN_TREE', label: 'Fallen Tree' },
                { id: 'ANIMALS_ON_ROAD', label: 'Animals' },
                { id: 'OTHER', label: 'Other Hazard' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.chip, hazardCategory === item.id && styles.chipActive]}
                  onPress={() => setHazardCategory(item.id)}
                >
                  <Text style={[styles.chipText, hazardCategory === item.id && styles.chipActiveText]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Incident Title</Text>
          <TextInput
            style={styles.input}
            placeholder={type === 'ACCIDENT' ? 'e.g. Collision near Tema Motorway flyover' : 'e.g. Deep pothole on N1 Expressway'}
            placeholderTextColor="#64748b"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Detailed Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe what happened, road condition, lane blockage..."
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {type === 'ACCIDENT' && (
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Injured Count</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={injuredCount}
                onChangeText={setInjuredCount}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Vehicles Involved</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={vehicleCount}
                onChangeText={setVehicleCount}
              />
            </View>
          </View>
        )}

        {/* GPS Location Box */}
        <View style={styles.inputGroup}>
          <View style={styles.locHeader}>
            <Text style={styles.label}>GPS Location</Text>
            <TouchableOpacity onPress={fetchCurrentLocation} disabled={locating}>
              <Text style={styles.refreshLoc}>{locating ? 'Locating...' : 'Refresh GPS'}</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={locationName}
            onChangeText={setLocationName}
            placeholder="Location address or landmark..."
            placeholderTextColor="#64748b"
          />
          <Text style={styles.gpsCoords}>
            Lat: {latitude.toFixed(4)} | Lng: {longitude.toFixed(4)}
          </Text>
        </View>

        {/* Photo Evidence Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Photographic Evidence</Text>
          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
              <Icon name="camera" size={16} color="#ffffff" />
              <Text style={styles.photoBtnText}>Snap Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
              <Icon name="gallery" size={16} color="#ffffff" />
              <Text style={styles.photoBtnText}>Choose Gallery</Text>
            </TouchableOpacity>
          </View>

          {photoUri && (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <TouchableOpacity style={styles.removePhoto} onPress={() => setPhotoUri(null)}>
                <Text style={styles.removePhotoText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#0f172a" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Official Incident Report</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeAccidentBtn: {
    backgroundColor: '#ef4444',
  },
  activeHazardBtn: {
    backgroundColor: '#f59e0b',
  },
  typeBtnText: {
    color: '#94a3b8',
    fontWeight: '800',
    fontSize: 14,
  },
  activeTypeBtnText: {
    color: '#ffffff',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbd5e1',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  chipText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },
  chipActiveText: {
    color: '#0f172a',
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  locHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refreshLoc: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '800',
  },
  gpsCoords: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 10,
  },
  photoBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  photoBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  photoPreviewContainer: {
    marginTop: 10,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  removePhoto: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  removePhotoText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  submitBtn: {
    backgroundColor: '#f59e0b',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 15,
  },
});
