import { useState, useEffect } from 'react'
import { fallbackProductImage, normalizeProductImageName, resolveProductImage } from '../utils/productImages'
import { storefrontProducts } from '../utils/storefrontProducts'

export default function AdminDashboard({ apiBaseUrl, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'products' | 'orders' | 'users' | 'discounts' | 'logs'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Overview Data
  const [overview, setOverview] = useState({ stats: { lifetimeRevenue: 0, totalOrders: 0, totalCustomers: 0 }, lowStock: [], activities: [] })
  
  // Analytics State
  const [analyticsPeriod, setAnalyticsPeriod] = useState('week') // 'week' | 'month'
  const [visitorAnalytics, setVisitorAnalytics] = useState({ totalVisits: 0, uniqueVisitors: 0, chartData: [] })
  const [salesAnalytics, setSalesAnalytics] = useState({ totalRevenue: 0, totalOrders: 0, totalItemsSold: 0, chartData: [] })
  const [topSellers, setTopSellers] = useState({ topByUnits: [], topByRevenue: [] })

  // Entities lists
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [discounts, setDiscounts] = useState([])
  const [auditLogs, setAuditLogs] = useState([])

  // Modal / Dialog States
  const [editingProduct, setEditingProduct] = useState(null) // null or product object
  const [editingDiscount, setEditingDiscount] = useState(null) // null or discount object
  const [trackingOrder, setTrackingOrder] = useState(null) // null or order object
  const [messagingUser, setMessagingUser] = useState(null) // null or customer object
  const [showProductForm, setShowProductForm] = useState(false)
  const [showDiscountForm, setShowDiscountForm] = useState(false)
  const [showMessageForm, setShowMessageForm] = useState(false)

  // Form Fields
  const emptyProductForm = { name: '', description: '', functionTag: 'Nourish', price: '', compareAtPrice: '', stockQuantity: '', images: '', tags: '', isExcludedFromPromos: false }
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [discountForm, setDiscountForm] = useState({ code: '', type: 'percentage', value: '', appliesToProductIds: '', global: true, startDate: '', endDate: '', active: true })
  const [trackingForm, setTrackingForm] = useState({ trackingNumber: '', logisticsCompany: '' })
  const [messageForm, setMessageForm] = useState({ subject: '', message: '' })

  // Filters / Pagination
  const [productSearch, setProductSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [userStatusFilter, setUserStatusFilter] = useState('all')

  const getHeaders = () => {
    const token = localStorage.getItem('adminAccessToken')
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }

  // Fetch data depending on tab
  useEffect(() => {
    fetchTabData()
  }, [activeTab, analyticsPeriod])

  const fetchTabData = async () => {
    setError('')
    setSuccess('')
    const headers = getHeaders()

    try {
      if (activeTab === 'overview') {
        const res = await fetch(`${apiBaseUrl}/api/admin/analytics/overview`, { headers })
        const data = await res.json()
        if (data.status === 'success') {
          setOverview(data.data)
        }

        // Expose visitor & sales analytics in overview too
        const vRes = await fetch(`${apiBaseUrl}/api/admin/analytics/visitors?period=${analyticsPeriod}`, { headers })
        const vData = await vRes.json()
        if (vData.status === 'success') setVisitorAnalytics(vData.data)

        const sRes = await fetch(`${apiBaseUrl}/api/admin/analytics/sales?period=${analyticsPeriod}`, { headers })
        const sData = await sRes.json()
        if (sData.status === 'success') setSalesAnalytics(sData.data)

        const tRes = await fetch(`${apiBaseUrl}/api/admin/analytics/top-seller?period=${analyticsPeriod}`, { headers })
        const tData = await tRes.json()
        if (tData.status === 'success') setTopSellers(tData.data)
      } else if (activeTab === 'products') {
        const res = await fetch(`${apiBaseUrl}/api/products?limit=200`)
        const data = await res.json()
        if (data.status === 'success') setProducts(mergeStorefrontProducts(data.data))
        else setError(data.message || 'Failed to load products')
      } else if (activeTab === 'orders') {
        const res = await fetch(`${apiBaseUrl}/api/admin/orders?limit=100`, { headers })
        const data = await res.json()
        if (data.status === 'success') setOrders(data.data)
        else setError(data.message || 'Failed to load orders')
      } else if (activeTab === 'users') {
        const res = await fetch(`${apiBaseUrl}/api/admin/users?limit=100`, { headers })
        const data = await res.json()
        if (data.status === 'success') setUsers(data.data)
        else setError(data.message || 'Failed to load customers')
      } else if (activeTab === 'discounts') {
        const res = await fetch(`${apiBaseUrl}/api/admin/discounts`, { headers })
        const data = await res.json()
        if (data.status === 'success') setDiscounts(data.data)
        else setError(data.message || 'Failed to load discounts')
      } else if (activeTab === 'logs') {
        const res = await fetch(`${apiBaseUrl}/api/admin/audit-log`, { headers })
        const data = await res.json()
        if (data.status === 'success') setAuditLogs(data.data)
        else setError(data.message || 'Failed to load logs')
      }
    } catch (err) {
      setError('Session expired or connection failed. Please log in again.')
    }
  }

  // --- CSV Export Helpers ---
  const exportToCSV = (filename, headers, rows) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleUsersCSVExport = () => {
    const headers = ['Name', 'Email', 'Verified', 'Signup Date', 'Last Seen', 'Status', 'Total Orders', 'Lifetime Spend (NGN)']
    const rows = users.map((u) => [
      `"${u.name}"`,
      u.email,
      u.isVerified ? 'Yes' : 'No',
      new Date(u.createdAt).toISOString().split('T')[0],
      new Date(u.lastSeenAt).toISOString().split('T')[0],
      u.status,
      u.totalOrders,
      u.lifetimeSpend,
    ])
    exportToCSV('customers_list.csv', headers, rows)
  }

  const handleSalesCSVExport = () => {
    const headers = ['Date', 'Visitors', 'Unique Visitors', 'Orders Paid', 'Sales Revenue (NGN)', 'Items Sold']
    const rows = salesAnalytics.chartData.map((day) => {
      const vDay = visitorAnalytics.chartData.find((vd) => vd.date === day.date) || { visits: 0, uniqueVisitors: 0 }
      return [day.date, vDay.visits, vDay.uniqueVisitors, '--', day.revenue, '--']
    })
    exportToCSV('sales_analytics.csv', headers, rows)
  }

  const syncMissingStorefrontProducts = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    const headers = getHeaders()

    try {
      const existingBySlug = new Set(products.map((product) => product.slug))
      let createdCount = 0

      for (const product of storefrontProducts) {
        if (existingBySlug.has(product.slug)) continue

        const res = await fetch(`${apiBaseUrl}/api/admin/products`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: product.name,
            description: product.description,
            functionTag: product.functionTag,
            price: product.price,
            compareAtPrice: null,
            stockQuantity: product.stockQuantity,
            images: [product.image],
            tags: product.tags || [],
            isExcludedFromPromos: false,
          }),
        })

        const data = await res.json()
        if (data.status === 'success') createdCount += 1
      }

      setSuccess(createdCount > 0 ? `Synced ${createdCount} storefront product(s) into the admin database.` : 'All storefront products are already synced.')
      fetchTabData()
    } catch (err) {
      setError('Failed to sync storefront products')
    } finally {
      setLoading(false)
    }
  }

  // --- CRUD Operations ---
  const handleProductSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const headers = getHeaders()

    const body = {
      ...productForm,
      price: parseInt(productForm.price, 10),
      compareAtPrice: productForm.compareAtPrice ? parseInt(productForm.compareAtPrice, 10) : null,
      stockQuantity: parseInt(productForm.stockQuantity, 10),
      images: productForm.images.split(',').map((img) => img.trim()).filter(Boolean),
      tags: productForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    }

    try {
      let res
      // Storefront placeholders have a fake id — always create via POST
      if (editingProduct && !editingProduct.isStorefrontPlaceholder) {
        res = await fetch(`${apiBaseUrl}/api/admin/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch(`${apiBaseUrl}/api/admin/products`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        })
      }

      const data = await res.json()
      if (data.status === 'success') {
        setSuccess(editingProduct && !editingProduct.isStorefrontPlaceholder ? 'Product updated successfully' : 'Product synced to admin catalog successfully')
        setShowProductForm(false)
        setEditingProduct(null)
        setProductForm(emptyProductForm)
        fetchTabData()
      } else {
        setError(data.message || 'Operation failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    setError('')
    const headers = getHeaders()

    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers,
      })
      const data = await res.json()
      if (data.status === 'success') {
        setSuccess('Product deleted successfully')
        fetchTabData()
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to delete product')
    }
  }

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this customer account? All their site visits and order history will also be deleted.')) return
    setError('')
    setSuccess('')
    const headers = getHeaders()

    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers,
      })
      const data = await res.json()
      if (data.status === 'success') {
        setSuccess('Customer account deleted successfully')
        fetchTabData()
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to delete customer')
    }
  }

  const handleDeleteAllCustomers = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete ALL customer accounts (excluding admin). This cannot be undone. Are you sure?')) return
    if (!confirm('Final confirmation: Delete ALL customers?')) return
    setError('')
    setSuccess('')
    setLoading(true)
    const headers = getHeaders()
    try {
      // Delete all non-admin users one by one using existing endpoint
      let deleted = 0
      for (const user of users) {
        const res = await fetch(`${apiBaseUrl}/api/admin/users/${user.id}`, { method: 'DELETE', headers })
        const data = await res.json()
        if (data.status === 'success') deleted++
      }
      setSuccess(`Successfully deleted ${deleted} customer account(s)`)
      fetchTabData()
    } catch (err) {
      setError('Failed to delete all customers')
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePromo = async (id) => {
    setError('')
    const token = localStorage.getItem('adminAccessToken')
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/products/${id}/exclude`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (data.status === 'success') {
        setSuccess('Promo exclusion toggled successfully')
        fetchTabData()
      } else {
        setError(data.message || 'Failed to toggle promo')
      }
    } catch (err) {
      setError('Failed to update promo setting. Check your connection.')
    }
  }

  // --- Orders & Logistics ---
  const handleOrderStatusUpdate = async (id, status) => {
    setError('')
    const headers = getHeaders()

    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.status === 'success') {
        setSuccess('Order status updated')
        fetchTabData()
      }
    } catch (err) {
      setError('Failed to update status')
    }
  }

  const handleTrackingSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const headers = getHeaders()

    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/orders/${trackingOrder.id}/tracking`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(trackingForm),
      })
      const data = await res.json()
      if (data.status === 'success') {
        setSuccess('Logistics tracking set. Customer notified by email.')
        setTrackingOrder(null)
        setTrackingForm({ trackingNumber: '', logisticsCompany: '' })
        fetchTabData()
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to configure tracking')
    } finally {
      setLoading(false)
    }
  }

  const handleMessageSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const headers = getHeaders()

    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/users/${messagingUser.id}/email`, {
        method: 'POST',
        headers,
        body: JSON.stringify(messageForm),
      })
      const data = await res.json()
      if (data.status === 'success') {
        setSuccess(data.message || 'Message sent to customer')
        setMessagingUser(null)
        setShowMessageForm(false)
        setMessageForm({ subject: '', message: '' })
      } else {
        setError(data.message || 'Failed to send message')
      }
    } catch (err) {
      setError('Failed to send message')
    } finally {
      setLoading(false)
    }
  }
  // --- Discounts ---
  const handleDiscountSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const headers = getHeaders()

    const body = {
      ...discountForm,
      value: parseInt(discountForm.value, 10),
      appliesToProductIds: discountForm.appliesToProductIds ? discountForm.appliesToProductIds.split(',').map((id) => id.trim()) : [],
      startDate: new Date(discountForm.startDate).toISOString(),
      endDate: new Date(discountForm.endDate).toISOString(),
    }

    try {
      let res
      if (editingDiscount) {
        res = await fetch(`${apiBaseUrl}/api/admin/discounts/${editingDiscount.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch(`${apiBaseUrl}/api/admin/discounts`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        })
      }

      const data = await res.json()
      if (data.status === 'success') {
        setSuccess(editingDiscount ? 'Discount updated' : 'Discount created')
        setShowDiscountForm(false)
        setEditingDiscount(null)
        setDiscountForm({ code: '', type: 'percentage', value: '', appliesToProductIds: '', global: true, startDate: '', endDate: '', active: true })
        fetchTabData()
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Discount setup failed')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price)

  const navTo = (tab) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  const createStorefrontPlaceholder = (product, storefrontOrder) => ({
    id: `storefront-${product.slug}`,
    slug: product.slug,
    name: product.name,
    description: product.description,
    functionTag: product.functionTag,
    price: product.price,
    compareAtPrice: null,
    stockQuantity: product.stockQuantity,
    images: [product.image],
    tags: product.tags,
    isExcludedFromPromos: false,
    storefrontOrder,
    isStorefrontPlaceholder: true,
  })

  const mergeStorefrontProducts = (dbProducts) => {
    const dbBySlug = new Map(dbProducts.map((product) => [product.slug, product]))
    const merged = storefrontProducts.map((storeProduct, index) => {
      const dbProduct = dbBySlug.get(storeProduct.slug)
      if (dbProduct) {
        dbBySlug.delete(storeProduct.slug)
        return { ...dbProduct, storefrontOrder: index, isStorefrontPlaceholder: false }
      }
      return createStorefrontPlaceholder(storeProduct, index)
    })

    return [
      ...merged,
      ...Array.from(dbBySlug.values()).map((product, index) => ({
        ...product,
        storefrontOrder: storefrontProducts.length + index,
        isStorefrontPlaceholder: false,
      })),
    ]
  }

  const productToForm = (product) => ({
    name: product.name,
    description: product.description,
    functionTag: product.functionTag,
    price: product.price,
    compareAtPrice: product.compareAtPrice || '',
    stockQuantity: product.stockQuantity,
    images: (product.images || []).map(normalizeProductImageName).join(','),
    tags: (product.tags || []).join(','),
    isExcludedFromPromos: product.isExcludedFromPromos,
  })

  const beginProductEdit = (product) => {
    setEditingProduct(product)
    setProductForm(productToForm(product))
    setShowProductForm(true)
  }

  const filteredProducts = products.filter((product) => {
    const query = productSearch.trim().toLowerCase()
    if (!query) return true
    return [product.name, product.slug, product.description, product.functionTag, ...(product.tags || [])]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))
  })

  return (
    <div className="admin-dashboard-container">

      {/* Mobile Top Bar with Hamburger */}
      <div className="admin-mobile-topbar">
        <button className="admin-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
        <span className="admin-mobile-title">Hermione <em>Hair</em> Admin</span>
      </div>

      {/* Dark overlay when sidebar is open on mobile */}
      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <h2>Hermione <span>Hair</span></h2>
          <p>Admin Control Panel</p>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close menu">✕</button>
        </div>
        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Analytics</span>
          <button className={`nav-item${activeTab === 'overview' ? ' active' : ''}`} onClick={() => navTo('overview')}>Overview & Analytics</button>
          <span className="sidebar-section-label">Store Management</span>
          <button className={`nav-item${activeTab === 'products' ? ' active' : ''}`} onClick={() => navTo('products')}>Products Manager</button>
          <button className={`nav-item${activeTab === 'orders' ? ' active' : ''}`} onClick={() => navTo('orders')}>Orders Manager</button>
          <button className={`nav-item${activeTab === 'discounts' ? ' active' : ''}`} onClick={() => navTo('discounts')}>Discount Coupons</button>
          <span className="sidebar-section-label">Accounts</span>
          <button className={`nav-item${activeTab === 'users' ? ' active' : ''}`} onClick={() => navTo('users')}>Customer Directory</button>
          <button className={`nav-item${activeTab === 'logs' ? ' active' : ''}`} onClick={() => navTo('logs')}>Audit Logs</button>
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={onLogout}>↩ Sign Out</button>
        </div>
      </aside>

      {/* Main Dashboard Space */}
      <main className="admin-main">
        {/* Status Banners */}
        {error && <div className="admin-banner error">{error}</div>}
        {success && <div className="admin-banner success">{success}</div>}

        {/* Tab 1: Overview & Analytics */}
        {activeTab === 'overview' && (
          <div className="tab-view overview-view">
            <div className="view-header">
              <h1>Storefront Performance Overview</h1>
              <div className="header-actions">
                <select value={analyticsPeriod} onChange={(e) => setAnalyticsPeriod(e.target.value)} className="select-period">
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                </select>
                <button onClick={handleSalesCSVExport} className="btn-outline">Export Sales Data (CSV)</button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="stats-row">
              <div className="stat-card">
                <h3>Total Lifetime Revenue</h3>
                <strong>{formatPrice(overview.stats.lifetimeRevenue)}</strong>
              </div>
              <div className="stat-card">
                <h3>Total Orders</h3>
                <strong>{overview.stats.totalOrders}</strong>
              </div>
              <div className="stat-card">
                <h3>Total Customers</h3>
                <strong>{overview.stats.totalCustomers}</strong>
              </div>
              <div className="stat-card">
                <h3>Unique Visitors ({analyticsPeriod === 'week' ? '7d' : '30d'})</h3>
                <strong>{visitorAnalytics.uniqueVisitors}</strong>
              </div>
            </div>

            <div className="dashboard-grid">
              {/* Analytics Charts */}
              <div className="dashboard-card chart-container">
                <h3>Sales Revenue Trend</h3>
                <div className="svg-chart-wrapper">
                  <svg viewBox="0 0 500 200" className="svg-chart">
                    {salesAnalytics.chartData.length > 0 && (
                      <>
                        {salesAnalytics.chartData.map((d, index) => {
                          const maxRev = Math.max(...salesAnalytics.chartData.map((cd) => cd.revenue), 1)
                          const barHeight = (d.revenue / maxRev) * 150
                          const x = (index / salesAnalytics.chartData.length) * 450 + 25
                          return (
                            <g key={d.date}>
                              <rect x={x} y={170 - barHeight} width="8" height={barHeight} fill="#2E4A3F" rx="2" />
                              <text x={x - 2} y="185" fontSize="6" fill="#888">{d.date.substring(5)}</text>
                            </g>
                          )
                        })}
                      </>
                    )}
                  </svg>
                </div>
              </div>

              {/* Low Stock Alerts */}
              <div className="dashboard-card alerts-feed">
                <h3>⚠️ Low Stock Alerts</h3>
                {overview.lowStock.length === 0 ? (
                  <p className="no-data-msg">All product stock counts are above warning threshold.</p>
                ) : (
                  <ul className="alerts-list">
                    {overview.lowStock.map((prod) => (
                      <li key={prod.id} className="stock-alert-item">
                        <span>{prod.name}</span>
                        <strong className="stock-qty warning">{prod.stockQuantity} remaining</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Top Selling Products */}
              <div className="dashboard-card top-sellers">
                <h3>Best Selling Products</h3>
                <div className="sellers-split">
                  <div>
                    <h4>By Volume (Units Sold)</h4>
                    <ul>
                      {topSellers.topByUnits.map((item, i) => (
                        <li key={item.productId}>{i+1}. {item.name} ({item.unitsSold} units)</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4>By Revenue Generation</h4>
                    <ul>
                      {topSellers.topByRevenue.map((item, i) => (
                        <li key={item.productId}>{i+1}. {item.name} ({formatPrice(item.revenue)})</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="dashboard-card activity-feed">
                <h3>⚡ Recent Activity Feed</h3>
                <ul className="activity-list">
                  {overview.activities.map((act, i) => (
                    <li key={i} className="activity-item">
                      <div className="act-details">
                        <strong>{act.title}</strong>
                        <p>{act.desc}</p>
                      </div>
                      <span className="act-time">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products Manager */}
        {activeTab === 'products' && (
          <div className="tab-view products-view">
            <div className="view-header">
              <h1>Products Inventory Manager</h1>
              <div className="header-actions">
                <input
                  className="table-search"
                  type="search"
                  placeholder="Search products, descriptions, tags..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
                <button onClick={syncMissingStorefrontProducts} className="btn-outline" disabled={loading}>Sync Missing Products</button>
                <button onClick={() => { setEditingProduct(null); setProductForm(emptyProductForm); setShowProductForm(true) }} className="btn-primary" style={{ background: '#2E4A3F' }}>Add New Product</button>
              </div>
            </div>

            {/* Product Edit / Creation Form Dialog */}
            {showProductForm && (
              <div className="admin-form-modal">
                <form onSubmit={handleProductSubmit} className="admin-form-card">
                  <h2>{editingProduct?.isStorefrontPlaceholder ? 'Add Store Product to Admin' : editingProduct ? 'Update Product Details' : 'Create Product Entry'}</h2>
                  {editingProduct?.isStorefrontPlaceholder && (
                     <p>This product will be synced into the catalog so future edits update the live store data.</p>
                  )}
                  
                  <div className="form-group">
                    <label>Product Name</label>
                    <input type="text" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea required value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Function Tag (e.g. Cleanse, Nourish, Protect)</label>
                      <input type="text" required value={productForm.functionTag} onChange={(e) => setProductForm({ ...productForm, functionTag: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Selling Price (NGN)</label>
                      <input type="number" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Compare-at Price (Optional NGN)</label>
                      <input type="number" value={productForm.compareAtPrice} onChange={(e) => setProductForm({ ...productForm, compareAtPrice: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Stock Quantity</label>
                      <input type="number" required value={productForm.stockQuantity} onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Image Filenames (Comma-separated)</label>
                    <input type="text" placeholder="hair-butter.png, edge-growth-cream.png" value={productForm.images} onChange={(e) => setProductForm({ ...productForm, images: e.target.value })} />
                    {productForm.images && (
                      <div className="admin-image-preview">
                        <img
                          src={resolveProductImage(productForm.images.split(',')[0].trim())}
                          alt="Product preview"
                          onError={(e) => { e.currentTarget.src = fallbackProductImage }}
                        />
                        <span>{productForm.images.split(',')[0].trim()}</span>
                      </div>
                    )}
                    <small style={{ color: '#999', marginTop: '8px', display: 'block' }}>
                      Upload images to frontend/public/products/ folder to make them available
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Tags (Comma-separated)</label>
                    <input type="text" placeholder="bestseller, shampoo, treatment" value={productForm.tags} onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })} />
                  </div>

                  <div className="form-group checkbox-group">
                    <input type="checkbox" id="ex-promos" checked={productForm.isExcludedFromPromos} onChange={(e) => setProductForm({ ...productForm, isExcludedFromPromos: e.target.checked })} />
                    <label htmlFor="ex-promos">Exclude from sitewide discount promotions</label>
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={() => setShowProductForm(false)} className="btn-outline">Cancel</button>
                    <button type="submit" className="btn-primary" style={{ background: '#2E4A3F' }}>Save Product</button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Table */}
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Function</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Excl. Promos</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <div className="admin-product-cell">
                          <img
                            className="admin-product-thumb"
                            src={prod.images && prod.images.length > 0 ? resolveProductImage(prod.images[0]) : fallbackProductImage}
                            alt={prod.name}
                            onError={(e) => { e.currentTarget.src = fallbackProductImage }}
                          />
                          <div>
                            <strong>{prod.name}</strong>
                            <span className="table-sub">{prod.slug}</span>
                            {prod.isStorefrontPlaceholder && <span className="order-status-badge pending" style={{ marginTop: '6px' }}>Needs sync</span>}
                            <span className="table-desc">{prod.description}</span>
                            <span className="table-sub" style={{ display: 'block', marginTop: '3px', fontSize: '0.7rem' }}>
                              {prod.images && prod.images.length > 0 ? `📷 ${prod.images.map(normalizeProductImageName).join(', ')}` : '❌ No images'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>{prod.functionTag}</td>
                      <td>{formatPrice(prod.price)}</td>
                      <td className={prod.stockQuantity <= 10 ? 'warning-text' : ''}>{prod.stockQuantity}</td>
                      <td>{prod.isExcludedFromPromos ? 'Yes' : 'No'}</td>
                      <td>
                        <button onClick={() => beginProductEdit(prod)} className="btn-table-action text-edit">
                          Edit
                        </button>
                        {!prod.isStorefrontPlaceholder && (
                          <>
                            <button onClick={() => handleTogglePromo(prod.id)} className="btn-table-action text-toggle">Toggle Promo</button>
                            <button onClick={() => handleDeleteProduct(prod.id)} className="btn-table-action text-delete">Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Orders Manager */}
        {activeTab === 'orders' && (
          <div className="tab-view orders-view">
            <div className="view-header">
              <h1>Customer Orders Dispatch</h1>
            </div>

            {/* Message Customer Dialog */}
            {showMessageForm && messagingUser && (
              <div className="admin-form-modal">
                <form onSubmit={handleMessageSubmit} className="admin-form-card">
                  <h2>Email Customer</h2>
                  <p>Send a message to <strong>{messagingUser.name}</strong> ({messagingUser.email})</p>
                  <div className="form-group">
                    <label>Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Order update"
                      value={messageForm.subject}
                      onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea
                      required
                      rows="6"
                      placeholder="Write your message to the customer..."
                      value={messageForm.message}
                      onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => { setShowMessageForm(false); setMessagingUser(null) }} className="btn-outline" disabled={loading}>Cancel</button>
                    <button type="submit" className="btn-primary" style={{ background: '#2E4A3F' }} disabled={loading}>
                      {loading ? 'Sending...' : 'Send Email'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            {/* Tracking / Shipping Form Dialog */}
            {trackingOrder && (
              <div className="admin-form-modal">
                <form onSubmit={handleTrackingSubmit} className="admin-form-card">
                  <h2>Configure Tracking Details</h2>
                  <p>Order ID: {trackingOrder.id}</p>
                  <div className="form-group">
                    <label>Logistics Company</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DHL, GIG Logistics"
                      value={trackingForm.logisticsCompany}
                      onChange={(e) => setTrackingForm({ ...trackingForm, logisticsCompany: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tracking Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 732948231"
                      value={trackingForm.trackingNumber}
                      onChange={(e) => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setTrackingOrder(null)} className="btn-outline">Cancel</button>
                    <button type="submit" className="btn-primary" style={{ background: '#2E4A3F' }}>Set Tracking</button>
                  </div>
                </form>
              </div>
            )}

            {/* Orders Table */}
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Logistics</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="monospace" style={{ fontSize: '0.8rem' }}>{order.id.slice(0, 8)}...</td>
                      <td>
                        <div>
                          <strong>{order.user?.name || 'Guest'}</strong>
                          <span className="table-sub" style={{ display: 'block' }}>{order.user?.email}</span>
                          <span className="table-sub" style={{ display: 'block', fontSize: '0.7rem' }}>
                            📞 {order.shippingAddress?.phone || 'No phone'}
                          </span>
                        </div>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>{formatPrice(order.totalAmount)}</td>
                      <td>
                        <span className={`order-status-badge ${order.status}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {order.trackingNumber ? (
                          <div>
                            <strong>{order.logisticsCompany}</strong>
                            <span className="table-sub" style={{ display: 'block' }}>#{order.trackingNumber}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setTrackingOrder(order)
                              setTrackingForm({ trackingNumber: '', logisticsCompany: '' })
                            }}
                            className="btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            Set Tracking
                          </button>
                        )}
                      </td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                          style={{ padding: '4px', fontSize: '0.8rem' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Customer Directory */}
        {activeTab === 'users' && (
          <div className="tab-view users-view">
            <div className="view-header">
              <h1>Registered Customers</h1>
              <div className="header-actions">
                <button onClick={fetchTabData} className="btn-outline">↻ Refresh</button>
                <button onClick={handleUsersCSVExport} className="btn-outline">Export CSV</button>
                <button
                  onClick={handleDeleteAllCustomers}
                  className="btn-primary"
                  style={{ background: '#dc2626' }}
                >
                  ⚠️ Delete All Customers
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Total Orders</th>
                    <th>LTV (Spend)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((usr) => (
                    <tr key={usr.id}>
                      <td><strong>{usr.name}</strong></td>
                      <td>{usr.email}</td>
                      <td>
                        <span className={`user-status-tag ${usr.status}`}>
                          {usr.status.toUpperCase()}
                        </span>
                      </td>
                      <td>{new Date(usr.createdAt).toLocaleDateString()}</td>
                      <td>{usr.totalOrders} orders</td>
                      <td>{formatPrice(usr.lifetimeSpend)}</td>
                      <td>
                                                <button
                          onClick={() => { setMessagingUser(usr); setShowMessageForm(true); setMessageForm({ subject: '', message: '' }) }}
                          className="btn-table-action text-edit"
                          style={{ color: '#2E4A3F', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginRight: '12px' }}
                        >
                          Email
                        </button>
                        <button
                          onClick={() => handleDeleteUser(usr.id)}
                          className="btn-table-action text-delete"
                          style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Discount Coupons */}
        {activeTab === 'discounts' && (
          <div className="tab-view discounts-view">
            <div className="view-header">
              <h1>Promo Codes &amp; Coupons</h1>
              <button onClick={() => { setEditingDiscount(null); setShowDiscountForm(true) }} className="btn-primary" style={{ background: '#2E4A3F' }}>Create Discount Coupon</button>
            </div>

            {/* Discount Form Dialog */}
            {showDiscountForm && (
              <div className="admin-form-modal">
                <form onSubmit={handleDiscountSubmit} className="admin-form-card">
                  <h2>{editingDiscount ? 'Update Discount Coupon' : 'Create Discount Code'}</h2>
                  
                  <div className="form-group">
                    <label>Discount Code (e.g. GROW10)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GROW10"
                      value={discountForm.code}
                      onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Type</label>
                      <select
                        value={discountForm.type}
                        onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value })}
                      >
                        <option value="percentage">Percentage Off (%)</option>
                        <option value="fixed">Fixed Amount (NGN)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Value</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 10 or 1500"
                        value={discountForm.value}
                        onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        required
                        value={discountForm.startDate ? discountForm.startDate.split('T')[0] : ''}
                        onChange={(e) => setDiscountForm({ ...discountForm, startDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        required
                        value={discountForm.endDate ? discountForm.endDate.split('T')[0] : ''}
                        onChange={(e) => setDiscountForm({ ...discountForm, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Applies to Product IDs (Optional comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. uuid-1, uuid-2"
                      value={discountForm.appliesToProductIds}
                      onChange={(e) => setDiscountForm({ ...discountForm, appliesToProductIds: e.target.value })}
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <input
                      type="checkbox"
                      id="global-discount"
                      checked={discountForm.global}
                      onChange={(e) => setDiscountForm({ ...discountForm, global: e.target.checked })}
                    />
                    <label htmlFor="global-discount">Applies globally to all eligible catalog products</label>
                  </div>

                  <div className="form-group checkbox-group">
                    <input
                      type="checkbox"
                      id="active-discount"
                      checked={discountForm.active}
                      onChange={(e) => setDiscountForm({ ...discountForm, active: e.target.checked })}
                    />
                    <label htmlFor="active-discount">Coupon is active and redeemable</label>
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={() => setShowDiscountForm(false)} className="btn-outline">Cancel</button>
                    <button type="submit" className="btn-primary" style={{ background: '#2E4A3F' }}>Save Coupon</button>
                  </div>
                </form>
              </div>
            )}

            {/* Discount Table */}
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Global</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((disc) => (
                    <tr key={disc.id}>
                      <td><strong>{disc.code}</strong></td>
                      <td>{disc.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}</td>
                      <td>{disc.type === 'percentage' ? `${disc.value}%` : formatPrice(disc.value)}</td>
                      <td>{disc.global ? 'Yes' : 'No'}</td>
                      <td style={{ fontSize: '0.8rem' }}>
                        {new Date(disc.startDate).toLocaleDateString()} - {new Date(disc.endDate).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`order-status-badge ${disc.active ? 'delivered' : 'cancelled'}`}>
                          {disc.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Audit Logging */}
        {activeTab === 'logs' && (
          <div className="tab-view logs-view">
            <div className="view-header">
              <h1>Admin Action Audit Log</h1>
            </div>

            {/* Audit Logs Table */}
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Admin ID</th>
                    <th>Action</th>
                    <th>Target ID</th>
                    <th>Timestamp</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="monospace">{log.adminUserId}</td>
                      <td><strong>{log.action.replace(/_/g, ' ').toUpperCase()}</strong></td>
                      <td className="monospace">{log.targetId}</td>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>
                        <pre className="audit-detail-pre">{JSON.stringify(log.details, null, 2)}</pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}









