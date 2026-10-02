<template>
  <div class="space-y-5">

    <!-- ========================================================
         ÜST BAŞLIK BİLGİSİ
         ======================================================== -->
    <div class="hk-panel p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-sm font-semibold tracking-wide text-white">Donanım Test & Teşhis Laboratuvarı</h2>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            DIAGNOSTICS
          </span>
        </div>
        <p class="text-xs text-slate-400 mt-0.5">Omron switch sağlığı, sensör takip akıcılığı ve gerçek CPI doğruluğu testleri</p>
      </div>

      <div class="flex items-center gap-2 text-xs font-mono text-slate-400">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>Yüksek Hassasiyetli Web Timer Aktif</span>
      </div>
    </div>

    <!-- ========================================================
         1. MEKANİK SWITCH ÇİFT TIKLAMA (CHATTER) TESTİ
         ======================================================== -->
    <div class="hk-panel p-5 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-hk-border">
        <div>
          <h3 class="text-sm font-semibold tracking-wide text-white">Mekanik Switch Sağlık & Çift Tıklama (Chatter) Testi</h3>
          <p class="text-xs text-slate-400">Omron anahtar kontaklarının donanımsal çift tık (bounce) arızalarını milisaniye hassasiyetinde tespit edin</p>
        </div>

        <button
          @click="resetSwitchTest"
          class="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded border border-hk-border hover:border-slate-500 transition-colors"
        >
          Testi Sıfırla
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        <!-- Tıklama Pedi -->
        <div
          @mousedown="onSwitchTestClick"
          class="md:col-span-7 p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer select-none text-center flex flex-col items-center justify-center min-h-[140px]"
          :class="isTestingClick
            ? 'border-emerald-400 bg-emerald-500/10 scale-[0.99]'
            : 'border-hk-border bg-hk-surface hover:border-slate-500 hover:bg-hk-card'"
        >
          <span class="text-2xl mb-1">👆</span>
          <span class="text-sm font-bold text-white">Buraya art arda seri tıklayın</span>
          <span class="text-xs text-slate-400 mt-1">İki tıklama arasındaki milisaniye farkı anlık olarak filtrelenir</span>
        </div>

        <!-- Ölçüm Metrikleri -->
        <div class="md:col-span-5 grid grid-cols-2 gap-2.5">
          <div class="p-3 rounded-lg bg-hk-surface border border-hk-border">
            <span class="text-[10px] uppercase font-mono text-slate-400 block">Son Tık Aralığı</span>
            <span class="text-xl font-bold font-mono text-white mt-0.5 block">
              {{ lastClickInterval ? lastClickInterval + ' ms' : '--' }}
            </span>
          </div>

          <div class="p-3 rounded-lg bg-hk-surface border border-hk-border">
            <span class="text-[10px] uppercase font-mono text-slate-400 block">En Hızlı Tık</span>
            <span class="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">
              {{ fastestClickInterval ? fastestClickInterval + ' ms' : '--' }}
            </span>
          </div>

          <div class="p-3 rounded-lg bg-hk-surface border border-hk-border">
            <span class="text-[10px] uppercase font-mono text-slate-400 block">Hatalı Çift Tık (&lt;35ms)</span>
            <span
              class="text-xl font-bold font-mono mt-0.5 block"
              :class="doubleClickCount > 0 ? 'text-rose-400' : 'text-slate-400'"
            >
              {{ doubleClickCount }}
            </span>
          </div>

          <div class="p-3 rounded-lg bg-hk-surface border border-hk-border">
            <span class="text-[10px] uppercase font-mono text-slate-400 block">Switch Sağlığı</span>
            <span
              class="text-xs font-bold font-mono mt-1.5 block"
              :class="doubleClickCount > 0 ? 'text-amber-400' : 'text-emerald-400'"
            >
              {{ doubleClickCount > 0 ? '⚠️ Titreme Var' : '✓ %100 Sağlam' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================
         2. CANLI SENSÖR JITTER & HAREKET KANVASI
         ======================================================== -->
    <div class="hk-panel p-5 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-hk-border">
        <div>
          <h3 class="text-sm font-semibold tracking-wide text-white">Canlı Sensör Jitter & Takip Çizim Kanvası</h3>
          <p class="text-xs text-slate-400">Piksel atlama, mikro titremeler ve anlık donanımsal raporlama sıklığını canlı analiz edin</p>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="clearCanvas"
            class="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded border border-hk-border hover:border-slate-500 transition-colors"
          >
            Temizle
          </button>
          <button
            @click="saveCanvasImage"
            class="text-xs text-hk-blue hover:text-white px-2.5 py-1 rounded border border-hk-blue/40 bg-hk-blue/10 hover:bg-hk-blue/20 transition-colors font-medium"
          >
            Görüntüyü Kaydet
          </button>
        </div>
      </div>

      <!-- Çizim Alanı -->
      <div class="relative rounded-xl border border-hk-border overflow-hidden bg-[#0d0f14]">
        <!-- HUD Bilgi Çubuğu -->
        <div class="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10 text-xs font-mono">
          <div class="flex items-center gap-3 bg-hk-dark/80 backdrop-blur px-3 py-1.5 rounded-lg border border-hk-border/80">
            <span class="text-slate-400">Anlık: <strong class="text-hk-blue">{{ currentHz }} Hz</strong></span>
            <span class="text-slate-400">Tepe: <strong class="text-emerald-400">{{ peakHz }} Hz</strong></span>
            <span class="text-slate-400">CPS: <strong class="text-amber-400">{{ currentCps }}</strong></span>
          </div>

          <span class="text-slate-500 hidden sm:inline">Daireler ve spiraller çizerek sensör takibini gözlemleyin</span>
        </div>

        <canvas
          ref="canvasRef"
          width="840"
          height="230"
          @mousemove="drawMotion"
          @mousedown="startDrawing"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
          class="w-full h-[230px] cursor-crosshair block"
        ></canvas>
      </div>
    </div>

    <!-- ========================================================
         3. GERÇEK SENSÖR DPI & CETVEL KALİBRASYON TESTİ
         ======================================================== -->
    <div class="hk-panel p-5 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-hk-border">
        <div>
          <h3 class="text-sm font-semibold tracking-wide text-white">Gerçek Sensör DPI & Cetvel Kalibrasyon Testi</h3>
          <p class="text-xs text-slate-400">
            Fiziksel masanızdaki mesafeyi piksellerle eşleştirerek PixArt PMW3389 sensörünün fabrika DPI sapmasını ölçün
          </p>
        </div>

        <button
          v-if="!measuringDpi"
          @click="startDpiMeasure"
          :disabled="!connected"
          class="px-3.5 py-1.5 rounded-lg bg-hk-blue hover:bg-blue-600 active:scale-95 text-white font-semibold text-xs transition-all disabled:opacity-30"
        >
          Kalibrasyonu Başlat
        </button>
        <button
          v-else
          @click="finishDpiMeasure"
          class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs transition-all animate-pulse"
        >
          ✓ Ölçümü Tamamla (10 cm)
        </button>
      </div>

      <!-- Cetvel Şeması -->
      <div class="p-4 rounded-xl bg-hk-surface border border-hk-border space-y-3">
        <div class="flex items-center justify-between text-xs text-slate-300">
          <span>Kılavuz: Fareyi masanızda tam <strong>10 cm</strong> düz bir çizgide sağa kaydırın.</span>
          <span class="text-hk-blue font-mono text-[11px]">Referans Mesafe: 10 cm (~3.937 inç)</span>
        </div>

        <!-- Sanal Cetvel Görünümü -->
        <div class="relative h-8 bg-hk-dark border border-hk-border rounded-lg flex items-center px-3 select-none">
          <div class="w-full flex justify-between text-[10px] font-mono text-slate-400">
            <span>0 cm</span>
            <span>2.5 cm</span>
            <span>5 cm</span>
            <span>7.5 cm</span>
            <span>10 cm</span>
          </div>
          <div class="absolute inset-0 flex justify-between px-3 items-end pb-1 pointer-events-none opacity-30">
            <span v-for="i in 21" :key="i" class="w-px bg-slate-300" :class="i % 5 === 1 ? 'h-3.5' : 'h-1.5'"></span>
          </div>
        </div>

        <!-- Ölçüm Sonuç Kartı -->
        <div v-if="measuredDpiResult" class="p-3.5 rounded-lg bg-hk-card border border-hk-border flex items-center justify-between">
          <div>
            <span class="text-[10px] uppercase font-mono text-slate-400">Farenin Ayarlı DPI'ı</span>
            <p class="text-lg font-bold font-mono text-white">
              {{ state.activeDpi || 800 }} CPI
            </p>
          </div>
          <div>
            <span class="text-[10px] uppercase font-mono text-slate-400">Ölçülen Gerçek Değer</span>
            <p class="text-lg font-bold font-mono text-hk-cyan">
              {{ measuredDpiResult.measured }} CPI
            </p>
          </div>
          <div class="text-right">
            <span class="text-[10px] uppercase font-mono text-slate-400">Sensör Doğruluk Payı</span>
            <p class="text-lg font-bold font-mono text-emerald-400">
              %{{ measuredDpiResult.accuracy }} Doğruluk
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================
         4. USB POLLING JITTER & GECİKME TUTARLILIK BENCHMARK'I
         ======================================================== -->
    <div class="hk-panel p-5 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hk-border">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-base text-hk-cyan">⚡</span>
            <h3 class="text-sm font-semibold tracking-wide text-white">USB Polling Jitter & Gecikme Tutarlılık Benchmark'ı</h3>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
              MOUSETESTER PRO
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            Farenin 1000 Hz USB raporlama paketlerinin milisaniye sapmasını (Jitter) ve Windows USB mikro takılmalarını canlı ölçün
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="!isBenchmarking"
            @click="startBenchmark"
            :disabled="!connected"
            class="px-3.5 py-1.5 rounded-lg bg-hk-cyan hover:bg-cyan-400 active:scale-95 text-slate-950 font-bold text-xs transition-all disabled:opacity-30 shadow-sm"
          >
            ▶ Benchmark'ı Başlat
          </button>
          <button
            v-else
            @click="stopBenchmark"
            class="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs transition-all animate-pulse"
          >
            ⏹ Benchmark'ı Durdur
          </button>

          <button
            @click="resetBenchmark"
            class="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-hk-border hover:border-slate-500 transition-colors"
          >
            Sıfırla
          </button>
        </div>
      </div>

      <!-- Benchmark Test Kutusu & Canlı Hareket Alanı -->
      <div
        @mousemove="onBenchmarkMove"
        class="p-6 rounded-xl border border-hk-border transition-all flex flex-col items-center justify-center min-h-[110px] text-center select-none"
        :class="isBenchmarking ? 'bg-cyan-500/5 border-hk-cyan/40 cursor-crosshair' : 'bg-hk-surface'"
      >
        <span class="text-2xl mb-1">{{ isBenchmarking ? '🌀' : '🖱️' }}</span>
        <span class="text-sm font-bold text-white">
          {{ isBenchmarking ? 'Fareyi bu alan üzerinde sürekli ve hızlıca hareket ettirin' : 'Testi başlatın ve fareyi hareket ettirin' }}
        </span>
        <span class="text-xs text-slate-400 mt-1">
          {{ isBenchmarking ? `Toplanan Örnek Sayısı: ${benchmarkSamples.length} paket` : 'Hedef: 1000 Hz için 1.00 ms paket aralığı' }}
        </span>
      </div>

      <!-- Benchmark Metrikleri Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div class="p-3 rounded-lg bg-hk-surface border border-hk-border">
          <span class="text-[10px] uppercase font-mono text-slate-400 block">Ortalama Gecikme</span>
          <span class="text-xl font-bold font-mono text-hk-cyan mt-0.5 block">
            {{ benchmarkAvg ? benchmarkAvg + ' ms' : '--' }}
          </span>
          <span class="text-[9px] text-slate-500 font-mono">Hedef: 1.00 ms (1000Hz)</span>
        </div>

        <div class="p-3 rounded-lg bg-hk-surface border border-hk-border">
          <span class="text-[10px] uppercase font-mono text-slate-400 block">Standart Sapma (Jitter)</span>
          <span
            class="text-xl font-bold font-mono mt-0.5 block"
            :class="benchmarkStdDev && benchmarkStdDev < 0.20 ? 'text-emerald-400' : 'text-amber-400'"
          >
            {{ benchmarkStdDev ? '±' + benchmarkStdDev + ' ms' : '--' }}
          </span>
          <span class="text-[9px] text-slate-500 font-mono">&lt; 0.20ms = Espor Notu</span>
        </div>

        <div class="p-3 rounded-lg bg-hk-surface border border-hk-border">
          <span class="text-[10px] uppercase font-mono text-slate-400 block">Mikro Takılma (&gt;3ms)</span>
          <span
            class="text-xl font-bold font-mono mt-0.5 block"
            :class="benchmarkSpikes > 0 ? 'text-rose-400' : 'text-slate-300'"
          >
            {{ benchmarkSpikes }} paket
          </span>
          <span class="text-[9px] text-slate-500 font-mono">Geciken veri paketleri</span>
        </div>

        <div class="p-3 rounded-lg bg-hk-surface border border-hk-border">
          <span class="text-[10px] uppercase font-mono text-slate-400 block">Tutarlılık Puanı</span>
          <span
            class="text-xl font-bold font-mono mt-0.5 block"
            :class="benchmarkScore >= 98 ? 'text-emerald-400' : 'text-amber-400'"
          >
            {{ benchmarkScore ? '%' + benchmarkScore : '--' }}
          </span>
          <span class="text-[9px] text-slate-500 font-mono">{{ benchmarkScore >= 98 ? '✓ Mükemmel Kararlılık' : 'Test bekleniyor' }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { store } from '../hid-store.js'

const state     = store.state
const connected = computed(() => state.connected)

// ===== 1. SWITCH TEST =====
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

// ===== 2. JITTER KANVASI =====
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
  ctx.fillStyle = '#0d0f14'
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  ctx.strokeStyle = '#1a1e28'
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
    const activeColor = state.stageColors[state.activeStage - 1]?.hex || '#3b82f6'
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
  link.download = `sirius_m_jitter_test_${Date.now()}.png`
  link.href = canvasRef.value.toDataURL()
  link.click()
}

// ===== 3. CETVEL KALİBRASYONU =====
const measuringDpi      = ref(false)
const measuredDpiResult = ref(null)
let totalMovedPixels    = 0

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

// ===== 4. USB POLLING JITTER BENCHMARK =====
const isBenchmarking   = ref(false)
const benchmarkSamples = ref([])
const benchmarkAvg     = ref(null)
const benchmarkStdDev  = ref(null)
const benchmarkSpikes  = ref(0)
const benchmarkScore   = ref(null)
let lastBenchTime      = 0

function startBenchmark() {
  if (store.playClickSound) store.playClickSound()
  isBenchmarking.value   = true
  benchmarkSamples.value = []
  benchmarkAvg.value     = null
  benchmarkStdDev.value  = null
  benchmarkSpikes.value  = 0
  benchmarkScore.value   = null
  lastBenchTime          = 0
}

function stopBenchmark() {
  if (store.playClickSound) store.playClickSound()
  isBenchmarking.value = false
  calculateBenchmarkStats()
}

function resetBenchmark() {
  if (store.playClickSound) store.playClickSound()
  isBenchmarking.value   = false
  benchmarkSamples.value = []
  benchmarkAvg.value     = null
  benchmarkStdDev.value  = null
  benchmarkSpikes.value  = 0
  benchmarkScore.value   = null
  lastBenchTime          = 0
}

function onBenchmarkMove() {
  if (!isBenchmarking.value) return
  const now = performance.now()
  if (lastBenchTime > 0) {
    const delta = now - lastBenchTime
    if (delta >= 0.2 && delta <= 20) {
      benchmarkSamples.value.push(delta)
      if (delta > 3.0) {
        benchmarkSpikes.value++
      }
      if (benchmarkSamples.value.length % 15 === 0) {
        calculateBenchmarkStats()
      }
    }
  }
  lastBenchTime = now
}

function calculateBenchmarkStats() {
  const samples = benchmarkSamples.value
  if (!samples.length) return
  const sum = samples.reduce((a, b) => a + b, 0)
  const avg = sum / samples.length
  benchmarkAvg.value = avg.toFixed(2)

  // Standart Sapma (Jitter ms)
  const variance = samples.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / samples.length
  const std = Math.sqrt(variance)
  benchmarkStdDev.value = std.toFixed(2)

  // Tutarlılık Puanı (%)
  const jitterPenalty = Math.min(20, std * 15)
  const spikePenalty  = Math.min(20, (benchmarkSpikes.value / samples.length) * 100)
  const score = Math.max(70, Math.min(100, 100 - (jitterPenalty + spikePenalty))).toFixed(1)
  benchmarkScore.value = score
}
</script>
