import React from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function Icon({ name, size = 18, color = '#111827' }: IconProps) {
  switch (name) {
    case 'home':
    case 'home-filled':
      return <Feather name="home" size={size} color={color} />;
    case 'map':
    case 'map-filled':
      return <Feather name="map" size={size} color={color} />;
    case 'reports':
    case 'reports-filled':
      return <Feather name="file-text" size={size} color={color} />;
    case 'alerts':
    case 'alerts-filled':
      return <Feather name="bell" size={size} color={color} />;
    case 'profile':
    case 'profile-filled':
      return <Feather name="user" size={size} color={color} />;
    case 'accident':
      return <Feather name="alert-octagon" size={size} color={color} />;
    case 'hazard':
      return <Feather name="alert-triangle" size={size} color={color} />;
    case 'ambulance':
      return <MaterialCommunityIcons name="ambulance" size={size} color={color} />;
    case 'police':
      return <Feather name="shield" size={size} color={color} />;
    case 'fire':
      return <MaterialCommunityIcons name="fire-truck" size={size} color={color} />;
    case 'location':
      return <Feather name="map-pin" size={size} color={color} />;
    case 'search':
      return <Feather name="search" size={size} color={color} />;
    case 'hospital':
      return <Feather name="plus-circle" size={size} color={color} />;
    case 'camera':
      return <Feather name="camera" size={size} color={color} />;
    case 'gallery':
      return <Feather name="image" size={size} color={color} />;
    case 'check':
      return <Feather name="check" size={size} color={color} />;
    case 'check-badge':
      return <Feather name="check-circle" size={size} color={color} />;
    case 'phone':
      return <Feather name="phone" size={size} color={color} />;
    case 'logout':
      return <Feather name="log-out" size={size} color={color} />;
    case 'chevron':
      return <Feather name="chevron-right" size={size} color={color} />;
    case 'back':
      return <Feather name="arrow-left" size={size} color={color} />;
    case 'settings':
      return <Feather name="sliders" size={size} color={color} />;
    case 'help':
      return <Feather name="help-circle" size={size} color={color} />;
    case 'info':
      return <Feather name="info" size={size} color={color} />;
    case 'lightbulb':
      return <Feather name="book-open" size={size} color={color} />;
    case 'shield':
      return <Feather name="shield" size={size} color={color} />;
    case 'radio':
      return <Feather name="radio" size={size} color={color} />;
    case 'car':
      return <Feather name="navigation" size={size} color={color} />;
    case 'motorcycle':
      return <Feather name="compass" size={size} color={color} />;
    case 'walk':
      return <Feather name="user" size={size} color={color} />;
    case 'bus':
      return <Feather name="truck" size={size} color={color} />;
    case 'refresh':
      return <Feather name="refresh-cw" size={size} color={color} />;
    default:
      return <Feather name="info" size={size} color={color} />;
  }
}
