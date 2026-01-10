# 🎯 8BITWEAR SHOPIFY ANA SAYFA - UYGULAMA REHBERİ

## ✅ **TAMAMLANAN İŞLER:**

1. ✅ Dawn theme eklendi ve aktif edildi
2. ✅ Ana sayfa prototype hazırlandı (tüm özelliklerle)
3. ✅ 6 kategori slider tasarımı yapıldı
4. ✅ Favori butonu tasarlandı
5. ✅ Mobil responsive tasarım hazır
6. ✅ Product card layoutları (textil için dikey) hazır

---

## 📂 **HAZIR DOSYALAR:**

### **1. HTML Prototype:**
📁 `/Users/serdarozerman/8bitwear-wizard-v2/shopify-homepage-prototype.html`

**Test URL:** `http://localhost:8009/shopify-homepage-prototype.html`

Bu dosyada tüm özellikler çalışır durumda:
- Hero banner
- 6 kategori slider (horizontal scroll)
- Favori butonları
- Ürün kartları (dikey, textil için uygun)
- Fiyat gösterimleri
- Hover effects
- Mobil responsive

---

## 🚀 **SHOPIFY'A UYGULAMA ADIMLARI:**

### **STEP 1: Custom Design Sayfası Oluştur**

**Shopify Admin Panel** → **Online Store** → **Pages** → **Add page**

1. **Title:** `Kendi Tasarımını Yap`
2. **Content** kısmında **"Show HTML"** butonuna tıkla
3. Aşağıdaki HTML kodunu yapıştır:

```html
<div style="text-align: center; padding: 40px 20px; max-width: 1400px; margin: 0 auto;">
  <h2 style="font-size: 2.5rem; margin-bottom: 20px; color: #667eea; font-weight: 700;">🎨 Kendi Pixel Art Tasarımını Yarat!</h2>
  <p style="font-size: 1.2rem; margin-bottom: 30px; color: #666;">Fotoğrafını yükle, AI ile pixel art'a dönüştür ve özel tasarımlı ürünlere sahip ol!</p>
  <iframe src="https://8bitwear-wizard-v2.vercel.app" style="width: 100%; height: 1000px; border: none; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1);"></iframe>
</div>
```

4. **Visibility:** `Visible` seç
5. **Save** butonuna tıkla

✅ **Sonuç:** Wizard artık `/pages/kendi-tasarimini-yap` URL'inde çalışacak!

---

### **STEP 2: Collections Oluştur**

**Shopify Admin Panel** → **Products** → **Collections** → **Create collection**

#### **Collection 1: Kendi Tasarımını Yap** 🎨
- **Title:** `Kendi Tasarımını Yap`
- **Type:** Manual
- **Products:** Wizard'dan oluşturulan custom design ürünlerini elle ekle
- **Description:** "Fotoğrafını yükleyerek özel pixel art tasarımlarını keşfet!"

#### **Collection 2: En Sevilenler** ❤️
- **Title:** `En Sevilenler`
- **Type:** Smart (Automated)
- **Conditions:**
  - Product tag equals `bestseller`
  - OR Product vendor equals `8BitWear`
- **Sort:** Best selling

#### **Collection 3: Moderatörün Seçtikleri** ⭐
- **Title:** `Moderatörün Seçtikleri`
- **Type:** Manual
- **Products:** Elle seçilen featured ürünler
- **Description:** "Editörlerimizin özel seçimleriyle tanış!"

#### **Collection 4: Kampanya Ürünleri** 🎉
- **Title:** `Kampanya Ürünleri`
- **Type:** Smart (Automated)
- **Conditions:**
  - Compare at price is greater than price (indirimli ürünler)
  - OR Product tag equals `sale`
- **Sort:** Newest

#### **Collection 5: Özel Konseptler** 🎊
- **Title:** `Özel Konseptler`
- **Type:** Manual
- **Products:** Seasonal/special theme products (Yeni Yıl, Şampiyon, vb.)
- **Description:** "Mevsime özel ve özel günlere ait tasarımlar!"

#### **Collection 6: Senin İçin Seçtiklerimiz** 💚
- **Title:** `Senin İçin Seçtiklerimiz`
- **Type:** Smart (Automated)
- **Conditions:**
  - Product tag equals `recommended`
- **Sort:** Random (her ziyarette farklı ürünler)

---

### **STEP 3: Ana Sayfa Düzenleme (Dawn Theme)**

**Shopify Admin Panel** → **Online Store** → **Themes** → **Customize (Dawn)**

#### **3.1 Hero Banner Düzenle:**

1. **Image banner** section'a tıkla
2. **Ayarlar:**
   - **Heading:** "Kendi Pixel Art Tasarımını Yarat"
   - **Text:** "Fotoğrafını yükle, AI ile pixel art'a dönüştür ve özel tasarımlı ürünlere sahip ol!"
   - **Button label:** "Hemen Tasarla"
   - **Button link:** `/pages/kendi-tasarimini-yap`
   - **Image:** Upload gradient background veya product showcase image
   - **Height:** Large (650px+)
   - **Text alignment:** Center
   - **Color scheme:** Inverse (beyaz text)

