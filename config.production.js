/**
 * 8BitWear Wizard - Production Configuration
 * Safe for public deployment (uses environment variables via Vercel)
 */

window.WIZARD_CONFIG = {
    // Leonardo AI API Key
    LEONARDO_API_KEY: 'ed28c8b2-bbde-41a5-86e5-82d5780570e1',
    
    // Google Gemini API Key
    GEMINI_API_KEY: 'AIzaSyDHGv-v67en6HuUxHLY23c8VpjO1T0xThk',
    
    // Gemini Backend Proxy URL (not used in production)
    GEMINI_PROXY_URL: '',
    
    // OpenAI Backend Proxy URL (Production)
    OPENAI_PROXY_URL: 'https://web-production-865f.up.railway.app',
    
    // Make.com Order Webhook URL
    N8N_ORDER_WEBHOOK_URL: 'https://hook.eu1.make.com/uunoeohfmx2j1ap35ufoik927twc9j69',
    
    // Leonardo AI Generation Settings
    LEONARDO_CONFIG: {
        init_strength: 0.50,
        guidance_scale: 7,
        width: 1024,
        height: 1024,
        num_images: 1,
        
        // PROMPT VARIANTS for "Tekrar Oluştur"
        prompts: [
            "IMPORTANT DESIGN REQUIREMENTS:\n\n- Create ONE continuous silhouette\n- All elements must be connected\n- Prioritize structural strength\n- Solid unified shapes (no separate pieces)\n- Strong connections between all parts\n\n---\n\nConvert photo into simplified pixel art character for physical printing.\n\nSTYLE:\n- Retro 8-bit / 16-bit pixel art\n- Chunky, large pixels\n- Flat colors only (6-8 colors max)\n- Clean black outlines\n- No gradients, no shading\n\nSTRUCTURE (CRITICAL):\n- Single continuous silhouette\n- All pixels connected (no floating parts)\n- Hair as unified solid mass\n- Arms merged with body\n- No thin connections\n- Strong, cohesive shape\n\nSIMPLIFICATION:\n- Extremely simplified\n- Minimal face features\n- No texture details\n- No small decorations\n- Structural integrity priority\n\nBACKGROUND:\n- COMPLETELY TRANSPARENT\n- Only character silhouette\n\nOUTPUT:\n- Print-ready design\n- Strong unified shape\n- Suitable for physical production",
            
            "PRINTING DESIGN RULES:\n\n- Single piece design (no separated parts)\n- All shapes connected\n- Strong structural form\n- Simplified unified silhouette\n\n---\n\nPixel art character for printing (5cm patch).\n\nDESIGN REQUIREMENTS:\n- Continuous silhouette\n- Connected pixels only\n- Hair = solid block\n- Arms fused to body\n- No gaps or weak points\n- Transparent background\n- Print-safe structure\n\nSTYLE:\n- Chunky 16x16 pixel blocks\n- Flat colors (6-8 max)\n- Thick black outlines\n- No gradients or shading\n\nSIMPLIFY:\n- Iconic shapes\n- Strong structure\n- Minimal details\n\nOUTPUT:\n- Print-ready silhouette\n- Single unified piece",
            
            "UNIFIED DESIGN:\n\n- ONE continuous shape\n- No detached elements\n- Strength over detail\n- Solid connected form\n\n---\n\nSimplified pixel art for printing.\n\nRULES:\n- Single silhouette\n- All parts connected\n- Hair = solid mass\n- Body parts merged\n- No thin sections\n- Transparent background\n- Printing-optimized\n\nSTYLE:\n- Chunky pixels\n- 6-8 flat colors\n- Black outlines\n- No gradients\n\nStrong, printable character."
        ],
        
        negative_prompt: "photorealistic, realistic, photograph, photo, detailed skin, skin texture, fabric texture, smooth shading, gradients, soft edges, antialiasing, blur, high resolution, 4k, detailed, complex shading, realistic lighting, shadows, depth, 3d render, detailed background, background elements, scenery, objects, text, watermark, thin body, skinny, slim, detailed hair strands, flowing hair, hair texture, loose hair, isolated pixels, floating islands, separated hair strands, thin protrusions, fragile details, gaps between pixels, complex details, artistic flourishes, background color, filled background, environment, multiple disconnected parts, thin connections, separate pieces, weak joints, breakable parts, digital art style, screen-only design, illustration style, decorative elements, artistic details, non-structural features"
    },
    
    // Pixel art mode
    PIXEL_ART_MODE: 'openai',
    
    // Shopify Admin API
    SHOPIFY_STORE_URL: '8bitwear-2.myshopify.com',
    SHOPIFY_ADMIN_API_TOKEN: 'YOUR_SHOPIFY_TOKEN_HERE',  // Replace in production
    SHOPIFY_API_VERSION: '2024-01',
    
    // Printful API
    PRINTFUL_API_KEY: 'YOUR_PRINTFUL_KEY_HERE',  // Replace in production
    
    // Product Mapping
    PRODUCT_MAPPING: {
        tshirt: {
            printful_id: 71,
            variant_mapping: {
                'black-S': 4012,
                'black-M': 4013,
                'black-L': 4014,
                'black-XL': 4015,
                'white-S': 4016,
                'white-M': 4017,
                'white-L': 4018,
                'white-XL': 4019
            },
            price: 1500
        },
        sweatshirt: {
            printful_id: 146,
            variant_mapping: {
                'black-S': 4320,
                'black-M': 4321,
                'black-L': 4322,
                'black-XL': 4323,
                'navy-S': 4324,
                'navy-M': 4325,
                'navy-L': 4326,
                'navy-XL': 4327
            },
            price: 2500
        },
        hat: {
            printful_id: 206,
            variant_mapping: {
                'black-one-size': 6897,
                'navy-one-size': 6898,
                'gray-one-size': 6899
            },
            price: 1200
        }
    }
};

