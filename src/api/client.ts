import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://study-material-hub.vercel.app/api'
  : 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data?.message || error.response.data?.error || 'An error occurred';
      const errorDetails = error.response.data?.details || '';
      const errorCode = error.response.data?.code || '';
      
      console.error('API Error:', {
        status: error.response.status,
        message: errorMessage,
        details: errorDetails,
        code: errorCode,
        data: error.response.data
      });

      // Create a more detailed error object
      const enhancedError = new Error(errorMessage);
      enhancedError.name = 'APIError';
      (enhancedError as any).status = error.response.status;
      (enhancedError as any).details = errorDetails;
      (enhancedError as any).code = errorCode;
      (enhancedError as any).data = error.response.data;
      
      throw enhancedError;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request);
      const networkError = new Error('Network error - no response received from server');
      networkError.name = 'NetworkError';
      throw networkError;
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request Error:', error.message);
      const requestError = new Error(`Request error: ${error.message}`);
      requestError.name = 'RequestError';
      throw requestError;
    }
  }
);

export const fetchMaterials = async (params?: {
  searchQuery?: string;
  subject?: string;
  semester?: number;
  type?: string;
}) => {
  try {
    const response = await apiClient.get('/materials', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching materials:', error);
    throw error;
  }
};

export const createMaterial = async (material: {
  title: string;
  description?: string;
  link: string;
  type: string;
  author: string;
  semester: number;
  subject: string;
  tags?: string[];
}) => {
  try {
    const response = await apiClient.post('/materials', material);
    return response.data;
  } catch (error) {
    console.error('Error creating material:', error);
    throw error;
  }
};

export const deleteMaterial = async (id: string) => {
  try {
    await apiClient.delete(`/materials/${id}`);
  } catch (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
};

export default apiClient; 