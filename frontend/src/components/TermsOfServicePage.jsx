export default function TermsOfServicePage({ onBack }) {
  return (
    <main className="contact-page">
      <div className="contact-shell">
        <div className="contact-page-header">
          <div>
            <span className="section-eyebrow">Legal</span>
            <h1>Terms of Service</h1>
          </div>
          <button className="btn-outline" onClick={onBack}>
            Back
          </button>
        </div>

        <div className="contact-card" style={{ padding: '32px', maxWidth: '100%' }}>
          <p>
            <strong>Effective Date:</strong> June 2026
          </p>

          <p>
            Welcome to <strong>Hermione Hair</strong>. These Terms of Service govern your access to and use of our
            website, products, and services. By visiting our website or placing an order, you agree to be bound by
            these Terms. If you do not agree with any part of these Terms, we kindly ask that you refrain from using
            our website.
          </p>

          <p>
            At Hermione Hair, we are committed to providing premium, science-backed, naturally powered hair care
            products and an exceptional shopping experience. These Terms are intended to ensure a transparent and
            trustworthy relationship between our brand and our customers.
          </p>

          <h2 style={{ marginTop: '28px' }}>Use of Our Website</h2>
          <p>
            By using our website, you confirm that the information you provide is accurate, complete, and up to date.
            You agree to use our website only for lawful purposes and in a manner that does not interfere with its
            operation or the experience of other users.
          </p>

          <p>
            We reserve the right to suspend or restrict access to our website if we believe it is being used
            fraudulently, unlawfully, or in violation of these Terms.
          </p>

          <h2 style={{ marginTop: '28px' }}>Products and Pricing</h2>
          <p>
            We make every effort to ensure that all product descriptions, images, prices, and availability displayed on
            our website are accurate. However, product packaging, colours, and appearance may vary slightly due to
            lighting, photography, or device display settings.
          </p>

          <p>
            All prices are listed in Nigerian Naira (₦) unless otherwise stated and may be updated without prior notice.
            While we strive to avoid pricing errors, Hermione Hair reserves the right to correct any inaccuracies and
            cancel or decline orders where an obvious pricing error has occurred. If payment has already been made for
            such an order, a full refund will be issued.
          </p>

          <h2 style={{ marginTop: '28px' }}>Orders and Payments</h2>
          <p>
            Once you place an order, you will receive an order confirmation acknowledging that we have received your
            request. This confirmation does not constitute acceptance of your order. Orders are accepted only after
            payment has been successfully processed and your items have been prepared for dispatch.
          </p>

          <p>
            Hermione Hair reserves the right to refuse or cancel any order where fraudulent activity, payment issues,
            or unusual purchasing behaviour is suspected.
          </p>

          <h2 style={{ marginTop: '28px' }}>Shipping and Delivery</h2>
          <p>
            We work with trusted delivery partners to ensure your products reach you safely and promptly. Delivery
            times provided on our website are estimates and may vary depending on your location, public holidays,
            weather conditions, or courier operations.
          </p>

          <p>
            Once an order has been handed over to the delivery service, Hermione Hair is not responsible for delays
            beyond our reasonable control. We will, however, do our best to assist you in tracking and resolving any
            delivery concerns.
          </p>

          <h2 style={{ marginTop: '28px' }}>Returns and Refunds</h2>
          <p>
            Due to the nature of cosmetic and personal care products, we are unable to accept returns of products that
            have been opened, used, or tampered with, unless they are defective or supplied in error.
          </p>

          <p>
            If you receive a damaged, defective, or incorrect item, please contact us within 48 hours of delivery and
            provide clear photographs along with your order details. Where appropriate, we will arrange a
            replacement, exchange, or refund in accordance with our Refund Policy.
          </p>

          <h2 style={{ marginTop: '28px' }}>Product Information and Results</h2>
          <p>
            Our products are formulated using carefully selected botanical ingredients and cosmetic actives to
            support healthy hair and scalp care. While we strive to provide accurate product information, individual
            results will vary depending on factors such as hair type, scalp condition, consistency of use, lifestyle,
            and overall hair care routine.
          </p>

          <p>
            The information provided on our website is intended for general educational purposes and should not be
            considered medical advice. Hermione Hair products are cosmetic products and are not intended to
            diagnose, treat, cure, or prevent any disease or medical condition. If you have an existing scalp or
            medical condition, we recommend consulting a qualified healthcare professional before using our products.
          </p>

          <h2 style={{ marginTop: '28px' }}>Intellectual Property</h2>
          <p>
            All content on this website, including our brand name, logo, product names, photographs, graphics, videos,
            written content, formulations, and overall website design, is the intellectual property of Hermione Hair
            unless otherwise stated.
          </p>

          <p>
            No content from this website may be copied, reproduced, distributed, modified, or used for commercial
            purposes without our prior written permission.
          </p>

          <h2 style={{ marginTop: '28px' }}>Limitation of Liability</h2>
          <p>
            Hermione Hair shall not be liable for any indirect, incidental, special, or consequential damages arising
            from the use of our website or products. Our liability, where applicable, shall be limited to the amount
            paid for the product giving rise to the claim, to the extent permitted by applicable law.
          </p>

          <p>
            Nothing in these Terms limits any rights that cannot legally be excluded under applicable consumer
            protection laws.
          </p>

          <h2 style={{ marginTop: '28px' }}>Changes to These Terms</h2>
          <p>
            We may update these Terms of Service from time to time to reflect changes in our business operations,
            legal requirements, or website functionality. Any revisions will be posted on this page together with the
            updated effective date. By continuing to use our website after any changes have been published, you agree
            to be bound by the revised Terms.
          </p>

          <h2 style={{ marginTop: '28px' }}>Contact Us</h2>
          <p>
            If you have any questions regarding these Terms of Service, our products, or your use of our website, we
            would be happy to assist you.
          </p>

          <p>
            <strong>Hermione Hair</strong>
          </p>

          <p>
            <strong>Email:</strong> hermionehairorg@gmail.com
          </p>

          <p>
            <strong>Phone:</strong> +234 906 398 9800
          </p>

          <p>
            <strong>Website:</strong> <a href="http://www.hermionehair.com">www.hermionehair.com</a>
          </p>
        </div>
      </div>
    </main>
  );
}


