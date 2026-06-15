# Multi-stage Next.js build for Railway
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
COPY apps/web/package.json apps/web/package-lock.json apps/web/.npmrc apps/web/

RUN cd packages/shared && npm install --no-audit --no-fund
RUN cd /app/packages/ui && npm install --no-audit --no-fund
RUN cd /app/apps/web && npm install --no-audit --no-fund --ignore-scripts --omit=optional --no-bin-links

COPY packages/shared packages/shared
COPY packages/ui packages/ui
COPY apps/web apps/web

WORKDIR /app/apps/web

ARG DATABASE_URL=postgresql://build:build@localhost:5432/build?schema=public
ARG DIRECT_DATABASE_URL=postgresql://build:build@localhost:5432/build?schema=public
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_DATABASE_URL=$DIRECT_DATABASE_URL

ARG NEXT_PUBLIC_API_URL=https://mofasal-api.onrender.com/api/v1
ARG NEXT_PUBLIC_APP_URL=https://mofasal-web.onrender.com
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV NEXT_TELEMETRY_DISABLED=1
ENV GENERATE_SOURCEMAP=false

RUN npx prisma generate --schema=./prisma/schema.prisma \
 && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

RUN chown -R nextjs:nodejs /app
USER nextjs

CMD ["node", "apps/web/server.js"]
