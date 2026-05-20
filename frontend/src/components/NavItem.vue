<template>
  <!-- Item navigasi sidebar dengan efek aktif dan tooltip saat collapsed -->
  <router-link :to="to" custom v-slot="{ isActive, navigate }">
    <button
      @click="navigate"
      :title="collapsed ? label : ''"
      class="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative"
      :style="isActive
        ? 'background: rgba(37,99,235,0.15); color: #2563eb; border: 1px solid rgba(37,99,235,0.2);'
        : 'color: #94a3b8; border: 1px solid transparent;'"
      @mouseenter="!isActive && ($event.currentTarget.style.background = '#162235', $event.currentTarget.style.color = '#e2e8f0')"
      @mouseleave="!isActive && ($event.currentTarget.style.background = 'transparent', $event.currentTarget.style.color = '#94a3b8')"
    >
      <!-- Ikon Lucide -->
      <i :data-lucide="icon" class="w-[18px] h-[18px] flex-shrink-0" :style="isActive ? 'color: #2563eb;' : 'color: #94a3b8;'"></i>
      <!-- Label teks navigasi (tersembunyi saat sidebar collapsed) -->
      <span v-if="!collapsed" class="truncate">{{ label }}</span>
      <!-- Indikator aktif -->
      <span v-if="isActive && !collapsed" class="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style="background:#2563eb;"></span>
    </button>
  </router-link>
</template>

<script setup>
/**
 * Komponen NavItem - item navigasi pada sidebar
 * @prop {string} icon - path SVG ikon (inner path tag)
 * @prop {string} label - teks label navigasi
 * @prop {string} to - path route tujuan
 * @prop {boolean} collapsed - apakah sidebar sedang dikecilkan
 */
defineProps({
  icon: String,
  label: String,
  to: String,
  collapsed: { type: Boolean, default: false }
});
</script>
