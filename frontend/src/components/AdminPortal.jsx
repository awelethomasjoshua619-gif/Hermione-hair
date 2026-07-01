import { useState } from 'react'

export default function AdminPortal({ apiBaseUrl, onAuthSuccess, onBack }) {
  const [step, setStep] = useState('credentials') // 'credentials' | '2fa_setup' | '2fa_verify'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [tempToken, setTempToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Use the locked admin portal path
      const res = await fetch(`${apiBaseUrl}/api/botanical-portal/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (res.status === 200) {
        if (data.status === '2fa_setup' || data.status === '2fa_setup_required') {
          setQrCode(data.data.qrCode)
          setSecret(data.data.secret)
          setTempToken(data.data.tempToken)
          setStep('2fa_setup')
        } else if (data.status === '2fa_required') {
          setTempToken(data.data.tempToken)
          setStep('2fa_verify')
        } else if (data.status === 'success') {
          // Fallback if 2FA was bypassed (should not happen on admin, but for safety)
          saveAdminSession(data.data)
        }
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      setError('A network error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handle2FASubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-temp-token': tempToken,
        },
        body: JSON.stringify({ token: code }),
      })
      const data = await res.json()

      if (res.status === 200 && data.status === 'success') {
        saveAdminSession(data.data)
      } else {
        setError(data.message || 'Invalid verification code')
      }
    } catch (err) {
      setError('A network error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const saveAdminSession = (authData) => {
    localStorage.setItem('adminAccessToken', authData.accessToken)
    localStorage.setItem('adminRefreshToken', authData.refreshToken)
    localStorage.setItem('adminUser', JSON.stringify(authData.user))
    onAuthSuccess(authData.user)
  }

  return (
    <main className="admin-portal-page">
      <div className="admin-portal-shell">
        <div className="admin-portal-header">
          <span className="section-eyebrow">Secure Gateway</span>
          <h1>Hermione Hair Admin Portal</h1>
          <button className="btn-outline" onClick={onBack}>
            Exit Portal
          </button>
        </div>

        <div className="admin-portal-card">
          {error && <div className="admin-error-msg">{error}</div>}

          {step === 'credentials' && (
            <form onSubmit={handleLoginSubmit} className="admin-portal-form">
              <h3>Administrative Authentication</h3>
              <div className="form-group">
                <label htmlFor="admin-email">Admin Email Address</label>
                <input
                  type="email"
                  id="admin-email"
                  placeholder="admin@hermionehair.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="admin-password">Password</label>
                <input
                  type="password"
                  id="admin-password"
                  placeholder="••••••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary full-width" style={{ background: '#2E4A3F' }} disabled={loading}>
                {loading ? 'Authenticating...' : 'Submit Credentials'}
              </button>
            </form>
          )}

          {step === '2fa_setup' && (
            <form onSubmit={handle2FASubmit} className="admin-portal-form 2fa-setup-form">
              <h3>Two-Factor Authentication Setup</h3>
              <p className="admin-help-text">
                Scan the QR code below using your Authenticator App (e.g. Google Authenticator, Duo) to configure 2FA for this account.
              </p>

              <div className="qr-container">
                <img src={qrCode} alt="TOTP QR Code" className="qr-image" />
              </div>

              <div className="manual-key-box">
                <span className="key-label">Manual Setup Key:</span>
                <code className="manual-key">{secret}</code>
              </div>

              <div className="form-group">
                <label htmlFor="verify-code">Verify 6-Digit Code</label>
                <input
                  type="text"
                  id="verify-code"
                  placeholder="123456"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary full-width" style={{ background: '#2E4A3F' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Enable 2FA & Log In'}
              </button>
            </form>
          )}

          {step === '2fa_verify' && (
            <form onSubmit={handle2FASubmit} className="admin-portal-form 2fa-verify-form">
              <h3>Two-Factor Verification</h3>
              <p className="admin-help-text">
                Please enter the 6-digit verification code from your Authenticator App to log in.
              </p>

              <div className="form-group">
                <label htmlFor="verify-code-field">Verification Code</label>
                <input
                  type="text"
                  id="verify-code-field"
                  placeholder="000 000"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary full-width" style={{ background: '#2E4A3F' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Code & Log In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
