// ========== CONFIGURATION ==========
const API_BASE_URL = window.location.origin;
const PRODUCTS_ENDPOINT = `${API_BASE_URL}/api/products`;

// ========== STATE ==========
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];

// ========== DOM ELEMENTS ==========
const productsContainer = document.getElementById('products-container');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const cartCountElement = document.getElementById('cart-count');

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Discount Marketplace Frontend Loaded');
    console.log('API Base URL:', API_BASE_URL);
    
    updateCartCount();
    loadProducts();
    
    // Test API connection
    testAPI();
});

// ========== API FUNCTIONS ==========

// Test API connection
async function testAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        console.log('✅ API Health:', data);
    } catch (error) {
        console.warn('⚠️ API health check failed:', error.message);
    }
}

// Load products from API
async function loadProducts() {
    showLoading(true);
    hideError();
    
    try {
        console.log('📡 Fetching products from:', PRODUCTS_ENDPOINT);
        
        const response = await fetch(PRODUCTS_ENDPOINT);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`✅ Received ${data.length} products`);
        
        products = Array.isArray(data) ? data : [];
        displayProducts(products);
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        showError(`Failed to load products: ${error.message}`);
        
        // Fallback: Show sample products
        displaySampleProducts();
    } finally {
        showLoading(false);
    }
}

// ========== DISPLAY FUNCTIONS ==========

