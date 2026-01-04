/**
 * 8BitWear Pixel Art Wizard
 * Interactive wizard for custom pixel art products
 * 
 * VERSION: 2.0 - With OpenAI Integration
 */

// ==========================================
// CONFIGURATION - Use external config.js
// ==========================================
const CONFIG = window.WIZARD_CONFIG || {
    // FALLBACK: n8n webhook (if WIZARD_CONFIG not loaded)
    N8N_WEBHOOK_URL: 'https://eightbitwear.app.n8n.cloud/webhook/face-to-sticker-fixed',
    N8N_ORDER_WEBHOOK_URL: 'https://hook.eu1.make.com/uunoeohfmx2j1ap35ufoik927twc9j69',
    
    // Direct OpenAI API (CORS bypass) - NOT USED IN HYBRID MODE
    OPENAI_API_KEY: '',  // Removed for security
    
    // Replicate API (for hybrid-direct mode)
    REPLICATE_API_KEY: '',
    
    // Leonardo AI Backend Proxy (fixes CORS issue)
    LEONARDO_PROXY_URL: 'http://localhost:8002',  // Backend proxy
    
    // Google Gemini API (loaded from config.js)
    GEMINI_PROXY_URL: window.WIZARD_CONFIG?.GEMINI_PROXY_URL || 'http://localhost:8003',
    
    // OpenAI API (loaded from config.js)
    OPENAI_PROXY_URL: window.WIZARD_CONFIG?.OPENAI_PROXY_URL || 'http://localhost:8004',
    
    // Leonardo AI API (loaded from config.js - DO NOT HARDCODE HERE!)
    LEONARDO_API_KEY: window.WIZARD_CONFIG?.LEONARDO_API_KEY || '',
    LEONARDO_MODEL_ID: window.WIZARD_CONFIG?.LEONARDO_MODEL_ID || '28aeddf8-bd19-4803-80fc-79602d1a9989',
    LEONARDO_CONFIG: window.WIZARD_CONFIG?.LEONARDO_CONFIG || {
        init_strength: 0.50,
        guidance_scale: 7,
        width: 1024,
        height: 1024,
        num_images: 1,
        prompt: "Turn the input photo into a simple retro pixel character. Style: chunky pixel art character, big blocky pixels (low-res look), thick solid black outline around the whole character and major shapes, flat colors, posterized shading (very limited), toy-like proportions, simplified face (2 eyes + small mouth), centered full body character, front view. Keep: same outfit colors from input, same pose and silhouette. Background: single flat orange background. Output: generate clean pixel-art poster look, like a sprite enlarged with nearest-neighbor.",
        negative_prompt: "photorealistic, realistic skin, high detail, texture, fabric detail, smooth shading, gradients, cinematic lighting, blur, noise, grain, thin lines, complex background, extra objects, text, watermark, logo"
    },
    
    // Imgur API (for image upload - free, no auth needed for anonymous)
    IMGUR_CLIENT_ID: '546c25a59c58ad7',  // Public anonymous upload
    
    // Demo mode - false = gerçek API kullan
    DEMO_MODE: false,    
    
    // Pixel art mode: 'openai' (OpenAI Image Edit - default), 'gemini' (Nano Banana), 'leonardo' (fallback)
    PIXEL_ART_MODE: window.WIZARD_CONFIG?.PIXEL_ART_MODE || 'openai',  // OPENAI: gpt-image-1 - Production ✅
    
    // API timeout (ms) - AI için daha uzun
    API_TIMEOUT: 120000,  // 2 dakika
    
    // Retry settings
    MAX_RETRIES: 3,
    
    // Filter settings - DETERMINISTIC PIXEL ART PIPELINE
    FILTER: {
        targetSize: 64,      // Exact 64x64 output
        colorDepth: 16,      // 16 colors (strict palette)
        ditherStrength: 0.0, // NO dithering (pure flat blocks)
        contrast: 1.5,       // Natural contrast
        saturation: 1.3,     // Slightly boosted saturation
        outlineWidth: 1,     // 1px black outline
        backgroundColor: '#F28C28'  // Orange background (like example)
    }
};

class PixelWizard {
    constructor() {
        // State
        this.currentStep = 1;
        this.totalSteps = 4;
        this.uploadedImage = null;
        this.uploadedImageBase64 = null;
        this.uploadedImageMimeType = null;
        this.pixelArtResult = null;
        this.attemptsLeft = 3;
        this.isProcessing = false;
        
        // Product state
        this.selectedProduct = 'tshirt';
        this.selectedColor = 'black';
        this.selectedSize = 'L';
        this.selectedPosition = 'center-chest'; // Default position
        
        // Prices
        this.prices = {
            tshirt: 1500,
            sweatshirt: 2500,
            hat: 1200
        };
        
        // Color names
        this.colorNames = {
            black: 'Siyah',
            white: 'Beyaz',
            navy: 'Lacivert',
            gray: 'Antrasit',
            red: 'Kırmızı'
        };
        
        // Product positions
        this.productPositions = {
            tshirt: [
                { id: 'center-chest', name: 'Göğüs Ortası', icon: '▣' },
                { id: 'left-chest', name: 'Sol Göğüs Üstü', icon: '◤' },
                { id: 'left-arm', name: 'Sol Kol', icon: '◀' },
                { id: 'right-arm', name: 'Sağ Kol', icon: '▶' }
            ],
            sweatshirt: [
                { id: 'center-chest', name: 'Göğüs Ortası', icon: '▣' },
                { id: 'left-chest', name: 'Sol Göğüs Üstü', icon: '◤' },
                { id: 'left-arm', name: 'Sol Kol', icon: '◀' },
                { id: 'right-arm', name: 'Sağ Kol', icon: '▶' }
            ],
            hat: [
                { id: 'front', name: 'Ön', icon: '◉' },
                { id: 'side', name: 'Yan', icon: '◐' }
            ]
        };
        
        // Initialize
        this.init();
    }
    
    init() {
        this.bindElements();
        this.bindEvents();
        this.updateProgress();
        
        // Load initial mockup
        this.updateMockup();
        
        // Show demo mode warning
        if (CONFIG.DEMO_MODE) {
            console.log('⚠️ DEMO MODE AKTIF - Gerçek API çağrısı yapılmıyor');
        }
    }
    
    bindElements() {
        // Progress
        this.progressFill = document.getElementById('progressFill');
        this.progressSteps = document.querySelectorAll('.progress-step');
        
        // Steps
        this.steps = {
            1: document.getElementById('step1'),
            2: document.getElementById('step2'),
            3: document.getElementById('step3'),
            4: document.getElementById('step4')
        };
        
        // Step 1 elements
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.previewContainer = document.getElementById('previewContainer');
        this.previewImage = document.getElementById('imagePreview'); // HTML'de imagePreview
        this.changeImageBtn = document.getElementById('changeImageBtn');
        this.btnToStep2 = document.getElementById('nextStep1'); // HTML'de nextStep1
        
        // Step 2 elements
        this.originalImage = document.getElementById('originalImage');
        this.pixelArtPanel = document.getElementById('pixelArtPanel');
        this.pixelArtImage = document.getElementById('pixelArtImage');
        this.loadingState = document.getElementById('loadingState');
        this.loadingBar = document.getElementById('loadingBar');
        this.loadingText = document.querySelector('.loading-text');
        this.attemptCount = document.getElementById('attemptCount');
        this.attemptInfo = document.getElementById('attemptInfo');
        this.convertActions = document.getElementById('convertActions');
        this.noAttempts = document.getElementById('noAttempts');
        this.btnRetry = document.getElementById('btnRetry');
        this.btnToStep3 = document.getElementById('btnToStep3');
        this.btnUploadOwn = document.getElementById('btnUploadOwn');
        this.btnCancel = document.getElementById('btnCancel');
        
        // Step 3 elements
        this.mockupImage = document.getElementById('mockupImage');
        this.mockupPixelArt = document.getElementById('mockupPixelArt');
        this.viewBtns = document.querySelectorAll('.view-btn');
        this.typeBtns = document.querySelectorAll('.type-btn');
        this.colorBtns = document.querySelectorAll('.color-btn');
        this.sizeBtns = document.querySelectorAll('.size-btn');
        this.selectedColorLabel = document.getElementById('selectedColor');
        this.summaryProduct = document.getElementById('summaryProduct');
        this.summaryPrice = document.getElementById('summaryPrice');
        this.btnBackToStep2 = document.getElementById('btnBackToStep2');
        this.btnToStep4 = document.getElementById('btnToStep4');
        
        // Step 4 elements
        this.checkoutMockup = document.getElementById('checkoutMockup');
        this.checkoutProductName = document.getElementById('checkoutProductName');
        this.checkoutProductOptions = document.getElementById('checkoutProductOptions');
        this.checkoutProductPrice = document.getElementById('checkoutProductPrice');
        this.checkoutTotal = document.getElementById('checkoutTotal');
        this.consentCheckbox = document.getElementById('consentCheckbox');
        this.btnCompleteOrder = document.getElementById('btnCompleteOrder');
        this.btnBackToStep3 = document.getElementById('btnBackToStep3');
        
        // Debug: Check if critical elements are found
        if (!this.uploadZone) {
            console.error('❌ uploadZone element not found!');
            console.log('DOM state:', document.readyState);
            console.log('Body children:', document.body ? document.body.children.length : 'no body');
        }
    }
    
