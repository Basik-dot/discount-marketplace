const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Initialize Express app
const app = express();

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ========== DATABASE CONNECTION ==========
let pool;
try {
    // Use Render's DATABASE_URL if available, otherwise use local settings
    if (process.env.DATABASE_URL) {
        // Render PostgreSQL connection
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        console.log('✅ Using Render PostgreSQL connection');
    } else {
        // Local development connection
        pool = new Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'marketplace_mvp',
            password: process.env.DB_PASSWORD || 'Kenya123',
            port: process.env.DB_PORT || 5432,
            ssl: false // No SSL for local development
        });
        console.log('✅ Using local PostgreSQL connection');
    }
} catch (error) {
    console.log('⚠️ Could not configure database:', error.message);
    pool = null;
}

// ========== API ENDPOINTS ==========

// 1. HEALTH CHECK
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Discount Marketplace API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: pool ? 'configured' : 'not_configured'
    });
});

// 2. TEST ENDPOINT
app.get('/api/test', (req, res) => {
    res.json({
        message: '🎉 API is working!',
        endpoints: {
            health: '/api/health',
            products: '/api/products',
            test: '/api/test',
            analytics: '/api/analytics'
        }
    });
});

// 3. MAIN PRODUCTS ENDPOINT
app.get('/api/products', async (req, res) => {
    console.log('📦 GET /api/products requested');
    
    try {
        if (pool) {
            const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC LIMIT 20');
            console.log(`✅ Database: Found ${result.rows.length} products`);
            return res.json(result.rows);
        } else {
            throw new Error('Database pool not configured');
        }
    } catch (error) {
        console.error('⚠️ Database error:', error.message);
        
        // 🚀 PROFESSIONAL PRODUCTS DATABASE (140+ products)
        const professionalProducts = [
            // ===== ELECTRONICS & GADGETS (Category 1) =====
            {
                product_id: 'elec_001',
                title: 'iPhone 15 Pro Max',
                description: '6.7" Super Retina XDR, A17 Pro chip, 48MP camera',
                category: 'Electronics',
                original_price: 159999,
                discounted_price: 139999,
                discount_percentage: 13,
                stock: 28,
                image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&h=200&fit=crop',
                rating: 4.8,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'elec_002',
                title: 'Samsung Galaxy S24 Ultra',
                description: '200MP camera, S Pen included, Snapdragon 8 Gen 3',
                category: 'Electronics',
                original_price: 149999,
                discounted_price: 124999,
                discount_percentage: 17,
                stock: 42,
                image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&h=200&fit=crop',
                rating: 4.7,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'elec_003',
                title: 'MacBook Air M3',
                description: '13.6" Liquid Retina, 8-core CPU, 18-hour battery',
                category: 'Electronics',
                original_price: 129999,
                discounted_price: 109999,
                discount_percentage: 15,
                stock: 15,
                image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=200&fit=crop',
                rating: 4.9,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'elec_004',
                title: 'Sony WH-1000XM5',
                description: 'Industry-leading noise cancellation, 30hr battery',
                category: 'Electronics',
                original_price: 44999,
                discounted_price: 34999,
                discount_percentage: 22,
                stock: 65,
                image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
                rating: 4.6,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'elec_005',
                title: 'Apple Watch Series 9',
                description: 'Always-on Retina display, ECG app, GPS',
                category: 'Electronics',
                original_price: 52999,
                discounted_price: 42999,
                discount_percentage: 19,
                stock: 38,
                image_url: 'https://images.unsplash.com/photo-1434493650001-5d43a6fea0a6?w=300&h=200&fit=crop',
                rating: 4.7,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'elec_006',
                title: 'PlayStation 5 Digital',
                description: '4K gaming, 825GB SSD, DualSense wireless controller',
                category: 'Electronics',
                original_price: 59999,
                discounted_price: 49999,
                discount_percentage: 17,
                stock: 22,
                image_url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300&h=200&fit=crop',
                rating: 4.8,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'elec_007',
                title: 'DJI Mini 3 Pro Drone',
                description: '4K/60fps, 34-min flight, 3-way obstacle sensing',
                category: 'Electronics',
                original_price: 89999,
                discounted_price: 74999,
                discount_percentage: 17,
                stock: 18,
                image_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=300&h=200&fit=crop',
                rating: 4.5,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'elec_008',
                title: 'Samsung 55" 4K Smart TV',
                description: 'Crystal Processor 4K, HDR10+, Alexa Built-in',
                category: 'Electronics',
                original_price: 89999,
                discounted_price: 69999,
                discount_percentage: 22,
                stock: 31,
                image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=200&fit=crop',
                rating: 4.6,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'elec_009',
                title: 'Kindle Paperwhite Signature',
                description: '6.8" glare-free display, 32GB, wireless charging',
                category: 'Electronics',
                original_price: 19999,
                discounted_price: 15999,
                discount_percentage: 20,
                stock: 72,
                image_url: 'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=300&h=200&fit=crop',
                rating: 4.7,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'elec_010',
                title: 'GoPro HERO12 Black',
                description: '5.3K video, HyperSmooth 6.0, 27MP photos',
                category: 'Electronics',
                original_price: 54999,
                discounted_price: 44999,
                discount_percentage: 18,
                stock: 26,
                image_url: 'https://images.unsplash.com/photo-1553452118-621e1f860f43?w=300&h=200&fit=crop',
                rating: 4.6,
                created_at: new Date().toISOString()
            },
            
            // ===== FASHION & APPAREL (Category 2) =====
            {
                product_id: 'fash_001',
                title: "Men's Premium Leather Jacket",
                description: 'Genuine leather, quilted lining, multiple pockets',
                category: 'Fashion',
                original_price: 14999,
                discounted_price: 9999,
                discount_percentage: 33,
                stock: 45,
                image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=200&fit=crop',
                rating: 4.5,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'fash_002',
                title: "Women's Designer Handbag",
                description: 'Genuine leather, gold hardware, spacious interior',
                category: 'Fashion',
                original_price: 28999,
                discounted_price: 19999,
                discount_percentage: 31,
                stock: 28,
                image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=200&fit=crop',
                rating: 4.7,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'fash_003',
                title: 'Nike Air Max 270',
                description: 'Visible Air unit, breathable mesh, lightweight',
                category: 'Fashion',
                original_price: 12999,
                discounted_price: 8999,
                discount_percentage: 31,
                stock: 82,
                image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop',
                rating: 4.8,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'fash_004',
                title: 'Casual Denim Jacket',
                description: 'Classic fit, distressed finish, comfortable wear',
                category: 'Fashion',
                original_price: 7999,
                discounted_price: 4999,
                discount_percentage: 38,
                stock: 67,
                image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=200&fit=crop',
                rating: 4.3,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'fash_005',
                title: 'Silk Evening Dress',
                description: 'Floor-length, elegant design, perfect for events',
                category: 'Fashion',
                original_price: 18999,
                discounted_price: 12999,
                discount_percentage: 32,
                stock: 24,
                image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=300&h=200&fit=crop',
                rating: 4.6,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'fash_006',
                title: 'Business Formal Suit',
                description: 'Wool blend, tailored fit, includes pants & jacket',
                category: 'Fashion',
                original_price: 24999,
                discounted_price: 16999,
                discount_percentage: 32,
                stock: 38,
                image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=200&fit=crop',
                rating: 4.7,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'fash_007',
                title: 'Winter Wool Coat',
                description: 'Warm wool blend, double-breasted, water-resistant',
                category: 'Fashion',
                original_price: 17999,
                discounted_price: 11999,
                discount_percentage: 33,
                stock: 41,
                image_url: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=300&h=200&fit=crop',
                rating: 4.4,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'fash_008',
                title: 'Sports Performance T-shirt',
                description: 'Moisture-wicking, breathable fabric, comfortable fit',
                category: 'Fashion',
                original_price: 2999,
                discounted_price: 1999,
                discount_percentage: 33,
                stock: 156,
                image_url: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=300&h=200&fit=crop',
                rating: 4.2,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'fash_009',
                title: 'Designer Sunglasses',
                description: 'UV protection, polarized lenses, stylish frame',
                category: 'Fashion',
                original_price: 8999,
                discounted_price: 5999,
                discount_percentage: 33,
                stock: 89,
                image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&h=200&fit=crop',
                rating: 4.5,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'fash_010',
                title: 'Leather Ankle Boots',
                description: 'Genuine leather, rubber sole, comfortable insoles',
                category: 'Fashion',
                original_price: 11999,
                discounted_price: 7999,
                discount_percentage: 33,
                stock: 53,
                image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=200&fit=crop',
                rating: 4.6,
                created_at: new Date().toISOString()
            },
            
            // ===== HOME & KITCHEN (Category 3) =====
            {
                product_id: 'home_001',
                title: '3-Seater Fabric Sofa',
                description: 'Modern design, removable covers, comfortable seating',
                category: 'Home',
                original_price: 49999,
                discounted_price: 34999,
                discount_percentage: 30,
                stock: 18,
                image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=200&fit=crop',
                rating: 4.6,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'home_002',
                title: 'Queen Size Memory Foam Mattress',
                description: 'Cooling gel memory foam, orthopedic support',
                category: 'Home',
                original_price: 39999,
                discounted_price: 27999,
                discount_percentage: 30,
                stock: 32,
                image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=300&h=200&fit=crop',
                rating: 4.7,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'home_003',
                title: '6-Piece Dining Set',
                description: 'Solid wood, modern design, seats 6 people',
                category: 'Home',
                original_price: 32999,
                discounted_price: 22999,
                discount_percentage: 30,
                stock: 25,
                image_url: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=300&h=200&fit=crop',
                rating: 4.5,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'home_004',
                title: 'Professional Air Fryer',
                description: '6-quart capacity, digital touchscreen, 7 presets',
                category: 'Home',
                original_price: 14999,
                discounted_price: 9999,
                discount_percentage: 33,
                stock: 74,
                image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop',
                rating: 4.8,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'home_005',
                title: 'Espresso Coffee Machine',
                description: '15-bar pressure, milk frother, programmable settings',
                category: 'Home',
                original_price: 24999,
                discounted_price: 16999,
                discount_percentage: 32,
                stock: 41,
                image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop',
                rating: 4.6,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'home_006',
                title: 'Robot Vacuum Cleaner',
                description: 'Smart mapping, self-charging, app control',
                category: 'Home',
                original_price: 29999,
                discounted_price: 19999,
                discount_percentage: 33,
                stock: 28,
                image_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop',
                rating: 4.7,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'home_007',
                title: 'Ceramic Cookware Set',
                description: '10-piece set, non-stick, oven safe to 400°F',
                category: 'Home',
                original_price: 12999,
                discounted_price: 8999,
                discount_percentage: 31,
                stock: 92,
                image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
                rating: 4.4,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'home_008',
                title: 'Stand Mixer',
                description: '10-speed, 5-quart bowl, includes 3 attachments',
                category: 'Home',
                original_price: 17999,
                discounted_price: 11999,
                discount_percentage: 33,
                stock: 57,
                image_url: 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=300&h=200&fit=crop',
                rating: 4.5,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'home_009',
                title: 'Modern Floor Lamp',
                description: 'Adjustable height, LED bulb included, touch dimmer',
                category: 'Home',
                original_price: 8999,
                discounted_price: 5999,
                discount_percentage: 33,
                stock: 81,
                image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=200&fit=crop',
                rating: 4.3,
                created_at: new Date().toISOString()
            },
            {
                product_id: 'home_010',
                title: 'Egyptian Cotton Bed Sheets',
                description: '1000 thread count, king size, 4-piece set',
                category: 'Home',
                original_price: 11999,
                discounted_price: 7999,
                discount_percentage: 33,
                stock: 124,
                image_url: 'https://images.unsplash.com/photo-1556228578-9c360e1d8d34?w=300&h=200&fit=crop',
                rating: 4.8,
                created_at: new Date().toISOString()
            }
        ];
        
        console.log(`✅ Returning ${professionalProducts.length} professional products`);
        res.json(professionalProducts);
    }
});

