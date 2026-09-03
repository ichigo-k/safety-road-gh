// ─── Type-resolution barrel (never bundled) ───────────────────────────────────
//
// Metro resolves a folder import by looping over `sourceExts` OUTERMOST and
// platform suffixes innermost (metro-resolver `resolveSourceFile`). With
// sourceExts = [ts, tsx, …] the candidate order for `../MapViewComponent` is:
//
//   android →  index.android.ts,  index.native.ts,  index.ts,
//              index.android.tsx, index.native.tsx, index.tsx
//   web     →  index.web.ts,      index.ts,
//              index.web.tsx,     index.tsx
//
// A plain `index.ts` therefore beat `index.native.tsx` and dragged the web
// implementation — and `azure-maps-control` with it — into the Android bundle.
// Naming this file `.tsx` puts it in the same extension group as the two real
// implementations, so `index.native.tsx` / `index.web.tsx` always win and this
// file is never reached by either bundler.
//
// It exists only so TypeScript can resolve the directory import. It re-exports
// the native implementation so that even a pathological resolution can never
// pull `azure-maps-control` or `@mapbox/*` into a native bundle — those packages
// call `URL.createObjectURL()` at module-evaluation time, a browser-only API
// that crashes the app before the RN runtime is ready.
export { default } from './index.native';
export * from './index.native';
