<template>
  <DashboardLayout>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-bold" style="color:#e2e8f0;">Slot Penyimpanan</h1>
        <p class="text-sm mt-0.5" style="color:#94a3b8;">Kelola slot bin di setiap gudang</p>
      </div>
      <button v-if="isAdmin" @click="openCreateModal" class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white" style="background:linear-gradient(135deg,#2563eb,#1d4ed8);">
        <i data-lucide="plus" class="w-4 h-4"></i>
        Tambah Slot
      </button>
    </div>

    <!-- Alert toast -->
    <div v-if="toast.show" class="mb-4 px-4 py-3 rounded-lg text-sm" :style="toast.type==='success' ? 'background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);color:#22c55e;' : 'background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#ef4444;'">{{ toast.message }}</div>

    <!-- FILTER & SEARCH PANEL -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-5">
      <!-- Search Input -->
      <div class="relative">
        <input v-model="searchQuery" type="text" placeholder="Cari kode slot..." class="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none" style="background:#111c2d;border:1px solid #23324d;color:#e2e8f0;"/>
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" style="color:#94a3b8;">
          <i data-lucide="search" class="w-4 h-4"></i>
        </div>
      </div>
      <!-- Warehouse Filter -->
      <div class="relative">
        <select v-model="filterWarehouse" class="w-full px-3 py-2 rounded-lg text-sm outline-none appearance-none pr-10" style="background:#111c2d;border:1px solid #23324d;color:#e2e8f0;">
          <option value="">Semua Gudang</option>
          <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
          <i data-lucide="chevron-down" class="w-4 h-4"></i>
        </div>
      </div>
      <!-- Category Filter -->
      <div class="relative">
        <select v-model="filterCategory" class="w-full px-3 py-2 rounded-lg text-sm outline-none appearance-none pr-10" style="background:#111c2d;border:1px solid #23324d;color:#e2e8f0;">
          <option value="">Semua Kategori</option>
          <option>Small Asset</option>
          <option>Medium Asset</option>
          <option>Large Asset</option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
          <i data-lucide="chevron-down" class="w-4 h-4"></i>
        </div>
      </div>
      <!-- Status Filter -->
      <div class="relative">
        <select v-model="filterStatus" class="w-full px-3 py-2 rounded-lg text-sm outline-none appearance-none pr-10" style="background:#111c2d;border:1px solid #23324d;color:#e2e8f0;">
          <option value="">Semua Status</option>
          <option value="empty">Kosong</option>
          <option value="filled">Terisi</option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
          <i data-lucide="chevron-down" class="w-4 h-4"></i>
        </div>
      </div>
      <!-- Page Size Selector -->
      <div class="relative">
        <select v-model.number="pageSize" class="w-full px-3 py-2 rounded-lg text-sm outline-none appearance-none pr-10" style="background:#111c2d;border:1px solid #23324d;color:#e2e8f0;">
          <option :value="5">Tampilkan 5 Baris</option>
          <option :value="10">Tampilkan 10 Baris</option>
          <option :value="25">Tampilkan 25 Baris</option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
          <i data-lucide="chevron-down" class="w-4 h-4"></i>
        </div>
      </div>
    </div>

    <!-- TABLE AREA -->
    <div class="rounded-xl overflow-hidden" style="background:#111c2d;border:1px solid #23324d;">
      <div v-if="loading" class="flex items-center justify-center py-16" style="color:#94a3b8;">
        <svg class="animate-spin w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        Memuat data...
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm min-w-[700px]">
          <thead style="background:#162235;border-bottom:1px solid #23324d;">
            <tr>
              <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-left" style="color:#94a3b8; width: 70px;">No.</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 140px;">Kode Slot</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Gudang</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 200px;">Alokasi Aset</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 140px;">Kategori</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 120px;">Status</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Keterangan</th>
              <th v-if="isAdmin" class="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 100px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredBins.length === 0">
              <td :colspan="isAdmin ? 8 : 7" class="text-center py-12" style="color:#475569;">Tidak ada data slot penyimpanan ditemukan.</td>
            </tr>
            <tr v-for="(bin, index) in paginatedBins" :key="bin.id" class="transition-colors" style="border-top:1px solid #23324d;" @mouseenter="$event.currentTarget.style.background='#162235'" @mouseleave="$event.currentTarget.style.background='transparent'">
              <td class="px-5 py-4 font-mono text-xs font-medium" style="color:#94a3b8;">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td class="px-5 py-4 font-mono font-bold text-blue-500" style="color:#3b82f6;">{{ bin.code }}</td>
              <td class="px-5 py-4 font-medium" style="color:#e2e8f0;">{{ bin.warehouse?.name || '–' }}</td>
              <td class="px-5 py-4 text-xs font-semibold" style="color:#94a3b8;">{{ bin.allocatedAsset ? `${bin.allocatedAsset.name} (${bin.allocatedAsset.code})` : '–' }}</td>
              <td class="px-5 py-4">
                <span class="px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap inline-block" :style="bin.category==='Large Asset'?'background:rgba(245,158,11,0.1);color:#f59e0b;border:1px solid rgba(245,158,11,0.2);':bin.category==='Medium Asset'?'background:rgba(6,182,212,0.1);color:#06b6d4;border:1px solid rgba(6,182,212,0.2);':'background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.2);'">{{ bin.category }}</span>
              </td>
              <td class="px-5 py-4">
                <span class="px-2.5 py-1 rounded-md text-xs font-semibold" :style="bin.status==='filled'?'background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2);':'background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.2);'">{{ bin.status==='filled'?'Terisi':'Kosong' }}</span>
              </td>
              <td class="px-5 py-4 text-xs" style="color:#94a3b8;">{{ bin.remarks || '–' }}</td>
              <td v-if="isAdmin" class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openEditModal(bin)" aria-label="Edit Slot" class="group relative p-1.5 rounded-lg flex items-center justify-center" style="color:#94a3b8; cursor:pointer;" @mouseenter="$event.currentTarget.style.color='#2563eb'" @mouseleave="$event.currentTarget.style.color='#94a3b8'">
                    <i data-lucide="edit" class="w-4 h-4"></i>
                    <span class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 bg-slate-950 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                      Edit
                    </span>
                  </button>
                  <button @click="confirmDelete(bin)" aria-label="Hapus Slot" class="group relative p-1.5 rounded-lg flex items-center justify-center" style="color:#94a3b8; cursor:pointer;" @mouseenter="$event.currentTarget.style.color='#ef4444'" @mouseleave="$event.currentTarget.style.color='#94a3b8'">
                    <i data-lucide="trash" class="w-4 h-4"></i>
                    <span class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 bg-slate-950 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                      Hapus
                    </span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PAGINATION PANEL -->
    <div v-if="filteredBins.length > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-sm" style="color:#94a3b8;">
      <p>Menampilkan {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredBins.length) }} dari {{ filteredBins.length }} data</p>
      <div class="flex items-center gap-2">
        <button @click="currentPage--" :disabled="currentPage === 1" class="px-3 py-1.5 rounded-lg border font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed" style="background:#111c2d;border-color:#23324d;color:#e2e8f0;">Sebelumnya</button>
        <span class="px-4 py-1.5 rounded-lg font-mono font-bold" style="background:#0a1220;border:1px solid #23324d;color:#2563eb;">{{ currentPage }} / {{ totalPages }}</span>
        <button @click="currentPage++" :disabled="currentPage === totalPages" class="px-3 py-1.5 rounded-lg border font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed" style="background:#111c2d;border-color:#23324d;color:#e2e8f0;">Selanjutnya</button>
      </div>
    </div>

    <!-- MODAL CREATE/EDIT -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);" @click.self="showModal=false">
      <div class="w-full max-w-lg rounded-2xl p-6" style="background:#111c2d;border:1px solid #23324d;box-shadow:0 25px 50px rgba(0,0,0,0.5);">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-semibold" style="color:#e2e8f0;">{{ editMode ? 'Edit Slot' : 'Tambah Slot Penyimpanan' }}</h3>
          <button @click="showModal=false" style="color:#94a3b8;"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <form @submit.prevent="handleSave" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="warehouseSelect" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Gudang <span style="color:#ef4444;">*</span></label>
              <div class="relative">
                <select id="warehouseSelect" name="warehouseSelect" v-model="form.warehouseId" required class="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none pr-10" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;">
                  <option value="">-- Pilih Gudang --</option>
                  <option v-for="wh in warehouses" :key="wh.id" :value="wh.id">{{ wh.name }} ({{ wh.code }})</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
                  <i data-lucide="chevron-down" class="w-4 h-4"></i>
                </div>
              </div>
            </div>
            <div>
              <label for="binCodeInput" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Kode Slot</label>
              <input id="binCodeInput" name="binCodeInput" :value="editMode ? form.code : 'Otomatis (WHCode_XXX)'" type="text" disabled class="w-full px-3 py-2.5 rounded-lg text-sm outline-none font-mono opacity-50 cursor-not-allowed" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;"/>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="binCategorySelect" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Kategori Slot <span style="color:#ef4444;">*</span></label>
              <div class="relative">
                <select id="binCategorySelect" name="binCategorySelect" v-model="form.category" required class="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none pr-10" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;">
                  <option value="">-- Pilih Kategori --</option>
                  <option>Small Asset</option><option>Medium Asset</option><option>Large Asset</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
                  <i data-lucide="chevron-down" class="w-4 h-4"></i>
                </div>
              </div>
            </div>
            <div>
              <label for="binStatusSelect" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Status Slot</label>
              <div class="relative">
                <select id="binStatusSelect" name="binStatusSelect" v-model="form.status" class="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none pr-10" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;">
                  <option value="empty">Kosong</option><option value="filled">Terisi</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
                  <i data-lucide="chevron-down" class="w-4 h-4"></i>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label for="binAssetSelect" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Alokasi Aset (Sesuai Ukuran Slot) <span style="color:#ef4444;">*</span></label>
            <div class="relative">
              <select id="binAssetSelect" name="binAssetSelect" v-model="form.assetId" required :disabled="!form.category" class="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none pr-10 disabled:opacity-50 disabled:cursor-not-allowed" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;">
                <option value="">{{ form.category ? '-- Pilih Aset --' : '-- Pilih Kategori Slot Terlebih Dahulu --' }}</option>
                <option v-for="ast in filteredAssetsForBin" :key="ast.id" :value="ast.id">{{ ast.name }} ({{ ast.code }})</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
                <i data-lucide="chevron-down" class="w-4 h-4"></i>
              </div>
            </div>
          </div>
          <div>
            <label for="binRemarksInput" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Keterangan</label>
            <input id="binRemarksInput" name="binRemarksInput" v-model="form.remarks" type="text" placeholder="Catatan/Keterangan opsional..." class="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;"/>
          </div>

          <div v-if="formError" class="text-xs p-3 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-500 font-medium whitespace-pre-wrap">{{ formError }}</div>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="showModal=false" class="flex-1 py-2.5 rounded-lg text-sm font-semibold" style="background:#162235;color:#94a3b8;border:1px solid #23324d;">Batal</button>
            <button type="submit" :disabled="saving" class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style="background:linear-gradient(135deg,#2563eb,#1d4ed8);">{{ saving?'Menyimpan...':(editMode?'Simpan':'Tambah') }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL DELETE -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.7);" @click.self="showDeleteModal=false">
      <div class="w-full max-w-sm rounded-2xl p-6" style="background:#111c2d;border:1px solid #23324d;">
        <h3 class="font-semibold mb-2" style="color:#e2e8f0;">Hapus Slot?</h3>
        <p class="text-sm mb-5" style="color:#94a3b8;">Hapus slot <span class="font-semibold font-mono" style="color:#e2e8f0;">{{ deleteTarget?.code }}</span>? Tindakan ini tidak dapat dibatalkan.</p>
        <div class="flex gap-3">
          <button @click="showDeleteModal=false" class="flex-1 py-2.5 rounded-lg text-sm font-semibold" style="background:#162235;color:#94a3b8;border:1px solid #23324d;">Batal</button>
          <button @click="handleDelete" :disabled="saving" class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style="background:#ef4444;">{{ saving?'Menghapus...':'Ya, Hapus' }}</button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import { useAuthStore } from '../stores/auth.js';
