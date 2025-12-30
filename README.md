# 🎮 8BitWear Wizard V2

AI-powered pixel art generator for custom t-shirt designs with Shopify integration.

## 🚀 Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Vercel)      │ ← User Interface
└────────┬────────┘
         │
         ├──────────┐
         ↓          ↓
┌─────────────┐ ┌──────────────┐
│  OpenAI API │ │ Shopify API  │
│  (Railway)  │ │ (Railway)    │
└─────────────┘ └──────────────┘
         │              │
         └──────┬───────┘
                ↓
         ┌─────────────┐
         │  Make.com   │
         │  (Webhook)  │
         └─────────────┘
```

## 📦 Components

### 1. **Frontend** (Vercel)
- `index.html` - Main UI
- `wizard.js` - Core logic
- `shopify-api.js` - Shopify client
- `config.js` - Configuration (gitignored)

**Deploy:**
```bash
vercel --prod
```

### 2. **Python Backend** (Railway)
- `openai_backend_proxy.py` - OpenAI Image Edit API proxy
- **URL:** https://web-production-865f.up.railway.app
- **Endpoint:** `/api/openai/edit`

**Environment Variables:**
```
OPENAI_API_KEY=your_key_here
PORT=8080
```

### 3. **Node.js Proxy** (Railway - Optional)
- `shopify-proxy-server.js` - Shopify Admin API proxy
- Handles Shopify product creation

**Environment Variables:**
```
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_API_TOKEN=shpat_xxx
SHOPIFY_API_VERSION=2024-01
PORT=3001
```

## 🛠️ Local Development

### Setup
```bash
# Install dependencies
npm install
pip install -r requirements.txt

# Copy config examples
cp config.example.js config.js
cp shopify-config.example.js shopify-config.js

# Edit with your credentials
nano config.js
nano shopify-config.js
```

### Add Mockup Images
Place t-shirt mockup photos in `mockups/` directory:
- `center-chest.jpg` - Full front view (for center chest position)
- `left-chest.jpg` - Upper close-up view (for left chest position)
- `left-bicep.jpg` - Right side view showing right sleeve (for left bicep position)
- `right-bicep.jpg` - Left side view showing left sleeve (for right bicep position)

**Note:** Real photo mockups are used for **white t-shirts only**. Other colors use generated SVG mockups.

### Run Locally
```bash
# Terminal 1: Python Backend
python openai_backend_proxy.py

# Terminal 2: Node.js Proxy (if using Shopify features)
npm start

# Terminal 3: Frontend
python3 -m http.server 8080
```

Visit: http://localhost:8080

## 🚀 Production Deployment

### Step 1: Deploy Python Backend (Railway)
1. Connect GitHub repo to Railway
2. Add environment variables:
   - `OPENAI_API_KEY`
   - `PORT` (optional, defaults to 8080)
3. Deploy automatically triggers

**Live URL:** https://web-production-865f.up.railway.app

### Step 2: Deploy Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /path/to/8bitwear-wizard-v2
vercel --prod
```

**Important:** Update `config.js` before deploying:
```javascript
OPENAI_PROXY_URL: 'https://web-production-865f.up.railway.app'
```

### Step 3: Deploy Node.js Proxy (Optional - Railway)
If you need Shopify integration:
1. Create new Railway project
2. Deploy `shopify-proxy-server.js`
3. Add environment variables
4. Update frontend to use this URL

## 🔒 Security

**NEVER commit these files:**
- `config.js`
- `shopify-config.js`
- `.env`

**Always use:**
- Environment variables in production
- `.example` files for reference

## 📋 Environment Variables

### Python Backend (Railway)
```bash
OPENAI_API_KEY=sk-proj-xxx
PORT=8080
```

### Node.js Proxy (Railway - Optional)
```bash
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_API_TOKEN=shpat_xxx
SHOPIFY_API_VERSION=2024-01
PORT=3001
```

### Frontend (Vercel)
Config is embedded in `config.js` (gitignored).

## 🧪 Testing

### Test Python Backend
```bash
curl https://web-production-865f.up.railway.app/health
# Expected: {"status":"healthy","service":"openai-backend-proxy","model":"gpt-image-1"}
```

### Test Frontend Locally
```bash
python3 -m http.server 8080
open http://localhost:8080
```

## 📊 Tech Stack

- **Frontend:** Vanilla JavaScript, HTML, CSS
- **Backend:** Python (FastAPI), Node.js (Express)
- **AI:** OpenAI Image Edit API
- **E-commerce:** Shopify Admin API
- **Automation:** Make.com webhooks
- **Deployment:** Railway (Backend), Vercel (Frontend)

## 📁 Project Structure

```
8bitwear-wizard-v2/
├── index.html                  # Main frontend
├── wizard.js                   # Core wizard logic
├── shopify-api.js              # Shopify API client
├── config.js                   # Config (gitignored)
├── config.example.js           # Config template
├── shopify-config.js           # Shopify config (gitignored)
├── shopify-config.example.js   # Shopify config template
├── openai_backend_proxy.py     # Python backend
├── requirements.txt            # Python deps
├── shopify-proxy-server.js     # Node.js proxy (optional)
├── package.json                # Node.js deps
├── Procfile                    # Railway start command
├── runtime.txt                 # Python version
├── vercel.json                 # Vercel config
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## 🔗 Links

- **GitHub:** https://github.com/serdarozerman-debug/8bitwear-wizard-v2
- **Railway Backend:** https://web-production-865f.up.railway.app
- **Production URL:** (Deploy frontend to get this)

## 📝 Version History

### V2 (Current)
- Clean architecture
- Production-ready deployment
- Environment variables for secrets
- Railway + Vercel deployment
- Docker support removed (using Procfile)

### V1
- Initial prototype
- Local development only
- Hardcoded credentials (deprecated)

## 🆘 Support

If deployment fails:
1. Check Railway logs: `railway logs`
2. Check Vercel logs: `vercel logs`
3. Verify environment variables
4. Test endpoints individually

## 📄 License

MIT License - 8BitWear Team