#### **3.2 Collection Section'ları Ekle:**

**Template section** kısmında **"Add section"** butonuna tıklayarak şu sırayla ekle:

##### **Section 1: Kendi Tasarımını Yap**
- **Section type:** Featured collection
- **Collection:** Kendi Tasarımını Yap
- **Heading:** "🎨 Kendi Tasarımını Yap"
- **Products to show:** 4
- **Columns (desktop):** 4
- **Enable slider:** ✅ YES
- **Show view all button:** ✅ YES

##### **Section 2: En Sevilenler**
- **Section type:** Featured collection
- **Collection:** En Sevilenler
- **Heading:** "❤️ En Sevilenler"
- **Products to show:** 6
- **Columns (desktop):** 4
- **Enable slider:** ✅ YES
- **Section background:** Light gray (#f9f9f9)

##### **Section 3: Moderatörün Seçtikleri**
- **Section type:** Featured collection
- **Collection:** Moderatörün Seçtikleri
- **Heading:** "⭐ Moderatörün Seçtikleri"
- **Products to show:** 4
- **Columns (desktop):** 4
- **Enable slider:** ✅ YES

##### **Section 4: Kampanya Ürünleri**
- **Section type:** Featured collection
- **Collection:** Kampanya Ürünleri
- **Heading:** "🎉 Kampanya Ürünleri"
- **Products to show:** 6
- **Columns (desktop):** 4
- **Enable slider:** ✅ YES
- **Section background:** Light yellow (#fff3cd)
- **Badge:** "SALE" (Dawn theme otomatik gösterir)

##### **Section 5: Özel Konseptler**
- **Section type:** Featured collection
- **Collection:** Özel Konseptler
- **Heading:** "🎊 Özel Konseptler (Yeni Yıl, Şampiyon)"
- **Products to show:** 4
- **Columns (desktop):** 4
- **Enable slider:** ✅ YES

##### **Section 6: Senin İçin Seçtiklerimiz**
- **Section type:** Featured collection
- **Collection:** Senin İçin Seçtiklerimiz
- **Heading:** "💚 Senin İçin Seçtiklerimiz"
- **Products to show:** 8
- **Columns (desktop):** 4
- **Enable slider:** ✅ YES
- **Section background:** Light green (#e8f5e9)

**Save** butonuna tıkla!

---

### **STEP 4: Favori Butonu Ekle (Product Cards)**

**Shopify Admin Panel** → **Online Store** → **Themes** → **Actions** → **Edit code**

#### **4.1 Dosyayı Aç:**
`snippets/card-product.liquid`

#### **4.2 Kod Ekle:**
`<div class="card-wrapper">` tag'inden **HEMEN SONRA** aşağıdaki kodu ekle:

```liquid
<!-- Wishlist/Favorite Button -->
<button class="wishlist-btn" data-product-id="{{ card_product.id }}" aria-label="Add to wishlist">
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
</button>

<style>
.wishlist-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 2;
  transition: transform 0.2s;
}
.wishlist-btn:hover {
  transform: scale(1.1);
}
.wishlist-btn svg {
  fill: none;
  stroke: #ff6b6b;
  stroke-width: 2;
}
.wishlist-btn.active svg {
  fill: #ff6b6b;
  stroke: #ff6b6b;
}
</style>

<script>
// Favori butonları için event listener
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.toggle('active');
      
      // LocalStorage'a kaydet
      const productId = btn.dataset.productId;
      let wishlist = JSON.parse(localStorage.getItem('8bitwear_wishlist') || '[]');
      
      if (btn.classList.contains('active')) {
        wishlist.push(productId);
        console.log('✅ Favorilere eklendi:', productId);
      } else {
        wishlist = wishlist.filter(id => id !== productId);
        console.log('❌ Favorilerden çıkarıldı:', productId);
      }
      
      localStorage.setItem('8bitwear_wishlist', JSON.stringify(wishlist));
    });
  });
  
  // Sayfa yüklendiğinde wishlist'ten al ve işaretle
  const wishlist = JSON.parse(localStorage.getItem('8bitwear_wishlist') || '[]');
  wishlist.forEach(productId => {
    const btn = document.querySelector(`.wishlist-btn[data-product-id="${productId}"]`);
    if (btn) btn.classList.add('active');
  });
});
</script>
```

**Save** butonuna tıkla!

---

### **STEP 5: Navigation Menu Düzenleme**

**Shopify Admin Panel** → **Online Store** → **Navigation** → **Main menu**

#### **Ana Menü Yapısı:**
1. **Ana Sayfa** → `/`
2. **Kendi Tasarımını Yap** → `/pages/kendi-tasarimini-yap`
3. **Koleksiyonlar** (dropdown)
   - En Sevilenler → `/collections/en-sevilenler`
   - Moderatörün Seçtikleri → `/collections/moderatorun-sectikleri`
   - Kampanya Ürünleri → `/collections/kampanya-urunleri`
   - Özel Konseptler → `/collections/ozel-konseptler`
4. **Hakkımızda** → `/pages/about` (oluşturulacak)
5. **İletişim** → `/pages/contact` (oluşturulacak)

---

## 🎨 **PROTOTYPE REFERANSI**

Hazırladığım prototype'ı incelemek için:

```bash
cd /Users/serdarozerman/8bitwear-wizard-v2
python3 -m http.server 8009
```

Sonra browser'da aç:
`http://localhost:8009/shopify-homepage-prototype.html`

Bu prototype'da tüm özellikler çalışır durumda ve Shopify'a uygulanacak tasarımın tam bir önizlemesidir.

---

## 📸 **SCREENSHOT'LAR**

Full page screenshot alındı:
- `dawn-theme-published-active.png` - Dawn theme aktif
- `8bitwear-homepage-prototype-full.png` - Ana sayfa prototype

---

## 🚀 **DEPLOYMENT STATUS**

### ✅ **Aktif Servisler:**
- **Frontend Wizard:** https://8bitwear-wizard-v2.vercel.app
- **Python Backend (OpenAI API):** https://web-production-865f.up.railway.app
- **Shopify Store:** https://8bitwear-2.myshopify.com
- **Shopify App:** 8BitWear Custom Design Wizard (Installed)

### ✅ **Tamamlanan Entegrasyonlar:**
- OpenAI API ile pixel art dönüşümü
- 4-position mockup system (center-chest, left-chest, right-bicep, left-bicep)
- Real photo mockups (white t-shirt)
- Make.com webhook entegrasyonu (sipariş verisi)
- Google Sheets log sistemi

---

## 🎯 **TEST PLANI**

### **Test 1: Custom Design Sayfası**
1. Shopify store'da `/pages/kendi-tasarimini-yap` sayfasını aç
2. Wizard'ın düzgün yüklendiğini kontrol et
3. Bir fotoğraf yükle ve pixel art oluştur
4. 4 farklı pozisyon görünümünü test et
5. Shopify'a product oluşturulduğunu kontrol et

### **Test 2: Collections**
1. Ana sayfada 6 collection section'ın görünürlüğünü kontrol et
2. Her collection'da horizontal scroll'un çalıştığını test et
3. "View all" butonlarının doğru collection'a gittiğini kontrol et

### **Test 3: Favori Butonu**
1. Herhangi bir ürün kartındaki kalp butonuna tıkla
2. Browser console'da "✅ Favorilere eklendi" mesajını kontrol et
3. Sayfayı yenile ve favori durumunun korunduğunu test et
4. localStorage'da `8bitwear_wishlist` key'ini kontrol et

### **Test 4: Responsive**
1. Browser'ı mobil boyutuna küçült (375px)
2. Tüm section'ların düzgün göründüğünü kontrol et
3. Hero banner'ın mobile'da okunabilir olduğunu test et

---

## 🛠️ **TROUBLESHOOTING**

### **Problem 1: iframe yüklenmiyor**
**Çözüm:** Shopify Admin → Settings → Checkout → "Allow iframes" seçeneğini aktif et

### **Problem 2: Favori butonu görünmüyor**
**Çözüm:** `card-product.liquid` dosyasında kodu `<div class="card-wrapper">` tag'inden **HEMEN SONRA** eklediğinden emin ol

### **Problem 3: Collection'lar boş görünüyor**
**Çözüm:** Collection'lara product ekle. Manual collection'lar için elle, smart collection'lar için tag'leri ekle (örnek: `bestseller`, `sale`, `recommended`)

### **Problem 4: Slider çalışmıyor**
**Çözüm:** Section ayarlarında "Enable slider" seçeneğinin ✅ aktif olduğunu kontrol et

---

## 📞 **DESTEK KAYNAKLARI**

- **Shopify Dawn Theme Docs:** https://shopify.dev/themes/architecture/templates
- **Liquid Template Language:** https://shopify.github.io/liquid/
- **Shopify Help Center:** https://help.shopify.com
- **8BitWear Wizard Docs:** `/Users/serdarozerman/8bitwear-wizard-v2/README.md`

---

## ✅ **CHECKLIST - TAMAMLANMASI GEREKENLER**

- [ ] Custom Design sayfası oluştur (iframe embed)
- [ ] 6 collection oluştur
- [ ] Ana sayfa section'larını düzenle (Dawn theme customize)
- [ ] Favori butonu ekle (card-product.liquid)
- [ ] Navigation menu düzenle
- [ ] Test et (tüm senaryolar)
- [ ] Mobile responsive kontrol et
- [ ] Production'a deploy et

---

**Hazırlayan:** 8BitWear Wizard AI Assistant  
**Tarih:** 2 Ocak 2026  
**Versiyon:** 2.0  
**Status:** ✅ Prototype Ready - ⏳ Production Implementation Required

---

## 🎉 **SON NOTLAR**

Kullanıcı geldiğinde bu guide'ı takip ederek tüm entegrasyonu kendisi tamamlayabilir. 

**Prototype tamamen çalışır durumda ve tüm özellikler dahil!**

Shopify Admin Panel üzerinden manuel olarak adım adım uygulama yapılacak.

---

**TÜM HAZIRLIK TAMAMLANDI! 🚀**


