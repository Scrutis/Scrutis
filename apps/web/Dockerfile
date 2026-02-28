ARG NODE_VERSION=24.7.0

# Alpine image
FROM node:${NODE_VERSION}-alpine AS alpine
RUN apk update
RUN apk add --no-cache libc6-compat

# Setup pnpm and turbo
FROM alpine AS base
RUN npm install pnpm turbo@2.5.5 --global
RUN pnpm config set store-dir ~/.pnpm-store

# Prune projects
FROM base AS pruner
WORKDIR /repo
COPY . .
RUN turbo prune --scope=web --docker

# Build the project
FROM base AS builder
WORKDIR /repo

# Copy lockfile and package.json's
COPY --from=pruner /repo/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /repo/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /repo/out/json/ .

# First install the dependencies
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm install --frozen-lockfile

# Copy source code
COPY --from=pruner /repo/out/full/ .

RUN turbo build --filter=web
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm prune --prod --no-optional

# Final image
FROM alpine AS runner

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /repo .
WORKDIR /app/apps/web

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["sh","-c","node node_modules/next/dist/bin/next start -p \"$PORT\""]