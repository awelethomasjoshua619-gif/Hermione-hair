import { useState } from 'react'

const faqs = [
  {
    q: '1. Are Hermione Hair products suitable for all hair types?',
    a: 'Yes. Our products are formulated to support healthy hair and scalp care across a wide range of hair types and textures, including natural, relaxed, color-treated, and protective-styled hair.',
  },
  {
    q: '2. Do your products help with hair growth?',
    a: 'Our formulations are designed to support healthy hair growth by promoting scalp health, reducing breakage, strengthening strands, and improving moisture retention. Individual results may vary.',
  },
  {
    q: '3. Are your products made with natural ingredients?',
    a: 'Yes. Hermione Hair combines carefully selected botanical ingredients with science-backed formulations to create effective products that nourish both the scalp and hair.',
  },
  {
    q: '4. How often should I use the Herbal Shampoo?',
    a: 'For most hair types, we recommend cleansing every 1–2 weeks or as needed. Adjust frequency based on your scalp condition, lifestyle, and styling routine.',
  },
  {
    q: '5. Can I use multiple Hermione Hair products together?',
    a: 'Absolutely. Our products are designed to work together as a complete hair care system, helping you cleanse, nourish, and protect your hair for optimal results.',
  },
  {
    q: '6. Which product is best for dry and brittle hair?',
    a: 'We recommend our Deep Conditioner, Leave-In Conditioner, and Hair Butter to help restore moisture, softness, and manageability to dry hair.',
  },
  {
    q: '7. Which product is best for thinning edges?',
    a: 'Our Edge Growth Cream is specifically formulated to nourish delicate edges, reduce breakage, and support healthier-looking hairlines.',
  },
  {
    q: '8. How long does it take to see results?',
    a: 'Results vary depending on your hair condition, consistency of use, and overall hair care routine. Many customers notice improved moisture, softness, and manageability within a few weeks of regular use.',
  },
  {
    q: '9. Do you offer nationwide delivery?',
    a: 'Yes. We deliver across Nigeria to help you enjoy premium hair care wherever you are.',
  },
  {
    q: '10. How can I contact Hermione Hair?',
    a: 'You can reach us through WhatsApp, email, or our social media platforms. Our team is always happy to help you choose the right products for your hair needs.',
  },
]

export default function FaqsPage({ onBack }) {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i)
  }

  return (
    <main className="faqs-page">
      <div className="faqs-shell">
        <div className="faqs-page-header">
          <div>
            <span className="section-eyebrow">Help & Support</span>
            <h1>Frequently Asked Questions</h1>
          </div>
          <button className="btn-outline" onClick={onBack}>
            Back to Home
          </button>
        </div>

        <div className="faqs-list">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div key={i} className={`faq-item${isOpen ? ' open' : ''}`}>
                <button className="faq-question" onClick={() => toggle(i)}>
                  <span>{faq.q}</span>
                  <span className="faq-icon">{isOpen ? '−' : '+'}</span>
                </button>
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
