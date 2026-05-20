<template>
  <DashboardLayout>
    <!-- Greeting Header -->
    <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold" style="color:#e2e8f0;">
          Selamat Datang, {{ user?.fullName || user?.username }}
        </h1>
        <p class="text-sm mt-1" style="color:#94a3b8;">
          {{ greeting }} - {{ currentDate }}
        </p>
      </div>
      <!-- Quick Status Badge -->
      <div class="flex items-center gap-3">
        <span class="text-xs px-3 py-1.5 rounded-lg font-semibold border flex items-center gap-1.5"
              style="background:rgba(37,99,235,0.08); color:#3b82f6; border-color:rgba(37,99,235,0.2);">
          <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Sistem Aktif
        </span>
      </div>
    </div>

    <!-- STAT CARDS ROW -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <!-- Total Gudang -->
      <div class="rounded-xl p-5 flex items-start gap-4 transition-all duration-200 cursor-pointer"
           style="background:#111c2d; border:1px solid #23324d;"
           @mouseenter="$event.currentTarget.style.borderColor='#2563eb'"
           @mouseleave="$event.currentTarget.style.borderColor='#23324d'"
           @click="$router.push('/warehouses')">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
             style="background:rgba(37,99,235,0.15);">
          <i data-lucide="warehouse" class="w-6 h-6" style="color:#2563eb;"></i>
        </div>
        <div>
          <p class="text-2xl font-bold" style="color:#e2e8f0;">{{ stats.warehouses }}</p>
          <p class="text-xs mt-0.5" style="color:#94a3b8;">Gudang</p>
        </div>
      </div>

      <!-- Total Bin -->
      <div class="rounded-xl p-5 flex items-start gap-4 transition-all duration-200 cursor-pointer"
           style="background:#111c2d; border:1px solid #23324d;"
           @mouseenter="$event.currentTarget.style.borderColor='#06b6d4'"
           @mouseleave="$event.currentTarget.style.borderColor='#23324d'"
           @click="$router.push('/storage-bins')">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
             style="background:rgba(6,182,212,0.15);">
          <i data-lucide="grid" class="w-6 h-6" style="color:#06b6d4;"></i>
        </div>
        <div>
          <p class="text-2xl font-bold" style="color:#e2e8f0;">{{ stats.bins }}</p>
          <p class="text-xs mt-0.5" style="color:#94a3b8;">Total Slot</p>
          <p class="text-xs" style="color:#22c55e;">{{ stats.emptyBins }} kosong</p>
        </div>
      </div>

      <!-- Total Aset -->
      <div class="rounded-xl p-5 flex items-start gap-4 transition-all duration-200 cursor-pointer"
           style="background:#111c2d; border:1px solid #23324d;"
           @mouseenter="$event.currentTarget.style.borderColor='#f59e0b'"
           @mouseleave="$event.currentTarget.style.borderColor='#23324d'"
           @click="$router.push('/assets')">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
             style="background:rgba(245,158,11,0.15);">
          <i data-lucide="package" class="w-6 h-6" style="color:#f59e0b;"></i>
        </div>
        <div>
          <p class="text-2xl font-bold" style="color:#e2e8f0;">{{ stats.assets }}</p>
          <p class="text-xs mt-0.5" style="color:#94a3b8;">Jenis Aset</p>
        </div>
      </div>

      <!-- Total Stok Unit -->
      <div class="rounded-xl p-5 flex items-start gap-4 transition-all duration-200 cursor-pointer"
           style="background:#111c2d; border:1px solid #23324d;"
           @mouseenter="$event.currentTarget.style.borderColor='#22c55e'"
           @mouseleave="$event.currentTarget.style.borderColor='#23324d'"
           @click="$router.push('/inbound')">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
             style="background:rgba(34,197,94,0.15);">
          <i data-lucide="boxes" class="w-6 h-6" style="color:#22c55e;"></i>
        </div>
        <div>
          <p class="text-2xl font-bold" style="color:#e2e8f0;">{{ stats.totalStock.toLocaleString('id-ID') }}</p>
          <p class="text-xs mt-0.5" style="color:#94a3b8;">Total Unit Stok</p>
        </div>
      </div>
    </div>

    <!-- MAIN GRID: Stok & Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Ringkasan Stok per Aset (2/3 lebar) -->
      <div class="lg:col-span-2 rounded-xl" style="background:#111c2d; border:1px solid #23324d;">
        <div class="flex items-center justify-between px-5 py-4" style="border-bottom:1px solid #23324d;">
          <h2 class="text-sm font-semibold flex items-center gap-2" style="color:#e2e8f0;">
            <i data-lucide="bar-chart-3" class="w-4 h-4 text-blue-500"></i>
            Ringkasan Stok Aset
          </h2>
          <span class="text-xs" style="color:#94a3b8;">Diperbarui otomatis</span>
        </div>

        <div v-if="loadingStats" class="flex items-center justify-center py-12" style="color:#94a3b8;">
          <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          Memuat data...
        </div>

        <div v-else-if="stockSummary.length === 0" class="flex flex-col items-center justify-center py-12" style="color:#475569;">
          <i data-lucide="package" class="w-12 h-12 mb-3" style="color:#23324d;"></i>
          <p class="text-sm">Belum ada stok tersedia</p>
          <button @click="$router.push('/inbound')" class="mt-3 text-xs px-3 py-1.5 rounded-lg" style="background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.2);">Proses Inbound Sekarang</button>
        </div>

        <div v-else class="max-h-[350px] overflow-y-auto">
          <div v-for="item in stockSummary" :key="item.asset.id"
               class="flex items-center px-5 py-3.5 transition-colors"
               style="border-bottom:1px solid #1a2a42;"
               @mouseenter="$event.currentTarget.style.background='#162235'"
               @mouseleave="$event.currentTarget.style.background='transparent'">
            <!-- Kategori badge -->
            <div class="w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 text-xs font-bold"
                 :style="item.asset.category==='Large Asset'?'background:rgba(245,158,11,0.15);color:#f59e0b;':item.asset.category==='Medium Asset'?'background:rgba(6,182,212,0.15);color:#06b6d4;':'background:rgba(34,197,94,0.15);color:#22c55e;'">
              {{ item.asset.category === 'Large Asset' ? 'L' : item.asset.category === 'Medium Asset' ? 'M' : 'S' }}
            </div>
            <!-- Info Aset -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate" style="color:#e2e8f0;">{{ item.asset.name }}</p>
              <p class="text-xs font-mono" style="color:#94a3b8;">{{ item.asset.code }}</p>
            </div>
            <!-- Bar stok -->
            <div class="flex items-center gap-3 ml-4">
              <div class="w-24 h-1.5 rounded-full overflow-hidden bg-slate-800">
                <div class="h-full rounded-full transition-all duration-500"
                     :style="`width:${Math.min((item.totalQuantity / maxStock) * 100, 100)}%; background:${item.totalQuantity > 50 ? '#22c55e' : item.totalQuantity > 10 ? '#f59e0b' : '#ef4444'};`">
                </div>
              </div>
              <p class="text-sm font-bold w-16 text-right" style="color:#e2e8f0;">{{ item.totalQuantity.toLocaleString('id-ID') }}</p>
              <p class="text-xs" style="color:#94a3b8;">unit</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel Kanan: Quick Actions + Status Bin -->
      <div class="space-y-4">
        <!-- Quick Actions -->
        <div class="rounded-xl p-5" style="background:#111c2d; border:1px solid #23324d;">
          <h2 class="text-sm font-semibold mb-4" style="color:#e2e8f0;">Aksi Cepat</h2>
          <div class="space-y-2">
            <button @click="$router.push('/inbound')"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left"
                    style="background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); color:#22c55e;"
                    @mouseenter="$event.currentTarget.style.background='rgba(34,197,94,0.15)'"
                    @mouseleave="$event.currentTarget.style.background='rgba(34,197,94,0.08)'">
              <i data-lucide="download" class="w-4 h-4 flex-shrink-0"></i>
              Proses Inbound
            </button>
            <button @click="$router.push('/outbound')"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left"
                    style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); color:#ef4444;"
                    @mouseenter="$event.currentTarget.style.background='rgba(239,68,68,0.15)'"
                    @mouseleave="$event.currentTarget.style.background='rgba(239,68,68,0.08)'">
              <i data-lucide="upload" class="w-4 h-4 flex-shrink-0"></i>
              Proses Outbound
            </button>
            <button v-if="isAdmin" @click="$router.push('/warehouses')"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left"
                    style="background:rgba(37,99,235,0.08); border:1px solid rgba(37,99,235,0.2); color:#2563eb;"
                    @mouseenter="$event.currentTarget.style.background='rgba(37,99,235,0.15)'"
                    @mouseleave="$event.currentTarget.style.background='rgba(37,99,235,0.08)'">
              <i data-lucide="plus" class="w-4 h-4 flex-shrink-0"></i>
              Tambah Gudang
            </button>
          </div>
        </div>

        <!-- Status Kapasitas Bin (Donut Chart) -->
        <div class="rounded-xl p-5" style="background:#111c2d; border:1px solid #23324d;">
          <h2 class="text-sm font-semibold mb-3" style="color:#e2e8f0;">Kapasitas Slot Global</h2>
          <div v-if="loadingStats" class="text-center py-6" style="color:#94a3b8;">Memuat...</div>
          <div v-else class="flex flex-col items-center">
            <!-- SVG Donut Chart -->
            <div class="relative w-32 h-32 flex items-center justify-center">
              <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                <!-- Background track (Tersedia / Kosong) -->
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#1e293b"
                  stroke-width="10"
                />
                <!-- Available segment (Green) -->
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#22c55e"
                  stroke-width="10"
                  stroke-dasharray="251.2"
                  :stroke-dashoffset="0"
                  stroke-linecap="round"
                />
                <!-- Filled segment (Blue/Cyan/Red depending on pct) -->
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  :stroke="binFillPercent > 80 ? '#ef4444' : binFillPercent > 50 ? '#f59e0b' : '#3b82f6'"
                  stroke-width="10"
                  stroke-dasharray="251.2"
                  :stroke-dashoffset="251.2 * (1 - binFillPercent / 100)"
                  stroke-linecap="round"
                  class="transition-all duration-700 ease-out"
                />
              </svg>
              <!-- Center Text -->
              <div class="absolute text-center">
                <p class="text-xl font-bold font-mono text-white">{{ binFillPercent }}%</p>
                <p class="text-[9px] uppercase tracking-wider text-slate-400">Terisi</p>
              </div>
            </div>

            <!-- Legend and counts -->
            <div class="w-full grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
              <div class="flex flex-col items-center p-1.5 rounded-lg" style="background:#0a1220; border:1px solid #1e293b;">
                <span class="flex items-center gap-1 text-[11px] font-semibold" :style="`color:${binFillPercent > 80 ? '#ef4444' : binFillPercent > 50 ? '#f59e0b' : '#3b82f6'};`">
                  <span class="w-2 h-2 rounded-full" :style="`background:${binFillPercent > 80 ? '#ef4444' : binFillPercent > 50 ? '#f59e0b' : '#3b82f6'};`"></span>
                  Terisi
                </span>
                <span class="font-bold text-white mt-0.5">{{ stats.filledBins }} slot</span>
              </div>
              <div class="flex flex-col items-center p-1.5 rounded-lg" style="background:#0a1220; border:1px solid #1e293b;">
                <span class="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Kosong
                </span>
                <span class="font-bold text-white mt-0.5">{{ stats.emptyBins }} slot</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Warehouse Utilization, Asset Proportion Chart & Recent Activity Feed -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Warehouse Space Utilization (Chart) -->
      <div class="rounded-xl p-5" style="background:#111c2d; border:1px solid #23324d;">
        <h2 class="text-sm font-semibold mb-5 flex items-center gap-2" style="color:#e2e8f0;">
          <i data-lucide="gauge" class="w-4 h-4 text-cyan-500"></i>
          Utilitas Ruang per Gudang
        </h2>
        
        <div v-if="loadingStats" class="flex items-center justify-center py-12" style="color:#94a3b8;">
          Memuat utilitas...
        </div>

        <div v-else-if="warehouseUsage.length === 0" class="text-center py-12" style="color:#475569;">
          Belum ada data gudang terdaftar.
        </div>

        <div v-else class="space-y-4">
          <div v-for="wh in warehouseUsage" :key="wh.id" class="space-y-2">
            <div class="flex items-center justify-between text-xs">
              <div>
                <p class="font-semibold" style="color:#e2e8f0;">{{ wh.name }}</p>
                <p class="text-[10px]" style="color:#94a3b8;">{{ wh.location }}</p>
              </div>
              <div class="text-right">
                <p class="font-bold font-mono" :style="wh.pct > 80 ? 'color:#ef4444;' : wh.pct > 50 ? 'color:#f59e0b;' : 'color:#22c55e;'">{{ wh.pct }}%</p>
                <p class="text-[10px]" style="color:#475569;">{{ wh.filled }} / {{ wh.total }} Slot</p>
              </div>
            </div>
            <!-- Progress Bar -->
            <div class="h-2 rounded-full overflow-hidden bg-slate-800 relative">
              <div class="h-full rounded-full transition-all duration-500"
                   :style="`width: ${wh.pct}%; background: linear-gradient(90deg, #2563eb, ${wh.pct > 80 ? '#ef4444' : wh.pct > 50 ? '#f59e0b' : '#06b6d4'});`">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Asset Category Proportion Chart -->
      <div class="rounded-xl p-5" style="background:#111c2d; border:1px solid #23324d;">
        <h2 class="text-sm font-semibold mb-5 flex items-center gap-2" style="color:#e2e8f0;">
          <i data-lucide="pie-chart" class="w-4 h-4 text-amber-500"></i>
          Porsi Kategori Aset
        </h2>
        
        <div v-if="loadingStats" class="flex items-center justify-center py-12" style="color:#94a3b8;">
          Memuat proporsi...
        </div>

        <div v-else class="space-y-5">
          <!-- Stacked Bar Chart -->
          <div class="h-3.5 w-full rounded-full overflow-hidden flex bg-slate-800">
            <div v-for="cat in categoryDistribution" :key="cat.label"
                 :style="`width: ${cat.pct}%; background: ${cat.color};`"
                 class="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
                 :title="`${cat.label}: ${cat.count} unit (${cat.pct}%)`">
            </div>
          </div>

          <!-- Detail List -->
          <div class="space-y-3 pt-1">
            <div v-for="cat in categoryDistribution" :key="cat.label" class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-sm" :style="`background: ${cat.color};`"></span>
                <span class="font-medium" style="color:#e2e8f0;">{{ cat.label }}</span>
              </div>
              <div class="text-right">
                <span class="font-bold text-white font-mono">{{ cat.count.toLocaleString('id-ID') }} unit</span>
                <span class="ml-1.5 font-semibold font-mono" style="color:#94a3b8;">({{ cat.pct }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions Activity Log -->
      <div class="rounded-xl p-5" style="background:#111c2d; border:1px solid #23324d;">
        <h2 class="text-sm font-semibold mb-5 flex items-center gap-2" style="color:#e2e8f0;">
          <i data-lucide="activity" class="w-4 h-4 text-emerald-500"></i>
          Aktivitas Transaksi Terbaru
        </h2>

        <div v-if="loadingStats" class="flex items-center justify-center py-12" style="color:#94a3b8;">
          Memuat aktivitas...
        </div>

        <div v-else-if="recentLogs.length === 0" class="text-center py-12" style="color:#475569;">
          Belum ada riwayat transaksi dicatat.
        </div>

        <div v-else class="space-y-4 max-h-[300px] overflow-y-auto pr-1">
          <!-- Timeline Log -->
          <div v-for="log in recentLogs" :key="log.id" class="flex gap-3 pb-3 border-b border-slate-800 last:border-0 last:pb-0">
            <!-- Icon Indicator -->
            <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                 :style="log.type==='inbound' ? 'background:rgba(34,197,94,0.1); color:#22c55e;' : 'background:rgba(239,68,68,0.1); color:#ef4444;'">
              <i :data-lucide="log.type==='inbound'?'arrow-down-to-dot':'arrow-up-from-dot'" class="w-4 h-4"></i>
            </div>
            
            <!-- Description -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-bold font-mono" :style="log.type==='inbound'?'color:#22c55e;':'color:#ef4444;'">
                  {{ log.type==='inbound'?'[INBOUND]':'[OUTBOUND]' }}
                </span>
                <span class="text-[10px] font-mono" style="color:#475569;">{{ formatDateTime(log.createdAt) }}</span>
              </div>
              <p class="text-xs font-medium mt-0.5 truncate" style="color:#e2e8f0;">
                {{ log.asset?.name }} - <span class="font-mono font-bold">{{ log.quantity }} unit</span>
              </p>
              <div class="flex items-center justify-between text-[10px] mt-0.5" style="color:#94a3b8;">
                <span class="font-mono">{{ log.referenceNumber }}</span>
                <span>Bin: {{ log.storageBin?.code }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import { useAuthStore } from '../stores/auth.js';
import api from '../services/api.js';

const router = useRouter();
const authStore = useAuthStore();

const user = computed(() => authStore.user);
const isAdmin = computed(() => authStore.isAdmin);

// State
const loadingStats = ref(true);
const stockSummary = ref([]);
const warehouses = ref([]);
const bins = ref([]);
const recentLogs = ref([]);

const stats = reactive({
  warehouses: 0,
  bins: 0,
  emptyBins: 0,
  filledBins: 0,
  assets: 0,
  totalStock: 0
});

// Greeting berdasarkan jam
const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return 'Selamat Pagi';
  if (h < 15) return 'Selamat Siang';
  if (h < 18) return 'Selamat Sore';
  return 'Selamat Malam';
});

const currentDate = computed(() =>
  new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
);

// Persentase bin terisi secara global
const binFillPercent = computed(() =>
  stats.bins === 0 ? 0 : Math.round((stats.filledBins / stats.bins) * 100)
);

// Stok maksimum untuk skala progress bar ringkasan
const maxStock = computed(() =>
  stockSummary.value.length ? Math.max(...stockSummary.value.map(s => s.totalQuantity), 1) : 1
);

// Utilitas gudang dihitung dari relasi bin
const warehouseUsage = computed(() => {
  return warehouses.value.map(wh => {
    const whBins = bins.value.filter(b => b.warehouseId === wh.id);
    const total = whBins.length;
    const filled = whBins.filter(b => b.status === 'filled').length;
    const pct = total === 0 ? 0 : Math.round((filled / total) * 100);
    return {
      id: wh.id,
      name: wh.name,
      location: wh.location,
      total,
      filled,
      pct
    };
  });
});

// Distribusi Kategori Aset berdasarkan kuantitas stok terdaftar
const categoryDistribution = computed(() => {
  let small = 0, medium = 0, large = 0;
  stockSummary.value.forEach(item => {
    const qty = Number(item.totalQuantity) || 0;
    const cat = item.asset?.category;
    if (cat === 'Small Asset') small += qty;
    else if (cat === 'Medium Asset') medium += qty;
    else if (cat === 'Large Asset') large += qty;
  });
  const total = small + medium + large || 1;
  return [
    { label: 'Small Asset', count: small, pct: Math.round((small / total) * 100), color: '#22c55e' },
    { label: 'Medium Asset', count: medium, pct: Math.round((medium / total) * 100), color: '#06b6d4' },
    { label: 'Large Asset', count: large, pct: Math.round((large / total) * 100), color: '#f59e0b' }
  ];
});

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

/** Mengambil semua data ringkasan dashboard dari API */
async function fetchDashboardData() {
  loadingStats.value = true;
  try {
    const [whRes, binRes, assetRes, stockRes, logsRes] = await Promise.all([
      api.get('/warehouses'),
      api.get('/storage-bins'),
      api.get('/assets'),
      api.get('/outbound/stock-summary'),
      api.get('/reports/logs')
    ]);

    warehouses.value = whRes.data.data || [];
    stats.warehouses = warehouses.value.length;

    bins.value = binRes.data.data || [];
    stats.bins = bins.value.length;
    stats.emptyBins = bins.value.filter(b => b.status === 'empty').length;
    stats.filledBins = bins.value.filter(b => b.status === 'filled').length;

    stats.assets = assetRes.data.data?.length || 0;

    stockSummary.value = stockRes.data.data || [];
    stats.totalStock = stockSummary.value.reduce((sum, s) => sum + s.totalQuantity, 0);

    recentLogs.value = (logsRes.data.data || []).slice(0, 5);
  } catch (e) {
    console.error('Gagal memuat data dashboard:', e);
  } finally {
    loadingStats.value = false;
    setTimeout(() => {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }, 50);
  }
}

onMounted(() => {
  fetchDashboardData();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
</script>
