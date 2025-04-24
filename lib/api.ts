import prisma from './prisma';
import { StudyMaterial } from '../types/StudyMaterial';

export const studyMaterialApi = {
  // Create a new study material
  async create(material: Omit<StudyMaterial, 'id' | 'uploadDate'>) {
    return prisma.material.create({
      data: {
        title: material.title,
        description: material.description,
        fileUrl: material.link,
        userId: 'default-user', // You can replace this with actual user ID when auth is implemented
        categoryId: material.subject, // Using subject as category
        type: material.type,
        tags: material.tags,
        author: material.author,
        semester: material.semester,
      },
    });
  },

  // Get all study materials
  async getAll() {
    return prisma.material.findMany({
      include: {
        category: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Get study materials by filters
  async getByFilters(filters: {
    searchQuery?: string;
    subject?: string;
    semester?: string;
    type?: 'ALL' | 'PDF' | 'VIDEO';
  }) {
    const where: any = {};

    if (filters.searchQuery) {
      where.OR = [
        { title: { contains: filters.searchQuery, mode: 'insensitive' } },
        { description: { contains: filters.searchQuery, mode: 'insensitive' } },
      ];
    }

    if (filters.subject) {
      where.categoryId = filters.subject;
    }

    if (filters.semester) {
      where.semester = parseInt(filters.semester);
    }

    if (filters.type && filters.type !== 'ALL') {
      where.type = filters.type;
    }

    return prisma.material.findMany({
      where,
      include: {
        category: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Delete a study material
  async delete(id: string) {
    return prisma.material.delete({
      where: { id },
    });
  },
};
