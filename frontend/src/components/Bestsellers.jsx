import { useEffect, useRef, useState } from 'react'
import { handleProductImageError, productImage, resolveProductImage } from '../utils/productImages'

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
)

const bestProducts = [
  {
    id: 'best-herbal-shampoo',
    name: 'Herbal Shampoo',
    desc: 'A gentle yet effective cleanser formulated with botanical ingredients to remove buildup, excess oil, and impurities while supporting a healthy scalp environment for stronger, healthier hair.',
    price: 6500,
    rating: '*****',
    reviews: 243,
    badge: null,
    image: productImage('shampoo-herbal-cleanse.png'),
  },
  {
    id: 'best-edge-growth',
    name: 'Edge Growth Cream',
    desc: 'A targeted formula designed to nourish fragile edges, reduce breakage, and support the appearance of fuller, healthier-looking hairlines.',
    price: 5000,
    rating: '*****',
    reviews: 186,
    badge: 'Bestseller',
    image: productImage('edge-growth-cream.png'),
  },
  {
    id: 'best-root-revival',
    name: 'Root Revival Ayurvedic Hair Oil',
    desc: 'A carefully crafted blend of Ayurvedic herbs and nourishing oils designed to support scalp health, strengthen roots, and encourage healthier hair growth.',
    price: 7000,
    rating: '*****',
    reviews: 319,
    badge: 'Customer Pick',
    image: productImage('root-revival-oil.png'),
  },
]


const formatPrice = (price) => {
  const num = Number(price)
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(isNaN(num) ? 0 : num)
}

export default function Bestsellers({ addToCart }) {
  const ref = useRef(null)
  const [products, setProducts] = useState(bestProducts)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`).replace(/\/$/, '')
        const res = await fetch(`${apiBaseUrl}/api/products`)
        const data = await res.json()
        if (data.status === 'success') {
          const dbProducts = Array.isArray(data.data) ? data.data : []
          const updatedBestsellers = bestProducts.map(p => {
            const cleanCartId = p.id.replace('best-', '').replace('shop-', '')
            const match = dbProducts.find(
              (dbP) => dbP && dbP.slug && (
                dbP.slug === cleanCartId || 
                dbP.slug.includes(cleanCartId) || 
                cleanCartId.includes(dbP.slug)
              )
            )
            if (match) {
              return {
                ...p,
                id: match.id,
                price: match.price,
                name: match.name,
                desc: match.description || p.desc,
                image: resolveProductImage(match.images?.[0]) || p.image,
              }
            }
            return p
          })
          setProducts(updatedBestsellers)
        }
      } catch (err) {
        console.error('Failed to fetch products for bestsellers:', err)
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
              setTimeout(() => el.classList.add('visible'), i * 150)
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
    <section className="bestsellers" id="bestsellers" ref={ref}>
      <div className="section-header reveal">
        <span className="section-eyebrow">Best</span>
        <h2 className="section-title">Customer Favourites</h2>
      </div>
      <div className="products-grid best-grid">
        {products.map((p) => (
          <article className="product-card best-card reveal" key={p.id} id={p.id}>
            <div className="product-image-box">
              <img src={p.image} alt={p.name} onError={handleProductImageError} />
              <div className="product-overlay">
                <button className="btn-add-cart" onClick={() => addToCart(p)}>
                  Add to Cart
                </button>
              </div>
              {p.badge && <div className="product-badge">{p.badge}</div>}
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