import api from '../services/api.js';

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);
const bins = ref([]);
const warehouses = ref([]);
const assets = ref([]);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const showDeleteModal = ref(false);
const editMode = ref(false);
const editId = ref(null);
const deleteTarget = ref(null);
const formError = ref('');
const toast = reactive({ show: false, type: 'success', message: '' });
const form = reactive({ warehouseId: '', code: '', category: '', assetId: '', status: 'empty', remarks: '' });

// Client side search, filter & pagination state
const searchQuery = ref('');
const debouncedSearch = ref('');
let debounceTimer = null;
watch(searchQuery, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { debouncedSearch.value = val; }, 300);
});
const filterWarehouse = ref('');
const filterCategory = ref('');
const filterStatus = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

function showToast(msg, type = 'success') { toast.show=true; toast.type=type; toast.message=msg; setTimeout(()=>{toast.show=false;},3500); }

async function fetchData() {
  loading.value = true;
  try {
    const [b, w, a] = await Promise.all([api.get('/storage-bins'), api.get('/warehouses'), api.get('/assets')]);
    bins.value = b.data.data; warehouses.value = w.data.data; assets.value = a.data.data;
  } catch { showToast('Gagal memuat data','error'); } finally { loading.value = false; }
}

const filteredBins = computed(() => {
  return bins.value.filter(bin => {
    const matchesSearch = !debouncedSearch.value || bin.code.toLowerCase().includes(debouncedSearch.value.toLowerCase());
    const matchesWarehouse = !filterWarehouse.value || bin.warehouseId === filterWarehouse.value || bin.warehouse?.id === filterWarehouse.value;
    const matchesCategory = !filterCategory.value || bin.category === filterCategory.value;
    const matchesStatus = !filterStatus.value || bin.status === filterStatus.value;
    return matchesSearch && matchesWarehouse && matchesCategory && matchesStatus;
  });
});

