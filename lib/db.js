const { PrismaClient } = require('@prisma/client');

// Prevent multiple instances of Prisma Client in development
let prisma;

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
module.exports = prisma; 