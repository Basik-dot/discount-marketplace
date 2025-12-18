// State Management
let isDarkMode = false;
let currency = 'KES'; // Default currency for Kenya
let productsData = [];

// DOM Elements
const darkModeToggle = document.getElementById('darkModeToggle');
const currencyToggle = document.getElementById('currencyToggle');
const currencyText = document.getElementById('currencyText');
const hotProductsGrid = document.getElementById('hotProducts');
const electronicsGrid = document.getElementById('electronics');
const fashionGrid = document.getElementById('fashion');
const homeGrid = document.getElementById('home');
const ctaButton = document.querySelector('.cta-button');
const subscribeBtn = document.getElementById('subscribeBtn');
const newsletterEmail = document.getElementById('newsletterEmail');

// Format currency for display
function formatCurrency(amount, currencyType) {
    if (currencyType === 'KES') {
        return `KSh ${amount.toLocaleString('en-KE')}`;
    } else {
        // Convert KES to USD (approximate rate: 1 USD = 130 KES)
        const usdAmount = amount / 130;
        return `$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
}

// Calculate discounted price
function calculateDiscountedPrice(originalPrice, discount) {
    return originalPrice * (1 - discount / 100);
}

// Create product card HTML
function createProductCard(product) {
    const discountedPrice = calculateDiscountedPrice(product.original_price, product.discount_percentage);
    const originalPriceDisplay = formatCurrency(product.original_price, currency);
    const discountedPriceDisplay = formatCurrency(discountedPrice, currency);
    
    return `
        <div class="product-card" data-id="${product.product_id}">
            <div class="product-img" style="background-image: url('${product.image_url}')"></div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="rating">
                    ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5-Math.floor(product.rating))}
                    <span style="color: var(--text-light); font-size: 0.8rem; margin-left: 5px;">${product.rating}</span>
                </div>
                <div class="price">
                    <span class="old-price">${originalPriceDisplay}</span>
                    <span class="new-price">${discountedPriceDisplay}</span>
                    <span class="discount-badge">${product.discount_percentage}% OFF</span>
                </div>
                <button class="add-to-cart" data-id="${product.product_id}">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
}

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        productsData = await response.json();
        
        // Categorize products
        const electronics = productsData.filter(p => p.category === 'Electronics');
        const fashion = productsData.filter(p => p.category === 'Fashion');
        const home = productsData.filter(p => p.category === 'Home');
        
        // Get top 4 from each category for hot products
        const hotProducts = [...electronics.slice(0, 2), ...fashion.slice(0, 1), ...home.slice(0, 1)];
        
        // Render products
        renderProducts(hotProducts, hotProductsGrid);
        renderProducts(electronics, electronicsGrid);
        renderProducts(fashion, fashionGrid);
        renderProducts(home, homeGrid);
        
    } catch (error) {
        console.error('Failed to load products from API:', error);
        // Fallback to static demo data
        loadDemoProducts();
    }
}

// Load demo products (fallback)
function loadDemoProducts() {
    const demoProducts = [
        {
            product_id: 'elec_001',
            title: 'iPhone 15 Pro Max',
            description: '6.7" Super Retina XDR, A17 Pro chip, 48MP camera',
            category: 'Electronics',
            original_price: 159999,
            discount_percentage: 13,
            image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&h=200&fit=crop',
            rating: 4.8
        },
        {
            product_id: 'elec_002',
            title: 'Samsung Galaxy S24 Ultra',
            description: '200MP camera, S Pen included, Snapdragon 8 Gen 3',
            category: 'Electronics',
            original_price: 149999,
            discount_percentage: 17,
            image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&h=200&fit=crop',
            rating: 4.7
        },
        {
            product_id: 'fash_001',
            title: "Men's Leather Jacket",
            description: 'Genuine leather, classic design, multiple colors',
            category: 'Fashion',
            original_price: 14999,
            discount_percentage: 33,
            image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=200&fit=crop',
            rating: 4.5
        },
        {
            product_id: 'home_001',
            title: 'Air Fryer 5.5L',
            description: 'Digital display, 8 presets, 1700W, non-stick basket',
            category: 'Home',
            original_price: 14999,
            discount_percentage: 33,
            image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop',
            rating: 4.8
        }
    ];
    
    renderProducts(demoProducts, hotProductsGrid);
    renderProducts(demoProducts.filter(p => p.category === 'Electronics'), electronicsGrid);
    renderProducts(demoProducts.filter(p => p.category === 'Fashion'), fashionGrid);
    renderProducts(demoProducts.filter(p => p.category === 'Home'), homeGrid);
}

