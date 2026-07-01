# ── Stage 1: build frontend ───────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
# The root frontend currently has no committed package-lock.json, so npm ci would fail.
RUN npm install
COPY . .
RUN npm run build

# ── Stage 2: build backend ────────────────────────────────────────────────────
FROM node:20-alpine AS backend-builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY api/package*.json ./
RUN npm ci
COPY api/ .
RUN npm run build

# ── Stage 3: runner ───────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app
RUN mkdir -p /app/data
# Native modules (sqlite3) are compiled for Alpine in the backend builder stage.
COPY --from=backend-builder /app/node_modules ./node_modules
# Compiled NestJS app, including nest-cli copied assets such as .hbs templates.
COPY --from=backend-builder /app/dist ./dist
# React build served by the backend static middleware from dist/public.
COPY --from=frontend-builder /app/dist ./dist/public

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/main"]
