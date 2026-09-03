import React from 'react';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

type Family = 'feather' | 'ion' | 'mci';

// Single registry so icon names stay stable across screens. Tab icons use
// Ionicons because it ships true filled/outline pairs.
const REGISTRY: Record<string, [Family, string]> = {
  // ── Navigation / tabs ──────────────────────────────────────────────────────
  home: ['ion', 'home-outline'],
  'home-filled': ['ion', 'home'],
  map: ['ion', 'map-outline'],
  'map-filled': ['ion', 'map'],
  reports: ['ion', 'document-text-outline'],
  'reports-filled': ['ion', 'document-text'],
  alerts: ['ion', 'notifications-outline'],
  'alerts-filled': ['ion', 'notifications'],
  profile: ['ion', 'person-outline'],
  'profile-filled': ['ion', 'person'],

  // ── Incident types ─────────────────────────────────────────────────────────
  accident: ['mci', 'car-emergency'],
  hazard: ['ion', 'warning-outline'],
  'hazard-filled': ['ion', 'warning'],
  'alert-octagon': ['feather', 'alert-octagon'],
  'alert-triangle': ['feather', 'alert-triangle'],
  'alert-circle': ['feather', 'alert-circle'],

  // ── Emergency services ─────────────────────────────────────────────────────
  ambulance: ['mci', 'ambulance'],
  police: ['mci', 'police-badge-outline'],
  fire: ['mci', 'fire-truck'],
  hospital: ['mci', 'hospital-box-outline'],
  shield: ['ion', 'shield-checkmark-outline'],
  'shield-filled': ['ion', 'shield-checkmark'],
  siren: ['mci', 'car-light-alert'],

  // ── Location ───────────────────────────────────────────────────────────────
  location: ['ion', 'location-outline'],
  'location-filled': ['ion', 'location'],
  'map-pin': ['ion', 'location-outline'],
  navigate: ['ion', 'navigate-outline'],
  crosshair: ['mci', 'crosshairs-gps'],
  layers: ['feather', 'layers'],

  // ── Actions ────────────────────────────────────────────────────────────────
  search: ['ion', 'search-outline'],
  camera: ['ion', 'camera-outline'],
  gallery: ['ion', 'images-outline'],
  image: ['ion', 'image-outline'],
  check: ['ion', 'checkmark'],
  'check-badge': ['ion', 'checkmark-circle'],
  'check-circle': ['ion', 'checkmark-circle-outline'],
  close: ['ion', 'close'],
  x: ['ion', 'close'],
  plus: ['ion', 'add'],
  trash: ['ion', 'trash-outline'],
  edit: ['ion', 'create-outline'],
  share: ['ion', 'share-outline'],
  filter: ['ion', 'options-outline'],
  refresh: ['ion', 'refresh'],
  'refresh-cw': ['ion', 'refresh'],
  send: ['ion', 'paper-plane-outline'],

  // ── Comms ──────────────────────────────────────────────────────────────────
  phone: ['ion', 'call-outline'],
  'phone-filled': ['ion', 'call'],
  mail: ['ion', 'mail-outline'],
  bell: ['ion', 'notifications-outline'],
  message: ['ion', 'chatbubble-ellipses-outline'],

  // ── Chrome ─────────────────────────────────────────────────────────────────
  chevron: ['ion', 'chevron-forward'],
  'chevron-right': ['ion', 'chevron-forward'],
  'chevron-down': ['ion', 'chevron-down'],
  'chevron-up': ['ion', 'chevron-up'],
  back: ['ion', 'arrow-back'],
  'arrow-left': ['ion', 'arrow-back'],
  'arrow-right': ['ion', 'arrow-forward'],
  more: ['ion', 'ellipsis-horizontal'],
  logout: ['ion', 'log-out-outline'],
  'log-out': ['ion', 'log-out-outline'],
  settings: ['ion', 'settings-outline'],
  sliders: ['feather', 'sliders'],
  help: ['ion', 'help-circle-outline'],
  'help-circle': ['ion', 'help-circle-outline'],
  info: ['ion', 'information-circle-outline'],
  lock: ['ion', 'lock-closed-outline'],
  eye: ['ion', 'eye-outline'],
  'eye-off': ['ion', 'eye-off-outline'],
  user: ['ion', 'person-outline'],
  users: ['ion', 'people-outline'],
  star: ['ion', 'star-outline'],
  clock: ['ion', 'time-outline'],
  calendar: ['ion', 'calendar-outline'],
  document: ['ion', 'document-text-outline'],
  'file-text': ['ion', 'document-text-outline'],
  lightbulb: ['ion', 'bulb-outline'],
  'book-open': ['ion', 'book-outline'],
  radio: ['ion', 'radio-outline'],
  activity: ['feather', 'activity'],
  'trending-up': ['feather', 'trending-up'],
  zap: ['ion', 'flash-outline'],
  'plus-circle': ['ion', 'add-circle-outline'],

  // ── Transport modes ────────────────────────────────────────────────────────
  car: ['mci', 'car'],
  motorcycle: ['mci', 'motorbike'],
  walk: ['mci', 'walk'],
  bus: ['mci', 'bus'],
  truck: ['mci', 'truck-outline'],
  'fire-truck': ['mci', 'fire-truck'],
  compass: ['ion', 'compass-outline'],
  navigation: ['ion', 'navigate-outline'],
};

export default function Icon({ name, size = 18, color = '#0D1117' }: IconProps) {
  const entry = REGISTRY[name] ?? REGISTRY.info;
  const [family, glyph] = entry;

  if (family === 'ion') return <Ionicons name={glyph as any} size={size} color={color} />;
  if (family === 'mci')
    return <MaterialCommunityIcons name={glyph as any} size={size} color={color} />;
  return <Feather name={glyph as any} size={size} color={color} />;
}
