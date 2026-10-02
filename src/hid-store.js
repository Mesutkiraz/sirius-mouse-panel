/**
 * hid-store.js — HK Gaming Sirius M · PMW3389 · SinoWealth Protokolü v7
 *
 * Kaynak: libratbag/driver-sinowealth.c
 *
 * Cihaz Mimarisi (SinoWealth):
 * - Report ID 0x05 (5 byte): Komut kanalı (SINOWEALTH_REPORT_ID_CMD)
 *     0x01: CMD_FIRMWARE_VERSION
 *     0x02: CMD_PROFILE
 *     0x11: CMD_GET_CONFIG (Profile 1)
 * - Report ID 0x04 (519 byte): Yapılandırma Blobu (SINOWEALTH_REPORT_ID_CONFIG)
 *     Okuma: Önce 0x05'e [0x11, 0, 0, 0, 0] gönderilir, sonra 0x04 okunur.
 *     Yazma: 0x04'e 519 byte blob yazılır.
 *            Blob[2] (config_write) = CONFIG_SIZE - 8 olmalıdır (örn: 137-8=129 veya 131-8=123).
 * - Polling Rate Eşleşmesi:
 *     125 Hz -> 0x1, 250 Hz -> 0x2, 500 Hz -> 0x3, 1000 Hz -> 0x4
 * - DPI Değeri (PMW3389):
 *     raw = DPI / 100  (400->4, 800->8, 1600->16, 3200->32, 16000->160)
 */

import { reactive, readonly } from 'vue'

export const DPI_PRESETS = [400, 800, 1600, 3200, 6400, 16000]

export const POLLING_RATES = [
  { label: '125 Hz',  value: 125,  raw: 0x01, oldByte: 0x08 },
  { label: '250 Hz',  value: 250,  raw: 0x02, oldByte: 0x04 },
  { label: '500 Hz',  value: 500,  raw: 0x03, oldByte: 0x02 },
  { label: '1000 Hz', value: 1000, raw: 0x04, oldByte: 0x01 },
]

export const DEFAULT_STAGE_COLORS = [
  { hex: '#ef4444', r: 0xff, g: 0x00, b: 0x00, label: 'Kırmızı' },     // Stage 1 (400 CPI)
  { hex: '#3b82f6', r: 0x00, g: 0x88, b: 0xff, label: 'Canlı Mavi' },  // Stage 2 (800 CPI)
  { hex: '#22c55e', r: 0x00, g: 0xff, b: 0x00, label: 'Yeşil' },      // Stage 3 (1600 CPI)
  { hex: '#eab308', r: 0xff, g: 0xdd, b: 0x00, label: 'Sarı' },       // Stage 4 (3200 CPI)
  { hex: '#06b6d4', r: 0x00, g: 0xff, b: 0xff, label: 'Camgöbeği' },  // Stage 5 (6400 CPI)
  { hex: '#a855f7', r: 0xff, g: 0x00, b: 0xff, label: 'Mor' },        // Stage 6 (16000 CPI)
  { hex: '#f97316', r: 0xff, g: 0x88, b: 0x00, label: 'Turuncu' },    // Stage 7
  { hex: '#ffffff', r: 0xff, g: 0xff, b: 0xff, label: 'Beyaz' },      // Stage 8
]

export const STAGE_COLORS = DEFAULT_STAGE_COLORS.map(c => c.hex)

const FEAT_05_LEN = 5
const FEAT_04_LEN = 519

function loadStoredStageColors() {
  try {
    const raw = localStorage.getItem('hk_stage_colors')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length >= 6) {
        return parsed
      }
    }
  } catch (e) {}
  return DEFAULT_STAGE_COLORS.map(c => ({ ...c }))
}

function loadStoredRgbFormat() {
  try {
    const fmt = localStorage.getItem('hk_rgb_format')
    if (fmt === 'RBG' || fmt === 'BGR' || fmt === 'RGB') return fmt
  } catch (e) {}
  return 'RGB'
}

function loadStoredLod() {
  try {
    const v = localStorage.getItem('hk_lod')
    if (v === '2mm' || v === '3mm') return v
  } catch (e) {}
  return '2mm'
}

function loadStoredAngleSnapping() {
  try {
    return localStorage.getItem('hk_angle_snapping') === 'true'
  } catch (e) {}
  return false
}

