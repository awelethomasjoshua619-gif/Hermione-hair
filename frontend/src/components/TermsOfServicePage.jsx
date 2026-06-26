export default function TermsOfServicePage({ onBack }) {
  return (
    <main className="contact-page">
      <div className="contact-shell">
        <div className="contact-page-header">
          <div>
            <span className="section-eyebrow">Legal</span>
            <h1>Terms of Service</h1>
          </div>
          <button className="btn-outline" onClick={onBack}>Back</button>
        </div>

        <div className="contact-card" style={{ padding: '32px', maxWidth: '100%' }}>
          <p><strong>Effective Date:</strong> June 2026</p>
          <p>Welcome to Hermione Hair. By accessing or using our website, you agree to these Terms of Service.</p>

          <h2 style={{ marginTop: '28px' }}>Products</h2>
          <p>We strive to ensure that product descriptions, images, and pricing are accurate. However, colours may vary slightly depending on your device, and occasional errors may occur.</p>

          <h2 style={{ marginTop: '28px' }}>Orders</h2>
          <p>All orders are subject to acceptance and availability. We reserve the right to refuse or cancel an order if necessary.</p>

          <h2 style={{ marginTop: '28px' }}>Pricing</h2>
          <p>All prices are listed in Nigerian Naira (NGN) unless otherwise stated. Prices may change without prior notice.</p>

          <h2 style={{ marginTop: '28px' }}>Payments</h2>
          <p>Payment must be completed before an order is processed and shipped.</p>

          <h2 style={{ marginTop: '28px' }}>Shipping</h2>
          <p>Delivery times are estimates and may vary depending on your location or courier service. Hermione Hair is not responsible for delays caused by shipping providers or unforeseen circumstances.</p>

          <h2 style={{ marginTop: '28px' }}>Returns and Exchanges</h2>
          <p>For hygiene and safety reasons, opened or used hair care products cannot be returned unless they arrive damaged, defective, or incorrect.</p>
          <p>If you receive a damaged or incorrect product, please contact us within 48 hours of delivery with clear photographs.</p>

          <h2 style={{ marginTop: '28px' }}>Product Information</h2>
          <p>Our products are formulated to support healthy hair and scalp care. Results vary from person to person depending on individual hair type, routine, and consistency of use.</p>
          <p>Our products are cosmetic products and are not intended to diagnose, treat, cure, or prevent any medical condition.</p>

          <h2 style={{ marginTop: '28px' }}>Intellectual Property</h2>
          <p>All content on this website including images, product descriptions, logos, branding, graphics, and text is the property of Hermione Hair and may not be copied or used without written permission.</p>

          <h2 style={{ marginTop: '28px' }}>Limitation of Liability</h2>
          <p>Hermione Hair shall not be liable for indirect, incidental, or consequential damages arising from the use of our products or website.</p>

          <h2 style={{ marginTop: '28px' }}>Changes to These Terms</h2>
          <p>We may update these Terms of Service at any time. Continued use of our website constitutes acceptance of any changes.</p>

          <h2 style={{ marginTop: '28px' }}>Contact Us</h2>
          <p>For any questions regarding these Terms, please contact us at:</p>
          <p><strong>Email:</strong> hermionehairorg@gmail.com</p>
          <p><strong>Phone:</strong> +234 906 398 9800</p>
        </div>
      </div>
    </main>
  )
}

