import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapViewComponent from '../components/MapViewComponent';
import Icon from '../components/Icon';

interface LocationPickerScreenProps {
  onLocationSelected: (locationName: string, lat: number, lng: number) => void;
  onCancel: () => void;
}

const START = { latitude: 5.5597, longitude: -0.215, latitudeDelta: 0.045, longitudeDelta: 0.045 };

export default function LocationPickerScreen({ onLocationSelected, onCancel }: LocationPickerScreenProps) {
  const [search, setSearch] = useState('Kwame Nkrumah Interchange, Accra');
  const [pin, setPin] = useState({ latitude: START.latitude, longitude: START.longitude });

  const handleConfirm = () => onLocationSelected(search || 'Pinned location, Accra', pin.latitude, pin.longitude);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.back}>
          <Icon name="chevron" size={18} color="#203128" />
        </TouchableOpacity>
        <View>
          <Text style={styles.eyebrow}>REPORT LOCATION</Text>
          <Text style={styles.headerTitle}>Pin incident spot</Text>
        </View>
        <TouchableOpacity onPress={handleConfirm}>
          <Text style={styles.done}>Done</Text>
        </TouchableOpacity>
      </View>
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
          <Text style={styles.pinLabel}>Drag the pin to the exact spot</Text>
        </View>
      </View>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.sheetTitle}>Where did it happen?</Text>
        <Text style={styles.sheetSub}>Use a landmark or move the pin on the map.</Text>
        <View style={styles.inputWrap}>
          <Icon name="search" size={16} color="#8a9a91" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            style={styles.input}
            placeholder="Search road, landmark or town"
            placeholderTextColor="#a2b0a7"
          />
        </View>
        <View style={styles.coords}>
          <View>
            <Text style={styles.coordLabel}>LATITUDE</Text>
            <Text style={styles.coordValue}>{pin.latitude.toFixed(5)}</Text>
          </View>
          <View>
            <Text style={styles.coordLabel}>LONGITUDE</Text>
            <Text style={styles.coordValue}>{pin.longitude.toFixed(5)}</Text>
          </View>
          <View style={styles.verified}>
            <Icon name="shield" size={12} color="#0e7a3f" />
            <Text style={styles.verifiedText}>GPS ready</Text>
          </View>
        </View>
        <TouchableOpacity activeOpacity={0.82} style={styles.confirm} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Use this location</Text>
          <Icon name="chevron" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: '#ffffff',
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '180deg' }],
  },
  eyebrow: { color: '#0f6cbd', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  headerTitle: { color: '#172b4d', fontSize: 18, fontWeight: '900' },
  done: { color: '#0f6cbd', fontSize: 14, fontWeight: '900' },
  mapWrap: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  centerPin: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  pinHalo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 108, 189, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0f6cbd' },
  pinLabel: {
    backgroundColor: '#172b4d',
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 6,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', marginBottom: 12 },
  sheetTitle: { color: '#172b4d', fontSize: 17, fontWeight: '900' },
  sheetSub: { color: '#667085', fontSize: 12, marginTop: 2, marginBottom: 14 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 14,
  },
  input: { flex: 1, color: '#172b4d', fontSize: 14 },
  coords: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  coordLabel: { color: '#94A3B8', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  coordValue: { color: '#172b4d', fontSize: 13, fontWeight: '800', marginTop: 2 },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: { color: '#0f6cbd', fontSize: 10, fontWeight: '800' },
  confirm: {
    backgroundColor: '#0f6cbd',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  confirmText: { color: '#ffffff', fontSize: 14, fontWeight: '900' },
});
