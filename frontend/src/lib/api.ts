import axios from 'axios';

// In production, NEXT_PUBLIC_API_BASE_URL should be set to the backend's public URL
// In development, NEXT_PUBLIC_BACKEND_HOST is set and we use Next.js proxy (/api)
// Otherwise, default to /api for local development
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

console.log('API Base URL:', baseURL);

const api = axios.create({
  baseURL,
});

export default api;
