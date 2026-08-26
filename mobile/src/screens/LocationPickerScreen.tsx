import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, TextInput } from 'react-native';

interface LocationPickerScreenProps {
  onLocationSelected: (locationName: string, lat: number, lng: number) => void;
  onCancel: () => void;
}

export default function LocationPickerScreen({ onLocationSelected, onCancel }: LocationPickerScreenProps) {
  const [search, setSearch] = useState('Kwame Nkrumah Interchange, Accra');
  const [lat, setLat] = useState(5.5597);
  const [lng, setLng] = useState(-0.215);

  const handleConfirm = () => {
    onLocationSelected(search, lat, lng);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pinpoint Incident Location</Text>
          <TouchableOpacity onPress={handleConfirm}>
            <Text style={styles.confirmHeaderBtn}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Map Simulator Container */}
        <View style={styles.mapSim}>
          <Text style={styles.mapGridIcon}>🗺️</Text>
          <View style={styles.pinBadge}>
            <Text style={styles.pinIcon}>📍</Text>
            <Text style={styles.pinText}>Selected Incident Spot</Text>
          </View>
        </View>

        {/* Address Search Box */}
        <View style={styles.addressBox}>
          <Text style={styles.label}>Location Address & Landmark</Text>
          <TextInput
            style={styles.input}
            value={search}
            onChangeText={setSearch}
            placeholder="Search highway, landmark, town..."
            placeholderTextColor="#64748b"
          />

          <View style={styles.coordsRow}>
            <Text style={styles.coordsText}>Latitude: {lat.toFixed(4)}</Text>
            <Text style={styles.coordsText}>Longitude: {lng.toFixed(4)}</Text>
          </View>

          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmBtnText}>Confirm Location & Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  cancelText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 14,
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
  confirmHeaderBtn: {
    color: '#f59e0b',
    fontWeight: '800',
    fontSize: 14,
  },
  mapSim: {
    flex: 1,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapGridIcon: {
    fontSize: 72,
    opacity: 0.2,
  },
  pinBadge: {
    position: 'absolute',
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pinIcon: {
    fontSize: 18,
  },
  pinText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  addressBox: {
    backgroundColor: '#0f172a',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#cbd5e1',
    marginBottom: 6,
    textTransform: 'uppercase',
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
    marginBottom: 10,
  },
  coordsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  coordsText: {
    color: '#64748b',
    fontSize: 11,
  },
  confirmBtn: {
    backgroundColor: '#f59e0b',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 15,
  },
});
