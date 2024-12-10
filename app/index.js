require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// Routes
const indexRoute = require('./routes/index');
const productsRoute = require('./routes/products');
const cartRoute = require('./routes/cart');
const confirmationRoute = require('./routes/confirmation');
const ipnRoute = require('./routes/ipn');
const ordersRoute = require('./routes/orders');

app.use(express.json());

app.use(
  session({
    secret: 'your-secret-key', // Replace with a secure secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set `secure: true` if using HTTPS
  })
);

// Middleware to calculate total cart quantity and pass it to all views
app.use((req, res, next) => {
  const cart = req.session.cart || [];
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  res.locals.cartQuantity = totalQuantity; // This will be available as `cartQuantity` in all views

  if(req.session.orders === undefined){
    req.session.orders = {};
  }
  next();
});

app.use('/', indexRoute);
app.use('/products', productsRoute);
app.use('/cart', cartRoute);
app.use('/confirmation', confirmationRoute);
app.use('/ipn', ipnRoute);
app.use('/orders', ordersRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
