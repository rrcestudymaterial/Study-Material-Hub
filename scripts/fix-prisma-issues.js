/**
 * Prisma Issue Diagnosis and Fix Script
 * 
 * This script helps diagnose and fix common Prisma issues,
 * including the "Maximum call stack size exceeded" error.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosing Prisma issues...');

// Check if Prisma is installed
try {
  console.log('Checking Prisma installation...');
  execSync('npx prisma --version', { stdio: 'inherit' });
  console.log('✅ Prisma is installed correctly');
} catch (error) {
  console.error('❌ Prisma is not installed or there is an issue with the installation');
  console.error('Try running: npm install prisma @prisma/client');
  process.exit(1);
}

// Regenerate Prisma client
try {
  console.log('\nRegenerating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client regenerated successfully');
} catch (error) {
  console.error('❌ Failed to regenerate Prisma client');
  console.error(error.message);
  process.exit(1);
}

// Check for schema issues
try {
  console.log('\nValidating Prisma schema...');
  execSync('npx prisma validate', { stdio: 'inherit' });
  console.log('✅ Prisma schema is valid');
} catch (error) {
  console.error('❌ Prisma schema has issues');
  console.error(error.message);
  process.exit(1);
}

// Check for database connection
try {
  console.log('\nTesting database connection...');
  execSync('npx prisma db pull --print', { stdio: 'inherit' });
  console.log('✅ Database connection successful');
} catch (error) {
  console.error('❌ Failed to connect to the database');
  console.error('Check your DATABASE_URL in .env file');
  console.error(error.message);
  process.exit(1);
}

// Check for circular references in schema
console.log('\nChecking for potential circular references...');
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Simple check for potential circular references
  const modelRegex = /model\s+(\w+)\s*{([^}]*)}/g;
  const models = [];
  let match;
  
  while ((match = modelRegex.exec(schema)) !== null) {
    const modelName = match[1];
    const modelContent = match[2];
    models.push({ name: modelName, content: modelContent });
  }
  
  let hasCircularReferences = false;
  
  for (const model of models) {
    for (const otherModel of models) {
      if (model.name !== otherModel.name) {
        // Check if this model references the other model and vice versa
        if (
          model.content.includes(`@relation(fields: [${otherModel.name.toLowerCase()}Id]`) &&
          otherModel.content.includes(`@relation(fields: [${model.name.toLowerCase()}Id]`)
        ) {
          console.warn(`⚠️ Potential circular reference detected between ${model.name} and ${otherModel.name}`);
          hasCircularReferences = true;
        }
      }
    }
  }
  
  if (!hasCircularReferences) {
    console.log('✅ No obvious circular references detected in schema');
  }
}

// Provide recommendations
console.log('\n📋 Recommendations to prevent "Maximum call stack size exceeded" error:');
console.log('1. Use explicit select/include in queries to avoid circular references');
console.log('2. Break complex queries into smaller, simpler ones');
console.log('3. Use pagination for large datasets');
console.log('4. Limit nesting depth in queries');
console.log('5. Use transactions for multiple related operations');
console.log('6. Ensure proper error handling with try/catch blocks');
console.log('7. Disconnect from the database properly when shutting down');
console.log('8. Use Prisma\'s built-in methods instead of custom implementations');
console.log('9. Check for infinite recursion in your application code');
console.log('10. Update to the latest version of Prisma');

console.log('\n✅ Diagnosis complete!');
console.log('If you\'re still experiencing issues, check the Prisma documentation:');
console.log('https://www.prisma.io/docs/'); 