<template>
  <DashboardLayout>
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-bold" style="color:#e2e8f0;">Laporan Log Transaksi</h1>
        <p class="text-sm mt-0.5" style="color:#94a3b8;">Riwayat aktivitas inbound dan outbound barang</p>
      </div>
      <button @click="handleExport" :disabled="exporting" class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all" style="background:linear-gradient(135deg,#16a34a,#15803d);">
        <svg v-if="exporting" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <i v-else data-lucide="download" class="w-4 h-4"></i>
        {{ exporting ? 'Mengekspor...' : 'Ekspor Excel' }}
      </button>
    </div>

    <!-- FILTERS PANEL -->
    <div class="rounded-xl p-5 mb-6" style="background:#111c2d; border:1px solid #23324d;">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <!-- Tipe Transaksi -->
        <div>
          <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Tipe Transaksi</label>
          <div class="relative">
            <select v-model="filters.type" class="w-full px-3 py-2 rounded-lg text-sm outline-none appearance-none pr-10" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;">
              <option value="">Semua</option>
              <option value="inbound">Inbound (Masuk)</option>
              <option value="outbound">Outbound (Keluar)</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
              <i data-lucide="chevron-down" class="w-4 h-4"></i>
            </div>
          </div>
        </div>
        <!-- Tanggal Mulai -->
        <div>
          <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Tanggal Mulai</label>
          <input v-model="filters.startDate" type="date" class="w-full px-3 py-2 rounded-lg text-sm outline-none" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0; color-scheme:dark;"/>
        </div>
        <!-- Tanggal Selesai -->
        <div>
          <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Tanggal Selesai</label>
          <input v-model="filters.endDate" type="date" class="w-full px-3 py-2 rounded-lg text-sm outline-none" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0; color-scheme:dark;"/>
        </div>
        <!-- Pencarian Ref -->
        <div>
          <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Pencarian Ref</label>
          <div class="flex gap-2">
            <input v-model="searchQuery" type="text" placeholder="No. Referensi..." class="w-full px-3 py-2 rounded-lg text-sm outline-none font-mono" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;"/>
            <button @click="applyFilters" class="px-4 rounded-lg text-sm font-semibold text-white" style="background:#2563eb;">Cari</button>
          </div>
        </div>
        <!-- Page Size Selector -->
        <div>
          <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Ukuran Halaman</label>
          <div class="relative">
            <select v-model.number="pageSize" class="w-full px-3 py-2 rounded-lg text-sm outline-none appearance-none pr-10" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;">
              <option :value="5">5 Baris</option>
              <option :value="10">10 Baris</option>
              <option :value="25">25 Baris</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
              <i data-lucide="chevron-down" class="w-4 h-4"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- DATA TABLE -->
    <div class="rounded-xl overflow-hidden" style="background:#111c2d; border:1px solid #23324d;">
      <div v-if="loading" class="flex items-center justify-center py-16" style="color:#94a3b8;">
        <svg class="animate-spin w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Memuat data log...
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left min-w-[1200px]">
          <thead style="background:#162235; border-bottom:1px solid #23324d;">
            <tr>
              <th class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-left" style="color:#94a3b8; width: 60px;">No.</th>
              <th class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 140px;">WO Number</th>
              <th class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 120px;">Category</th>
              <th class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Warehouse</th>
              <th class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Storage Bin</th>
              <th class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Asset</th>
              <th class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Supplier</th>
              <th class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Remarks</th>
              <th class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 160px;">Label Code</th>
              <th class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 180px;">Scanned At</th>
              <th class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 140px;">Scanned By</th>
              <th class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-right" style="color:#94a3b8; width: 120px;">Updated Stock</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="logs.length === 0">
              <td colspan="12" class="text-center py-12" style="color:#475569;">Tidak ada data transaksi ditemukan.</td>
            </tr>
            <tr v-for="(log, index) in paginatedLogs" :key="log.id" class="transition-colors" style="border-top:1px solid #23324d;" @mouseenter="$event.currentTarget.style.background='#162235'" @mouseleave="$event.currentTarget.style.background='transparent'">
              <td class="px-4 py-4 font-mono text-xs font-medium" style="color:#94a3b8;">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td class="px-4 py-4 font-mono font-bold text-xs" style="color:#2563eb;">{{ log.referenceNumber }}</td>
              <td class="px-4 py-4">
                <span class="px-2.5 py-1 rounded-md text-xs font-semibold" :style="log.type==='inbound'?'background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.2);':'background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2);'">
                  {{ log.type === 'inbound' ? 'INBOUND' : 'OUTBOUND' }}
                </span>
              </td>
              <td class="px-4 py-4 font-semibold" style="color:#e2e8f0;">{{ log.storageBin?.warehouse?.name || '–' }}</td>
              <td class="px-4 py-4 font-mono text-emerald-400" style="color:#22c55e;">{{ log.storageBin?.code || '–' }}</td>
              <td class="px-4 py-4">
                <p class="font-semibold" style="color:#e2e8f0;">{{ log.asset?.name || '–' }}</p>
                <p class="text-xs font-mono text-slate-400">{{ log.asset?.code || '–' }}</p>
              </td>
              <td class="px-4 py-4" style="color:#e2e8f0;">{{ log.type==='inbound' ? (log.supplier?.name || '–') : '–' }}</td>
              <td class="px-4 py-4 text-xs italic" style="color:#94a3b8;">{{ log.remarks || '–' }}</td>
              <td class="px-4 py-4 font-mono font-bold text-slate-200">{{ log.labelCode }}</td>
              <td class="px-4 py-4 text-xs" style="color:#94a3b8;">{{ formatDateTime(log.createdAt) }}</td>
              <td class="px-4 py-4" style="color:#e2e8f0;">{{ log.user?.fullName || log.user?.username || '–' }}</td>
              <td class="px-4 py-4 text-right font-bold font-mono" style="color:#22c55e;">{{ log.updatedStock }} unit</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PAGINATION PANEL -->
    <div v-if="logs.length > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-sm" style="color:#94a3b8;">
      <p>Menampilkan {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, logs.length) }} dari {{ logs.length }} data</p>
      <div class="flex items-center gap-2">
        <button @click="currentPage--" :disabled="currentPage === 1" class="px-3 py-1.5 rounded-lg border font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed" style="background:#111c2d;border-color:#23324d;color:#e2e8f0;">Sebelumnya</button>
        <span class="px-4 py-1.5 rounded-lg font-mono font-bold" style="background:#0a1220;border:1px solid #23324d;color:#2563eb;">{{ currentPage }} / {{ totalPages }}</span>
        <button @click="currentPage++" :disabled="currentPage === totalPages" class="px-3 py-1.5 rounded-lg border font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed" style="background:#111c2d;border-color:#23324d;color:#e2e8f0;">Selanjutnya</button>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import api from '../services/api.js';

