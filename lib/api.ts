import { StudyMaterial } from '../types/StudyMaterial';

// In development, the Vite dev server will proxy /api requests to http://localhost:3001
// In production, /api requests will be handled by the Express server directly
const API_URL = '/api';

export const studyMaterialApi = {
  // Create a new study material
  async create(material: Omit<StudyMaterial, 'id' | 'uploadDate'>) {
    const response = await fetch(`${API_URL}/materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(material),
    });

    if (!response.ok) {
      throw new Error('Failed to create material');
    }

    return response.json();
  },

  // Get all study materials
  async getAll() {
    const response = await fetch(`${API_URL}/materials`);

    if (!response.ok) {
      throw new Error('Failed to fetch materials');
    }

    return response.json();
  },

  // Get study materials by filters
  async getByFilters(filters: {
    searchQuery?: string;
    subject?: string;
    semester?: string;
    type?: 'ALL' | 'PDF' | 'VIDEO';
  }) {
    const queryParams = new URLSearchParams();
    
    if (filters.searchQuery) {
      queryParams.append('searchQuery', filters.searchQuery);
    }
    
    if (filters.subject) {
      queryParams.append('subject', filters.subject);
    }
    
    if (filters.semester) {
      queryParams.append('semester', filters.semester);
    }
    
    if (filters.type && filters.type !== 'ALL') {
      queryParams.append('type', filters.type);
    }

    const response = await fetch(`${API_URL}/materials?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch materials');
    }

    return response.json();
  },

  // Delete a study material
  async delete(id: string) {
    const response = await fetch(`${API_URL}/materials/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete material');
    }

    return response.json();
  },
};
