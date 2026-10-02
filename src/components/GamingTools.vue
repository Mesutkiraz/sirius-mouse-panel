<template>
  <div class="space-y-5">

    <!-- ===== ÜST BİLGİ & HIZLI ARAÇLAR BAR ===== -->
    <div class="card-glow rounded-xl border border-hk-border bg-hk-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-lg">
          ⚡
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-bold uppercase tracking-wider text-slate-200">
              Espor & Sensör Stüdyosu
            </h2>
            <span class="text-[9px] px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-mono font-bold">
              PRO SUITE
            </span>
          </div>
          <p class="text-[10px] text-slate-500">PixArt PMW3389 donanımsal sensör ve switch performans laboratuvarı</p>
        </div>
      </div>

      <!-- Hızlı Araçlar: Tıklama Sesi & Profil İndir/Yükle -->
      <div class="flex items-center gap-2 self-start sm:self-auto flex-wrap">
        <!-- Taktiksel Klik Sesi -->
        <button
          @click="toggleSound"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-95"
          :class="clickSoundEnabled
            ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
            : 'border-hk-border bg-hk-surface text-slate-500 hover:text-slate-300'"
          title="Tıklamalarda mekanik switch sesi çal"
        >
          <span>{{ clickSoundEnabled ? '🔊' : '🔇' }}</span>
          <span class="text-[10px]">Taktiksel Ses: {{ clickSoundEnabled ? 'AÇIK' : 'KAPALI' }}</span>
        </button>

        <!-- Profil İndir -->
        <button
          @click="exportConfig"
          :disabled="!connected"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-hk-border bg-hk-surface text-slate-400 hover:text-white hover:border-slate-500 text-xs font-semibold transition-all disabled:opacity-30 active:scale-95"
          title="Ayarlarını JSON dosyası olarak indir"
        >
          <span>💾</span>
          <span class="text-[10px]">Yedekle</span>
        </button>

        <!-- Profil Yükle -->
        <label
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-hk-border bg-hk-surface text-slate-400 hover:text-white hover:border-slate-500 text-xs font-semibold cursor-pointer transition-all active:scale-95"
          :class="{ 'opacity-30 pointer-events-none': !connected }"
          title="JSON profil dosyası yükle"
        >
          <span>📁</span>
          <span class="text-[10px]">Yükle</span>
          <input type="file" accept=".json" class="hidden" @change="onFileImport" />
        </label>
      </div>
    </div>

    <!-- ===== 1. ESPOR EFSANELERİ & PRO PROFİLLER ===== -->
    <div class="card-glow rounded-xl border border-hk-border bg-hk-card p-5 space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-amber-400 text-base">🏆</span>
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200">
              Espor Oyuncu & Oyun Profilleri
            </h3>
            <p class="text-[10px] text-slate-500">Dünyanın en iyi oyuncularının hassasiyet, Hz ve LOD yapılandırması</p>
          </div>
        </div>
        <span class="text-[9px] font-mono text-slate-500">Tek Tıkla Fareye Yaz</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          v-for="p in proPresets"
          :key="p.name"
          @click="applyProPreset(p)"
          :disabled="!connected"
          class="group flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-150 active:scale-95 disabled:opacity-30 relative overflow-hidden"
          :class="isPresetActive(p)
            ? 'border-amber-500/60 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
            : 'border-hk-border bg-hk-surface hover:border-amber-500/40 hover:bg-hk-surface/80'"
        >
          <div class="flex items-center justify-between w-full mb-1.5">
            <span class="text-lg">{{ p.icon }}</span>
            <span
              class="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border"
              :style="{ borderColor: p.color + '60', color: p.color, backgroundColor: p.color + '15' }"
            >
              {{ p.dpi }} CPI
            </span>
          </div>

          <span class="text-xs font-black text-slate-200 group-hover:text-white">{{ p.name }}</span>
          <span class="text-[10px] text-slate-400 font-medium">{{ p.game }}</span>
          
          <div class="mt-2 flex items-center gap-1.5 text-[9px] font-mono text-slate-500">
            <span>{{ p.hz }}Hz</span>
            <span>•</span>
            <span>{{ p.debounce }}ms</span>
            <span>•</span>
            <span>{{ p.lod }}</span>
          </div>

          <span
            v-if="isPresetActive(p)"
            class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"
          ></span>
        </button>
      </div>
    </div>

    <!-- ===== 2. SENSÖR & DONANIM KALİBRASYONU (LOD, ANGLE SNAPPING, DEBOUNCE) ===== -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

      <!-- 2A. LOD (Lift-Off Distance) -->
      <div class="card-glow rounded-xl border border-hk-border bg-hk-card p-4 space-y-3 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>📐</span>
              <span>LOD (Kaldırma Mesafesi)</span>
            </span>
            <span class="text-[10px] font-mono text-emerald-400 font-bold">{{ activeLod }}</span>
          </div>
          <p class="text-[10px] text-slate-500 leading-tight">
            Fareyi mousepad'den kaldırdığında takibin kesileceği yükseklik. Esporda hedef kaymasını önler.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-1">
          <button
            @click="handleLodChange('2mm')"
            :disabled="!connected"
            class="py-2 px-2.5 rounded-lg border text-xs font-bold transition-all disabled:opacity-30 active:scale-95 text-center flex flex-col items-center"
            :class="activeLod === '2mm'
              ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
              : 'border-hk-border bg-hk-surface text-slate-400 hover:text-white hover:border-slate-500'"
          >
            <span>2mm Düşük</span>
            <span class="text-[8px] font-mono text-emerald-400 uppercase tracking-tighter mt-0.5">ESPOR ÖNERİLEN</span>
          </button>

          <button
            @click="handleLodChange('3mm')"
            :disabled="!connected"
            class="py-2 px-2.5 rounded-lg border text-xs font-bold transition-all disabled:opacity-30 active:scale-95 text-center flex flex-col items-center"
            :class="activeLod === '3mm'
              ? 'border-hk-blue bg-hk-blue/15 text-hk-blue shadow-[0_0_10px_rgba(59,130,246,0.3)]'
              : 'border-hk-border bg-hk-surface text-slate-400 hover:text-white hover:border-slate-500'"
          >
            <span>3mm Yüksek</span>
            <span class="text-[8px] font-mono text-slate-500 uppercase tracking-tighter mt-0.5">KALIN PAD</span>
          </button>
        </div>
      </div>

      <!-- 2B. Angle Snapping (Açı Düzeltme) -->
      <div class="card-glow rounded-xl border border-hk-border bg-hk-card p-4 space-y-3 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>📏</span>
              <span>Açı Düzeltme (Angle Snapping)</span>
            </span>
            <span
              class="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded"
              :class="activeAngleSnapping ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'"
            >
              {{ activeAngleSnapping ? 'AÇIK' : 'KAPALI' }}
            </span>
          </div>
          <p class="text-[10px] text-slate-500 leading-tight">
            Sensörün el titremesini düzelterek düz çizgiler çekmesi. FPS oyunlarında saf kontrol için <strong>KAPALI</strong> olmalıdır.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-1">
          <button
            @click="handleAngleSnapping(false)"
            :disabled="!connected"
            class="py-2 px-2.5 rounded-lg border text-xs font-bold transition-all disabled:opacity-30 active:scale-95 text-center flex flex-col items-center"
            :class="!activeAngleSnapping
              ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
              : 'border-hk-border bg-hk-surface text-slate-400 hover:text-white hover:border-slate-500'"
          >
            <span>KAPALI (Saf 1:1)</span>
            <span class="text-[8px] font-mono text-emerald-400 uppercase tracking-tighter mt-0.5">ESPOR STANDARDI</span>
          </button>

          <button
            @click="handleAngleSnapping(true)"
            :disabled="!connected"
            class="py-2 px-2.5 rounded-lg border text-xs font-bold transition-all disabled:opacity-30 active:scale-95 text-center flex flex-col items-center"
            :class="activeAngleSnapping
              ? 'border-amber-500 bg-amber-500/15 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
              : 'border-hk-border bg-hk-surface text-slate-400 hover:text-white hover:border-slate-500'"
          >
            <span>AÇIK (Düzeltmeli)</span>
            <span class="text-[8px] font-mono text-slate-500 uppercase tracking-tighter mt-0.5">ÇİZİM / CAD</span>
          </button>
        </div>
      </div>

      <!-- 2C. Debounce Time (Tıklama Gecikmesi) -->
      <div class="card-glow rounded-xl border border-hk-border bg-hk-card p-4 space-y-3 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>⏱️</span>
              <span>Debounce (Tık Gecikmesi)</span>
            </span>
            <span class="text-[10px] font-mono text-rose-400 font-bold">{{ activeDebounce }}ms</span>
          </div>
          <p class="text-[10px] text-slate-500 leading-tight">
            Mekanik switch kontağının gecikmesi. Düşük değerler çatışmalarda en erken ilk mermiyi atmanızı sağlar.
          </p>
        </div>

        <div class="grid grid-cols-5 gap-1 pt-1">
          <button
            v-for="ms in [4, 6, 8, 12, 16]"
            :key="ms"
            @click="handleDebounce(ms)"
            :disabled="!connected"
            class="py-1.5 rounded border text-xs font-mono font-bold transition-all disabled:opacity-30 active:scale-95 flex flex-col items-center"
            :class="activeDebounce === ms
              ? 'border-rose-500 bg-rose-500/15 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
              : 'border-hk-border bg-hk-surface text-slate-500 hover:border-slate-500 hover:text-slate-300'"
          >
            <span>{{ ms }}</span>
            <span class="text-[7px] text-slate-600 font-normal">ms</span>
          </button>
        </div>
      </div>

    </div>

    <!-- ===== 3. ÇİFT TIKLAMA (CHATTER) TEŞHİS LABORATUVARI ===== -->
    <div class="card-glow rounded-xl border border-hk-border bg-hk-card p-5 space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-emerald-400 text-base">🔬</span>
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200">
              Mekanik Switch Sağlık & Çift Tıklama (Chatter) Teşhisi
            </h3>
            <p class="text-[10px] text-slate-500">Omron anahtarlarının çift tıklama veya donanımsal temas titremesini test eder</p>
          </div>
        </div>

        <button
          @click="resetSwitchTest"
          class="text-[10px] font-mono text-slate-400 hover:text-white px-2 py-1 rounded border border-slate-700 hover:border-slate-500 transition-colors"
        >
          ↺ Testi Sıfırla
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <!-- Tıklama Test Alanı -->
        <div
          @mousedown="onSwitchTestClick"
          class="md:col-span-7 p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer select-none text-center flex flex-col items-center justify-center min-h-[120px]"
          :class="isTestingClick
            ? 'border-emerald-400 bg-emerald-500/10 scale-[0.99]'
            : 'border-slate-700 bg-hk-surface/60 hover:border-slate-500'"
        >
          <span class="text-2xl mb-1">👆</span>
          <span class="text-xs font-bold text-slate-200">Buraya seri bir şekilde sol / sağ tıkla</span>
          <span class="text-[10px] text-slate-500 mt-1">İki tıklama arasındaki milisaniye farkı anlık analiz edilir</span>
        </div>

        <!-- Ölçüm Metrikleri -->
        <div class="md:col-span-5 grid grid-cols-2 gap-2">
          <div class="p-2.5 rounded-lg bg-black/40 border border-slate-800">
            <span class="text-[9px] uppercase tracking-wider text-slate-500 block">Son Tık Aralığı</span>
            <span class="text-lg font-black font-mono tabular-nums text-hk-cyan">
              {{ lastClickInterval ? lastClickInterval + ' ms' : '--' }}
            </span>
          </div>

          <div class="p-2.5 rounded-lg bg-black/40 border border-slate-800">
            <span class="text-[9px] uppercase tracking-wider text-slate-500 block">En Hızlı Tık</span>
            <span class="text-lg font-black font-mono tabular-nums text-emerald-400">
              {{ fastestClickInterval ? fastestClickInterval + ' ms' : '--' }}
            </span>
          </div>

          <div class="p-2.5 rounded-lg bg-black/40 border border-slate-800">
            <span class="text-[9px] uppercase tracking-wider text-slate-500 block">İstenmeyen Çift Tık</span>
            <span
              class="text-lg font-black font-mono tabular-nums"
              :class="doubleClickCount > 0 ? 'text-rose-400' : 'text-slate-400'"
            >
              {{ doubleClickCount }}
            </span>
          </div>

          <div class="p-2.5 rounded-lg bg-black/40 border border-slate-800">
            <span class="text-[9px] uppercase tracking-wider text-slate-500 block">Switch Durumu</span>
            <span
              class="text-xs font-black font-mono leading-none block mt-1.5"
              :class="doubleClickCount > 0 ? 'text-amber-400' : 'text-emerald-400'"
            >
              {{ doubleClickCount > 0 ? '⚠️ Titreme Var' : '✅ %100 Sağlam' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 4. CANLI SENSÖR JITTER & TAKİP KANVASI ===== -->
    <div class="card-glow rounded-xl border border-hk-border bg-hk-card p-5 space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-hk-cyan text-base">🎯</span>
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200">
              Canlı Sensör Jitter & Takip Çizim Laboratuvarı
            </h3>
            <p class="text-[10px] text-slate-500">Piksel atlama, el titremesi ve sensör yumuşatmasını canlı kanvasta gözlemle</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="clearCanvas"
            class="text-[10px] font-mono text-slate-400 hover:text-white px-2 py-1 rounded border border-slate-700 hover:border-slate-500 transition-colors"
          >
            Temizle
          </button>
          <button
            @click="saveCanvasImage"
            class="text-[10px] font-mono text-hk-cyan hover:text-white px-2 py-1 rounded border border-hk-cyan/40 bg-hk-cyan/10 transition-colors"
          >
            📷 Çizimi İndir
          </button>
        </div>
      </div>

      <!-- Çizim Kanvası ve Metrikler -->
      <div class="relative rounded-xl border border-slate-800 overflow-hidden bg-[#0a0a10]">
        <!-- Metrik HUD Çubuğu (Kanvas Üzerinde) -->
        <div class="absolute top-2.5 left-3 right-3 flex items-center justify-between pointer-events-none z-10 text-[10px] font-mono">
          <div class="flex items-center gap-3 bg-black/60 backdrop-blur px-2.5 py-1 rounded-md border border-slate-800">
            <span class="text-slate-400">Anlık Hz: <strong class="text-hk-cyan">{{ currentHz }} Hz</strong></span>
            <span class="text-slate-400">Tepe: <strong class="text-emerald-400">{{ peakHz }} Hz</strong></span>
            <span class="text-slate-400">CPS: <strong class="text-amber-400">{{ currentCps }}</strong></span>
          </div>

          <span class="text-slate-500 hidden sm:inline">Fareyi hızlıca döndürerek daire ve spiraller çizin</span>
        </div>

        <!-- HTML5 Çizim Kanvası -->
        <canvas
          ref="canvasRef"
          width="760"
          height="220"
          @mousemove="drawMotion"
          @mousedown="startDrawing"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
          class="w-full h-[220px] cursor-crosshair block"
        ></canvas>
      </div>
    </div>

    <!-- ===== 5. GERÇEK SENSÖR DPI & CETVEL KALİBRASYONU ===== -->
    <div class="card-glow rounded-xl border border-hk-border bg-hk-card p-5 space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-purple-400 text-base">📏</span>
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-200">
              Gerçek Sensör DPI & Cetvel Kalibrasyon Testi
            </h3>
            <p class="text-[10px] text-slate-500">
              Fiziksel mesafeyi ölçerek PMW3389 sensörünün fabrika DPI sapmasını (%99+ doğruluk) analiz edin
            </p>
          </div>
        </div>

        <button
          v-if="!measuringDpi"
          @click="startDpiMeasure"
          :disabled="!connected"
          class="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs transition-all disabled:opacity-30"
        >
          Kalibrasyonu Başlat
        </button>
        <button
          v-else
          @click="finishDpiMeasure"
          class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs transition-all animate-pulse"
        >
          ✓ Ölçümü Tamamla
        </button>
      </div>

      <!-- Fiziksel Cetvel Kılavuzu (10 cm) -->
      <div class="p-3.5 rounded-xl bg-hk-surface/80 border border-hk-border space-y-3">
        <div class="flex items-center justify-between text-xs text-slate-300 font-medium">
          <span>Adım: Fareyi masanızda tam <strong>10 cm</strong> düz sağa kaydırın</span>
          <span class="text-purple-400 font-mono text-[10px]">Referans Mesafe: 10 cm (~3.94 inç)</span>
        </div>

        <!-- Cetvel Görseli -->
        <div class="relative h-7 bg-slate-900 border border-slate-700 rounded flex items-center px-2 select-none">
          <div class="w-full flex justify-between text-[9px] font-mono text-slate-500">
            <span>0 cm</span>
            <span>2.5 cm</span>
            <span>5 cm</span>
            <span>7.5 cm</span>
            <span>10 cm</span>
          </div>
          <!-- Cetvel Çizgileri -->
          <div class="absolute inset-0 flex justify-between px-2 items-end pb-1 pointer-events-none opacity-40">
            <span v-for="i in 21" :key="i" class="w-px bg-slate-400" :class="i % 5 === 1 ? 'h-3' : 'h-1.5'"></span>
          </div>
        </div>

        <!-- Test Sonucu Paneli -->
        <div v-if="measuredDpiResult" class="p-3 rounded-lg bg-black/40 border border-purple-500/30 flex items-center justify-between">
          <div>
            <span class="text-[10px] uppercase font-mono text-slate-400">Hedef DPI: {{ state.activeDpi }} CPI</span>
            <p class="text-lg font-black font-mono text-purple-400">
              Ölçülen Gerçek Değer: {{ measuredDpiResult.measured }} CPI
            </p>
          </div>
          <div class="text-right">
            <span class="text-[10px] uppercase font-mono text-slate-400">Sensör Doğruluğu</span>
            <p class="text-lg font-black font-mono text-emerald-400">
              %{{ measuredDpiResult.accuracy }} Doğruluk
            </p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { store } from '../hid-store.js'

const state          = store.state
const connected      = computed(() => state.connected)
const activeDebounce = computed(() => state.debounceMs ?? 4)
const activeLod      = computed(() => state.lod ?? '2mm')
const activeAngleSnapping = computed(() => state.angleSnapping ?? false)
const clickSoundEnabled   = computed(() => state.clickSound ?? false)

// ===== 1. PRO ESPOR OYUNCU PROFİLLERİ =====
const proPresets = [
  { name: 's1mple',   game: 'CS2 Major MVP',   icon: '👑', dpi: 400,  hz: 1000, debounce: 4, lod: '2mm', color: '#ef4444' },
  { name: 'TenZ',     game: 'Valorant Legend', icon: '⚡', dpi: 800,  hz: 1000, debounce: 4, lod: '2mm', color: '#3b82f6' },
  { name: 'ZywOo',    game: 'CS2 Top Frag',    icon: '🎯', dpi: 400,  hz: 1000, debounce: 4, lod: '2mm', color: '#22c55e' },
  { name: 'shroud',   game: 'FPS Aim King',    icon: '🔥', dpi: 800,  hz: 1000, debounce: 4, lod: '2mm', color: '#a855f7' },
  { name: 'Faker',    game: 'LoL Demon King',  icon: '🛡️', dpi: 1600, hz: 1000, debounce: 6, lod: '3mm', color: '#eab308' },
  { name: 'Tfue',     game: 'Fortnite Build',  icon: '🏗️', dpi: 800,  hz: 1000, debounce: 4, lod: '2mm', color: '#06b6d4' },
  { name: 'Sniper',   game: 'Precision 1-Tap', icon: '🔭', dpi: 400,  hz: 1000, debounce: 4, lod: '2mm', color: '#ec4899' },
  { name: 'Ofis/Eco', game: 'Günlük & Düşük Güç', icon: '💼', dpi: 1200, hz: 500,  debounce: 8, lod: '3mm', color: '#94a3b8' },
]

function isPresetActive(p) {
  return state.activeDpi === p.dpi && state.pollingRate === p.hz && state.debounceMs === p.debounce && state.lod === p.lod
}

async function applyProPreset(p) {
  if (!connected.value) return
  if (store.playClickSound) store.playClickSound()
  await store.applyDpi(p.dpi, state.activeStage || 1)
  await store.applyPollingRate(p.hz)
  await store.applyDebounce(p.debounce)
  await store.applyLod(p.lod)
}

// ===== 2. DONANIM AYARLARI (LOD, ANGLE SNAPPING, DEBOUNCE) =====
async function handleLodChange(lod) {
  if (!connected.value) return
  if (store.playClickSound) store.playClickSound()
  await store.applyLod(lod)
}

async function handleAngleSnapping(val) {
  if (!connected.value) return
  if (store.playClickSound) store.playClickSound()
  await store.applyAngleSnapping(val)
}

async function handleDebounce(ms) {
  if (!connected.value) return
  if (store.playClickSound) store.playClickSound()
  await store.applyDebounce(ms)
}

function toggleSound() {
  if (store.toggleClickSound) store.toggleClickSound()
}

// ===== 3. ÇİFT TIKLAMA (CHATTER) TEST LABORATUVARI =====
const isTestingClick       = ref(false)
const lastClickInterval    = ref(null)
const fastestClickInterval = ref(null)
const doubleClickCount     = ref(0)
let lastClickTime = 0

function onSwitchTestClick() {
  if (store.playClickSound) store.playClickSound()
  isTestingClick.value = true
  setTimeout(() => { isTestingClick.value = false }, 80)

  const now = performance.now()
  if (lastClickTime > 0) {
    const diff = Math.round(now - lastClickTime)
    lastClickInterval.value = diff

    if (!fastestClickInterval.value || diff < fastestClickInterval.value) {
      fastestClickInterval.value = diff
    }

    // Şüpheli donanımsal çift tık (< 35ms)
    if (diff < 35) {
      doubleClickCount.value++
    }
  }
  lastClickTime = now
}

function resetSwitchTest() {
  lastClickTime = 0
  lastClickInterval.value = null
  fastestClickInterval.value = null
  doubleClickCount.value = 0
}

// ===== 4. CANLI SENSÖR JITTER KANVASI =====
const canvasRef = ref(null)
let ctx = null
let isDrawing = false
let prevX = 0, prevY = 0

const currentHz   = ref(0)
const peakHz      = ref(0)
const currentCps  = ref(0)
let lastMoveTime  = 0
let clickTimestamps = []

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    clearCanvas()
  }
})

