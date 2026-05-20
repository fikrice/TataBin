<template>
  <DashboardLayout>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold" style="color:#e2e8f0;">TataBin Analytics</h1>
        <p class="text-sm mt-0.5" style="color:#94a3b8;">Distribusi stok dan visualisasi layout ruang penyimpanan</p>
      </div>
    </div>

    <!-- OVERVIEW STATS CARD -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <!-- Total Nilai Aset -->
      <div class="rounded-xl p-5" style="background:#111c2d; border:1px solid #23324d;">
        <p class="text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Valuasi Total Aset</p>
        <p class="text-2xl font-bold mt-2" style="color:#e2e8f0;">Rp {{ overview.totalValuation?.toLocaleString('id-ID') || 0 }}</p>
        <p class="text-xs mt-1" style="color:#22c55e;">Berdasarkan harga perolehan terakhir</p>
      </div>

      <!-- Slot Bins Terisi -->
      <div class="rounded-xl p-5" style="background:#111c2d; border:1px solid #23324d;">
        <p class="text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Kapasitas Terpakai</p>
        <p class="text-2xl font-bold mt-2" style="color:#ef4444;">{{ overview.filledBins || 0 }} <span class="text-sm font-normal text-slate-400">/ {{ overview.totalBins || 0 }} Slot</span></p>
        <div class="w-full h-1.5 rounded-full overflow-hidden mt-2" style="background:#23324d;">
          <div class="h-full bg-red-500" :style="`width: ${binFillPercent}%`"></div>
        </div>
      </div>

      <!-- Slot Bins Kosong -->
      <div class="rounded-xl p-5" style="background:#111c2d; border:1px solid #23324d;">
        <p class="text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Slot Tersedia (Kosong)</p>
        <p class="text-2xl font-bold mt-2" style="color:#22c55e;">{{ overview.emptyBins || 0 }} <span class="text-sm font-normal text-slate-400">Slot</span></p>
        <div class="w-full h-1.5 rounded-full overflow-hidden mt-2" style="background:#23324d;">
          <div class="h-full bg-emerald-500" :style="`width: ${100 - binFillPercent}%`"></div>
        </div>
      </div>

      <!-- Total Barang Terdaftar -->
      <div class="rounded-xl p-5" style="background:#111c2d; border:1px solid #23324d;">
        <p class="text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Jumlah Unit Aset</p>
        <p class="text-2xl font-bold mt-2" style="color:#2563eb;">{{ overview.totalStock?.toLocaleString('id-ID') || 0 }} <span class="text-sm font-normal text-slate-400">Unit</span></p>
        <p class="text-xs mt-1" style="color:#94a3b8;">Terbagi dalam {{ overview.totalAssets }} jenis SKU · {{ overview.stockRecords }} record stok</p>
      </div>

      <!-- Total Log Transaksi -->
      <div class="rounded-xl p-5" style="background:#111c2d; border:1px solid #23324d;">
        <p class="text-xs font-semibold uppercase tracking-wider" style="color:#94a3b8;">Log Transaksi</p>
        <p class="text-2xl font-bold mt-2" style="color:#e2e8f0;">{{ overview.totalTransactions || 0 }}</p>
        <div class="flex gap-3 mt-1">
          <span class="text-xs" style="color:#22c55e;">↑ {{ overview.totalInbound || 0 }} inbound</span>
          <span class="text-xs" style="color:#ef4444;">↓ {{ overview.totalOutbound || 0 }} outbound</span>
        </div>
      </div>
    </div>

    <!-- WAREHOUSE GRID VISUALIZATION -->
    <div class="rounded-xl p-6 mb-8" style="background:#111c2d; border:1px solid #23324d;">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 class="text-base font-semibold" style="color:#e2e8f0;">Visualisasi Layout Gudang</h2>
          <p class="text-xs mt-0.5" style="color:#94a3b8;">Representasi tata letak fisik storage bin</p>
        </div>
        <!-- Warehouse Selector -->
        <div class="relative">
          <select v-model="selectedWarehouseIndex" class="px-4 py-2 rounded-lg text-sm outline-none appearance-none pr-10" style="background:#0a1220; border:1px solid #23324d; color:#e2e8f0;">
            <option v-for="(wh, idx) in warehousesStock" :key="wh.warehouseId" :value="idx">
              {{ wh.name }} ({{ wh.location }})
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style="color:#94a3b8;">
            <i data-lucide="chevron-down" class="w-4 h-4"></i>
          </div>
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-16" style="color:#94a3b8;">
        <svg class="animate-spin w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Memuat visualisasi gudang...
      </div>

      <div v-else-if="warehousesStock.length === 0" class="text-center py-12" style="color:#475569;">
        Belum ada data gudang dan slot bin terdaftar.
      </div>

      <div v-else>
        <!-- Info Gudang Terpilih -->
        <div class="rounded-lg p-4 mb-6 flex flex-wrap gap-6 text-sm" style="background:#0a1220; border:1px solid #23324d;">
          <div><span style="color:#94a3b8;">Kapasitas Gedung:</span> <strong class="ml-1" style="color:#e2e8f0;">{{ activeWarehouse.capacity }} m³</strong></div>
          <div><span style="color:#94a3b8;">Jumlah Slot Bin:</span> <strong class="ml-1" style="color:#e2e8f0;">{{ activeWarehouse.totalBins }} slot</strong></div>
          <div><span style="color:#94a3b8;">Slot Terisi:</span> <strong class="ml-1" style="color:#ef4444;">{{ activeWarehouse.filledBins }} slot</strong></div>
          <div><span style="color:#94a3b8;">Slot Kosong:</span> <strong class="ml-1" style="color:#22c55e;">{{ activeWarehouse.emptyBins }} slot</strong></div>
        </div>

        <!-- GRID LAYOUT -->
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          <div v-for="bin in activeWarehouse.bins" :key="bin.binId"
               class="rounded-xl p-3 flex flex-col justify-between h-32 border transition-all duration-200"
               :style="getBinCardStyle(bin)"
               @click="showBinDetail(bin)">
            <div>
              <div class="flex justify-between items-start">
                <span class="font-mono text-xs font-bold" style="color:#e2e8f0;">{{ bin.code }}</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                      :style="bin.category === 'Large Asset' ? 'background:rgba(245,158,11,0.1); color:#f59e0b;' : bin.category === 'Medium Asset' ? 'background:rgba(6,182,212,0.1); color:#06b6d4;' : 'background:rgba(34,197,94,0.1); color:#22c55e;'">
                  {{ bin.category === 'Large Asset' ? 'L' : bin.category === 'Medium Asset' ? 'M' : 'S' }}
                </span>
              </div>
              <p class="text-[10px] mt-1" style="color:#94a3b8;">{{ bin.category }}</p>
            </div>

            <!-- Bagian Bawah Card (Stok) -->
            <div class="mt-2 pt-2" style="border-top:1px solid rgba(255,255,255,0.05);">
              <div v-if="bin.status === 'filled'">
                <p class="text-xs font-semibold truncate" style="color:#e2e8f0;" :title="bin.asset?.name">{{ bin.asset?.name }}</p>
                <p class="text-[11px] font-bold mt-0.5 text-emerald-400 font-mono">{{ bin.quantity }} unit</p>
              </div>
              <div v-else class="text-center py-1">
                <span class="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">KOSONG</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Legenda -->
        <div class="flex flex-wrap gap-4 mt-6 text-xs justify-center" style="color:#94a3b8;">
          <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded" style="background:#0a1220; border:1px solid #23324d;"></span> Slot Kosong</div>
          <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded" style="background:rgba(37,99,235,0.15); border:1px solid #2563eb;"></span> Slot Terisi</div>
          <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded bg-emerald-500"></span> Small Asset Category</div>
          <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded bg-cyan-500"></span> Medium Asset Category</div>
          <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded bg-amber-500"></span> Large Asset Category</div>
        </div>
      </div>
    </div>

    <!-- DETAIL MODAL FOR BIN -->
    <div v-if="selectedBin" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.7); backdrop-filter:blur(4px);" @click.self="selectedBin=null">
      <div class="w-full max-w-md rounded-2xl p-6" style="background:#111c2d; border:1px solid #23324d;">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-bold" style="color:#e2e8f0;">Detail Slot: {{ selectedBin.code }}</h3>
          <button @click="selectedBin=null" style="color:#94a3b8;"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
        <div class="space-y-4 text-sm">
          <div class="grid grid-cols-2 gap-4">
            <div><p class="text-xs" style="color:#94a3b8;">Kategori Ukuran</p><p class="font-semibold mt-0.5" style="color:#e2e8f0;">{{ selectedBin.category }}</p></div>
            <div><p class="text-xs" style="color:#94a3b8;">Status Slot</p><p class="font-semibold mt-0.5 uppercase" :style="selectedBin.status==='filled'?'color:#ef4444;':'color:#22c55e;'">{{ selectedBin.status==='filled'?'Terisi':'Kosong' }}</p></div>
          </div>
          <div v-if="selectedBin.status === 'filled'" class="pt-4 space-y-3" style="border-top:1px solid #23324d;">
            <div><p class="text-xs" style="color:#94a3b8;">Nama Aset / SKU</p><p class="font-semibold mt-0.5" style="color:#e2e8f0;">{{ selectedBin.asset?.name }} ({{ selectedBin.asset?.code }})</p></div>
            <div class="grid grid-cols-2 gap-4">
              <div><p class="text-xs" style="color:#94a3b8;">Kuantitas Tersimpan</p><p class="font-mono font-bold mt-0.5 text-emerald-400">{{ selectedBin.quantity }} unit</p></div>
              <div><p class="text-xs" style="color:#94a3b8;">Harga Satuan</p><p class="font-mono font-bold mt-0.5" style="color:#e2e8f0;">Rp {{ selectedBin.price?.toLocaleString('id-ID') }}</p></div>
            </div>
            <div><p class="text-xs" style="color:#94a3b8;">Total Nilai di Bin</p><p class="font-mono font-bold mt-0.5 text-lg" style="color:#2563eb;">Rp {{ (selectedBin.quantity * selectedBin.price)?.toLocaleString('id-ID') }}</p></div>
            <div><p class="text-xs" style="color:#94a3b8;">Supplier Pengirim</p><p class="font-semibold mt-0.5" style="color:#e2e8f0;">{{ selectedBin.supplier?.name || '–' }}</p></div>
            <div><p class="text-xs" style="color:#94a3b8;">Waktu Terakhir Masuk</p><p class="font-semibold mt-0.5" style="color:#e2e8f0;">{{ selectedBin.updatedAt ? new Date(selectedBin.updatedAt).toLocaleString('id-ID') : '–' }}</p></div>
          </div>
          <div class="text-center py-6 text-slate-500" v-else>
            Slot ini tidak memiliki alokasi aset. Anda bisa memasukkan aset berkategori "{{ selectedBin.category }}" melalui menu Inbound.
          </div>
          <button @click="selectedBin=null" class="w-full mt-4 py-2.5 rounded-lg text-sm font-semibold text-white" style="background:#23324d;">Tutup</button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import api from '../services/api.js';