    bindEvents() {
        // Step 1: Upload
        this.uploadZone?.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-image')) {
                this.fileInput?.click();
            }
        });
        
        this.fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop
        this.uploadZone?.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadZone?.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadZone?.addEventListener('drop', (e) => this.handleDrop(e));
        
        this.changeImageBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeImage();
        });
        
        this.btnToStep2?.addEventListener('click', () => this.goToStep(2));
        
        // Step 2: Convert
        this.btnRetry?.addEventListener('click', () => this.retryConversion());
        this.btnToStep3?.addEventListener('click', () => this.goToStep(3));
        this.btnUploadOwn?.addEventListener('click', () => this.handleUploadOwn());
        this.btnCancel?.addEventListener('click', () => this.goToStep(1));
        
        // Step 3: Preview
        this.viewBtns?.forEach(btn => {
            btn.addEventListener('click', () => this.handleViewChange(btn));
        });
        
        this.typeBtns?.forEach(btn => {
            btn.addEventListener('click', () => this.handleProductTypeChange(btn));
        });
        
        this.colorBtns?.forEach(btn => {
            btn.addEventListener('click', () => this.handleColorChange(btn));
        });
        
        this.sizeBtns?.forEach(btn => {
            btn.addEventListener('click', () => this.handleSizeChange(btn));
        });
        
        this.btnBackToStep2?.addEventListener('click', () => this.goToStep(2));
        this.btnToStep4?.addEventListener('click', () => this.goToStep(4));
        
        // Step 4: Checkout
        this.consentCheckbox?.addEventListener('change', () => this.updateCheckoutButton());
        this.btnBackToStep3?.addEventListener('click', () => this.goToStep(3));
        this.btnCompleteOrder?.addEventListener('click', () => this.handleCompleteOrder());
    }
    
    // ==========================================
    // Step Navigation
    // ==========================================
    
    goToStep(step) {
        // Hide current step
        this.steps[this.currentStep].classList.remove('active');
        
        // Show new step
        this.steps[step].classList.add('active');
        
        // Update current step
        this.currentStep = step;
        
        // Update progress bar
        this.updateProgress();
        
        // Step-specific actions
        if (step === 1) {
            // Reset state when going back to upload
            this.pixelArtResult = null;
            this.isProcessing = false;
            // Clear mockup
            if (this.mockupPixelArt) {
                this.mockupPixelArt.src = '';
                console.log('🔄 Mockup cleared');
            }
            // Clear result options container if exists
            const resultContainer = document.getElementById('resultOptionsContainer');
            if (resultContainer) {
                resultContainer.remove();
                console.log('🔄 Result options cleared');
            }
            console.log('🔄 State reset - ready for new upload');
        } else if (step === 2) {
            this.startConversion();
        } else if (step === 3) {
            this.updatePreview();
        } else if (step === 4) {
            this.updateCheckout();
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    updateProgress() {
        // Update progress bar fill
        const progress = (this.currentStep / this.totalSteps) * 100;
        this.progressFill.style.width = `${progress}%`;
        
        // Update step indicators
        this.progressSteps.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNum < this.currentStep) {
                step.classList.add('completed');
            } else if (stepNum === this.currentStep) {
                step.classList.add('active');
            }
        });
    }
    
    // ==========================================
    // Step 1: File Upload
    // ==========================================
    
    handleDragOver(e) {
        e.preventDefault();
        this.uploadZone.classList.add('drag-over');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        this.uploadZone.classList.remove('drag-over');
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.uploadZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }
    
    handleFileSelect(e) {
        const files = e.target.files;
        console.log('📁 File selected:', files.length > 0 ? files[0].name : 'none');
        if (files.length > 0) {
            this.processFile(files[0]);
        }
        // Reset file input so same file can be selected again
        e.target.value = '';
    }
    
    processFile(file) {
        console.log('🔄 Processing file:', file.name, file.type, file.size);
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            this.showError('Lütfen JPG, PNG veya WEBP formatında bir görsel yükleyin.');
            return;
        }
        
        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('Dosya boyutu 10MB\'dan küçük olmalıdır.');
            return;
        }
        
        console.log('✅ File validation passed');
        
        // Read, resize if needed, and display
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('📖 File read complete, creating image...');
            
            // Create image to resize if needed
            const img = new Image();
            img.onload = () => {
                console.log(`📸 Image loaded: ${img.width}x${img.height}`);
                
                const maxSize = 1024;
                let width = img.width;
                let height = img.height;
                
                // Resize if too large
                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = Math.round((height / width) * maxSize);
                        width = maxSize;
                    } else {
                        width = Math.round((width / height) * maxSize);
                        height = maxSize;
                    }
                    
                    // Create canvas and resize
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Save resized version
                    this.uploadedImage = canvas.toDataURL('image/jpeg', 0.9);
                    console.log(`📐 Image resized to ${width}x${height}`);
                } else {
                    // Use original
                    this.uploadedImage = e.target.result;
                    console.log('📐 Using original image (no resize needed)');
                }
                
                // Extract base64 without data URL prefix
                this.uploadedImageBase64 = (this.uploadedImage.split(',')[1] || '').trim();
                this.uploadedImageMimeType = file.type;
                
                console.log('🎯 Setting preview image...');
                console.log('  - previewImage element:', this.previewImage ? 'found' : 'NULL');
                console.log('  - uploadZone element:', this.uploadZone ? 'found' : 'NULL');
                console.log('  - btnToStep2 element:', this.btnToStep2 ? 'found' : 'NULL');
                console.log('  - previewContainer element:', this.previewContainer ? 'found' : 'NULL');
                
                if (this.previewImage) {
                    this.previewImage.src = this.uploadedImage;
                }
                if (this.previewContainer) {
                    this.previewContainer.style.display = 'block';
                }
                if (this.uploadZone) {
                    this.uploadZone.style.display = 'none';
                }
                if (this.btnToStep2) {
                    this.btnToStep2.disabled = false;
                }
                
                console.log('✅ Image upload complete!');
            };
            img.onerror = () => {
                console.error('❌ Failed to load image');
                this.showError('Görsel yüklenemedi. Lütfen başka bir dosya deneyin.');
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            console.error('❌ Failed to read file');
            this.showError('Dosya okunamadı. Lütfen tekrar deneyin.');
        };
        reader.readAsDataURL(file);
    }
    
    removeImage() {
        this.uploadedImage = null;
        this.uploadedImageBase64 = null;
        this.uploadedImageMimeType = null;
        if (this.previewImage) {
            this.previewImage.src = '';
        }
        if (this.previewContainer) {
            this.previewContainer.style.display = 'none';
        }
        if (this.uploadZone) {
            this.uploadZone.style.display = 'block';
        }
        if (this.btnToStep2) {
            this.btnToStep2.disabled = true;
        }
        if (this.fileInput) {
            this.fileInput.value = '';
        }
    }
    
    // ==========================================
    // Step 2: AI Conversion
    // ==========================================
    
    async startConversion() {
        if (this.isProcessing) return;
        
        // Set original image
        this.originalImage.src = this.uploadedImage;
        
        // Reset UI
        this.loadingState.style.display = 'flex';
        this.pixelArtImage.style.display = 'none';
        this.convertActions.style.display = 'none';
        this.noAttempts.style.display = 'none';
        this.attemptInfo.style.display = 'block';
        
        // Start conversion based on mode
        if (CONFIG.DEMO_MODE) {
            this.simulateAIConversion();
        } else if (CONFIG.PIXEL_ART_MODE === 'openai') {
            await this.openaiPixelArt();
        } else if (CONFIG.PIXEL_ART_MODE === 'gemini') {
            await this.geminiPixelArt();
        } else if (CONFIG.PIXEL_ART_MODE === 'leonardo') {
            await this.leonardoPixelArt();
        } else if (CONFIG.PIXEL_ART_MODE === 'hybrid-direct') {
            await this.callHybridDirect();
        } else if (CONFIG.PIXEL_ART_MODE === 'hybrid') {
            await this.callHybridAI();
        } else if (CONFIG.PIXEL_ART_MODE === 'filter') {
            await this.clientSidePixelate();
        } else if (CONFIG.PIXEL_ART_MODE === 'openai-edit') {
            await this.callOpenAIEdit();
        } else if (CONFIG.PIXEL_ART_MODE === 'openai-direct') {
            await this.callOpenAIDirect();
        } else if (CONFIG.PIXEL_ART_MODE === 'ai') {
            await this.callReplicateAPI();
        } else if (CONFIG.PIXEL_ART_MODE === 'openai') {
            await this.callOpenAI();
        } else {
            await this.leonardoPixelArt(); // default to Leonardo FLUX.1 Kontext
        }
    }
    
    async clientSidePixelate() {
        console.log('🎨 Client-side pixelation başladı...');
        this.isProcessing = true;
        
        try {
            // Create offscreen image from data URL
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            // Wait for image to load
            const loadPromise = new Promise((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = (e) => reject(new Error('Image load failed: ' + e));
                img.src = this.uploadedImage;  // This is already a data URL
            });
            
            await loadPromise;
            console.log(`📐 Image loaded: ${img.width}x${img.height}`);
            
            // DETERMINISTIC PIPELINE: Exact 64x64 sprite
            const targetSize = CONFIG.FILTER.targetSize; // 64
            const previewScale = 8; // 8x upscale for preview (64 → 512)
            
            console.log(`🎯 Target: ${targetSize}x${targetSize} sprite`);
            
            // Step 1: Resize to exact 64x64 (box/area resampling via canvas)
            const spriteCanvas = document.createElement('canvas');
            spriteCanvas.width = targetSize;
            spriteCanvas.height = targetSize;
            const spriteCtx = spriteCanvas.getContext('2d', { willReadFrequently: true });
            
            // Use image-rendering for nearest-neighbor (after quantize)
            spriteCtx.imageSmoothingEnabled = true; // For initial downscale
            spriteCtx.imageSmoothingQuality = 'high'; // Better downscale
            
            // Center crop to square first
            const size = Math.min(img.width, img.height);
            const offsetX = (img.width - size) / 2;
            const offsetY = (img.height - size) / 2;
            
            spriteCtx.drawImage(img, offsetX, offsetY, size, size, 0, 0, targetSize, targetSize);
            console.log(`✅ Resized to ${targetSize}x${targetSize}`);
            
            // Get image data
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            const pixelSize = CONFIG.FILTER.pixelSize;
            const colorDepth = CONFIG.FILTER.colorDepth;
            
            console.log(`🎨 Pixelating with size=${pixelSize}, depth=${colorDepth}...`);
            
            // Pixelate by averaging pixel blocks
            for (let y = 0; y < height; y += pixelSize) {
                for (let x = 0; x < width; x += pixelSize) {
                    let r = 0, g = 0, b = 0, count = 0;
                    
                    // Average block
                    for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
                        for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
                            const i = ((y + dy) * width + (x + dx)) * 4;
                            r += data[i];
                            g += data[i + 1];
                            b += data[i + 2];
                            count++;
                        }
                    }
                    
                    // Quantize colors (reduce palette)
                    r = Math.round((r / count) / 255 * (colorDepth - 1)) * (255 / (colorDepth - 1));
                    g = Math.round((g / count) / 255 * (colorDepth - 1)) * (255 / (colorDepth - 1));
                    b = Math.round((b / count) / 255 * (colorDepth - 1)) * (255 / (colorDepth - 1));
                    
                    // Fill block with quantized color
                    for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
                        for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
                            const i = ((y + dy) * width + (x + dx)) * 4;
                            data[i] = r;
                            data[i + 1] = g;
                            data[i + 2] = b;
                        }
                    }
                }
            }
            
            // Put modified data back
            ctx.putImageData(imageData, 0, 0);
            
            // Convert to data URL
            const pixelArtUrl = canvas.toDataURL('image/png');
            console.log('✅ Pixelation complete, size:', (pixelArtUrl.length / 1024).toFixed(1), 'KB');
            
            // Show result
            this.pixelArtResult = pixelArtUrl;
            this.pixelArtImage.src = pixelArtUrl;
            
            this.loadingState.style.display = 'none';
            this.pixelArtImage.style.display = 'block';
            this.convertActions.style.display = 'flex';
            
            // Decrement attempts
            if (this.attemptsLeft > 1) {
                this.attemptsLeft--;
                this.attemptCount.textContent = this.attemptsLeft;
            } else {
                this.attemptsLeft = 0;
                this.attemptCount.textContent = 0;
            }
            
            this.isProcessing = false;
            
        } catch (error) {
            console.error('❌ Pixelation error:', error);
            console.error('Error stack:', error.stack);
            this.showError(`Pixel art dönüşümü başarısız: ${error.message}`);
            this.loadingState.style.display = 'none';
            this.convertActions.style.display = 'flex';
            this.isProcessing = false;
        }
    }
    
    // Demo mode - basit pixelation
    simulateAIConversion() {
        this.isProcessing = true;
        let progress = 0;
        this.loadingBar.style.width = '0%';
        this.updateLoadingText('AI başlatılıyor...');
        
        const messages = [
            'Görsel analiz ediliyor...',
            'Renk paleti çıkarılıyor...',
            'Pixel art oluşturuluyor...',
            'Detaylar sadeleştiriliyor...',
            'Son rötuşlar yapılıyor...'
        ];
        
        let messageIndex = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * 12;
            
            // Update message
            if (progress > messageIndex * 20 && messageIndex < messages.length) {
                this.updateLoadingText(messages[messageIndex]);
                messageIndex++;
            }
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.isProcessing = false;
                
                // Show result after a brief delay
                setTimeout(() => this.showDemoResult(), 500);
            }
            this.loadingBar.style.width = `${progress}%`;
        }, 300);
    }
    
    showDemoResult() {
        // Hide loading
        this.loadingState.style.display = 'none';
        
        // For demo, create a pixelated version using canvas
        this.createPixelArtDemo();
        
        // Show result
        this.pixelArtImage.style.display = 'block';
        this.convertActions.style.display = 'flex';
    }
    
    createPixelArtDemo() {
        // Create a canvas to pixelate the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const img = new Image();
        img.onload = () => {
            // Set small size for pixelation
            const pixelSize = 64;
            canvas.width = pixelSize;
            canvas.height = pixelSize;
            
            // Draw scaled down
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, pixelSize, pixelSize);
            
            // Get the pixelated data URL
            this.pixelArtResult = canvas.toDataURL('image/png');
            this.pixelArtImage.src = this.pixelArtResult;
            
            // Apply pixelated rendering
            this.pixelArtImage.style.imageRendering = 'pixelated';
            this.pixelArtImage.style.width = '100%';
        };
        img.src = this.uploadedImage;
    }
    
    // Gerçek Replicate API çağrısı (via n8n proxy)
