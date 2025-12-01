// API Configuration
// In production (Vercel), use the Vercel URL automatically
// In development, use localhost:3000 (where Vite dev server runs with API proxy)
const isDevelopment = import.meta.env.DEV;
const productionUrl = import.meta.env.VITE_VERCEL_URL
    ? `https://${import.meta.env.VITE_VERCEL_URL}`
    : window.location.origin;

export const API_BASE_URL = isDevelopment
    ? ''
    : productionUrl;

// Helper function for making API calls
export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;
