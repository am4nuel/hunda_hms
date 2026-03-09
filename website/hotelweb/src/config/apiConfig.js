export const apiConfig = {
  apiKey: import.meta.env.VITE_API_KEY || 'hk_c3z3q3a93th2ypglekdfkd',
  apiUrl: import.meta.env.VITE_API_URL || 'https://hundahms-production.up.railway.app/api',
  baseUrl: (import.meta.env.VITE_API_URL || 'https://hundahms-production.up.railway.app/api').replace('/api', ''),
};

export default apiConfig;
