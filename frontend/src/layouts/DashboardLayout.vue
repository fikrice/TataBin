<template>
  <!-- Layout utama dashboard dengan sidebar dan topbar Industrial Dark -->
  <div class="flex h-screen overflow-hidden relative" style="background:#0a1220; font-family:'Inter',sans-serif;">
    
    <!-- Mobile Sidebar Backdrop Overlay -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false" class="md:hidden fixed inset-0 z-20 bg-black/60 backdrop-blur-sm"></div>

    <!-- SIDEBAR -->
    <aside :class="['flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out z-30 md:relative fixed md:translate-x-0 h-full', sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-16 md:translate-x-0 overflow-hidden']"
           style="background:#111c2d; border-right: 1px solid #23324d;">
      
      <!-- Brand Logo -->
      <div class="flex items-center gap-3 px-4 py-5 flex-shrink-0" style="border-bottom: 1px solid #23324d; min-height: 65px;">
        <img src="/tatabin-logo.svg" alt="TataBin Logo" class="h-8 w-auto flex-shrink-0" />
        <span v-show="sidebarOpen" class="text-white font-bold text-lg tracking-tight">TataBin<span style="color:#2563eb">.</span></span>
      </div>

      <!-- Navigasi Utama -->
      <nav class="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        <!-- Kelompok Operasional -->
        <p v-show="sidebarOpen" class="px-2 pb-2 text-xs font-semibold uppercase tracking-widest" style="color:#475569;">Operasional</p>
        <NavItem :icon="dashIcon" label="Dashboard" to="/dashboard" :collapsed="!sidebarOpen" />
        <NavItem :icon="woIcon" label="Work Orders" to="/work-orders" :collapsed="!sidebarOpen" />
        <NavItem :icon="inboundIcon" label="Inbound" to="/inbound" :collapsed="!sidebarOpen" />
        <NavItem :icon="outboundIcon" label="Outbound" to="/outbound" :collapsed="!sidebarOpen" />
        <NavItem :icon="analyticsIcon" label="Analitik Stok" to="/analytics" :collapsed="!sidebarOpen" />

        <!-- Kelompok Master Data (Admin Only) -->
        <div v-if="isAdmin" class="pt-4">
          <p v-show="sidebarOpen" class="px-2 pb-2 text-xs font-semibold uppercase tracking-widest" style="color:#475569;">Master Data</p>
          <NavItem :icon="warehouseIcon" label="Gudang" to="/warehouses" :collapsed="!sidebarOpen" />
          <NavItem :icon="binIcon" label="Slot Penyimpanan" to="/storage-bins" :collapsed="!sidebarOpen" />
          <NavItem :icon="assetIcon" label="Aset" to="/assets" :collapsed="!sidebarOpen" />
          <NavItem :icon="supplierIcon" label="Pemasok" to="/suppliers" :collapsed="!sidebarOpen" />
          <NavItem :icon="userIcon" label="Karyawan" to="/users" :collapsed="!sidebarOpen" />
        </div>

        <!-- Laporan (Admin Only) -->
        <div v-if="isAdmin" class="pt-4">
          <p v-show="sidebarOpen" class="px-2 pb-2 text-xs font-semibold uppercase tracking-widest" style="color:#475569;">Laporan</p>
          <NavItem :icon="reportIcon" label="Log Transaksi" to="/reports" :collapsed="!sidebarOpen" />
        </div>
      </nav>

    </aside>

    <!-- MAIN CONTENT AREA -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- TOPBAR -->
      <header class="flex-shrink-0 flex items-center gap-4 px-6" style="height:65px; background:#111c2d; border-bottom: 1px solid #23324d;">
        <!-- Toggle Sidebar -->
        <button @click="sidebarOpen = !sidebarOpen" class="p-2 rounded-lg transition-colors"
                style="color:#94a3b8; background:transparent;"
                @mouseenter="$event.target.style.background='#162235'"
                @mouseleave="$event.target.style.background='transparent'">
          <i data-lucide="menu" class="w-5 h-5"></i>
        </button>

        <!-- Breadcrumb / Judul Halaman -->
        <div class="flex-1">
          <h2 class="text-base font-semibold" style="color:#e2e8f0;">{{ pageTitle }}</h2>
        </div>

        <!-- Profile Dropdown (Pojok Kanan Header) -->
        <div class="relative">
          <button @click="profileDropdownOpen = !profileDropdownOpen" 
                  class="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-200"
                  style="background:transparent;"
                  @mouseenter="$event.currentTarget.style.background='#162235'"
                  @mouseleave="profileDropdownOpen || ($event.currentTarget.style.background='transparent')">
            <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-md"
                 style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white;">
              {{ userInitial }}
            </div>
            <div class="hidden sm:block text-left">
              <p class="text-xs font-semibold leading-tight" style="color:#e2e8f0;">{{ user?.fullName || user?.username }}</p>
              <p class="text-[10px] font-semibold uppercase tracking-wider" :style="isAdmin ? 'color:#3b82f6;' : 'color:#10b981;'">{{ isAdmin ? 'Admin' : 'Crew' }}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 transition-transform duration-200" :class="profileDropdownOpen ? 'rotate-180' : ''" style="color:#64748b;"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
          </button>

          <!-- Dropdown Menu -->
          <div v-if="profileDropdownOpen" class="absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-2xl z-50 overflow-hidden"
               style="background:#111c2d; border-color:#23324d; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            <!-- User Info -->
            <div class="px-4 py-3" style="border-bottom: 1px solid #23324d;">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                     style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white;">
                  {{ userInitial }}
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold truncate" style="color:#e2e8f0;">{{ user?.fullName || user?.username }}</p>
                  <p class="text-xs truncate" style="color:#64748b;">{{ user?.email || '—' }}</p>
                </div>
              </div>
            </div>
            <!-- Role Badge -->
            <div class="px-4 py-2" style="border-bottom: 1px solid #23324d;">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                    :style="isAdmin ? 'background:rgba(59,130,246,0.1); color:#3b82f6;' : 'background:rgba(16,185,129,0.1); color:#10b981;'">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
                {{ isAdmin ? 'Administrator' : 'Crew Gudang' }}
              </span>
            </div>
            <!-- Logout Button -->
            <div class="p-2">
              <button @click="handleLogout" 
                      class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      style="color:#f87171; background:transparent;"
                      @mouseenter="$event.currentTarget.style.background='rgba(239,68,68,0.1)'"
                      @mouseleave="$event.currentTarget.style.background='transparent'">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
                Keluar dari Sistem
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Konten Halaman (Slot) -->
      <main class="flex-1 overflow-y-auto p-6" style="background:#0a1220;">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onUpdated, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