export const BUTTON_ACTIONS = {
  // Standart Fare Tuşları
  default_left:    { type: 0x11, data: [0x01, 0x00, 0x00], label: 'Sol Tık',            category: 'mouse', icon: '🖱️' },
  default_right:   { type: 0x11, data: [0x02, 0x00, 0x00], label: 'Sağ Tık',           category: 'mouse', icon: '🖱️' },
  default_middle:  { type: 0x11, data: [0x04, 0x00, 0x00], label: 'Orta Tık (Tekerlek)', category: 'mouse', icon: '⏺️' },
  default_back:    { type: 0x11, data: [0x10, 0x00, 0x00], label: 'Geri Git (Tuş 4)',    category: 'mouse', icon: '◀️' },
  default_forward: { type: 0x11, data: [0x08, 0x00, 0x00], label: 'İleri Git (Tuş 5)',   category: 'mouse', icon: '▶️' },

  // DPI Kontrolleri & Sniper Tuşu
  dpi_cycle:       { type: 0x41, data: [0x00, 0x00, 0x00], label: 'DPI Döngüsü',        category: 'dpi',   icon: '🎯' },
  dpi_up:          { type: 0x41, data: [0x01, 0x00, 0x00], label: 'DPI Arttır (+)',     category: 'dpi',   icon: '🔼' },
  dpi_down:        { type: 0x41, data: [0x02, 0x00, 0x00], label: 'DPI Azalt (-)',      category: 'dpi',   icon: '🔽' },
  sniper_400:      { type: 0x42, data: [0x04, 0x00, 0x00], label: 'Sniper Kilidi (400 CPI)', category: 'dpi', icon: '🔭' },
  sniper_200:      { type: 0x42, data: [0x02, 0x00, 0x00], label: 'Sniper Kilidi (200 CPI)', category: 'dpi', icon: '🔭' },
  sniper_800:      { type: 0x42, data: [0x08, 0x00, 0x00], label: 'Sniper Kilidi (800 CPI)', category: 'dpi', icon: '🔭' },

  // Espor & Makro / Seri Tık (Rapid Fire)
  rapid_fire:      { type: 0x31, data: [0x01, 0x32, 0x00], label: 'Seri Ateş (20 CPS)', category: 'macro', icon: '⚡' },
  rapid_fire_fast: { type: 0x31, data: [0x01, 0x1e, 0x00], label: 'Ultra Seri (33 CPS)', category: 'macro', icon: '⚡' },
  double_click:    { type: 0x31, data: [0x01, 0x32, 0x02], label: 'Çift Tık (2x Fire)',  category: 'macro', icon: '⏩' },
  triple_click:    { type: 0x31, data: [0x01, 0x32, 0x03], label: 'Üçlü Burst (3x Fire)',category: 'macro', icon: '💥' },

  // Klavye / Oyun Kısayolları (Keybinds)
  key_space:       { type: 0x21, data: [0x00, 0x2c, 0x00], label: 'Space (Zıpla)',      category: 'game',  icon: '⌨️' },
  key_ctrl:        { type: 0x21, data: [0x01, 0x00, 0x00], label: 'Sol Ctrl (Çömel)',   category: 'game',  icon: '⌨️' },
  key_shift:       { type: 0x21, data: [0x02, 0x00, 0x00], label: 'Sol Shift (Yürü)',   category: 'game',  icon: '⌨️' },
  key_e:           { type: 0x21, data: [0x00, 0x08, 0x00], label: 'E Tuşu (Kullan)',    category: 'game',  icon: '⌨️' },
  key_f:           { type: 0x21, data: [0x00, 0x09, 0x00], label: 'F Tuşu (Bomba/Flash)',category: 'game', icon: '⌨️' },
  key_r:           { type: 0x21, data: [0x00, 0x15, 0x00], label: 'R Tuşu (Şarjör)',    category: 'game',  icon: '⌨️' },
  key_q:           { type: 0x21, data: [0x00, 0x14, 0x00], label: 'Q Tuşu (Hızlı Bıçak)',category: 'game', icon: '⌨️' },
  key_c:           { type: 0x21, data: [0x00, 0x06, 0x00], label: 'C Tuşu (Eğil)',      category: 'game',  icon: '⌨️' },
  key_1:           { type: 0x21, data: [0x00, 0x1e, 0x00], label: '1 (Birincil Silah)', category: 'game',  icon: '🔫' },
  key_2:           { type: 0x21, data: [0x00, 0x1f, 0x00], label: '2 (Tabanca)',        category: 'game',  icon: '🔫' },
  key_3:           { type: 0x21, data: [0x00, 0x20, 0x00], label: '3 (Bıçak)',          category: 'game',  icon: '🔪' },

  // Medya & Ses
  media_play:      { type: 0x22, data: [0x08, 0x00, 0x00], label: 'Oynat / Durdur',     category: 'media', icon: '⏯️' },
  media_vol_up:    { type: 0x22, data: [0x40, 0x00, 0x00], label: 'Ses Yükselt',        category: 'media', icon: '🔊' },
  media_vol_down:  { type: 0x22, data: [0x80, 0x00, 0x00], label: 'Ses Kıs',            category: 'media', icon: '🔉' },
  media_mute:      { type: 0x22, data: [0x10, 0x00, 0x00], label: 'Sesi Kapat',         category: 'media', icon: '🔇' },
}

export const DEFAULT_BUTTON_ASSIGNMENTS = {
  1: 'default_left',
  2: 'default_right',
  3: 'default_middle',
  4: 'default_back',
  5: 'default_forward',
  6: 'dpi_cycle',
}

function loadStoredButtonAssignments() {
  try {
    const raw = localStorage.getItem('hk_button_assignments')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (typeof parsed === 'object' && parsed[1]) {
        return { ...DEFAULT_BUTTON_ASSIGNMENTS, ...parsed }
      }
    }
  } catch (e) {}
  return { ...DEFAULT_BUTTON_ASSIGNMENTS }
}

export const SURFACE_PROFILES = [
  { id: 'control', name: 'Kumaş Kontrol (Artisan Zero / QcK)', desc: 'Standart espor kumaş pad. 1:1 saf optik takip ve stabilite.', lod: '2mm', debounce: 4, angleSnapping: false, icon: '🛡️' },
  { id: 'speed',   name: 'Hızlı / Speed Pad (Cordura / Raiden)', desc: 'Düşük sürtünmeli yüzeyler için ultra reaktif tepki.', lod: '2mm', debounce: 4, angleSnapping: false, icon: '⚡' },
  { id: 'glass',   name: 'Cam Mousepad (SkyPAD / Superglide)', desc: 'Cam yüzeydeki mikro kırılmaları ve piksel titremesini absorbe eder.', lod: '3mm', debounce: 6, angleSnapping: false, icon: '💎' },
  { id: 'hard',    name: 'Sert / Plastik Pad (G440 / Sphex)', desc: 'Düz sert polimer zemin için yüksek hızlı takip kalibrasyonu.', lod: '2mm', debounce: 4, angleSnapping: false, icon: '🎴' },
  { id: 'desk',    name: 'Doğrudan Ahşap Masa (Padsiz)', desc: 'Padsiz doğrudan masa üstü. Yüzey dokusunu tolere eden optik filtre.', lod: '3mm', debounce: 8, angleSnapping: false, icon: '🪵' },
]

