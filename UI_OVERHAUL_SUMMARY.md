# Safety Road GH UI Overhaul

The app now uses a Bolt-inspired green-and-white visual system built around a deep operational green, bright action green, soft mint surfaces, rounded cards, live-status pills, and compact high-contrast navigation.

## Delivered

The web landing page was rebuilt as a premium product entry point, the admin shell was redesigned as a responsive command center, the admin overview now has live KPI cards, response health, latest reports, and an interactive map panel, and the admin login was rebuilt with branded split-panel access UI.

The web app now includes a real Leaflet/OpenStreetMap street map with Accra-centered rendering, incident markers, status-aware colors, popups, and recenter behavior. The map loads client-side to avoid SSR browser assumptions.

The mobile home screen was rebuilt around a green action hierarchy, emergency direct-dial chips, live alerts, community signals, and a stronger hero section. The mobile map screen no longer renders a simulated canvas: it uses `react-native-maps` with standard street mapping, incident markers, emergency-service markers, callouts, filters, recentering, fit-to-reports, and a compact selected-incident panel.

The report submission flow was rethemed and its hardcoded unrelated Unsplash image fallback was removed. The JWT role typing/build issue was fixed, and production JWT configuration is now enforced when auth functions are actually used without breaking build-time route collection.

## Validation

`web/npm run build` passes. `web/npx tsc --noEmit` passes. `mobile/npx tsc --noEmit` passes. `git diff --check` passes.

The browser smoke test confirmed that the landing page renders with the intended visual system. The admin route also renders when started with the schema-relative SQLite configuration `DATABASE_URL=file:./dev.db`.

The repository still has pre-existing lint failures in untouched API and admin files (`20 errors`, `24 warnings` in the existing lint configuration). Those are separate from the visual overhaul and remain a follow-up hardening task.

## Key changed files

- `web/src/app/page.tsx`
- `web/src/app/globals.css`
- `web/src/app/admin/AdminLayoutShell.tsx`
- `web/src/app/admin/page.tsx`
- `web/src/app/admin/login/page.tsx`
- `web/src/app/admin/CommandMap.tsx`
- `web/src/components/LeafletMap.tsx`
- `mobile/App.tsx`
- `mobile/src/screens/HomeScreen.tsx`
- `mobile/src/screens/MapScreen.tsx`
- `mobile/src/screens/ReportSubmitScreen.tsx`
- `web/src/lib/auth.ts`
- `web/src/app/api/v1/auth/login/route.ts`
- `web/src/app/api/v1/auth/register/route.ts`