const logs = ref([]);
const loading = ref(false);
const exporting = ref(false);

const filters = reactive({
  type: '',
  startDate: '',
  endDate: '',
  search: ''
});

const searchQuery = ref('');
const debouncedSearch = ref('');
let debounceTimer = null;
watch(searchQuery, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { filters.search = val; fetchLogs(); }, 500);
});

// Client side pagination state
const currentPage = ref(1);
const pageSize = ref(10);

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return logs.value.slice(start, start + pageSize.value);
});

const totalPages = computed(() => {
  return Math.ceil(logs.value.length / pageSize.value) || 1;
});

watch([pageSize], () => {
  currentPage.value = 1;
});

async function fetchLogs() {
  loading.value = true;
  currentPage.value = 1;
  try {
    const { data } = await api.get('/reports/logs', { params: filters });
    logs.value = data.data;
  } catch (error) {
    console.error('Gagal memuat log transaksi:', error);
  } finally {
    loading.value = false;
  }
}

function applyFilters() {
  fetchLogs();
}

/** Mengekspor laporan ke format Excel sebagai file download blob */
async function handleExport() {
  exporting.value = true;
  try {
    const response = await api.get('/reports/export-excel', {
      params: filters,
      responseType: 'blob' // Wajib diset agar file didownload sebagai binary blob
    });
    
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Log_Transaksi_WMS_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    
    // Bersihkan link
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Gagal mengekspor laporan:', error);
  } finally {
    exporting.value = false;
  }
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

onMounted(() => {
  fetchLogs();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
</script>
