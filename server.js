const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const path = require('path');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-vercel-domain.vercel.app' 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.get('/api/materials', async (req, res) => {
  try {
    const { searchQuery, subject, semester, type } = req.query;
    
    // Build the where clause based on filters using Object.assign
    const where = Object.assign({}, 
      searchQuery && {
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
        ]
      },
      subject && { categoryId: subject },
      semester && { semester: parseInt(semester) },
      type && type !== 'ALL' && { type }
    );

    const materials = await prisma.material.findMany({
      where,
      include: {
        category: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
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
      details: error.message,
      code: error.code
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
      details: error.message,
      code: error.code
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
      details: error.message,
      code: error.code
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something broke!',
    details: err.message,
    code: err.code
  });
});

// Start the server with error handling
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connection successful');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 