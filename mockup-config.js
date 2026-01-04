// Mockup Configuration
// Bu dosya her urun tipi icin print alani koordinatlarini tanimlar

window.MOCKUP_CONFIG = {
    // T-Shirt mockup configurations
    tshirt: {
        // Her renk icin mockup image path (su anda SVG kullaniyoruz)
        colors: {
            black: { front: 'svg', sideLeft: 'svg', sideRight: 'svg' },
            white: { front: 'svg', sideLeft: 'svg', sideRight: 'svg' },
            navy: { front: 'svg', sideLeft: 'svg', sideRight: 'svg' },
            gray: { front: 'svg', sideLeft: 'svg', sideRight: 'svg' },
            red: { front: 'svg', sideLeft: 'svg', sideRight: 'svg' }
        },
        
        // Print areas as percentage of mockup dimensions
        printAreas: {
            'center-chest': {
                view: 'front',
                // Position as % of mockup dimensions
                top: 42,     // % from top
                left: 50,    // % from left
                width: 20,   // % width
                maxWidth: 200, // max pixels
                transform: 'translate(-50%, -50%)' // CSS transform
            },
            'left-chest': {
                view: 'front',
                top: 28,
                left: 68,  // T-shirt's left = screen right
                width: 10,
                maxWidth: 80,
                transform: 'translate(-50%, -50%)'
            },
            'left-arm': {
                view: 'side-left',
                top: 45,
                left: 20,
                width: 15,
                maxWidth: 120,
                transform: 'translate(-50%, -50%)'
            },
            'right-arm': {
                view: 'side-right',
                top: 45,
                left: 80,
                width: 15,
                maxWidth: 120,
                transform: 'translate(-50%, -50%)'
            }
        }
    },
    
    // Sweatshirt (same as t-shirt for now)
    sweatshirt: {
        colors: {
            black: { front: 'svg', sideLeft: 'svg', sideRight: 'svg' },
            white: { front: 'svg', sideLeft: 'svg', sideRight: 'svg' },
            navy: { front: 'svg', sideLeft: 'svg', sideRight: 'svg' },
            gray: { front: 'svg', sideLeft: 'svg', sideRight: 'svg' },
            red: { front: 'svg', sideLeft: 'svg', sideRight: 'svg' }
        },
        printAreas: {
            'center-chest': {
                view: 'front',
                top: 42,
                left: 50,
                width: 20,
                maxWidth: 200,
                transform: 'translate(-50%, -50%)'
            },
            'left-chest': {
                view: 'front',
                top: 28,
                left: 68,
                width: 10,
                maxWidth: 80,
                transform: 'translate(-50%, -50%)'
            },
            'left-arm': {
                view: 'side-left',
                top: 45,
                left: 20,
                width: 15,
                maxWidth: 120,
                transform: 'translate(-50%, -50%)'
            },
            'right-arm': {
                view: 'side-right',
                top: 45,
                left: 80,
                width: 15,
                maxWidth: 120,
                transform: 'translate(-50%, -50%)'
            }
        }
    },
    
    // Hat mockup
    hat: {
        colors: {
            black: { front: 'svg', side: 'svg' },
            white: { front: 'svg', side: 'svg' },
            navy: { front: 'svg', side: 'svg' },
            gray: { front: 'svg', side: 'svg' },
            red: { front: 'svg', side: 'svg' }
        },
        printAreas: {
            'front': {
                view: 'front',
                top: 45,
                left: 50,
                width: 25,
                maxWidth: 150,
                transform: 'translate(-50%, -50%)'
            },
            'side': {
                view: 'side',
                top: 45,
                left: 65,
                width: 20,
                maxWidth: 100,
                transform: 'translate(-50%, -50%)'
            }
        }
    }
};

// Export for use in wizard.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MOCKUP_CONFIG;
}

