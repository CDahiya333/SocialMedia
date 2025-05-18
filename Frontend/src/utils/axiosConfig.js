import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // Important for cookies
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let refreshPromise = null;

const refreshAccessToken = async () => {
  try {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = api.post('/api/auth/refresh');
    }
    await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;
    return true;
  } catch (error) {
    isRefreshing = false;
    refreshPromise = null;
    console.log(error);
    return false;
  }
};

// Add request interceptor to ensure all requests have credentials
api.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling 401s and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh if:
    // 1. It's a 401 error
    // 2. We haven't tried to refresh yet
    // 3. It's not the refresh request itself
    // 4. It's not the login request
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true;

      // Try to refresh the token
      const refreshSuccess = await refreshAccessToken();
      
      if (refreshSuccess) {
        // If refresh successful, retry the original request
        return api(originalRequest);
      } else {
        // If refresh fails and we're not on the login page, redirect
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Initial token refresh on page load
(async () => {
  // Only try to refresh if we're not on the login or register page
  if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
    try {
      await refreshAccessToken();
    } catch (error) {
      // If initial refresh fails and we're not on login, redirect
      console.log(error);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }
})();

export default api; 