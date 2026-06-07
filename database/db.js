const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'techhub.db'));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT,
    description TEXT,
    stock INTEGER DEFAULT 10
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    product_name TEXT,
    price REAL,
    quantity INTEGER
  )`);

  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (row && row.count === 0) {
      const stmt = db.prepare(`INSERT INTO products (name, category, price, image, description, stock) VALUES (?, ?, ?, ?, ?, ?)`);
      stmt.run('MacBook Pro 14"', 'Laptops', 2500000, 'macbook.jpg', 'Apple M3 chip, 16GB RAM, 512GB SSD', 5);
      stmt.run('Dell Inspiron 15', 'Laptops', 950000, 'dell.jpg', 'Intel i5, 8GB RAM, 256GB SSD', 8);
      stmt.run('Lenovo ThinkPad X1', 'Laptops', 1800000, 'lenovo.jpg', 'Intel i7, 16GB RAM, 512GB SSD', 4);
      stmt.run('HP Pavilion 15', 'Laptops', 750000, 'hp.jpg', 'Intel i5, 8GB RAM, 512GB SSD', 10);
      stmt.run('iPhone 14', 'Phones', 1100000, 'iphone14.jpg', '128GB, A15 Bionic chip, 5G', 8);
      stmt.run('iPhone 13', 'Phones', 850000, 'iphone13.jpg', '128GB, A15 Bionic chip', 10);
      stmt.run('Samsung Charger 65W', 'Accessories', 25000, 'charger.jpg', 'Fast charging 65W USB-C charger', 20);
      stmt.run('iPhone Cable USB-C', 'Accessories', 15000, 'cable.jpg', 'Original USB-C to Lightning cable 1m', 30);
      stmt.run('Samsung Buds Pro', 'Accessories', 180000, 'buds.jpg', 'Wireless earbuds with noise cancellation', 10);
      stmt.run('AirPods Pro 2', 'Accessories', 350000, 'airpods.jpg', 'Active noise cancellation, H2 chip', 6);
      stmt.run('Anker PowerBank 20000mAh', 'Accessories', 65000, 'powerbank.jpg', '20000mAh fast charging power bank', 15);
      stmt.run('iPhone 15 Pro', 'Phones', 1600000, 'iphone.jpg', '256GB, Titanium, A17 Pro chip', 6);
      stmt.run('Samsung Galaxy S24', 'Phones', 1200000, 'samsung.jpg', '256GB, Snapdragon 8 Gen 3', 7);
      stmt.run('Xiaomi 14 Pro', 'Phones', 900000, 'xiaomi.jpg', '512GB, Snapdragon 8 Gen 3', 9);
      stmt.run('Google Pixel 8', 'Phones', 1000000, 'pixel.jpg', '128GB, Google Tensor G3', 5);
      stmt.finalize();
    }
  });
});

module.exports = db;