function loadStoredSurfaceProfile() {
  try { return localStorage.getItem('hk_surface_profile') || 'control' } catch (e) { return 'control' }
}

const state = reactive({
  device:          null,
  connected:       false,
  vid:             null,
  pid:             null,
  deviceName:      null,
  firmwareVersion: null,

  // Okunan SinoWealth config blobu (519 byte)
  cachedConfig:    null,
  configSize:      137, // varsayılan SinoWealth boyutu

  stages:          {},
  activeStage:     1,
  activeDpi:       1600,
  activeDpiX:      1600,
  activeDpiY:      1600,
  independentXy:   false,
  pollingRate:     1000,
  debounceMs:      4,

  // Espor Donanım Ayarları (LOD, Angle Snapping, Tıklama Sesi)
  lod:             loadStoredLod(),
  angleSnapping:   loadStoredAngleSnapping(),
  surfaceProfile:  loadStoredSurfaceProfile(),
  clickSound:      false,

  // Canlı Tuş Atamaları & Makrolar
  buttonAssignments: loadStoredButtonAssignments(),

  // Canlı LED renkleri (Arayüz ve donanım senkronize)
  stageColors:     loadStoredStageColors(),
  rgbFormat:       loadStoredRgbFormat(),

  logs: [],
})

function log(type, msg) {
  const ts = new Date().toLocaleTimeString('tr-TR', { hour12: false })
  state.logs.unshift({ ts, type, msg })
  if (state.logs.length > 300) state.logs.pop()
  const pfx = { info:'📡', success:'✅', warn:'⚠️', error:'❌', cmd:'→', debug:'🔍', raw:'◀' }[type] ?? '▸'
  console[type === 'error' ? 'error' : type === 'warn' ? 'warn' : 'log'](`[HK] ${pfx} ${msg}`)
}

function dpiToRaw(dpi) { return Math.max(1, Math.min(160, Math.round(dpi / 100))) }
function rawToDpi(raw) { return raw * 100 }

function parseInputReport07(data) {
  if (data.length < 4) return false
  if (data[0] !== 0x01) return false
  const stageId = data[1]
  if ((stageId & 0xf0) !== 0xf0) return false
  const stageNum = stageId & 0x0f
  if (stageNum < 1 || stageNum > 8) return false

  const dpiCpi = rawToDpi(data[2])

  state.stages = {
    ...state.stages,
    [stageNum]: { stageNum, stageId, dpiCpi, dpiRaw: data[2], lastSeen: Date.now() }
  }
  state.activeStage = stageNum
  state.activeDpi   = dpiCpi
  return true
}

async function writeFeatureReport(reportId, data, length, description = '') {
  if (!state.device || !state.connected) {
    log('error', `Bağlı değil: ${description}`)
    return false
  }
  try {
    const buf = new Uint8Array(length)
    data.forEach((b, i) => { if (i < length) buf[i] = b })
    const preview = [...buf].slice(0, Math.min(length, 8)).map(b => '0x' + b.toString(16).padStart(2,'0')).join(' ')
    log('cmd', `sendFeatureReport(0x${reportId.toString(16).padStart(2,'0')}, ${length}B) [${preview}${length > 8 ? '…' : ''}] — ${description}`)
    await state.device.sendFeatureReport(reportId, buf)
    log('success', `✓ ${description}`)
    return true
  } catch (err) {
    log('error', `✗ [0x${reportId.toString(16).padStart(2,'0')}] ${err.message}`)
    return false
  }
}

/**
 * SinoWealth Protokolü: Firmware Sürümü Oku
 * Report 0x05 -> [0x01, 0, 0, 0, 0] gönder
 * Report 0x05 oku
 */
async function readFirmwareVersion() {
  if (!state.device || !state.connected) return null
  log('info', '▶ SinoWealth Firmware Sürümü sorgulanıyor…')
  const ok = await writeFeatureReport(0x05, [0x01, 0x00, 0x00, 0x00, 0x00], FEAT_05_LEN, 'CMD_FIRMWARE_VERSION (0x01)')
  if (!ok) return null

  await new Promise(r => setTimeout(r, 40))
  try {
    const dv = await state.device.receiveFeatureReport(0x05)
    const arr = new Uint8Array(dv.buffer)
    const offset = arr[0] === 0x05 ? 2 : 1
    const ascii = String.fromCharCode(...arr.slice(offset, offset + 4))
    state.firmwareVersion = ascii
    log('success', `✓ SinoWealth Firmware: "${ascii}" [${[...arr].map(b=>b.toString(16).padStart(2,'0')).join(' ')}]`)
    return ascii
  } catch (err) {
    log('warn', `Firmware oku: ${err.message}`)
    return null
  }
}

/**
 * SinoWealth Protokolü: Yapılandırma Bloğunu Oku
 * Adım 1: Report 0x05'e [0x11, 0, 0, 0, 0] (CMD_GET_CONFIG) gönder.
 * Adım 2: Report 0x04'ten 519 byte oku.
 */
async function readSinoWealthConfig() {
  if (!state.device || !state.connected) return null
  log('info', '▶ SinoWealth GET_CONFIG (0x11) gönderiliyor…')

  const ok = await writeFeatureReport(0x05, [0x11, 0x00, 0x00, 0x00, 0x00], FEAT_05_LEN, 'CMD_GET_CONFIG (0x11)')
  if (!ok) return null

  await new Promise(r => setTimeout(r, 60))
  try {
    const dv = await state.device.receiveFeatureReport(0x04)
    const arr = new Uint8Array(dv.buffer)
    log('success', `✓ Feature Report 0x04 başarıyla okundu! (${arr.length} byte)`)

    // WebHID payload'ında Report ID olabilir veya olmayabilir
    // arr[0] == 0x04 ise 520 byte (report_id dahil), değilse 519 byte (payload)
    const offset = arr[0] === 0x04 ? 1 : 0
    const payload = arr.slice(offset)

    state.cachedConfig = new Uint8Array(payload)

    // Byte alanlarını parse et
    parseSinoWealthConfig(payload)
    return payload
  } catch (err) {
    log('error', `✗ receiveFeatureReport(0x04) hatası: ${err.message}`)
    return null
  }
}

