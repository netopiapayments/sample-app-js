const express = require('express');
const axios = require('axios');
const { ipn } = require('../../lib/netopia');
const router = express.Router();

router.post('/', async (req, res) => {
  const verifyToken = req.headers['verification-token'];
  const data = req.body;

  try {
    // Verify IPN status
    const status = await ipn.verify(verifyToken, JSON.stringify(data));
    console.log('IPN status:', status);

    // Forward data to /orders endpoint to save it
    try {
      const res = await axios.post(`${req.protocol}://${req.hostname}/orders`, data, {
        headers: {
          'content-type': 'application/json',
        },
      });
      console.log('Order saved:', res.data);
    } catch (error) {
      console.error('Error saving order:', error.message);
    }
    res.status(200).send('IPN received and processed.');
  } catch (error) {
    console.error('Error processing IPN:', error);
    res.status(500).send('Error processing IPN');
  }
});

module.exports = router;