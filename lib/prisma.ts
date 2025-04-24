import { PrismaClient } from '@prisma/client';

// Declare global prisma type
declare global {
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
    // Add error handling for connection issues
    errorFormat: 'pretty',
  });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['error'],
      // Add error handling for connection issues
      errorFormat: 'pretty',
    });
  }
  prisma = global.prisma;
}

// Export the singleton instance
export default prisma; 