/**
 * Okunan 519 byte'lık SinoWealth config bloğunu ayrıştırır
 */
function parseSinoWealthConfig(buf) {
  // buf[0]: command_id (0x11)
  // buf[1]: unknown1
  // buf[2]: config_write (okurken 0x00)
  // buf[8]: sensor_type (0x0F = PMW3389)
  // buf[9]: low 4 bits = report_rate, high 4 bits = config_flags
  // buf[10]: low 4 bits = dpi_count, high 4 bits = active_dpi
  // buf[11]: disabled_dpi_slots
  // buf[12..27]: dpis (8 x 1 byte veya 8 x 2 byte X/Y)
  const cmdId     = buf[0]
  const sensorType = buf[8]
  const reportRateRaw = buf[9] & 0x0f
  const dpiCount  = buf[10] & 0x0f
  const activeDpiIdx = (buf[10] >> 4) & 0x0f
  const disabledMask = buf[11]

  const rateObj = POLLING_RATES.find(p => p.raw === reportRateRaw)
  if (rateObj) state.pollingRate = rateObj.value

  state.activeStage = activeDpiIdx || 1

  // 8 DPI kademesini oku
  const newStages = {}
  for (let i = 0; i < 8; i++) {
    const rawVal = buf[12 + i]
    if (rawVal === 0) continue
    const stageNum = i + 1
    const dpi = rawToDpi(rawVal)
    const isDisabled = (disabledMask & (1 << i)) !== 0
    newStages[stageNum] = {
      stageNum,
      stageId: 0xf0 | stageNum,
      dpiCpi: dpi,
      dpiRaw: rawVal,
      disabled: isDisabled,
      lastSeen: Date.now()
    }
  }
  if (Object.keys(newStages).length > 0) {
    state.stages = newStages
    if (state.stages[state.activeStage]) {
      state.activeDpi = state.stages[state.activeStage].dpiCpi
    }
  }

  // 4. Fareden gelen gerçek LED renklerini oku ve senkronize et
  const hasUserSavedColors = Boolean(localStorage.getItem('hk_stage_colors'))
  if (!hasUserSavedColors) {
    for (let i = 0; i < 8; i++) {
      const offset = 28 + (i * 3)
      let r = buf[offset + 0]
      let g = buf[offset + 1]
      let b = buf[offset + 2]
      if (state.rgbFormat === 'RBG') {
        const tmp = g; g = b; b = tmp;
      } else if (state.rgbFormat === 'BGR') {
        const tmp = r; r = b; b = tmp;
      }
      if (r !== 0 || g !== 0 || b !== 0) {
        const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
        state.stageColors[i] = { hex, r, g, b, label: DEFAULT_STAGE_COLORS[i]?.label || `Stage ${i+1}` }
      }
    }
  }

  log('info', `Config: Sensör=0x${sensorType.toString(16)}, Polling=${state.pollingRate}Hz, AktifStage=${state.activeStage}, DPI=${state.activeDpi}`)
}

/**
 * SinoWealth Yapılandırma Bloğunu Fareye Yazar
 */
