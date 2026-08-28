import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Icon from '../Icon';

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

// Convert lat/lng to pixel position on the simulated map
function geoToPixel(
  lat: number,
  lng: number,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  width: number,
  height: number
) {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 0.1)) * (width - 60) + 30;
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat || 0.1)) * (height - 60) + 30;
  return {
    x: Math.max(20, Math.min(width - 20, x)),
    y: Math.max(20, Math.min(height - 20, y)),
  };
}

export default function MapViewComponent({
  region,
  markers = [],
  onMarkerPress,
  style,
  draggablePin,
}: MapViewComponentProps) {
  const width = Dimensions.get('window').width - 32;
  const height = 340;

  const allLats = markers.map((m) => m.latitude).concat(draggablePin ? [draggablePin.latitude] : []).concat([region.latitude]);
  const allLngs = markers.map((m) => m.longitude).concat(draggablePin ? [draggablePin.longitude] : []).concat([region.longitude]);

  const bounds = {
    minLat: Math.min(...allLats) - 0.03,
    maxLat: Math.max(...allLats) + 0.03,
    minLng: Math.min(...allLngs) - 0.03,
    maxLng: Math.max(...allLngs) + 0.03,
  };

  return (
    <View style={[styles.canvas, style]}>
      {/* Map Grid Background */}
      <View style={styles.gridContainer}>
        {[0.2, 0.4, 0.6, 0.8].map((frac) => (
          <View key={`h-${frac}`} style={[styles.gridH, { top: `${frac * 100}%` }]} />
        ))}
        {[0.2, 0.4, 0.6, 0.8].map((frac) => (
          <View key={`v-${frac}`} style={[styles.gridV, { left: `${frac * 100}%` }]} />
        ))}
      </View>

      {/* Map Header Label */}
      <View style={styles.mapBadge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>GHANA ROAD NETWORK GIS</Text>
      </View>

      {/* Render Markers */}
      {markers.map((m) => {
        const pos = geoToPixel(m.latitude, m.longitude, bounds, width, height);
        const markerColor = m.color || (m.type === 'ACCIDENT' ? '#d95555' : '#e8a126');
        return (
          <TouchableOpacity
            key={m.id}
            activeOpacity={0.8}
            style={[styles.markerPin, { left: pos.x - 14, top: pos.y - 14 }]}
            onPress={() => onMarkerPress?.(m)}
          >
            <View style={[styles.pinBubble, { backgroundColor: markerColor }]}>
              <Icon name={m.type === 'ACCIDENT' ? 'accident' : 'hazard'} size={12} color="#ffffff" />
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Render Draggable Pin if location picker mode */}
      {draggablePin && (
        <View
          style={[
            styles.draggablePin,
            {
              left: geoToPixel(draggablePin.latitude, draggablePin.longitude, bounds, width, height).x - 16,
              top: geoToPixel(draggablePin.latitude, draggablePin.longitude, bounds, width, height).y - 16,
            },
          ]}
        >
          <View style={styles.pinDotOuter}>
            <View style={styles.pinDotInner} />
          </View>
        </View>
      )}

      {/* Map Footer Info */}
      <View style={styles.mapFooter}>
        <Text style={styles.coordsText}>
          GPS Center: {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: '#e6f2eb',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#cce5d6',
  },
  gridContainer: {
    ...StyleSheet.absoluteFill,
  },
  gridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(23, 184, 90, 0.1)',
  },
  gridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(23, 184, 90, 0.1)',
  },
  mapBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#102018',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2fdf76',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  markerPin: {
    position: 'absolute',
    zIndex: 5,
  },
  pinBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  draggablePin: {
    position: 'absolute',
    zIndex: 8,
  },
  pinDotOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(23, 184, 90, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#17b85a',
  },
  mapFooter: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  coordsText: {
    fontSize: 9,
    color: '#475569',
    fontWeight: '700',
  },
});
