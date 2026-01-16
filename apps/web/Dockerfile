FROM oven/bun:1.3.5-alpine AS builder
WORKDIR /app

# cache deps
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY apps/backend/package.json ./apps/backend/
COPY e2e/package.json ./e2e/
RUN bun i --frozen-lockfile --production

# build source
COPY apps/web ./apps/web
RUN bun --cwd=apps/web run build

FROM caddy:2-alpine
COPY apps/web/Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/apps/web/dist /var/www
