import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create Prisma client with build-time safety
function createPrismaClient() {
  // Skip during build time if no database URL is available
  if (typeof window === 'undefined' && 
      process.env.NODE_ENV === 'production' && 
      !process.env.DATABASE_URL) {
    return null;
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma = 
  globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}

// Utility function to check if database operations are safe
export function isDatabaseAvailable(): boolean {
  return prisma !== null;
}

// Utility function to handle build-time database unavailability in API routes
export function handleBuildTimeUnavailability(): NextResponse | null {
  if (!isDatabaseAvailable()) {
    return NextResponse.json(
      { success: false, error: 'Service temporarily unavailable during build' },
      { status: 503 }
    );
  }
  return null;
} 