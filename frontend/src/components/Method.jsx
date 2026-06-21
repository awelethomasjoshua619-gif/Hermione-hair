import { Fragment, useEffect, useRef } from 'react'

const steps = [
  {
    id: 'step-1',
    number: '01',
    title: 'CLEANSE',
    desc: 'A healthy hair journey begins with a healthy scalp. Our carefully crafted cleansers remove buildup, excess oil, and impurities without stripping away essential moisture, leaving your scalp refreshed, balanced, and ready to support stronger, healthier hair.',
    products: ['Shampoo', 'Conditioner'],
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M7 2h10l1 5H6L7 2z"/>
        <path d="M6 7v13a1 1 0 001 1h10a1 1 0 001-1V7"/>
        <path d="M10 11c0 1.1.9 2 2 2s2-.9 2-2"/>
      </svg>
    ),
  },
  {
    id: 'step-2',
    number: '02',
    title: 'NOURISH',
    desc: 'Powered by nature and guided by science, our nutrient-rich formulas deliver essential hydration and botanical goodness to every strand. Experience softer, stronger, and more manageable hair that looks and feels its best from root to tip.',
    products: ['Deep Conditioner', 'Leave-In Conditioner', 'Detangling Spray', 'Hair Butter'],
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M12 22V12"/>
        <path d="M12 12C12 7 7 4 7 4s1 5 5 8"/>
        <path d="M12 12C12 7 17 4 17 4s-1 5-5 8"/>
        <path d="M8 22h8"/>
      </svg>
    ),
  },
  {
    id: 'step-3',
    number: '03',
    title: 'PROTECT',
    desc: 'Healthy hair deserves lasting protection. Our formulations help strengthen strands, reduce breakage, and defend against everyday stressors such as dryness, friction, and environmental damage, helping your hair retain its beauty, resilience, and shine.',
    products: ['Hair Growth Oil', 'Hair Growth Cream', 'Edge Growth Cream', 'Anti-Dandruff Cream'],
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z"/>
        <circle cx="12" cy="9" r="2.5"/>
      </svg>
    ),
  },
]

export default function Method() {
  const ref = useRef(null)

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
    <section className="method" id="method" ref={ref}>
      <div className="section-header reveal">
        <span className="section-eyebrow">Our Philosophy</span>
        <h2 className="section-title">The Hermione Method</h2>
        <p className="section-desc">A 3-step ritual designed to transform your hair from the root up.</p>
      </div>
      <div className="method-steps">
        {steps.map((step, i) => (
          <Fragment key={step.id}>
            <div className="method-step reveal" id={step.id}>
              <span className="step-number">{step.number}</span>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              <ul className="step-products">
                {step.products.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            {i < steps.length - 1 && (
              <div className="method-connector">
                <div className="connector-line" />
                <div className="connector-arrow">-&gt;</div>
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </section>
  )
}
