import axios from 'axios';

/**
 * Konfigurasi instance Axios utama untuk berkomunikasi dengan backend TataBin WMS API
 * Base URL diarahkan ke server backend yang berjalan di port 3000
 */
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' }
});

/**
 * Interceptor Request: otomatis menambahkan token JWT ke setiap permintaan
 * Token diambil dari localStorage
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor Response: tangani error 401 (token kadaluarsa) dengan redirect ke halaman login
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Hapus token yang tidak valid dari localStorage dan arahkan ke halaman login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
