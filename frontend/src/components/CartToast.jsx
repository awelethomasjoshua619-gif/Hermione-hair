export default function CartToast({ show, message }) {
  return (
    <div className={`cart-toast${show ? ' show' : ''}`} aria-live="polite">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>{message}</span>
    </div>
  )
}
