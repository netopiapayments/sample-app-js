const express = require('express');
const router = express.Router();
const { netopia } = require('../../lib/netopia');

// GET route for displaying status and rendering the redirect page
router.get('/', async (req, res) => {
  const orderId = req.query.orderId;
  const ntpID = req.session.orders[orderId];

  try {
    // Fetch status from Netopia
    const { data } = await netopia.getStatus(ntpID);
    // Delete cart when payment is confirmed
    if(data.payment.status === 3){
      delete req.session.cart;
    }
    // Render the redirect page with the fetched data
    res.render('confirmation', {
      data,
      title: 'Order Status',
      errorMessage: data.error.message,
      showBack: true,
    });
  } catch (error) {
    res.status(500).render('confirmation', {
      title: 'Order Status',
      showBack: true,
      errorMessage: 'An error occurred while fetching the status.',
      data: null,
    });
  }
});

module.exports = router;
