const pool = require('../config/db');

exports.listProducts = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, price, discount_percent, stock, status FROM products WHERE status = $1',
      ['active']
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, price, discount_percent, stock } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO products (name, price, discount_percent, stock, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, price, discount_percent, stock, 'active']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};
