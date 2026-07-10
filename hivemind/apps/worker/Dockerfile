FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY apps/worker/package.json apps/worker/
COPY packages/core/package.json packages/core/
COPY packages/connectors/package.json packages/connectors/
COPY packages/shared/package.json packages/shared/

COPY pnpm-lock.yaml ./
RUN pnpm fetch --frozen-lockfile || pnpm install --no-frozen-lockfile

COPY tsconfig.base.json ./
COPY apps/worker apps/worker
COPY packages packages

RUN pnpm --filter @hivemind/core build && \
    pnpm --filter @hivemind/shared build && \
    pnpm --filter @hivemind/connectors build && \
    pnpm --filter @hivemind/worker build

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "apps/worker/dist/index.js"]
