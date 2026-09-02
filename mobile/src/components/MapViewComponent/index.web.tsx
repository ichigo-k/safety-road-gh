import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';
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
  clusterCount?: number;
}

export interface MapViewComponentProps {
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  markers?: MapMarkerData[];
  onMarkerPress?: (marker: MapMarkerData) => void;
  style?: any;
  onRegionChange?: (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => void;
  draggablePin?: { latitude: number; longitude: number };
  onPinDragEnd?: (coords: { latitude: number; longitude: number }) => void;
}

export default function MapViewComponent({
  region,
  markers = [],
  onMarkerPress,
  style,
  draggablePin,
  onPinDragEnd,
}: MapViewComponentProps) {
  const [layout, setLayout] = useState({ width: Dimensions.get('window').width, height: 600 });
  const [zoom, setZoom] = useState(1);

  const width = layout.width || 360;
  const height = layout.height || 500;

  // Compute map bounds with padding
  const allLats = markers
    .map((m) => m.latitude)
    .concat(draggablePin ? [draggablePin.latitude] : [])
    .concat([region.latitude]);
  const allLngs = markers
    .map((m) => m.longitude)
    .concat(draggablePin ? [draggablePin.longitude] : [])
    .concat([region.longitude]);

  const minLat = Math.min(...allLats) - (0.04 / zoom);
  const maxLat = Math.max(...allLats) + (0.04 / zoom);
  const minLng = Math.min(...allLngs) - (0.04 / zoom);
  const maxLng = Math.max(...allLngs) + (0.04 / zoom);

  const geoToPixel = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng || 0.1)) * (width - 60) + 30;
    const y = ((maxLat - lat) / (maxLat - minLat || 0.1)) * (height - 60) + 30;
    return {
      x: Math.max(16, Math.min(width - 16, x)),
      y: Math.max(16, Math.min(height - 16, y)),
    };
  };

  const pixelToGeo = (x: number, y: number) => {
    const lng = minLng + ((x - 30) / (width - 60)) * (maxLng - minLng);
    const lat = maxLat - ((y - 30) / (height - 60)) * (maxLat - minLat);
    return { latitude: lat, longitude: lng };
  };

  const handleMapPress = (e: GestureResponderEvent) => {
    if (draggablePin && onPinDragEnd) {
      const { locationX, locationY } = e.nativeEvent;
      const coords = pixelToGeo(locationX, locationY);
      onPinDragEnd(coords);
    }
  };

  return (
    <View
      style={[styles.container, style]}
      onLayout={(e) => {
        const { width: w, height: h } = e.nativeEvent.layout;
        if (w > 0 && h > 0) setLayout({ width: w, height: h });
      }}
      onTouchEnd={draggablePin ? handleMapPress : undefined}
    >
      {/* Background Map Grid & Roads */}
      <View style={styles.gridContainer}>
        {[0.15, 0.35, 0.55, 0.75, 0.9].map((frac) => (
          <View key={`h-${frac}`} style={[styles.gridH, { top: `${frac * 100}%` }]} />
        ))}
        {[0.15, 0.35, 0.55, 0.75, 0.9].map((frac) => (
          <View key={`v-${frac}`} style={[styles.gridV, { left: `${frac * 100}%` }]} />
        ))}
      </View>

      {/* Road Highway Vector lines */}
      <View style={styles.highwayLine1} />
      <View style={styles.highwayLine2} />

      {/* Live Map Watermark */}
      <View style={styles.watermark}>
        <Text style={styles.watermarkText}>GHANA ROAD TELEMETRY GIS</Text>
      </View>

      {/* Markers */}
      {markers.map((m) => {
        const pos = geoToPixel(m.latitude, m.longitude);
        const isAccident = m.type === 'ACCIDENT';
        const isEmergency = m.type === 'EMERGENCY';
        const isUser = m.type === 'USER';
        const markerColor =
          m.color ||
          (isAccident ? '#DC2626' : isEmergency ? '#1D4ED8' : isUser ? '#2563EB' : '#F59E0B');

        if (isUser) {
          return (
            <View key={m.id} style={[styles.userMarker, { left: pos.x - 12, top: pos.y - 12 }]}>
              <View style={styles.userDot} />
            </View>
          );
        }

        return (
          <TouchableOpacity
            key={m.id}
            activeOpacity={0.8}
            style={[styles.markerPin, { left: pos.x - 16, top: pos.y - 16 }]}
            onPress={() => onMarkerPress?.(m)}
          >
            {/* Cluster count or icon */}
            <View style={[styles.pinBubble, { backgroundColor: markerColor }]}>
              {m.clusterCount && m.clusterCount > 1 ? (
                <Text style={styles.clusterCountText}>{m.clusterCount}</Text>
              ) : (
                <Icon
                  name={isAccident ? 'accident' : isEmergency ? 'police' : 'hazard'}
                  size={14}
                  color="#ffffff"
                />
              )}
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Draggable pin */}
      {draggablePin && (
        <View
          style={[
            styles.draggablePinWrap,
            {
              left: geoToPixel(draggablePin.latitude, draggablePin.longitude).x - 16,
              top: geoToPixel(draggablePin.latitude, draggablePin.longitude).y - 32,
            },
          ]}
        >
          <View style={styles.draggablePinBody}>
            <Icon name="location" size={24} color="#0B7A46" />
          </View>
        </View>
      )}

      {/* Zoom controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.zoomBtn}
          onPress={() => setZoom((z) => Math.min(z + 0.3, 2.5))}
        >
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomBtn}
          onPress={() => setZoom((z) => Math.max(z - 0.3, 0.6))}
        >
          <Text style={styles.zoomText}>−</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#eaf4ee',
    overflow: 'hidden',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  gridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(11, 122, 70, 0.08)',
  },
  gridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(11, 122, 70, 0.08)',
  },
  highwayLine1: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    transform: [{ rotate: '-8deg' }],
  },
  highwayLine2: {
    position: 'absolute',
    left: '48%',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    transform: [{ rotate: '12deg' }],
  },
  watermark: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  watermarkText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0B7A46',
    letterSpacing: 0.6,
  },
  markerPin: {
    position: 'absolute',
    zIndex: 6,
  },
  pinBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  clusterCountText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  userMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.5)',
    zIndex: 10,
  },
  userDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  draggablePinWrap: {
    position: 'absolute',
    zIndex: 12,
  },
  draggablePinBody: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  zoomControls: {
    position: 'absolute',
    right: 14,
    top: 100,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 20,
  },
  zoomBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  zoomText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
});
