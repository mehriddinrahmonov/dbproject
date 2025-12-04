const API_BASE = (window.location.protocol === 'file:' || window.location.hostname === '')
    ? 'http://localhost:3000/api'
    : window.location.origin + '/api';

/**
 * Make API request with error handling
 */
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Format date to readable string
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Format time to 12-hour format
 */
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Format price to currency
 */
function formatPrice(price) {
    return `$${parseFloat(price).toFixed(2)}`;
}

/**
 * Get genre emoji
 */
function getGenreEmoji(genre) {
    const emojis = {
        'Rock': '🎸',
        'Pop': '🎤',
        'Hip-Hop': '🎧',
        'Jazz': '🎺',
        'Electronic': '🎹',
        'Country': '🤠',
        'Classical': '🎻',
        'R&B': '🎵',
        'Metal': '🤘',
        'Indie': '🎼'
    };
    return emojis[genre] || '🎵';
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Get current user from localStorage
 */
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

/**
 * Set current user in localStorage
 */
function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * Clear current user
 */
function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}

/**
 * Get cart items
 */
function getCartItems() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

/**
 * Add to cart
 */
function addToCart(item) {
    const cart = getCartItems();
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    showNotification('Added to cart!', 'success');
}

/**
 * Clear cart
 */
function clearCart() {
    localStorage.removeItem('cart');
}

/**
 * Open modal
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Close modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_BASE,
        apiRequest,
        formatDate,
        formatTime,
        formatPrice,
        getGenreEmoji,
        showNotification,
        getCurrentUser,
        setCurrentUser,
        clearCurrentUser,
        getCartItems,
        addToCart,
        clearCart,
        openModal,
        closeModal
    };
}