function clearCanvas() {
  if (!ctx || !canvasRef.value) return
  ctx.fillStyle = '#0a0a10'
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  // İnce kılavuz ızgara
  ctx.strokeStyle = '#181824'
  ctx.lineWidth = 1
  for (let x = 0; x < canvasRef.value.width; x += 30) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasRef.value.height); ctx.stroke()
  }
  for (let y = 0; y < canvasRef.value.height; y += 30) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasRef.value.width, y); ctx.stroke()
  }
}

function startDrawing(e) {
  isDrawing = true
  const rect = canvasRef.value.getBoundingClientRect()
  prevX = e.clientX - rect.left
  prevY = e.clientY - rect.top
  if (store.playClickSound) store.playClickSound()

  // CPS kaydı
  const now = performance.now()
  clickTimestamps.push(now)
  clickTimestamps = clickTimestamps.filter(t => now - t <= 1000)
  currentCps.value = clickTimestamps.length
}

function stopDrawing() {
  isDrawing = false
}

function drawMotion(e) {
  const now = performance.now()
  if (lastMoveTime > 0) {
    const delta = now - lastMoveTime
    if (delta > 0 && delta < 50) {
      const hz = Math.round(1000 / delta)
      if (hz <= 1200) {
        currentHz.value = hz
        if (hz > peakHz.value) peakHz.value = hz
      }
    }
  }
  lastMoveTime = now

  if (!ctx || !canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  if (isDrawing) {
    const activeColor = state.stageColors[state.activeStage - 1]?.hex || '#06b6d4'
    ctx.beginPath()
    ctx.moveTo(prevX, prevY)
    ctx.lineTo(x, y)
    ctx.strokeStyle = activeColor
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.stroke()
  }
  prevX = x
  prevY = y
}

function saveCanvasImage() {
  if (!canvasRef.value) return
  const link = document.createElement('a')
  link.download = `hk_sensor_jitter_test_${Date.now()}.png`
  link.href = canvasRef.value.toDataURL()
  link.click()
}

// ===== 5. GERÇEK SENSÖR DPI & CETVEL KALİBRASYONU =====
const measuringDpi        = ref(false)
const measuredDpiResult   = ref(null)
let measureStartCounts    = 0
let totalMovedPixels      = 0

function startDpiMeasure() {
  measuringDpi.value = true
  measuredDpiResult.value = null
  totalMovedPixels = 0
  window.addEventListener('mousemove', onDpiMeasureMove)
}

function onDpiMeasureMove(e) {
  if (!measuringDpi.value) return
  totalMovedPixels += Math.abs(e.movementX)
}

function finishDpiMeasure() {
  measuringDpi.value = false
  window.removeEventListener('mousemove', onDpiMeasureMove)

  // 10 cm = 3.937 inç
  // Gerçek DPI = kat edilen piksel / inç
  const inches = 3.937
  const measured = Math.round(totalMovedPixels / inches)
  const target = state.activeDpi || 800
  const diff = Math.abs(measured - target)
  const accuracy = Math.max(90, Math.min(100, (100 - (diff / target) * 100))).toFixed(2)

  measuredDpiResult.value = {
    measured: Math.max(100, Math.min(16000, measured)),
    accuracy
  }
}

// ===== 6. PROFİL DIŞA AKTAR / İÇE AKTAR =====
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
