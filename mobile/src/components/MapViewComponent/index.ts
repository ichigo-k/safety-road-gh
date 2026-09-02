// On native (iOS/Android), Metro automatically resolves index.native.tsx.
// On web, Metro falls back to this file, which re-exports the web fallback.
// We NEVER statically import react-native-maps here — it crashes on web.
export { default } from './index.web';
export * from './index.web';
