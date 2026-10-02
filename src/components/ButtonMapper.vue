<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">

    <!-- ========================================================
         SOL KOLON (5/12): İNTERAKTİF DONANIM ÇİZİMİ & CANLI MODEL
         ======================================================== -->
    <div class="lg:col-span-5 flex flex-col">
      <div
        @contextmenu.prevent
        class="hk-panel p-5 flex flex-col items-center justify-between flex-1 relative select-none"
      >
        <!-- Üst Başlık & Canlı Durum -->
        <div class="w-full flex items-center justify-between pb-3 border-b border-hk-border">
          <div>
            <h2 class="text-sm font-semibold tracking-wide text-white">Fiziksel Tuş Haritası</h2>
            <p class="text-xs text-slate-400">Sirius-M 6-Tuşlu Donanım Şeması</p>
          </div>
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded bg-hk-surface border border-hk-border">
            <span class="w-1.5 h-1.5 rounded-full" :class="lastActionText ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'"></span>
            <span class="text-[10px] font-mono text-slate-300">
              {{ lastActionText || 'Canlı Dinleniyor' }}
            </span>
          </div>
        </div>

        <!-- İnteraktif SVG Fare Çizimi -->
        <div class="relative w-52 h-80 my-4 flex items-center justify-center">
          <svg viewBox="0 0 160 250" class="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="mouseBodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#181b24"/>
                <stop offset="100%" stop-color="#0f1117"/>
              </linearGradient>
            </defs>

            <!-- Gövde Dış Hattı (Sirius-M Simetrik Ergonomi) -->
            <path
              d="M 26 95 C 26 42 54 18 80 18 C 106 18 134 42 134 95 L 134 185 C 134 220 110 236 80 236 C 50 236 26 220 26 185 Z"
              fill="url(#mouseBodyGrad)"
              stroke="#2a3042"
              stroke-width="1.8"
            />

            <!-- Petek Delik Ağı (Ultra-Hafif Gövde Temsili) -->
            <g opacity="0.15" stroke="#60a5fa" stroke-width="0.7" fill="none">
              <path d="M 65 145 L 75 138 L 85 138 L 95 145 L 85 152 L 75 152 Z" />
              <path d="M 52 156 L 62 149 L 72 149 L 82 156 L 72 163 L 62 163 Z" />
              <path d="M 78 156 L 88 149 L 98 149 L 108 156 L 98 163 L 88 163 Z" />
              <path d="M 65 168 L 75 161 L 85 161 L 95 168 L 85 175 L 75 175 Z" />
              <path d="M 52 180 L 62 173 L 72 173 L 82 180 L 72 187 L 62 187 Z" />
              <path d="M 78 180 L 88 173 L 98 173 L 108 180 L 98 187 L 88 187 Z" />
              <path d="M 65 192 L 75 185 L 85 185 L 95 192 L 85 199 L 75 199 Z" />
            </g>

            <!-- 1. SOL TIK (Left Button) -->
            <path
              @click="selectedButton = 1"
              d="M 30 92 C 30 46 54 22 74 20 L 74 96 L 32 96 Z"
              class="cursor-pointer transition-all duration-150"
              :fill="isPressed(1) ? '#3b82f6' : (selectedButton === 1 ? '#1e283d' : '#141720')"
              :stroke="isPressed(1) ? '#60a5fa' : (selectedButton === 1 ? '#3b82f6' : '#2b3245')"
              stroke-width="1.5"
            />
            <!-- Rozet 1 -->
            <circle cx="48" cy="54" r="9" :fill="selectedButton === 1 ? '#3b82f6' : '#242938'" />
            <text x="48" y="57" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle" class="pointer-events-none font-mono">1</text>

            <!-- 2. SAĞ TIK (Right Button) -->
            <path
              @click="selectedButton = 2"
              d="M 130 92 C 130 46 106 22 86 20 L 86 96 L 128 96 Z"
              class="cursor-pointer transition-all duration-150"
              :fill="isPressed(2) ? '#3b82f6' : (selectedButton === 2 ? '#1e283d' : '#141720')"
              :stroke="isPressed(2) ? '#60a5fa' : (selectedButton === 2 ? '#3b82f6' : '#2b3245')"
              stroke-width="1.5"
            />
            <!-- Rozet 2 -->
            <circle cx="112" cy="54" r="9" :fill="selectedButton === 2 ? '#3b82f6' : '#242938'" />
            <text x="112" y="57" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle" class="pointer-events-none font-mono">2</text>

            <!-- ORTA TEKERLEK YUVASI -->
            <rect x="73" y="24" width="14" height="74" rx="4" fill="#0b0d12" stroke="#232838" stroke-width="1" />

            <!-- 3. SCROLL TEKERLEĞİ (Middle Click & Scroll) -->
            <g @click="selectedButton = 3" class="cursor-pointer">
              <rect
                x="75" y="32" width="10" height="30" rx="5"
                class="transition-all duration-150"
                :fill="isPressed(3) ? '#06b6d4' : (selectedButton === 3 ? '#0e7490' : '#1a1e28')"
                :stroke="wheelAnim ? '#38bdf8' : (isPressed(3) ? '#22d3ee' : activeStageColor)"
                stroke-width="1.5"
              />
              <line x1="77" y1="40" x2="83" y2="40" stroke="#475569" stroke-width="1" />
              <line x1="77" y1="47" x2="83" y2="47" stroke="#475569" stroke-width="1" />
              <line x1="77" y1="54" x2="83" y2="54" stroke="#475569" stroke-width="1" />
            </g>
            <!-- Rozet 3 -->
            <circle cx="80" cy="18" r="7" :fill="selectedButton === 3 ? '#06b6d4' : '#242938'" />
            <text x="80" y="21" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle" class="pointer-events-none font-mono">3</text>

            <!-- 6. DPI TUŞU (DPI Switch) -->
            <rect
              @click="selectedButton = 6"
              x="76" y="72" width="8" height="15" rx="3"
              class="cursor-pointer transition-all duration-150"
              :fill="isPressed(6) ? activeStageColor : (selectedButton === 6 ? activeStageColor + 'aa' : '#1e2432')"
              :stroke="selectedButton === 6 ? '#ffffff' : activeStageColor"
              stroke-width="1.2"
            />
            <!-- Rozet 6 -->
            <circle cx="80" cy="98" r="7" :fill="selectedButton === 6 ? '#818cf8' : '#242938'" />
            <text x="80" y="101" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle" class="pointer-events-none font-mono">6</text>

            <!-- SOL YAN TUŞLAR: 5 (İLERİ) & 4 (GERİ) -->
            <!-- 5. İLERİ TUŞU (Side Forward) -->
            <g @click="selectedButton = 5" class="cursor-pointer">
              <rect
                x="12" y="68" width="12" height="20" rx="3"
                class="transition-all duration-150"
                :fill="isPressed(5) ? '#10b981' : (selectedButton === 5 ? '#047857' : '#1a1e28')"
                :stroke="selectedButton === 5 ? '#34d399' : '#333d52'"
                stroke-width="1.2"
              />
              <text x="18" y="81" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle" class="pointer-events-none font-mono">5</text>
            </g>

            <!-- 4. GERİ TUŞU (Side Backward) -->
            <g @click="selectedButton = 4" class="cursor-pointer">
              <rect
                x="12" y="93" width="12" height="22" rx="3"
                class="transition-all duration-150"
                :fill="isPressed(4) ? '#10b981' : (selectedButton === 4 ? '#047857' : '#1a1e28')"
                :stroke="selectedButton === 4 ? '#34d399' : '#333d52'"
                stroke-width="1.2"
              />
              <text x="18" y="107" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle" class="pointer-events-none font-mono">4</text>
            </g>

          </svg>
        </div>

        <!-- İnteraktif Test İpucu Çubuğu -->
        <div class="w-full text-center p-2.5 rounded-lg bg-hk-surface border border-hk-border text-xs text-slate-400">
          Fare tuşlarına bastığınızda veya tekerleği çevirdiğinizde model üzerinde canlı olarak ışık yanar.
        </div>
      </div>
    </div>

    <!-- ========================================================
         SAĞ KOLON (7/12): SEÇİLİ TUŞ VE DONANIMSAL GÖREV ATAMALARI
         ======================================================== -->
    <div class="lg:col-span-7 space-y-4">

      <!-- 1. TUŞ SEÇİCİ GRID (6 TUŞ ÇUBUĞU) -->
      <div class="hk-panel p-4 space-y-2">
        <span class="text-xs font-semibold text-slate-300 block mb-2">Fiziksel Tuş Listesi</span>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            v-for="btn in buttons"
            :key="btn.id"
            @click="selectedButton = btn.id"
            class="flex items-center justify-between p-2.5 rounded-lg border transition-all text-left"
            :class="selectedButton === btn.id
              ? 'border-hk-blue bg-hk-surface ring-1 ring-hk-blue/40'
              : 'border-hk-border bg-hk-card hover:border-slate-600'"
          >
            <div class="flex items-center gap-2">
              <span
                class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono"
                :class="isPressed(btn.id)
                  ? 'bg-hk-blue text-white'
                  : (selectedButton === btn.id ? 'bg-hk-blue/20 text-hk-blue' : 'bg-slate-800 text-slate-400')"
              >
                {{ btn.id }}
              </span>
              <div>
                <span class="text-xs font-bold text-white block leading-tight">{{ btn.name }}</span>
                <span class="text-[9px] text-slate-500 font-mono">{{ btn.hardwareKey }}</span>
              </div>
            </div>

            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-hk-dark border border-hk-border text-hk-cyan truncate max-w-[80px]">
              {{ getAssignedActionShort(btn.id) }}
            </span>
          </button>
        </div>
      </div>

      <!-- 2. SEÇİLİ TUŞ İÇİN ATAMA PANELİ -->
      <div class="hk-panel p-5 space-y-4">
        <!-- Başlık & Çip Durumu -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-hk-border">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-base font-bold text-white">
                Tuş {{ selectedButton }}: <span class="text-hk-blue">{{ getButtonName(selectedButton) }}</span>
              </span>
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-hk-surface border border-hk-border text-slate-300">
                {{ getAssignedAction(selectedButton) }}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">Bu tuşa tıklandığında farenin göndereceği donanımsal komutu seçin</p>
          </div>

          <div class="flex items-center gap-2">
            <!-- Kayıt Bildirimi -->
            <span v-if="savingButton" class="text-xs font-mono text-hk-cyan flex items-center gap-1">
              <span class="animate-spin">⟳</span> Çipe Yazılıyor…
            </span>
            <span v-else-if="saveSuccess" class="text-xs font-mono text-emerald-400">
              ✓ EEPROM Güncellendi
            </span>

            <!-- Sıfırla Düğmesi -->
            <button
              @click="handleResetButtons"
              :disabled="!connected"
              class="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded border border-hk-border hover:border-slate-500 transition-colors disabled:opacity-30"
              title="Tüm tuşları orijinal fabrika ayarlarına döndür"
            >
              Varsayılana Sıfırla
            </button>
          </div>
        </div>

        <!-- Kategori Filtresi -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="activeCategory = cat.id"
            class="px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium"
            :class="activeCategory === cat.id
              ? 'bg-hk-blue text-white shadow-sm'
              : 'text-slate-400 hover:text-white bg-hk-surface hover:bg-hk-card border border-hk-border'"
          >
            {{ cat.label }}
          </button>
        </div>

        <!-- Aksiyon Listesi Butonları -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
          <button
            v-for="act in filteredActions"
            :key="act.id"
            @click="assignAction(selectedButton, act.id)"
            :disabled="!connected || savingButton"
            class="flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs transition-all disabled:opacity-30 active:scale-95"
            :class="currentActionId(selectedButton) === act.id
              ? 'border-hk-blue bg-hk-blue/15 text-white font-bold ring-1 ring-hk-blue/40'
              : 'border-hk-border bg-hk-surface text-slate-300 hover:border-slate-600 hover:text-white'"
          >
            <span class="text-sm shrink-0">{{ act.icon }}</span>
            <span class="truncate">{{ act.label }}</span>
          </button>
        </div>

        <!-- Donanım Hafızası Bilgilendirmesi -->
        <div class="p-3 rounded-lg bg-hk-surface border border-hk-border text-xs text-slate-400 leading-relaxed">
          <p v-if="currentActionId(selectedButton).startsWith('sniper')">
            🔭 <strong class="text-white">Sniper / DPI Kilidi:</strong> Bu tuşa basılı tuttuğunuz sürece farenin hassasiyeti anında seçtiğiniz düşük değere (örn: 400 CPI) kilitlenir. Dürbün açıp piksel nişanı alırken el titremesini önler, tuşu bıraktığınızda anında orijinal DPI'a döner.
          </p>
          <p v-else-if="currentActionId(selectedButton).startsWith('rapid')">
            ⚡ <strong class="text-white">Rapid-Fire (Seri Ateş):</strong> Bu tuşa basılı tuttuğunuzda farenin iç mikrokontrolcüsü saniyede 20-33 kez ardışık tıklama üretir. CS2, CoD ve Fortnite yarı-otomatik silahlarda kesintisiz seri ateş sağlar.
          </p>
          <p v-else>
            <span class="font-semibold text-slate-200">🛡️ Doğrudan Donanım Hafızası:</span>
            Tuş atamaları doğrudan farenin SinoWealth EEPROM hafızasına işlenir. Arka planda hiçbir yazılım veya sürücü çalıştırmadan her bilgisayarda ve her oyunda çalışır.
          </p>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { store, BUTTON_ACTIONS } from '../hid-store.js'

