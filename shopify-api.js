/**
 * Shopify API Helper Functions
 * Handles all Shopify Admin API interactions
 */

class ShopifyAPI {
  constructor() {
    this.storeUrl = window.SHOPIFY_CONFIG.STORE_URL;
    this.apiToken = window.SHOPIFY_CONFIG.ADMIN_API_TOKEN;
    this.apiVersion = window.SHOPIFY_CONFIG.API_VERSION;
    
    // Use proxy server to avoid CORS issues
    this.proxyUrl = window.SHOPIFY_CONFIG.PROXY_URL || 'http://localhost:3001';
    this.useProxy = true; // Always use proxy for browser requests
  }

  /**
   * Make authenticated request to Shopify Admin API (via proxy)
   */
  async request(endpoint, method = 'GET', body = null) {
    // Use proxy server to avoid CORS
    const url = `${this.proxyUrl}/api/shopify${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`🛍️ Shopify API (via proxy): ${method} ${endpoint}`);

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Shopify API Error:', errorText);
        throw new Error(`Shopify API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Shopify API Response:', data);
      return data;
    } catch (error) {
      console.error('❌ Shopify API Request Failed:', error);
      throw error;
    }
  }

  /**
   * Create a product in Shopify with pixel art image
   */
  async createProduct(productData) {
    const {
      title,
      productType,
      productColor,
      productSize,
      productPosition,
      pixelArtImage, // base64 data URL
      price
    } = productData;

    // Create product
    const product = {
      product: {
        title: title || `Custom ${productType} - ${productPosition}`,
        body_html: `<p>Custom pixel art design on ${productType}</p><p>Size: ${productSize} | Color: ${productColor} | Position: ${productPosition}</p>`,
        vendor: '8BitWear',
        product_type: productType,
        status: 'active', // Make it immediately available
        tags: 'pixel-art, custom, 8bitwear',
        variants: [
          {
            option1: productSize,
            option2: productColor,
            price: price.toString(),
            sku: `8BW-${productType.toUpperCase()}-${productSize}-${productColor}`.replace(/\s+/g, '-'),
            inventory_management: null, // Don't track inventory for custom items
            fulfillment_service: 'manual'
          }
        ],
        options: [
          { name: 'Size', values: [productSize] },
          { name: 'Color', values: [productColor] }
        ]
      }
    };

    console.log('📦 Creating Shopify Product:', product);

    const response = await this.request('/products', 'POST', product);
    const createdProduct = response.product;

    // Generate and upload 4 position mockups
    if (pixelArtImage) {
      console.log('🖼️ Generating 4 position mockups...');
      const positions = [
        { id: 'left-chest', name: 'Sol Göğüs' },
        { id: 'center-chest', name: 'Orta Göğüs' },
        { id: 'right-arm', name: 'Sağ Pazu' },
        { id: 'left-arm', name: 'Sol Pazu' }
      ];

      for (const pos of positions) {
        const mockupImage = await this.generateMockupWithPosition(
          pixelArtImage,
          productType,
          productColor,
          pos.id,
          pos.name
        );
        await this.uploadProductImage(createdProduct.id, mockupImage);
      }
      
      console.log('✅ 4 position mockups uploaded successfully!');
    }

    return createdProduct;
  }

  /**
   * Generate mockup image with pixel art at specific position
   */
  async generateMockupWithPosition(pixelArtImage, productType, productColor, position, positionName) {
    console.log(`🎨 Generating mockup for position: ${positionName}`);
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    // Generate mockup SVG
    const mockupSVG = this.createMockupSVG(productColor, productType, position);
    const mockupBlob = new Blob([mockupSVG], { type: 'image/svg+xml' });
    const mockupUrl = URL.createObjectURL(mockupBlob);

    // Load mockup image
    const mockupImg = new Image();
    await new Promise((resolve, reject) => {
      mockupImg.onload = resolve;
      mockupImg.onerror = reject;
      mockupImg.src = mockupUrl;
    });

    // Draw mockup
    ctx.drawImage(mockupImg, 0, 0, 800, 1000);

    // Load pixel art
    const pixelArtImg = new Image();
    await new Promise((resolve, reject) => {
      pixelArtImg.onload = resolve;
      pixelArtImg.onerror = reject;
      pixelArtImg.src = pixelArtImage;
    });

    // Get position config
    const posConfig = this.getPositionConfig(position);
    
    // Draw pixel art at position
    const artWidth = (canvas.width * posConfig.width) / 100;
    const artHeight = artWidth; // Keep square
    const artX = (canvas.width * posConfig.left) / 100 - artWidth / 2;
    const artY = (canvas.height * posConfig.top) / 100 - artHeight / 2;

    ctx.drawImage(pixelArtImg, artX, artY, artWidth, artHeight);

    // Clean up
    URL.revokeObjectURL(mockupUrl);

    // Convert to base64
    return canvas.toDataURL('image/png');
  }

  /**
   * Get position configuration
   */
  getPositionConfig(position) {
    const configs = {
      'center-chest': { top: 42, left: 50, width: 20 },
      'left-chest': { top: 32, left: 35, width: 12 },
      'right-arm': { top: 35, left: 75, width: 15 },
      'left-arm': { top: 35, left: 25, width: 15 }
    };
    return configs[position] || configs['center-chest'];
  }

  /**
   * Create mockup SVG
   */
  createMockupSVG(color, productType, position) {
    const colorMap = {
      black: '#1a1a1a',
      white: '#f5f5f5',
      navy: '#1e3a5f',
      gray: '#4a4a4a',
      red: '#c41e3a'
    };
    const fill = colorMap[color] || '#1a1a1a';

    // Determine view based on position
    const isArmPosition = position === 'left-arm' || position === 'right-arm';

    if (isArmPosition) {
      // Side view for arm positions
      return `<svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sideGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:${fill};stop-opacity:0.9" />
            <stop offset="50%" style="stop-color:${fill};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${fill};stop-opacity:0.8" />
          </linearGradient>
        </defs>
        <!-- T-shirt side silhouette -->
        <path d="M 250 200 Q 230 250 230 300 L 230 650 Q 230 700 250 700 L 550 700 Q 570 700 570 650 L 570 300 Q 570 250 550 200 Z" 
              fill="url(#sideGradient)" stroke="#000" stroke-width="2"/>
        <!-- Sleeve -->
        <ellipse cx="${position === 'left-arm' ? 250 : 550}" cy="350" rx="60" ry="100" 
                 fill="url(#sideGradient)" stroke="#000" stroke-width="2"/>
      </svg>`;
    } else {
      // Front view for chest positions
      return `<svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fabricGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${fill};stop-opacity:1" />
            <stop offset="50%" style="stop-color:${fill};stop-opacity:0.95" />
            <stop offset="100%" style="stop-color:${fill};stop-opacity:0.9" />
          </linearGradient>
        </defs>
        <!-- T-shirt front silhouette -->
        <path d="M 200 200 Q 180 250 180 300 L 180 650 Q 180 700 200 700 L 600 700 Q 620 700 620 650 L 620 300 Q 620 250 600 200 Z" 
              fill="url(#fabricGradient)" stroke="#000" stroke-width="3"/>
        <!-- Collar -->
        <ellipse cx="400" cy="190" rx="60" ry="20" fill="${fill}" stroke="#000" stroke-width="2"/>
        <!-- Sleeves -->
        <ellipse cx="180" cy="300" rx="40" ry="80" fill="${fill}" stroke="#000" stroke-width="2"/>
        <ellipse cx="620" cy="300" rx="40" ry="80" fill="${fill}" stroke="#000" stroke-width="2"/>
      </svg>`;
    }
  }

  /**
   * Upload base64 image to Shopify product
   */
  async uploadProductImage(productId, base64Image) {
    // Remove data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const imageData = {
      image: {
        attachment: base64Data,
        filename: `pixel-art-${Date.now()}.png`
      }
    };

    console.log('🖼️ Uploading image to product:', productId);

    const response = await this.request(`/products/${productId}/images`, 'POST', imageData);
    return response.image;
  }

  /**
   * Create a draft order in Shopify
   */
  async createDraftOrder(orderData) {
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      productType,
      productColor,
      productSize,
      productPosition,
      pixelArtImageUrl,
      totalPrice
    } = orderData;

    const draftOrder = {
      draft_order: {
        line_items: [{
          title: `Custom ${productType} - ${productPosition}`,
          price: totalPrice,
          quantity: 1,
          custom_attributes: [
            { key: 'product_type', value: productType },
            { key: 'color', value: productColor },
            { key: 'size', value: productSize },
            { key: 'position', value: productPosition },
            { key: 'pixel_art_url', value: pixelArtImageUrl }
          ]
        }],
        customer: {
          first_name: customerName.split(' ')[0] || customerName,
          last_name: customerName.split(' ').slice(1).join(' ') || '',
          email: customerEmail,
          phone: customerPhone
        },
        shipping_address: {
          address1: customerAddress,
          city: 'Istanbul', // Default, can be enhanced
          country: 'Turkey'
        },
        note: `Pixel Art Custom Order - Position: ${productPosition}`,
        tags: 'pixel-art, custom-order, 8bitwear'
      }
    };

    console.log('📦 Creating Shopify Draft Order:', draftOrder);

    const response = await this.request('/draft_orders.json', 'POST', draftOrder);
    return response.draft_order;
  }

  /**
   * Get draft order by ID
   */
  async getDraftOrder(draftOrderId) {
    const response = await this.request(`/draft_orders/${draftOrderId}.json`);
    return response.draft_order;
  }

  /**
   * Complete a draft order (convert to order)
   */
  async completeDraftOrder(draftOrderId) {
    const response = await this.request(
      `/draft_orders/${draftOrderId}/complete.json`,
      'PUT'
    );
    return response.draft_order;
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId) {
    const response = await this.request(`/orders/${orderId}.json`);
    return response.order;
  }

  /**
   * Search orders by email or order name
   */
  async searchOrders(query) {
    const response = await this.request(`/orders.json?${query}`);
    return response.orders;
  }

  /**
   * Get checkout URL for draft order
   */
  getCheckoutUrl(draftOrder) {
    return draftOrder.invoice_url;
  }
}

// Initialize global Shopify API instance
window.shopifyAPI = new ShopifyAPI();

