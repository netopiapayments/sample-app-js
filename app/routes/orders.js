const express = require('express');
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js'); 

const router = express.Router();
const dbPath = path.resolve(__dirname, '../db/orders.db');

let db = null; // Will hold the sql.js database instance

// Asynchronously initialize the database
async function initializeDatabase() {
  try {
    const sqlJsPackagePath = path.dirname(require.resolve('sql.js/package.json'));

    const SQL = await initSqlJs({
      locateFile: file => path.join(sqlJsPackagePath, 'dist', file)
    });

    let dbFileBuffer = null;
    if (fs.existsSync(dbPath)) {
      console.log('Loading existing database file into memory...');
      dbFileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(dbFileBuffer);
    } else {
      console.log('Creating new in-memory database (file will be created on first save)...');
      db = new SQL.Database();
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId TEXT,
        details TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      saveDatabase(); 
    }
    console.log('SQLite database (sql.js) initialized and ready.');


    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId TEXT,
        details TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

  } catch (err) {
    console.error('Error initializing sql.js database:', err);
    process.exit(1);
  }
}

// Function to save the database content back to file
function saveDatabase() {
  if (!db) {
    console.error('Database not initialized, cannot save.');
    return;
  }
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error('Error saving database to file:', err);
  }
}

// Call initializeDatabase when your application starts
initializeDatabase().catch(err => {
  console.error('Failed to initialize database on startup:', err);
});


// Route to save order details
router.post('/', (req, res) => {
  if (!db) {
    return res.status(500).send('Database not ready');
  }
  const data = req.body;
  const orderId = data.order && data.order.orderID ? data.order.orderID : 'UNKNOWN_ORDER_ID';
  const details = JSON.stringify(data);

  try {
    db.run('INSERT INTO orders (orderId, details) VALUES (?, ?)', [orderId, details]);
    saveDatabase();

    console.log('Order saved:', { orderId });
    res.status(200).send('Order saved successfully');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Error saving order');
  }
});

// Route to view all orders
router.get('/', (req, res) => {
  if (!db) {
    return res.status(500).send('Database not ready');
  }
  try {
    // db.exec returns an array of result objects
    const results = db.exec('SELECT id, orderId, details, createdAt FROM orders ORDER BY createdAt DESC');
    
    let formattedRows = [];
    if (results.length > 0 && results[0].values.length > 0) {
      const columns = results[0].columns;
      formattedRows = results[0].values.map(valueRow => {
        const row = {};
        columns.forEach((col, index) => {
          row[col] = valueRow[index];
        });
        return row;
      });
    }

    const data = formattedRows
      .filter(row => row && row.details !== '{}')
      .map(row => {
        try {
          return JSON.parse(row.details);
        } catch (parseErr) {
          console.error('Error parsing details for row:', row.id, parseErr);
          return null;
        }
      }).filter(item => item !== null);

    res.render('orders', { title: 'Orders', data, showBack: true });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).send('Error fetching orders');
  }
});

module.exports = router;