# Production image for the AWS ECS Fargate target (see DEPLOYMENT.md "Why
# ECS Fargate" and infra/terraform/ecs.tf). Multi-stage build producing a
# minimal runtime image from Next.js's `output: "standalone"` trace (see
# next.config.ts) -- the final image ships only the traced node_modules
# subset + server.js, not the whole repo or a full npm install.
#
# Built and pushed by .github/workflows/deploy-production-aws.yml (the
# sandbox that prepares releases has no Docker daemon). The same image runs
# both the app (`node server.js`) and the one-off migration task
# (`node scripts/migrate.mjs`, see infra/terraform/ecs.tf).
#
# Build (from the repo root):
#   docker build -t manufacturing-os-app .
# Run locally against the dev/test fallback store:
#   docker run -p 3000:3000 -e RFQ_BACKEND=local manufacturing-os-app

# ---- deps: install once, reused by the build stage --------------------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build: full Next.js production build -------------------------------
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Placeholder values for anything next.config.ts / build-time code reads
# directly -- the REAL values are injected as ECS task-definition
# environment variables / secrets at container start (see
# infra/terraform/ecs.tf), never baked into the image.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runtime: minimal standalone server ---------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js standalone output doesn't copy public/ or .next/static by
# default (see node_modules/next/dist/docs/.../output.md) -- copy them in
# manually, same as the doc's own instructions.
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# Migration runner + SQL for the one-off ECS migration task. `pg` is
# already in the standalone node_modules (traced from lib/db/pg.ts).
COPY --from=build /app/scripts/migrate.mjs ./scripts/migrate.mjs
COPY --from=build /app/infra/sql ./infra/sql

# ISR cache (public pages revalidate every 300 s) is written under
# .next/server at runtime -- it must be writable by the non-root user.

# Run as a non-root user inside the container.
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs \
  && chown -R nextjs:nodejs /app/.next
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
