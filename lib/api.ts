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

const handleApiResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(
      data.error || 'API request failed',
      response.status,
      {
        message: data.message,
        details: data.details
      }
    );
  }
  
  return data;
};

export const studyMaterialApi = {
  // Check API health
  async checkHealth() {
    try {
      const response = await fetch(`${API_URL}/health`, {
        headers: defaultHeaders,
        credentials: 'include',
      });

      return handleApiResponse(response);
    } catch (error) {
      console.error('Error in health check:', error);
      throw error;
    }
  },

  // Check database health
  async checkDbHealth() {
    try {
      const response = await fetch(`${API_URL}/health/db`, {
        headers: defaultHeaders,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || 'Database health check failed',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      console.error('Error in database health check:', error);
      throw error;
    }
  },

  // Create a new study material
  async create(material: Omit<StudyMaterial, 'id' | 'uploadDate'>) {
    try {
      const response = await fetch(`${API_URL}/materials`, {
        method: 'POST',
        headers: defaultHeaders,
        credentials: 'include',
        body: JSON.stringify(material),
      });

      return handleApiResponse(response);
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  },

  // Get all study materials
  async getAll() {
    try {
      const response = await fetch(`${API_URL}/materials`, {
        headers: defaultHeaders,
        credentials: 'include',
      });

      return handleApiResponse(response);
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
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
    try {
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

      // Don't try to parse response as JSON for 204 No Content
      if (response.status !== 204) {
        return response.json();
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  },
};
