// ─── Web fallback barrel ──────────────────────────────────────────────────────
//
// Metro's platform-extension resolution for a folder import:
//   1. index.native.tsx  ← Android + iOS (never reaches this file)
//   2. index.tsx
//   3. index.ts          ← this file (web / unknown platform only)
//
// This file is ONLY evaluated by the web bundler. Native builds resolve
// index.native.tsx first and stop there.
//
// DO NOT import azure-maps-control or any @mapbox/* package from native code.
// @mapbox/mapbox-gl-supported calls URL.createObjectURL() at module load time —
// a browser-only API that causes a fatal crash before the RN runtime is ready.
export { default } from './index.web';
export * from './index.web';