async function writeSinoWealthConfig() {
  if (!state.device || !state.connected) return false

  // Eğer henüz config okunmadıysa varsayılan şablon oluştur
  let buf = state.cachedConfig
  if (!buf || buf.length < FEAT_04_LEN) {
    buf = new Uint8Array(FEAT_04_LEN)
    buf[0] = 0x11 // CMD_GET_CONFIG
    buf[8] = 0x0f // PMW3389
    // Varsayılan DPI'lar
    const defaultRaws = [4, 8, 16, 32, 64, 160]
    defaultRaws.forEach((r, i) => { buf[12 + i] = r })
    buf[10] = (state.activeStage << 4) | 6 // 6 DPI kademesi
    state.cachedConfig = buf
  }

  // 1. Polling Rate ayarla
  const rateObj = POLLING_RATES.find(p => p.value === state.pollingRate)
  const rateRaw = rateObj ? rateObj.raw : 0x04
  buf[9] = (buf[9] & 0xf0) | (rateRaw & 0x0f)

  // 2. Aktif DPI Stage ayarla
  const totalStages = Math.min(8, Object.keys(state.stages).length || 6)
  buf[10] = ((state.activeStage & 0x0f) << 4) | (totalStages & 0x0f)

  // 3. Stage DPI değerlerini güncelle (Asymmetric X/Y desteği)
  let hasIndependent = state.independentXy
  for (let i = 0; i < 8; i++) {
    const st = state.stages[i + 1]
    if (st && st.dpiX && st.dpiY && st.dpiX !== st.dpiY) {
      hasIndependent = true
      break
    }
  }

  if (hasIndependent) {
    buf[10] = (buf[10] & 0x0f) | 0x80 // SINOWEALTH_XY_INDEPENDENT
    for (let i = 0; i < 8; i++) {
      const st = state.stages[i + 1]
      const dx = st?.dpiX || st?.dpiCpi || 800
      const dy = st?.dpiY || st?.dpiCpi || 800
      buf[12 + (i * 2)] = dpiToRaw(dx)
      buf[12 + (i * 2) + 1] = dpiToRaw(dy)
    }
  } else {
    for (let i = 0; i < 8; i++) {
      const st = state.stages[i + 1]
      if (st) {
        buf[12 + i] = dpiToRaw(st.dpiCpi)
      }
    }
  }

  // 4. ⭐ DPI LED Renklerini Yaz (Arayüz ile %100 birebir aynı)
  state.stageColors.forEach((col, idx) => {
    const offset = 28 + (idx * 3)
    let r = col.r
    let g = col.g
    let b = col.b
    if (state.rgbFormat === 'RBG') {
      const tmp = g; g = b; b = tmp;
    } else if (state.rgbFormat === 'BGR') {
      const tmp = r; r = b; b = tmp;
    }
    buf[offset + 0] = r
    buf[offset + 1] = g
    buf[offset + 2] = b
  })

  // 5. ⭐ LED Işık Efekti & Parlaklık (buf[52..58])
  buf[52] = 0x02 // 0x02 = RGB_SINGLE (Sabit Açık Işık)
  buf[55] = 0x42 // 0x4 = Maksimum Parlaklık, 0x2 = Normal Hız
  const curCol = state.stageColors[state.activeStage - 1] || state.stageColors[0]
  let curR = curCol.r
  let curG = curCol.g
  let curB = curCol.b
  if (state.rgbFormat === 'RBG') {
    const tmp = curG; curG = curB; curB = tmp;
  } else if (state.rgbFormat === 'BGR') {
    const tmp = curR; curR = curB; curB = tmp;
  }
  buf[56] = curR
  buf[57] = curG
  buf[58] = curB

  // 6. config_write byte'ı: libratbag sinowealth standardı = CONFIG_SIZE - 8
  const candidateSizes = [137 - 8, 131 - 8, 123 - 8]
  let success = false

  for (const cw of candidateSizes) {
    buf[2] = cw
    log('info', `▶ 0x04 Blob yazılıyor (config_write = 0x${cw.toString(16)} = ${cw})…`)
    const ok = await writeFeatureReport(0x04, buf, FEAT_04_LEN, `SinoWealth Config Yaz (cw=0x${cw.toString(16)})`)
    if (ok) {
      success = true
      break
    }
    await new Promise(r => setTimeout(r, 50))
  }

  return success
}

/**
 * Belirli bir Stage için renk ata
 */
async function setStageColor(stageNum, hex, label = '') {
  const idx = stageNum - 1
  if (idx < 0 || idx >= state.stageColors.length) return
  const r = parseInt(hex.slice(1, 3), 16) || 0
  const g = parseInt(hex.slice(3, 5), 16) || 0
  const b = parseInt(hex.slice(5, 7), 16) || 0
  state.stageColors[idx] = {
    hex,
    r,
    g,
    b,
    label: label || DEFAULT_STAGE_COLORS[idx]?.label || `Stage ${stageNum}`
  }
  try {
    localStorage.setItem('hk_stage_colors', JSON.stringify(state.stageColors))
  } catch (e) {}
  log('info', `▶ Stage ${stageNum} rengi ${hex} (${label || 'Özel'}) olarak ayarlandı.`)
  await writeSinoWealthConfig()
}

/**
 * Donanımsal LED Renk Sırasını Ayarla (RGB, RBG, BGR)
 */
async function setRgbFormat(fmt) {
  if (fmt !== 'RGB' && fmt !== 'RBG' && fmt !== 'BGR') return
  state.rgbFormat = fmt
  try {
    localStorage.setItem('hk_rgb_format', fmt)
  } catch (e) {}
  log('info', `▶ Donanım LED Sırası Seçildi: ${fmt}`)
  await writeSinoWealthConfig()
}

/**
 * RGB / RBG / BGR donanım renk sırasını döngüsel çevir
 */
async function toggleRgbOrder() {
  const next = state.rgbFormat === 'RGB' ? 'RBG' : state.rgbFormat === 'RBG' ? 'BGR' : 'RGB'
  await setRgbFormat(next)
}

/**
 * Stage renklerini varsayılan fabrika ayarlarına sıfırla
 */
async function resetStageColors() {
  state.stageColors = DEFAULT_STAGE_COLORS.map(c => ({ ...c }))
  try {
    localStorage.removeItem('hk_stage_colors')
  } catch (e) {}
  log('info', '▶ Tüm Stage renkleri varsayılan fabrika renklerine sıfırlandı.')
  await writeSinoWealthConfig()
}

/**
 * Farenin LED ışıklarını ve DPI renklerini yeniden uyandırır
 */
async function restoreMouseLeds() {
  if (!state.device || !state.connected) {
    log('error', 'Cihaz bağlı değil.')
    return false
  }
  log('info', '▶ Farenin LED ışıkları ve renk paleti yeniden aktifleştiriliyor…')
  const ok = await writeSinoWealthConfig()
  // Hızlı kanaldan da LED ON komutu gönder
  await writeFeatureReport(0x05, [0x10, 0x01, 0x00, 0x88, 0xff], FEAT_05_LEN, 'Hızlı LED Uyandır')
  if (ok) {
    log('success', '✓ LED ışıkları ve DPI renkleri farenin çipine kaydedildi!')
  }
  return ok
}

