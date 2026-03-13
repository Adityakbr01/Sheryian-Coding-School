import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import AuthInput from '../components/AuthInput.jsx'
import { useAuthContext } from '../../../provider/AuthContext.jsx'
import '../styles/form.scss'

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const { handleLogin, loading, error } = useAuthContext()

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Backend accepts email OR userName — detect which one the user typed
    const isEmail = form.identifier.includes('@')
    try {
      await handleLogin({
        ...(isEmail
          ? { email: form.identifier }
          : { userName: form.identifier }),
        password: form.password,
      })
      navigate('/')
    } catch {
      // error is already set in context
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-main">
        <div className="auth-logo">
          <span className="instagram-logo-text">Instagram</span>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <AuthInput
            label="Phone number, username, or email"
            type="text"
            name="identifier"
            autoComplete="username"
            value={form.identifier}
            onChange={handleChange}
          />
          <AuthInput
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading || !form.identifier || !form.password}
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <div className="auth-or-divider">
          <div className="auth-or-line" />
          <span className="auth-or-text">OR</span>
          <div className="auth-or-line" />
        </div>

        <button type="button" className="auth-facebook-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
          </svg>
          Log in with Facebook
        </button>

        <Link to="#" className="auth-forgot-link">
          Forgot password?
        </Link>
      </div>

      <div className="auth-card auth-card-switch">
        <p>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="auth-switch-link">
            Sign up
          </Link>
        </p>
      </div>

      <div className="auth-get-app">
        <p className="auth-get-app-text">Get the app.</p>
        <div className="auth-app-badges">
          <a
            href="https://apps.microsoft.com/detail/instagram/9nblggh5l9xt"
            target="_blank"
            rel="noopener noreferrer"
            className="auth-badge"
          >
            <img
              src="https://static.cdninstagram.com/rsrc.php/v3/yz/r/c5Rp7Ym-Klz.png"
              alt="Get it from Microsoft"
            />
          </a>
        </div>
      </div>

      <footer className="auth-footer">
        <nav className="auth-footer-links">
          <a href="#">Meta</a>
          <a href="#">About</a>
          <a href="#">Blog</a>
          <a href="#">Jobs</a>
          <a href="#">Help</a>
          <a href="#">API</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Locations</a>
          <a href="#">Instagram Lite</a>
          <a href="#">Threads</a>
          <a href="#">Contact Uploading &amp; Non-Users</a>
          <a href="#">Meta Verified</a>
        </nav>
        <p className="auth-footer-copy">© 2026 Instagram from Meta</p>
      </footer>
    </div>
  )
}

export default LoginPage