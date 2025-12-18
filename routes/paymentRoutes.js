const express = require('express');
const { initiateSTKPush } = require('../utils/mpesa');

const router = express.Router();

router.post('/stkpush', async (req, res, next) => {
  try {
    const { phone, amount } = req.body;
    const response = await initiateSTKPush({ phone, amount });
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// Callback endpoint
router.post('/callback', (req, res) => {
  console.log('M-Pesa Callback:', req.body);
  res.json({ status: 'received' });
});

module.exports = router;