async function connect() {
  if (!navigator.hid) {
    log('error', 'WebHID API desteklenmiyor.')
    return
  }
  log('info', 'Cihaz seçme penceresi açılıyor…')
  try {
    const devices = await navigator.hid.requestDevice({ filters: [] })
    if (!devices?.length) { log('warn', 'Cihaz seçilmedi.'); return }
    const dev = devices[0]
    log('info', `"${dev.productName}" VID=0x${dev.vendorId.toString(16).toUpperCase()} PID=0x${dev.productId.toString(16).toUpperCase()}`)
    if (!dev.opened) await dev.open()
    log('success', 'HID cihazı açıldı.')

    state.device     = dev
    state.connected  = true
    state.vid        = '0x' + dev.vendorId.toString(16).toUpperCase().padStart(4,'0')
    state.pid        = '0x' + dev.productId.toString(16).toUpperCase().padStart(4,'0')
    state.deviceName = dev.productName
    state.stages     = {}

    dev.addEventListener('inputreport', onInputReport)
    navigator.hid.addEventListener('disconnect', onDisconnect)
    log('success', `Bağlantı kuruldu ✓ — ${dev.productName}`)

    // 1. Firmware sürümünü oku
    await readFirmwareVersion()
    await new Promise(r => setTimeout(r, 60))

    // 2. Gerçek SinoWealth yapılandırmasını fareden oku!
    const cfg = await readSinoWealthConfig()
    if (!cfg) {
      log('warn', 'Doğrudan config okunamadı, varsayılan stage profili hazırlanıyor.')
      DEFAULT_STAGE_DPIS.forEach((dpi, idx) => {
        const stageNum = idx + 1
        state.stages[stageNum] = {
          stageNum,
          stageId: 0xf0 | stageNum,
          dpiCpi: dpi,
          dpiRaw: dpiToRaw(dpi),
          lastSeen: Date.now()
        }
      })
    }

    // 3. Farenin tuş haritasını oku veya kayıtlı profili gönder
    await readSinoWealthButtons()
    if (localStorage.getItem('hk_button_assignments')) {
      await writeSinoWealthButtons()
    }
  } catch (err) {
    log('error', `Bağlantı hatası: ${err.message}`)
  }
}

const DEFAULT_STAGE_DPIS = [400, 800, 1600, 3200, 6400, 16000]

async function disconnect() {
  if (!state.device) return
  try {
    navigator.hid.removeEventListener('disconnect', onDisconnect)
    state.device.removeEventListener('inputreport', onInputReport)
    await state.device.close()
    log('info', 'Bağlantı kapatıldı.')
  } catch (err) {
    log('warn', `Kapatma hatası: ${err.message}`)
  } finally {
    resetState()
  }
}

function onInputReport(event) {
  const data = new Uint8Array(event.data.buffer)
  const hex  = [...data].map(b => b.toString(16).padStart(2,'0')).join(' ')
  if (event.reportId === 0x07) {
    const parsed = parseInputReport07(data)
    if (parsed) {
      const sn = data[1] & 0x0f
      log('raw', `◀ Fiziksel Tuş: Stage ${sn} -> ${rawToDpi(data[2])} CPI [${hex}]`)
    }
  }
}

function onDisconnect(event) {
  if (state.device && event.device === state.device) {
    log('warn', 'Cihaz fiziksel olarak çıkarıldı.')
    resetState()
  }
}

function resetState() {
  Object.assign(state, {
    device: null, connected: false, vid: null, pid: null,
    deviceName: null, firmwareVersion: null, cachedConfig: null,
    stages: {}, activeStage: 1,
  })
}

/**
 * DPI Değiştir (Bağımsız X ve Y ekseni destekli):
 * 1. Store state'ini güncelle
 * 2. SinoWealth tam yapılandırma bloğunu yaz
 * 3. Hızlı kanal (0x05) komutunu da gönder (X ve Y ayrı byte olarak)
 */
async function applyDpi(dpiX, dpiY = null, stageNum = 1) {
  if (dpiY === null || dpiY === undefined) dpiY = dpiX
  state.activeDpi   = dpiX
  state.activeDpiX  = dpiX
  state.activeDpiY  = dpiY
  state.activeStage = stageNum
  state.independentXy = (dpiX !== dpiY)

  if (state.stages[stageNum]) {
    state.stages[stageNum].dpiCpi = dpiX
    state.stages[stageNum].dpiX = dpiX
    state.stages[stageNum].dpiY = dpiY
    state.stages[stageNum].dpiRaw = dpiToRaw(dpiX)
  }

  log('info', `▶ DPI Değiştiriliyor: X=${dpiX} CPI, Y=${dpiY} CPI (Stage ${stageNum})`)

  // 1. SinoWealth Config Bloğu Yazımı
  await writeSinoWealthConfig()

  // 2. Hızlı 0x05 komutları (X ve Y ayrı byte olarak farenin çipine gönderilir)
  const rawX = dpiToRaw(dpiX)
  const rawY = dpiToRaw(dpiY)
  const stageId = 0xf0 | stageNum
  await writeFeatureReport(0x05, [0x04, stageId, rawX, rawY, 0x00], FEAT_05_LEN, `Hızlı 0x05-B [04 ${stageId.toString(16)} X:${rawX.toString(16)} Y:${rawY.toString(16)}]`)

  // 3. Güncel durumu doğrula
  await new Promise(r => setTimeout(r, 100))
  await readSinoWealthConfig()
}

/**
 * Akıllı Yüzey / Mousepad Kalibrasyonu (Surface Tuning)
 */
async function applySurfaceTuning(surfaceId) {
  const profile = SURFACE_PROFILES.find(p => p.id === surfaceId)
  if (!profile) return false
  state.surfaceProfile = surfaceId
  try { localStorage.setItem('hk_surface_profile', surfaceId) } catch (e) {}
  log('info', `🎯 Yüzey Kalibrasyonu: ${profile.name} (LOD: ${profile.lod}, Debounce: ${profile.debounce}ms)`)
  await applyLod(profile.lod)
  await applyDebounce(profile.debounce)
  await applyAngleSnapping(profile.angleSnapping)
  log('success', `✓ Yüzey Kalibrasyonu Aktif: ${profile.name}`)
  return true
}

/**
 * Polling Rate Değiştir
 */
