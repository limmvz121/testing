// Checkout functionality
document.addEventListener('DOMContentLoaded', function() {
    // Form validation
    const form = document.getElementById('checkoutForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                processOrder();
            }
        });
    }
    
    // Real-time form validation
    const inputs = document.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
});

function validateForm() {
    let isValid = true;
    const requiredFields = document.querySelectorAll('input[required], select[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    const terms = document.getElementById('terms');
    if (!terms.checked) {
        showError(terms, 'Anda harus menyetujui syarat dan ketentuan');
        isValid = false;
    }
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';
    
    // Clear previous error
    clearError(field);
    
    if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            message = 'Email tidak valid';
            isValid = false;
        }
    }
    
    if (field.type === 'tel') {
        const phoneRegex = /^[0-9+\-\s()]{10,}$/;
        if (!phoneRegex.test(value)) {
            message = 'Nomor telepon tidak valid';
            isValid = false;
        }
    }
    
    if (field.required && !value) {
        message = 'Field ini wajib diisi';
        isValid = false;
    }
    
    if (!isValid) {
        showError(field, message);
    }
    
    return isValid;
}

function showError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    // Remove existing error
    clearError(field);
    
    // Add error class
    field.classList.add('error');
    
    // Create error message
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = '#ef4444';
    errorElement.style.fontSize = '0.8rem';
    errorElement.style.marginTop = '0.3rem';
    
    formGroup.appendChild(errorElement);
}

function clearError(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    field.classList.remove('error');
    
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function processOrder() {
    // Get form data
    const formData = {
        email: document.getElementById('email').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        phone: document.getElementById('phone').value,
        serverName: document.getElementById('serverName').value,
        domain: document.getElementById('domain').value || '',
        duration: document.querySelector('input[name="duration"]:checked').value,
        paymentMethod: document.querySelector('input[name="payment"]:checked').value,
        notes: document.getElementById('notes').value || '',
        cart: JSON.parse(localStorage.getItem('twinsCart')) || [],
        total: document.getElementById('totalAmount').textContent,
        timestamp: new Date().toISOString(),
        orderId: 'TWT-' + Date.now() + Math.floor(Math.random() * 1000)
    };
    
    // Save order to localStorage
    localStorage.setItem('twinsOrder', JSON.stringify(formData));
    
    // Clear cart
    localStorage.removeItem('twinsCart');
    
    // Show success message
    showOrderSuccess(formData.orderId);
}

function showOrderSuccess(orderId) {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
        <div class="success-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Pesanan Berhasil!</h2>
            <p>Order ID: <strong>${orderId}</strong></p>
            <p>Instruksi pembayaran telah dikirim ke email Anda.</p>
            <div class="success-actions">
                <a href="dashboard.html" class="btn btn-primary">
                    <i class="fas fa-tachometer-alt"></i> Ke Dashboard
                </a>
                <a href="index.html" class="btn btn-outline">
                    <i class="fas fa-home"></i> Beranda
                </a>
            </div>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .success-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            animation: fadeIn 0.3s ease;
        }
        
        .success-content {
            background: white;
            padding: 3rem;
            border-radius: 20px;
            text-align: center;
            max-width: 500px;
            width: 90%;
            animation: slideUp 0.5s ease;
        }
        
        .success-icon {
            font-size: 4rem;
            color: #10b981;
            margin-bottom: 1.5rem;
        }
        
        .success-content h2 {
            margin-bottom: 1rem;
            color: #1e293b;
        }
        
        .success-content p {
            margin-bottom: 1rem;
            color: #64748b;
        }
        
        .success-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Remove modal after 10 seconds or when clicking outside
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 10000);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            window.location.href = 'dashboard.html';
        }
    });
}

// Price calculation based on duration
function calculatePrice() {
    const cart = JSON.parse(localStorage.getItem('twinsCart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const duration = document.querySelector('input[name="duration"]:checked')?.value || 1;
    
    let discount = 0;
    let discountRate = 0;
    
    if (duration === '3') {
        discountRate = 0.10;
    } else if (duration === '12') {
        discountRate = 0.25;
    }
    
    discount = subtotal * discountRate * duration;
    const total = (subtotal * duration) - discount;
    
    // Update display
    const subtotalElement = document.getElementById('subtotal');
    const discountElement = document.getElementById('durationDiscount');
    const totalElement = document.getElementById('totalAmount');
    
    if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal * duration);
    if (discountElement) discountElement.textContent = `-${formatCurrency(discount)}`;
    if (totalElement) totalElement.textContent = formatCurrency(total);
}

function formatCurrency(amount) {
    return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

// Update price when duration changes
document.addEventListener('DOMContentLoaded', function() {
    const durationRadios = document.querySelectorAll('input[name="duration"]');
    durationRadios.forEach(radio => {
        radio.addEventListener('change', calculatePrice);
    });
    
    // Initial calculation
    calculatePrice();
});