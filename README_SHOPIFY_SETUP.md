# 🛍️ Shopify Ana Sayfa Kurulumu

## 📋 YAPILACAKLAR LİSTESİ

### 1️⃣ **Custom Design Sayfası Oluştur**

Shopify Admin Panel → Online Store → Pages → Add page

**Title:** `Kendi Tasarımını Yap`

**Content (HTML):**
```html
<div style="text-align: center; padding: 40px 20px; max-width: 1400px; margin: 0 auto;">
  <h2 style="font-size: 2.5rem; margin-bottom: 20px; color: #667eea; font-weight: 700;">🎨 Kendi Pixel Art Tasarımını Yarat!</h2>
  <p style="font-size: 1.2rem; margin-bottom: 30px; color: #666;">Fotoğrafını yükle, AI ile pixel art'a dönüştür ve özel tasarımlı ürünlere sahip ol!</p>
  <iframe src="https://8bitwear-wizard-v2.vercel.app" style="width: 100%; height: 1000px; border: none; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1);"></iframe>
</div>
```

**Visibility:** `Visible`

---

### 2️⃣ **Collections Oluştur**

Shopify Admin Panel → Products → Collections → Create collection

#### **Collection 1: Kendi Tasarımını Yap**
- **Type:** Manual
- **Products:** Custom design ürünleri ekle (wizard'dan oluşturulanlar)

#### **Collection 2: En Sevilenler**
- **Type:** Smart (Automated)
- **Conditions:** 
  - Product tag equals `bestseller`
  - OR Product vendor equals `8BitWear`

#### **Collection 3: Moderatörün Seçtikleri**
- **Type:** Manual
- **Products:** Elle seçilen featured ürünler

#### **Collection 4: Kampanya Ürünleri**
- **Type:** Smart (Automated)
- **Conditions:**
  - Compare at price is greater than price
  - OR Product tag equals `sale`

#### **Collection 5: Özel Konseptler**
- **Type:** Manual
- **Products:** Seasonal/special theme products

#### **Collection 6: Senin İçin Seçtiklerimiz**
- **Type:** Smart (Automated)
- **Conditions:**
  - Product tag equals `recommended`

---

### 3️⃣ **Ana Sayfa Düzenlemesi (Dawn Theme)**

Shopify Admin Panel → Online Store → Themes → Customize (Dawn)

#### **Home Page Structure:**

1. **Hero Banner (Image banner section)**
   - **Image:** Gradient veya product showcase
   - **Heading:** "Kendi Pixel Art Tasarımını Yarat"
   - **Text:** "Fotoğrafını yükle, AI ile pixel art'a dönüştür"
   - **Button:** "Hemen Tasarla" → Link to `/pages/kendi-tasarimini-yap`
   - **Height:** Large
   - **Position:** Bottom Center

2. **Collection 1: Kendi Tasarımını Yap**
   - **Section:** Featured collection
   - **Collection:** Kendi Tasarımını Yap
   - **Heading:** "🎨 Kendi Tasarımını Yap"
   - **Products to show:** 4
   - **Columns (desktop):** 4

3. **Collection 2: En Sevilenler**
   - **Section:** Featured collection
   - **Collection:** En Sevilenler
   - **Heading:** "❤️ En Sevilenler"
   - **Background:** Light gray (#f9f9f9)

4. **Collection 3: Moderatörün Seçtikleri**
   - **Section:** Featured collection
   - **Collection:** Moderatörün Seçtikleri
   - **Heading:** "⭐ Moderatörün Seçtikleri"

5. **Collection 4: Kampanya Ürünleri**
   - **Section:** Featured collection
   - **Collection:** Kampanya Ürünleri
   - **Heading:** "🎉 Kampanya Ürünleri"
   - **Background:** Light yellow (#fff3cd)

6. **Collection 5: Özel Konseptler**
   - **Section:** Featured collection
   - **Collection:** Özel Konseptler
   - **Heading:** "🎊 Özel Konseptler (Yeni Yıl, Şampiyon)"

7. **Collection 6: Senin İçin Seçtiklerimiz**
   - **Section:** Featured collection
   - **Collection:** Senin İçin Seçtiklerimiz
   - **Heading:** "💚 Senin İçin Seçtiklerimiz"
   - **Background:** Light green (#e8f5e9)

---

### 4️⃣ **Product Card Customization (Favori Butonu)**

Dawn theme varsayılan olarak wishlist/favorite butonu içermez. Eklemek için:

**Shopify Admin Panel → Online Store → Themes → Actions → Edit code**

**Dosya:** `snippets/card-product.liquid`

Aşağıdaki kodu `<div class="card-wrapper">` içine ekle:

```liquid
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
document.querySelectorAll('.wishlist-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    btn.classList.toggle('active');
    
    // LocalStorage'a kaydet
    const productId = btn.dataset.productId;
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (btn.classList.contains('active')) {
      wishlist.push(productId);
    } else {
      wishlist = wishlist.filter(id => id !== productId);
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  });
});

// Sayfa yüklendiğinde wishlist'ten al
window.addEventListener('DOMContentLoaded', () => {
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  wishlist.forEach(productId => {
    const btn = document.querySelector(`.wishlist-btn[data-product-id="${productId}"]`);
    if (btn) btn.classList.add('active');
  });
});
</script>
```

---

### 5️⃣ **Navigation Menu Düzenleme**

Shopify Admin Panel → Online Store → Navigation → Main menu

**Menü yapısı:**
- Ana Sayfa → `/`
- Kendi Tasarımını Yap → `/pages/kendi-tasarimini-yap`
- Koleksiyonlar (dropdown)
  - En Sevilenler → `/collections/en-sevilenler`
  - Kampanya → `/collections/kampanya-urunleri`
  - Özel Konseptler → `/collections/ozel-konseptler`
- Hakkımızda → `/pages/about`
- İletişim → `/pages/contact`

---

## 🎨 **PROTOTYPE VS PRODUCTION**

### **Prototype (Hazırladığım):**
📂 `/Users/serdarozerman/8bitwear-wizard-v2/shopify-homepage-prototype.html`
🌐 Test URL: `http://localhost:8009/shopify-homepage-prototype.html`

Bu prototype'da tüm özellikler gösterildi:
- ✅ Hero banner
- ✅ 6 kategori slider (horizontal scroll)
- ✅ Favori butonu
- ✅ Ürün kartları (dikey, textil için uygun)
- ✅ Fiyat gösterimleri
- ✅ Hover effects
- ✅ Mobil responsive

### **Production (Shopify'a Uygulanacak):**
Yukarıdaki adımları izleyerek Dawn theme'i özelleştirin. Prototype referans alınarak Shopify Admin Panel üzerinden tüm section'lar eklenebilir.

---

## 📸 **PROTOTYPE SCREENSHOTS**

Full page screenshot alındı ve kaydedildi. Kullanıcı döndüğünde inceleyebilir.

---

## 🚀 **NEXT STEPS**

1. ✅ Dawn theme aktif
2. ✅ Prototype hazırlandı
3. ⏳ Custom Design sayfası oluştur
4. ⏳ Collections oluştur
5. ⏳ Ana sayfa section'larını düzenle
6. ⏳ Product card'lara favori butonu ekle
7. ⏳ Test & Deploy

---

## 📞 **DESTEK**

Herhangi bir sorun olursa:
- Shopify Help Center: https://help.shopify.com
- Theme documentation: Dawn theme docs

---

**Hazırlayan:** 8BitWear Wizard AI Assistant  
**Tarih:** 2 Ocak 2026
