<template>
  <DashboardLayout>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-bold" style="color:#e2e8f0;">Katalog Aset</h1>
        <p class="text-sm mt-0.5" style="color:#94a3b8;">Kelola data aset dan inventaris</p>
      </div>
      <button v-if="isAdmin" @click="openCreateModal" class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white" style="background:linear-gradient(135deg,#2563eb,#1d4ed8);">
        <i data-lucide="plus" class="w-4 h-4"></i>
        Tambah Aset
      </button>
    </div>

    <!-- Alert toast -->
    <div v-if="toast.show" class="mb-4 px-4 py-3 rounded-lg text-sm" :style="toast.type==='success'?'background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);color:#22c55e;':'background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#ef4444;'">{{ toast.message }}</div>

    <!-- FILTER & SEARCH PANEL -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5">
      <!-- Search Input -->
      <div class="relative">
        <input v-model="searchQuery" type="text" placeholder="Cari nama/SKU..." class="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none" style="background:#111c2d;border:1px solid #23324d;color:#e2e8f0;"/>
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" style="color:#94a3b8;">
          <i data-lucide="search" class="w-4 h-4"></i>
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
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 140px;">Kode SKU</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Nama Aset</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 140px;">Kategori</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 200px;">Deskripsi</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 180px;">Pemasok</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 150px;">Harga Satuan</th>
              <th v-if="isAdmin" class="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 100px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredAssets.length===0">
              <td :colspan="isAdmin ? 8 : 7" class="text-center py-12" style="color:#475569;">Tidak ada data aset ditemukan.</td>
            </tr>
            <tr v-for="(a, index) in paginatedAssets" :key="a.id" class="transition-colors" style="border-top:1px solid #23324d;" @mouseenter="$event.currentTarget.style.background='#162235'" @mouseleave="$event.currentTarget.style.background='transparent'">
              <td class="px-5 py-4 font-mono text-xs font-medium" style="color:#94a3b8;">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td class="px-5 py-4 font-mono text-xs font-bold text-blue-500" style="color:#3b82f6;">{{ a.code }}</td>
              <td class="px-5 py-4 font-medium" style="color:#e2e8f0;">{{ a.name }}</td>
              <td class="px-5 py-4">
                <span class="px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap inline-block" :style="a.category==='Large Asset'?'background:rgba(245,158,11,0.1);color:#f59e0b;border:1px solid rgba(245,158,11,0.2);':a.category==='Medium Asset'?'background:rgba(6,182,212,0.1);color:#06b6d4;border:1px solid rgba(6,182,212,0.2);':'background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.2);'">{{ a.category }}</span>
              </td>
              <td class="px-5 py-4 text-xs" style="color:#94a3b8;" :title="a.description || '-'">{{ a.description || '–' }}</td>
              <td class="px-5 py-4 text-xs" style="color:#94a3b8;">{{ a.supplier?.name || '–' }}</td>
              <td class="px-5 py-4 font-mono" style="color:#94a3b8;">Rp {{ Number(a.price).toLocaleString('id-ID') }}</td>
              <td v-if="isAdmin" class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openEditModal(a)" aria-label="Edit Aset" class="group relative p-1.5 rounded-lg flex items-center justify-center" style="color:#94a3b8; cursor:pointer;" @mouseenter="$event.currentTarget.style.color='#2563eb'" @mouseleave="$event.currentTarget.style.color='#94a3b8'">
                    <i data-lucide="edit" class="w-4 h-4"></i>
                    <span class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 bg-slate-950 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                      Edit
                    </span>
                  </button>
                  <button @click="confirmDelete(a)" aria-label="Hapus Aset" class="group relative p-1.5 rounded-lg flex items-center justify-center" style="color:#94a3b8; cursor:pointer;" @mouseenter="$event.currentTarget.style.color='#ef4444'" @mouseleave="$event.currentTarget.style.color='#94a3b8'">
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
    <div v-if="filteredAssets.length > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-sm" style="color:#94a3b8;">
      <p>Menampilkan {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredAssets.length) }} dari {{ filteredAssets.length }} data</p>
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
          <h3 class="text-lg font-semibold" style="color:#e2e8f0;">{{ editMode ? 'Edit Aset' : 'Tambah Aset Baru' }}</h3>
          <button @click="showModal=false" style="color:#94a3b8;"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <form @submit.prevent="handleSave" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="skuInput" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Kode SKU</label>
              <input id="skuInput" name="skuInput" :value="editMode ? form.code : 'Otomatis (AST_XX)'" type="text" disabled class="w-full px-3 py-2.5 rounded-lg text-sm outline-none font-mono opacity-50 cursor-not-allowed" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;"/>
            </div>
            <div>
              <label for="categorySelect" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Kategori <span style="color:#ef4444;">*</span></label>
              <div class="relative">
                <select id="categorySelect" name="categorySelect" v-model="form.category" required class="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none pr-10" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;">
                  <option value="">-- Pilih --</option>
                  <option>Small Asset</option><option>Medium Asset</option><option>Large Asset</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
                  <i data-lucide="chevron-down" class="w-4 h-4"></i>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label for="assetNameInput" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Nama Aset <span style="color:#ef4444;">*</span></label>
            <input id="assetNameInput" name="assetNameInput" v-model="form.name" type="text" required placeholder="Nama produk/aset..." class="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;"/>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="priceInput" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Harga Satuan (Rp) <span style="color:#ef4444;">*</span></label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style="color:#94a3b8;">
                  <span class="text-xs font-bold font-mono">Rp</span>
                </div>
                <input
                  id="priceInput"
                  name="priceInput"
                  type="text"
                  inputmode="numeric"
                  :value="priceFormatted"
                  @keydown="onPriceKeydown"
                  @input="onPriceInput"
                  placeholder="Masukkan harga"
                  class="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none font-mono"
                  style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;"/>
              </div>
            </div>
            <div>
              <label for="supplierSelect" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Pemasok (Supplier)</label>
              <div class="relative">
                <select id="supplierSelect" name="supplierSelect" v-model="form.supplierId" class="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none pr-10" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;">
                  <option value="">-- Tanpa Pemasok --</option>
                  <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">{{ sup.name }} ({{ sup.code }})</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
                  <i data-lucide="chevron-down" class="w-4 h-4"></i>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label for="descriptionTextarea" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Deskripsi</label>
            <textarea id="descriptionTextarea" name="descriptionTextarea" v-model="form.description" rows="2" class="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;"></textarea>
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
        <h3 class="font-semibold mb-2" style="color:#e2e8f0;">Hapus Aset?</h3>
        <p class="text-sm mb-5" style="color:#94a3b8;">Hapus aset <span class="font-semibold" style="color:#e2e8f0;">{{ deleteTarget?.name }}</span>? Data ini tidak dapat dipulihkan.</p>
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
const assets = ref([]);
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
const form = reactive({ code: '', name: '', category: '', price: 0, description: '', supplierId: '' });