const warehousesStock = ref([]);
const loading = ref(false);
const selectedWarehouseIndex = ref(0);
const selectedBin = ref(null);

const overview = reactive({
  totalAssets: 0,
  totalWarehouses: 0,
  totalBins: 0,
  filledBins: 0,
  emptyBins: 0,
  totalStock: 0,
  totalValuation: 0,
  stockRecords: 0,
  totalInbound: 0,
  totalOutbound: 0,
  totalTransactions: 0
});

const binFillPercent = computed(() => {
  return overview.totalBins === 0 ? 0 : Math.round((overview.filledBins / overview.totalBins) * 100);
});

const activeWarehouse = computed(() => {
  if (warehousesStock.value.length === 0) return null;
  return warehousesStock.value[selectedWarehouseIndex.value];
});

async function fetchOverview() {
  try {
    const { data } = await api.get('/analytics/overview');
    Object.assign(overview, data.data);
  } catch (error) {
    console.error('Gagal memuat ringkasan analitik:', error);
  }
}

async function fetchWarehouseStock() {
  loading.value = true;
  try {
    const { data } = await api.get('/analytics/warehouse-stock');
    warehousesStock.value = data.data;
  } catch (error) {
    console.error('Gagal memuat distribusi gudang:', error);
  } finally {
    loading.value = false;
  }
}

function getBinCardStyle(bin) {
  if (bin.status === 'filled') {
    return {
      background: 'rgba(37,99,235,0.1)',
      borderColor: '#2563eb',
      cursor: 'pointer'
    };
  } else {
    return {
      background: '#0a1220',
      borderColor: '#23324d',
      cursor: 'pointer'
    };
  }
}

function showBinDetail(bin) {
  selectedBin.value = bin;
}

onMounted(() => {
  fetchOverview();
  fetchWarehouseStock();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
</script>
