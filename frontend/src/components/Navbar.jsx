import { useState, useEffect } from 'react'

export default function Navbar({ cartCount, onNavigate, onHome, onCartClick, currentUser, onUserClick, onLogout }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavigate = (id) => {
    onNavigate(id)
    setMenuOpen(false)
  }

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="#" className="logo" onClick={(e) => { e.preventDefault(); onHome() }}>
            Hermione<span>Hair</span>
          </a>
          <ul className="nav-links">
            <li><a href="#categories" onClick={(e) => { e.preventDefault(); handleNavigate('categories') }}>Shop</a></li>
            <li><a href="#bestsellers" onClick={(e) => { e.preventDefault(); handleNavigate('bestsellers') }}>Bestsellers</a></li>
            <li><a href="#method" onClick={(e) => { e.preventDefault(); handleNavigate('method') }}>The Method</a></li>
            <li><a href="#newsletter" onClick={(e) => { e.preventDefault(); handleNavigate('newsletter') }}>Community</a></li>
          </ul>
          <div className="nav-actions">
            {currentUser ? (
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  className="btn-icon"
                  onClick={onUserClick}
                  aria-label="My Orders"
                  style={{ color: '#2E4A3F', fontSize: '0.8rem', fontWeight: 'bold', width: 'auto', padding: '0 8px' }}
                >
                  Orders
                </button>
                <button
                  className="btn-icon"
                  onClick={onLogout}
                  aria-label="Logout"
                  style={{ color: '#d9534f', fontSize: '0.8rem', fontWeight: 'bold', width: 'auto', padding: '0 8px' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                className="btn-icon"
                onClick={onUserClick}
                aria-label="Login"
                style={{ color: '#2E4A3F', fontSize: '0.8rem', fontWeight: 'bold', width: 'auto', padding: '0 8px' }}
              >
                Login
              </button>
            )}

            <button className="btn-icon" id="cart-btn" aria-label="Cart" onClick={onCartClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <span className="cart-count">{cartCount}</span>
            </button>
            <a
              href="#bestsellers"
              className="btn-primary nav-cta"
              style={{ background: '#2E4A3F', color: '#ffffff' }}
              onClick={(e) => { e.preventDefault(); handleNavigate('bestsellers') }}
            >
              Shop Now
            </a>
            <button
              className="hamburger"
              id="hamburger"
              aria-label="Menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span style={{ transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
              <span style={{ opacity: menuOpen ? 0 : 1 }} />
              <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
            </button>
          </div>
        </div>
      </nav>
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {['categories','bestsellers','method','newsletter'].map((id, i) => (
          <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); handleNavigate(id) }}>
            {['Shop', 'Bestsellers', 'The Method', 'Community'][i]}
          </a>
        ))}
      </div>
    </>
  )
}
