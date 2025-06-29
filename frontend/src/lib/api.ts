import axios from 'axios';

// Type for the runtime config
declare global {
  interface Window {
    __QRLINKR_CONFIG__?: {
      apiBaseUrl?: string;
    };
  }
}

let isInitialized = false;
let configPromise: Promise<void> | null = null;

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

  // Client-side: check if config was loaded from /config.js
  const config = window.__QRLINKR_CONFIG__;
  if (config?.apiBaseUrl && config.apiBaseUrl !== '/api' && config.apiBaseUrl !== '__API_BASE_URL_PLACEHOLDER__') {
    console.log('Client-side: Using runtime config API base URL:', config.apiBaseUrl);
    return config.apiBaseUrl;
  }

  // Check build-time environment variable
  const buildTimeUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (buildTimeUrl && buildTimeUrl !== '/api') {
    console.log('Client-side: Using build-time NEXT_PUBLIC_API_BASE_URL:', buildTimeUrl);
    return buildTimeUrl;
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

// Wait for runtime config to be available
function waitForConfig(): Promise<void> {
  if (typeof window === 'undefined') {
    // Server-side: config not needed
    return Promise.resolve();
  }

  if (window.__QRLINKR_CONFIG__) {
    // Config already available
    return Promise.resolve();
  }

  if (configPromise) {
    // Already waiting for config
    return configPromise;
  }

  configPromise = new Promise((resolve) => {
    // Check for config periodically
    const checkConfig = () => {
      if (window.__QRLINKR_CONFIG__) {
        console.log('Runtime config detected:', window.__QRLINKR_CONFIG__);
        resolve();
      } else {
        setTimeout(checkConfig, 50);
      }
    };
    
    // Start checking immediately
    checkConfig();
    
    // Also listen for DOMContentLoaded in case we're very early
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkConfig);
    }
  });

  return configPromise;
}

// Create axios instance with initial base URL
const api = axios.create({
  timeout: 10000, // 10 second timeout
});

// Function to initialize or update the API base URL
async function initializeApi(): Promise<string> {
  // Wait for config to be available on client-side
  await waitForConfig();
  
  const baseURL = getApiBaseUrl();
  
  console.log('=== API Client Configuration ===');
  console.log('Final API Base URL:', baseURL);
  console.log('Is using Next.js proxy:', baseURL === '/api');
  console.log('================================');
  
  // Update the axios instance with the correct base URL
  api.defaults.baseURL = baseURL;
  isInitialized = true;
  
  return baseURL;
}

// Initialize for server-side rendering (uses defaults)
if (typeof window === 'undefined') {
  api.defaults.baseURL = getApiBaseUrl();
  isInitialized = true;
}

// Add request interceptor to ensure initialization and debugging
api.interceptors.request.use(
  async (config) => {
    // ALWAYS re-check for runtime config on client-side before each request
    if (typeof window !== 'undefined') {
      const runtimeConfig = window.__QRLINKR_CONFIG__;
      if (runtimeConfig?.apiBaseUrl && 
          runtimeConfig.apiBaseUrl !== '/api' && 
          runtimeConfig.apiBaseUrl !== '__API_BASE_URL_PLACEHOLDER__') {
        // Use runtime config if available
        config.baseURL = runtimeConfig.apiBaseUrl;
        console.log('🔄 Interceptor: Using runtime config for request:', runtimeConfig.apiBaseUrl);
      } else {
        console.log('⚠️ Interceptor: No runtime config found, attempting initialization');
        if (!isInitialized) {
          console.log('Initializing API client before request...');
          await initializeApi();
        }
      }
    }
    
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
    console.log(`API response from: ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`API error from: ${error.config?.url}`, error.message);
    return Promise.reject(error);
  }
);

// Ensure API is initialized on client-side when module loads
if (typeof window !== 'undefined') {
  initializeApi().catch(console.error);
}

export default api;