const paginatedBins = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredBins.value.slice(start, start + pageSize.value);
});

const totalPages = computed(() => {
  return Math.ceil(filteredBins.value.length / pageSize.value) || 1;
});

const filteredAssetsForBin = computed(() => {
  if (!form.category) return [];
  return assets.value.filter(a => a.category === form.category);
});

// Watch filtering states to reset back to page 1
watch([searchQuery, filterWarehouse, filterCategory, filterStatus, pageSize], () => {
  currentPage.value = 1;
});

// Watch category to reset assetId if it does not match
watch(() => form.category, (newCat) => {
  if (newCat && form.assetId) {
    const currentAsset = assets.value.find(a => a.id === form.assetId);
    if (currentAsset && currentAsset.category !== newCat) {
      form.assetId = '';
    }
  }
});

function openCreateModal() { editMode.value=false; editId.value=null; formError.value=''; Object.assign(form,{warehouseId:'',code:'',category:'',assetId:'',status:'empty',remarks:''}); showModal.value=true; }
function openEditModal(bin) { editMode.value=true; editId.value=bin.id; formError.value=''; Object.assign(form,{warehouseId:bin.warehouseId||bin.warehouse?.id||'',code:bin.code,category:bin.category,assetId:bin.assetId||bin.allocatedAsset?.id||'',status:bin.status,remarks:bin.remarks||''}); showModal.value=true; }
function confirmDelete(bin) { deleteTarget.value=bin; showDeleteModal.value=true; }

