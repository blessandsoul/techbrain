FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm install --prefer-offline
RUN npx prisma generate

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache su-exec openssl

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma client for runtime
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Ensure image optimization cache dir is writable
RUN mkdir -p .next/cache/images && chown -R nextjs:nodejs .next/cache

# Store default product images for seeding volumes on first run
COPY --from=builder --chown=nextjs:nodejs /app/public/images/products ./public.default/images/products

COPY <<'EOF' /app/entrypoint.sh
#!/bin/sh
set -e

# Sync default product images into volume
mkdir -p /app/public/images/products
echo "Syncing default product images..."
cd /app/public.default/images/products 2>/dev/null && \
  for f in *; do
    [ -e "/app/public/images/products/$f" ] || cp "$f" /app/public/images/products/
  done && cd /app || true
chown -R nextjs:nodejs /app/public/images/products

# Ensure image optimization cache is writable
mkdir -p /app/.next/cache/images
chown -R nextjs:nodejs /app/.next/cache

exec su-exec nextjs node server.js
EOF

RUN chmod +x /app/entrypoint.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/app/entrypoint.sh"]
