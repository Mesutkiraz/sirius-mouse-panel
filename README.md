# 🖱️ HK Gaming Sirius-M — Esports Control Center

![SinoWealth Hardware Engine](https://img.shields.io/badge/MCU-SinoWealth_v7-blue)
![Sensor](https://img.shields.io/badge/Sensor-PixArt_PMW3389-red)
![Protocol](https://img.shields.io/badge/API-WebHID_Standard-emerald)
![License](https://img.shields.io/badge/License-MIT-purple)

**HK Gaming Sirius-M Ultra (Phantom Edition)** oyuncu faresi için geliştirilmiş, sürücüsüz (driverless), doğrudan tarayıcı üzerinden çalışan yeni nesil WebHID donanım kontrol merkezi.

---

## ⚡ Canlı Web Uygulaması
Herhangi bir `.exe` veya yazılım kurmadan doğrudan tarayıcınızdan farenizi yönetin:
👉 **[Canlı Uygulamayı Aç (GitHub Pages)](https://mesutkiraz.github.io/sirius-mouse-panel/)**

*(Google Chrome, Microsoft Edge, Brave veya Opera 89+ gereklidir)*

---

## 🚀 Öne Çıkan Özellikler

### 🎯 1. Sensör & Bağımsız X/Y DPI (Asymmetric Sensitivity)
* **PixArt PMW3389 Optik Sensör:** 100 – 16.000 CPI donanımsal hassasiyet.
* **Bağımsız X / Y Eksen Ayarı:** CS2 ve Valorant'ta recoil (dikey sekme) kontrolünü sabitlemek için Y eksenini X ekseninden bağımsız ayarlama (Razer Synapse / Logitech G HUB özelliği).
* **6 Donanımsal Kademe & LED Renk Senkronizasyonu:** Farenin tekerlek LED'indeki renk ile arayüzdeki renkleri RGB/RBG/BGR donanım formatıyla %100 eşitleme.

### 🔭 2. Sniper / DPI Clutch Tuş Kilidi
* Farenin yan tuşlarına (Tuş 4 veya Tuş 5) basılı tutulduğunda hassasiyeti anında **400 CPI** veya **200 CPI** değerine sabitleyen donanımsal kilit.
* AWP ve dürbünlü silahlarda milimetrik piksel nişanı almayı sağlar; tuş bırakıldığında anında ana DPI'a döner.

### 🎛️ 3. Akıllı Yüzey & Mousepad Kalibrasyonu (Surface Tuning)
* **Kumaş Kontrol (Artisan Zero, SteelSeries QcK, Zowie G-SR):** 2mm LOD, 4ms Debounce.
* **Hızlı / Speed Pad (Cordura, Artisan Raiden):** 2mm LOD, 4ms Debounce.
* **Cam Mousepad (SkyPAD 3.0/4.0, Superglide):** 3mm LOD (cam yüzey kırılmalarını ve titreşimi absorbe eder), 6ms Debounce.
* **Sert / Plastik Pad & Ahşap Masa Profilleri:** Yüzey pürüzlerini tolere eden özel kalibrasyon.

### 🖱️ 4. Donanımsal Tuş Haritası & Rapid-Fire Makroları
* **İnteraktif Vektör Fare Modeli:** Fiziksel fare tuşlarına basıldığında model üzerinde anlık canlı ışık yanar.
* **Sürücüsüz Donanım Hafızası (EEPROM):** Atanan tuşlar doğrudan farenin hafıza çipine yazılır. Program kapalıyken veya başka bilgisayara/konsola takıldığında da çalışır.
* **20 CPS & 33 CPS Donanımsal Seri Ateş (Rapid-Fire):** Anti-cheat yazılımlarına (Vanguard, VAC, EAC) takılmayan 0ms donanım döngüsü.

### 📐 5. Universal Game Sensitivity & eDPI Eşitleyici (Aim Sync)
* Valorant, CS2, Apex Legends, Overwatch 2, Fortnite, Rainbow Six Siege ve Call of Duty arasında hassasiyet dönüştürme.
* Masanızda 360° dönmek için gereken fiziksel mesafeyi (`cm / 360°`) hesaplayarak el hafızasını korur.

### 🔬 6. Donanım Teşhis & Test Laboratuvarı
* **Omron Switch Çift Tıklama (Chatter) Testi:** Tıklamalar arası milisaniye farkını analiz eder.
* **USB Polling Jitter & Gecikme Benchmark'ı:** 1000 Hz paket gecikmesini ve standart sapmasını (Jitter ms) ölçer.
* **Canlı Sensör Jitter Kanvası:** Piksel atlama ve anlık Hz/CPS takibi.
* **10 cm Cetvel Kalibrasyon Testi:** Sensörün fabrika CPI doğruluğunu test eder.

---

## 🛠️ Yerel Kurulum & Geliştirme

```bash
# Projeyi klonlayın
git clone https://github.com/Mesutkiraz/sirius-mouse-panel.git
cd sirius-mouse-panel

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Canlı dağıtım için derleyin
npm run build
```

---

## 📜 Lisans
Bu proje **MIT** lisansı ile lisanslanmıştır.
