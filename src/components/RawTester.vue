<template>
  <div class="hk-panel p-5 space-y-5">

    <!-- Başlık & Cihaz Durumu -->
    <div class="flex items-center justify-between pb-3 border-b border-hk-border">
      <div>
        <h2 class="text-sm font-semibold tracking-wide text-white">SinoWealth HID Geliştirici Kontrolü</h2>
        <p class="text-xs text-slate-400">Düşük seviyeli WebHID paketleri ve EEPROM bellek bloğu yönetimi</p>
      </div>

      <div class="flex items-center gap-2">
        <span v-if="firmwareVersion" class="text-xs px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
          FW: {{ firmwareVersion }}
        </span>
        <span
          class="text-xs px-2.5 py-0.5 rounded font-mono"
          :class="hasConfig ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'"
        >
          {{ hasConfig ? 'Config Hazır (519B)' : 'Config Yok' }}
        </span>
      </div>
    </div>

    <!-- Resmi SinoWealth Aksiyonları -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <button
        @click="handleReadConfig"
        :disabled="!connected || loading"
        class="rounded-xl border border-hk-border bg-hk-surface p-3 text-left hover:border-slate-500 active:scale-95 disabled:opacity-30 transition-all flex flex-col justify-between"
      >
        <span class="text-xs font-bold text-white block">📖 Config Bloğu Oku</span>
        <span class="text-[10px] text-slate-400 font-mono mt-1">CMD 0x11 → 519 Byte EEPROM</span>
      </button>

      <button
        @click="handleWriteConfig"
        :disabled="!connected || loading"
        class="rounded-xl border border-hk-border bg-hk-surface p-3 text-left hover:border-slate-500 active:scale-95 disabled:opacity-30 transition-all flex flex-col justify-between"
      >
        <span class="text-xs font-bold text-emerald-400 block">💾 Config Bloğu Yaz</span>
        <span class="text-[10px] text-slate-400 font-mono mt-1">Report 0x04 (Kalıcı Flash)</span>
      </button>

      <button
        @click="handleReadFirmware"
        :disabled="!connected || loading"
        class="rounded-xl border border-hk-border bg-hk-surface p-3 text-left hover:border-slate-500 active:scale-95 disabled:opacity-30 transition-all flex flex-col justify-between"
      >
        <span class="text-xs font-bold text-hk-blue block">🏷️ Firmware Sürümü Oku</span>
        <span class="text-[10px] text-slate-400 font-mono mt-1">CMD 0x01 → ASCII Sürüm</span>
      </button>
    </div>

    <!-- Kategori Seçici -->
    <div class="flex gap-1.5 flex-wrap">
      <button
        v-for="cat in categories"
        :key="cat.id"
        @click="activeCategory = cat.id"
        class="text-xs px-3 py-1 rounded-lg border transition-colors font-medium"
        :class="activeCategory === cat.id
          ? 'border-hk-blue bg-hk-blue text-white shadow-sm'
          : 'border-hk-border bg-hk-surface text-slate-400 hover:text-white'"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Hızlı Şablonlar -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="tpl in filteredTemplates"
        :key="tpl.label"
        @click="applyTemplate(tpl)"
        class="text-xs p-2 rounded-lg border border-hk-border bg-hk-surface hover:border-slate-500 text-left transition-colors font-mono"
      >
        <span class="block font-bold text-slate-300">{{ tpl.label }}</span>
        <span class="block text-[10px] text-slate-500 mt-0.5">{{ tpl.data }}</span>
      </button>
    </div>

    <!-- Manuel Form -->
    <div class="p-4 rounded-xl bg-hk-surface border border-hk-border space-y-3">
      <span class="text-xs font-semibold text-slate-200 block">Manuel Paket Gönderimi</span>

      <div class="flex flex-col sm:flex-row gap-2 items-end">
        <div class="w-full sm:w-28">
          <label class="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Report ID</label>
          <div class="flex items-center gap-1">
            <span class="text-slate-500 text-xs font-mono">0x</span>
            <input
              v-model="rawReportId"
              type="text"
              maxlength="2"
              class="w-full rounded-lg border border-hk-border bg-hk-card px-2.5 py-2 text-xs font-mono text-white uppercase focus:outline-none focus:border-hk-blue"
            />
          </div>
        </div>

        <div class="w-full sm:w-28">
          <label class="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Uzunluk</label>
          <select
            v-model.number="rawLength"
            class="w-full rounded-lg border border-hk-border bg-hk-card px-2.5 py-2 text-xs font-mono text-white focus:outline-none"
          >
            <option :value="5">5 B</option>
            <option :value="64">64 B</option>
            <option :value="519">519 B</option>
          </select>
        </div>

        <div class="w-full sm:flex-1">
          <label class="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Hex Veri</label>
          <input
            v-model="rawHexData"
            type="text"
            placeholder="Örn: 11 00 00 00 00"
            class="w-full rounded-lg border border-hk-border bg-hk-card px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-hk-blue"
          />
        </div>
      </div>

      <button
        @click="handleSend"
        :disabled="!connected || !rawHexData.trim()"
        class="w-full py-2.5 rounded-lg bg-hk-blue text-white font-semibold text-xs hover:bg-blue-600 active:scale-95 disabled:opacity-30 transition-all"
      >
        Paketi Farenin USB Çipine İlet
      </button>
    </div>

    <!-- Sonuç Çıktısı -->
    <div
      v-if="lastResult"
      class="rounded-lg p-3 border text-xs font-mono break-all"
      :class="lastResult.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'"
    >
      {{ lastResult.ok ? '✓ Başarılı: ' : '✗ Hata: ' }} {{ lastResult.msg }}
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../hid-store.js'

