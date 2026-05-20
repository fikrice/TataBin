<template>
  <DashboardLayout>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <div>
        <h1 class="text-xl font-bold" style="color:#e2e8f0;">Manajemen Karyawan</h1>
        <p class="text-sm mt-0.5" style="color:#94a3b8;">Kelola akun dan hak akses pengguna</p>
      </div>
      <button @click="openCreateModal" class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white" style="background:linear-gradient(135deg,#2563eb,#1d4ed8);">
        <i data-lucide="plus" class="w-4 h-4"></i>
        Tambah Karyawan
      </button>
    </div>

    <!-- Alert toast -->
    <div v-if="toast.show" class="mb-4 px-4 py-3 rounded-lg text-sm" :style="toast.type==='success'?'background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);color:#22c55e;':'background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#ef4444;'">{{ toast.message }}</div>

    <!-- FILTER & SEARCH PANEL -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5">
      <!-- Search Input -->
      <div class="relative sm:col-span-2">
        <input v-model="searchQuery" type="text" placeholder="Cari nama, username, email..." class="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none" style="background:#111c2d;border:1px solid #23324d;color:#e2e8f0;"/>
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" style="color:#94a3b8;">
          <i data-lucide="search" class="w-4 h-4"></i>
        </div>
      </div>
      <!-- Role Filter -->
      <div class="relative">
        <select v-model="filterRole" class="w-full px-3 py-2 rounded-lg text-sm outline-none appearance-none pr-10" style="background:#111c2d;border:1px solid #23324d;color:#e2e8f0;">
          <option value="">Semua Peran</option>
          <option value="admin">Administrator</option>
          <option value="crew">Crew</option>
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
        <svg class="animate-spin w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Memuat data...
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm min-w-[700px]">
          <thead style="background:#162235;border-bottom:1px solid #23324d;">
            <tr>
              <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-left" style="color:#94a3b8; width: 70px;">No.</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 140px;">No. Karyawan</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Nama Lengkap</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 120px;">Username</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Email</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 135px;">No. Telepon</th>
              <th class="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 110px;">Role</th>
              <th class="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8; width: 100px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredUsers.length===0">
              <td colspan="8" class="text-center py-12" style="color:#475569;">Tidak ada data karyawan ditemukan.</td>
            </tr>
            <tr v-for="(u, index) in paginatedUsers" :key="u.id" class="transition-colors" style="border-top:1px solid #23324d;" @mouseenter="$event.currentTarget.style.background='#162235'" @mouseleave="$event.currentTarget.style.background='transparent'">
              <td class="px-5 py-4 font-mono text-xs font-medium" style="color:#94a3b8;">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td class="px-5 py-4 font-mono text-xs font-bold text-blue-500" style="color:#3b82f6;">{{ u.code }}</td>
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0" style="background:linear-gradient(135deg,#2563eb,#1d4ed8);color:white;">{{ (u.fullName||u.username||'U').charAt(0).toUpperCase() }}</div>
                  <span class="font-medium" style="color:#e2e8f0;">{{ u.fullName || '–' }}</span>
                </div>
              </td>
              <td class="px-5 py-4 font-mono text-xs" style="color:#94a3b8;">{{ u.username }}</td>
              <td class="px-5 py-4 text-xs" style="color:#94a3b8;">{{ u.email }}</td>
              <td class="px-5 py-4 text-xs" style="color:#94a3b8;">{{ u.telephoneNumber || '–' }}</td>
              <td class="px-5 py-4">
                <span class="px-2.5 py-1 rounded-md text-xs font-semibold" :style="u.role==='admin'?'background:rgba(37,99,235,0.1);color:#2563eb;border:1px solid rgba(37,99,235,0.2);':'background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.2);'">{{ u.role==='admin'?'Administrator':'Crew' }}</span>
              </td>
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openEditModal(u)" aria-label="Edit User" class="group relative p-1.5 rounded-lg flex items-center justify-center" style="color:#94a3b8; cursor:pointer;" @mouseenter="$event.currentTarget.style.color='#2563eb'" @mouseleave="$event.currentTarget.style.color='#94a3b8'">
                    <i data-lucide="edit" class="w-4 h-4"></i>
                    <span class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 bg-slate-950 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                      Edit
                    </span>
                  </button>
                  <button @click="confirmDelete(u)" aria-label="Hapus User" class="group relative p-1.5 rounded-lg flex items-center justify-center" style="color:#94a3b8; cursor:pointer;" @mouseenter="$event.currentTarget.style.color='#ef4444'" @mouseleave="$event.currentTarget.style.color='#94a3b8'">
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
    <div v-if="filteredUsers.length > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-sm" style="color:#94a3b8;">
      <p>Menampilkan {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredUsers.length) }} dari {{ filteredUsers.length }} data</p>
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
          <h3 class="text-lg font-semibold" style="color:#e2e8f0;">{{ editMode ? 'Edit Karyawan' : 'Tambah Karyawan Baru' }}</h3>
          <button @click="showModal=false" style="color:#94a3b8;"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <form @submit.prevent="handleSave" class="space-y-4">
          <div>
            <label for="userFullNameInput" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Nama Lengkap <span style="color:#ef4444;">*</span></label>
            <input id="userFullNameInput" name="userFullNameInput" v-model="form.fullName" type="text" required class="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;"/>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="userUsernameInput" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Username <span style="color:#ef4444;">*</span></label>
              <input id="userUsernameInput" name="userUsernameInput" v-model="form.username" type="text" required class="w-full px-3 py-2.5 rounded-lg text-sm outline-none font-mono" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;"/>
            </div>
            <div>
              <label for="userRoleSelect" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Role</label>
              <div class="relative">
                <select id="userRoleSelect" name="userRoleSelect" v-model="form.role" class="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none pr-10" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;">
                  <option value="crew">Crew</option>
                  <option value="admin">Admin</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
                  <i data-lucide="chevron-down" class="w-4 h-4"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="userEmailInput" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Email <span style="color:#ef4444;">*</span></label>
              <input id="userEmailInput" name="userEmailInput" v-model="form.email" type="email" required class="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;"/>
            </div>
            <div>
              <label for="userPhoneInput" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">No. Telepon</label>
              <input id="userPhoneInput" name="userPhoneInput" v-model="form.telephoneNumber" type="text" class="w-full px-3 py-2.5 rounded-lg text-sm outline-none font-mono" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;" placeholder="Contoh: 08123456789"/>
            </div>
          </div>
          <div>
            <label for="userPasswordInput" class="block text-sm font-medium mb-1.5" style="color:#94a3b8;">Password {{ editMode ? '(kosongkan jika tidak diubah)' : '' }}</label>
            <div class="relative">
              <input id="userPasswordInput" name="userPasswordInput" v-model="form.password" :type="showPassword ? 'text' : 'password'" :placeholder="editMode ? 'Biarkan kosong untuk pertahankan password lama' : 'Default: Qwerty123*'" class="w-full pl-3 pr-10 py-2.5 rounded-lg text-sm outline-none" style="background:#0a1220;border:1px solid #23324d;color:#e2e8f0;"/>
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors flex items-center justify-center" style="color:#94a3b8;" @mouseenter="$event.currentTarget.style.color='#e2e8f0'" @mouseleave="$event.currentTarget.style.color='#94a3b8'">
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <p class="text-[11px] mt-1" style="color:#94a3b8;">
              Kriteria Minimum: 1 Huruf Besar (Uppercase), 1 Angka (Numeric), dan 1 Karakter Spesial.
            </p>
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
        <h3 class="font-semibold mb-2" style="color:#e2e8f0;">Hapus Karyawan?</h3>
        <p class="text-sm mb-5" style="color:#94a3b8;">Hapus akun karyawan <span class="font-semibold" style="color:#e2e8f0;">{{ deleteTarget?.fullName || deleteTarget?.username }}</span>? Tindakan ini tidak dapat dibatalkan.</p>
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
import api from '../services/api.js';

