export const apiConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  apiUrl: import.meta.env.VITE_API_URL,
  baseUrl: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : '',
};

export default apiConfig;
