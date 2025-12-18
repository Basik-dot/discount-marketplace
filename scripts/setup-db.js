const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const setupSQL = `
CREATE TABLE IF NOT EXISTS products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    original_price DECIMAL(10,2) NOT NULL,
    discounted_price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2),
    stock INT DEFAULT 1,
    image_url VARCHAR(500) DEFAULT 'box',
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO products (title, description, category, original_price, discounted_price, stock, image_url) VALUES
('iPhone 13 Pro', '256GB, Excellent condition', 'Electronics', 120000, 96000, 5, 'mobile'),
('Nike Air Max', 'Size 42, Brand new', 'Fashion', 15000, 10500, 12, 'shoe'),
('Sofa Set', '3-seater, Fabric, Brown', 'Home', 45000, 31500, 3, 'couch'),
('Laptop Dell XPS', '16GB RAM, 512GB SSD', 'Electronics', 180000, 144000, 8, 'laptop'),
('Watch Rolex', 'Authentic, 2020 model', 'Fashion', 500000, 400000, 1, 'watch')
ON CONFLICT DO NOTHING;
`;

async function setup() {
    try {
        await pool.query(setupSQL);
        console.log('✅ Database setup complete!');
        const result = await pool.query('SELECT COUNT(*) FROM products');
        console.log(`📦 Total products: ${result.rows[0].count}`);
    } catch (error) {
        console.error('❌ Setup failed:', error);
    } finally {
        await pool.end();
    }
}

setup();