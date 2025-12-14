// Cart management
const products = {
    1: { id: 1, name: "Panel Basic", price: 199000, icon: "fas fa-server" },
    2: { id: 2, name: "Panel Pro", price: 399000, icon: "fas fa-rocket" },
    3: { id: 3, name: "Panel Enterprise", price: 899000, icon: "fas fa-crown" },
    4: { id: 4, name: "Panel Gaming", price: 349000, icon: "fas fa-gamepad" },
    5: { id: 5, name: "Panel Cloud", price: 599000, icon: "fas fa-cloud" },
    6: { id: 6, name: "Panel Ultimate", price: 1299000, icon: "fas fa-gem" }
};

function addToCart(productId) {
    const cart = JSON.parse(localStorage.getItem('twinsCart')) || [];
    const product = products[productId];
    
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            quantity: 1,
            icon: product.icon
        });
    }
    
    localStorage.setItem('twinsCart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${product.name} berhasil ditambahkan ke keranjang!`);
    
    // If cart modal is open, update it
    if (document.querySelector('.cart-modal.active')) {
        loadCartItems();
    }
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('twinsCart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('twinsCart', JSON.stringify(cart));
    updateCartCount();
    loadCartItems();
}

function updateQuantity(productId, change) {
    const cart = JSON.parse(localStorage.getItem('twinsCart')) || [];
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            localStorage.setItem('twinsCart', JSON.stringify(cart));
            loadCartItems();
            updateCartCount();
        }
    }
}

function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('twinsCart')) || [];
    const container = document.getElementById('cartItems');
    const totalElement = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Keranjang belanja kosong</p>
                <a href="products.html" class="btn btn-primary">Lihat Produk</a>
            </div>
        `;
        if (totalElement) totalElement.textContent = 'Rp 0';
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-icon">
                <i class="${item.icon}"></i>
            </div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <div class="cart-item-price">Rp ${item.price.toLocaleString()}</div>
                <div class="cart-item-controls">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    <button class="remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="cart-item-total">
                Rp ${(item.price * item.quantity).toLocaleString()}
            </div>
        </div>
    `).join('');
    
    if (totalElement) totalElement.textContent = `Rp ${total.toLocaleString()}`;
    
    // Add event listeners
    document.querySelectorAll('.minus').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = parseInt(btn.dataset.id);
            updateQuantity(productId, -1);
        });
    });
    
    document.querySelectorAll('.plus').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = parseInt(btn.dataset.id);
            updateQuantity(productId, 1);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = parseInt(btn.dataset.id);
            removeFromCart(productId);
        });
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); z-index: 3000; display: flex; align-items: center; gap: 10px; animation: slideInRight 0.3s ease;">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Make functions available globally
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.loadCartItems = loadCartItems;