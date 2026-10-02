<template>
  <!-- ============================================================
       App.vue — HK Gaming Sirius-M Esports Control Center
       Native-feeling, sleek, human-designed gaming software interface
       ============================================================ -->
  <div class="min-h-screen flex flex-col bg-[#0b0c10] text-slate-100 selection:bg-blue-600/30">

    <!-- ===== 1. TOP APPLICATION HEADER ===== -->
    <header class="sticky top-0 z-30 border-b border-hk-border bg-[#0e1017]/90 backdrop-blur-md">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        <!-- Sol: Marka & Model Bilgisi -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm shadow-sm">
            HK
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-sm font-bold text-white tracking-wide leading-none">SIRIUS-M ULTRA</h1>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                PMW3389
              </span>
            </div>
            <p class="text-[11px] text-slate-400 font-medium tracking-tight mt-0.5">
              HK Gaming · SinoWealth v7 Hardware Engine
            </p>
          </div>
        </div>

        <!-- Sağ: Donanım Durumu & Bağlantı Düğmesi -->
        <div class="flex items-center gap-3">
          <!-- Bağlantı Durum Hapı -->
          <div
            class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs"
            :class="connected ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-hk-border bg-hk-surface text-slate-400'"
          >
            <span
              class="w-2 h-2 rounded-full"
              :class="connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'"
            ></span>
            <span class="font-medium">
              {{ connected ? (state.deviceName || 'Sirius-M Bağlı') : 'Cihaz Aranıyor' }}
            </span>
            <span v-if="connected && state.activeDpi" class="font-mono text-[11px] text-slate-400 border-l border-emerald-500/20 pl-2">
              {{ state.activeDpi }} CPI
            </span>
            <span v-if="connected && state.pollingRate" class="font-mono text-[11px] text-slate-400">
              {{ state.pollingRate }} Hz
            </span>
          </div>

          <!-- Taktiksel Ses Aç/Kapat -->
          <button
            @click="toggleSound"
            class="p-2 rounded-lg border border-hk-border bg-hk-surface hover:bg-hk-card text-slate-400 hover:text-white transition-colors"
            :title="`Taktiksel switch sesi: ${clickSoundEnabled ? 'Açık' : 'Kapalı'}`"
          >
            <span class="text-sm">{{ clickSoundEnabled ? '🔊' : '🔇' }}</span>
          </button>

          <!-- Ana Bağlan / Bağlantıyı Kes Butonu -->
          <button
            v-if="!connected"
            @click="handleConnect"
            :disabled="connecting"
            class="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-hk-blue text-white text-xs font-semibold hover:bg-blue-600 active:scale-95 transition-all shadow-sm disabled:opacity-40"
          >
            <span v-if="connecting" class="animate-spin text-white">⟳</span>
            <span>{{ connecting ? 'Bağlanıyor…' : 'Farenizi Bağlayın' }}</span>
          </button>

          <button
            v-else
            @click="handleDisconnect"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 active:scale-95 text-xs font-medium transition-all"
          >
            <span>✕ Bağlantıyı Kes</span>
          </button>
        </div>

      </div>
    </header>

    <!-- ===== 2. TAB NAVIGATION BAR ===== -->
    <nav class="border-b border-hk-border bg-[#0d0f16]/95">
      <div class="max-w-6xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
          :class="activeTab === tab.id
            ? 'bg-hk-blue text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-hk-surface'"
        >
          <span>{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </button>

        <!-- Sağ Uç: Konsol Drawer Açma Butonu -->
        <button
          @click="logOpen = !logOpen"
          class="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          :class="logOpen ? 'bg-hk-surface text-white border border-hk-border' : 'text-slate-500 hover:text-slate-300'"
        >
          <span>Konsol</span>
          <span
            v-if="logs.length"
            class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-500/20 text-blue-400 font-bold"
          >
            {{ logs.length }}
          </span>
        </button>
      </div>
    </nav>

    <!-- ===== 3. MAIN CONTENT VIEWPORT ===== -->
    <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-5">

      <!-- WebHID Uyarısı (Tarayıcı Uyumluluk Hatası Varsa) -->
      <div
        v-if="!hidSupported"
        class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3"
      >
        <span class="text-amber-400 text-lg">⚠</span>
        <div>
          <p class="text-sm font-semibold text-amber-300">WebHID API Desteklenmiyor</p>
          <p class="text-xs text-slate-300 mt-1">
            Farenin dahili donanımına doğrudan erişebilmek için <strong>Google Chrome</strong> veya <strong>Microsoft Edge</strong> (sürüm 89+) kullanmanız gerekmektedir.
          </p>
        </div>
      </div>

      <!-- Bağlantı Yok İkaz Banner'ı (Kullanıcı henüz bağlanmadıysa) -->
      <div
        v-if="!connected"
        class="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-base">
            🔌
          </div>
          <div>
            <h3 class="text-xs font-semibold text-white">HK Gaming Sirius-M Ultra Donanımı Bekleniyor</h3>
            <p class="text-[11px] text-slate-400">
              Farenizi USB portuna takın ve farenin dahili SinoWealth EEPROM belleğini okumak için <strong>Farenizi Bağlayın</strong> düğmesine tıklayın.
            </p>
          </div>
        </div>

        <button
          @click="handleConnect"
          :disabled="connecting"
          class="px-4 py-2 rounded-lg bg-hk-blue text-white text-xs font-semibold hover:bg-blue-600 active:scale-95 transition-all self-start sm:self-auto shrink-0 shadow-sm"
        >
          {{ connecting ? 'Bağlanıyor…' : 'Farenizi Bağlayın' }}
        </button>
      </div>

      <!-- TAB İÇERİKLERİ -->
      <Transition name="fade" mode="out-in">
        <!-- 1. SEKME: SENSÖR & DPI -->
        <div v-if="activeTab === 'dpi'" key="dpi">
          <DpiSettings />
        </div>

        <!-- 2. SEKME: TUŞ HARİTASI & CANLI MODEL -->
        <div v-else-if="activeTab === 'buttons'" key="buttons">
          <ButtonMapper />
        </div>

        <!-- 3. SEKME: ESPOR PROFİLLERİ & MAKRO -->
        <div v-else-if="activeTab === 'esports'" key="esports">
          <EsportsStudio @switch-tab="activeTab = $event" />
        </div>

        <!-- 4. SEKME: TEST & TEŞHİS -->
        <div v-else-if="activeTab === 'diagnostics'" key="diagnostics">
          <DiagnosticsStudio />
        </div>

        <!-- 5. SEKME: GELİŞTİRİCİ HID -->
        <div v-else-if="activeTab === 'raw'" key="raw">
          <RawTester />
        </div>
      </Transition>

    </main>

    <!-- ===== 4. COLLAPSIBLE LOG DRAWER ===== -->
    <div
      v-if="logOpen"
      class="border-t border-hk-border bg-[#0d0f16] shadow-2xl transition-all"
    >
      <div class="max-w-6xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between pb-2 border-b border-hk-border">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-300">Donanım İletişim Konsolu</span>
            <span class="text-[10px] font-mono text-slate-500">WebHID SinoWealth I/O</span>
          </div>

          <div class="flex items-center gap-3">
            <button
              v-if="logs.length"
              @click="clearLogs"
              class="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Temizle
            </button>
            <button
              @click="logOpen = false"
              class="text-xs text-slate-400 hover:text-white transition-colors"
            >
              ✕ Kapat
            </button>
          </div>
        </div>

        <div class="log-area py-2 space-y-1">
          <div v-if="!logs.length" class="text-slate-600 text-xs py-3 text-center font-mono">
            Henüz donanım logu yok — farenizi bağlayarak başlayın.
          </div>

          <div
            v-for="(entry, i) in logs"
            :key="i"
            class="flex items-start gap-2 text-xs"
          >
            <span class="text-slate-600 font-mono text-[11px] shrink-0">{{ entry.ts }}</span>
            <span
              class="font-mono font-bold shrink-0"
              :class="{
                'text-hk-blue': entry.type === 'cmd',
                'text-emerald-400': entry.type === 'success',
                'text-amber-400': entry.type === 'warn',
                'text-rose-400': entry.type === 'error',
                'text-slate-400': entry.type === 'info',
              }"
            >
              {{ { cmd: '→', success: '✓', warn: '⚠', error: '✗', info: '·' }[entry.type] ?? '▸' }}
            </span>
            <span class="text-slate-300 font-mono text-[11px] break-all">{{ entry.msg }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 5. MINIMALIST APPLICATION FOOTER ===== -->
    <footer class="border-t border-hk-border py-3 bg-[#090b10] text-center text-xs text-slate-500">
      <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>HK GAMING SIRIUS-M ULTRA · PIXART PMW3389 · 61G</span>
        <span class="font-mono text-[11px] text-slate-600">SinoWealth EEPROM Driverless Protocol · WebHID Standard</span>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from './hid-store.js'

import DpiSettings       from './components/DpiSettings.vue'
import ButtonMapper      from './components/ButtonMapper.vue'
import EsportsStudio     from './components/EsportsStudio.vue'
import DiagnosticsStudio from './components/DiagnosticsStudio.vue'
import RawTester         from './components/RawTester.vue'

const state             = store.state
const connected         = computed(() => state.connected)
const logs              = computed(() => state.logs)
const clickSoundEnabled = computed(() => state.clickSound ?? false)
const hidSupported      = ref('hid' in navigator)
const connecting        = ref(false)
const logOpen           = ref(false)

const activeTab = ref('dpi')

const tabs = [
  { id: 'dpi',         label: 'Sensör & DPI',         icon: '🎯' },
  { id: 'buttons',     label: 'Tuş Haritası',         icon: '🖱️' },
  { id: 'esports',     label: 'Espor & Makro',        icon: '⚡' },
  { id: 'diagnostics', label: 'Test & Teşhis',        icon: '🔬' },
  { id: 'raw',         label: 'Geliştirici (HID)',    icon: '🛠️' },
]

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

function toggleSound() {
  if (store.toggleClickSound) store.toggleClickSound()
}

function clearLogs() {
  state.logs.length = 0
}
</script>
