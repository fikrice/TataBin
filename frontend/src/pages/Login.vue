<template>
  <!-- Halaman Login TataBin WMS dengan tema Modern Industrial Dark -->
  <div class="min-h-screen flex text-white relative overflow-hidden" style="background: #060b13;">
    <!-- Ambient glowing lights -->
    <div class="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full filter blur-[150px] opacity-20 pointer-events-none" style="background: radial-gradient(circle, #2563eb 0%, transparent 80%);"></div>
    <div class="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full filter blur-[150px] opacity-25 pointer-events-none" style="background: radial-gradient(circle, #06b6d4 0%, transparent 80%);"></div>
    
    <!-- Background Grid Pattern -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px); background-size: 50px 50px;"></div>

    <!-- MAIN DUAL COLUMN LAYOUT -->
    <div class="flex w-full min-h-screen z-10">
      
      <!-- LEFT COLUMN: Industrial Branding & Interactivity (Desktop Only) -->
      <div class="hidden lg:flex lg:w-7/12 flex-col justify-between p-12 relative border-r border-[#1a2c47]/40" style="background: linear-gradient(135deg, #070d18 0%, #0c182b 100%);">
        <!-- Logo and brand at top -->
        <div class="flex items-center gap-3">
          <img src="/tatabin-logo.svg" alt="TataBin Logo" class="h-14 w-14" />
          <div>
            <span class="text-xl font-bold tracking-wider text-white">Tata<span class="text-[#2563eb]">Bin</span></span>
            <div class="text-[9px] uppercase tracking-widest text-[#64748b] font-semibold">Warehouse Management</div>
          </div>
        </div>

        <!-- Middle Interactive Visual & Info -->
        <div class="my-auto max-w-xl space-y-8">
          <div class="space-y-4">
            <span class="px-3 py-1 rounded-full text-xs font-semibold tracking-wider border border-[#2563eb]/30 text-[#60a5fa] bg-[#2563eb]/10 inline-block animate-pulse">
              fikrisan.net
            </span>
            <h2 class="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Kelola Inventaris & <br />
              <span class="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Optimalkan Logistik</span> dengan Akurat.
            </h2>
            <p class="text-[#94a3b8] text-base leading-relaxed">
              TataBin WMS menyediakan visibilitas pergudangan real-time, penataan slot Storage Bin berbasis kategori ukuran, alokasi FIFO, dan manajemen transaksi otomatis terpadu.
            </p>
          </div>

          <!-- Feature Cards Grid (Interactive on hover) -->
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 rounded-2xl border border-[#23324d]/60 bg-[#0c1626]/80 transition-all duration-300 hover:border-blue-500/50 hover:bg-[#0c1626] group">
              <div class="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              </div>
              <h4 class="text-sm font-semibold text-white">Alokasi FIFO Terotomatisasi</h4>
              <p class="text-xs text-[#64748b] mt-1">Mengeluarkan barang berdasarkan tanggal masuk terlama guna menjaga kesegaran stok.</p>
            </div>

            <div class="p-4 rounded-2xl border border-[#23324d]/60 bg-[#0c1626]/80 transition-all duration-300 hover:border-cyan-500/50 hover:bg-[#0c1626] group">
              <div class="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>
              </div>
              <h4 class="text-sm font-semibold text-white">Storage Bin Matching</h4>
              <p class="text-xs text-[#64748b] mt-1">Alokasi presisi yang mencocokkan dimensi fisik antara aset dengan kapasitas rak.</p>
            </div>
          </div>
        </div>

        <!-- Footer brand info -->
        <div class="flex items-center justify-between text-xs text-[#475569] border-t border-[#1a2c47]/30 pt-6">
          <p>© 2026 TataBin WMS. All rights reserved.</p>
          <div class="flex gap-4">
            <span class="hover:text-slate-400 transition-colors cursor-pointer">Security Policy</span>
            <span class="hover:text-slate-400 transition-colors cursor-pointer">Support</span>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Elegant Login Form (Full width on mobile/tablet) -->
      <div class="w-full lg:w-5/12 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div class="w-full max-w-md space-y-8">
          
          <!-- Logo & Title for Mobile (Hidden on Desktop) -->
          <div class="text-center lg:hidden space-y-2">
            <img src="/tatabin-logo.svg" alt="TataBin Logo" class="h-20 mx-auto" />
            <h1 class="text-3xl font-extrabold text-white tracking-tight">TataBin<span class="text-[#2563eb]">.</span></h1>
            <p class="text-xs text-[#94a3b8]">Warehouse Management System</p>
          </div>

          <!-- Login Container -->
          <div class="rounded-3xl p-8 border backdrop-blur-md" style="background: rgba(17, 28, 45, 0.7); border-color: rgba(35, 50, 77, 0.7); box-shadow: 0 30px 60px rgba(0,0,0,0.4);">
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-white">Selamat Datang</h2>
              <p class="text-sm text-[#94a3b8] mt-1">Silakan masuk menggunakan kredensial akun Anda.</p>
            </div>

            <!-- Alert Error -->
            <div v-if="errorMsg" class="rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-3 border"
                 style="background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.25); color: #f43f5e;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 flex-shrink-0 text-rose-500"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>
              <span>{{ errorMsg }}</span>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-6">
              <!-- Field Username/Email -->
              <div>
                <label for="usernameInput" class="block text-xs font-semibold uppercase tracking-wider mb-2 text-[#94a3b8]">Username / Email</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#475569]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                  </div>
                  <input
                    id="usernameInput"
                    name="usernameInput"
                    autocomplete="username"
                    v-model="form.usernameOrEmail"
                    type="text"
                    placeholder="nama@email.com atau username"
                    required
                    class="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                    style="background:#070d16; border: 1px solid #1a2c47; color:#e2e8f0;"
                    @focus="$event.target.style.borderColor='#2563eb'; $event.target.style.boxShadow='0 0 0 2px rgba(37,99,235,0.15)'"
                    @blur="$event.target.style.borderColor='#1a2c47'; $event.target.style.boxShadow='none'"
                  />
                </div>
              </div>

              <!-- Field Password -->
              <div>
                <label for="passwordInput" class="block text-xs font-semibold uppercase tracking-wider mb-2 text-[#94a3b8]">Password</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#475569]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                  </div>
                  <input
                    id="passwordInput"
                    name="passwordInput"
                    autocomplete="current-password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    required
                    class="w-full pl-10 pr-12 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                    style="background:#070d16; border: 1px solid #1a2c47; color:#e2e8f0;"
                    @focus="$event.target.style.borderColor='#2563eb'; $event.target.style.boxShadow='0 0 0 2px rgba(37,99,235,0.15)'"
                    @blur="$event.target.style.borderColor='#1a2c47'; $event.target.style.boxShadow='none'"
                  />
                  <!-- Toggle tampilkan password -->
                  <button type="button" @click="showPassword = !showPassword"
                          class="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors flex items-center justify-center text-[#475569]"
                          @mouseenter="$event.currentTarget.style.color='#94a3b8'" @mouseleave="$event.currentTarget.style.color='#475569'">
                    <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
              </div>

              <!-- Tombol Login -->
              <button
                type="submit"
                :disabled="loading"
                class="w-full py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 mt-2 shadow-lg"
                style="background: linear-gradient(135deg, #2563eb, #1d4ed8); box-shadow: 0 10px 20px -5px rgba(37,99,235,0.4);"
                @mouseenter="!loading && ($event.target.style.filter='brightness(1.1)')"
                @mouseleave="$event.target.style.filter='brightness(1)'"
              >
                <svg v-if="loading" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>{{ loading ? 'Memverifikasi Kredensial...' : 'Masuk' }}</span>
              </button>
            </form>

            <!-- Info default credentials (styled elegantly) -->
            <div class="mt-8 pt-6 border-t border-[#1a2c47]/60">
              <div class="p-4 rounded-2xl text-xs space-y-2" style="background: rgba(37, 99, 235, 0.05); border: 1px solid rgba(37, 99, 235, 0.15);">
                <div class="flex items-center gap-1.5 text-blue-400 font-semibold mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.25v3.5a.75.75 0 0 0 1.5 0V10a.75.75 0 0 0-.75-.75H9Z" clip-rule="evenodd" /></svg>
                  <span>Kredensial Demo Sistem:</span>
                </div>
                <div class="flex justify-between items-center text-[#94a3b8]">
                  <span>Administrator:</span>
                  <code class="px-2 py-0.5 rounded text-white bg-slate-900 font-mono">admin / admin123</code>
                </div>
                <div class="flex justify-between items-center text-[#94a3b8]">
                  <span>Crew Gudang:</span>
                  <code class="px-2 py-0.5 rounded text-white bg-slate-900 font-mono">crew / Qwerty123*</code>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom credit on mobile -->
          <p class="text-center text-[10px] text-[#475569] lg:hidden">© 2026 TataBin WMS · Industrial Warehouse Management</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const router = useRouter();
const authStore = useAuthStore();

// State form login
const form = reactive({ usernameOrEmail: '', password: '' });
const showPassword = ref(false);
const loading = ref(false);
const errorMsg = ref('');

/**
 * Menangani proses submit form login
 */
async function handleLogin() {
  loading.value = true;
  errorMsg.value = '';
  try {
    await authStore.login(form.usernameOrEmail, form.password);
    router.push('/dashboard');
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Login gagal. Periksa kembali kredensial Anda.';
  } finally {
    loading.value = false;
  }
}
</script>
