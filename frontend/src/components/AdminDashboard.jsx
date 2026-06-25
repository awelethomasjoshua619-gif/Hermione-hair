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
  const [showProductForm, setShowProductForm] = useState(false)
  const [showDiscountForm, setShowDiscountForm] = useState(false)

  // Form Fields
  const emptyProductForm = { name: '', description: '', functionTag: 'Nourish', price: '', compareAtPrice: '', stockQuantity: '', images: '', tags: '', isExcludedFromPromos: false }
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [discountForm, setDiscountForm] = useState({ code: '', type: 'percentage', value: '', appliesToProductIds: '', global: true, startDate: '', endDate: '', active: true })
  const [trackingForm, setTrackingForm] = useState({ trackingNumber: '', logisticsCompany: '' })

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
    
    // Combine analytics arrays
    const rows = salesAnalytics.chartData.map((day) => {
      const vDay = visitorAnalytics.chartData.find((vd) => vd.date === day.date) || { visits: 0, uniqueVisitors: 0 }
      return [
        day.date,
        vDay.visits,
        vDay.uniqueVisitors,
        '--',
        day.revenue,
        '--',
      ]
    })
    exportToCSV('sales_analytics.csv', headers, rows)
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
      if (editingProduct) {
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
        setSuccess(editingProduct && !editingProduct.isStorefrontPlaceholder ? 'Product updated successfully' : 'Product saved to admin catalog')
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
          {/* Close button inside sidebar on mobile */}
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
                        {/* Render simple bar chart */}
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
                <button onClick={() => { setEditingProduct(null); setProductForm(emptyProductForm); setShowProductForm(true) }} className="btn-primary" style={{ background: '#2E4A3F' }}>Add New Product</button>
              </div>
            </div>

            {/* Product Edit / Creation Form Dialog */}
            {showProductForm && (
              <div className="admin-form-modal">
                <form onSubmit={handleProductSubmit} className="admin-form-card">
                  <h2>{editingProduct?.isStorefrontPlaceholder ? 'Add Store Product to Admin' : editingProduct ? 'Update Product Details' : 'Create Product Entry'}</h2>
                  {editingProduct?.isStorefrontPlaceholder && (
                    <p>This product is visible on the store. Saving it adds it to the admin database so future edits update the live store data.</p>
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
                            {prod.isStorefrontPlaceholder && <span className="order-status-badge pending" style={{ marginTop: '6px' }}>Store product - save to sync</span>}
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
                          {prod.isStorefrontPlaceholder ? 'Sync / Edit' : 'Edit'}
                        </button>
                        {!prod.isStorefrontPlaceholder && (
                          <>
                            <button onClick={() => handleTogglePromo(prod.id)} className="btn-table-action text-toggle">Toggle Promo</button>
                            <button onClick={() => handleDeleteProduct(prod.id)} className="btn-table-action text-delete">Delete</button>
                          </>
                        )}                      </td>
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

            {/* Tracking / Shipping Form Dialog */}
            {trackingOrder && (
              <div className="admin-form-modal">
                <form onSubmit={handleTrackingSubmit} className="admin-form-card">
                  <h2>Configure Tracking details</h2>
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



