# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy application code
COPY src ./src
COPY .env ./.env.example ./

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Create init script
RUN cat > /app/init.sh << 'EOF'
#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
while ! nc -z $DATABASE_HOST 5432; do
  sleep 1
done
echo "PostgreSQL is ready!"

echo "Waiting for Redis..."
while ! nc -z $REDIS_HOST 6379; do
  sleep 1
done
echo "Redis is ready!"

echo "Running migrations..."
npx prisma migrate deploy

echo "Seeding database..."
node src/prisma/seed.js

echo "Starting application..."
node src/app.js
EOF

RUN chmod +x /app/init.sh

# Install netcat for health checks
RUN apk add --no-cache netcat

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

CMD ["/app/init.sh"]
