/**
 * Update Featured Collection sections using Shopify Admin API
 */

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_API_TOKEN = process.env.SHOPIFY_API_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-01';
const THEME_ID = '139332747369';

// Collection handle to title mapping
const SECTION_CONFIG = [
  { collection: 'kendi-tasarimini-yap', heading: '🎨 Kendi Tasarımını Yap' },
  { collection: 'en-sevilenler', heading: '❤️ En Sevilenler' },
  { collection: 'moderatorun-sectikleri', heading: '⭐ Moderatörün Seçtikleri' },
  { collection: 'kampanya-urunleri', heading: '🔥 Kampanya Ürünleri' },
  { collection: 'ozel-konseptler', heading: '🎁 Özel Konseptler' }
];

async function getThemeSettings() {
  const url = `https://${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/themes/${THEME_ID}/assets.json?asset[key]=config/settings_data.json`;
  
  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_API_TOKEN,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get theme settings: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return JSON.parse(data.asset.value);
}

async function updateThemeSettings(settings) {
  const url = `https://${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/themes/${THEME_ID}/assets.json`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_API_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      asset: {
        key: 'config/settings_data.json',
        value: JSON.stringify(settings, null, 2)
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to update theme settings: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function getCollectionIdByHandle(handle) {
  const url = `https://${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/collections.json`;
  
  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_API_TOKEN,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get collections: ${response.status}`);
  }

  const data = await response.json();
  const collections = [...(data.custom_collections || []), ...(data.smart_collections || [])];
  const collection = collections.find(c => c.handle === handle);
  
  return collection ? collection.id.toString() : null;
}

async function main() {
  console.log('🎨 Shopify Featured Collection section\'ları güncelleniyor...\n');

  if (!SHOPIFY_STORE_URL || !SHOPIFY_API_TOKEN) {
    console.error('❌ SHOPIFY_STORE_URL ve SHOPIFY_API_TOKEN environment variables gerekli!');
    process.exit(1);
  }

  try {
    // 1. Get theme settings
    console.log('📥 Tema ayarları alınıyor...');
    const settings = await getThemeSettings();
    console.log('✅ Tema ayarları alındı\n');

    // 2. Find Featured Collection sections
    const sections = settings.current?.sections || {};
    const featuredSections = Object.entries(sections)
      .filter(([key, section]) => section.type === 'featured-collection')
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

    console.log(`📦 ${featuredSections.length} Featured Collection section bulundu\n`);

    // 3. Get collection IDs
    console.log('🔍 Koleksiyon ID\'leri alınıyor...');
    const collectionIds = {};
    for (const config of SECTION_CONFIG) {
      const id = await getCollectionIdByHandle(config.collection);
      if (id) {
        collectionIds[config.collection] = id;
        console.log(`  ✅ ${config.heading}: ${id}`);
      } else {
        console.log(`  ⚠️  ${config.heading}: Koleksiyon bulunamadı (${config.collection})`);
      }
    }
    console.log('');

    // 4. Update sections (skip first one, it's already done)
    let updateCount = 0;
    for (let i = 1; i < Math.min(featuredSections.length, SECTION_CONFIG.length + 1); i++) {
      const [sectionKey, sectionData] = featuredSections[i];
      const config = SECTION_CONFIG[i - 1];
      
      if (!config) break;

      const collectionId = collectionIds[config.collection];
      if (!collectionId) {
        console.log(`⏭️  Section ${i + 1} atlanıyor (koleksiyon ID bulunamadı)`);
        continue;
      }

      console.log(`🔄 Section ${i + 1} güncelleniyor: "${config.heading}"...`);
      
      // Update section settings
      sectionData.settings = sectionData.settings || {};
      sectionData.settings.collection = config.collection;
      sectionData.settings.title = config.heading;
      
      updateCount++;
      console.log(`  ✅ Güncellendi: ${sectionKey}`);
      console.log(`     Collection: ${config.collection}`);
      console.log(`     Heading: ${config.heading}\n`);
    }

    // 5. Save updated settings
    if (updateCount > 0) {
      console.log('💾 Tema ayarları kaydediliyor...');
      await updateThemeSettings(settings);
      console.log('✅ Tema ayarları kaydedildi!\n');
    } else {
      console.log('ℹ️  Güncelleme yapılmadı\n');
    }

    // Summary
    console.log('🎉 TAMAMLANDI!');
    console.log(`📊 ${updateCount} section güncellendi`);
    console.log('\n🌐 Canlı siteyi kontrol et: https://8bitwear-2.myshopify.com\n');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

main();


