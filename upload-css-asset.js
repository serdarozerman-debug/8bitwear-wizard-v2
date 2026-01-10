const fs = require('fs');

const SHOPIFY_CONFIG = {
  STORE_URL: "8bitwear-2.myshopify.com",
  ADMIN_API_TOKEN: "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",
  API_VERSION: "2024-01",
  THEME_ID: "139332747369"
};

async function uploadCSSAsset() {
  // Read the CSS file
  const cssContent = fs.readFileSync('./custom-page-width.css', 'utf8');
  
  const url = `https://${SHOPIFY_CONFIG.STORE_URL}/admin/api/${SHOPIFY_CONFIG.API_VERSION}/themes/${SHOPIFY_CONFIG.THEME_ID}/assets.json`;
  
  const body = {
    asset: {
      key: "assets/custom-page-width.css",
      value: cssContent
    }
  };

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_CONFIG.ADMIN_API_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  console.log('✅ CSS Asset uploaded successfully!');
  console.log('Asset key:', data.asset.key);
  console.log('\n📝 Next step: Add this line to theme.liquid <head> section:');
  console.log('{{ "custom-page-width.css" | asset_url | stylesheet_tag }}');
}

uploadCSSAsset().catch(console.error);

