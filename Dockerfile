# Builder stage: install full deps and build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage: only production deps + dist
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY repos.yml actions.yml ./
COPY schemas ./schemas
ENV NODE_ENV=production
EXPOSE 3001
USER node
HEALTHCHECK --interval=15s --timeout=3s CMD wget -qO- --timeout=2 http://localhost:3001/healthz || exit 1
CMD ["node", "dist/src/server/index.js"]