async function applyPollingRate(rate) {
  state.pollingRate = rate
  log('info', `▶ Polling Rate Değiştiriliyor: ${rate} Hz`)

  // 1. SinoWealth Config Bloğu ile yaz
  await writeSinoWealthConfig()

  // 2. Hızlı 0x05 kanalına da gönder
  const entry = POLLING_RATES.find(r => r.value === rate)
  if (entry) {
    await writeFeatureReport(0x05, [0x08, entry.oldByte, 0x00, 0x00, 0x00], FEAT_05_LEN, `Hızlı Polling 0x05 (${rate}Hz)`)
  }

  await new Promise(r => setTimeout(r, 100))
  await readSinoWealthConfig()
}

async function sendRaw(reportId, hexData, length) {
  if (!state.device || !state.connected) { log('error', 'Bağlı değil.'); return false }
  try {
    const bytes = hexData.replace(/,/g,' ').trim().split(/\s+/).filter(Boolean)
      .map(h => parseInt(h.replace(/^0x/i,''), 16))
    const buf = new Uint8Array(length)
    bytes.forEach((b, i) => { if (i < length) buf[i] = b })
    return await writeFeatureReport(reportId, buf, length, 'Raw Gönderim')
  } catch (err) {
    log('error', `Raw hatası: ${err.message}`)
    return false
  }
}

/**
 * Tıklama Gecikmesi (Debounce Time) Ayarla
 * 4ms, 6ms, 8ms, 10ms, 12ms, 14ms, 16ms
 */
async function applyDebounce(ms) {
  state.debounceMs = ms
  log('info', `▶ Tıklama Gecikmesi (Debounce) → ${ms}ms ayarlanıyor…`)
  const ok = await writeFeatureReport(0x05, [0x1a, ms, 0x00, 0x00, 0x00], FEAT_05_LEN, `Debounce ${ms}ms`)
  if (ok) {
    log('success', `✓ Tıklama gecikmesi ${ms}ms olarak ayarlandı!`)
  }
  return ok
}

/**
 * Sensör Havalanma Mesafesi (LOD) Ayarla: 2mm (Espor Düşük) veya 3mm (Yüksek)
 */
async function applyLod(lod) {
  state.lod = lod
  try {
    localStorage.setItem('hk_lod', lod)
  } catch (e) {}
  const lodVal = lod === '3mm' ? 0x02 : 0x01
  const angleVal = state.angleSnapping ? 0x01 : 0x00
  log('info', `▶ Sensör Havalanma Mesafesi (LOD) → ${lod} ayarlanıyor…`)
  // 1. SinoWealth CMD 0x1b (LOD & Angle Snapping)
  await writeFeatureReport(0x05, [0x1b, lodVal, angleVal, 0x00, 0x00], FEAT_05_LEN, `LOD ${lod}`)
  // 2. Config bloğuna da yaz
  if (state.cachedConfig && state.cachedConfig.length > 59) {
    state.cachedConfig[59] = lodVal
    await writeSinoWealthConfig()
  }
}

/**
 * Açı Düzeltme (Angle Snapping) Aç / Kapat
 */
async function applyAngleSnapping(enabled) {
  state.angleSnapping = Boolean(enabled)
  try {
    localStorage.setItem('hk_angle_snapping', String(state.angleSnapping))
  } catch (e) {}
  const angleVal = state.angleSnapping ? 0x01 : 0x00
  const lodVal = state.lod === '3mm' ? 0x02 : 0x01
  log('info', `▶ Açı Düzeltme (Angle Snapping) → ${state.angleSnapping ? 'AÇIK' : 'KAPALI'}`)
  await writeFeatureReport(0x05, [0x1b, lodVal, angleVal, 0x00, 0x00], FEAT_05_LEN, `Angle Snapping ${state.angleSnapping ? 'ON' : 'OFF'}`)
}

/**
 * Web Audio API ile Mekanik Switch Klik Sesi Simülasyonu
 */
let audioCtx = null
function playClickSound() {
  if (!state.clickSound) return
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    if (audioCtx.state === 'suspended') audioCtx.resume()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(1800, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.015)
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.02)
  } catch (e) {}
}

function toggleClickSound() {
  state.clickSound = !state.clickSound
  if (state.clickSound) playClickSound()
}

/**
 * Espor Profilini JSON olarak indir
 */
function exportProfile() {
  const profile = {
    appName: 'HK Gaming Control Panel Pro',
    version: '2.0',
    date: new Date().toISOString(),
    mouse: state.deviceName || 'HK Gaming Sirius-M Ultra',
    pollingRate: state.pollingRate,
    debounceMs: state.debounceMs,
    lod: state.lod,
    angleSnapping: state.angleSnapping,
    activeStage: state.activeStage,
    stages: state.stages,
    stageColors: state.stageColors,
    rgbFormat: state.rgbFormat,
  }
  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hk_sirius_pro_profile_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  log('success', '✓ Espor profili JSON dosyası olarak kaydedildi!')
}

/**
 * Espor Profilini JSON'dan geri yükle
 */
async function importProfile(jsonString) {
  try {
    const data = JSON.parse(jsonString)
    if (data.pollingRate) await applyPollingRate(data.pollingRate)
    if (data.debounceMs) await applyDebounce(data.debounceMs)
    if (data.lod) await applyLod(data.lod)
    if (data.angleSnapping !== undefined) await applyAngleSnapping(data.angleSnapping)
    if (data.rgbFormat) await setRgbFormat(data.rgbFormat)
    if (Array.isArray(data.stageColors)) {
      state.stageColors = data.stageColors
      localStorage.setItem('hk_stage_colors', JSON.stringify(data.stageColors))
    }
    if (data.stages && typeof data.stages === 'object') {
      for (const [sNum, sInfo] of Object.entries(data.stages)) {
        if (sInfo.dpiCpi) await applyDpi(sInfo.dpiCpi, Number(sNum))
      }
    }
    log('success', '✓ Espor profili başarıyla yüklendi ve donanıma yazıldı!')
    return true
  } catch (err) {
    log('error', `Profil içe aktarma hatası: ${err.message}`)
    return false
  }
}

