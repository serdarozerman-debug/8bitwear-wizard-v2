/**
 * Update Featured Collection sections by directly modifying theme settings
 * Uses Shopify Asset API
 */

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_API_TOKEN = process.env.SHOPIFY_API_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-01';
const THEME_ID = '139332747369';

// Section configurations
const SECTION_CONFIG = [
  { collection: 'kendi-tasarimini-yap', heading: '🎨 Kendi Tasarımını Yap' }, // Already done
  { collection: 'en-sevilenler', heading: '❤️ En Sevilenler' },
  { collection: 'moderatorun-sectikleri', heading: '⭐ Moderatörün Seçtikleri' },
  { collection: 'kampanya-urunleri', heading: '🔥 Kampanya Ürünleri' },
  { collection: 'ozel-konseptler', heading: '🎁 Özel Konseptler' }
];

async function getAsset(key) {
  const url = `https://${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/themes/${THEME_ID}/assets.json?asset[key]=${encodeURIComponent(key)}`;
  
  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_API_TOKEN,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get asset: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.asset.value;
}

async function putAsset(key, value) {
  const url = `https://${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/themes/${THEME_ID}/assets.json`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_API_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      asset: {
        key: key,
        value: value
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to put asset: ${response.status} ${error}`);
  }

  return response.json();
}

async function main() {
  console.log('🎨 Shopify Theme Settings güncelleniyor...\n');

  if (!SHOPIFY_STORE_URL || !SHOPIFY_API_TOKEN) {
    console.error('❌ Environment variables eksik!');
    process.exit(1);
  }

  try {
    // 1. Get current settings
    console.log('📥 Tema ayarları indiriliyor...');
    const settingsJson = await getAsset('config/settings_data.json');
    const settings = JSON.parse(settingsJson);
    console.log('✅ Tema ayarları indirildi\n');

    // 2. Find Featured Collection sections
    const sections = settings.current?.sections || {};
    const featuredSections = Object.entries(sections)
      .filter(([key, section]) => section.type === 'featured-collection')
      .sort(([keyA], [keyB]) => {
        // Sort by order or key
        return keyA.localeCompare(keyB);
      });

    console.log(`📦 ${featuredSections.length} Featured Collection section bulundu:`);
    featuredSections.forEach(([key, section], idx) => {
      console.log(`  ${idx + 1}. ${key} - Collection: ${section.settings?.collection || 'none'}`);
    });
    console.log('');

    if (featuredSections.length < 5) {
      console.error(`❌ En az 5 Featured Collection section olmalı, ${featuredSections.length} bulundu`);
      process.exit(1);
    }

    // 3. Update sections (skip first one - already done)
    console.log('🔄 Section\'lar güncelleniyor...\n');
    
    for (let i = 1; i < Math.min(featuredSections.length, SECTION_CONFIG.length); i++) {
      const [sectionKey, sectionData] = featuredSections[i];
      const config = SECTION_CONFIG[i];

      console.log(`${i + 1}️⃣  Section ${i + 1}: "${config.heading}"`);
      console.log(`   Key: ${sectionKey}`);
      console.log(`   Collection: ${config.collection}`);
      
      // Update settings
      sectionData.settings = sectionData.settings || {};
      sectionData.settings.collection = config.collection;
      sectionData.settings.title = config.heading;
      
      console.log(`   ✅ Güncellendi\n`);
    }

    // 4. Save updated settings
    console.log('💾 Tema ayarları kaydediliyor...');
    const updatedJson = JSON.stringify(settings, null, 2);
    await putAsset('config/settings_data.json', updatedJson);
    console.log('✅ Tema ayarları kaydedildi!\n');

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('🎉 TAMAMLANDI!');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('✅ Güncellenen section\'lar:');
    for (let i = 1; i < Math.min(featuredSections.length, SECTION_CONFIG.length); i++) {
      const config = SECTION_CONFIG[i];
      console.log(`   ${i + 1}. ${config.heading}`);
    }
    console.log('');
    console.log('🌐 Canlı siteyi kontrol et:');
    console.log('   https://8bitwear-2.myshopify.com');
    console.log('');
    console.log('⚠️  Not: Değişikliklerin görünmesi için');
    console.log('   sayfayı yenilemeniz gerekebilir (Cmd+R)');
    console.log('');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error('');
    console.error('💡 Olası çözümler:');
    console.error('   1. API token\'ın write_themes scope\'u olduğundan emin ol');
    console.error('   2. Manuel olarak Theme Customizer\'dan yapabilirsin');
    console.error('   3. SHOPIFY_SECTIONS_GUIDE.md dosyasına bak');
    process.exit(1);
  }
}

main();