async function handleSave() {
  saving.value=true; formError.value='';
  try {
    if (editMode.value) { await api.put(`/storage-bins/${editId.value}`,form); showToast('Slot berhasil diperbarui'); }
    else { await api.post('/storage-bins',form); showToast('Slot baru berhasil ditambahkan'); }
    showModal.value=false; await fetchData();
  } catch(e) {
    let errText = e.response?.data?.message || 'Gagal menyimpan data';
    if (e.response?.data?.errors) {
      const errorList = [];
      for (const [key, value] of Object.entries(e.response.data.errors)) {
        const fieldName = key === 'warehouseId' ? 'Gudang' : 
                          key === 'assetId' ? 'Alokasi Aset' : 
                          key === 'category' ? 'Kategori' : 
                          key === 'code' ? 'Kode Slot' : key;
        errorList.push(`${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`);
      }
      if (errorList.length > 0) {
        errText = `Validasi gagal:\n- ${errorList.join('\n- ')}`;
      }
    }
    formError.value = errText;
  } finally { saving.value=false; }
}

async function handleDelete() {
  saving.value=true;
  try { await api.delete(`/storage-bins/${deleteTarget.value.id}`); showToast('Slot berhasil dihapus'); showDeleteModal.value=false; await fetchData(); }
  catch(e) { showToast(e.response?.data?.message||'Gagal menghapus','error'); showDeleteModal.value=false; } finally { saving.value=false; }
}

onMounted(() => {
  fetchData();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
</script>
