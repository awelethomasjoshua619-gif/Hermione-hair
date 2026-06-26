const supportLinks = ['Contact Us', 'FAQs', 'Track My Order', 'Privacy Policy', 'Terms of Service']

export default function Footer({ onNavigate }) {
  return (
    <footer className="footer" id="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <a href="#" className="logo">Hermione<span>Hair</span></a>
          <p>Premium botanical hair care thoughtfully crafted to nurture the scalp, strengthen strands, and promote healthier, more resilient hair from root to tip.</p>
          <div className="social-links">
            <a
              href="https://www.instagram.com/hermionehair__?igsh=azUycW1ybG04bm94&utm_source=qr"
              className="social-link"
              aria-label="Instagram"
              id="social-instagram"
              target="_blank"
              rel="noreferrer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <circle cx="12" cy="12" r="5"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@hermionehair?_r=1&_t=ZS-97Hgn4ejKvU"
              className="social-link"
              aria-label="TikTok"
              id="social-tiktok"
              target="_blank"
              rel="noreferrer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.19 8.19 0 004.78 1.52V6.79a4.85 4.85 0 01-1.01-.1z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              {supportLinks.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (onNavigate) {
                        if (l === 'FAQs') onNavigate('faqs')
                        else if (l === 'Contact Us') onNavigate('contact')
                        else onNavigate('home')
                      }
                    }}
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Hermione Hair. All rights reserved. Made with love for customers everywhere.</p>
      </div>
    </footer>
  )
}

