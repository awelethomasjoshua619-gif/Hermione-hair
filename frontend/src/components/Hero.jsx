export default function Hero() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="hero" id="home">
      <div className="hero-content">

        <h1 className="hero-headline">
          Grow Stronger, Fuller Hair Naturally<br /><em>Unlock your hair&rsquo;s full potential</em>
        </h1>
        <p className="hero-sub">
          Hermione Hair combines powerful African botanicals and proven hair care ingredients to reduce breakage, support healthy growth and restore confidence in your natural hair journey.
        </p>
        <div className="hero-actions">
          <button
            className="btn-primary"
            onClick={() => scrollTo('bestsellers')}
          >
            Shop Best Sellers
          </button>
          <button
            className="btn-outline"
            onClick={() => scrollTo('method')}
          >
            See the Method
          </button>
        </div>
        <div className="hero-stats">
          <div className="stat hero-trust">
            <span className="trust-label">Trusted By People Across Nigeria</span>
          </div>
        </div>
      </div>

      <div className="hero-scroll-hint">
        <span>Scroll to explore</span>
        <div className="scroll-line" />
      </div>
    </section>
  )
}
