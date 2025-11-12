# Multi-stage build for optimized production image

# Stage 1: Dependencies
FROM public.ecr.aws/docker/library/node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM public.ecr.aws/docker/library/node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_KEYCLOAK_URL
ARG NEXT_PUBLIC_KEYCLOAK_REALM
ARG NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
ARG NEXT_PUBLIC_API_BASE_URL

# (tip) Une estos echos en una sola capa
RUN echo "🔧 BUILD ARGS DEBUG:" \
 && echo "KEYCLOAK_URL: $NEXT_PUBLIC_KEYCLOAK_URL" \
 && echo "KEYCLOAK_REALM: $NEXT_PUBLIC_KEYCLOAK_REALM" \
 && echo "KEYCLOAK_CLIENT_ID: $NEXT_PUBLIC_KEYCLOAK_CLIENT_ID" \
 && echo "API_BASE_URL: $NEXT_PUBLIC_API_BASE_URL"

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_KEYCLOAK_URL=$NEXT_PUBLIC_KEYCLOAK_URL
ENV NEXT_PUBLIC_KEYCLOAK_REALM=$NEXT_PUBLIC_KEYCLOAK_REALM
ENV NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=$NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

RUN npm run build

# Stage 3: Runner (Production)
FROM public.ecr.aws/docker/library/node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