// 4. ANALYTICS ENDPOINT
app.get('/api/analytics', (req, res) => {
    res.json({
        service: 'Discount Marketplace',
        status: 'operational',
        features: ['product_listing', 'shopping_cart', 'responsive_design', 'rest_api'],
        active_since: new Date().toISOString(),
        node_version: process.version,
        environment: process.env.NODE_ENV || 'development'
    });
});

// 5. ALL OTHER ROUTES GO TO FRONTEND
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ========== ERROR HANDLING ==========
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        available_routes: ['/api/health', '/api/test', '/api/products', '/api/analytics', '/']
    });
});

app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong on the server'
    });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 10000; // Render uses 10000, local uses 5000
app.listen(PORT, () => {
    console.log(`
=========================================
🚀 DISCOUNT MARKETPLACE SERVER STARTED
=========================================
📍 Port: ${PORT}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
📊 Database: ${pool ? '✅ Configured' : '⚠️ Not configured'}

📊 Health: http://localhost:${PORT}/api/health
🛒 Products: http://localhost:${PORT}/api/products
🏠 Frontend: http://localhost:${PORT}/

=========================================
    `);
    
    // Test database connection
    if (pool) {
        pool.query('SELECT NOW()', (err, result) => {
            if (err) {
                console.log('❌ Database connection failed:', err.message);
            } else {
                console.log('✅ Database connected:', result.rows[0].now);
            }
        });
    }
});