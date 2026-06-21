import { useState, useEffect } from 'react'

export default function CustomerOrders({ apiBaseUrl, onBack }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          setError('You must be logged in to view your orders.')
          setLoading(false)
          return
        }

        const res = await fetch(`${apiBaseUrl}/api/orders/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()
        if (data.status === 'success') {
          setOrders(data.data)
        } else {
          setError(data.message || 'Failed to load orders')
        }
      } catch (err) {
        setError('A network error occurred. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [apiBaseUrl])

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price)

  return (
    <main className="orders-page">
      <div className="orders-shell">
        <div className="orders-page-header">
          <div>
            <span className="section-eyebrow">Customer Account</span>
            <h1>Your Order History</h1>
          </div>
          <button className="btn-outline" onClick={onBack}>
            Back to Shop
          </button>
        </div>

        {loading ? (
          <div className="orders-loading">Loading your order history...</div>
        ) : error ? (
          <div className="orders-error-msg">{error}</div>
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <h2>No orders found</h2>
            <p>You haven't placed any orders with Hermione Hair yet.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article key={order.id} className="customer-order-card">
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
                    <span className={`order-status-badge ${order.status}`}>
                      {order.status.toUpperCase()}
                    </span>
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
                    <h4>Shipping Address</h4>
                    <p className="order-address-text">
                      {order.shippingAddress.street}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                      Phone: {order.shippingAddress.phone}
                    </p>

                    {order.trackingNumber ? (
                      <div className="order-tracking-info">
                        <span className="tracking-label">Logistics Tracking Number:</span>
                        <div className="tracking-code-wrapper">
                          <code className="tracking-code">{order.trackingNumber}</code>
                          <span className="tracking-help-text">
                            An email has been sent with logistics portal details to track this parcel.
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="order-tracking-info pending">
                        <span className="tracking-label">Tracking Number:</span>
                        <p>Pending dispatch. You will be emailed a tracking link once shipped.</p>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
