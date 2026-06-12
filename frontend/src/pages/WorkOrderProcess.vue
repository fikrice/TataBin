<template>
  <DashboardLayout>
    <!-- GO BACK BUTTON -->
    <div class="mb-6">
      <router-link to="/work-orders" class="inline-flex items-center gap-2 text-sm font-semibold transition-colors" style="color:#94a3b8;" @mouseenter="$event.target.style.color='#2563eb'" @mouseleave="$event.target.style.color='#94a3b8'">
        <i data-lucide="arrow-left" class="w-4 h-4"></i> Kembali ke Daftar WO
      </router-link>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-slate-400">
      <svg class="animate-spin w-8 h-8 mb-4 text-blue-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      Memuat detail Work Order...
    </div>

    <div v-else-if="!wo" class="text-center py-12 text-red-500 font-semibold">
      Work Order tidak ditemukan.
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- COLUMN 1 & 2: SCAN PANEL & PROCESS TABLE -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- CARD WORK ORDER INFO -->
        <div class="rounded-xl p-6 shadow-lg" style="background:#111c2d; border:1px solid #23324d;">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4" style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-blue-500">Work Order Detail</span>
              <h2 class="text-2xl font-bold font-mono mt-1" style="color:#e2e8f0;">{{ wo.code }}</h2>
            </div>
            <span class="px-3.5 py-1.5 rounded-full text-xs font-bold" :style="getStatusStyle(wo.status)">
              {{ wo.status }}
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
            <div>
              <p style="color:#94a3b8;">Tipe Kategori</p>
              <p class="font-bold mt-1 text-slate-100 uppercase">{{ wo.type }}</p>
            </div>
            <div>
              <p style="color:#94a3b8;">Gudang</p>
              <p class="font-bold mt-1 text-slate-100">{{ wo.warehouse?.name }} ({{ wo.warehouse?.code }})</p>
            </div>
            <div>
              <p style="color:#94a3b8;">Slot Penyimpanan (Bin)</p>
              <p class="font-bold mt-1 text-emerald-400 font-mono">{{ wo.storageBin?.code }}</p>
            </div>
            <div>
              <p style="color:#94a3b8;">Nama Aset</p>
              <p class="font-bold mt-1 text-slate-100">{{ wo.asset?.name }}</p>
            </div>
            <div>
              <p style="color:#94a3b8;">SKU Kode</p>
              <p class="font-bold mt-1 text-slate-100 font-mono">{{ wo.asset?.code }}</p>
            </div>
            <div>
              <p style="color:#94a3b8;">Kuantitas Target</p>
              <p class="font-bold mt-1 text-slate-100 font-mono">{{ wo.quantity }} unit</p>
            </div>
          </div>

          <div v-if="wo.remarks" class="mt-4 p-3 rounded-lg text-xs italic" style="background:#0a1220; color:#94a3b8; border:1px solid #23324d;">
            Catatan: {{ wo.remarks }}
          </div>
        </div>

        <!-- BARCODE SCANNING CONSOLE -->
        <div v-if="wo.status !== 'Done'" class="rounded-xl p-6 shadow-lg" style="background:#111c2d; border:1px solid #23324d;">
          <h3 class="text-sm font-semibold uppercase tracking-wider mb-4" style="color:#94a3b8;">Pindai / Scan Barcode Label</h3>
          
          <form @submit.prevent="handleScan" class="space-y-4">
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Kode Barcode Unit (Label Code)</label>
                <span class="text-xs" :style="scansCount === wo.quantity ? 'color:#22c55e;' : 'color:#94a3b8;'">
                  Progress: <strong class="font-mono">{{ scansCount }} / {{ wo.quantity }}</strong>
                </span>
              </div>
              
              <div class="flex gap-3">
                <input v-model="scanInput" type="text" ref="barcodeInput" placeholder="Arahkan scanner ke barcode atau ketik manual..." class="flex-1 px-4 py-3 rounded-lg text-sm font-mono outline-none border focus:border-blue-500" style="background:#0a1220; border-color:#23324d; color:#e2e8f0;" :disabled="scanning" />
                <button type="submit" :disabled="scanning || scansCount >= wo.quantity" class="px-6 rounded-lg text-sm font-semibold text-white transition-all bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed">
                  {{ scanning ? 'Memproses...' : 'Scan' }}
                </button>
              </div>
              
              <p v-if="scanError" class="text-xs text-red-500 font-semibold mt-1.5 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {{ scanError }}
              </p>
              <p v-if="scanSuccess" class="text-xs text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {{ scanSuccess }}
              </p>
            </div>
          </form>

          <!-- PRINT BUTTON (Inbound only) -->
          <div v-if="wo.type === 'inbound'" class="mt-4 pt-4 flex justify-between items-center" style="border-top:1px solid rgba(255,255,255,0.05);">
            <p class="text-xs" style="color:#94a3b8;">Cetak barcode label sebelum menempelkannya pada barang.</p>
            <button @click="openPrintModal" class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all bg-cyan-700 hover:bg-cyan-600">
              <i data-lucide="printer" class="w-4 h-4"></i> Cetak Label Batch
            </button>
          </div>
        </div>

        <!-- DETAIL PROCESS TABLE -->
        <div class="rounded-xl p-6 shadow-lg" style="background:#111c2d; border:1px solid #23324d;">
          <h3 class="text-sm font-semibold uppercase tracking-wider mb-4" style="color:#94a3b8;">Detail Process Table (Scan Log)</h3>
          
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead style="background:#162235; border-bottom:1px solid #23324d;">
                <tr>
                  <th class="px-4 py-3 text-xs font-semibold uppercase text-slate-400">No.</th>
                  <th class="px-4 py-3 text-xs font-semibold uppercase text-slate-400">Label Code</th>
                  <th class="px-4 py-3 text-xs font-semibold uppercase text-slate-400">Scanned At</th>
                  <th class="px-4 py-3 text-xs font-semibold uppercase text-slate-400">Scanned By</th>
                  <th class="px-4 py-3 text-xs font-semibold uppercase text-slate-400 text-right">Updated Stock</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="wo.scans.length === 0">
                  <td colspan="5" class="text-center py-8 text-slate-500">Belum ada label yang dipindai.</td>
                </tr>
                <tr v-for="(scan, idx) in wo.scans" :key="scan.id" class="transition-colors" style="border-top:1px solid #23324d;" @mouseenter="$event.currentTarget.style.background='#162235'" @mouseleave="$event.currentTarget.style.background='transparent'">
                  <td class="px-4 py-3 font-mono text-xs text-slate-400">{{ idx + 1 }}</td>
                  <td class="px-4 py-3 font-mono font-bold text-slate-200">{{ scan.labelCode }}</td>
                  <td class="px-4 py-3 text-xs text-slate-400">{{ formatDateTime(scan.scannedAt) }}</td>
                  <td class="px-4 py-3 text-xs text-slate-200">{{ scan.user?.fullName || scan.user?.username || 'Crew' }}</td>
                  <td class="px-4 py-3 text-xs text-right font-bold text-emerald-400">{{ scan.updatedStock }} unit</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- COLUMN 3: FIFO SUGGESTIONS / PRINT LABELS PANEL -->
      <div>
        
        <!-- INBOUND: PRINT PREVIEW BOX -->
        <div v-if="wo.type === 'inbound'" class="rounded-xl p-6 shadow-lg space-y-4" style="background:#111c2d; border:1px solid #23324d;">
          <h3 class="text-sm font-semibold uppercase tracking-wider" style="color:#94a3b8;">Format Barcode Inbound</h3>
          <p class="text-xs" style="color:#94a3b8;">
            Setiap item inbound harus diberi label barcode unik dengan format SKU dan counter 6 digit.
          </p>
          <div class="p-4 rounded-xl border border-dashed text-center space-y-2" style="background:#0a1220; border-color:#23324d;">
            <p class="font-mono text-lg font-bold text-blue-400 tracking-wider">SKU_XXXXXX</p>
            <p class="text-[10px]" style="color:#94a3b8;">Contoh: {{ wo.asset?.code }}_000001</p>
          </div>
        </div>

        <!-- OUTBOUND: FIFO SUGGESTION LIST -->
        <div v-if="wo.type === 'outbound'" class="rounded-xl p-6 shadow-lg space-y-4" style="background:#111c2d; border:1px solid #23324d;">
          <div class="flex items-center justify-between pb-3" style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <h3 class="text-sm font-semibold uppercase tracking-wider" style="color:#94a3b8;">FIFO Suggestion List</h3>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-500">MANDATORY FIFO</span>
          </div>

          <p class="text-xs" style="color:#94a3b8;">
            Scan outbound <strong>wajib urut</strong> berdasarkan data masuk terlama ke terbaru. Pindai item berikut secara berurutan:
          </p>

          <div v-if="loadingSuggestions" class="text-center py-6 text-slate-400 text-xs">
            Memuat saran FIFO...
          </div>
          <div v-else-if="suggestions.length === 0" class="text-center py-6 text-slate-500 text-xs">
            Tidak ada saran label. Stok di bin kosong.
          </div>
          <div v-else class="space-y-2.5">
            <div v-for="(sug, idx) in suggestions" :key="sug.labelCode"
                 class="p-3 rounded-lg border transition-all flex items-center justify-between"
                 :style="getSuggestionStyle(sug, idx)">
              <div class="min-w-0">
                <p class="font-mono font-bold text-sm tracking-wide text-slate-200">{{ sug.labelCode }}</p>
                <p class="text-[10px] mt-0.5" style="color:#94a3b8;">Masuk: {{ formatDateTime(sug.inboundScan) }}</p>
              </div>
              
              <!-- Badge Status Scan -->
              <span class="text-[9px] px-1.5 py-0.5 rounded font-bold"
                    :style="isAlreadyScanned(sug.labelCode) ? 'background:rgba(34,197,94,0.15); color:#22c55e;' : idx === nextUnscannedIdx ? 'background:rgba(59,130,246,0.15); color:#2563eb; animation: pulse 2s infinite;' : 'background:rgba(255,255,255,0.05); color:#64748b;'">
                {{ isAlreadyScanned(sug.labelCode) ? 'SCANNED' : idx === nextUnscannedIdx ? 'SCAN NEXT' : 'QUEUED' }}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- BATCH PRINT MODAL (INBOUND) -->
    <div v-if="printModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="closePrintModal">
      <div class="w-full max-w-2xl rounded-2xl p-6 shadow-2xl" style="background:#111c2d; border:1px solid #23324d;">
        <div class="flex items-center justify-between mb-5 pb-3" style="border-bottom:1px solid rgba(255,255,255,0.05);">
          <h3 class="text-lg font-bold" style="color:#e2e8f0;">Cetak Barcode Label Batch</h3>
          <button @click="closePrintModal" style="color:#94a3b8;"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>

        <div v-if="loadingPrint" class="text-center py-10 text-slate-400">
          Mempersiapkan barcode label...
        </div>
        <div v-else class="space-y-6">
          <p class="text-xs" style="color:#94a3b8;">
            Berikut adalah batch label barcode yang harus dicetak untuk Work Order ini. Silakan klik "Cetak Halaman" untuk mencetaknya ke printer label.
          </p>

          <!-- Label Barcode Grid (Preview di Modal) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl max-h-[350px] overflow-y-auto" style="background:#0a1220; border:1px solid #23324d;">
            <div v-for="label in printableLabels" :key="label" class="border rounded-lg p-3 text-center bg-white text-black font-sans flex flex-row justify-between h-36" style="border-color: #23324d;">
              <!-- Left Section -->
              <div class="flex-1 flex flex-col justify-between text-left pr-2 min-w-0">
                <div class="min-w-0">
                  <p class="font-mono text-[10px] font-bold text-black leading-tight">{{ wo.asset?.code }}</p>
                  <p class="text-[10px] font-semibold text-black mt-1 leading-tight line-clamp-2" style="max-height: 2.4em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                    {{ wo.asset?.name }}
                  </p>
                  <p class="text-[10px] font-bold text-black mt-1">
                    Rp {{ wo.asset?.price?.toLocaleString('id-ID') }}
                  </p>
                </div>
                <p class="text-[8px] font-bold text-slate-700 uppercase tracking-wider">WMS Solution</p>
              </div>
              
              <!-- Right Section -->
              <div class="w-[100px] flex flex-col justify-between items-center flex-shrink-0">
                <p class="font-mono text-[8px] font-bold text-black text-center leading-tight">{{ label }}</p>
                <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${label}`" alt="QR Code" class="w-20 h-20 object-contain" />
                <p class="text-[7px] font-bold text-slate-700 text-center truncate w-full" :title="wo.asset?.supplier?.name || 'PT. STECHQ ROBOTIKA INDONESIA'">
                  {{ wo.asset?.supplier?.name || 'PT. STECHQ ROBOTIKA INDONESIA' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-4 border-t" style="border-top-color:rgba(255,255,255,0.05);">
            <button @click="closePrintModal" class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all" style="background:#23324d; color:#e2e8f0;">
              Tutup
            </button>
            <button @click="triggerPrint" class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all bg-cyan-600 hover:bg-cyan-500">
              Cetak Halaman (Print)
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import api from '../services/api.js';

const route = useRoute();
const woId = route.params.id;

const wo = ref(null);
const loading = ref(true);

const scanInput = ref('');
const scanning = ref(false);
const scanError = ref('');
const scanSuccess = ref('');
const barcodeInput = ref(null);

// Suggestions (Outbound)
const suggestions = ref([]);
const loadingSuggestions = ref(false);

// Print Labels (Inbound)
const printModalOpen = ref(false);
const loadingPrint = ref(false);
const printableLabels = ref([]);

const scansCount = computed(() => {
  return wo.value?.scans?.length || 0;
});

// Index of next unscanned item in suggestion list
const nextUnscannedIdx = computed(() => {
  if (wo.value?.type !== 'outbound') return -1;
  return suggestions.value.findIndex(sug => !isAlreadyScanned(sug.labelCode));
});

function isAlreadyScanned(labelCode) {
  if (!wo.value?.scans) return false;
  return wo.value.scans.some(scan => scan.labelCode === labelCode);
}

async function fetchWorkOrderDetail() {
  try {
    const { data } = await api.get(`/work-orders/${woId}`);
    wo.value = data.data;
  } catch (error) {
    console.error('Gagal memuat detail Work Order:', error);
  } finally {
    loading.value = false;
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 50);
  }
}

async function fetchSuggestions() {
  if (wo.value?.type !== 'outbound') return;
  loadingSuggestions.value = true;
  try {
    const { data } = await api.get(`/work-orders/${woId}/suggestions`);
    suggestions.value = data.data.suggestions;
  } catch (error) {
    console.error('Gagal memuat FIFO suggestions:', error);
  } finally {
    loadingSuggestions.value = false;
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

function getSuggestionStyle(sug, idx) {
  const scanned = isAlreadyScanned(sug.labelCode);
  if (scanned) {
    return {
      background: 'rgba(34,197,94,0.05)',
      borderColor: 'rgba(34,197,94,0.2)',
      opacity: '0.6'
    };
  } else if (idx === nextUnscannedIdx.value) {
    return {
      background: 'rgba(37,99,235,0.08)',
      borderColor: '#2563eb'
    };
  } else {
    return {
      background: '#0a1220',
      borderColor: '#23324d'
    };
  }
}

async function handleScan() {
  const code = scanInput.value.trim();
  if (!code) return;

  scanning.value = true;
  scanError.value = '';
  scanSuccess.value = '';

  try {
    const { data } = await api.post(`/work-orders/${woId}/scan`, { labelCode: code });
    
    // Update WO status and scans list in local state
    scanSuccess.value = data.message;
    scanInput.value = '';
    
    // Re-fetch WO to refresh scan log table and suggestions
    await fetchWorkOrderDetail();
    await fetchSuggestions();
    
    // Focus back on input field
    nextTick(() => {
      if (barcodeInput.value) barcodeInput.value.focus();
    });
  } catch (error) {
    scanError.value = error.response?.data?.message || 'Gagal memproses pemindaian.';
  } finally {
    scanning.value = false;
  }
}

async function openPrintModal() {
  printModalOpen.value = true;
  loadingPrint.value = true;
  try {
    const { data } = await api.get(`/work-orders/${woId}/next-labels`);
    printableLabels.value = data.data.labels;
  } catch (error) {
    console.error('Gagal mengambil daftar cetak label:', error);
  } finally {
    loadingPrint.value = false;
  }
}

function closePrintModal() {
  printModalOpen.value = false;
}

function triggerPrint() {
  const chunks = [];
  const list = printableLabels.value;
  for (let i = 0; i < list.length; i += 10) {
    chunks.push(list.slice(i, i + 10));
  }

  let printWindowContent = '';
  
  chunks.forEach(page => {
    printWindowContent += '<div class="page-container">';
    page.forEach(label => {
      const supplierName = wo.value?.asset?.supplier?.name || 'PT. STECHQ ROBOTIKA INDONESIA';
      const assetPrice = wo.value?.asset?.price ? 'Rp. ' + wo.value.asset.price.toLocaleString('id-ID') : 'Rp. 0';
      
      printWindowContent += `
        <div class="label-card">
          <!-- Left Section -->
          <div class="left-section">
            <div>
              <p class="asset-code">${wo.value?.asset?.code || '–'}</p>
              <p class="asset-name">${wo.value?.asset?.name || '–'}</p>
              <p class="asset-price">${assetPrice}</p>
            </div>
            <p class="brand-text">WMS Solution</p>
          </div>
          
          <!-- Right Section -->
          <div class="right-section">
            <p class="label-number">${label}</p>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${label}" alt="QR" class="qr-image" />
            <p class="supplier-name" title="${supplierName}">${supplierName}</p>
          </div>
        </div>
      `;
    });
    printWindowContent += '</div>';
  });

  const printWindow = window.open('', '', 'height=800,width=1000');
  printWindow.document.write('<html><head><title>Cetak Label Barcode</title>');
  printWindow.document.write('<style>');
  printWindow.document.write(`
    @page {
      size: A4;
      margin: 0;
    }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      margin: 0;
      padding: 0;
      background: white;
      color: black;
      width: 21cm;
      height: 29.7cm;
      box-sizing: border-box;
    }
    .page-container {
      padding-left: 2cm;
      padding-right: 2cm;
      padding-top: 2cm;
      padding-bottom: 3cm;
      box-sizing: border-box;
      width: 21cm;
      height: 29.7cm;
      display: grid;
      grid-template-columns: repeat(2, 8cm);
      grid-template-rows: repeat(5, 4.1cm);
      grid-column-gap: 1cm;
      grid-row-gap: 1cm;
      justify-content: start;
      align-content: start;
      page-break-after: always;
    }
    .label-card {
      width: 8cm;
      height: 4.1cm;
      border: 1px solid black;
      box-sizing: border-box;
      padding: 0.3cm;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: stretch;
      background: white;
      color: black;
    }
    .left-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: left;
      padding-right: 0.2cm;
      min-width: 0;
    }
    .asset-code {
      font-size: 10px;
      font-weight: 700;
      margin: 0 0 2px 0;
      color: #000;
      font-family: monospace;
    }
    .asset-name {
      font-size: 9px;
      font-weight: 600;
      line-height: 1.2;
      color: #000;
      margin: 0 0 4px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      max-height: 2.4em;
    }
    .asset-price {
      font-size: 9px;
      font-weight: 700;
      color: #000;
      margin: 0;
    }
    .brand-text {
      font-size: 8px;
      font-weight: 700;
      color: #334155;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .right-section {
      width: 2.7cm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }
    .label-number {
      font-size: 8px;
      font-weight: 700;
      font-family: monospace;
      color: #000;
      margin: 0 0 2px 0;
      text-align: center;
    }
    .qr-image {
      width: 2.7cm;
      height: 2.7cm;
      object-fit: contain;
    }
    .supplier-name {
      font-size: 7px;
      font-weight: 700;
      color: #334155;
      margin: 0;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 2.7cm;
    }
  `);
  printWindow.document.write('</style></head><body>');
  printWindow.document.write(printWindowContent);
  printWindow.document.write('</body></html>');
  
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}

function formatDateTime(dateStr) {
  if (!dateStr) return '–';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

onMounted(async () => {
  await fetchWorkOrderDetail();
  await fetchSuggestions();
  // Focus on input
  nextTick(() => {
    if (barcodeInput.value) barcodeInput.value.focus();
  });
});
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
