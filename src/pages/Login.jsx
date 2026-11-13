import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Akun demo untuk tombol login cepat
const DEMO = {
  admin: { username: 'admin2', password: 'PasswordBaru123' },
  staff: { username: 'staff1', password: 'staff12345' },
}

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  async function doLogin(u, p) {
    setError('')
    setBusy(true)
    try {
      await login(u, p)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    doLogin(username, password)
  }

  function quick(role) {
    setUsername(DEMO[role].username)
    setPassword(DEMO[role].password)
    doLogin(DEMO[role].username, DEMO[role].password)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🔬</div>
        <h2>Lab Inventory</h2>
        <p className="sub">Sistem Inventaris & Peminjaman Laboratorium</p>

        <form onSubmit={handleSubmit}>
          <input placeholder="Username" value={username}
            onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="error" style={{ margin: '0 0 12px' }}>{error}</p>}
          <button className="main-btn" disabled={busy}>
            {busy ? 'Masuk...' : 'Login'}
          </button>
        </form>

        <div className="divider">atau masuk cepat (akun demo)</div>
        <div className="quick">
          <button type="button" disabled={busy} onClick={() => quick('admin')}>👑 Admin</button>
          <button type="button" disabled={busy} onClick={() => quick('staff')}>🧑‍💻 Staff</button>
        </div>
      </div>
    </div>
  )
}