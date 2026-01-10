# 🏠 **8BitWear Ana Sayfa Kurulum Kılavuzu (Dawn Theme)**

Bu kılavuz, Shopify Dawn theme'ini kullanarak 8BitWear için özel ana sayfa tasarımını adım adım oluşturmanızı sağlar.

---

## 📦 **ADIM 1: KOLEKSİYONLARI OLUŞTUR**

Shopify Admin → **Products** → **Collections** → **Add collection**

Aşağıdaki 6 koleksiyonu oluşturun:

### 1️⃣ **🎨 Kendi Tasarımını Yap**
- **Title:** `🎨 Kendi Tasarımını Yap`
- **Description:** `Fotoğrafını yükle, AI ile pixel art'a dönüştür ve sana özel tasarlanmış ürünlere sahip ol!`
- **Collection type:** Manual
- **Products:** (Şimdilik boş bırakın, sonra wizard'dan oluşturulan ürünleri ekleyeceksiniz)

### 2️⃣ **❤️ En Sevilenler**
- **Title:** `❤️ En Sevilenler`
- **Description:** `Müşterilerimizin en çok sevdiği tasarımlar`
- **Collection type:** Smart (Condition: Product tag = "favoriler")

### 3️⃣ **⭐ Moderatörün Seçtikleri**
- **Title:** `⭐ Moderatörün Seçtikleri`
- **Description:** `Moderatörlerimiz tarafından özenle seçilmiş özel tasarımlar`
- **Collection type:** Smart (Condition: Product tag = "moderator-pick")

### 4️⃣ **🔥 Kampanya Ürünleri**
- **Title:** `🔥 Kampanya Ürünleri`
- **Description:** `İndirimli ürünlerimiz ve özel kampanyalar`
- **Collection type:** Smart (Condition: Compare at price > 0)

### 5️⃣ **🎁 Özel Konseptler**
- **Title:** `🎁 Özel Konseptler`
- **Description:** `Sezonluk ve özel konsept tasarımları (Yeni Yıl, Şampiyonluk vb.)`
- **Collection type:** Smart (Condition: Product tag = "ozel-konsept")

### 6️⃣ **✨ Senin İçin Seçtiklerimiz**
- **Title:** `✨ Senin İçin Seçtiklerimiz`
- **Description:** `Sana özel olarak seçilmiş tasarımlar`
- **Collection type:** Manual

---

## 🎨 **ADIM 2: ANA SAYFA HERO BANNER'INI DÜZENLE**

Shopify Admin → **Online Store** → **Themes** → **Customize**

1. Ana sayfadaki mevcut **Image Banner** section'ını seç
2. Aşağıdaki ayarları yap:

### Hero Banner Ayarları:
- **Image:** Pixel art temalı hero görsel (1920x650px önerilir)
- **Heading:** `Kendi Pixel Art Tasarımını Yarat!`
- **Description:** `Fotoğrafını yükle, yapay zeka ile pixel art'a dönüştür ve sana özel tasarlanmış ürünlere sahip ol.`
- **Button text:** `Hemen Tasarla →`
- **Button link:** `/pages/kendi-tasarimini-yap`
- **Layout:** Center aligned
- **Color scheme:** Accent 1 (mor/gradient ton)

---

## 📊 **ADIM 3: KATEGORİ SLIDER'LARINI EKLE**

Hero banner'ın altına **6 adet "Featured Collection" section** ekleyeceğiz.

### Her Section İçin:

1. Themes → **Customize** → **Add section** → **Featured Collection**
2. Aşağıdaki ayarları yapın:

#### **Section 1: 🎨 Kendi Tasarımını Yap**
- **Collection:** "🎨 Kendi Tasarımını Yap"
- **Heading:** `🎨 Kendi Tasarımını Yap`
- **Products to show:** 8
- **Show view all button:** ✅ Açık
- **Enable desktop slider:** ✅ Açık
- **Background color:** Light gray (#f9f9f9)

#### **Section 2: ❤️ En Sevilenler**
- **Collection:** "❤️ En Sevilenler"
- **Heading:** `❤️ En Sevilenler`
- **Products to show:** 8
- **Show view all button:** ✅ Açık
- **Enable desktop slider:** ✅ Açık
- **Background color:** White

#### **Section 3: ⭐ Moderatörün Seçtikleri**
- **Collection:** "⭐ Moderatörün Seçtikleri"
- **Heading:** `⭐ Moderatörün Seçtikleri`
- **Products to show:** 8
- **Show view all button:** ✅ Açık
- **Enable desktop slider:** ✅ Açık
- **Background color:** Light yellow (#fff3cd)

#### **Section 4: 🔥 Kampanya Ürünleri**
- **Collection:** "🔥 Kampanya Ürünleri"
- **Heading:** `🔥 Kampanya Ürünleri`
- **Products to show:** 8
- **Show view all button:** ✅ Açık
- **Enable desktop slider:** ✅ Açık
- **Background color:** White

#### **Section 5: 🎁 Özel Konseptler**
- **Collection:** "🎁 Özel Konseptler"
- **Heading:** `🎁 Özel Konseptler`
- **Products to show:** 8
- **Show view all button:** ✅ Açık
- **Enable desktop slider:** ✅ Açık
- **Background color:** Light green (#e8f5e9)

#### **Section 6: ✨ Senin İçin Seçtiklerimiz**
- **Collection:** "✨ Senin İçin Seçtiklerimiz"
- **Heading:** `✨ Senin İçin Seçtiklerimiz`
- **Products to show:** 8
- **Show view all button:** ✅ Açık
- **Enable desktop slider:** ✅ Açık
- **Background color:** White

---

## 💝 **ADIM 4: FAVORİLERE EKLE BUTONU (OPSIYONEL)**

Dawn theme'inde varsayılan olarak "Add to Favorites" butonu yoktur. Bunu eklemek için aşağıdaki kodu `snippets/card-product.liquid` dosyasına ekleyin:

### 📂 **Themes → Edit code → Snippets → `card-product.liquid`**

`<div class="card__content">` satırından **önce** aşağıdaki kodu ekleyin:

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

// Sayfa yüklendiğinde wishlist'ten yükle
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

## 🗂️ **ADIM 5: NAVİGASYON MENÜSÜNÜ DÜZENLE**

Shopify Admin → **Online Store** → **Navigation** → **Main menu**

Aşağıdaki menü yapısını oluşturun:

```
🏠 Ana Sayfa → /
🎨 Kendi Tasarımını Yap → /pages/kendi-tasarimini-yap
📦 Ürünler
  ├─ ❤️ En Sevilenler → /collections/en-sevilenler
  ├─ ⭐ Moderatörün Seçtikleri → /collections/moderatorun-sectikleri
  ├─ 🔥 Kampanya Ürünleri → /collections/kampanya-urunleri
  ├─ 🎁 Özel Konseptler → /collections/ozel-konseptler
  └─ ✨ Senin İçin Seçtiklerimiz → /collections/senin-icin-sectiklerimiz
ℹ️ Hakkımızda → /pages/hakkimizda
📞 İletişim → /pages/iletisim
```

---

## ✅ **ADIM 6: TEST VE YAYINLAMA**

1. **Theme customizer'dan "Save" butonuna tıklayın**
2. **Preview** ile canlı önizleme yapın
3. Ana sayfada 6 kategori slider'ının göründüğünü kontrol edin
4. "Kendi Tasarımını Yap" butonunun çalıştığını test edin
5. Her koleksiyonun "View all" butonunu test edin

---

## 🎯 **SONUÇ**

✅ Hero banner ile öne çıkan CTA  
✅ 6 kategori slider'ı (Dawn native component kullanarak)  
✅ Responsive design (mobil uyumlu)  
✅ Favorilere ekle butonu (opsiyonel)  
✅ Kolay yönetilebilir menü yapısı  

---

## 📞 **DESTEK**

Sorularınız için: support@8bitwear.com  
Wizard entegrasyonu: `/pages/kendi-tasarimini-yap`

---

**🚀 8BitWear - Pixel Art'ı Herkes İçin!**


