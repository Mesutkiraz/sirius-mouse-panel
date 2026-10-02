<template>
  <!-- ========================================================
       RgbSettings.vue
       RGB mod seçimi + renk seçici
       ======================================================== -->
  <div class="card-glow rounded-xl border border-hk-border bg-hk-card p-5 space-y-4">

    <!-- Başlık -->
    <div class="flex items-center gap-2">
      <span class="text-lg" :style="{ color: previewColor }">⬡</span>
      <h2 class="text-sm font-semibold uppercase tracking-widest text-slate-300">RGB Aydınlatma</h2>
    </div>

    <!-- Mod Seçici -->
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="mode in RGB_MODES"
        :key="mode.id"
        @click="handleModeChange(mode.id)"
        :disabled="!connected"
        class="flex flex-col items-center gap-1 rounded-lg border py-3 px-2
               text-xs font-semibold transition-all duration-200
               disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
        :class="selectedMode === mode.id
          ? 'border-current text-current shadow-glow'
          : 'border-hk-border bg-hk-surface text-slate-400 hover:border-slate-500 hover:text-slate-200'"
        :style="selectedMode === mode.id
          ? { borderColor: previewColor + '80', backgroundColor: previewColor + '18', color: previewColor }
          : {}"
      >
        <!-- İkon -->
        <span
          class="text-xl"
          :class="{
            'animate-breathe': mode.id === 'breathe' && selectedMode === 'breathe',
          }"
          :style="selectedMode === mode.id && mode.id !== 'off' ? { color: previewColor } : {}"
        >{{ mode.icon }}</span>
        <span>{{ mode.label }}</span>
      </button>
    </div>

    <!-- Renk Seçici (sadece static veya breathe modunda) -->
    <Transition name="fade">
      <div v-if="selectedMode !== 'off'" class="space-y-3">
        <div class="border-t border-hk-border pt-3">
          <label class="text-xs text-slate-500 uppercase tracking-wider mb-2 block">
            Renk Seç
          </label>

          <!-- Hızlı renk paleti -->
          <div class="flex flex-wrap gap-2 mb-3">
            <button
              v-for="preset in COLOR_PRESETS"
              :key="preset.hex"
              @click="handleColorChange(preset.hex)"
              :disabled="!connected"
              :title="preset.name"
              class="w-7 h-7 rounded-full border-2 transition-all duration-150
                     active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
              :style="{
                backgroundColor: preset.hex,
                borderColor: selectedColor === preset.hex ? '#ffffff' : 'transparent',
                boxShadow: selectedColor === preset.hex ? `0 0 8px 2px ${preset.hex}80` : 'none',
              }"
            ></button>
          </div>

          <!-- Özel renk input -->
          <div class="flex items-center gap-3">
            <div class="relative">
              <input
                type="color"
                v-model="selectedColor"
                @change="handleCustomColorChange"
                :disabled="!connected"
                class="w-10 h-10 rounded-lg cursor-pointer border border-hk-border
                       bg-transparent disabled:opacity-30 disabled:cursor-not-allowed"
              />
            </div>
            <div class="flex-1">
              <p class="text-xs text-slate-500 mb-0.5">Özel Renk</p>
              <p class="text-xs font-mono text-slate-300 uppercase">{{ selectedColor }}</p>
            </div>

            <!-- Canlı önizleme -->
            <div
              class="w-10 h-10 rounded-lg border border-white/10 transition-colors duration-300"
              :class="{ 'animate-breathe': selectedMode === 'breathe' }"
              :style="{ backgroundColor: previewColor }"
            ></div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Kapalı modu uyarısı -->
    <Transition name="fade">
      <p v-if="selectedMode === 'off'" class="text-xs text-slate-600 italic">
        RGB aydınlatma kapalı — fareyi yeniden başlatmanız gerekebilir.
      </p>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store, RGB_MODES } from '../hid-store.js'

// ---- Hazır renk paleti ----
const COLOR_PRESETS = [
  { name: 'HK Mavi',    hex: '#3b82f6' },
  { name: 'Cyan',       hex: '#06b6d4' },
  { name: 'Mor',        hex: '#818cf8' },
  { name: 'Yeşil',      hex: '#22c55e' },
  { name: 'Kırmızı',    hex: '#ef4444' },
  { name: 'Turuncu',    hex: '#f97316' },
  { name: 'Sarı',       hex: '#eab308' },
  { name: 'Pembe',      hex: '#ec4899' },
  { name: 'Beyaz',      hex: '#f8fafc' },
]

const state        = store.state
const connected    = computed(() => state.connected)
const selectedMode = ref(state.rgbMode)
const selectedColor= ref(state.rgbColor)
const previewColor = computed(() =>
  selectedMode.value === 'off' ? '#374151' : selectedColor.value
)

async function handleModeChange(mode) {
  selectedMode.value = mode
  await store.applyRgb(mode, selectedColor.value)
}

async function handleColorChange(hex) {
  selectedColor.value = hex
  await store.applyRgb(selectedMode.value, hex)
}

async function handleCustomColorChange() {
  await store.applyRgb(selectedMode.value, selectedColor.value)
}
</script>
