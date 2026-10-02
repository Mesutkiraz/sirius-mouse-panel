<template>
  <!-- ========================================================
       DeviceConnection.vue
       Cihaz bağlantı kartı: bağlan / kes / durum göstergesi
       ======================================================== -->
  <div class="card-glow rounded-xl border border-hk-border bg-hk-card p-5 space-y-4">

    <!-- Başlık -->
    <div class="flex items-center gap-2 mb-1">
      <span class="text-hk-cyan text-lg">⬡</span>
      <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-300">
        Cihaz Bağlantısı
      </h2>
    </div>

    <!-- Durum göstergesi -->
    <div class="flex items-center gap-3">
      <!-- Nabız noktası -->
      <span class="relative flex h-3 w-3">
        <span
          class="absolute inline-flex h-full w-full rounded-full opacity-75"
          :class="connected
            ? 'bg-emerald-400 animate-ping'
            : 'bg-slate-600'"
        ></span>
        <span
          class="relative inline-flex rounded-full h-3 w-3"
          :class="connected ? 'bg-emerald-500' : 'bg-slate-700'"
        ></span>
      </span>

      <span
        class="text-sm font-medium"
        :class="connected ? 'text-emerald-400' : 'text-slate-500'"
      >
        {{ connected ? 'Bağlı' : 'Bağlantı Yok' }}
      </span>
    </div>

    <!-- Cihaz bilgileri (bağlıyken) -->
    <Transition name="fade">
      <div v-if="connected" class="rounded-lg bg-hk-surface border border-hk-border p-3 space-y-1.5">
        <InfoRow label="Cihaz" :value="state.deviceName ?? '—'" />
        <InfoRow label="VID"   :value="state.vid ?? '—'" mono />
        <InfoRow label="PID"   :value="state.pid ?? '—'" mono />
      </div>
    </Transition>

    <!-- WebHID uyarısı (bağlı değilken) -->
    <Transition name="fade">
      <p v-if="!connected" class="text-xs text-slate-500 leading-relaxed">
        WebHID API yalnızca <span class="text-hk-cyan">Chrome / Edge 89+</span> tarayıcılarında çalışır.
        Fareyi USB portuna bağladıktan sonra "Bağlan" düğmesine basın.
      </p>
    </Transition>

    <!-- Butonlar -->
    <div class="flex gap-2 pt-1">
      <button
        v-if="!connected"
        @click="handleConnect"
        :disabled="connecting"
        class="flex-1 flex items-center justify-center gap-2 rounded-lg border border-hk-blue/50 bg-hk-blue/10 px-4 py-2.5
               text-sm font-semibold text-hk-blue
               hover:bg-hk-blue/20 hover:border-hk-blue
               active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
               transition-all duration-200"
      >
        <span v-if="connecting" class="animate-spin">⟳</span>
        <span>{{ connecting ? 'Bağlanıyor…' : '🔌 Bağlan' }}</span>
      </button>

      <button
        v-else
        @click="handleDisconnect"
        class="flex-1 flex items-center justify-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2.5
               text-sm font-semibold text-rose-400
               hover:bg-rose-500/20 hover:border-rose-500
               active:scale-95 transition-all duration-200"
      >
        ✕ Bağlantıyı Kes
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../hid-store.js'

// Çocuk component: satır bilgisi
const InfoRow = {
  props: { label: String, value: String, mono: Boolean },
  template: `
    <div class="flex items-center justify-between text-xs">
      <span class="text-slate-500 uppercase tracking-wider text-[10px]">{{ label }}</span>
      <span :class="mono ? 'font-mono text-hk-cyan' : 'text-slate-200 font-medium'">{{ value }}</span>
    </div>
  `,
}

const state      = store.state
const connected  = computed(() => state.connected)
const connecting = ref(false)

async function handleConnect() {
  connecting.value = true
  try {
    await store.connect()
  } finally {
    connecting.value = false
  }
}

async function handleDisconnect() {
  await store.disconnect()
}
</script>
