import { useEffect, useRef, useState } from 'react'
import { handleProductImageError, productImage, resolveProductImage } from '../utils/productImages'
import { storefrontProducts } from '../utils/storefrontProducts'

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
)

const initialProducts = storefrontProducts.map((product) => ({
  id: `shop-${product.slug}`,
  slug: product.slug,
  name: product.name,
  desc: product.description,
  price: product.price,
  rating: product.rating,
  reviews: product.reviews,
  badge: product.badge,
  image: productImage(product.image),
}))

const formatPrice = (price) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price)

export default function Categories({ addToCart }) {
  const ref = useRef(null)
  const [productList, setProductList] = useState(initialProducts)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`).replace(/\/$/, '')
        const res = await fetch(`${apiBaseUrl}/api/products`)
        const data = await res.json()
        if (data.status === 'success') {
          const dbProducts = data.data
          if (dbProducts.length > 0) {
            setProductList(dbProducts.map(product => ({
              id: product.id,
              slug: product.slug,
              name: product.name,
              desc: product.description,
              price: product.price,
              rating: '*****',
              reviews: 120 + Math.floor(Math.random() * 180),
              badge: product.tags.includes('bestseller') ? 'Bestseller' : product.tags.includes('new') ? 'New' : null,
              image: resolveProductImage(product.images?.[0]),
              tags: product.tags
            })))
          }
        }
      } catch (err) {
        console.error('Failed to fetch products for categories:', err)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 120)
            })
          }
        })
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="categories" id="shop" ref={ref}>
      <div className="section-header reveal">
        <span className="section-eyebrow">Shop</span>
        <h2 className="section-title">The Complete Botanical System</h2>
      </div>

      <div className="products-grid reveal">
        {productList.map((p) => (
          <article className="product-card" key={p.id} id={p.id}>
            <div className="product-image-box">
              <img src={p.image} alt={p.name} onError={handleProductImageError} />
              <div className="product-overlay">
                <button className="btn-add-cart" onClick={() => addToCart(p)}>
                  Add to Cart
                </button>
              </div>
            </div>
            <div className="product-info">
              <div className="product-rating">
                {p.rating} <span>({p.reviews})</span>
              </div>
              <h3 className="product-name">{p.name}</h3>
              <p className="product-desc">{p.desc}</p>
              <div className="product-footer">
                <span className="product-price">{formatPrice(p.price)}</span>
                <button
                  className="btn-cart-icon"
                  onClick={() => addToCart(p)}
                  aria-label={`Add ${p.name} to cart`}
                >
                  <CartIcon />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