const state           = store.state
const connected       = computed(() => state.connected)
const firmwareVersion = computed(() => state.firmwareVersion)
const hasConfig       = computed(() => Boolean(state.cachedConfig))
const loading         = ref(false)

const rawReportId   = ref('05')
const rawHexData    = ref('')
const rawLength     = ref(5)
const lastResult    = ref(null)
const activeCategory = ref('sinowealth')

const allTemplates = [
  { cat:'sinowealth', id:'05', len:5, label:'GET_CONFIG',    data:'11 00 00 00 00' },
  { cat:'sinowealth', id:'05', len:5, label:'GET_FW_VER',    data:'01 00 00 00 00' },
  { cat:'sinowealth', id:'05', len:5, label:'GET_PROFILE',   data:'02 00 00 00 00' },
  { cat:'sinowealth', id:'05', len:5, label:'GET_BUTTONS',   data:'12 00 00 00 00' },
  { cat:'quick-05', id:'05', len:5, label:'DPI·S1·400',   data:'04 f1 04 04 00' },
  { cat:'quick-05', id:'05', len:5, label:'DPI·S1·800',   data:'04 f1 08 08 00' },
  { cat:'quick-05', id:'05', len:5, label:'DPI·S1·1600',  data:'04 f1 10 10 00' },
  { cat:'quick-05', id:'05', len:5, label:'Poll 1000Hz',  data:'08 01 00 00 00' },
  { cat:'quick-05', id:'05', len:5, label:'Poll 500Hz',   data:'08 02 00 00 00' },
]

const categories = [
  { id:'sinowealth', label:'SinoWealth Protokolü' },
  { id:'quick-05',   label:'Hızlı Komutlar' },
]

const filteredTemplates = computed(() =>
  allTemplates.filter(t => t.cat === activeCategory.value)
)

function applyTemplate(tpl) {
  rawReportId.value = tpl.id
  rawHexData.value  = tpl.data
  rawLength.value   = tpl.len
}

async function handleSend() {
  const id = parseInt(rawReportId.value.replace(/^0x/i,''), 16)
  const ok = await store.sendRaw(id, rawHexData.value, rawLength.value)
  lastResult.value = { ok, msg: `0x${id.toString(16)} [${rawHexData.value.trim()}]` }
}

async function handleReadConfig() {
  loading.value = true
  try {
    const res = await store.readSinoWealthConfig()
    lastResult.value = {
      ok: Boolean(res),
      msg: res ? `Config okundu (${res.length} byte)` : 'Config okunamadı.'
    }
  } finally {
    loading.value = false
  }
}

async function handleWriteConfig() {
  loading.value = true
  try {
    const ok = await store.writeSinoWealthConfig()
    lastResult.value = {
      ok,
      msg: ok ? 'Config bloğu fareden kabul edildi!' : 'Config yazma hatası.'
    }
  } finally {
    loading.value = false
  }
}

async function handleReadFirmware() {
  loading.value = true
  try {
    const fw = await store.readFirmwareVersion()
    lastResult.value = {
      ok: Boolean(fw),
      msg: fw ? `Firmware: ${fw}` : 'Firmware okunamadı.'
    }
  } finally {
    loading.value = false
  }
}
</script>
