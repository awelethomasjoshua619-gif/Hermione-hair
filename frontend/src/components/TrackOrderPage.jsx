import { useState } from 'react'

const statusCopy = {
  pending: 'Your order has been received and is waiting to be processed.',
  paid: 'Your payment was confirmed and the order is being prepared.',
  shipped: 'Your order has shipped and is on the way.',
  delivered: 'Your order has been delivered.',
  cancelled: 'This order was cancelled.',
}

export default function TrackOrderPage({ apiBaseUrl, onBack }) {
  const [reference, setReference] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const params = new URLSearchParams({ reference: reference.trim(), email: email.trim() })
      const res = await fetch(`${apiBaseUrl}/api/orders/track?${params.toString()}`)
      const data = await res.json()

      if (data.status === 'success') {
        setOrder(data.data)
      } else {
        setError(data.message || 'Unable to find that order')
      }
    } catch (err) {
      setError('A network error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="orders-page">
      <div className="orders-shell">
        <div className="orders-page-header">
          <div>
            <span className="section-eyebrow">Order Tracking</span>
            <h1>Track My Order</h1>
          </div>
          <button className="btn-outline" onClick={onBack}>Back to Shop</button>
        </div>

        <div className="contact-card" style={{ padding: '28px', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit} className="auth-form" style={{ gap: '16px' }}>
            <div className="form-group">
              <label>Order Reference</label>
              <input
                type="text"
                placeholder="e.g. order-1719390000000-abc1234"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && <div className="auth-error-msg">{error}</div>}

            <div className="form-actions">
              <button type="submit" className="btn-primary" style={{ background: '#2E4A3F' }} disabled={loading}>
                {loading ? 'Checking order...' : 'Track Order'}
              </button>
            </div>
          </form>
        </div>

        {order && (
          <article className="customer-order-card">
            <div className="order-card-header">
              <div>
                <span className="order-meta-label">Order Date</span>
                <strong className="order-meta-val">
                  {new Date(order.createdAt).toLocaleDateString('en-NG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </strong>
              </div>
              <div>
                <span className="order-meta-label">Reference</span>
                <strong className="order-meta-val monospace">{order.paystackReference}</strong>
              </div>
              <div>
                <span className="order-meta-label">Status</span>
                <span className={`order-status-badge ${order.status}`}>{order.status.toUpperCase()}</span>
              </div>
              <div>
                <span className="order-meta-label">Total Amount</span>
                <strong className="order-meta-val price-val">{formatPrice(order.totalAmount)}</strong>
              </div>
            </div>

            <div className="order-card-body">
              <div className="order-items-summary">
                <h4>Purchased Items</h4>
                <ul className="order-items-list">
                  {order.orderItems.map((item) => (
                    <li key={item.id} className="order-item-row">
                      <span>
                        {item.product.name} <strong>x {item.quantity}</strong>
                      </span>
                      <span>{formatPrice(item.priceAtPurchase * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-logistics-box">
                <h4>Tracking Status</h4>
                <p>{statusCopy[order.status] || 'We are processing your order.'}</p>
                <div className="order-tracking-info" style={{ marginTop: '18px' }}>
                  <span className="tracking-label">Tracking Number</span>
                  {order.trackingNumber ? (
                    <div className="tracking-code-wrapper">
                      <code className="tracking-code">{order.trackingNumber}</code>
                      <span className="tracking-help-text">
                        Your parcel has been handed to the courier. Use this number on the courier website.
                      </span>
                    </div>
                  ) : (
                    <div className="order-tracking-info pending">
                      <p>Tracking details will appear here once the order is shipped.</p>
                    </div>
                  )}
                </div>

                <h4 style={{ marginTop: '22px' }}>Shipping Address</h4>
                <p className="order-address-text">
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                  Phone: {order.shippingAddress.phone}
                </p>
              </div>
            </div>
          </article>
        )}
      </div>
    </main>
  )
}
