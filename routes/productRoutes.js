const express = require('express');
const { listProducts, createProduct } = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

const router = express.Router();

router.get('/', listProducts);
router.post('/', authenticate, authorize('seller', 'admin'), createProduct);

module.exports = router;
