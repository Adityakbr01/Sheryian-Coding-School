import { useState } from 'react'

function AuthInput({ label, type = 'text', name, autoComplete, value, onChange }) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className="auth-input-wrapper">
      <input
        type={inputType}
        name={name}
        placeholder=" "
        autoComplete={autoComplete}
        aria-label={label}
        value={value}
        onChange={onChange}
      />
      <label>{label}</label>
      {isPassword && (
        <button
          type="button"
          className="auth-show-password"
          onClick={() => setShowPassword((v) => !v)}
          tabIndex={-1}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      )}
    </div>
  )
}

export default AuthInput
