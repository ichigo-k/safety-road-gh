# syntax=docker/dockerfile:1
#
# Safety Road GH — Next.js app + bundled mobile PWA.
#
# Build context is the REPO ROOT, not web/, because stage 1 needs mobile/ to
# export the PWA that the site serves at /app.
#
#   docker build -t safetyroad/web .
#
# Values inlined into the client bundle at build time (not runtime) must be
# passed as build args — anything NEXT_PUBLIC_ is baked in by `next build`
# and cannot be changed by an env var on `docker run`.

# ─── 1. Mobile PWA ──────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS pwa
WORKDIR /src/mobile

ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_AZURE_MAPS_KEY
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL \
    EXPO_PUBLIC_AZURE_MAPS_KEY=$EXPO_PUBLIC_AZURE_MAPS_KEY

COPY mobile/package.json mobile/package-lock.json* ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

COPY mobile/ ./
# Static export of the Expo web target -> dist/
RUN npx expo export --platform web --output-dir dist


# ─── 2. Next.js build ───────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS build
WORKDIR /src/web

# Prisma's engines need OpenSSL present at generate time.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

ARG NEXT_PUBLIC_AZURE_MAPS_KEY
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ARG NEXT_PUBLIC_APK_URL
ENV NEXT_PUBLIC_AZURE_MAPS_KEY=$NEXT_PUBLIC_AZURE_MAPS_KEY \
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME \
    NEXT_PUBLIC_APK_URL=$NEXT_PUBLIC_APK_URL \
    NEXT_TELEMETRY_DISABLED=1

COPY web/package.json web/package-lock.json* ./
RUN npm ci || npm install

COPY web/ ./

# `prisma generate` needs a DATABASE_URL to parse the schema, but never
# connects during a build. A placeholder keeps the image free of real
# credentials; the runtime value comes from the environment.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
RUN npx prisma generate

# The exported PWA is served as static files at /app.
COPY --from=pwa /src/mobile/dist ./public/app

RUN npm run build


# ─── 3. Runtime ─────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Run unprivileged. node:20 already ships a `node` user.
COPY --from=build --chown=node:node /src/web/.next/standalone ./
COPY --from=build --chown=node:node /src/web/.next/static ./.next/static
COPY --from=build --chown=node:node /src/web/public ./public
# Shipped so `prisma migrate deploy` can run against the live database from
# inside the container on release.
COPY --from=build --chown=node:node /src/web/prisma ./prisma

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/v1/hotspots').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
