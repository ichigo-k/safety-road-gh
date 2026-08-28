import { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Icon from '../components/Icon';

interface LocationPickerScreenProps {
  onLocationSelected: (locationName: string, lat: number, lng: number) => void;
  onCancel: () => void;
}

const START: Region = { latitude: 5.5597, longitude: -0.215, latitudeDelta: 0.045, longitudeDelta: 0.045 };

export default function LocationPickerScreen({ onLocationSelected, onCancel }: LocationPickerScreenProps) {
  const [search, setSearch] = useState('Kwame Nkrumah Interchange, Accra');
  const [pin, setPin] = useState({ latitude: START.latitude, longitude: START.longitude });
  const [map, setMap] = useState<MapView | null>(null);

  const handleRegionChange = (region: Region) => setPin({ latitude: region.latitude, longitude: region.longitude });
  const handleConfirm = () => onLocationSelected(search || 'Pinned location, Accra', pin.latitude, pin.longitude);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f8f5" />
      <View style={styles.header}><TouchableOpacity onPress={onCancel} style={styles.back}><Icon name="chevron" size={18} color="#203128" /></TouchableOpacity><View><Text style={styles.eyebrow}>REPORT LOCATION</Text><Text style={styles.headerTitle}>Pin incident spot</Text></View><TouchableOpacity onPress={handleConfirm}><Text style={styles.done}>Done</Text></TouchableOpacity></View>
      <View style={styles.mapWrap}>
        <MapView ref={(ref) => setMap(ref)} style={styles.map} initialRegion={START} mapType="standard" showsCompass showsScale onRegionChangeComplete={handleRegionChange}>
          <Marker coordinate={pin} draggable onDragEnd={(event) => setPin(event.nativeEvent.coordinate)} pinColor="#17b85a" />
        </MapView>
        <View pointerEvents="none" style={styles.centerPin}><View style={styles.pinHalo}><View style={styles.pinDot} /></View><Text style={styles.pinLabel}>Drag the pin to the exact spot</Text></View>
        <TouchableOpacity activeOpacity={.85} style={styles.locate} onPress={() => map?.animateToRegion(START, 500)}><Icon name="location" size={17} color="#0e7a3f" /></TouchableOpacity>
      </View>
      <View style={styles.sheet}><View style={styles.handle} /><Text style={styles.sheetTitle}>Where did it happen?</Text><Text style={styles.sheetSub}>Use a landmark or move the pin on the map.</Text><View style={styles.inputWrap}><Icon name="search" size={16} color="#8a9a91" /><TextInput value={search} onChangeText={setSearch} style={styles.input} placeholder="Search road, landmark or town" placeholderTextColor="#a2b0a7" /></View><View style={styles.coords}><View><Text style={styles.coordLabel}>LATITUDE</Text><Text style={styles.coordValue}>{pin.latitude.toFixed(5)}</Text></View><View><Text style={styles.coordLabel}>LONGITUDE</Text><Text style={styles.coordValue}>{pin.longitude.toFixed(5)}</Text></View><View style={styles.verified}><Icon name="shield" size={12} color="#0e7a3f" /><Text style={styles.verifiedText}>GPS ready</Text></View></View><TouchableOpacity activeOpacity={.82} style={styles.confirm} onPress={handleConfirm}><Text style={styles.confirmText}>Use this location</Text><Icon name="chevron" size={18} color="#0a3320" /></TouchableOpacity></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f8f5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 13, backgroundColor: '#f4f8f5' },
  back: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '180deg' }] },
  eyebrow: { color: '#17b85a', fontSize: 9, fontWeight: '900', letterSpacing: 1.2, textAlign: 'center' },
  headerTitle: { color: '#102018', fontSize: 17, fontWeight: '900', marginTop: 2 },
  done: { color: '#0e7a3f', fontSize: 13, fontWeight: '900' },
  mapWrap: { flex: 1, overflow: 'hidden', marginHorizontal: 12, borderRadius: 24, backgroundColor: '#dbe9df' },
  map: { flex: 1 },
  centerPin: { position: 'absolute', alignItems: 'center', top: '42%', left: 0, right: 0 },
  pinHalo: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(47,223,118,.22)' },
  pinDot: { width: 13, height: 13, borderRadius: 7, backgroundColor: '#17b85a', borderWidth: 3, borderColor: '#ffffff' },
  pinLabel: { color: '#203128', fontSize: 10, fontWeight: '800', marginTop: 9, backgroundColor: '#ffffff', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 10, shadowColor: '#102018', shadowOpacity: .12, shadowRadius: 8, elevation: 2 },
  locate: { position: 'absolute', right: 14, top: 14, width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', shadowColor: '#102018', shadowOpacity: .14, shadowRadius: 10, elevation: 3 },
  sheet: { backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 18 },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 3, backgroundColor: '#dce5de', marginBottom: 17 },
  sheetTitle: { color: '#102018', fontSize: 20, fontWeight: '900', letterSpacing: -.4 },
  sheetSub: { color: '#8a9a91', fontSize: 11, marginTop: 4, marginBottom: 13 },
  inputWrap: { height: 47, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, borderWidth: 1, borderColor: '#e0e9e2', backgroundColor: '#fbfdfb', paddingHorizontal: 13 },
  input: { flex: 1, color: '#203128', fontSize: 12 },
  coords: { flexDirection: 'row', alignItems: 'center', gap: 24, paddingVertical: 15 },
  coordLabel: { color: '#a2b0a7', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  coordValue: { color: '#203128', fontSize: 11, fontWeight: '800', marginTop: 4 },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto', borderRadius: 12, backgroundColor: '#e5f8eb', paddingHorizontal: 8, paddingVertical: 7 },
  verifiedText: { color: '#0e7a3f', fontSize: 9, fontWeight: '900' },
  confirm: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 15, backgroundColor: '#2fdf76' },
  confirmText: { color: '#0a3320', fontSize: 14, fontWeight: '900' },
});
