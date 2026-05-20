<template>
  <DashboardLayout>
    <!-- Header Halaman -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-bold" style="color:#e2e8f0;">Manajemen Gudang</h1>
        <p class="text-sm mt-0.5" style="color:#94a3b8;">Kelola data gudang penyimpanan aset</p>
      </div>
      <button v-if="isAdmin" @click="openCreateModal" class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
              style="background: linear-gradient(135deg, #2563eb, #1d4ed8);">
        <i data-lucide="plus" class="w-4 h-4"></i>
        Tambah Gudang
      </button>
    </div>

    <!-- Alert error/sukses -->
    <div v-if="toast.show" class="mb-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2 transition-all"
         :style="toast.type === 'success' ? 'background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); color:#22c55e;' : 'background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:#ef4444;'">
      {{ toast.message }}
    </div>

    <!-- FILTER & SEARCH PANEL -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5">
      <!-- Search Input -->
      <div class="relative sm:col-span-2">
        <input v-model="searchQuery" type="text" placeholder="Cari nama gudang/lokasi..." class="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none" style="background:#111c2d;border:1px solid #23324d;color:#e2e8f0;"/>
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" style="color:#94a3b8;">
          <i data-lucide="search" class="w-4 h-4"></i>
        </div>
      </div>
      <!-- Page Size Selector -->
      <div class="relative sm:col-start-1 md:col-start-4">
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

    <!-- Tabel Gudang -->
    <div class="rounded-xl overflow-hidden" style="background:#111c2d; border:1px solid #23324d;">
      <div v-if="loading" class="flex items-center justify-center py-16" style="color:#94a3b8;">
        <svg class="animate-spin w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        Memuat data...
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm min-w-[700px]">
          <thead style="background:#162235; border-bottom:1px solid #23324d;">
            <tr>
              <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-left" style="color:#94a3b8; width: 70px;">No.</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 140px;">No. Gudang</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 220px;">Nama Gudang</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Lokasi</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 150px;">Kapasitas</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Keterangan</th>
              <th v-if="isAdmin" class="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 100px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredWarehouses.length === 0">
              <td :colspan="isAdmin ? 7 : 6" class="text-center py-12" style="color:#475569;">Tidak ada data gudang ditemukan.</td>
            </tr>
            <tr v-for="(wh, index) in paginatedWarehouses" :key="wh.id"
                class="transition-colors" style="border-top:1px solid #23324d;"
                @mouseenter="$event.currentTarget.style.background='#162235'" @mouseleave="$event.currentTarget.style.background='transparent'">
              <td class="px-5 py-4 font-mono text-xs font-medium" style="color:#94a3b8;">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td class="px-5 py-4 font-mono text-xs font-bold text-blue-500" style="color:#3b82f6;">{{ wh.code }}</td>
              <td class="px-5 py-4 font-medium" style="color:#e2e8f0;">{{ wh.name }}</td>
              <td class="px-5 py-4" style="color:#94a3b8;">{{ wh.location || '–' }}</td>
              <td class="px-5 py-4">
                <span class="px-2.5 py-1 rounded-md text-xs font-semibold" style="background:rgba(37,99,235,0.1); color:#2563eb; border:1px solid rgba(37,99,235,0.2);">
                  {{ wh.capacity }} slot
                </span>
              </td>
              <td class="px-5 py-4 max-w-xs truncate" style="color:#94a3b8;">{{ wh.description || '–' }}</td>
              <td v-if="isAdmin" class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openEditModal(wh)" aria-label="Edit Gudang" class="group relative p-1.5 rounded-lg flex items-center justify-center" style="color:#94a3b8; cursor:pointer;" 
                          @mouseenter="$event.currentTarget.style.color='#2563eb'"
                          @mouseleave="$event.currentTarget.style.color='#94a3b8'">
                    <i data-lucide="edit" class="w-4 h-4"></i>
                    <span class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 bg-slate-950 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                      Edit
                    </span>
                  </button>
                  <button @click="confirmDelete(wh)" aria-label="Hapus Gudang" class="group relative p-1.5 rounded-lg flex items-center justify-center" style="color:#94a3b8; cursor:pointer;"
                          @mouseenter="$event.currentTarget.style.color='#ef4444'"
                          @mouseleave="$event.currentTarget.style.color='#94a3b8'">
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
    <div v-if="filteredWarehouses.length > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-sm" style="color:#94a3b8;">
      <p>Menampilkan {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredWarehouses.length) }} dari {{ filteredWarehouses.length }} data</p>
      <div class="flex items-center gap-2">
        <button @click="currentPage--" :disabled="currentPage === 1" class="px-3 py-1.5 rounded-lg border font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed" style="background:#111c2d;border-color:#23324d;color:#e2e8f0;">Sebelumnya</button>
        <span class="px-4 py-1.5 rounded-lg font-mono font-bold" style="background:#0a1220;border:1px solid #23324d;color:#2563eb;">{{ currentPage }} / {{ totalPages }}</span>
        <button @click="currentPage++" :disabled="currentPage === totalPages" class="px-3 py-1.5 rounded-lg border font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed" style="background:#111c2d;border-color:#23324d;color:#e2e8f0;">Selanjutnya</button>
      </div>
    </div>

    <!-- MODAL CREATE/EDIT GUDANG -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
         style="background:rgba(0,0,0,0.7); backdrop-filter:blur(4px);" @click.self="showModal=false">
      <div class="w-full max-w-lg rounded-2xl p-6" style="background:#111c2d; border:1px solid #23324d; box-shadow:0 25px 50px rgba(0,0,0,0.5);">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold" style="color:#e2e8f0;">{{ editMode ? 'Edit Gudang' : 'Tambah Gudang Baru' }}</h3>
          <button @click="showModal=false" class="p-1 rounded-lg" style="color:#94a3b8;" @mouseenter="$event.currentTarget.style.color='#e2e8f0'" @mouseleave="$event.currentTarget.style.color='#94a3b8'">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        <form @submit.prevent="handleSave" class="space-y-4">
          <div>
            <label for="warehouseNameInput" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Nama Gudang <span style="color:#ef4444;">*</span></label>
            <input id="warehouseNameInput" name="warehouseNameInput" v-model="form.name" type="text" required placeholder="cth. Gudang Utama Jakarta" class="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;" @focus="$event.target.style.borderColor='#2563eb'" @blur="$event.target.style.borderColor='#23324d'"/>
          </div>
          <div>
            <label for="warehouseLocationInput" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Lokasi</label>
            <input id="warehouseLocationInput" name="warehouseLocationInput" v-model="form.location" type="text" placeholder="cth. Kawasan Industri Pulogadung" class="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;" @focus="$event.target.style.borderColor='#2563eb'" @blur="$event.target.style.borderColor='#23324d'"/>
          </div>
          <div>
            <label for="warehouseCapacityInput" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Kapasitas Slot</label>
            <input id="warehouseCapacityInput" name="warehouseCapacityInput" v-model.number="form.capacity" type="number" min="0" placeholder="0" class="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;" @focus="$event.target.style.borderColor='#2563eb'" @blur="$event.target.style.borderColor='#23324d'"/>
          </div>
          <div>
            <label for="warehouseDescriptionTextarea" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Keterangan</label>
            <textarea id="warehouseDescriptionTextarea" name="warehouseDescriptionTextarea" v-model="form.description" rows="3" placeholder="Deskripsi singkat gudang..." class="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;" @focus="$event.target.style.borderColor='#2563eb'" @blur="$event.target.style.borderColor='#23324d'"></textarea>
          </div>
          <p v-if="formError" class="text-sm" style="color:#ef4444;">{{ formError }}</p>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="showModal=false" class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors" style="background:#162235; color:#94a3b8; border:1px solid #23324d;" @mouseenter="$event.target.style.color='#e2e8f0'" @mouseleave="$event.target.style.color='#94a3b8'">Batal</button>
            <button type="submit" :disabled="saving" class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all" style="background:linear-gradient(135deg,#2563eb,#1d4ed8);">
              {{ saving ? 'Menyimpan...' : (editMode ? 'Simpan Perubahan' : 'Tambah Gudang') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL KONFIRMASI DELETE -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
         style="background:rgba(0,0,0,0.7); backdrop-filter:blur(4px);" @click.self="showDeleteModal=false">
      <div class="w-full max-w-sm rounded-2xl p-6" style="background:#111c2d; border:1px solid #23324d;">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background:rgba(239,68,68,0.15);">
            <i data-lucide="alert-triangle" class="w-5 h-5" style="color:#ef4444;"></i>
          </div>
          <div>
            <h3 class="font-semibold" style="color:#e2e8f0;">Hapus Gudang?</h3>
            <p class="text-sm mt-0.5" style="color:#94a3b8;">Tindakan ini tidak dapat dibatalkan.</p>
          </div>
        </div>
        <p class="text-sm mb-5" style="color:#94a3b8;">Anda akan menghapus gudang <span class="font-semibold" style="color:#e2e8f0;">{{ deleteTarget?.name }}</span>. Pastikan tidak ada slot aktif di gudang ini.</p>
        <div class="flex gap-3">
          <button @click="showDeleteModal=false" class="flex-1 py-2.5 rounded-lg text-sm font-semibold" style="background:#162235; color:#94a3b8; border:1px solid #23324d;">Batal</button>
          <button @click="handleDelete" :disabled="saving" class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style="background:#ef4444;">
            {{ saving ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
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

// State data
const warehouses = ref([]);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const showDeleteModal = ref(false);
const editMode = ref(false);
const editId = ref(null);
const deleteTarget = ref(null);
const formError = ref('');
const toast = reactive({ show: false, type: 'success', message: '' });

const form = reactive({ name: '', location: '', capacity: 0, description: '' });

// Client side search & pagination state
const searchQuery = ref('');
const debouncedSearch = ref('');
let debounceTimer = null;
watch(searchQuery, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { debouncedSearch.value = val; }, 300);
});
const currentPage = ref(1);
const pageSize = ref(10);

/** Menampilkan notifikasi singkat */
function showToast(message, type = 'success') {
  toast.show = true; toast.type = type; toast.message = message;
  setTimeout(() => { toast.show = false; }, 3500);
}

/** Memuat ulang daftar gudang dari API */
async function fetchWarehouses() {
  loading.value = true;
  try {
    const { data } = await api.get('/warehouses');
    warehouses.value = data.data;
  } catch (e) {
    showToast('Gagal memuat data gudang', 'error');
  } finally { loading.value = false; }
}

const filteredWarehouses = computed(() => {
  return warehouses.value.filter(wh => {
    return !debouncedSearch.value ||
      wh.name.toLowerCase().includes(debouncedSearch.value.toLowerCase()) ||
      (wh.location && wh.location.toLowerCase().includes(debouncedSearch.value.toLowerCase())) ||
      (wh.description && wh.description.toLowerCase().includes(debouncedSearch.value.toLowerCase()));
  });
});

const paginatedWarehouses = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredWarehouses.value.slice(start, start + pageSize.value);
});

const totalPages = computed(() => {
  return Math.ceil(filteredWarehouses.value.length / pageSize.value) || 1;
});

// Watch filtering states to reset back to page 1
watch([searchQuery, pageSize], () => {
  currentPage.value = 1;
});

/** Membuka modal tambah gudang baru */
function openCreateModal() {
  editMode.value = false; editId.value = null; formError.value = '';
  form.name = ''; form.location = ''; form.capacity = 0; form.description = '';
  showModal.value = true;
}

/** Membuka modal edit dengan data gudang yang dipilih */
function openEditModal(wh) {
  editMode.value = true; editId.value = wh.id; formError.value = '';
  form.name = wh.name; form.location = wh.location || ''; form.capacity = wh.capacity; form.description = wh.description || '';
  showModal.value = true;
}

/** Konfirmasi hapus gudang */
function confirmDelete(wh) { deleteTarget.value = wh; showDeleteModal.value = true; }

/** Menyimpan data gudang baru atau hasil edit */
async function handleSave() {
  saving.value = true; formError.value = '';
  try {
    if (editMode.value) {
      await api.put(`/warehouses/${editId.value}`, form);
      showToast('Gudang berhasil diperbarui');
    } else {
      await api.post('/warehouses', form);
      showToast('Gudang baru berhasil ditambahkan');
    }
    showModal.value = false;
    await fetchWarehouses();
  } catch (e) {
    formError.value = e.response?.data?.message || 'Gagal menyimpan data';
  } finally { saving.value = false; }
}

/** Menghapus gudang yang dipilih */
async function handleDelete() {
  saving.value = true;
  try {
    await api.delete(`/warehouses/${deleteTarget.value.id}`);
    showToast('Gudang berhasil dihapus');
    showDeleteModal.value = false;
    await fetchWarehouses();
  } catch (e) {
    showToast(e.response?.data?.message || 'Gagal menghapus gudang', 'error');
    showDeleteModal.value = false;
  } finally { saving.value = false; }
}

onMounted(() => {
  fetchWarehouses();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
</script>
