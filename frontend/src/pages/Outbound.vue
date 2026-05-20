<template>
  <DashboardLayout>
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-xl font-bold" style="color:#e2e8f0;">Operasional Outbound</h1>
      <p class="text-sm mt-0.5" style="color:#94a3b8;">Kelola pengeluaran barang berbasis prinsip FIFO (First In First Out) dan verifikasi label</p>
    </div>

    <!-- Alert / Toast -->
    <div v-if="toast.show" class="mb-5 px-4 py-3 rounded-lg text-sm transition-all duration-300 flex items-center gap-2"
         :style="toast.type==='success'?'background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);color:#22c55e;':'background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#ef4444;'">
      <span class="w-1.5 h-1.5 rounded-full" :class="toast.type==='success'?'bg-emerald-500':'bg-rose-500'"></span>
      {{ toast.message }}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- Form Outbound (2/3 width) -->
      <div class="lg:col-span-2 rounded-xl p-6" style="background:#111c2d; border:1px solid #23324d;">
        <div class="flex items-center gap-2.5 mb-5 pb-3" style="border-bottom:1px solid #23324d;">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          </div>
          <h2 class="text-base font-semibold" style="color:#e2e8f0;">Form Barang Keluar</h2>
        </div>

        <form @submit.prevent="handleOutbound" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Aset -->
            <div>
              <label for="assetSelect" class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Pilih Aset / SKU <span class="text-rose-500">*</span></label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style="color:#94a3b8;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>
                </div>
                <select id="assetSelect" name="assetSelect" v-model="form.assetId" required class="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm outline-none appearance-none" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;">
                  <option value="">-- Pilih Aset --</option>
                  <option v-for="s in stockSummary" :key="s.asset.id" :value="s.asset.id">
                    {{ s.asset.code }} - {{ s.asset.name }} (Tersedia: {{ s.totalQuantity }} unit)
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>

            <!-- Jumlah Keluar -->
            <div>
              <label for="quantityInput" class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Kuantitas Keluar (Unit) <span class="text-rose-500">*</span></label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style="color:#94a3b8;">
                  <span class="text-xs font-bold font-mono">#</span>
                </div>
                <input id="quantityInput" name="quantityInput" v-model.number="form.quantity" type="number" min="1" :max="selectedStock?.totalQuantity || 99999" required class="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none font-mono" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;"/>
              </div>
            </div>
          </div>

          <!-- Rincian Antrean FIFO (Live Queue Preview) -->
          <div v-if="selectedStock" class="rounded-xl p-4 space-y-3" style="background:#0a1220; border:1px solid #23324d;">
            <div class="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span class="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style="color:#2563eb;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                Antrean Stok FIFO (Urutan Tertua)
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Total: {{ selectedStock.totalQuantity }} unit
              </span>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[140px] overflow-y-auto pr-1">
              <div v-for="(bin, i) in selectedStock.bins" :key="i" class="rounded-lg p-2.5 flex items-center justify-between border" style="background:#111c2d; border-color:#23324d;">
                <div>
                  <div class="flex items-center gap-1">
                    <span class="text-[9px] px-1.5 py-0.5 rounded font-bold bg-blue-500/10 text-blue-500 font-mono">FIFO #{{ i+1 }}</span>
                    <span class="text-xs font-bold font-mono" style="color:#e2e8f0;">{{ bin.binCode }}</span>
                  </div>
                  <p class="text-[10px] mt-0.5" style="color:#94a3b8;">{{ bin.warehouseName }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs font-bold text-emerald-500 font-mono">{{ bin.quantity }} unit</p>
                  <p class="text-[9px]" style="color:#475569;">{{ formatShortDate(bin.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>

          <p v-if="formError" class="text-sm font-medium" style="color:#ef4444;">{{ formError }}</p>

          <div class="pt-2 flex justify-end">
            <button type="submit" :disabled="saving || !selectedStock" class="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all shadow-lg flex items-center gap-2" style="background:linear-gradient(135deg,#ef4444,#dc2626);">
              <svg v-if="saving" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
              {{ saving ? 'Memproses...' : 'Proses' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Verifikasi Label (1/3 width) -->
      <div class="rounded-xl p-6 flex flex-col justify-between" style="background:#111c2d; border:1px solid #23324d;">
        <div>
          <div class="flex items-center gap-2 mb-5 pb-3" style="border-bottom:1px solid #23324d;">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-500/10 text-cyan-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><path d="M14 14h3v3h-3z"/></svg>
            </div>
            <h2 class="text-base font-semibold" style="color:#e2e8f0;">Verifikasi Label</h2>
          </div>

          <div class="space-y-4">
            <div>
              <label for="verifyRefInput" class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Input Kode Ref Transaksi</label>
              <div class="flex gap-2">
                <input id="verifyRefInput" name="verifyRefInput" v-model="verifyRef" type="text" placeholder="INB-2026xxxx-xxx..." class="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none font-mono" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;"/>
                <button @click="handleVerify" :disabled="!verifyRef" class="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 transition-colors shadow" style="background:#06b6d4;">Cek</button>
              </div>
            </div>

            <!-- Panel Hasil Verifikasi -->
            <div v-if="verifyResult" class="rounded-lg p-4 space-y-3" :style="verifyResult.length?'background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2);':'background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2);'">
              <div class="flex items-center gap-2 text-xs font-bold" :style="verifyResult.length?'color:#22c55e;':'color:#ef4444;'">
                <span class="w-2 h-2 rounded-full" :class="verifyResult.length?'bg-emerald-500':'bg-rose-500'"></span>
                {{ verifyResult.length ? 'LABEL VALID' : 'LABEL TIDAK DITEMUKAN / EXPIRED' }}
              </div>
              
              <div v-if="verifyResult.length" class="space-y-1.5 text-xs">
                <div class="flex justify-between"><span style="color:#94a3b8;">Tipe:</span><span class="font-bold uppercase" :style="verifyResult[0].type==='inbound'?'color:#22c55e;':'color:#ef4444;'">{{ verifyResult[0].type }}</span></div>
                <div class="flex justify-between"><span style="color:#94a3b8;">Aset:</span><span class="font-semibold text-white max-w-[130px] truncate text-right">{{ verifyResult[0].asset?.name }}</span></div>
                <div class="flex justify-between"><span style="color:#94a3b8;">Slot Bin:</span><span class="font-mono font-semibold text-blue-500">{{ verifyResult[0].storageBin?.code }}</span></div>
                <div class="flex justify-between"><span style="color:#94a3b8;">Kuantitas:</span><span class="font-bold text-white">{{ verifyResult[0].quantity }} Unit</span></div>
                <div class="flex justify-between"><span style="color:#94a3b8;">Petugas:</span><span class="font-medium text-white">{{ verifyResult[0].user?.fullName || verifyResult[0].user?.username }}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!verifyResult" class="h-32 mt-4 rounded-lg flex flex-col items-center justify-center border border-dashed" style="border-color:#23324d;">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-2" style="color:#23324d;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 11 13 15 9"/></svg>
          <p class="text-[10px] text-center px-4" style="color:#475569;">Masukkan barcode/no. referensi label inbound di atas untuk memvalidasi alokasi fisik barang.</p>
        </div>
      </div>
    </div>

    <!-- Riwayat Outbound Terkini (full width) -->
    <div class="rounded-xl" style="background:#111c2d; border:1px solid #23324d;">
      <div class="flex items-center justify-between px-5 py-4" style="border-bottom:1px solid #23324d;">
        <h2 class="text-sm font-semibold flex items-center gap-2" style="color:#e2e8f0;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-rose-500"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
          Riwayat Outbound Terkini
        </h2>
        <span class="text-xs font-mono" style="color:#94a3b8;">5 Transaksi Terakhir</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left min-w-[500px]">
          <thead style="background:#162235; border-bottom:1px solid #23324d;">
            <tr>
              <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-left" style="color:#94a3b8; width: 60px;">No.</th>
              <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">No. Referensi / Tanggal</th>
              <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Aset / SKU</th>
              <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-right" style="color:#94a3b8;">Kuantitas</th>
              <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-right" style="color:#94a3b8;">Petugas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="recentOutbounds.length === 0">
              <td colspan="5" class="text-center py-8 text-xs" style="color:#475569;">Belum ada riwayat transaksi outbound keluar.</td>
            </tr>
            <tr v-for="(log, index) in recentOutbounds" :key="log.id" class="transition-colors border-t border-slate-800" @mouseenter="$event.currentTarget.style.background='#162235'" @mouseleave="$event.currentTarget.style.background='transparent'">
              <td class="px-5 py-3.5 font-mono text-xs text-left" style="color:#94a3b8;">{{ index + 1 }}</td>
              <td class="px-5 py-3.5">
                <span class="font-mono font-bold text-xs" style="color:#ef4444;">{{ log.referenceNumber }}</span>
                <p class="text-[10px] mt-0.5" style="color:#475569;">{{ formatDateTime(log.createdAt) }}</p>
              </td>
              <td class="px-5 py-3.5">
                <span class="font-medium" style="color:#e2e8f0;">{{ log.asset?.name }}</span>
                <p class="text-[10px] font-mono" style="color:#94a3b8;">{{ log.asset?.code }}</p>
              </td>
              <td class="px-5 py-3.5 font-mono font-semibold text-right" style="color:#ef4444;">-{{ log.quantity }} unit</td>
              <td class="px-5 py-3.5 text-right">
                <span class="text-xs font-medium" style="color:#e2e8f0;">{{ log.user?.fullName || log.user?.username }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import api from '../services/api.js';

const stockSummary = ref([]);
const recentOutbounds = ref([]);
const loading = ref(false);
const saving = ref(false);
const formError = ref('');
const verifyResult = ref(null);
const verifyRef = ref('');
const toast = reactive({ show: false, type: 'success', message: '' });
const form = reactive({ assetId: '', quantity: 1 });

function showToast(msg, type = 'success') {
  toast.show = true;
  toast.type = type;
  toast.message = msg;
  setTimeout(() => { toast.show = false; }, 4000);
}

const selectedStock = computed(() => stockSummary.value.find(s => s.asset.id === form.assetId));

async function fetchStockSummary() {
  loading.value = true;
  try {
    const { data } = await api.get('/outbound/stock-summary');
    stockSummary.value = data.data || [];
  } catch {
    showToast('Gagal memuat ringkasan stok', 'error');
  } finally {
    loading.value = false;
  }
}

async function fetchRecentOutbounds() {
  try {
    const { data } = await api.get('/reports/logs', { params: { type: 'outbound' } });
    recentOutbounds.value = (data.data || []).slice(0, 5);
  } catch (e) {
    console.error('Gagal memuat log riwayat outbound', e);
  }
}

async function handleOutbound() {
  saving.value = true;
  formError.value = '';
  verifyResult.value = null;
  try {
    const { data } = await api.post('/outbound', form);
    showToast(data.message, 'success');
    
    // Reset form
    form.assetId = '';
    form.quantity = 1;
    
    await Promise.all([fetchStockSummary(), fetchRecentOutbounds()]);
    
    setTimeout(() => {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }, 50);
  } catch (e) {
    formError.value = e.response?.data?.message || 'Gagal memproses barang keluar';
  } finally {
    saving.value = false;
  }
}

async function handleVerify() {
  if (!verifyRef.value) return;
  try {
    const { data } = await api.get(`/outbound/verify/${verifyRef.value}`);
    verifyResult.value = data.data;
    showToast('Label berhasil diverifikasi', 'success');
  } catch (e) {
    verifyResult.value = [];
    showToast(e.response?.data?.message || 'Label tidak ditemukan', 'error');
  }
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

onMounted(() => {
  fetchStockSummary();
  fetchRecentOutbounds();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
</script>