const connected = computed(() => store.state.connected)

const activeStageColor = computed(() => {
  const stageNum = store.state.activeStage || 1
  return store.state.stageColors[stageNum - 1]?.hex || '#3b82f6'
})

const selectedButton = ref(4) // Varsayılan: Yan Geri tuşu
const lastActionText = ref('')
const wheelAnim      = ref(false)
const savingButton   = ref(false)
const saveSuccess    = ref(false)

const activeCategory = ref('all')
const categories = [
  { id: 'all',    label: 'Tümü' },
  { id: 'mouse',  label: 'Fare Tuşları' },
  { id: 'dpi',    label: '🎯 Sniper & DPI' },
  { id: 'macro',  label: 'Seri Ateş / Rapid-Fire' },
  { id: 'game',   label: 'Klavye Tuşları' },
  { id: 'media',  label: 'Medya & Ses' },
]

const pressedMap = ref({
  1: false,
  2: false,
  3: false,
  4: false,
  5: false,
  6: false,
})

function isPressed(btnId) {
  return Boolean(pressedMap.value[btnId])
}

const buttons = [
  { id: 1, name: 'Sol Tık',       hardwareKey: 'Button 1' },
  { id: 2, name: 'Sağ Tık',      hardwareKey: 'Button 2' },
  { id: 3, name: 'Tekerlek Tık', hardwareKey: 'Button 3' },
  { id: 4, name: 'Yan Geri',     hardwareKey: 'Button 4' },
  { id: 5, name: 'Yan İleri',    hardwareKey: 'Button 5' },
  { id: 6, name: 'DPI Tuşu',     hardwareKey: 'Button 6' },
]

