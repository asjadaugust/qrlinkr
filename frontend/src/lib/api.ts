import axios from 'axios';
import { AxiosInstance } from 'axios';

// Extended API client type with additional helper methods
interface ExtendedAxiosInstance extends AxiosInstance {
  getBaseUrl: () => string;
  safeDelete: (url: string) => Promise<unknown>;
}

// Type for the runtime config
declare global {
  interface Window {
    __QRLINKR_CONFIG__?: {
      apiBaseUrl?: string;
    };
  }
}

// Get API base URL from runtime environment variables
function getApiBaseUrl(): string {
  // For server-side rendering in production, use backend service directly
  if (typeof window === 'undefined') {
    if (process.env.NODE_ENV === 'production') {
      // In Docker, use the backend service name
      console.log('Server-side: Using Docker backend service URL');
      return 'http://backend:3001';
    }
    // In development, use localhost for SSR
    console.log('Server-side: Using localhost for development');
    return 'http://localhost:3001';
  }

  // Client-side: First check build-time environment variable
  const buildTimeUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (buildTimeUrl && buildTimeUrl !== '/api') {
    console.log(
      'Client-side: Using build-time NEXT_PUBLIC_API_BASE_URL:',
      buildTimeUrl
    );
    return buildTimeUrl;
  }

  // Client-side: check if config was loaded from /config.js
  const config = window.__QRLINKR_CONFIG__;
  if (
    config?.apiBaseUrl &&
    config.apiBaseUrl !== '/api' &&
    config.apiBaseUrl !== '__API_BASE_URL_PLACEHOLDER__'
  ) {
    console.log(
      'Client-side: Using runtime config API base URL:',
      config.apiBaseUrl
    );
    return config.apiBaseUrl;
  }

  // Fallback to Next.js proxy only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Client-side: Using Next.js proxy for development: /api');
    return '/api';
  }

  // In production without runtime config, this should not happen
  console.error('Client-side: No API base URL configured in production!');
  return '/api'; // Last resort fallback
}

// Export the base URL function for direct use in components
export function getBaseUrl(): string {
  return getApiBaseUrl();
}

// Create axios instance with initial base URL
const api: ExtendedAxiosInstance = axios.create({
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
  baseURL: getApiBaseUrl(), // Set initial base URL
}) as ExtendedAxiosInstance;

// Simple initialization function
function initializeApi(): string {
  const baseURL = getApiBaseUrl();
  api.defaults.baseURL = baseURL;
  
  console.log('=== API Client Configuration ===');
  console.log('Final API Base URL:', baseURL);
  console.log('Is using Next.js proxy:', baseURL === '/api');
  console.log('================================');

  return baseURL;
}

// Initialize immediately
initializeApi();

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making API request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(
      `API response from: ${response.config.url} - Status: ${response.status}`
    );
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(
        `API error from: ${error.config?.url}`,
        `Status: ${error.response.status}`,
        `Data:`,
        error.response.data
      );
    } else if (error.request) {
      // The request was made but no response was received
      console.error(
        `API error: No response received from: ${error.config?.url}`,
        error.request
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error(
        `API error setting up request: ${error.config?.url}`,
        error.message
      );
    }
    return Promise.reject(error);
  }
);

// Add the getBaseUrl method to the api object
api.getBaseUrl = getBaseUrl;

// Add explicit methods for handling errors gracefully
api.safeDelete = async (url: string) => {
  try {
    console.log(`Attempting to delete: ${url}`);
    const response = await api.delete(url);
    console.log(`Delete successful: ${url}`);
    return response;
  } catch (error: unknown) {
    console.error(`Safe delete failed for ${url}:`, error);

    // Provide more detailed error information
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      console.error(
        'Error response:',
        axiosError.response?.status,
        axiosError.response?.data
      );
      throw new Error(
        `Delete failed: ${axiosError.response?.status} - ${
          axiosError.response?.data?.message || 'Unknown error'
        }`
      );
    } else if (error && typeof error === 'object' && 'request' in error) {
      console.error(
        'No response received:',
        (error as { request?: unknown }).request
      );
      throw new Error('Network error: No response from server');
    } else {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Request setup error:', errorMessage);
      throw new Error(`Request error: ${errorMessage}`);
    }
  }
};

export default api;
