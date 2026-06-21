import { useState } from 'react'

const perks = [
  'Early access to new products',
  'Weekly hair care tutorials',
  'Exclusive community events',
  'Get 10% Off Your First Order',
]

export default function Newsletter() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="newsletter" id="newsletter">
      <div className="newsletter-inner">
        <div className="newsletter-text">
          <span className="section-eyebrow light">Join the Movement</span>
          <h2>Join the Hermione Hair Tribe &amp; Unlock Healthier Hair</h2>
          <p>
            Get exclusive access to new launches, insider tutorials, community updates, and personalised hair care tips delivered straight to your inbox.
          </p>
          <ul className="newsletter-perks">
            {perks.map((p) => (
              <li key={p}>* {p}</li>
            ))}
          </ul>
        </div>

        <div className="newsletter-form-box">
          {!submitted ? (
            <form className="newsletter-form" id="newsletter-form" onSubmit={handleSubmit}>
              <h3>Your Crown Deserves the Best</h3>
              <div className="form-group">
                <label htmlFor="sub-name">First Name</label>
                <input
                  type="text"
                  id="sub-name"
                  placeholder="Your first name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="sub-email">Email Address</label>
                <input
                  type="email"
                  id="sub-email"
                  placeholder="your@email.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-primary full-width" id="subscribe-btn">
                Join the Tribe
              </button>
              <p className="form-note">No spam, ever. Unsubscribe anytime. Your privacy is sacred.</p>
            </form>
          ) : (
            <div className="subscribe-success" id="subscribe-success">
              <div className="success-icon">*</div>
              <h3>Welcome to the Tribe!</h3>
              <p>You're on the list for product launches, hair care tips, and community updates.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
