# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Accept build args and set as environment variables
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

ARG VITE_BOT_USERNAME
ENV VITE_BOT_USERNAME=${VITE_BOT_USERNAME}

# Build
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
