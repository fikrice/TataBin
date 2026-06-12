<template>
  <DashboardLayout>
    <div class="max-w-2xl mx-auto my-12 text-center p-8 rounded-2xl border" style="background:#111c2d; border-color:#23324d; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
      <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 bg-amber-500/10 border border-amber-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
      </div>
      
      <h2 class="text-xl font-bold mb-3" style="color:#e2e8f0;">Transaksi Outbound Langsung Dinonaktifkan</h2>
      <p class="text-sm mb-6 max-w-md mx-auto" style="color:#94a3b8; line-height: 1.6;">
        Untuk memastikan pemenuhan aturan pengeluaran barang berbasis <strong>FIFO (First In First Out)</strong> yang ketat dan verifikasi barcode yang valid, semua pengeluaran barang (Outbound) kini wajib diproses melalui alur kerja <strong>Work Order (WO)</strong>.
      </p>

      <div class="space-y-4">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Langkah Operasional Outbound:</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs max-w-lg mx-auto text-left">
          <div class="p-3 rounded-lg border" style="background:#0a1220; border-color:#23324d;">
            <p class="font-bold text-red-500 mb-1">1. Buat WO</p>
            <p style="color:#94a3b8;">Admin membuat WO Outbound dengan kuantitas yang dibutuhkan.</p>
          </div>
          <div class="p-3 rounded-lg border" style="background:#0a1220; border-color:#23324d;">
            <p class="font-bold text-red-500 mb-1">2. Cek Saran FIFO</p>
            <p style="color:#94a3b8;">Sistem akan menampilkan daftar label terlama yang wajib discan terlebih dahulu.</p>
          </div>
          <div class="p-3 rounded-lg border" style="background:#0a1220; border-color:#23324d;">
            <p class="font-bold text-red-500 mb-1">3. Scan Urut</p>
            <p style="color:#94a3b8;">Crew memindai barcode label terlama secara berurutan sesuai saran FIFO.</p>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <router-link to="/work-orders" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all bg-blue-600 hover:bg-blue-500 hover:scale-[1.02]">
          Buka Halaman Work Orders
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </router-link>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '../layouts/DashboardLayout.vue';
</script>
