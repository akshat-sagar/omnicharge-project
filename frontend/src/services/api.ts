import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { clearAuthStorage, tokenStorage } from '../utils/storage';

const API_GATEWAY = import.meta.env.VITE_API_GATEWAY || 'http://localhost:8087';

const api = axios.create({
  baseURL: API_GATEWAY,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});
// Request interceptor: attach token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<(token: string | null) => void> = [];

const processQueue = (token: string | null) => {
  failedQueue.forEach((cb) => cb(token));
  failedQueue = [];
};

// Response interceptor: handle errors + refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Log network errors to help debugging
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      console.error('Network Error: Unable to connect to backend at', API_GATEWAY, error.message);
    }
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push((token) => {
            if (!token) {
              reject(error);
              return;
            }
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken();

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_GATEWAY}/auth/refresh-token`, { refreshToken });
          const newToken = response.data?.accessToken || response.data?.token;
          if (newToken) {
            tokenStorage.setAccessToken(newToken);
            api.defaults.headers.Authorization = `Bearer ${newToken}`;
            processQueue(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          processQueue(null);
          clearAuthStorage();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        clearAuthStorage();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_GATEWAY };
