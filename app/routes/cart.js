const express = require('express');
const router = express.Router();
const { products } = require('../public/products.json');
const { netopia } = require('../../lib/netopia');

// Route to add a product to the cart
router.post('/add', (req, res) => {
  const productId = parseInt(req.body.productId);

  const product = products.find((p) => p.id === productId);
  if (product) {
    // Initialize the cart in the session if it doesn't exist
    if (!req.session.cart) {
      req.session.cart = [];
    }
    // Check if the product is already in the cart
    const existingProduct = req.session.cart.find(
      (item) => item.id === productId
    );

    if (existingProduct) {
      existingProduct.quantity += 1; // Increment quantity if already in the cart
    } else {
      req.session.cart.push({ ...product, quantity: 1 }); // Add new product with quantity
    }

    res.redirect('/cart'); // Redirect to the cart view page
  } else {
    res.status(404).send('Product not found');
  }
});

// Route to handle checkout form submission
router.post('/checkout', async (req, res) => {
  const total = req.session.cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const configData = {
    emailTemplate: 'Email template',
    emailSubject: 'Email subject',
    notifyUrl: `${req.protocol}://${req.hostname}/ipn`,
    redirectUrl: `${req.protocol}://${req.hostname}/confirmation`,
    language: 'ro',
  };
  const paymentData = {
    options: {
      installments: 0,
      bonus: 0,
    },
    instrument: {
      type: 'card',
      account: '',
      expMonth: 12,
      expYear: 2022,
      secretCode: '',
      token: '',
    },
    data: {
      property1: 'string',
      property2: 'string',
    },
  };
  const orderData = {
    ntpID: null,
    orderID: `or-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    description: 'Some order description',
    amount: total,
    currency: 'RON',
    dateTime: new Date(),
    billing: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      details: req.body.details,
      city: req.body.city,
      country: 642,
      countryName: 'Romania',
      state: 'State',
      postalCode: '000000',
    },
    installments: {
      selected: 0,
    },
  };

  const response = await netopia.createOrder(
    configData,
    paymentData,
    orderData
  );
  if (response.code !== 200) {
    console.log(response);
  } else {
    req.session.orders[orderData.orderID] = response.data.payment.ntpID;
    // Redirect to payment page
    res.redirect(response.data.payment.paymentURL);
  }
});

// Route to display the cart
router.get('/', (req, res) => {
  const cart = req.session.cart || []; // Get cart from session or set to an empty array
  res.render('cart', { cart, title: 'Cart Details', showBack: true });
});

module.exports = router;
