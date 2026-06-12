<template>
  <DashboardLayout>
    <!-- TOP BAR -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-bold" style="color:#e2e8f0;">Daftar Work Order (WO)</h1>
        <p class="text-sm mt-0.5" style="color:#94a3b8;">Kelola perintah kerja inbound (masuk) dan outbound (keluar) barang</p>
      </div>
      <button v-if="isAdmin" @click="openCreateModal" class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:scale-[1.02]" style="background:linear-gradient(135deg,#2563eb,#1d4ed8);">
        <i data-lucide="plus" class="w-4 h-4"></i>
        Buat Work Order Baru
      </button>
    </div>

    <!-- FILTERS PANEL -->
    <div class="rounded-xl p-5 mb-6" style="background:#111c2d; border:1px solid #23324d;">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Kategori WO -->
        <div>
          <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Tipe Kategori</label>
          <div class="relative">
            <select v-model="filters.type" class="w-full px-3 py-2 rounded-lg text-sm outline-none appearance-none pr-10" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;">
              <option value="">Semua Tipe</option>
              <option value="inbound">Inbound (Masuk)</option>
              <option value="outbound">Outbound (Keluar)</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
              <i data-lucide="chevron-down" class="w-4 h-4"></i>
            </div>
          </div>
        </div>
        <!-- Status WO -->
        <div>
          <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Status Progress</label>
          <div class="relative">
            <select v-model="filters.status" class="w-full px-3 py-2 rounded-lg text-sm outline-none appearance-none pr-10" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;">
              <option value="">Semua Status</option>
              <option value="To-Do">To-Do</option>
              <option value="On Progress">On Progress</option>
              <option value="Done">Done</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
              <i data-lucide="chevron-down" class="w-4 h-4"></i>
            </div>
          </div>
        </div>
        <!-- Action Search -->
        <div class="flex items-end">
          <button @click="fetchWorkOrders" class="w-full py-2 rounded-lg text-sm font-semibold text-white transition-all" style="background:#23324d; border:1px solid #2563eb;">
            Terapkan Filter
          </button>
        </div>
      </div>
    </div>

    <!-- DATA TABLE -->
    <div class="rounded-xl overflow-hidden" style="background:#111c2d; border:1px solid #23324d;">
      <div v-if="loading" class="flex items-center justify-center py-16" style="color:#94a3b8;">
        <svg class="animate-spin w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Memuat data Work Order...
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left min-w-[900px]">
          <thead style="background:#162235; border-bottom:1px solid #23324d;">
            <tr>
              <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-left" style="color:#94a3b8; width: 60px;">No.</th>
              <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">WO Code</th>
              <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 120px;">Tipe</th>
              <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Gudang / Slot Bin</th>
              <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Nama Aset</th>
              <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-center" style="color:#94a3b8; width: 100px;">Kuantitas</th>
              <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 130px;">Status</th>
              <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Keterangan</th>
              <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-right" style="color:#94a3b8; width: 180px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="workOrders.length === 0">
              <td colspan="9" class="text-center py-12" style="color:#475569;">Tidak ada data Work Order ditemukan.</td>
            </tr>
            <tr v-for="(wo, index) in workOrders" :key="wo.id" class="transition-colors" style="border-top:1px solid #23324d;" @mouseenter="$event.currentTarget.style.background='#162235'" @mouseleave="$event.currentTarget.style.background='transparent'">
              <td class="px-5 py-4 font-mono text-xs font-medium" style="color:#94a3b8;">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td class="px-5 py-4 font-mono font-bold text-xs" style="color:#2563eb;">{{ wo.code }}</td>
              <td class="px-5 py-4">
                <span class="px-2.5 py-1 rounded-md text-xs font-semibold" :style="wo.type==='inbound'?'background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.2);':'background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2);'">
                  {{ wo.type === 'inbound' ? 'INBOUND' : 'OUTBOUND' }}
                </span>
              </td>
              <td class="px-5 py-4">
                <p class="font-semibold" style="color:#e2e8f0;">{{ wo.warehouse?.name || '–' }}</p>
                <p class="text-xs font-mono text-emerald-400">{{ wo.storageBin?.code || '–' }}</p>
              </td>
              <td class="px-5 py-4">
                <p class="font-semibold" style="color:#e2e8f0;">{{ wo.asset?.name || '–' }}</p>
                <p class="text-xs font-mono text-slate-400">{{ wo.asset?.code || '–' }}</p>
              </td>
              <td class="px-5 py-4 text-center font-semibold font-mono" style="color:#e2e8f0;">
                {{ wo.quantity }} unit
              </td>
              <td class="px-5 py-4">
                <span class="px-2.5 py-1 rounded-full text-xs font-bold" :style="getStatusStyle(wo.status)">
                  {{ wo.status }}
                </span>
              </td>
              <td class="px-5 py-4 text-xs italic" style="color:#94a3b8;">
                {{ wo.remarks || '–' }}
              </td>
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <router-link :to="`/work-orders/${wo.id}/process`" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all bg-emerald-600 hover:bg-emerald-500">
                    Proses Scan
                  </router-link>
                  <button v-if="isAdmin && wo.status === 'To-Do'" @click="handleDelete(wo)" class="p-1.5 rounded-lg transition-colors text-red-500 hover:bg-red-500/10">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PAGINATION PANEL -->
    <div v-if="workOrders.length > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-sm" style="color:#94a3b8;">
      <p>Menampilkan {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, totalWO) }} dari {{ totalWO }} data</p>
      <div class="flex items-center gap-2">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="px-3 py-1.5 rounded-lg border font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed" style="background:#111c2d;border-color:#23324d;color:#e2e8f0;">Sebelumnya</button>
        <span class="px-4 py-1.5 rounded-lg font-mono font-bold" style="background:#0a1220;border:1px solid #23324d;color:#2563eb;">{{ currentPage }} / {{ totalPages }}</span>
        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="px-3 py-1.5 rounded-lg border font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed" style="background:#111c2d;border-color:#23324d;color:#e2e8f0;">Selanjutnya</button>
      </div>
    </div>

    <!-- CREATE WORK ORDER MODAL -->
    <div v-if="createModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" @click.self="closeCreateModal">
      <div class="w-full max-w-lg rounded-2xl p-6 relative shadow-2xl transition-all scale-100" style="background:#111c2d; border:1px solid #23324d;">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-bold" style="color:#e2e8f0;">Buat Work Order Baru</h3>
          <button @click="closeCreateModal" style="color:#94a3b8;"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>

        <form @submit.prevent="submitCreate" class="space-y-4">
          <!-- Tipe Kategori -->
          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Tipe Kategori</label>
            <div class="grid grid-cols-2 gap-4">
              <label class="flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors"
                     :style="form.type === 'inbound' ? 'background:rgba(37,99,235,0.1); border-color:#2563eb; color:#e2e8f0;' : 'background:#0a1220; border-color:#23324d; color:#94a3b8;'">
                <input type="radio" v-model="form.type" value="inbound" class="radio radio-primary" />
                <span>Inbound (Masuk)</span>
              </label>
              <label class="flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors"
                     :style="form.type === 'outbound' ? 'background:rgba(37,99,235,0.1); border-color:#2563eb; color:#e2e8f0;' : 'background:#0a1220; border-color:#23324d; color:#94a3b8;'">
                <input type="radio" v-model="form.type" value="outbound" class="radio radio-primary" />
                <span>Outbound (Keluar)</span>
              </label>
            </div>
            <p v-if="validationErrors.type" class="text-xs text-red-500 mt-1">{{ validationErrors.type[0] }}</p>
          </div>

          <!-- Pilih Gudang -->
          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Gudang</label>
            <div class="relative">
              <select v-model="form.warehouseId" @change="handleWarehouseChange" class="w-full px-3 py-2 rounded-lg text-sm outline-none appearance-none pr-10" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;">
                <option value="">Pilih Gudang...</option>
                <option v-for="wh in warehouses" :key="wh.id" :value="wh.id">{{ wh.name }} ({{ wh.code }})</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
                <i data-lucide="chevron-down" class="w-4 h-4"></i>
              </div>
            </div>
            <p v-if="validationErrors.warehouseId" class="text-xs text-red-500 mt-1">{{ validationErrors.warehouseId[0] }}</p>
          </div>

          <!-- Pilih Slot Bin (Filtered) -->
          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Slot Penyimpanan (Storage Bin)</label>
            <div class="relative">
              <select v-model="form.storageBinId" @change="handleBinChange" :disabled="!form.warehouseId" class="w-full px-3 py-2 rounded-lg text-sm outline-none appearance-none pr-10 disabled:opacity-40 disabled:cursor-not-allowed" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;">
                <option value="">Pilih Slot Bin...</option>
                <option v-for="bin in filteredBins" :key="bin.id" :value="bin.id">
                  {{ bin.code }} ({{ bin.category }} - {{ bin.status === 'filled' ? 'Terisi' : 'Kosong' }})
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
                <i data-lucide="chevron-down" class="w-4 h-4"></i>
              </div>
            </div>
            <p v-if="validationErrors.storageBinId" class="text-xs text-red-500 mt-1">{{ validationErrors.storageBinId[0] }}</p>
          </div>

          <!-- Alokasi Aset (Auto-selected based on Bin) -->
          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Aset yang Dialokasikan</label>
            <input type="text" :value="allocatedAssetName" readonly class="w-full px-3 py-2 rounded-lg text-sm outline-none font-medium border" style="background:#162235; border-color:#23324d; color:#94a3b8;" placeholder="Aset akan terisi otomatis setelah memilih slot bin..." />
            <p v-if="validationErrors.assetId" class="text-xs text-red-500 mt-1">{{ validationErrors.assetId[0] }}</p>
          </div>

          <!-- Kuantitas & Info Stok -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Jumlah Unit (Kuantitas)</label>
              <span v-if="form.type === 'outbound' && form.storageBinId" class="text-xs font-semibold text-amber-500">
                Stok tersedia: {{ currentBinStockQty }} unit
              </span>
            </div>
            <input type="number" v-model.number="form.quantity" min="1" class="w-full px-3 py-2 rounded-lg text-sm outline-none" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;" />
            <p v-if="validationErrors.quantity" class="text-xs text-red-500 mt-1">{{ validationErrors.quantity[0] }}</p>
          </div>

          <!-- Keterangan -->
          <div>
            <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Keterangan (Remarks)</label>
            <textarea v-model="form.remarks" rows="2" placeholder="Tulis catatan di sini..." class="w-full px-3 py-2 rounded-lg text-sm outline-none" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;"></textarea>
          </div>

          <!-- ERROR STATE GLOBAL -->
          <p v-if="globalError" class="text-xs text-red-500 text-center font-semibold">{{ globalError }}</p>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-4">
            <button type="button" @click="closeCreateModal" class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all" style="background:#23324d; color:#e2e8f0;">
              Batal
            </button>
            <button type="submit" :disabled="submitting" class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all" style="background:#2563eb;">
              {{ submitting ? 'Menyimpan...' : 'Buat Work Order' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import api from '../services/api.js';
import { useAuthStore } from '../stores/auth.js';

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);

const workOrders = ref([]);
const loading = ref(false);
const submitting = ref(false);

const filters = reactive({
  type: '',
  status: ''
});

// Pagination
const currentPage = ref(1);
const pageSize = ref(10);
const totalWO = ref(0);
const totalPages = computed(() => Math.ceil(totalWO.value / pageSize.value) || 1);

// Master data dropdowns
const warehouses = ref([]);
const allBins = ref([]);

// Modal State
const createModalOpen = ref(false);
const globalError = ref('');
const validationErrors = ref({});

const form = reactive({
  type: 'inbound',
  warehouseId: '',
  storageBinId: '',
  assetId: '',
  quantity: 1,
  remarks: ''
});

// Bins filtered by selected warehouse
const filteredBins = computed(() => {
  if (!form.warehouseId) return [];
  return allBins.value.filter(bin => bin.warehouseId === form.warehouseId);
});

// Allocated Asset name display based on selected bin
const allocatedAssetName = computed(() => {
  if (!form.storageBinId) return '';
  const bin = allBins.value.find(b => b.id === form.storageBinId);
  if (bin && bin.allocatedAsset) {
    return `${bin.allocatedAsset.name} (${bin.allocatedAsset.code})`;
  }
  return 'Tidak ada alokasi aset pada bin ini';
});

// Stock Quantity of selected bin (useful for outbound WO validation)
const currentBinStockQty = ref(0);

async function fetchWorkOrders() {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      type: filters.type,
      status: filters.status
    };
    const { data } = await api.get('/work-orders', { params });
    workOrders.value = data.data;
    totalWO.value = data.pagination.total;
  } catch (error) {
    console.error('Gagal mengambil daftar Work Order:', error);
  } finally {
    loading.value = false;
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  }
}

