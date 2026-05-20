<template>
  <DashboardLayout>
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-xl font-bold" style="color:#e2e8f0;">Operasional Inbound</h1>
      <p class="text-sm mt-0.5" style="color:#94a3b8;">Kelola penerimaan barang masuk dan pencetakan label penataan slot</p>
    </div>

    <!-- Alert / Toast -->
    <div v-if="toast.show" class="mb-5 px-4 py-3 rounded-lg text-sm transition-all duration-300 flex items-center gap-2"
         :style="toast.type==='success'?'background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);color:#22c55e;':'background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#ef4444;'">
      <span class="w-1.5 h-1.5 rounded-full" :class="toast.type==='success'?'bg-emerald-500':'bg-rose-500'"></span>
      {{ toast.message }}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- Form Inbound (2/3 width) -->
      <div class="lg:col-span-2 rounded-xl p-6" style="background:#111c2d; border:1px solid #23324d;">
        <div class="flex items-center gap-2.5 mb-5 pb-3" style="border-bottom:1px solid #23324d;">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-500">
            <!-- Native SVG to avoid Lucide replacement issue -->
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          </div>
          <h2 class="text-base font-semibold" style="color:#e2e8f0;">Form Penerimaan Barang</h2>
        </div>

        <form @submit.prevent="handleInbound" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Aset -->
            <div>
              <label for="assetSelect" class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Aset / SKU <span class="text-rose-500">*</span></label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style="color:#94a3b8;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>
                </div>
                <select id="assetSelect" name="assetSelect" v-model="form.assetId" required class="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm outline-none appearance-none" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;">
                  <option value="">-- Pilih Aset --</option>
                  <option v-for="a in assets" :key="a.id" :value="a.id">{{ a.code }} - {{ a.name }} ({{ a.category }})</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>

            <!-- Slot Bin -->
            <div>
              <label for="binSelect" class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Slot Penyimpanan <span class="text-rose-500">*</span></label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style="color:#94a3b8;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <select id="binSelect" name="binSelect" v-model="form.storageBinId" required class="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm outline-none appearance-none" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;">
                  <option value="">-- Pilih Bin --</option>
                  <option v-for="b in filteredBins" :key="b.id" :value="b.id">
                    {{ b.code }} - {{ b.warehouse?.name || '' }} ({{ b.status === 'filled' ? 'Terisi' : 'Kosong' }})
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
              <p v-if="selectedAsset && filteredBins.length===0" class="text-xs mt-1.5" style="color:#f59e0b;">
                Tidak ada bin berkategori "{{ selectedAsset.category }}" yang tersedia.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Supplier -->
            <div class="sm:col-span-1">
              <label for="supplierSelect" class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Pemasok (Supplier) <span class="text-rose-500">*</span></label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style="color:#94a3b8;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                </div>
                <select id="supplierSelect" name="supplierSelect" v-model="form.supplierId" required class="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm outline-none appearance-none" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;">
                  <option value="">-- Pilih Pemasok --</option>
                  <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.code }} - {{ s.name }}</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>

            <!-- Kuantitas -->
            <div>
              <label for="quantityInput" class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Kuantitas (Unit) <span class="text-rose-500">*</span></label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style="color:#94a3b8;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                </div>
                <input id="quantityInput" name="quantityInput" v-model.number="form.quantity" type="number" min="1" required class="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none font-mono" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;"/>
              </div>
            </div>

            <!-- Harga Satuan -->
            <div>
              <label for="priceInput" class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color:#94a3b8;">Harga Satuan (Rp) <span class="text-rose-500">*</span></label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style="color:#94a3b8;">
                  <span class="text-xs font-bold font-mono">Rp</span>
                </div>
                <input
                  ref="priceInputRef"
                  id="priceInput"
                  name="priceInput"
                  type="text"
                  inputmode="numeric"
                  :value="priceFormatted"
                  @keydown="onPriceKeydown"
                  @input="onPriceInput"
                  placeholder="Masukkan harga"
                  class="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none font-mono"
                  style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;"/>
              </div>
            </div>
          </div>

          <p v-if="formError" class="text-sm font-medium" style="color:#ef4444;">{{ formError }}</p>
          
          <div class="pt-2 flex justify-end">
            <button type="submit" :disabled="saving" class="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all shadow-lg flex items-center gap-2" style="background:linear-gradient(135deg,#22c55e,#16a34a);">
              <svg v-if="saving" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
              {{ saving ? 'Memproses...' : 'Proses' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Preview Label (1/3 width) -->
      <div class="rounded-xl p-6" style="background:#111c2d; border:1px solid #23324d;">
        <div class="flex items-center justify-between mb-5 pb-3" style="border-bottom:1px solid #23324d;">
          <h2 class="text-base font-semibold" style="color:#e2e8f0;">Label Preview</h2>
          <button v-if="lastResult" @click="printLabel" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 transition-colors shadow">
            <!-- Inline SVG printer to prevent Lucide crash -->
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
            Cetak
          </button>
        </div>

        <div v-if="lastResult" id="printableLabel" class="rounded-lg p-5 space-y-4" style="background:#0a1220; border:2px dashed #23324d; position:relative;">
          <div class="text-center pb-3" style="border-bottom:1px dashed #23324d;">
            <p class="text-base font-bold text-white tracking-wide">TATABIN WMS</p>
            <p class="text-[10px] uppercase font-bold tracking-widest mt-0.5" style="color:#2563eb;">INBOUND RECEIPT</p>
          </div>

          <div class="space-y-2.5 text-xs">
            <div class="flex justify-between"><span style="color:#94a3b8;">No. Referensi:</span><span class="font-mono font-bold text-blue-500">{{ lastResult.transaction?.referenceNumber }}</span></div>
            <div class="flex justify-between"><span style="color:#94a3b8;">Tanggal:</span><span class="font-medium text-white">{{ new Date(lastResult.transaction?.createdAt).toLocaleString('id-ID') }}</span></div>
            <div class="flex justify-between"><span style="color:#94a3b8;">SKU / Aset:</span><span class="font-bold text-white text-right max-w-[130px] truncate">{{ lastResult.transaction?.asset?.code }} - {{ lastResult.transaction?.asset?.name }}</span></div>
            <div class="flex justify-between"><span style="color:#94a3b8;">Lokasi Bin:</span><span class="font-mono font-bold text-emerald-500">{{ lastResult.transaction?.storageBin?.code }}</span></div>
            <div class="flex justify-between"><span style="color:#94a3b8;">Kategori:</span><span class="font-medium text-white">{{ lastResult.transaction?.asset?.category }}</span></div>
            <div class="flex justify-between"><span style="color:#94a3b8;">Pemasok:</span><span class="font-medium text-white truncate max-w-[130px]">{{ lastResult.transaction?.supplier?.name }}</span></div>
            <div class="flex justify-between pt-2 border-t border-dashed border-slate-800"><span style="color:#94a3b8; font-size:11px;">Total Barang:</span><span class="font-bold text-base text-emerald-500">{{ lastResult.transaction?.quantity }} Unit</span></div>
          </div>

          <!-- Barcode simulation -->
          <div class="pt-3 flex flex-col items-center justify-center space-y-1">
            <div class="flex items-center gap-[2px] h-8 w-44 bg-white px-2 py-1 rounded">
              <!-- Simulated barcode lines using varying widths -->
              <span class="h-full bg-black flex-1" style="max-width: 2px;"></span>
              <span class="h-full bg-black flex-1" style="max-width: 1px;"></span>
              <span class="h-full bg-black flex-1" style="max-width: 4px;"></span>
              <span class="h-full bg-black flex-1" style="max-width: 1px;"></span>
              <span class="h-full bg-black flex-1" style="max-width: 2px;"></span>
              <span class="h-full bg-black flex-1" style="max-width: 3px;"></span>
              <span class="h-full bg-black flex-1" style="max-width: 1px;"></span>
              <span class="h-full bg-black flex-1" style="max-width: 4px;"></span>
              <span class="h-full bg-black flex-1" style="max-width: 2px;"></span>
              <span class="h-full bg-black flex-1" style="max-width: 1px;"></span>
              <span class="h-full bg-black flex-1" style="max-width: 3px;"></span>
              <span class="h-full bg-black flex-1" style="max-width: 2px;"></span>
              <span class="h-full bg-black flex-1" style="max-width: 4px;"></span>
            </div>
            <p class="text-[9px] font-mono tracking-[4px]" style="color:#475569;">{{ lastResult.transaction?.referenceNumber }}</p>
          </div>

          <div class="text-center pt-2" style="border-top:1px dashed #23324d;">
            <p class="text-[9px]" style="color:#475569;">Oleh: {{ lastResult.transaction?.user?.fullName || lastResult.transaction?.user?.username }}</p>
          </div>
        </div>

        <div v-else class="h-64 rounded-lg flex flex-col items-center justify-center border-2 border-dashed" style="border-color:#23324d;">
          <!-- Inline tag icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-3" style="color:#23324d;"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l4.72-4.72c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M6 6h.01"/></svg>
          <p class="text-xs text-center px-4" style="color:#475569;">Isi form penerimaan barang di samping untuk mencetak label penataan.</p>
        </div>
      </div>
    </div>

    <!-- Riwayat Inbound Terkini -->
    <div class="rounded-xl" style="background:#111c2d; border:1px solid #23324d;">
      <div class="flex items-center justify-between px-5 py-4" style="border-bottom:1px solid #23324d;">
        <h2 class="text-sm font-semibold flex items-center gap-2" style="color:#e2e8f0;">
          <!-- Inline history icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
          Riwayat Inbound Terkini
        </h2>
        <span class="text-xs font-mono" style="color:#94a3b8;">5 Transaksi Terakhir</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left min-w-[800px]">
          <thead style="background:#162235; border-bottom:1px solid #23324d;">
            <tr>
              <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-left" style="color:#94a3b8; width: 60px;">No.</th>
              <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">No. Referensi</th>
              <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Aset / SKU</th>
              <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Lokasi Slot</th>
              <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Kuantitas</th>
              <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Nilai Satuan</th>
              <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-right" style="color:#94a3b8;">Pemasok</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="recentInbounds.length === 0">
              <td colspan="7" class="text-center py-8 text-xs" style="color:#475569;">Belum ada riwayat transaksi inbound masuk.</td>
            </tr>
            <tr v-for="(log, index) in recentInbounds" :key="log.id" class="transition-colors border-t border-slate-800" @mouseenter="$event.currentTarget.style.background='#162235'" @mouseleave="$event.currentTarget.style.background='transparent'">
              <td class="px-5 py-3.5 font-mono text-xs text-left" style="color:#94a3b8;">{{ index + 1 }}</td>
              <td class="px-5 py-3.5">
                <span class="font-mono font-bold text-xs" style="color:#2563eb;">{{ log.referenceNumber }}</span>
                <p class="text-[10px] mt-0.5" style="color:#475569;">{{ formatDateTime(log.createdAt) }}</p>
              </td>
              <td class="px-5 py-3.5">
                <span class="font-medium" style="color:#e2e8f0;">{{ log.asset?.name }}</span>
                <p class="text-[10px] font-mono" style="color:#94a3b8;">{{ log.asset?.code }}</p>
              </td>
              <td class="px-5 py-3.5 font-mono font-medium" style="color:#22c55e;">{{ log.storageBin?.code }}</td>
              <td class="px-5 py-3.5 font-mono font-semibold" style="color:#e2e8f0;">{{ log.quantity }} unit</td>
              <td class="px-5 py-3.5 font-mono" style="color:#94a3b8;">Rp {{ Number(log.price).toLocaleString('id-ID') }}</td>
              <td class="px-5 py-3.5 text-right">
                <span class="text-xs font-medium" style="color:#e2e8f0;">{{ log.supplier?.name }}</span>
                <p class="text-[10px]" style="color:#475569;">Oleh: {{ log.user?.fullName || log.user?.username }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import api from '../services/api.js';

const assets = ref([]);
const bins = ref([]);
const suppliers = ref([]);
const recentInbounds = ref([]);
const loading = ref(false);
const saving = ref(false);
const formError = ref('');
const lastResult = ref(null);
const toast = reactive({ show: false, type: 'success', message: '' });
const form = reactive({ assetId: '', storageBinId: '', supplierId: '', quantity: 1, price: 0 });

// ─── Rupiah formatter ───────────────────────────────────────────────────────
const priceFormatted = ref('');

/** Convert a raw numeric string to formatted Indonesian thousands e.g. 1500000 → "1.500.000" */
function formatRupiah(num) {
  if (!num && num !== 0) return '';
  return Number(num).toLocaleString('id-ID');
}

/** Block non-digit keys (allow control keys like Backspace, Delete, Arrow) */
function onPriceKeydown(event) {
  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'];
  if (!allowed.includes(event.key) && !/^\d$/.test(event.key)) {
    event.preventDefault();
  }
}

/** Real-time formatting on every input event */
function onPriceInput(event) {
  const el = event.target;
  // Strip everything except digits
  const digits = el.value.replace(/[^\d]/g, '');
  const numericValue = digits === '' ? 0 : parseInt(digits, 10);
  form.price = numericValue;
  // Format with Indonesian dots
  const formatted = numericValue > 0 ? formatRupiah(numericValue) : '';
  priceFormatted.value = formatted;
  // Restore cursor: Vue will re-render, so we force value + cursor position
  el.value = formatted;
  // Keep cursor at end (makes backspace & typing natural)
  const len = formatted.length;
  el.setSelectionRange(len, len);
}

/** Sync priceFormatted when form.price is set programmatically */
function setPriceFormatted(value) {
  form.price = Number(value) || 0;
  priceFormatted.value = form.price > 0 ? formatRupiah(form.price) : '';
}
// ────────────────────────────────────────────────────────────────────────────

function showToast(msg, type = 'success') {
  toast.show = true;
  toast.type = type;
  toast.message = msg;
  setTimeout(() => { toast.show = false; }, 4000);
}

const selectedAsset = computed(() => assets.value.find(a => a.id === form.assetId));

// Filter bins: only show storage bins that match the chosen asset category
const filteredBins = computed(() => {
  if (!selectedAsset.value) return [];
  return bins.value.filter(b => b.category === selectedAsset.value.category);
});

// Auto-fill price and supplier when asset is selected
watch(() => form.assetId, (newId) => {
  if (newId) {
    const asset = assets.value.find(a => a.id === newId);
    if (asset) {
      setPriceFormatted(asset.price);
      if (asset.supplierId) {
        form.supplierId = asset.supplierId;
      }
    }
  } else {
    setPriceFormatted(0);
    form.supplierId = '';
  }
});

async function fetchRefs() {
  loading.value = true;
  try {
    const [aRes, bRes, sRes] = await Promise.all([
      api.get('/assets'),
      api.get('/storage-bins'),
      api.get('/suppliers')
    ]);
    assets.value = aRes.data.data || [];
    bins.value = bRes.data.data || [];
    suppliers.value = sRes.data.data || [];
  } catch {
    showToast('Gagal memuat data referensi', 'error');
  } finally {
    loading.value = false;
  }
}

async function fetchRecentInbounds() {
  try {
    const { data } = await api.get('/reports/logs', { params: { type: 'inbound' } });
    recentInbounds.value = (data.data || []).slice(0, 5);
  } catch (e) {
    console.error('Gagal mengambil log riwayat inbound', e);
  }
}

async function handleInbound() {
  saving.value = true;
  formError.value = '';
  try {
    const { data } = await api.post('/inbound', form);
    lastResult.value = data.data;
    showToast(data.message, 'success');
    
    // Reset form fields
    form.assetId = '';
    form.storageBinId = '';
    form.supplierId = '';
    form.quantity = 1;
    setPriceFormatted(0);
    
    await Promise.all([fetchRefs(), fetchRecentInbounds()]);
    
    setTimeout(() => {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }, 50);
  } catch (e) {
    formError.value = e.response?.data?.message || 'Gagal memproses barang masuk';
  } finally {
    saving.value = false;
  }
}

function printLabel() {
  const ref = lastResult.value.transaction?.referenceNumber;
  if (!ref) return;

  const w = window.open('', '_blank', 'width=400,height=600');
  w.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Label Inbound - TataBin WMS</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            .label-container { page-break-after: avoid; }
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: #fff; color: #000; width: 100%; max-width: 360px; margin: 0 auto; }
          .label-container { border: 2px solid #000; padding: 16px; background: #fff; }
          .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 12px; }
          .title { font-size: 20px; font-weight: 900; letter-spacing: 1px; margin: 0; }
          .subtitle { font-size: 10px; font-weight: 700; letter-spacing: 3px; margin: 4px 0 0 0; color: #444; }
          .row { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; border-bottom: 1px dotted #ddd; }
          .row:last-of-type { border-bottom: none; }
          .label { color: #555; font-size: 11px; }
          .value { font-weight: 700; text-align: right; font-size: 12px; }
          .barcode-wrap { display: flex; flex-direction: column; align-items: center; margin-top: 14px; padding: 8px; border: 1px solid #000; }
          .barcode-text { font-family: 'Courier New', monospace; font-size: 10px; font-weight: 700; letter-spacing: 1px; margin-top: 5px; }
          .footer { text-align: center; font-size: 9px; color: #666; border-top: 1px solid #ddd; padding-top: 6px; margin-top: 12px; }
          .badge { background: #000; color: #fff; padding: 2px 6px; font-size: 9px; font-weight: 700; letter-spacing: 1px; }
        </style>
      </head>
      <body>
        <div class="label-container">
          <div class="header">
            <p class="title">TATABIN WMS</p>
            <p class="subtitle"><span class="badge">INBOUND</span> RECEIPT LABEL</p>
          </div>
          <div class="row"><span class="label">NO. REFERENSI</span><span class="value">${ref}</span></div>
          <div class="row"><span class="label">TANGGAL</span><span class="value">${new Date(lastResult.value.transaction?.createdAt).toLocaleString('id-ID')}</span></div>
          <div class="row"><span class="label">NAMA ASET</span><span class="value">${lastResult.value.transaction?.asset?.name || '-'}</span></div>
          <div class="row"><span class="label">SKU</span><span class="value">${lastResult.value.transaction?.asset?.code || '-'}</span></div>
          <div class="row"><span class="label">LOKASI SLOT</span><span class="value">${lastResult.value.transaction?.storageBin?.code || '-'}</span></div>
          <div class="row"><span class="label">KUANTITAS</span><span class="value">${lastResult.value.transaction?.quantity || 0} UNIT</span></div>
          <div class="row"><span class="label">PEMASOK</span><span class="value">${lastResult.value.transaction?.supplier?.name || '-'}</span></div>
          <div class="barcode-wrap">
            <svg id="barcode"></svg>
            <p class="barcode-text">${ref}</p>
          </div>
          <div class="footer">Petugas: ${lastResult.value.transaction?.user?.fullName || lastResult.value.transaction?.user?.username || '-'}</div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
        <script>
          JsBarcode('#barcode', '${ref}', {
            format: 'CODE128',
            width: 2,
            height: 60,
            displayValue: false,
            margin: 0
          });
          setTimeout(() => { window.print(); window.close(); }, 300);
        <\/script>
      </body>
    </html>
  `);
  w.document.close();
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

onMounted(() => {
  fetchRefs();
  fetchRecentInbounds();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
</script>
