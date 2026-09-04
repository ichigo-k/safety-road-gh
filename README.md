# Safety Road GH

A citizen road-safety reporting system for Ghana, and a risk engine built on top of it.

Drivers and pedestrians report crashes and hazards where they happen. Accepted reports are
clustered into scored danger zones — hotspots — and the mobile app warns other drivers by
voice before they reach one. The same data gives road authorities a ranked, time-aware view
of where the road is actually dangerous now.

---

## Repository layout

| Path | What it is |
| --- | --- |
| `mobile/` | React Native app (Expo SDK 57) for citizens — reporting, live map, proximity alerts |
| `web/` | Next.js app — public site, admin console, and the REST API |
| `web/src/lib/hotspots.ts` | Clustering and risk scoring. The whole model lives here |
| `mobile/src/services/proximity.ts` | Alert decision engine. Pure, with a runnable test suite |
| `.github/workflows/` | Release build: Android APK, iOS/web PWA, GitHub release |
| `Dockerfile` | Container image for the web app, including the bundled PWA |

---

## Architecture

```
 Mobile app  ──POST /reports──▶  API  ──▶  Postgres
     ▲                            │
     │                            ▼
     │                    Admin console
     │                  (verify / dispatch /
     │                   resolve / reject)
     │                            │
     │                            ▼
     │                  Hotspot derivation
     │              (cluster → score → radius)
     │                            │
     └──GET /hotspots────────────-┘
        cached on device, evaluated
        against each GPS fix
```

**Risk model.** Incidents within 350 m form one cluster. Each contributes
`recency × type × casualties`, where recency decays on a 90-day half-life, accidents outweigh
hazards, and casualty weight saturates logarithmically. The sum passes through a saturating
curve to a 0–100 score. Each hotspot also carries a 24-hour profile, so risk is scaled by time
of day but floored at 45% of the base score.

**Alerting.** Warning distance is derived from speed, not fixed — the engine targets roughly
20 seconds of lead time. A hotspot must be in range, above a minimum risk, inside a 75° cone
of travel, not already latched from a previous entry, and outside a 15-minute cooldown before
the phone speaks. The engine is pure — no I/O, no React — so the foreground watcher and the
background geofence task share it and cannot drift apart.

**Mapping.** Azure Maps on both platforms. The web app uses `azure-maps-control` directly;
the mobile app runs the same SDK inside a WebView, so phone and browser draw identical tiles
and layers from one credential.

---

## Getting started

Requires Node.js 20+, a PostgreSQL database, and an Azure Maps subscription key.

### Web app and API

```bash
cd web
npm install
cp .env.example .env      # then fill in the values below
npx prisma db push        # create the schema
npx prisma db seed        # optional: demo admin and citizen accounts
npm run dev               # http://localhost:3000
```

### Mobile app

```bash
cd mobile
npm install
npx expo start
```

Point the app at your API with `EXPO_PUBLIC_API_URL` in `mobile/.env`. On an Android emulator
the host machine is `http://10.0.2.2:3000/api/v1`.

---

## Environment variables

### `web/.env`

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `JWT_SECRET` | yes in production | Signs and verifies session tokens |
| `PASSWORD_SALT` | no | Legacy salt, only for password hashes written before per-user salts |
| `AZURE_MAPS_KEY` | yes | Server-side geocoding and routing |
| `NEXT_PUBLIC_AZURE_MAPS_KEY` | yes | Browser map rendering |
| `CLOUDINARY_CLOUD_NAME` | yes | Photo uploads |
| `CLOUDINARY_API_KEY` | yes | Photo uploads |
| `CLOUDINARY_API_SECRET` | yes | Photo uploads |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` `SMTP_FROM` | no | Password-reset email |
| `GITHUB_TOKEN` `GITHUB_RELEASES_REPO` | no | Serves the latest APK download link |

### `mobile/.env`

| Variable | Required | Purpose |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | yes | API base, including `/api/v1` |
| `EXPO_PUBLIC_AZURE_MAPS_KEY` | yes | Map tiles and rendering |

Never commit `.env` files — they are ignored at the repository root.

---

## Scripts

### `web/`

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Generates the Prisma client, then builds |
| `npm run build:full` | Builds the mobile PWA and copies it in, then builds the site |
| `npm run lint` | ESLint |
| `npm run hotspots:recompute` | Rebuilds every derived hotspot from current incidents |
| `npm run check:hotspots` | Verifies the clustering and scoring model |

### `mobile/`

| Command | What it does |
| --- | --- |
| `npx expo start` | Development server |
| `npm run export:web` | Static web export of the app |
| `npm run check:proximity` | Runs the alert-engine test suite (18 checks) |

---

## Testing

The two pieces of logic that decide what a driver is told both have runnable checks:

```bash
cd mobile && npm run check:proximity   # alert engine: cooldowns, heading, thresholds
cd web   && npm run check:hotspots     # clustering and risk scoring
```

Both are plain scripts with no test-runner dependency, and both print a pass/fail line per
case.

---

## Releases

Pushing to `main` builds an Android APK and an iOS/web PWA, and publishes a GitHub release.
Signing credentials are supplied through repository secrets; without them the build falls
back to a debug keystore and remains installable but not publishable.

---

## Known limitations

Documented deliberately, because a safety system that oversells itself is worse than one that
does not.

- **Hotspot hour profiles use report time, not incident time.** A crash reported the next
  morning is bucketed at the reporting hour, so time-of-day risk currently reflects reporting
  habits as much as crash timing.
- **Duplicate reports of one event are not merged.** A collision reported by several witnesses
  contributes several incidents and inflates that cluster's score.
- **Coverage follows reporting, not risk.** An area with no hotspots may be safe or simply
  unobserved. This matters if the output is used to direct spending.
- **Reports are claims until reviewed.** Rejected reports are excluded from the risk model, so
  review throughput bounds how trustworthy the model is.
