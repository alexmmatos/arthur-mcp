# ── Stage 1: build frontend ───────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
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
# native modules (sqlite3) já compilados para Alpine
COPY --from=backend-builder /app/node_modules ./node_modules
# NestJS compilado (inclui templates .hbs copiados pelo nest-cli assets)
COPY --from=backend-builder /app/dist ./dist
# React build servido pelo express.static em dist/public
COPY --from=frontend-builder /app/dist ./dist/public

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/main"]
