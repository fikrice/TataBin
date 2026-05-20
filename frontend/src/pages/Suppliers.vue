<template>
  <DashboardLayout>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-bold" style="color:#e2e8f0;">Data Pemasok</h1>
        <p class="text-sm mt-0.5" style="color:#94a3b8;">Kelola informasi supplier dan vendor</p>
      </div>
      <button v-if="isAdmin" @click="openCreateModal" class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white" style="background:linear-gradient(135deg,#2563eb,#1d4ed8);">
        <i data-lucide="plus" class="w-4 h-4"></i>
        Tambah Pemasok
      </button>
    </div>

    <!-- Alert toast -->
    <div v-if="toast.show" class="mb-4 px-4 py-3 rounded-lg text-sm" :style="toast.type==='success'?'background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);color:#22c55e;':'background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#ef4444;'">{{ toast.message }}</div>

    <!-- FILTER & SEARCH PANEL -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5">
      <!-- Search Input -->
      <div class="relative sm:col-span-2">
        <input v-model="searchQuery" type="text" placeholder="Cari nama, kode, kontak..." class="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none" style="background:#111c2d;border:1px solid #23324d;color:#e2e8f0;"/>
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

    <!-- TABLE AREA -->
    <div class="rounded-xl overflow-hidden" style="background:#111c2d;border:1px solid #23324d;">
      <div v-if="loading" class="flex items-center justify-center py-16" style="color:#94a3b8;">
        <svg class="animate-spin w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Memuat data...
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm min-w-[700px]">
          <thead style="background:#162235;border-bottom:1px solid #23324d;">
            <tr>
              <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-left" style="color:#94a3b8; width: 70px;">No.</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 150px;">Kode</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Nama Pemasok</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 140px;">Kategori</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 180px;">Kontak</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Alamat</th>
              <th v-if="isAdmin" class="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 100px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredSuppliers.length===0">
              <td :colspan="isAdmin ? 7 : 6" class="text-center py-12" style="color:#475569;">Tidak ada data pemasok ditemukan.</td>
            </tr>
            <tr v-for="(s, index) in paginatedSuppliers" :key="s.id" class="transition-colors" style="border-top:1px solid #23324d;" @mouseenter="$event.currentTarget.style.background='#162235'" @mouseleave="$event.currentTarget.style.background='transparent'">
              <td class="px-5 py-4 font-mono text-xs font-medium" style="color:#94a3b8;">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td class="px-5 py-4 font-mono text-xs font-bold text-blue-500" style="color:#3b82f6;">{{ s.code }}</td>
              <td class="px-5 py-4 font-medium" style="color:#e2e8f0;">{{ s.name }}</td>
              <td class="px-5 py-4">
                <span class="px-2.5 py-1 rounded-md text-xs font-semibold" :style="s.category==='Import'?'background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2);':'background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.2);'">{{ s.category }}</span>
              </td>
              <td class="px-5 py-4 font-mono text-xs" style="color:#94a3b8;">{{ s.contact || '–' }}</td>
              <td class="px-5 py-4 max-w-xs truncate" style="color:#94a3b8;">{{ s.address || '–' }}</td>
              <td v-if="isAdmin" class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openEditModal(s)" aria-label="Edit Pemasok" class="group relative p-1.5 rounded-lg flex items-center justify-center" style="color:#94a3b8; cursor:pointer;" @mouseenter="$event.currentTarget.style.color='#2563eb'" @mouseleave="$event.currentTarget.style.color='#94a3b8'">
                    <i data-lucide="edit" class="w-4 h-4"></i>
                    <span class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 bg-slate-950 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                      Edit
                    </span>
                  </button>
                  <button @click="confirmDelete(s)" aria-label="Hapus Pemasok" class="group relative p-1.5 rounded-lg flex items-center justify-center" style="color:#94a3b8; cursor:pointer;" @mouseenter="$event.currentTarget.style.color='#ef4444'" @mouseleave="$event.currentTarget.style.color='#94a3b8'">
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
    <div v-if="filteredSuppliers.length > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-sm" style="color:#94a3b8;">
      <p>Menampilkan {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredSuppliers.length) }} dari {{ filteredSuppliers.length }} data</p>
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
          <h3 class="text-lg font-semibold" style="color:#e2e8f0;">{{ editMode ? 'Edit Pemasok' : 'Tambah Pemasok Baru' }}</h3>
          <button @click="showModal=false" style="color:#94a3b8;"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <form @submit.prevent="handleSave" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="supplierCodeInput" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Kode Pemasok</label>
              <input id="supplierCodeInput" name="supplierCodeInput" :value="editMode ? form.code : 'Otomatis (SUP_XX)'" type="text" disabled class="w-full px-3 py-2.5 rounded-lg text-sm outline-none font-mono opacity-50 cursor-not-allowed" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;"/>
            </div>
            <div>
              <label for="supplierCategorySelect" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Kategori <span style="color:#ef4444;">*</span></label>
              <div class="relative">
                <select id="supplierCategorySelect" name="supplierCategorySelect" v-model="form.category" required class="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none pr-10" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;">
                  <option value="Local">Local</option>
                  <option value="Import">Import</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
                  <i data-lucide="chevron-down" class="w-4 h-4"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="supplierNameInput" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Nama Pemasok <span style="color:#ef4444;">*</span></label>
              <input id="supplierNameInput" name="supplierNameInput" v-model="form.name" type="text" required placeholder="PT / CV / UD..." class="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;"/>
            </div>
            <div>
              <label for="supplierContactInput" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Nomor Kontak</label>
              <input id="supplierContactInput" name="supplierContactInput" v-model="form.contact" type="text" placeholder="08xxxxxxxxxx" class="w-full px-3 py-2.5 rounded-lg text-sm outline-none font-mono" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;"/>
            </div>
          </div>
          <div>
            <label for="supplierAddressTextarea" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Alamat</label>
            <textarea id="supplierAddressTextarea" name="supplierAddressTextarea" v-model="form.address" rows="2" placeholder="Alamat lengkap pemasok..." class="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;"></textarea>
          </div>
          <p v-if="formError" class="text-sm" style="color:#ef4444;">{{ formError }}</p>
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
        <h3 class="font-semibold mb-2" style="color:#e2e8f0;">Hapus Pemasok?</h3>
        <p class="text-sm mb-5" style="color:#94a3b8;">Hapus pemasok <span class="font-semibold" style="color:#e2e8f0;">{{ deleteTarget?.name }}</span>?</p>
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
const suppliers = ref([]);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const showDeleteModal = ref(false);
const editMode = ref(false);
const editId = ref(null);
const deleteTarget = ref(null);
const formError = ref('');
const toast = reactive({ show: false, type: 'success', message: '' });
const form = reactive({ code: '', name: '', contact: '', category: 'Local', address: '' });

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