function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchWorkOrders();
  }
}

function getStatusStyle(status) {
  switch (status) {
    case 'To-Do':
      return 'background:rgba(148,163,184,0.1); color:#94a3b8; border:1px solid rgba(148,163,184,0.2);';
    case 'On Progress':
      return 'background:rgba(245,158,11,0.1); color:#f59e0b; border:1px solid rgba(245,158,11,0.2);';
    case 'Done':
      return 'background:rgba(34,197,94,0.1); color:#22c55e; border:1px solid rgba(34,197,94,0.2);';
    default:
      return 'background:#0a1220; color:#e2e8f0;';
  }
}

async function openCreateModal() {
  validationErrors.value = {};
  globalError.value = '';
  form.type = 'inbound';
  form.warehouseId = '';
  form.storageBinId = '';
  form.assetId = '';
  form.quantity = 1;
  form.remarks = '';
  currentBinStockQty.value = 0;
  createModalOpen.value = true;
  
  // Pre-fetch warehouses and bins if not loaded
  try {
    const resWH = await api.get('/warehouses');
    warehouses.value = resWH.data.data;
    const resBin = await api.get('/storage-bins?limit=1000');
    allBins.value = resBin.data.data;
  } catch (error) {
    console.error('Gagal memuat master data dropdown:', error);
  }
  
  setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
}