// Komponen NavItem lokal untuk item navigasi sidebar
import NavItem from '../components/NavItem.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const sidebarOpen = ref(true);
const profileDropdownOpen = ref(false);
const user = computed(() => authStore.user);
const isAdmin = computed(() => authStore.isAdmin);
// Inisial nama user untuk avatar di header
const userInitial = computed(() => (user.value?.fullName || user.value?.username || 'U').charAt(0).toUpperCase());

// Judul halaman berdasarkan route saat ini
const pageTitles = {
  '/dashboard': 'Dashboard',
  '/warehouses': 'Manajemen Gudang',
  '/storage-bins': 'Slot Penyimpanan',
  '/assets': 'Katalog Aset',
  '/suppliers': 'Data Pemasok',
  '/users': 'Manajemen Karyawan',
  '/inbound': 'Operasional Inbound',
  '/outbound': 'Operasional Outbound',
  '/reports': 'Log Transaksi',
  '/analytics': 'Analitik Stok',
  '/work-orders': 'Work Orders',
};
const pageTitle = computed(() => {
  if (route.path.startsWith('/work-orders/') && route.path.endsWith('/process')) {
    return 'Proses Work Order';
  }
  return pageTitles[route.path] || 'TataBin WMS';
});

/**
 * Melakukan logout dan mengarahkan ke halaman login
 */
function handleLogout() {
  profileDropdownOpen.value = false;
  authStore.logout();
  router.push('/login');
}

/**
 * Menutup dropdown profil saat klik di luar area dropdown
 */
function handleClickOutside(event) {
  const dropdown = document.querySelector('.relative');
  if (dropdown && !dropdown.contains(event.target)) {
    profileDropdownOpen.value = false;
  }
}

function handleResize() {
  if (window.innerWidth < 768) {
    sidebarOpen.value = false;
  } else {
    sidebarOpen.value = true;
  }
}

// Inisialisasi ikon Lucide dan event listeners
onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
  document.addEventListener('click', handleClickOutside);
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('click', handleClickOutside);
});

onUpdated(() => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// Watch rute untuk re-render ikon Lucide saat pindah halaman
watch(() => route.path, () => {
  if (window.innerWidth < 768) {
    sidebarOpen.value = false;
  }
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, 50);
});

// Ikon Lucide string names
const dashIcon = 'layout-dashboard';
const woIcon = 'clipboard-list';
const inboundIcon = 'download';
const outboundIcon = 'upload';
const warehouseIcon = 'warehouse';
const binIcon = 'grid';
const assetIcon = 'package';
const supplierIcon = 'truck';
const userIcon = 'users';
const reportIcon = 'file-text';
const analyticsIcon = 'bar-chart-2';
</script>
