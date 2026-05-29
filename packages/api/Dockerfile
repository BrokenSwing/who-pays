FROM node:22-alpine
RUN corepack enable pnpm
WORKDIR /app

# Install deps (layer is cached unless package files change)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/api/package.json ./packages/api/
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/tsconfig.json
COPY packages/api/src ./packages/api/src
COPY packages/api/tsconfig.json ./packages/api/tsconfig.json

ENV NODE_ENV=production
EXPOSE 3000
CMD ["packages/api/node_modules/.bin/tsx", "packages/api/src/main.ts"]
