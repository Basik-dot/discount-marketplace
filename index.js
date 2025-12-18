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
            // Try to fetch from database
            const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC LIMIT 20');
            console.log(`✅ Database: Found ${result.rows.length} products`);
            return res.json(result.rows);
        } else {
            throw new Error('Database pool not configured');
        }
    } catch (error) {
        console.error('⚠️ Database error:', error.message);
        
        // Fallback to sample data
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
                description: '1000W, 5-speed settings, glass jug',
                category: 'Home',
                original_price: 12000,
                discounted_price: 8400,
                discount_percentage: 30,
                stock: 25,
                image_url: 'home',
                created_at: new Date().toISOString()
            },
            {
                product_id: 'prod_004',
                title: 'Wireless Headphones',
                description: 'Noise cancelling, 30hr battery',
                category: 'Electronics',
                original_price: 8000,
                discounted_price: 5600,
                discount_percentage: 30,
                stock: 12,
                image_url: 'headphones',
                created_at: new Date().toISOString()
            },
            {
                product_id: 'prod_005',
                title: 'Office Chair',
                description: 'Ergonomic, adjustable height',
                category: 'Home',
                original_price: 15000,
                discounted_price: 10500,
                discount_percentage: 30,
                stock: 5,
                image_url: 'chair',
                created_at: new Date().toISOString()
            }
        ];
        
        console.log('✅ Returning fallback sample products');
        res.json(sampleProducts);
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