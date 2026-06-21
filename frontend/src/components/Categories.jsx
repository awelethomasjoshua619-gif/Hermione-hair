import { useEffect, useRef, useState } from 'react'

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
)

const productImage = (fileName) => `${import.meta.env.BASE_URL}products/${fileName}`
const fallbackProductImage = productImage('hair-butter.png')

const handleImageError = (event) => {
  if (event.currentTarget.src.endsWith('/hair-butter.png')) return
  event.currentTarget.src = fallbackProductImage
}

const products = [
  {
    id: 'shop-herbal-shampoo',
    name: 'HERBAL SHAMPOO',
    desc: 'A gentle yet effective cleanser formulated with botanical ingredients to remove buildup, excess oil, and impurities while supporting a healthy scalp environment for stronger, healthier hair.',
    price: 6500,
    rating: '*****',
    reviews: 243,
    badge: null,
    image: productImage('shampoo-herbal-cleanse.png'),
  },
  {
    id: 'shop-velvet-curls',
    name: 'VELVET CURLS CONDITIONER',
    desc: 'A moisturizing conditioner designed to soften, detangle, and improve manageability while helping to reduce breakage and enhance curl definition.',
    price: 6500,
    rating: '*****',
    reviews: 117,
    badge: null,
    image: productImage('conditioner-velvet-curls.png'),
  },
  {
    id: 'shop-pure-moisture',
    name: 'PURE MOISTURE LEAVE-IN CONDITIONER',
    desc: 'A lightweight leave-in treatment that delivers lasting hydration, improves softness, and helps keep hair manageable, smooth, and protected throughout the day.',
    price: 6500,
    rating: '*****',
    reviews: 164,
    badge: null,
    image: productImage('leave-in-conditioner.png'),
  },
  {
    id: 'shop-royal-soft',
    name: 'ROYAL SOFT HAIR BUTTER',
    desc: 'A rich blend of nourishing butters and oils that helps seal in moisture, soften strands, and restore dry, dull hair without weighing it down.',
    price: 6500,
    rating: '*****',
    reviews: 128,
    badge: null,
    image: productImage('hair-butter.png'),
  },
  {
    id: 'shop-herbal-growth',
    name: 'HAIR GROWTH CREAM',
    desc: 'A nutrient-rich hair cream formulated to moisturize, strengthen, and support healthy hair growth while reducing dryness and breakage.',
    price: 6000,
    rating: '*****',
    reviews: 201,
    badge: null,
    image: productImage('hair-growth-cream.png'),
  },
  {
    id: 'shop-deep-conditioner',
    name: 'DEEP CONDITIONER',
    desc: 'An intensive treatment designed to deeply nourish, strengthen, and restore moisture to dry, damaged, or brittle hair for improved elasticity and shine.',
    price: 8500,
    rating: '*****',
    reviews: 209,
    badge: null,
    image: productImage('deep-conditioner.png'),
  },
  {
    id: 'shop-detangling-spray',
    name: 'DETANGLING SPRAY',
    desc: 'A lightweight detangling spray that helps reduce knots, improve slip, and make styling easier while providing hydration and softness.',
    price: 7000,
    rating: '*****',
    reviews: 96,
    badge: null,
    image: productImage('tangle-tamer.png'),
  },
  {
    id: 'shop-hydra-root',
    name: 'HYDRA ROOT THERAPY ANTI-DANDRUFF CREAM',
    desc: 'A soothing scalp treatment formulated to help relieve dryness, itching, flakes, and scalp discomfort while promoting a healthier scalp environment.',
    price: 8000,
    rating: '*****',
    reviews: 142,
    badge: null,
    image: productImage('anti-dandruff-cream.png'),
  },
  {
    id: 'shop-edge-growth',
    name: 'EDGE GROWTH CREAM',
    desc: 'A targeted formula designed to nourish fragile edges, reduce breakage, and support the appearance of fuller, healthier-looking hairlines.',
    price: 5000,
    rating: '*****',
    reviews: 186,
    badge: 'Bestseller',
    image: productImage('edge-growth-cream.png'),
  },
  {
    id: 'shop-root-revival',
    name: 'ROOT REVIVAL AYURVEDIC HAIR OIL',
    desc: 'A carefully crafted blend of Ayurvedic herbs and nourishing oils designed to support scalp health, strengthen roots, and encourage healthier hair growth.',
    price: 7000,
    rating: '*****',
    reviews: 319,
    badge: 'Customer Pick',
    image: productImage('root-revival-oil.png'),
  },
  {
    id: 'shop-beard-oil',
    name: 'BEARD OIL',
    desc: 'A lightweight grooming oil that softens beard hair, moisturizes the skin beneath, and promotes a healthier, well-maintained beard.',
    price: 5000,
    rating: '*****',
    reviews: 88,
    badge: null,
    image: productImage('IMG_3525.PNG'),
  },
]

const formatPrice = (price) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price)

export default function Categories({ addToCart }) {
  const ref = useRef(null)
  const [productList, setProductList] = useState(products)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`).replace(/\/$/, '')
        const res = await fetch(`${apiBaseUrl}/api/products`)
        const data = await res.json()
        if (data.status === 'success') {
          const dbProducts = data.data
          setProductList(prev => prev.map(p => {
            const cleanCartId = p.id.replace('best-', '').replace('shop-', '')
            const match = dbProducts.find(
              (dbP) => dbP.slug === cleanCartId || dbP.slug.includes(cleanCartId) || cleanCartId.includes(dbP.slug)
            )
            if (match) {
              return { ...p, price: match.price, name: match.name, desc: match.description || p.desc }
            }
            return p
          }))
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
              <img src={p.image} alt={p.name} onError={handleImageError} />
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
