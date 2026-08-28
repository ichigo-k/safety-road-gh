import React from 'react';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

export default function Icon({ name, size = 20, color = '#ffffff' }: IconProps) {
  switch (name) {
    case 'home':
      return <Feather name="home" size={size} color={color} />;
    case 'map':
      return <Feather name="map" size={size} color={color} />;
    case 'reports':
      return <Feather name="file-text" size={size} color={color} />;
    case 'alerts':
      return <Feather name="bell" size={size} color={color} />;
    case 'profile':
      return <Feather name="user" size={size} color={color} />;
    case 'accident':
      return <MaterialCommunityIcons name="car" size={size} color={color} />;
    case 'hazard':
      return <Feather name="alert-triangle" size={size} color={color} />;
    case 'ambulance':
      return <MaterialCommunityIcons name="ambulance" size={size} color={color} />;
    case 'police':
      return <MaterialCommunityIcons name="shield-account" size={size} color={color} />;
    case 'fire':
      return <MaterialCommunityIcons name="fire-truck" size={size} color={color} />;
    case 'location':
      return <Feather name="map-pin" size={size} color={color} />;
    case 'hospital':
      return <MaterialCommunityIcons name="hospital-building" size={size} color={color} />;
    case 'camera':
      return <Feather name="camera" size={size} color={color} />;
    case 'gallery':
      return <Feather name="image" size={size} color={color} />;
    case 'check':
      return <Feather name="check-circle" size={size} color={color} />;
    case 'phone':
      return <Feather name="phone-call" size={size} color={color} />;
    case 'logout':
      return <Feather name="log-out" size={size} color={color} />;
    case 'chevron':
      return <Feather name="chevron-right" size={size} color={color} />;
    case 'settings':
      return <Feather name="settings" size={size} color={color} />;
    case 'help':
      return <Feather name="help-circle" size={size} color={color} />;
    case 'info':
      return <Feather name="info" size={size} color={color} />;
    case 'lightbulb':
      return <Feather name="help-circle" size={size} color={color} />;
    case 'shield':
      return <Feather name="shield" size={size} color={color} />;
    case 'car':
      return <Ionicons name="car-sport-outline" size={size} color={color} />;
    case 'motorcycle':
      return <MaterialCommunityIcons name="motorbike" size={size} color={color} />;
    case 'walk':
      return <Ionicons name="walk-outline" size={size} color={color} />;
    case 'bus':
      return <Ionicons name="bus-outline" size={size} color={color} />;
    default:
      return <Feather name="info" size={size} color={color} />;
  }
}
