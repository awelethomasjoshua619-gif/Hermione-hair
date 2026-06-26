import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Categories from './components/Categories'
import Bestsellers from './components/Bestsellers'
import Method from './components/Method'
import Newsletter from './components/Newsletter'
import Footer from './components/Footer'
import CartPage from './components/CartPage'
import FaqsPage from './components/FaqsPage'
import ContactPage from './components/ContactPage'
import PrivacyPolicyPage from './components/PrivacyPolicyPage'
import TermsOfServicePage from './components/TermsOfServicePage'
import TrackOrderPage from './components/TrackOrderPage'
import CustomerAuth from './components/CustomerAuth'
import CustomerOrders from './components/CustomerOrders'
import AdminPortal from './components/AdminPortal'
import AdminDashboard from './components/AdminDashboard'
import CartToast from './components/CartToast'
import BackToTop from './components/BackToTop'
import ChatWidget from './components/ChatWidget'
import './index.css'

const getApiBaseUrl = () => {
  const custom = localStorage.getItem('CUSTOM_API_BASE_URL')
  if (custom) return custom.trim().replace(/\/$/, '')
  return (import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`).replace(/\/$/, '')
}
const apiBaseUrl = getApiBaseUrl()

const normalizeCatalogKey = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const resolveCatalogProduct = (cartItem, dbProducts) => {
  const cartId = String(cartItem.id || '')
  const cartSlug = cartId.replace(/^best-/, '').replace(/^shop-/, '')
  const cartNameKey = normalizeCatalogKey(cartItem.name)

  return (
    dbProducts.find((product) => product.id === cartId) ||
    dbProducts.find((product) => product.slug === cartSlug) ||
    dbProducts.find((product) => product.slug === cartItem.slug) ||
    dbProducts.find((product) => normalizeCatalogKey(product.name) === cartNameKey) ||
    dbProducts.find(
      (product) =>
        product.slug === cartSlug ||
        product.slug.includes(cartSlug) ||
        cartSlug.includes(product.slug) ||
        normalizeCatalogKey(product.name).includes(cartNameKey) ||
        cartNameKey.includes(normalizeCatalogKey(product.name))
    )
  )
}

function App() {
  const [page, setPage] = useState('home')
  const [cartItems, setCartItems] = useState([])
  const [toast, setToast] = useState({ show: false, message: '' })
  
  // Authentication Sessions
  const [currentUser, setCurrentUser] = useState(null)
  const [adminUser, setAdminUser] = useState(null)
  
  // Checkout Shipping Form Modal
  const [showShippingModal, setShowShippingModal] = useState(false)
  const [shippingForm, setShippingForm] = useState({ street: '', city: '', state: '', phone: '' })
  const [checkoutPromoCode, setCheckoutPromoCode] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  // Initialize session state and path-based routing
  useEffect(() => {
    // 1. Restore sessions
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser && storedUser !== 'undefined') {
        setCurrentUser(JSON.parse(storedUser))
      }
    } catch (e) {
      console.error('Error parsing stored user:', e)
      localStorage.removeItem('user')
    }

    try {
      const storedAdmin = localStorage.getItem('adminUser')
      if (storedAdmin && storedAdmin !== 'undefined') {
        setAdminUser(JSON.parse(storedAdmin))
      }
    } catch (e) {
      console.error('Error parsing stored admin:', e)
      localStorage.removeItem('adminUser')
    }

    // 2. Simple Routing
    const path = window.location.pathname
    const params = new URLSearchParams(window.location.search)

    if (path === '/botanical-portal' || path === '/admin') {
      const adminToken = localStorage.getItem('adminAccessToken')
      if (adminToken) {
        setPage('admin-dashboard')
      } else {
        setPage('admin-portal')
      }
    } else if (path === '/verify-email') {
      setPage('verify-email')
    } else if (path === '/privacy-policy') {
      setPage('privacy-policy')
    } else if (path === '/terms-of-service') {
      setPage('terms-of-service')
    } else if (path === '/track-order') {
      setPage('track-order')
    } else if (path === '/payment-callback') {
      const reference = params.get('reference')
      if (reference) {
        setCartItems([]) // Clear cart
        showToast('Payment successful! Your order is confirmed.')
        setPage('orders')
      }
    }

    // Log site visit
    logSiteVisit(path)
  }, [])

  const logSiteVisit = async (path) => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`${apiBaseUrl}/api/analytics/visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ path }),
      })
    } catch (e) {
      // Non-blocking logger failure
    }
  }

  const showToast = (message) => {
    setToast({ show: true, message })
    setTimeout(() => setToast({ show: false, message: '' }), 3000)
  }

  const scrollToSection = (id) => {
    setPage('home')
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }, 0)
  }

  const goHome = () => {
    setPage('home')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
    logSiteVisit('/')
  }

  const goCart = () => {
    setPage('cart')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
    logSiteVisit('/cart')
  }

  const goFaqs = () => {
    setPage('faqs')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
    logSiteVisit('/faqs')
  }

  const goContact = () => {
    setPage('contact')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
    logSiteVisit('/contact')
  }

  const goPrivacyPolicy = () => {
    setPage('privacy-policy')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
    logSiteVisit('/privacy-policy')
  }

  const goTermsOfService = () => {
    setPage('terms-of-service')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
    logSiteVisit('/terms-of-service')
  }

  const goTrackOrder = () => {
    setPage('track-order')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
    logSiteVisit('/track-order')
  }

  const goOrders = () => {
    setPage('orders')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
    logSiteVisit('/orders')
  }

  const goLogin = () => {
    setPage('login')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
    logSiteVisit('/login')
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setCurrentUser(null)
    goHome()
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('adminAccessToken')
    localStorage.removeItem('adminRefreshToken')
    localStorage.removeItem('adminUser')
    setAdminUser(null)
    goHome()
  }

  const addToCart = (product) => {
    setCartItems((items) => {
      const existing = items.find((item) => item.id === product.id)
      if (existing) {
        return items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...items, { ...product, quantity: 1 }]
    })
    showToast(`${product.name} added to cart!`)
  }

  const updateQuantity = (id, quantity) => {
    setCartItems((items) =>
      items
        .map((item) => (item.id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (id) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  // --- Checkout Processing ---
  const handleCheckoutTrigger = (promoCode) => {
    setCheckoutError('')
    if (!currentUser) {
      showToast('Please log in or register before checking out.')
      goLogin()
      return
    }

    if (!currentUser.isVerified) {
      setPage('verify-email-pending')
      return
    }

    setCheckoutPromoCode(promoCode)
    setShowShippingModal(true)
  }

  const handleShippingSubmit = async (e) => {
    e.preventDefault()
    setCheckoutLoading(true)
    setCheckoutError('')

    const token = localStorage.getItem('accessToken')

    try {
      // 1. Fetch DB Products list to resolve cart IDs to database UUIDs
      const pRes = await fetch(`${apiBaseUrl}/api/products`)
      const pData = await pRes.json()

      if (pData.status !== 'success') {
        throw new Error('Could not resolve product information from database')
      }

      const dbProducts = pData.data

      // 2. Map cart items
      const mappedItems = cartItems.map((item) => {
        const match = resolveCatalogProduct(item, dbProducts)

        if (!match) {
          throw new Error(`Product ${item.name} not found in catalog`)
        }

        return {
          productId: match.id,
          quantity: item.quantity,
        }
      })

      // 3. Post checkout
      const response = await fetch(`${apiBaseUrl}/api/cart/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: mappedItems,
          discountCode: checkoutPromoCode || undefined,
          shippingAddress: shippingForm,
        }),
      })

      const checkoutData = await response.json()

      if (response.status === 200 && checkoutData.status === 'success') {
        // Redirect to Paystack Checkout URL
        window.location.href = checkoutData.data.authorization_url
      } else {
        setCheckoutError(checkoutData.message || 'Checkout failed')
      }
    } catch (err) {
      setCheckoutError(err.message || 'An error occurred during checkout initialization')
    } finally {
      setCheckoutLoading(false)
    }
  }

  // --- Verify Email Loading Component ---
  const VerifyEmailHandler = () => {
    const [status, setStatus] = useState('Verifying your email address...')
    const [err, setErr] = useState('')

    useEffect(() => {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      const email = params.get('email')

      if (token && email) {
        fetch(`${apiBaseUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.status === 'success') {
              setStatus('Verification successful! You can now checkout.')
              // Update local state if verified
              if (currentUser && currentUser.email === email) {
                const updated = { ...currentUser, isVerified: true }
                localStorage.setItem('user', JSON.stringify(updated))
                setCurrentUser(updated)
              }
            } else {
              setErr(data.message)
            }
          })
          .catch(() => setErr('A connection error occurred.'))
      } else {
        setErr('Invalid verification link.')
      }
    }, [])

    return (
      <main className="auth-page">
        <div className="auth-shell">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', color: '#2E4A3F' }}>Account Verification</h2>
            {err ? (
              <div className="auth-error-msg" style={{ marginTop: '20px' }}>{err}</div>
            ) : (
              <div style={{ marginTop: '20px' }}>{status}</div>
            )}
            <button className="btn-primary" style={{ marginTop: '30px', background: '#2E4A3F' }} onClick={goHome}>
              Back to Home
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Header and Footer render conditional
  const isDashboard = page === 'admin-dashboard'

  return (
    <>
      {!isDashboard && (
        <Navbar
          cartCount={cartCount}
          onNavigate={scrollToSection}
          onHome={goHome}
          onCartClick={goCart}
          currentUser={currentUser}
          onUserClick={currentUser ? goOrders : goLogin}
          onLogout={handleLogout}
        />
      )}

      {/* Main Pages router */}
      {page === 'admin-dashboard' ? (
        <AdminDashboard apiBaseUrl={apiBaseUrl} onLogout={handleAdminLogout} />
      ) : page === 'admin-portal' ? (
        <AdminPortal
          apiBaseUrl={apiBaseUrl}
          onAuthSuccess={(user) => {
            setAdminUser(user)
            setPage('admin-dashboard')
          }}
          onBack={goHome}
        />
      ) : page === 'login' ? (
        <CustomerAuth
          apiBaseUrl={apiBaseUrl}
          initialView="login"
          onAuthSuccess={(user) => {
            setCurrentUser(user)
            goHome()
          }}
          onBack={goHome}
        />
      ) : page === 'orders' ? (
        <CustomerOrders apiBaseUrl={apiBaseUrl} onBack={goHome} />
      ) : page === 'verify-email' ? (
        <VerifyEmailHandler />
      ) : page === 'verify-email-pending' ? (
        <main className="auth-page">
          <div className="auth-shell">
            <div className="auth-card" style={{ textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', color: '#2E4A3F' }}>Verification Required</h2>
              <div className="auth-error-msg" style={{ marginTop: '20px' }}>
                Please click the verification link sent to your email to verify your address before you can checkout.
              </div>
              <button className="btn-primary" style={{ marginTop: '20px', background: '#2E4A3F' }} onClick={goHome}>
                Continue Browsing
              </button>
            </div>
          </div>
        </main>
      ) : page === 'cart' ? (
        <CartPage
          items={cartItems}
          onQuantityChange={updateQuantity}
          onRemove={removeFromCart}
          onContinueShopping={() => scrollToSection('bestsellers')}
          onCheckout={handleCheckoutTrigger}
        />
      ) : page === 'faqs' ? (
        <FaqsPage onBack={goHome} />
      ) : page === 'contact' ? (
        <ContactPage onBack={goHome} />
      ) : page === 'privacy-policy' ? (
        <PrivacyPolicyPage onBack={goHome} />
      ) : page === 'terms-of-service' ? (
        <TermsOfServicePage onBack={goHome} />
      ) : page === 'track-order' ? (
        <TrackOrderPage apiBaseUrl={apiBaseUrl} onBack={goHome} />
      ) : (

        <>
          <Hero />
          <Marquee />
          <Categories addToCart={addToCart} />
          <Bestsellers addToCart={addToCart} />
          <Method />
          <Newsletter />
        </>
      )}

      {!isDashboard && (
        <Footer
          onNavigate={(target) => {
            if (target === 'faqs') goFaqs()
            else if (target === 'contact') goContact()
            else if (target === 'privacy-policy') goPrivacyPolicy()
            else if (target === 'terms-of-service') goTermsOfService()
            else if (target === 'track-order') goTrackOrder()
            else goHome()
          }}
        />
      )}

      {/* Shipping Address Dialog Modal */}
      {showShippingModal && (
        <div className="admin-form-modal">
          <form onSubmit={handleShippingSubmit} className="admin-form-card">
            <h2 style={{ fontFamily: 'var(--font-display)', color: '#2E4A3F' }}>Delivery Address</h2>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '20px' }}>Enter the shipping details for your package delivery across Nigeria.</p>
            
            {checkoutError && <div className="admin-error-msg">{checkoutError}</div>}

            <div className="form-group">
              <label>Street Address</label>
              <input type="text" required placeholder="e.g. 15 Ikoyi Road" value={shippingForm.street} onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input type="text" required placeholder="e.g. Lagos" value={shippingForm.city} onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })} />
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" required placeholder="e.g. Lagos State" value={shippingForm.state} onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label>Delivery Phone Number</label>
              <input type="tel" required placeholder="e.g. +234 803 123 4567" value={shippingForm.phone} onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })} />
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setShowShippingModal(false)} className="btn-outline" disabled={checkoutLoading}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ background: '#2E4A3F' }} disabled={checkoutLoading}>
                {checkoutLoading ? 'Redirecting to Paystack...' : 'Proceed to Payment'}
              </button>
            </div>
          </form>
        </div>
      )}

      <CartToast show={toast.show} message={toast.message} />
      <BackToTop />
      <ChatWidget />
    </>
  )
}

export default App









