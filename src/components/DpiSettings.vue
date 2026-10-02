<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">

    <!-- ========================================================
         SOL KOLON (7/12): DPI KADEMELERİ, ÖZEL AYAR & LED RENKLERİ
         ======================================================== -->
    <div class="lg:col-span-7 space-y-4">

      <!-- 1. AKTİF DPI BANNER & KADEMELER -->
      <div class="hk-panel p-5 space-y-4">
        <!-- Başlık -->
        <div class="flex items-center justify-between pb-3 border-b border-hk-border">
          <div class="flex items-center gap-2.5">
            <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: activeColor }"></span>
            <div>
              <h2 class="text-sm font-semibold tracking-wide text-white">DPI Kademeleri & Hassasiyet</h2>
              <p class="text-xs text-slate-400">PixArt PMW3389 optik sensör kademe yönetimi</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded bg-hk-card border border-hk-border">
            <span class="w-1.5 h-1.5 rounded-full" :class="connected ? 'bg-emerald-400' : 'bg-slate-600'"></span>
            <span class="text-[11px] font-mono font-medium" :class="connected ? 'text-emerald-400' : 'text-slate-500'">
              {{ connected ? 'Donanım Aktif' : 'Çevrimdışı' }}
            </span>
          </div>
        </div>

        <!-- Aktif DPI Hero Sayacı -->
        <div class="flex items-center justify-between p-4 rounded-xl bg-hk-surface border border-hk-border/80">
          <div>
            <span class="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Anlık Aktif Hassasiyet</span>
            <div class="flex items-baseline gap-2 mt-0.5">
              <span class="text-3xl font-black font-mono tracking-tight" :style="{ color: activeColor }">
                {{ activeDpiDisplay.toLocaleString('tr-TR') }}
              </span>
              <span class="text-xs font-mono font-semibold text-slate-400">CPI</span>
            </div>
          </div>
          <div class="text-right">
            <span class="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Seçili Kademe</span>
            <div class="text-lg font-bold font-mono text-white mt-0.5">
              Stage {{ activeStage ?? 1 }}
            </div>
          </div>
        </div>

        <!-- 6 Kademe Düğmeleri Grid -->
        <div v-if="connected && hasStages" class="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <button
            v-for="(stage, num) in sortedStages"
            :key="num"
            @click="handleStageSelect(stage)"
            class="flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all duration-150 active:scale-95 relative"
            :class="isActiveStage(stage.stageNum)
              ? 'border-slate-400 bg-hk-card shadow-sm ring-1 ring-white/10'
              : 'border-hk-border bg-hk-surface hover:border-slate-600 hover:bg-hk-card/60'"
          >
            <!-- Aktif Nokta -->
            <span
              v-if="isActiveStage(stage.stageNum)"
              class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
              :style="{ backgroundColor: getStageColor(stage.stageNum) }"
            ></span>

            <span class="text-[10px] font-mono text-slate-400 uppercase tracking-tight">S{{ stage.stageNum }}</span>
            <span class="text-sm font-bold font-mono my-0.5 text-white">{{ formatDpi(stage.dpiCpi) }}</span>
            <span class="text-[9px] text-slate-500 font-mono">CPI</span>

            <!-- Renk Çubuğu -->
            <div
              class="w-full h-1 rounded-full mt-2 transition-opacity"
              :style="{
                backgroundColor: getStageColor(stage.stageNum),
                opacity: isActiveStage(stage.stageNum) ? 1 : 0.4
              }"
            ></div>
          </button>
        </div>

        <!-- Bağlantı Yok Uyarısı -->
        <div v-else class="p-6 rounded-lg bg-hk-surface border border-hk-border text-center text-xs text-slate-500">
          {{ connected ? 'Fareden kademe verileri alınıyor…' : 'Cihaz bağlı değil. Ayarları değiştirmek için farenizi bağlayın.' }}
        </div>

        <!-- 2. ÖZEL DPI AYARI (SLIDER & STEPPER & BAĞIMSIZ X/Y EKSENİ) -->
        <div class="p-4 rounded-xl bg-hk-surface border border-hk-border/80 space-y-3.5">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-slate-200">
              Özel DPI Hassasiyeti (Stage {{ activeStage ?? 1 }})
            </span>

            <!-- Bağımsız X/Y Kilidi Aç/Kapat Butonu -->
            <button
              @click="toggleXySplit"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all"
              :class="isXySplit
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm'
                : 'bg-hk-card border-hk-border text-slate-400 hover:text-white hover:border-slate-500'"
              title="Yatay (X) ve Dikey (Y) eksen hassasiyetini bağımsız olarak ayarlayın"
            >
              <span>{{ isXySplit ? '🔓' : '🔗' }}</span>
              <span>{{ isXySplit ? 'Bağımsız X/Y Aktif' : 'X/Y Kilitli (Simetrik)' }}</span>
            </button>
          </div>

          <!-- TEK EKSEN MODU (X ve Y EŞİT) -->
          <template v-if="!isXySplit">
            <div class="flex items-center gap-2">
              <button
                @click="adjustDpi(-100)"
                :disabled="!connected || customDpiX <= 100"
                class="px-3 py-2 rounded-lg bg-hk-card border border-hk-border text-slate-300 hover:text-white hover:border-slate-500 text-xs font-mono font-medium disabled:opacity-30 transition-colors"
              >
                -100
              </button>

              <div class="relative flex-1">
                <input
                  v-model.number="customDpiX"
                  type="number"
                  min="100"
                  max="16000"
                  step="100"
                  class="w-full rounded-lg bg-hk-card border border-hk-border px-3 py-2 text-center text-sm font-mono font-bold text-white focus:outline-none focus:border-hk-blue"
                />
                <span class="absolute right-3 top-2.5 text-xs text-slate-500 font-mono pointer-events-none">CPI</span>
              </div>

              <button
                @click="adjustDpi(100)"
                :disabled="!connected || customDpiX >= 16000"
                class="px-3 py-2 rounded-lg bg-hk-card border border-hk-border text-slate-300 hover:text-white hover:border-slate-500 text-xs font-mono font-medium disabled:opacity-30 transition-colors"
              >
                +100
              </button>

              <button
                @click="applyCustomDpi"
                :disabled="!connected || !customDpiX"
                class="px-4 py-2 rounded-lg bg-hk-blue text-white font-semibold text-xs hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-30 shadow-sm"
              >
                Uygula
              </button>
            </div>

            <!-- Slider -->
            <div class="space-y-1">
              <input
                v-model.number="customDpiX"
                type="range"
                min="100"
                max="16000"
                step="100"
                class="w-full accent-hk-blue cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
              <div class="flex justify-between text-[10px] font-mono text-slate-500">
                <span>100</span>
                <span>4000</span>
                <span>8000</span>
                <span>12000</span>
                <span>16000</span>
              </div>
            </div>
          </template>

          <!-- ÇİFT EKSEN MODU (X VE Y AYRI - ASYMMETRIC DPI) -->
          <template v-else>
            <div class="space-y-3 p-3 rounded-lg bg-hk-dark border border-amber-500/20">
              <!-- X Ekseni Kontrolü -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-slate-200 flex items-center gap-1">
                    <span class="text-amber-400">↔</span> X Ekseni (Yatay / 180° Flick):
                  </span>
                  <span class="font-mono font-bold text-amber-300">{{ customDpiX }} CPI</span>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="customDpiX"
                    type="range"
                    min="100"
                    max="16000"
                    step="100"
                    class="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                  <input
                    v-model.number="customDpiX"
                    type="number"
                    min="100"
                    max="16000"
                    step="100"
                    class="w-20 rounded border border-hk-border bg-hk-card px-2 py-1 text-xs font-mono text-center text-white"
                  />
                </div>
              </div>

              <!-- Y Ekseni Kontrolü -->
              <div class="space-y-1.5 pt-2 border-t border-hk-border/60">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-slate-200 flex items-center gap-1">
                    <span class="text-hk-cyan">↕</span> Y Ekseni (Dikey / Recoil Sprey Kontrolü):
                  </span>
                  <span class="font-mono font-bold text-hk-cyan">{{ customDpiY }} CPI</span>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="customDpiY"
                    type="range"
                    min="100"
                    max="16000"
                    step="100"
                    class="w-full accent-hk-cyan cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                  <input
                    v-model.number="customDpiY"
                    type="number"
                    min="100"
                    max="16000"
                    step="100"
                    class="w-20 rounded border border-hk-border bg-hk-card px-2 py-1 text-xs font-mono text-center text-white"
                  />
                </div>
              </div>

              <!-- İpucu & Uygula Butonu -->
              <div class="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-hk-border/60">
                <span class="text-[11px] text-slate-400">
                  💡 <strong>Recoil Tavsiyesi:</strong> Y eksenini X'ten 100-200 CPI düşük tutarak CS2 ve Valorant'ta spreylerinizi sabitleyebilirsiniz.
                </span>
                <button
                  @click="applyCustomDpi"
                  :disabled="!connected"
                  class="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs active:scale-95 transition-all shadow-sm shrink-0"
                >
                  X/Y Hassasiyetini Çipe Yaz
                </button>
              </div>
            </div>
          </template>

          <!-- Hızlı Standart CPI Seçimleri -->
          <div class="pt-2 border-t border-hk-border/60">
            <span class="text-[10px] uppercase font-mono text-slate-400 block mb-1.5">Standart Espor Değerleri</span>
            <div class="grid grid-cols-6 gap-1.5">
              <button
                v-for="preset in [400, 800, 1200, 1600, 3200, 6400]"
                :key="preset"
                @click="handlePresetSelect(preset)"
                :disabled="!connected"
                class="py-1.5 rounded border text-xs font-mono font-semibold transition-all disabled:opacity-30"
                :class="activeDpiDisplay === preset
                  ? 'border-hk-blue bg-hk-blue/15 text-hk-blue'
                  : 'border-hk-border bg-hk-card text-slate-400 hover:border-slate-600 hover:text-white'"
              >
                {{ formatDpi(preset) }}
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- 3. LED RENKLERİ & DONANIM SENKRONU -->
      <div class="hk-panel p-5 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-hk-border">
          <div>
            <h3 class="text-sm font-semibold tracking-wide text-white">DPI Kademesi LED Renkleri</h3>
            <p class="text-xs text-slate-400">Tekerlek ışığı rengi ile arayüzü birebir senkronize et</p>
          </div>

          <button
            @click="handleResetColors"
            :disabled="!connected"
            class="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded border border-hk-border hover:border-slate-500 transition-colors disabled:opacity-30"
          >
            Varsayılana Sıfırla
          </button>
        </div>

        <!-- Donanım LED Sırası (RGB / RBG Seçici) -->
        <div class="p-3 rounded-lg bg-hk-surface border border-hk-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-200">Donanım LED Sırası:</span>
              <span class="text-xs font-mono font-bold text-hk-cyan bg-hk-cyan/10 px-2 py-0.5 rounded border border-hk-cyan/20">
                {{ state.rgbFormat }}
              </span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">
              Fare tekerleğindeki ışık ekrandaki renkle uyuşmuyorsa <strong>RBG</strong> seçeneğine tıklayın.
            </p>
          </div>

          <div class="flex items-center gap-1.5">
            <button
              v-for="fmt in ['RGB', 'RBG', 'BGR']"
              :key="fmt"
              @click="handleSetRgbFormat(fmt)"
              :disabled="!connected"
              class="px-2.5 py-1 rounded text-xs font-mono font-bold transition-all disabled:opacity-30"
              :class="state.rgbFormat === fmt
                ? 'bg-hk-blue text-white shadow-sm'
                : 'bg-hk-card border border-hk-border text-slate-400 hover:text-white hover:border-slate-500'"
            >
              {{ fmt }}
            </button>
          </div>
        </div>

        <!-- Kademe Başına Renk Seçicileri (2 Sütunlu Dengeli Düzen) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="stage in sortedStages"
            :key="stage.stageNum"
            class="p-3.5 rounded-xl border bg-hk-surface transition-all flex flex-col justify-between gap-3"
            :class="isActiveStage(stage.stageNum)
              ? 'border-hk-blue/70 bg-hk-surface ring-1 ring-hk-blue/30 shadow-sm'
              : 'border-hk-border hover:border-slate-600'"
          >
            <!-- Üst Satır: Kademe Numarası, CPI ve Renk Seçici Butonu -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white tracking-wide">Stage {{ stage.stageNum }}</span>
                <span class="text-[11px] font-mono text-slate-400 bg-hk-card px-2 py-0.5 rounded border border-hk-border">
                  {{ formatDpi(stage.dpiCpi) }} CPI
                </span>
                <span
                  v-if="isActiveStage(stage.stageNum)"
                  class="text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded"
                >
                  Aktif
                </span>
              </div>

              <!-- Tıklanabilir Renk Seçici Rozeti -->
              <label
                class="relative cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded-lg bg-hk-card border border-hk-border hover:border-slate-500 transition-colors shrink-0"
                :title="`Stage ${stage.stageNum} için özel renk seç`"
              >
                <span
                  class="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm block"
                  :style="{ backgroundColor: getStageColor(stage.stageNum) }"
                ></span>
                <span class="text-[10px] font-mono font-semibold text-slate-300 uppercase">
                  {{ getStageColor(stage.stageNum) }}
                </span>
                <input
                  type="color"
                  :value="getStageColor(stage.stageNum)"
                  @input="handleColorChange(stage.stageNum, $event.target.value)"
                  class="sr-only"
                />
              </label>
            </div>

            <!-- Alt Satır: Hızlı Renk Paleti -->
            <div class="flex items-center justify-between pt-2 border-t border-hk-border/60">
              <span class="text-[10px] font-medium text-slate-400">Hızlı Renk:</span>
              <div class="flex items-center gap-1.5">
                <button
                  v-for="preset in QUICK_PALETTE"
                  :key="preset.hex"
                  @click="handleColorChange(stage.stageNum, preset.hex, preset.label)"
                  class="w-4 h-4 rounded-full border border-black/40 hover:scale-125 transition-transform"
                  :class="getStageColor(stage.stageNum).toLowerCase() === preset.hex.toLowerCase() ? 'ring-2 ring-white/60 scale-110' : ''"
                  :style="{ backgroundColor: preset.hex }"
                  :title="preset.label"
                ></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Işıkları Geri Yükle Düğmesi -->
        <button
          v-if="connected"
          @click="handleRestoreLeds"
          :disabled="!connected || restoringLeds"
          class="w-full py-2 px-3 rounded-lg border border-hk-border bg-hk-card text-slate-300 hover:text-white hover:border-slate-500 active:scale-95 text-xs font-medium transition-all disabled:opacity-30 flex items-center justify-center gap-2"
        >
          <span>💡 Fare Işıklarını / Renklerini Donanıma Yeniden Gönder</span>
          <span v-if="restoringLeds" class="animate-spin text-hk-cyan">⟳</span>
        </button>
      </div>

    </div>


    <!-- ========================================================
         SAĞ KOLON (5/12): SENSÖR, POLLING, LOD, DEBOUNCE, ANGLE SNAP
         ======================================================== -->
    <div class="lg:col-span-5 space-y-4">

      <!-- 1. RAPORLAMA HIZI (POLLING RATE) -->
      <div class="hk-panel p-5 space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-hk-border">
          <div>
            <h3 class="text-sm font-semibold tracking-wide text-white">Raporlama Hızı (Polling Rate)</h3>
            <p class="text-xs text-slate-400">Saniyede bilgisayara gönderilen veri sıklığı</p>
          </div>
          <span class="text-xs font-mono font-bold text-hk-blue bg-hk-blue/10 px-2 py-0.5 rounded border border-hk-blue/20">
            {{ activePollingRate }} Hz
          </span>
        </div>

        <div class="grid grid-cols-4 gap-2 pt-1">
          <button
            v-for="rate in POLLING_RATES"
            :key="rate.value"
            @click="handlePollingChange(rate.value)"
            :disabled="!connected"
            class="flex flex-col items-center justify-center rounded-lg py-2.5 border text-xs font-bold transition-all disabled:opacity-30 active:scale-95"
            :class="rate.value === activePollingRate
              ? 'border-hk-blue bg-hk-blue/15 text-hk-blue ring-1 ring-hk-blue/30 shadow-sm'
              : 'border-hk-border bg-hk-surface text-slate-400 hover:border-slate-600 hover:text-white'"
          >
            <span class="text-base font-black font-mono">{{ rate.value }}</span>
            <span class="text-[9px] font-normal text-slate-500">Hz</span>
          </button>
        </div>
      </div>

      <!-- 2. LIFT-OFF DISTANCE (LOD) -->
      <div class="hk-panel p-5 space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-hk-border">
          <div>
            <h3 class="text-sm font-semibold tracking-wide text-white">Kaldırma Mesafesi (LOD)</h3>
            <p class="text-xs text-slate-400">Mousepad'den kaldırıldığında takibin kesileceği yükseklik</p>
          </div>
          <span class="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {{ activeLod }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-1">
          <button
            @click="handleLodChange('2mm')"
            :disabled="!connected"
            class="py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all disabled:opacity-30 active:scale-95 text-center flex flex-col items-center"
            :class="activeLod === '2mm'
              ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30'
              : 'border-hk-border bg-hk-surface text-slate-400 hover:border-slate-600 hover:text-white'"
          >
            <span class="font-bold">2 mm (Düşük)</span>
            <span class="text-[9px] text-emerald-400/80 font-mono mt-0.5">Espor Önerilen · Sıfır Kayma</span>
          </button>

          <button
            @click="handleLodChange('3mm')"
            :disabled="!connected"
            class="py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all disabled:opacity-30 active:scale-95 text-center flex flex-col items-center"
            :class="activeLod === '3mm'
              ? 'border-hk-blue/60 bg-hk-blue/10 text-hk-blue ring-1 ring-hk-blue/30'
              : 'border-hk-border bg-hk-surface text-slate-400 hover:border-slate-600 hover:text-white'"
          >
            <span class="font-bold">3 mm (Yüksek)</span>
            <span class="text-[9px] text-slate-500 font-mono mt-0.5">Kalın / Dokulu Mousepad</span>
          </button>
        </div>
      </div>

      <!-- 3. TIK GECİKMESİ (DEBOUNCE TIME) -->
      <div class="hk-panel p-5 space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-hk-border">
          <div>
            <h3 class="text-sm font-semibold tracking-wide text-white">Tıklama Gecikmesi (Debounce)</h3>
            <p class="text-xs text-slate-400">Mekanik Omron switch kontağının donanımsal filtre süresi</p>
          </div>
          <span class="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            {{ activeDebounce }} ms
          </span>
        </div>

        <div class="grid grid-cols-5 gap-1.5 pt-1">
          <button
            v-for="ms in [4, 6, 8, 12, 16]"
            :key="ms"
            @click="handleDebounce(ms)"
            :disabled="!connected"
            class="py-2 rounded-lg border text-xs font-mono font-bold transition-all disabled:opacity-30 active:scale-95 flex flex-col items-center"
            :class="activeDebounce === ms
              ? 'border-rose-500/60 bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30'
              : 'border-hk-border bg-hk-surface text-slate-400 hover:border-slate-600 hover:text-white'"
          >
            <span class="text-sm">{{ ms }}</span>
            <span class="text-[8px] font-normal text-slate-500">ms</span>
          </button>
        </div>
        <p class="text-[11px] text-slate-500">
          4ms rekabetçi FPS oyunlarında en hızlı ilk mermi tepkisini sağlar.
        </p>
      </div>

      <!-- 4. AÇI DÜZELTME (ANGLE SNAPPING) -->
      <div class="hk-panel p-5 space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-hk-border">
          <div>
            <h3 class="text-sm font-semibold tracking-wide text-white">Açı Düzeltme (Angle Snapping)</h3>
            <p class="text-xs text-slate-400">Yapay düz çizgi stabilizasyonu</p>
          </div>
          <span
            class="text-xs font-mono font-bold px-2 py-0.5 rounded"
            :class="activeAngleSnapping ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-400'"
          >
            {{ activeAngleSnapping ? 'AÇIK' : 'KAPALI' }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-1">
          <button
            @click="handleAngleSnapping(false)"
            :disabled="!connected"
            class="py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all disabled:opacity-30 active:scale-95 text-center flex flex-col items-center"
            :class="!activeAngleSnapping
              ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30'
              : 'border-hk-border bg-hk-surface text-slate-400 hover:border-slate-600 hover:text-white'"
          >
            <span class="font-bold">KAPALI (Saf 1:1)</span>
            <span class="text-[9px] text-emerald-400/80 font-mono mt-0.5">Espor Standardı · Sıfır Filtre</span>
          </button>

          <button
            @click="handleAngleSnapping(true)"
            :disabled="!connected"
            class="py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all disabled:opacity-30 active:scale-95 text-center flex flex-col items-center"
            :class="activeAngleSnapping
              ? 'border-amber-500/60 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30'
              : 'border-hk-border bg-hk-surface text-slate-400 hover:border-slate-600 hover:text-white'"
          >
            <span class="font-bold">AÇIK (Düzeltmeli)</span>
            <span class="text-[9px] text-slate-500 font-mono mt-0.5">Çizim / CAD / Ofis</span>
          </button>
        </div>
      </div>

      <!-- 5. AKILLI YÜZEY & MOUSEPAD KALİBRASYONU (SURFACE TUNING) -->
      <div class="hk-panel p-5 space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-hk-border">
          <div>
            <h3 class="text-sm font-semibold tracking-wide text-white">Yüzey & Mousepad Kalibrasyonu (Surface Tuning)</h3>
            <p class="text-xs text-slate-400">Mousepad dokusuna göre sensörün optik yansıma ve takip karakteristiğini optimize edin</p>
          </div>
          <span class="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            PRO TUNING
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            v-for="prof in surfaceProfiles"
            :key="prof.id"
            @click="handleSurfaceTuning(prof.id)"
            :disabled="!connected"
            class="p-2.5 rounded-lg border text-left transition-all disabled:opacity-30 active:scale-95 flex flex-col justify-between"
            :class="activeSurface === prof.id
              ? 'border-amber-500/70 bg-amber-500/10 ring-1 ring-amber-500/30'
              : 'border-hk-border bg-hk-surface text-slate-400 hover:border-slate-600 hover:text-white'"
          >
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm">{{ prof.icon }}</span>
                <span class="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-hk-dark border border-hk-border text-slate-300">
                  {{ prof.lod }} · {{ prof.debounce }}ms
                </span>
              </div>
              <span class="text-xs font-bold text-white block">{{ prof.name }}</span>
              <p class="text-[10px] text-slate-400 leading-tight mt-0.5">{{ prof.desc }}</p>
            </div>

            <span v-if="activeSurface === prof.id" class="text-[9px] font-mono text-amber-400 font-bold mt-1.5 flex items-center gap-1">
              ✓ Aktif Yüzey Profili
            </span>
          </button>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { store, POLLING_RATES, SURFACE_PROFILES } from '../hid-store.js'

const state               = store.state
const connected           = computed(() => state.connected)
const activePollingRate   = computed(() => state.pollingRate)
const activeStage         = computed(() => state.activeStage)
const activeDpi           = computed(() => state.activeDpi)
const activeLod           = computed(() => state.lod ?? '2mm')
const activeDebounce      = computed(() => state.debounceMs ?? 4)
const activeAngleSnapping = computed(() => state.angleSnapping ?? false)
const activeSurface       = computed(() => state.surfaceProfile || 'control')
const surfaceProfiles     = SURFACE_PROFILES

const QUICK_PALETTE = [
  { hex: '#ef4444', label: 'Kırmızı' },
  { hex: '#3b82f6', label: 'Mavi' },
  { hex: '#22c55e', label: 'Yeşil' },
  { hex: '#eab308', label: 'Sarı' },
  { hex: '#06b6d4', label: 'Camgöbeği' },
  { hex: '#a855f7', label: 'Mor' },
  { hex: '#ec4899', label: 'Pembe' },
  { hex: '#ffffff', label: 'Beyaz' },
]

const sortedStages = computed(() =>
  Object.values(state.stages).sort((a, b) => a.stageNum - b.stageNum)
)

const hasStages = computed(() => sortedStages.value.length > 0)

const activeStageInfo = computed(() =>
  activeStage.value ? state.stages[activeStage.value] : null
)

function getStageColor(stageNum) {
  const idx = stageNum - 1
  return state.stageColors[idx]?.hex || '#3b82f6'
}

const activeColor = computed(() =>
  activeStage.value ? getStageColor(activeStage.value) : '#3b82f6'
)

const activeDpiDisplay = computed(() =>
  activeStageInfo.value?.dpiCpi ?? activeDpi.value ?? 800
)

// Bağımsız X/Y Eksen Değerleri
const isXySplit  = ref(false)
const customDpiX = ref(800)
const customDpiY = ref(800)

watch(activeDpiDisplay, (newVal) => {
  if (newVal) {
    customDpiX.value = state.activeDpiX || newVal
    customDpiY.value = state.activeDpiY || newVal
    isXySplit.value  = state.independentXy || (state.activeDpiX !== state.activeDpiY)
  }
}, { immediate: true })

function toggleXySplit() {
  isXySplit.value = !isXySplit.value
  if (!isXySplit.value) {
    customDpiY.value = customDpiX.value
  }
}

function isActiveStage(num) {
  return num === activeStage.value
}

function formatDpi(dpi) {
  if (dpi >= 10000) return (dpi / 1000).toFixed(0) + 'K'
  if (dpi >= 1000)  return (dpi / 1000).toFixed(1).replace('.0','') + 'K'
  return String(dpi)
}

function adjustDpi(delta) {
  const next = Math.max(100, Math.min(16000, (customDpiX.value || 800) + delta))
  customDpiX.value = next
  if (!isXySplit.value) customDpiY.value = next
}

async function applyCustomDpi() {
  if (!connected.value || !customDpiX.value) return
  if (store.playClickSound) store.playClickSound()
  const stageNum = activeStage.value || 1
  const cleanX = Math.max(100, Math.min(16000, customDpiX.value))
  const cleanY = isXySplit.value ? Math.max(100, Math.min(16000, customDpiY.value)) : cleanX
  await store.applyDpi(cleanX, cleanY, stageNum)
}

async function handleStageSelect(stage) {
  if (!connected.value) return
  if (store.playClickSound) store.playClickSound()
  customDpiX.value = stage.dpiX || stage.dpiCpi
  customDpiY.value = stage.dpiY || stage.dpiCpi
  await store.applyDpi(customDpiX.value, customDpiY.value, stage.stageNum)
}

async function handlePresetSelect(dpi) {
  if (!connected.value) return
  if (store.playClickSound) store.playClickSound()
  customDpiX.value = dpi
  customDpiY.value = dpi
  isXySplit.value  = false
  const stageNum = activeStage.value || 1
  await store.applyDpi(dpi, dpi, stageNum)
}

async function handleSurfaceTuning(profileId) {
  if (!connected.value) return
  if (store.playClickSound) store.playClickSound()
  await store.applySurfaceTuning(profileId)
}

async function handlePollingChange(rate) {
  if (!connected.value) return
  if (store.playClickSound) store.playClickSound()
  await store.applyPollingRate(rate)
}

async function handleLodChange(lod) {
  if (!connected.value) return
  if (store.playClickSound) store.playClickSound()
  await store.applyLod(lod)
}

async function handleDebounce(ms) {
  if (!connected.value) return
  if (store.playClickSound) store.playClickSound()
  await store.applyDebounce(ms)
}

async function handleAngleSnapping(val) {
  if (!connected.value) return
  if (store.playClickSound) store.playClickSound()
  await store.applyAngleSnapping(val)
}

async function handleColorChange(stageNum, hex, label = '') {
  if (!connected.value) return
  await store.setStageColor(stageNum, hex, label)
}

async function handleSetRgbFormat(fmt) {
  if (!connected.value) return
  await store.setRgbFormat(fmt)
}

async function handleResetColors() {
  if (!connected.value) return
  if (store.playClickSound) store.playClickSound()
  await store.resetStageColors()
}

const restoringLeds = ref(false)

async function handleRestoreLeds() {
  if (!connected.value) return
  restoringLeds.value = true
  if (store.playClickSound) store.playClickSound()
  try {
    await store.restoreMouseLeds()
  } finally {
    restoringLeds.value = false
  }
}
</script>
