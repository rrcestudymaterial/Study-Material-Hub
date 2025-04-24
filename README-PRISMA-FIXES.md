# Fixing Prisma Issues in Study Material Hub

This document provides solutions for common Prisma issues, including the "Maximum call stack size exceeded" error and deployment problems.

## 1. Maximum Call Stack Size Exceeded Error

This error typically occurs when there's a circular reference in your data model or when dealing with deeply nested queries.

### Solution:

1. **Use Explicit Field Selection**: When querying related data, always use `select` or `include` with explicit field selection to avoid circular references.

   ```javascript
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
   ```

2. **Break Complex Queries**: Instead of deeply nested queries, break them into multiple simpler queries.

   ```javascript
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
   ```

3. **Use Pagination**: Always use pagination when fetching potentially large datasets.

   ```javascript
   const materials = await prisma.material.findMany({
     take: 10,
     skip: 0,
     orderBy: { createdAt: 'desc' }
   });
   ```

4. **Limit Nesting Depth**: Limit the nesting depth of your queries to prevent stack overflow.

   ```javascript
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
   ```

5. **Run the Diagnosis Tool**: If you encounter the error again, run `npm run prisma:fix` to diagnose and fix the issue.

## 2. Deployment Issues

### SyntaxError: Cannot use import statement outside a module

This error occurs when you're using ES modules syntax (`import`) in a CommonJS environment.

### Solution:

1. **Use CommonJS Syntax**: Convert your Prisma client initialization to use CommonJS syntax.

   ```javascript
   // lib/prisma.js
   const { PrismaClient } = require('@prisma/client');

   // Prevent multiple instances of Prisma Client in development
   let prisma;

   if (process.env.NODE_ENV === 'production') {
     prisma = new PrismaClient({
       log: ['error'],
       errorFormat: 'pretty',
     });
   } else {
     if (!global.prisma) {
       global.prisma = new PrismaClient({
         log: ['error'],
         errorFormat: 'pretty',
       });
     }
     prisma = global.prisma;
   }

   // Export the singleton instance
   module.exports = prisma;
   ```

2. **Update Server.js**: Update your server.js file to use the CommonJS version of the Prisma client.

   ```javascript
   const prisma = require('./lib/prisma');
   ```

3. **Add Postinstall Script**: Add a postinstall script to your package.json to ensure Prisma client is generated after installation.

   ```json
   "scripts": {
     "postinstall": "prisma generate"
   }
   ```

4. **Use Vercel Configuration**: Use the provided vercel.json file to configure your deployment.

## 3. Additional Best Practices

1. **Use Transactions**: When performing multiple related operations, use transactions.

   ```javascript
   await prisma.$transaction(async (tx) => {
     const user = await tx.user.create({ /* ... */ });
     await tx.material.create({
       data: {
         /* ... */,
         userId: user.id
       }
     });
   });
   ```

2. **Proper Error Handling**: Always use try/catch blocks and handle errors properly.

   ```javascript
   try {
     const result = await prisma.material.findMany({ /* ... */ });
     return result;
   } catch (error) {
     console.error('Database error:', error);
     // Handle the error appropriately
     throw new Error('Failed to fetch materials');
   }
   ```

3. **Disconnect Properly**: Always disconnect from the database when shutting down.

   ```javascript
   process.on('SIGINT', async () => {
     await prisma.$disconnect();
     process.exit(0);
   });
   ```

4. **Use Prisma's Built-in Methods**: Use Prisma's built-in methods instead of custom implementations.

   ```javascript
   // GOOD - Using Prisma's built-in methods
   const count = await prisma.material.count();

   // BAD - Custom implementation that might cause recursion
   const materials = await prisma.material.findMany();
   const count = materials.length;
   ```

## 4. Troubleshooting

If you're still experiencing issues, try the following:

1. **Regenerate Prisma Client**: Run `npm run prisma:generate` to ensure your client is up to date.

2. **Check for Circular References**: Review your schema and queries for potential circular references.

3. **Update Prisma**: Make sure you're using the latest version of Prisma.

4. **Check Database Connection**: Ensure your database connection string is correct.

5. **Run the Diagnosis Tool**: Run `npm run prisma:fix` to diagnose and fix the issue.

6. **Check Deployment Logs**: Check the deployment logs for any errors.

7. **Contact Support**: If all else fails, contact Prisma support or check their documentation. 