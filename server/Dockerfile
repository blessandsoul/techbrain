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

# Create uploads directory (writable by app for file uploads)
RUN mkdir -p uploads && chown nodejs:nodejs uploads

# Switch to non-root user
USER nodejs

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "const p=process.env.PORT||8000;require('http').get('http://localhost:'+p+'/api/v1/live',(r)=>{process.exit(r.statusCode===200?0:1)})"

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/server.js"]
