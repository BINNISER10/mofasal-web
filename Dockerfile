# بناء على GitHub Actions (7GB RAM) — Render يسحب الصورة جاهزة بدون build
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

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
