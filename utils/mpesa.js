const axios = require('axios');

/**
 * Generate OAuth token from Safaricom Daraja API
 */
async function getToken() {
  const auth = Buffer.from(
    process.env.MPESA_CONSUMER_KEY + ':' + process.env.MPESA_CONSUMER_SECRET
  ).toString('base64');

  const res = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return res.data.access_token;
}

/**
 * Initiate STK Push request
 * @param {Object} params
 * @param {string} params.phone - Customer phone number (format: 2547XXXXXXXX)
 * @param {number} params.amount - Amount to charge
 */
async function initiateSTKPush({ phone, amount }) {
  const token = await getToken();

  // Generate timestamp in YYYYMMDDHHMMSS format
  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, '')
    .slice(0, 14);

  // Encode password = Shortcode + Passkey + Timestamp
  const password = Buffer.from(
    process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp
  ).toString('base64');

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phone, // customer phone number
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: 'DiscountMarketplace',
    TransactionDesc: 'Payment for product'
  };

  const res = await axios.post(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
}

module.exports = { getToken, initiateSTKPush };
