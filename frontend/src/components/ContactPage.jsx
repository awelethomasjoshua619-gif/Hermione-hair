export default function ContactPage({ onBack }) {
  return (
    <main className="contact-page">
      <div className="contact-shell">
        <div className="contact-page-header">
          <div>
            <span className="section-eyebrow">Get in Touch</span>
            <h1>Contact Us</h1>
          </div>
          <button className="btn-outline" onClick={onBack}>
            Back to Home
          </button>
        </div>

        <div className="contact-cards">
          <a href="tel:+2349063989800" className="contact-card">
            <div className="contact-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 9a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
              </svg>
            </div>
            <h2>Call Us</h2>
            <p>For calls, inquiries, and customer support.</p>
            <strong className="contact-detail">+234 906 398 9800</strong>
          </a>

          <a href="https://wa.me/905338706778" target="_blank" rel="noreferrer" className="contact-card whatsapp">
            <div className="contact-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
              </svg>
            </div>
            <h2>WhatsApp</h2>
            <p>Chat directly with our team for advice and support.</p>
            <strong className="contact-detail">+90 533 870 6778</strong>
          </a>

          <a href="mailto:hermionehairorg@gmail.com" className="contact-card">
            <div className="contact-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h2>Email Us</h2>
            <p>Send us an email and we'll reply within 24 hours.</p>
            <strong className="contact-detail">hermionehairorg@gmail.com</strong>
          </a>
        </div>
      </div>
    </main>
  )
}
