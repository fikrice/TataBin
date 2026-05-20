import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api.js';

/**
 * Pinia Store untuk Autentikasi Pengguna
 * Menyimpan state token JWT dan data user yang sedang login
 */
export const useAuthStore = defineStore('auth', () => {
  // State: ambil data yang sudah tersimpan dari localStorage (persistensi sesi)
  const token = ref(localStorage.getItem('token') || null);
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));

  // Computed: cek apakah pengguna sudah terotentikasi
  const isAuthenticated = computed(() => !!token.value);
  // Computed: cek apakah pengguna adalah admin
  const isAdmin = computed(() => user.value?.role === 'admin');

  /**
   * Melakukan login dan menyimpan token + data user ke store & localStorage
   * @param {string} usernameOrEmail - Username atau Email pengguna
   * @param {string} password - Password pengguna
   */
  async function login(usernameOrEmail, password) {
    const response = await api.post('/auth/login', { usernameOrEmail, password });
    const { token: newToken, user: newUser } = response.data.data;
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    return response.data;
  }

  /**
   * Melakukan logout: hapus token dan data user dari store & localStorage
   */
  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return { token, user, isAuthenticated, isAdmin, login, logout };
});
