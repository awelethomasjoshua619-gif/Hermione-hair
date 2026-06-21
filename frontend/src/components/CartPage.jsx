import { useState } from 'react'

const formatPrice = (price) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price)

const BagIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
)

export default function CartPage({ items, onQuantityChange, onRemove, onContinueShopping, onCheckout }) {
  const [promoCode, setPromoCode] = useState('')
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <main className="cart-page">
      <div className="cart-shell">
        <div className="cart-page-header">
          <div>
            <span className="section-eyebrow">Your Cart</span>
            <h1>Shopping Bag</h1>
          </div>
          <button className="btn-outline" onClick={onContinueShopping}>
            Continue Shopping
          </button>
        </div>

        {items.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon"><BagIcon /></div>
            <h2>Your cart is empty</h2>
            <p>Add your favourite Hermione Hair products and they will appear here.</p>
            <button className="btn-primary" onClick={onContinueShopping}>
              Shop Bestsellers
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => (
                <article className="cart-item" key={item.id}>
                  <div className="cart-item-thumb">
                    {item.image ? <img src={item.image} alt={item.name} /> : item.icon}
                  </div>
                  <div className="cart-item-main">
                    <div className="cart-item-top">
                      <div>
                        <h2>{item.name}</h2>
                        <p>{item.desc}</p>
                      </div>
                      <strong>{formatPrice(item.price * item.quantity)}</strong>
                    </div>
                    <div className="cart-item-actions">
                      <div className="quantity-control" aria-label={`${item.name} quantity`}>
                        <button onClick={() => onQuantityChange(item.id, item.quantity - 1)} aria-label="Decrease quantity">
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => onQuantityChange(item.id, item.quantity + 1)} aria-label="Increase quantity">
                          +
                        </button>
                      </div>
                      <button className="cart-remove" onClick={() => onRemove(item.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Items</span>
                <strong>{itemCount}</strong>
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              
              <div className="discount-input-group" style={{ margin: '20px 0' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '6px' }}>PROMO CODE</label>
                <input
                  type="text"
                  placeholder="e.g. GROW10"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd7cd', background: 'white' }}
                />
              </div>

              <div className="summary-row muted">
                <span>Delivery</span>
                <span>Calculated on request</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <button className="btn-primary full-width" style={{ background: '#2E4A3F' }} onClick={() => onCheckout(promoCode)}>Request Checkout</button>
              <p>Verify your account, choose your delivery details, and complete your purchase securely using Paystack.</p>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}
