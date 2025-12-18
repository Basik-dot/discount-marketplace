const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { Pool } = require('pg');
const PORT = process.env.PORT || 10000;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Render PostgreSQL
});
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
// ========== DATABASE CONNECTION ==========
let pool;
try {
    pool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'marketplace_mvp',
        password: process.env.DB_PASSWORD || 'Kenya123',
        port: process.env.DB_PORT || 5432,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    console.log('✅ Database connection configured');
    console.log(`📊 Connecting to: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    
} catch (error) {
    console.log('⚠️ Could not configure database:', error.message);
    pool = null;
}
}

// ========== API ENDPOINTS ==========

// 1. HEALTH CHECK (ALWAYS WORKS)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Discount Marketplace API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        node_version: process.version,
        environment: process.env.NODE_ENV || 'development'
    });
});

// 2. TEST ENDPOINT (ALWAYS WORKS)
app.get('/api/test', (req, res) => {
    res.json({
        message: '🎉 API is working!',
        endpoints: {
            health: '/api/health',
            products: '/api/products',
            test: '/api/test'
        },
        instructions: 'Visit /api/products to see products'
    });
});

// 3. MAIN PRODUCTS ENDPOINT (CRITICAL - THIS WAS MISSING)
app.get('/api/products', async (req, res) => {
    console.log('📦 GET /api/products requested');
    
    try {
        // Try to get from database if available
        if (pool) {
            const result = await pool.query(`
                SELECT * FROM products 
                ORDER BY created_at DESC 
                LIMIT 20
            `);
            console.log(`✅ Database: Found ${result.rows.length} products`);
            return res.json(result.rows);
        }
    } catch (dbError) {
        console.log('⚠️ Database error:', dbError.message);
    }
    
// Basic analytics endpoint
app.get('/api/analytics', (req, res) => {
    res.json({
        total_products: products.length,
        total_users: 0, // Add when you have users
        active_since: new Date().toISOString(),
        features: ['product_listing', 'shopping_cart', 'responsive_design']
    });
});

    // FALLBACK: Return sample data
    const sampleProducts = [
        {
            product_id: 'prod_001',
            title: 'Samsung Galaxy A14',
            description: '6.6" Display, 50MP Camera, 5000mAh Battery',
            category: 'Electronics',
            original_price: 25000,
            discounted_price: 19999,
            discount_percentage: 20,
            stock: 15,
            image_url: 'laptop',
            created_at: new Date().toISOString()
        },
        {
            product_id: 'prod_002',
            title: 'Running Shoes',
            description: 'Breathable mesh, cushioned soles',
            category: 'Fashion',
            original_price: 4500,
            discounted_price: 3150,
            discount_percentage: 30,
            stock: 8,
            image_url: 'tshirt',
            created_at: new Date().toISOString()
        },
        {
            product_id: 'prod_003',
            title: 'Kitchen Blender',
            description: '1000W, 5-speed settings',
            category: 'Home',
            original_price: 12000,
            discounted_price: 8400,
            discount_percentage: 30,
            stock: 25,
            image_url: 'home',
            created_at: new Date().toISOString()
        }
    ];
    
    console.log('✅ Returning sample products');
    res.json(sampleProducts);
});

// 4. ALL OTHER ROUTES GO TO FRONTEND
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ========== ERROR HANDLING ==========
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        available_routes: ['/api/health', '/api/test', '/api/products', '/']
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
=========================================
🚀 DISCOUNT MARKETPLACE SERVER STARTED
=========================================
📍 Port: ${PORT}
🌐 Environment: ${process.env.NODE_ENV || 'development'}

📊 Health Check: http://localhost:${PORT}/api/health
🛒 Products API: http://localhost:${PORT}/api/products
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