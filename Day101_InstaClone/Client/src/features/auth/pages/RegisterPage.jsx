import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import AuthInput from '../components/AuthInput.jsx'
import { useAuthContext } from '../../../provider/AuthContext.jsx'
import '../styles/form.scss'

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    userName: '',
    password: '',
  })
  const { handleRegister, loading, error } = useAuthContext()

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await handleRegister({
        email: form.email,
        userName: form.userName,
        password: form.password,
      })
      navigate('/')
    } catch {
      // error is already set in context
    }
  }

  const canSubmit =
    form.email && form.userName && form.password && !loading

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-main">
        <div className="auth-logo">
          <span className="instagram-logo-text">Instagram</span>
        </div>

        <p className="auth-tagline">
          Sign up to see photos and videos from your friends.
        </p>

        <button
          type="button"
          disabled={true}
          className="auth-facebook-btn auth-facebook-btn-filled"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
          </svg>
          Log in with Facebook
        </button>

        <div className="auth-or-divider">
          <div className="auth-or-line" />
          <span className="auth-or-text">OR</span>
          <div className="auth-or-line" />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <AuthInput
            label="Email"
            type="text"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
          />
          <AuthInput
            label="Username"
            type="text"
            name="userName"
            autoComplete="username"
            value={form.userName}
            onChange={handleChange}
          />
          <AuthInput
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
          />

          <p className="auth-terms">
            People who use our service may have uploaded your contact information
            to Instagram.{' '}
            <a href="#">Learn More</a>
          </p>
          <p className="auth-terms">
            By signing up, you agree to our{' '}
            <a href="#">Terms</a>,{' '}
            <a href="#">Privacy Policy</a> and{' '}
            <a href="#">Cookies Policy</a>.
          </p>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={!canSubmit}
          >
            {loading ? 'Signing up…' : 'Sign up'}
          </button>
        </form>
      </div>

      <div className="auth-card auth-card-switch">
        <p>
          Have an account?{' '}
          <Link to="/login" className="auth-switch-link">
            Log in
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

export default RegisterPage