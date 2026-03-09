# ===================================================================
# Multi-stage Dockerfile for Fastify Server — Coolify Production
# ===================================================================

# ===================================================================
# Stage 1: Dependencies (cached layer — production only)
# ===================================================================
FROM node:20-alpine AS dependencies

# Native build tools needed by argon2
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json* ./

# Install production dependencies + prisma CLI (needed for migrations)
RUN npm ci --omit=dev && npm i prisma

# ===================================================================
# Stage 2: Build (compile TypeScript)
# ===================================================================
FROM node:20-alpine AS builder

# Native build tools needed by argon2
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Force development mode so devDependencies (typescript, @types/*) are installed
# even when Coolify injects NODE_ENV=production as a build-time variable
ENV NODE_ENV=development

COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code and Prisma schema
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Compile seed script separately (not part of src/, so tsc doesn't include it)
RUN npx tsc prisma/seed.ts --outDir dist/seed --esModuleInterop --module NodeNext --moduleResolution NodeNext --skipLibCheck

# ===================================================================
# Stage 3: Production Runtime
# ===================================================================
FROM node:20-alpine AS production

# dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy production dependencies
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy generated Prisma client from builder (not present in prod deps)
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Copy Prisma files (needed for migrations)
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Store uploads from repo in a backup location (volume will override /app/uploads)
COPY --from=builder --chown=nodejs:nodejs /app/uploads ./uploads.default

# Create uploads directory (writable by app for file uploads)
RUN mkdir -p uploads && chown nodejs:nodejs uploads

# Entrypoint script: seed volume from backup if empty, then start app
COPY <<'EOF' /app/entrypoint.sh
#!/bin/sh
set -e

# If the uploads volume is empty, populate it from the image defaults
if [ -d /app/uploads.default ] && [ -z "$(ls -A /app/uploads 2>/dev/null)" ]; then
  echo "Volume is empty — copying default uploads..."
  cp -r /app/uploads.default/* /app/uploads/ 2>/dev/null || true
  echo "Done."
fi

exec node dist/server.js
EOF
RUN chmod +x /app/entrypoint.sh

# Switch to non-root user
USER nodejs

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "const p=process.env.PORT||8000;require('http').get('http://localhost:'+p+'/api/v1/live',(r)=>{process.exit(r.statusCode===200?0:1)})"

ENTRYPOINT ["dumb-init", "--"]

CMD ["/app/entrypoint.sh"]