// REMOVED: callReplicateAPI() - no longer used (switched to OpenAI DALL-E 3)

    // OpenAI DALL-E API çağrısı (via n8n webhook)
    async callOpenAI() {
        this.isProcessing = true;
        this.loadingBar.style.width = '10%';
        this.updateLoadingText('AI\'ya bağlanılıyor...');
        
        try {
            // Validate image
            if (!this.uploadedImageBase64) {
                throw new Error('Görsel yüklenemedi. Lütfen tekrar deneyin.');
            }
            
            // Check image size
            const imageSizeKB = (this.uploadedImageBase64.length * 3) / 4 / 1024;
            if (imageSizeKB > 5000) {
                throw new Error('Görsel çok büyük. Lütfen daha küçük bir görsel seçin.');
            }
            
            console.log('🚀 OpenAI DALL-E API\'ye n8n webhook üzerinden bağlanılıyor...');
            console.log('   Image size:', Math.round(imageSizeKB), 'KB');
            
            this.loadingBar.style.width = '20%';
            this.updateLoadingText('Görsel analiz ediliyor...');
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);
            
            // Call n8n webhook (Vision + DALL-E pipeline)
            const response = await fetch(CONFIG.N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image: this.uploadedImageBase64
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log('📡 OpenAI response:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ OpenAI error:', errorText);
                throw new Error('OpenAI API hatası: ' + response.status);
            }
            
            const result = await response.json();
            console.log('✅ OpenAI result:', result);
            console.log('   - success:', result.success);
            console.log('   - pixelArtUrl:', result.pixelArtUrl);
            console.log('   - error:', result.error);
            
                this.loadingBar.style.width = '100%';
            this.updateLoadingText('Tamamlandı! 🎉');
            
            // Check result - more flexible parsing
            let pixelArtUrl = result.pixelArtUrl || result.url || (result.data && result.data[0] && result.data[0].url);
            
            if (pixelArtUrl) {
                console.log('🎨 Pixel Art URL bulundu:', pixelArtUrl);
                this.pixelArtResult = pixelArtUrl;
                
                // Show result
                setTimeout(() => {
                    this.goToStep(3);
                }, 500);
            } else if (result.success && result.pixelArtUrl) {
                this.pixelArtResult = result.pixelArtUrl;
                
                // Show result
                setTimeout(() => {
                    this.goToStep(3);
                }, 500);
            } else {
                console.error('❌ Beklenmeyen response formatı:', result);
                throw new Error(result.error || 'Pixel art URL bulunamadı');
            }
            
        } catch (error) {
            console.error('❌ OpenAI Hatası:', error);
                    this.isProcessing = false;
            
            if (error.name === 'AbortError') {
                this.updateLoadingText('⏱️ Zaman aşımı');
                setTimeout(() => {
                    alert('API zaman aşımına uğradı. Lütfen tekrar deneyin.');
                    this.goToStep(1);
                }, 1000);
            } else {
                this.updateLoadingText('❌ Hata oluştu');
                setTimeout(() => {
                    alert('Hata: ' + error.message);
                    this.goToStep(1);
                }, 1000);
            }
        }
    }

    // Direct OpenAI API call (CORS bypass)
    async callOpenAIDirect() {
        this.isProcessing = true;
        this.loadingBar.style.width = '10%';
        this.updateLoadingText('AI\'ya bağlanılıyor...');
        
        try {
            if (!this.uploadedImageBase64) {
                throw new Error('Görsel yüklenemedi. Lütfen tekrar deneyin.');
            }
            
            console.log('🚀 Direct OpenAI DALL-E 3 API çağrısı...');
            
            this.loadingBar.style.width = '30%';
            this.updateLoadingText('Pixel art oluşturuluyor... (30-60 saniye)');
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);
            
            // Direct OpenAI API call
            const response = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "dall-e-3",
                    prompt: `Convert photo to STRICT 64x64 pixel art sprite. CRITICAL RULES:

1. STYLE & RESOLUTION:
   - Final output MUST look like 64x64 pixel art sprite
   - LARGE CHUNKY PIXELS - very visible pixel blocks
   - NO gradients, NO shading, NO anti-aliasing, NO smoothing
   - Flat colors ONLY
   - Clean black outlines around major shapes

2. DETAIL LEVEL:
   - EXTREMELY simplified forms (iconic, NOT realistic)
   - Minimal facial details (2 black pixels for eyes, 1-2 pixels for mouth)
   - Hair, face, clothes: use FEWEST pixels possible
   - Remove ALL non-essential details

3. POSE & COMPOSITION:
   - Character: head + upper body together
   - Centered sprite-like composition
   - Simple, iconic pose

4. COLOR PALETTE:
   - Extract dominant colors from image
   - Build LIMITED palette: MAX 8-10 colors
   - Solid single-color background

5. BACKGROUND:
   - Solid flat color (from palette)
   - NO texture, NO depth

6. OBJECT/CLOTHING:
   - Keep EXTREMELY simple
   - Maximum 2 colors per object

OVERALL FEEL:
- Retro 8-bit/16-bit game sprite (NES, Game Boy, Super Mario style)
- Iconic, bold, clean

MUST BE:
- Single character only
- Large visible pixels
- Minimal detail
- Retro game sprite aesthetic`,
                    n: 1,
                    size: "1024x1024",
                    quality: "standard"
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log('📡 OpenAI response:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ OpenAI error:', errorText);
                throw new Error('OpenAI API hatası: ' + response.status);
            }
            
            const result = await response.json();
            console.log('✅ OpenAI result:', result);
            
                this.loadingBar.style.width = '100%';
            this.updateLoadingText('Tamamlandı! 🎉');
            
            // Get image URL
            if (result.data && result.data[0] && result.data[0].url) {
                const pixelArtUrl = result.data[0].url;
                this.pixelArtResult = pixelArtUrl;
                
                // Show result
                setTimeout(() => {
                    this.goToStep(3);
                }, 500);
            } else {
                console.error('❌ Unexpected response format:', result);
                throw new Error('Pixel art URL bulunamadı');
            }
            
        } catch (error) {
            console.error('❌ API Hatası:', error);
                    this.isProcessing = false;
            
            if (error.name === 'AbortError') {
                this.updateLoadingText('⏱️ Zaman aşımı');
                setTimeout(() => {
                    alert('API zaman aşımına uğradı. Lütfen tekrar deneyin.');
                    this.goToStep(1);
                }, 1000);
            } else {
                this.updateLoadingText('❌ Hata oluştu');
                setTimeout(() => {
                    alert('Hata: ' + error.message);
                    this.goToStep(1);
                }, 1000);
            }
        }
    }

    // DALL-E 2 Edit API call (image-to-image transformation)
    async callOpenAIEdit() {
        this.isProcessing = true;
        this.loadingBar.style.width = '10%';
        this.updateLoadingText('AI\'ya bağlanılıyor...');
        
        try {
            if (!this.uploadedImageBase64) {
                throw new Error('Görsel yüklenemedi. Lütfen tekrar deneyin.');
            }
            
            console.log('🚀 DALL-E 2 Edits API çağrısı (image-to-image)...');
            
            this.loadingBar.style.width = '20%';
            this.updateLoadingText('Görsel PNG\'ye dönüştürülüyor...');
            
            // Convert uploaded image to PNG using Canvas
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            // Wait for image to load
            await new Promise((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = (e) => reject(new Error('Image load failed'));
                img.src = this.uploadedImage;  // data URL
            });
            
            console.log('📐 Image loaded:', img.width, 'x', img.height);
            
            // Create canvas and draw image
            const canvas = document.createElement('canvas');
            
            // Resize if too large (max 1024x1024 for DALL-E 2)
            let width = img.width;
            let height = img.height;
            const maxSize = 1024;
            
            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = Math.round((height / width) * maxSize);
                    width = maxSize;
                } else {
                    width = Math.round((width / height) * maxSize);
                    height = maxSize;
                }
                console.log('📏 Resized to:', width, 'x', height);
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert canvas to PNG blob
            const imageBlob = await new Promise((resolve) => {
                canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
            });
            
            console.log('📦 PNG blob created:', imageBlob.size, 'bytes');
            
            // Check size (max 4MB for DALL-E 2)
            if (imageBlob.size > 4 * 1024 * 1024) {
                throw new Error('Görsel çok büyük (max 4MB). Lütfen daha küçük bir görsel seçin.');
            }
            
            this.loadingBar.style.width = '30%';
            this.updateLoadingText('Pixel art oluşturuluyor... (20-40 saniye)');
            
            // Create FormData for multipart/form-data
            const formData = new FormData();
            formData.append('image', imageBlob, 'photo.png');
            formData.append('prompt', `Transform into STRICT 64x64 pixel art sprite. CRITICAL RULES:

1. LARGE CHUNKY PIXELS - very visible pixel blocks (like NES/Game Boy sprites)
2. EXTREMELY simplified forms (iconic NOT realistic)
3. Minimal facial details: 2-3 black pixels for eyes, 1-2 pixels for mouth
4. Flat colors ONLY - NO gradients, NO shading, NO anti-aliasing
5. Clean black outlines around major shapes
6. Extract dominant colors, build LIMITED palette (MAX 8-10 colors)
7. Solid single-color background (from palette)
8. Keep clothing colors from original but SIMPLIFIED (max 2 colors per object)
9. Character: head + upper body, centered sprite composition
10. Retro 8-bit/16-bit game sprite aesthetic (Super Mario, Zelda style)

MUST BE:
- Single character ONLY (NO sprite sheet, NO multiple characters!)
- Large visible pixels (hand-drawn pixel-by-pixel look)
- Minimal detail (fewest pixels possible)
- Bold, clean, iconic

IF RESULT has sprite sheet/multiple characters/palette chart = WRONG`);
            formData.append('n', '1');
            formData.append('size', '1024x1024');
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);
            
            // DALL-E 2 Edits API call
            const response = await fetch('https://api.openai.com/v1/images/edits', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
                    // NO Content-Type header - browser sets it automatically for FormData
                },
                body: formData,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log('📡 DALL-E 2 Edits response:', response.status);
            
            this.loadingBar.style.width = '80%';
            this.updateLoadingText('Neredeyse bitti...');
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ DALL-E 2 error:', errorText);
                throw new Error('DALL-E 2 API hatası: ' + response.status);
            }
            
            const result = await response.json();
            console.log('✅ DALL-E 2 result:', result);
            
            this.loadingBar.style.width = '100%';
            this.updateLoadingText('Tamamlandı! 🎉');
            
            // Get image URL
            if (result.data && result.data[0] && result.data[0].url) {
                const pixelArtUrl = result.data[0].url;
                this.pixelArtResult = pixelArtUrl;
                
                console.log('🎨 Pixel art URL:', pixelArtUrl);
                
                // Show result
                setTimeout(() => {
                    this.goToStep(3);
                }, 500);
            } else {
                console.error('❌ Unexpected response format:', result);
                throw new Error('Pixel art URL bulunamadı');
            }
            
        } catch (error) {
            console.error('❌ API Hatası:', error);
            this.isProcessing = false;
            
            if (error.name === 'AbortError') {
                this.updateLoadingText('⏱️ Zaman aşımı');
                setTimeout(() => {
                    alert('API zaman aşımına uğradı. Lütfen tekrar deneyin.');
                    this.goToStep(1);
                }, 1000);
            } else {
                this.updateLoadingText('❌ Hata oluştu');
                setTimeout(() => {
                    alert('Hata: ' + error.message);
                    this.goToStep(1);
                }, 1000);
            }
        }
    }

    // ==========================================
    // HELPER: Upload Image to Imgur
    // ==========================================
    
    async uploadToImgur(base64Image) {
        try {
            // Remove data:image/jpeg;base64, prefix
            const base64Data = base64Image.split(',')[1];
            
            const response = await fetch('https://api.imgur.com/3/image', {
                method: 'POST',
                headers: {
                    'Authorization': `Client-ID ${CONFIG.IMGUR_CLIENT_ID}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image: base64Data,
                    type: 'base64'
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Imgur upload error:', errorText);
                throw new Error(`Imgur upload failed: ${response.status}`);
            }
            
            const result = await response.json();
            return result.data.link; // Returns URL like https://i.imgur.com/xxxxx.jpg
        } catch (error) {
            console.error('❌ Imgur upload hatası:', error);
            throw new Error('Image upload başarısız: ' + error.message);
        }
    }
    
    // ==========================================
    // HYBRID DIRECT: Algorithmic + Replicate API (no n8n)
    // ==========================================
    
    async callHybridDirect() {
        console.log('🎨 HYBRID DIRECT: Algorithmic + Replicate API başladı...');
        this.isProcessing = true;
        this.loadingBar.style.width = '10%';
        this.updateLoadingText('🎨 Algoritmik pixel art oluşturuluyor...');
        
        try {
            if (!CONFIG.REPLICATE_API_KEY) {
                throw new Error('Replicate API key bulunamadı!');
            }
            
            // Step 1: Client-side algorithmic pixelation (24x24 - balanced for NSFW bypass + quality)
            this.loadingBar.style.width = '20%';
            const pixelatedImageBase64 = await this.algorithmicPixelArt(this.uploadedImage, 24);
            console.log('✅ Algorithmic pixelation tamamlandı (24x24)');
            
            // Step 2: Start Replicate prediction (SDXL img2img with base64)
            this.loadingBar.style.width = '30%';
            this.updateLoadingText('🤖 AI refinement başlatılıyor...');
            
            console.log('📊 Base64 length:', pixelatedImageBase64.length, 'chars (~', Math.round(pixelatedImageBase64.length / 1024), 'KB)');
            
            const sdxlImg2ImgVersion = '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc';
            
            const startResponse = await fetch('https://api.replicate.com/v1/predictions', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${CONFIG.REPLICATE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    version: sdxlImg2ImgVersion,
                    input: {
                        image: pixelatedImageBase64,  // Base64 (now small enough after resize!)
                        prompt: 'Convert the subject in the provided photo into a minimalist, 64x64 resolution retro pixel art character based on these specific technical requirements: 1. VISUAL STYLE & CONSTRUCTION: Resolution: Strict 64x64 grid with large, chunky pixels. Outlines: Thick, continuous black pixel outlines (1-2 pixels wide) around the hair, face, and torso. Coloring: Use strictly flat colors. No gradients, no soft shading, and absolutely no anti-aliasing (keep edges crisp and jagged). Texture: The final image should have a subtle, grainy paper or retro monitor overlay effect, similar to old arcade games. 2. CHARACTER DESIGN (ICONIC SIMPLIFICATION): Pose: Upper body and head only, centered, looking slightly to the side (3/4 view). Facial Features: Use simple black pixel blocks for eyes and a single flat line for the mouth. No nose or complex ear details. Hair: Simplify the hair into one solid block of color (e.g., vibrant yellow/gold if applicable) with a clean silhouette. Clothing: Capture the essence of the shirt. If there is text, simplify it into a bold, blocky pixel font. 3. COLOR PALETTE & BACKGROUND: Limited Palette: Extract only 4-6 dominant colors from the source image. Use high-contrast, saturated tones. Background: A solid, vibrant color (e.g., orange or blue) that contrasts with the character. Shadows: Use only one darker shade of the base skin/hair color for cell-shading, keep it extremely minimal and blocky. 4. MANDATORY PHILOSOPHY: Prioritize readability over realism. The character should look like a collectible 8-bit NFT sprite or a classic game character. Remove all background distractions from the original photo.',
                        negative_prompt: 'realistic photo, photographic, smooth gradients, anti-aliasing, soft edges, blurry, high resolution, detailed background, complex shading, 3d render, modern graphics, multiple characters, sprite sheet, watermark, text, signature',
                        num_outputs: 1,
                        num_inference_steps: 30,
                        prompt_strength: 0.7,  // Higher to follow the detailed prompt better
                        guidance_scale: 9.0
                    }
                })
            });
            
            if (!startResponse.ok) {
                const errorText = await startResponse.text();
                console.error('❌ Replicate start error:', errorText);
                throw new Error(`Replicate API error: ${startResponse.status}`);
            }
            
            const prediction = await startResponse.json();
            const predictionId = prediction.id;
            console.log('🚀 Replicate prediction started:', predictionId);
            
            // Step 3: Poll for result
            this.loadingBar.style.width = '50%';
            this.updateLoadingText('🔄 AI ile pixel art oluşturuluyor... (20-40 saniye)');
            
            let attempts = 0;
            const maxAttempts = 40; // 40 * 2s = 80s max
            
            while (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
                attempts++;
                
                console.log(`🔄 Polling ${attempts}/${maxAttempts}...`);
                
                const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
                    headers: {
                        'Authorization': `Token ${CONFIG.REPLICATE_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!pollResponse.ok) {
                    console.error('❌ Poll error:', pollResponse.status);
                    continue; // Retry
                }
                
                const pollResult = await pollResponse.json();
                const status = pollResult.status;
                
                console.log(`📊 Status: ${status}`);
                
                // Update progress
                const progress = 50 + (attempts / maxAttempts) * 45;
                this.loadingBar.style.width = `${progress}%`;
                
                if (status === 'succeeded') {
                    console.log('✅ Replicate succeeded!');
                    const outputUrl = Array.isArray(pollResult.output) ? pollResult.output[0] : pollResult.output;
                    
                    if (outputUrl) {
                        this.loadingBar.style.width = '100%';
                        this.updateLoadingText('✅ Tamamlandı! 🎉');
                        
                        this.pixelArtResult = outputUrl;
                        
                        setTimeout(() => {
                            this.goToStep(3);
                        }, 500);
                        return;
                    } else {
                        throw new Error('Output URL bulunamadı');
                    }
                } else if (status === 'failed' || status === 'canceled') {
                    console.error('❌ Prediction failed:', pollResult.error);
                    throw new Error('AI refinement başarısız: ' + (pollResult.error || 'Unknown error'));
                }
            }
            
            // Timeout
            throw new Error('AI refinement zaman aşımına uğradı (80 saniye)');
            
        } catch (error) {
            console.error('❌ Hybrid Direct Hatası:', error);
            this.isProcessing = false;
            
            this.updateLoadingText('❌ Hata oluştu');
            setTimeout(() => {
                alert('Hata: ' + error.message);
                this.goToStep(1);
            }, 1000);
        }
    }
    
    // ==========================================
    // HYBRID: Algorithmic + AI Cleanup (via n8n)
    // ==========================================
    
    async callHybridAI() {
        console.log('🎨 HYBRID MODE: Algorithmic + AI başladı...');
        this.isProcessing = true;
        this.loadingBar.style.width = '10%';
        this.updateLoadingText('Algoritmik pixel reduction başlıyor...');
        
        try {
            // Step 1: Algorithmic pixel art (client-side)
            this.loadingBar.style.width = '20%';
            this.updateLoadingText('64x64 pixel art oluşturuluyor...');
            
            const pixelatedImage = await this.algorithmicPixelArt(this.uploadedImage);
            console.log('✅ Algorithmic pixel art tamamlandı');
            
            // Step 2: Start AI cleanup (Replicate via n8n)
            this.loadingBar.style.width = '30%';
            this.updateLoadingText('AI cleanup başlatılıyor...');
            
            const startResponse = await fetch(CONFIG.N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'start',
                    image: pixelatedImage
                })
            });
            
            if (!startResponse.ok) {
                const errorText = await startResponse.text();
                console.error('❌ Start error:', errorText);
                throw new Error('AI cleanup başlatılamadı: ' + startResponse.status);
            }
            
            const startResult = await startResponse.json();
            const predictionId = startResult.id;
            console.log('🚀 Prediction started:', predictionId);
            
            // Step 3: Poll for result (client-side)
            this.loadingBar.style.width = '40%';
            this.updateLoadingText('AI ile temizleniyor... (30-60 saniye)');
            
            let attempts = 0;
            const maxAttempts = 30; // 30 * 3s = 90s max
            
            while (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3s
                attempts++;
                
                console.log(`🔄 Polling attempt ${attempts}/${maxAttempts}...`);
                
                const pollResponse = await fetch(CONFIG.N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'poll',
                        predictionId: predictionId
                    })
                });
                
                if (!pollResponse.ok) {
                    console.error('❌ Poll error:', pollResponse.status);
                    continue; // Retry
                }
                
                const pollResult = await pollResponse.json();
                const status = pollResult.status;
                
                console.log(`📊 Status: ${status}`);
                
                // Update progress bar
                const progress = 40 + (attempts / maxAttempts) * 50;
                this.loadingBar.style.width = `${progress}%`;
                
                if (status === 'succeeded') {
                    console.log('✅ AI cleanup succeeded!');
                    const outputUrl = pollResult.output && pollResult.output[0];
                    
                    if (outputUrl) {
                        this.loadingBar.style.width = '100%';
                        this.updateLoadingText('Tamamlandı! 🎉');
                        
                        this.pixelArtResult = outputUrl;
            
            setTimeout(() => {
                            this.goToStep(3);
                        }, 500);
                        return;
                    } else {
                        throw new Error('Output URL bulunamadı');
                    }
                } else if (status === 'failed' || status === 'canceled') {
                    console.error('❌ Prediction failed:', pollResult.error);
                    throw new Error('AI cleanup başarısız: ' + (pollResult.error || 'Unknown error'));
                }
                
                // Still processing, continue polling
            }
            
            // Timeout
            throw new Error('AI cleanup zaman aşımına uğradı (90 saniye)');
            
        } catch (error) {
            console.error('❌ Hybrid API Hatası:', error);
            this.isProcessing = false;
            
            this.updateLoadingText('❌ Hata oluştu');
            setTimeout(() => {
                alert('Hata: ' + error.message);
                this.goToStep(1);
            }, 1000);
        }
    }
    
    // Algorithmic pixel art reduction
    async algorithmicPixelArt(imageDataUrl, targetSize = 64) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                try {
                    console.log('📐 Original size:', img.width, 'x', img.height);
                    
                    // First, resize to max 512x512 to avoid data URL limits
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    
                    const maxDim = 512;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height / width) * maxDim);
                            width = maxDim;
                        } else {
                            width = Math.round((width / height) * maxDim);
                            height = maxDim;
                        }
                    }
                    
                    tempCanvas.width = width;
                    tempCanvas.height = height;
                    tempCtx.drawImage(img, 0, 0, width, height);
                    
                    console.log('📐 Resized to:', width, 'x', height);
                    
                    // Step 1: Resize to target (NEAREST neighbor - no smoothing)
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = targetSize;
                    canvas.height = targetSize;
                    
                    // Disable all smoothing
                    ctx.imageSmoothingEnabled = false;
                    ctx.mozImageSmoothingEnabled = false;
                    ctx.webkitImageSmoothingEnabled = false;
                    ctx.msImageSmoothingEnabled = false;
                    
                    // Draw from temp canvas (already resized)
                    ctx.drawImage(tempCanvas, 0, 0, targetSize, targetSize);
                    console.log(`✅ Resized to ${targetSize}x${targetSize} (NEAREST)`);
                    
                    // Step 2: Color quantization (reduce to 16 colors)
                    const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
                    this.quantizeColors(imageData, 16);
                    ctx.putImageData(imageData, 0, 0);
                    console.log('✅ Colors quantized to 16');
                    
                    // Step 3: Contrast boost
                    this.boostContrast(ctx, canvas);
                    console.log('✅ Contrast boosted');
                    
                    // Step 4: Extract edges and add black outlines
                    this.extractEdges(ctx, canvas);
                    console.log('✅ Black outlines added');
                    
                    // Return as base64 data URL (JPEG for smaller size)
                    const result = canvas.toDataURL('image/jpeg', 0.8);
                    console.log('🎨 Algorithmic pixel art complete!');
                    console.log('📊 Base64 length:', result.length);
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            };
            
            img.onerror = (e) => reject(new Error('Image load failed'));
            img.src = imageDataUrl;
        });
    }
    
    // Color quantization (reduce color palette)
    quantizeColors(imageData, numColors) {
        const data = imageData.data;
        const colorStep = Math.floor(256 / numColors);
        
        for (let i = 0; i < data.length; i += 4) {
            // Quantize each channel
            data[i] = Math.round(data[i] / colorStep) * colorStep;       // R
            data[i + 1] = Math.round(data[i + 1] / colorStep) * colorStep; // G
            data[i + 2] = Math.round(data[i + 2] / colorStep) * colorStep; // B
            // Alpha unchanged
        }
    }
    
    // Contrast boost for clarity
    boostContrast(ctx, canvas) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const factor = 1.5;  // Contrast factor
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));       // R
            data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128)); // G
            data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128)); // B
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    // Edge detection and black outline extraction
    extractEdges(ctx, canvas) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        
        // Simple edge detection (Sobel-like)
        const edges = new Uint8ClampedArray(data.length);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                // Get surrounding pixels
                const top = ((y - 1) * width + x) * 4;
                const bottom = ((y + 1) * width + x) * 4;
                const left = (y * width + (x - 1)) * 4;
                const right = (y * width + (x + 1)) * 4;
                
                // Calculate gradient (simple difference)
                const gx = Math.abs(data[right] - data[left]);
                const gy = Math.abs(data[bottom] - data[top]);
                const gradient = gx + gy;
                
                // If strong edge, mark as black outline
                if (gradient > 50) {
                    data[idx] = 0;       // R
                    data[idx + 1] = 0;   // G
                    data[idx + 2] = 0;   // B
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    
    startProgressSimulation() {
        let progress = 10;
        const messages = [
            { progress: 20, text: 'Görsel analiz ediliyor...' },
            { progress: 35, text: 'Renk paleti çıkarılıyor...' },
            { progress: 50, text: 'Pixel art oluşturuluyor...' },
            { progress: 70, text: 'Detaylar sadeleştiriliyor...' },
            { progress: 85, text: 'Son rötuşlar yapılıyor...' },
            { progress: 95, text: 'Neredeyse bitti...' }
        ];
        
        return setInterval(() => {
            if (progress < 95) {
                progress += Math.random() * 3;
                this.loadingBar.style.width = `${Math.min(progress, 95)}%`;
                
                // Update message based on progress
                for (const msg of messages) {
                    if (progress >= msg.progress && progress < msg.progress + 15) {
                        this.updateLoadingText(msg.text);
                        break;
                    }
                }
            }
        }, 500);
    }
    
    updateLoadingText(text) {
        if (this.loadingText) {
            this.loadingText.textContent = text;
        }
    }
    
    retryConversion() {
        if (this.attemptsLeft > 1) {
            this.attemptsLeft--;
            this.attemptCount.textContent = this.attemptsLeft;
            this.startConversion();
        } else {
            // No attempts left
            this.attemptsLeft = 0;
            this.attemptCount.textContent = '0';
            this.convertActions.style.display = 'none';
            this.attemptInfo.style.display = 'none';
            this.noAttempts.style.display = 'block';
        }
    }
    
    handleUploadOwn() {
        // Create file input for custom pixel art
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/png';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.pixelArtResult = event.target.result;
                    this.pixelArtImage.src = this.pixelArtResult;
                    this.pixelArtImage.style.display = 'block';
                    this.noAttempts.style.display = 'none';
                    this.convertActions.style.display = 'flex';
                    
                    // Hide retry button when using own image
                    this.btnRetry.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }
    
    // ==========================================
    // Show Result Options (Beğendim / Tekrar Oluştur)
    // ==========================================
    
    showResultOptions() {
        // Display generated pixel art in Step 2
        this.updateLoadingText('');
        
        // Create result preview and buttons if not exists
        let resultContainer = document.getElementById('resultOptionsContainer');
        if (!resultContainer) {
            resultContainer = document.createElement('div');
            resultContainer.id = 'resultOptionsContainer';
            resultContainer.style.cssText = 'text-align: center; margin-top: 20px; width: 100%; max-width: 600px; margin-left: auto; margin-right: auto; overflow: visible;';
            
            // Preview image
            const previewImg = document.createElement('img');
            previewImg.id = 'resultPreviewImg';
            previewImg.style.cssText = 'width: 100%; max-width: 512px; height: auto; border: 2px solid #00ff00; border-radius: 8px; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto; background: #000; object-fit: contain;';
            previewImg.src = this.pixelArtResult;
            resultContainer.appendChild(previewImg);
            
            // Buttons container
            const buttonsDiv = document.createElement('div');
            buttonsDiv.style.cssText = 'display: flex; gap: 15px; justify-content: center;';
            
            // "Beğendim" button
            const approveBtn = document.createElement('button');
            approveBtn.textContent = '✅ Beğendim - Devam Et';
            approveBtn.className = 'btn btn-primary';
            approveBtn.style.cssText = 'padding: 12px 24px; font-size: 16px;';
            approveBtn.onclick = () => {
                console.log('✅ User approved result');
                this.goToStep(3);
            };
            buttonsDiv.appendChild(approveBtn);
            
            // "Tekrar Oluştur" button
            const regenerateBtn = document.createElement('button');
            regenerateBtn.textContent = '🔄 Tekrar Oluştur';
            regenerateBtn.className = 'btn btn-secondary';
            regenerateBtn.style.cssText = 'padding: 12px 24px; font-size: 16px;';
            regenerateBtn.onclick = () => {
                console.log('🔄 User requested regeneration');
                resultContainer.remove();
                this.startConversion(); // Regenerate with different prompt variant
            };
            buttonsDiv.appendChild(regenerateBtn);
            
            resultContainer.appendChild(buttonsDiv);
            
            // Insert after loading bar
            const loadingState = document.querySelector('#step2 .loading-state');
            loadingState.parentNode.insertBefore(resultContainer, loadingState.nextSibling);
        } else {
            // Update existing preview
            const previewImg = document.getElementById('resultPreviewImg');
            if (previewImg) {
                previewImg.src = this.pixelArtResult;
            }
        }
    }
    
    // ==========================================
    // Step 3: Preview
    // ==========================================
    
    updatePreview() {
        // Set pixel art on mockup (with cache busting)
        console.log('🖼️ updatePreview() called');
        console.log('   pixelArtResult exists?', !!this.pixelArtResult);
        console.log('   pixelArtResult length:', this.pixelArtResult ? this.pixelArtResult.length : 0);
        console.log('   pixelArtResult preview:', this.pixelArtResult ? this.pixelArtResult.substring(0, 100) : 'N/A');
        
        if (this.pixelArtResult) {
            // Force browser to reload image (no cache)
            console.log('   Clearing mockup src...');
            this.mockupPixelArt.src = '';
            setTimeout(() => {
                console.log('   Setting new mockup src...');
            this.mockupPixelArt.src = this.pixelArtResult;
                console.log('   ✅ Mockup src updated!');
                console.log('   Mockup element:', this.mockupPixelArt);
            }, 10);
        } else {
            console.error('⚠️ No pixelArtResult to display!');
        }
        
        // Populate position selector for current product
        this.populatePositionSelector();
        
        // Update mockup based on current selections
        this.updateMockup();
        this.updateSummary();
    }
    
    populatePositionSelector() {
        const positionSelector = document.getElementById('positionSelector');
        if (!positionSelector) return;
        
        const positions = this.productPositions[this.selectedProduct];
        
        // Clear existing buttons
        positionSelector.innerHTML = '';
        
        // Create position buttons
        positions.forEach((pos, index) => {
            const btn = document.createElement('button');
            btn.className = 'position-btn' + (index === 0 ? ' active' : '');
            btn.dataset.position = pos.id;
            btn.innerHTML = `
                <span class="position-icon">${pos.icon}</span>
                <span class="position-name">${pos.name}</span>
            `;
            btn.addEventListener('click', () => this.handlePositionChange(btn));
            positionSelector.appendChild(btn);
        });
        
        // Set default position
        if (positions.length > 0) {
            this.selectedPosition = positions[0].id;
        }
    }
    
    handlePositionChange(btn) {
        // Remove active from all position buttons
        document.querySelectorAll('.position-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        this.selectedPosition = btn.dataset.position;
        this.updateMockupPosition();
    }
    
    updateMockupPosition() {
        // Update pixel art position on mockup using CSS classes + dynamic config
        const overlay = document.getElementById('mockupOverlay');
        const overlayImg = document.getElementById('mockupPixelArt');
        if (!overlay || !overlayImg) return;
        
        // Get print area config from MOCKUP_CONFIG
        const productConfig = window.MOCKUP_CONFIG?.[this.selectedProduct];
        if (!productConfig) {
            console.error('❌ No mockup config found for product:', this.selectedProduct);
            return;
        }
        
        const printArea = productConfig.printAreas[this.selectedPosition];
        if (!printArea) {
            console.error('❌ No print area config found for position:', this.selectedPosition);
            return;
        }
        
        // Apply dynamic positioning from config
        overlay.style.top = `${printArea.top}%`;
        overlay.style.left = `${printArea.left}%`;
        overlay.style.width = `${printArea.width}%`;
        overlay.style.maxWidth = `${printArea.maxWidth}px`;
        overlay.style.transform = printArea.transform;
        
        // Ensure pixel art is visible if we have a result
        if (this.pixelArtResult) {
            overlayImg.src = this.pixelArtResult;
            overlay.style.display = 'block';
            console.log(`✅ Position updated: ${this.selectedPosition} (${printArea.view} view)`);
            console.log(`   Config: top=${printArea.top}%, left=${printArea.left}%, width=${printArea.width}%`);
        } else {
            overlay.style.display = 'none';
            console.log(`📍 Position set: ${this.selectedPosition} (no pixel art yet)`);
        }
    }
    
    handleViewChange(btn) {
        this.viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const view = btn.dataset.view;
        // In production, this would change the mockup angle
        console.log('View changed to:', view);
    }
    
    handleProductTypeChange(btn) {
        this.typeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        this.selectedProduct = btn.dataset.type;
        
        // Re-populate position selector for new product
        this.populatePositionSelector();
        
        this.updateMockup();
        this.updateSummary();
    }
    
    handleColorChange(btn) {
        this.colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        this.selectedColor = btn.dataset.color;
        this.selectedColorLabel.textContent = this.colorNames[this.selectedColor];
        this.updateMockup();
        this.updateSummary();
    }
    
    handleSizeChange(btn) {
        this.sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        this.selectedSize = btn.dataset.size;
        this.updateSummary();
    }
    
    updateMockup() {
        // Determine view based on position
        const view = this.getViewForPosition(this.selectedPosition);
        const mockupUrl = this.getMockupUrl(view);
        this.mockupImage.src = mockupUrl;
        
        // Update position overlay class
        this.updateMockupPosition();
    }
    
    getViewForPosition(position) {
        // Kol pozisyonları için yan görünüm
        if (position === 'left-arm' || position === 'right-arm') {
            return position === 'left-arm' ? 'side-left' : 'side-right';
        }
        // Göğüs pozisyonları için ön görünüm
        return 'front';
    }
    
    getMockupUrl(view = 'front') {
        // Color hex values
        const colors = {
            black: '#1a1a1a',
            white: '#f5f5f5',
            navy: '#1e3a5f',
            gray: '#4a4a4a',
            red: '#c41e3a'
        };
        
        const color = colors[this.selectedColor] || '#1a1a1a';
        
        // Product labels
        const productLabels = {
            tshirt: view === 'front' ? 'Tişört (Ön)' : view === 'side-left' ? 'Tişört (Sol)' : 'Tişört (Sağ)',
            sweatshirt: view === 'front' ? 'Sweatshirt (Ön)' : view === 'side-left' ? 'Sweatshirt (Sol)' : 'Sweatshirt (Sağ)',
            hat: view === 'front' ? 'Şapka (Ön)' : 'Şapka (Yan)'
        };
        
        const label = productLabels[this.selectedProduct] || 'Ürün';
        
        // Generate SVG mockup
        return this.generateMockupSVG(color, label, view);
    }
    
    generateMockupSVG(color, label, view) {
        // Create SVG mockup based on view
        const svg = view === 'front' || view === undefined 
            ? this.generateFrontViewSVG(color, label)
            : this.generateSideViewSVG(color, label, view);
        
        // Convert to data URL
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }
    
    generateFrontViewSVG(color, label) {
        return `<svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <!-- Fabric texture pattern -->
                <pattern id="fabric" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                    <rect width="4" height="4" fill="${color}"/>
                    <circle cx="1" cy="1" r="0.3" fill="${this.darkenColor(color, 3)}" opacity="0.3"/>
                    <circle cx="3" cy="3" r="0.3" fill="${this.darkenColor(color, 3)}" opacity="0.3"/>
                </pattern>
                
                <!-- Realistic gradient for depth -->
                <linearGradient id="bodyGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" style="stop-color:${this.lightenColor(color, 10)};stop-opacity:1" />
                    <stop offset="40%" style="stop-color:${color};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${this.darkenColor(color, 15)};stop-opacity:1" />
                </linearGradient>
                
                <!-- Subtle shadow -->
                <filter id="softShadow">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                    <feOffset dx="0" dy="2" result="offsetblur"/>
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3"/>
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            
            <!-- Clean background -->
            <rect width="800" height="1000" fill="#f5f5f7"/>
            
            <!-- T-Shirt body (realistic proportions) -->
            <path d="M 250 200 
                     L 200 250 
                     L 200 700 
                     Q 200 720 220 720
                     L 580 720
                     Q 600 720 600 700
                     L 600 250
                     L 550 200
                     L 520 240
                     Q 400 260 280 240
                     Z" 
                  fill="url(#bodyGrad)" 
                  stroke="#ddd" 
                  stroke-width="2"
                  filter="url(#softShadow)"/>
            
            <!-- Sleeves (short sleeves) -->
            <path d="M 200 250 L 150 320 L 180 380 L 200 350 Z" 
                  fill="${this.darkenColor(color, 10)}" 
                  stroke="#ddd" 
                  stroke-width="1"/>
            <path d="M 600 250 L 650 320 L 620 380 L 600 350 Z" 
                  fill="${this.darkenColor(color, 10)}" 
                  stroke="#ddd" 
                  stroke-width="1"/>
            
            <!-- Collar (crew neck) -->
            <ellipse cx="400" cy="210" rx="45" ry="22" 
                     fill="${this.darkenColor(color, 20)}" 
                     stroke="#ddd" 
                     stroke-width="1"/>
            <ellipse cx="400" cy="210" rx="35" ry="16" 
                     fill="#f5f5f7"/>
            
            <!-- Subtle seam lines -->
            <line x1="400" y1="240" x2="400" y2="720" 
                  stroke="${this.darkenColor(color, 5)}" 
                  stroke-width="1" 
                  opacity="0.3"/>
            
            <!-- Label tag (inside collar) -->
            <rect x="385" y="215" width="30" height="12" 
                  fill="#fff" 
                  stroke="#ccc" 
                  stroke-width="0.5" 
                  rx="1"/>
            <text x="400" y="223" 
                  font-family="Arial, sans-serif" 
                  font-size="6" 
                  fill="#999" 
                  text-anchor="middle">8BitWear</text>
            
            <!-- Product label at bottom -->
            <text x="400" y="950" 
                  font-family="Arial, sans-serif" 
                  font-size="18" 
                  fill="#999" 
                  text-anchor="middle">${label}</text>
        </svg>`;
    }
    
    lightenColor(hex, percent) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Parse RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Lighten
        const factor = (100 + percent) / 100;
        const newR = Math.min(255, Math.round(r * factor));
        const newG = Math.min(255, Math.round(g * factor));
        const newB = Math.min(255, Math.round(b * factor));
        
        // Convert back to hex
        return '#' + 
               newR.toString(16).padStart(2, '0') +
               newG.toString(16).padStart(2, '0') +
               newB.toString(16).padStart(2, '0');
    }
    
    generateSideViewSVG(color, label, view) {
        const isLeft = view === 'side-left';
        return `<svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="sideGrad" x1="${isLeft ? '0%' : '100%'}" y1="0%" x2="${isLeft ? '100%' : '0%'}" y2="0%">
                    <stop offset="0%" style="stop-color:${this.darkenColor(color, 20)};stop-opacity:1" />
                    <stop offset="50%" style="stop-color:${color};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${this.lightenColor(color, 10)};stop-opacity:1" />
                </linearGradient>
                <filter id="softShadow2">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                    <feOffset dx="${isLeft ? '2' : '-2'}" dy="2" result="offsetblur"/>
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3"/>
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            
            <!-- Clean background -->
            <rect width="800" height="1000" fill="#f5f5f7"/>
            
            <!-- T-Shirt side view -->
            ${isLeft 
                ? `<path d="M 300 200 L 250 250 L 230 300 L 230 680 L 250 720 L 550 720 L 570 680 L 570 300 L 550 250 Z" 
                        fill="url(#sideGrad)" stroke="#ddd" stroke-width="2" filter="url(#softShadow2)"/>`
                : `<path d="M 500 200 L 550 250 L 570 300 L 570 680 L 550 720 L 250 720 L 230 680 L 230 300 L 250 250 Z" 
                        fill="url(#sideGrad)" stroke="#ddd" stroke-width="2" filter="url(#softShadow2)"/>`
            }
            
            <!-- Sleeve (prominent) -->
            ${isLeft
                ? `<ellipse cx="235" cy="400" rx="80" ry="140" fill="${this.darkenColor(color, 15)}" stroke="#ddd" stroke-width="2" opacity="0.9"/>`
                : `<ellipse cx="565" cy="400" rx="80" ry="140" fill="${this.darkenColor(color, 15)}" stroke="#ddd" stroke-width="2" opacity="0.9"/>`
            }
            
            <!-- Collar hint -->
            ${isLeft
                ? `<path d="M 520 210 Q 540 220 550 240" stroke="${this.darkenColor(color, 30)}" stroke-width="2" fill="none"/>`
                : `<path d="M 280 210 Q 260 220 250 240" stroke="${this.darkenColor(color, 30)}" stroke-width="2" fill="none"/>`
            }
            
            <!-- Product label -->
            <text x="400" y="950" font-family="Arial, sans-serif" font-size="18" fill="#999" text-anchor="middle">${label}</text>
        </svg>`;
    }
    
    darkenColor(hex, percent) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Parse RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Darken
        const factor = (100 - percent) / 100;
        const newR = Math.round(r * factor);
        const newG = Math.round(g * factor);
        const newB = Math.round(b * factor);
        
        // Convert back to hex
        return '#' + 
               newR.toString(16).padStart(2, '0') +
               newG.toString(16).padStart(2, '0') +
               newB.toString(16).padStart(2, '0');
    }
    
    updateSummary() {
        const productName = this.selectedProduct === 'tshirt' ? 'Tişört' : 
                           this.selectedProduct === 'sweatshirt' ? 'Sweatshirt' : 'Şapka';
        const colorName = this.colorNames[this.selectedColor];
        const price = this.prices[this.selectedProduct];
        
        // Get current position name
        const positions = this.productPositions[this.selectedProduct];
        const currentPos = positions.find(p => p.id === this.selectedPosition);
        const posName = currentPos ? currentPos.name : '';
        
        // Update label
        const posLabel = document.getElementById('selectedPosition');
        if (posLabel) {
            posLabel.textContent = posName;
        }
        
        this.summaryProduct.textContent = `${productName} - ${colorName} - ${this.selectedSize}`;
        this.summaryPrice.textContent = `₺${price.toLocaleString('tr-TR')}`;
    }
    
    // ==========================================
    // Step 4: Checkout
    // ==========================================
    
    updateCheckout() {
        const productName = this.selectedProduct === 'tshirt' ? 'Pixel Art Tişört' : 'Pixel Art Sweatshirt';
        const colorName = this.colorNames[this.selectedColor];
        const price = this.prices[this.selectedProduct];
        
        this.checkoutProductName.textContent = productName;
        this.checkoutProductOptions.textContent = `${colorName} • ${this.selectedSize} Beden`;
        this.checkoutProductPrice.textContent = `₺${price.toLocaleString('tr-TR')}`;
        this.checkoutTotal.textContent = `₺${price.toLocaleString('tr-TR')}`;
        
        // Set mockup image
        this.checkoutMockup.src = this.getMockupUrl();
        
        // Reset consent
        this.consentCheckbox.checked = false;
        this.updateCheckoutButton();
    }
    
    updateCheckoutButton() {
        this.btnCompleteOrder.disabled = !this.consentCheckbox.checked;
    }
    
    async handleCompleteOrder() {
        // Validate customer form
        const form = document.getElementById('customerForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Get customer data
        const customerName = document.getElementById('customerName').value.trim();
        const customerEmail = document.getElementById('customerEmail').value.trim();
        const customerPhone = document.getElementById('customerPhone').value.trim();
        const customerAddress = document.getElementById('customerAddress').value.trim();
        
        // Validate required fields
        if (!customerName || !customerEmail || !customerPhone || !customerAddress) {
            alert('⚠️ Lütfen tüm alanları doldurun.');
            return;
        }
        
        // Validate pixel art result
        if (!this.pixelArtResult) {
            alert('⚠️ Pixel art oluşturulmamış. Lütfen önce tasarımınızı oluşturun.');
            return;
        }
        
        // Prepare order data
        const orderData = {
            orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            orderDate: new Date().toISOString(),
            customerName: customerName,
            customerEmail: customerEmail,
            customerPhone: customerPhone,
            customerAddress: customerAddress,
            productType: this.selectedProduct,
            productColor: this.selectedColor,
            productSize: this.selectedSize,
            productPosition: this.selectedPosition,
            pixelArtImage: this.pixelArtResult, // base64 data URL
            totalPrice: this.prices[this.selectedProduct]
        };
        
        console.log('📦 Sending order to n8n...', {
            ...orderData,
            pixelArtImage: orderData.pixelArtImage.substring(0, 100) + '...' // Log preview only
        });
        
        // Disable button during submission
        this.btnCompleteOrder.disabled = true;
        this.btnCompleteOrder.innerHTML = '<span class="btn-icon">⏳</span> Gönderiliyor...';
        
        try {
            // HYBRID MODEL: Create product in Shopify and redirect to checkout
            console.log('🛍️ Creating Shopify product...');
            this.btnCompleteOrder.innerHTML = '<span class="btn-icon">🛍️</span> Shopify\'a Yükleniyor...';
            
            // Create product in Shopify
            const shopifyProduct = await window.shopifyAPI.createProduct({
                title: `Custom ${this.selectedProduct} - ${orderData.orderId}`,
                productType: this.selectedProduct,
                productColor: this.selectedColor,
                productSize: this.selectedSize,
                productPosition: this.selectedPosition,
                pixelArtImage: this.pixelArtResult,
                price: this.prices[this.selectedProduct]
            });
            
            console.log('✅ Shopify product created:', shopifyProduct);
            
            // Extract pixel art URL from Shopify product images
            const pixelArtUrl = shopifyProduct.images && shopifyProduct.images.length > 0 
                ? shopifyProduct.images[0].src 
                : '';
            
            // Also send to Make.com webhook for tracking
            const orderWebhookUrl = window.WIZARD_CONFIG?.N8N_ORDER_WEBHOOK_URL || CONFIG.N8N_ORDER_WEBHOOK_URL;
            console.log('📊 Sending tracking data to Make.com...');
            console.log('📍 Webhook URL:', orderWebhookUrl);
            
            // Prepare webhook data (without base64 image, use Shopify URL instead)
            const webhookData = {
                orderId: orderData.orderId,
                orderDate: orderData.orderDate,
                customerName: orderData.customerName,
                customerEmail: orderData.customerEmail,
                customerPhone: orderData.customerPhone,
                customerAddress: orderData.customerAddress,
                productType: orderData.productType,
                productColor: orderData.productColor,
                productSize: orderData.productSize,
                productPosition: orderData.productPosition,
                totalPrice: orderData.totalPrice,
                pixelArtUrl: pixelArtUrl,
                shopifyProductId: shopifyProduct.id,
                shopifyProductUrl: `https://${window.SHOPIFY_CONFIG.STORE_URL}/products/${shopifyProduct.handle}`
            };
            
            console.log('📦 Data being sent:', webhookData);
            
            const webhookResponse = await fetch(orderWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(webhookData)
            });
            
            console.log('📊 Webhook response status:', webhookResponse.status);
            if (webhookResponse.ok) {
                const webhookData = await webhookResponse.text();
                console.log('✅ Tracking data sent to Make.com successfully!');
                console.log('📊 Response:', webhookData);
            } else {
                console.warn('⚠️ Webhook returned non-OK status:', webhookResponse.status);
            }
            
            // Redirect to Shopify product page for checkout
            const checkoutUrl = `https://${window.SHOPIFY_CONFIG.STORE_URL}/products/${shopifyProduct.handle}`;
            
            alert(`🎉 Tasarımınız Hazır!\n\nŞimdi Shopify'a yönlendiriliyorsunuz.\nÖdeme işlemini tamamlayarak siparişinizi verebilirsiniz.\n\nSipariş No: ${orderData.orderId}`);
            
            // Redirect to Shopify checkout
            window.location.href = checkoutUrl;
            return;
        } catch (error) {
            console.error('❌ Shopify integration error:', error);
            
            alert(`❌ Hata Oluştu\n\nShopify entegrasyonunda bir sorun oluştu.\nLütfen tekrar deneyin.\n\nHata: ${error.message}`);
            
            // Re-enable button
            this.btnCompleteOrder.disabled = false;
            this.btnCompleteOrder.innerHTML = '<span class="btn-icon">🎮</span> Siparişi Tamamla';
        }
    }
    
    // ==========================================
    // OpenAI Image Edit Integration
    // ==========================================
    
    async openaiPixelArt() {
        console.log('🚀 OpenAI Image Edit başladı...');
        this.isProcessing = true;
        this.loadingBar.style.width = '10%';
        this.updateLoadingText('🎨 OpenAI Image Edit API\'ya bağlanılıyor...');
        
        try {
            if (!this.uploadedImageBase64) {
                throw new Error('Görsel yüklenemedi. Lütfen tekrar deneyin.');
            }
            
            this.loadingBar.style.width = '30%';
            this.updateLoadingText('🎨 Pixel art oluşturuluyor... (OpenAI gpt-image-1)');
            
            // Convert base64 string to blob
            const byteCharacters = atob(this.uploadedImageBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: this.uploadedImageMimeType || 'image/jpeg' });
            
            console.log('✅ Blob created:', blob.size, 'bytes, type:', blob.type);
            
            // Select random prompt variant
            const prompts = window.WIZARD_CONFIG.LEONARDO_CONFIG.prompts || [window.WIZARD_CONFIG.LEONARDO_CONFIG.prompt];
            if (!prompts || prompts.length === 0) {
                throw new Error('No prompt configuration found');
            }
            const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];
            console.log(`🎲 Selected prompt variant: ${prompts.indexOf(selectedPrompt) + 1}/${prompts.length}`);
            
            // 🎯 CRITICAL: Add T-SHIRT PRINT MODE override
            const productType = this.selectedProduct || 'tshirt';
            const isTshirtOrSweatshirt = productType === 'tshirt' || productType === 'sweatshirt';
            
            let finalPrompt = selectedPrompt;
            
            if (isTshirtOrSweatshirt) {
                // T-SHIRT/SWEATSHIRT PRINT MODE
                finalPrompt = `Create a pixel art character from the photo with these requirements:

STYLE:
- Retro pixel art (8-bit/16-bit style)
- Chunky pixels, simplified shapes
- Flat colors (6-8 colors max)
- Black outlines

LAYOUT FOR T-SHIRT PRINTING:
- Center the character in a square transparent canvas
- Leave 25% transparent padding on all sides
- Character should be 40-50% of canvas
- Completely transparent background (no white, no colors)
- Suitable for DTG/DTF printing

OUTPUT:
- PNG with alpha channel
- Print-safe layout
- Die-cut friendly silhouette`;
                
                console.log('👕 T-SHIRT PRINT MODE ACTIVATED (Safe prompt)');
            } else {
                // HAT/PATCH MODE (original behavior)
                console.log('🧢 PATCH MODE (original)');
            }
            
            console.log('📝 Final prompt:', finalPrompt.substring(0, 100) + '...');
            
            // Create FormData
            const formData = new FormData();
            const extension = blob.type.includes('png') ? 'png' : 'jpg';
            const file = new File([blob], `image.${extension}`, { type: blob.type });
            formData.append('file', file);
            formData.append('prompt', finalPrompt);
            formData.append('target_size', '512x512'); // 512x512 for 3D printing (5cm patch)
            
            console.log('📤 Sending to OpenAI backend...');
            
            const openaiProxyUrl = CONFIG.OPENAI_PROXY_URL;
            console.log('🔗 OpenAI Proxy URL:', openaiProxyUrl);
            
            // Call OpenAI backend
            const response = await fetch(`${openaiProxyUrl}/api/openai/edit`, {
                method: 'POST',
                body: formData,
            });
            
            this.loadingBar.style.width = '80%';
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            console.log('📊 OpenAI backend response:', result);
            
            if (!result.success || !result.image_data_url) {
                throw new Error('OpenAI did not return image');
            }
            
            this.loadingBar.style.width = '100%';
            this.updateLoadingText('✅ Tamamlandı!');
            
            // Store result
            this.pixelArtResult = result.image_data_url;
            console.log('✅ OpenAI pixel art complete!');
            console.log('📊 Result data URL length:', this.pixelArtResult.length);
            console.log('📊 Output size:', result.size || 'unknown');
            
            // DON'T auto-proceed - stay on conversion step to allow "Tekrar Oluştur"
            this.isProcessing = false;
            this.showResultOptions();
            
        } catch (error) {
            console.error('❌ OpenAI error:', error);
            this.isProcessing = false;
            this.updateLoadingText('❌ Hata oluştu');
            
            setTimeout(() => {
                const errorMsg = error.message || 'OpenAI bağlantı hatası';
                alert('Hata: ' + errorMsg + '\n\nLütfen tekrar deneyin.');
                this.goToStep(1);
            }, 1000);
        } finally {
            this.loadingBar.style.width = '0%';
        }
    }
    
    // ==========================================
    // Google Gemini Integration (Nano Banana)
    // ==========================================
    
    async geminiPixelArt() {
        console.log('🚀 Google Gemini - Nano Banana başladı...');
        this.isProcessing = true;
        this.loadingBar.style.width = '10%';
        this.updateLoadingText('🍌 Nano Banana\'ya bağlanılıyor...');
        
        try {
            if (!this.uploadedImageBase64) {
                throw new Error('Görsel yüklenemedi. Lütfen tekrar deneyin.');
            }
            
            this.loadingBar.style.width = '30%';
            this.updateLoadingText('🎨 Pixel art oluşturuluyor... (Gemini 2.5 Flash)');
            
            // Convert base64 string to blob (uploadedImageBase64 is base64 without data URL prefix)
            const byteCharacters = atob(this.uploadedImageBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: this.uploadedImageMimeType || 'image/jpeg' });
            
            console.log('✅ Blob created:', blob.size, 'bytes, type:', blob.type);
            
            // Select random prompt variant for variety (with fallback for backward compatibility)
            const prompts = window.WIZARD_CONFIG.LEONARDO_CONFIG.prompts || [window.WIZARD_CONFIG.LEONARDO_CONFIG.prompt];
            if (!prompts || prompts.length === 0) {
                throw new Error('No prompt configuration found');
            }
            const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];
            console.log(`🎲 Selected prompt variant: ${prompts.indexOf(selectedPrompt) + 1}/${prompts.length}`);
            
            // Create FormData
            const formData = new FormData();
            const extension = blob.type.includes('png') ? 'png' : 'jpg';
            const file = new File([blob], `image.${extension}`, { type: blob.type });
            formData.append('file', file);
            formData.append('prompt', selectedPrompt);
            formData.append('negative_prompt', window.WIZARD_CONFIG.LEONARDO_CONFIG.negative_prompt);
            
            console.log('📤 Sending to Gemini backend...');
            
            const geminiProxyUrl = CONFIG.GEMINI_PROXY_URL;
            console.log('🔗 Gemini Proxy URL:', geminiProxyUrl);
            
            // Call Gemini backend
            const response = await fetch(`${geminiProxyUrl}/api/gemini/generate`, {
                method: 'POST',
                body: formData,
            });
            
            this.loadingBar.style.width = '80%';
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            console.log('📊 Gemini backend response:', result);
            
            if (!result.success || !result.image_data_url) {
                throw new Error('Gemini did not return image');
            }
            
            this.loadingBar.style.width = '100%';
            this.updateLoadingText('✅ Tamamlandı!');
            
            // Store result
            this.pixelArtResult = result.image_data_url;
            console.log('✅ Nano Banana pixel art complete!');
            console.log('📊 Result data URL length:', this.pixelArtResult.length);
            console.log('📊 First 150 chars:', this.pixelArtResult.substring(0, 150));
            console.log('📊 Image hash (quick check):', this.pixelArtResult.substring(50, 100));
            
            // Verify it's different from input
            if (this.uploadedImage && this.pixelArtResult === this.uploadedImage) {
                console.error('❌ CRITICAL: Output is SAME as input!');
                alert('HATA: Çıktı input ile aynı! Backend problemi olabilir.');
            } else {
                console.log('✅ Output is DIFFERENT from input (good!)');
            }
            
            // DON'T auto-proceed - stay on conversion step to allow "Tekrar Oluştur"
            this.isProcessing = false;
            this.showResultOptions();
            
        } catch (error) {
            console.error('❌ Gemini error:', error);
            this.isProcessing = false;
            this.updateLoadingText('❌ Hata oluştu');
            
            setTimeout(() => {
                const errorMsg = error.message || 'Gemini bağlantı hatası';
                alert('Hata: ' + errorMsg + '\n\nLütfen tekrar deneyin.');
                this.goToStep(1);
            }, 1000);
        } finally {
            this.loadingBar.style.width = '0%';
        }
    }
    
    async leonardoPixelArt() {
        console.log('🚀 Leonardo AI - FLUX.1 Kontext başladı...');
        this.isProcessing = true;
        this.loadingBar.style.width = '10%';
        this.updateLoadingText('Leonardo AI\'ya bağlanılıyor...');
        
        try {
            // Step 1: Upload init image to Leonardo
            this.updateLoadingText('📤 Görsel yükleniyor...');
            const initImageId = await this.uploadToLeonardo();
            console.log('✅ Init image uploaded:', initImageId);
            
            this.loadingBar.style.width = '30%';
            
            // Step 2: Start generation
            this.updateLoadingText('🎨 Cartoon pixel art oluşturuluyor... (30-60 saniye)');
            const generationId = await this.createLeonardoGeneration(initImageId);
            console.log('✅ Generation started:', generationId);
            
            this.loadingBar.style.width = '50%';
            
            // Step 3: Poll for result
            this.updateLoadingText('⏳ AI işliyor...');
            const resultUrl = await this.pollLeonardoGeneration(generationId);
            console.log('✅ Generation complete:', resultUrl);
            
            this.loadingBar.style.width = '90%';
            
            // Step 4: Download and display
            this.updateLoadingText('📥 Sonuç indiriliyor...');
            const pixelArtDataUrl = await this.downloadImage(resultUrl);
            
            this.loadingBar.style.width = '100%';
            this.updateLoadingText('✅ Tamamlandı!');
            
            // Store result with timestamp to prevent cache
            this.pixelArtResult = pixelArtDataUrl;
            console.log('✅ New pixel art result stored:', pixelArtDataUrl.substring(0, 100));
            
            // Auto-proceed to next step after brief delay
            setTimeout(() => {
                this.isProcessing = false;
                // Go to Step 3 (Preview) - we're already on Step 2 (Convert)
                this.goToStep(3);
            }, 800);
            
        } catch (error) {
            console.error('❌ Leonardo AI error:', error);
            this.isProcessing = false;
            this.updateLoadingText('❌ Hata oluştu');
            
            setTimeout(() => {
                const errorMsg = error.message || 'Leonardo AI bağlantı hatası';
                alert('Hata: ' + errorMsg + '\\n\\nLütfen tekrar deneyin.');
                this.goToStep(1);
            }, 1000);
        }
    }
    
    async uploadToLeonardo() {
        // Upload via backend proxy (fixes CORS issue)
        const proxyUrl = `${CONFIG.LEONARDO_PROXY_URL}/api/leonardo/upload`;
        
        // Convert data URL to blob
        const response = await fetch(this.uploadedImage);
        const blob = await response.blob();
        
        // Get file extension
        const extension = blob.type.includes('png') ? 'png' : 'jpg';
        const filename = `upload.${extension}`;
        
        // Create FormData for backend
        const formData = new FormData();
        const file = new File([blob], filename, { type: blob.type });
        formData.append('file', file);
        
        console.log('📤 Uploading to backend proxy...');
        
        // Upload via backend (no CORS issue)
        const uploadResponse = await fetch(proxyUrl, {
            method: 'POST',
            body: formData
        });
        
        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(`Upload failed: ${errorData.detail || uploadResponse.statusText}`);
        }
        
        const result = await uploadResponse.json();
        console.log('✅ Upload successful:', result.upload_id);
        
        // Wait for Leonardo to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return result.upload_id;
    }
    
    async createLeonardoGeneration(initImageId) {
        // Use backend proxy
        const proxyUrl = `${CONFIG.LEONARDO_PROXY_URL}/api/leonardo/generate`;
        
        const payload = {
            init_image_id: initImageId,
            prompt: CONFIG.LEONARDO_CONFIG.prompt,
            negative_prompt: CONFIG.LEONARDO_CONFIG.negative_prompt,
            init_strength: CONFIG.LEONARDO_CONFIG.init_strength,
            guidance_scale: CONFIG.LEONARDO_CONFIG.guidance_scale
        };
        
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Generation failed: ${errorData.detail || response.statusText}`);
        }
        
        const result = await response.json();
        return result.generation_id;
    }
    
    async pollLeonardoGeneration(generationId) {
        // Use backend proxy
        const proxyUrl = `${CONFIG.LEONARDO_PROXY_URL}/api/leonardo/status/${generationId}`;
        const maxAttempts = 60;
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between polls
            
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Polling failed: ${errorData.detail || response.statusText}`);
            }
            
            const data = await response.json();
            const status = data.status;
            
            console.log(`📊 [${attempt + 1}/${maxAttempts}] Status: ${status}`);
            
            if (status === 'COMPLETE') {
                if (data.image_url) {
                    console.log('🎨 Leonardo generation COMPLETE!');
                    console.log('🖼️ Image URL:', data.image_url);
                    return data.image_url;
                }
                throw new Error('No images generated');
            } else if (status === 'FAILED') {
                throw new Error('Generation failed');
            }
            
            // Update progress bar
            const progress = 50 + (attempt / maxAttempts) * 40;
            this.loadingBar.style.width = `${progress}%`;
        }
        
        throw new Error('Generation timeout');
    }
    
    async downloadImage(url) {
        // Add cache busting to prevent browser/CDN cache
        const cacheBustUrl = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
        
        console.log('📥 Downloading image from:', url);
        console.log('🔄 Cache-bust URL:', cacheBustUrl);
        
        const response = await fetch(cacheBustUrl, {
            cache: 'no-store',  // Force no cache
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        const blob = await response.blob();
        console.log('✅ Image downloaded, size:', blob.size, 'bytes');
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log('✅ Image converted to data URL, length:', reader.result.length);
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
    
    // ==========================================
    // Utility Functions
    // ==========================================
    
    showError(message) {
        // Simple error display - can be enhanced with better UI
        alert('⚠️ ' + message);
    }
}

// Initialize wizard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.pixelWizard = new PixelWizard();
    
    // Log configuration
    console.log('🎮 8BitWear Wizard Initialized');
    console.log('📍 Webhook URL:', CONFIG.N8N_WEBHOOK_URL);
    console.log('🎯 Demo Mode:', CONFIG.DEMO_MODE ? 'ON' : 'OFF');
});
