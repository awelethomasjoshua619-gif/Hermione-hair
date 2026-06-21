const items = [
  'Cruelty-Free & Vegan',
  'Worldwide Delivery',
  '5-Star Rated Products',
  'Dermatologist Approved',
]

export default function Marquee() {
  const doubled = [...items, ...items]
  return (
    <div className="marquee-wrapper">
      <div className="marquee-track">
        <div className="marquee-content">
          {doubled.map((item, i) => (
            <span key={i}>* {item}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
