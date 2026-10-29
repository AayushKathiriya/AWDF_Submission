# Dockerfile — Task Management API (Blue-Green Deployment)
# Week 12: Zero-Downtime Deployment Simulation
# Author: Aayush Kathiriya
#
# The same image is built once and run TWICE — as blue and as green.
# The VERSION environment variable distinguishes the two containers at runtime.
# This is intentional: blue-green does NOT require different images;
# it requires different configurations (env vars, feature flags, or code versions).

# ── Stage 1: Install production dependencies ───────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Stage 2: Production runtime image ─────────────────────────────────────────
FROM node:20-alpine AS production

LABEL maintainer="Aayush Kathiriya"
LABEL course="ITUE301 - Advanced Web Development Frameworks"
LABEL week="12"
LABEL description="Blue-Green Deployment Simulation"

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY server.js      ./
COPY routes/        ./routes/
COPY models/        ./models/

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

# Health check using /version endpoint (confirms VERSION env var is set)
HEALTHCHECK --interval=20s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/version', (r) => { let d=''; r.on('data', c => d+=c); r.on('end', () => { const v=JSON.parse(d); process.exit(v.version ? 0 : 1) }) })"

CMD ["node", "server.js"]