function closeCreateModal() {
  createModalOpen.value = false;
}

function handleWarehouseChange() {
  form.storageBinId = '';
  form.assetId = '';
  currentBinStockQty.value = 0;
}

async function handleBinChange() {
  if (!form.storageBinId) {
    form.assetId = '';
    currentBinStockQty.value = 0;
    return;
  }
  
  const bin = allBins.value.find(b => b.id === form.storageBinId);
  if (bin) {
    form.assetId = bin.assetId || '';
    
    // If outbound, fetch current stock of this bin
    if (form.type === 'outbound') {
      try {
        const { data } = await api.get(`/storage-bins/${bin.id}`);
        // Read stock quantity from details
        currentBinStockQty.value = data.data.stock ? data.data.stock.quantity : 0;
      } catch (err) {
        console.error('Gagal mengambil detail stok bin:', err);
        currentBinStockQty.value = 0;
      }
    }
  } else {
    form.assetId = '';
    currentBinStockQty.value = 0;
  }
}

async function submitCreate() {
  submitting.value = true;
  validationErrors.value = {};
  globalError.value = '';
  try {
    await api.post('/work-orders', form);
    closeCreateModal();
    fetchWorkOrders();
  } catch (error) {
    if (error.response && error.response.status === 400) {
      if (error.response.data.errors) {
        validationErrors.value = error.response.data.errors;
      } else {
        globalError.value = error.response.data.message;
      }
    } else {
      globalError.value = 'Terjadi kesalahan sistem, silakan coba lagi.';
    }
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(wo) {
  if (confirm(`Apakah Anda yakin ingin menghapus Work Order ${wo.code}?`)) {
    try {
      await api.delete(`/work-orders/${wo.id}`);
      fetchWorkOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus Work Order');
    }
  }
}

onMounted(() => {
  fetchWorkOrders();
});
</script>