// ─── Rupiah formatter ────────────────────────────────────────────────────────
const priceFormatted = ref('');

function formatRupiah(num) {
  const n = Number(num);
  return (n > 0) ? n.toLocaleString('id-ID') : '';
}

function onPriceKeydown(event) {
  const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Tab','Home','End'];
  if (!allowed.includes(event.key) && !/^\d$/.test(event.key)) {
    event.preventDefault();
  }
}

function onPriceInput(event) {
  const el = event.target;
  const digits = el.value.replace(/[^\d]/g, '');
  const numericValue = digits === '' ? 0 : parseInt(digits, 10);
  form.price = numericValue;
  const formatted = numericValue > 0 ? formatRupiah(numericValue) : '';
  priceFormatted.value = formatted;
  el.value = formatted;
  const len = formatted.length;
  el.setSelectionRange(len, len);
}

function setPriceFormatted(value) {
  form.price = Number(value) || 0;
  priceFormatted.value = form.price > 0 ? formatRupiah(form.price) : '';
}
// ─────────────────────────────────────────────────────────────────────────────

// Client side search, filter & pagination state
const searchQuery = ref('');
const debouncedSearch = ref('');
let debounceTimer = null;
watch(searchQuery, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { debouncedSearch.value = val; }, 300);
});
const filterCategory = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

function showToast(msg, type = 'success') { toast.show=true; toast.type=type; toast.message=msg; setTimeout(()=>{toast.show=false;},3500); }

async function fetchAssets() {
  loading.value = true;
  try { const { data } = await api.get('/assets'); assets.value = data.data; }
  catch { showToast('Gagal memuat data aset','error'); } finally { loading.value=false; }
}

async function fetchSuppliers() {
  try { const { data } = await api.get('/suppliers'); suppliers.value = data.data; }
  catch { console.error('Gagal memuat data pemasok'); }
}

const filteredAssets = computed(() => {
  return assets.value.filter(a => {
    const matchesSearch = !debouncedSearch.value ||
      a.name.toLowerCase().includes(debouncedSearch.value.toLowerCase()) ||
      a.code.toLowerCase().includes(debouncedSearch.value.toLowerCase());
    const matchesCategory = !filterCategory.value || a.category === filterCategory.value;
    return matchesSearch && matchesCategory;
  });
});

const paginatedAssets = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredAssets.value.slice(start, start + pageSize.value);
});

const totalPages = computed(() => {
  return Math.ceil(filteredAssets.value.length / pageSize.value) || 1;
});

// Watch filtering states to reset back to page 1
watch([searchQuery, filterCategory, pageSize], () => {
  currentPage.value = 1;
});

function openCreateModal() {
  editMode.value=false; editId.value=null; formError.value='';
  Object.assign(form,{code:'',name:'',category:'',price:0,description:'',supplierId:''});
  setPriceFormatted(0);
  showModal.value=true;
}
function openEditModal(a) {
  editMode.value=true; editId.value=a.id; formError.value='';
  Object.assign(form,{code:a.code,name:a.name,category:a.category,price:Number(a.price),description:a.description||'',supplierId:a.supplierId||''});
  setPriceFormatted(a.price);
  showModal.value=true;
}
function confirmDelete(a) { deleteTarget.value=a; showDeleteModal.value=true; }

async function handleSave() {
  saving.value=true; formError.value='';
  try {
    if (editMode.value) { await api.put(`/assets/${editId.value}`,form); showToast('Aset berhasil diperbarui'); }
    else { await api.post('/assets',form); showToast('Aset baru berhasil ditambahkan'); }
    showModal.value=false; await fetchAssets();
  } catch(e) { formError.value=e.response?.data?.message||'Gagal menyimpan data'; } finally { saving.value=false; }
}

async function handleDelete() {
  saving.value=true;
  try { await api.delete(`/assets/${deleteTarget.value.id}`); showToast('Aset berhasil dihapus'); showDeleteModal.value=false; await fetchAssets(); }
  catch(e) { showToast(e.response?.data?.message||'Gagal menghapus','error'); showDeleteModal.value=false; } finally { saving.value=false; }
}

onMounted(() => {
  fetchAssets();
  fetchSuppliers();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
</script>
