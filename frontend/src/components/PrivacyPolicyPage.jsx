export default function PrivacyPolicyPage({ onBack }) {
  return (
    <main className="contact-page">
      <div className="contact-shell">
        <div className="contact-page-header">
          <div>
            <span className="section-eyebrow">Legal</span>
            <h1>Privacy Policy</h1>
          </div>
          <button className="btn-outline" onClick={onBack}>Back</button>
        </div>

        <div className="contact-card" style={{ padding: '32px', maxWidth: '100%' }}>
          <p><strong>Effective Date:</strong> June 2026</p>
          <p>At Hermione Hair, we value your privacy and are committed to protecting your personal information.</p>

          <h2 style={{ marginTop: '28px' }}>Information We Collect</h2>
          <p>When you visit our website or place an order, we may collect:</p>
          <ul>
            <li>Your name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Shipping and billing address</li>
            <li>Payment information (processed securely through our payment provider)</li>
            <li>Order history</li>
            <li>Information about how you use our website</li>
          </ul>

          <h2 style={{ marginTop: '28px' }}>How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Process and deliver your orders</li>
            <li>Respond to customer enquiries</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Improve our products and website</li>
            <li>Send promotional emails only if you have chosen to receive them</li>
          </ul>

          <h2 style={{ marginTop: '28px' }}>Payment Security</h2>
          <p>We do not store your payment card details. Payments are securely processed through trusted third-party payment providers.</p>

          <h2 style={{ marginTop: '28px' }}>Sharing Your Information</h2>
          <p>We do not sell or rent your personal information. We may share your information only with trusted service providers such as payment processors and delivery companies to complete your order.</p>

          <h2 style={{ marginTop: '28px' }}>Cookies</h2>
          <p>Our website uses cookies to improve your browsing experience, remember your preferences, and help us understand how visitors use our website.</p>

          <h2 style={{ marginTop: '28px' }}>Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal information by contacting us.</p>

          <h2 style={{ marginTop: '28px' }}>Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <p><strong>Email:</strong> hermionehairorg@gmail.com</p>
          <p><strong>Phone:</strong> +234 906 398 9800</p>
        </div>
      </div>
    </main>
  )
}
