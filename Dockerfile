## Multi-stage Dockerfile for Augment UI (Vue 3 + Vite)
# Stage 1: Build the static assets with Node
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time environment (used by Vite via import.meta.env)
# These are optional; if not provided, app falls back to defaults (see env.example).
ARG VITE_API_BASE_URL
ARG VITE_ENVIRONMENT
ARG VITE_DEFAULT_LLM_PROVIDER
ARG VITE_DEFAULT_LLM_MODEL

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_ENVIRONMENT=$VITE_ENVIRONMENT \
    VITE_DEFAULT_LLM_PROVIDER=$VITE_DEFAULT_LLM_PROVIDER \
    VITE_DEFAULT_LLM_MODEL=$VITE_DEFAULT_LLM_MODEL

# Install dependencies based on lockfile for reproducible builds
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and build
COPY . .
RUN npm run build


# Stage 2: Serve the built assets with nginx
FROM nginx:1.27-alpine AS runner

# Where nginx will serve files from
WORKDIR /usr/share/nginx/html

# Clean default nginx static content
RUN rm -rf ./*

# Copy built frontend from the builder stage
COPY --from=builder /app/dist ./

# Replace default nginx config with one suitable for a SPA (Vue Router history mode)
RUN rm /etc/nginx/conf.d/default.conf && \
    printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