const buttonAssignments = computed(() => store.state.buttonAssignments)

const allActions = computed(() =>
  Object.entries(BUTTON_ACTIONS).map(([id, act]) => ({ id, ...act }))
)

const filteredActions = computed(() => {
  if (activeCategory.value === 'all') return allActions.value
  return allActions.value.filter(a => a.category === activeCategory.value)
})

function getButtonName(id) {
  return buttons.find(b => b.id === id)?.name ?? `Tuş ${id}`
}

function currentActionId(id) {
  return buttonAssignments.value[id] || 'default_left'
}

function getAssignedAction(id) {
  const actId = buttonAssignments.value[id]
  const act = BUTTON_ACTIONS[actId]
  return act ? `${act.icon} ${act.label}` : 'Standart'
}

function getAssignedActionShort(id) {
  const actId = buttonAssignments.value[id]
  const act = BUTTON_ACTIONS[actId]
  return act ? act.label : 'Standart'
}

async function assignAction(btnId, actId) {
  if (!connected.value) return
  savingButton.value = true
  saveSuccess.value = false
  if (store.playClickSound) store.playClickSound()

  try {
    const ok = await store.applyButtonAssignment(btnId, actId)
    if (ok) {
      saveSuccess.value = true
      setTimeout(() => { saveSuccess.value = false }, 2500)
    }
  } finally {
    savingButton.value = false
  }
}

