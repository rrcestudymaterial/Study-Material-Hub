import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a single PrismaClient instance with proper configuration
const prisma = global.prisma || new PrismaClient({
  log: ['error'],
  // Add error handling for connection issues
  errorFormat: 'pretty',
});

// In development, store the instance in the global scope
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Export the singleton instance
export default prisma; 