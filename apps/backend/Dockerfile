FROM oven/bun:1.3.5-alpine
WORKDIR /app

# cache deps
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY apps/backend/package.json ./apps/backend/
COPY e2e/package.json ./e2e/
RUN bun i --frozen-lockfile --production

# build source
WORKDIR /app/apps/backend
COPY apps/backend ./

USER bun
EXPOSE 3000/tcp
CMD ["bun", "run", "start"]
