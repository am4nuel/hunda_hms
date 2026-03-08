export const apiConfig = {
  apiKey: import.meta.env.VITE_API_KEY || 'hk_6540ab3282f29796f332d6afdc52282268d30969ca9f5945',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  baseUrl: (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', ''),
};

export default apiConfig;
