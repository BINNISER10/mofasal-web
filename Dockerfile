# Multi-stage Next.js build — runs on Render Docker builders (not 512MB Node heap)
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
COPY apps/web/package.json apps/web/package-lock.json apps/web/

RUN cd packages/shared && npm install --no-audit --no-fund \
 && cd /app/packages/ui && npm install --no-audit --no-fund \
 && cd /app/apps/web && npm install --no-audit --no-fund --ignore-scripts

COPY packages/shared packages/shared
COPY packages/ui packages/ui
COPY apps/web apps/web

WORKDIR /app/apps/web

# NEXT_PUBLIC_* must be present at build time (Render passes service env vars into docker build).
ARG NEXT_PUBLIC_API_URL=https://mofasal-api.onrender.com/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV NEXT_TELEMETRY_DISABLED=1
ENV GENERATE_SOURCEMAP=false

RUN npx prisma generate --schema=./prisma/schema.prisma \
 && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

RUN chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:10000/ || exit 1

CMD ["node", "apps/web/server.js"]
