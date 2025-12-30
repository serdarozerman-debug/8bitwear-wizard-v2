"""
OpenAI Image Edit Backend Proxy
Direct integration with OpenAI's /v1/images/edits endpoint
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import base64
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv
import httpx

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="OpenAI Image Edit Proxy")

# Enable CORS for localhost and file:// protocol
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (including file:// protocol)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI API Key from environment
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    raise ValueError("❌ OPENAI_API_KEY not found! Please add it to your .env file.")

@app.get("/")
async def root():
    return {
        "status": "OpenAI Image Edit Proxy Running",
        "model": "gpt-image-1",
        "endpoint": "/api/openai/edit"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for Railway"""
    return {
        "status": "healthy",
        "service": "openai-backend-proxy",
        "model": "gpt-image-1"
    }

@app.post("/api/openai/edit")
async def edit_image(
    file: UploadFile = File(...),
    prompt: str = Form(...),
    target_size: str = Form("512x512")  # Target size for 3D printing (5cm patch)
):
    """
    OpenAI Image Edit endpoint proxy
    Accepts image + prompt, returns resized base64 PNG
    Note: OpenAI minimum size is 1024x1024, we resize to target_size with nearest-neighbor
    Optimized for 3D printing: 512x512 is ideal for 5cm TPU/silicone patches
    """
    try:
        print("=" * 80)
        print("🎨 OPENAI IMAGE EDIT PROXY STARTING")
        print("=" * 80)
        
        # Read uploaded image
        image_bytes = await file.read()
        print(f"📤 Received image: {len(image_bytes)} bytes")
        print(f"📝 Prompt: {prompt[:100]}...")
        print(f"📏 Target size (post-process): {target_size}")
        
        # Prepare multipart form data for OpenAI
        files = {
            'image': (file.filename, image_bytes, file.content_type or 'image/jpeg')
        }
        
        # OpenAI Image Edit API only supports 1024x1024 and larger
        # We'll request 1024x1024 and resize down to target size
        data = {
            'model': 'gpt-image-1',
            'prompt': prompt,
            'size': '1024x1024'  # Minimum supported size
        }
        
        print(f"🚀 Calling OpenAI Image Edit API...")
        print(f"   Model: {data['model']}")
        print(f"   Size: {data['size']}")
        
        # Call OpenAI API (increase timeout for image generation)
        async with httpx.AsyncClient(timeout=120.0) as client:  # 120 seconds for image generation
            response = await client.post(
                "https://api.openai.com/v1/images/edits",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}"
                },
                files=files,
                data=data
            )
        
        print(f"📊 OpenAI Response Status: {response.status_code}")
        
        if response.status_code != 200:
            error_text = response.text
            print(f"❌ OpenAI Error: {error_text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"OpenAI API error: {error_text}"
            )
        
        result = response.json()
        print(f"📊 Response keys: {result.keys()}")
        print(f"📊 Data type: {type(result['data'])}")
        print(f"📊 Data length: {len(result['data'])}")
        if len(result['data']) > 0:
            print(f"📊 First data item keys: {result['data'][0].keys()}")
        
        # Extract image from response
        # OpenAI can return either 'url' or 'b64_json' depending on response_format
        if 'data' not in result or len(result['data']) == 0:
            raise HTTPException(
                status_code=500,
                detail="No image data in OpenAI response"
            )
        
        data_item = result['data'][0]
        
        # Try URL first
        if 'url' in data_item and data_item['url']:
            image_url = data_item['url']
            print(f"✅ Received image URL: {image_url[:100]}...")
            
            # Download the image from URL
            print(f"📥 Downloading image from OpenAI...")
            async with httpx.AsyncClient(timeout=30.0) as client:
                img_response = await client.get(image_url)
            
            if img_response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to download image: {img_response.status_code}"
                )
            
            image_data = img_response.content
            image = Image.open(BytesIO(image_data))
        
        # Try b64_json second
        elif 'b64_json' in data_item and data_item['b64_json']:
            b64_data = data_item['b64_json']
            print(f"✅ Received base64 image: {len(b64_data)} chars")
            image_data = base64.b64decode(b64_data)
            image = Image.open(BytesIO(image_data))
        
        # Try revised_prompt (sometimes OpenAI returns different structure)
        else:
            print(f"❌ Unknown response structure: {data_item}")
            raise HTTPException(
                status_code=500,
                detail=f"Unknown OpenAI response structure: {list(data_item.keys())}"
            )
        
        print(f"📊 Image size: {image.size}")
        print(f"📊 Image mode: {image.mode}")
        
        # 🎯 CRITICAL: Ensure RGBA mode (transparent background support)
        if image.mode != 'RGBA':
            print(f"🔄 Converting {image.mode} → RGBA")
            image = image.convert('RGBA')
        
        # 🎯 SAFE BACKGROUND REMOVAL: Flood-fill from corners (preserves white clothes!)
        print(f"🔄 Removing background (flood-fill from corners)...")
        width, height = image.size
        pixels = image.load()
        
        # Get average corner color (background color)
        corners = [
            pixels[0, 0],
            pixels[width-1, 0],
            pixels[0, height-1],
            pixels[width-1, height-1]
        ]
        bg_color = tuple(sum(c[i] for c in corners) // 4 for i in range(3))
        print(f"   Background color (from corners): RGB{bg_color}")
        
        # Color distance function
        def color_distance(c1, c2):
            return ((c1[0]-c2[0])**2 + (c1[1]-c2[1])**2 + (c1[2]-c2[2])**2) ** 0.5
        
        # Flood fill from 4 corners
        tolerance = 25  # Color similarity threshold
        visited = set()
        stack = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
        
        while stack:
            x, y = stack.pop()
            
            # Bounds check
            if x < 0 or y < 0 or x >= width or y >= height:
                continue
            
            # Already visited
            if (x, y) in visited:
                continue
            
            visited.add((x, y))
            
            # Get pixel
            r, g, b, a = pixels[x, y]
            
            # Skip already transparent
            if a == 0:
                continue
            
            # If similar to background color, make transparent
            if color_distance((r, g, b), bg_color) <= tolerance:
                pixels[x, y] = (255, 255, 255, 0)  # Transparent
                # Add neighbors to stack
                stack.extend([(x+1, y), (x-1, y), (x, y+1), (x, y-1)])
        
        print(f"✅ Background removed (flood-fill: {len(visited)} pixels processed)")
        
        # Post-process: Resize to target size with nearest-neighbor (no blur)
        target_dims = tuple(map(int, target_size.split('x')))
        print(f"🔄 Resizing from {image.size} to {target_dims} (nearest-neighbor)")
        image = image.resize(target_dims, Image.Resampling.NEAREST)
        
        # Convert back to base64 PNG (RGBA preserved)
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        final_b64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        print(f"✅ Final image: {image.size}, {len(final_b64)} chars")
        print("=" * 80)
        
        return JSONResponse({
            "success": True,
            "image_data_url": f"data:image/png;base64,{final_b64}",
            "size": f"{image.size[0]}x{image.size[1]}"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Get port from environment variable (for Railway) or default to 8004
    port = int(os.getenv("PORT", 8004))
    print("=" * 80)
    print("🎨 OPENAI IMAGE EDIT PROXY STARTING")
    print("=" * 80)
    print(f"🚀 Server: http://0.0.0.0:{port}")
    print(f"🎨 Model: gpt-image-1 (OpenAI Image Edit)")
    print(f"🔒 CORS enabled for all origins")
    print("✅ Direct OpenAI API - No middleman!")
    print("=" * 80)
    uvicorn.run(app, host="0.0.0.0", port=port)

