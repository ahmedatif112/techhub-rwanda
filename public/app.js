let cart = [];

// Load products on page load
document.addEventListener('DOMContentLoaded', () => {
  loadProducts('all');
});

function loadProducts(category) {
  const url = category === 'all' ? '/api/products' : `/api/products?category=${category}`;
  fetch(url)
    .then(res => res.json())
    .then(products => { allProducts = products; renderProducts(products); })
    .catch(err => console.error('Error loading products:', err));
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (products.length === 0) {
    grid.innerHTML = '<p>No products found.</p>';
    return;
  }
  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <div class="product-emoji">${p.category === 'Laptops' ? '💻' : '📱'}</div>
      <div class="category">${p.category}</div>
      <h3>${p.name}</h3>
      <p class="description">${p.description}</p>
      <p class="price">${p.price.toLocaleString()} RWF</p>
      <p class="stock">In Stock: ${p.stock}</p>
      <button class="add-btn" onclick='addToCart(${JSON.stringify(p)})'>Add to Cart 🛒</button>
<a href="product.html?id=${p.id}" class="details-btn">View Details 👁</a>
    </div>
  `).join('');
}

function filterProducts(category) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  loadProducts(category);
}

// CART
function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCart();
  updateRecommendations();
  toggleCart();
}

function updateCart() {
  const cartItems = document.getElementById('cartItems');
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');

  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartTotal.textContent = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString();

  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="text-align:center;color:#888;margin-top:20px;">Your cart is empty</p>';
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${(item.price * item.quantity).toLocaleString()} RWF</p>
      </div>
      <div class="cart-item-controls">
        <button onclick="changeQty(${item.id}, -1)">−</button>
        <span>${item.quantity}</span>
        <button onclick="changeQty(${item.id}, 1)">+</button>
        <button class="remove-btn" onclick="removeItem(${item.id})">🗑</button>
      </div>
    </div>
  `).join('');
}

function changeQty(id, change) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) removeItem(id);
  else updateCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  updateCart();
}

function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('open');
}

// CHECKOUT
function goToCheckout() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  const summary = document.getElementById('orderSummary');
  summary.innerHTML = cart.map(item => `
    <div class="order-summary-item">
      ${item.name} x${item.quantity} — ${(item.price * item.quantity).toLocaleString()} RWF
    </div>
  `).join('') + `<p style="margin-top:10px;font-weight:bold;">Total: ${cart.reduce((s,i) => s + i.price * i.quantity, 0).toLocaleString()} RWF</p>`;

  document.getElementById('checkoutModal').classList.add('open');
  document.getElementById('cartSidebar').classList.remove('open');
}

function closeCheckout() {
  document.getElementById('checkoutModal').classList.remove('open');
}

function placeOrder() {
  const name = document.getElementById('custName').value.trim();
  const email = document.getElementById('custEmail').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();

  if (!name || !email || !phone || !address) {
    alert('Please fill in all fields!');
    return;
  }

 const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const payment = document.querySelector('input[name="payment"]:checked').value;

  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_name: name, customer_email: email, customer_phone: phone, customer_address: address, items: cart, total })
  })
  .then(res => res.json())
  .then(data => {
    closeCheckout();
    document.getElementById('confirmMessage').textContent = `Thank you ${name}! Your order #${data.orderId} has been placed via ${payment}. We will contact you at ${phone} for delivery.`;
    document.getElementById('confirmModal').classList.add('open');
    cart = [];
    updateCart();
  })
  .catch(err => alert('Error placing order. Please try again.'));
}

function closeConfirm() {
  document.getElementById('confirmModal').classList.remove('open');
}
// SEARCH
let allProducts = [];

function searchProducts() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  );
  renderProducts(filtered);
}
// AI RECOMMENDATIONS
function updateRecommendations() {
  if (cart.length === 0) {
    document.getElementById('recommendations').style.display = 'none';
    return;
  }
  const cartCategories = [...new Set(cart.map(item => item.category))];
  const cartIds = cart.map(item => item.id);
  const recommended = allProducts.filter(p =>
    cartCategories.includes(p.category) && !cartIds.includes(p.id)
  ).slice(0, 4);

  if (recommended.length === 0) {
    document.getElementById('recommendations').style.display = 'none';
    return;
  }
  document.getElementById('recommendations').style.display = 'block';
  document.getElementById('recommendationsGrid').innerHTML = recommended.map(p => `
    <div class="product-card">
      <div class="product-emoji">${p.category === 'Laptops' ? '💻' : '📱'}</div>
      <div class="category">${p.category}</div>
      <h3>${p.name}</h3>
      <p class="description">${p.description}</p>
      <p class="price">${p.price.toLocaleString()} RWF</p>
      <button class="add-btn" onclick='addToCart(${JSON.stringify(p)})'>Add to Cart 🛒</button>
    </div>
  `).join('');
}