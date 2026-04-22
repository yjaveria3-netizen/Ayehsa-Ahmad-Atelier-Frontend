import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const CACHE_TTL_MS = 60 * 1000;
const responseCache = new Map();

const buildCacheKey = (config) => {
  const method = (config.method || 'get').toLowerCase();
  return `${method}:${config.baseURL || ''}${config.url || ''}`;
};

const clearGetCache = () => {
  responseCache.clear();
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request (if stored in localStorage as fallback)
// NOTE: Prefer httpOnly cookies which are sent automatically with withCredentials: true
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  // Only use localStorage token if absolutely necessary (legacy support)
  // httpOnly cookies are more secure and sent automatically
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const method = (config.method || 'get').toLowerCase();
  const skipCache = config?.headers?.['x-skip-cache'] === 'true';

  if (method === 'get' && !skipCache) {
    const cacheKey = buildCacheKey(config);
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      config.adapter = async () => ({
        data: cached.data,
        status: 200,
        statusText: 'OK',
        headers: cached.headers || {},
        config,
        request: null,
      });
    } else {
      config.metadata = { ...(config.metadata || {}), cacheKey };
    }
  }

  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => {
    const method = (res.config?.method || 'get').toLowerCase();
    if (method === 'get' && res.config?.metadata?.cacheKey) {
      responseCache.set(res.config.metadata.cacheKey, {
        data: res.data,
        headers: res.headers,
        timestamp: Date.now(),
      });
    }

    // Mutations invalidate cache to prevent stale lists/stats.
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      clearGetCache();
    }

    return res;
  },
  (err) => {
    const method = (err.config?.method || '').toLowerCase();

    if (err.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }

    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      clearGetCache();
    }

    return Promise.reject(err);
  }
);

export default api;
