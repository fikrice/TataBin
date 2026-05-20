import { createRouter, createWebHistory } from 'vue-router';

/**
 * Konfigurasi rute utama aplikasi TataBin WMS
 * Rute yang memiliki meta.requiresAuth akan diperiksa token JWT-nya di navigation guard
 * Rute yang memiliki meta.requiresAdmin akan memastikan user memiliki role 'admin'
 */
const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
    meta: { title: 'Login | TataBin WMS' },
  },

  // --- Halaman Utama ---
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../pages/Dashboard.vue'),
    meta: { requiresAuth: true, title: 'Dashboard | TataBin WMS' },
  },

  // --- Halaman Master Data (Admin Only) ---
  {
    path: '/warehouses',
    name: 'Warehouses',
    component: () => import('../pages/Warehouses.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Manajemen Gudang | TataBin WMS' },
  },
  {
    path: '/storage-bins',
    name: 'StorageBins',
    component: () => import('../pages/StorageBins.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Manajemen Slot | TataBin WMS' },
  },
  {
    path: '/assets',
    name: 'Assets',
    component: () => import('../pages/Assets.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Katalog Aset | TataBin WMS' },
  },
  {
    path: '/suppliers',
    name: 'Suppliers',
    component: () => import('../pages/Suppliers.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Data Pemasok | TataBin WMS' },
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../pages/Users.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Manajemen Karyawan | TataBin WMS' },
  },

  // --- Halaman Operasional ---
  {
    path: '/inbound',
    name: 'Inbound',
    component: () => import('../pages/Inbound.vue'),
    meta: { requiresAuth: true, title: 'Operasional Inbound | TataBin WMS' },
  },
  {
    path: '/outbound',
    name: 'Outbound',
    component: () => import('../pages/Outbound.vue'),
    meta: { requiresAuth: true, title: 'Operasional Outbound | TataBin WMS' },
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../pages/Reports.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Log Transaksi | TataBin WMS' },
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('../pages/Analytics.vue'),
    meta: { requiresAuth: true, title: 'Analitik & Layout | TataBin WMS' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * Navigation Guard Global
 * Memeriksa apakah pengguna memiliki akses untuk mengunjungi halaman yang dituju.
 * - Halaman dengan requiresAuth: perlu token JWT valid di localStorage
 * - Halaman dengan requiresAdmin: perlu role 'admin' pada data user di localStorage
 */
router.beforeEach((to, from) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (to.meta.title) {
    document.title = to.meta.title;
  } else {
    document.title = 'TataBin WMS';
  }

  if (to.meta.requiresAuth && !token) {
    // Arahkan ke login jika belum terotentikasi
    return '/login';
  }

  if (to.meta.requiresAdmin && user?.role !== 'admin') {
    // Arahkan ke dashboard jika bukan admin
    return '/dashboard';
  }
});

export default router;
