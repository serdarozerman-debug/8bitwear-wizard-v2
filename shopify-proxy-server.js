/**
 * Shopify API Proxy Server
 * Solves CORS issue for Shopify Admin API calls from browser
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Large limit for base64 images

// Shopify Config - Set these in environment variables
const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_API_TOKEN = process.env.SHOPIFY_API_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-01';

if (!SHOPIFY_STORE_URL || !SHOPIFY_API_TOKEN) {
  console.error('❌ Missing required environment variables: SHOPIFY_STORE_URL, SHOPIFY_API_TOKEN');
  process.exit(1);
}

/**
 * POST /api/shopify/products
 * Create a new product in Shopify
 */
app.post('/api/shopify/products', async (req, res) => {
  try {
    console.log('📦 Creating Shopify product...');
    
    const response = await fetch(
      `https://${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/products.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': SHOPIFY_API_TOKEN
        },
        body: JSON.stringify(req.body)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Shopify API Error:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    console.log('✅ Product created:', data.product.id);
    res.json(data);
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/shopify/products/:productId/images
 * Upload image to Shopify product
 */
app.post('/api/shopify/products/:productId/images', async (req, res) => {
  try {
    const { productId } = req.params;
    console.log('🖼️ Uploading image to product:', productId);
    
    const response = await fetch(
      `https://${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}/images.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': SHOPIFY_API_TOKEN
        },
        body: JSON.stringify(req.body)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Shopify API Error:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    console.log('✅ Image uploaded:', data.image.id);
    res.json(data);
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/shopify/products
 * List products
 */
app.get('/api/shopify/products', async (req, res) => {
  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/products.json`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': SHOPIFY_API_TOKEN
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Shopify API Error:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    shopify: SHOPIFY_STORE_URL,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Shopify Proxy Server running on port', PORT);
  console.log('🛍️ Shopify Store:', SHOPIFY_STORE_URL);
  console.log('📡 Endpoints:');
  console.log('  POST /api/shopify/products');
  console.log('  POST /api/shopify/products/:id/images');
  console.log('  GET  /api/shopify/products');
  console.log('  GET  /health');
});

