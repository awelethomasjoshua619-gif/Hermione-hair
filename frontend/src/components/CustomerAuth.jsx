import { useState } from 'react'

export default function CustomerAuth({ apiBaseUrl, onAuthSuccess, onBack, initialView = 'login' }) {
  const [view, setView] = useState(initialView)
  const [form, setForm] = useState({ name: '', email: '', password: '', newPassword: '', verificationToken: '', resetCode: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const handleResendCode = async () => {
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      })
      const data = await res.json()
      if (data.status === 'success') {
        setMessage(data.message)
      } else {
        setError(data.message || 'Failed to resend code')
      }
    } catch (err) {
      setError('A network error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (view === 'signup') {
        const res = await fetch(`${apiBaseUrl}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
        })
        const data = await res.json()
        if (data.status === 'success' || data.status === 'pending_verification') {
          setMessage(data.message || 'Please check your email for the verification code.')
          setView('verify')
        } else {
          if (data.errors && Array.isArray(data.errors)) {
            setError(data.errors.map((e) => e.message).join(', '))
          } else {
            setError(data.message || 'Signup failed')
          }
        }
      } else if (view === 'login') {
        const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password }),
        })
        const data = await res.json()
        if (data.status === 'success') {
          if (data.data.user.role === 'admin') {
            setError('Admin accounts must log in via the Admin Portal.')
          } else {
            localStorage.setItem('accessToken', data.data.accessToken)
            localStorage.setItem('refreshToken', data.data.refreshToken)
            localStorage.setItem('user', JSON.stringify(data.data.user))
            onAuthSuccess(data.data.user)
          }
        } else {
          if (data.errors && Array.isArray(data.errors)) {
            setError(data.errors.map((e) => e.message).join(', '))
          } else {
            setError(data.message || 'Login failed. Please check your credentials and try again.')
          }
        }
      } else if (view === 'verify') {
        const res = await fetch(
          `${apiBaseUrl}/api/auth/verify-email?token=${form.verificationToken}&email=${encodeURIComponent(form.email)}`
        )
        const data = await res.json()
        if (data.status === 'success') {
          setMessage('✅ Email verified! Logging you in...')
          localStorage.setItem('accessToken', data.data.accessToken)
          localStorage.setItem('refreshToken', data.data.refreshToken)
          localStorage.setItem('user', JSON.stringify(data.data.user))
          onAuthSuccess(data.data.user)
        } else {
          setError(data.message || 'Verification failed. Please check the code and try again.')
        }
      } else if (view === 'forgot') {
        const res = await fetch(`${apiBaseUrl}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email }),
        })
        const data = await res.json()
        if (data.status === 'success') {
          setMessage(data.message)
          setView('reset')
        } else {
          setError(data.message || 'Failed to send reset code')
        }
      } else if (view === 'reset') {
        if (form.newPassword.length < 8) {
          setError('New password must be at least 8 characters')
          setLoading(false)
          return
        }
        const res = await fetch(`${apiBaseUrl}/api/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, resetCode: form.resetCode, newPassword: form.newPassword }),
        })
        const data = await res.json()
        if (data.status === 'success') {
          setMessage('✅ Password reset successful! You can now log in with your new password.')
          setView('login')
        } else {
          setError(data.message || 'Reset failed. The code may be expired or incorrect.')
        }
      }
    } catch (err) {
      setError('A network error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getTitle = () => {
    switch (view) {
      case 'login': return 'Welcome Back'
      case 'signup': return 'Join the Tribe'
      case 'verify': return 'Check Your Email'
      case 'forgot': return 'Forgot Password'
      case 'reset': return 'Reset Password'
      default: return 'Sign In'
    }
  }

  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )

  const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-header">
          <h1>{getTitle()}</h1>
          <button className="btn-outline" onClick={onBack}>Back to Shop</button>
        </div>

        <div className="auth-card">
          {error && <div className="auth-error-msg">{error}</div>}
          {message && <div className="auth-success-msg">{message}</div>}

          {/* ===== DEDICATED VERIFY SCREEN ===== */}
          {view === 'verify' ? (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="verify-screen">
                <div className="verify-icon">✉️</div>
                <h2 className="verify-heading">Check Your Email</h2>
                <p className="verify-subtext">
                  We sent a <strong>6-digit code</strong> to <strong>{form.email}</strong>
                </p>
                <div className="form-group" style={{ marginTop: '28px' }}>
                  <label htmlFor="auth-token">Verification Code</label>
                  <input
                    type="text"
                    id="auth-token"
                    placeholder="_ _ _ _ _ _"
                    required
                    maxLength={6}
                    autoFocus
                    style={{ textAlign: 'center', fontSize: '2rem', letterSpacing: '0.5em', fontWeight: '700' }}
                    value={form.verificationToken}
                    onChange={(e) => setForm({ ...form, verificationToken: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
                <button type="submit" className="btn-primary full-width" style={{ background: '#2E4A3F', marginTop: '20px' }} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify My Account'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--fg-3)', marginBottom: '8px' }}>
                    Didn't receive it? Check your spam folder.
                  </p>
                  <button type="button" onClick={handleResendCode} disabled={loading} className="auth-link-btn" style={{ fontSize: '0.875rem', textDecoration: 'underline' }}>
                    Resend Code
                  </button>
                </div>
              </div>
              <div className="auth-switch">
                <p>
                  <button onClick={() => { setView('login'); setError(''); setMessage('') }} className="auth-link-btn">
                    ← Back to Log In
                  </button>
                </p>
              </div>
            </form>

          ) : (
            /* ===== ALL OTHER VIEWS ===== */
            <form onSubmit={handleSubmit} className="auth-form">

              {/* Name — signup only */}
              {view === 'signup' && (
                <div className="form-group">
                  <label htmlFor="auth-name">First &amp; Last Name</label>
                  <input
                    type="text"
                    id="auth-name"
                    placeholder="e.g. Adanna Obi"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              )}

              {/* Email */}
              <div className="form-group">
                <label htmlFor="auth-email">Email Address</label>
                <input
                  type="email"
                  id="auth-email"
                  placeholder="your@email.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              {/* Password — login & signup */}
              {(view === 'login' || view === 'signup') && (
                <div className="form-group">
                  <label htmlFor="auth-password">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="auth-password"
                      placeholder="At least 8 characters"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {view === 'login' && (
                    <div style={{ textAlign: 'right', marginTop: '6px' }}>
                      <button type="button" className="auth-link-btn" onClick={() => { setView('forgot'); setError(''); setMessage('') }} style={{ fontSize: '0.8rem' }}>
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Reset code + new password — reset view */}
              {view === 'reset' && (
                <>
                  <div className="form-group">
                    <label htmlFor="auth-reset-code">Reset Code (Sent to Email)</label>
                    <input
                      type="text"
                      id="auth-reset-code"
                      placeholder="Enter 6-digit code"
                      required
                      maxLength={6}
                      value={form.resetCode}
                      onChange={(e) => setForm({ ...form, resetCode: e.target.value.replace(/\D/g, '') })}
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--fg-3)', marginTop: '8px' }}>
                      💡 Check your spam/junk folder if you don't see it.
                    </p>
                  </div>
                  <div className="form-group">
                    <label htmlFor="auth-new-password">New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="auth-new-password"
                        placeholder="At least 8 characters"
                        required
                        value={form.newPassword}
                        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                      />
                      <button type="button" className="password-toggle-btn" onClick={() => setShowNewPassword(!showNewPassword)} aria-label="Toggle password">
                        {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button type="submit" className="btn-primary full-width" style={{ background: '#2E4A3F' }} disabled={loading}>
                {loading ? 'Please wait...' :
                  view === 'login' ? 'Log In' :
                  view === 'signup' ? 'Create Account' :
                  view === 'forgot' ? 'Send Reset Code' :
                  'Reset Password'}
              </button>

              <div className="auth-switch">
                {view === 'login' && (
                  <p>Don't have an account?{' '}
                    <button onClick={() => { setView('signup'); setError(''); setMessage('') }} className="auth-link-btn">Sign Up</button>
                  </p>
                )}
                {view === 'signup' && (
                  <p>Already have an account?{' '}
                    <button onClick={() => { setView('login'); setError(''); setMessage('') }} className="auth-link-btn">Log In</button>
                  </p>
                )}
                {view === 'forgot' && (
                  <p>Remember your password?{' '}
                    <button onClick={() => { setView('login'); setError(''); setMessage('') }} className="auth-link-btn">Log In</button>
                  </p>
                )}
                {view === 'reset' && (
                  <p>
                    <button onClick={() => { setView('login'); setError(''); setMessage('') }} className="auth-link-btn">← Back to Log In</button>
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