function showToast(msg, type = 'success') { toast.show=true; toast.type=type; toast.message=msg; setTimeout(()=>{toast.show=false;},3500); }

async function fetchSuppliers() {
  loading.value=true;
  try { const { data } = await api.get('/suppliers'); suppliers.value=data.data; }
  catch { showToast('Gagal memuat data pemasok','error'); } finally { loading.value=false; }
}

const filteredSuppliers = computed(() => {
  return suppliers.value.filter(s => {
    return !debouncedSearch.value ||
      s.name.toLowerCase().includes(debouncedSearch.value.toLowerCase()) ||
      s.code.toLowerCase().includes(debouncedSearch.value.toLowerCase()) ||
      (s.contact && s.contact.toLowerCase().includes(debouncedSearch.value.toLowerCase())) ||
      (s.address && s.address.toLowerCase().includes(debouncedSearch.value.toLowerCase()));
  });
});

const paginatedSuppliers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredSuppliers.value.slice(start, start + pageSize.value);
});

const totalPages = computed(() => {
  return Math.ceil(filteredSuppliers.value.length / pageSize.value) || 1;
});

// Watch filtering states to reset back to page 1
watch([searchQuery, pageSize], () => {
  currentPage.value = 1;
});

function openCreateModal() { editMode.value=false; editId.value=null; formError.value=''; Object.assign(form,{code:'',name:'',contact:'',category:'Local',address:''}); showModal.value=true; }
function openEditModal(s) { editMode.value=true; editId.value=s.id; formError.value=''; Object.assign(form,{code:s.code,name:s.name,contact:s.contact||'',category:s.category||'Local',address:s.address||''}); showModal.value=true; }
function confirmDelete(s) { deleteTarget.value=s; showDeleteModal.value=true; }

async function handleSave() {
  saving.value=true; formError.value='';
  try {
    if (editMode.value) { await api.put(`/suppliers/${editId.value}`,form); showToast('Pemasok berhasil diperbarui'); }
    else { await api.post('/suppliers',form); showToast('Pemasok baru berhasil ditambahkan'); }
    showModal.value=false; await fetchSuppliers();
  } catch(e) { formError.value=e.response?.data?.message||'Gagal menyimpan data'; } finally { saving.value=false; }
}

async function handleDelete() {
  saving.value=true;
  try { await api.delete(`/suppliers/${deleteTarget.value.id}`); showToast('Pemasok berhasil dihapus'); showDeleteModal.value=false; await fetchSuppliers(); }
  catch(e) { showToast(e.response?.data?.message||'Gagal menghapus','error'); showDeleteModal.value=false; } finally { saving.value=false; }
}

onMounted(() => {
  fetchSuppliers();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
</script>
