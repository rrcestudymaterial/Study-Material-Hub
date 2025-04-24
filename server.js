const express = require('express');
const cors = require('cors');
const path = require('path');
const prisma = require('./lib/prisma').default;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins in development
  credentials: true
}));
app.use(express.json());

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Test database connection with proper error handling
const testDatabaseConnection = async () => {
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database');
    return true;
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    return false;
  }
};

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint with database status
app.get('/api/health/db', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok',
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
  }
});

// API Routes
app.get('/api/materials', async (req, res) => {
  try {
    const { searchQuery, subject, semester, type } = req.query;
    
    // Build the where clause based on filters
    let whereClause = {};
    
    if (searchQuery) {
      whereClause.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }
    
    if (subject) {
      whereClause.categoryId = subject;
    }
    
    if (semester) {
      whereClause.semester = parseInt(semester);
    }
    
    if (type && type !== 'ALL') {
      whereClause.type = type;
    }

    // Fetch materials without nested relations to prevent circular references
    const materials = await prisma.material.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      // Explicitly select only the fields we need
      select: {
        id: true,
        title: true,
        description: true,
        fileUrl: true,
        type: true,
        tags: true,
        author: true,
        semester: true,
        categoryId: true,
        createdAt: true
      }
    });

    // Fetch categories separately to avoid circular references
    const categoryIds = [...new Set(materials.map(m => m.categoryId))];
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    // Create a map for quick lookup
    const categoryMap = {};
    categories.forEach(category => {
      categoryMap[category.id] = category.name;
    });

    // Map the database response to the frontend model
    const mappedMaterials = materials.map(material => ({
      id: material.id,
      title: material.title,
      description: material.description || '',
      subject: material.categoryId,
      semester: material.semester,
      type: material.type,
      link: material.fileUrl,
      tags: material.tags,
      uploadDate: material.createdAt.toISOString(),
      author: material.author
    }));

    res.json(mappedMaterials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({
      error: 'Failed to fetch materials',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.post('/api/materials', async (req, res) => {
  try {
    const material = req.body;
    
    // Validate required fields
    if (!material.title || !material.link || !material.type || !material.author || !material.semester || !material.subject) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'link', 'type', 'author', 'semester', 'subject']
      });
    }

    // Validate type
    if (!['PDF', 'VIDEO'].includes(material.type)) {
      return res.status(400).json({ 
        error: 'Invalid type',
        allowed: ['PDF', 'VIDEO']
      });
    }

    // Validate semester
    const semester = parseInt(material.semester);
    if (isNaN(semester) || semester < 1 || semester > 8) {
      return res.status(400).json({ 
        error: 'Invalid semester',
        allowed: '1-8'
      });
    }

    // Get or create default user
    let user = await prisma.user.findFirst({
      where: { email: 'default@example.com' }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'default@example.com',
          name: 'Default User'
        }
      });
    }

    // Get or create category
    let category = await prisma.category.findFirst({
      where: { name: material.subject }
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: material.subject,
          description: `Category for ${material.subject}`
        }
      });
    }

    // Create the material
    const newMaterial = await prisma.material.create({
      data: {
        title: material.title,
        description: material.description || '',
        fileUrl: material.link,
        type: material.type,
        tags: material.tags || [],
        author: material.author,
        semester: semester,
        userId: user.id,
        categoryId: category.id
      }
    });

    const mappedMaterial = {
      id: newMaterial.id,
      title: newMaterial.title,
      description: newMaterial.description || '',
      subject: newMaterial.categoryId,
      semester: newMaterial.semester,
      type: newMaterial.type,
      link: newMaterial.fileUrl,
      tags: newMaterial.tags,
      uploadDate: newMaterial.createdAt.toISOString(),
      author: newMaterial.author
    };

    res.status(201).json(mappedMaterial);
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({ 
      error: 'Failed to create material',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.delete('/api/materials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.material.delete({
      where: { id },
    });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ 
      error: 'Failed to delete material',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the dist directory
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ error: 'API endpoint not found' });
      return;
    }
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start the server with error handling
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.error('Cannot start server without database connection');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    // Don't exit immediately, give time for logs to be written
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Closing database connection...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Closing database connection...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer(); 