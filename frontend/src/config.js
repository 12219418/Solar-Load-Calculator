/**
 * Application configuration
 * Handles API URL resolution for dev (proxy) and production environments.
 */

const getApiUrl = () => {
  // In production, the React app will be served by the Flask backend
  // or deployed separately – use the environment variable if set.
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In dev mode, Vite proxies /api to the Flask server
  return '';
};

export const API_URL = getApiUrl();
