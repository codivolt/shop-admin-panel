# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY admin_panel/package.json admin_panel/pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY admin_panel/ ./
RUN pnpm run build

# Production stage with nginx
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY admin_panel/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]