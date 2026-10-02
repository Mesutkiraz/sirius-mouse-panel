<template>
  <div class="space-y-5">

    <!-- ========================================================
         ÜST BANNER: ESPOR STÜDYOSU & PROFİL YÖNETİMİ
         ======================================================== -->
    <div class="hk-panel p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-sm font-semibold tracking-wide text-white">Espor Profilleri & Makro Motoru</h2>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
            PRO PRESETS
          </span>
        </div>
        <p class="text-xs text-slate-400 mt-0.5">Dünya şampiyonlarının onaylı donanım yapılandırmaları ve donanımsal makrolar</p>
      </div>

      <!-- Araç Butonları: Ses & Yedekleme -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Taktiksel Klik Sesi -->
        <button
          @click="toggleSound"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-95"
          :class="clickSoundEnabled
            ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
            : 'border-hk-border bg-hk-surface text-slate-400 hover:text-white'"
          title="Tıklamalarda mekanik switch sesi çal"
        >
          <span>{{ clickSoundEnabled ? '🔊' : '🔇' }}</span>
          <span>Klik Sesi: {{ clickSoundEnabled ? 'Açık' : 'Kapalı' }}</span>
        </button>

        <!-- Profil Yedekle -->
        <button
          @click="exportConfig"
          :disabled="!connected"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hk-border bg-hk-surface text-slate-300 hover:text-white hover:border-slate-500 text-xs font-semibold transition-all disabled:opacity-30 active:scale-95"
        >
          <span>💾</span>
          <span>Yedekle (JSON)</span>
        </button>

        <!-- Profil Yükle -->
        <label
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hk-border bg-hk-surface text-slate-300 hover:text-white hover:border-slate-500 text-xs font-semibold cursor-pointer transition-all active:scale-95"
          :class="{ 'opacity-30 pointer-events-none': !connected }"
        >
          <span>📁</span>
          <span>İçe Aktar</span>
          <input type="file" accept=".json" class="hidden" @change="onFileImport" />
        </label>
      </div>
    </div>

    <!-- ========================================================
         1. ESPOR OYUNCU PROFİLLERİ (8 PRESET)
         ======================================================== -->
    <div class="hk-panel p-5 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-hk-border">
        <div>
          <h3 class="text-sm font-semibold tracking-wide text-white">Efsanevi Espor Oyuncu Profilleri</h3>
          <p class="text-xs text-slate-400">Tek tıkla oyuncunun DPI, Raporlama Hızı, LOD ve Gecikme ayarlarını farenin çipine yazın</p>
        </div>
        <span class="text-xs font-mono text-slate-400 hidden sm:inline">1-Click Flash</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          v-for="p in proPresets"
          :key="p.name"
          @click="applyProPreset(p)"
          :disabled="!connected"
          class="p-3.5 rounded-xl border text-left transition-all duration-150 active:scale-95 disabled:opacity-30 relative flex flex-col justify-between"
          :class="isPresetActive(p)
            ? 'border-hk-blue bg-hk-surface ring-1 ring-hk-blue/40 shadow-sm'
            : 'border-hk-border bg-hk-card hover:border-slate-600 hover:bg-hk-card-hover'"
        >
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xl">{{ p.icon }}</span>
              <span
                class="text-[11px] font-mono font-bold px-2 py-0.5 rounded border"
                :style="{ borderColor: p.color + '50', color: p.color, backgroundColor: p.color + '15' }"
              >
                {{ p.dpi }} CPI
              </span>
            </div>

            <span class="text-sm font-bold text-white block">{{ p.name }}</span>
            <span class="text-xs text-slate-400 font-medium block">{{ p.game }}</span>
          </div>

          <div class="mt-3 pt-2 border-t border-hk-border/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>{{ p.hz }}Hz</span>
            <span>•</span>
            <span>{{ p.debounce }}ms</span>
            <span>•</span>
            <span>{{ p.lod }}</span>
          </div>

          <!-- Aktif Rozet -->
          <span
            v-if="isPresetActive(p)"
            class="absolute top-2 right-2 w-2 h-2 rounded-full bg-hk-blue ring-2 ring-blue-900 animate-pulse"
          ></span>
        </button>
      </div>
    </div>

    <!-- ========================================================
         2. UNIVERSAL GAME SENSITIVITY & eDPI DÖNÜŞTÜRÜCÜ
         ======================================================== -->
    <div class="hk-panel p-5 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-hk-border">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-base text-hk-blue">📐</span>
            <h3 class="text-sm font-semibold tracking-wide text-white">Universal Game Sensitivity & eDPI Eşitleyici</h3>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
              AIM SYNC
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            Oyunlar arası motor açı çarpanlarını eşitleyin; el hafızanızı bozmadan masanızdaki 360° dönüş mesafesini koruyun
          </p>
        </div>
      </div>

      <!-- Giriş Alanları -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <!-- Oyun Seçimi -->
        <div>
          <label class="text-[11px] font-medium text-slate-300 block mb-1">Oynadığınız Ana Oyun</label>
          <select
            v-model="sourceGame"
            class="w-full rounded-lg border border-hk-border bg-hk-surface px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-hk-blue"
          >
            <option v-for="(g, id) in GAME_YAW" :key="id" :value="id">
              {{ g.name }}
            </option>
          </select>
        </div>

        <!-- Oyun İçi Hassasiyet -->
        <div>
          <label class="text-[11px] font-medium text-slate-300 block mb-1">Oyun İçi Hassasiyet (Sens)</label>
          <input
            v-model.number="sourceSens"
            type="number"
            step="0.01"
            min="0.01"
            max="100"
            class="w-full rounded-lg border border-hk-border bg-hk-surface px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-hk-blue"
          />
        </div>

        <!-- Farenin DPI Değeri -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-[11px] font-medium text-slate-300">Farenin DPI'ı</label>
            <span class="text-[10px] text-slate-400 font-mono">Aktif: {{ state.activeDpi }}</span>
          </div>
          <input
            v-model.number="calcDpi"
            type="number"
            step="50"
            min="100"
            max="16000"
            class="w-full rounded-lg border border-hk-border bg-hk-surface px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-hk-blue"
          />
        </div>
      </div>

      <!-- Anlık Özet Metrikleri -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-hk-surface border border-hk-border">
        <div>
          <span class="text-[10px] uppercase font-mono text-slate-400 block">360° Tam Tur Dönüş Mesafesi</span>
          <div class="flex items-baseline gap-2 mt-0.5">
            <span class="text-2xl font-black font-mono text-hk-cyan">{{ cmPer360 }}</span>
            <span class="text-xs font-mono text-slate-400">cm / 360°</span>
          </div>
          <span class="text-[11px] text-slate-400">Masanızda tam bir tur dönmek için gereken fiziksel kaydırma.</span>
        </div>

        <div>
          <span class="text-[10px] uppercase font-mono text-slate-400 block">Hesaplanan eDPI Değeri</span>
          <div class="flex items-baseline gap-2 mt-0.5">
            <span class="text-2xl font-black font-mono text-emerald-400">{{ calculatedEdpi }}</span>
            <span class="text-xs font-mono text-slate-400">eDPI</span>
          </div>
          <span class="text-[11px] text-slate-400">Sensör CPI × Oyun İçi Sens çarpanı.</span>
        </div>
      </div>

      <!-- Diğer Oyunlardaki Birebir Karşılıklar Grid -->
      <div class="space-y-2">
        <span class="text-xs font-semibold text-slate-300 block">El Hafızanızı Korumak İçin Diğer Oyunlardaki Birebir Değerler:</span>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <div
            v-for="(g, id) in GAME_YAW"
            :key="id"
            class="p-2.5 rounded-lg border bg-hk-surface text-center flex flex-col justify-between"
            :class="sourceGame === id ? 'border-hk-blue/60 bg-hk-card ring-1 ring-hk-blue/30' : 'border-hk-border'"
          >
            <span class="text-[11px] font-bold text-slate-300 block truncate">{{ g.name }}</span>
            <span class="text-sm font-black font-mono text-white my-1 block">
              {{ getConvertedSens(id) }}
            </span>
            <span class="text-[9px] font-mono text-slate-500">
              {{ sourceGame === id ? 'Seçili Oyun' : 'Eşdeğer Sens' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================
         3. RAPID-FIRE & MAKRO DONANIM MOTORU AÇIKLAMASI
         ======================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

      <!-- Sol Kart: Rapid-Fire Çalışma Prensibi -->
      <div class="hk-panel p-5 space-y-3">
        <div class="flex items-center gap-2 pb-2 border-b border-hk-border">
          <span class="text-lg text-amber-400">⚡</span>
          <div>
            <h3 class="text-sm font-semibold tracking-wide text-white">Donanımsal Rapid-Fire (Seri Ateş)</h3>
            <p class="text-xs text-slate-400">Anti-cheat yazılımlarına takılmayan 0ms donanım döngüsü</p>
          </div>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">
          Sirius-M'deki SinoWealth mikrokontrolcüsü, tuş atama tablosunda özel bir mikro-döngü bayrağı barındırır.
          Bu bayrak aktif edildiğinde farenin iç işlemcisi tuşa basılı tutulduğu sürece donanımsal USB paketlerini saniyede <strong>20 ila 33 kez</strong> ardışık basıp bırakarak yollar.
        </p>

        <div class="p-3 rounded-lg bg-hk-surface border border-hk-border space-y-1.5 text-xs">
          <div class="flex items-center justify-between text-slate-300">
            <span class="font-medium">20 CPS Modu:</span>
            <span class="font-mono text-emerald-400">Dengeli Seri Ateş (CS2 / Valorant)</span>
          </div>
          <div class="flex items-center justify-between text-slate-300">
            <span class="font-medium">33 CPS Modu:</span>
            <span class="font-mono text-amber-400">Ultra Hızlı Burst (Fortnite / CoD)</span>
          </div>
        </div>

        <button
          @click="$emit('switch-tab', 'buttons')"
          class="w-full py-2 px-3 rounded-lg bg-hk-blue text-white text-xs font-semibold hover:bg-blue-600 active:scale-95 transition-all text-center block"
        >
          Tuş Haritasına Git ve Rapid-Fire Ata →
        </button>
      </div>

      <!-- Sağ Kart: Donanım EEPROM Güvenliği -->
      <div class="hk-panel p-5 space-y-3">
        <div class="flex items-center gap-2 pb-2 border-b border-hk-border">
          <span class="text-lg text-emerald-400">🛡️</span>
          <div>
            <h3 class="text-sm font-semibold tracking-wide text-white">Sürücüsüz Bellek Mimarisi</h3>
            <p class="text-xs text-slate-400">Turnuvalarda ve farklı bilgisayarlarda %100 taşınabilir</p>
          </div>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">
          Bu web panelinden yaptığınız tüm DPI, raporlama hızı, LOD, tuş ataması ve renk değişiklikleri farenin içindeki kalıcı <strong>EEPROM</strong> çipine kazınır.
        </p>

        <ul class="space-y-2 text-xs text-slate-400">
          <li class="flex items-start gap-2">
            <span class="text-emerald-400 font-bold">✓</span>
            <span>Arka planda RAM tüketen veya gecikme (input lag) yaratan hiçbir program çalışmaz.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-emerald-400 font-bold">✓</span>
            <span>Fareyi çıkartıp başka bir bilgisayara taktığınızda ayarlarınız aynen korunur.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-emerald-400 font-bold">✓</span>
            <span>Vanguard, EAC, BattleEye veya FACEIT gibi anti-cheat sistemleriyle tam uyumludur.</span>
          </li>
        </ul>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { store } from '../hid-store.js'

defineEmits(['switch-tab'])

const state             = store.state
const connected         = computed(() => state.connected)
const clickSoundEnabled = computed(() => state.clickSound ?? false)

// ===== UNIVERSAL GAME SENSITIVITY ENGINE =====
const GAME_YAW = {
  valorant: { name: 'Valorant', yaw: 0.07, defaultSens: 0.35 },
  cs2:      { name: 'CS2 / CS:GO', yaw: 0.022, defaultSens: 1.11 },
  apex:     { name: 'Apex Legends', yaw: 0.022, defaultSens: 1.11 },
  ow2:      { name: 'Overwatch 2', yaw: 0.0066, defaultSens: 3.71 },
  fortnite: { name: 'Fortnite (%)', yaw: 0.005555, defaultSens: 8.8 },
  r6:       { name: 'Rainbow Six Siege', yaw: 0.00572, defaultSens: 4.8 },
  cod:      { name: 'Call of Duty', yaw: 0.0066, defaultSens: 3.71 },
}

const sourceGame = ref('valorant')
const sourceSens = ref(0.35)
const calcDpi    = ref(800)

watch(() => state.activeDpi, (val) => {
  if (val) calcDpi.value = val
}, { immediate: true })

const cmPer360 = computed(() => {
  const g = GAME_YAW[sourceGame.value] || GAME_YAW.valorant
  const sens = sourceSens.value || 0.35
  const dpi = calcDpi.value || 800
  const yaw = g.yaw
  if (!sens || !dpi || !yaw) return '0.0'
  const cm = (360 / (sens * yaw * dpi)) * 2.54
  return cm.toFixed(1)
})

const calculatedEdpi = computed(() => {
  const sens = sourceSens.value || 0
  const dpi = calcDpi.value || 800
  return Math.round(sens * dpi)
})

function getConvertedSens(targetGameId) {
  const src = GAME_YAW[sourceGame.value] || GAME_YAW.valorant
  const tgt = GAME_YAW[targetGameId]
  if (!src || !tgt) return '0'
  if (sourceGame.value === targetGameId) return sourceSens.value
  const sens = sourceSens.value || 0
  const res = (sens * src.yaw) / tgt.yaw
  return res.toFixed(3).replace(/\.?0+$/, '')
}

// ===== PRO PRESETS =====
const proPresets = [
  { name: 's1mple',   game: 'CS2 Major MVP',   icon: '👑', dpi: 400,  hz: 1000, debounce: 4, lod: '2mm', color: '#ef4444' },
  { name: 'TenZ',     game: 'Valorant Legend', icon: '⚡', dpi: 800,  hz: 1000, debounce: 4, lod: '2mm', color: '#3b82f6' },
  { name: 'ZywOo',    game: 'CS2 Top Frag',    icon: '🎯', dpi: 400,  hz: 1000, debounce: 4, lod: '2mm', color: '#22c55e' },
  { name: 'shroud',   game: 'FPS Aim King',    icon: '🔥', dpi: 800,  hz: 1000, debounce: 4, lod: '2mm', color: '#a855f7' },
  { name: 'Faker',    game: 'LoL Demon King',  icon: '🛡️', dpi: 1600, hz: 1000, debounce: 6, lod: '3mm', color: '#eab308' },
  { name: 'Tfue',     game: 'Fortnite Build',  icon: '🏗️', dpi: 800,  hz: 1000, debounce: 4, lod: '2mm', color: '#06b6d4' },
  { name: 'Sniper',   game: 'Precision 1-Tap', icon: '🔭', dpi: 400,  hz: 1000, debounce: 4, lod: '2mm', color: '#ec4899' },
  { name: 'Ofis/Eco', game: 'Düşük Güç',       icon: '💼', dpi: 1200, hz: 500,  debounce: 8, lod: '3mm', color: '#94a3b8' },
]

function isPresetActive(p) {
  return state.activeDpi === p.dpi && state.pollingRate === p.hz && state.debounceMs === p.debounce && state.lod === p.lod
}

async function applyProPreset(p) {
  if (!connected.value) return
  if (store.playClickSound) store.playClickSound()
  await store.applyDpi(p.dpi, p.dpi, state.activeStage || 1)
  await store.applyPollingRate(p.hz)
  await store.applyDebounce(p.debounce)
  await store.applyLod(p.lod)
}

function toggleSound() {
  if (store.toggleClickSound) store.toggleClickSound()
}

function exportConfig() {
  if (store.exportProfile) store.exportProfile()
}

function onFileImport(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (ev) => {
    try {
      if (store.importProfile) await store.importProfile(ev.target.result)
    } catch (err) {
      alert('Geçersiz profil dosyası!')
    }
  }
  reader.readAsText(file)
}
</script>
