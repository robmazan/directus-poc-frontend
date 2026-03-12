# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY src/ ./src/
COPY public/ ./public/

RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/public/ ./public/
COPY views/ ./views/

EXPOSE 3000

CMD ["node", "dist/server/index.js"]
