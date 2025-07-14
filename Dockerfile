# Use official Node.js image
FROM node:18

# Set working directory to /app
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY prisma ./prisma

# Copy the entire server directory (including src, tsconfig.json, etc.)
COPY server ./server

# Install root dependencies (including Prisma)
RUN npm install

# Install backend dependencies
WORKDIR /app/server
RUN npm install

# Build backend (if using TypeScript)
RUN npm run build

# Expose backend port
EXPOSE 3001

# Set environment variable for Prisma to find the schema
ENV PRISMA_SCHEMA_PATH=/app/prisma/schema.prisma

# Start backend only
CMD ["npm", "start"] 