// Display products in grid
function displayProducts(productsList) {
    if (!productsList || productsList.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open fa-3x"></i>
                <h3>No Products Available</h3>
                <p>Check back soon for new deals!</p>
            </div>
        `;
        return;
    }
    
    productsContainer.innerHTML = '';
    
    productsList.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        productsContainer.appendChild(productCard);
    });
}

// Create product card HTML
function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-index', index);
    
    // Calculate values
    const stock = parseInt(product.stock) || 0;
    const discount = calculateDiscount(product.original_price, product.discounted_price);
    const icon = getCategoryIcon(product.category);
    const stockStatus = getStockStatus(stock);
    
    card.innerHTML = `
        <div class="product-image">
            <i class="fas fa-${icon}"></i>
        </div>
        
        <div class="product-content">
            <h3 class="product-title">${escapeHtml(product.title || 'Untitled Product')}</h3>
            
            <p class="product-description">
                ${escapeHtml(product.description || 'No description available')}
            </p>
            
            <div class="product-meta">
                <span class="product-category">${escapeHtml(product.category || 'General')}</span>
                <span class="product-stock ${stockStatus.class}">
                    ${stockStatus.text}
                </span>
            </div>
            
            <div class="product-price">
                <span class="original-price">KES ${formatPrice(product.original_price)}</span>
                <span class="discounted-price">KES ${formatPrice(product.discounted_price)}</span>
                <span class="discount-badge">${discount}% OFF</span>
            </div>
            
            <button class="btn-add-cart" 
                    onclick="addToCart(${index})"
                    ${stock === 0 ? 'disabled' : ''}
                    title="${stock === 0 ? 'Out of stock' : 'Add to cart'}">
                <i class="fas fa-cart-plus"></i>
                ${stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
        </div>
    `;
    
    return card;
}

// Display sample products (fallback)
function displaySampleProducts() {
    const sampleProducts = [
        {
            title: 'Sample Smartphone',
            description: 'High-quality smartphone with great features',
            category: 'Electronics',
            original_price: 20000,
            discounted_price: 16000,
            stock: 10,
            discount_percentage: 20
        },
        {
            title: 'Sample Shoes',
            description: 'Comfortable shoes for daily use',
            category: 'Fashion',
            original_price: 3000,
            discounted_price: 2100,
            stock: 5,
            discount_percentage: 30
        }
    ];
    
    displayProducts(sampleProducts);
}

// ========== CART FUNCTIONS ==========

// Add product to cart
function addToCart(productIndex) {
    const product = products[productIndex];
    
    if (!product) {
        showNotification('Product not found!', 'error');
        return;
    }
    
    const stock = parseInt(product.stock) || 0;
    if (stock === 0) {
        showNotification('This product is out of stock!', 'error');
        return;
    }
    
    // Find existing item in cart
    const existingItem = cart.find(item => item.id === product.product_id);
    
    if (existingItem) {
        if (existingItem.quantity >= stock) {
            showNotification(`Only ${stock} items available!`, 'error');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.product_id || `prod_${Date.now()}`,
            name: product.title,
            price: product.discounted_price,
            quantity: 1,
            maxStock: stock
        });
    }
    
    updateCartCount();
    saveCartToStorage();
    
    // Show success notification
    showNotification(`"${product.title}" added to cart!`, 'success');
    
    // Animate cart icon
    animateCartIcon();
}

// Update cart count display
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
}

// Save cart to localStorage
function saveCartToStorage() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Failed to save cart:', error);
    }
}

// ========== UI HELPER FUNCTIONS ==========

// Show loading state
function showLoading(show) {
    if (show) {
        loadingElement.style.display = 'block';
        productsContainer.style.display = 'none';
    } else {
        loadingElement.style.display = 'none';
        productsContainer.style.display = 'grid';
    }
}

// Show error message
function showError(message) {
    errorText.textContent = message;
    errorElement.style.display = 'flex';
}

// Hide error message
function hideError() {
    errorElement.style.display = 'none';
}

// Error handling wrapper
function withErrorHandling(fn) {
    return async function(...args) {
        try {
            return await fn(...args);
        } catch (error) {
            console.error('Error:', error);
            showNotification('Something went wrong. Please try again.', 'error');
            return null;
        }
    };
}

// Use it like this:
const safeLoadProducts = withErrorHandling(loadProducts);

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(el => el.remove());
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? '#10b981' : '#ef4444',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        animation: 'slideIn 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animate cart icon
function animateCartIcon() {
    cartCountElement.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cartCountElement.style.transform = 'scale(1)';
    }, 300);
}

// Scroll to products section
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Add search functionality
function addSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search products...';
    searchInput.id = 'searchInput';
    
    // Add to your page
    document.querySelector('.container').prepend(searchInput);
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = products.filter(p => 
            p.title.toLowerCase().includes(searchTerm) || 
            p.description.toLowerCase().includes(searchTerm)
        );
        displayProducts(filtered);
    });
}

function addCategoryFilter() {
    const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Sports'];
    const filterDiv = document.createElement('div');
    filterDiv.className = 'category-filter';
    
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.textContent = category;
        btn.onclick = () => filterByCategory(category);
        filterDiv.appendChild(btn);
    });
    
    document.querySelector('.container').appendChild(filterDiv);
}

function filterByCategory(category) {
    if (category === 'All') {
        displayProducts(products);
    } else {
        const filtered = products.filter(p => p.category === category);
        displayProducts(filtered);
    }
}

// ========== UTILITY FUNCTIONS ==========

// Calculate discount percentage
function calculateDiscount(original, discounted) {
    if (!original || !discounted) return 0;
    const discount = ((original - discounted) / original) * 100;
    return Math.round(discount);
}

// Format price with commas
function formatPrice(price) {
    if (!price) return '0.00';
    const num = parseFloat(price);
    return num.toLocaleString('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Get category icon
function getCategoryIcon(category) {
    if (!category) return 'box';
    
    const icons = {
        'electronics': 'laptop',
        'fashion': 'tshirt',
        'clothing': 'tshirt',
        'home': 'home',
        'kitchen': 'utensils',
        'sports': 'futbol',
        'books': 'book',
        'automotive': 'car',
        'health': 'heart',
        'beauty': 'spa'
    };
    
    const lowerCategory = category.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
        if (lowerCategory.includes(key)) {
            return icon;
        }
    }
    
    return 'box';
}

// Get stock status
function getStockStatus(stock) {
    if (stock === 0) {
        return { class: 'out', text: 'Out of stock' };
    } else if (stock < 5) {
        return { class: 'low', text: `Low stock (${stock})` };
    } else {
        return { class: '', text: `In stock (${stock})` };
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== ADD CSS ANIMATIONS ==========
function addAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .no-products {
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem;
            color: #64748b;
        }
        
        .no-products i {
            margin-bottom: 1rem;
            color: #cbd5e1;
        }
        
        .notification {
            animation: slideIn 0.3s ease;
        }
        
        .notification-slide-out {
            animation: slideOut 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// Initialize animations
addAnimations();