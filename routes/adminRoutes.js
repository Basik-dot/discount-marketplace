const express = require('express');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

const router = express.Router();

// Example admin-only route
router.get('/dashboard', authenticate, authorize('admin'), (req, res) => {
  res.json({ message: 'Admin dashboard data' });
});

module.exports = router;
