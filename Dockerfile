FROM node:20-alpine

WORKDIR /app

# Install required packages
# RUN apk add --no-cache dumb-init netcat-openbsd
RUN apk add --no-cache \
    dumb-init \
    netcat-openbsd \
    openssl

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy application
COPY src ./src

# Generate Prisma Client
RUN npx prisma generate --schema=src/prisma/schema.prisma

ENV NODE_ENV=production

EXPOSE 3000

# HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
# CMD node -e "require('http').get('http://localhost:3000/health',(r)=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "src/server.js"]