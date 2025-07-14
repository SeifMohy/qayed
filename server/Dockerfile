# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies needed for pdf-lib and other native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

# Copy package files first for better caching (from server directory)
COPY server/package*.json ./

# Install all dependencies first (needed for build process)  
RUN npm ci && npm cache clean --force

# Copy prisma schema from root
COPY prisma ./prisma

# Copy server source code and config files
COPY server/src ./src
COPY server/tsconfig.json ./tsconfig.json

# Build the TypeScript application with explicit schema path
RUN npx prisma generate --schema=./prisma/schema.prisma && npx tsc

# Remove devDependencies and reinstall only production dependencies
RUN rm -rf node_modules && npm ci --only=production && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"] 