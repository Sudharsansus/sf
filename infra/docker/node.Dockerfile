# syntax=docker/dockerfile:1.7
# Shared image for api / worker-ai / worker-media. Workspace packages ship TypeScript
# source and run through tsx, so there is no separate build step.
#   docker build -f infra/docker/node.Dockerfile --build-arg APP=api -t isaii-api .
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /repo
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
ARG APP
COPY package.json package-lock.json turbo.json ./
COPY packages ./packages
COPY apps/${APP}/package.json ./apps/${APP}/package.json
RUN npm ci --workspace @isaii/${APP} --include-workspace-root=false --omit=dev --ignore-scripts

FROM base AS runtime
ARG APP
# ffmpeg + Noto fonts (all Indian scripts) only matter for worker-media, but are small enough to share.
RUN if [ "$APP" = "worker-media" ]; then \
      apt-get update && apt-get install -y --no-install-recommends ffmpeg fonts-noto-core fonts-noto-extra && rm -rf /var/lib/apt/lists/*; \
    fi
COPY --from=deps /repo/node_modules ./node_modules
COPY packages ./packages
COPY apps/${APP} ./apps/${APP}
USER node
WORKDIR /repo/apps/${APP}
ENV PORT=8080
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "--import", "tsx", "src/server.ts"]
