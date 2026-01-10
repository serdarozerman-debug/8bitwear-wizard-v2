const SHOPIFY_CONFIG = {
  STORE_URL: "8bitwear-2.myshopify.com",
  ADMIN_API_TOKEN: "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",
  API_VERSION: "2024-01",
  THEME_ID: "139332747369"
};

async function fetchMainPage() {
  const url = `https://${SHOPIFY_CONFIG.STORE_URL}/admin/api/${SHOPIFY_CONFIG.API_VERSION}/themes/${SHOPIFY_CONFIG.THEME_ID}/assets.json?asset[key]=sections/main-page.liquid`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_CONFIG.ADMIN_API_TOKEN,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(data.asset.value);
}

fetchMainPage().catch(console.error);
