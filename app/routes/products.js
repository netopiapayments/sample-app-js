const express = require('express');
const router = express.Router();
const { products } = require('../public/products.json');

// Route for home page
router.get('/', (req, res) => {
  res.render('products', { products, title: 'Product Details', showBack: false });
});

// Route for product details page
router.get('/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find((p) => p.id === productId);

  if (product) {
    res.render('product', {
      product,
      title: 'Product Details',
      showBack: true,
    });
  } else {
    res.status(404).send('Product not found');
  }
});

module.exports = router;