/**
 * SinoWealth Tuş Yapılandırma Bloğunu (Report 0x04, CMD 0x12) Fareye Yazar
 */
async function writeSinoWealthButtons() {
  if (!state.device || !state.connected) {
    log('error', 'Cihaz bağlı değil.')
    return false
  }

  const buf = new Uint8Array(FEAT_04_LEN)
  buf[0] = 0x12 // SINOWEALTH_CMD_GET_BUTTONS
  buf[1] = 0x00
  buf[2] = 0x50 // config_write = 88 - 8 = 80 (0x50)

  // 6 fiziksel tuş için 4'er byte veri yaz
  for (let i = 0; i < 6; i++) {
    const btnId = i + 1
    const actId = state.buttonAssignments[btnId] || DEFAULT_BUTTON_ASSIGNMENTS[btnId]
    const action = BUTTON_ACTIONS[actId] || BUTTON_ACTIONS.default_left
    const offset = 7 + (i * 4)
    buf[offset + 0] = action.type
    buf[offset + 1] = action.data[0]
    buf[offset + 2] = action.data[1]
    buf[offset + 3] = action.data[2]
  }

  log('info', '▶ Tuş haritası ve makrolar fare donanımına yazılıyor…')
  const candidateSizes = [88 - 8, 0]
  let success = false
  for (const cw of candidateSizes) {
    buf[2] = cw
    const ok = await writeFeatureReport(0x04, buf, FEAT_04_LEN, `SinoWealth Tuş Yaz (cw=0x${cw.toString(16)})`)
    if (ok) {
      success = true
      break
    }
    await new Promise(r => setTimeout(r, 40))
  }
  return success
}

/**
 * Fareden Mevcut Tuş Haritasını Oku (Report 0x05 CMD 0x12 -> Report 0x04 Oku)
 */
async function readSinoWealthButtons() {
  if (!state.device || !state.connected) return null
  log('info', '▶ SinoWealth GET_BUTTONS (0x12) sorgulanıyor…')
  const ok = await writeFeatureReport(0x05, [0x12, 0x00, 0x00, 0x00, 0x00], FEAT_05_LEN, 'CMD_GET_BUTTONS (0x12)')
  if (!ok) return null

  await new Promise(r => setTimeout(r, 60))
  try {
    const dv = await state.device.receiveFeatureReport(0x04)
    const arr = new Uint8Array(dv.buffer)
    log('success', `✓ Feature Report 0x04 (Tuş Haritası) okundu! (${arr.length} byte)`)
    const offset = arr[0] === 0x04 ? 1 : 0
    const payload = arr.slice(offset)
    parseSinoWealthButtons(payload)
    return payload
  } catch (err) {
    log('warn', `Tuş haritası okunamadı: ${err.message}`)
    return null
  }
}

function parseSinoWealthButtons(buf) {
  if (!buf || buf.length < 32) return
  const hasUserSaved = Boolean(localStorage.getItem('hk_button_assignments'))
  if (hasUserSaved) return // Kullanıcının özel ayarını koru

  for (let i = 0; i < 6; i++) {
    const off = 7 + (i * 4)
    const type = buf[off + 0]
    const d0 = buf[off + 1]
    const d1 = buf[off + 2]
    const d2 = buf[off + 3]

    const foundEntry = Object.entries(BUTTON_ACTIONS).find(([actId, act]) => {
      return act.type === type && act.data[0] === d0 && act.data[1] === d1 && act.data[2] === d2
    })
    if (foundEntry) {
      state.buttonAssignments[i + 1] = foundEntry[0]
    }
  }
  log('info', `✓ Fareden okunan tuş atamaları senkronize edildi.`)
}

/**
 * Tuş Atamasını Uygula ve Farenin Çipine Yaz
 */
async function applyButtonAssignment(btnId, actionId) {
  state.buttonAssignments[btnId] = actionId
  try {
    localStorage.setItem('hk_button_assignments', JSON.stringify(state.buttonAssignments))
  } catch (e) {}

  const actName = BUTTON_ACTIONS[actionId]?.label || actionId
  log('info', `▶ Tuş ${btnId} görevi "${actName}" olarak ayarlanıyor…`)

  const ok = await writeSinoWealthButtons()
  if (ok) {
    log('success', `✓ Tuş ${btnId} (${actName}) farenin çipine başarıyla kaydedildi!`)
  }
  return ok
}

/**
 * Tüm tuşları fabrika varsayılanına sıfırla
 */
async function resetButtonAssignments() {
  state.buttonAssignments = { ...DEFAULT_BUTTON_ASSIGNMENTS }
  try {
    localStorage.removeItem('hk_button_assignments')
  } catch (e) {}
  log('info', '▶ Tüm tuşlar varsayılan fabrika atamalarına sıfırlanıyor…')
  await writeSinoWealthButtons()
}

export const store = {
  state: readonly(state),
  connect,
  disconnect,
  applyDpi,
  applyPollingRate,
  applyDebounce,
  applyLod,
  applyAngleSnapping,
  applySurfaceTuning,
  applyButtonAssignment,
  resetButtonAssignments,
  writeSinoWealthButtons,
  readSinoWealthButtons,
  playClickSound,
  toggleClickSound,
  exportProfile,
  importProfile,
  setStageColor,
  setRgbFormat,
  toggleRgbOrder,
  resetStageColors,
  sendRaw,
  readSinoWealthConfig,
  readFirmwareVersion,
  writeSinoWealthConfig,
  restoreMouseLeds,
  log,
}
