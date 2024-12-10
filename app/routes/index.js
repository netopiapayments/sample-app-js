const express = require('express');
const router = express.Router();

// Redirect from / to /products
router.get('/', (req, res) => {
  res.redirect('/products');
});

module.exports = router;