const users = ref([]);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const showDeleteModal = ref(false);
const editMode = ref(false);
const editId = ref(null);
const deleteTarget = ref(null);
const formError = ref('');
const showPassword = ref(false);
const toast = reactive({ show: false, type: 'success', message: '' });
const form = reactive({ fullName: '', username: '', email: '', password: '', telephoneNumber: '', role: 'crew' });

// Client side search, filter & pagination state
const searchQuery = ref('');
const debouncedSearch = ref('');
let debounceTimer = null;
watch(searchQuery, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { debouncedSearch.value = val; }, 300);
});
const filterRole = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

function showToast(msg, type = 'success') { toast.show=true; toast.type=type; toast.message=msg; setTimeout(()=>{toast.show=false;},3500); }

async function fetchUsers() {
  loading.value=true;
  try { const { data } = await api.get('/users'); users.value=data.data; }
  catch { showToast('Gagal memuat data karyawan','error'); } finally { loading.value=false; }
}

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const matchesSearch = !debouncedSearch.value ||
      (u.fullName && u.fullName.toLowerCase().includes(debouncedSearch.value.toLowerCase())) ||
      u.username.toLowerCase().includes(debouncedSearch.value.toLowerCase()) ||
      u.email.toLowerCase().includes(debouncedSearch.value.toLowerCase());
    const matchesRole = !filterRole.value || u.role === filterRole.value;
    return matchesSearch && matchesRole;
  });
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredUsers.value.slice(start, start + pageSize.value);
});

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / pageSize.value) || 1;
});

// Watch filtering states to reset back to page 1
watch([searchQuery, filterRole, pageSize], () => {
  currentPage.value = 1;
});

function openCreateModal() { editMode.value=false; editId.value=null; formError.value=''; showPassword.value=false; Object.assign(form,{fullName:'',username:'',email:'',password:'',telephoneNumber:'',role:'crew'}); showModal.value=true; }
function openEditModal(u) { editMode.value=true; editId.value=u.id; formError.value=''; showPassword.value=false; Object.assign(form,{fullName:u.fullName||'',username:u.username,email:u.email,password:'',telephoneNumber:u.telephoneNumber||'',role:u.role}); showModal.value=true; }
function confirmDelete(u) { deleteTarget.value=u; showDeleteModal.value=true; }

async function handleSave() {
  saving.value=true; formError.value='';
  try {
    if (editMode.value) { await api.put(`/users/${editId.value}`,form); showToast('Data karyawan berhasil diperbarui'); }
    else { await api.post('/users',form); showToast('Karyawan baru berhasil ditambahkan'); }
    showModal.value=false; await fetchUsers();
  } catch(e) {
    let errText = e.response?.data?.message || 'Gagal menyimpan data';
    if (e.response?.data?.errors) {
      const errorList = [];
      for (const [key, value] of Object.entries(e.response.data.errors)) {
        const fieldName = key === 'password' ? 'Password' : 
                          key === 'email' ? 'Email' : 
                          key === 'username' ? 'Username' : 
                          key === 'fullName' ? 'Nama Lengkap' : key;
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
  try { await api.delete(`/users/${deleteTarget.value.id}`); showToast('Karyawan berhasil dihapus'); showDeleteModal.value=false; await fetchUsers(); }
  catch(e) { showToast(e.response?.data?.message||'Gagal menghapus','error'); showDeleteModal.value=false; } finally { saving.value=false; }
}

onMounted(() => {
  fetchUsers();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
</script>
