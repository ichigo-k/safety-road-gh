import React from 'react';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import { View, Text, StyleSheet } from 'react-native';

export interface MapMarkerData {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  locationName?: string;
  type?: string;
  status?: string;
  color?: string;
}

interface MapViewComponentProps {
  region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
  markers?: MapMarkerData[];
  onMarkerPress?: (marker: MapMarkerData) => void;
  style?: any;
  onRegionChange?: (region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }) => void;
  draggablePin?: { latitude: number; longitude: number };
  onPinDragEnd?: (coords: { latitude: number; longitude: number }) => void;
}

export default function MapViewComponent({
  region,
  markers = [],
  onMarkerPress,
  style,
  onRegionChange,
  draggablePin,
  onPinDragEnd,
}: MapViewComponentProps) {
  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={style}
      initialRegion={region}
      mapType="standard"
      showsCompass
      showsScale
      showsBuildings
      loadingEnabled
      onRegionChangeComplete={(r) => onRegionChange?.(r)}
    >
      {markers.map((m) => (
        <Marker
          key={m.id}
          coordinate={{ latitude: m.latitude, longitude: m.longitude }}
          pinColor={m.color || (m.type === 'ACCIDENT' ? '#d95555' : '#e8a126')}
          onPress={() => onMarkerPress?.(m)}
          tracksViewChanges={false}
        >
          <Callout onPress={() => onMarkerPress?.(m)}>
            <View style={styles.callout}>
              <Text style={styles.calloutType}>{m.type || 'INCIDENT'}</Text>
              <Text style={styles.calloutTitle}>{m.title}</Text>
              {m.locationName && <Text style={styles.calloutLocation}>{m.locationName}</Text>}
              {m.status && <Text style={styles.calloutStatus}>{m.status}</Text>}
            </View>
          </Callout>
        </Marker>
      ))}

      {draggablePin && (
        <Marker
          coordinate={draggablePin}
          draggable
          onDragEnd={(e) => onPinDragEnd?.(e.nativeEvent.coordinate)}
          pinColor="#17b85a"
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  callout: { minWidth: 140, padding: 4 },
  calloutType: { color: '#17b85a', fontSize: 9, fontWeight: '900', letterSpacing: 0.9 },
  calloutTitle: { color: '#102018', fontSize: 13, fontWeight: '900', marginTop: 4 },
  calloutLocation: { color: '#6d7d73', fontSize: 10, marginTop: 2 },
  calloutStatus: { color: '#0e7a3f', fontSize: 9, fontWeight: '900', marginTop: 6 },
});
