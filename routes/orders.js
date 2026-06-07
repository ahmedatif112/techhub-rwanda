const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.post('/', (req, res) => {
  const { customer_name, customer_email, customer_phone, customer_address, items, total } = req.body;

  if (!customer_name || !customer_email || !customer_phone || !customer_address || !items || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, total) VALUES (?, ?, ?, ?, ?)`,
    [customer_name, customer_email, customer_phone, customer_address, total],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      const orderId = this.lastID;
      const stmt = db.prepare(`INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)`);
      items.forEach(item => {
        stmt.run(orderId, item.id, item.name, item.price, item.quantity);
      });
      stmt.finalize();
      res.json({ success: true, orderId });
    }
  );
});

router.get('/', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;