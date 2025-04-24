/**
 * Prisma Best Practices to Prevent Stack Overflow Errors
 * 
 * This file contains best practices for using Prisma in your application
 * to prevent the "Maximum call stack size exceeded" error.
 */

// 1. SINGLETON PATTERN
// Always use a singleton pattern for Prisma client to prevent multiple instances
// This is already implemented in lib/prisma.ts

// 2. AVOID CIRCULAR REFERENCES
// When querying related data, use explicit select/include to avoid circular references
// Example:
/*
// GOOD - Explicitly select fields
const materials = await prisma.material.findMany({
  select: {
    id: true,
    title: true,
    // Only include necessary fields
  }
});

// BAD - This can cause circular references
const materials = await prisma.material.findMany({
  include: {
    user: true,
    category: true
    // This can lead to circular references if user or category also include materials
  }
});
*/

// 3. USE PAGINATION FOR LARGE DATASETS
// Always use pagination when fetching potentially large datasets
// Example:
/*
const materials = await prisma.material.findMany({
  take: 10,
  skip: 0,
  orderBy: { createdAt: 'desc' }
});
*/

// 4. BREAK COMPLEX QUERIES INTO SMALLER ONES
// Instead of deeply nested queries, break them into multiple simpler queries
// Example:
/*
// GOOD - Separate queries
const materials = await prisma.material.findMany({ /* ... */ });
const categoryIds = [...new Set(materials.map(m => m.categoryId))];
const categories = await prisma.category.findMany({
  where: { id: { in: categoryIds } }
});

// BAD - Deeply nested query
const materials = await prisma.material.findMany({
  include: {
    category: {
      include: {
        materials: {
          include: {
            user: true
          }
        }
      }
    }
  }
});
*/

// 5. USE TRANSACTIONS FOR MULTIPLE OPERATIONS
// When performing multiple related operations, use transactions
// Example:
/*
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ /* ... */ });
  await tx.material.create({
    data: {
      /* ... */,
      userId: user.id
    }
  });
});
*/

// 6. PROPER ERROR HANDLING
// Always use try/catch blocks and handle errors properly
// Example:
/*
try {
  const result = await prisma.material.findMany({ /* ... */ });
  return result;
} catch (error) {
  console.error('Database error:', error);
  // Handle the error appropriately
  throw new Error('Failed to fetch materials');
}
*/

// 7. DISCONNECT PROPERLY
// Always disconnect from the database when shutting down
// Example:
/*
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
*/

// 8. USE RAW QUERIES SPARINGLY
// Avoid complex raw queries that might cause recursion
// Example:
/*
// GOOD - Simple raw query
await prisma.$queryRaw`SELECT 1`;

// BAD - Complex raw query with potential recursion
await prisma.$queryRaw`
  WITH RECURSIVE cte AS (
    SELECT * FROM "Material" WHERE "categoryId" = $1
    UNION ALL
    SELECT m.* FROM "Material" m
    JOIN cte ON m."categoryId" = cte."id"
  )
  SELECT * FROM cte
`;
*/

// 9. LIMIT NESTING DEPTH
// Limit the nesting depth of your queries to prevent stack overflow
// Example:
/*
// GOOD - Limited nesting
const result = await prisma.material.findMany({
  include: {
    category: true
  }
});

// BAD - Excessive nesting
const result = await prisma.material.findMany({
  include: {
    category: {
      include: {
        materials: {
          include: {
            category: {
              include: {
                materials: true
              }
            }
          }
        }
      }
    }
  }
});
*/

// 10. USE PRISMA'S BUILT-IN METHODS
// Use Prisma's built-in methods instead of custom implementations
// Example:
/*
// GOOD - Using Prisma's built-in methods
const count = await prisma.material.count();

// BAD - Custom implementation that might cause recursion
const materials = await prisma.material.findMany();
const count = materials.length;
*/ 