async function handleResetButtons() {
  if (!connected.value) return
  if (store.playClickSound) store.playClickSound()
  await store.resetButtonAssignments()
}

// Canlı Dinleme
let wheelTimeout = null

function handleGlobalMouseDown(e) {
  let mappedId = null
  if (e.button === 0) mappedId = 1
  else if (e.button === 2) mappedId = 2
  else if (e.button === 1) mappedId = 3
  else if (e.button === 3) mappedId = 4
  else if (e.button === 4) mappedId = 5

  if (mappedId) {
    pressedMap.value[mappedId] = true
    lastActionText.value = `${getButtonName(mappedId)} Basıldı`
  }
}

function handleGlobalMouseUp(e) {
  let mappedId = null
  if (e.button === 0) mappedId = 1
  else if (e.button === 2) mappedId = 2
  else if (e.button === 1) mappedId = 3
  else if (e.button === 3) mappedId = 4
  else if (e.button === 4) mappedId = 5

  if (mappedId) {
    pressedMap.value[mappedId] = false
  }
}

function handleGlobalWheel(e) {
  wheelAnim.value = true
  lastActionText.value = e.deltaY < 0 ? 'Tekerlek Yukarı ⬆' : 'Tekerlek Aşağı ⬇'

  clearTimeout(wheelTimeout)
  wheelTimeout = setTimeout(() => {
    wheelAnim.value = false
  }, 180)
}

onMounted(() => {
  window.addEventListener('mousedown', handleGlobalMouseDown)
  window.addEventListener('mouseup', handleGlobalMouseUp)
  window.addEventListener('wheel', handleGlobalWheel, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('mousedown', handleGlobalMouseDown)
  window.removeEventListener('mouseup', handleGlobalMouseUp)
  window.removeEventListener('wheel', handleGlobalWheel)
  clearTimeout(wheelTimeout)
})
</script>
