import { StudyMaterial } from '../types/StudyMaterial';

// In development, the Vite dev server will proxy /api requests to http://localhost:3001
// In production, /api requests will be handled by the Express server directly
const API_URL = '/api';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const studyMaterialApi = {
  // Create a new study material
  async create(material: Omit<StudyMaterial, 'id' | 'uploadDate'>) {
    const response = await fetch(`${API_URL}/materials`, {
      method: 'POST',
      headers: defaultHeaders,
      credentials: 'include',
      body: JSON.stringify(material),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Failed to create material',
        response.status,
        data.details
      );
    }

    return data;
  },

  // Get all study materials
  async getAll() {
    const response = await fetch(`${API_URL}/materials`, {
      headers: defaultHeaders,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error Response:', data);
      throw new ApiError(
        data.error || 'Failed to fetch materials',
        response.status,
        {
          message: data.message,
          details: data.details
        }
      );
    }

    return data;
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

    const response = await fetch(`${API_URL}/materials?${queryParams.toString()}`, {
      headers: defaultHeaders,
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new ApiError(
        data.error || 'Failed to fetch materials',
        response.status,
        data.details
      );
    }

    return response.json();
  },

  // Delete a study material
  async delete(id: string) {
    const response = await fetch(`${API_URL}/materials/${id}`, {
      method: 'DELETE',
      headers: defaultHeaders,
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new ApiError(
        data.error || 'Failed to delete material',
        response.status,
        data.details
      );
    }

    return response.json();
  },
};