// Render products to a grid
function renderProducts(products, container) {
    if (!container) return;
    
    container.innerHTML = '';
    products.forEach(product => {
        container.innerHTML += createProductCard(product);
    });
    
    // Add event listeners to new cart buttons
    container.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const product = products.find(p => p.product_id === productId);
            addToCart(product);
        });
    });
}

// Add to cart functionality
function addToCart(product) {
    // Get existing cart or create new one
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.product_id === product.product_id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    // Save back to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show notification
    showNotification(`Added ${product.title} to cart!`);
    
    // Update cart icon (if implemented)
    updateCartCount();
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Find or create cart count badge
    let cartBadge = document.querySelector('.cart-badge');
    const cartIcon = document.querySelector('.fa-shopping-cart').parentElement;
    
    if (!cartBadge && totalItems > 0) {
        cartBadge = document.createElement('span');
        cartBadge.className = 'cart-badge';
        cartBadge.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background: #ff2a00;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        cartIcon.style.position = 'relative';
        cartIcon.appendChild(cartBadge);
    }
    
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        if (totalItems === 0) {
            cartBadge.remove();
        }
    }
}

// Toggle Dark Mode
darkModeToggle.addEventListener('click', function() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    this.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', isDarkMode);
});

// Toggle Currency
currencyToggle.addEventListener('click', function() {
    currency = currency === 'KES' ? 'USD' : 'KES';
    currencyText.textContent = currency;
    
    // Save preference to localStorage
    localStorage.setItem('currency', currency);
    
    // Reload products to update prices
    loadProducts();
});

// Timer for flash sale
function updateTimer() {
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    let time = 12 * 3600 + 45 * 60 + 30; // 12:45:30 in seconds
    
    setInterval(() => {
        time--;
        const h = Math.floor(time / 3600);
        const m = Math.floor((time % 3600) / 60);
        const s = time % 60;
        
        if (hoursEl) hoursEl.textContent = h.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = m.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = s.toString().padStart(2, '0');
        
        if (time <= 0) {
            time = 24 * 3600; // Reset to 24 hours
        }
    }, 1000);
}

// Initialize app
function init() {
    // Load saved preferences
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedCurrency = localStorage.getItem('currency') || 'KES';
    
    // Apply saved preferences
    if (savedDarkMode) {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    if (savedCurrency) {
        currency = savedCurrency;
        currencyText.textContent = currency;
    }
    
    // Load products
    loadProducts();
    
    // Start timer
    updateTimer();
    
    // Update cart count
    updateCartCount();
    
    // Setup event listeners
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Hero CTA button
    ctaButton.addEventListener('click', () => {
        showNotification('Browse our amazing deals below!');
        document.querySelector('.products').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Newsletter subscription
    subscribeBtn.addEventListener('click', () => {
        const email = newsletterEmail.value;
        if (email && email.includes('@')) {
            showNotification(`Thank you for subscribing with ${email}!`);
            newsletterEmail.value = '';
        } else {
            showNotification('Please enter a valid email address.');
        }
    });
    
    // Category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const categoryName = this.querySelector('h3').textContent;
            showNotification(`Showing ${categoryName} products...`);
            
            // Scroll to corresponding section
            const sectionId = categoryName.toLowerCase().replace(/[^a-z]/g, '');
            const section = document.querySelector(`.product-section:nth-child(${getCategoryIndex(categoryName) + 1})`);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

// Get category index for scrolling
function getCategoryIndex(categoryName) {
    const categories = {
        'Phones & Tablets': 0,
        'Computers': 0,
        'Fashion': 1,
        'Home & Kitchen': 2,
        'Gaming': 0,
        'Electronics': 0,
        'Health & Beauty': 0,
        'Automotive': 0
    };
    return categories[categoryName] || 0;
}

// Perform search
function performSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const query = searchInput.value.trim().toLowerCase();
    
    if (query) {
        showNotification(`Searching for: ${query}`);
        // In a real app, you would make an API call here
        // For now, just highlight matching products
        highlightMatchingProducts(query);
    }
}

// Highlight products matching search
function highlightMatchingProducts(query) {
    document.querySelectorAll('.product-card').forEach(card => {
        const title = card.querySelector('.product-title').textContent.toLowerCase();
        const desc = card.querySelector('.product-desc').textContent.toLowerCase();
        
        if (title.includes(query) || desc.includes(query)) {
            card.style.boxShadow = '0 0 0 3px var(--primary)';
            card.style.transform = 'scale(1.02)';
            
            // Scroll to first matching product
            setTimeout(() => {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        } else {
            card.style.boxShadow = '';
            card.style.transform = '';
        }
    });
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);