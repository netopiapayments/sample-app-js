const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const router = express.Router();
const dbPath = path.resolve(__dirname, '../db/orders.db');

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT,
      details TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      }
    });
  }
});

// Route to save order details
router.post('/', (req, res) => {
  const data = req.body;
  const orderId = data.order.orderID; // Adjust based on your data structure
  const details = JSON.stringify(data);

  db.run('INSERT INTO orders (orderId, details) VALUES (?, ?)', [orderId, details], function (err) {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error saving order');
    } else {
      console.log('Order saved:', { orderId, details });
      res.status(200).send('Order saved successfully');
    }
  });
});

// Route to view all orders
router.get('/', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY createdAt DESC', [], (err, rows) => {        
    const data = rows.filter(row => row?.details !== '{}').map(row => JSON.parse(row?.details));
    if (err) {
      console.error('Error fetching orders:', err);
      res.status(500).send('Error fetching orders');
    } else {
      res.render('orders', { title: 'Orders', data, showBack: true });
    }
  });
});


module.exports = router;
