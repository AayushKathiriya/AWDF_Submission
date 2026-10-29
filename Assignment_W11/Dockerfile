# Dockerfile — Task Management API
# Week 11: Cloud Service Models & Docker Resource Limits
# Author: Aayush Kathiriya
#
# Multi-stage build:
#   Stage 1 (deps)       — install production dependencies only
#   Stage 2 (production) — copy app + deps into a minimal Alpine image

# ── Stage 1: Dependency installation ──────────────────────────────────────────
FROM node:20-alpine AS deps

LABEL maintainer="Aayush Kathiriya"
LABEL course="ITUE301 - Advanced Web Development Frameworks"
LABEL week="11"

WORKDIR /app

# Copy package manifests first for better layer caching
COPY package.json package-lock.json ./

# Install production dependencies only (no devDependencies)
RUN npm ci --omit=dev

# ── Stage 2: Production image ──────────────────────────────────────────────────
FROM node:20-alpine AS production

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY server.js         ./
COPY routes/           ./routes/
COPY models/           ./models/

# Set ownership to non-root user
RUN chown -R appuser:appgroup /app

USER appuser

# Expose application port
EXPOSE 5000

# Health check (Docker daemon polls this)
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the server
CMD ["node", "server.js"]
