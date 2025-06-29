import axios from 'axios';

// If NEXT_PUBLIC_BACKEND_HOST is set, we use Next.js proxy (/api)
// If NEXT_PUBLIC_API_BASE_URL is set, we use that directly (for production)
// Otherwise, default to /api for local development
const baseURL = process.env.NEXT_PUBLIC_BACKEND_HOST 
  ? '/api' 
  : (process.env.NEXT_PUBLIC_API_BASE_URL || '/api');

console.log('API Base URL:', baseURL);

const api = axios.create({
  baseURL,
});

export default api;
